import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { logout } from '../../services/authService';
import { listarPostagens, criarPostagem } from '../../services/postagemService';
import avatarPadrao from '../../assets/avatar-padrao.svg';
import logo from '../../assets/logo-swappify.svg';
import './Feed.css';

const INTERESSES = ['Design', 'Marketing', 'Tecnologia', 'Educação', 'Pet'];
const FILTROS = { servico: '', cidade: '', distancia: '', disponibilidade: '', interesses: [] };

function tempoRelativo(data) {
  if (!data) return '';
  const minutos = Math.floor((Date.now() - new Date(data).getTime()) / 60000);
  if (minutos < 1) return 'Agora';
  if (minutos < 60) return `Há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `Há ${dias}d`;
  return new Date(data).toLocaleDateString('pt-BR');
}

// Converte a postagem da API (PostagemResource) para o formato usado pelo card.
// A categoria escolhida no composer é salva em "titulo".
function paraPost(api) {
  return {
    id: api.id,
    nome: api.usuario?.name ?? 'Usuário',
    profissao: api.usuario?.profession ?? '',
    horario: tempoRelativo(api.data_publicacao),
    texto: api.conteudo,
    imagem: api.url_anexo || null,
    servico: INTERESSES.includes(api.titulo) ? api.titulo : '',
  };
}

function Icone({ tipo }) {
  const desenhos = {
    busca: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>,
    coracao: <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 5 2 10 8 15 6-5 12-10 8-15Z" />,
    mensagem: <path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z" />,
    estrela: <path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" />,
    troca: <><path d="M4 7h16l-4-4M20 17H4l4 4" /><path d="M20 7v4M4 17v-4" /></>,
    agenda: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 11h18" /></>,
    ajustes: <><circle cx="12" cy="12" r="3" /><path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z" /></>,
    foto: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
    video: <><rect x="2" y="5" width="14" height="14" rx="2" /><path d="m16 9 6-4v14l-6-4" /></>,
    pessoa: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{desenhos[tipo]}</svg>;
}

export default function Feed() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};
  const nomeUsuario = usuario?.name ?? 'Meu perfil';
  const avatarUsuario = usuario?.avatar_url || avatarPadrao;

  const [texto, setTexto] = useState('');
  const [servicoSelecionado, setServicoSelecionado] = useState('');

  const [posts, setPosts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [publicando, setPublicando] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS);
  const [aplicados, setAplicados] = useState(FILTROS);
  const [mais, setMais] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    let ativo = true;
    listarPostagens()
      .then((lista) => { if (ativo) setPosts(lista.map(paraPost)); })
      .catch(() => { if (ativo) setAviso('Não foi possível carregar as publicações.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function escolherMidia() {
    setAviso('O envio de fotos e vídeos estará disponível em breve.');
  }

  async function publicar(e) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo || publicando) return;

    setPublicando(true);
    try {
      const criada = await criarPostagem({
        titulo: servicoSelecionado || 'Publicação',
        conteudo,
      });
      setPosts(atual => [paraPost(criada), ...atual]);
      setTexto('');
      setServicoSelecionado('');
      setAviso('Publicação adicionada com sucesso!');
    } catch (erro) {
      if (erro.status === 401 || erro.status === 419) {
        navigate('/login', { replace: true });
        return;
      }
      const primeiroErro = Object.values(erro.errors ?? {})[0]?.[0];
      setAviso(primeiroErro ?? erro.message ?? 'Não foi possível publicar. Tente novamente.');
    } finally {
      setPublicando(false);
    }
  }

  async function sair() {
    try {
      await logout();
      navigate('/login');
    } catch {
      setAviso('Não foi possível sair. Tente novamente.');
    }
  }

  const visiveis = posts.filter(post =>
    (!aplicados.servico || post.servico === aplicados.servico) &&
    (!aplicados.cidade || post.cidade === aplicados.cidade) &&
    (!aplicados.distancia || (post.distancia != null && post.distancia <= Number(aplicados.distancia))) &&
    (!aplicados.disponibilidade || post.disponibilidade === aplicados.disponibilidade) &&
    (!aplicados.interesses.length || aplicados.interesses.includes(post.servico))
  );

  return (
    <div className="feed-page">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />
      <div className="feed-layout">

        <aside className="feed-sidebar" aria-label="Navegação do feed">
          <Link to="/perfil" className="feed-profile">
            <img src={avatarUsuario} alt="" />
            <span><strong>{nomeUsuario}</strong><small>Ver meu perfil</small></span>
          </Link>
          <nav className="feed-menu" aria-label="Menu principal">
            <Link to="/feed" aria-current="page"><Icone tipo="busca" />Descobrir</Link>
            <Link to="/match"><Icone tipo="coracao" />Matches</Link>
            <Link to="/chat"><Icone tipo="mensagem" />Mensagens</Link>
            <Link to="/favoritos"><Icone tipo="estrela" />Favoritos</Link>
            <Link to="/minhas-trocas"><Icone tipo="troca" />Minhas Trocas</Link>
            <Link to="/agendamentos"><Icone tipo="agenda" />Agendamentos</Link>
            <Link to="/configuracoes"><Icone tipo="ajustes" />Configurações</Link>
          </nav>
          <div className="feed-ad">
            <div className="feed-ad-art">
              <img src={logo} alt="" />
              <span>Seu talento vale<br /><strong>uma nova troca.</strong></span>
            </div>
            <strong>Anuncie com Swappify</strong>
          </div>
        </aside>

        <main className="feed-main" aria-label="Publicações">
          <h1 className="feed-sr-only">Feed de serviços</h1>

          <form className="feed-composer" onSubmit={publicar}>
            <label className="feed-sr-only" htmlFor="feed-texto">Faça uma postagem</label>
            <textarea 
              id="feed-texto" 
              placeholder="No que você está pensando ou qual serviço precisa/oferece?" 
              value={texto} 
              onChange={e => setTexto(e.target.value)} 
              rows={3} 
              maxLength={3000} 
            />

            <div className="feed-composer-actions">
              <div className="feed-composer-buttons">
                <button type="button" onClick={escolherMidia}><Icone tipo="foto" />Foto</button>
                <button type="button" onClick={escolherMidia}><Icone tipo="video" />Vídeo</button>
                
                <select 
                  className="feed-category-select"
                  value={servicoSelecionado} 
                  onChange={e => setServicoSelecionado(e.target.value)}
                >
                  <option value="">Categoria da troca...</option>
                  {INTERESSES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {texto.trim() && (
                <button className="feed-publish" type="submit" disabled={publicando}>
                  {publicando ? 'Publicando…' : 'Publicar'}
                </button>
              )}
            </div>
          </form>

          {aviso && (
            <p className="feed-notice" role="status">
              {aviso}
              <button onClick={() => setAviso('')} aria-label="Fechar aviso">×</button>
            </p>
          )}

          <div className="feed-posts">
            {visiveis.map(post => (
              <article className="feed-post" key={post.id}>
                <header className="feed-post-header">
                  <div className="feed-author-avatar">
                    {post.avatar ? <img src={post.avatar} alt="" /> : <Icone tipo="pessoa" />}
                  </div>
                  <div>
                    <strong>{post.nome}</strong>
                    <small>{post.profissao} {post.servico ? `• ${post.servico}` : ''}</small>
                  </div>
                  <span className="feed-post-time">{post.horario}</span>
                </header>
                <p className="feed-post-text">
                  {post.texto}
                  {post.tags && <><br /><span className="feed-post-tags">{post.tags}</span></>}
                </p>
                {post.imagem && <img className="feed-post-image" src={post.imagem} alt="Mídia da publicação" />}
                {post.video && <video className="feed-post-image" src={post.video} controls />}
              </article>
            ))}

            {carregando && <p className="feed-empty" role="status">Carregando publicações…</p>}

            {!carregando && !visiveis.length && (
              <p className="feed-empty">
                {posts.length
                  ? 'Nenhuma publicação encontrada. Experimente limpar os filtros.'
                  : 'Ainda não há publicações. Que tal fazer a primeira?'}
              </p>
            )}
          </div>
        </main>

        <aside className="feed-filters" aria-label="Filtros de publicações">
          <div className="feed-filter-heading">
            <h2>Filtrar</h2>
            <button onClick={() => { setFiltros(FILTROS); setAplicados(FILTROS); }}>Limpar</button>
          </div>
          <form onSubmit={e => { e.preventDefault(); setAplicados({ ...filtros, interesses: [...filtros.interesses] }); }}>
            {[
              ['servico', 'O que você precisa?', 'Qualquer serviço', INTERESSES],
              ['cidade', 'Localização', 'Todas as cidades', ['Fortaleza', 'São Paulo', 'Rio de Janeiro']],
              ['distancia', 'Distância', 'Qualquer distância', ['5', '15', '30', '50']],
              ['disponibilidade', 'Disponibilidade', 'Qualquer dia', ['Durante a semana', 'Fim de semana']],
            ].map(([campo, titulo, placeholder, opcoes]) => (
              <label className="feed-filter-field" key={campo} htmlFor={`feed-${campo}`}>
                {titulo}
                <select id={`feed-${campo}`} value={filtros[campo]} onChange={e => setFiltros({ ...filtros, [campo]: e.target.value })}>
                  <option value="">{placeholder}</option>
                  {opcoes.map(opcao => <option key={opcao} value={opcao}>{campo === 'distancia' ? `Até ${opcao} km` : opcao}</option>)}
                </select>
              </label>
            ))}
            <fieldset className="feed-interests">
              <legend>Interesses em comum</legend>
              {INTERESSES.slice(0, mais ? undefined : 4).map(interesse => (
                <label key={interesse}>
                  <input type="checkbox" checked={filtros.interesses.includes(interesse)} onChange={e => setFiltros({ ...filtros, interesses: e.target.checked ? [...filtros.interesses, interesse] : filtros.interesses.filter(item => item !== interesse) })} />
                  {interesse}
                </label>
              ))}
              <button type="button" onClick={() => setMais(!mais)}>{mais ? 'Ver menos' : 'Ver mais'} ⌄</button>
            </fieldset>
            <button type="submit" className="feed-apply">Aplicar filtros</button>
          </form>
        </aside>

      </div>
    </div>
  );
}