import { useState, useRef, useEffect } from 'react';
import './Select.css';

export default function Select({ label, id, options = [], placeholder, erro, value, onChange }) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef(null);

  // Fecha o dropdown se clicar fora do componente
  useEffect(() => {
    function handleClickFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  function handleSelecionar(valor) {
    if (onChange) {
      // Simula o evento padrão do React para não quebrar a função atualizar() do Cadastro
      onChange({ target: { value: valor } });
    }
    setAberto(false);
  }

  // Encontra o texto correspondente caso options sejam objetos { label, value } ou strings
  const opcaoAtual = options.find((opt) => {
    const val = typeof opt === 'object' ? opt.value : opt;
    return String(val) === String(value);
  });

  const textoExibido = opcaoAtual
    ? typeof opcaoAtual === 'object'
      ? opcaoAtual.label
      : opcaoAtual
    : null;

  return (
    <div className="campo campo-custom-select" ref={containerRef}>
      {label && <label className="campo-label" htmlFor={id}>{label}</label>}

      <div
        id={id}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        className={`campo-caixa campo-caixa--custom ${erro ? 'campo-caixa--erro' : ''}`}
        onClick={() => setAberto((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setAberto((prev) => !prev);
          } else if (e.key === 'Escape') {
            setAberto(false);
          }
        }}
      >
        <span className={`select-valor ${!textoExibido ? 'select-valor--placeholder' : ''}`}>
          {textoExibido || placeholder}
        </span>

        <span className={`campo-seta ${aberto ? 'campo-seta--aberto' : ''}`} aria-hidden="true">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        {/* Menu suspenso que abre estritamente para baixo */}
        {aberto && (
          <ul className="select-lista" role="listbox">
            {options.map((opcao) => {
              const valor = typeof opcao === 'object' ? opcao.value : opcao;
              const texto = typeof opcao === 'object' ? opcao.label : opcao;
              const selecionado = String(valor) === String(value);

              return (
                <li
                  key={valor}
                  role="option"
                  aria-selected={selecionado}
                  className={`select-item ${selecionado ? 'select-item--ativo' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelecionar(valor);
                  }}
                >
                  {texto}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {erro && <span className="campo-erro" role="alert">{erro}</span>}
    </div>
  );
}