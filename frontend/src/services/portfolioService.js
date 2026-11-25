import { requisitar } from './authService';

// Portfólio do próprio perfil: { id, titulo, imagem_url, created_at }.
export const listarPortfolio = async () => (await requisitar('/me/portfolio'))?.data ?? [];

// Envia a foto como multipart (imagem + titulo).
export async function adicionarFotoPortfolio(arquivo, titulo) {
  const dados = new FormData();
  dados.append('imagem', arquivo);
  dados.append('titulo', titulo);
  return requisitar('/me/portfolio', 'POST', dados);
}

// Edita o título e, se vier um arquivo, troca a imagem.
// Com arquivo vai como POST + _method=PATCH: o PHP não lê arquivos enviados em PATCH.
export async function editarFotoPortfolio(id, titulo, arquivo) {
  if (!arquivo) return requisitar(`/me/portfolio/${id}`, 'PATCH', { titulo });
  const dados = new FormData();
  dados.append('_method', 'PATCH');
  dados.append('titulo', titulo);
  dados.append('imagem', arquivo);
  return requisitar(`/me/portfolio/${id}`, 'POST', dados);
}

export const removerFotoPortfolio = (id) => requisitar(`/me/portfolio/${id}`, 'DELETE');
