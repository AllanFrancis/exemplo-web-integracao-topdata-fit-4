/**
 * Cadastro de alunos — o lado que o Gateway nunca ve.
 *
 * Cada campo daqui existe para produzir um `reasonCode` diferente na catraca. Trocar
 * este cadastro pelo sistema de mensalidade de verdade nao muda uma linha do protocolo.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Etiqueta, Secao } from "@/components/comuns";
import { Button } from "@/components/ui/button";
import { useMutacaoDeAluno, usePainel } from "@/lib/api-cliente";
import type { Aluno } from "@/lib/tipos";

export const Route = createFileRoute("/alunos")({
  head: () => ({ meta: [{ title: "Alunos — integracao Topdata Gateway" }] }),
  component: Alunos,
});

const VAZIO: Aluno = {
  id: "",
  nome: "",
  pin: "",
  planoValidoAte: new Date().toISOString().slice(0, 10),
  bloqueado: false,
};

function Alunos() {
  const { data } = usePainel(5000);
  const mutacao = useMutacaoDeAluno();
  const [rascunho, setRascunho] = useState<Aluno | null>(null);

  const alunos = data?.alunos ?? [];
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <Secao
        titulo="Alunos"
        descricao="O PIN e a credencial que a catraca envia; o resto e negocio nosso."
        acao={
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setRascunho({ ...VAZIO, id: crypto.randomUUID().slice(0, 8) })}
            >
              Novo aluno
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => mutacao.mutate({ acao: "restaurar" })}
              disabled={mutacao.isPending}
            >
              Restaurar exemplos
            </Button>
          </div>
        }
      >
        {mutacao.error ? (
          <p className="mb-3 text-sm text-red-600">{String(mutacao.error.message)}</p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="pb-2 pr-3 font-medium">Nome</th>
                <th className="pb-2 pr-3 font-medium">PIN</th>
                <th className="pb-2 pr-3 font-medium">Plano ate</th>
                <th className="pb-2 pr-3 font-medium">Situacao</th>
                <th className="pb-2 pr-3 font-medium">Na catraca</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alunos.map((aluno) => {
                const vencido = aluno.planoValidoAte < hoje;

                return (
                  <tr key={aluno.id}>
                    <td className="py-2 pr-3">
                      {aluno.nome}
                      {aluno.observacao ? (
                        <p className="text-xs text-muted-foreground">{aluno.observacao}</p>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{aluno.pin}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{aluno.planoValidoAte}</td>
                    <td className="py-2 pr-3">
                      {aluno.bloqueado ? (
                        <Etiqueta tom="ruim">bloqueado</Etiqueta>
                      ) : vencido ? (
                        <Etiqueta tom="atencao">vencido</Etiqueta>
                      ) : (
                        <Etiqueta tom="ok">em dia</Etiqueta>
                      )}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[11px] text-muted-foreground">
                      {aluno.bloqueado
                        ? "DENY · STUDENT_BLOCKED"
                        : vencido
                          ? "DENY · PLAN_EXPIRED"
                          : "ALLOW · ACCESS_ALLOWED"}
                    </td>
                    <td className="py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setRascunho(aluno)}>
                        editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => mutacao.mutate({ acao: "remover", id: aluno.id })}
                      >
                        remover
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Secao>

      {rascunho ? (
        <Secao titulo="Editar aluno" descricao="PIN de 4 a 10 digitos, unico entre os alunos.">
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(evento) => {
              evento.preventDefault();
              mutacao.mutate(
                { acao: "salvar", aluno: rascunho },
                { onSuccess: () => setRascunho(null) },
              );
            }}
          >
            <label className="text-xs text-muted-foreground">
              Nome
              <input
                required
                value={rascunho.nome}
                onChange={(evento) => setRascunho({ ...rascunho, nome: evento.target.value })}
                className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              />
            </label>

            <label className="text-xs text-muted-foreground">
              PIN
              <input
                required
                inputMode="numeric"
                pattern="\d{4,10}"
                value={rascunho.pin}
                onChange={(evento) =>
                  setRascunho({ ...rascunho, pin: evento.target.value.replace(/\D/g, "") })
                }
                className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 font-mono text-sm"
              />
            </label>

            <label className="text-xs text-muted-foreground">
              Plano valido ate
              <input
                required
                type="date"
                value={rascunho.planoValidoAte}
                onChange={(evento) =>
                  setRascunho({ ...rascunho, planoValidoAte: evento.target.value })
                }
                className="mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              />
            </label>

            <label className="flex items-end gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={rascunho.bloqueado}
                onChange={(evento) =>
                  setRascunho({ ...rascunho, bloqueado: evento.target.checked })
                }
                className="mb-2"
              />
              bloqueado na recepcao
            </label>

            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit" disabled={mutacao.isPending}>
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => setRascunho(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Secao>
      ) : null}
    </main>
  );
}
