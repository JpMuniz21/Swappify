import lucasAvatar from '../../../assets/lucas-avatar.jpg';
import './TrocaCard.css';

/**
 * Subcomponente de Card Horizontal de Troca.
 * Exibe os dois lados da troca (Você com lucas-avatar.jpg e o Parceiro),
 * o resumo do acordo combinado, badge de status e ações dinâmicas.
 */
export default function TrocaCard({
  troca,
  onConversar,
  onVerDetalhes,
  onConcluir,
  onAceitar,
  onRecusar,
  onAvaliar,
}) {
  const {
    id,
    status,
    statusLabel,
    badgeVariant,
    voce,
    parceiro,
    acordo,
    dataInicio,
    prazo,
    dataConclusao,
  } = troca;

  // Garante obrigatoriamente a foto lucas-avatar.jpg para o usuário logado ("Você")
  const avatarVoce = voce?.avatar || lucasAvatar;

  // Badge de status correspondente
  function renderBadge() {
    switch (status) {
      case 'em_andamento':
        return (
          <span className="troca-badge troca-badge--em-andamento">
            <span className="troca-badge-dot" aria-hidden="true" />
            {statusLabel || 'Em andamento'}
          </span>
        );
      case 'aguardando_voce':
        return (
          <span className="troca-badge troca-badge--aguardando">
            <span className="troca-badge-dot" aria-hidden="true" />
            {statusLabel || 'Aguardando você'}
          </span>
        );
      case 'concluida':
        return (
          <span className="troca-badge troca-badge--concluida">
            <svg
              className="troca-badge-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {statusLabel || 'Concluída'}
          </span>
        );
      case 'cancelada':
        return (
          <span className="troca-badge troca-badge--cancelada">
            <span className="troca-badge-dot" aria-hidden="true" />
            {statusLabel || 'Cancelada'}
          </span>
        );
      default:
        return (
          <span className="troca-badge">
            {statusLabel || status}
          </span>
        );
    }
  }

  // Renderiza botões de ação dinâmicos conforme a regra de status
  function renderAcoes() {
    if (status === 'em_andamento') {
      return (
        <div className="troca-card-acoes">
          <button
            type="button"
            className="troca-btn troca-btn--chat"
            onClick={() => onConversar && onConversar(troca)}
            aria-label={`Conversar com ${parceiro?.nome} no Chat`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Conversar
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--secundario"
            onClick={() => onVerDetalhes && onVerDetalhes(troca, 'detalhes')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Ver Detalhes
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--concluir"
            onClick={() => onConcluir && onConcluir(troca)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Marcar como concluída
          </button>
        </div>
      );
    }

    if (status === 'aguardando_voce') {
      return (
        <div className="troca-card-acoes">
          <button
            type="button"
            className="troca-btn troca-btn--chat"
            onClick={() => onConversar && onConversar(troca)}
            aria-label={`Conversar com ${parceiro?.nome} no Chat`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Conversar
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--secundario"
            onClick={() => onVerDetalhes && onVerDetalhes(troca, 'proposta')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Ver proposta
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--aceitar"
            onClick={() => onAceitar && onAceitar(troca)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Aceitar
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--recusar"
            onClick={() => onRecusar && onRecusar(troca)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Recusar
          </button>
        </div>
      );
    }

    if (status === 'concluida') {
      return (
        <div className="troca-card-acoes">
          <button
            type="button"
            className="troca-btn troca-btn--chat"
            onClick={() => onConversar && onConversar(troca)}
            aria-label={`Conversar com ${parceiro?.nome} no Chat`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Conversar
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--secundario"
            onClick={() => onVerDetalhes && onVerDetalhes(troca, 'historico')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Ver Histórico
          </button>

          <button
            type="button"
            className="troca-btn troca-btn--avaliar"
            onClick={() => onAvaliar && onAvaliar(troca)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#fbbd08" stroke="#d97706" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Avaliar troca
          </button>
        </div>
      );
    }

    // Cancelada ou outro status
    return (
      <div className="troca-card-acoes">
        <button
          type="button"
          className="troca-btn troca-btn--chat"
          onClick={() => onConversar && onConversar(troca)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          Conversar
        </button>
        <button
          type="button"
          className="troca-btn troca-btn--secundario"
          onClick={() => onVerDetalhes && onVerDetalhes(troca, 'detalhes')}
        >
          Ver Detalhes
        </button>
      </div>
    );
  }

  return (
    <article className="troca-card" aria-label={`Troca com ${parceiro?.nome}`}>
      {/* Topo do card: status e datas/prazos */}
      <header className="troca-card-cabecalho">
        <div className="troca-card-status-wrapper">
          {renderBadge()}
          {prazo && <span className="troca-card-prazo">{prazo}</span>}
          {dataConclusao && (
            <span className="troca-card-data-conclusao">
              Concluída em {dataConclusao}
            </span>
          )}
        </div>
        {dataInicio && (
          <span className="troca-card-data-inicio">Iniciada em {dataInicio}</span>
        )}
      </header>

      {/* Seção Central Horizontal: Você <-> Conector <-> Parceiro */}
      <div className="troca-card-negociacao">
        {/* Lado Esquerdo: Você com foto lucas-avatar.jpg */}
        <div className="troca-lado troca-lado--voce">
          <div className="troca-avatar-container">
            <img
              src={avatarVoce}
              alt="Você"
              className="troca-avatar troca-avatar--voce"
            />
            <span className="troca-voce-tag">Você</span>
          </div>
          <div className="troca-lado-info">
            <div className="troca-lado-nome-linha">
              <strong className="troca-lado-nome">{voce?.nome || 'Você'}</strong>
            </div>
            <div className="troca-servico-tag-wrapper">
              <span className="troca-servico-tag troca-servico-tag--voce">
                {voce?.servico || 'Serviço ofertado'}
              </span>
            </div>
          </div>
        </div>

        {/* Centro: Ícone Conector de Troca */}
        <div className="troca-conector" aria-hidden="true">
          <div className="troca-conector-linha" />
          <div className="troca-conector-icone" title="Troca mútua">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 7h16l-4-4M20 17H4l4 4" />
              <path d="M20 7v4M4 17v-4" />
            </svg>
          </div>
          <div className="troca-conector-linha" />
        </div>

        {/* Lado Direito: Parceiro com Avatar, Nome, Nota ⭐ e Tag */}
        <div className="troca-lado troca-lado--parceiro">
          <div className="troca-avatar-container">
            {parceiro?.avatar ? (
              <img
                src={parceiro.avatar}
                alt={parceiro?.nome}
                className="troca-avatar"
              />
            ) : (
              <div className="troca-avatar troca-avatar--placeholder">
                {parceiro?.nome ? parceiro.nome.charAt(0) : '?'}
              </div>
            )}
          </div>
          <div className="troca-lado-info">
            <div className="troca-lado-nome-linha">
              <strong className="troca-lado-nome">{parceiro?.nome}</strong>
              {parceiro?.avaliacao && (
                <span className="troca-parceiro-nota" aria-label={`Avaliação: ${parceiro.avaliacao}`}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="#fbbd08"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {parceiro.avaliacao}
                </span>
              )}
            </div>
            <div className="troca-servico-tag-wrapper">
              <span className="troca-servico-tag troca-servico-tag--parceiro">
                {parceiro?.servico || 'Serviço solicitado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo do Acordo Combinado */}
      <div className="troca-acordo-box">
        <div className="troca-acordo-icone" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div className="troca-acordo-conteudo">
          <span className="troca-acordo-label">Resumo do Acordo:</span>
          <p className="troca-acordo-texto">{acordo}</p>
        </div>
      </div>

      {/* Rodapé: Ações dinâmicas de acordo com o status */}
      <footer className="troca-card-rodape">
        {renderAcoes()}
      </footer>
    </article>
  );
}

