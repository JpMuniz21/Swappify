export const STATUS = {
  pendente: { rotulo: "Pendente", cor: "#d99a1e" },
  confirmada: { rotulo: "Confirmada", cor: "#8e4fc4" },
  concluida: { rotulo: "Concluída", cor: "#2e8f57" },
  cancelada: { rotulo: "Cancelada", cor: "#a59bb0" },
};

export function chaveDoDia(data) {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// ---------------------------------------------------------------------------
// DADOS DE EXEMPLO — trocar por chamadas ao back quando a troca tiver data/hora.
// Formato que a tela espera de cada agendamento:
//   { id, inicio (ISO), parceiro: { nome }, ofereco, recebo, status }
// Se o TrocaResource vier com outros nomes de campo, converta aqui dentro
// (uma função "normalizar") para a tela não precisar mudar.
// ---------------------------------------------------------------------------
function emDias(dias, hora, minuto = 0) {
  const base = new Date();
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + dias,
    hora,
    minuto,
  ).toISOString();
}

const EXEMPLOS = [
  {
    id: 1,
    inicio: emDias(-6, 10),
    parceiro: { nome: "Ana Ribeiro" },
    ofereco: "Design de logo",
    recebo: "Aulas de inglês",
    status: "concluida",
  },
  {
    id: 2,
    inicio: emDias(-2, 16, 30),
    parceiro: { nome: "Carlos Lima" },
    ofereco: "Edição de vídeo",
    recebo: "Aulas de violão",
    status: "cancelada",
  },
  {
    id: 3,
    inicio: emDias(0, 15),
    parceiro: { nome: "Maria Souza" },
    ofereco: "Fotos de produto",
    recebo: "Consultoria de marketing",
    status: "confirmada",
  },
  {
    id: 4,
    inicio: emDias(0, 18, 30),
    parceiro: { nome: "Pedro Alves" },
    ofereco: "Revisão de textos",
    recebo: "Corte de cabelo",
    status: "pendente",
  },
  {
    id: 5,
    inicio: emDias(3, 9),
    parceiro: { nome: "Juliana Costa" },
    ofereco: "Aulas de matemática",
    recebo: "Marmitas fit",
    status: "confirmada",
  },
  {
    id: 6,
    inicio: emDias(5, 14),
    parceiro: { nome: "Rafael Nunes" },
    ofereco: "Site simples",
    recebo: "Identidade visual",
    status: "pendente",
  },
  {
    id: 7,
    inicio: emDias(9, 11),
    parceiro: { nome: "Beatriz Lima" },
    ofereco: "Manicure",
    recebo: "Fotos de perfil",
    status: "confirmada",
  },
];

export async function listarAgendamentos() {
  return EXEMPLOS;
}
