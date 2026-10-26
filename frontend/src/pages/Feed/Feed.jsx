import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { logout } from '../../services/authService';
import avatar from '../../assets/lucas-avatar.jpg';
import fotoPet from '../../assets/portfolio-pet.png';
import logo from '../../assets/logo-swappify.svg';
import './Feed.css';

const INTERESSES = ['Design', 'Marketing', 'Tecnologia', 'Educação', 'Pet'];
const FILTROS = { servico: '', cidade: '', distancia: '', disponibilidade: '', interesses: [] };
const POSTS = [{ id: 'pet', nome: 'Eliza Martins', profissao: 'Cuidadora de pets', horario: 'Há 1h', texto: 'Precisa de alguém de confiança para cuidar do seu pet? 🐾 Sou apaixonada por animais e estou disponível para pet sitting e passeios. Tenho experiência e cuidado para que seu bichinho fique feliz enquanto você resolve seus compromissos.', tags: '#TrocaDeServiços #PetSitter #EconomiaColaborativa', imagem: fotoPet, servico: 'Pet', cidade: 'Fortaleza', distancia: 5, disponibilidade: 'Durante a semana' }];

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
  const arquivoRef = useRef(null);
  const [texto, setTexto] = useState('');
  const [midia, setMidia] = useState(null);
  const [posts, setPosts] = useState(POSTS);
  const [filtros, setFiltros] = useState(FILTROS);
  const [aplicados, setAplicados] = useState(FILTROS);
  const [mais, setMais] = useState(false);
  const [aviso, setAviso] = useState('');

  function escolherMidia(tipo) {
    arquivoRef.current.accept = `${tipo}/*`;
    arquivoRef.current.click();
  }
  function carregarMidia(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!/^(image|video)\//.test(arquivo.type) || arquivo.size > 20 * 1024 * 1024) {
      setAviso('Escolha uma foto ou vídeo de até 20 MB.');
      e.target.value = '';
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => { setMidia({ url: leitor.result, video: arquivo.type.startsWith('video') }); setAviso(''); };
    leitor.onerror = () => setAviso('Não foi possível abrir o arquivo. Tente novamente.');
    leitor.readAsDataURL(arquivo);
    e.target.value = '';
  }
  function publicar(e) {
    e.preventDefault();
    if (!texto.trim() && !midia) return;
    setPosts(atual => [{ id: crypto.randomUUID(), nome: 'Lucas Vasconcelo', profissao: 'Empreendedor', horario: 'Agora', texto: texto.trim(), avatar, imagem: midia && !midia.video ? midia.url : null, video: midia?.video ? midia.url : null }, ...atual]);
    setTexto(''); setMidia(null); setAviso('Publicação adicionada nesta sessão.');
  }
  async function sair() {
    try { await logout(); navigate('/login'); }
    catch { setAviso('Não foi possível sair. Tente novamente.'); }
  }
  const visiveis = posts.filter(post =>
    (!aplicados.servico || post.servico === aplicados.servico) &&
    (!aplicados.cidade || post.cidade === aplicados.cidade) &&
    (!aplicados.distancia || (post.distancia != null && post.distancia <= Number(aplicados.distancia))) &&
    (!aplicados.disponibilidade || post.disponibilidade === aplicados.disponibilidade) &&
    (!aplicados.interesses.length || aplicados.interesses.includes(post.servico))
  );
  return <div className="feed-page">
    <Navbar onLogout={sair} onEditProfile={() => navigate('/perfil')} />
    <div className="feed-layout">
      <aside className="feed-sidebar" aria-label="Navegação do feed">
        <Link to="/perfil" className="feed-profile"><img src={avatar} alt="" /><span><strong>Lucas Vasconcelo</strong><small>Ver meu perfil</small></span></Link>
        <nav className="feed-menu" aria-label="Menu principal">
          <Link to="/feed" aria-current="page"><Icone tipo="busca" />Descobrir</Link>
          <button onClick={() => setAviso('Matches estarão disponíveis em breve.')}><Icone tipo="coracao" />Matches</button>
          <Link to="/chat"><Icone tipo="mensagem" />Mensagens</Link>
          <button onClick={() => setAviso('Favoritos estarão disponíveis em breve.')}><Icone tipo="estrela" />Favoritos</button>
          <button onClick={() => setAviso('Minhas trocas estarão disponíveis em breve.')}><Icone tipo="troca" />Minhas Trocas</button>
          <button onClick={() => setAviso('Agendamentos estarão disponíveis em breve.')}><Icone tipo="agenda" />Agendamentos</button>
          <Link to="/perfil"><Icone tipo="ajustes" />Configurações</Link>
        </nav>
        <div className="feed-ad"><div className="feed-ad-art"><img src={logo} alt="" /><span>Seu talento vale<br /><strong>uma nova troca.</strong></span></div><strong>Anuncie com Swappify</strong></div>
      </aside>
      <main className="feed-main" aria-label="Publicações">
        <h1 className="feed-sr-only">Feed de serviços</h1>
        <form className="feed-composer" onSubmit={publicar}>
          <label className="feed-sr-only" htmlFor="feed-texto">Faça uma postagem</label>
          <textarea id="feed-texto" placeholder="Faça uma postagem" value={texto} onChange={e => setTexto(e.target.value)} rows={1} maxLength={3000} />
          {midia && <div className="feed-preview">{midia.video ? <video src={midia.url} controls /> : <img src={midia.url} alt="Prévia da foto selecionada" />}<button type="button" onClick={() => setMidia(null)}>Remover mídia</button></div>}
          <div className="feed-composer-actions"><button type="button" onClick={() => escolherMidia('image')}><Icone tipo="foto" />Foto</button><button type="button" onClick={() => escolherMidia('video')}><Icone tipo="video" />Vídeo</button>{(texto.trim() || midia) && <button className="feed-publish" type="submit">Publicar</button>}</div>
          <input ref={arquivoRef} type="file" hidden onChange={carregarMidia} />
        </form>
        {aviso && <p className="feed-notice" role="status">{aviso}<button onClick={() => setAviso('')} aria-label="Fechar aviso">×</button></p>}
        <div className="feed-posts">{visiveis.map(post => <article className="feed-post" key={post.id}>
          <header className="feed-post-header"><div className="feed-author-avatar">{post.avatar ? <img src={post.avatar} alt="" /> : <Icone tipo="pessoa" />}</div><div><strong>{post.nome}</strong><small>{post.profissao}</small></div><span className="feed-post-time">{post.horario}</span></header>
          <p className="feed-post-text">{post.texto}{post.tags && <><br /><span>{post.tags}</span></>}</p>
          {post.imagem && <img className="feed-post-image" src={post.imagem} alt={post.id === 'pet' ? 'Serviço de cuidados com pets' : 'Foto da publicação'} />}
          {post.video && <video className="feed-post-image" src={post.video} controls />}
        </article>)}{!visiveis.length && <p className="feed-empty">Nenhuma publicação encontrada. Experimente limpar os filtros.</p>}</div>
      </main>
      <aside className="feed-filters" aria-label="Filtros de publicações">
        <div className="feed-filter-heading"><h2>Filtrar</h2><button onClick={() => { setFiltros(FILTROS); setAplicados(FILTROS); }}>Limpar</button></div>
        <form onSubmit={e => { e.preventDefault(); setAplicados({ ...filtros, interesses: [...filtros.interesses] }); }}>
          {[
            ['servico', 'O que você precisa?', 'Qualquer serviço', INTERESSES],
            ['cidade', 'Localização', 'Todas as cidades', ['Fortaleza', 'São Paulo', 'Rio de Janeiro']],
            ['distancia', 'Distância', 'Qualquer distância', ['5', '15', '30', '50']],
            ['disponibilidade', 'Disponibilidade', 'Qualquer dia', ['Durante a semana', 'Fim de semana']],
          ].map(([campo, titulo, placeholder, opcoes]) => <label className="feed-filter-field" key={campo} htmlFor={`feed-${campo}`}>{titulo}<select id={`feed-${campo}`} value={filtros[campo]} onChange={e => setFiltros({ ...filtros, [campo]: e.target.value })}><option value="">{placeholder}</option>{opcoes.map(opcao => <option key={opcao} value={opcao}>{campo === 'distancia' ? `Até ${opcao} km` : opcao}</option>)}</select></label>)}
          <fieldset className="feed-interests"><legend>Interesses em comum</legend>{INTERESSES.slice(0, mais ? undefined : 4).map(interesse => <label key={interesse}><input type="checkbox" checked={filtros.interesses.includes(interesse)} onChange={e => setFiltros({ ...filtros, interesses: e.target.checked ? [...filtros.interesses, interesse] : filtros.interesses.filter(item => item !== interesse) })} />{interesse}</label>)}<button type="button" onClick={() => setMais(!mais)}>{mais ? 'Ver menos' : 'Ver mais'} ⌄</button></fieldset>
          <button type="submit" className="feed-apply">Aplicar filtros</button>
        </form>
      </aside>
    </div>
  </div>;
}
