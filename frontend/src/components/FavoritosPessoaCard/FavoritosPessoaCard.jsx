import './FavoritosPessoaCard.css';

export default function FavoritosPessoaCard({ pessoa, onConversar, onRemover }) {
  const { id, nome, profissao, localizacao, online, avaliacao, tags, avatar } = pessoa;

  return (
    <article className="fav-pessoa-card" aria-label={`Favorito: ${nome}`}>
      <button type="button" className="fav-card-coracao" aria-label={`Remover ${nome} dos favoritos`} onClick={() => onRemover(id)} title="Remover dos favoritos">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div className="fav-pessoa-avatar-wrapper">
        {avatar ? (
          <img src={avatar} alt={`Foto de ${nome}`} className="fav-pessoa-avatar" />
        ) : (
          <div className="fav-pessoa-avatar fav-pessoa-avatar--placeholder" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      <div className="fav-pessoa-info">
        <div className="fav-pessoa-nome-linha">
          <h3 className="fav-pessoa-nome">{nome}</h3>
          <span className="fav-pessoa-avaliacao" aria-label={`Avaliacao ${avaliacao}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbd08" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {avaliacao}
          </span>
        </div>
        <p className="fav-pessoa-profissao">{profissao}</p>
        <div className="fav-pessoa-meta">
          <span className="fav-pessoa-local">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {localizacao}
          </span>
          <span className={`fav-pessoa-status ${online ? 'fav-pessoa-status--online' : 'fav-pessoa-status--offline'}`}>
            <span className="fav-pessoa-status-dot" aria-hidden="true" />
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
        {tags?.length > 0 && (
          <ul className="fav-tags" aria-label="Habilidades">
            {tags.map((tag) => (
              <li key={tag} className="fav-tag">{tag}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="fav-card-acoes">
        <button type="button" id={`btn-conversar-${id}`} className="fav-btn-conversar" onClick={() => onConversar(id)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Conversar
        </button>
        <button type="button" id={`btn-remover-pessoa-${id}`} className="fav-btn-remover" onClick={() => onRemover(id)}>
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
