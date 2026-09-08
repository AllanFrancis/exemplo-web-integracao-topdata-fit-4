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

const url = process.env["KV_REST_API_URL"];
const token = process.env["KV_REST_API_TOKEN"];

export const backendDeArmazenamento = url && token ? "redis" : "memoria";

// --------------------------------------------------------------------- memoria

// `globalThis` e nao um `const` de modulo: em dev o Vite recarrega o modulo a cada
// alteracao, e sem isso o estado do exemplo se perderia a cada save.
const memoria: Map<string, unknown> = ((globalThis as Record<string, unknown>)[
  "__topdataMemoria"
] ??= new Map()) as Map<string, unknown>;

// ----------------------------------------------------------------------- redis

async function redis<T>(comando: unknown[]): Promise<T> {
  const resposta = await fetch(url!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(comando),
  });

  if (!resposta.ok) {
    throw new Error(`Redis respondeu ${resposta.status}`);
  }

  const corpo = (await resposta.json()) as { result: T; error?: string };
  if (corpo.error) throw new Error(corpo.error);

  return corpo.result;
}

// ------------------------------------------------------------------- interface

export async function ler<T>(chave: string): Promise<T | null> {
  if (backendDeArmazenamento === "memoria") {
    return (memoria.get(chave) as T | undefined) ?? null;
  }

  const bruto = await redis<string | null>(["GET", chave]);
  return bruto ? (JSON.parse(bruto) as T) : null;
}

export async function gravar(chave: string, valor: unknown): Promise<void> {
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
export async function gravarSeAusente(
  chave: string,
  valor: unknown,
  validadeSegundos?: number,
): Promise<boolean> {
  if (backendDeArmazenamento === "memoria") {
    if (memoria.has(chave)) return false;
    memoria.set(chave, valor);
    return true;
  }

  const comando: unknown[] = ["SET", chave, JSON.stringify(valor), "NX"];
  if (validadeSegundos) comando.push("EX", validadeSegundos);

  return (await redis<string | null>(comando)) === "OK";
}

export async function remover(chave: string): Promise<void> {
  if (backendDeArmazenamento === "memoria") {
    memoria.delete(chave);
    return;
  }

  await redis(["DEL", chave]);
}

/** Empilha no inicio da lista e corta o excedente: a trilha do exemplo e limitada. */
export async function empilhar(chave: string, valor: unknown, limite: number): Promise<void> {
  if (backendDeArmazenamento === "memoria") {
    const lista = (memoria.get(chave) as unknown[] | undefined) ?? [];
    lista.unshift(valor);
    memoria.set(chave, lista.slice(0, limite));
    return;
  }

  await redis(["LPUSH", chave, JSON.stringify(valor)]);
  await redis(["LTRIM", chave, 0, limite - 1]);
}

export async function listar<T>(chave: string, limite: number): Promise<T[]> {
  if (backendDeArmazenamento === "memoria") {
    const lista = (memoria.get(chave) as T[] | undefined) ?? [];
    return lista.slice(0, limite);
  }

  const bruto = await redis<string[]>(["LRANGE", chave, 0, limite - 1]);
  return bruto.map((item) => JSON.parse(item) as T);
}
