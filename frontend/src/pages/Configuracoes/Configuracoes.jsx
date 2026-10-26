import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Configuracoes.css';
import Navbar from '../../components/Navbar/Navbar';

const preferenciasIniciais = {
  mensagens: true,
  propostas: true,
  favoritos: false,
  atualizacoes: false,
};

// Ícones SVG no mesmo estilo utilizado no Navbar
function IconeSecao({ id, className }) {
  const propriedades = {
    className,
    viewBox: '0 0 24 24',
    width: 22,
    height: 22,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (id) {
    case 'conta':
      return (
        <svg {...propriedades}>
          <circle cx="12" cy="6" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </svg>
      );

    case 'notificacoes':
      return (
        <svg {...propriedades}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case 'seguranca':
      return (
        <svg {...propriedades}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case 'trocas':
  return (
    <svg {...propriedades}>
      <path d="M17 4l4 4-4 4" />
      <path d="M3 8h18" />
      <path d="M7 20l-4-4 4-4" />
      <path d="M21 16H3" />
    </svg>
  );

    default:
      return null;
  }
}

const secoes = [
  { id: 'conta', nome: 'Minha conta' },
  { id: 'notificacoes', nome: 'Notificações' },
  { id: 'seguranca', nome: 'Privacidade e segurança' },
  { id: 'trocas', nome: 'Preferências de troca' },
];

export default function Configuracoes() {
  const [secao, setSecao] = useState('notificacoes');
  const navigate = useNavigate();

  const [preferencias, setPreferencias] = useState(() => {
    try {
      const salvas = localStorage.getItem('swappify.preferencias');

      return salvas
        ? { ...preferenciasIniciais, ...JSON.parse(salvas) }
        : preferenciasIniciais;
    } catch {
      return preferenciasIniciais;
    }
  });

  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(
        'swappify.preferencias',
        JSON.stringify(preferencias)
      );
    } catch {
      // O navegador pode bloquear o armazenamento.
    }
  }, [preferencias]);

  function alternarPreferencia(chave) {
    setPreferencias((atual) => ({
      ...atual,
      [chave]: !atual[chave],
    }));

    setMensagem('');
  }

  function salvar() {
    setMensagem('Preferências salvas neste navegador!');
  }

  return (
    <div className="settings-page">
      <Navbar
  onEditProfile={() => navigate('/perfil')}
/>

      <main className="settings-main">
        <div className="settings-intro">
          <span className="settings-eyebrow">SUA CONTA</span>
          <h1>Configurações</h1>
          <p>Personalize sua experiência no Swappify.</p>
        </div>

        <div className="settings-layout">
          <nav
            className="settings-menu"
            aria-label="Configurações"
          >
            {secoes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  secao === item.id
                    ? 'settings-menu-item ativo'
                    : 'settings-menu-item'
                }
                onClick={() => {
                  setSecao(item.id);
                  setMensagem('');
                }}
              >
                <span className="settings-menu-icone">
                  <IconeSecao id={item.id} />
                </span>

                <span className="settings-menu-nome">
                  {item.nome}
                </span>

                <span className="settings-menu-seta">›</span>
              </button>
            ))}
          </nav>

          <section className="settings-content">
            {secao === 'notificacoes' && (
              <>
                <div className="settings-titulo-secao">
                  <span className="settings-icone-grande">
                    <IconeSecao id="notificacoes" />
                  </span>

                  <div>
                    <h2>Notificações</h2>
                    <p>Escolha os avisos que deseja receber.</p>
                  </div>
                </div>

                <div className="settings-card">
                  {[
                    {
                      id: 'mensagens',
                      titulo: 'Mensagens',
                      descricao: 'Quando alguém enviar uma mensagem.',
                    },
                    {
                      id: 'propostas',
                      titulo: 'Novas propostas',
                      descricao: 'Quando alguém propuser uma troca.',
                    },
                    {
                      id: 'favoritos',
                      titulo: 'Favoritos',
                      descricao: 'Atualizações dos itens favoritos.',
                    },
                    {
                      id: 'atualizacoes',
                      titulo: 'Atualizações',
                      descricao: 'Novidades e avisos do Swappify.',
                    },
                  ].map((item) => (
                    <div
                      className="settings-option"
                      key={item.id}
                    >
                      <div className="settings-option-texto">
                        <h3>{item.titulo}</h3>
                        <p>{item.descricao}</p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={preferencias[item.id]}
                        aria-label={item.titulo}
                        className={
                          preferencias[item.id]
                            ? 'settings-switch ligado'
                            : 'settings-switch'
                        }
                        onClick={() =>
                          alternarPreferencia(item.id)
                        }
                      >
                        <span />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {secao === 'conta' && (
              <>
                <div className="settings-titulo-secao">
                  <span className="settings-icone-grande">
                    <IconeSecao id="conta" />
                  </span>

                  <div>
                    <h2>Minha conta</h2>
                    <p>Consulte os dados básicos da sua conta.</p>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-info-conta">
                    <span className="settings-avatar">S</span>

                    <div>
                      <h3>Seu perfil Swappify</h3>
                      <p>
                        Gerencie suas informações na tela de perfil.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/perfil"
                    className="settings-botao-link"
                  >
                    Editar perfil
                  </Link>
                </div>
              </>
            )}

            {secao === 'seguranca' && (
              <>
                <div className="settings-titulo-secao">
                  <span className="settings-icone-grande">
                    <IconeSecao id="seguranca" />
                  </span>

                  <div>
                    <h2>Privacidade e segurança</h2>
                    <p>Gerencie o acesso à sua conta.</p>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-option">
                    <div className="settings-option-texto">
                      <h3>Dados da conta</h3>
                      <p>Revise suas informações no perfil.</p>
                    </div>

                    <Link
                      to="/perfil"
                      className="settings-text-link"
                    >
                      Acessar
                    </Link>
                  </div>

                  <div className="settings-aviso">
                    A alteração de senha e as opções de privacidade
                    precisam ser conectadas aos serviços de autenticação
                    do projeto.
                  </div>
                </div>
              </>
            )}

            {secao === 'trocas' && (
              <>
                <div className="settings-titulo-secao">
                  <span className="settings-icone-grande">
                    <IconeSecao id="trocas" />
                  </span>

                  <div>
                    <h2>Preferências de troca</h2>
                    <p>Organize como você deseja negociar.</p>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="settings-option">
                    <div className="settings-option-texto">
                      <h3>Localização e disponibilidade</h3>
                      <p>
                        Informe onde e quando pode realizar suas trocas.
                      </p>
                    </div>

                    <Link
                      to="/perfil"
                      className="settings-text-link"
                    >
                      Editar
                    </Link>
                  </div>

                  <p className="settings-ajuda">
                    Essas informações ajudam outros usuários a encontrar
                    oportunidades de permuta compatíveis com você.
                  </p>
                </div>
              </>
            )}

            {secao === 'notificacoes' && (
              <div className="settings-acoes">
                <p
                  role="status"
                  className="settings-mensagem"
                >
                  {mensagem}
                </p>

                <button
                  type="button"
                  className="settings-salvar"
                  onClick={salvar}
                >
                  Salvar preferências
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}