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

const codificador = new TextEncoder();

/** Em producao, defina `GATEWAY_SIGNING_SECRET`. O padrao existe para o demo subir. */
const segredoMestre =
  process.env["GATEWAY_SIGNING_SECRET"] ?? "exemplo-topdata-nao-use-em-producao";

async function chaveHmac(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    codificador.encode(segredoMestre),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function assinar(mensagem: string): Promise<Uint8Array> {
  const assinatura = await crypto.subtle.sign(
    "HMAC",
    await chaveHmac(),
    codificador.encode(mensagem),
  );
  return new Uint8Array(assinatura);
}

function paraBase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function textoParaBase64Url(texto: string): string {
  return paraBase64Url(codificador.encode(texto));
}

/**
 * Comparacao em tempo constante. Um `===` vazaria, pelo tempo de resposta, quantos
 * caracteres do segredo estao certos.
 */
function iguaisEmTempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);

  return diferenca === 0;
}

/** UUID derivado do codigo de instalacao: reprovisionar devolve a mesma identidade. */
export async function gatewayIdDoCodigo(codigo: string): Promise<string> {
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

export async function segredoDoGateway(gatewayId: string): Promise<string> {
  return paraBase64Url(await assinar(`gateway-secret:${gatewayId}`));
}

export async function segredoConfere(gatewayId: string, segredo: string): Promise<boolean> {
  return iguaisEmTempoConstante(await segredoDoGateway(gatewayId), segredo);
}

// ------------------------------------------------------------ token de acesso

export const VALIDADE_DO_TOKEN_EM_SEGUNDOS = 3600;

type Payload = { sub: string; iss: string; iat: number; exp: number };

/**
 * JWT HS256 montado a mao, com Web Crypto.
 *
 * O contrato deixa o formato em aberto (secao 8). JWT foi escolhido porque o Gateway
 * so repassa a string no header `Authorization` — ele nunca abre o token — e porque
 * um token auto-contido dispensa consultar armazenamento a cada validacao de acesso,
 * que e justamente o caminho onde alguem esta parado na catraca esperando.
 */
export async function emitirToken(gatewayId: string): Promise<string> {
  const agora = Math.floor(Date.now() / 1000);

  const cabecalho = textoParaBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = textoParaBase64Url(
    JSON.stringify({
      sub: gatewayId,
      iss: "topdata-exemplo-web",
      iat: agora,
      exp: agora + VALIDADE_DO_TOKEN_EM_SEGUNDOS,
    } satisfies Payload),
  );

  const assinatura = paraBase64Url(await assinar(`${cabecalho}.${payload}`));

  return `${cabecalho}.${payload}.${assinatura}`;
}

/** Devolve o `gatewayId` do token, ou `null` quando ele nao vale. */
export async function gatewayIdDoToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;

  const partes = token.split(".");
  if (partes.length !== 3) return null;

  const [cabecalho, payload, assinatura] = partes as [string, string, string];

  const esperada = paraBase64Url(await assinar(`${cabecalho}.${payload}`));
  if (!iguaisEmTempoConstante(esperada, assinatura)) return null;

  try {
    const conteudo = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as Payload;

    // Expirado nao e erro de seguranca: o Gateway renova sozinho e repete a chamada
    // uma unica vez ao receber 401.
    if (conteudo.exp * 1000 < Date.now()) return null;

    return conteudo.sub;
  } catch {
    return null;
  }
}

/** Le o `Bearer` do header, sem assumir espacamento. */
export function tokenDoHeader(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;

  const [esquema, valor] = header.split(/\s+/, 2);
  return esquema?.toLowerCase() === "bearer" && valor ? valor : null;
}
