/**
 * Trilha crua: tudo que o Gateway mandou, na ordem em que chegou.
 *
 * A tela existe porque, quando a integracao da errado, a primeira pergunta e sempre
 * "o que exatamente chegou?". Guardar o payload sem interpretacao e o que permite
 * responder isso sem ligar a captura de rede na academia.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Etiqueta, Secao, horaCurta } from "@/components/comuns";
import { usePainel } from "@/lib/api-cliente";
import { TIPOS_DE_EVENTO } from "@/lib/protocolo";

export const Route = createFileRoute("/eventos")({
  head: () => ({ meta: [{ title: "Trilha de eventos — Topdata Gateway" }] }),
  component: Eventos,
});

const TONS: Record<string, "ok" | "ruim" | "atencao" | "neutro"> = {
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
  const [filtro, setFiltro] = useState<string>("TODOS");
  const [aberto, setAberto] = useState<string | null>(null);

  const eventos = (data?.eventos ?? []).filter(
    (evento) => filtro === "TODOS" || evento.tipo === filtro,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <Secao
        titulo="Trilha de eventos"
        descricao="Chegam por POST /internal/gateway/{gatewayId}/events, deduplicados por X-Idempotency-Key."
        acao={
          <select
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="TODOS">todos os tipos</option>
            <option value="ACCESS_VALIDATE">ACCESS_VALIDATE (validacao)</option>
            {TIPOS_DE_EVENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        }
      >
        {eventos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada registrado ainda com este filtro.</p>
        ) : (
          <ol className="space-y-2">
            {eventos.map((evento) => (
              <li key={evento.id} className="rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => setAberto(aberto === evento.id ? null : evento.id)}
                  className="flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/50"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {horaCurta(evento.recebidoEm)}
                  </span>
                  <Etiqueta tom={TONS[evento.tipo] ?? "neutro"}>{evento.tipo}</Etiqueta>
                  <span className="text-sm">{evento.resumo}</span>
                </button>

                {aberto === evento.id ? (
                  <pre className="overflow-x-auto border-t border-border bg-muted p-3 text-[11px] leading-4">
                    {JSON.stringify(evento.payload, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Secao>

      <p className="text-xs text-muted-foreground">
        O PIN completo nunca entra na trilha: a validacao registra apenas os tres ultimos digitos. O
        corpo de <code className="font-mono">/internal/access/validate</code> e o unico lugar do
        sistema em que ele trafega inteiro.
      </p>
    </main>
  );
}
