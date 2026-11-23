import { requisitar } from "./authService";
import { chaveDoDia } from "./agendamentoService";

const CHAVE_LIDAS = "swappify:notificacoes-lidas";

const comoLista = (r) => (Array.isArray(r) ? r : r?.data ?? []);

// "24/11 às 15:00"
function quando(iso) {
  const data = new Date(iso);
  const dia = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia} às ${hora}`;
}

// Um agendamento só gera aviso quando a mudança veio da OUTRA pessoa:
//   pendente  + proposto por ela  -> novo horário (vale para remarcação também)
//   confirmada + proposto por mim -> ela confirmou (só a outra pessoa pode confirmar)
//   cancelada + cancelado por ela -> ela cancelou ou recusou
function notificacaoDeAgendamento(a) {
  const nome = a.parceiro?.nome ?? "A outra pessoa";
  let titulo;
  let descricao;

  if (a.status === "pendente" && !a.criado_por_mim) {
    titulo = "Novo horário proposto";
    descricao = `${nome} quer marcar a troca para ${quando(a.inicio)}. Confirme ou sugira outro horário.`;
  } else if (a.status === "confirmada" && a.criado_por_mim) {
    titulo = "Agendamento confirmado";
    descricao = `${nome} confirmou a troca para ${quando(a.inicio)}.`;
  } else if (a.status === "cancelada" && a.cancelado_por_mim === false) {
    titulo = "Agendamento cancelado";
    descricao = `${nome} cancelou o agendamento de ${quando(a.inicio)}.`;
  } else {
    return null;
  }

  return {
    // o id muda a cada alteração: uma remarcação volta a aparecer como não lida
    id: `agendamento-${a.id}-${a.atualizado_em}`,
    tipo: "agendamento",
    titulo,
    descricao,
    data: a.atualizado_em,
    // abre a agenda já no dia do agendamento (a página lê ?dia=AAAA-MM-DD)
    link: `/agendamentos?dia=${chaveDoDia(new Date(a.inicio))}`,
  };
}

export async function listarNotificacoes() {
  const [matches, agendamentos] = await Promise.all([
    requisitar("/matches").then(comoLista),
    // se a agenda falhar, as notificações de match continuam funcionando
    requisitar("/agendamentos").then(comoLista).catch(() => []),
  ]);

  const deMatch = matches.map((m) => ({
    id: `match-${m.id}`,
    tipo: "match",
    titulo: "Novo match!",
    descricao: `Você e ${m.outro?.name ?? "alguém"} se interessaram pelos serviços um do outro` +
      (m.servico_do_outro?.titulo ? ` (${m.servico_do_outro.titulo}).` : "."),
    data: m.data_match,
    link: "/chat",
  }));

  const deAgendamento = agendamentos.map(notificacaoDeAgendamento).filter(Boolean);

  return [...deMatch, ...deAgendamento].sort((a, b) => new Date(b.data) - new Date(a.data));
}

export function lerIdsLidos() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CHAVE_LIDAS) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function salvarIdsLidos(ids) {
  try {
    localStorage.setItem(CHAVE_LIDAS, JSON.stringify([...ids]));
  } catch {
    // sem localStorage (janela privada, por exemplo): as notificações só não ficam salvas como lidas
  }
}
