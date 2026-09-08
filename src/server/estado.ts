/**
 * O que o sistema web guarda sobre os Gateways: quem se provisionou, o que chegou
 * pela trilha de eventos, quais acessos foram decididos e quais comandos aguardam
 * entrega.
 *
 * Tudo aqui e leitura-modificacao-escrita simples, sem transacao. Num sistema de
 * verdade isso e um `UPDATE` no banco; no exemplo, o objetivo e que o codigo caiba na
 * cabeca de quem esta portando a integracao.
 */

import type { TipoEvento } from "../lib/protocolo";
import type {
  Acesso,
  ComandoPendente,
  DispositivoConhecido,
  EventoRegistrado,
  GatewayConhecido,
} from "../lib/tipos";
import { empilhar, gravar, ler, listar } from "./armazenamento";

const CHAVE_GATEWAYS = "gateways";
const CHAVE_EVENTOS = "eventos";
const CHAVE_ACESSOS = "acessos";
const CHAVE_COMANDOS = "comandos";

export const LIMITE_DE_EVENTOS = 200;
export const LIMITE_DE_ACESSOS = 100;

// -------------------------------------------------------------------- gateways

export async function lerGateways(): Promise<GatewayConhecido[]> {
  return (await ler<GatewayConhecido[]>(CHAVE_GATEWAYS)) ?? [];
}

export async function salvarGateway(gateway: GatewayConhecido): Promise<void> {
  const gateways = await lerGateways();
  const outros = gateways.filter((item) => item.gatewayId !== gateway.gatewayId);

  await gravar(CHAVE_GATEWAYS, [gateway, ...outros]);
}

/**
 * Devolve o registro do Gateway, criando um se ele nao existir.
 *
 * Parece indulgente, mas nao e: quem chega aqui ja apresentou um token valido, e o
 * token *e* a prova de identidade. Exigir um registro previo criava um jeito silencioso
 * de ficar cego — o provisionamento acontece uma unica vez, entao qualquer perda do
 * registro (instancia reciclada, memoria de outra instancia, banco recriado) deixava o
 * Gateway mandando heartbeat para sempre sem nunca reaparecer no painel.
 */
async function garantirGateway(gatewayId: string): Promise<GatewayConhecido> {
  const existente = (await lerGateways()).find((item) => item.gatewayId === gatewayId);
  if (existente) return existente;

  const novo: GatewayConhecido = {
    gatewayId,
    gatewayName: "Recepcao",
    tenantName: process.env["NOME_DA_ACADEMIA"] ?? "Academia Exemplo",
    provisionadoEm: new Date().toISOString(),
    dispositivos: [],
  };

  await salvarGateway(novo);
  return novo;
}

/**
 * Atualiza o que o heartbeat traz. Os dispositivos sao *mesclados*, nunca substituidos:
 * um heartbeat parcial nao pode apagar da tela um equipamento que existe.
 */
export async function registrarContato(
  gatewayId: string,
  dados: {
    version?: string;
    status?: string;
    pendingEvents?: number;
    dispositivos?: DispositivoConhecido[];
  },
): Promise<void> {
  const gateway = await garantirGateway(gatewayId);

  const porId = new Map(gateway.dispositivos.map((d) => [d.deviceId, d]));
  for (const dispositivo of dados.dispositivos ?? []) {
    porId.set(dispositivo.deviceId, { ...porId.get(dispositivo.deviceId), ...dispositivo });
  }

  await salvarGateway({
    ...gateway,
    ...(dados.version ? { version: dados.version } : {}),
    ...(dados.status ? { status: dados.status } : {}),
    ...(dados.pendingEvents === undefined ? {} : { pendingEvents: dados.pendingEvents }),
    ultimoContatoEm: new Date().toISOString(),
    dispositivos: [...porId.values()],
  });
}

/**
 * Um dispositivo aparece na tela na primeira vez que e citado, sem cadastro previo.
 * O `deviceId` nasce no `config.json` da instalacao — exigir cadastro antes seria
 * transformar um erro de digitacao numa catraca invisivel.
 */
export async function garantirDispositivo(gatewayId: string, deviceId: string): Promise<void> {
  const gateway = await garantirGateway(gatewayId);
  if (gateway.dispositivos.some((d) => d.deviceId === deviceId)) return;

  await salvarGateway({
    ...gateway,
    dispositivos: [...gateway.dispositivos, { deviceId, status: "UNKNOWN" }],
  });
}

// --------------------------------------------------------------------- eventos

export async function registrarEvento(
  gatewayId: string,
  tipo: TipoEvento | "ACCESS_VALIDATE",
  payload: unknown,
  resumo: string,
): Promise<void> {
  const evento: EventoRegistrado = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gatewayId,
    tipo,
    recebidoEm: new Date().toISOString(),
    payload,
    resumo,
  };

  await empilhar(CHAVE_EVENTOS, evento, LIMITE_DE_EVENTOS);
}

export async function lerEventos(limite = LIMITE_DE_EVENTOS): Promise<EventoRegistrado[]> {
  return listar<EventoRegistrado>(CHAVE_EVENTOS, limite);
}

// --------------------------------------------------------------------- acessos

export async function lerAcessos(): Promise<Acesso[]> {
  return (await ler<Acesso[]>(CHAVE_ACESSOS)) ?? [];
}

export async function registrarAcesso(acesso: Acesso): Promise<void> {
  const acessos = await lerAcessos();
  await gravar(CHAVE_ACESSOS, [acesso, ...acessos].slice(0, LIMITE_DE_ACESSOS));
}

/**
 * Completa um acesso ja decidido com o que so se sabe depois: se o comando foi mesmo
 * executado no equipamento e se a pessoa girou a catraca.
 */
export async function complementarAcesso(
  eventId: string,
  dados: Partial<Pick<Acesso, "executado" | "passagemConfirmadaEm">>,
): Promise<void> {
  const acessos = await lerAcessos();
  const indice = acessos.findIndex((acesso) => acesso.eventId === eventId);
  if (indice < 0) return;

  acessos[indice] = { ...acessos[indice]!, ...dados };
  await gravar(CHAVE_ACESSOS, acessos);
}

// -------------------------------------------------------------------- comandos

export async function lerComandos(): Promise<ComandoPendente[]> {
  return (await ler<ComandoPendente[]>(CHAVE_COMANDOS)) ?? [];
}

export async function enfileirarComando(comando: ComandoPendente): Promise<void> {
  const comandos = await lerComandos();
  await gravar(CHAVE_COMANDOS, [comando, ...comandos].slice(0, 50));
}

export async function atualizarComando(
  commandId: string,
  dados: Partial<ComandoPendente>,
): Promise<void> {
  const comandos = await lerComandos();
  const indice = comandos.findIndex((comando) => comando.commandId === commandId);
  if (indice < 0) return;

  comandos[indice] = { ...comandos[indice]!, ...dados };
  await gravar(CHAVE_COMANDOS, comandos);
}

/**
 * Comandos ainda nao entregues e ainda dentro da validade.
 *
 * O `expiresAt` e verificado dos dois lados: o Gateway recusa o que chegou tarde, e
 * aqui nem chegamos a entregar. Uma liberacao atrasada abre a catraca para quem esta
 * na frente dela agora, que nao e quem a recepcao autorizou.
 */
export async function comandosParaEntregar(gatewayId: string): Promise<ComandoPendente[]> {
  const agora = Date.now();

  return (await lerComandos()).filter(
    (comando) =>
      comando.gatewayId === gatewayId &&
      !comando.entregueEm &&
      Date.parse(comando.expiresAt) > agora,
  );
}
