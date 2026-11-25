import { reduzirImagensDoFormulario } from "../utils/reduzirImagem";

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

// O Laravel envia o token CSRF no cookie XSRF-TOKEN em toda resposta. Lendo o cookie
// evitamos uma requisição extra a /csrf-token antes de cada escrita.
function lerCookieXsrf() {
  const item = document.cookie
    .split("; ")
    .find((parte) => parte.startsWith("XSRF-TOKEN="));
  return item ? decodeURIComponent(item.slice("XSRF-TOKEN=".length)) : null;
}

async function buscarTokenCsrf() {
  const resposta = await fetch(API_URL + "/csrf-token", {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const { csrf_token } = await lerResposta(resposta);
  return csrf_token;
}

export async function requisitar(rota, method = "GET", dados, tentarDeNovo = true) {
  const headers = { Accept: "application/json" };
  const ehArquivo = dados instanceof FormData;
  // todo envio de arquivo passa por aqui (foto de perfil, portfólio, feed): reduz as imagens antes.
  // Na repetição (419) os dados já vêm reduzidos e não são processados de novo.
  if (ehArquivo && tentarDeNovo) dados = await reduzirImagensDoFormulario(dados);
  if (method !== "GET") {
    const cookie = lerCookieXsrf();
    if (cookie) headers["X-XSRF-TOKEN"] = cookie;
    else headers["X-CSRF-TOKEN"] = await buscarTokenCsrf();
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

  // 419 = token vencido (ex.: aba aberta por muito tempo). Renova uma vez e repete.
  if (resposta.status === 419 && method !== "GET" && tentarDeNovo) {
    document.cookie = "XSRF-TOKEN=; Max-Age=0; path=/";
    return requisitar(rota, method, dados, false);
  }
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
