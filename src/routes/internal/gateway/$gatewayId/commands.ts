/**
 * `GET /internal/gateway/{gatewayId}/commands` — **fora do contrato**.
 *
 * O protocolo entrega comandos pelo WebSocket, e o Gateway nao consulta esta rota.
 * Ela existe para a ponte WSS (`ws-bridge/`), que roda num processo persistente e
 * precisa saber o que ha para entregar: uma funcao serverless nao mantem conexao
 * aberta, entao a fila de comandos vive aqui e a ponte a consome.
 *
 * O token e o do proprio Gateway, repassado pela ponte no handshake. Nenhum segredo
 * novo entra no sistema por causa dela.
 */

import { createFileRoute } from "@tanstack/react-router";

import type { ServerEnvelope } from "../../../../lib/protocolo";
import { atualizarComando, comandosParaEntregar } from "../../../../server/estado";
import { autenticar, erro, json } from "../../../../server/http";

export const Route = createFileRoute("/internal/gateway/$gatewayId/commands")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const sessao = await autenticar(request);
        if (!sessao.ok) return sessao.resposta;

        if (params.gatewayId !== sessao.gatewayId) {
          return erro(403, "GATEWAY_MISMATCH", "O token nao pertence a este gatewayId.");
        }

        const pendentes = await comandosParaEntregar(sessao.gatewayId);
        const entregueEm = new Date().toISOString();

        const envelopes: ServerEnvelope[] = pendentes.map((comando) => ({
          type: comando.tipo,
          commandId: comando.commandId,
          gatewayId: comando.gatewayId,
          deviceId: comando.deviceId,
          ...(comando.direction ? { direction: comando.direction } : {}),
          message: comando.message,
          expiresAt: comando.expiresAt,
        }));

        // Marcamos como entregue antes de a ponte confirmar. Reenviar seria pior: o
        // Gateway ja deduplica por `commandId`, mas uma catraca que gira duas vezes
        // porque a fila insistiu e o defeito que ninguem perdoa.
        await Promise.all(
          pendentes.map((comando) => atualizarComando(comando.commandId, { entregueEm })),
        );

        return json({ commands: envelopes });
      },
    },
  },
});
