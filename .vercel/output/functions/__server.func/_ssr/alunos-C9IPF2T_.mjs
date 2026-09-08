import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as Etiqueta, r as Secao } from "./comuns-CAD4V6nc.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as Button } from "./button-CAMwN1Ey.mjs";
import { n as useMutacaoDeAluno, r as usePainel } from "./api-cliente-sJe7czvi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alunos-C9IPF2T_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
 * Cadastro de alunos — o lado que o Gateway nunca ve.
 *
 * Cada campo daqui existe para produzir um `reasonCode` diferente na catraca. Trocar
 * este cadastro pelo sistema de mensalidade de verdade nao muda uma linha do protocolo.
 */
var VAZIO = {
  id: "",
  nome: "",
  pin: "",
  planoValidoAte: /* @__PURE__ */ new Date().toISOString().slice(0, 10),
  bloqueado: false,
};
function Alunos() {
  const { data } = usePainel(5e3);
  const mutacao = useMutacaoDeAluno();
  const [rascunho, setRascunho] = (0, import_react.useState)(null);
  const alunos = data?.alunos ?? [];
  const hoje = /* @__PURE__ */ new Date().toISOString().slice(0, 10);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
    className: "mx-auto max-w-6xl space-y-4 px-4 py-6",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secao, {
        titulo: "Alunos",
        descricao: "O PIN e a credencial que a catraca envia; o resto e negocio nosso.",
        acao: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "flex gap-2",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
              size: "sm",
              onClick: () =>
                setRascunho({
                  ...VAZIO,
                  id: crypto.randomUUID().slice(0, 8),
                }),
              children: "Novo aluno",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
              size: "sm",
              variant: "outline",
              onClick: () => mutacao.mutate({ acao: "restaurar" }),
              disabled: mutacao.isPending,
              children: "Restaurar exemplos",
            }),
          ],
        }),
        children: [
          mutacao.error
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "mb-3 text-sm text-red-600",
                children: String(mutacao.error.message),
              })
            : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "overflow-x-auto",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
              className: "w-full text-sm",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
                  className: "text-left text-xs uppercase tracking-wide text-muted-foreground",
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                        className: "pb-2 pr-3 font-medium",
                        children: "Nome",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                        className: "pb-2 pr-3 font-medium",
                        children: "PIN",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                        className: "pb-2 pr-3 font-medium",
                        children: "Plano ate",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                        className: "pb-2 pr-3 font-medium",
                        children: "Situacao",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                        className: "pb-2 pr-3 font-medium",
                        children: "Na catraca",
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                        className: "pb-2 font-medium",
                      }),
                    ],
                  }),
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
                  className: "divide-y divide-border",
                  children: alunos.map((aluno) => {
                    const vencido = aluno.planoValidoAte < hoje;
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                      "tr",
                      {
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
                            className: "py-2 pr-3",
                            children: [
                              aluno.nome,
                              aluno.observacao
                                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: aluno.observacao,
                                  })
                                : null,
                            ],
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                            className: "py-2 pr-3 font-mono text-xs",
                            children: aluno.pin,
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                            className: "py-2 pr-3 font-mono text-xs",
                            children: aluno.planoValidoAte,
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                            className: "py-2 pr-3",
                            children: aluno.bloqueado
                              ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                                  tom: "ruim",
                                  children: "bloqueado",
                                })
                              : vencido
                                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                                    tom: "atencao",
                                    children: "vencido",
                                  })
                                : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                                    tom: "ok",
                                    children: "em dia",
                                  }),
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                            className: "py-2 pr-3 font-mono text-[11px] text-muted-foreground",
                            children: aluno.bloqueado
                              ? "DENY · STUDENT_BLOCKED"
                              : vencido
                                ? "DENY · PLAN_EXPIRED"
                                : "ALLOW · ACCESS_ALLOWED",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
                            className: "py-2 text-right",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                                size: "sm",
                                variant: "ghost",
                                onClick: () => setRascunho(aluno),
                                children: "editar",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                                size: "sm",
                                variant: "ghost",
                                onClick: () =>
                                  mutacao.mutate({
                                    acao: "remover",
                                    id: aluno.id,
                                  }),
                                children: "remover",
                              }),
                            ],
                          }),
                        ],
                      },
                      aluno.id,
                    );
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
      rascunho
        ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
            titulo: "Editar aluno",
            descricao: "PIN de 4 a 10 digitos, unico entre os alunos.",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
              className: "grid gap-3 sm:grid-cols-2",
              onSubmit: (evento) => {
                evento.preventDefault();
                mutacao.mutate(
                  {
                    acao: "salvar",
                    aluno: rascunho,
                  },
                  { onSuccess: () => setRascunho(null) },
                );
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                  className: "text-xs text-muted-foreground",
                  children: [
                    "Nome",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                      required: true,
                      value: rascunho.nome,
                      onChange: (evento) =>
                        setRascunho({
                          ...rascunho,
                          nome: evento.target.value,
                        }),
                      className:
                        "mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-sm",
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                  className: "text-xs text-muted-foreground",
                  children: [
                    "PIN",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                      required: true,
                      inputMode: "numeric",
                      pattern: "\\d{4,10}",
                      value: rascunho.pin,
                      onChange: (evento) =>
                        setRascunho({
                          ...rascunho,
                          pin: evento.target.value.replace(/\D/g, ""),
                        }),
                      className:
                        "mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 font-mono text-sm",
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                  className: "text-xs text-muted-foreground",
                  children: [
                    "Plano valido ate",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                      required: true,
                      type: "date",
                      value: rascunho.planoValidoAte,
                      onChange: (evento) =>
                        setRascunho({
                          ...rascunho,
                          planoValidoAte: evento.target.value,
                        }),
                      className:
                        "mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-sm",
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                  className: "flex items-end gap-2 text-xs text-muted-foreground",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                      type: "checkbox",
                      checked: rascunho.bloqueado,
                      onChange: (evento) =>
                        setRascunho({
                          ...rascunho,
                          bloqueado: evento.target.checked,
                        }),
                      className: "mb-2",
                    }),
                    "bloqueado na recepcao",
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "sm:col-span-2 flex gap-2",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      type: "submit",
                      disabled: mutacao.isPending,
                      children: "Salvar",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      type: "button",
                      variant: "outline",
                      onClick: () => setRascunho(null),
                      children: "Cancelar",
                    }),
                  ],
                }),
              ],
            }),
          })
        : null,
    ],
  });
}
//#endregion
export { Alunos as component };
