import { useEffect, useState } from 'react';
import './AgendamentoForm.css';

function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

function paraCampoData(data) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

function paraCampoHora(data) {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

// Formulário em janela (modal) para criar um agendamento ou remarcar um existente.
// - trocas: lista de GET /matches (só usada ao criar)
// - agendamento: se vier preenchido, o formulário é de remarcação
// - dataInicial: dia sugerido ao criar
export default function AgendamentoForm({ trocas, agendamento, dataInicial, salvando, erro, onSalvar, onCancelar }) {
  const editando = Boolean(agendamento);
  const base = agendamento ? new Date(agendamento.inicio) : dataInicial;

  const [matchId, setMatchId] = useState(agendamento ? String(agendamento.match_id) : String(trocas[0]?.id ?? ''));
  const [data, setData] = useState(paraCampoData(base));
  const [hora, setHora] = useState(agendamento ? paraCampoHora(base) : '09:00');
  const [observacao, setObservacao] = useState(agendamento?.observacao ?? '');

  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') onCancelar();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onCancelar]);

  function enviar(e) {
    e.preventDefault();
    const inicio = new Date(`${data}T${hora}`);
    if (Number.isNaN(inicio.getTime())) return;

    onSalvar({
      match_id: Number(matchId),
      inicio: inicio.toISOString(),
      observacao: observacao.trim() || null,
    });
  }

  return (
    <div
      className="agenda-modal-fundo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <form className="agenda-modal" role="dialog" aria-modal="true" aria-labelledby="agenda-form-titulo" onSubmit={enviar}>
        <h2 id="agenda-form-titulo">{editando ? 'Remarcar agendamento' : 'Novo agendamento'}</h2>

        <label className="agenda-form-campo">
          Troca
          <select value={matchId} onChange={(e) => setMatchId(e.target.value)} disabled={editando} required>
            {editando ? (
              <option value={matchId}>
                {agendamento.parceiro.nome} — {agendamento.ofereco} ⇄ {agendamento.recebo}
              </option>
            ) : (
              trocas.map((troca) => (
                <option key={troca.id} value={troca.id}>
                  {troca.outro.name} — {troca.meu_servico.titulo} ⇄ {troca.servico_do_outro.titulo}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="agenda-form-linha">
          <label className="agenda-form-campo">
            Data
            <input type="date" value={data} min={paraCampoData(new Date())} onChange={(e) => setData(e.target.value)} required />
          </label>
          <label className="agenda-form-campo">
            Hora
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
          </label>
        </div>

        <label className="agenda-form-campo">
          Observação (opcional)
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Local, link da chamada, o que levar..."
          />
        </label>

        <p className="agenda-form-dica">
          {editando
            ? 'O novo horário volta para "pendente" e a outra pessoa precisa confirmar.'
            : 'O agendamento fica "pendente" até a outra pessoa confirmar.'}
        </p>

        {erro && (
          <p className="agenda-form-erro" role="alert">
            {erro}
          </p>
        )}

        <div className="agenda-form-acoes">
          <button type="button" className="agenda-form-voltar" onClick={onCancelar}>
            Voltar
          </button>
          <button type="submit" className="agenda-form-salvar" disabled={salvando}>
            {salvando ? 'Salvando…' : editando ? 'Remarcar' : 'Agendar'}
          </button>
        </div>
      </form>
    </div>
  );
}
