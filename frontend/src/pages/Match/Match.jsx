import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MatchCard from '../../components/MatchCard/MatchCard';
import MatchAcoes from '../../components/MatchAcoes/MatchAcoes';
import MatchOverlay from '../../components/MatchOverlay/MatchOverlay';
import marcelaFoto from '../../assets/match_template.jpg';
import './Match.css';

// perfis mockados para demonstracao
const PERFIS_MOCK = [
  {
    id: 'm1',
    nome: 'Marcela Campos',
    profissao: 'Fotografa',
    localizacao: 'Fortaleza, CE',
    bio: 'Apaixonada por fotografia e por transformar momentos em lembrancas especiais. Trabalho com ensaios, eventos e criacao de conteudo, sempre com criatividade e atencao aos detalhes.',
    avaliacao: '4.8',
    totalAvaliacoes: 15,
    trocasRealizadas: 12,
    taxaConclusao: '91%',
    foto: marcelaFoto,
  },
  {
    id: 'm2',
    nome: 'Rafael Torres',
    profissao: 'Designer UI/UX',
    localizacao: 'Sao Paulo, SP',
    bio: 'Designer apaixonado por criar experiencias digitais intuitivas e bonitas. Atuo com prototipacao, pesquisa de usabilidade e design systems.',
    avaliacao: '4.9',
    totalAvaliacoes: 28,
    trocasRealizadas: 20,
    taxaConclusao: '95%',
    foto: null,
  },
  {
    id: 'm3',
    nome: 'Juliana Freitas',
    profissao: 'Redatora & Copywriter',
    localizacao: 'Recife, PE',
    bio: 'Especialista em comunicacao e storytelling para marcas. Crio textos que conectam e convertem, do blog ao e-mail marketing.',
    avaliacao: '4.7',
    totalAvaliacoes: 19,
    trocasRealizadas: 16,
    taxaConclusao: '88%',
    foto: null,
  },
  {
    id: 'm4',
    nome: 'Andre Moura',
    profissao: 'Desenvolvedor Mobile',
    localizacao: 'Belo Horizonte, MG',
    bio: 'Desenvolvedor React Native com 4 anos de experiencia. Ja lancei mais de 10 apps na App Store e Google Play.',
    avaliacao: '4.6',
    totalAvaliacoes: 11,
    trocasRealizadas: 8,
    taxaConclusao: '85%',
    foto: null,
  },
  {
    id: 'm5',
    nome: 'Fernanda Luz',
    profissao: 'Especialista em Marketing',
    localizacao: 'Curitiba, PR',
    bio: 'Ajudo empresas a crescerem no digital com estrategias de trafego pago, SEO e gestao de redes sociais baseadas em dados.',
    avaliacao: '5.0',
    totalAvaliacoes: 34,
    trocasRealizadas: 30,
    taxaConclusao: '97%',
    foto: null,
  },
];

// probabilidade de dar match ao curtir (para demonstracao)
const CHANCE_MATCH = 0.5;

export default function Match() {
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState(PERFIS_MOCK);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [historico, setHistorico] = useState([]); // para o botao de voltar
  const [animacao, setAnimacao] = useState(null); // 'like' | 'pass'
  const [matchAtual, setMatchAtual] = useState(null); // perfil do match confirmado

  const perfilAtual = perfis[indiceAtual] ?? null;
  const podevoltar = historico.length > 0;
  const semMaisPerfis = indiceAtual >= perfis.length;

  // avanca para o proximo perfil apos animacao
  const avancar = useCallback((tipoAnimacao, perfilAnterior) => {
    setAnimacao(tipoAnimacao);
    setTimeout(() => {
      setHistorico((h) => [...h, { indice: indiceAtual, perfil: perfilAnterior }]);
      setIndiceAtual((i) => i + 1);
      setAnimacao('entrada');
      setTimeout(() => setAnimacao(null), 400);
    }, 380);
  }, [indiceAtual]);

  // curtiu: 50% de chance de mostrar o overlay de match
  function handleLike() {
    if (!perfilAtual) return;
    const deuMatch = Math.random() < CHANCE_MATCH;
    if (deuMatch) {
      setMatchAtual(perfilAtual);
    } else {
      avancar('like', perfilAtual);
    }
  }

  // passou: avanca sem match
  function handlePass() {
    if (!perfilAtual) return;
    avancar('pass', perfilAtual);
  }

  // volta para o perfil anterior
  function handleVoltar() {
    if (!podevoltar) return;
    const ultimo = historico[historico.length - 1];
    setHistorico((h) => h.slice(0, -1));
    setAnimacao('entrada');
    setIndiceAtual(ultimo.indice);
    setTimeout(() => setAnimacao(null), 400);
  }

  // fecha o overlay de match e avanca
  function handleFecharMatch() {
    const perfilDoMatch = matchAtual;
    setMatchAtual(null);
    avancar('like', perfilDoMatch);
  }

  // vai para o chat ao confirmar match
  function handleConversarMatch() {
    setMatchAtual(null);
    navigate('/chat');
  }

  return (
    <div className="match-pagina">
      <Navbar />

      <main className="match-main" id="main-content">
        <div className="match-container">

          {/* seta de navegacao esquerda */}
          <button
            type="button"
            id="btn-match-nav-anterior"
            className="match-nav-btn match-nav-btn--esquerda"
            onClick={handlePass}
            disabled={semMaisPerfis}
            aria-label="Passar perfil"
            title="Passar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* area central: card + acoes */}
          <div className="match-central">
            {semMaisPerfis ? (
              /* estado: sem mais perfis */
              <div className="match-esgotado" role="status">
                <div className="match-esgotado-icone" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h2 className="match-esgotado-titulo">Voce viu todos os perfis!</h2>
                <p className="match-esgotado-texto">Novos perfis aparecerao em breve. Volte mais tarde ou explore os favoritos.</p>
                <button
                  type="button"
                  id="btn-match-explorar"
                  className="match-esgotado-btn"
                  onClick={() => navigate('/favoritos')}
                >
                  Ver favoritos
                </button>
              </div>
            ) : (
              <>
                {/* contador de perfis */}
                <div className="match-contador" aria-live="polite" aria-label={`Perfil ${indiceAtual + 1} de ${perfis.length}`}>
                  {Array.from({ length: perfis.length }).map((_, i) => (
                    <span
                      key={i}
                      className={`match-contador-dot ${i === indiceAtual ? 'match-contador-dot--ativo' : i < indiceAtual ? 'match-contador-dot--visto' : ''}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* card do perfil */}
                <MatchCard perfil={perfilAtual} animacao={animacao} />

                {/* acoes */}
                <MatchAcoes
                  onVoltar={handleVoltar}
                  onPass={handlePass}
                  onLike={handleLike}
                  onConversar={() => navigate('/chat')}
                  podevoltar={podevoltar}
                />
              </>
            )}
          </div>

          {/* seta de navegacao direita */}
          <button
            type="button"
            id="btn-match-nav-proximo"
            className="match-nav-btn match-nav-btn--direita"
            onClick={handleLike}
            disabled={semMaisPerfis}
            aria-label="Curtir perfil"
            title="Curtir"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </main>

      {/* overlay de match confirmado */}
      {matchAtual && (
        <MatchOverlay
          perfil={matchAtual}
          onConversar={handleConversarMatch}
          onContinuar={handleFecharMatch}
        />
      )}
    </div>
  );
}
