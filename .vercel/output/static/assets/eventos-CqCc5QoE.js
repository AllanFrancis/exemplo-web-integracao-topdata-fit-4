import { r as e } from "./api-cliente-DDe_2c6f.js";
import { S as t, b as n, x as r } from "./index-DWOhH6yC.js";
import { a as i, n as a, r as o } from "./comuns-DP84_GW8.js";
var s = t(r()),
  c = [
    `HEARTBEAT`,
    `ACCESS_OUTCOME`,
    `DEVICE_STATUS_CHANGED`,
    `PASSAGE_CONFIRMED`,
    `PASSAGE_EXPIRED`,
    `COMMAND_RESULT`,
  ],
  l = n(),
  u = {
    HEARTBEAT: `neutro`,
    ACCESS_VALIDATE: `atencao`,
    ACCESS_OUTCOME: `ok`,
    PASSAGE_CONFIRMED: `ok`,
    PASSAGE_EXPIRED: `atencao`,
    DEVICE_STATUS_CHANGED: `atencao`,
    COMMAND_RESULT: `neutro`,
  };
function d() {
  let { data: t } = e(),
    [n, r] = (0, s.useState)(`TODOS`),
    [d, f] = (0, s.useState)(null),
    p = (t?.eventos ?? []).filter((e) => n === `TODOS` || e.tipo === n);
  return (0, l.jsxs)(`main`, {
    className: `mx-auto max-w-6xl space-y-4 px-4 py-6`,
    children: [
      (0, l.jsx)(o, {
        titulo: `Trilha de eventos`,
        descricao: `Chegam por POST /internal/gateway/{gatewayId}/events, deduplicados por X-Idempotency-Key.`,
        acao: (0, l.jsxs)(`select`, {
          value: n,
          onChange: (e) => r(e.target.value),
          className: `h-8 rounded-md border border-input bg-background px-2 text-xs`,
          children: [
            (0, l.jsx)(`option`, { value: `TODOS`, children: `todos os tipos` }),
            (0, l.jsx)(`option`, {
              value: `ACCESS_VALIDATE`,
              children: `ACCESS_VALIDATE (validacao)`,
            }),
            c.map((e) => (0, l.jsx)(`option`, { value: e, children: e }, e)),
          ],
        }),
        children:
          p.length === 0
            ? (0, l.jsx)(`p`, {
                className: `text-sm text-muted-foreground`,
                children: `Nada registrado ainda com este filtro.`,
              })
            : (0, l.jsx)(`ol`, {
                className: `space-y-2`,
                children: p.map((e) =>
                  (0, l.jsxs)(
                    `li`,
                    {
                      className: `rounded-md border border-border`,
                      children: [
                        (0, l.jsxs)(`button`, {
                          type: `button`,
                          onClick: () => f(d === e.id ? null : e.id),
                          className: `flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/50`,
                          children: [
                            (0, l.jsx)(`span`, {
                              className: `font-mono text-[11px] text-muted-foreground`,
                              children: i(e.recebidoEm),
                            }),
                            (0, l.jsx)(a, { tom: u[e.tipo] ?? `neutro`, children: e.tipo }),
                            (0, l.jsx)(`span`, { className: `text-sm`, children: e.resumo }),
                          ],
                        }),
                        d === e.id
                          ? (0, l.jsx)(`pre`, {
                              className: `overflow-x-auto border-t border-border bg-muted p-3 text-[11px] leading-4`,
                              children: JSON.stringify(e.payload, null, 2),
                            })
                          : null,
                      ],
                    },
                    e.id,
                  ),
                ),
              }),
      }),
      (0, l.jsxs)(`p`, {
        className: `text-xs text-muted-foreground`,
        children: [
          `O PIN completo nunca entra na trilha: a validacao registra apenas os tres ultimos digitos. O corpo de `,
          (0, l.jsx)(`code`, { className: `font-mono`, children: `/internal/access/validate` }),
          ` e o unico lugar do sistema em que ele trafega inteiro.`,
        ],
      }),
    ],
  });
}
export { d as component };
