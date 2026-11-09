import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from './components/Sidebar';
import TrocasMetricas from './components/TrocasMetricas';
import TrocasFiltros from './components/TrocasFiltros';
import TrocaCard from './components/TrocaCard';
import TrocasEmpty from './components/TrocasEmpty';
import TrocaModal from './components/TrocaModal';
import { METRICAS_MOCK, TROCAS_MOCK } from './trocasMock';
import avatarPadrao from '../../assets/avatar-padrao.svg';
import './MinhasTrocas.css';

export default function MinhasTrocas() {
  const navigate = useNavigate();

  // Usuário logado, vindo do RotaProtegida (mesmo padrão do Feed).

  const { usuario } = useOutletContext() ?? {};
  const usuarioLogado = useMemo(
    () => ({
      ...usuario,
      name: usuario?.name ?? 'Meu perfil',
      avatar_url: usuario?.avatar_url || avatarPadrao,
    }),
    [usuario]
  );

  const [metricas, setMetricas] = useState(METRICAS_MOCK);
  const [trocas, setTrocas] = useState(TROCAS_MOCK);
  const [filtro, setFiltro] = useState('todas');
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [aviso, setAviso] = useState('');
  const [modalAtivo, setModalAtivo] = useState(null);

  const dropdownRef = useRef(null);


  const primeiroNome = usuario?.name?.split(' ')[0] ?? '';
  const trocasComUsuario = useMemo(
    () =>
      trocas.map((t) => ({
        ...t,
        voce: {
          ...t.voce,
          nome: primeiroNome ? `Você (${primeiroNome})` : 'Você',
          avatar: usuarioLogado.avatar_url,
        },
      })),
    [trocas, primeiroNome, usuarioLogado.avatar_url]
  );

  useEffect(() => {
    function handleClickFora(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const contadores = useMemo(() => {
    return {
      todas: trocas.length,
      em_andamento: trocas.filter((t) => t.status === 'em_andamento').length,
      solicitacoes: trocas.filter((t) => t.status === 'aguardando_voce').length,
      concluidas: trocas.filter((t) => t.status === 'concluida').length,
      canceladas: trocas.filter((t) => t.status === 'cancelada').length,
    };
  }, [trocas]);

  const trocasFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const resultado = trocasComUsuario.filter((troca) => {
      if (filtro === 'em_andamento' && troca.status !== 'em_andamento') return false;
      if (filtro === 'solicitacoes' && troca.status !== 'aguardando_voce') return false;
      if (filtro === 'concluidas' && troca.status !== 'concluida') return false;
      if (filtro === 'canceladas' && troca.status !== 'cancelada') return false;

      if (!termo) return true;

      const nomeParceiro = (troca.parceiro?.nome || '').toLowerCase();
      const servicoParceiro = (troca.parceiro?.servico || '').toLowerCase();
      const servicoVoce = (troca.voce?.servico || '').toLowerCase();
      const acordo = (troca.acordo || '').toLowerCase();
      const categoria = (troca.parceiro?.categoria || '').toLowerCase();

      return (
        nomeParceiro.includes(termo) ||
        servicoParceiro.includes(termo) ||
        servicoVoce.includes(termo) ||
        acordo.includes(termo) ||
        categoria.includes(termo)
      );
    });

    if (ordenacao === 'nome') {
      resultado.sort((a, b) =>
        (a.parceiro?.nome || '').localeCompare(b.parceiro?.nome || '')
      );
    } else if (ordenacao === 'antigas') {
      resultado.reverse();
    }

    return resultado;
  }, [trocasComUsuario, filtro, busca, ordenacao]);


  function handleConversar() {
    navigate('/chat');
  }

  function handleVerDetalhes(troca, tipo = 'detalhes') {
    setModalAtivo({ tipo, troca });
  }

  function handleConcluir(trocaAlvo) {
    setTrocas((prev) =>
      prev.map((t) =>
        t.id === trocaAlvo.id
          ? {
              ...t,
              status: 'concluida',
              statusLabel: 'Concluída',
              badgeVariant: 'concluida',
              dataConclusao: 'Hoje',
            }
          : t
      )
    );

    setMetricas((prev) => ({
      ...prev,
      ativas: Math.max(0, prev.ativas - 1),
      concluidas: prev.concluidas + 1,
    }));

    setAviso(`A troca com ${trocaAlvo.parceiro?.nome} foi marcada como concluída!`);
  }

  function handleAceitar(trocaAlvo) {
    setTrocas((prev) =>
      prev.map((t) =>
        t.id === trocaAlvo.id
          ? {
              ...t,
              status: 'em_andamento',
              statusLabel: 'Em andamento',
              badgeVariant: 'em_andamento',
            }
          : t
      )
    );

    setMetricas((prev) => ({
      ...prev,
      aguardando: Math.max(0, prev.aguardando - 1),
      ativas: prev.ativas + 1,
    }));

    setAviso(`Proposta de ${trocaAlvo.parceiro?.nome} aceita com sucesso! Status alterado para Em andamento.`);
  }

  function handleRecusar(trocaAlvo) {
    setTrocas((prev) =>
      prev.map((t) =>
        t.id === trocaAlvo.id
          ? {
              ...t,
              status: 'cancelada',
              statusLabel: 'Cancelada',
              badgeVariant: 'cancelada',
            }
          : t
      )
    );

    setMetricas((prev) => ({
      ...prev,
      aguardando: Math.max(0, prev.aguardando - 1),
    }));

    setAviso(`Proposta de troca com ${trocaAlvo.parceiro?.nome} recusada.`);
  }

  // Ação 6: Avaliar Troca
  function handleAvaliar(trocaAlvo) {
    setModalAtivo({ tipo: 'avaliar', troca: trocaAlvo });
  }

  // Confirmação da Avaliação
  function handleConfirmarAvaliacao(trocaAlvo, nota) {
    setModalAtivo(null);
    setAviso(`Avaliação de ${nota} estrelas enviada para ${trocaAlvo.parceiro?.nome}! Obrigado pelo feedback.`);
  }

  return (
    <div className="minhas-trocas-pagina">
      {/* 1. Header Oficial Swappify */}
      <Navbar
        usuario={usuarioLogado}
        onLogout={() => navigate('/login')}
        onEditProfile={() => navigate('/perfil')}
      />

      <div className="minhas-trocas-layout">
        {/* 2. Sidebar Lateral */}
        <Sidebar usuario={usuarioLogado} />

        {/* 3. Conteúdo Principal */}
        <main className="minhas-trocas-main" id="main-content">
          <div className="minhas-trocas-container">
            {/* Cabeçalho da Página */}
            <header className="minhas-trocas-cabecalho">
              <div className="minhas-trocas-titulo-grupo">
                <div className="minhas-trocas-icone-topo" aria-hidden="true">
                  <svg
                    width="28"
                    height="28"
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
                <div>
                  <h1 className="minhas-trocas-titulo">Minhas Trocas</h1>
                  <p className="minhas-trocas-subtitulo">
                    Acompanhe o status e histórico de todas as suas trocas de serviços.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="minhas-trocas-btn-explorar"
                onClick={() => navigate('/match')}
                aria-label="Explorar novos matches para troca"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Nova Troca
              </button>
            </header>

            {/* Aviso/Feedback Dinâmico */}
            {aviso && (
              <aside className="minhas-trocas-aviso" role="status" aria-live="polite">
                <span className="minhas-trocas-aviso-texto">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {aviso}
                </span>
                <button
                  type="button"
                  className="minhas-trocas-aviso-fechar"
                  onClick={() => setAviso('')}
                  aria-label="Fechar notificação"
                >
                  ✕
                </button>
              </aside>
            )}

            {/* 4. Área de Métricas (Top Cards: Ativas: 2, Aguardando: 1, Concluídas: 14) */}
            <TrocasMetricas metricas={metricas} />

            {/* 5. Barra de Filtros e Busca */}
            <div className="minhas-trocas-toolbar">
              {/* Input de busca textual com ícone de lupa */}
              <div className="minhas-trocas-busca-wrapper">
                <svg
                  className="minhas-trocas-busca-icone"
                  width="18"
                  height="18"
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
                <input
                  type="search"
                  className="minhas-trocas-busca-input"
                  placeholder="Buscar por parceiro, serviço ou resumo do acordo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Buscar nas minhas trocas"
                />
                {busca && (
                  <button
                    type="button"
                    className="minhas-trocas-busca-limpar"
                    onClick={() => setBusca('')}
                    aria-label="Limpar busca"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Botão de Ordenação / Filtrar por */}
              <div className="minhas-trocas-ordenar-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="minhas-trocas-btn-filtrar-por"
                  onClick={() => setDropdownAberto(!dropdownAberto)}
                  aria-expanded={dropdownAberto}
                  aria-haspopup="true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  <span>
                    Filtrar por: {ordenacao === 'recentes' ? 'Recentes' : ordenacao === 'antigas' ? 'Antigas' : 'Nome'}
                  </span>
                  <svg
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
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownAberto && (
                  <div className="minhas-trocas-dropdown-ordenar" role="menu">
                    <button
                      type="button"
                      className={`minhas-trocas-dropdown-item ${ordenacao === 'recentes' ? 'minhas-trocas-dropdown-item--ativo' : ''}`}
                      role="menuitem"
                      onClick={() => {
                        setOrdenacao('recentes');
                        setDropdownAberto(false);
                      }}
                    >
                      Mais recentes
                    </button>
                    <button
                      type="button"
                      className={`minhas-trocas-dropdown-item ${ordenacao === 'antigas' ? 'minhas-trocas-dropdown-item--ativo' : ''}`}
                      role="menuitem"
                      onClick={() => {
                        setOrdenacao('antigas');
                        setDropdownAberto(false);
                      }}
                    >
                      Mais antigas
                    </button>
                    <button
                      type="button"
                      className={`minhas-trocas-dropdown-item ${ordenacao === 'nome' ? 'minhas-trocas-dropdown-item--ativo' : ''}`}
                      role="menuitem"
                      onClick={() => {
                        setOrdenacao('nome');
                        setDropdownAberto(false);
                      }}
                    >
                      Nome do parceiro
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Abas/Pills de Status (Todas, Em Andamento, Solicitações, Concluídas, Canceladas) */}
            <TrocasFiltros
              filtroAtivo={filtro}
              onFiltroChange={setFiltro}
              contadores={contadores}
            />

            {/* 6. Lista de Cards de Troca */}
            {trocasFiltradas.length > 0 ? (
              <section className="minhas-trocas-lista" aria-label="Lista de trocas">
                {trocasFiltradas.map((troca) => (
                  <TrocaCard
                    key={troca.id}
                    troca={troca}
                    onConversar={handleConversar}
                    onVerDetalhes={handleVerDetalhes}
                    onConcluir={handleConcluir}
                    onAceitar={handleAceitar}
                    onRecusar={handleRecusar}
                    onAvaliar={handleAvaliar}
                  />
                ))}
              </section>
            ) : (
              /* 7. Estado Vazio (Empty State) */
              <TrocasEmpty
                termoBusca={busca}
                filtroAtivo={filtro}
                onLimparFiltros={() => {
                  setBusca('');
                  setFiltro('todas');
                }}
                onExplorar={() => navigate('/match')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modal de Detalhes ou Avaliação */}
      {modalAtivo && (
        <TrocaModal
          tipo={modalAtivo.tipo}
          troca={modalAtivo.troca}
          onClose={() => setModalAtivo(null)}
          onConfirmarAvaliacao={handleConfirmarAvaliacao}
        />
      )}
    </div>
  );
}

