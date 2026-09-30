// configuracao da url base da api
const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:8000/api';

async function lerResposta(resposta) {
  if (resposta.status === 204) return null; // Logout/exclusão não retornam corpo.
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(corpo.message ?? 'Não foi possível concluir a ação.');
    erro.status = resposta.status;
    erro.errors = corpo.errors ?? {}; // Permite exibir erros específicos do formulário.
    throw erro;
  }
  return corpo;
}

async function requisitar(rota, method = 'GET', dados) {
  const headers = { Accept: 'application/json' };
  if (method !== 'GET') {
    // O token acompanha a sessão atual; login/logout/troca de senha podem renová-lo.
    const csrf = await fetch(API_URL + '/csrf-token', {
      credentials: 'include',
      cache: 'no-store',
      headers,
    });
    const { csrf_token } = await lerResposta(csrf);
    headers['X-CSRF-TOKEN'] = csrf_token;
    headers['Content-Type'] = 'application/json';
  }

  const resposta = await fetch(API_URL + rota, {
    method,
    credentials: 'include', // Envia o cookie HttpOnly; não salva token em localStorage.
    headers,
    body: dados === undefined ? undefined : JSON.stringify(dados),
  });
  return lerResposta(resposta);
}

export const login = (dados) => requisitar('/login', 'POST', dados);
export const cadastrar = (dados) => requisitar('/register', 'POST', dados);
export const consultarPerfil = () => requisitar('/me');
export const atualizarPerfil = (dados) => requisitar('/me', 'PATCH', dados);
export const cadastrarServico = (dados) => requisitar('/servicos', 'POST', dados);
export const listarServicos = () => requisitar('/servicos', 'GET');
export const excluirConta = (senha) => requisitar('/me', 'DELETE', { current_password: senha });
export const logout = () => requisitar('/logout', 'POST');
