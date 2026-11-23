const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000/api";

async function lerResposta(resposta) {
  if (resposta.status === 204) return null;
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(
      corpo.message ?? "Não foi possível concluir a ação.",
    );
    erro.status = resposta.status;
    erro.errors = corpo.errors ?? {};
    throw erro;
  }
  return corpo;
}

export async function requisitar(rota, method = "GET", dados) {
  const headers = { Accept: "application/json" };
  const ehArquivo = dados instanceof FormData;
  if (method !== "GET") {
    const csrf = await fetch(API_URL + "/csrf-token", {
      credentials: "include",
      cache: "no-store",
      headers,
    });
    const { csrf_token } = await lerResposta(csrf);
    headers["X-CSRF-TOKEN"] = csrf_token;
    if (!ehArquivo) headers["Content-Type"] = "application/json";
  }

  const resposta = await fetch(API_URL + rota, {
    method,
    credentials: "include",
    headers,
    body:
      dados === undefined
        ? undefined
        : ehArquivo
          ? dados
          : JSON.stringify(dados),
  });
  return lerResposta(resposta);
}

export const login = (dados) => requisitar("/login", "POST", dados);
export const cadastrar = (dados) => requisitar("/register", "POST", dados);
export const consultarPerfil = () => requisitar("/me");
export const atualizarPerfil = (dados) => requisitar("/me", "PATCH", dados);
export const cadastrarServico = (dados) =>
  requisitar("/servicos", "POST", dados);
export const listarServicos = () => requisitar("/servicos", "GET");
export const excluirConta = (senha) =>
  requisitar("/me", "DELETE", { current_password: senha });
export const logout = () => requisitar("/logout", "POST");
export async function enviarFotoPerfil(arquivo) {
  const dados = new FormData();
  dados.append("avatar", arquivo);
  return requisitar("/me/avatar", "POST", dados);
}
