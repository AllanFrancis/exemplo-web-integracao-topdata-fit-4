/**
 * Espelho um-para-um de `src/TopdataGateway.Server/Contracts/ProtocolContracts.cs`.
 *
 * O Gateway e quem fala primeiro em todas as trocas: ele abre a conexao, ele pergunta,
 * o servidor responde. Nada aqui pode divergir do arquivo C# — quando o contrato mudar,
 * os dois mudam juntos.
 */

export type Decisao = "ALLOW" | "DENY";
export type Direcao = "ENTRY" | "EXIT" | "BOTH";
export type TipoCredencial = "PIN" | "CARD";

/** Estados que o Gateway reporta para um equipamento. */
export type EstadoDispositivo =
  "UNKNOWN" | "CONNECTING" | "ONLINE" | "DEGRADED" | "OFFLINE" | "ERROR";

export type TipoEvento =
  | "HEARTBEAT"
  | "ACCESS_OUTCOME"
  | "DEVICE_STATUS_CHANGED"
  | "PASSAGE_CONFIRMED"
  | "PASSAGE_EXPIRED"
  | "COMMAND_RESULT";

export const TIPOS_DE_EVENTO: readonly TipoEvento[] = [
  "HEARTBEAT",
  "ACCESS_OUTCOME",
  "DEVICE_STATUS_CHANGED",
  "PASSAGE_CONFIRMED",
  "PASSAGE_EXPIRED",
  "COMMAND_RESULT",
];

// ------------------------------------------------------------- provisionamento

export type ProvisionRequest = {
  installationCode: string;
  machineName: string;
  gatewayVersion: string;
};

export type ProvisionResponse = {
  gatewayId: string;
  gatewaySecret: string;
  tenantName?: string;
  gatewayName?: string;
};

// ---------------------------------------------------------------- autenticacao

export type AuthRequest = {
  gatewayId: string;
  gatewaySecret: string;
  gatewayVersion: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresInSeconds: number;
};

// ------------------------------------------------------------------ validacao

export type ValidateAccessRequest = {
  eventId: string;
  gatewayId: string;
  deviceId: string;
  credentialType: TipoCredencial;
  /** Unico ponto do sistema em que o PIN completo trafega. Nunca registrar inteiro. */
  credential: string;
  direction: Direcao;
  occurredAt: string;
};

export type ValidateAccessResponse = {
  decision: Decisao;
  /**
   * O Gateway confere este eco e descarta a resposta que nao corresponder a tentativa
   * em aberto. Sem ele, uma resposta atrasada liberaria a catraca para a proxima
   * pessoa da fila.
   */
  eventId: string;
  studentId?: string;
  studentName?: string;
  reasonCode: string;
  /** Display de 2 linhas x 16 colunas, somente ASCII. */
  message: string;
};

// ----------------------------------------------------------------- telemetria

export type DeviceStatusMessage = {
  deviceId: string;
  status: EstadoDispositivo;
  firmwareVersion?: string | null;
  lastEventAt?: string | null;
};

export type HeartbeatMessage = {
  gatewayId: string;
  version: string;
  status: string;
  pendingEvents: number;
  devices: DeviceStatusMessage[];
};

export type AccessOutcomeMessage = {
  eventId: string;
  deviceId: string;
  decision: Decisao;
  /** ALLOW com executed=false = o servidor autorizou e o equipamento nao girou. */
  executed: boolean;
  reasonCode?: string | null;
  errorCode?: string | null;
  completedAt: string;
};

export type PassageMessage = {
  deviceId: string;
  eventId?: string | null;
  direction?: Direcao | null;
  occurredAt: string;
};

export type CommandResultMessage = {
  commandId: string;
  status: "EXECUTED" | "FAILED";
  errorCode?: string | null;
};

// ------------------------------------------------------- comandos do servidor

/** Envelope de tudo que o servidor envia pelo WebSocket. */
export type ServerEnvelope = {
  type: "UNLOCK" | "SHOW_MESSAGE" | "REFRESH_CONFIGURATION";
  commandId?: string;
  gatewayId?: string;
  deviceId?: string;
  direction?: Direcao;
  message?: string;
  /**
   * Sempre enviar. Um comando represado numa fila e entregue minutos depois liberaria
   * a catraca para quem estiver na frente dela naquele momento.
   */
  expiresAt?: string;
};

/** Envelope de tudo que o Gateway envia pelo WebSocket. */
export type GatewayEnvelope = {
  type: TipoEvento;
  gatewayId: string;
  sentAt: string;
  payload: unknown;
};

// ------------------------------------------------------------------ o display

const ACENTOS = /[\u0300-\u036f]/g;

/**
 * Prepara texto para o display da catraca: 16 colunas, ASCII, sem acento.
 *
 * O Gateway ja trunca e remove acentos por conta propria — fazemos o mesmo aqui para
 * que a mensagem exibida na tela do sistema web seja exatamente a que a pessoa le na
 * catraca, sem surpresa entre o que foi escrito e o que apareceu.
 */
export function paraDisplay(texto: string, colunas = 16): string {
  return texto
    .normalize("NFD")
    .replace(ACENTOS, "")
    .replace(/[^\x20-\x7E]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, colunas);
}

/** Mascara usada em log: o PIN completo so existe no corpo da requisicao. */
export function mascararCredencial(credencial: string): string {
  return credencial.length <= 3 ? "***" : `***${credencial.slice(-3)}`;
}
