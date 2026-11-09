import './TrocasEmpty.css';

/**
 * Estado vazio contextual para Minhas Trocas.
 * Mantém a semântica e estética de FavoritosEmpty quando nenhum resultado é retornado.
 */
export default function TrocasEmpty({
  termoBusca,
  filtroAtivo,
  onLimparFiltros,
  onExplorar,
}) {
  const temFiltroAtivo = Boolean(termoBusca) || (filtroAtivo && filtroAtivo !== 'todas');

  return (
    <div className="trocas-empty" role="status" aria-live="polite">
      <div className="trocas-empty-icone" aria-hidden="true">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16l-4-4M20 17H4l4 4" />
          <path d="M20 7v4M4 17v-4" />
        </svg>
      </div>

      <div className="trocas-empty-texto">
        <p className="trocas-empty-titulo">
          {temFiltroAtivo
            ? 'Nenhuma troca encontrada com estes filtros'
            : 'Você ainda não possui trocas'}
        </p>
        <p className="trocas-empty-descricao">
          {temFiltroAtivo
            ? 'Experimente buscar por outros termos ou selecionar outro status nas abas acima.'
            : 'Dê match com profissionais e serviços incríveis para iniciar sua primeira troca no Swappify!'}
        </p>
      </div>

      <div className="trocas-empty-botoes">
        {temFiltroAtivo && onLimparFiltros && (
          <button
            type="button"
            className="trocas-empty-btn trocas-empty-btn--limpar"
            onClick={onLimparFiltros}
          >
            Limpar filtros
          </button>
        )}

        <button
          type="button"
          id="btn-explorar-trocas"
          className="trocas-empty-btn"
          onClick={onExplorar}
          aria-label="Explorar matches e serviços"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          Explorar matches
        </button>
      </div>
    </div>
  );
}

