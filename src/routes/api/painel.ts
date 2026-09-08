/**
 * `GET /api/painel` — tudo que as telas do exemplo mostram, numa chamada so.
 *
 * Nao faz parte do contrato com o Gateway: e a API interna do sistema web. Numa
 * aplicacao de verdade estaria atras do login da academia; aqui fica aberta de
 * proposito, para o exemplo poder ser aberto e entendido sem cadastro.
 */

import { createFileRoute } from "@tanstack/react-router";

import { lerAlunos } from "../../server/academia";
import { backendDeArmazenamento } from "../../server/armazenamento";
import { lerAcessos, lerComandos, lerEventos, lerGateways } from "../../server/estado";
import { json } from "../../server/http";
import { codigosDeInstalacao, permiteReprovisionamento } from "../../server/instalacao";

export const Route = createFileRoute("/api/painel")({
  server: {
    handlers: {
      GET: async () => {
        const [gateways, acessos, eventos, alunos, comandos] = await Promise.all([
          lerGateways(),
          lerAcessos(),
          lerEventos(60),
          lerAlunos(),
          lerComandos(),
        ]);

        return json(
          {
            gateways,
            acessos,
            eventos,
            alunos,
            comandos,
            ambiente: {
              armazenamento: backendDeArmazenamento,
              codigosDeInstalacao: codigosDeInstalacao(),
              reprovisionamentoPermitido: permiteReprovisionamento(),
            },
            agora: new Date().toISOString(),
          },
          200,
          // A tela consulta a cada 2 s: nada aqui pode ficar em cache de borda.
          { "cache-control": "no-store" },
        );
      },
    },
  },
});
