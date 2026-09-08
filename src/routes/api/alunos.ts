/** `POST /api/alunos` — cadastro do exemplo. Fora do contrato com o Gateway. */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import type { Aluno } from "../../lib/tipos";
import { gravarAlunos, lerAlunos, restaurarAlunosIniciais } from "../../server/academia";
import { json, lerCorpo } from "../../server/http";

const aluno = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  pin: z.string().regex(/^\d{4,10}$/, "PIN deve ter de 4 a 10 digitos"),
  planoValidoAte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato aaaa-mm-dd"),
  bloqueado: z.boolean(),
  observacao: z.string().optional(),
});

const schema = z.discriminatedUnion("acao", [
  z.object({ acao: z.literal("salvar"), aluno }),
  z.object({ acao: z.literal("remover"), id: z.string().min(1) }),
  z.object({ acao: z.literal("restaurar") }),
]);

export const Route = createFileRoute("/api/alunos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema);
        if (!corpo.ok) return corpo.resposta;

        const pedido = corpo.dados;

        if (pedido.acao === "restaurar") {
          return json({ alunos: await restaurarAlunosIniciais() });
        }

        const alunos = await lerAlunos();

        if (pedido.acao === "remover") {
          const restantes = alunos.filter((item) => item.id !== pedido.id);
          await gravarAlunos(restantes);
          return json({ alunos: restantes });
        }

        const novo: Aluno = pedido.aluno;

        // O PIN e a chave que a catraca envia: dois alunos com o mesmo PIN fariam a
        // decisao depender da ordem da lista.
        if (alunos.some((item) => item.pin === novo.pin && item.id !== novo.id)) {
          return json({ error: "PIN_DUPLICADO", detail: "Ja existe um aluno com este PIN." }, 409);
        }

        const existe = alunos.some((item) => item.id === novo.id);
        const atualizados = existe
          ? alunos.map((item) => (item.id === novo.id ? novo : item))
          : [...alunos, novo];

        await gravarAlunos(atualizados);
        return json({ alunos: atualizados });
      },
    },
  },
});
