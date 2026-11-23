import { requisitar } from './authService';

export const STATUS = {
  pendente: { rotulo: 'Pendente', cor: '#d99a1e' },
  confirmada: { rotulo: 'Confirmada', cor: '#8e4fc4' },
  concluida: { rotulo: 'Concluída', cor: '#2e8f57' },
  cancelada: { rotulo: 'Cancelada', cor: '#a59bb0' },
};

export function chaveDoDia(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// GET /agendamentos: só os agendamentos das trocas em que a pessoa participa.
// Cada item já vem no formato da tela:
//   { id, match_id, inicio (ISO), status, observacao, criado_por_mim,
//     parceiro: { id, nome }, ofereco, recebo }
export async function listarAgendamentos() {
  const resposta = await requisitar('/agendamentos');
  return resposta?.data ?? [];
}

// GET /matches: trocas ativas da pessoa (usadas no formulário "Novo agendamento").
// Cada item: { id, status, outro: { id, name }, meu_servico: { titulo }, servico_do_outro: { titulo } }
export async function listarTrocasAtivas() {
  const resposta = await requisitar('/matches');
  return resposta?.data ?? [];
}

// POST /agendamentos: nasce "pendente"; a outra pessoa precisa confirmar.
export async function criarAgendamento({ match_id, inicio, observacao }) {
  const resposta = await requisitar('/agendamentos', 'POST', { match_id, inicio, observacao });
  return resposta?.data;
}

// PATCH /agendamentos/{id}: remarcar ({ inicio, observacao }) ou mudar o status
// ({ status: 'confirmada' | 'concluida' | 'cancelada' }).
export async function atualizarAgendamento(id, dados) {
  const resposta = await requisitar(`/agendamentos/${id}`, 'PATCH', dados);
  return resposta?.data;
}
