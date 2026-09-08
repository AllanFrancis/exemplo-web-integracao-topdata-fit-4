import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as Etiqueta, r as Secao } from "./comuns-CAD4V6nc.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { r as usePainel } from "./api-cliente-sJe7czvi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/instalacao-C99aXtPp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Como apontar um Topdata Gateway de verdade para esta instalacao do sistema web. */
var ROTAS = [
  ["POST", "/gateway/provision", "Troca o codigo de instalacao pela credencial da instalacao."],
  ["POST", "/gateway/auth", "Credencial vira token de acesso (1 h)."],
  ["POST", "/internal/access/validate", "O caminho critico. Alguem esta parado na catraca."],
  ["POST", "/internal/gateway/{gatewayId}/events", "Fila duravel: heartbeat, desfechos, giros."],
  ["GET", "/gateway/ws", "WebSocket do contrato — indisponivel em serverless (501)."],
];
var MOTIVOS = [
  ["ACCESS_ALLOWED", "ALLOW", "Plano em dia."],
  ["CREDENTIAL_UNKNOWN", "DENY", "PIN nao esta no cadastro."],
  ["STUDENT_BLOCKED", "DENY", "Bloqueado na recepcao."],
  ["PLAN_EXPIRED", "DENY", "Plano vencido."],
  ["PASSBACK_BLOCKED", "DENY", "Mesma pessoa passando duas vezes seguidas."],
];
function Instalacao() {
  const { data } = usePainel(15e3);
  const [origem, setOrigem] = (0, import_react.useState)("https://seu-app.vercel.app");
  (0, import_react.useEffect)(() => setOrigem(window.location.origin), []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
    className: "mx-auto max-w-4xl space-y-4 px-4 py-6",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secao, {
        titulo: "1. Aponte o Gateway para este endereco",
        descricao: "Em %ProgramData%\\\\TopdataGateway\\\\config.json, na maquina da academia.",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
            className: "overflow-x-auto rounded-md bg-muted p-3 text-xs leading-5",
            children: `{
  "Server": {
    "baseUrl": "${origem}",
    "webSocketUrl": "",
    "heartbeatInterval": "00:00:30",
    "allowInvalidCertificates": false
  },
  "Standalone": {
    "mode": "Disabled"
  }
}`,
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
            className: "mt-3 text-sm text-muted-foreground",
            children: [
              "O Gateway monta os caminhos a partir de ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "baseUrl",
              }),
              ", entao ela deve apontar para a raiz — sem barra final e sem sufixo de API. Deixe",
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "webSocketUrl",
              }),
              " vazio: sem processo persistente, este exemplo nao completa o handshake, e o Gateway continua entregando tudo pela fila duravel.",
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
            className: "mt-2 text-sm text-muted-foreground",
            children: [
              "Com o ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "Standalone:Mode",
              }),
              " diferente de",
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "Disabled",
              }),
              ", o Gateway decide sozinho e nem chega a perguntar — util para testar a catraca sem servidor, e exatamente o que voce nao quer aqui.",
            ],
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Secao, {
        titulo: "2. Provisione",
        descricao:
          "Uma vez por instalacao. O codigo vira credencial e o Gateway a guarda cifrada por DPAPI.",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
            className: "text-sm text-muted-foreground",
            children: "Codigos aceitos por esta instalacao:",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
            className: "mt-2 flex flex-wrap gap-2",
            children: (data?.ambiente.codigosDeInstalacao ?? []).map((codigo) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Etiqueta,
                {
                  tom: "ok",
                  children: codigo,
                },
                codigo,
              ),
            ),
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
            className: "mt-3 text-sm text-muted-foreground",
            children: [
              "Configure-os em ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "font-mono text-xs",
                children: "CODIGOS_DE_INSTALACAO",
              }),
              ". O contrato pede que um codigo valha uma unica vez;",
              " ",
              data?.ambiente.reprovisionamentoPermitido
                ? "aqui o reprovisionamento esta liberado para facilitar a demonstracao — desligue com PERMITIR_REPROVISIONAMENTO=false."
                : "aqui o reprovisionamento esta desligado, como em producao.",
            ],
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
        titulo: "Rotas que o Gateway usa",
        descricao: "Espelho de docs/access-gateway-protocol.md.",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
          className: "w-full text-sm",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
            className: "divide-y divide-border",
            children: ROTAS.map(([metodo, caminho, nota]) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "tr",
                {
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                      className: "w-16 py-2 font-mono text-xs text-muted-foreground",
                      children: metodo,
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                      className: "py-2 pr-3 font-mono text-xs break-all",
                      children: caminho,
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                      className: "py-2 text-muted-foreground",
                      children: nota,
                    }),
                  ],
                },
                caminho,
              ),
            ),
          }),
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
        titulo: "Motivos que este servidor devolve",
        descricao:
          "reasonCode e opaco para o Gateway: ele registra em log e escolhe a mensagem, nunca decide por ele.",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
          className: "w-full text-sm",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
            className: "divide-y divide-border",
            children: MOTIVOS.map(([codigo, decisao, nota]) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "tr",
                {
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                      className: "py-2 pr-3 font-mono text-xs",
                      children: codigo,
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                      className: "py-2 pr-3",
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Etiqueta, {
                        tom: decisao === "ALLOW" ? "ok" : "ruim",
                        children: decisao,
                      }),
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
                      className: "py-2 text-muted-foreground",
                      children: nota,
                    }),
                  ],
                },
                codigo,
              ),
            ),
          }),
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Secao, {
        titulo: "3. Comandos para a catraca (opcional)",
        descricao: "A liberacao manual da recepcao so chega ao equipamento pelo WebSocket.",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
          className: "text-sm text-muted-foreground",
          children: [
            "Funcoes serverless nao seguram conexao aberta. Para ter o caminho de volta com um Gateway de verdade, rode a ponte em ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
              className: "font-mono text-xs",
              children: "ws-bridge/",
            }),
            " numa maquina da academia ou num servidor comum, e aponte",
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
              className: "font-mono text-xs",
              children: "webSocketUrl",
            }),
            " para ela. A ponte fala WSS com o Gateway e HTTPS com este sistema, sem nenhum segredo novo — ela apenas repassa o token que o proprio Gateway envia.",
          ],
        }),
      }),
    ],
  });
}
//#endregion
export { Instalacao as component };
