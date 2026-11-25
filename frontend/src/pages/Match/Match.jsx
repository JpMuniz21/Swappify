import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MatchCard from '../../components/MatchCard/MatchCard';
import MatchAcoes from '../../components/MatchAcoes/MatchAcoes';
import MatchOverlay from '../../components/MatchOverlay/MatchOverlay';
import Modal from '../../components/Modal/Modal';
import { logout } from '../../services/authService';
import { listarCatalogoServicos, listarFavoritos, favoritarServico } from '../../services/matchService';
import './Match.css';

// Acima desse número de cards, o contador vira texto ("3 de 40") em vez de bolinhas.
const MAX_BOLINHAS = 10;

// Converte um serviço do catálogo (ServicoResource) para o formato do MatchCard.
function paraPerfil(servico) {
  const local = servico.usuario?.localizacao;
  return {
    id: servico.id,
    servicoId: servico.id,
    nome: servico.usuario?.name ?? 'Usuário',
    profissao: servico.usuario?.profession || 'Membro Swappify',
    localizacao: local ? [local.cidade, local.estado].filter(Boolean).join(', ') : '',
    bio: servico.usuario?.bio || '',
    servico: { titulo: servico.titulo, descricao: servico.descricao },
    foto: servico.usuario?.avatar_url || null, // sem foto → o card mostra o boneco padrão
  };
}

export default function Match() {
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};

  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregar, setErroCarregar] = useState('');
  const [aviso, setAviso] = useState('');
  const [curtindo, setCurtindo] = useState(false);

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [historico, setHistorico] = useState([]); // [{ indice, tipo: 'like' | 'pass' }]
  const [animacao, setAnimacao] = useState(null); // 'like' | 'pass' | 'entrada'
  const [matchAtual, setMatchAtual] = useState(null); // perfil do match confirmado
  const [favoritoAdicionado, setFavoritoAdicionado] = useState(null); // perfil recém-curtido (aviso)

  // Mostra serviços de outras pessoas que ainda não foram favoritados.
  useEffect(() => {
    if (!usuario) return undefined;
    let ativo = true;
    Promise.all([listarCatalogoServicos(), listarFavoritos()])
      .then(([catalogo, favoritos]) => {
        if (!ativo) return;
        const jaFavoritados = new Set(favoritos.map((f) => f.servico_id));
        setPerfis(
          catalogo
            .filter((s) => s.usuario_id !== usuario.id && !jaFavoritados.has(s.id))
            .map(paraPerfil)
        );
      })
      .catch(() => { if (ativo) setErroCarregar('Não foi possível carregar os perfis. Tente novamente.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [usuario]);

  const perfilAtual = perfis[indiceAtual] ?? null;
  // Curtir já salva o favorito no servidor, então só dá para voltar depois de "passar".
  const podevoltar = historico.length > 0 && historico[historico.length - 1].tipo === 'pass';
  const semMaisPerfis = indiceAtual >= perfis.length;

  // avanca para o proximo perfil apos animacao
  const avancar = useCallback((tipoAnimacao) => {
    setAnimacao(tipoAnimacao);
    setTimeout(() => {
      setHistorico((h) => [...h, { indice: indiceAtual, tipo: tipoAnimacao }]);
      setIndiceAtual((i) => i + 1);
      setAnimacao('entrada');
      setTimeout(() => setAnimacao(null), 400);
    }, 380);
  }, [indiceAtual]);

  // curtir = favoritar o serviço; se for recíproco, a API cria o match.
  // origem 'match' (seta →) mostra o aviso de match; 'favorito' (coração) o aviso de favoritos.
  async function handleLike(origem = 'favorito') {
    if (!perfilAtual || curtindo) return;
    setCurtindo(true);
    setAviso('');
    try {
      const resposta = await favoritarServico(perfilAtual.servicoId);
      if (resposta?.meta?.match_criado) {
        setMatchAtual({ ...perfilAtual, matchId: resposta.meta.match_id });
      } else if (origem === 'match') {
        // ainda não é recíproco: avisa que o match foi enviado
        setMatchAtual({ ...perfilAtual, pendente: true });
      } else {
        // mostra o aviso; o próximo perfil aparece quando o modal é fechado
        setFavoritoAdicionado(perfilAtual);
      }
    } catch (erro) {
      if (erro.status === 401 || erro.status === 419) {
        navigate('/login', { replace: true });
        return;
      }
      const primeiroErro = Object.values(erro.errors ?? {})[0]?.[0];
      setAviso(primeiroErro ?? 'Não foi possível curtir agora. Tente novamente.');
    } finally {
      setCurtindo(false);
    }
  }

  // passou: avanca sem salvar nada
  function handlePass() {
    if (!perfilAtual) return;
    avancar('pass');
  }

  // volta para o perfil anterior (só após "passar")
  function handleVoltar() {
    if (!podevoltar) return;
    const ultimo = historico[historico.length - 1];
    setHistorico((h) => h.slice(0, -1));
    setAnimacao('entrada');
    setIndiceAtual(ultimo.indice);
    setTimeout(() => setAnimacao(null), 400);
  }

  // fecha o aviso de favorito e avanca para o proximo perfil
  const handleFecharFavorito = useCallback(() => {
    setFavoritoAdicionado(null);
    avancar('like');
  }, [avancar]);

  // fecha o overlay de match e avanca
  function handleFecharMatch() {
    setMatchAtual(null);
    avancar('like');
  }

  // vai para o chat ao confirmar match (o chat abre a conversa mais recente)
  function handleConversarMatch() {
    setMatchAtual(null);
    navigate('/chat');
  }

  async function sair() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  function renderEstado(titulo, texto, botao) {
    return (
      <div className="match-esgotado" role="status">
        <div className="match-esgotado-icone" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2 className="match-esgotado-titulo">{titulo}</h2>
        <p className="match-esgotado-texto">{texto}</p>
        {botao}
      </div>
    );
  }

  let conteudoCentral;
  if (carregando) {
    conteudoCentral = renderEstado('Carregando perfis…', 'Buscando serviços para você descobrir.');
  } else if (erroCarregar) {
    conteudoCentral = renderEstado('Algo deu errado', erroCarregar, (
      <button type="button" className="match-esgotado-btn" onClick={() => window.location.reload()}>
        Tentar novamente
      </button>
    ));
  } else if (semMaisPerfis) {
    conteudoCentral = renderEstado(
      perfis.length ? 'Você viu todos os perfis!' : 'Nenhum perfil novo por aqui',
      'Novos serviços aparecem conforme as pessoas se cadastram. Volte mais tarde ou veja seus favoritos.',
      (
        <button type="button" id="btn-match-explorar" className="match-esgotado-btn" onClick={() => navigate('/favoritos')}>
          Ver favoritos
        </button>
      )
    );
  } else {
    conteudoCentral = (
      <>
        {/* contador de perfis */}
        {perfis.length <= MAX_BOLINHAS ? (
          <div className="match-contador" aria-live="polite" aria-label={`Perfil ${indiceAtual + 1} de ${perfis.length}`}>
            {perfis.map((perfil, i) => (
              <span
                key={perfil.id}
                className={`match-contador-dot ${i === indiceAtual ? 'match-contador-dot--ativo' : i < indiceAtual ? 'match-contador-dot--visto' : ''}`}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : (
          <p className="match-contador-texto" aria-live="polite">
            {indiceAtual + 1} de {perfis.length}
          </p>
        )}

        {/* card do perfil */}
        <MatchCard perfil={perfilAtual} animacao={animacao} />

        {aviso && <p className="match-aviso" role="alert">{aviso}</p>}

        {/* acoes */}
        <MatchAcoes
          onVoltar={handleVoltar}
          onPass={handlePass}
          onLike={() => handleLike('favorito')}
          onConversar={() => navigate('/chat')}
          podevoltar={podevoltar}
        />
      </>
    );
  }

  const acoesBloqueadas = carregando || Boolean(erroCarregar) || semMaisPerfis || curtindo || Boolean(favoritoAdicionado);

  return (
    <div className="match-pagina">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />

      <main className="match-main" id="main-content">
        <div className="match-container">

          {/* seta de navegacao esquerda */}
          <button
            type="button"
            id="btn-match-nav-anterior"
            className="match-nav-btn match-nav-btn--esquerda"
            onClick={handlePass}
            disabled={acoesBloqueadas}
            aria-label="Passar perfil"
            title="Passar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* area central: card + acoes */}
          <div className="match-central">
            {conteudoCentral}
          </div>

          {/* seta de navegacao direita */}
          <button
            type="button"
            id="btn-match-nav-proximo"
            className="match-nav-btn match-nav-btn--direita match-nav-btn--match"
            onClick={() => handleLike('match')}
            disabled={acoesBloqueadas}
            aria-label="Dar match"
            title="Dar match"
          >
            <span className="match-nav-btn-texto">Match <span aria-hidden="true">👍</span></span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </main>

      {/* overlay de match confirmado */}
      {matchAtual && (
        <MatchOverlay
          perfil={matchAtual}
          pendente={Boolean(matchAtual.pendente)}
          onConversar={handleConversarMatch}
          onContinuar={handleFecharMatch}
        />
      )}

      {/* aviso: perfil adicionado aos favoritos (curtida sem match) */}
      <Modal
        isOpen={Boolean(favoritoAdicionado)}
        onClose={handleFecharFavorito}
        title="Adicionado aos favoritos"
      >
        <p className="match-favorito-texto">
          O serviço <strong>{favoritoAdicionado?.servico?.titulo}</strong> de{' '}
          <strong>{favoritoAdicionado?.nome}</strong> foi adicionado aos seus favoritos.
          Se essa pessoa também curtir um serviço seu, vocês dão match!
        </p>
        <div className="modal-footer">
          <button type="button" className="modal-btn-cancel" onClick={() => navigate('/favoritos')}>
            Ver favoritos
          </button>
          <button type="button" className="match-esgotado-btn" onClick={handleFecharFavorito} autoFocus>
            Continuar
          </button>
        </div>
      </Modal>
    </div>
  );
}
