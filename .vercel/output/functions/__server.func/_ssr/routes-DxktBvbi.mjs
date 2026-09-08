import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import {
  a as desdeAgora,
  n as Etiqueta,
  o as horaCurta,
  r as Secao,
  s as tomDoEstado,
  t as Display,
} from "./comuns-CAD4V6nc.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as Button } from "./button-CAMwN1Ey.mjs";
import { r as usePainel, t as useEnvioDeComando } from "./api-cliente-sJe7czvi.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DxktBvbi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Painel da recepcao: o que os Gateways estao reportando, ao vivo. */
function Pagina({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
    className: "mx-auto max-w-6xl space-y-4 px-4 py-6",
    children,
  });
}
function Painel() {
  const { data, isLoading, error } = usePainel();
  if (isLoading)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagina, {
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "text-sm text-muted-foreground",
        children: "Carregando…",
      }),
    });
  if (error || !data)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagina, {
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
        className: "text-sm text-red-600",
        children: ["Falha ao carregar o painel: ", String(error)],
      }),
    });
  const acessos = data.acessos.slice(0, 12);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pagina, {
    children: [
      data.ambiente.armazenamento === "memoria"
        ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className:
              "rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
                children: "Armazenamento em memoria.",
              }),
              " Nao ha banco configurado: alunos, trilha e acessos vivem na instancia que atende a requisicao e somem quando ela recicla. Defina",
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "KV_REST_API_URL",
              }),
              " e",
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "KV_REST_API_TOKEN",
              }),
              " para persistir de verdade.",
            ],
          })
        : null,
      data.gateways.length === 0
        ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
            titulo: "Nenhum Gateway provisionado",
            descricao:
              "O primeiro passo e trocar o codigo de instalacao pela credencial da instalacao.",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
              className: "text-sm text-muted-foreground",
              children: [
                "Aponte o Gateway para este endereco em",
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                  className: "font-mono text-xs",
                  children: "config.json",
                }),
                " e provisione, ou abra o",
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                  to: "/simulador",
                  className: "font-medium text-foreground underline",
                  children: "simulador",
                }),
                " ",
                "para ver o fluxo inteiro sem hardware. As instrucoes estao em",
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
                  to: "/instalacao",
                  className: "font-medium text-foreground underline",
                  children: "Instalacao",
                }),
                ".",
              ],
            }),
          })
        : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "grid gap-4 md:grid-cols-2",
        children: data.gateways.map((gateway) =>
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            CartaoDoGateway,
            { gateway },
            gateway.gatewayId,
          ),
        ),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
        titulo: "Acessos recentes",
        descricao:
          "A decisao e nossa; girar a catraca e um fato fisico que so o equipamento confirma.",
        children:
          acessos.length === 0
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "text-sm text-muted-foreground",
                children: "Nada ainda. Use o simulador ou digite um PIN na catraca.",
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
                            children: "Hora",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                            className: "pb-2 pr-3 font-medium",
                            children: "Credencial",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                            className: "pb-2 pr-3 font-medium",
                            children: "Aluno",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                            className: "pb-2 pr-3 font-medium",
                            children: "Decisao",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                            className: "pb-2 pr-3 font-medium",
                            children: "Motivo",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                            className: "pb-2 pr-3 font-medium",
                            children: "Display",
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
                            className: "pb-2 font-medium",
                            children: "Desfecho",
                          }),
                        ],
                      }),
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
                      className: "divide-y divide-border",
                      children: acessos.map((acesso) =>
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "tr",
                          {
                            className: "align-middle",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2 pr-3 font-mono text-xs text-muted-foreground",
                                children: horaCurta(acesso.decididoEm),
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2 pr-3 font-mono text-xs",
                                children: acesso.credencialMascarada,
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2 pr-3",
                                children: acesso.alunoNome ?? "—",
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2 pr-3",
                                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                                  tom: acesso.decisao === "ALLOW" ? "ok" : "ruim",
                                  children: acesso.decisao,
                                }),
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2 pr-3 font-mono text-xs text-muted-foreground",
                                children: acesso.reasonCode,
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2 pr-3 font-mono text-xs",
                                children: acesso.mensagem,
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                                className: "py-2",
                                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desfecho, {
                                  executado: acesso.executado,
                                  passagem: acesso.passagemConfirmadaEm,
                                  decisao: acesso.decisao,
                                }),
                              }),
                            ],
                          },
                          acesso.eventId,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
        titulo: "Fila de comandos",
        descricao:
          "Comandos so chegam a catraca pelo WebSocket — em serverless, atraves da ponte ws-bridge/.",
        children:
          data.comandos.length === 0
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "text-sm text-muted-foreground",
                children: "Nenhum comando enviado nesta sessao.",
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
                className: "space-y-2 text-sm",
                children: data.comandos.slice(0, 8).map((comando) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "li",
                    {
                      className: "flex flex-wrap items-center gap-2",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                          className: "font-mono text-xs text-muted-foreground",
                          children: horaCurta(comando.criadoEm),
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                          children: comando.tipo,
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                          className: "font-mono text-xs",
                          children: comando.message,
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EstadoDoComando, {
                          entregueEm: comando.entregueEm,
                          expiresAt: comando.expiresAt,
                          resultado: comando.resultado,
                          errorCode: comando.errorCode,
                        }),
                      ],
                    },
                    comando.commandId,
                  ),
                ),
              }),
      }),
    ],
  });
}
function EstadoDoComando({ entregueEm, expiresAt, resultado, errorCode }) {
  if (resultado)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Etiqueta, {
      tom: resultado === "EXECUTED" ? "ok" : "ruim",
      children: [resultado, errorCode ? ` · ${errorCode}` : ""],
    });
  if (entregueEm)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
      tom: "atencao",
      children: "entregue, sem confirmacao",
    });
  if (Date.parse(expiresAt) < Date.now())
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
      tom: "ruim",
      children: "expirou sem entrega",
    });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
    tom: "atencao",
    children: "aguardando o Gateway",
  });
}
function Desfecho({ executado, passagem, decisao }) {
  if (passagem)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Etiqueta, {
      tom: "ok",
      children: ["girou ", horaCurta(passagem)],
    });
  if (decisao === "DENY")
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, { children: "bloqueio mantido" });
  if (executado === false)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
      tom: "ruim",
      children: "nao executado",
    });
  if (executado)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
      tom: "atencao",
      children: "liberou, sem giro",
    });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, { children: "aguardando" });
}
function CartaoDoGateway({ gateway }) {
  const enviar = useEnvioDeComando();
  const [mensagem, setMensagem] = (0, import_react.useState)("LIBERADO");
  const calado = !gateway.ultimoContatoEm || Date.now() - Date.parse(gateway.ultimoContatoEm) > 6e4;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secao, {
    titulo: `${gateway.gatewayName} · ${gateway.tenantName}`,
    descricao: `${gateway.machineName ?? "maquina desconhecida"} · versao ${gateway.version ?? "?"}`,
    acao: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
      tom: calado ? "ruim" : tomDoEstado(gateway.status),
      children: calado ? "SEM HEARTBEAT" : (gateway.status ?? "—"),
    }),
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
        className: "mb-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
                className: "uppercase tracking-wide",
                children: "Ultimo contato",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
                className: "font-mono text-foreground",
                children: desdeAgora(gateway.ultimoContatoEm),
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
                className: "uppercase tracking-wide",
                children: "Eventos na fila do Gateway",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
                className: "font-mono text-foreground",
                children: gateway.pendingEvents ?? 0,
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "col-span-2",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
                className: "uppercase tracking-wide",
                children: "gatewayId",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
                className: "font-mono text-[11px] break-all text-foreground",
                children: gateway.gatewayId,
              }),
            ],
          }),
        ],
      }),
      gateway.dispositivos.length === 0
        ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-sm text-muted-foreground",
            children:
              "Nenhum equipamento reportado ainda. Ele aparece aqui no primeiro heartbeat ou na primeira validacao de acesso.",
          })
        : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
            className: "space-y-3",
            children: gateway.dispositivos.map((dispositivo) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "li",
                {
                  className: "rounded-md border border-border p-3",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "flex flex-wrap items-center justify-between gap-2",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                          className: "font-mono text-xs break-all",
                          children: dispositivo.deviceId,
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                          tom: tomDoEstado(dispositivo.status),
                          children: dispositivo.status,
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "mt-3 flex flex-wrap items-center gap-2",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                          value: mensagem,
                          onChange: (evento) => setMensagem(evento.target.value.slice(0, 16)),
                          maxLength: 16,
                          className:
                            "h-8 w-40 rounded-md border border-input bg-background px-2 font-mono text-xs",
                          "aria-label": "Mensagem do display",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                          size: "sm",
                          disabled: enviar.isPending,
                          onClick: () =>
                            enviar.mutate({
                              tipo: "UNLOCK",
                              gatewayId: gateway.gatewayId,
                              deviceId: dispositivo.deviceId,
                              direction: "ENTRY",
                              message: mensagem,
                            }),
                          children: "Abrir catraca",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                          size: "sm",
                          variant: "outline",
                          disabled: enviar.isPending,
                          onClick: () =>
                            enviar.mutate({
                              tipo: "SHOW_MESSAGE",
                              gatewayId: gateway.gatewayId,
                              deviceId: dispositivo.deviceId,
                              message: mensagem,
                            }),
                          children: "So mostrar",
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Display, {
                          linhas: [mensagem],
                        }),
                      ],
                    }),
                  ],
                },
                dispositivo.deviceId,
              ),
            ),
          }),
    ],
  });
}
//#endregion
export { Painel as component };
