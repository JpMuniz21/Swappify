import { useState } from 'react';
import './Input.css';

export default function Input({ label, id, type = 'text', erro, icone, ...props }) {
  const [visivel, setVisivel] = useState(false);
  const ehSenha = type === 'password';

  const iconesProntos = { pessoa: <IconePessoa />, email: <IconeEmail />, senha: <IconeCadeado /> };
  const iconeEsquerda = typeof icone === 'string' ? iconesProntos[icone] : icone;

  return (
    <div className="campo">
      <label className="campo-label" htmlFor={id}>{label}</label>
      <div className={`campo-caixa ${erro ? 'campo-caixa--erro' : ''}`}>
        {iconeEsquerda && <span className="campo-icone" aria-hidden="true">{iconeEsquerda}</span>}
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

function IconePessoa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconeEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4.5" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeCadeado() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10.5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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
