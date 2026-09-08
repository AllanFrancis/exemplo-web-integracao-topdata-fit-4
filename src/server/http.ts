/** Utilidades das rotas HTTP faladas pelo Gateway. */

import { z } from "zod";

import { gatewayIdDoToken, tokenDoHeader } from "./credenciais";

export function json(corpo: unknown, status = 200, cabecalhos?: HeadersInit): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...cabecalhos },
  });
}

/**
 * Erro em formato estavel. O Gateway so olha o status — ele registra o corpo em log
 * e segue — mas quem esta depurando a integracao olha, e um `{"error":...}` legivel
 * economiza uma sessao de captura de rede.
 */
export function erro(status: number, codigo: string, detalhe?: string): Response {
  return json({ error: codigo, ...(detalhe ? { detail: detalhe } : {}) }, status);
}

/** Le e valida o corpo JSON. Corpo invalido e 400, nunca uma excecao 500. */
export async function lerCorpo<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; dados: T } | { ok: false; resposta: Response }> {
  let bruto: unknown;

  try {
    bruto = await request.json();
  } catch {
    return { ok: false, resposta: erro(400, "INVALID_JSON", "Corpo nao e JSON valido.") };
  }

  const resultado = schema.safeParse(bruto);
  if (!resultado.success) {
    return {
      ok: false,
      resposta: erro(
        400,
        "INVALID_PAYLOAD",
        resultado.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      ),
    };
  }

  return { ok: true, dados: resultado.data };
}

/**
 * Exige um token valido e devolve o `gatewayId` que ele carrega.
 *
 * O 401 aqui nao e apenas correcao formal: o Gateway trata esse status renovando o
 * token e repetindo a chamada uma unica vez. Responder 403 ou 500 no lugar dele
 * transformaria um token vencido numa negacao de acesso na catraca.
 */
export async function autenticar(
  request: Request,
): Promise<{ ok: true; gatewayId: string } | { ok: false; resposta: Response }> {
  const gatewayId = await gatewayIdDoToken(tokenDoHeader(request));

  return gatewayId
    ? { ok: true, gatewayId }
    : { ok: false, resposta: erro(401, "UNAUTHORIZED", "Token ausente, invalido ou expirado.") };
}
