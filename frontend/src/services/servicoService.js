import { requisitar } from './authService';

// Lista pública de categorias ({ id, nome, descricao }).
export const listarCategorias = async () => (await requisitar('/categorias'))?.data ?? [];

// Cadastra um serviço que a pessoa logada oferece. Retorna o ServicoResource criado.
export const criarServico = async ({ titulo, descricao, tipo, categoria_id }) => {
  const resposta = await requisitar('/servicos', 'POST', {
    titulo,
    descricao,
    tipo,
    categoria_id,
    status: 'disponivel',
  });
  return resposta?.data;
};

// Exclui um serviço da pessoa logada. Atenção: o banco apaga junto os favoritos,
// matches e mensagens ligados a esse serviço.
export const excluirServico = (servicoId) => requisitar(`/servicos/${servicoId}`, 'DELETE');

// "O que eu procuro" do perfil (só da pessoa logada; não aparece no Match).
export const adicionarProcurado = async ({ titulo, descricao, codigo }) => {
  const resposta = await requisitar('/me/procurados', 'POST', { titulo, descricao, codigo });
  return resposta?.data;
};

export const removerProcurado = (procuradoId) => requisitar(`/me/procurados/${procuradoId}`, 'DELETE');
