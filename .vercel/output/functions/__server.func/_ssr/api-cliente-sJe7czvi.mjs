import {
  i as useQueryClient,
  n as useQuery,
  t as useMutation,
} from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-cliente-sJe7czvi.js
/** Chamadas do navegador para a API interna do exemplo. */
async function pedir(url, corpo) {
  const resposta = await fetch(url, {
    method: corpo === void 0 ? "GET" : "POST",
    ...(corpo === void 0
      ? {}
      : {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(corpo),
        }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.detail ?? dados.error ?? `HTTP ${resposta.status}`);
  return dados;
}
/**
 * Consulta periodica em vez de push.
 *
 * O caminho natural seria o servidor empurrar o que chega do Gateway, mas uma funcao
 * serverless nao segura conexao aberta — nem WebSocket, nem SSE de longa duracao. Dois
 * segundos e o suficiente para a recepcao ver a catraca reagir.
 */
function usePainel(intervaloMs = 2e3) {
  return useQuery({
    queryKey: ["painel"],
    queryFn: () => pedir("/api/painel"),
    refetchInterval: intervaloMs,
  });
}
function useMutacaoDeAluno() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (acao) => pedir("/api/alunos", acao),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["painel"] }),
  });
}
function useEnvioDeComando() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (comando) => pedir("/api/comandos", comando),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["painel"] }),
  });
}
//#endregion
export { useMutacaoDeAluno as n, usePainel as r, useEnvioDeComando as t };
