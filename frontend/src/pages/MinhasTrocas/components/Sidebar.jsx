import { Link } from 'react-router-dom';
import avatarPadrao from '../../../assets/avatar-padrao.svg';
import logo from '../../../assets/logo-swappify.svg';
import './Sidebar.css';

function IconeMenu({ tipo }) {
  const icones = {
    busca: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    coracao: (
      <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 5 2 10 8 15 6-5 12-10 8-15Z" />
    ),
    mensagem: (
      <path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z" />
    ),
    estrela: (
      <path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />
    ),
    troca: (
      <>
        <path d="M4 7h16l-4-4M20 17H4l4 4" />
        <path d="M20 7v4M4 17v-4" />
      </>
    ),
    agenda: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 11h18" />
      </>
    ),
    ajustes: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z" />
      </>
    ),
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icones[tipo]}
    </svg>
  );
}

export default function Sidebar({ usuario }) {
  const nomeUsuario = usuario?.name ?? 'Meu perfil';
  const avatarUsuario = usuario?.avatar_url || avatarPadrao;

  return (
    <aside className="trocas-sidebar" aria-label="Navegação lateral">
      <Link to="/perfil" className="trocas-sidebar-profile" aria-label="Acessar meu perfil">
        <img
          src={avatarUsuario}
          alt={nomeUsuario}
          className="trocas-sidebar-avatar"
        />
        <span className="trocas-sidebar-profile-text">
          <strong>{nomeUsuario}</strong>
          <small>Ver meu perfil</small>
        </span>
      </Link>

      <nav className="trocas-sidebar-menu" aria-label="Menu principal">
        <Link to="/feed">
          <IconeMenu tipo="busca" />
          <span>Descobrir</span>
        </Link>
        <Link to="/match">
          <IconeMenu tipo="coracao" />
          <span>Matches</span>
        </Link>
        <Link to="/chat">
          <IconeMenu tipo="mensagem" />
          <span>Mensagens</span>
        </Link>
        <Link to="/favoritos">
          <IconeMenu tipo="estrela" />
          <span>Favoritos</span>
        </Link>
        <Link
          to="/minhas-trocas"
          className="trocas-sidebar-link--ativo"
          aria-current="page"
        >
          <IconeMenu tipo="troca" />
          <span>Minhas Trocas</span>
        </Link>
        <Link to="/agendamentos">
          <IconeMenu tipo="agenda" />
          <span>Agendamentos</span>
        </Link>
        <Link to="/configuracoes">
          <IconeMenu tipo="ajustes" />
          <span>Configurações</span>
        </Link>
      </nav>

      <div className="trocas-sidebar-ad" aria-label="Anúncio">
        <div className="trocas-sidebar-ad-art">
          <img src={logo} alt="Logo Swappify" />
        </div>
        <strong>Anuncie com Swappify</strong>
      </div>
    </aside>
  );
}

