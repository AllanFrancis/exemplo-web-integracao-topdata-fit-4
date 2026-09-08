/**
 * `POST /internal/access/validate` — o caminho critico (secao 3 do contrato).
 *
 * Alguem esta parado na catraca esperando. O Gateway corta em 3 s e, sem resposta,
 * **nega** — entao tudo que este handler faz precisa caber confortavelmente dentro
 * desse orcamento. Nada de consulta lenta, integracao com terceiro ou envio de e-mail
 * aqui dentro: o que nao for essencial para responder ALLOW/DENY vai para depois.
 *
 * Tres cuidados que o Gateway espera e que sao faceis de esquecer:
 *
 *  1. **ecoar o `eventId`** — sem o eco, uma resposta atrasada liberaria a catraca
 *     para a proxima pessoa da fila;
 *  2. **nao registrar o PIN inteiro** — este e o unico ponto do sistema em que ele
 *     trafega, e a trilha guarda so os tres ultimos digitos;
 *  3. **`message` de 16 colunas, ASCII** — o display tem 2x16 e nao mostra acento.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { mascararCredencial, paraDisplay } from "../../../lib/protocolo";
import type { ValidateAccessResponse } from "../../../lib/protocolo";
import type { Acesso } from "../../../lib/tipos";
import { decidir, lerAlunos } from "../../../server/academia";
import {
  garantirDispositivo,
  lerAcessos,
  registrarAcesso,
  registrarEvento,
} from "../../../server/estado";
import { autenticar, erro, json, lerCorpo } from "../../../server/http";

const schema = z.object({
  eventId: z.string().uuid(),
  gatewayId: z.string().uuid(),
  deviceId: z.string().uuid(),
  credentialType: z.enum(["PIN", "CARD"]),
  credential: z.string().min(1),
  direction: z.enum(["ENTRY", "EXIT", "BOTH"]),
  occurredAt: z.string(),
});

export const Route = createFileRoute("/internal/access/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sessao = await autenticar(request);
        if (!sessao.ok) return sessao.resposta;

        const corpo = await lerCorpo(request, schema);
        if (!corpo.ok) return corpo.resposta;

        const pedido = corpo.dados;

        // O token diz de qual instalacao a chamada veio; o corpo diz de qual ela se
        // declara. Divergencia significa credencial de uma academia sendo usada para
        // decidir acesso de outra.
        if (pedido.gatewayId !== sessao.gatewayId) {
          return erro(403, "GATEWAY_MISMATCH", "O token nao pertence a este gatewayId.");
        }

        const [alunos, acessos] = await Promise.all([lerAlunos(), lerAcessos()]);

        const veredito = decidir(alunos, pedido.credential, pedido.direction, acessos);

        const resposta: ValidateAccessResponse = {
          decision: veredito.decisao,
          eventId: pedido.eventId,
          ...(veredito.aluno
            ? { studentId: veredito.aluno.id, studentName: veredito.aluno.nome }
            : {}),
          reasonCode: veredito.reasonCode,
          message: paraDisplay(veredito.mensagem),
        };

        const credencialMascarada = mascararCredencial(pedido.credential);

        const acesso: Acesso = {
          eventId: pedido.eventId,
          gatewayId: pedido.gatewayId,
          deviceId: pedido.deviceId,
          ...(veredito.aluno ? { alunoId: veredito.aluno.id, alunoNome: veredito.aluno.nome } : {}),
          credencialMascarada,
          decisao: veredito.decisao,
          reasonCode: veredito.reasonCode,
          mensagem: resposta.message,
          direcao: pedido.direction,
          decididoEm: new Date().toISOString(),
        };

        await Promise.all([
          registrarAcesso(acesso),
          garantirDispositivo(pedido.gatewayId, pedido.deviceId),
          registrarEvento(
            pedido.gatewayId,
            "ACCESS_VALIDATE",
            { ...pedido, credential: credencialMascarada },
            `${veredito.decisao} ${credencialMascarada} — ${veredito.reasonCode}`,
          ),
        ]);

        return json(resposta);
      },
    },
  },
});
