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

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { Display, Etiqueta, Secao, horaCurta } from "@/components/comuns";
import { Button } from "@/components/ui/button";
import type {
  AuthResponse,
  ProvisionResponse,
  ServerEnvelope,
  TipoEvento,
  ValidateAccessResponse,
} from "@/lib/protocolo";

export const Route = createFileRoute("/simulador")({
  head: () => ({ meta: [{ title: "Simulador da catraca — Topdata Gateway" }] }),
  component: Simulador,
});

type Troca = {
  id: string;
  hora: string;
  metodo: string;
  caminho: string;
  status: number;
  requisicao?: unknown;
  resposta: unknown;
};

type Credencial = { gatewayId: string; gatewaySecret: string };

const CHAVE_CREDENCIAL = "topdata-simulador-credencial";
const CHAVE_DEVICE = "topdata-simulador-device";
const VERSAO = "0.1.0-simulador";

function lerLocal(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarLocal(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Navegador com armazenamento bloqueado: o simulador continua, so nao lembra.
  }
}

function Simulador() {
  const [codigo, setCodigo] = useState("AB73-KL92");
  const [credencial, setCredencial] = useState<Credencial | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [pin, setPin] = useState("");
  const [display, setDisplay] = useState<[string, string?]>(["DIGITE SEU PIN"]);
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [girar, setGirar] = useState(true);
  const [falharNoEquipamento, setFalharNoEquipamento] = useState(false);
  const [ouvindoComandos, setOuvindoComandos] = useState(true);

  // O token vive so na memoria desta aba, como no Gateway: ele nunca vai para disco.
  const token = useRef<string | null>(null);

  useEffect(() => {
    const guardada = lerLocal(CHAVE_CREDENCIAL);
    if (guardada) setCredencial(JSON.parse(guardada) as Credencial);

    const guardado = lerLocal(CHAVE_DEVICE) ?? crypto.randomUUID();
    gravarLocal(CHAVE_DEVICE, guardado);
    setDeviceId(guardado);
  }, []);

  const anotar = useCallback((troca: Omit<Troca, "id" | "hora">) => {
    setTrocas((anteriores) =>
      [{ ...troca, id: crypto.randomUUID(), hora: new Date().toISOString() }, ...anteriores].slice(
        0,
        40,
      ),
    );
  }, []);

  const chamar = useCallback(
    async <T,>(
      metodo: string,
      caminho: string,
      opcoes: { corpo?: unknown; token?: string; cabecalhos?: Record<string, string> } = {},
    ): Promise<{ status: number; dados: T }> => {
      const resposta = await fetch(caminho, {
        method: metodo,
        headers: {
          ...(opcoes.corpo === undefined ? {} : { "content-type": "application/json" }),
          ...(opcoes.token ? { authorization: `Bearer ${opcoes.token}` } : {}),
          ...opcoes.cabecalhos,
        },
        ...(opcoes.corpo === undefined ? {} : { body: JSON.stringify(opcoes.corpo) }),
      });

      const dados = (await resposta.json()) as T;

      anotar({
        metodo,
        caminho,
        status: resposta.status,
        ...(opcoes.corpo === undefined ? {} : { requisicao: opcoes.corpo }),
        resposta: dados,
      });

      return { status: resposta.status, dados };
    },
    [anotar],
  );

  /** Troca o codigo de instalacao pela credencial propria (secao 1 do contrato). */
  const provisionar = useCallback(async () => {
    setOcupado(true);
    try {
      const { status, dados } = await chamar<ProvisionResponse>("POST", "/gateway/provision", {
        corpo: {
          installationCode: codigo,
          machineName: "SIMULADOR-NAVEGADOR",
          gatewayVersion: VERSAO,
        },
      });

      if (status !== 200) {
        setDisplay(["FALHA PROVISION", String(status)]);
        return;
      }

      const nova = { gatewayId: dados.gatewayId, gatewaySecret: dados.gatewaySecret };
      setCredencial(nova);
      gravarLocal(CHAVE_CREDENCIAL, JSON.stringify(nova));
      token.current = null;
      setDisplay(["PROVISIONADO", dados.tenantName ?? ""]);
    } finally {
      setOcupado(false);
    }
  }, [chamar, codigo]);

  /**
   * Devolve um token valido, autenticando quando preciso.
   *
   * O Gateway guarda o token e so renova perto do vencimento; repetir a autenticacao a
   * cada validacao dobraria a espera de quem esta parado na catraca.
   */
  const autenticar = useCallback(async (): Promise<string | null> => {
    if (token.current) return token.current;
    if (!credencial) return null;

    const { status, dados } = await chamar<AuthResponse>("POST", "/gateway/auth", {
      corpo: { ...credencial, gatewayVersion: VERSAO },
    });

    if (status !== 200) return null;

    token.current = dados.accessToken;
    return dados.accessToken;
  }, [chamar, credencial]);

  const enviarEvento = useCallback(
    async (tipo: TipoEvento, payload: unknown) => {
      const atual = await autenticar();
      if (!atual || !credencial) return;

      await chamar("POST", `/internal/gateway/${credencial.gatewayId}/events`, {
        corpo: payload,
        token: atual,
        cabecalhos: {
          "x-gateway-event-type": tipo,
          // O Gateway monta esta chave com carimbo de tempo e sequencia. O que importa
          // e ser estavel entre reenvios do mesmo item.
          "x-idempotency-key": `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      });
    },
    [autenticar, chamar, credencial],
  );

  /** O caminho critico inteiro: valida, mostra no display e relata o desfecho. */
  const apresentarCredencial = useCallback(async () => {
    if (!credencial || pin.length < 4) return;

    setOcupado(true);
    try {
      const atual = await autenticar();
      if (!atual) {
        setDisplay(["SEM SERVIDOR", "TENTE DE NOVO"]);
        return;
      }

      const eventId = crypto.randomUUID();

      const { status, dados } = await chamar<ValidateAccessResponse>(
        "POST",
        "/internal/access/validate",
        {
          token: atual,
          corpo: {
            eventId,
            gatewayId: credencial.gatewayId,
            deviceId,
            credentialType: "PIN",
            credential: pin,
            direction: "ENTRY",
            occurredAt: new Date().toISOString(),
          },
        },
      );

      // Fail-closed: sem resposta boa, o Gateway nega e mantem o bloqueio.
      if (status !== 200) {
        setDisplay(["ACESSO NEGADO", "TENTE NOVAMENTE"]);
        await enviarEvento("ACCESS_OUTCOME", {
          eventId,
          deviceId,
          decision: "DENY",
          executed: false,
          reasonCode: "ACCESS_VALIDATION_TIMEOUT",
          errorCode: "ACCESS_VALIDATION_TIMEOUT",
          completedAt: new Date().toISOString(),
        });
        return;
      }

      const liberou = dados.decision === "ALLOW";
      const executou = liberou && !falharNoEquipamento;

      setDisplay([dados.message, liberou ? "" : "ACESSO NEGADO"]);
      setPin("");

      await enviarEvento("ACCESS_OUTCOME", {
        eventId,
        deviceId,
        decision: dados.decision,
        executed: executou,
        reasonCode: dados.reasonCode,
        errorCode: liberou && !executou ? "DEVICE_ERROR" : null,
        completedAt: new Date().toISOString(),
      });

      if (!executou) return;

      // Girar e um fato fisico: quem libera somos nos, quem confirma e o sensor otico.
      await enviarEvento(girar ? "PASSAGE_CONFIRMED" : "PASSAGE_EXPIRED", {
        deviceId,
        eventId,
        direction: "ENTRY",
        occurredAt: new Date().toISOString(),
      });
    } finally {
      setOcupado(false);
    }
  }, [autenticar, chamar, credencial, deviceId, enviarEvento, falharNoEquipamento, girar, pin]);

  const enviarHeartbeat = useCallback(
    async (estado: "ONLINE" | "DEGRADED" | "OFFLINE" = "ONLINE") => {
      if (!credencial) return;

      await enviarEvento("HEARTBEAT", {
        gatewayId: credencial.gatewayId,
        version: VERSAO,
        status: estado === "OFFLINE" ? "DEGRADED" : estado,
        pendingEvents: 0,
        devices: [
          {
            deviceId,
            status: estado,
            firmwareVersion: "L7.06.12",
            lastEventAt: new Date().toISOString(),
          },
        ],
      });
    },
    [credencial, deviceId, enviarEvento],
  );

  /**
   * Busca comandos pendentes.
   *
   * A catraca de verdade recebe isso pelo WebSocket. Como funcao serverless nao segura
   * conexao aberta, o simulador consulta a mesma fila por HTTP — o efeito visivel e o
   * mesmo, e o `expiresAt` continua sendo verificado antes de qualquer movimento.
   */
  const buscarComandos = useCallback(async () => {
    if (!credencial) return;

    const atual = await autenticar();
    if (!atual) return;

    const resposta = await fetch(`/internal/gateway/${credencial.gatewayId}/commands`, {
      headers: { authorization: `Bearer ${atual}` },
    });

    if (!resposta.ok) return;

    const { commands } = (await resposta.json()) as { commands: ServerEnvelope[] };
    if (commands.length === 0) return;

    anotar({
      metodo: "GET",
      caminho: `/internal/gateway/${credencial.gatewayId}/commands`,
      status: resposta.status,
      resposta: { commands },
    });

    for (const comando of commands) {
      const expirou = comando.expiresAt ? Date.parse(comando.expiresAt) < Date.now() : false;

      if (expirou || comando.deviceId !== deviceId) {
        await enviarEvento("COMMAND_RESULT", {
          commandId: comando.commandId,
          status: "FAILED",
          errorCode: expirou ? "COMMAND_EXPIRED" : "DEVICE_NOT_FOUND",
        });
        continue;
      }

      setDisplay([comando.message ?? "LIBERADO", comando.type === "UNLOCK" ? "PODE PASSAR" : ""]);

      await enviarEvento("COMMAND_RESULT", { commandId: comando.commandId, status: "EXECUTED" });

      if (comando.type === "UNLOCK" && girar) {
        await enviarEvento("PASSAGE_CONFIRMED", {
          deviceId,
          eventId: comando.commandId,
          direction: comando.direction ?? "ENTRY",
          occurredAt: new Date().toISOString(),
        });
      }
    }
  }, [anotar, autenticar, credencial, deviceId, enviarEvento, girar]);

  useEffect(() => {
    if (!ouvindoComandos || !credencial) return;

    const relogio = setInterval(() => void buscarComandos(), 2000);
    return () => clearInterval(relogio);
  }, [buscarComandos, credencial, ouvindoComandos]);

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <Secao
            titulo="1. Provisionamento"
            descricao="Codigo de instalacao vira credencial propria desta instalacao. Acontece uma vez."
          >
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-xs text-muted-foreground">
                Codigo de instalacao
                <input
                  value={codigo}
                  onChange={(evento) => setCodigo(evento.target.value.toUpperCase())}
                  className="mt-1 block h-9 w-44 rounded-md border border-input bg-background px-2 font-mono text-sm"
                />
              </label>
              <Button onClick={() => void provisionar()} disabled={ocupado}>
                Provisionar
              </Button>
              {credencial ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCredencial(null);
                    token.current = null;
                    gravarLocal(CHAVE_CREDENCIAL, "");
                  }}
                >
                  Esquecer credencial
                </Button>
              ) : null}
            </div>

            {credencial ? (
              <dl className="mt-3 space-y-1 text-xs">
                <div>
                  <dt className="inline text-muted-foreground">gatewayId: </dt>
                  <dd className="inline font-mono break-all">{credencial.gatewayId}</dd>
                </div>
                <div>
                  <dt className="inline text-muted-foreground">gatewaySecret: </dt>
                  <dd className="inline font-mono">
                    {credencial.gatewaySecret.slice(0, 6)}… (guardado so neste navegador)
                  </dd>
                </div>
                <div>
                  <dt className="inline text-muted-foreground">deviceId: </dt>
                  <dd className="inline font-mono break-all">{deviceId}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Ainda sem credencial. Sem provisionar, nenhuma outra chamada e aceita — e o
                equivalente ao <code className="font-mono">NOT_PROVISIONED</code> do Gateway.
              </p>
            )}
          </Secao>

          <Secao
            titulo="2. A catraca"
            descricao="Digite um PIN e confirme. O display mostra o que a pessoa leria no equipamento."
          >
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <div className="grid w-44 grid-cols-3 gap-1.5">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((tecla) => (
                    <button
                      key={tecla}
                      type="button"
                      disabled={!credencial || ocupado}
                      onClick={() => {
                        if (tecla === "*") return setPin("");
                        if (tecla === "#") return void apresentarCredencial();
                        setPin((atual) => (atual + tecla).slice(0, 10));
                      }}
                      className="h-11 rounded-md border border-border bg-background font-mono text-sm transition-colors hover:bg-accent disabled:opacity-40"
                    >
                      {tecla === "*" ? "limpa" : tecla === "#" ? "OK" : tecla}
                    </button>
                  ))}
                </div>
                <p className="mt-2 font-mono text-lg tracking-[0.3em]">
                  {pin.replace(/./g, "•") || "······"}
                </p>
              </div>

              <div className="space-y-3">
                <Display linhas={display} />

                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={girar}
                    onChange={(evento) => setGirar(evento.target.checked)}
                  />
                  a pessoa gira a catraca (PASSAGE_CONFIRMED)
                </label>

                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={falharNoEquipamento}
                    onChange={(evento) => setFalharNoEquipamento(evento.target.checked)}
                  />
                  o equipamento recusa o comando (ALLOW com executed=false)
                </label>

                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={ouvindoComandos}
                    onChange={(evento) => setOuvindoComandos(evento.target.checked)}
                  />
                  receber comandos do painel (UNLOCK / SHOW_MESSAGE)
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!credencial}
                onClick={() => void enviarHeartbeat("ONLINE")}
              >
                Heartbeat ONLINE
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!credencial}
                onClick={() => void enviarHeartbeat("DEGRADED")}
              >
                Heartbeat DEGRADED
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!credencial}
                onClick={() => void enviarHeartbeat("OFFLINE")}
              >
                Equipamento OFFLINE
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!credencial}
                onClick={() => void buscarComandos()}
              >
                Buscar comandos agora
              </Button>
            </div>
          </Secao>
        </div>

        <Secao
          titulo="Troca HTTP crua"
          descricao="Exatamente o que o Windows Service envia e recebe — nada de atalho interno."
          acao={
            trocas.length > 0 ? (
              <Button size="sm" variant="ghost" onClick={() => setTrocas([])}>
                limpar
              </Button>
            ) : undefined
          }
        >
          {trocas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Provisione e digite um PIN para ver as chamadas aparecerem aqui.
            </p>
          ) : (
            <ol className="space-y-3">
              {trocas.map((troca) => (
                <li key={troca.id} className="rounded-md border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Etiqueta
                      tom={troca.status < 300 ? "ok" : troca.status < 500 ? "atencao" : "ruim"}
                    >
                      {troca.status}
                    </Etiqueta>
                    <span className="font-mono text-xs">
                      {troca.metodo} {troca.caminho}
                    </span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                      {horaCurta(troca.hora)}
                    </span>
                  </div>

                  {troca.requisicao === undefined ? null : (
                    <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-4">
                      {JSON.stringify(troca.requisicao, null, 2)}
                    </pre>
                  )}

                  <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-4">
                    {JSON.stringify(troca.resposta, null, 2)}
                  </pre>
                </li>
              ))}
            </ol>
          )}
        </Secao>
      </div>
    </main>
  );
}
