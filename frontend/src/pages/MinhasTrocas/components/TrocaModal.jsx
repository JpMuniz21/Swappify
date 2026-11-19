import { useState } from 'react';
import './TrocaModal.css';

export default function TrocaModal({
  tipo, // 'detalhes' | 'proposta' | 'historico' | 'avaliar'
  troca,
  onClose,
  onConfirmarAvaliacao,
}) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  if (!troca) return null;

  const { parceiro, voce, acordo, descricaoDetalhada, statusLabel, dataInicio, prazo } = troca;

  return (
    <div className="troca-modal-overlay" role="dialog" aria-modal="true">
      <div className="troca-modal-card">
        <header className="troca-modal-cabecalho">
          <div className="troca-modal-titulo-grupo">
            <h2 className="troca-modal-titulo">
              {tipo === 'proposta' && 'Proposta de Troca'}
              {tipo === 'historico' && 'Histórico da Troca'}
              {tipo === 'avaliar' && 'Avaliar Troca Concluída'}
              {tipo === 'detalhes' && 'Detalhes da Troca'}
            </h2>
            <span className="troca-modal-subtitulo">
              Com {parceiro?.nome} • Status: {statusLabel}
            </span>
          </div>
          <button
            type="button"
            className="troca-modal-fechar"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <div className="troca-modal-corpo">
          {tipo === 'avaliar' ? (
            <div className="troca-modal-avaliar">
              <p className="troca-modal-avaliar-texto">
                Como foi sua experiência de troca de serviços com <strong>{parceiro?.nome}</strong>?
              </p>

              <div className="troca-modal-estrelas" role="radiogroup" aria-label="Nota de avaliação">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button
                    key={estrela}
                    type="button"
                    className={`troca-modal-estrela-btn ${nota >= estrela ? 'troca-modal-estrela-btn--ativa' : ''}`}
                    onClick={() => setNota(estrela)}
                    aria-label={`${estrela} estrelas`}
                  >
                    ★
                  </button>
                ))}
                <span className="troca-modal-nota-texto">{nota}.0 de 5.0</span>
              </div>

              <label className="troca-modal-label" htmlFor="comentario-avaliacao">
                Deixe um depoimento ou feedback (opcional):
                <textarea
                  id="comentario-avaliacao"
                  className="troca-modal-textarea"
                  rows={4}
                  placeholder="Excelente profissional, entregou tudo no prazo combinado e com ótima qualidade!"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="troca-modal-detalhes">
              <div className="troca-modal-secao">
                <span className="troca-modal-rotulo">Acordo Combinado:</span>
                <p className="troca-modal-acordo">{acordo}</p>
              </div>

              <div className="troca-modal-secao">
                <span className="troca-modal-rotulo">Descrição e Escopo:</span>
                <p className="troca-modal-descricao">
                  {descricaoDetalhada || 'Sem descrição adicional cadastrada.'}
                </p>
              </div>

              <div className="troca-modal-grid-dados">
                <div>
                  <span className="troca-modal-rotulo">Serviço Ofertado por Você:</span>
                  <p className="troca-modal-valor">{voce?.servico}</p>
                </div>
                <div>
                  <span className="troca-modal-rotulo">Serviço do Parceiro:</span>
                  <p className="troca-modal-valor">{parceiro?.servico}</p>
                </div>
                <div>
                  <span className="troca-modal-rotulo">Início:</span>
                  <p className="troca-modal-valor">{dataInicio || 'Não informado'}</p>
                </div>
                <div>
                  <span className="troca-modal-rotulo">Prazo Estimado:</span>
                  <p className="troca-modal-valor">{prazo || 'A combinar'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="troca-modal-rodape">
          <button type="button" className="troca-modal-btn-voltar" onClick={onClose}>
            {tipo === 'avaliar' ? 'Cancelar' : 'Fechar'}
          </button>
          {tipo === 'avaliar' && (
            <button
              type="button"
              className="troca-modal-btn-confirmar"
              onClick={() => onConfirmarAvaliacao && onConfirmarAvaliacao(troca, nota, comentario)}
            >
              Enviar Avaliação
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

