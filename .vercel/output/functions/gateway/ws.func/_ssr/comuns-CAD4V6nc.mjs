import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/comuns-CAD4V6nc.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Secao({ titulo, descricao, acao, children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
    className: cn("rounded-lg border border-border bg-card", className),
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className:
          "flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
                className: "text-sm font-semibold text-foreground",
                children: titulo,
              }),
              descricao
                ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                    className: "mt-0.5 text-xs text-muted-foreground",
                    children: descricao,
                  })
                : null,
            ],
          }),
          acao,
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className: "p-4",
        children,
      }),
    ],
  });
}
var CORES = {
  ok: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  ruim: "bg-red-500/12 text-red-700 dark:text-red-400 border-red-500/30",
  atencao: "bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/30",
  neutro: "bg-muted text-muted-foreground border-border",
};
function Etiqueta({ tom = "neutro", children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
    className: cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] leading-4",
      CORES[tom],
      className,
    ),
    children,
  });
}
/** ONLINE e verde; DEGRADED e amarelo; o resto e vermelho — a leitura de longe importa. */
function tomDoEstado(estado) {
  if (estado === "ONLINE") return "ok";
  if (estado === "DEGRADED" || estado === "CONNECTING") return "atencao";
  if (!estado || estado === "UNKNOWN") return "neutro";
  return "ruim";
}
/** O display real tem 2 linhas de 16 colunas e nao mostra acento. */
function Display({ linhas }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className:
      "inline-block rounded-md border border-emerald-900/40 bg-emerald-950 px-3 py-2 font-mono text-sm leading-5 text-emerald-300",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        children: (linhas[0] ?? "").padEnd(16, "\xA0").slice(0, 16),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        children: (linhas[1] ?? "").padEnd(16, "\xA0").slice(0, 16),
      }),
    ],
  });
}
function horaCurta(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function desdeAgora(iso) {
  if (!iso) return "sem contato";
  const segundos = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1e3));
  if (segundos < 60) return `ha ${segundos}s`;
  if (segundos < 3600) return `ha ${Math.round(segundos / 60)}min`;
  return `ha ${Math.round(segundos / 3600)}h`;
}
//#endregion
export {
  desdeAgora as a,
  cn as i,
  Etiqueta as n,
  horaCurta as o,
  Secao as r,
  tomDoEstado as s,
  Display as t,
};
