/**
 * Ponte WSS entre o Topdata Gateway e um sistema web hospedado em funcoes serverless.
 *
 * O contrato manda o Gateway abrir uma ligacao WSS permanente com o servidor. Vercel
 * (e qualquer plataforma de funcoes efemeras) nao segura conexao aberta, entao esta
 * ponte assume esse papel: ela e o servidor WebSocket que o Gateway ve, e conversa com
 * o sistema web por HTTPS comum.
 *
 *   Gateway ──WSS──▶ ponte ──HTTPS──▶ sistema web
 *
 * Ela nao guarda segredo nenhum: usa o proprio token que o Gateway envia no handshake,
 * apenas repassando. Se a ponte cair, nada se perde — o Gateway volta a entregar tudo
 * pela fila duravel, e o que fica indisponivel e so o caminho de volta (a liberacao
 * manual da recepcao).
 *
 * Uso:
 *   bun ws-bridge/ponte.ts https://seu-app.vercel.app 8787
 *
 * E no config.json da instalacao:
 *   "webSocketUrl": "ws://maquina-da-ponte:8787/gateway/ws"
 */

const [apiBruta, portaBruta] = process.argv.slice(2);

if (!apiBruta) {
  console.error("uso: bun ws-bridge/ponte.ts <urlDoSistemaWeb> [porta]");
  process.exit(1);
}

const api = apiBruta.replace(/\/+$/, "");
const porta = Number(portaBruta ?? 8787);

/** Intervalo de consulta da fila de comandos. */
const INTERVALO_MS = 1000;

type Ligacao = { token: string; gatewayId: string; relogio?: ReturnType<typeof setInterval> };

/** So o que a ponte usa do socket — evita depender das tipagens do Bun para compilar. */
type Socket = {
  data: Ligacao;
  send: (mensagem: string) => unknown;
  close: (codigo?: number, motivo?: string) => unknown;
};

/**
 * Le o `sub` do JWT sem verificar assinatura — de proposito.
 *
 * Quem valida o token e o sistema web, a cada chamada. A ponte so precisa do id para
 * montar a URL; se o token for falso, as chamadas simplesmente voltam 401 e a ligacao
 * cai. Verificar aqui exigiria dar o segredo do servidor a ponte, que e justamente o
 * que este desenho evita.
 */
function gatewayIdDoToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const conteudo = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { sub?: string };

    return conteudo.sub ?? null;
  } catch {
    return null;
  }
}

Bun.serve({
  port: porta,

  fetch(requisicao: Request, servidor: { upgrade: (r: Request, o: { data: Ligacao }) => boolean }) {
    const url = new URL(requisicao.url);

    if (url.pathname !== "/gateway/ws") {
      return new Response("ponte do Topdata Gateway — use /gateway/ws\n", { status: 404 });
    }

    const cabecalho = requisicao.headers.get("authorization") ?? "";
    const token = cabecalho.toLowerCase().startsWith("bearer ") ? cabecalho.slice(7) : "";
    const gatewayId = token ? gatewayIdDoToken(token) : null;

    if (!gatewayId) {
      return new Response("token ausente ou ilegivel\n", { status: 401 });
    }

    return servidor.upgrade(requisicao, { data: { token, gatewayId } })
      ? undefined
      : new Response("falha no upgrade\n", { status: 400 });
  },

  websocket: {
    open(socket: Socket) {
      console.log(`[ponte] ${socket.data.gatewayId} conectou`);

      socket.data.relogio = setInterval(() => void buscarComandos(socket), INTERVALO_MS);
    },

    async message(socket: Socket, mensagem: unknown) {
      // Tudo que o Gateway manda pelo WebSocket vem no mesmo envelope; o `payload` e o
      // corpo que a rota de eventos espera, sem alteracao.
      let envelope: { type?: string; payload?: unknown };

      try {
        envelope = JSON.parse(String(mensagem)) as { type?: string; payload?: unknown };
      } catch {
        console.warn("[ponte] mensagem ilegivel do Gateway; ignorando");
        return;
      }

      if (!envelope.type) return;

      const resposta = await fetch(`${api}/internal/gateway/${socket.data.gatewayId}/events`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${socket.data.token}`,
          "x-gateway-event-type": envelope.type,
          // A ponte gera a chave porque o envelope do WebSocket nao carrega uma. Um
          // reenvio pelo WebSocket e raro; a fila duravel, que e o caminho com
          // garantia de entrega, traz a chave do proprio Gateway.
          "x-idempotency-key": `ponte-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
        body: JSON.stringify(envelope.payload ?? {}),
      });

      if (resposta.status === 401) fecharPorTokenVencido(socket);
    },

    close(socket: Socket) {
      if (socket.data.relogio) clearInterval(socket.data.relogio);
      console.log(`[ponte] ${socket.data.gatewayId} desconectou`);
    },
  },
});

async function buscarComandos(socket: Socket): Promise<void> {
  try {
    const resposta = await fetch(`${api}/internal/gateway/${socket.data.gatewayId}/commands`, {
      headers: { authorization: `Bearer ${socket.data.token}` },
    });

    if (resposta.status === 401) {
      fecharPorTokenVencido(socket);
      return;
    }

    if (!resposta.ok) return;

    const { commands } = (await resposta.json()) as { commands: unknown[] };

    for (const comando of commands) {
      socket.send(JSON.stringify(comando));
      console.log(`[ponte] comando entregue a ${socket.data.gatewayId}`);
    }
  } catch (erro) {
    // Sistema web fora do ar nao derruba a ponte: o Gateway continua conectado e a
    // proxima volta do laco tenta de novo.
    console.warn(`[ponte] falha ao consultar comandos: ${String(erro)}`);
  }
}

/**
 * Token vencido fecha a ligacao.
 *
 * O Gateway renova o token sozinho e reconecta com recuo exponencial — deixar o socket
 * aberto com um token morto seria pior: ele pareceria saudavel e nao entregaria nada.
 */
function fecharPorTokenVencido(socket: Socket): void {
  console.warn(`[ponte] token de ${socket.data.gatewayId} expirou; fechando para reconexao`);
  socket.close(1011, "token expirado");
}

console.log(`[ponte] ouvindo em ws://localhost:${porta}/gateway/ws -> ${api}`);
