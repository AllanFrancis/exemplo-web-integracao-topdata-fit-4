/** Painel da recepcao: o que os Gateways estao reportando, ao vivo. */

import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { Display, Etiqueta, Secao, desdeAgora, horaCurta, tomDoEstado } from "@/components/comuns";
import { Button } from "@/components/ui/button";
import { useEnvioDeComando, usePainel } from "@/lib/api-cliente";
import type { GatewayConhecido } from "@/lib/tipos";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Painel — integracao Topdata Gateway" }] }),
  component: Painel,
});

function Pagina({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">{children}</main>;
}

function Painel() {
  const { data, isLoading, error } = usePainel();

  if (isLoading) {
    return (
      <Pagina>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </Pagina>
    );
  }

  if (error || !data) {
    return (
      <Pagina>
        <p className="text-sm text-red-600">Falha ao carregar o painel: {String(error)}</p>
      </Pagina>
    );
  }

  const acessos = data.acessos.slice(0, 12);

  return (
    <Pagina>
      {data.ambiente.armazenamento === "memoria" ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <strong>Armazenamento em memoria.</strong> Nao ha banco configurado: alunos, trilha e
          acessos vivem na instancia que atende a requisicao e somem quando ela recicla. Defina{" "}
          <code className="font-mono text-xs">KV_REST_API_URL</code> e{" "}
          <code className="font-mono text-xs">KV_REST_API_TOKEN</code> para persistir de verdade.
        </div>
      ) : null}

      {data.gateways.length === 0 ? (
        <Secao
          titulo="Nenhum Gateway provisionado"
          descricao="O primeiro passo e trocar o codigo de instalacao pela credencial da instalacao."
        >
          <p className="text-sm text-muted-foreground">
            Aponte o Gateway para este endereco em{" "}
            <code className="font-mono text-xs">config.json</code> e provisione, ou abra o{" "}
            <Link to="/simulador" className="font-medium text-foreground underline">
              simulador
            </Link>{" "}
            para ver o fluxo inteiro sem hardware. As instrucoes estao em{" "}
            <Link to="/instalacao" className="font-medium text-foreground underline">
              Instalacao
            </Link>
            .
          </p>
        </Secao>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {data.gateways.map((gateway) => (
          <CartaoDoGateway key={gateway.gatewayId} gateway={gateway} />
        ))}
      </div>

      <Secao
        titulo="Acessos recentes"
        descricao="A decisao e nossa; girar a catraca e um fato fisico que so o equipamento confirma."
      >
        {acessos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nada ainda. Use o simulador ou digite um PIN na catraca.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="pb-2 pr-3 font-medium">Hora</th>
                  <th className="pb-2 pr-3 font-medium">Credencial</th>
                  <th className="pb-2 pr-3 font-medium">Aluno</th>
                  <th className="pb-2 pr-3 font-medium">Decisao</th>
                  <th className="pb-2 pr-3 font-medium">Motivo</th>
                  <th className="pb-2 pr-3 font-medium">Display</th>
                  <th className="pb-2 font-medium">Desfecho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {acessos.map((acesso) => (
                  <tr key={acesso.eventId} className="align-middle">
                    <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                      {horaCurta(acesso.decididoEm)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{acesso.credencialMascarada}</td>
                    <td className="py-2 pr-3">{acesso.alunoNome ?? "—"}</td>
                    <td className="py-2 pr-3">
                      <Etiqueta tom={acesso.decisao === "ALLOW" ? "ok" : "ruim"}>
                        {acesso.decisao}
                      </Etiqueta>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                      {acesso.reasonCode}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{acesso.mensagem}</td>
                    <td className="py-2">
                      <Desfecho
                        executado={acesso.executado}
                        passagem={acesso.passagemConfirmadaEm}
                        decisao={acesso.decisao}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Secao>

      <Secao
        titulo="Fila de comandos"
        descricao="Comandos so chegam a catraca pelo WebSocket — em serverless, atraves da ponte ws-bridge/."
      >
        {data.comandos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum comando enviado nesta sessao.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.comandos.slice(0, 8).map((comando) => (
              <li key={comando.commandId} className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {horaCurta(comando.criadoEm)}
                </span>
                <Etiqueta>{comando.tipo}</Etiqueta>
                <span className="font-mono text-xs">{comando.message}</span>
                <EstadoDoComando
                  entregueEm={comando.entregueEm}
                  expiresAt={comando.expiresAt}
                  resultado={comando.resultado}
                  errorCode={comando.errorCode}
                />
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </Pagina>
  );
}

function EstadoDoComando({
  entregueEm,
  expiresAt,
  resultado,
  errorCode,
}: {
  entregueEm?: string | undefined;
  expiresAt: string;
  resultado?: "EXECUTED" | "FAILED" | undefined;
  errorCode?: string | null | undefined;
}) {
  if (resultado) {
    return (
      <Etiqueta tom={resultado === "EXECUTED" ? "ok" : "ruim"}>
        {resultado}
        {errorCode ? ` · ${errorCode}` : ""}
      </Etiqueta>
    );
  }

  if (entregueEm) return <Etiqueta tom="atencao">entregue, sem confirmacao</Etiqueta>;

  // Um comando que expirou na fila e melhor que um comando entregue tarde: liberar a
  // catraca minutos depois abriria para quem esta na frente dela agora.
  if (Date.parse(expiresAt) < Date.now())
    return <Etiqueta tom="ruim">expirou sem entrega</Etiqueta>;

  return <Etiqueta tom="atencao">aguardando o Gateway</Etiqueta>;
}

function Desfecho({
  executado,
  passagem,
  decisao,
}: {
  executado?: boolean | undefined;
  passagem?: string | undefined;
  decisao: string;
}) {
  if (passagem) return <Etiqueta tom="ok">girou {horaCurta(passagem)}</Etiqueta>;

  // Negado nao tem desfecho fisico a esperar: a catraca continua travada, que e o certo.
  if (decisao === "DENY") return <Etiqueta>bloqueio mantido</Etiqueta>;

  // ALLOW que nao chegou a ser executado e o caso que a recepcao precisa enxergar:
  // o servidor autorizou e o equipamento nao obedeceu.
  if (executado === false) return <Etiqueta tom="ruim">nao executado</Etiqueta>;

  if (executado) return <Etiqueta tom="atencao">liberou, sem giro</Etiqueta>;

  return <Etiqueta>aguardando</Etiqueta>;
}

function CartaoDoGateway({ gateway }: { gateway: GatewayConhecido }) {
  const enviar = useEnvioDeComando();
  const [mensagem, setMensagem] = useState("LIBERADO");

  // Sem heartbeat ha mais de um minuto o Gateway esta calado — o intervalo padrao e 30 s.
  const calado =
    !gateway.ultimoContatoEm || Date.now() - Date.parse(gateway.ultimoContatoEm) > 60_000;

  return (
    <Secao
      titulo={`${gateway.gatewayName} · ${gateway.tenantName}`}
      descricao={`${gateway.machineName ?? "maquina desconhecida"} · versao ${gateway.version ?? "?"}`}
      acao={
        <Etiqueta tom={calado ? "ruim" : tomDoEstado(gateway.status)}>
          {calado ? "SEM HEARTBEAT" : (gateway.status ?? "—")}
        </Etiqueta>
      }
    >
      <dl className="mb-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <dt className="uppercase tracking-wide">Ultimo contato</dt>
          <dd className="font-mono text-foreground">{desdeAgora(gateway.ultimoContatoEm)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Eventos na fila do Gateway</dt>
          <dd className="font-mono text-foreground">{gateway.pendingEvents ?? 0}</dd>
        </div>
        <div className="col-span-2">
          <dt className="uppercase tracking-wide">gatewayId</dt>
          <dd className="font-mono text-[11px] break-all text-foreground">{gateway.gatewayId}</dd>
        </div>
      </dl>

      {gateway.dispositivos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum equipamento reportado ainda. Ele aparece aqui no primeiro heartbeat ou na primeira
          validacao de acesso.
        </p>
      ) : (
        <ul className="space-y-3">
          {gateway.dispositivos.map((dispositivo) => (
            <li key={dispositivo.deviceId} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs break-all">{dispositivo.deviceId}</span>
                <Etiqueta tom={tomDoEstado(dispositivo.status)}>{dispositivo.status}</Etiqueta>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={mensagem}
                  onChange={(evento) => setMensagem(evento.target.value.slice(0, 16))}
                  maxLength={16}
                  className="h-8 w-40 rounded-md border border-input bg-background px-2 font-mono text-xs"
                  aria-label="Mensagem do display"
                />
                <Button
                  size="sm"
                  disabled={enviar.isPending}
                  onClick={() =>
                    enviar.mutate({
                      tipo: "UNLOCK",
                      gatewayId: gateway.gatewayId,
                      deviceId: dispositivo.deviceId,
                      direction: "ENTRY",
                      message: mensagem,
                    })
                  }
                >
                  Abrir catraca
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={enviar.isPending}
                  onClick={() =>
                    enviar.mutate({
                      tipo: "SHOW_MESSAGE",
                      gatewayId: gateway.gatewayId,
                      deviceId: dispositivo.deviceId,
                      message: mensagem,
                    })
                  }
                >
                  So mostrar
                </Button>
                <Display linhas={[mensagem]} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Secao>
  );
}
