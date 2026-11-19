

export const METRICAS_MOCK = {
  ativas: 2,
  aguardando: 1,
  concluidas: 14,
};

export const FILTROS_TROCAS = [
  { id: 'todas', label: 'Todas' },
  { id: 'em_andamento', label: 'Em Andamento' },
  { id: 'solicitacoes', label: 'Solicitações' },
  { id: 'concluidas', label: 'Concluídas' },
  { id: 'canceladas', label: 'Canceladas' },
];

export const TROCAS_MOCK = [
  {
    id: 'tr-01',
    status: 'em_andamento',
    statusLabel: 'Em andamento',
    badgeVariant: 'em_andamento',
    dataInicio: '15 Out 2026',
    prazo: '28 Out 2026',
    progresso: '60%',
    voce: {
      nome: 'Você',
      servico: 'Consulta Veterinária & Vacinação Pet',
      categoria: 'Medicina Veterinária',
    },
    parceiro: {
      id: 'usr-mariana',
      nome: 'Mariana Silva',
      avatar: null,
      avaliacao: '4.9',
      totalAvaliacoes: 24,
      servico: 'Identidade Visual Completa',
      categoria: 'Design Gráfico',
      localizacao: 'São Paulo, SP',
    },
    acordo: 'Consulta Clínica Veterinária e Vacinação em troca de Identidade Visual completa',
    descricaoDetalhada:
      'Consulta clínica veterinária completa com exame físico geral, avaliação preventiva de saúde e aplicação do protocolo vacinal anual para cães e gatos, em contrapartida ao desenvolvimento de pacote de Identidade Visual contendo logotipo principal, paleta de cores, tipografia e 6 templates editáveis para redes sociais.',
  },
  {
    id: 'tr-02',
    status: 'em_andamento',
    statusLabel: 'Em andamento',
    badgeVariant: 'em_andamento',
    dataInicio: '18 Out 2026',
    prazo: '02 Nov 2026',
    progresso: '35%',
    voce: {
      nome: 'Você',
      servico: 'Atendimento Veterinário Domiciliar',
      categoria: 'Clínica Veterinária',
    },
    parceiro: {
      id: 'usr-joao',
      nome: 'João Pedro',
      avatar: null,
      avaliacao: '4.8',
      totalAvaliacoes: 18,
      servico: 'Edição de Vídeos Reels/TikTok',
      categoria: 'Audiovisual',
      localizacao: 'Rio de Janeiro, RJ',
    },
    acordo: 'Atendimento Clínico Veterinário Domiciliar em troca de Edição de 8 vídeos Reels/TikTok',
    descricaoDetalhada:
      'Consultas clínicas veterinárias a domicílio com orientações de manejo, vermifugação e cuidados preventivos para animais de estimação, em contrapartida à edição dinâmica de 8 vídeos verticais para redes sociais com legendas e efeitos sonoros.',
  },
  {
    id: 'tr-03',
    status: 'aguardando_voce',
    statusLabel: 'Aguardando você',
    badgeVariant: 'aguardando_voce',
    dataInicio: 'Hoje às 10:30',
    prazo: 'Validade da proposta: 48 horas',
    voce: {
      nome: 'Você',
      servico: 'Check-up Preventivo e Exames Veterinários',
      categoria: 'Diagnóstico Veterinário',
    },
    parceiro: {
      id: 'usr-camila',
      nome: 'Camila Santos',
      avatar: null,
      avaliacao: '4.7',
      totalAvaliacoes: 15,
      servico: 'Gestão de Tráfego Pago',
      categoria: 'Marketing Digital',
      localizacao: 'Belo Horizonte, MG',
    },
    acordo: 'Check-up Veterinário Completo com Exames em troca de 1 mês de Gestão de Tráfego Pago',
    descricaoDetalhada:
      'Proposta recebida: Camila se propõe a configurar e otimizar campanhas de tráfego pago no Meta Ads (Instagram/Facebook) durante 30 dias em troca de um check-up preventivo completo para seus pets, com hemograma, perfil bioquímico e exame clínico.',
  },
  {
    id: 'tr-04',
    status: 'concluida',
    statusLabel: 'Concluída',
    badgeVariant: 'concluida',
    dataInicio: '25 Set 2026',
    dataConclusao: '10 Out 2026',
    voce: {
      nome: 'Você',
      servico: 'Nutrição Clínica e Dieta Veterinária',
      categoria: 'Nutrição Animal',
    },
    parceiro: {
      id: 'usr-rafael',
      nome: 'Rafael Torres',
      avatar: null,
      avaliacao: '5.0',
      totalAvaliacoes: 32,
      servico: 'Design de Interface UI/UX',
      categoria: 'Design UI/UX',
      localizacao: 'São Paulo, SP',
    },
    acordo: 'Prescrição de Dieta Veterinária Especializada em troca de Redesign UI/UX no Figma',
    descricaoDetalhada:
      'Troca finalizada com sucesso! Você realizou anamnese nutricional detalhada e prescreveu plano alimentar clínico para dois pets com restrições alimentares de Rafael, e Rafael entregou o fluxo de checkout prototipado e testado no Figma.',
  },
  {
    id: 'tr-05',
    status: 'cancelada',
    statusLabel: 'Cancelada',
    badgeVariant: 'cancelada',
    dataInicio: '10 Set 2026',
    dataCancelamento: '12 Set 2026',
    voce: {
      nome: 'Você',
      servico: 'Acompanhamento Pós-Cirúrgico Veterinário',
      categoria: 'Cirurgia e Cuidados Pet',
    },
    parceiro: {
      id: 'usr-andre',
      nome: 'André Moura',
      avatar: null,
      avaliacao: '4.6',
      totalAvaliacoes: 11,
      servico: 'Desenvolvimento Mobile',
      categoria: 'App Mobile',
      localizacao: 'Curitiba, PR',
    },
    acordo: 'Acompanhamento e curativos pós-cirúrgicos veterinários em troca de prototipagem mobile',
    descricaoDetalhada:
      'Troca cancelada em comum acordo antes do início da execução devido a conflitos de agenda para as visitas presenciais de acompanhamento pós-operatório.',
  },
];

