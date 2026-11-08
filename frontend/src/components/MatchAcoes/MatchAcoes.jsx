import adesivoCoracao from '../../assets/adesivo-coracao.svg';
import adesivoX from '../../assets/adesivo-x.svg';
import adesivoBalao from '../../assets/adesivo-balao.svg';
import './MatchAcoes.css';

/**
 * Barra de acoes do match: voltar, pass (X), like (coracao), conversar (balao).
 */
export default function MatchAcoes({
  onVoltar,
  onPass,
  onLike,
  onConversar,
  podevoltar,
}) {
  return (
    <div className="match-acoes" role="group" aria-label="Acoes de match">
      {/* botao voltar */}
      <button
        type="button"
        id="btn-match-voltar"
        className="match-acao-btn match-acao-btn--voltar"
        onClick={onVoltar}
        disabled={!podevoltar}
        aria-label="Desfazer ultima acao"
        title="Voltar"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
        </svg>
      </button>

      {/* botao pass (X) */}
      <button
        type="button"
        id="btn-match-pass"
        className="match-acao-btn match-acao-btn--pass"
        onClick={onPass}
        aria-label="Passar - nao tenho interesse"
        title="Passar"
      >
        <img src={adesivoX} alt="" aria-hidden="true" className="match-acao-adesivo" />
      </button>

      {/* botao like (coracao) */}
      <button
        type="button"
        id="btn-match-like"
        className="match-acao-btn match-acao-btn--like"
        onClick={onLike}
        aria-label="Curtir - tenho interesse"
        title="Curtir"
      >
        <img src={adesivoCoracao} alt="" aria-hidden="true" className="match-acao-adesivo" />
      </button>

      {/* botao conversar */}
      <button
        type="button"
        id="btn-match-conversar"
        className="match-acao-btn match-acao-btn--conversar"
        onClick={onConversar}
        aria-label="Iniciar conversa"
        title="Conversar"
      >
        <img src={adesivoBalao} alt="" aria-hidden="true" className="match-acao-adesivo" />
      </button>
    </div>
  );
}
