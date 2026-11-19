import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import FavoritosPessoaCard from '../../components/FavoritosPessoaCard/FavoritosPessoaCard';
import FavoritosServicoCard from '../../components/FavoritosServicoCard/FavoritosServicoCard';
import FavoritosFiltros from '../../components/FavoritosFiltros/FavoritosFiltros';
import FavoritosEmpty from '../../components/FavoritosEmpty/FavoritosEmpty';
import { logout } from '../../services/authService';
import { listarFavoritos, removerFavorito, listarMatches, cancelarMatch } from '../../services/matchService';
import './Favoritos.css';

// Favorito (InteresseResource) → card de serviço
function paraServico(interesse) {
  return {
    id: interesse.id,
    titulo: interesse.servico?.titulo ?? 'Serviço',
    descricao: interesse.servico?.descricao ?? '',
    prestador: { nome: interesse.servico?.usuario?.name ?? 'Usuário' },
    tags: interesse.servico?.tipo ? [interesse.servico.tipo] : [],
    tipo: 'servico',
    adicionadoEm: new Date(interesse.data_criacao ?? interesse.created_at ?? 0),
    matchId: interesse.match_id ?? null,
  };
}

// Match (TrocaResource) → card de pessoa
function paraPessoa(match) {
  return {
    id: match.id,
    nome: match.outro?.name ?? 'Usuário',
    profissao: match.outro?.profession || 'Membro Swappify',
    tags: [match.servico_do_outro?.titulo, match.meu_servico?.titulo].filter(Boolean),
    tipo: 'pessoa',
    adicionadoEm: new Date(match.data_match ?? 0),
  };
}

const contem = (texto, termo) => (texto ?? '').toLowerCase().includes(termo);

export default function Favoritos() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [pessoas, setPessoas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let ativo = true;
    Promise.all([listarFavoritos(), listarMatches()])
      .then(([favoritos, matches]) => {
        if (!ativo) return;
        setServicos(favoritos.map(paraServico));
        setPessoas(matches.map(paraPessoa));
      })
      .catch(() => { if (ativo) setAviso('Não foi possível carregar seus favoritos. Recarregue a página.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function tratarErro(erro, padrao) {
    if (erro.status === 401 || erro.status === 419) {
      navigate('/login', { replace: true });
      return;
    }
    setAviso(erro.message ?? padrao);
  }

  // "Desfazer match": cancela o match (a conversa deixa de aparecer no chat)
  async function handleRemoverPessoa(matchId) {
    const pessoa = pessoas.find((p) => p.id === matchId);
    const ok = window.confirm(
      `Desfazer o match com ${pessoa?.nome ?? 'essa pessoa'}? A conversa de vocês deixará de aparecer no chat.`
    );
    if (!ok) return;
    try {
      await cancelarMatch(matchId);
      setPessoas((prev) => prev.filter((p) => p.id !== matchId));
      setServicos((prev) => prev.map((s) => (s.matchId === matchId ? { ...s, matchId: null } : s)));
      setAviso('');
    } catch (erro) {
      tratarErro(erro, 'Não foi possível desfazer o match.');
    }
  }

  // Remover um serviço dos favoritos. Se ele sustenta um match, o backend apaga
  // o match e as mensagens junto (regra atual), então avisamos antes.
  async function handleRemoverServico(interesseId) {
    const servico = servicos.find((s) => s.id === interesseId);
    if (servico?.matchId) {
      const ok = window.confirm(
        `Atenção: você tem um match ligado a "${servico.titulo}". Remover este favorito vai desfazer o match `
        + `e apagar a conversa de vocês, para os dois. Deseja continuar?`
      );
      if (!ok) return;
    }
    try {
      await removerFavorito(interesseId);
      setServicos((prev) => prev.filter((s) => s.id !== interesseId));
      if (servico?.matchId) setPessoas((prev) => prev.filter((p) => p.id !== servico.matchId));
      setAviso('');
    } catch (erro) {
      tratarErro(erro, 'Não foi possível remover o favorito.');
    }
  }

  async function sair() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  // filtra e busca os itens conforme o filtro ativo e o texto de busca
  const { pessoasFiltradas, servicosFiltrados } = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    // Todas as pessoas aqui são matches, então "Pessoas" e "Matches" mostram o mesmo grupo.
    const pessoasVisiveis = ['todos', 'pessoas', 'recentes', 'matches'].includes(filtro)
      ? pessoas.filter((p) => !termo
          || contem(p.nome, termo)
          || contem(p.profissao, termo)
          || p.tags.some((t) => contem(t, termo)))
      : [];

    const servicosVisiveis = ['todos', 'servicos', 'recentes'].includes(filtro)
      ? servicos.filter((s) => !termo
          || contem(s.titulo, termo)
          || contem(s.descricao, termo)
          || s.tags.some((t) => contem(t, termo))
          || contem(s.prestador?.nome, termo))
      : [];

    if (filtro === 'recentes') {
      pessoasVisiveis.sort((a, b) => b.adicionadoEm - a.adicionadoEm);
      servicosVisiveis.sort((a, b) => b.adicionadoEm - a.adicionadoEm);
    }

    return { pessoasFiltradas: pessoasVisiveis, servicosFiltrados: servicosVisiveis };
  }, [busca, filtro, pessoas, servicos]);

  const nenhumResultado = !carregando && pessoasFiltradas.length === 0 && servicosFiltrados.length === 0;

  return (
    <div className="fav-pagina">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />

      <main className="fav-main" id="main-content">
        <div className="fav-container">

          {/* cabecalho da pagina */}
          <header className="fav-cabecalho">
            <div className="fav-cabecalho-titulo-grupo">
              <div className="fav-cabecalho-icone" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div>
                <h1 className="fav-titulo">Favoritos</h1>
                <p className="fav-subtitulo">Serviços que você curtiu e pessoas com quem deu match.</p>
              </div>
            </div>
          </header>

          {/* campo de busca */}
          <div className="fav-busca-wrapper">
            <svg className="fav-busca-icone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="input-busca-favoritos"
              type="search"
              className="fav-busca-input"
              placeholder="Buscar por nome, servico ou habilidade"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar nos favoritos"
            />
          </div>

          {/* filtros */}
          <FavoritosFiltros filtroAtivo={filtro} onFiltroChange={setFiltro} />

          {aviso && <p className="fav-aviso" role="alert">{aviso}</p>}
          {carregando && <p className="fav-carregando" role="status">Carregando favoritos…</p>}

          {/* grid de pessoas (matches) */}
          {pessoasFiltradas.length > 0 && (
            <section className="fav-secao" aria-label="Pessoas com quem você deu match">
              <div className="fav-grid fav-grid--pessoas">
                {pessoasFiltradas.map((pessoa) => (
                  <FavoritosPessoaCard
                    key={pessoa.id}
                    pessoa={pessoa}
                    onConversar={() => navigate('/chat')}
                    onRemover={handleRemoverPessoa}
                    rotuloRemover="Desfazer match"
                  />
                ))}
              </div>
            </section>
          )}

          {/* grid de servicos */}
          {servicosFiltrados.length > 0 && (
            <section className="fav-secao" aria-label="Servicos favoritados">
              <div className="fav-grid fav-grid--servicos">
                {servicosFiltrados.map((servico) => (
                  <FavoritosServicoCard
                    key={servico.id}
                    servico={servico}
                    onRemover={handleRemoverServico}
                  />
                ))}
              </div>
            </section>
          )}

          {/* estado vazio (sem favoritos ou busca sem resultado) */}
          {nenhumResultado && !aviso && (
            <FavoritosEmpty onExplorar={() => navigate('/match')} />
          )}

        </div>
      </main>
    </div>
  );
}
