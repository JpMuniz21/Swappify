import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import FavoritosPessoaCard from '../../components/FavoritosPessoaCard/FavoritosPessoaCard';
import FavoritosServicoCard from '../../components/FavoritosServicoCard/FavoritosServicoCard';
import FavoritosFiltros from '../../components/FavoritosFiltros/FavoritosFiltros';
import FavoritosEmpty from '../../components/FavoritosEmpty/FavoritosEmpty';
import './Favoritos.css';

// dados mockados de pessoas favoritadas
const PESSOAS_MOCK = [
  {
    id: 'p1',
    nome: 'Mariana Silva',
    profissao: 'Designer Grafica',
    localizacao: 'Sao Paulo, SP',
    online: true,
    avaliacao: '4.9',
    tags: ['Design', 'Identidade Visual', 'Branding'],
    avatar: null,
    tipo: 'pessoa',
    adicionadoEm: new Date('2026-10-20'),
  },
  {
    id: 'p2',
    nome: 'Joao Pedro',
    profissao: 'Editor de Video',
    localizacao: 'Rio de Janeiro, RJ',
    online: true,
    avaliacao: '4.8',
    tags: ['Video', 'Edicao', 'Motion'],
    avatar: null,
    tipo: 'pessoa',
    adicionadoEm: new Date('2026-10-19'),
  },
  {
    id: 'p3',
    nome: 'Camila Santos',
    profissao: 'Social Media',
    localizacao: 'Belo Horizonte, MG',
    online: true,
    avaliacao: '4.7',
    tags: ['Marketing', 'Conteudo', 'Instagram'],
    avatar: null,
    tipo: 'pessoa',
    adicionadoEm: new Date('2026-10-18'),
  },
  {
    id: 'p4',
    nome: 'Lucas Almeida',
    profissao: 'Desenvolvedor Web',
    localizacao: 'Curitiba, PR',
    online: true,
    avaliacao: '4.9',
    tags: ['Web', 'React', 'JavaScript'],
    avatar: null,
    tipo: 'pessoa',
    adicionadoEm: new Date('2026-10-17'),
  },
];

// dados mockados de servicos favoritados
const SERVICOS_MOCK = [
  {
    id: 's1',
    titulo: 'Identidade Visual',
    descricao: 'Criacao completa de identidade visual para marcas e empresas.',
    prestador: { nome: 'Mariana Silva', avaliacao: '4.9' },
    tags: ['Design', 'Branding', 'Logo'],
    iconeTipo: 'design',
    tipo: 'servico',
    adicionadoEm: new Date('2026-10-20'),
  },
  {
    id: 's2',
    titulo: 'Edicao de Videos',
    descricao: 'Edicao de videos para redes sociais, YouTube e conteudo digital.',
    prestador: { nome: 'Joao Pedro', avaliacao: '4.8' },
    tags: ['Video', 'Edicao', 'YouTube'],
    iconeTipo: 'edicao-video',
    tipo: 'servico',
    adicionadoEm: new Date('2026-10-19'),
  },
  {
    id: 's3',
    titulo: 'Gestao de Redes Sociais',
    descricao: 'Gestao completa das suas redes sociais e criacao de conteudo.',
    prestador: { nome: 'Camila Santos', avaliacao: '4.7' },
    tags: ['Marketing', 'Instagram', 'Conteudo'],
    iconeTipo: 'marketing',
    tipo: 'servico',
    adicionadoEm: new Date('2026-10-18'),
  },
  {
    id: 's4',
    titulo: 'Criacao de Sites',
    descricao: 'Sites institucionais, landing pages e lojas virtuais.',
    prestador: { nome: 'Lucas Almeida', avaliacao: '4.9' },
    tags: ['Web', 'Landing Page', 'WordPress'],
    iconeTipo: 'criacao-sites',
    tipo: 'servico',
    adicionadoEm: new Date('2026-10-17'),
  },
];

export default function Favoritos() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [pessoas, setPessoas] = useState(PESSOAS_MOCK);
  const [servicos, setServicos] = useState(SERVICOS_MOCK);

  // remove uma pessoa dos favoritos
  function handleRemoverPessoa(id) {
    setPessoas((prev) => prev.filter((p) => p.id !== id));
  }

  // remove um servico dos favoritos
  function handleRemoverServico(id) {
    setServicos((prev) => prev.filter((s) => s.id !== id));
  }

  // redireciona para o chat ao clicar em Conversar
  function handleConversar(id) {
    navigate('/chat');
  }

  // redireciona para o perfil ao clicar em Ver perfil
  function handleVerPerfil(id) {
    navigate('/perfil');
  }

  // filtra e busca os itens conforme o filtro ativo e o texto de busca
  const { pessoasFiltradas, servicosFiltrados } = useMemo(() => {
    const termoBusca = busca.toLowerCase().trim();

    const pessoasVisiveis = (filtro === 'todos' || filtro === 'pessoas' || filtro === 'recentes' || filtro === 'matches')
      ? pessoas.filter((p) => {
          if (!termoBusca) return true;
          return (
            p.nome.toLowerCase().includes(termoBusca) ||
            p.profissao.toLowerCase().includes(termoBusca) ||
            p.tags.some((t) => t.toLowerCase().includes(termoBusca))
          );
        })
      : [];

    const servicosVisiveis = (filtro === 'todos' || filtro === 'servicos' || filtro === 'recentes')
      ? servicos.filter((s) => {
          if (!termoBusca) return true;
          return (
            s.titulo.toLowerCase().includes(termoBusca) ||
            s.descricao.toLowerCase().includes(termoBusca) ||
            s.tags.some((t) => t.toLowerCase().includes(termoBusca)) ||
            (s.prestador?.nome || '').toLowerCase().includes(termoBusca)
          );
        })
      : [];

    // ordena por mais recente se filtro for 'recentes'
    if (filtro === 'recentes') {
      pessoasVisiveis.sort((a, b) => b.adicionadoEm - a.adicionadoEm);
      servicosVisiveis.sort((a, b) => b.adicionadoEm - a.adicionadoEm);
    }

    return { pessoasFiltradas: pessoasVisiveis, servicosFiltrados: servicosVisiveis };
  }, [busca, filtro, pessoas, servicos]);

  const totalFavoritos = pessoas.length + servicos.length;
  const nenhumResultado = pessoasFiltradas.length === 0 && servicosFiltrados.length === 0;

  return (
    <div className="fav-pagina">
      <Navbar />

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
                <p className="fav-subtitulo">Pessoas e servicos que voce salvou para depois.</p>
              </div>
            </div>
            <button
              type="button"
              id="btn-organizar-favoritos"
              className="fav-btn-organizar"
              aria-label="Organizar favoritos"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Organizar
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
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

          {/* grid de pessoas */}
          {pessoasFiltradas.length > 0 && (
            <section className="fav-secao" aria-label="Pessoas favoritadas">
              <div className="fav-grid fav-grid--pessoas">
                {pessoasFiltradas.map((pessoa) => (
                  <FavoritosPessoaCard
                    key={pessoa.id}
                    pessoa={pessoa}
                    onConversar={handleConversar}
                    onRemover={handleRemoverPessoa}
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
                    onVerPerfil={handleVerPerfil}
                    onRemover={handleRemoverServico}
                  />
                ))}
              </div>
            </section>
          )}

          {/* estado vazio */}
          {nenhumResultado && (
            <FavoritosEmpty onExplorar={() => navigate('/perfil')} />
          )}

          {/* banner de estado vazio global (sem nenhum favorito salvo) */}
          {totalFavoritos === 0 && (
            <FavoritosEmpty onExplorar={() => navigate('/perfil')} />
          )}

        </div>
      </main>
    </div>
  );
}
