import { S as e, b as t, x as n } from "./index-DWOhH6yC.js";
import { a as r, n as i, r as a, t as o } from "./comuns-DP84_GW8.js";
import { t as s } from "./button-95o4flFC.js";
var c = e(n()),
  l = t(),
  u = `topdata-simulador-credencial`,
  d = `topdata-simulador-device`,
  f = `0.1.0-simulador`;
function p(e) {
  try {
    return localStorage.getItem(e);
  } catch {
    return null;
  }
}
function m(e, t) {
  try {
    localStorage.setItem(e, t);
  } catch {}
}
function h() {
  let [e, t] = (0, c.useState)(`AB73-KL92`),
    [n, h] = (0, c.useState)(null),
    [g, _] = (0, c.useState)(``),
    [v, y] = (0, c.useState)(``),
    [b, x] = (0, c.useState)([`DIGITE SEU PIN`]),
    [S, C] = (0, c.useState)([]),
    [w, T] = (0, c.useState)(!1),
    [E, D] = (0, c.useState)(!0),
    [O, k] = (0, c.useState)(!1),
    [A, j] = (0, c.useState)(!0),
    M = (0, c.useRef)(null);
  (0, c.useEffect)(() => {
    let e = p(u);
    e && h(JSON.parse(e));
    let t = p(d) ?? crypto.randomUUID();
    (m(d, t), _(t));
  }, []);
  let N = (0, c.useCallback)((e) => {
      C((t) =>
        [{ ...e, id: crypto.randomUUID(), hora: new Date().toISOString() }, ...t].slice(0, 40),
      );
    }, []),
    P = (0, c.useCallback)(
      async (e, t, n = {}) => {
        let r = await fetch(t, {
            method: e,
            headers: {
              ...(n.corpo === void 0 ? {} : { "content-type": `application/json` }),
              ...(n.token ? { authorization: `Bearer ${n.token}` } : {}),
              ...n.cabecalhos,
            },
            ...(n.corpo === void 0 ? {} : { body: JSON.stringify(n.corpo) }),
          }),
          i = await r.json();
        return (
          N({
            metodo: e,
            caminho: t,
            status: r.status,
            ...(n.corpo === void 0 ? {} : { requisicao: n.corpo }),
            resposta: i,
          }),
          { status: r.status, dados: i }
        );
      },
      [N],
    ),
    F = (0, c.useCallback)(async () => {
      T(!0);
      try {
        let { status: t, dados: n } = await P(`POST`, `/gateway/provision`, {
          corpo: { installationCode: e, machineName: `SIMULADOR-NAVEGADOR`, gatewayVersion: f },
        });
        if (t !== 200) {
          x([`FALHA PROVISION`, String(t)]);
          return;
        }
        let r = { gatewayId: n.gatewayId, gatewaySecret: n.gatewaySecret };
        (h(r),
          m(u, JSON.stringify(r)),
          (M.current = null),
          x([`PROVISIONADO`, n.tenantName ?? ``]));
      } finally {
        T(!1);
      }
    }, [P, e]),
    I = (0, c.useCallback)(async () => {
      if (M.current) return M.current;
      if (!n) return null;
      let { status: e, dados: t } = await P(`POST`, `/gateway/auth`, {
        corpo: { ...n, gatewayVersion: f },
      });
      return e === 200 ? ((M.current = t.accessToken), t.accessToken) : null;
    }, [P, n]),
    L = (0, c.useCallback)(
      async (e, t) => {
        let r = await I();
        !r ||
          !n ||
          (await P(`POST`, `/internal/gateway/${n.gatewayId}/events`, {
            corpo: t,
            token: r,
            cabecalhos: {
              "x-gateway-event-type": e,
              "x-idempotency-key": `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            },
          }));
      },
      [I, P, n],
    ),
    R = (0, c.useCallback)(async () => {
      if (!(!n || v.length < 4)) {
        T(!0);
        try {
          let e = await I();
          if (!e) {
            x([`SEM SERVIDOR`, `TENTE DE NOVO`]);
            return;
          }
          let t = crypto.randomUUID(),
            { status: r, dados: i } = await P(`POST`, `/internal/access/validate`, {
              token: e,
              corpo: {
                eventId: t,
                gatewayId: n.gatewayId,
                deviceId: g,
                credentialType: `PIN`,
                credential: v,
                direction: `ENTRY`,
                occurredAt: new Date().toISOString(),
              },
            });
          if (r !== 200) {
            (x([`ACESSO NEGADO`, `TENTE NOVAMENTE`]),
              await L(`ACCESS_OUTCOME`, {
                eventId: t,
                deviceId: g,
                decision: `DENY`,
                executed: !1,
                reasonCode: `ACCESS_VALIDATION_TIMEOUT`,
                errorCode: `ACCESS_VALIDATION_TIMEOUT`,
                completedAt: new Date().toISOString(),
              }));
            return;
          }
          let a = i.decision === `ALLOW`,
            o = a && !O;
          if (
            (x([i.message, a ? `` : `ACESSO NEGADO`]),
            y(``),
            await L(`ACCESS_OUTCOME`, {
              eventId: t,
              deviceId: g,
              decision: i.decision,
              executed: o,
              reasonCode: i.reasonCode,
              errorCode: a && !o ? `DEVICE_ERROR` : null,
              completedAt: new Date().toISOString(),
            }),
            !o)
          )
            return;
          await L(E ? `PASSAGE_CONFIRMED` : `PASSAGE_EXPIRED`, {
            deviceId: g,
            eventId: t,
            direction: `ENTRY`,
            occurredAt: new Date().toISOString(),
          });
        } finally {
          T(!1);
        }
      }
    }, [I, P, n, g, L, O, E, v]),
    z = (0, c.useCallback)(
      async (e = `ONLINE`) => {
        n &&
          (await L(`HEARTBEAT`, {
            gatewayId: n.gatewayId,
            version: f,
            status: e === `OFFLINE` ? `DEGRADED` : e,
            pendingEvents: 0,
            devices: [
              {
                deviceId: g,
                status: e,
                firmwareVersion: `L7.06.12`,
                lastEventAt: new Date().toISOString(),
              },
            ],
          }));
      },
      [n, g, L],
    ),
    B = (0, c.useCallback)(async () => {
      if (!n) return;
      let e = await I();
      if (!e) return;
      let t = await fetch(`/internal/gateway/${n.gatewayId}/commands`, {
        headers: { authorization: `Bearer ${e}` },
      });
      if (!t.ok) return;
      let { commands: r } = await t.json();
      if (r.length !== 0) {
        N({
          metodo: `GET`,
          caminho: `/internal/gateway/${n.gatewayId}/commands`,
          status: t.status,
          resposta: { commands: r },
        });
        for (let e of r) {
          let t = e.expiresAt ? Date.parse(e.expiresAt) < Date.now() : !1;
          if (t || e.deviceId !== g) {
            await L(`COMMAND_RESULT`, {
              commandId: e.commandId,
              status: `FAILED`,
              errorCode: t ? `COMMAND_EXPIRED` : `DEVICE_NOT_FOUND`,
            });
            continue;
          }
          (x([e.message ?? `LIBERADO`, e.type === `UNLOCK` ? `PODE PASSAR` : ``]),
            await L(`COMMAND_RESULT`, { commandId: e.commandId, status: `EXECUTED` }),
            e.type === `UNLOCK` &&
              E &&
              (await L(`PASSAGE_CONFIRMED`, {
                deviceId: g,
                eventId: e.commandId,
                direction: e.direction ?? `ENTRY`,
                occurredAt: new Date().toISOString(),
              })));
        }
      }
    }, [N, I, n, g, L, E]);
  return (
    (0, c.useEffect)(() => {
      if (!A || !n) return;
      let e = setInterval(() => void B(), 2e3);
      return () => clearInterval(e);
    }, [B, n, A]),
    (0, l.jsx)(`main`, {
      className: `mx-auto max-w-6xl space-y-4 px-4 py-6`,
      children: (0, l.jsxs)(`div`, {
        className: `grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]`,
        children: [
          (0, l.jsxs)(`div`, {
            className: `space-y-4`,
            children: [
              (0, l.jsxs)(a, {
                titulo: `1. Provisionamento`,
                descricao: `Codigo de instalacao vira credencial propria desta instalacao. Acontece uma vez.`,
                children: [
                  (0, l.jsxs)(`div`, {
                    className: `flex flex-wrap items-end gap-2`,
                    children: [
                      (0, l.jsxs)(`label`, {
                        className: `text-xs text-muted-foreground`,
                        children: [
                          `Codigo de instalacao`,
                          (0, l.jsx)(`input`, {
                            value: e,
                            onChange: (e) => t(e.target.value.toUpperCase()),
                            className: `mt-1 block h-9 w-44 rounded-md border border-input bg-background px-2 font-mono text-sm`,
                          }),
                        ],
                      }),
                      (0, l.jsx)(s, {
                        onClick: () => void F(),
                        disabled: w,
                        children: `Provisionar`,
                      }),
                      n
                        ? (0, l.jsx)(s, {
                            variant: `outline`,
                            onClick: () => {
                              (h(null), (M.current = null), m(u, ``));
                            },
                            children: `Esquecer credencial`,
                          })
                        : null,
                    ],
                  }),
                  n
                    ? (0, l.jsxs)(`dl`, {
                        className: `mt-3 space-y-1 text-xs`,
                        children: [
                          (0, l.jsxs)(`div`, {
                            children: [
                              (0, l.jsx)(`dt`, {
                                className: `inline text-muted-foreground`,
                                children: `gatewayId: `,
                              }),
                              (0, l.jsx)(`dd`, {
                                className: `inline font-mono break-all`,
                                children: n.gatewayId,
                              }),
                            ],
                          }),
                          (0, l.jsxs)(`div`, {
                            children: [
                              (0, l.jsx)(`dt`, {
                                className: `inline text-muted-foreground`,
                                children: `gatewaySecret: `,
                              }),
                              (0, l.jsxs)(`dd`, {
                                className: `inline font-mono`,
                                children: [
                                  n.gatewaySecret.slice(0, 6),
                                  `… (guardado so neste navegador)`,
                                ],
                              }),
                            ],
                          }),
                          (0, l.jsxs)(`div`, {
                            children: [
                              (0, l.jsx)(`dt`, {
                                className: `inline text-muted-foreground`,
                                children: `deviceId: `,
                              }),
                              (0, l.jsx)(`dd`, {
                                className: `inline font-mono break-all`,
                                children: g,
                              }),
                            ],
                          }),
                        ],
                      })
                    : (0, l.jsxs)(`p`, {
                        className: `mt-3 text-xs text-muted-foreground`,
                        children: [
                          `Ainda sem credencial. Sem provisionar, nenhuma outra chamada e aceita — e o equivalente ao `,
                          (0, l.jsx)(`code`, {
                            className: `font-mono`,
                            children: `NOT_PROVISIONED`,
                          }),
                          ` do Gateway.`,
                        ],
                      }),
                ],
              }),
              (0, l.jsxs)(a, {
                titulo: `2. A catraca`,
                descricao: `Digite um PIN e confirme. O display mostra o que a pessoa leria no equipamento.`,
                children: [
                  (0, l.jsxs)(`div`, {
                    className: `flex flex-wrap items-start gap-4`,
                    children: [
                      (0, l.jsxs)(`div`, {
                        children: [
                          (0, l.jsx)(`div`, {
                            className: `grid w-44 grid-cols-3 gap-1.5`,
                            children: [
                              `1`,
                              `2`,
                              `3`,
                              `4`,
                              `5`,
                              `6`,
                              `7`,
                              `8`,
                              `9`,
                              `*`,
                              `0`,
                              `#`,
                            ].map((e) =>
                              (0, l.jsx)(
                                `button`,
                                {
                                  type: `button`,
                                  disabled: !n || w,
                                  onClick: () => {
                                    if (e === `*`) return y(``);
                                    if (e === `#`) return void R();
                                    y((t) => (t + e).slice(0, 10));
                                  },
                                  className: `h-11 rounded-md border border-border bg-background font-mono text-sm transition-colors hover:bg-accent disabled:opacity-40`,
                                  children: e === `*` ? `limpa` : e === `#` ? `OK` : e,
                                },
                                e,
                              ),
                            ),
                          }),
                          (0, l.jsx)(`p`, {
                            className: `mt-2 font-mono text-lg tracking-[0.3em]`,
                            children: v.replace(/./g, `•`) || `······`,
                          }),
                        ],
                      }),
                      (0, l.jsxs)(`div`, {
                        className: `space-y-3`,
                        children: [
                          (0, l.jsx)(o, { linhas: b }),
                          (0, l.jsxs)(`label`, {
                            className: `flex items-center gap-2 text-xs text-muted-foreground`,
                            children: [
                              (0, l.jsx)(`input`, {
                                type: `checkbox`,
                                checked: E,
                                onChange: (e) => D(e.target.checked),
                              }),
                              `a pessoa gira a catraca (PASSAGE_CONFIRMED)`,
                            ],
                          }),
                          (0, l.jsxs)(`label`, {
                            className: `flex items-center gap-2 text-xs text-muted-foreground`,
                            children: [
                              (0, l.jsx)(`input`, {
                                type: `checkbox`,
                                checked: O,
                                onChange: (e) => k(e.target.checked),
                              }),
                              `o equipamento recusa o comando (ALLOW com executed=false)`,
                            ],
                          }),
                          (0, l.jsxs)(`label`, {
                            className: `flex items-center gap-2 text-xs text-muted-foreground`,
                            children: [
                              (0, l.jsx)(`input`, {
                                type: `checkbox`,
                                checked: A,
                                onChange: (e) => j(e.target.checked),
                              }),
                              `receber comandos do painel (UNLOCK / SHOW_MESSAGE)`,
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)(`div`, {
                    className: `mt-4 flex flex-wrap gap-2`,
                    children: [
                      (0, l.jsx)(s, {
                        size: `sm`,
                        variant: `outline`,
                        disabled: !n,
                        onClick: () => void z(`ONLINE`),
                        children: `Heartbeat ONLINE`,
                      }),
                      (0, l.jsx)(s, {
                        size: `sm`,
                        variant: `outline`,
                        disabled: !n,
                        onClick: () => void z(`DEGRADED`),
                        children: `Heartbeat DEGRADED`,
                      }),
                      (0, l.jsx)(s, {
                        size: `sm`,
                        variant: `outline`,
                        disabled: !n,
                        onClick: () => void z(`OFFLINE`),
                        children: `Equipamento OFFLINE`,
                      }),
                      (0, l.jsx)(s, {
                        size: `sm`,
                        variant: `outline`,
                        disabled: !n,
                        onClick: () => void B(),
                        children: `Buscar comandos agora`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, l.jsx)(a, {
            titulo: `Troca HTTP crua`,
            descricao: `Exatamente o que o Windows Service envia e recebe — nada de atalho interno.`,
            acao:
              S.length > 0
                ? (0, l.jsx)(s, {
                    size: `sm`,
                    variant: `ghost`,
                    onClick: () => C([]),
                    children: `limpar`,
                  })
                : void 0,
            children:
              S.length === 0
                ? (0, l.jsx)(`p`, {
                    className: `text-sm text-muted-foreground`,
                    children: `Provisione e digite um PIN para ver as chamadas aparecerem aqui.`,
                  })
                : (0, l.jsx)(`ol`, {
                    className: `space-y-3`,
                    children: S.map((e) =>
                      (0, l.jsxs)(
                        `li`,
                        {
                          className: `rounded-md border border-border p-3`,
                          children: [
                            (0, l.jsxs)(`div`, {
                              className: `flex flex-wrap items-center gap-2`,
                              children: [
                                (0, l.jsx)(i, {
                                  tom: e.status < 300 ? `ok` : e.status < 500 ? `atencao` : `ruim`,
                                  children: e.status,
                                }),
                                (0, l.jsxs)(`span`, {
                                  className: `font-mono text-xs`,
                                  children: [e.metodo, ` `, e.caminho],
                                }),
                                (0, l.jsx)(`span`, {
                                  className: `ml-auto font-mono text-[11px] text-muted-foreground`,
                                  children: r(e.hora),
                                }),
                              ],
                            }),
                            e.requisicao === void 0
                              ? null
                              : (0, l.jsx)(`pre`, {
                                  className: `mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-4`,
                                  children: JSON.stringify(e.requisicao, null, 2),
                                }),
                            (0, l.jsx)(`pre`, {
                              className: `mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-4`,
                              children: JSON.stringify(e.resposta, null, 2),
                            }),
                          ],
                        },
                        e.id,
                      ),
                    ),
                  }),
          }),
        ],
      }),
    })
  );
}
export { h as component };
