import { r as e, t } from "./api-cliente-DDe_2c6f.js";
import { S as n, b as r, x as i, y as a } from "./index-DWOhH6yC.js";
import { a as o, i as s, n as c, o as l, r as u, t as d } from "./comuns-DP84_GW8.js";
import { t as f } from "./button-95o4flFC.js";
var p = n(i()),
  m = r();
function h({ children: e }) {
  return (0, m.jsx)(`main`, { className: `mx-auto max-w-6xl space-y-4 px-4 py-6`, children: e });
}
function g() {
  let { data: t, isLoading: n, error: r } = e();
  if (n)
    return (0, m.jsx)(h, {
      children: (0, m.jsx)(`p`, {
        className: `text-sm text-muted-foreground`,
        children: `Carregando…`,
      }),
    });
  if (r || !t)
    return (0, m.jsx)(h, {
      children: (0, m.jsxs)(`p`, {
        className: `text-sm text-red-600`,
        children: [`Falha ao carregar o painel: `, String(r)],
      }),
    });
  let i = t.acessos.slice(0, 12);
  return (0, m.jsxs)(h, {
    children: [
      t.ambiente.armazenamento === `memoria`
        ? (0, m.jsxs)(`div`, {
            className: `rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300`,
            children: [
              (0, m.jsx)(`strong`, { children: `Armazenamento em memoria.` }),
              ` Nao ha banco configurado: alunos, trilha e acessos vivem na instancia que atende a requisicao e somem quando ela recicla. Defina`,
              ` `,
              (0, m.jsx)(`code`, { className: `font-mono text-xs`, children: `KV_REST_API_URL` }),
              ` e`,
              ` `,
              (0, m.jsx)(`code`, { className: `font-mono text-xs`, children: `KV_REST_API_TOKEN` }),
              ` para persistir de verdade.`,
            ],
          })
        : null,
      t.gateways.length === 0
        ? (0, m.jsx)(u, {
            titulo: `Nenhum Gateway provisionado`,
            descricao: `O primeiro passo e trocar o codigo de instalacao pela credencial da instalacao.`,
            children: (0, m.jsxs)(`p`, {
              className: `text-sm text-muted-foreground`,
              children: [
                `Aponte o Gateway para este endereco em`,
                ` `,
                (0, m.jsx)(`code`, { className: `font-mono text-xs`, children: `config.json` }),
                ` e provisione, ou abra o`,
                ` `,
                (0, m.jsx)(a, {
                  to: `/simulador`,
                  className: `font-medium text-foreground underline`,
                  children: `simulador`,
                }),
                ` `,
                `para ver o fluxo inteiro sem hardware. As instrucoes estao em`,
                ` `,
                (0, m.jsx)(a, {
                  to: `/instalacao`,
                  className: `font-medium text-foreground underline`,
                  children: `Instalacao`,
                }),
                `.`,
              ],
            }),
          })
        : null,
      (0, m.jsx)(`div`, {
        className: `grid gap-4 md:grid-cols-2`,
        children: t.gateways.map((e) => (0, m.jsx)(y, { gateway: e }, e.gatewayId)),
      }),
      (0, m.jsx)(u, {
        titulo: `Acessos recentes`,
        descricao: `A decisao e nossa; girar a catraca e um fato fisico que so o equipamento confirma.`,
        children:
          i.length === 0
            ? (0, m.jsx)(`p`, {
                className: `text-sm text-muted-foreground`,
                children: `Nada ainda. Use o simulador ou digite um PIN na catraca.`,
              })
            : (0, m.jsx)(`div`, {
                className: `overflow-x-auto`,
                children: (0, m.jsxs)(`table`, {
                  className: `w-full text-sm`,
                  children: [
                    (0, m.jsx)(`thead`, {
                      className: `text-left text-xs uppercase tracking-wide text-muted-foreground`,
                      children: (0, m.jsxs)(`tr`, {
                        children: [
                          (0, m.jsx)(`th`, {
                            className: `pb-2 pr-3 font-medium`,
                            children: `Hora`,
                          }),
                          (0, m.jsx)(`th`, {
                            className: `pb-2 pr-3 font-medium`,
                            children: `Credencial`,
                          }),
                          (0, m.jsx)(`th`, {
                            className: `pb-2 pr-3 font-medium`,
                            children: `Aluno`,
                          }),
                          (0, m.jsx)(`th`, {
                            className: `pb-2 pr-3 font-medium`,
                            children: `Decisao`,
                          }),
                          (0, m.jsx)(`th`, {
                            className: `pb-2 pr-3 font-medium`,
                            children: `Motivo`,
                          }),
                          (0, m.jsx)(`th`, {
                            className: `pb-2 pr-3 font-medium`,
                            children: `Display`,
                          }),
                          (0, m.jsx)(`th`, { className: `pb-2 font-medium`, children: `Desfecho` }),
                        ],
                      }),
                    }),
                    (0, m.jsx)(`tbody`, {
                      className: `divide-y divide-border`,
                      children: i.map((e) =>
                        (0, m.jsxs)(
                          `tr`,
                          {
                            className: `align-middle`,
                            children: [
                              (0, m.jsx)(`td`, {
                                className: `py-2 pr-3 font-mono text-xs text-muted-foreground`,
                                children: o(e.decididoEm),
                              }),
                              (0, m.jsx)(`td`, {
                                className: `py-2 pr-3 font-mono text-xs`,
                                children: e.credencialMascarada,
                              }),
                              (0, m.jsx)(`td`, {
                                className: `py-2 pr-3`,
                                children: e.alunoNome ?? `—`,
                              }),
                              (0, m.jsx)(`td`, {
                                className: `py-2 pr-3`,
                                children: (0, m.jsx)(c, {
                                  tom: e.decisao === `ALLOW` ? `ok` : `ruim`,
                                  children: e.decisao,
                                }),
                              }),
                              (0, m.jsx)(`td`, {
                                className: `py-2 pr-3 font-mono text-xs text-muted-foreground`,
                                children: e.reasonCode,
                              }),
                              (0, m.jsx)(`td`, {
                                className: `py-2 pr-3 font-mono text-xs`,
                                children: e.mensagem,
                              }),
                              (0, m.jsx)(`td`, {
                                className: `py-2`,
                                children: (0, m.jsx)(v, {
                                  executado: e.executado,
                                  passagem: e.passagemConfirmadaEm,
                                  decisao: e.decisao,
                                }),
                              }),
                            ],
                          },
                          e.eventId,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
      }),
      (0, m.jsx)(u, {
        titulo: `Fila de comandos`,
        descricao: `Comandos so chegam a catraca pelo WebSocket — em serverless, atraves da ponte ws-bridge/.`,
        children:
          t.comandos.length === 0
            ? (0, m.jsx)(`p`, {
                className: `text-sm text-muted-foreground`,
                children: `Nenhum comando enviado nesta sessao.`,
              })
            : (0, m.jsx)(`ul`, {
                className: `space-y-2 text-sm`,
                children: t.comandos
                  .slice(0, 8)
                  .map((e) =>
                    (0, m.jsxs)(
                      `li`,
                      {
                        className: `flex flex-wrap items-center gap-2`,
                        children: [
                          (0, m.jsx)(`span`, {
                            className: `font-mono text-xs text-muted-foreground`,
                            children: o(e.criadoEm),
                          }),
                          (0, m.jsx)(c, { children: e.tipo }),
                          (0, m.jsx)(`span`, {
                            className: `font-mono text-xs`,
                            children: e.message,
                          }),
                          (0, m.jsx)(_, {
                            entregueEm: e.entregueEm,
                            expiresAt: e.expiresAt,
                            resultado: e.resultado,
                            errorCode: e.errorCode,
                          }),
                        ],
                      },
                      e.commandId,
                    ),
                  ),
              }),
      }),
    ],
  });
}
function _({ entregueEm: e, expiresAt: t, resultado: n, errorCode: r }) {
  return n
    ? (0, m.jsxs)(c, { tom: n === `EXECUTED` ? `ok` : `ruim`, children: [n, r ? ` · ${r}` : ``] })
    : e
      ? (0, m.jsx)(c, { tom: `atencao`, children: `entregue, sem confirmacao` })
      : Date.parse(t) < Date.now()
        ? (0, m.jsx)(c, { tom: `ruim`, children: `expirou sem entrega` })
        : (0, m.jsx)(c, { tom: `atencao`, children: `aguardando o Gateway` });
}
function v({ executado: e, passagem: t, decisao: n }) {
  return t
    ? (0, m.jsxs)(c, { tom: `ok`, children: [`girou `, o(t)] })
    : n === `DENY`
      ? (0, m.jsx)(c, { children: `bloqueio mantido` })
      : e === !1
        ? (0, m.jsx)(c, { tom: `ruim`, children: `nao executado` })
        : e
          ? (0, m.jsx)(c, { tom: `atencao`, children: `liberou, sem giro` })
          : (0, m.jsx)(c, { children: `aguardando` });
}
function y({ gateway: e }) {
  let n = t(),
    [r, i] = (0, p.useState)(`LIBERADO`),
    a = !e.ultimoContatoEm || Date.now() - Date.parse(e.ultimoContatoEm) > 6e4;
  return (0, m.jsxs)(u, {
    titulo: `${e.gatewayName} · ${e.tenantName}`,
    descricao: `${e.machineName ?? `maquina desconhecida`} · versao ${e.version ?? `?`}`,
    acao: (0, m.jsx)(c, {
      tom: a ? `ruim` : l(e.status),
      children: a ? `SEM HEARTBEAT` : (e.status ?? `—`),
    }),
    children: [
      (0, m.jsxs)(`dl`, {
        className: `mb-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground`,
        children: [
          (0, m.jsxs)(`div`, {
            children: [
              (0, m.jsx)(`dt`, {
                className: `uppercase tracking-wide`,
                children: `Ultimo contato`,
              }),
              (0, m.jsx)(`dd`, {
                className: `font-mono text-foreground`,
                children: s(e.ultimoContatoEm),
              }),
            ],
          }),
          (0, m.jsxs)(`div`, {
            children: [
              (0, m.jsx)(`dt`, {
                className: `uppercase tracking-wide`,
                children: `Eventos na fila do Gateway`,
              }),
              (0, m.jsx)(`dd`, {
                className: `font-mono text-foreground`,
                children: e.pendingEvents ?? 0,
              }),
            ],
          }),
          (0, m.jsxs)(`div`, {
            className: `col-span-2`,
            children: [
              (0, m.jsx)(`dt`, { className: `uppercase tracking-wide`, children: `gatewayId` }),
              (0, m.jsx)(`dd`, {
                className: `font-mono text-[11px] break-all text-foreground`,
                children: e.gatewayId,
              }),
            ],
          }),
        ],
      }),
      e.dispositivos.length === 0
        ? (0, m.jsx)(`p`, {
            className: `text-sm text-muted-foreground`,
            children: `Nenhum equipamento reportado ainda. Ele aparece aqui no primeiro heartbeat ou na primeira validacao de acesso.`,
          })
        : (0, m.jsx)(`ul`, {
            className: `space-y-3`,
            children: e.dispositivos.map((t) =>
              (0, m.jsxs)(
                `li`,
                {
                  className: `rounded-md border border-border p-3`,
                  children: [
                    (0, m.jsxs)(`div`, {
                      className: `flex flex-wrap items-center justify-between gap-2`,
                      children: [
                        (0, m.jsx)(`span`, {
                          className: `font-mono text-xs break-all`,
                          children: t.deviceId,
                        }),
                        (0, m.jsx)(c, { tom: l(t.status), children: t.status }),
                      ],
                    }),
                    (0, m.jsxs)(`div`, {
                      className: `mt-3 flex flex-wrap items-center gap-2`,
                      children: [
                        (0, m.jsx)(`input`, {
                          value: r,
                          onChange: (e) => i(e.target.value.slice(0, 16)),
                          maxLength: 16,
                          className: `h-8 w-40 rounded-md border border-input bg-background px-2 font-mono text-xs`,
                          "aria-label": `Mensagem do display`,
                        }),
                        (0, m.jsx)(f, {
                          size: `sm`,
                          disabled: n.isPending,
                          onClick: () =>
                            n.mutate({
                              tipo: `UNLOCK`,
                              gatewayId: e.gatewayId,
                              deviceId: t.deviceId,
                              direction: `ENTRY`,
                              message: r,
                            }),
                          children: `Abrir catraca`,
                        }),
                        (0, m.jsx)(f, {
                          size: `sm`,
                          variant: `outline`,
                          disabled: n.isPending,
                          onClick: () =>
                            n.mutate({
                              tipo: `SHOW_MESSAGE`,
                              gatewayId: e.gatewayId,
                              deviceId: t.deviceId,
                              message: r,
                            }),
                          children: `So mostrar`,
                        }),
                        (0, m.jsx)(d, { linhas: [r] }),
                      ],
                    }),
                  ],
                },
                t.deviceId,
              ),
            ),
          }),
    ],
  });
}
export { g as component };
