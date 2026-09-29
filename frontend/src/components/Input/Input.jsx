import { useState } from 'react';
import './Input.css';

export default function Input({ label, id, type = 'text', erro, icone, ...props }) {
  const [visivel, setVisivel] = useState(false);
  const ehSenha = type === 'password';

  return (
    <div className="campo">
      {label && <label className="campo-label" htmlFor={id}>{label}</label>}
      <div className={`campo-caixa ${erro ? 'campo-caixa--erro' : ''}`}>
        {icone && (
          <span className="campo-icone" aria-hidden="true">
            {icone}
          </span>
        )}
        <input
          id={id}
          className="campo-input"
          type={ehSenha && visivel ? 'text' : type}
          aria-invalid={!!erro}
          {...props}
        />
        {ehSenha && (
          <button
            type="button"
            className="campo-olho"
            onClick={() => setVisivel((v) => !v)}
            aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visivel ? <IconeOlhoAberto /> : <IconeOlhoFechado />}
          </button>
        )}
      </div>
      {erro && <span className="campo-erro" role="alert">{erro}</span>}
    </div>
  );
}

function IconeOlhoAberto() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconeOlhoFechado() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="20" x2="21" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconeEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCadeado() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}