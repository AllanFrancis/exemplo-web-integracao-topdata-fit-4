import { n as e, r as t } from "./api-cliente-DDe_2c6f.js";
import { S as n, b as r, x as i } from "./index-DWOhH6yC.js";
import { n as a, r as o } from "./comuns-DP84_GW8.js";
import { t as s } from "./button-95o4flFC.js";
var c = n(i()),
  l = r(),
  u = {
    id: ``,
    nome: ``,
    pin: ``,
    planoValidoAte: new Date().toISOString().slice(0, 10),
    bloqueado: !1,
  };
function d() {
  let { data: n } = t(5e3),
    r = e(),
    [i, d] = (0, c.useState)(null),
    f = n?.alunos ?? [],
    p = new Date().toISOString().slice(0, 10);
  return (0, l.jsxs)(`main`, {
    className: `mx-auto max-w-6xl space-y-4 px-4 py-6`,
    children: [
      (0, l.jsxs)(o, {
        titulo: `Alunos`,
        descricao: `O PIN e a credencial que a catraca envia; o resto e negocio nosso.`,
        acao: (0, l.jsxs)(`div`, {
          className: `flex gap-2`,
          children: [
            (0, l.jsx)(s, {
              size: `sm`,
              onClick: () => d({ ...u, id: crypto.randomUUID().slice(0, 8) }),
              children: `Novo aluno`,
            }),
            (0, l.jsx)(s, {
              size: `sm`,
              variant: `outline`,
              onClick: () => r.mutate({ acao: `restaurar` }),
              disabled: r.isPending,
              children: `Restaurar exemplos`,
            }),
          ],
        }),
        children: [
          r.error
            ? (0, l.jsx)(`p`, {
                className: `mb-3 text-sm text-red-600`,
                children: String(r.error.message),
              })
            : null,
          (0, l.jsx)(`div`, {
            className: `overflow-x-auto`,
            children: (0, l.jsxs)(`table`, {
              className: `w-full text-sm`,
              children: [
                (0, l.jsx)(`thead`, {
                  className: `text-left text-xs uppercase tracking-wide text-muted-foreground`,
                  children: (0, l.jsxs)(`tr`, {
                    children: [
                      (0, l.jsx)(`th`, { className: `pb-2 pr-3 font-medium`, children: `Nome` }),
                      (0, l.jsx)(`th`, { className: `pb-2 pr-3 font-medium`, children: `PIN` }),
                      (0, l.jsx)(`th`, {
                        className: `pb-2 pr-3 font-medium`,
                        children: `Plano ate`,
                      }),
                      (0, l.jsx)(`th`, {
                        className: `pb-2 pr-3 font-medium`,
                        children: `Situacao`,
                      }),
                      (0, l.jsx)(`th`, {
                        className: `pb-2 pr-3 font-medium`,
                        children: `Na catraca`,
                      }),
                      (0, l.jsx)(`th`, { className: `pb-2 font-medium` }),
                    ],
                  }),
                }),
                (0, l.jsx)(`tbody`, {
                  className: `divide-y divide-border`,
                  children: f.map((e) => {
                    let t = e.planoValidoAte < p;
                    return (0, l.jsxs)(
                      `tr`,
                      {
                        children: [
                          (0, l.jsxs)(`td`, {
                            className: `py-2 pr-3`,
                            children: [
                              e.nome,
                              e.observacao
                                ? (0, l.jsx)(`p`, {
                                    className: `text-xs text-muted-foreground`,
                                    children: e.observacao,
                                  })
                                : null,
                            ],
                          }),
                          (0, l.jsx)(`td`, {
                            className: `py-2 pr-3 font-mono text-xs`,
                            children: e.pin,
                          }),
                          (0, l.jsx)(`td`, {
                            className: `py-2 pr-3 font-mono text-xs`,
                            children: e.planoValidoAte,
                          }),
                          (0, l.jsx)(`td`, {
                            className: `py-2 pr-3`,
                            children: e.bloqueado
                              ? (0, l.jsx)(a, { tom: `ruim`, children: `bloqueado` })
                              : t
                                ? (0, l.jsx)(a, { tom: `atencao`, children: `vencido` })
                                : (0, l.jsx)(a, { tom: `ok`, children: `em dia` }),
                          }),
                          (0, l.jsx)(`td`, {
                            className: `py-2 pr-3 font-mono text-[11px] text-muted-foreground`,
                            children: e.bloqueado
                              ? `DENY · STUDENT_BLOCKED`
                              : t
                                ? `DENY · PLAN_EXPIRED`
                                : `ALLOW · ACCESS_ALLOWED`,
                          }),
                          (0, l.jsxs)(`td`, {
                            className: `py-2 text-right`,
                            children: [
                              (0, l.jsx)(s, {
                                size: `sm`,
                                variant: `ghost`,
                                onClick: () => d(e),
                                children: `editar`,
                              }),
                              (0, l.jsx)(s, {
                                size: `sm`,
                                variant: `ghost`,
                                onClick: () => r.mutate({ acao: `remover`, id: e.id }),
                                children: `remover`,
                              }),
                            ],
                          }),
                        ],
                      },
                      e.id,
                    );
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
      i
        ? (0, l.jsx)(o, {
            titulo: `Editar aluno`,
            descricao: `PIN de 4 a 10 digitos, unico entre os alunos.`,
            children: (0, l.jsxs)(`form`, {
              className: `grid gap-3 sm:grid-cols-2`,
              onSubmit: (e) => {
                (e.preventDefault(),
                  r.mutate({ acao: `salvar`, aluno: i }, { onSuccess: () => d(null) }));
              },
              children: [
                (0, l.jsxs)(`label`, {
                  className: `text-xs text-muted-foreground`,
                  children: [
                    `Nome`,
                    (0, l.jsx)(`input`, {
                      required: !0,
                      value: i.nome,
                      onChange: (e) => d({ ...i, nome: e.target.value }),
                      className: `mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-sm`,
                    }),
                  ],
                }),
                (0, l.jsxs)(`label`, {
                  className: `text-xs text-muted-foreground`,
                  children: [
                    `PIN`,
                    (0, l.jsx)(`input`, {
                      required: !0,
                      inputMode: `numeric`,
                      pattern: `\\d{4,10}`,
                      value: i.pin,
                      onChange: (e) => d({ ...i, pin: e.target.value.replace(/\D/g, ``) }),
                      className: `mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 font-mono text-sm`,
                    }),
                  ],
                }),
                (0, l.jsxs)(`label`, {
                  className: `text-xs text-muted-foreground`,
                  children: [
                    `Plano valido ate`,
                    (0, l.jsx)(`input`, {
                      required: !0,
                      type: `date`,
                      value: i.planoValidoAte,
                      onChange: (e) => d({ ...i, planoValidoAte: e.target.value }),
                      className: `mt-1 block h-9 w-full rounded-md border border-input bg-background px-2 text-sm`,
                    }),
                  ],
                }),
                (0, l.jsxs)(`label`, {
                  className: `flex items-end gap-2 text-xs text-muted-foreground`,
                  children: [
                    (0, l.jsx)(`input`, {
                      type: `checkbox`,
                      checked: i.bloqueado,
                      onChange: (e) => d({ ...i, bloqueado: e.target.checked }),
                      className: `mb-2`,
                    }),
                    `bloqueado na recepcao`,
                  ],
                }),
                (0, l.jsxs)(`div`, {
                  className: `sm:col-span-2 flex gap-2`,
                  children: [
                    (0, l.jsx)(s, { type: `submit`, disabled: r.isPending, children: `Salvar` }),
                    (0, l.jsx)(s, {
                      type: `button`,
                      variant: `outline`,
                      onClick: () => d(null),
                      children: `Cancelar`,
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
export { d as component };
