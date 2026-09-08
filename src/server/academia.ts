/**
 * O lado do negocio: alunos, planos e a decisao de acesso.
 *
 * Nada daqui atravessa a fronteira do protocolo. O Gateway nunca sabe o que e um
 * plano — ele so recebe ALLOW ou DENY e uma mensagem de 16 colunas. Trocar as regras
 * abaixo por consulta a mensalidade, catraca de personal ou horario de turma nao muda
 * uma linha do que o Gateway espera.
 */

import { paraDisplay } from "../lib/protocolo";
import type { Decisao, Direcao } from "../lib/protocolo";
import type { Acesso, Aluno } from "../lib/tipos";
import { gravar, ler } from "./armazenamento";

const CHAVE_ALUNOS = "alunos";

/** Base de demonstracao. Cobre os quatro desfechos que a recepcao precisa ver. */
const ALUNOS_INICIAIS: Aluno[] = [
  {
    id: "a1",
    nome: "Joao da Silva",
    pin: "583921",
    planoValidoAte: dataRelativa(90),
    bloqueado: false,
    observacao: "Plano em dia — libera.",
  },
  {
    id: "a2",
    nome: "Maria Souza",
    pin: "471002",
    planoValidoAte: dataRelativa(-3),
    bloqueado: false,
    observacao: "Plano vencido — nega com PLAN_EXPIRED.",
  },
  {
    id: "a3",
    nome: "Carlos Pereira",
    pin: "902113",
    planoValidoAte: dataRelativa(30),
    bloqueado: true,
    observacao: "Bloqueado na recepcao — nega mesmo com plano valido.",
  },
  {
    id: "a4",
    nome: "Ana Lima",
    pin: "310945",
    planoValidoAte: dataRelativa(1),
    bloqueado: false,
    observacao: "Vence amanha — libera e avisa no display.",
  },
];

function dataRelativa(dias: number): string {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

export async function lerAlunos(): Promise<Aluno[]> {
  const guardados = await ler<Aluno[]>(CHAVE_ALUNOS);
  if (guardados) return guardados;

  await gravar(CHAVE_ALUNOS, ALUNOS_INICIAIS);
  return ALUNOS_INICIAIS;
}

export async function gravarAlunos(alunos: Aluno[]): Promise<void> {
  await gravar(CHAVE_ALUNOS, alunos);
}

export async function restaurarAlunosIniciais(): Promise<Aluno[]> {
  await gravar(CHAVE_ALUNOS, ALUNOS_INICIAIS);
  return ALUNOS_INICIAIS;
}

// -------------------------------------------------------------- a decisao

export type Veredito = {
  decisao: Decisao;
  reasonCode: string;
  mensagem: string;
  aluno?: Aluno;
};

/** Janela do anti-passback: duas passagens seguidas do mesmo PIN sao a mesma pessoa. */
const SEGUNDOS_ANTIPASSBACK = 10;

/**
 * Responde a unica pergunta que o Gateway faz: esta credencial pode entrar?
 *
 * A ordem importa. Bloqueio manual vem antes do plano porque quem bloqueou na recepcao
 * precisa ver a negacao mesmo que a mensalidade esteja paga; e o anti-passback vem por
 * ultimo para nao esconder um motivo de verdade atras de "aguarde".
 */
export function decidir(
  alunos: Aluno[],
  credencial: string,
  direcao: Direcao,
  acessosRecentes: Acesso[],
  agora = new Date(),
): Veredito {
  const aluno = alunos.find((candidato) => candidato.pin === credencial);

  if (!aluno) {
    return {
      decisao: "DENY",
      reasonCode: "CREDENTIAL_UNKNOWN",
      mensagem: paraDisplay("NAO CADASTRADO"),
    };
  }

  if (aluno.bloqueado) {
    return {
      decisao: "DENY",
      reasonCode: "STUDENT_BLOCKED",
      mensagem: paraDisplay("PROCURE RECEPCAO"),
      aluno,
    };
  }

  // Comparacao por dia: o plano vale ate o fim do dia da data de validade.
  if (aluno.planoValidoAte < agora.toISOString().slice(0, 10)) {
    return {
      decisao: "DENY",
      reasonCode: "PLAN_EXPIRED",
      mensagem: paraDisplay("PLANO VENCIDO"),
      aluno,
    };
  }

  // Saida nao entra no anti-passback: quem acabou de entrar pode querer sair.
  if (direcao !== "EXIT") {
    const repetido = acessosRecentes.find(
      (acesso) =>
        acesso.alunoId === aluno.id &&
        acesso.decisao === "ALLOW" &&
        agora.getTime() - Date.parse(acesso.decididoEm) < SEGUNDOS_ANTIPASSBACK * 1000,
    );

    if (repetido) {
      return {
        decisao: "DENY",
        reasonCode: "PASSBACK_BLOCKED",
        mensagem: paraDisplay("AGUARDE UM POUCO"),
        aluno,
      };
    }
  }

  const diasRestantes = Math.ceil(
    (Date.parse(`${aluno.planoValidoAte}T23:59:59Z`) - agora.getTime()) / 86_400_000,
  );

  // O display tem 16 colunas: o aviso de vencimento so cabe no lugar da saudacao.
  const mensagem =
    diasRestantes <= 3 ? `VENCE EM ${diasRestantes}D` : `OLA ${aluno.nome.split(" ")[0] ?? ""}`;

  return {
    decisao: "ALLOW",
    reasonCode: "ACCESS_ALLOWED",
    mensagem: paraDisplay(mensagem),
    aluno,
  };
}
