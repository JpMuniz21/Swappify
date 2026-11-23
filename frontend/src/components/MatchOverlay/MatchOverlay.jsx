import './MatchOverlay.css';

/**
 * Overlay de confirmacao de match.
 * Exibido quando dois usuarios se curtem mutuamente.
 */
// pendente = você deu match, mas a outra pessoa ainda não deu de volta (sem chat ainda).
export default function MatchOverlay({ perfil, pendente = false, onConversar, onContinuar }) {
  if (!perfil) return null;

  return (
    <div className="match-overlay" role="dialog" aria-modal="true" aria-label="Você deu match!">
      <div className="match-overlay-backdrop" onClick={onContinuar} aria-hidden="true" />

      <div className="match-overlay-card">
        {/* animacao de particulas decorativas */}
        <div className="match-overlay-particulas" aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="match-particula" style={{ '--i': i }} />
          ))}
        </div>

        <div className="match-overlay-icone" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#6b35a8" stroke="#6b35a8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <h2 className="match-overlay-titulo">Você deu Match! <span aria-hidden="true">👍</span></h2>
        {pendente ? (
          <p className="match-overlay-subtitulo">
            Quando <strong>{perfil.nome}</strong> der match de volta, vocês poderão conversar.
          </p>
        ) : (
          <p className="match-overlay-subtitulo">
            Você e <strong>{perfil.nome}</strong> têm interesse um no serviço do outro.
          </p>
        )}

        <div className="match-overlay-acoes">
          {!pendente && <button
            type="button"
            id="btn-match-overlay-conversar"
            className="match-overlay-btn match-overlay-btn--primario"
            onClick={onConversar}
            autoFocus
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Conversar agora
          </button>}
          <button
            type="button"
            id="btn-match-overlay-continuar"
            className={`match-overlay-btn ${pendente ? 'match-overlay-btn--primario' : 'match-overlay-btn--secundario'}`}
            onClick={onContinuar}
            autoFocus={pendente}
          >
            Continuar explorando
          </button>
        </div>
      </div>
    </div>
  );
}
