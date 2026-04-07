export interface SiteCustomization {
  header: {
    brandName: string;
    navLinks: string; // comma-separated
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaText: string;
    ctaSecondaryText: string;
    trustPoints: string; // comma-separated
  };
  resources: {
    badge: string;
    title: string;
    highlight: string;
    card1Title: string;
    card1Description: string;
    card2Title: string;
    card2Description: string;
    card3Title: string;
    card3Description: string;
    bottomBadge: string;
  };
  radar: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaText: string;
  };
  features: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    step1Title: string;
    step1Description: string;
    step2Title: string;
    step2Description: string;
    step3Title: string;
    step3Description: string;
    step4Title: string;
    step4Description: string;
  };
  whyChoose: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
  };
  partnerships: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    trustItems: string; // comma-separated
  };
  faq: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButtonText: string;
    ctaWhatsapp: string;
  };
  footer: {
    brandName: string;
    copyright: string;
  };
}

export const DEFAULT_CUSTOMIZATION: SiteCustomization = {
  header: {
    brandName: 'Genesis Hub',
    navLinks: 'Início,Recursos,Como Funciona,Planos',
  },
  hero: {
    badge: 'Assine e comece a fechar negócios hoje',
    title: 'Seu Hub de Automação',
    highlight: 'Crie, Gerencie e Escale',
    subtitle: 'Radar de prospecção com IA, automação de WhatsApp, gerador de páginas e contratos — tudo em um só lugar.',
    ctaText: 'Assinar Agora',
    ctaSecondaryText: 'Ver Planos',
    trustPoints: 'Setup em 5 minutos,Suporte 24h,Cancele quando quiser',
  },
  resources: {
    badge: 'Recursos',
    title: 'Tudo para você',
    highlight: 'vender mais',
    card1Title: 'Radar de Prospecção',
    card1Description: 'Encontre empresas prontas para comprar. A IA analisa, qualifica e entrega leads quentes.',
    card2Title: 'Propostas com IA',
    card2Description: 'Crie propostas personalizadas em segundos. Argumentos que convencem e fecham.',
    card3Title: 'Academia de Vendas',
    card3Description: 'Treinamentos práticos, simuladores de objeções e scripts de ligação prontos.',
    bottomBadge: 'E muito mais...',
  },
  radar: {
    badge: 'Clientes Prontos para Fechar Negócio',
    title: 'Veja oportunidades',
    highlight: 'reais',
    subtitle: 'Empresas esperando por você. Assine e tenha acesso completo aos contatos.',
    ctaText: 'Desbloquear Contatos',
  },
  features: {
    badge: 'Como Funciona',
    title: 'Do zero ao SaaS em',
    highlight: 'minutos',
    subtitle: 'Um processo simples, guiado e 100% visual — sem código, sem complicação.',
    step1Title: 'Descreva sua ideia',
    step1Description: 'Conte o que você quer criar. Nossa IA interpreta e estrutura tudo automaticamente.',
    step2Title: 'Personalize o visual',
    step2Description: 'Escolha cores, fontes e estilo. Seu projeto já nasce com identidade profissional.',
    step3Title: 'Gere instantaneamente',
    step3Description: 'Com um clique, seu SaaS está pronto — páginas, fluxos e estrutura completa.',
    step4Title: 'Lance e monetize',
    step4Description: 'Publique, conecte pagamentos e comece a faturar com seu produto digital.',
  },
  whyChoose: {
    badge: 'Diferenciais',
    title: 'Por que escolher o',
    highlight: 'Genesis Hub',
    subtitle: 'Não somos apenas mais um gerador de sites. Somos a plataforma completa para criar, evoluir e escalar seu negócio digital.',
  },
  partnerships: {
    badge: 'Nossas Parcerias',
    title: 'Conectados com as',
    highlight: 'melhores tecnologias',
    subtitle: 'Parcerias estratégicas que garantem qualidade, performance e inovação contínua.',
  },
  pricing: {
    title: 'Escolha o plano ideal para você',
    subtitle: 'Planos flexíveis para todas as necessidades',
    trustItems: 'Garantia 7 dias,+3.500 clientes satisfeitos',
  },
  faq: {
    badge: 'Tire Suas Dúvidas',
    title: 'Perguntas',
    highlight: 'Frequentes',
    subtitle: 'As dúvidas mais comuns de quem está conhecendo o Genesis Hub.',
    ctaTitle: 'Ainda tem dúvidas?',
    ctaSubtitle: 'Nossa equipe responde em até 24h',
    ctaButtonText: 'Falar no WhatsApp',
    ctaWhatsapp: '5511999999999',
  },
  footer: {
    brandName: 'Genesis Hub',
    copyright: '© 2026 GENESIS HUB. Transformando ideias em realidade.',
  },
};
