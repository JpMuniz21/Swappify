import { useState } from 'react';
import './MatchCard.css';

/**
 * Card principal do perfil sendo avaliado no Match.
 * Exibe foto (lado esquerdo com overlay de nome), e dados (lado direito).
 * Suporta animacao de swipe: direita = like, esquerda = pass.
 */
export default function MatchCard({ perfil, animacao }) {
  const [imgErro, setImgErro] = useState(false);

  if (!perfil) return null;

  const {
    nome,
    profissao,
    localizacao,
    bio,
    avaliacao,
    totalAvaliacoes,
    trocasRealizadas,
    taxaConclusao,
    foto,
  } = perfil;

  const classeAnimacao =
    animacao === 'like' ? 'match-card--saindo-direita' :
    animacao === 'pass' ? 'match-card--saindo-esquerda' :
    animacao === 'entrada' ? 'match-card--entrando' : '';

  return (
    <article
      className={`match-card ${classeAnimacao}`}
      aria-label={`Perfil de ${nome}`}
    >
      {/* lado esquerdo: foto */}
      <div className="match-card-foto-col">
        {foto && !imgErro ? (
          <img
            src={foto}
            alt={`Foto de ${nome}`}
            className="match-card-foto"
            onError={() => setImgErro(true)}
          />
        ) : (
          <div className="match-card-foto match-card-foto--placeholder" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        {/* overlay com nome e profissao na foto */}
        <div className="match-card-foto-overlay" aria-hidden="true">
          <p className="match-card-foto-nome">{nome}</p>
          <p className="match-card-foto-prof">{profissao}</p>
        </div>
      </div>

      {/* lado direito: informacoes */}
      <div className="match-card-info-col">
        <div className="match-card-header">
          <div>
            <h2 className="match-card-nome">{nome}</h2>
            <p className="match-card-profissao">
              {profissao}
              {localizacao && (
                <span className="match-card-local"> | {localizacao}</span>
              )}
            </p>
          </div>
        </div>

        {bio && (
          <p className="match-card-bio">{bio}</p>
        )}

        {/* metricas */}
        <div className="match-card-metricas" aria-label="Metricas do perfil">
          <div className="match-card-metrica-item">
            <div className="match-card-metrica-valor-linha">
              <span className="match-card-estrela" aria-hidden="true">&#9733;</span>
              <span className="match-card-metrica-valor">{avaliacao}</span>
            </div>
            <span className="match-card-metrica-rotulo">
              ({totalAvaliacoes} avaliacoes)
            </span>
          </div>

          <div className="match-card-metrica-separador" aria-hidden="true" />

          <div className="match-card-metrica-item">
            <span className="match-card-metrica-valor match-card-metrica-valor--destaque">
              {trocasRealizadas}
            </span>
            <span className="match-card-metrica-rotulo">Trocas realizadas</span>
          </div>

          <div className="match-card-metrica-separador" aria-hidden="true" />

          <div className="match-card-metrica-item">
            <span className="match-card-metrica-valor match-card-metrica-valor--destaque">
              {taxaConclusao}
            </span>
            <span className="match-card-metrica-rotulo">Taxa de conclusao</span>
          </div>
        </div>
      </div>
    </article>
  );
}
