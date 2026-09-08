/**
 * `GET /gateway/ws` — o WebSocket do contrato (secao 4).
 *
 * Vercel executa cada requisicao numa funcao efemera: nao ha processo para segurar uma
 * conexao aberta, entao esta rota **nao** completa o handshake. Ela responde 501 com
 * a explicacao, em vez de deixar o Gateway numa reconexao silenciosa e eterna.
 *
 * O Gateway continua funcionando sem WebSocket — todo evento cai na fila duravel em
 * disco e chega por `POST /internal/gateway/{id}/events`. O que se perde e o caminho
 * inverso: comandos do servidor para a catraca (a liberacao manual da recepcao).
 *
 * Para ter os dois lados, veja `ws-bridge/` neste repositorio: um processo pequeno que
 * fala WSS com o Gateway e HTTPS com este sistema.
 */

import { createFileRoute } from "@tanstack/react-router";

import { json } from "../../server/http";

export const Route = createFileRoute("/gateway/ws")({
  server: {
    handlers: {
      GET: async () =>
        json(
          {
            error: "WEBSOCKET_NOT_AVAILABLE",
            detail:
              "Este exemplo roda em funcoes serverless, que nao mantem conexao aberta. " +
              "Os eventos chegam por POST /internal/gateway/{gatewayId}/events. " +
              "Para comandos do servidor para a catraca, use a ponte em ws-bridge/.",
          },
          501,
        ),
    },
  },
});
