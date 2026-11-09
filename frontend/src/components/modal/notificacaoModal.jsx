import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import './NotificacoesModal.css';

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

function tempoRelativo(data) {
  if (!data) return '';
  const segundos = Math.round((new Date(data) - Date.now()) / 1000);
  const faixas = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unidade, base] of faixas) {
    if (Math.abs(segundos) >= base) return rtf.format(Math.round(segundos / base), unidade);
  }
  return 'agora';
}

export default function NotificacoesModal({
  isOpen,
  onClose,
  notificacoes,
  lidas,
  carregando,
  erro,
  onMarcarLida,
  onMarcarTodasLidas,
  onTentarNovamente,
}) {
  const navigate = useNavigate();
  const naoLidas = notificacoes.filter((n) => !lidas.has(n.id)).length;

  function abrir(n) {
    onMarcarLida(n.id);
    onClose();
    if (n.link) navigate(n.link);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notificações">
      {carregando && <p className="notif-estado">Carregando…</p>}

      {!carregando && erro && (
        <div className="notif-estado">
          <p>Não foi possível carregar suas notificações.</p>
          <button type="button" className="notif-link-btn" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && notificacoes.length === 0 && (
        <div className="notif-estado">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p>Tudo em dia por aqui. Você será avisado quando algo novo acontecer.</p>
        </div>
      )}

      {!carregando && !erro && notificacoes.length > 0 && (
        <>
          <div className="notif-topo">
            <span>{naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? 's' : ''}` : 'Todas lidas'}</span>
            {naoLidas > 0 && (
              <button type="button" className="notif-link-btn" onClick={onMarcarTodasLidas}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          <ul className="notif-lista">
            {notificacoes.map((n) => {
              const lida = lidas.has(n.id);
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`notif-item${lida ? '' : ' nao-lida'}`}
                    onClick={() => abrir(n)}
                  >
                    <span className="notif-icone" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </span>
                    <span className="notif-texto">
                      <strong>{n.titulo}</strong>
                      <span>{n.descricao}</span>
                      <small>{tempoRelativo(n.data)}</small>
                    </span>
                    {!lida && <span className="notif-ponto" aria-label="Não lida" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Modal>
  );
}