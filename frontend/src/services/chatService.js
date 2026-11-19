import { requisitar } from "./authService";

const comoLista = (r) => (Array.isArray(r) ? r : r?.data ?? []);

export const listarConversas = async () => comoLista(await requisitar("/conversas"));

export const listarMensagens = async (idMatch) =>
  comoLista(await requisitar(`/conversas/${idMatch}/mensagens`));

export const enviarMensagem = async (idMatch, conteudo) => {
  const r = await requisitar(`/conversas/${idMatch}/mensagens`, "POST", { conteudo });
  return r?.data ?? r;
};