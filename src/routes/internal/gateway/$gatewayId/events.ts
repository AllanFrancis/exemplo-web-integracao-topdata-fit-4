/**
 * `POST /internal/gateway/{gatewayId}/events` — secao 5 do contrato.
 *
 * Entrada da fila duravel do Gateway. Tudo que precisa de garantia de entrega passa
 * por aqui: heartbeat quando o WebSocket esta fora, desfecho de acesso, giro da
 * catraca, mudanca de estado do equipamento, resultado de comando.
 *
 * Duas regras que o Gateway assume deste lado:
 *
 *  - **`X-Idempotency-Key` deduplica.** Se a resposta se perder, o mesmo item volta.
 *    Aceitar duas vezes duplica a trilha de acesso da academia.
 *  - **A ordem e estrita e o Gateway para no primeiro erro.** Responder 5xx trava a
 *    fila inteira ate a proxima tentativa; responder 200 para algo que nao foi gravado
 *    perde o registro para sempre. Quando o corpo for invalido, 400 e a resposta certa:
 *    e um item que nunca vai melhorar, e o Gateway o descarta.
 */

import { createFileRoute } from "@tanstack/react-router";

import { TIPOS_DE_EVENTO } from "../../../../lib/protocolo";
import type {
  AccessOutcomeMessage,
  CommandResultMessage,
  DeviceStatusMessage,
  HeartbeatMessage,
  PassageMessage,
  TipoEvento,
} from "../../../../lib/protocolo";
import { gravarSeAusente } from "../../../../server/armazenamento";
import {
  atualizarComando,
  complementarAcesso,
  garantirDispositivo,
  registrarContato,
  registrarEvento,
} from "../../../../server/estado";
import { autenticar, erro, json } from "../../../../server/http";

/** Uma linha de texto por tipo — e o que a tela da recepcao mostra. */
function resumir(tipo: TipoEvento, payload: unknown): string {
  switch (tipo) {
    case "HEARTBEAT": {
      const dados = payload as HeartbeatMessage;
      return `${dados.status} · ${dados.devices?.length ?? 0} equipamento(s) · ${dados.pendingEvents ?? 0} pendente(s)`;
    }
    case "ACCESS_OUTCOME": {
      const dados = payload as AccessOutcomeMessage;
      // ALLOW com executed=false e o caso que a recepcao precisa enxergar: o servidor
      // autorizou e o equipamento nao girou.
      return dados.decision === "ALLOW" && !dados.executed
        ? `ALLOW nao executado — ${dados.errorCode ?? "sem codigo"}`
        : `${dados.decision} executado=${dados.executed} — ${dados.reasonCode ?? "-"}`;
    }
    case "DEVICE_STATUS_CHANGED": {
      const dados = payload as DeviceStatusMessage;
      return `Equipamento ${dados.deviceId.slice(0, 8)} agora ${dados.status}`;
    }
    case "PASSAGE_CONFIRMED":
      return "Catraca girou — passagem confirmada";
    case "PASSAGE_EXPIRED":
      return "Liberou e ninguem passou";
    case "COMMAND_RESULT": {
      const dados = payload as CommandResultMessage;
      return `Comando ${dados.commandId.slice(0, 8)} ${dados.status}${dados.errorCode ? ` (${dados.errorCode})` : ""}`;
    }
    default:
      return tipo;
  }
}

async function aplicar(gatewayId: string, tipo: TipoEvento, payload: unknown): Promise<void> {
  switch (tipo) {
    case "HEARTBEAT": {
      const dados = payload as HeartbeatMessage;
      await registrarContato(gatewayId, {
        version: dados.version,
        status: dados.status,
        pendingEvents: dados.pendingEvents,
        dispositivos: dados.devices ?? [],
      });
      return;
    }

    case "ACCESS_OUTCOME": {
      const dados = payload as AccessOutcomeMessage;
      await complementarAcesso(dados.eventId, { executado: dados.executed });
      await garantirDispositivo(gatewayId, dados.deviceId);
      return;
    }

    case "DEVICE_STATUS_CHANGED": {
      const dados = payload as DeviceStatusMessage;
      await registrarContato(gatewayId, { dispositivos: [dados] });
      return;
    }

    case "PASSAGE_CONFIRMED": {
      const dados = payload as PassageMessage;
      // Girar e um fato fisico, reportado pelo sensor otico; liberar e so uma ordem
      // nossa. Para a academia, a diferenca e entre "autorizado" e "entrou mesmo".
      if (dados.eventId) {
        await complementarAcesso(dados.eventId, { passagemConfirmadaEm: dados.occurredAt });
      }
      return;
    }

    case "COMMAND_RESULT": {
      const dados = payload as CommandResultMessage;
      await atualizarComando(dados.commandId, {
        resultado: dados.status,
        errorCode: dados.errorCode ?? null,
      });
      return;
    }

    default:
      return;
  }
}

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

          // Duplicata responde 200: o Gateway so precisa saber que pode dar baixa no
          // item. Um erro aqui faria a fila travar num evento que ja foi processado.
          if (!inedito) {
            return json({ status: "DUPLICATE", idempotencyKey: idempotencia });
          }
        }

        await aplicar(sessao.gatewayId, tipo, payload);
        await registrarEvento(sessao.gatewayId, tipo, payload, resumir(tipo, payload));

        return json({ status: "ACCEPTED" });
      },
    },
  },
});
