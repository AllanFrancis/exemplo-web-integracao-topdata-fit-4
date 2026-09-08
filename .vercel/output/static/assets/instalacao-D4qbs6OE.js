import { r as e } from "./api-cliente-DDe_2c6f.js";
import { S as t, b as n, x as r } from "./index-DWOhH6yC.js";
import { n as i, r as a } from "./comuns-DP84_GW8.js";
var o = t(r()),
  s = n(),
  c = [
    [`POST`, `/gateway/provision`, `Troca o codigo de instalacao pela credencial da instalacao.`],
    [`POST`, `/gateway/auth`, `Credencial vira token de acesso (1 h).`],
    [`POST`, `/internal/access/validate`, `O caminho critico. Alguem esta parado na catraca.`],
    [`POST`, `/internal/gateway/{gatewayId}/events`, `Fila duravel: heartbeat, desfechos, giros.`],
    [`GET`, `/gateway/ws`, `WebSocket do contrato — indisponivel em serverless (501).`],
  ],
  l = [
    [`ACCESS_ALLOWED`, `ALLOW`, `Plano em dia.`],
    [`CREDENTIAL_UNKNOWN`, `DENY`, `PIN nao esta no cadastro.`],
    [`STUDENT_BLOCKED`, `DENY`, `Bloqueado na recepcao.`],
    [`PLAN_EXPIRED`, `DENY`, `Plano vencido.`],
    [`PASSBACK_BLOCKED`, `DENY`, `Mesma pessoa passando duas vezes seguidas.`],
  ];
function u() {
  let { data: t } = e(15e3),
    [n, r] = (0, o.useState)(`https://seu-app.vercel.app`);
  return (
    (0, o.useEffect)(() => r(window.location.origin), []),
    (0, s.jsxs)(`main`, {
      className: `mx-auto max-w-4xl space-y-4 px-4 py-6`,
      children: [
        (0, s.jsxs)(a, {
          titulo: `1. Aponte o Gateway para este endereco`,
          descricao: `Em %ProgramData%\\\\TopdataGateway\\\\config.json, na maquina da academia.`,
          children: [
            (0, s.jsx)(`pre`, {
              className: `overflow-x-auto rounded-md bg-muted p-3 text-xs leading-5`,
              children: `{
  "Server": {
    "baseUrl": "${n}",
    "webSocketUrl": "",
    "heartbeatInterval": "00:00:30",
    "allowInvalidCertificates": false
  },
  "Standalone": {
    "mode": "Disabled"
  }
}`,
            }),
            (0, s.jsxs)(`p`, {
              className: `mt-3 text-sm text-muted-foreground`,
              children: [
                `O Gateway monta os caminhos a partir de `,
                (0, s.jsx)(`code`, { className: `font-mono text-xs`, children: `baseUrl` }),
                `, entao ela deve apontar para a raiz — sem barra final e sem sufixo de API. Deixe`,
                ` `,
                (0, s.jsx)(`code`, { className: `font-mono text-xs`, children: `webSocketUrl` }),
                ` vazio: sem processo persistente, este exemplo nao completa o handshake, e o Gateway continua entregando tudo pela fila duravel.`,
              ],
            }),
            (0, s.jsxs)(`p`, {
              className: `mt-2 text-sm text-muted-foreground`,
              children: [
                `Com o `,
                (0, s.jsx)(`code`, { className: `font-mono text-xs`, children: `Standalone:Mode` }),
                ` diferente de`,
                ` `,
                (0, s.jsx)(`code`, { className: `font-mono text-xs`, children: `Disabled` }),
                `, o Gateway decide sozinho e nem chega a perguntar — util para testar a catraca sem servidor, e exatamente o que voce nao quer aqui.`,
              ],
            }),
          ],
        }),
        (0, s.jsxs)(a, {
          titulo: `2. Provisione`,
          descricao: `Uma vez por instalacao. O codigo vira credencial e o Gateway a guarda cifrada por DPAPI.`,
          children: [
            (0, s.jsx)(`p`, {
              className: `text-sm text-muted-foreground`,
              children: `Codigos aceitos por esta instalacao:`,
            }),
            (0, s.jsx)(`div`, {
              className: `mt-2 flex flex-wrap gap-2`,
              children: (t?.ambiente.codigosDeInstalacao ?? []).map((e) =>
                (0, s.jsx)(i, { tom: `ok`, children: e }, e),
              ),
            }),
            (0, s.jsxs)(`p`, {
              className: `mt-3 text-sm text-muted-foreground`,
              children: [
                `Configure-os em `,
                (0, s.jsx)(`code`, {
                  className: `font-mono text-xs`,
                  children: `CODIGOS_DE_INSTALACAO`,
                }),
                `. O contrato pede que um codigo valha uma unica vez;`,
                ` `,
                t?.ambiente.reprovisionamentoPermitido
                  ? `aqui o reprovisionamento esta liberado para facilitar a demonstracao — desligue com PERMITIR_REPROVISIONAMENTO=false.`
                  : `aqui o reprovisionamento esta desligado, como em producao.`,
              ],
            }),
          ],
        }),
        (0, s.jsx)(a, {
          titulo: `Rotas que o Gateway usa`,
          descricao: `Espelho de docs/access-gateway-protocol.md.`,
          children: (0, s.jsx)(`table`, {
            className: `w-full text-sm`,
            children: (0, s.jsx)(`tbody`, {
              className: `divide-y divide-border`,
              children: c.map(([e, t, n]) =>
                (0, s.jsxs)(
                  `tr`,
                  {
                    children: [
                      (0, s.jsx)(`td`, {
                        className: `w-16 py-2 font-mono text-xs text-muted-foreground`,
                        children: e,
                      }),
                      (0, s.jsx)(`td`, {
                        className: `py-2 pr-3 font-mono text-xs break-all`,
                        children: t,
                      }),
                      (0, s.jsx)(`td`, { className: `py-2 text-muted-foreground`, children: n }),
                    ],
                  },
                  t,
                ),
              ),
            }),
          }),
        }),
        (0, s.jsx)(a, {
          titulo: `Motivos que este servidor devolve`,
          descricao: `reasonCode e opaco para o Gateway: ele registra em log e escolhe a mensagem, nunca decide por ele.`,
          children: (0, s.jsx)(`table`, {
            className: `w-full text-sm`,
            children: (0, s.jsx)(`tbody`, {
              className: `divide-y divide-border`,
              children: l.map(([e, t, n]) =>
                (0, s.jsxs)(
                  `tr`,
                  {
                    children: [
                      (0, s.jsx)(`td`, { className: `py-2 pr-3 font-mono text-xs`, children: e }),
                      (0, s.jsx)(`td`, {
                        className: `py-2 pr-3`,
                        children: (0, s.jsx)(i, {
                          tom: t === `ALLOW` ? `ok` : `ruim`,
                          children: t,
                        }),
                      }),
                      (0, s.jsx)(`td`, { className: `py-2 text-muted-foreground`, children: n }),
                    ],
                  },
                  e,
                ),
              ),
            }),
          }),
        }),
        (0, s.jsx)(a, {
          titulo: `3. Comandos para a catraca (opcional)`,
          descricao: `A liberacao manual da recepcao so chega ao equipamento pelo WebSocket.`,
          children: (0, s.jsxs)(`p`, {
            className: `text-sm text-muted-foreground`,
            children: [
              `Funcoes serverless nao seguram conexao aberta. Para ter o caminho de volta com um Gateway de verdade, rode a ponte em `,
              (0, s.jsx)(`code`, { className: `font-mono text-xs`, children: `ws-bridge/` }),
              ` numa maquina da academia ou num servidor comum, e aponte`,
              ` `,
              (0, s.jsx)(`code`, { className: `font-mono text-xs`, children: `webSocketUrl` }),
              ` para ela. A ponte fala WSS com o Gateway e HTTPS com este sistema, sem nenhum segredo novo — ela apenas repassa o token que o proprio Gateway envia.`,
            ],
          }),
        }),
      ],
    })
  );
}
export { u as component };
