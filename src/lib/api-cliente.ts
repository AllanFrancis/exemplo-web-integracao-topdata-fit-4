/** Chamadas do navegador para a API interna do exemplo. */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Acesso, Aluno, ComandoPendente, EventoRegistrado, GatewayConhecido } from "./tipos";

export type EstadoDoPainel = {
  gateways: GatewayConhecido[];
  acessos: Acesso[];
  eventos: EventoRegistrado[];
  alunos: Aluno[];
  comandos: ComandoPendente[];
  ambiente: {
    armazenamento: "memoria" | "redis";
    codigosDeInstalacao: string[];
    reprovisionamentoPermitido: boolean;
  };
  agora: string;
};

async function pedir<T>(url: string, corpo?: unknown): Promise<T> {
  const resposta = await fetch(url, {
    method: corpo === undefined ? "GET" : "POST",
    ...(corpo === undefined
      ? {}
      : { headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) }),
  });

  const dados = (await resposta.json()) as T & { error?: string; detail?: string };

  if (!resposta.ok) {
    throw new Error(dados.detail ?? dados.error ?? `HTTP ${resposta.status}`);
  }

  return dados;
}

/**
 * Consulta periodica em vez de push.
 *
 * O caminho natural seria o servidor empurrar o que chega do Gateway, mas uma funcao
 * serverless nao segura conexao aberta — nem WebSocket, nem SSE de longa duracao. Dois
 * segundos e o suficiente para a recepcao ver a catraca reagir.
 */
export function usePainel(intervaloMs = 2000) {
  return useQuery({
    queryKey: ["painel"],
    queryFn: () => pedir<EstadoDoPainel>("/api/painel"),
    refetchInterval: intervaloMs,
  });
}

export function useMutacaoDeAluno() {
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (
      acao:
        { acao: "salvar"; aluno: Aluno } | { acao: "remover"; id: string } | { acao: "restaurar" },
    ) => pedir<{ alunos: Aluno[] }>("/api/alunos", acao),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["painel"] }),
  });
}

export function useEnvioDeComando() {
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (comando: {
      tipo: "UNLOCK" | "SHOW_MESSAGE";
      gatewayId: string;
      deviceId: string;
      direction?: "ENTRY" | "EXIT" | "BOTH";
      message: string;
    }) => pedir<{ comando: ComandoPendente }>("/api/comandos", comando),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["painel"] }),
  });
}
