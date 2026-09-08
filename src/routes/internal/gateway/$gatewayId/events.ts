/**
 * `POST /internal/gateway/{gatewayId}/events` — seção 5 do contrato.
 *
 * Entrada da fila durável do Gateway. Tudo que precisa de garantia de entrega passa
 * por aqui: heartbeat quando o WebSocket está fora, desfecho de acesso, giro da
 * catraca, mudança de estado do equipamento, resultado de comando.
 *
 * O efeito de cada evento vive em [recepcao.ts](../../../../server/recepcao.ts), que é
 * compartilhado com o WebSocket: o mesmo heartbeat precisa produzir o mesmo resultado
 * pelos dois caminhos.
 *
 * Duas regras que o Gateway assume deste lado:
 *
 *  - **`X-Idempotency-Key` deduplica.** Se a resposta se perder, o mesmo item volta.
 *    Aceitar duas vezes duplica a trilha de acesso da academia.
 *  - **A ordem é estrita e o Gateway para no primeiro erro.** Responder 5xx trava a
 *    fila inteira até a próxima tentativa; responder 200 para algo que não foi gravado
 *    perde o registro para sempre. Quando o corpo for inválido, 400 é a resposta certa:
 *    é um item que nunca vai melhorar, e o Gateway o descarta.
 */

import { createFileRoute } from "@tanstack/react-router";

import { TIPOS_DE_EVENTO } from "../../../../lib/protocolo";
import type { TipoEvento } from "../../../../lib/protocolo";
import { gravarSeAusente } from "../../../../server/armazenamento";
import { autenticar, erro, json } from "../../../../server/http";
import { processarEvento } from "../../../../server/recepcao";

export const Route = createFileRoute("/internal/gateway/$gatewayId/events")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const sessao = await autenticar(request);
        if (!sessao.ok) return sessao.resposta;

        if (params.gatewayId !== sessao.gatewayId) {
          return erro(403, "GATEWAY_MISMATCH", "O token nao pertence a este gatewayId.");
        }

        const tipo = request.headers.get("x-gateway-event-type") as TipoEvento | null;
        if (!tipo || !TIPOS_DE_EVENTO.includes(tipo)) {
          return erro(
            400,
            "UNKNOWN_EVENT_TYPE",
            `X-Gateway-Event-Type ausente ou desconhecido: ${tipo}`,
          );
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return erro(400, "INVALID_JSON", "Corpo nao e JSON valido.");
        }

        const idempotencia = request.headers.get("x-idempotency-key");

        if (idempotencia) {
          const inedito = await gravarSeAusente(
            `idem:${sessao.gatewayId}:${idempotencia}`,
            { tipo, em: new Date().toISOString() },
            60 * 60 * 24 * 7,
          );

          // Duplicata responde 200: o Gateway só precisa saber que pode dar baixa no
          // item. Um erro aqui faria a fila travar num evento que já foi processado.
          if (!inedito) {
            return json({ status: "DUPLICATE", idempotencyKey: idempotencia });
          }
        }

        await processarEvento(sessao.gatewayId, tipo, payload);

        return json({ status: "ACCEPTED" });
      },
    },
  },
});
