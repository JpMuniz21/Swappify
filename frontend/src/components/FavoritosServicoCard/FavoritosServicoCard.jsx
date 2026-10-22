import './FavoritosServicoCard.css';

// icone do servico baseado no tipo
function IconeServico({ tipo }) {
  switch (tipo) {
    case 'design':
    case 'design-grafico':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m14 12 5.5-5.5a2.12 2.12 0 1 0-3-3L11 9" />
          <path d="M12 14 6.5 19.5a2.12 2.12 0 1 1-3-3L9 11" />
          <path d="m3 3 18 18" />
        </svg>
      );
    case 'video':
    case 'edicao-video':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="5" width="13" height="14" rx="2" />
          <polygon points="17 8 22 5 22 19 17 16 17 8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'marketing':
    case 'marketing-conteudo':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'sites':
    case 'criacao-sites':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'aulas':
    case 'educacao-aulas':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      );
  }
}

/**
 * Card de servico favoritado.
 * Exibe icone, titulo, descricao, prestador, avaliacao, tags e acoes.
 */
export default function FavoritosServicoCard({ servico, onVerPerfil, onRemover }) {
  const { id, titulo, descricao, prestador, avaliacao, tags, iconeTipo } = servico;

  return (
    <article className="fav-servico-card" aria-label={`Servico favoritado: ${titulo}`}>
      {/* botao coracao */}
      <button
        type="button"
        className="fav-card-coracao"
        aria-label={`Remover ${titulo} dos favoritos`}
        onClick={() => onRemover(id)}
        title="Remover dos favoritos"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* icone do servico */}
      <div className="fav-servico-icone-wrapper" aria-hidden="true">
        <IconeServico tipo={iconeTipo} />
      </div>

      {/* informacoes do servico */}
      <div className="fav-servico-info">
        <h3 className="fav-servico-titulo">{titulo}</h3>
        <p className="fav-servico-descricao">{descricao}</p>

        {prestador && (
          <p className="fav-servico-prestador">
            Oferecido por: <strong>{prestador.nome}</strong>
            <span className="fav-servico-prestador-avaliacao" aria-label={`Avaliacao ${prestador.avaliacao}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbd08" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {prestador.avaliacao}
            </span>
          </p>
        )}

        {tags?.length > 0 && (
          <ul className="fav-tags" aria-label="Categorias do servico">
            {tags.map((tag) => (
              <li key={tag} className="fav-tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>

      {/* acoes */}
      <div className="fav-card-acoes">
        <button
          type="button"
          id={`btn-ver-perfil-${id}`}
          className="fav-btn-ver-perfil"
          onClick={() => onVerPerfil(id)}
          aria-label={`Ver perfil do servico ${titulo}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver perfil
        </button>
        <button
          type="button"
          id={`btn-remover-servico-${id}`}
          className="fav-btn-remover"
          onClick={() => onRemover(id)}
          aria-label={`Remover ${titulo} dos favoritos`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
          Remover
        </button>
      </div>
    </article>
  );
}
