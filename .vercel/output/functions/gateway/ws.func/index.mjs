globalThis.__nitro_main__ = import.meta.url;
import {
  a as toEventHandler,
  i as defineLazyEventHandler,
  n as HTTPError,
  r as defineHandler,
  t as H3Core,
} from "./_libs/h3+rou3+srvx.mjs";
import { r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { t as require_functions } from "./_libs/vercel__functions.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) return mod.fetch(req);
      if (!promise) promise = loader().then((_mod) => (mod = _mod.default || _mod));
      return promise.then((mod) => mod.fetch(req));
    },
  };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = (m) =>
  function headersRouteRule(event) {
    for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
  };
//#endregion
//#region src/lib/protocolo.ts
var TIPOS_DE_EVENTO = [
  "HEARTBEAT",
  "ACCESS_OUTCOME",
  "DEVICE_STATUS_CHANGED",
  "PASSAGE_CONFIRMED",
  "PASSAGE_EXPIRED",
  "COMMAND_RESULT",
];
//#endregion
//#region src/server/armazenamento.ts
/**
 * Armazenamento do exemplo, com dois back-ends.
 *
 * Vercel executa cada requisicao numa funcao sem estado: o que fica so na memoria
 * some quando a instancia recicla. Para o exemplo continuar util nos dois cenarios,
 * a mesma interface atende memoria (dev e demonstracao) e Redis (Upstash / Vercel KV,
 * quando `KV_REST_API_URL` e `KV_REST_API_TOKEN` existem no ambiente).
 *
 * O Redis e falado pela API REST, com `fetch` — de proposito, para o exemplo nao
 * arrastar dependencia nenhuma e continuar legivel para quem for portar a integracao
 * para outra pilha.
 */
var url = process.env["KV_REST_API_URL"];
var token = process.env["KV_REST_API_TOKEN"];
var backendDeArmazenamento = url && token ? "redis" : "memoria";
var memoria = (globalThis["__topdataMemoria"] ??= /* @__PURE__ */ new Map());
async function redis(comando) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(comando),
  });
  if (!resposta.ok) throw new Error(`Redis respondeu ${resposta.status}`);
  const corpo = await resposta.json();
  if (corpo.error) throw new Error(corpo.error);
  return corpo.result;
}
async function ler(chave) {
  if (backendDeArmazenamento === "memoria") return memoria.get(chave) ?? null;
  const bruto = await redis(["GET", chave]);
  return bruto ? JSON.parse(bruto) : null;
}
async function gravar(chave, valor) {
  if (backendDeArmazenamento === "memoria") {
    memoria.set(chave, valor);
    return;
  }
  await redis(["SET", chave, JSON.stringify(valor)]);
}
/** Empilha no inicio da lista e corta o excedente: a trilha do exemplo e limitada. */
async function empilhar(chave, valor, limite) {
  if (backendDeArmazenamento === "memoria") {
    const lista = memoria.get(chave) ?? [];
    lista.unshift(valor);
    memoria.set(chave, lista.slice(0, limite));
    return;
  }
  await redis(["LPUSH", chave, JSON.stringify(valor)]);
  await redis(["LTRIM", chave, 0, limite - 1]);
}
//#endregion
//#region src/server/credenciais.ts
/**
 * Identidade da instalacao e token de acesso.
 *
 * O protocolo exige duas coisas do servidor (secao 1 do contrato): cada instalacao
 * recebe um segredo proprio — nunca uma chave compartilhada, que comprometeria todas
 * as academias de uma vez — e o codigo de instalacao nao se reutiliza.
 *
 * Aqui o segredo e *derivado* por HMAC a partir do `gatewayId`, em vez de sorteado e
 * guardado. E o que faz o exemplo funcionar sem banco de dados numa funcao serverless:
 * a verificacao recalcula o mesmo valor. Num sistema de verdade, sorteie um segredo,
 * guarde o hash dele e revogue quando precisar — o Gateway nao percebe diferenca.
 */
var codificador = new TextEncoder();
/** Em producao, defina `GATEWAY_SIGNING_SECRET`. O padrao existe para o demo subir. */
var segredoMestre = process.env["GATEWAY_SIGNING_SECRET"] ?? "exemplo-topdata-nao-use-em-producao";
async function chaveHmac() {
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(segredoMestre),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
}
async function assinar(mensagem) {
  const assinatura = await crypto.subtle.sign(
    "HMAC",
    await chaveHmac(),
    codificador.encode(mensagem),
  );
  return new Uint8Array(assinatura);
}
function paraBase64Url(bytes) {
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/**
 * Comparacao em tempo constante. Um `===` vazaria, pelo tempo de resposta, quantos
 * caracteres do segredo estao certos.
 */
function iguaisEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}
/** Devolve o `gatewayId` do token, ou `null` quando ele nao vale. */
async function gatewayIdDoToken(token) {
  if (!token) return null;
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const [cabecalho, payload, assinatura] = partes;
  if (!iguaisEmTempoConstante(paraBase64Url(await assinar(`${cabecalho}.${payload}`)), assinatura))
    return null;
  try {
    const conteudo = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (conteudo.exp * 1e3 < Date.now()) return null;
    return conteudo.sub;
  } catch {
    return null;
  }
}
/** Le o `Bearer` do header, sem assumir espacamento. */
function tokenDoHeader(request) {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [esquema, valor] = header.split(/\s+/, 2);
  return esquema?.toLowerCase() === "bearer" && valor ? valor : null;
}
//#endregion
//#region src/server/estado.ts
var CHAVE_GATEWAYS = "gateways";
var CHAVE_EVENTOS = "eventos";
var CHAVE_ACESSOS = "acessos";
var CHAVE_COMANDOS = "comandos";
async function lerGateways() {
  return (await ler(CHAVE_GATEWAYS)) ?? [];
}
async function salvarGateway(gateway) {
  await gravar(CHAVE_GATEWAYS, [
    gateway,
    ...(await lerGateways()).filter((item) => item.gatewayId !== gateway.gatewayId),
  ]);
}
/**
 * Atualiza o que o heartbeat traz. Os dispositivos sao *mesclados*, nunca substituidos:
 * um heartbeat parcial nao pode apagar da tela um equipamento que existe.
 */
async function registrarContato(gatewayId, dados) {
  const gateway = (await lerGateways()).find((item) => item.gatewayId === gatewayId);
  if (!gateway) return;
  const porId = new Map(gateway.dispositivos.map((d) => [d.deviceId, d]));
  for (const dispositivo of dados.dispositivos ?? [])
    porId.set(dispositivo.deviceId, {
      ...porId.get(dispositivo.deviceId),
      ...dispositivo,
    });
  await salvarGateway({
    ...gateway,
    ...(dados.version ? { version: dados.version } : {}),
    ...(dados.status ? { status: dados.status } : {}),
    ...(dados.pendingEvents === void 0 ? {} : { pendingEvents: dados.pendingEvents }),
    ultimoContatoEm: /* @__PURE__ */ new Date().toISOString(),
    dispositivos: [...porId.values()],
  });
}
/**
 * Um dispositivo aparece na tela na primeira vez que e citado, sem cadastro previo.
 * O `deviceId` nasce no `config.json` da instalacao — exigir cadastro antes seria
 * transformar um erro de digitacao numa catraca invisivel.
 */
async function garantirDispositivo(gatewayId, deviceId) {
  const gateway = (await lerGateways()).find((item) => item.gatewayId === gatewayId);
  if (!gateway || gateway.dispositivos.some((d) => d.deviceId === deviceId)) return;
  await salvarGateway({
    ...gateway,
    dispositivos: [
      ...gateway.dispositivos,
      {
        deviceId,
        status: "UNKNOWN",
      },
    ],
  });
}
async function registrarEvento(gatewayId, tipo, payload, resumo) {
  await empilhar(
    CHAVE_EVENTOS,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      gatewayId,
      tipo,
      recebidoEm: /* @__PURE__ */ new Date().toISOString(),
      payload,
      resumo,
    },
    200,
  );
}
async function lerAcessos() {
  return (await ler(CHAVE_ACESSOS)) ?? [];
}
/**
 * Completa um acesso ja decidido com o que so se sabe depois: se o comando foi mesmo
 * executado no equipamento e se a pessoa girou a catraca.
 */
async function complementarAcesso(eventId, dados) {
  const acessos = await lerAcessos();
  const indice = acessos.findIndex((acesso) => acesso.eventId === eventId);
  if (indice < 0) return;
  acessos[indice] = {
    ...acessos[indice],
    ...dados,
  };
  await gravar(CHAVE_ACESSOS, acessos);
}
async function lerComandos() {
  return (await ler(CHAVE_COMANDOS)) ?? [];
}
async function atualizarComando(commandId, dados) {
  const comandos = await lerComandos();
  const indice = comandos.findIndex((comando) => comando.commandId === commandId);
  if (indice < 0) return;
  comandos[indice] = {
    ...comandos[indice],
    ...dados,
  };
  await gravar(CHAVE_COMANDOS, comandos);
}
/**
 * Comandos ainda nao entregues e ainda dentro da validade.
 *
 * O `expiresAt` e verificado dos dois lados: o Gateway recusa o que chegou tarde, e
 * aqui nem chegamos a entregar. Uma liberacao atrasada abre a catraca para quem esta
 * na frente dela agora, que nao e quem a recepcao autorizou.
 */
async function comandosParaEntregar(gatewayId) {
  const agora = Date.now();
  return (await lerComandos()).filter(
    (comando) =>
      comando.gatewayId === gatewayId &&
      !comando.entregueEm &&
      Date.parse(comando.expiresAt) > agora,
  );
}
//#endregion
//#region src/server/recepcao.ts
/** Uma linha de texto por tipo — é o que a tela da recepção mostra. */
function resumirEvento(tipo, payload) {
  switch (tipo) {
    case "HEARTBEAT": {
      const dados = payload;
      return `${dados.status} · ${dados.devices?.length ?? 0} equipamento(s) · ${dados.pendingEvents ?? 0} pendente(s)`;
    }
    case "ACCESS_OUTCOME": {
      const dados = payload;
      return dados.decision === "ALLOW" && !dados.executed
        ? `ALLOW nao executado — ${dados.errorCode ?? "sem codigo"}`
        : `${dados.decision} executado=${dados.executed} — ${dados.reasonCode ?? "-"}`;
    }
    case "DEVICE_STATUS_CHANGED": {
      const dados = payload;
      return `Equipamento ${dados.deviceId.slice(0, 8)} agora ${dados.status}`;
    }
    case "PASSAGE_CONFIRMED":
      return "Catraca girou — passagem confirmada";
    case "PASSAGE_EXPIRED":
      return "Liberou e ninguem passou";
    case "COMMAND_RESULT": {
      const dados = payload;
      return `Comando ${dados.commandId.slice(0, 8)} ${dados.status}${dados.errorCode ? ` (${dados.errorCode})` : ""}`;
    }
    default:
      return tipo;
  }
}
async function aplicar(gatewayId, tipo, payload) {
  switch (tipo) {
    case "HEARTBEAT": {
      const dados = payload;
      await registrarContato(gatewayId, {
        version: dados.version,
        status: dados.status,
        pendingEvents: dados.pendingEvents,
        dispositivos: dados.devices ?? [],
      });
      return;
    }
    case "ACCESS_OUTCOME": {
      const dados = payload;
      await complementarAcesso(dados.eventId, { executado: dados.executed });
      await garantirDispositivo(gatewayId, dados.deviceId);
      return;
    }
    case "DEVICE_STATUS_CHANGED":
      await registrarContato(gatewayId, { dispositivos: [payload] });
      return;
    case "PASSAGE_CONFIRMED": {
      const dados = payload;
      if (dados.eventId)
        await complementarAcesso(dados.eventId, { passagemConfirmadaEm: dados.occurredAt });
      return;
    }
    case "COMMAND_RESULT": {
      const dados = payload;
      await atualizarComando(dados.commandId, {
        resultado: dados.status,
        errorCode: dados.errorCode ?? null,
      });
      return;
    }
    default:
      return;
  }
}
/** Aplica o efeito do evento e o registra na trilha, nessa ordem. */
async function processarEvento(gatewayId, tipo, payload) {
  await aplicar(gatewayId, tipo, payload);
  await registrarEvento(gatewayId, tipo, payload, resumirEvento(tipo, payload));
}
//#endregion
//#region src/server/ws-sessao.ts
/**
 * A ligação WSS do contrato (seção 4), sem depender de como o socket foi aberto.
 *
 * Existem dois jeitos de abrir esse socket neste projeto — o WebSocket nativo do Nitro,
 * que funciona no servidor local, e a API da Vercel, que é o que funciona publicado — e
 * os dois precisam se comportar igual. O que muda entre eles é só o aperto de mão; tudo
 * que acontece depois está aqui.
 */
/**
 * Cadência da consulta à fila de comandos.
 *
 * Uma conexão fica presa a uma instância da função, e um comando enfileirado por
 * `POST /api/comandos` cai em outra. Por isso o laço *consulta* o armazenamento em vez
 * de esperar um empurrão. Um segundo é o que a recepção percebe como "imediato";
 * diminuir não deixa a catraca mais rápida, só deixa a função acordada por mais tempo.
 */
var INTERVALO_DE_COMANDOS_MS = 1e3;
/**
 * Autentica pelo mesmo `Authorization: Bearer` que o Gateway usa no HTTP.
 *
 * Recusar no aperto de mão é melhor que aceitar e fechar depois: o Gateway trata falha
 * de conexão com recuo exponencial, enquanto uma ligação aceita e morta parece saudável
 * e não entrega nada.
 */
async function autenticarLigacao(request) {
  return gatewayIdDoToken(tokenDoHeader(request));
}
/** Vale um aviso barulhento: em memória o comando some sem erro nenhum. */
function avisarSeArmazenamentoVolatil() {
  if (backendDeArmazenamento === "memoria")
    console.warn(
      "[ws] armazenamento em memoria: comandos enfileirados em outra instancia nao serao entregues. Configure KV_REST_API_URL e KV_REST_API_TOKEN.",
    );
}
async function entregarPendentes(gatewayId, enviar) {
  try {
    const pendentes = await comandosParaEntregar(gatewayId);
    if (pendentes.length === 0) return;
    const entregueEm = /* @__PURE__ */ new Date().toISOString();
    for (const comando of pendentes) {
      const envelope = {
        type: comando.tipo,
        commandId: comando.commandId,
        gatewayId: comando.gatewayId,
        deviceId: comando.deviceId,
        ...(comando.direction ? { direction: comando.direction } : {}),
        message: comando.message,
        expiresAt: comando.expiresAt,
      };
      enviar(JSON.stringify(envelope));
      await atualizarComando(comando.commandId, { entregueEm });
    }
  } catch (erro) {
    console.error("[ws] falha ao consultar comandos:", erro);
  }
}
/**
 * Começa a entregar comandos e devolve a função que encerra o laço.
 *
 * A primeira entrega é imediata: depois de uma reconexão, o que ficou na fila enquanto
 * a ligação estava fora precisa sair agora, não no próximo tique.
 */
function iniciarEntregaDeComandos(gatewayId, enviar) {
  entregarPendentes(gatewayId, enviar);
  const relogio = setInterval(
    () => void entregarPendentes(gatewayId, enviar),
    INTERVALO_DE_COMANDOS_MS,
  );
  return () => clearInterval(relogio);
}
/** Trata uma mensagem vinda do Gateway: heartbeat, desfecho, giro, resultado. */
async function receberDoGateway(gatewayId, texto) {
  let envelope;
  try {
    envelope = JSON.parse(texto);
  } catch {
    console.warn("[ws] mensagem ilegivel do Gateway; ignorando");
    return;
  }
  if (!TIPOS_DE_EVENTO.includes(envelope.type)) {
    console.warn(`[ws] tipo desconhecido: ${envelope.type}`);
    return;
  }
  await processarEvento(gatewayId, envelope.type, envelope.payload);
}
//#endregion
//#region src/server/ws-vercel.ts
var import_functions = require_functions();
var ws_vercel_default = defineHandler(async (event) => {
  const request = event.req;
  const gatewayId = await autenticarLigacao(request);
  if (!gatewayId) return new Response("Token ausente, invalido ou expirado.", { status: 401 });
  return (0, import_functions.experimental_upgradeWebSocket)((ws) => {
    console.log(`[ws] gateway ${gatewayId} conectado`);
    avisarSeArmazenamentoVolatil();
    const encerrar = iniciarEntregaDeComandos(gatewayId, (mensagem) => ws.send(mensagem));
    ws.on("message", (dados) => {
      receberDoGateway(gatewayId, dados.toString());
    });
    ws.on("close", () => {
      encerrar();
      console.log(`[ws] gateway ${gatewayId} desconectado`);
    });
    ws.on("error", (erro) => {
      encerrar();
      console.error(`[ws] erro na ligacao com ${gatewayId}:`, erro);
    });
  });
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [
    {
      name: "headers",
      route: "/assets/**",
      handler: headers,
      options: { "cache-control": "public, max-age=31536000, immutable" },
    },
  ];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/");
    if (s.length > 1) {
      if (s[1] === "assets")
        r.unshift({
          data: $0,
          params: { _: s.slice(2).join("/") },
        });
    }
    return r;
  };
})();
var _lazy_Zn5hrK = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
  const $0 = {
      route: "/gateway/ws",
      handler: toEventHandler(ws_vercel_default),
    },
    $1 = {
      route: "/**",
      handler: _lazy_Zn5hrK,
    };
  return (m, p) => {
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    if (p === "/gateway/ws") return { data: $0 };
    let s = p.split("/");
    s.length;
    return {
      data: $1,
      params: { _: s.slice(1).join("/") },
    };
  };
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(
    typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2),
    res,
  );
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL))
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` }),
      };
  }
  const headers = new Headers(unhandled ? {} : error.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return {
    status,
    statusText,
    headers,
    body: {
      error: true,
      ...(unhandled
        ? {
            status,
            unhandled: true,
          }
        : typeof error.toJSON === "function"
          ? error.toJSON()
          : {
              status,
              statusText,
              message: error.message,
            }),
    },
  };
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
  for (const handler of errorHandlers)
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) return response;
    } catch (error) {
      console.error(error);
    }
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors)
        errors.push({
          error,
          context: errorCtx,
        });
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return error_handler_default(error, event);
    },
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError,
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
    if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
    return middleware;
  };
  return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) return instance;
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) return { routeRuleMiddleware: [] };
  const routeRules = {};
  for (const layer of m)
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object")
          currentRule.options = {
            ...currentRule.options,
            ...rule.options,
          };
        else currentRule.options = rule.options;
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params,
        };
      } else if (rule.options !== false)
        routeRules[rule.name] = {
          ...rule,
          params: layer.params,
        };
    }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort(
    (a, b) => (a.handler?.order || 0) - (b.handler?.order || 0),
  );
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) continue;
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware,
  };
}
//#endregion
//#region node_modules/nitro/dist/presets/vercel/runtime/isr.mjs
var ISR_URL_PARAM = "__isr_route";
function isrRouteRewrite(reqUrl, xNowRouteMatches) {
  if (xNowRouteMatches) {
    const isrURL = new URLSearchParams(xNowRouteMatches).get(ISR_URL_PARAM);
    if (isrURL) return [decodeURIComponent(isrURL), ""];
  } else {
    const queryIndex = reqUrl.indexOf("?");
    if (queryIndex !== -1) {
      const params = new URLSearchParams(reqUrl.slice(queryIndex + 1));
      const isrURL = params.get(ISR_URL_PARAM);
      if (isrURL) {
        params.delete(ISR_URL_PARAM);
        return [decodeURIComponent(isrURL), params.toString()];
      }
    }
  }
}
//#endregion
//#region node_modules/nitro/dist/presets/vercel/runtime/vercel.web.mjs
var nitroApp = useNitroApp();
var vercel_web_default = {
  fetch(req, context) {
    const isrURL = isrRouteRewrite(req.url, req.headers.get("x-now-route-matches"));
    if (isrURL) {
      const { routeRules } = getRouteRules("", isrURL[0]);
      if (routeRules?.isr)
        req = new Request(
          new URL(isrURL[0] + (isrURL[1] ? `?${isrURL[1]}` : ""), req.url).href,
          req,
        );
    }
    req.runtime ??= { name: "vercel" };
    req.runtime.vercel = { context };
    let ip;
    Object.defineProperty(req, "ip", {
      get() {
        const h = req.headers.get("x-forwarded-for");
        return (ip ??= h?.split(",").shift()?.trim());
      },
    });
    req.waitUntil = context?.waitUntil;
    return nitroApp.fetch(req);
  },
};
//#endregion
export { vercel_web_default as default };
