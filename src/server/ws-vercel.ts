/**
 * `wss://<host>/gateway/ws` servido pela API de WebSocket da Vercel.
 *
 * Vercel Functions servem WebSocket sobre Fluid compute, mas o preset da Vercel do Nitro
 * ainda não repassa o WebSocket nativo dele: a função gerada para a rota sai sem nenhum
 * traço de crossws e responde `426` a qualquer aperto de mão. Por isso, publicado, a
 * rota é um handler HTTP comum que faz o upgrade pela API da plataforma.
 *
 * Do lado do Gateway não há diferença nenhuma: mesmo endereço, mesmo `Authorization`,
 * mesmos envelopes. O que muda é apenas quem levanta o socket.
 *
 * Duas consequências da plataforma que valem lembrar:
 *
 *  1. **A ligação morre no limite de duração da função** (60 s no plano Hobby, mais no
 *     Pro). É o esperado, não é falha: o Gateway reconecta sozinho com recuo
 *     exponencial, e nada se perde — o que precisa de garantia de entrega vai pela fila
 *     durável, não por aqui.
 *  2. **Cada conexão fica presa a uma instância.** Um comando enfileirado por
 *     `POST /api/comandos` cai em outra instância, então o armazenamento precisa ser o
 *     Redis: em memória, cada instância enxerga uma fila diferente e o comando some sem
 *     erro nenhum.
 */

import { experimental_upgradeWebSocket, type WebSocketData } from "@vercel/functions";
import { defineHandler } from "nitro";

import {
  autenticarLigacao,
  avisarSeArmazenamentoVolatil,
  iniciarEntregaDeComandos,
  receberDoGateway,
} from "./ws-sessao";

export default defineHandler(async (event) => {
  const request = event.req as unknown as Request;

  const gatewayId = await autenticarLigacao(request);

  // Recusa antes do upgrade: o Gateway trata falha de conexão com recuo exponencial,
  // enquanto uma ligação aceita e morta pareceria saudável e não entregaria nada.
  if (!gatewayId) {
    return new Response("Token ausente, invalido ou expirado.", { status: 401 });
  }

  try {
    return await experimental_upgradeWebSocket((ws) => {
      console.log(`[ws] gateway ${gatewayId} conectado`);
      avisarSeArmazenamentoVolatil();

      const encerrar = iniciarEntregaDeComandos(gatewayId, (mensagem) => ws.send(mensagem));

      ws.on("message", (dados: WebSocketData) => {
        void receberDoGateway(gatewayId, dados.toString());
      });

      ws.on("close", () => {
        encerrar();
        console.log(`[ws] gateway ${gatewayId} desconectado`);
      });

      ws.on("error", (erro: Error) => {
        encerrar();
        console.error(`[ws] erro na ligacao com ${gatewayId}:`, erro);
      });
    });
  } catch (erro) {
    // O upgrade depende da plataforma, não do nosso código: ele falha quando o
    // WebSocket não está habilitado no projeto. Um 500 vazio deixaria quem instala
    // adivinhando; o motivo vai no corpo, e o Gateway agora registra esse corpo no log
    // dele. A ligação cair não interrompe nada do caminho crítico.
    console.error("[ws] a plataforma recusou o upgrade:", erro);

    return new Response(
      JSON.stringify({
        error: "WEBSOCKET_UPGRADE_FAILED",
        detail: erro instanceof Error ? erro.message : String(erro),
      }),
      { status: 501, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
});
