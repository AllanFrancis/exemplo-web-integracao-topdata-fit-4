# Sistema web de exemplo — integração Topdata Gateway

Implementação de referência do **lado servidor** da integração com o
[Topdata Gateway](../README.md), a ponte entre a catraca **Topdata FIT 4** e um sistema
web de controle de acesso.

O Gateway já existe e já sabe conversar. O que faltava era o outro lado. Este projeto é
esse outro lado, no menor tamanho em que ele ainda é honesto: implementa o protocolo
inteiro do caminho crítico, roda de verdade, e serve de ponto de partida para quem for
escrever o sistema real — em qualquer linguagem.

> **O princípio que organiza tudo:** o sistema web decide, o Gateway executa. O Gateway
> não conhece plano, mensalidade, contrato nem matrícula, e nunca deve passar a conhecer.
> A única pergunta que ele faz é _"esta credencial pode entrar?"_.

## Como rodar

```bash
bun install
bun run dev            # http://localhost:3000
```

Sem hardware e sem configuração: abra **Simulador**, clique em _Provisionar_, digite
`583921` e confirme. A catraca inteira acontece no navegador, com as chamadas HTTP reais
aparecendo cruas ao lado.

Para conferir uma instalação por linha de comando — a local ou a que já está publicada:

```bash
bun run simular http://localhost:3000
bun run simular https://seu-app.vercel.app AB73-KL92 583921 471002
```

O script faz o que o Windows Service faz no primeiro minuto de vida e verifica o que o
Gateway exige da resposta: eco do `eventId`, mensagem que cabe em 16 colunas ASCII,
resposta abaixo de 3 s, `401` no token inválido, deduplicação por `X-Idempotency-Key`.

## As telas

| Tela           | O que mostra                                                                               |
| -------------- | ------------------------------------------------------------------------------------------ |
| **Painel**     | Gateways e equipamentos ao vivo, acessos recentes, fila de comandos. É a tela da recepção. |
| **Simulador**  | Uma catraca de mentira que fala HTTP de verdade, com a troca crua ao lado.                 |
| **Alunos**     | O cadastro que produz cada `reasonCode`. Editável.                                         |
| **Trilha**     | Tudo que o Gateway mandou, sem interpretação, com o payload original.                      |
| **Instalação** | O `config.json` pronto para copiar, já com o endereço desta instalação.                    |

## O que o servidor precisa implementar

Estas são as quatro rotas do contrato ([`docs/access-gateway-protocol.md`](../docs/access-gateway-protocol.md)),
espelhadas em [`src/lib/protocolo.ts`](src/lib/protocolo.ts):

| Rota                                 | Arquivo                                                       | Papel                                                                   |
| ------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `POST /gateway/provision`            | [provision.ts](src/routes/gateway/provision.ts)               | Código de instalação vira credencial própria da instalação. Uma vez só. |
| `POST /gateway/auth`                 | [auth.ts](src/routes/gateway/auth.ts)                         | Credencial vira token de acesso.                                        |
| `POST /internal/access/validate`     | [validate.ts](src/routes/internal/access/validate.ts)         | **O caminho crítico.** Alguém está parado na catraca.                   |
| `POST /internal/gateway/{id}/events` | [events.ts](src/routes/internal/gateway/$gatewayId/events.ts) | Fila durável: heartbeat, desfechos, giros, resultados de comando.       |

Toda conexão parte do Gateway — o servidor nunca abre conexão para o IP da academia. É
o que dispensa NAT e port forwarding no roteador do cliente.

### Os detalhes que quebram a integração se forem esquecidos

1. **Ecoe o `eventId` na resposta da validação.** O Gateway confere e descarta o que não
   corresponde à tentativa em aberto. Sem o eco, uma resposta atrasada libera a catraca
   para a próxima pessoa da fila.
2. **Responda rápido.** O corte é 3 s e a política é _fail-closed_: sem resposta, o
   Gateway **nega** e mantém o bloqueio. Nada de trabalho pesado nesse handler.
3. **`message` tem 16 colunas, ASCII, sem acento.** O display é de 2×16. `PLANO VENCIDO`
   cabe; `Seu plano está vencido, procure a recepção` vira lixo truncado.
4. **`401` significa "renove o token".** O Gateway renova e repete a chamada uma única
   vez. Devolver 403 ou 500 no lugar transforma token vencido em catraca travada.
5. **`X-Idempotency-Key` deduplica.** Se a resposta se perder, o mesmo item volta —
   aceitar duas vezes duplica a trilha de acesso da academia. Duplicata responde `200`.
6. **Nunca registre o PIN inteiro.** O corpo de `/internal/access/validate` é o único
   lugar do sistema em que ele trafega. Aqui a trilha guarda `***921`.
7. **`reasonCode` é opaco para o Gateway.** Ele registra em log e escolhe a mensagem;
   nunca decide a liberação por ele. Invente os códigos que fizerem sentido no seu
   negócio.
8. **`ALLOW` com `executed: false` é um caso real.** O servidor autorizou e o
   equipamento não girou. A recepção precisa enxergar isso — o painel mostra.

## Ligando um Gateway de verdade

Em `%ProgramData%\TopdataGateway\config.json`, na máquina da academia:

```json
{
  "Server": {
    "baseUrl": "https://seu-app.vercel.app",
    "webSocketUrl": "",
    "heartbeatInterval": "00:00:30"
  },
  "Standalone": { "mode": "Disabled" }
}
```

`baseUrl` aponta para a raiz, sem barra final — o Gateway monta os caminhos a partir
dela. `Standalone:Mode` diferente de `Disabled` faz o Gateway decidir sozinho e nem
chegar a perguntar.

Depois, provisione com um dos códigos aceitos (`AB73-KL92` e `DEMO-0001` por padrão) e
o Gateway aparece no painel.

## WebSocket, e por que ele não está aqui

O contrato prevê uma ligação WSS permanente para os comandos que vão do servidor para a
catraca — a liberação manual da recepção. **Funções serverless não seguram conexão
aberta**, então `/gateway/ws` responde `501` com a explicação, em vez de deixar o
Gateway numa reconexão silenciosa e eterna.

Isso não quebra nada do caminho crítico: sem WebSocket, o Gateway entrega tudo pela fila
durável em disco, e a validação de acesso nunca dependeu dele. O que se perde é só o
caminho de volta.

Para ter os dois lados, rode a ponte:

```bash
bun run ponte https://seu-app.vercel.app 8787
```

E aponte `"webSocketUrl": "ws://maquina-da-ponte:8787/gateway/ws"` no `config.json`. A
ponte ([`ws-bridge/ponte.ts`](ws-bridge/ponte.ts)) é o servidor WebSocket que o Gateway
vê, e conversa com este sistema por HTTPS comum. Ela não guarda segredo nenhum: repassa
o próprio token que o Gateway envia no handshake.

Num servidor com processo persistente (uma VM, um contêiner, Fly, Railway), nada disso é
necessário — implemente `/gateway/ws` direto e apague a ponte.

## Armazenamento

Dois back-ends, mesma interface ([`armazenamento.ts`](src/server/armazenamento.ts)):

- **memória** (padrão) — some quando a instância recicla. Serve para desenvolver e
  demonstrar; o painel avisa em faixa amarela quando está nesse modo.
- **Redis** — usado automaticamente quando `KV_REST_API_URL` e `KV_REST_API_TOKEN`
  existem no ambiente (Upstash, Vercel KV). Falado pela API REST com `fetch`, sem
  dependência nova.

A credencial da instalação **não** é guardada: ela é derivada por HMAC do `gatewayId`
([`credenciais.ts`](src/server/credenciais.ts)), e a verificação recalcula o mesmo valor.
É o que faz o exemplo autenticar sem banco. Num sistema de verdade, sorteie um segredo,
guarde o _hash_ dele e revogue quando precisar — o Gateway não percebe diferença.

## Variáveis de ambiente

| Variável                                | Padrão                | Para quê                                                               |
| --------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| `GATEWAY_SIGNING_SECRET`                | valor de demonstração | Assina token e deriva o segredo da instalação. **Defina em produção.** |
| `CODIGOS_DE_INSTALACAO`                 | `AB73-KL92,DEMO-0001` | Códigos aceitos no provisionamento.                                    |
| `PERMITIR_REPROVISIONAMENTO`            | `true`                | `false` faz o código valer uma única vez, como manda o contrato.       |
| `NOME_DA_ACADEMIA`                      | `Academia Exemplo`    | Vai no `tenantName` da resposta de provisionamento.                    |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | —                     | Ligam o armazenamento em Redis.                                        |

## O que este exemplo não é

Um sistema de produção. Faltam, de propósito: autenticação de usuário nas telas e na API
interna, controle de acesso por academia, multi-tenant de verdade, retenção e paginação
da trilha, e transação no lugar de leitura-modificação-escrita. Cada um desses é uma
decisão do sistema real — e nenhum deles muda uma linha do protocolo com o Gateway, que
é o que este repositório existe para mostrar.

## Estrutura

```
src/lib/protocolo.ts            espelho de ProtocolContracts.cs
src/lib/tipos.ts                modelos do sistema web (o Gateway nunca os vê)
src/server/credenciais.ts       identidade da instalação e JWT
src/server/academia.ts          alunos, planos e a decisão de acesso
src/server/estado.ts            gateways, trilha, acessos, fila de comandos
src/server/armazenamento.ts     memória | Redis
src/routes/gateway/*            provisionamento, autenticação, WebSocket
src/routes/internal/*           validação e entrada de eventos
src/routes/api/*                API interna das telas (fora do contrato)
scripts/simular-gateway.ts      Gateway de mentira, em linha de comando
ws-bridge/ponte.ts              WSS para o Gateway, HTTPS para este sistema
```

Feito com TanStack Start + React + Tailwind, publicado na Vercel. Nada da integração
depende dessa escolha: as quatro rotas são HTTP comum.
