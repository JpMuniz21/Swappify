import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Modal from '../../components/Modal/Modal';
import ServiceSelectModal from '../../components/ServiceSelectModal/ServiceSelectModal';
import { consultarPerfil, atualizarPerfil, logout } from '../../services/authService';
import {
  listarCategorias, criarServico, excluirServico, adicionarProcurado, removerProcurado,
} from '../../services/servicoService';
import avatarPadrao from '../../assets/avatar-padrao.svg';
import fotoPortfolioPet from '../../assets/portfolio-pet.png';
import './Profile.css';

// dados iniciais do perfil
const DADOS_INICIAIS_FIGMA = {
  name: 'Usuário Exemplo',
  profession: 'Empreendedor',
  location: 'Santa Cantarina',
  bio: '', // texto inicial vazio
  rating: '0.0',
  totalRatings: 0,
  trocasRealizadas: 0,
  taxaConclusao: '0%',
  isNovo: true,
  avatar_url: avatarPadrao,
};

const DADOS_DISPONIBILIDADE_INICIAL = {
  dias: 'Segunda a Sexta',
  horarios: '09:00 hrs às 12:00hrs | 14:00hrs às 17:00 hrs',
  atendimentos: 'Presencial',
  distancia: 'Fortaleza e região',
  mensagem: 'Gosto de trabalhar com flexibilidade de horários. Vamos combinar?',
};

const TEXTO_SOBRE_MIM_PLACEHOLDER =
  'Conte um pouco sobre você, sua experiência e os serviços que oferece para ajudar outros usuários a conhecerem melhor seu perfil.';

// Item do catálogo do ServiceSelectModal → nome da categoria no banco (CategoriaSeeder).
const CATEGORIA_POR_CODIGO = {
  'design-grafico': 'Criatividade',
  'edicao-video': 'Criatividade',
  'marketing-conteudo': 'Criatividade',
  'educacao-aulas': 'Educação',
  'criacao-sites': 'Tecnologia',
  'personal-fitness': 'Saúde e bem-estar',
  'servicos-gerais': 'Serviços gerais',
  'produtos-saude-pets': 'Pets',
  personalizado: 'Outros',
};

// Serviço da API (ServicoResource) → formato dos cards do perfil.
// "codigo" guarda o item do catálogo (salvo em "tipo") para o modal marcá-lo como selecionado.
function servicoDaApi(servico) {
  return {
    id: servico.id,
    codigo: servico.tipo,
    titulo: servico.titulo,
    descricao: servico.descricao,
    iconeTipo: servico.tipo,
  };
}

// Item de "O que eu procuro" vindo da API → formato dos cards do perfil.
function procuradoDaApi(item) {
  return {
    id: item.id,
    codigo: item.codigo,
    titulo: item.titulo,
    descricao: item.descricao || '',
    iconeTipo: item.codigo,
  };
}

// Limites iguais aos da API (AccountController@update).
const LIMITE_BIO = 240;
const LIMITE_PROFISSAO = 100;
const LIMITE_LOCAL = 50;

// O texto de exemplo só é exibido na tela; nunca é enviado como bio.
function bioParaApi(texto) {
  const limpo = (texto ?? '').trim();
  return limpo && limpo !== TEXTO_SOBRE_MIM_PLACEHOLDER ? limpo : null;
}

// "Fortaleza, CE" a partir do objeto localizacao da API.
function formatarLocal(localizacao) {
  if (!localizacao) return '';
  return [localizacao.cidade, localizacao.estado].filter(Boolean).join(', ');
}

// Primeira mensagem de erro de validação do Laravel, ou a mensagem geral.
function mensagemDeErro(erro, padrao) {
  return Object.values(erro?.errors ?? {})[0]?.[0] ?? erro?.message ?? padrao;
}

// icone do card de servico no perfil
function IconeCardServico({ tipo }) {

  switch (tipo) {
    case 'video':
    case 'edicao-video':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="5" width="13" height="14" rx="2" />
          <polygon points="17 8 22 5 22 19 17 16 17 8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'sites':
    case 'criacao-sites':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'design':
    case 'design-grafico':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m14 12 5.5-5.5a2.12 2.12 0 1 0-3-3L11 9" />
          <path d="M12 14 6.5 19.5a2.12 2.12 0 1 1-3-3L9 11" />
          <path d="m3 3 18 18" />
        </svg>
      );
    case 'aulas':
    case 'educacao-aulas':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    default:
      // icone padrao de saude e bem-estar
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(DADOS_INICIAIS_FIGMA);

  // servicos selecionados
  const [servicosOferecidos, setServicosOferecidos] = useState([]);
  const [servicosProcurados, setServicosProcurados] = useState([]);
  const [categorias, setCategorias] = useState({}); // { 'Tecnologia': 2, ... }
  const [salvandoServico, setSalvandoServico] = useState(false);
  const [erroServicos, setErroServicos] = useState('');
  const [salvandoProcurado, setSalvandoProcurado] = useState(false);
  const [erroProcurados, setErroProcurados] = useState('');

  // controle dos modais
  const [modalOferecoAberto, setModalOferecoAberto] = useState(false);
  const [modalProcuroAberto, setModalProcuroAberto] = useState(false);
  const [modalEditarPerfilAberto, setModalEditarPerfilAberto] = useState(false);
  const [modalVerTudoTipo, setModalVerTudoTipo] = useState(null); // 'ofereço' ou 'procuro'

  // texto e edicao da bio
  const [bio, setBio] = useState(TEXTO_SOBRE_MIM_PLACEHOLDER);
  const [editandoBio, setEditandoBio] = useState(false);
  const [bioInput, setBioInput] = useState(TEXTO_SOBRE_MIM_PLACEHOLDER);

  // portfolio
  const [portfolio, setPortfolio] = useState([]);
  const [modalPortfolioAberto, setModalPortfolioAberto] = useState(false);

  // avaliacoes
  const [modalAvaliacoesAberto, setModalAvaliacoesAberto] = useState(false);

  // disponibilidade e modo de edicao
  const [disponibilidadePreenchida, setDisponibilidadePreenchida] = useState(false);
  const [modoEdicaoDisponibilidade, setModoEdicaoDisponibilidade] = useState(false);
  const [disponibilidade, setDisponibilidade] = useState(DADOS_DISPONIBILIDADE_INICIAL);
  const [formDisponibilidade, setFormDisponibilidade] = useState(DADOS_DISPONIBILIDADE_INICIAL);
  const [modalEditarDisponibilidade, setModalEditarDisponibilidade] = useState(false);

  const [formPerfil, setFormPerfil] = useState({
    name: DADOS_INICIAIS_FIGMA.name,
    profession: DADOS_INICIAIS_FIGMA.profession,
    cidade: '',
    estado: '',
    bairro: '',
    bio: '',
  });

  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [erroBio, setErroBio] = useState('');


  useEffect(() => {
    let ativo = true;

    consultarPerfil()
      .then((resposta) => {
        if (!ativo) return;
        const dadosApi = resposta?.data;
        if (dadosApi) {
          const bioApi = dadosApi.bio || TEXTO_SOBRE_MIM_PLACEHOLDER;
          setUsuario((antigo) => ({
            ...antigo,
            ...dadosApi,
            name: dadosApi.name || antigo.name,
            profession: dadosApi.profession || antigo.profession,
            bio: bioApi,
            location: formatarLocal(dadosApi.localizacao),
            avatar_url: dadosApi.avatar_url || antigo.avatar_url,
          }));

          setBio(bioApi);
          setBioInput(dadosApi.bio || '');

          setFormPerfil({
            name: dadosApi.name || DADOS_INICIAIS_FIGMA.name,
            profession: dadosApi.profession || '',
            cidade: dadosApi.localizacao?.cidade || '',
            estado: dadosApi.localizacao?.estado || '',
            bairro: dadosApi.localizacao?.bairro || '',
            bio: dadosApi.bio || '',
          });

          // servicos cadastrados do usuario
          if (Array.isArray(dadosApi.servicos)) {
            setServicosOferecidos(dadosApi.servicos.map(servicoDaApi));
          }
          if (Array.isArray(dadosApi.servicos_procurados)) {
            setServicosProcurados(dadosApi.servicos_procurados.map(procuradoDaApi));
          }
        }
      })
      .catch(() => {
        // fallback offline
      });

    return () => {
      ativo = false;
    };
  }, []);

  // categorias para cadastrar os serviços oferecidos com o categoria_id certo
  useEffect(() => {
    let ativo = true;
    listarCategorias()
      .then((lista) => {
        if (ativo) setCategorias(Object.fromEntries(lista.map((c) => [c.nome, c.id])));
      })
      .catch(() => { /* o erro aparece ao tentar salvar um serviço */ });
    return () => { ativo = false; };
  }, []);

  // logout do usuario
  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignora falhas de rede no logout
    } finally {
      navigate('/login', { replace: true });
    }
  }

  // alteracao do texto sobre mim
  function handleCliqueAlterarBio() {
    // Começa vazio quando ainda não há bio (o texto de exemplo fica só como placeholder).
    setBioInput(bio === TEXTO_SOBRE_MIM_PLACEHOLDER ? '' : bio);
    setErroBio('');
    setEditandoBio(true);
  }

  function handleCancelarEdicaoBio() {
    setErroBio('');
    setEditandoBio(false);
  }

  // Aplica na tela os dados que a API confirmou.
  function aplicarPerfilSalvo(dados) {
    const bioSalva = dados.bio || TEXTO_SOBRE_MIM_PLACEHOLDER;
    setUsuario((prev) => ({
      ...prev,
      name: dados.name,
      profession: dados.profession || '',
      location: formatarLocal(dados.localizacao),
      bio: bioSalva,
    }));
    setBio(bioSalva);
    setBioInput(dados.bio || '');
    setFormPerfil({
      name: dados.name,
      profession: dados.profession || '',
      cidade: dados.localizacao?.cidade || '',
      estado: dados.localizacao?.estado || '',
      bairro: dados.localizacao?.bairro || '',
      bio: dados.bio || '',
    });
  }

  async function handleSalvarBio() {
    setErroBio('');
    try {
      const resposta = await atualizarPerfil({ bio: bioParaApi(bioInput) });
      aplicarPerfilSalvo(resposta.data);
      setEditandoBio(false);
    } catch (erro) {
      setErroBio(mensagemDeErro(erro, 'Não foi possível salvar. Tente novamente.'));
    }
  }

  function abrirEdicaoPerfil() {
    setErroPerfil('');
    setModalEditarPerfilAberto(true);
  }

  // edicao do perfil geral
  async function handleSalvarPerfil(e) {
    e.preventDefault();
    setErroPerfil('');

    const { cidade, estado, bairro } = formPerfil;
    const camposLocal = [cidade, estado, bairro].map((v) => v.trim());
    const algumLocal = camposLocal.some(Boolean);
    if (algumLocal && !camposLocal.every(Boolean)) {
      setErroPerfil('Para salvar a localização, preencha cidade, estado e bairro (ou deixe os três em branco).');
      return;
    }

    setSalvandoPerfil(true);
    try {
      const resposta = await atualizarPerfil({
        name: formPerfil.name.trim(),
        profession: formPerfil.profession.trim() || null,
        bio: bioParaApi(formPerfil.bio),
        localizacao: algumLocal
          ? { cidade: camposLocal[0], estado: camposLocal[1], bairro: camposLocal[2] }
          : null,
      });
      aplicarPerfilSalvo(resposta.data);
      setModalEditarPerfilAberto(false);
    } catch (erro) {
      setErroPerfil(mensagemDeErro(erro, 'Não foi possível salvar o perfil. Tente novamente.'));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // fotos do portfolio
  function handleAdicionarFotoPortfolio() {
    setPortfolio((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 1,
          titulo: 'Atendimento Veterinário e Cuidado Pet',
          imagem: fotoPortfolioPet,
        },
      ];
    });
  }

  function handleRemoverFotoPortfolio(id) {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  }

  // controle de disponibilidade
  function handleAbrirEdicaoDisponibilidade() {
    setFormDisponibilidade({ ...disponibilidade });
    setModoEdicaoDisponibilidade(true);
  }

  function handleCancelarEdicaoDisponibilidade() {
    setFormDisponibilidade({ ...disponibilidade });
    setModoEdicaoDisponibilidade(false);
  }

  function handleSalvarDisponibilidade(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setDisponibilidade({ ...formDisponibilidade });
    setDisponibilidadePreenchida(true);
    setModoEdicaoDisponibilidade(false);
    setModalEditarDisponibilidade(false);
  }

  // Serviços oferecidos são salvos na API (POST/DELETE /servicos): é com eles que
  // as outras pessoas dão "curtir" na tela de Match.
  async function salvarServicoOferecido(servico) {
    if (salvandoServico) return;
    if (servicosOferecidos.length >= 5) {
      setErroServicos('Você pode oferecer no máximo 5 serviços.');
      return;
    }
    const codigo = servico.acaoEspecial ? 'personalizado' : (servico.codigo ?? servico.id);
    const categoriaId = categorias[CATEGORIA_POR_CODIGO[codigo] ?? 'Outros'] ?? categorias.Outros;
    if (!categoriaId) {
      setErroServicos('Não foi possível carregar as categorias. Recarregue a página e tente de novo.');
      return;
    }

    setSalvandoServico(true);
    setErroServicos('');
    try {
      const criado = await criarServico({
        titulo: servico.titulo.trim().slice(0, 50),
        descricao: (servico.descricao || servico.titulo).trim().slice(0, 150),
        tipo: String(codigo).startsWith('custom-') ? 'personalizado' : codigo,
        categoria_id: categoriaId,
      });
      setServicosOferecidos((prev) => [...prev, servicoDaApi(criado)]);
    } catch (erro) {
      setErroServicos(mensagemDeErro(erro, 'Não foi possível salvar o serviço.'));
    } finally {
      setSalvandoServico(false);
    }
  }

  async function removerServicoOferecido(existente) {
    if (salvandoServico) return;
    const ok = window.confirm(
      `Remover "${existente.titulo}" dos serviços que você oferece? `
      + 'Favoritos, matches e conversas ligados a este serviço também serão apagados.'
    );
    if (!ok) return;

    setSalvandoServico(true);
    setErroServicos('');
    try {
      await excluirServico(existente.id);
      setServicosOferecidos((prev) => prev.filter((s) => s.id !== existente.id));
    } catch (erro) {
      setErroServicos(mensagemDeErro(erro, 'Não foi possível remover o serviço.'));
    } finally {
      setSalvandoServico(false);
    }
  }

  // selecao de servicos oferecidos (vem do catálogo do modal ou de um card já salvo)
  function handleToggleOferecido(servico) {
    const existente = servicosOferecidos.find(
      (s) => s.id === servico.id || (s.codigo && s.codigo === servico.id)
    );
    if (existente) {
      removerServicoOferecido(existente);
    } else {
      salvarServicoOferecido(servico);
    }
  }

  // selecao de servicos procurados
  // "O que eu procuro" é salvo na API (/me/procurados), igual ao "O que ofereço".
  async function salvarProcurado(servico) {
    if (salvandoProcurado) return;
    if (servicosProcurados.length >= 5) {
      setErroProcurados('Você pode procurar no máximo 5 serviços.');
      return;
    }
    const codigoBruto = servico.codigo ?? servico.id;
    const codigo = String(codigoBruto).startsWith('custom-') ? 'personalizado' : codigoBruto;

    setSalvandoProcurado(true);
    setErroProcurados('');
    try {
      const criado = await adicionarProcurado({
        titulo: servico.titulo.trim().slice(0, 50),
        descricao: (servico.descricao || '').trim().slice(0, 150) || null,
        codigo,
      });
      setServicosProcurados((prev) => [...prev, procuradoDaApi(criado)]);
    } catch (erro) {
      setErroProcurados(mensagemDeErro(erro, 'Não foi possível salvar.'));
    } finally {
      setSalvandoProcurado(false);
    }
  }

  async function excluirProcurado(existente) {
    if (salvandoProcurado) return;
    setSalvandoProcurado(true);
    setErroProcurados('');
    try {
      await removerProcurado(existente.id);
      setServicosProcurados((prev) => prev.filter((s) => s.id !== existente.id));
    } catch (erro) {
      setErroProcurados(mensagemDeErro(erro, 'Não foi possível remover.'));
    } finally {
      setSalvandoProcurado(false);
    }
  }

  // vem do catálogo do modal (id = código do catálogo) ou de um card já salvo (id do banco)
  function handleToggleProcurado(servico) {
    const existente = servicosProcurados.find(
      (s) => s.id === servico.id || (s.codigo && s.codigo !== 'personalizado' && s.codigo === servico.id)
    );
    if (existente) {
      excluirProcurado(existente);
    } else {
      salvarProcurado(servico);
    }
  }

  function handleAdicionarPersonalizadoOferecido(novoServico) {
    salvarServicoOferecido({ ...novoServico, codigo: 'personalizado' });
  }

  function handleAdicionarPersonalizadoProcurado(novoServico) {
    salvarProcurado({ ...novoServico, codigo: 'personalizado' });
  }

  return (
    <div className="perfil-pagina">
      {/* barra de navegacao superior */}
      <Navbar
        usuario={usuario}
        onLogout={handleLogout}
        onEditProfile={() => abrirEdicaoPerfil}
      />

      {/* conteudo principal */}
      <main className="perfil-main">
        <section className="perfil-card-container" aria-label="Perfil do Usuário">
          {/* cabecalho do perfil */}
          <div className="perfil-topo">
            {/* coluna do usuario */}
            <div className="perfil-usuario-col">
              <div className="perfil-avatar-wrapper">
                {usuario.isNovo && <span className="perfil-badge-novo">Novo</span>}
                <img
                  src={usuario.avatar_url || avatarPadrao}
                  alt={`Foto de ${usuario.name}`}
                  className="perfil-avatar-foto"
                />
              </div>

              <h1 className="perfil-nome-usuario">{usuario.name}</h1>
              <p className="perfil-subtitulo">
                {[usuario.profession, usuario.location].filter(Boolean).join(' | ')}
              </p>

              {/* estrelas de avaliacao */}
              <div className="perfil-avaliacao-estrelas" aria-label={`Avaliação: ${usuario.rating} estrelas`}>
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <svg
                    key={estrela}
                    className="perfil-estrela-icone"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
                <span className="perfil-nota-texto">{usuario.rating}</span>
              </div>

              <button
                type="button"
                className="perfil-btn-editar-perfil"
                onClick={() => abrirEdicaoPerfil}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar perfil
              </button>
            </div>

            {/* metricas e sobre mim */}
            <div className="perfil-detalhes-col">
              {/* metricas gerais */}
              <div className="perfil-metricas-card">
                <div className="perfil-metrica-item">
                  <div className="perfil-metrica-valor-wrapper">
                    <span className="perfil-metrica-estrela-amarela" aria-hidden="true">★</span>
                    <span className="perfil-metrica-valor">{usuario.rating}</span>
                  </div>
                  <span className="perfil-metrica-rotulo">
                    ({usuario.totalRatings} avaliações)
                  </span>
                </div>

                <div className="perfil-metrica-item">
                  <span className="perfil-metrica-valor">{usuario.trocasRealizadas}</span>
                  <span className="perfil-metrica-rotulo">Trocas realizadas</span>
                </div>

                <div className="perfil-metrica-item">
                  <span className="perfil-metrica-valor">{usuario.taxaConclusao}</span>
                  <span className="perfil-metrica-rotulo">Taxa de conclusão</span>
                </div>
              </div>

              {/* sobre mim */}
              <div className="perfil-sobre-card">
                <div className="perfil-sobre-card-header">
                  <h2 className="perfil-sobre-titulo">Sobre mim</h2>
                  {!editandoBio && (
                    <button
                      type="button"
                      className="perfil-sobre-alterar-btn"
                      onClick={handleCliqueAlterarBio}
                      title="Alterar texto Sobre mim"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Alterar
                    </button>
                  )}
                </div>

                {editandoBio ? (
                  <div className="perfil-sobre-edicao-wrapper">
                    <textarea
                      className="perfil-sobre-textarea"
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder={TEXTO_SOBRE_MIM_PLACEHOLDER}
                      rows={4}
                      maxLength={LIMITE_BIO}
                      autoFocus
                    />
                    <p className="perfil-contador-caracteres">{bioInput.length}/{LIMITE_BIO}</p>
                    {erroBio && <p className="perfil-erro" role="alert">{erroBio}</p>}
                    <div className="perfil-sobre-acoes-edicao">
                      <button
                        type="button"
                        className="perfil-sobre-btn-cancelar"
                        onClick={handleCancelarEdicaoBio}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="perfil-sobre-btn-salvar"
                        onClick={handleSalvarBio}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`perfil-sobre-texto ${bio === TEXTO_SOBRE_MIM_PLACEHOLDER ? 'placeholder' : ''}`}
                    onClick={handleCliqueAlterarBio}
                    style={{ cursor: 'pointer' }}
                    title="Clique para alterar"
                  >
                    {bio}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* secao o que ofereco */}
          <section className="perfil-oferecimento-secao" aria-label="O que ofereço">
            <div className="perfil-oferecimento-header">
              <h2
                className="perfil-oferecimento-titulo"
                style={{ cursor: 'pointer' }}
                onClick={() => setModalOferecoAberto(true)}
              >
                O que ofereço
              </h2>
              <button
                type="button"
                className="perfil-oferecimento-ver-tudo"
                onClick={() => setModalVerTudoTipo('ofereço')}
              >
                Ver tudo
              </button>
            </div>

            {erroServicos && <p className="perfil-erro" role="alert">{erroServicos}</p>}
            {salvandoServico && <p className="perfil-contador-caracteres" role="status">Salvando…</p>}

            {servicosOferecidos.length === 0 ? (
              /* estado vazio */
              <div
                className="perfil-secao-vazia"
                onClick={() => setModalOferecoAberto(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setModalOferecoAberto(true)}
                title="Clique para selecionar o que você oferece"
              >
                <div className="perfil-vazia-btn-plus" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <p className="perfil-vazia-texto">
                  Adicione aqui os serviços, habilidades ou conhecimentos que você pode oferecer em troca para outros usuários.
                </p>
              </div>
            ) : (
              /* grade de servicos selecionados */
              <div className="perfil-servicos-grade">
                {servicosOferecidos.map((servico) => (
                  <div
                    key={servico.id}
                    className="servico-card"
                    onClick={() => setModalOferecoAberto(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setModalOferecoAberto(true)}
                    title={`${servico.titulo} - Clique para alterar`}
                  >
                    <div className="servico-card-icone-wrapper">
                      <IconeCardServico tipo={servico.iconeTipo || servico.id} />
                    </div>
                    <p className="servico-card-texto">{servico.titulo}</p>
                  </div>
                ))}

                <button
                  type="button"
                  className="servico-card-adicionar"
                  onClick={() => setModalOferecoAberto(true)}
                  aria-label="Adicionar mais serviços oferecidos"
                  title="Adicionar serviço"
                >
                  <div className="servico-adicionar-circulo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
              </div>
            )}
          </section>

          {/* secao o que procuro */}
          <section className="perfil-oferecimento-secao perfil-secao-divisor" aria-label="O que procuro">
            <div className="perfil-oferecimento-header">
              <h2
                className="perfil-oferecimento-titulo"
                style={{ cursor: 'pointer' }}
                onClick={() => setModalProcuroAberto(true)}
              >
                O que procuro
              </h2>
              <button
                type="button"
                className="perfil-oferecimento-ver-tudo"
                onClick={() => setModalVerTudoTipo('procuro')}
              >
                Ver tudo
              </button>
            </div>

            {erroProcurados && <p className="perfil-erro" role="alert">{erroProcurados}</p>}
            {salvandoProcurado && <p className="perfil-contador-caracteres" role="status">Salvando…</p>}

            {servicosProcurados.length === 0 ? (
              /* estado vazio */
              <div
                className="perfil-secao-vazia"
                onClick={() => setModalProcuroAberto(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setModalProcuroAberto(true)}
                title="Clique para selecionar o que você procura"
              >
                <div className="perfil-vazia-btn-plus" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <p className="perfil-vazia-texto">
                  Adicione aqui os serviços, habilidades ou conhecimentos que você procura ou tem interesse em receber em troca.
                </p>
              </div>
            ) : (
              /* grade de servicos selecionados */
              <div className="perfil-servicos-grade">
                {servicosProcurados.map((servico) => (
                  <div
                    key={servico.id}
                    className="servico-card"
                    onClick={() => setModalProcuroAberto(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setModalProcuroAberto(true)}
                    title={`${servico.titulo} - Clique para alterar`}
                  >
                    <div className="servico-card-icone-wrapper">
                      <IconeCardServico tipo={servico.iconeTipo || servico.id} />
                    </div>
                    <p className="servico-card-texto">{servico.titulo}</p>
                  </div>
                ))}

                <button
                  type="button"
                  className="servico-card-adicionar"
                  onClick={() => setModalProcuroAberto(true)}
                  aria-label="Adicionar mais serviços procurados"
                  title="Adicionar serviço"
                >
                  <div className="servico-adicionar-circulo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
              </div>
            )}
          </section>

          {/* secao portfolio */}
          <section className="perfil-portfolio-secao" aria-label="Portfólio">
            <div className="perfil-portfolio-header">
              <h2 className="perfil-portfolio-titulo">Portfólio</h2>
              <button
                type="button"
                className="perfil-portfolio-ver-tudo"
                onClick={() => setModalPortfolioAberto(true)}
              >
                Ver tudo
              </button>
            </div>

            {portfolio.length === 0 ? (
              /* estado vazio */
              <div className="perfil-portfolio-conteudo">
                <button
                  type="button"
                  className="perfil-portfolio-card-vazio"
                  onClick={handleAdicionarFotoPortfolio}
                  title="Clique para adicionar foto ao portfólio"
                  aria-label="Adicionar foto ao portfólio"
                >
                  <div className="perfil-portfolio-circulo-plus">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
                <p className="perfil-portfolio-texto-ajuda">
                  Adicione aqui fotos, projetos ou trabalhos realizados para mostrar sua experiência e transmitir mais confiança no seu perfil.
                </p>
              </div>
            ) : (
              /* fotos do portfolio */
              <div className="perfil-portfolio-grade">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="portfolio-foto-card"
                    onClick={() => setModalPortfolioAberto(true)}
                    title={item.titulo}
                  >
                    <img src={item.imagem} alt={item.titulo} className="portfolio-foto-img" />
                    <div className="portfolio-foto-overlay">
                      <span>{item.titulo}</span>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="perfil-portfolio-card-vazio"
                  onClick={handleAdicionarFotoPortfolio}
                  title="Adicionar mais fotos ao portfólio"
                  aria-label="Adicionar mais fotos ao portfólio"
                >
                  <div className="perfil-portfolio-circulo-plus">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
              </div>
            )}
          </section>

          {/* secao avaliacoes */}
          <section className="perfil-avaliacoes-secao" aria-label="Avaliações">
            <div className="perfil-avaliacoes-header">
              <h2 className="perfil-avaliacoes-titulo">Avaliações</h2>
              <button
                type="button"
                className="perfil-portfolio-ver-tudo"
                onClick={() => setModalAvaliacoesAberto(true)}
              >
                Ver tudo
              </button>
            </div>

            <div className="perfil-avaliacoes-card">
              <p className="perfil-avaliacoes-vazio-texto">
                Nenhuma avaliação no momento
              </p>
            </div>
          </section>

          {/* secao disponibilidade */}
          <section className="perfil-disponibilidade-secao" aria-label="Disponibilidade">
            <h2 className="perfil-disponibilidade-titulo-central">Disponibilidade</h2>

            {!disponibilidadePreenchida && !modoEdicaoDisponibilidade ? (
              /* estado vazio inicial */
              <>
                <div
                  className="perfil-disponibilidade-card-vazio"
                  onClick={handleAbrirEdicaoDisponibilidade}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleAbrirEdicaoDisponibilidade()}
                  title="Clique para inserir sua disponibilidade"
                >
                  <p className="perfil-disponibilidade-vazio-texto">
                    Informe aqui seus dias, horários disponíveis e se o atendimento será online, presencial ou ambos.
                  </p>
                </div>
                <button
                  type="button"
                  className="perfil-disponibilidade-btn-salvar"
                  onClick={handleAbrirEdicaoDisponibilidade}
                >
                  Salvar
                </button>
              </>
            ) : modoEdicaoDisponibilidade ? (
              /* formulario de insercao de disponibilidade */
              <>
                <div className="perfil-disponibilidade-card-preenchido perfil-disponibilidade-card-editando">
                  <div className="disponibilidade-card-edit-header">
                    <span className="disponibilidade-edit-badge">Inserir disponibilidade</span>
                    {disponibilidadePreenchida && (
                      <button
                        type="button"
                        className="disponibilidade-btn-cancelar-topo"
                        onClick={handleCancelarEdicaoDisponibilidade}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {/* dias disponiveis */}
                  <div className="disponibilidade-linha-item">
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="3" />
                        <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3" />
                        <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="3" />
                        <line x1="8" y1="18" x2="8.01" y2="18" strokeWidth="3" />
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos disponibilidade-campo-editavel">
                      <label htmlFor="disp-dias-input" className="disponibilidade-item-titulo">Dias disponíveis</label>
                      <input
                        id="disp-dias-input"
                        type="text"
                        className="disponibilidade-item-input"
                        value={formDisponibilidade.dias}
                        onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, dias: e.target.value })}
                        placeholder="Ex: Segunda a Sexta"
                        required
                      />
                    </div>
                  </div>

                  {/* horarios */}
                  <div className="disponibilidade-linha-item">
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="13" r="8" />
                        <polyline points="12 9 12 13 15 15" />
                        <line x1="5" y1="3" x2="2" y2="6" />
                        <line x1="19" y1="3" x2="22" y2="6" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos disponibilidade-campo-editavel">
                      <label htmlFor="disp-horarios-input" className="disponibilidade-item-titulo">Horários</label>
                      <input
                        id="disp-horarios-input"
                        type="text"
                        className="disponibilidade-item-input"
                        value={formDisponibilidade.horarios}
                        onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, horarios: e.target.value })}
                        placeholder="Ex: 09:00 hrs às 12:00hrs | 14:00hrs às 17:00 hrs"
                        required
                      />
                    </div>
                  </div>

                  {/* atendimentos */}
                  <div className="disponibilidade-linha-item">
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="12" rx="2" />
                        <line x1="2" y1="20" x2="22" y2="20" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos disponibilidade-campo-editavel">
                      <label htmlFor="disp-atendimentos-select" className="disponibilidade-item-titulo">Atendimentos</label>
                      <select
                        id="disp-atendimentos-select"
                        className="disponibilidade-item-select"
                        value={formDisponibilidade.atendimentos}
                        onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, atendimentos: e.target.value })}
                      >
                        <option value="Presencial">Presencial</option>
                        <option value="Online">Online</option>
                        <option value="Online e Presencial">Online e Presencial</option>
                      </select>
                    </div>
                  </div>

                  {/* distancia maxima */}
                  <div className="disponibilidade-linha-item" style={{ borderBottom: 'none' }}>
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos disponibilidade-campo-editavel">
                      <label htmlFor="disp-distancia-input" className="disponibilidade-item-titulo">Distância Máxima</label>
                      <input
                        id="disp-distancia-input"
                        type="text"
                        className="disponibilidade-item-input"
                        value={formDisponibilidade.distancia}
                        onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, distancia: e.target.value })}
                        placeholder="Ex: Fortaleza e região"
                      />
                    </div>
                  </div>

                  {/* mensagem de flexibilidade */}
                  <div className="disponibilidade-bloco-destaque disponibilidade-bloco-destaque-editavel">
                    <label htmlFor="disp-mensagem-textarea" className="disponibilidade-destaque-rotulo">
                      Mensagem sobre flexibilidade
                    </label>
                    <textarea
                      id="disp-mensagem-textarea"
                      className="disponibilidade-textarea-destaque"
                      value={formDisponibilidade.mensagem}
                      onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, mensagem: e.target.value })}
                      placeholder="Gosto de trabalhar com flexibilidade de horários. Vamos combinar?"
                      rows={2}
                    />
                  </div>
                </div>

                {/* acoes de salvar e cancelar */}
                <div className="disponibilidade-acoes-botoes">
                  {disponibilidadePreenchida && (
                    <button
                      type="button"
                      className="perfil-disponibilidade-btn-cancelar"
                      onClick={handleCancelarEdicaoDisponibilidade}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    className="perfil-disponibilidade-btn-salvar"
                    onClick={handleSalvarDisponibilidade}
                  >
                    Salvar
                  </button>
                </div>
              </>
            ) : (
              /* estado preenchido salvo */
              <>
                <div className="perfil-disponibilidade-card-preenchido">
                  <div className="disponibilidade-card-topo-acoes">
                    <button
                      type="button"
                      className="perfil-disponibilidade-alterar-btn"
                      onClick={handleAbrirEdicaoDisponibilidade}
                      title="Alterar disponibilidade"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Alterar
                    </button>
                  </div>

                  {/* dias disponiveis */}
                  <div className="disponibilidade-linha-item">
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="3" />
                        <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3" />
                        <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="3" />
                        <line x1="8" y1="18" x2="8.01" y2="18" strokeWidth="3" />
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos">
                      <h3 className="disponibilidade-item-titulo">Dias disponíveis</h3>
                      <p className="disponibilidade-item-subtitulo">{disponibilidade.dias}</p>
                    </div>
                  </div>

                  {/* horarios */}
                  <div className="disponibilidade-linha-item">
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="13" r="8" />
                        <polyline points="12 9 12 13 15 15" />
                        <line x1="5" y1="3" x2="2" y2="6" />
                        <line x1="19" y1="3" x2="22" y2="6" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos">
                      <h3 className="disponibilidade-item-titulo">Horários</h3>
                      <p className="disponibilidade-item-subtitulo">{disponibilidade.horarios}</p>
                    </div>
                  </div>

                  {/* atendimentos */}
                  <div className="disponibilidade-linha-item">
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="12" rx="2" />
                        <line x1="2" y1="20" x2="22" y2="20" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos">
                      <h3 className="disponibilidade-item-titulo">Atendimentos</h3>
                      <p className="disponibilidade-item-subtitulo">{disponibilidade.atendimentos}</p>
                    </div>
                  </div>

                  {/* distancia maxima */}
                  <div className="disponibilidade-linha-item" style={{ borderBottom: 'none' }}>
                    <div className="disponibilidade-icone-wrapper">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="disponibilidade-textos">
                      <h3 className="disponibilidade-item-titulo">Distância Máxima</h3>
                      <p className="disponibilidade-item-subtitulo">{disponibilidade.distancia}</p>
                    </div>
                  </div>

                  {/* mensagem de flexibilidade */}
                  <div className="disponibilidade-bloco-destaque">
                    <p>{disponibilidade.mensagem}</p>
                  </div>
                </div>

                {/* botao de salvar disponibilidade */}
                <button
                  type="button"
                  className="perfil-disponibilidade-btn-salvar"
                  onClick={handleAbrirEdicaoDisponibilidade}
                >
                  Salvar
                </button>
              </>
            )}
          </section>
        </section>
      </main>

      {/* modal de servicos oferecidos */}
      <ServiceSelectModal
        isOpen={modalOferecoAberto}
        onClose={() => setModalOferecoAberto(false)}
        tipo="ofereço"
        servicosSelecionados={servicosOferecidos}
        onToggleServico={handleToggleOferecido}
        onAdicionarPersonalizado={handleAdicionarPersonalizadoOferecido}
      />

      {/* modal de servicos procurados */}
      <ServiceSelectModal
        isOpen={modalProcuroAberto}
        onClose={() => setModalProcuroAberto(false)}
        tipo="procuro"
        servicosSelecionados={servicosProcurados}
        onToggleServico={handleToggleProcurado}
        onAdicionarPersonalizado={handleAdicionarPersonalizadoProcurado}
      />

      {/* modal de edicao do perfil */}
      <Modal
        isOpen={modalEditarPerfilAberto}
        onClose={() => setModalEditarPerfilAberto(false)}
        title="Editar Meu Perfil"
      >
        <form onSubmit={handleSalvarPerfil} className="modal-body">
          <div className="modal-form-grupo">
            <label htmlFor="perfil-nome" className="modal-label">
              Nome completo
            </label>
            <input
              id="perfil-nome"
              type="text"
              required
              maxLength={255}
              className="modal-input"
              value={formPerfil.name}
              onChange={(e) => setFormPerfil({ ...formPerfil, name: e.target.value })}
            />
          </div>

          <div className="modal-form-grupo">
            <label htmlFor="perfil-profissao" className="modal-label">
              Profissão / Atuação
            </label>
            <input
              id="perfil-profissao"
              type="text"
              className="modal-input"
              placeholder="Ex: Empreendedor, Fotógrafo, Designer..."
              maxLength={LIMITE_PROFISSAO}
              value={formPerfil.profession}
              onChange={(e) => setFormPerfil({ ...formPerfil, profession: e.target.value })}
            />
          </div>

          <fieldset className="modal-form-grupo perfil-local-grupo">
            <legend className="modal-label">Localização (preencha os três ou deixe em branco)</legend>
            <div className="perfil-local-campos">
              {[
                ['cidade', 'Cidade', 'Ex: Fortaleza'],
                ['estado', 'Estado', 'Ex: CE'],
                ['bairro', 'Bairro', 'Ex: Aldeota'],
              ].map(([campo, rotulo, exemplo]) => (
                <label key={campo} className="perfil-local-campo" htmlFor={`perfil-${campo}`}>
                  <span>{rotulo}</span>
                  <input
                    id={`perfil-${campo}`}
                    type="text"
                    className="modal-input"
                    placeholder={exemplo}
                    maxLength={LIMITE_LOCAL}
                    value={formPerfil[campo]}
                    onChange={(e) => setFormPerfil({ ...formPerfil, [campo]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="modal-form-grupo">
            <label htmlFor="perfil-bio" className="modal-label">
              Sobre mim
            </label>
            <textarea
              id="perfil-bio"
              className="modal-textarea"
              placeholder={TEXTO_SOBRE_MIM_PLACEHOLDER}
              maxLength={LIMITE_BIO}
              value={formPerfil.bio}
              onChange={(e) => setFormPerfil({ ...formPerfil, bio: e.target.value })}
            />
            <p className="perfil-contador-caracteres">{formPerfil.bio.length}/{LIMITE_BIO}</p>
          </div>

          {erroPerfil && <p className="perfil-erro" role="alert">{erroPerfil}</p>}

          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={() => setModalEditarPerfilAberto(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-btn-submit"
              disabled={salvandoPerfil}
            >
              {salvandoPerfil ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>

      {/* modal para ver todos os servicos */}
      <Modal
        isOpen={Boolean(modalVerTudoTipo)}
        onClose={() => setModalVerTudoTipo(null)}
        title={modalVerTudoTipo === 'ofereço' ? 'Serviços que Ofereço' : 'Serviços que Procuro'}
      >
        <div className="modal-body">
          {(() => {
            const lista = modalVerTudoTipo === 'ofereço' ? servicosOferecidos : servicosProcurados;
            const toggleFn = modalVerTudoTipo === 'ofereço' ? handleToggleOferecido : handleToggleProcurado;
            const openModalFn = modalVerTudoTipo === 'ofereço' ? () => setModalOferecoAberto(true) : () => setModalProcuroAberto(true);

            if (lista.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                  <p style={{ color: '#686173', marginBottom: '16px' }}>
                    Nenhum serviço selecionado ainda.
                  </p>
                  <button
                    type="button"
                    className="modal-btn-submit"
                    onClick={() => {
                      setModalVerTudoTipo(null);
                      openModalFn();
                    }}
                  >
                    + Selecionar Serviços
                  </button>
                </div>
              );
            }

            return (
              <>
                {lista.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      padding: '14px 18px',
                      backgroundColor: '#f7f4fb',
                      borderRadius: '14px',
                      border: '1px solid #e7dff1',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#2c2336' }}>
                        {s.titulo}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleFn(s)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a52d21',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Remover
                      </button>
                    </div>
                    {s.descricao && <p className="servico-detalhes-descricao">{s.descricao}</p>}
                  </div>
                ))}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-btn-submit"
                    onClick={() => {
                      setModalVerTudoTipo(null);
                      openModalFn();
                    }}
                  >
                    Gerenciar no Catálogo
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>

      {/* modal do portfolio */}
      <Modal
        isOpen={modalPortfolioAberto}
        onClose={() => setModalPortfolioAberto(false)}
        title="Meu Portfólio"
      >
        <div className="modal-body">
          {portfolio.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <p style={{ color: '#686173', marginBottom: '16px' }}>
                Nenhum projeto ou trabalho adicionado ainda ao seu portfólio.
              </p>
              <button
                type="button"
                className="modal-btn-submit"
                onClick={() => {
                  handleAdicionarFotoPortfolio();
                  setModalPortfolioAberto(false);
                }}
              >
                + Adicionar Foto do Projeto
              </button>
            </div>
          ) : (
            <>
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#f7f4fb',
                    borderRadius: '16px',
                    border: '1px solid #e7dff1',
                  }}
                >
                  <img
                    src={item.imagem}
                    alt={item.titulo}
                    style={{
                      width: '100%',
                      maxHeight: '340px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#2c2336' }}>{item.titulo}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoverFotoPortfolio(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a52d21',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Modal>

      {/* modal de avaliacoes */}
      <Modal
        isOpen={modalAvaliacoesAberto}
        onClose={() => setModalAvaliacoesAberto(false)}
        title="Avaliações dos Usuários"
      >
        <div className="modal-body" style={{ textAlign: 'center', padding: '30px 16px' }}>
          <div style={{ fontSize: '2.5rem', color: '#dedae5', marginBottom: '12px' }}>★</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#2c2336' }}>
            Nenhuma avaliação no momento
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#726c7c' }}>
            Quando você realizar trocas de serviços com outros usuários, os feedbacks e notas aparecerão aqui.
          </p>
        </div>
      </Modal>

      {/* modal de edicao da disponibilidade */}
      <Modal
        isOpen={modalEditarDisponibilidade}
        onClose={() => setModalEditarDisponibilidade(false)}
        title="Editar Disponibilidade"
      >
        <form onSubmit={handleSalvarDisponibilidade} className="modal-body">
          <div className="modal-form-grupo">
            <label htmlFor="disp-dias" className="modal-label">
              Dias disponíveis
            </label>
            <input
              id="disp-dias"
              type="text"
              required
              className="modal-input"
              value={formDisponibilidade.dias}
              onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, dias: e.target.value })}
            />
          </div>

          <div className="modal-form-grupo">
            <label htmlFor="disp-horarios" className="modal-label">
              Horários
            </label>
            <input
              id="disp-horarios"
              type="text"
              required
              className="modal-input"
              value={formDisponibilidade.horarios}
              onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, horarios: e.target.value })}
            />
          </div>

          <div className="modal-form-grupo">
            <label htmlFor="disp-atendimentos" className="modal-label">
              Atendimentos
            </label>
            <select
              id="disp-atendimentos"
              className="modal-select"
              value={formDisponibilidade.atendimentos}
              onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, atendimentos: e.target.value })}
            >
              <option value="Presencial">Presencial</option>
              <option value="Online">Online</option>
              <option value="Online e Presencial">Online e Presencial</option>
            </select>
          </div>

          <div className="modal-form-grupo">
            <label htmlFor="disp-distancia" className="modal-label">
              Distância Máxima
            </label>
            <input
              id="disp-distancia"
              type="text"
              className="modal-input"
              value={formDisponibilidade.distancia}
              onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, distancia: e.target.value })}
            />
          </div>

          <div className="modal-form-grupo">
            <label htmlFor="disp-mensagem" className="modal-label">
              Mensagem sobre flexibilidade
            </label>
            <textarea
              id="disp-mensagem"
              className="modal-textarea"
              value={formDisponibilidade.mensagem}
              onChange={(e) => setFormDisponibilidade({ ...formDisponibilidade, mensagem: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={() => setModalEditarDisponibilidade(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="modal-btn-submit">
              Salvar Disponibilidade
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}