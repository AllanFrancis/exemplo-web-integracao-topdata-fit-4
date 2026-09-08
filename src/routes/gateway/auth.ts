/**
 * `POST /gateway/auth` — secao 2 do contrato.
 *
 * O Gateway renova o token 60 s antes do vencimento e refaz a autenticacao uma unica
 * vez ao receber 401. Manter `expiresInSeconds` honesto importa: um numero maior que a
 * validade real faria o Gateway usar token vencido justamente no caminho critico.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import type { AuthResponse } from "../../lib/protocolo";
import {
  VALIDADE_DO_TOKEN_EM_SEGUNDOS,
  emitirToken,
  segredoConfere,
} from "../../server/credenciais";
import { erro, json, lerCorpo } from "../../server/http";

const schema = z.object({
  gatewayId: z.string().uuid(),
  gatewaySecret: z.string().min(1),
  gatewayVersion: z.string().min(1),
});

export const Route = createFileRoute("/gateway/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema);
        if (!corpo.ok) return corpo.resposta;

        const { gatewayId, gatewaySecret } = corpo.dados;

        // Uma so resposta para segredo errado e gateway inexistente: distinguir os dois
        // entregaria de graca a lista de instalacoes validas a quem estiver tentando.
        if (!(await segredoConfere(gatewayId, gatewaySecret))) {
          return erro(401, "INVALID_CREDENTIALS", "Credencial de instalacao invalida.");
        }

        const resposta: AuthResponse = {
          accessToken: await emitirToken(gatewayId),
          expiresInSeconds: VALIDADE_DO_TOKEN_EM_SEGUNDOS,
        };

        return json(resposta);
      },
    },
  },
});
