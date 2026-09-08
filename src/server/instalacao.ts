/**
 * Codigos de instalacao — o unico segredo que uma pessoa digita.
 *
 * O contrato exige que o codigo nao se reutilize: ele vale uma vez, vira credencial da
 * instalacao e morre. No exemplo isso e relaxavel por variavel de ambiente, porque uma
 * demonstracao precisa poder repetir o provisionamento; num sistema de verdade,
 * `PERMITIR_REPROVISIONAMENTO` nao deveria existir.
 */

import { gravarSeAusente, ler } from "./armazenamento";

export function codigosDeInstalacao(): string[] {
  const bruto = process.env["CODIGOS_DE_INSTALACAO"] ?? "AB73-KL92,DEMO-0001";

  return bruto
    .split(",")
    .map((codigo) => codigo.trim().toUpperCase())
    .filter(Boolean);
}

export function permiteReprovisionamento(): boolean {
  return (process.env["PERMITIR_REPROVISIONAMENTO"] ?? "true").toLowerCase() !== "false";
}

export function codigoEhValido(codigo: string): boolean {
  return codigosDeInstalacao().includes(codigo.trim().toUpperCase());
}

export type UsoDoCodigo = { gatewayId: string; usadoEm: string; machineName: string };

/**
 * Marca o codigo como usado. Devolve `false` quando ele ja tinha sido trocado antes e
 * o reprovisionamento esta desligado.
 */
export async function consumirCodigo(
  codigo: string,
  uso: UsoDoCodigo,
): Promise<{ ok: boolean; usoAnterior?: UsoDoCodigo }> {
  const chave = `codigo:${codigo.trim().toUpperCase()}`;

  if (await gravarSeAusente(chave, uso)) return { ok: true };

  const anterior = (await ler<UsoDoCodigo>(chave)) ?? undefined;

  return permiteReprovisionamento()
    ? { ok: true, ...(anterior ? { usoAnterior: anterior } : {}) }
    : { ok: false, ...(anterior ? { usoAnterior: anterior } : {}) };
}

export async function usoDoCodigo(codigo: string): Promise<UsoDoCodigo | null> {
  return ler<UsoDoCodigo>(`codigo:${codigo.trim().toUpperCase()}`);
}
