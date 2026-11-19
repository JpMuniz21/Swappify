import { requisitar } from './authService';

// GET /postagens é público e paginado (15 por página): { data: [...], meta, links }.
export const listarPostagens = async () => {
  const resposta = await requisitar('/postagens');
  return resposta?.data ?? [];
};

// POST /postagens exige login + CSRF. O backend define autor, data e status.
export const criarPostagem = async ({ titulo, conteudo, url_anexo }) => {
  const resposta = await requisitar('/postagens', 'POST', { titulo, conteudo, url_anexo });
  return resposta?.data;
};
