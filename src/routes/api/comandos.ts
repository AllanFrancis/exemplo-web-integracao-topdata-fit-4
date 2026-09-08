/**
 * `POST /api/comandos` — a recepcao mandando a catraca abrir.
 *
 * O comando entra numa fila e so vira movimento fisico quando o Gateway o recebe pelo
 * WebSocket. O `expiresAt` curto e o que impede o pior caso: um comando represado e
 * entregue minutos depois liberaria a catraca para quem estiver na frente dela naquele
 * momento, que nao e quem a recepcao autorizou.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { paraDisplay } from "../../lib/protocolo";
import type { ComandoPendente } from "../../lib/tipos";
import { enfileirarComando } from "../../server/estado";
import { json, lerCorpo } from "../../server/http";

const SEGUNDOS_DE_VALIDADE = 30;

const schema = z.object({
  tipo: z.enum(["UNLOCK", "SHOW_MESSAGE"]),
  gatewayId: z.string().uuid(),
  deviceId: z.string().uuid(),
  direction: z.enum(["ENTRY", "EXIT", "BOTH"]).optional(),
  message: z.string().min(1).max(64),
});

export const Route = createFileRoute("/api/comandos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema);
        if (!corpo.ok) return corpo.resposta;

        const agora = new Date();

        const comando: ComandoPendente = {
          commandId: crypto.randomUUID(),
          gatewayId: corpo.dados.gatewayId,
          deviceId: corpo.dados.deviceId,
          tipo: corpo.dados.tipo,
          ...(corpo.dados.direction ? { direction: corpo.dados.direction } : {}),
          message: paraDisplay(corpo.dados.message),
          criadoEm: agora.toISOString(),
          expiresAt: new Date(agora.getTime() + SEGUNDOS_DE_VALIDADE * 1000).toISOString(),
        };

        await enfileirarComando(comando);

        return json({ comando });
      },
    },
  },
});
