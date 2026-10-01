import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-swappify.svg';
import defaultAvatar from '../../assets/lucas-avatar.jpg';
import './Navbar.css';

export default function Navbar({ usuario, onLogout, onEditProfile }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  // fecha o menu ao clicar fora dele
  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const primeiroNome = usuario?.name ? usuario.name.trim().split(' ')[0] : 'Lucas';
  const avatarUrl = usuario?.avatar_url || defaultAvatar;

  return (
    <header className="navbar" role="banner">
      <Link to="/perfil" className="navbar-logo-link" aria-label="Swappify Página Inicial">
        <img src={logo} alt="Logo Swappify" className="navbar-logo-img" />
        <span className="navbar-logo-text">Swappify</span>
      </Link>

      <div className="navbar-search-container">
        <input
          type="search"
          className="navbar-search-input"
          placeholder="Buscar por serviço ou nome"
          aria-label="Buscar serviços ou profissionais"
        />
        <svg
          className="navbar-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div className="navbar-actions">
        {/* icone de mensagens */}
        <button
          type="button"
          className="navbar-icon-btn"
          aria-label="Mensagens"
          title="Mensagens"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        {/* icone de notificacoes */}
        <button
          type="button"
          className="navbar-icon-btn"
          aria-label="Notificações"
          title="Notificações"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <div className="navbar-divider" aria-hidden="true" />

        {/* perfil do usuario e menu suspenso */}
        <div className="navbar-user-wrapper" ref={menuRef}>
          <button
            type="button"
            className="navbar-user-btn"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-expanded={menuAberto}
            aria-haspopup="true"
            aria-label="Menu do usuário"
          >
            <div className="navbar-user-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={primeiroNome} />
              ) : (
                <svg
                  className="navbar-user-avatar-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
            <span className="navbar-user-name">{primeiroNome}</span>
          </button>

          {menuAberto && (
            <div className="navbar-dropdown" role="menu">
              {onEditProfile && (
                <button
                  type="button"
                  className="navbar-dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuAberto(false);
                    onEditProfile();
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar perfil
                </button>
              )}
              <button
                type="button"
                className="navbar-dropdown-item danger"
                role="menuitem"
                onClick={() => {
                  setMenuAberto(false);
                  if (onLogout) onLogout();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
