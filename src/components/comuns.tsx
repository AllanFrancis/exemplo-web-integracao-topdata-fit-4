/** Pecas visuais compartilhadas pelas telas do exemplo. */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Secao({
  titulo,
  descricao,
  acao,
  children,
  className,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
          {descricao ? <p className="mt-0.5 text-xs text-muted-foreground">{descricao}</p> : null}
        </div>
        {acao}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const CORES: Record<string, string> = {
  ok: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  ruim: "bg-red-500/12 text-red-700 dark:text-red-400 border-red-500/30",
  atencao: "bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/30",
  neutro: "bg-muted text-muted-foreground border-border",
};

export function Etiqueta({
  tom = "neutro",
  children,
  className,
}: {
  tom?: keyof typeof CORES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] leading-4",
        CORES[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** ONLINE e verde; DEGRADED e amarelo; o resto e vermelho — a leitura de longe importa. */
export function tomDoEstado(estado?: string): keyof typeof CORES {
  if (estado === "ONLINE") return "ok";
  if (estado === "DEGRADED" || estado === "CONNECTING") return "atencao";
  if (!estado || estado === "UNKNOWN") return "neutro";
  return "ruim";
}

/** O display real tem 2 linhas de 16 colunas e nao mostra acento. */
export function Display({ linhas }: { linhas: [string, string?] }) {
  return (
    <div className="inline-block rounded-md border border-emerald-900/40 bg-emerald-950 px-3 py-2 font-mono text-sm leading-5 text-emerald-300">
      <div>{(linhas[0] ?? "").padEnd(16, "\u00A0").slice(0, 16)}</div>
      <div>{(linhas[1] ?? "").padEnd(16, "\u00A0").slice(0, 16)}</div>
    </div>
  );
}

export function horaCurta(iso?: string | null): string {
  if (!iso) return "—";

  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function desdeAgora(iso?: string | null): string {
  if (!iso) return "sem contato";

  const segundos = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (segundos < 60) return `ha ${segundos}s`;
  if (segundos < 3600) return `ha ${Math.round(segundos / 60)}min`;

  return `ha ${Math.round(segundos / 3600)}h`;
}
