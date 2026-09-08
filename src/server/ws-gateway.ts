/**
 * `wss://<host>/gateway/ws` — a ligação permanente da seção 4 do contrato.
 *
 * Vercel Functions passaram a servir WebSocket (beta, sobre Fluid compute), então o
 * endpoint é nativo: não há mais ponte obrigatória. Duas consequências da plataforma
 * moldam este arquivo e não podem ser esquecidas:
 *
 *  1. **A conexão morre no limite de duração da função** (60 s no plano Hobby, mais no
 *     Pro). Isso é normal aqui, não é falha: o Gateway reconecta sozinho com recuo
 *     exponencial e sorteio. Nada se perde, porque evento com garantia de entrega vai
 *     pela fila durável, não por aqui.
 *  2. **Cada conexão fica presa a uma instância da função.** Um comando enfileirado por
 *     `POST /api/comandos` cai em outra instância, que não tem como avisar esta. Por
 *     isso o laço abaixo *consulta* o armazenamento em vez de esperar um empurrão — e
 *     por isso, publicado, o armazenamento precisa ser o Redis: em memória, cada
 *     instância enxerga uma fila diferente e o comando nunca chega.
 */

import { defineWebSocketHandler } from "nitro";

import { TIPOS_DE_EVENTO } from "../lib/protocolo";
import type { GatewayEnvelope, ServerEnvelope, TipoEvento } from "../lib/protocolo";
import { backendDeArmazenamento } from "./armazenamento";
import { gatewayIdDoToken, tokenDoHeader } from "./credenciais";
import { atualizarComando, comandosParaEntregar } from "./estado";
import { processarEvento } from "./recepcao";

/**
 * Cadência da consulta à fila de comandos.
 *
 * Um segundo é o que a recepção percebe como "imediato" ao clicar em *Abrir catraca*.
 * Diminuir isso não deixa a catraca mais rápida — deixa a fatura mais cara, porque a
 * função fica acordada consultando.
 */
const INTERVALO_DE_COMANDOS_MS = 1000;

type Contexto = { gatewayId: string; relogio?: ReturnType<typeof setInterval> };

/** O que este arquivo usa do peer do crossws. */
type Peer = {
  context: Record<string, unknown>;
  request: Request;
  send: (mensagem: string) => unknown;
  close: (codigo?: number, motivo?: string) => unknown;
};

function contexto(peer: Peer): Contexto {
  return peer.context["topdata"] as Contexto;
}

/** Entrega o que estiver pendente e ainda dentro da validade. */
async function entregarComandos(peer: Peer): Promise<void> {
  const { gatewayId } = contexto(peer);

  try {
    const pendentes = await comandosParaEntregar(gatewayId);
    if (pendentes.length === 0) return;

    const entregueEm = new Date().toISOString();

    for (const comando of pendentes) {
      const envelope: ServerEnvelope = {
        type: comando.tipo,
        commandId: comando.commandId,
        gatewayId: comando.gatewayId,
        deviceId: comando.deviceId,
        ...(comando.direction ? { direction: comando.direction } : {}),
        message: comando.message,
        // Sempre enviado. Um comando represado e entregue minutos depois liberaria a
        // catraca para quem estiver na frente dela naquele momento.
        expiresAt: comando.expiresAt,
      };

      peer.send(JSON.stringify(envelope));

      // Marcado antes da confirmação de propósito: o Gateway já deduplica por
      // `commandId`, mas uma catraca que gira duas vezes porque a fila insistiu é o
      // defeito que ninguém perdoa.
      await atualizarComando(comando.commandId, { entregueEm });
    }
  } catch (erro) {
    // Armazenamento fora do ar não derruba a ligação: o Gateway continua conectado e a
    // próxima volta do laço tenta de novo.
    console.error("[ws] falha ao consultar comandos:", erro);
  }
}

export default defineWebSocketHandler({
  /**
   * Autentica antes de aceitar a conexão.
   *
   * O Gateway manda o mesmo `Authorization: Bearer` que usa no HTTP. Recusar aqui é
   * melhor que aceitar e fechar depois: o Gateway trata a falha de conexão com recuo
   * exponencial, enquanto uma ligação aceita e morta parece saudável e não entrega nada.
   */
  async upgrade(request: Request) {
    const gatewayId = await gatewayIdDoToken(tokenDoHeader(request));

    if (!gatewayId) {
      throw new Response("Token ausente, invalido ou expirado.", { status: 401 });
    }

    return { context: { topdata: { gatewayId } satisfies Contexto } };
  },

  open(peer: Peer) {
    const dados = contexto(peer);

    console.log(`[ws] gateway ${dados.gatewayId} conectado`);

    if (backendDeArmazenamento === "memoria") {
      // Vale um aviso barulhento: em memória isto funciona no servidor local e falha
      // em produção de um jeito difícil de enxergar — o comando some sem erro nenhum.
      console.warn(
        "[ws] armazenamento em memoria: comandos enfileirados em outra instancia nao " +
          "serao entregues. Configure KV_REST_API_URL e KV_REST_API_TOKEN.",
      );
    }

    // Uma entrega imediata na abertura: depois de uma reconexão, o que ficou na fila
    // enquanto a ligação estava fora precisa sair agora, não no próximo tique.
    void entregarComandos(peer);

    dados.relogio = setInterval(() => void entregarComandos(peer), INTERVALO_DE_COMANDOS_MS);
  },

  async message(peer: Peer, message: { text: () => string }) {
    const { gatewayId } = contexto(peer);

    let envelope: GatewayEnvelope;

    try {
      envelope = JSON.parse(message.text()) as GatewayEnvelope;
    } catch {
      // Mensagem ilegível não fecha a ligação: o Gateway ficaria num ciclo de reconexão
      // enquanto insistisse no mesmo envio.
      console.warn("[ws] mensagem ilegivel do Gateway; ignorando");
      return;
    }

    if (!TIPOS_DE_EVENTO.includes(envelope.type as TipoEvento)) {
      console.warn(`[ws] tipo desconhecido: ${envelope.type}`);
      return;
    }

    // O `gatewayId` do envelope é informativo; quem manda é o token do handshake.
    await processarEvento(gatewayId, envelope.type as TipoEvento, envelope.payload);
  },

  close(peer: Peer) {
    const dados = contexto(peer);

    if (dados?.relogio) clearInterval(dados.relogio);

    console.log(`[ws] gateway ${dados?.gatewayId ?? "?"} desconectado`);
  },

  error(peer: Peer, erro: unknown) {
    console.error(`[ws] erro na ligacao com ${contexto(peer)?.gatewayId ?? "?"}:`, erro);
  },
});
