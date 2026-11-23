import { useEffect } from 'react';
import '../AgendamentoForm/AgendamentoForm.css';
import './ConfirmarAcao.css';

// Janela de confirmação no estilo do site (no lugar do window.confirm do navegador).
// - titulo / mensagem: o que está sendo perguntado
// - rotuloConfirmar: texto do botão principal (ex.: "Sim, cancelar")
// - perigo: pinta o botão principal de vermelho (ações que desfazem algo)
export default function ConfirmarAcao({
  titulo,
  mensagem,
  rotuloConfirmar = 'Confirmar',
  rotuloVoltar = 'Voltar',
  perigo = false,
  onConfirmar,
  onCancelar,
}) {
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === 'Escape') onCancelar();
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onCancelar]);

  return (
    <div
      className="agenda-modal-fundo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div className="agenda-modal agenda-confirmar" role="alertdialog" aria-modal="true" aria-labelledby="agenda-confirmar-titulo">
        <h2 id="agenda-confirmar-titulo">{titulo}</h2>
        {mensagem && <p className="agenda-confirmar-texto">{mensagem}</p>}

        <div className="agenda-form-acoes">
          <button type="button" className="agenda-form-voltar" onClick={onCancelar}>
            {rotuloVoltar}
          </button>
          <button
            type="button"
            className={`agenda-form-salvar${perigo ? ' agenda-confirmar-perigo' : ''}`}
            onClick={onConfirmar}
            autoFocus
          >
            {rotuloConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
