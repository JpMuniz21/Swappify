import { FILTROS_TROCAS } from '../trocasMock';
import './TrocasFiltros.css';

/**
 * Barra de abas/pills para filtrar trocas por status.
 * Inspirado no padrão e na estilização de FavoritosFiltros.
 */
export default function TrocasFiltros({
  filtroAtivo,
  onFiltroChange,
  contadores,
}) {
  return (
    <div className="trocas-filtros" role="tablist" aria-label="Filtrar trocas por status">
      {FILTROS_TROCAS.map((filtro) => {
        const ativo = filtroAtivo === filtro.id;
        const total = contadores ? contadores[filtro.id] : undefined;

        return (
          <button
            key={filtro.id}
            type="button"
            id={`tab-trocas-${filtro.id}`}
            role="tab"
            aria-selected={ativo}
            className={`trocas-filtro-btn ${ativo ? 'trocas-filtro-btn--ativo' : ''}`}
            onClick={() => onFiltroChange(filtro.id)}
          >
            <span>{filtro.label}</span>
            {typeof total === 'number' && (
              <span className="trocas-filtro-badge">{total}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

