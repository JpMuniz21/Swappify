import { Link } from 'react-router-dom';
import { acharDatas, paramsDoAgendamento } from '../../utils/datasNoTexto';
import './TextoComDatas.css';

function inicioDoDia(data) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

// Mostra o texto de uma mensagem e transforma datas/horários em links para o agendamento
// (como o sublinhado de datas do WhatsApp).
// - matchId: conversa (troca) da mensagem; o formulário já abre com ela selecionada
// - enviadaEm: quando a mensagem foi enviada; "amanhã" é contado a partir daí
//   (sem esse valor, usa o momento atual)
export default function TextoComDatas({ texto, matchId, enviadaEm }) {
  if (!texto) return null;

  const agora = new Date();
  let referencia = enviadaEm ? new Date(enviadaEm) : agora;
  if (Number.isNaN(referencia.getTime())) referencia = agora;

  // só vira link o que ainda dá para agendar (não faz sentido linkar "ontem às 10h")
  const achados = acharDatas(texto, referencia).filter((achado) =>
    achado.temHora ? achado.data > agora : achado.data >= inicioDoDia(agora),
  );

  if (achados.length === 0) return texto;

  const partes = [];
  let cursor = 0;
  achados.forEach((achado) => {
    if (achado.inicio > cursor) partes.push(texto.slice(cursor, achado.inicio));
    partes.push(
      <Link
        key={achado.inicio}
        className="texto-data"
        to={`/agendamentos?${paramsDoAgendamento(achado, matchId)}`}
        title="Agendar esta data"
      >
        {achado.texto}
      </Link>,
    );
    cursor = achado.fim;
  });
  if (cursor < texto.length) partes.push(texto.slice(cursor));

  return partes;
}
