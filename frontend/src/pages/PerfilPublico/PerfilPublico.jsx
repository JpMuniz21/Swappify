import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Modal from '../../components/Modal/Modal';
import { logout } from '../../services/authService';
import { buscarPerfilPublico } from '../../services/perfilService';
import avatarPadrao from '../../assets/avatar-padrao.svg';
import '../Profile/Profile.css';
import './PerfilPublico.css';

function formatarLocal(localizacao) {
  if (!localizacao) return '';
  return [localizacao.cidade, localizacao.estado].filter(Boolean).join(', ');
}

// "2026-11-25" → "novembro de 2026"
function formatarMembroDesde(data) {
  if (!data) return '';
  const [ano, mes] = data.split('-').map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// TODO: quando o PR do portfólio (feat/portfolio-paginacao) estiver na dev, trocar por
// <IconeServico tipo={servico.tipo ?? servico.codigo} /> do ServiceSelectModal.
function IconeServicoGenerico() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

// Lista de serviços (oferecidos ou procurados), só leitura.
function ListaServicos({ titulo, servicos, vazio, comDivisor = false }) {
  return (
    <section className={`perfil-oferecimento-secao${comDivisor ? ' perfil-secao-divisor' : ''}`} aria-label={titulo}>
      <div className="perfil-oferecimento-header">
        <h2 className="perfil-oferecimento-titulo">{titulo}</h2>
      </div>
      {servicos.length === 0 ? (
        <p className="perfil-publico-vazio">{vazio}</p>
      ) : (
        <div className="perfil-servicos-grade">
          {servicos.map((servico) => (
            <div key={servico.id} className="servico-card perfil-publico-servico" title={servico.descricao || servico.titulo}>
              <div className="servico-card-icone-wrapper">
                <IconeServicoGenerico />
              </div>
              <p className="servico-card-texto">{servico.titulo}</p>
              {servico.categoria && <span className="perfil-publico-categoria">{servico.categoria}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Perfil de outra pessoa: mesmo visual do /perfil, sem nada editável.
export default function PerfilPublico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useOutletContext() ?? {};
  const [perfil, setPerfil] = useState(null);
  const [estado, setEstado] = useState('carregando'); // carregando | ok | nao-encontrado | erro
  const [fotoAberta, setFotoAberta] = useState(null);

  const ehMeuPerfil = Boolean(usuario) && String(usuario.id) === String(id);

  useEffect(() => {
    if (ehMeuPerfil) return undefined;
    let ativo = true;
    buscarPerfilPublico(id)
      .then((dados) => {
        if (!ativo) return;
        setPerfil(dados);
        setEstado('ok');
      })
      .catch((erro) => {
        if (!ativo) return;
        if (erro.status === 401 || erro.status === 419) {
          navigate('/login', { replace: true });
          return;
        }
        setEstado(erro.status === 404 ? 'nao-encontrado' : 'erro');
      });
    return () => { ativo = false; };
  }, [id, ehMeuPerfil, navigate]);

  // o próprio perfil tem a página editável
  if (ehMeuPerfil) return <Navigate to="/perfil" replace />;

  async function sair() {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  const disponibilidade = perfil?.disponibilidade;
  const subtitulo = [perfil?.profession, formatarLocal(perfil?.localizacao)].filter(Boolean).join(' | ');

  return (
    <div className="perfil-pagina">
      <Navbar usuario={usuario} onLogout={sair} onEditProfile={() => navigate('/perfil')} />

      <main className="perfil-main">
        <section className="perfil-card-container" aria-label={perfil ? `Perfil de ${perfil.name}` : 'Perfil'}>
          <button type="button" className="perfil-publico-voltar" onClick={() => navigate(-1)}>
            ← Voltar
          </button>

          {estado === 'carregando' && <p className="perfil-publico-status" role="status">Carregando perfil…</p>}
          {estado === 'nao-encontrado' && (
            <p className="perfil-publico-status" role="alert">Este perfil não existe ou foi excluído.</p>
          )}
          {estado === 'erro' && (
            <p className="perfil-publico-status" role="alert">Não foi possível carregar o perfil. Tente novamente.</p>
          )}

          {estado === 'ok' && perfil && (
            <>
              {/* cabecalho */}
              <div className="perfil-topo">
                <div className="perfil-usuario-col">
                  <div className="perfil-avatar-wrapper">
                    <img
                      src={perfil.avatar_url || avatarPadrao}
                      alt={`Foto de ${perfil.name}`}
                      className="perfil-avatar-foto"
                    />
                  </div>
                  <h1 className="perfil-nome-usuario">{perfil.name}</h1>
                  {subtitulo && <p className="perfil-subtitulo">{subtitulo}</p>}
                  {perfil.membro_desde && (
                    <p className="perfil-publico-membro">Membro desde {formatarMembroDesde(perfil.membro_desde)}</p>
                  )}
                </div>

                <div className="perfil-detalhes-col">
                  <div className="perfil-sobre-card">
                    <div className="perfil-sobre-card-header">
                      <h2 className="perfil-sobre-titulo">Sobre</h2>
                    </div>
                    <p className={`perfil-sobre-texto${perfil.bio ? '' : ' placeholder'}`}>
                      {perfil.bio || `${perfil.name} ainda não escreveu sobre si.`}
                    </p>
                  </div>
                </div>
              </div>

              <ListaServicos
                titulo="O que oferece"
                servicos={perfil.servicos}
                vazio="Nenhum serviço oferecido ainda."
              />
              <ListaServicos
                titulo="O que procura"
                servicos={perfil.servicos_procurados}
                vazio="Nenhum serviço procurado ainda."
                comDivisor
              />

              {/* portfolio */}
              <section className="perfil-portfolio-secao" aria-label="Portfólio">
                <div className="perfil-portfolio-header">
                  <h2 className="perfil-portfolio-titulo">Portfólio</h2>
                </div>
                {perfil.portfolio.length === 0 ? (
                  <p className="perfil-publico-vazio">Nenhum trabalho no portfólio ainda.</p>
                ) : (
                  <div className="perfil-portfolio-grade">
                    {perfil.portfolio.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="portfolio-foto-card perfil-publico-foto"
                        onClick={() => setFotoAberta(item)}
                        title={item.titulo}
                        aria-label={`Ampliar ${item.titulo}`}
                      >
                        <img src={item.imagem_url} alt={item.titulo} className="portfolio-foto-img" />
                        <div className="portfolio-foto-overlay">
                          <span>{item.titulo}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* disponibilidade */}
              <section className="perfil-disponibilidade-secao" aria-label="Disponibilidade">
                <h2 className="perfil-disponibilidade-titulo-central">Disponibilidade</h2>
                {!disponibilidade ? (
                  <p className="perfil-publico-vazio">Disponibilidade ainda não informada.</p>
                ) : (
                  <div className="perfil-disponibilidade-card-preenchido">
                    {[
                      ['Dias disponíveis', disponibilidade.dias],
                      ['Horários', disponibilidade.horarios],
                      ['Atendimentos', disponibilidade.atendimentos],
                      ['Distância Máxima', disponibilidade.distancia],
                    ].filter(([, valor]) => valor).map(([rotulo, valor]) => (
                      <div key={rotulo} className="disponibilidade-linha-item">
                        <div className="disponibilidade-textos">
                          <h3 className="disponibilidade-item-titulo">{rotulo}</h3>
                          <p className="disponibilidade-item-subtitulo">{valor}</p>
                        </div>
                      </div>
                    ))}
                    {disponibilidade.mensagem && (
                      <div className="disponibilidade-bloco-destaque">
                        <p>{disponibilidade.mensagem}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </main>

      {/* foto do portfolio ampliada */}
      <Modal isOpen={Boolean(fotoAberta)} onClose={() => setFotoAberta(null)} title={fotoAberta?.titulo ?? ''}>
        {fotoAberta && (
          <img src={fotoAberta.imagem_url} alt={fotoAberta.titulo} className="perfil-publico-foto-ampliada" />
        )}
      </Modal>
    </div>
  );
}
