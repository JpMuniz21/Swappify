const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

async function requisitar(rota, dados) {
  const resposta = await fetch(`${API_URL}${rota}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(dados),
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok)
    throw new Error(corpo.message ?? "Não foi possível concluir a ação.");
  return corpo;
}

export const login = (dados) => requisitar("/login", dados);
export const cadastrar = (dados) => requisitar("/register", dados);
