import { requisitar } from "./authService";

const CHAVE_LIDAS = "swappify:notificacoes-lidas";

const comoLista = (r) => (Array.isArray(r) ? r : r?.data ?? []);

export async function listarNotificacoes() {
  const matches = comoLista(await requisitar("/matches"));

  return matches
    .map((m) => ({
      id: `match-${m.id}`,
      tipo: "match",
      titulo: "Novo match!",
      descricao: `Você e ${m.outro?.name ?? "alguém"} se interessaram pelos serviços um do outro` +
        (m.servico_do_outro?.titulo ? ` (${m.servico_do_outro.titulo}).` : "."),
      data: m.data_match,
      link: "/chat",
    }))
    .sort((a, b) => new Date(b.data) - new Date(a.data));
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
  
  }
}