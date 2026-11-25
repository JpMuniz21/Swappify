import { useEffect } from 'react';
import './Modal.css';

let modaisAbertos = 0; // quantos modais estão abertos agora

// className (opcional) vai na caixa do modal, para um modal específico mudar a largura, por exemplo.
export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (!isOpen) return undefined;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // trava a rolagem da página enquanto houver algum modal aberto (pode haver um por cima de outro)
  useEffect(() => {
    if (!isOpen) return undefined;
    modaisAbertos += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      modaisAbertos -= 1;
      if (modaisAbertos === 0) document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`modal-content ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
