/**
 * Gateway de mentira, em linha de comando.
 *
 * Faz o mesmo que o Windows Service faz no primeiro minuto de vida: provisiona,
 * autentica, valida um PIN e relata o desfecho. Serve para conferir uma instalacao do
 * sistema web — local ou ja publicada — sem depender de navegador nem de catraca.
 *
 *   bun scripts/simular-gateway.ts http://localhost:3000 AB73-KL92 583921
 *
 * O ultimo argumento pode se repetir: cada PIN vira uma passagem.
 */

const [baseBruta, codigo = "AB73-KL92", ...pins] = process.argv.slice(2);

if (!baseBruta) {
  console.error("uso: bun scripts/simular-gateway.ts <baseUrl> [codigo] [pin...]");
  process.exit(1);
}

const base = baseBruta.replace(/\/+$/, "");
const deviceId = "11111111-1111-4111-8111-111111111111";
const versao = "0.1.0-script";

let falhas = 0;

function mostrar(rotulo: string, ok: boolean, detalhe: string): void {
  if (!ok) falhas++;
  console.log(`${ok ? "  ok " : " FALHA"} ${rotulo.padEnd(34)} ${detalhe}`);
}

async function pedir<T>(
  metodo: string,
  caminho: string,
  opcoes: { corpo?: unknown; token?: string; cabecalhos?: Record<string, string> } = {},
): Promise<{ status: number; dados: T }> {
  const resposta = await fetch(`${base}${caminho}`, {
    method: metodo,
    headers: {
      ...(opcoes.corpo === undefined ? {} : { "content-type": "application/json" }),
      ...(opcoes.token ? { authorization: `Bearer ${opcoes.token}` } : {}),
      ...opcoes.cabecalhos,
    },
    ...(opcoes.corpo === undefined ? {} : { body: JSON.stringify(opcoes.corpo) }),
  });

  const texto = await resposta.text();

  try {
    return { status: resposta.status, dados: JSON.parse(texto) as T };
  } catch {
    return { status: resposta.status, dados: texto as T };
  }
}

console.log(`\nGateway de mentira -> ${base}\n`);

// 1. Provisionamento: o codigo de instalacao vira a credencial desta instalacao.
const provisao = await pedir<{ gatewayId: string; gatewaySecret: string; tenantName?: string }>(
  "POST",
  "/gateway/provision",
  { corpo: { installationCode: codigo, machineName: "SCRIPT-TESTE", gatewayVersion: versao } },
);

mostrar(
  "POST /gateway/provision",
  provisao.status === 200 && Boolean(provisao.dados.gatewayId),
  `${provisao.status} ${provisao.dados.tenantName ?? ""}`,
);

if (provisao.status !== 200) {
  console.error(provisao.dados);
  process.exit(1);
}

const { gatewayId, gatewaySecret } = provisao.dados;

// 2. Autenticacao.
const autenticacao = await pedir<{ accessToken: string; expiresInSeconds: number }>(
  "POST",
  "/gateway/auth",
  { corpo: { gatewayId, gatewaySecret, gatewayVersion: versao } },
);

mostrar(
  "POST /gateway/auth",
  autenticacao.status === 200 && Boolean(autenticacao.dados.accessToken),
  `${autenticacao.status} expira em ${autenticacao.dados.expiresInSeconds}s`,
);

const token = autenticacao.dados.accessToken;

// Segredo errado precisa ser 401 — e o unico status que faz o Gateway renovar e repetir.
const recusa = await pedir("POST", "/gateway/auth", {
  corpo: { gatewayId, gatewaySecret: "segredo-errado", gatewayVersion: versao },
});
mostrar("segredo invalido devolve 401", recusa.status === 401, String(recusa.status));

const semToken = await pedir("POST", "/internal/access/validate", {
  corpo: {
    eventId: crypto.randomUUID(),
    gatewayId,
    deviceId,
    credentialType: "PIN",
    credential: "000000",
    direction: "ENTRY",
    occurredAt: new Date().toISOString(),
  },
});
mostrar("validacao sem token devolve 401", semToken.status === 401, String(semToken.status));

let sequencia = 0;

async function enviarEvento(tipo: string, payload: unknown, chave?: string): Promise<number> {
  const idempotencia = chave ?? `${Date.now()}-${String(++sequencia).padStart(6, "0")}`;

  const { status } = await pedir(`POST`, `/internal/gateway/${gatewayId}/events`, {
    corpo: payload,
    token,
    cabecalhos: { "x-gateway-event-type": tipo, "x-idempotency-key": idempotencia },
  });

  return status;
}

// 3. Heartbeat: e o que faz o equipamento aparecer no painel.
mostrar(
  "HEARTBEAT",
  (await enviarEvento("HEARTBEAT", {
    gatewayId,
    version: versao,
    status: "ONLINE",
    pendingEvents: 0,
    devices: [{ deviceId, status: "ONLINE", firmwareVersion: "L7.06.12" }],
  })) === 200,
  "equipamento reportado ONLINE",
);

// 4. O caminho critico, uma vez por PIN.
for (const pin of pins.length > 0 ? pins : ["583921", "471002", "000000"]) {
  const eventId = crypto.randomUUID();
  const inicio = Date.now();

  const validacao = await pedir<{
    decision: string;
    eventId: string;
    reasonCode: string;
    message: string;
    studentName?: string;
  }>("POST", "/internal/access/validate", {
    token,
    corpo: {
      eventId,
      gatewayId,
      deviceId,
      credentialType: "PIN",
      credential: pin,
      direction: "ENTRY",
      occurredAt: new Date().toISOString(),
    },
  });

  const decorrido = Date.now() - inicio;

  mostrar(
    `validacao do PIN ***${pin.slice(-3)}`,
    validacao.status === 200,
    `${validacao.dados.decision} ${validacao.dados.reasonCode} "${validacao.dados.message}" (${decorrido} ms)`,
  );

  // O eco do eventId e o que impede uma resposta atrasada de liberar a catraca para a
  // proxima pessoa da fila.
  mostrar(
    "  eventId ecoado",
    validacao.dados.eventId === eventId,
    validacao.dados.eventId ?? "ausente",
  );

  // O display tem 16 colunas e nao mostra acento.
  const mensagem = validacao.dados.message ?? "";
  mostrar(
    "  mensagem cabe no display",
    mensagem.length <= 16 && /^[\x20-\x7E]*$/.test(mensagem),
    `${mensagem.length} colunas`,
  );

  // 3 s e o corte do Gateway: passou disso, ele nega e mantem o bloqueio.
  mostrar("  respondeu dentro de 3 s", decorrido < 3000, `${decorrido} ms`);

  const liberou = validacao.dados.decision === "ALLOW";

  await enviarEvento("ACCESS_OUTCOME", {
    eventId,
    deviceId,
    decision: validacao.dados.decision,
    executed: liberou,
    reasonCode: validacao.dados.reasonCode,
    errorCode: null,
    completedAt: new Date().toISOString(),
  });

  if (liberou) {
    await enviarEvento("PASSAGE_CONFIRMED", {
      deviceId,
      eventId,
      direction: "ENTRY",
      occurredAt: new Date().toISOString(),
    });
  }
}

// 5. Idempotencia: o mesmo item reenviado nao pode virar duas linhas na trilha.
const chave = `teste-${Date.now()}`;
const passagem = {
  deviceId,
  eventId: crypto.randomUUID(),
  direction: "ENTRY",
  occurredAt: new Date().toISOString(),
};

const primeira = await enviarEvento("PASSAGE_EXPIRED", passagem, chave);
const repetida = await enviarEvento("PASSAGE_EXPIRED", passagem, chave);

mostrar(
  "reenvio deduplicado por chave",
  primeira === 200 && repetida === 200,
  "as duas respondem 200; a segunda nao grava",
);

const tipoInvalido = await pedir("POST", `/internal/gateway/${gatewayId}/events`, {
  corpo: {},
  token,
  cabecalhos: { "x-gateway-event-type": "NAO_EXISTE" },
});
mostrar(
  "tipo de evento desconhecido e 400",
  tipoInvalido.status === 400,
  String(tipoInvalido.status),
);

console.log(
  falhas === 0
    ? "\nTudo certo. Abra o painel para ver os acessos.\n"
    : `\n${falhas} verificacao(oes) falharam.\n`,
);

process.exit(falhas === 0 ? 0 : 1);
