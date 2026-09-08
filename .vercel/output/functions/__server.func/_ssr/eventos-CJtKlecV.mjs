import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as Etiqueta, o as horaCurta, r as Secao } from "./comuns-CAD4V6nc.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { r as usePainel } from "./api-cliente-sJe7czvi.mjs";
import { t as TIPOS_DE_EVENTO } from "./protocolo-0mx9tKXd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/eventos-CJtKlecV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
 * Trilha crua: tudo que o Gateway mandou, na ordem em que chegou.
 *
 * A tela existe porque, quando a integracao da errado, a primeira pergunta e sempre
 * "o que exatamente chegou?". Guardar o payload sem interpretacao e o que permite
 * responder isso sem ligar a captura de rede na academia.
 */
var TONS = {
  HEARTBEAT: "neutro",
  ACCESS_VALIDATE: "atencao",
  ACCESS_OUTCOME: "ok",
  PASSAGE_CONFIRMED: "ok",
  PASSAGE_EXPIRED: "atencao",
  DEVICE_STATUS_CHANGED: "atencao",
  COMMAND_RESULT: "neutro",
};
function Eventos() {
  const { data } = usePainel();
  const [filtro, setFiltro] = (0, import_react.useState)("TODOS");
  const [aberto, setAberto] = (0, import_react.useState)(null);
  const eventos = (data?.eventos ?? []).filter(
    (evento) => filtro === "TODOS" || evento.tipo === filtro,
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
    className: "mx-auto max-w-6xl space-y-4 px-4 py-6",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
        titulo: "Trilha de eventos",
        descricao:
          "Chegam por POST /internal/gateway/{gatewayId}/events, deduplicados por X-Idempotency-Key.",
        acao: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
          value: filtro,
          onChange: (evento) => setFiltro(evento.target.value),
          className: "h-8 rounded-md border border-input bg-background px-2 text-xs",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
              value: "TODOS",
              children: "todos os tipos",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
              value: "ACCESS_VALIDATE",
              children: "ACCESS_VALIDATE (validacao)",
            }),
            TIPOS_DE_EVENTO.map((tipo) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "option",
                {
                  value: tipo,
                  children: tipo,
                },
                tipo,
              ),
            ),
          ],
        }),
        children:
          eventos.length === 0
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "text-sm text-muted-foreground",
                children: "Nada registrado ainda com este filtro.",
              })
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
                className: "space-y-2",
                children: eventos.map((evento) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "li",
                    {
                      className: "rounded-md border border-border",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
                          type: "button",
                          onClick: () => setAberto(aberto === evento.id ? null : evento.id),
                          className:
                            "flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/50",
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "font-mono text-[11px] text-muted-foreground",
                              children: horaCurta(evento.recebidoEm),
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                              tom: TONS[evento.tipo] ?? "neutro",
                              children: evento.tipo,
                            }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                              className: "text-sm",
                              children: evento.resumo,
                            }),
                          ],
                        }),
                        aberto === evento.id
                          ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
                              className:
                                "overflow-x-auto border-t border-border bg-muted p-3 text-[11px] leading-4",
                              children: JSON.stringify(evento.payload, null, 2),
                            })
                          : null,
                      ],
                    },
                    evento.id,
                  ),
                ),
              }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
        className: "text-xs text-muted-foreground",
        children: [
          "O PIN completo nunca entra na trilha: a validacao registra apenas os tres ultimos digitos. O corpo de ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
            className: "font-mono",
            children: "/internal/access/validate",
          }),
          " e o unico lugar do sistema em que ele trafega inteiro.",
        ],
      }),
    ],
  });
}
//#endregion
export { Eventos as component };
