/**
 * `wss://<host>/gateway/ws` servido pelo WebSocket nativo do Nitro (crossws).
 *
 * É o caminho do servidor local — `bun run dev` e o build `node-server`. Publicado na
 * Vercel, o preset do Nitro descarta a parte de WebSocket na hora de gerar as funções,
 * então lá quem responde é [ws-vercel.ts](ws-vercel.ts). A escolha entre os dois está
 * em [vite.config.ts](../../vite.config.ts), pela presença da variável `VERCEL`.
 */

import { defineWebSocketHandler } from "nitro";

import {
  autenticarLigacao,
  avisarSeArmazenamentoVolatil,
  iniciarEntregaDeComandos,
  receberDoGateway,
} from "./ws-sessao";

type Sessao = { gatewayId: string; encerrar?: () => void };

/** Só o que este arquivo usa do peer do crossws. */
type Peer = {
  context: Record<string, unknown>;
  send: (mensagem: string) => unknown;
};

function sessao(peer: Peer): Sessao {
  return peer.context["topdata"] as Sessao;
}

export default defineWebSocketHandler({
  async upgrade(request: Request) {
    const gatewayId = await autenticarLigacao(request);

    if (!gatewayId) {
      throw new Response("Token ausente, invalido ou expirado.", { status: 401 });
    }

    return { context: { topdata: { gatewayId } satisfies Sessao } };
  },

  open(peer: Peer) {
    const dados = sessao(peer);

    console.log(`[ws] gateway ${dados.gatewayId} conectado`);
    avisarSeArmazenamentoVolatil();

    dados.encerrar = iniciarEntregaDeComandos(dados.gatewayId, (mensagem) => peer.send(mensagem));
  },

  async message(peer: Peer, message: { text: () => string }) {
    await receberDoGateway(sessao(peer).gatewayId, message.text());
  },

  close(peer: Peer) {
    const dados = sessao(peer);

    dados?.encerrar?.();
    console.log(`[ws] gateway ${dados?.gatewayId ?? "?"} desconectado`);
  },

  error(peer: Peer, erro: unknown) {
    console.error(`[ws] erro na ligacao com ${sessao(peer)?.gatewayId ?? "?"}:`, erro);
  },
});
