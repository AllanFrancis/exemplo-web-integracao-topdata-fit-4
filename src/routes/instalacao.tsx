/** Como apontar um Topdata Gateway de verdade para esta instalacao do sistema web. */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Etiqueta, Secao } from "@/components/comuns";
import { usePainel } from "@/lib/api-cliente";

export const Route = createFileRoute("/instalacao")({
  head: () => ({ meta: [{ title: "Instalacao — integracao Topdata Gateway" }] }),
  component: Instalacao,
});

const ROTAS = [
  ["POST", "/gateway/provision", "Troca o codigo de instalacao pela credencial da instalacao."],
  ["POST", "/gateway/auth", "Credencial vira token de acesso (1 h)."],
  ["POST", "/internal/access/validate", "O caminho critico. Alguem esta parado na catraca."],
  ["POST", "/internal/gateway/{gatewayId}/events", "Fila duravel: heartbeat, desfechos, giros."],
  ["GET", "/gateway/ws", "WebSocket do contrato — indisponivel em serverless (501)."],
] as const;

const MOTIVOS = [
  ["ACCESS_ALLOWED", "ALLOW", "Plano em dia."],
  ["CREDENTIAL_UNKNOWN", "DENY", "PIN nao esta no cadastro."],
  ["STUDENT_BLOCKED", "DENY", "Bloqueado na recepcao."],
  ["PLAN_EXPIRED", "DENY", "Plano vencido."],
  ["PASSBACK_BLOCKED", "DENY", "Mesma pessoa passando duas vezes seguidas."],
] as const;

function Instalacao() {
  const { data } = usePainel(15_000);
  const [origem, setOrigem] = useState("https://seu-app.vercel.app");

  useEffect(() => setOrigem(window.location.origin), []);

  const configuracao = `{
  "Server": {
    "baseUrl": "${origem}",
    "webSocketUrl": "",
    "heartbeatInterval": "00:00:30",
    "allowInvalidCertificates": false
  },
  "Standalone": {
    "mode": "Disabled"
  }
}`;

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <Secao
        titulo="1. Aponte o Gateway para este endereco"
        descricao="Em %ProgramData%\\TopdataGateway\\config.json, na maquina da academia."
      >
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-5">
          {configuracao}
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          O Gateway monta os caminhos a partir de <code className="font-mono text-xs">baseUrl</code>
          , entao ela deve apontar para a raiz — sem barra final e sem sufixo de API. Deixe{" "}
          <code className="font-mono text-xs">webSocketUrl</code> vazio: sem processo persistente,
          este exemplo nao completa o handshake, e o Gateway continua entregando tudo pela fila
          duravel.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Com o <code className="font-mono text-xs">Standalone:Mode</code> diferente de{" "}
          <code className="font-mono text-xs">Disabled</code>, o Gateway decide sozinho e nem chega
          a perguntar — util para testar a catraca sem servidor, e exatamente o que voce nao quer
          aqui.
        </p>
      </Secao>

      <Secao
        titulo="2. Provisione"
        descricao="Uma vez por instalacao. O codigo vira credencial e o Gateway a guarda cifrada por DPAPI."
      >
        <p className="text-sm text-muted-foreground">Codigos aceitos por esta instalacao:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(data?.ambiente.codigosDeInstalacao ?? []).map((codigo) => (
            <Etiqueta key={codigo} tom="ok">
              {codigo}
            </Etiqueta>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Configure-os em <code className="font-mono text-xs">CODIGOS_DE_INSTALACAO</code>. O
          contrato pede que um codigo valha uma unica vez;{" "}
          {data?.ambiente.reprovisionamentoPermitido
            ? "aqui o reprovisionamento esta liberado para facilitar a demonstracao — desligue com PERMITIR_REPROVISIONAMENTO=false."
            : "aqui o reprovisionamento esta desligado, como em producao."}
        </p>
      </Secao>

      <Secao
        titulo="Rotas que o Gateway usa"
        descricao="Espelho de docs/access-gateway-protocol.md."
      >
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {ROTAS.map(([metodo, caminho, nota]) => (
              <tr key={caminho}>
                <td className="w-16 py-2 font-mono text-xs text-muted-foreground">{metodo}</td>
                <td className="py-2 pr-3 font-mono text-xs break-all">{caminho}</td>
                <td className="py-2 text-muted-foreground">{nota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Secao>

      <Secao
        titulo="Motivos que este servidor devolve"
        descricao="reasonCode e opaco para o Gateway: ele registra em log e escolhe a mensagem, nunca decide por ele."
      >
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {MOTIVOS.map(([codigo, decisao, nota]) => (
              <tr key={codigo}>
                <td className="py-2 pr-3 font-mono text-xs">{codigo}</td>
                <td className="py-2 pr-3">
                  <Etiqueta tom={decisao === "ALLOW" ? "ok" : "ruim"}>{decisao}</Etiqueta>
                </td>
                <td className="py-2 text-muted-foreground">{nota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Secao>

      <Secao
        titulo="3. Comandos para a catraca (opcional)"
        descricao="A liberacao manual da recepcao so chega ao equipamento pelo WebSocket."
      >
        <p className="text-sm text-muted-foreground">
          Funcoes serverless nao seguram conexao aberta. Para ter o caminho de volta com um Gateway
          de verdade, rode a ponte em <code className="font-mono text-xs">ws-bridge/</code> numa
          maquina da academia ou num servidor comum, e aponte{" "}
          <code className="font-mono text-xs">webSocketUrl</code> para ela. A ponte fala WSS com o
          Gateway e HTTPS com este sistema, sem nenhum segredo novo — ela apenas repassa o token que
          o proprio Gateway envia.
        </p>
      </Secao>
    </main>
  );
}
