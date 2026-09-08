/**
 * `POST /gateway/provision` — secao 1 do contrato.
 *
 * Troca unica do codigo de instalacao pela credencial propria da instalacao. E a unica
 * rota do protocolo que nao exige token: a autenticacao e justamente o que se obtem
 * aqui. O Gateway grava o segredo cifrado por DPAPI e nunca mais o mostra.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import type { ProvisionResponse } from "../../lib/protocolo";
import { gatewayIdDoCodigo, segredoDoGateway } from "../../server/credenciais";
import { registrarEvento, salvarGateway, lerGateways } from "../../server/estado";
import { erro, json, lerCorpo } from "../../server/http";
import { codigoEhValido, consumirCodigo } from "../../server/instalacao";

const schema = z.object({
  installationCode: z.string().min(1),
  machineName: z.string().min(1),
  gatewayVersion: z.string().min(1),
});

const NOME_DA_ACADEMIA = process.env["NOME_DA_ACADEMIA"] ?? "Academia Exemplo";

export const Route = createFileRoute("/gateway/provision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const corpo = await lerCorpo(request, schema);
        if (!corpo.ok) return corpo.resposta;

        const { installationCode, machineName, gatewayVersion } = corpo.dados;

        // Codigo errado e codigo ja usado sao respostas diferentes de proposito: quem
        // instala precisa saber se digitou errado ou se o codigo ja foi gasto.
        if (!codigoEhValido(installationCode)) {
          return erro(404, "INSTALLATION_CODE_UNKNOWN", "Codigo de instalacao nao existe.");
        }

        const gatewayId = await gatewayIdDoCodigo(installationCode);

        const consumo = await consumirCodigo(installationCode, {
          gatewayId,
          usadoEm: new Date().toISOString(),
          machineName,
        });

        if (!consumo.ok) {
          return erro(409, "INSTALLATION_CODE_USED", "Codigo de instalacao ja foi utilizado.");
        }

        const existente = (await lerGateways()).find((item) => item.gatewayId === gatewayId);

        await salvarGateway({
          gatewayId,
          gatewayName: existente?.gatewayName ?? "Recepcao",
          tenantName: NOME_DA_ACADEMIA,
          machineName,
          version: gatewayVersion,
          provisionadoEm: existente?.provisionadoEm ?? new Date().toISOString(),
          dispositivos: existente?.dispositivos ?? [],
        });

        await registrarEvento(
          gatewayId,
          "ACCESS_VALIDATE",
          { installationCode, machineName, gatewayVersion },
          `Gateway provisionado a partir de ${machineName} (versao ${gatewayVersion})`,
        );

        const resposta: ProvisionResponse = {
          gatewayId,
          gatewaySecret: await segredoDoGateway(gatewayId),
          tenantName: NOME_DA_ACADEMIA,
          gatewayName: "Recepcao",
        };

        return json(resposta);
      },
    },
  },
});
