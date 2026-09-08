/**
 * A ligação WSS do contrato (seção 4), sem depender de como o socket foi aberto.
 *
 * Existem dois jeitos de abrir esse socket neste projeto — o WebSocket nativo do Nitro,
 * que funciona no servidor local, e a API da Vercel, que é o que funciona publicado — e
 * os dois precisam se comportar igual. O que muda entre eles é só o aperto de mão; tudo
 * que acontece depois está aqui.
 */

import { TIPOS_DE_EVENTO } from "../lib/protocolo";
import type { GatewayEnvelope, ServerEnvelope, TipoEvento } from "../lib/protocolo";
import { backendDeArmazenamento } from "./armazenamento";
import { gatewayIdDoToken, tokenDoHeader } from "./credenciais";
import { atualizarComando, comandosParaEntregar } from "./estado";
import { processarEvento } from "./recepcao";

/**
 * Cadência da consulta à fila de comandos.
 *
 * Uma conexão fica presa a uma instância da função, e um comando enfileirado por
 * `POST /api/comandos` cai em outra. Por isso o laço *consulta* o armazenamento em vez
 * de esperar um empurrão. Um segundo é o que a recepção percebe como "imediato";
 * diminuir não deixa a catraca mais rápida, só deixa a função acordada por mais tempo.
 */
export const INTERVALO_DE_COMANDOS_MS = 1000;

/**
 * Autentica pelo mesmo `Authorization: Bearer` que o Gateway usa no HTTP.
 *
 * Recusar no aperto de mão é melhor que aceitar e fechar depois: o Gateway trata falha
 * de conexão com recuo exponencial, enquanto uma ligação aceita e morta parece saudável
 * e não entrega nada.
 */
export async function autenticarLigacao(request: Request): Promise<string | null> {
  return gatewayIdDoToken(tokenDoHeader(request));
}

/** Vale um aviso barulhento: em memória o comando some sem erro nenhum. */
export function avisarSeArmazenamentoVolatil(): void {
  if (backendDeArmazenamento === "memoria") {
    console.warn(
      "[ws] armazenamento em memoria: comandos enfileirados em outra instancia nao " +
        "serao entregues. Configure KV_REST_API_URL e KV_REST_API_TOKEN.",
    );
  }
}

async function entregarPendentes(
  gatewayId: string,
  enviar: (mensagem: string) => void,
): Promise<void> {
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

      enviar(JSON.stringify(envelope));

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

/**
 * Começa a entregar comandos e devolve a função que encerra o laço.
 *
 * A primeira entrega é imediata: depois de uma reconexão, o que ficou na fila enquanto
 * a ligação estava fora precisa sair agora, não no próximo tique.
 */
export function iniciarEntregaDeComandos(
  gatewayId: string,
  enviar: (mensagem: string) => void,
): () => void {
  void entregarPendentes(gatewayId, enviar);

  const relogio = setInterval(
    () => void entregarPendentes(gatewayId, enviar),
    INTERVALO_DE_COMANDOS_MS,
  );

  return () => clearInterval(relogio);
}

/** Trata uma mensagem vinda do Gateway: heartbeat, desfecho, giro, resultado. */
export async function receberDoGateway(gatewayId: string, texto: string): Promise<void> {
  let envelope: GatewayEnvelope;

  try {
    envelope = JSON.parse(texto) as GatewayEnvelope;
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

  // O `gatewayId` do envelope é informativo; quem manda é o token do aperto de mão.
  await processarEvento(gatewayId, envelope.type as TipoEvento, envelope.payload);
}
