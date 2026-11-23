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

export const removerFotoPortfolio = (id) => requisitar(`/me/portfolio/${id}`, 'DELETE');
