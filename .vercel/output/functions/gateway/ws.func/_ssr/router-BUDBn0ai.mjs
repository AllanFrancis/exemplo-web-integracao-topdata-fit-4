import {
  a as require_jsx_runtime,
  r as QueryClientProvider,
} from "../_libs/react+tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import {
  n as mascararCredencial,
  r as paraDisplay,
  t as TIPOS_DE_EVENTO,
} from "./protocolo-0mx9tKXd.mjs";
import {
  c as HeadContent,
  d as Outlet,
  f as lazyRouteComponent,
  g as useRouter,
  h as Link,
  m as createRootRouteWithContext,
  p as createFileRoute,
  s as Scripts,
  u as createRouter,
} from "../_libs/@tanstack/react-router+[...].mjs";
import {
  a as objectType,
  i as literalType,
  n as discriminatedUnionType,
  o as stringType,
  r as enumType,
  t as booleanType,
} from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BUDBn0ai.js
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BxNIzRUY.css";
var PAGINAS = [
  {
    para: "/",
    titulo: "Painel",
  },
  {
    para: "/simulador",
    titulo: "Simulador",
  },
  {
    para: "/alunos",
    titulo: "Alunos",
  },
  {
    para: "/eventos",
    titulo: "Trilha",
  },
  {
    para: "/instalacao",
    titulo: "Instalacao",
  },
];
function Navegacao() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
    className: "border-b border-border bg-card",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
          className: "text-sm font-semibold tracking-tight text-foreground",
          children: [
            "Topdata Gateway ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "text-muted-foreground",
              children: "· sistema web de exemplo",
            }),
          ],
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
          className: "flex flex-wrap gap-1",
          children: PAGINAS.map((pagina) =>
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Link,
              {
                to: pagina.para,
                className:
                  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                activeProps: { className: "bg-accent text-foreground" },
                activeOptions: { exact: pagina.para === "/" },
                children: pagina.titulo,
              },
              pagina.para,
            ),
          ),
        }),
      ],
    }),
  });
}
function NotFoundComponent() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
          className: "text-7xl font-bold text-foreground",
          children: "404",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
          className: "mt-4 text-xl font-semibold text-foreground",
          children: "Page not found",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "The page you're looking for doesn't exist or has been moved.",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
          className: "mt-6",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
            to: "/",
            className:
              "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            children: "Go home",
          }),
        }),
      ],
    }),
  });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "flex min-h-screen items-center justify-center bg-background px-4",
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
          className: "text-xl font-semibold tracking-tight text-foreground",
          children: "This page didn't load",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "Something went wrong on our end. You can try refreshing or head back home.",
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "mt-6 flex flex-wrap justify-center gap-2",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
              onClick: () => {
                router.invalidate();
                reset();
              },
              className:
                "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              children: "Try again",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
              href: "/",
              className:
                "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              children: "Go home",
            }),
          ],
        }),
      ],
    }),
  });
}
var Route$13 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Sistema web — integracao Topdata Gateway" },
      {
        name: "description",
        content:
          "Exemplo de referencia do lado servidor da integracao com a catraca Topdata FIT 4.",
      },
      {
        property: "og:title",
        content: "Sistema web — integracao Topdata Gateway",
      },
      {
        property: "og:description",
        content:
          "Exemplo de referencia do lado servidor da integracao com a catraca Topdata FIT 4.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: styles_default,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
    lang: "pt-BR",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", {
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
        children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})],
      }),
    ],
  });
}
function RootComponent() {
  const { queryClient } = Route$13.useRouteContext();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
    client: queryClient,
    children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
      className: "min-h-screen bg-background",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navegacao, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
      ],
    }),
  });
}
/** Painel da recepcao: o que os Gateways estao reportando, ao vivo. */
var $$splitComponentImporter$4 = () => import("./routes-DxktBvbi.mjs");
var Route$12 = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Painel — integracao Topdata Gateway" }] }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
});
/**
 * Cadastro de alunos — o lado que o Gateway nunca ve.
 *
 * Cada campo daqui existe para produzir um `reasonCode` diferente na catraca. Trocar
 * este cadastro pelo sistema de mensalidade de verdade nao muda uma linha do protocolo.
 */
var $$splitComponentImporter$3 = () => import("./alunos-C9IPF2T_.mjs");
var Route$11 = createFileRoute("/alunos")({
  head: () => ({ meta: [{ title: "Alunos — integracao Topdata Gateway" }] }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
});
/**
 * Trilha crua: tudo que o Gateway mandou, na ordem em que chegou.
 *
 * A tela existe porque, quando a integracao da errado, a primeira pergunta e sempre
 * "o que exatamente chegou?". Guardar o payload sem interpretacao e o que permite
 * responder isso sem ligar a captura de rede na academia.
 */
var $$splitComponentImporter$2 = () => import("./eventos-CJtKlecV.mjs");
var Route$10 = createFileRoute("/eventos")({
  head: () => ({ meta: [{ title: "Trilha de eventos — Topdata Gateway" }] }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component"),
});
/** Como apontar um Topdata Gateway de verdade para esta instalacao do sistema web. */
var $$splitComponentImporter$1 = () => import("./instalacao-C99aXtPp.mjs");
var Route$9 = createFileRoute("/instalacao")({
  head: () => ({ meta: [{ title: "Instalacao — integracao Topdata Gateway" }] }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
});
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
var $$splitComponentImporter = () => import("./simulador-Deca3Zd7.mjs");
var Route$8 = createFileRoute("/simulador")({
  head: () => ({ meta: [{ title: "Simulador da catraca — Topdata Gateway" }] }),
  component: lazyRouteComponent($$splitComponentImporter, "component"),
});
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
/**
 * Grava somente se a chave ainda nao existe. Devolve `true` quando a gravacao
 * aconteceu — e o que sustenta o codigo de instalacao de uso unico e a deduplicacao
 * por `X-Idempotency-Key`.
 */
async function gravarSeAusente(chave, valor, validadeSegundos) {
  if (backendDeArmazenamento === "memoria") {
    if (memoria.has(chave)) return false;
    memoria.set(chave, valor);
    return true;
  }
  const comando = ["SET", chave, JSON.stringify(valor), "NX"];
  if (validadeSegundos) comando.push("EX", validadeSegundos);
  return (await redis(comando)) === "OK";
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
async function listar(chave, limite) {
  if (backendDeArmazenamento === "memoria") return (memoria.get(chave) ?? []).slice(0, limite);
  return (await redis(["LRANGE", chave, 0, limite - 1])).map((item) => JSON.parse(item));
}
/**
 * O lado do negocio: alunos, planos e a decisao de acesso.
 *
 * Nada daqui atravessa a fronteira do protocolo. O Gateway nunca sabe o que e um
 * plano — ele so recebe ALLOW ou DENY e uma mensagem de 16 colunas. Trocar as regras
 * abaixo por consulta a mensalidade, catraca de personal ou horario de turma nao muda
 * uma linha do que o Gateway espera.
 */
var CHAVE_ALUNOS = "alunos";
/** Base de demonstracao. Cobre os quatro desfechos que a recepcao precisa ver. */
var ALUNOS_INICIAIS = [
  {
    id: "a1",
    nome: "Joao da Silva",
    pin: "583921",
    planoValidoAte: dataRelativa(90),
    bloqueado: false,
    observacao: "Plano em dia — libera.",
  },
  {
    id: "a2",
    nome: "Maria Souza",
    pin: "471002",
    planoValidoAte: dataRelativa(-3),
    bloqueado: false,
    observacao: "Plano vencido — nega com PLAN_EXPIRED.",
  },
  {
    id: "a3",
    nome: "Carlos Pereira",
    pin: "902113",
    planoValidoAte: dataRelativa(30),
    bloqueado: true,
    observacao: "Bloqueado na recepcao — nega mesmo com plano valido.",
  },
  {
    id: "a4",
    nome: "Ana Lima",
    pin: "310945",
    planoValidoAte: dataRelativa(1),
    bloqueado: false,
    observacao: "Vence amanha — libera e avisa no display.",
  },
];
function dataRelativa(dias) {
  const data = /* @__PURE__ */ new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}
async function lerAlunos() {
  const guardados = await ler(CHAVE_ALUNOS);
  if (guardados) return guardados;
  await gravar(CHAVE_ALUNOS, ALUNOS_INICIAIS);
  return ALUNOS_INICIAIS;
}
async function gravarAlunos(alunos) {
  await gravar(CHAVE_ALUNOS, alunos);
}
async function restaurarAlunosIniciais() {
  await gravar(CHAVE_ALUNOS, ALUNOS_INICIAIS);
  return ALUNOS_INICIAIS;
}
/** Janela do anti-passback: duas passagens seguidas do mesmo PIN sao a mesma pessoa. */
var SEGUNDOS_ANTIPASSBACK = 10;
/**
 * Responde a unica pergunta que o Gateway faz: esta credencial pode entrar?
 *
 * A ordem importa. Bloqueio manual vem antes do plano porque quem bloqueou na recepcao
 * precisa ver a negacao mesmo que a mensalidade esteja paga; e o anti-passback vem por
 * ultimo para nao esconder um motivo de verdade atras de "aguarde".
 */
function decidir(alunos, credencial, direcao, acessosRecentes, agora = /* @__PURE__ */ new Date()) {
  const aluno = alunos.find((candidato) => candidato.pin === credencial);
  if (!aluno)
    return {
      decisao: "DENY",
      reasonCode: "CREDENTIAL_UNKNOWN",
      mensagem: paraDisplay("NAO CADASTRADO"),
    };
  if (aluno.bloqueado)
    return {
      decisao: "DENY",
      reasonCode: "STUDENT_BLOCKED",
      mensagem: paraDisplay("PROCURE RECEPCAO"),
      aluno,
    };
  if (aluno.planoValidoAte < agora.toISOString().slice(0, 10))
    return {
      decisao: "DENY",
      reasonCode: "PLAN_EXPIRED",
      mensagem: paraDisplay("PLANO VENCIDO"),
      aluno,
    };
  if (direcao !== "EXIT") {
    if (
      acessosRecentes.find(
        (acesso) =>
          acesso.alunoId === aluno.id &&
          acesso.decisao === "ALLOW" &&
          agora.getTime() - Date.parse(acesso.decididoEm) < SEGUNDOS_ANTIPASSBACK * 1e3,
      )
    )
      return {
        decisao: "DENY",
        reasonCode: "PASSBACK_BLOCKED",
        mensagem: paraDisplay("AGUARDE UM POUCO"),
        aluno,
      };
  }
  const diasRestantes = Math.ceil(
    (Date.parse(`${aluno.planoValidoAte}T23:59:59Z`) - agora.getTime()) / 864e5,
  );
  return {
    decisao: "ALLOW",
    reasonCode: "ACCESS_ALLOWED",
    mensagem: paraDisplay(
      diasRestantes <= 3 ? `VENCE EM ${diasRestantes}D` : `OLA ${aluno.nome.split(" ")[0] ?? ""}`,
    ),
    aluno,
  };
}
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
function textoParaBase64Url(texto) {
  return paraBase64Url(codificador.encode(texto));
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
/** UUID derivado do codigo de instalacao: reprovisionar devolve a mesma identidade. */
async function gatewayIdDoCodigo(codigo) {
  const digest = paraBase64Url(await assinar(`gateway-id:${codigo.trim().toUpperCase()}`));
  const hex = Array.from(codificador.encode(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}
async function segredoDoGateway(gatewayId) {
  return paraBase64Url(await assinar(`gateway-secret:${gatewayId}`));
}
async function segredoConfere(gatewayId, segredo) {
  return iguaisEmTempoConstante(await segredoDoGateway(gatewayId), segredo);
}
var VALIDADE_DO_TOKEN_EM_SEGUNDOS = 3600;
/**
 * JWT HS256 montado a mao, com Web Crypto.
 *
 * O contrato deixa o formato em aberto (secao 8). JWT foi escolhido porque o Gateway
 * so repassa a string no header `Authorization` — ele nunca abre o token — e porque
 * um token auto-contido dispensa consultar armazenamento a cada validacao de acesso,
 * que e justamente o caminho onde alguem esta parado na catraca esperando.
 */
async function emitirToken(gatewayId) {
  const agora = Math.floor(Date.now() / 1e3);
  const cabecalho = textoParaBase64Url(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    }),
  );
  const payload = textoParaBase64Url(
    JSON.stringify({
      sub: gatewayId,
      iss: "topdata-exemplo-web",
      iat: agora,
      exp: agora + VALIDADE_DO_TOKEN_EM_SEGUNDOS,
    }),
  );
  return `${cabecalho}.${payload}.${paraBase64Url(await assinar(`${cabecalho}.${payload}`))}`;
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
function json(corpo, status = 200, cabecalhos) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...cabecalhos,
    },
  });
}
/**
 * Erro em formato estavel. O Gateway so olha o status — ele registra o corpo em log
 * e segue — mas quem esta depurando a integracao olha, e um `{"error":...}` legivel
 * economiza uma sessao de captura de rede.
 */
function erro(status, codigo, detalhe) {
  return json(
    {
      error: codigo,
      ...(detalhe ? { detail: detalhe } : {}),
    },
    status,
  );
}
/** Le e valida o corpo JSON. Corpo invalido e 400, nunca uma excecao 500. */
async function lerCorpo(request, schema) {
  let bruto;
  try {
    bruto = await request.json();
  } catch {
    return {
      ok: false,
      resposta: erro(400, "INVALID_JSON", "Corpo nao e JSON valido."),
    };
  }
  const resultado = schema.safeParse(bruto);
  if (!resultado.success)
    return {
      ok: false,
      resposta: erro(
        400,
        "INVALID_PAYLOAD",
        resultado.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      ),
    };
  return {
    ok: true,
    dados: resultado.data,
  };
}
/**
 * Exige um token valido e devolve o `gatewayId` que ele carrega.
 *
 * O 401 aqui nao e apenas correcao formal: o Gateway trata esse status renovando o
 * token e repetindo a chamada uma unica vez. Responder 403 ou 500 no lugar dele
 * transformaria um token vencido numa negacao de acesso na catraca.
 */
async function autenticar(request) {
  const gatewayId = await gatewayIdDoToken(tokenDoHeader(request));
  return gatewayId
    ? {
        ok: true,
        gatewayId,
      }
    : {
        ok: false,
        resposta: erro(401, "UNAUTHORIZED", "Token ausente, invalido ou expirado."),
      };
}
/** `POST /api/alunos` — cadastro do exemplo. Fora do contrato com o Gateway. */
var aluno = objectType({
  id: stringType().min(1),
  nome: stringType().min(1),
  pin: stringType().regex(/^\d{4,10}$/, "PIN deve ter de 4 a 10 digitos"),
  planoValidoAte: stringType().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato aaaa-mm-dd"),
  bloqueado: booleanType(),
  observacao: stringType().optional(),
});
var schema$4 = discriminatedUnionType("acao", [
  objectType({
    acao: literalType("salvar"),
    aluno,
  }),
  objectType({
    acao: literalType("remover"),
    id: stringType().min(1),
  }),
  objectType({ acao: literalType("restaurar") }),
]);
var Route$7 = createFileRoute("/api/alunos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema$4);
        if (!corpo.ok) return corpo.resposta;
        const pedido = corpo.dados;
        if (pedido.acao === "restaurar") return json({ alunos: await restaurarAlunosIniciais() });
        const alunos = await lerAlunos();
        if (pedido.acao === "remover") {
          const restantes = alunos.filter((item) => item.id !== pedido.id);
          await gravarAlunos(restantes);
          return json({ alunos: restantes });
        }
        const novo = pedido.aluno;
        if (alunos.some((item) => item.pin === novo.pin && item.id !== novo.id))
          return json(
            {
              error: "PIN_DUPLICADO",
              detail: "Ja existe um aluno com este PIN.",
            },
            409,
          );
        const atualizados = alunos.some((item) => item.id === novo.id)
          ? alunos.map((item) => (item.id === novo.id ? novo : item))
          : [...alunos, novo];
        await gravarAlunos(atualizados);
        return json({ alunos: atualizados });
      },
    },
  },
});
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
async function lerEventos(limite = 200) {
  return listar(CHAVE_EVENTOS, limite);
}
async function lerAcessos() {
  return (await ler(CHAVE_ACESSOS)) ?? [];
}
async function registrarAcesso(acesso) {
  await gravar(CHAVE_ACESSOS, [acesso, ...(await lerAcessos())].slice(0, 100));
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
async function enfileirarComando(comando) {
  await gravar(CHAVE_COMANDOS, [comando, ...(await lerComandos())].slice(0, 50));
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
/**
 * `POST /api/comandos` — a recepcao mandando a catraca abrir.
 *
 * O comando entra numa fila e so vira movimento fisico quando o Gateway o recebe pelo
 * WebSocket. O `expiresAt` curto e o que impede o pior caso: um comando represado e
 * entregue minutos depois liberaria a catraca para quem estiver na frente dela naquele
 * momento, que nao e quem a recepcao autorizou.
 */
var SEGUNDOS_DE_VALIDADE = 30;
var schema$3 = objectType({
  tipo: enumType(["UNLOCK", "SHOW_MESSAGE"]),
  gatewayId: stringType().uuid(),
  deviceId: stringType().uuid(),
  direction: enumType(["ENTRY", "EXIT", "BOTH"]).optional(),
  message: stringType().min(1).max(64),
});
var Route$6 = createFileRoute("/api/comandos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema$3);
        if (!corpo.ok) return corpo.resposta;
        const agora = /* @__PURE__ */ new Date();
        const comando = {
          commandId: crypto.randomUUID(),
          gatewayId: corpo.dados.gatewayId,
          deviceId: corpo.dados.deviceId,
          tipo: corpo.dados.tipo,
          ...(corpo.dados.direction ? { direction: corpo.dados.direction } : {}),
          message: paraDisplay(corpo.dados.message),
          criadoEm: agora.toISOString(),
          expiresAt: new Date(agora.getTime() + SEGUNDOS_DE_VALIDADE * 1e3).toISOString(),
        };
        await enfileirarComando(comando);
        return json({ comando });
      },
    },
  },
});
/**
 * Codigos de instalacao — o unico segredo que uma pessoa digita.
 *
 * O contrato exige que o codigo nao se reutilize: ele vale uma vez, vira credencial da
 * instalacao e morre. No exemplo isso e relaxavel por variavel de ambiente, porque uma
 * demonstracao precisa poder repetir o provisionamento; num sistema de verdade,
 * `PERMITIR_REPROVISIONAMENTO` nao deveria existir.
 */
function codigosDeInstalacao() {
  return (process.env["CODIGOS_DE_INSTALACAO"] ?? "AB73-KL92,DEMO-0001")
    .split(",")
    .map((codigo) => codigo.trim().toUpperCase())
    .filter(Boolean);
}
function permiteReprovisionamento() {
  return (process.env["PERMITIR_REPROVISIONAMENTO"] ?? "true").toLowerCase() !== "false";
}
function codigoEhValido(codigo) {
  return codigosDeInstalacao().includes(codigo.trim().toUpperCase());
}
/**
 * Marca o codigo como usado. Devolve `false` quando ele ja tinha sido trocado antes e
 * o reprovisionamento esta desligado.
 */
async function consumirCodigo(codigo, uso) {
  const chave = `codigo:${codigo.trim().toUpperCase()}`;
  if (await gravarSeAusente(chave, uso)) return { ok: true };
  const anterior = (await ler(chave)) ?? void 0;
  return permiteReprovisionamento()
    ? {
        ok: true,
        ...(anterior ? { usoAnterior: anterior } : {}),
      }
    : {
        ok: false,
        ...(anterior ? { usoAnterior: anterior } : {}),
      };
}
/**
 * `GET /api/painel` — tudo que as telas do exemplo mostram, numa chamada so.
 *
 * Nao faz parte do contrato com o Gateway: e a API interna do sistema web. Numa
 * aplicacao de verdade estaria atras do login da academia; aqui fica aberta de
 * proposito, para o exemplo poder ser aberto e entendido sem cadastro.
 */
var Route$5 = createFileRoute("/api/painel")({
  server: {
    handlers: {
      GET: async () => {
        const [gateways, acessos, eventos, alunos, comandos] = await Promise.all([
          lerGateways(),
          lerAcessos(),
          lerEventos(60),
          lerAlunos(),
          lerComandos(),
        ]);
        return json(
          {
            gateways,
            acessos,
            eventos,
            alunos,
            comandos,
            ambiente: {
              armazenamento: backendDeArmazenamento,
              codigosDeInstalacao: codigosDeInstalacao(),
              reprovisionamentoPermitido: permiteReprovisionamento(),
            },
            agora: /* @__PURE__ */ new Date().toISOString(),
          },
          200,
          { "cache-control": "no-store" },
        );
      },
    },
  },
});
/**
 * `POST /gateway/auth` — secao 2 do contrato.
 *
 * O Gateway renova o token 60 s antes do vencimento e refaz a autenticacao uma unica
 * vez ao receber 401. Manter `expiresInSeconds` honesto importa: um numero maior que a
 * validade real faria o Gateway usar token vencido justamente no caminho critico.
 */
var schema$2 = objectType({
  gatewayId: stringType().uuid(),
  gatewaySecret: stringType().min(1),
  gatewayVersion: stringType().min(1),
});
var Route$4 = createFileRoute("/gateway/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema$2);
        if (!corpo.ok) return corpo.resposta;
        const { gatewayId, gatewaySecret } = corpo.dados;
        if (!(await segredoConfere(gatewayId, gatewaySecret)))
          return erro(401, "INVALID_CREDENTIALS", "Credencial de instalacao invalida.");
        return json({
          accessToken: await emitirToken(gatewayId),
          expiresInSeconds: VALIDADE_DO_TOKEN_EM_SEGUNDOS,
        });
      },
    },
  },
});
/**
 * `POST /gateway/provision` — secao 1 do contrato.
 *
 * Troca unica do codigo de instalacao pela credencial propria da instalacao. E a unica
 * rota do protocolo que nao exige token: a autenticacao e justamente o que se obtem
 * aqui. O Gateway grava o segredo cifrado por DPAPI e nunca mais o mostra.
 */
var schema$1 = objectType({
  installationCode: stringType().min(1),
  machineName: stringType().min(1),
  gatewayVersion: stringType().min(1),
});
var NOME_DA_ACADEMIA = process.env["NOME_DA_ACADEMIA"] ?? "Academia Exemplo";
var Route$3 = createFileRoute("/gateway/provision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema$1);
        if (!corpo.ok) return corpo.resposta;
        const { installationCode, machineName, gatewayVersion } = corpo.dados;
        if (!codigoEhValido(installationCode))
          return erro(404, "INSTALLATION_CODE_UNKNOWN", "Codigo de instalacao nao existe.");
        const gatewayId = await gatewayIdDoCodigo(installationCode);
        if (
          !(
            await consumirCodigo(installationCode, {
              gatewayId,
              usadoEm: /* @__PURE__ */ new Date().toISOString(),
              machineName,
            })
          ).ok
        )
          return erro(409, "INSTALLATION_CODE_USED", "Codigo de instalacao ja foi utilizado.");
        const existente = (await lerGateways()).find((item) => item.gatewayId === gatewayId);
        await salvarGateway({
          gatewayId,
          gatewayName: existente?.gatewayName ?? "Recepcao",
          tenantName: NOME_DA_ACADEMIA,
          machineName,
          version: gatewayVersion,
          provisionadoEm: existente?.provisionadoEm ?? /* @__PURE__ */ new Date().toISOString(),
          dispositivos: existente?.dispositivos ?? [],
        });
        await registrarEvento(
          gatewayId,
          "ACCESS_VALIDATE",
          {
            installationCode,
            machineName,
            gatewayVersion,
          },
          `Gateway provisionado a partir de ${machineName} (versao ${gatewayVersion})`,
        );
        return json({
          gatewayId,
          gatewaySecret: await segredoDoGateway(gatewayId),
          tenantName: NOME_DA_ACADEMIA,
          gatewayName: "Recepcao",
        });
      },
    },
  },
});
/**
 * `POST /internal/access/validate` — o caminho critico (secao 3 do contrato).
 *
 * Alguem esta parado na catraca esperando. O Gateway corta em 3 s e, sem resposta,
 * **nega** — entao tudo que este handler faz precisa caber confortavelmente dentro
 * desse orcamento. Nada de consulta lenta, integracao com terceiro ou envio de e-mail
 * aqui dentro: o que nao for essencial para responder ALLOW/DENY vai para depois.
 *
 * Tres cuidados que o Gateway espera e que sao faceis de esquecer:
 *
 *  1. **ecoar o `eventId`** — sem o eco, uma resposta atrasada liberaria a catraca
 *     para a proxima pessoa da fila;
 *  2. **nao registrar o PIN inteiro** — este e o unico ponto do sistema em que ele
 *     trafega, e a trilha guarda so os tres ultimos digitos;
 *  3. **`message` de 16 colunas, ASCII** — o display tem 2x16 e nao mostra acento.
 */
var schema = objectType({
  eventId: stringType().uuid(),
  gatewayId: stringType().uuid(),
  deviceId: stringType().uuid(),
  credentialType: enumType(["PIN", "CARD"]),
  credential: stringType().min(1),
  direction: enumType(["ENTRY", "EXIT", "BOTH"]),
  occurredAt: stringType(),
});
var Route$2 = createFileRoute("/internal/access/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sessao = await autenticar(request);
        if (!sessao.ok) return sessao.resposta;
        const corpo = await lerCorpo(request, schema);
        if (!corpo.ok) return corpo.resposta;
        const pedido = corpo.dados;
        if (pedido.gatewayId !== sessao.gatewayId)
          return erro(403, "GATEWAY_MISMATCH", "O token nao pertence a este gatewayId.");
        const [alunos, acessos] = await Promise.all([lerAlunos(), lerAcessos()]);
        const veredito = decidir(alunos, pedido.credential, pedido.direction, acessos);
        const resposta = {
          decision: veredito.decisao,
          eventId: pedido.eventId,
          ...(veredito.aluno
            ? {
                studentId: veredito.aluno.id,
                studentName: veredito.aluno.nome,
              }
            : {}),
          reasonCode: veredito.reasonCode,
          message: paraDisplay(veredito.mensagem),
        };
        const credencialMascarada = mascararCredencial(pedido.credential);
        const acesso = {
          eventId: pedido.eventId,
          gatewayId: pedido.gatewayId,
          deviceId: pedido.deviceId,
          ...(veredito.aluno
            ? {
                alunoId: veredito.aluno.id,
                alunoNome: veredito.aluno.nome,
              }
            : {}),
          credencialMascarada,
          decisao: veredito.decisao,
          reasonCode: veredito.reasonCode,
          mensagem: resposta.message,
          direcao: pedido.direction,
          decididoEm: /* @__PURE__ */ new Date().toISOString(),
        };
        await Promise.all([
          registrarAcesso(acesso),
          garantirDispositivo(pedido.gatewayId, pedido.deviceId),
          registrarEvento(
            pedido.gatewayId,
            "ACCESS_VALIDATE",
            {
              ...pedido,
              credential: credencialMascarada,
            },
            `${veredito.decisao} ${credencialMascarada} — ${veredito.reasonCode}`,
          ),
        ]);
        return json(resposta);
      },
    },
  },
});
/**
 * `GET /internal/gateway/{gatewayId}/commands` — **fora do contrato**.
 *
 * O protocolo entrega comandos pelo WebSocket, e o Gateway nao consulta esta rota.
 * Ela existe para a ponte WSS (`ws-bridge/`), que roda num processo persistente e
 * precisa saber o que ha para entregar: uma funcao serverless nao mantem conexao
 * aberta, entao a fila de comandos vive aqui e a ponte a consome.
 *
 * O token e o do proprio Gateway, repassado pela ponte no handshake. Nenhum segredo
 * novo entra no sistema por causa dela.
 */
var Route$1 = createFileRoute("/internal/gateway/$gatewayId/commands")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const sessao = await autenticar(request);
        if (!sessao.ok) return sessao.resposta;
        if (params.gatewayId !== sessao.gatewayId)
          return erro(403, "GATEWAY_MISMATCH", "O token nao pertence a este gatewayId.");
        const pendentes = await comandosParaEntregar(sessao.gatewayId);
        const entregueEm = /* @__PURE__ */ new Date().toISOString();
        const envelopes = pendentes.map((comando) => ({
          type: comando.tipo,
          commandId: comando.commandId,
          gatewayId: comando.gatewayId,
          deviceId: comando.deviceId,
          ...(comando.direction ? { direction: comando.direction } : {}),
          message: comando.message,
          expiresAt: comando.expiresAt,
        }));
        await Promise.all(
          pendentes.map((comando) => atualizarComando(comando.commandId, { entregueEm })),
        );
        return json({ commands: envelopes });
      },
    },
  },
});
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
/**
 * `POST /internal/gateway/{gatewayId}/events` — seção 5 do contrato.
 *
 * Entrada da fila durável do Gateway. Tudo que precisa de garantia de entrega passa
 * por aqui: heartbeat quando o WebSocket está fora, desfecho de acesso, giro da
 * catraca, mudança de estado do equipamento, resultado de comando.
 *
 * O efeito de cada evento vive em [recepcao.ts](../../../../server/recepcao.ts), que é
 * compartilhado com o WebSocket: o mesmo heartbeat precisa produzir o mesmo resultado
 * pelos dois caminhos.
 *
 * Duas regras que o Gateway assume deste lado:
 *
 *  - **`X-Idempotency-Key` deduplica.** Se a resposta se perder, o mesmo item volta.
 *    Aceitar duas vezes duplica a trilha de acesso da academia.
 *  - **A ordem é estrita e o Gateway para no primeiro erro.** Responder 5xx trava a
 *    fila inteira até a próxima tentativa; responder 200 para algo que não foi gravado
 *    perde o registro para sempre. Quando o corpo for inválido, 400 é a resposta certa:
 *    é um item que nunca vai melhorar, e o Gateway o descarta.
 */
var Route = createFileRoute("/internal/gateway/$gatewayId/events")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const sessao = await autenticar(request);
        if (!sessao.ok) return sessao.resposta;
        if (params.gatewayId !== sessao.gatewayId)
          return erro(403, "GATEWAY_MISMATCH", "O token nao pertence a este gatewayId.");
        const tipo = request.headers.get("x-gateway-event-type");
        if (!tipo || !TIPOS_DE_EVENTO.includes(tipo))
          return erro(
            400,
            "UNKNOWN_EVENT_TYPE",
            `X-Gateway-Event-Type ausente ou desconhecido: ${tipo}`,
          );
        let payload;
        try {
          payload = await request.json();
        } catch {
          return erro(400, "INVALID_JSON", "Corpo nao e JSON valido.");
        }
        const idempotencia = request.headers.get("x-idempotency-key");
        if (idempotencia) {
          if (
            !(await gravarSeAusente(
              `idem:${sessao.gatewayId}:${idempotencia}`,
              {
                tipo,
                em: /* @__PURE__ */ new Date().toISOString(),
              },
              3600 * 24 * 7,
            ))
          )
            return json({
              status: "DUPLICATE",
              idempotencyKey: idempotencia,
            });
        }
        await processarEvento(sessao.gatewayId, tipo, payload);
        return json({ status: "ACCEPTED" });
      },
    },
  },
});
var rootRouteChildren = {
  IndexRoute: Route$12.update({
    id: "/",
    path: "/",
    getParentRoute: () => Route$13,
  }),
  AlunosRoute: Route$11.update({
    id: "/alunos",
    path: "/alunos",
    getParentRoute: () => Route$13,
  }),
  EventosRoute: Route$10.update({
    id: "/eventos",
    path: "/eventos",
    getParentRoute: () => Route$13,
  }),
  InstalacaoRoute: Route$9.update({
    id: "/instalacao",
    path: "/instalacao",
    getParentRoute: () => Route$13,
  }),
  SimuladorRoute: Route$8.update({
    id: "/simulador",
    path: "/simulador",
    getParentRoute: () => Route$13,
  }),
  ApiAlunosRoute: Route$7.update({
    id: "/api/alunos",
    path: "/api/alunos",
    getParentRoute: () => Route$13,
  }),
  ApiComandosRoute: Route$6.update({
    id: "/api/comandos",
    path: "/api/comandos",
    getParentRoute: () => Route$13,
  }),
  ApiPainelRoute: Route$5.update({
    id: "/api/painel",
    path: "/api/painel",
    getParentRoute: () => Route$13,
  }),
  GatewayAuthRoute: Route$4.update({
    id: "/gateway/auth",
    path: "/gateway/auth",
    getParentRoute: () => Route$13,
  }),
  GatewayProvisionRoute: Route$3.update({
    id: "/gateway/provision",
    path: "/gateway/provision",
    getParentRoute: () => Route$13,
  }),
  InternalAccessValidateRoute: Route$2.update({
    id: "/internal/access/validate",
    path: "/internal/access/validate",
    getParentRoute: () => Route$13,
  }),
  InternalGatewayGatewayIdCommandsRoute: Route$1.update({
    id: "/internal/gateway/$gatewayId/commands",
    path: "/internal/gateway/$gatewayId/commands",
    getParentRoute: () => Route$13,
  }),
  InternalGatewayGatewayIdEventsRoute: Route.update({
    id: "/internal/gateway/$gatewayId/events",
    path: "/internal/gateway/$gatewayId/events",
    getParentRoute: () => Route$13,
  }),
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
  return createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
//#endregion
export { getRouter };
