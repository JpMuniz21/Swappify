import { requisitar } from './authService';

const dados = (resposta) => resposta?.data ?? [];

// Busca todas as páginas de um endpoint paginado do Laravel (15 itens por página).
async function todasAsPaginas(rota, limitePaginas = 5) {
  const itens = [];
  for (let pagina = 1; pagina <= limitePaginas; pagina += 1) {
    const separador = rota.includes('?') ? '&' : '?';
    const resposta = await requisitar(`${rota}${separador}page=${pagina}`);
    itens.push(...dados(resposta));
    const ultima = resposta?.meta?.last_page ?? 1;
    if (pagina >= ultima) break;
  }
  return itens;
}

// Catálogo público de serviços (usado no Match para descobrir o que curtir).
export const listarCatalogoServicos = () => todasAsPaginas('/servicos');

// Favoritos (interesses) da pessoa logada. Cada item traz match_id quando há match ativo.
export const listarFavoritos = () => todasAsPaginas('/interesses');

// Favoritar um serviço. Se o interesse for recíproco, a API cria o match:
// resposta.meta = { match_criado: boolean, match_id: number|null }
export const favoritarServico = (servicoId) =>
  requisitar('/interesses', 'POST', { servico_id: servicoId });

export const removerFavorito = (interesseId) => requisitar(`/interesses/${interesseId}`, 'DELETE');

// Matches ativos da pessoa logada.
export const listarMatches = () => todasAsPaginas('/matches');

export const cancelarMatch = (matchId) => requisitar(`/matches/${matchId}/cancelar`, 'POST');
