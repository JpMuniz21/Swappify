import './FavoritosEmpty.css';

/**
 * Estado vazio da tela de favoritos.
 * Exibido quando nao ha favoritos salvos ou quando a busca nao retorna resultados.
 */
export default function FavoritosEmpty({ onExplorar }) {
  return (
    <div className="fav-empty" role="status" aria-live="polite">
      <div className="fav-empty-icone" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <div className="fav-empty-texto">
        <p className="fav-empty-titulo">Ainda nao tem favoritos?</p>
        <p className="fav-empty-descricao">Explore pessoas e servicos incriveis e salve aqui para acessar depois.</p>
      </div>
      <button
        type="button"
        id="btn-explorar-favoritos"
        className="fav-empty-btn"
        onClick={onExplorar}
        aria-label="Explorar pessoas e servicos"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        Explorar agora
      </button>
    </div>
  );
}
