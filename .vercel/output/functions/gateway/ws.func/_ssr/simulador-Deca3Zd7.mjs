import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as Etiqueta, o as horaCurta, r as Secao, t as Display } from "./comuns-CAD4V6nc.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as Button } from "./button-CAMwN1Ey.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/simulador-Deca3Zd7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
 * Simulador da catraca — o Gateway, feito de `fetch`.
 *
 * Esta tela faz, do navegador, exatamente as chamadas que o Windows Service faz: troca
 * o codigo de instalacao pela credencial, autentica, valida um PIN e relata o desfecho.
 * Nada aqui e atalho interno; e o mesmo HTTP que a catraca de verdade usa, e cada troca
 * aparece crua no painel da direita.
 *
 * Serve para duas coisas: testar o sistema web antes de existir hardware, e mostrar a
 * quem for implementar outro servidor o que precisa responder.
 */
var CHAVE_CREDENCIAL = "topdata-simulador-credencial";
var CHAVE_DEVICE = "topdata-simulador-device";
var VERSAO = "0.1.0-simulador";
function lerLocal(chave) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}
function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch {}
}
function Simulador() {
  const [codigo, setCodigo] = (0, import_react.useState)("AB73-KL92");
  const [credencial, setCredencial] = (0, import_react.useState)(null);
  const [deviceId, setDeviceId] = (0, import_react.useState)("");
  const [pin, setPin] = (0, import_react.useState)("");
  const [display, setDisplay] = (0, import_react.useState)(["DIGITE SEU PIN"]);
  const [trocas, setTrocas] = (0, import_react.useState)([]);
  const [ocupado, setOcupado] = (0, import_react.useState)(false);
  const [girar, setGirar] = (0, import_react.useState)(true);
  const [falharNoEquipamento, setFalharNoEquipamento] = (0, import_react.useState)(false);
  const [ouvindoComandos, setOuvindoComandos] = (0, import_react.useState)(true);
  const token = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const guardada = lerLocal(CHAVE_CREDENCIAL);
    if (guardada) setCredencial(JSON.parse(guardada));
    const guardado = lerLocal(CHAVE_DEVICE) ?? crypto.randomUUID();
    gravarLocal(CHAVE_DEVICE, guardado);
    setDeviceId(guardado);
  }, []);
  const anotar = (0, import_react.useCallback)((troca) => {
    setTrocas((anteriores) =>
      [
        {
          ...troca,
          id: crypto.randomUUID(),
          hora: /* @__PURE__ */ new Date().toISOString(),
        },
        ...anteriores,
      ].slice(0, 40),
    );
  }, []);
  const chamar = (0, import_react.useCallback)(
    async (metodo, caminho, opcoes = {}) => {
      const resposta = await fetch(caminho, {
        method: metodo,
        headers: {
          ...(opcoes.corpo === void 0 ? {} : { "content-type": "application/json" }),
          ...(opcoes.token ? { authorization: `Bearer ${opcoes.token}` } : {}),
          ...opcoes.cabecalhos,
        },
        ...(opcoes.corpo === void 0 ? {} : { body: JSON.stringify(opcoes.corpo) }),
      });
      const dados = await resposta.json();
      anotar({
        metodo,
        caminho,
        status: resposta.status,
        ...(opcoes.corpo === void 0 ? {} : { requisicao: opcoes.corpo }),
        resposta: dados,
      });
      return {
        status: resposta.status,
        dados,
      };
    },
    [anotar],
  );
  /** Troca o codigo de instalacao pela credencial propria (secao 1 do contrato). */
  const provisionar = (0, import_react.useCallback)(async () => {
    setOcupado(true);
    try {
      const { status, dados } = await chamar("POST", "/gateway/provision", {
        corpo: {
          installationCode: codigo,
          machineName: "SIMULADOR-NAVEGADOR",
          gatewayVersion: VERSAO,
        },
      });
      if (status !== 200) {
        setDisplay(["FALHA PROVISION", String(status)]);
        return;
      }
      const nova = {
        gatewayId: dados.gatewayId,
        gatewaySecret: dados.gatewaySecret,
      };
      setCredencial(nova);
      gravarLocal(CHAVE_CREDENCIAL, JSON.stringify(nova));
      token.current = null;
      setDisplay(["PROVISIONADO", dados.tenantName ?? ""]);
    } finally {
      setOcupado(false);
    }
  }, [chamar, codigo]);
  /**
   * Devolve um token valido, autenticando quando preciso.
   *
   * O Gateway guarda o token e so renova perto do vencimento; repetir a autenticacao a
   * cada validacao dobraria a espera de quem esta parado na catraca.
   */
  const autenticar = (0, import_react.useCallback)(async () => {
    if (token.current) return token.current;
    if (!credencial) return null;
    const { status, dados } = await chamar("POST", "/gateway/auth", {
      corpo: {
        ...credencial,
        gatewayVersion: VERSAO,
      },
    });
    if (status !== 200) return null;
    token.current = dados.accessToken;
    return dados.accessToken;
  }, [chamar, credencial]);
  const enviarEvento = (0, import_react.useCallback)(
    async (tipo, payload) => {
      const atual = await autenticar();
      if (!atual || !credencial) return;
      await chamar("POST", `/internal/gateway/${credencial.gatewayId}/events`, {
        corpo: payload,
        token: atual,
        cabecalhos: {
          "x-gateway-event-type": tipo,
          "x-idempotency-key": `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      });
    },
    [autenticar, chamar, credencial],
  );
  /** O caminho critico inteiro: valida, mostra no display e relata o desfecho. */
  const apresentarCredencial = (0, import_react.useCallback)(async () => {
    if (!credencial || pin.length < 4) return;
    setOcupado(true);
    try {
      const atual = await autenticar();
      if (!atual) {
        setDisplay(["SEM SERVIDOR", "TENTE DE NOVO"]);
        return;
      }
      const eventId = crypto.randomUUID();
      const { status, dados } = await chamar("POST", "/internal/access/validate", {
        token: atual,
        corpo: {
          eventId,
          gatewayId: credencial.gatewayId,
          deviceId,
          credentialType: "PIN",
          credential: pin,
          direction: "ENTRY",
          occurredAt: /* @__PURE__ */ new Date().toISOString(),
        },
      });
      if (status !== 200) {
        setDisplay(["ACESSO NEGADO", "TENTE NOVAMENTE"]);
        await enviarEvento("ACCESS_OUTCOME", {
          eventId,
          deviceId,
          decision: "DENY",
          executed: false,
          reasonCode: "ACCESS_VALIDATION_TIMEOUT",
          errorCode: "ACCESS_VALIDATION_TIMEOUT",
          completedAt: /* @__PURE__ */ new Date().toISOString(),
        });
        return;
      }
      const liberou = dados.decision === "ALLOW";
      const executou = liberou && !falharNoEquipamento;
      setDisplay([dados.message, liberou ? "" : "ACESSO NEGADO"]);
      setPin("");
      await enviarEvento("ACCESS_OUTCOME", {
        eventId,
        deviceId,
        decision: dados.decision,
        executed: executou,
        reasonCode: dados.reasonCode,
        errorCode: liberou && !executou ? "DEVICE_ERROR" : null,
        completedAt: /* @__PURE__ */ new Date().toISOString(),
      });
      if (!executou) return;
      await enviarEvento(girar ? "PASSAGE_CONFIRMED" : "PASSAGE_EXPIRED", {
        deviceId,
        eventId,
        direction: "ENTRY",
        occurredAt: /* @__PURE__ */ new Date().toISOString(),
      });
    } finally {
      setOcupado(false);
    }
  }, [autenticar, chamar, credencial, deviceId, enviarEvento, falharNoEquipamento, girar, pin]);
  const enviarHeartbeat = (0, import_react.useCallback)(
    async (estado = "ONLINE") => {
      if (!credencial) return;
      await enviarEvento("HEARTBEAT", {
        gatewayId: credencial.gatewayId,
        version: VERSAO,
        status: estado === "OFFLINE" ? "DEGRADED" : estado,
        pendingEvents: 0,
        devices: [
          {
            deviceId,
            status: estado,
            firmwareVersion: "L7.06.12",
            lastEventAt: /* @__PURE__ */ new Date().toISOString(),
          },
        ],
      });
    },
    [credencial, deviceId, enviarEvento],
  );
  /**
   * Busca comandos pendentes.
   *
   * A catraca de verdade recebe isso pelo WebSocket. Como funcao serverless nao segura
   * conexao aberta, o simulador consulta a mesma fila por HTTP — o efeito visivel e o
   * mesmo, e o `expiresAt` continua sendo verificado antes de qualquer movimento.
   */
  const buscarComandos = (0, import_react.useCallback)(async () => {
    if (!credencial) return;
    const atual = await autenticar();
    if (!atual) return;
    const resposta = await fetch(`/internal/gateway/${credencial.gatewayId}/commands`, {
      headers: { authorization: `Bearer ${atual}` },
    });
    if (!resposta.ok) return;
    const { commands } = await resposta.json();
    if (commands.length === 0) return;
    anotar({
      metodo: "GET",
      caminho: `/internal/gateway/${credencial.gatewayId}/commands`,
      status: resposta.status,
      resposta: { commands },
    });
    for (const comando of commands) {
      const expirou = comando.expiresAt ? Date.parse(comando.expiresAt) < Date.now() : false;
      if (expirou || comando.deviceId !== deviceId) {
        await enviarEvento("COMMAND_RESULT", {
          commandId: comando.commandId,
          status: "FAILED",
          errorCode: expirou ? "COMMAND_EXPIRED" : "DEVICE_NOT_FOUND",
        });
        continue;
      }
      setDisplay([comando.message ?? "LIBERADO", comando.type === "UNLOCK" ? "PODE PASSAR" : ""]);
      await enviarEvento("COMMAND_RESULT", {
        commandId: comando.commandId,
        status: "EXECUTED",
      });
      if (comando.type === "UNLOCK" && girar)
        await enviarEvento("PASSAGE_CONFIRMED", {
          deviceId,
          eventId: comando.commandId,
          direction: comando.direction ?? "ENTRY",
          occurredAt: /* @__PURE__ */ new Date().toISOString(),
        });
    }
  }, [anotar, autenticar, credencial, deviceId, enviarEvento, girar]);
  (0, import_react.useEffect)(() => {
    if (!ouvindoComandos || !credencial) return;
    const relogio = setInterval(() => void buscarComandos(), 2e3);
    return () => clearInterval(relogio);
  }, [buscarComandos, credencial, ouvindoComandos]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
    className: "mx-auto max-w-6xl space-y-4 px-4 py-6",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "space-y-4",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secao, {
              titulo: "1. Provisionamento",
              descricao:
                "Codigo de instalacao vira credencial propria desta instalacao. Acontece uma vez.",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "flex flex-wrap items-end gap-2",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                      className: "text-xs text-muted-foreground",
                      children: [
                        "Codigo de instalacao",
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                          value: codigo,
                          onChange: (evento) => setCodigo(evento.target.value.toUpperCase()),
                          className:
                            "mt-1 block h-9 w-44 rounded-md border border-input bg-background px-2 font-mono text-sm",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      onClick: () => void provisionar(),
                      disabled: ocupado,
                      children: "Provisionar",
                    }),
                    credencial
                      ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                          variant: "outline",
                          onClick: () => {
                            setCredencial(null);
                            token.current = null;
                            gravarLocal(CHAVE_CREDENCIAL, "");
                          },
                          children: "Esquecer credencial",
                        })
                      : null,
                  ],
                }),
                credencial
                  ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
                      className: "mt-3 space-y-1 text-xs",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
                              className: "inline text-muted-foreground",
                              children: "gatewayId: ",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
                              className: "inline font-mono break-all",
                              children: credencial.gatewayId,
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
                              className: "inline text-muted-foreground",
                              children: "gatewaySecret: ",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
                              className: "inline font-mono",
                              children: [
                                credencial.gatewaySecret.slice(0, 6),
                                "… (guardado so neste navegador)",
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
                              className: "inline text-muted-foreground",
                              children: "deviceId: ",
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
                              className: "inline font-mono break-all",
                              children: deviceId,
                            }),
                          ],
                        }),
                      ],
                    })
                  : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                      className: "mt-3 text-xs text-muted-foreground",
                      children: [
                        "Ainda sem credencial. Sem provisionar, nenhuma outra chamada e aceita — e o equivalente ao ",
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                          className: "font-mono",
                          children: "NOT_PROVISIONED",
                        }),
                        " do Gateway.",
                      ],
                    }),
              ],
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secao, {
              titulo: "2. A catraca",
              descricao:
                "Digite um PIN e confirme. O display mostra o que a pessoa leria no equipamento.",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "flex flex-wrap items-start gap-4",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                          className: "grid w-44 grid-cols-3 gap-1.5",
                          children: [
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "*",
                            "0",
                            "#",
                          ].map((tecla) =>
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                              "button",
                              {
                                type: "button",
                                disabled: !credencial || ocupado,
                                onClick: () => {
                                  if (tecla === "*") return setPin("");
                                  if (tecla === "#") return void apresentarCredencial();
                                  setPin((atual) => (atual + tecla).slice(0, 10));
                                },
                                className:
                                  "h-11 rounded-md border border-border bg-background font-mono text-sm transition-colors hover:bg-accent disabled:opacity-40",
                                children: tecla === "*" ? "limpa" : tecla === "#" ? "OK" : tecla,
                              },
                              tecla,
                            ),
                          ),
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                          className: "mt-2 font-mono text-lg tracking-[0.3em]",
                          children: pin.replace(/./g, "•") || "······",
                        }),
                      ],
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                      className: "space-y-3",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Display, { linhas: display }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                          className: "flex items-center gap-2 text-xs text-muted-foreground",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                              type: "checkbox",
                              checked: girar,
                              onChange: (evento) => setGirar(evento.target.checked),
                            }),
                            "a pessoa gira a catraca (PASSAGE_CONFIRMED)",
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                          className: "flex items-center gap-2 text-xs text-muted-foreground",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                              type: "checkbox",
                              checked: falharNoEquipamento,
                              onChange: (evento) => setFalharNoEquipamento(evento.target.checked),
                            }),
                            "o equipamento recusa o comando (ALLOW com executed=false)",
                          ],
                        }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
                          className: "flex items-center gap-2 text-xs text-muted-foreground",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                              type: "checkbox",
                              checked: ouvindoComandos,
                              onChange: (evento) => setOuvindoComandos(evento.target.checked),
                            }),
                            "receber comandos do painel (UNLOCK / SHOW_MESSAGE)",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                  className: "mt-4 flex flex-wrap gap-2",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      size: "sm",
                      variant: "outline",
                      disabled: !credencial,
                      onClick: () => void enviarHeartbeat("ONLINE"),
                      children: "Heartbeat ONLINE",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      size: "sm",
                      variant: "outline",
                      disabled: !credencial,
                      onClick: () => void enviarHeartbeat("DEGRADED"),
                      children: "Heartbeat DEGRADED",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      size: "sm",
                      variant: "outline",
                      disabled: !credencial,
                      onClick: () => void enviarHeartbeat("OFFLINE"),
                      children: "Equipamento OFFLINE",
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                      size: "sm",
                      variant: "outline",
                      disabled: !credencial,
                      onClick: () => void buscarComandos(),
                      children: "Buscar comandos agora",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
          titulo: "Troca HTTP crua",
          descricao: "Exatamente o que o Windows Service envia e recebe — nada de atalho interno.",
          acao:
            trocas.length > 0
              ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setTrocas([]),
                  children: "limpar",
                })
              : void 0,
          children:
            trocas.length === 0
              ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Provisione e digite um PIN para ver as chamadas aparecerem aqui.",
                })
              : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
                  className: "space-y-3",
                  children: trocas.map((troca) =>
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                      "li",
                      {
                        className: "rounded-md border border-border p-3",
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                                tom:
                                  troca.status < 300
                                    ? "ok"
                                    : troca.status < 500
                                      ? "atencao"
                                      : "ruim",
                                children: troca.status,
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                                className: "font-mono text-xs",
                                children: [troca.metodo, " ", troca.caminho],
                              }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                                className: "ml-auto font-mono text-[11px] text-muted-foreground",
                                children: horaCurta(troca.hora),
                              }),
                            ],
                          }),
                          troca.requisicao === void 0
                            ? null
                            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
                                className:
                                  "mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-4",
                                children: JSON.stringify(troca.requisicao, null, 2),
                              }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
                            className:
                              "mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-4",
                            children: JSON.stringify(troca.resposta, null, 2),
                          }),
                        ],
                      },
                      troca.id,
                    ),
                  ),
                }),
        }),
      ],
    }),
  });
}
//#endregion
export { Simulador as component };
