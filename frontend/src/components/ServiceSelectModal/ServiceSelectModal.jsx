import { useState, useEffect } from 'react';
import './ServiceSelectModal.css';

// catalogo base de servicos
const CATALOGO_SERVICOS = [
  {
    id: 'design-grafico',
    titulo: 'Design Gráfico',
    descricao: 'Criação de logos, posts e identidade visual para redes sociais.',
    iconeTipo: 'design',
  },
  {
    id: 'edicao-video',
    titulo: 'Edição de Vídeo',
    descricao: 'Edição de vídeos com cortes, legendas e efeitos para redes e internet.',
    iconeTipo: 'video',
  },
  {
    id: 'educacao-aulas',
    titulo: 'Educação & Aulas',
    descricao: 'Aulas de idiomas, reforço escolar e aprendizado do básico ao avançado.',
    iconeTipo: 'aulas',
  },
  {
    id: 'criacao-sites',
    titulo: 'Criação de Sites',
    descricao: 'Criação de sites, landing pages e aplicações web.',
    iconeTipo: 'sites',
  },
  {
    id: 'marketing-conteudo',
    titulo: 'Marketing & Conteúdo',
    descricao: 'Gestão de redes sociais e criação de conteúdo para internet.',
    iconeTipo: 'marketing',
  },
  {
    id: 'personal-fitness',
    titulo: 'Personal Fitness',
    descricao: 'Treinos personalizados e acompanhamento para saúde e bem-estar.',
    iconeTipo: 'fitness',
  },
  {
    id: 'servicos-gerais',
    titulo: 'Serviços Gerais',
    descricao: 'Manutenção, montagem de móveis, pequenos reparos e limpeza de locais.',
    iconeTipo: 'gerais',
  },
  {
    id: 'produtos-saude-pets',
    titulo: 'Produtos de saúde Pets',
    descricao: 'Cuidados com pets, passeios, adestramento e apoio diário.',
    iconeTipo: 'pets',
  },
  {
    id: 'explorar-servicos',
    titulo: 'Explorar serviços',
    descricao: 'Veja mais categorias disponíveis.',
    iconeTipo: 'explorar',
    acaoEspecial: 'explorar',
  },
  {
    id: 'criar-personalizado',
    titulo: 'Criar serviço personalizado',
    descricao: 'Crie um serviço que não está listado e personalize seu perfil.',
    iconeTipo: 'personalizado',
    acaoEspecial: 'personalizado',
  },
];

function IconeServico({ tipo }) {
  switch (tipo) {
    case 'design':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m14 12 5.5-5.5a2.12 2.12 0 1 0-3-3L11 9" />
          <path d="M12 14 6.5 19.5a2.12 2.12 0 1 1-3-3L9 11" />
          <path d="m3 3 18 18" />
        </svg>
      );
    case 'video':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="5" width="13" height="14" rx="2" />
          <polygon points="17 8 22 5 22 19 17 16 17 8" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'aulas':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case 'sites':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'marketing':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case 'fitness':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 4v16M18 4v16M2 8v8M22 8v8M6 12h12" />
        </svg>
      );
    case 'gerais':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'pets':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
    case 'explorar':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'personalizado':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          <line x1="12" y1="8" x2="16" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ServiceSelectModal({
  isOpen,
  onClose,
  tipo = 'ofereço', // tipo de servico: ofereco ou procuro
  servicosSelecionados = [],
  onToggleServico,
  onAdicionarPersonalizado,
}) {
  const [termoBusca, setTermoBusca] = useState('');
  const [criandoPersonalizado, setCriandoPersonalizado] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');

  // bloqueia o scroll da pagina e fecha com tecla esc
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOfereco = tipo === 'ofereço';
  const tituloSecao = isOfereco ? 'O que eu ofereço' : 'O que eu procuro';
  const subtituloSecao = isOfereco
    ? 'Selecione suas habilidades e serviços.'
    : 'Selecione o que você precisa ou quer aprender.';
  const placeholderBusca = isOfereco
    ? 'Pesquise um serviço que combine com você'
    : 'Pesquise um serviço que você precisa.';

  const cardsFiltrados = CATALOGO_SERVICOS.filter((servico) => {
    if (!termoBusca.trim()) return true;
    const termo = termoBusca.toLowerCase();
    return (
      servico.titulo.toLowerCase().includes(termo) ||
      servico.descricao.toLowerCase().includes(termo)
    );
  });

  function isSelecionado(servicoId) {
    return servicosSelecionados.some(
      (s) => (s.id === servicoId || s.codigo === servicoId || s.titulo === servicoId)
    );
  }

  function handleCardClick(servico) {
    if (servico.acaoEspecial === 'personalizado') {
      setCriandoPersonalizado(!criandoPersonalizado);
      return;
    }
    if (servico.acaoEspecial === 'explorar') {
      setTermoBusca('');
      return;
    }
    onToggleServico(servico);
  }

  function handleSalvarPersonalizado(e) {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    const servicoPersonalizado = {
      id: `custom-${Date.now()}`,
      titulo: novoTitulo.trim(),
      descricao: novaDescricao.trim() || 'Serviço personalizado.',
      iconeTipo: 'personalizado',
    };
    if (onAdicionarPersonalizado) {
      onAdicionarPersonalizado(servicoPersonalizado);
    }
    setNovoTitulo('');
    setNovaDescricao('');
    setCriandoPersonalizado(false);
  }

  return (
    <div className="modal-servicos-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-servicos-container" onClick={(e) => e.stopPropagation()}>
        {/* topo do modal */}
        <div className="modal-servicos-topo">
          <div className="modal-servicos-titulo-wrapper">
            <div>
              <h2 className="modal-servicos-titulo-texto">Complete seu perfil!</h2>
              <p className="modal-servicos-subtitulo-texto">
                Selecione o que você oferece e o que você precisa.
              </p>
            </div>
            <span className="modal-servicos-badge-limite">
              Escolha até 5 serviços para melhores matches
            </span>
          </div>

          <button
            type="button"
            className="modal-servicos-fechar-btn"
            onClick={onClose}
            aria-label="Fechar pop-up"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* cabecalho da secao */}
        <div className="modal-secao-header">
          <div className="modal-secao-icone-circulo" aria-hidden="true">
            {isOfereco ? (
              /* icone de oferta */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            ) : (
              /* icone de procura */
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
                <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
                <path d="m2 16 6 6" />
                <circle cx="16" cy="6" r="3" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="modal-secao-titulo">{tituloSecao}</h3>
            <p className="modal-secao-subtitulo">{subtituloSecao}</p>
          </div>
        </div>

        {/* campo de busca */}
        <div className="modal-busca-container">
          <svg className="modal-busca-icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="modal-busca-input"
            placeholder={placeholderBusca}
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        {/* formulario de servico personalizado */}
        {criandoPersonalizado && (
          <form onSubmit={handleSalvarPersonalizado} className="modal-custom-form-wrapper">
            <h4 className="modal-custom-form-title">Criar serviço personalizado</h4>
            <div className="modal-custom-form-inputs">
              <input
                type="text"
                required
                placeholder="Nome do serviço (ex: Aulas de Violão)"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Breve descrição do que você oferece ou procura"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
              />
            </div>
            <div className="modal-custom-form-acoes">
              <button
                type="button"
                className="modal-custom-btn-cancel"
                onClick={() => setCriandoPersonalizado(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="modal-custom-btn-salvar">
                Adicionar ao perfil
              </button>
            </div>
          </form>
        )}

        {/* grade de servicos */}
        <div className="modal-cards-grade">
          {cardsFiltrados.map((servico) => {
            const selecionado = isSelecionado(servico.id);
            const isPersonalizado = servico.acaoEspecial === 'personalizado';
            const isExplorar = servico.acaoEspecial === 'explorar';

            return (
              <div
                key={servico.id}
                className={`modal-servico-card ${selecionado ? 'selecionado' : ''} ${
                  isPersonalizado ? 'personalizado' : ''
                }`}
                onClick={() => handleCardClick(servico)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(servico)}
              >
                <div className="modal-card-icone-wrapper">
                  <IconeServico tipo={servico.iconeTipo} />
                </div>

                <h4 className="modal-card-titulo">{servico.titulo}</h4>
                <p className="modal-card-descricao">{servico.descricao}</p>

                {isExplorar ? (
                  <button type="button" className="modal-card-btn-acao explorar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Explorar
                  </button>
                ) : isPersonalizado ? (
                  <button type="button" className="modal-card-btn-acao">
                    + Criar
                  </button>
                ) : selecionado ? (
                  <button type="button" className="modal-card-btn-acao adicionado">
                    Adicionado
                  </button>
                ) : (
                  <button type="button" className="modal-card-btn-acao">
                    + Adicionar
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* rodape do modal */}
        <div className="modal-servicos-rodape">
          <span className="modal-servicos-contagem">
            Selecionados: <strong>{servicosSelecionados.length}</strong> de 5
          </span>
          <button type="button" className="modal-servicos-btn-concluir" onClick={onClose}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
