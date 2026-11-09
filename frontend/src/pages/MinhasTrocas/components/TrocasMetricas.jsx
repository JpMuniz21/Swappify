import './TrocasMetricas.css';

export default function TrocasMetricas({ metricas }) {
  const ativas = metricas?.ativas ?? 2;
  const aguardando = metricas?.aguardando ?? 1;
  const concluidas = metricas?.concluidas ?? 14;

  return (
    <section className="trocas-metricas-grid" aria-label="Indicadores de trocas">
      {/* Card 1: Ativas */}
      <article className="trocas-metrica-card trocas-metrica-card--ativas">
        <div className="trocas-metrica-icone" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16l-4-4M20 17H4l4 4" />
            <path d="M20 7v4M4 17v-4" />
          </svg>
        </div>
        <div className="trocas-metrica-conteudo">
          <span className="trocas-metrica-valor">{ativas}</span>
          <h2 className="trocas-metrica-titulo">Ativas</h2>
          <span className="trocas-metrica-subtitulo">Em andamento</span>
        </div>
      </article>

      {/* Card 2: Aguardando Resposta */}
      <article className="trocas-metrica-card trocas-metrica-card--aguardando">
        <div className="trocas-metrica-icone" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="trocas-metrica-conteudo">
          <span className="trocas-metrica-valor">{aguardando}</span>
          <h2 className="trocas-metrica-titulo">Aguardando Resposta</h2>
          <span className="trocas-metrica-subtitulo">Requer sua atenção</span>
        </div>
      </article>

      {/* Card 3: Concluídas */}
      <article className="trocas-metrica-card trocas-metrica-card--concluidas">
        <div className="trocas-metrica-icone" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="trocas-metrica-conteudo">
          <span className="trocas-metrica-valor">{concluidas}</span>
          <h2 className="trocas-metrica-titulo">Concluídas</h2>
          <span className="trocas-metrica-subtitulo">Trocas realizadas</span>
        </div>
      </article>
    </section>
  );
}

