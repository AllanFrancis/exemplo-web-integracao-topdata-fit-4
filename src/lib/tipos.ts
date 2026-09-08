/** Modelos do sistema web — o lado que o Gateway nunca ve. */

import type { Decisao, Direcao, EstadoDispositivo, TipoEvento } from "./protocolo";

export type Aluno = {
  id: string;
  nome: string;
  /** PIN digitado no teclado da catraca. */
  pin: string;
  /** Data (yyyy-mm-dd) ate a qual o plano vale, inclusive. */
  planoValidoAte: string;
  bloqueado: boolean;
  observacao?: string | undefined;
};

export type DispositivoConhecido = {
  deviceId: string;
  status: EstadoDispositivo;
  firmwareVersion?: string | null;
  lastEventAt?: string | null;
};

export type GatewayConhecido = {
  gatewayId: string;
  gatewayName: string;
  tenantName: string;
  machineName?: string;
  version?: string;
  status?: string;
  pendingEvents?: number;
  provisionadoEm: string;
  ultimoContatoEm?: string;
  dispositivos: DispositivoConhecido[];
};

/** Uma linha da trilha: tudo que o Gateway mandou, na ordem em que chegou. */
export type EventoRegistrado = {
  id: string;
  gatewayId: string;
  tipo: TipoEvento | "ACCESS_VALIDATE";
  recebidoEm: string;
  /** Como chegou, sem interpretacao. E o que torna a trilha auditavel. */
  payload: unknown;
  /** Resumo pronto para a tela, montado no momento da gravacao. */
  resumo: string;
};

export type Acesso = {
  eventId: string;
  gatewayId: string;
  deviceId: string;
  alunoId?: string;
  alunoNome?: string;
  credencialMascarada: string;
  decisao: Decisao;
  reasonCode: string;
  mensagem: string;
  direcao: Direcao;
  decididoEm: string;
  /** Preenchido quando o `ACCESS_OUTCOME` correspondente chega. */
  executado?: boolean;
  /** Preenchido quando o `PASSAGE_CONFIRMED` chega: girar e um fato fisico. */
  passagemConfirmadaEm?: string;
};

export type ComandoPendente = {
  commandId: string;
  gatewayId: string;
  deviceId: string;
  tipo: "UNLOCK" | "SHOW_MESSAGE";
  direction?: Direcao;
  message: string;
  criadoEm: string;
  expiresAt: string;
  entregueEm?: string;
  resultado?: "EXECUTED" | "FAILED";
  errorCode?: string | null;
};
