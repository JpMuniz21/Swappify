import './FavoritosFiltros.css';

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pessoas', label: 'Pessoas' },
  { id: 'servicos', label: 'Servicos' },
  { id: 'recentes', label: 'Recentes' },
  { id: 'matches', label: 'Matches' },
];

/**
 * Barra de filtros (tabs) da tela de favoritos.
 * Controla qual categoria esta sendo exibida.
 */
export default function FavoritosFiltros({ filtroAtivo, onFiltroChange }) {
  return (
    <div className="fav-filtros" role="tablist" aria-label="Filtrar favoritos">
      {FILTROS.map((filtro) => (
        <button
          key={filtro.id}
          type="button"
          id={`tab-favoritos-${filtro.id}`}
          role="tab"
          aria-selected={filtroAtivo === filtro.id}
          className={`fav-filtro-btn ${filtroAtivo === filtro.id ? 'fav-filtro-btn--ativo' : ''}`}
          onClick={() => onFiltroChange(filtro.id)}
        >
          {filtro.label}
        </button>
      ))}
    </div>
  );
}
