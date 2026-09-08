/**
 * O que fazer com um evento que chegou do Gateway.
 *
 * Vive fora das rotas porque existem dois caminhos de entrada — a fila durável por
 * HTTP e o WebSocket — e eles precisam produzir exatamente o mesmo efeito. Um heartbeat
 * que atualiza o painel quando chega por POST e não atualiza quando chega por WSS seria
 * o pior tipo de defeito: intermitente e dependente da rede da academia.
 */

import type {
  AccessOutcomeMessage,
  CommandResultMessage,
  DeviceStatusMessage,
  HeartbeatMessage,
  PassageMessage,
  TipoEvento,
} from "../lib/protocolo";
import {
  atualizarComando,
  complementarAcesso,
  garantirDispositivo,
  registrarContato,
  registrarEvento,
} from "./estado";

/** Uma linha de texto por tipo — é o que a tela da recepção mostra. */
export function resumirEvento(tipo: TipoEvento, payload: unknown): string {
  switch (tipo) {
    case "HEARTBEAT": {
      const dados = payload as HeartbeatMessage;
      return `${dados.status} · ${dados.devices?.length ?? 0} equipamento(s) · ${dados.pendingEvents ?? 0} pendente(s)`;
    }
    case "ACCESS_OUTCOME": {
      const dados = payload as AccessOutcomeMessage;
      // ALLOW com executed=false é o caso que a recepção precisa enxergar: o servidor
      // autorizou e o equipamento não girou.
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
      // Girar é um fato físico, reportado pelo sensor ótico; liberar é só uma ordem
      // nossa. Para a academia, a diferença é entre "autorizado" e "entrou mesmo".
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

/** Aplica o efeito do evento e o registra na trilha, nessa ordem. */
export async function processarEvento(
  gatewayId: string,
  tipo: TipoEvento,
  payload: unknown,
): Promise<void> {
  await aplicar(gatewayId, tipo, payload);
  await registrarEvento(gatewayId, tipo, payload, resumirEvento(tipo, payload));
}
