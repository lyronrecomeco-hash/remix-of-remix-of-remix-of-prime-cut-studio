import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  Search, 
  Radar, 
  Library, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Target,
  Sparkles,
  UserCheck,
  MessageSquare,
  Send,
  ChevronRight,
  ChevronLeft,
  Globe,
  Building2,
  ClipboardCheck,
  Handshake,
  Rocket,
  Lightbulb,
  Star,
  Zap,
  Link,
  ExternalLink,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Award,
  BarChart3,
  Eye,
  ThumbsUp,
  MessageCircle,
  Repeat,
  Gift,
  Percent,
  Timer,
  Brain,
  Palette,
  Code,
  Smartphone,
  Monitor,
  Camera,
  FileCheck,
  CreditCard,
  BadgeCheck,
  HeartHandshake,
  Megaphone,
  PenTool,
  Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
  tips?: string[];
  warning?: string;
  example?: string;
  script?: string;
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color?: string;
  steps: Step[];
}

const goldenTips = [
  {
    icon: Target,
    title: "Escolha nichos MUITO lucrativos",
    tip: "Clínicas de estética, barbearias premium, restaurantes com delivery, clínicas odontológicas e advocacias têm maior ticket médio e conversão. Foque em negócios que faturam acima de R$15k/mês - eles valorizam mais a presença digital e têm dinheiro para investir. Evite MEIs pequenos no começo.",
    extra: "NICHOS TOP 5: 1) Clínicas de estética (ticket R$2-5k), 2) Odontologia (ticket R$1.5-4k), 3) Advocacia (ticket R$2-6k), 4) Barbearias premium (ticket R$800-2k), 5) Restaurantes/delivery (ticket R$1-3k)"
  },
  {
    icon: Star,
    title: "Mire em empresas com 1-3 estrelas",
    tip: "Empresas com avaliações baixas no Google estão DESESPERADAS por ajuda - são leads muito mais quentes! Elas sabem que precisam melhorar e estão abertas a soluções. Mencione as avaliações na abordagem de forma sutil: 'Vi que vocês têm algumas avaliações que poderiam ser melhores...'",
    extra: "SCRIPT: 'Olá [nome], vi a [empresa] no Google e percebi que vocês têm algumas avaliações que não refletem a qualidade do serviço de vocês. Isso acontece muito quando não tem uma presença digital forte. Posso ajudar a virar esse jogo!'"
  },
  {
    icon: Zap,
    title: "Responda em até 5 minutos - SEMPRE",
    tip: "Leads respondidos em menos de 5 minutos têm 21x mais chances de converter do que leads respondidos após 30 minutos. Configure notificações no celular, tenha templates prontos para resposta rápida e NUNCA deixe para depois. A velocidade mata 100% da concorrência que demora horas ou dias!",
    extra: "DICA PRÁTICA: Crie atalhos de texto no seu celular com respostas prontas. No iPhone: Ajustes > Geral > Teclado > Substituição de Texto. No Android: use apps como Texpand."
  },
  {
    icon: MessageSquare,
    title: "Use áudio de 30-60 segundos no WhatsApp",
    tip: "Mensagens de áudio personalizadas geram 3x mais respostas que texto puro. Seja pessoal, mencione o nome da empresa, comente algo específico que você viu (avaliação, foto, post). Mostre que você REALMENTE pesquisou sobre o negócio deles - isso diferencia você de 99% dos concorrentes que mandam msg genérica.",
    extra: "ESTRUTURA DO ÁUDIO: 1) Cumprimento pessoal (5s), 2) Porque está entrando em contato (10s), 3) O que você notou sobre o negócio deles (15s), 4) Sua solução resumida (15s), 5) CTA com próximo passo (10s). Total: ~55 segundos."
  },
  {
    icon: Link,
    title: "SEMPRE inclua o link demo do site - É OBRIGATÓRIO!",
    tip: "Propostas com link do site demo têm 7x mais conversão (de 5% para 35%!). O cliente PRECISA visualizar o site funcionando com o nome dele, as cores dele, personalizado. Crie o demo ANTES de enviar a proposta - essa é a chave absoluta do fechamento. Sem link = sem venda.",
    extra: "O link demo é a sua maior arma de vendas. Quando o cliente vê o site PRONTO com o nome da empresa dele, ele já se imagina com aquilo. É muito mais fácil vender algo que a pessoa pode VER e TOCAR do que uma promessa abstrata."
  },
  {
    icon: Clock,
    title: "Crie urgência REAL (não fake)",
    tip: "Ofereça desconto genuíno por tempo limitado (48-72h máximo) ou mencione que você só atende X clientes por mês (se for verdade). A escassez REAL acelera a tomada de decisão. Nunca deixe o lead 'pensar' por muito tempo - quem pensa muito, não compra.",
    extra: "EXEMPLOS DE URGÊNCIA: 'Até sexta-feira consigo manter o valor promocional', 'Este mês só tenho vaga para mais 2 projetos', 'Semana que vem o valor reajusta 20%'"
  },
  {
    icon: Repeat,
    title: "Faça follow-up estratégico (5-7 contatos)",
    tip: "80% das vendas acontecem após o 5º contato, mas 92% dos vendedores desistem antes. Programe lembretes: 24h, 3 dias, 7 dias, 14 dias, 21 dias. Varie a abordagem: texto, áudio, imagem do site, vídeo mostrando o site. Persistência EDUCADA = conversão garantida.",
    extra: "SEQUÊNCIA DE FOLLOW-UP: Dia 1: Proposta inicial | Dia 2: 'Conseguiu ver?' | Dia 4: Áudio personalizado | Dia 7: 'Novidade no site' | Dia 14: 'Última chance do valor' | Dia 21: 'Fechando vagas do mês'"
  },
  {
    icon: Handshake,
    title: "Feche no WhatsApp - não espere reunião",
    tip: "Quanto mais etapas no processo de venda, maior a chance de perder o cliente. Envie proposta simplificada por WhatsApp, apresente os pacotes por texto/áudio, aceite pagamento via Pix NA HORA. Facilite ao máximo para o cliente dizer SIM. Reunião = desculpa para não decidir.",
    extra: "REGRA DE OURO: Se o cliente pediu reunião, você já perdeu a venda. A não ser que seja ticket muito alto (+R$5k), resolva tudo no WhatsApp. Reunião é para grandes empresas B2B, não para pequenos negócios."
  }
];

const guideSections: GuideSection[] = [
  {
    id: "golden-tips",
    title: "🏆 Dicas de Ouro",
    description: "8 estratégias comprovadas que triplicam suas conversões - leia ANTES de começar",
    icon: Lightbulb,
    color: "amber",
    steps: goldenTips.map((tip, index) => ({
      id: `tip-${index}`,
      title: tip.title,
      description: tip.tip,
      icon: tip.icon,
      details: [tip.tip],
      tips: [tip.extra || ""],
      example: tip.extra
    }))
  },
  {
    id: "prospecting",
    title: "🔍 Prospecção de Clientes",
    description: "Como encontrar empresas CERTAS que precisam de presença digital e vão PAGAR por isso",
    icon: Search,
    steps: [
      {
        id: "step1",
        title: "Entendendo a Lógica da Prospecção",
        description: "Antes de buscar clientes, você precisa entender QUEM são os clientes ideais e POR QUE eles precisam de você.",
        icon: Brain,
        details: [
          "CLIENTE IDEAL: Empresa local que fatura R$10k-100k/mês, sem site ou com site ruim, que depende de indicação",
          "DOR PRINCIPAL: Eles PERDEM clientes todo dia porque as pessoas pesquisam no Google e encontram o concorrente",
          "OPORTUNIDADE: Empresas com 1-3 estrelas no Google estão desesperadas - ninguém ajuda elas",
          "TIMING: Negócios novos (menos de 2 anos) são mais abertos a investir em presença digital",
          "PERFIL: Donos de 30-55 anos que sabem que precisam de site mas não sabem por onde começar",
          "EVITE: MEIs muito pequenos (não têm budget), franquias (decisão centralizada), empresas muito grandes (burocracia)"
        ],
        tips: [
          "Faça uma lista de 10 nichos e teste cada um por 1 semana - veja qual converte mais para VOCÊ",
          "Nichos de saúde e beleza geralmente têm maior ticket e menor resistência a preço",
          "Donos mais velhos (40+) valorizam mais atendimento humano - use isso a seu favor"
        ],
        example: "Exemplo de cliente ideal: Clínica de estética com 2 anos, fatura R$30k/mês, tem Instagram ativo mas site antigo, 3.8 estrelas no Google com reclamações de 'difícil agendamento'. Essa clínica VAI comprar um site com agendamento online."
      },
      {
        id: "step2",
        title: "Acessando a Ferramenta de Busca",
        description: "Use a ferramenta 'Encontrar Clientes' para descobrir leads qualificados automaticamente.",
        icon: Search,
        details: [
          "Clique no card 'Encontrar Clientes' na tela inicial do dashboard Genesis",
          "A ferramenta usa IA para encontrar empresas que NÃO têm presença digital adequada",
          "Ela analisa: site (existe? está atualizado?), redes sociais (ativas?), avaliações Google (quantas? qual nota?)",
          "Cada empresa encontrada já vem com SCORE de qualidade baseado em potencial de venda",
          "A busca é feita em tempo real usando dados do Google Maps e outras fontes públicas",
          "Você pode salvar os melhores leads para trabalhar depois de forma organizada"
        ],
        tips: [
          "Faça buscas em horários alternativos (noite/madrugada) quando o sistema está menos carregado",
          "Comece com buscas menores (10-20 resultados) para validar o nicho antes de escalar",
          "Anote os nichos que dão mais resultado para você - cada pessoa tem afinidade com nichos diferentes"
        ]
      },
      {
        id: "step3",
        title: "Configurando Filtros Estratégicos",
        description: "Os filtros certos fazem TODA diferença entre perder tempo e encontrar clientes que pagam.",
        icon: Target,
        details: [
          "NICHO: Escolha UM segmento específico por vez. Generalista = vendas fracas. Especialista = autoridade",
          "LOCALIZAÇÃO: Comece pela SUA cidade e região. Conhecer o mercado local ajuda muito na abordagem",
          "TAMANHO DA CIDADE: Cidades de 30-150 mil habitantes têm menos concorrência e donos mais acessíveis",
          "QUANTIDADE: Peça 15-25 resultados por busca. Muitos = análise superficial. Poucos = desperdício de tempo",
          "AVALIAÇÃO GOOGLE: Filtre por 1-4 estrelas. 5 estrelas = satisfeitos, não precisam de você",
          "SEM SITE: Priorize empresas sem site - é a venda mais fácil porque a dor é óbvia"
        ],
        tips: [
          "COMBINAÇÃO MÁGICA: Nicho lucrativo + cidade média + avaliação 2-3 estrelas + sem site = OURO PURO",
          "Evite capitais no começo - muita concorrência de agências grandes",
          "Teste cidades vizinhas à sua - você pode visitar pessoalmente se necessário"
        ],
        example: "Filtro ideal para iniciante: Nicho 'Barbearias', Cidade 'Jundiaí-SP', Avaliação '1-4 estrelas', 20 resultados. Vai retornar barbearias que precisam de ajuda e podem pagar."
      },
      {
        id: "step4",
        title: "Analisando Cada Empresa em Detalhes",
        description: "NUNCA salve um lead sem analisar. 5 minutos de análise = horas economizadas em contatos ruins.",
        icon: Eye,
        details: [
          "SITE ATUAL: Existe? Se sim, está atualizado? Tem certificado SSL? Funciona no celular? Carrega rápido?",
          "GOOGLE MEU NEGÓCIO: Perfil completo? Fotos profissionais? Horários atualizados? Responde avaliações?",
          "AVALIAÇÕES: Leia os comentários NEGATIVOS - ali estão as DORES que você vai resolver na proposta",
          "INSTAGRAM/FACEBOOK: Está ativo? Posta com frequência? Tem engajamento? Perfil profissional?",
          "WHATSAPP: Tem WhatsApp Business? Número fixo ou celular? Facilidade de contato?",
          "CONCORRÊNCIA: Os concorrentes diretos têm site melhor? Use isso como argumento de venda"
        ],
        tips: [
          "Tire print das avaliações negativas - use como prova do problema na proposta",
          "Se o concorrente direto tem site profissional, MOSTRE essa comparação ao lead",
          "Empresas que respondem avaliações negativas educadamente são bons clientes - valorizam reputação"
        ],
        example: "Análise exemplo: 'Barbearia Premium - 3.2 estrelas - Reclamação: difícil agendar, só atende telefone. Oportunidade: site com agendamento online. Argumento: concorrente Barber King tem site moderno e 4.5 estrelas.'"
      },
      {
        id: "step5",
        title: "Salvando e Organizando os Leads",
        description: "Organização é 50% do sucesso. Leads bagunçados = vendas perdidas.",
        icon: ClipboardCheck,
        details: [
          "Clique em 'Salvar' APENAS nos leads que você realmente vai trabalhar (qualidade > quantidade)",
          "Adicione NOTAS detalhadas: dores identificadas, argumentos de venda, melhor horário de contato",
          "Use TAGS para classificar: 'quente' (contatar hoje), 'morno' (contatar essa semana), 'frio' (nutrição)",
          "Priorize leads QUENTES - contato em até 24h ou eles esfriam",
          "Organize sua rotina: 1h manhã (prospecção) + 2h tarde (contato) + 1h noite (follow-up)",
          "Meta realista: salvar 20 leads/dia, contatar 10, receber 3-5 respostas, fechar 1-2/semana"
        ],
        tips: [
          "REGRA 20-10-5-1: 20 leads salvos → 10 contatos → 5 respostas → 1-2 vendas",
          "Leads não contatados em 48h perdem 80% do potencial - velocidade é tudo",
          "Faça prospecção e contato em blocos separados - misturar reduz produtividade em 40%"
        ]
      }
    ]
  },
  {
    id: "radar",
    title: "📡 Radar Global",
    description: "Sua máquina de geração de leads automática que trabalha 24 horas por dia",
    icon: Radar,
    steps: [
      {
        id: "step1",
        title: "O Que é o Radar Global",
        description: "Entenda o poder dessa ferramenta que trabalha PARA VOCÊ enquanto você vende.",
        icon: Globe,
        details: [
          "O Radar é um sistema de IA que varre MÚLTIPLAS cidades simultaneamente buscando oportunidades",
          "Ele funciona 24/7 - enquanto você dorme, o Radar está encontrando leads para você",
          "Usa algoritmos avançados para priorizar leads com maior potencial de conversão",
          "Cada lead encontrado já vem com SCORE de qualidade (0-100) calculado automaticamente",
          "O Score considera: presença digital atual, potencial de faturamento, facilidade de contato, nicho",
          "Atualiza constantemente - novos leads frescos aparecem todos os dias",
          "Você só precisa revisar e aceitar os melhores - o trabalho pesado está feito"
        ],
        tips: [
          "Configure o Radar uma vez e deixe rodando - produtividade máxima com esforço mínimo",
          "Leads do Radar já vêm pré-qualificados - taxa de conversão 40% maior que busca manual",
          "Combine Radar + busca manual: Radar para volume, busca manual para nichos específicos"
        ]
      },
      {
        id: "step2",
        title: "Configurando o Radar",
        description: "Configure corretamente para receber apenas leads que fazem sentido para você.",
        icon: Target,
        details: [
          "Acesse 'Radar Global' no menu lateral esquerdo do dashboard",
          "REGIÃO: Defina as cidades e estados que você quer monitorar (comece pela sua região)",
          "NICHOS: Selecione os segmentos que você domina ou quer especializar",
          "SCORE MÍNIMO: Recomendado 60+ para não perder tempo com leads frios",
          "FREQUÊNCIA: Configure para receber novos leads diariamente ou semanalmente",
          "NOTIFICAÇÕES: Ative alertas para leads com score acima de 80 (ultra quentes)"
        ],
        tips: [
          "Menos é mais: configure 2-3 nichos bem específicos em vez de muitos genéricos",
          "Monitore cidades vizinhas à sua - você pode atender presencial se necessário",
          "Ajuste as configurações mensalmente baseado nos resultados"
        ]
      },
      {
        id: "step3",
        title: "Interpretando os Scores",
        description: "Entenda o que cada faixa de score significa e como priorizar seu tempo.",
        icon: BarChart3,
        details: [
          "SCORE 90-100: LEAD DIAMANTE 💎 - Prioridade ABSOLUTA. Contate em até 2 HORAS. Alta chance de fechar.",
          "SCORE 80-89: LEAD OURO 🥇 - Muito quente. Contate no mesmo dia. Probabilidade alta de resposta.",
          "SCORE 70-79: LEAD PRATA 🥈 - Bom potencial. Contate em até 24h. Vale o esforço.",
          "SCORE 60-69: LEAD BRONZE 🥉 - Potencial moderado. Contate em até 48h. Qualifique melhor antes.",
          "SCORE 50-59: LEAD FRIO ❄️ - Baixo potencial. Só trabalhe se tiver tempo sobrando.",
          "SCORE abaixo de 50: DESCARTE - Não vale seu tempo. Foque nos scores altos."
        ],
        tips: [
          "Foque 80% do seu tempo em leads score 70+. Os outros 20% em volume de leads 60-69.",
          "Lead score 90+ responde em média 3x mais rápido que score 60. Tempo é dinheiro!",
          "Se você só tem 1 hora/dia, trabalhe APENAS leads 80+ - ROI máximo do seu tempo"
        ]
      },
      {
        id: "step4",
        title: "Aceitando e Processando Leads",
        description: "O fluxo correto para transformar leads do Radar em clientes.",
        icon: UserCheck,
        details: [
          "Revise os leads apresentados - leia as informações antes de aceitar",
          "Clique em 'Aceitar' para adicionar leads qualificados à sua lista de trabalho",
          "Leads aceitos vão automaticamente para a aba 'Propostas' para você dar continuidade",
          "Você pode 'Rejeitar' leads que não fazem sentido - isso treina a IA a trazer melhores opções",
          "Adicione notas ao aceitar: 'Vi avaliação ruim sobre atendimento - oportunidade para chat bot'",
          "Processe leads diariamente - leads frescos convertem 50% mais que leads de 1 semana atrás"
        ],
        tips: [
          "Aceite no máximo 10-15 leads por dia - mais que isso você não consegue trabalhar direito",
          "O Radar APRENDE com suas aceitações e rejeições - quanto mais usa, melhores os resultados",
          "Leads rejeitados podem reaparecer em 30 dias se as condições mudarem - normal!"
        ]
      }
    ]
  },
  {
    id: "library",
    title: "📚 Biblioteca de Projetos",
    description: "Crie sites demo incríveis que impressionam clientes e FECHAM vendas",
    icon: Library,
    steps: [
      {
        id: "step1",
        title: "Por Que o Site Demo é CRUCIAL",
        description: "Entenda por que criar o site ANTES é a estratégia que separa amadores de profissionais.",
        icon: Lightbulb,
        details: [
          "PSICOLOGIA: Quando o cliente VÊ o site pronto com o nome dele, ele JÁ SE IMAGINA usando",
          "DIFERENCIAÇÃO: 99% dos concorrentes só prometem. Você MOSTRA o resultado antes de cobrar",
          "CONFIANÇA: Ver é acreditar. Um link demo elimina todo ceticismo e objeção",
          "URGÊNCIA: Cliente vê o site lindo e não quer perder - acelera a decisão de compra",
          "CONVERSÃO: Propostas com link demo convertem 35% vs 5% sem link. É 7x mais eficiente!",
          "TEMPO: Parece mais trabalho, mas você fecha mais rápido e com menos negociação"
        ],
        tips: [
          "Crie o demo em 20-30 minutos (com prática). O fechamento economiza 2-3 horas de negociação.",
          "Um demo bem feito justifica preços 30-50% maiores que a concorrência",
          "Cliente que vê o demo fica 'apegado' - difícil escolher outra opção depois"
        ],
        warning: "NUNCA envie proposta sem o link demo. Você está jogando dinheiro fora. Repito: SEM LINK = SEM VENDA."
      },
      {
        id: "step2",
        title: "Acessando a Biblioteca",
        description: "Navegue até a Biblioteca e entenda suas opções de criação.",
        icon: Library,
        details: [
          "Clique em 'Biblioteca' no menu lateral esquerdo do dashboard Genesis",
          "Você verá o painel principal com suas opções de criação",
          "OPÇÃO 1 - 'Começar do Zero': Wizard guiado com 11 etapas para projeto 100% personalizado",
          "OPÇÃO 2 - 'Modelos Prontos': Templates já otimizados por nicho, prontos para usar em minutos",
          "OPÇÃO 3 - 'Meus Projetos': Acesse projetos salvos anteriormente para reutilizar ou editar",
          "Cada opção tem seu uso ideal dependendo do tempo disponível e perfil do cliente"
        ],
        tips: [
          "QUANDO USAR 'DO ZERO': Cliente premium (ticket alto), nicho diferente, requisitos específicos",
          "QUANDO USAR 'MODELOS': Volume, urgência, nicho padrão, cliente sensível a preço",
          "Modelos economizam 70% do tempo - use sempre que possível"
        ]
      },
      {
        id: "step3",
        title: "Wizard 'Começar do Zero' - Etapas Iniciais (1-4)",
        description: "Configure as bases fundamentais do projeto que a IA vai gerar.",
        icon: PenTool,
        details: [
          "ETAPA 1 - TIPO DE PROJETO: Escolha entre 'Site Comercial' (mais comum) ou 'Aplicativo Web'",
          "ETAPA 2 - NICHO/SEGMENTO: Selecione o segmento exato (barbearia, clínica, restaurante, etc)",
          "ETAPA 3 - INFORMAÇÕES DA EMPRESA: Nome completo, descrição do negócio, diferenciais",
          "ETAPA 4 - IDENTIDADE VISUAL: Cores da marca (primária e secundária), estilo visual desejado",
          "Cada campo preenchido torna o site MAIS personalizado e impressionante para o cliente",
          "Se não souber as cores da empresa, pesquise no Instagram/Facebook ou pergunte ao cliente"
        ],
        tips: [
          "DICA DE CORES: Se o cliente não tem cores definidas, use azul (confiança) ou verde (saúde/natureza)",
          "DESCRIÇÃO: Quanto mais detalhada, melhor. Inclua anos de mercado, quantidade de clientes, especialidades",
          "Copie textos do Instagram/site atual do cliente para a descrição - economiza tempo"
        ],
        example: "Exemplo preenchimento: Nome: 'Barbearia Dom Pedro', Descrição: 'Barbearia premium em Campinas há 8 anos, especializada em cortes clássicos e barba. Atende executivos e empresários que buscam qualidade.', Cor: '#1a365d' (azul escuro)"
      },
      {
        id: "step4",
        title: "Wizard 'Começar do Zero' - Funcionalidades (5-8)",
        description: "Defina o que o site vai FAZER além de informar - aqui está o valor real.",
        icon: Sparkles,
        details: [
          "ETAPA 5 - OBJETIVOS: O que o site precisa alcançar? Marque todos que se aplicam:",
          "  → Gerar leads/contatos (formulário, WhatsApp)",
          "  → Vender produtos/serviços (e-commerce básico)",
          "  → Agendar horários (integração com agenda)",
          "  → Mostrar portfólio (galeria de trabalhos)",
          "ETAPA 6 - PÁGINAS NECESSÁRIAS: Home, Sobre, Serviços, Contato, Blog, Galeria, Depoimentos",
          "ETAPA 7 - FUNCIONALIDADES ESPECÍFICAS: WhatsApp flutuante, formulário de contato, mapa, agenda online",
          "ETAPA 8 - DIFERENCIAIS: O que destaca esse negócio dos concorrentes (use para SEO e copywriting)"
        ],
        tips: [
          "BARBEARIAS: Obrigatório agendamento online + WhatsApp + galeria de cortes",
          "RESTAURANTES: Obrigatório cardápio digital + delivery + WhatsApp para pedidos",
          "CLÍNICAS: Obrigatório agendamento + formulário qualificado + mapa de localização",
          "SEMPRE inclua WhatsApp flutuante - é o que mais converte no Brasil"
        ]
      },
      {
        id: "step5",
        title: "Wizard 'Começar do Zero' - Finalização (9-11)",
        description: "Últimos detalhes e geração do prompt otimizado.",
        icon: FileCheck,
        details: [
          "ETAPA 9 - CONTEÚDO: Textos específicos, slogans, informações de contato, horários",
          "ETAPA 10 - REFERÊNCIAS: Cole links de sites que o cliente gosta ou que você quer como inspiração",
          "ETAPA 11 - REVISÃO FINAL: Confira TUDO antes de gerar. Erros aqui = site errado",
          "Clique em 'Gerar Prompt' para criar o comando otimizado para a IA",
          "O sistema compila TODAS as informações em um prompt técnico profissional",
          "Clique em 'Salvar Projeto' para guardar e acessar depois em 'Meus Projetos'"
        ],
        tips: [
          "REVISÃO: Leia cada campo em voz alta - você vai perceber erros que passou batido",
          "REFERÊNCIAS: Sites da concorrência bem-sucedida são ótimas referências de design",
          "Projetos salvos podem ser clonados para clientes similares - economiza muito tempo"
        ]
      },
      {
        id: "step6",
        title: "Criando na Lovable - GANHE 10 CRÉDITOS GRÁTIS!",
        description: "Use nosso link especial para criar o site e ganhar créditos de bônus.",
        icon: Rocket,
        details: [
          "Após gerar o prompt, clique no botão 'Criar na Lovable' (botão azul grande)",
          "O sistema abre a Lovable automaticamente com nosso LINK DE CONVITE ESPECIAL",
          "🎁 Ao criar conta pelo nosso link, você ganha 10 CRÉDITOS GRÁTIS adicionais!",
          "O prompt é copiado automaticamente para a área de transferência",
          "Cole o prompt no chat da Lovable e aguarde a IA gerar o site (2-5 minutos)",
          "A Lovable cria sites profissionais com código limpo, responsivo e moderno",
          "Cada crédito = 1 solicitação. Use para ajustes: 'mude a cor do botão para verde'"
        ],
        tips: [
          "SEMPRE use o botão da plataforma - só assim você ganha os créditos grátis!",
          "Não se preocupe se o primeiro resultado não ficar perfeito - use créditos para ajustes",
          "Comandos de ajuste: 'adicione seção de depoimentos', 'mude a fonte para Montserrat', 'coloque mais espaço entre seções'"
        ],
        warning: "IMPORTANTE: Use SEMPRE o botão 'Criar na Lovable' da nossa plataforma. Criando por fora você PERDE os 10 créditos grátis!"
      },
      {
        id: "step7",
        title: "Publicando e Obtendo o Link Demo",
        description: "O passo final: publicar o site e obter o link mágico que fecha vendas.",
        icon: Share2,
        details: [
          "Quando o site estiver pronto na Lovable, clique em 'Publish' no canto superior direito",
          "Aguarde a publicação ser concluída (geralmente 1-2 minutos, às vezes 5)",
          "A Lovable gera um link como: nomedaempresa.lovable.app",
          "Teste o link em 3 dispositivos: desktop, tablet e celular - garanta que funciona",
          "COPIE ESSE LINK E GUARDE - você vai precisar dele para a proposta!",
          "O cliente verá exatamente como o site dele vai ficar - é isso que vende!"
        ],
        tips: [
          "Mande o link para si mesmo no WhatsApp e teste no celular - maioria dos clientes vê pelo celular",
          "Se encontrar bugs, use créditos para corrigir antes de enviar ao cliente",
          "Salve o link em um documento junto com o nome do cliente e data - organização!"
        ],
        warning: "⚠️ ESTE LINK É OBRIGATÓRIO NA PROPOSTA! Sem ele, sua conversão cai de 35% para míseros 5%."
      }
    ]
  },
  {
    id: "proposals",
    title: "💬 Propostas Personalizadas",
    description: "Gere mensagens de venda persuasivas com IA que convertem leads em clientes",
    icon: MessageSquare,
    steps: [
      {
        id: "step1",
        title: "Preparação Antes de Criar a Proposta",
        description: "Não crie a proposta no improviso. Prepare-se para maximizar conversão.",
        icon: ClipboardCheck,
        details: [
          "✅ CHECKLIST ANTES DE CRIAR A PROPOSTA:",
          "1. Você já tem o LINK DEMO do site criado? (Se não, PARE e crie primeiro!)",
          "2. Você analisou a empresa? (Site atual, redes sociais, avaliações Google)",
          "3. Você identificou as DORES específicas? (O que reclamam? O que falta?)",
          "4. Você sabe o NOME correto da empresa e do dono (se possível)?",
          "5. Você tem o WHATSAPP de contato verificado?",
          "6. Você decidiu qual TOM usar? (Agressivo, persuasivo ou foco na dor)"
        ],
        tips: [
          "Propostas genéricas = lixo. Propostas personalizadas = vendas. Invista 10 minutos na preparação.",
          "Use o nome do DONO se souber - 'Olá Carlos' converte 3x mais que 'Olá equipe'",
          "Leia as últimas 5 avaliações negativas no Google - ali estão os argumentos de venda"
        ],
        warning: "Se você não tem o link demo, PARE AQUI. Volte para a Biblioteca e crie o site primeiro. Proposta sem demo = desperdício de tempo."
      },
      {
        id: "step2",
        title: "Acessando o Gerador de Propostas",
        description: "Navegue até a ferramenta e entenda a interface.",
        icon: FileText,
        details: [
          "Clique em 'Propostas Personalizadas' na tela inicial do dashboard Genesis",
          "Você verá o wizard de criação dividido em etapas lógicas",
          "A IA usa tudo que você preencher para gerar uma proposta ÚNICA e personalizada",
          "As propostas geradas podem ser editadas manualmente antes de enviar",
          "Propostas salvas ficam em 'Minhas Propostas' para reutilização e consulta",
          "Você pode criar múltiplas versões para o mesmo cliente e testar qual funciona melhor"
        ],
        tips: [
          "Tenha as informações do cliente em mãos ANTES de começar - interrupções atrapalham",
          "Use abas do navegador: uma com Google Maps (dados do cliente), outra com o gerador"
        ]
      },
      {
        id: "step3",
        title: "Preenchendo os Dados do Cliente",
        description: "Quanto mais detalhes, mais persuasiva e personalizada será a proposta.",
        icon: Building2,
        details: [
          "NICHO: Selecione o segmento EXATO. 'Clínica de estética' é diferente de 'Clínica médica'",
          "NOME DA EMPRESA: Digite EXATAMENTE como aparece (use maiúsculas corretas)",
          "NOME DO DONO: Se souber, inclua. Personalização extrema = conversão extrema",
          "CONTATO: WhatsApp principal (verificado) e email se tiver",
          "PROBLEMAS IDENTIFICADOS: Liste TUDO que você notou na análise:",
          "  → Site desatualizado/inexistente",
          "  → Avaliações negativas (cite as dores mencionadas)",
          "  → Redes sociais abandonadas",
          "  → Concorrente com presença melhor",
          "OBJETIVOS DO CLIENTE: O que ele provavelmente quer alcançar"
        ],
        tips: [
          "COPIE avaliações negativas do Google e cole nos 'Problemas' - a IA vai usar como argumento",
          "Se o concorrente tem site bom, mencione: 'concorrente X tem site moderno e está roubando clientes'",
          "Objetivos comuns: mais agendamentos, menos ligações, parecer mais profissional"
        ],
        example: "Exemplo: 'Problemas: Site de 2015 não funciona no celular, 3.4 estrelas no Google com reclamação de difícil contato, Instagram parado há 6 meses, concorrente Clínica Belle tem site novo e 4.8 estrelas'"
      },
      {
        id: "step4",
        title: "Escolhendo o Tom da Mensagem",
        description: "O tom certo depende do estágio do lead e da situação.",
        icon: Megaphone,
        details: [
          "TOM AGRESSIVO: Para leads FRIOS que nunca ouviram de você",
          "  → Foca forte na DOR e no problema",
          "  → Usa urgência e escassez",
          "  → Ideal para primeiro contato",
          "  → Exemplo: 'Vi que você está perdendo clientes para...'",
          "",
          "TOM PERSUASIVO: Para leads MORNOS que já demonstraram interesse",
          "  → Foca nos benefícios e soluções",
          "  → Tom mais consultivo e amigável",
          "  → Ideal para follow-up ou indicação",
          "",
          "TOM DOR: Máxima ênfase nos problemas atuais",
          "  → Mostra o CUSTO de não agir",
          "  → Cria desconforto proposital",
          "  → Ideal para leads que enrolam"
        ],
        tips: [
          "Primeiro contato frio? Use 'Agressivo'. Indicação de cliente? Use 'Persuasivo'.",
          "Lead que falou 'vou pensar'? Use 'Dor' para criar urgência",
          "Na dúvida, comece com 'Agressivo' - você pode suavizar no follow-up"
        ]
      },
      {
        id: "step5",
        title: "Gerando e Revisando a Proposta",
        description: "A IA gera, mas VOCÊ refina. A revisão humana é essencial.",
        icon: Sparkles,
        details: [
          "Clique em 'Gerar Proposta' e aguarde a IA processar (10-30 segundos)",
          "A proposta gerada inclui: gancho inicial, identificação de dores, solução, benefícios, CTA",
          "REVISE TUDO antes de enviar:",
          "  → O nome da empresa está correto?",
          "  → As dores mencionadas fazem sentido?",
          "  → O link demo está incluído? (Se não, ADICIONE!)",
          "  → O CTA é claro? (O que você quer que o cliente faça?)",
          "Edite manualmente o que precisar - a IA é base, você personaliza",
          "Clique em 'Salvar' para guardar a proposta no sistema"
        ],
        tips: [
          "Leia a proposta em VOZ ALTA - você vai perceber se soa natural ou robótico",
          "Adicione um emoji ou dois para humanizar 😊 - mas não exagere",
          "O link demo PRECISA estar na proposta. Se não estiver, adicione manualmente!"
        ]
      },
      {
        id: "step6",
        title: "OBRIGATÓRIO: Incluir o Link Demo",
        description: "Este é o passo que SEPARA vendedores de amadores. Não pule!",
        icon: Link,
        details: [
          "⚠️ PARE E VERIFIQUE: O link do site demo está na proposta?",
          "Se NÃO está, adicione AGORA antes de enviar:",
          "",
          "ESTRUTURA IDEAL:",
          "'[...texto da proposta...]'",
          "'Inclusive, já preparei um protótipo do site para vocês verem como ficaria:'",
          "'👉 [LINK DO DEMO] 👈'",
          "'É só clicar e ver funcionando no celular ou computador!'",
          "",
          "O cliente PRECISA visualizar o site para entender o valor",
          "Isso diferencia você de 99% da concorrência que só promete"
        ],
        tips: [
          "Coloque o link em DESTAQUE com emojis de seta: 👉 link 👈",
          "Teste o link VOCÊ antes de enviar - links quebrados = credibilidade zero",
          "Mencione que funciona no celular - maioria vai abrir pelo WhatsApp"
        ],
        warning: "DADOS REAIS: Propostas SEM link demo = 5% de conversão. COM link demo = 35% de conversão. É 7x mais eficiente! NÃO IGNORE ISSO."
      },
      {
        id: "step7",
        title: "Enviando no Momento Certo",
        description: "Timing e formato corretos maximizam taxa de resposta.",
        icon: Send,
        details: [
          "HORÁRIOS IDEAIS PARA ENVIAR:",
          "  → Manhã: 9h-11h (dono ainda não está no rush)",
          "  → Tarde: 14h-16h (após almoço, antes de fechar)",
          "  → EVITE: 12h-14h (almoço), após 18h (vida pessoal), segundas de manhã (caos)",
          "",
          "DIAS IDEAIS:",
          "  → Terça, quarta e quinta têm maiores taxas de resposta",
          "  → Segunda: dono resolvendo problemas do fim de semana",
          "  → Sexta: cabeça já no fim de semana",
          "",
          "SEQUÊNCIA DE ENVIO:",
          "1. Mensagem de texto (a proposta)",
          "2. Aguarde 2-3 minutos",
          "3. Áudio de 30-60 segundos personalizando ainda mais"
        ],
        tips: [
          "O áudio após o texto TRIPLICA a taxa de resposta - não pule essa etapa",
          "Se não responder em 24h, envie follow-up no mesmo horário do dia seguinte",
          "Evite finais de semana - donos estão operando, não pensando em melhorias"
        ],
        script: "SCRIPT DO ÁUDIO (30-60s): 'Oi [nome], aqui é o [seu nome]. Acabei de te enviar uma mensagem sobre a [empresa]. Vi que vocês têm [problema específico] e já preparei uma solução. Inclusive tem um link ali do protótipo do site que eu criei especialmente pra vocês. Dá uma olhada e me conta o que achou? Abraço!'"
      }
    ]
  },
  {
    id: "closing",
    title: "🤝 Fechando o Contrato",
    description: "Converta leads interessados em clientes pagantes com técnicas comprovadas",
    icon: Handshake,
    steps: [
      {
        id: "step1",
        title: "Estrutura da Primeira Mensagem",
        description: "O primeiro contato define o tom de toda a negociação. Faça direito.",
        icon: MessageSquare,
        details: [
          "ESTRUTURA PERFEITA DA MENSAGEM:",
          "",
          "1. GANCHO (chamar atenção em 1 linha):",
          "   'Olá [nome], vi a [empresa] no Google e notei algo importante sobre a presença online de vocês...'",
          "",
          "2. DOR (mostrar o problema em 2-3 linhas):",
          "   'Percebi que [problema específico]. Isso faz vocês perderem clientes para [concorrente] que tem [vantagem].'",
          "",
          "3. SOLUÇÃO (sua proposta em 1-2 linhas):",
          "   'Eu ajudo empresas como a sua a ter presença digital profissional que atrai e converte clientes.'",
          "",
          "4. PROVA (o link demo):",
          "   'Inclusive já criei um protótipo exclusivo para vocês: [LINK]'",
          "",
          "5. CTA (próximo passo claro):",
          "   'Podemos conversar 5 minutos sobre isso? Qual melhor horário para você?'"
        ],
        tips: [
          "Mensagem curta + link demo = melhor resultado. Não escreva redação.",
          "Personalize com o NOME da empresa - mostra que você pesquisou",
          "CTA deve ser fácil de responder: 'amanhã 10h funciona?' é melhor que 'me liga'"
        ],
        script: "MODELO COMPLETO: 'Olá Carlos! Vi a Barbearia Premium no Google e notei que vocês não têm um site atualizado - isso faz perderem clientes para a Barber King que aparece primeiro nas buscas. Eu ajudo barbearias a terem presença digital profissional. Inclusive já criei um protótipo do site para vocês: 👉 barbearia-premium.lovable.app 👈 É só clicar! Podemos trocar uma ideia sobre isso? Qual melhor horário amanhã?'"
      },
      {
        id: "step2",
        title: "Lidando com Objeções Comuns",
        description: "Toda objeção é uma oportunidade disfarçada. Aprenda a virar o jogo.",
        icon: Target,
        details: [
          "OBJEÇÃO: 'Não tenho dinheiro agora'",
          "RESPOSTA: 'Entendo perfeitamente! Justamente por isso facilito: parcelo em até X vezes sem juros. E pensa comigo: quanto você está deixando de ganhar todo mês sem uma presença digital? Esse investimento se paga em X semanas.'",
          "",
          "OBJEÇÃO: 'Deixa pra depois / Vou pensar'",
          "RESPOSTA: 'Claro! Só uma pergunta: quanto tempo faz que você está pensando em melhorar isso? Cada dia sem presença digital são clientes indo pro concorrente. O que exatamente precisa pensar? Talvez eu possa esclarecer agora.'",
          "",
          "OBJEÇÃO: 'Meu sobrinho/amigo faz sites'",
          "RESPOSTA: 'Que bom! Redes de apoio são importantes. Só uma pergunta: esse site está gerando clientes pra você hoje? Se não está, talvez valha a pena ver uma abordagem profissional. Posso mostrar a diferença?'",
          "",
          "OBJEÇÃO: 'Está muito caro'",
          "RESPOSTA: 'Entendo a preocupação com investimento. Me conta: quanto você acha que perde por mês sem presença digital adequada? Se você está perdendo 10 clientes/mês a R$100 cada, são R$1.000/mês. O site se paga no primeiro mês.'"
        ],
        tips: [
          "NUNCA descarte uma objeção - é uma oportunidade de educar e mostrar valor",
          "Use PERGUNTAS para entender a real preocupação por trás da objeção",
          "Transforme preço em investimento. Mostre o RETORNO, não o CUSTO."
        ]
      },
      {
        id: "step3",
        title: "Apresentando Pacotes e Preços",
        description: "A forma como você apresenta preços influencia diretamente na decisão.",
        icon: DollarSign,
        details: [
          "REGRA DOS 3 PACOTES:",
          "",
          "📦 PACOTE BÁSICO (entrada):",
          "  → Site institucional simples (5 páginas)",
          "  → WhatsApp flutuante",
          "  → Formulário de contato",
          "  → 1 mês de suporte",
          "  → Preço: R$ 997 (ou seu valor de entrada)",
          "",
          "🎯 PACOTE PROFISSIONAL (mais vendido - destaque!):",
          "  → Tudo do básico +",
          "  → Agendamento online integrado",
          "  → Otimização para Google (SEO básico)",
          "  → 3 meses de suporte",
          "  → Preço: R$ 1.997 (ou seu valor médio)",
          "",
          "👑 PACOTE PREMIUM (âncora):",
          "  → Tudo do profissional +",
          "  → Domínio personalizado (.com.br)",
          "  → Email profissional",
          "  → 6 meses de suporte",
          "  → Treinamento de uso",
          "  → Preço: R$ 3.997 (ou seu valor alto)"
        ],
        tips: [
          "Sempre apresente 3 opções - a maioria escolhe o do MEIO (é proposital)",
          "O pacote Premium existe para fazer o Profissional parecer bom negócio",
          "Inclua BÔNUS em vez de dar desconto: 'levo logo grátis' é melhor que '-10%'"
        ]
      },
      {
        id: "step4",
        title: "Técnicas de Fechamento",
        description: "Não espere o cliente decidir. Conduza a venda até o SIM.",
        icon: Rocket,
        details: [
          "TÉCNICA 1 - ALTERNATIVA:",
          "'Você prefere começar com o pacote Profissional ou o Premium?'",
          "(Não pergunte SE vai fechar, pergunte QUAL vai escolher)",
          "",
          "TÉCNICA 2 - URGÊNCIA REAL:",
          "'Consigo manter esse valor até sexta-feira porque semana que vem reajusto a tabela.'",
          "",
          "TÉCNICA 3 - ESCASSEZ VERDADEIRA:",
          "'Este mês só consigo pegar mais 2 projetos porque já estou com a agenda cheia.'",
          "",
          "TÉCNICA 4 - REVERSÃO DE RISCO:",
          "'Se em 30 dias você não estiver satisfeito, eu devolvo seu dinheiro.'",
          "",
          "TÉCNICA 5 - PRÓXIMO PASSO:",
          "'Perfeito! Então fazemos assim: você me manda os dados da empresa e eu já começo amanhã. O pagamento pode ser via Pix?'"
        ],
        tips: [
          "Quem controla a conversa, controla a venda. Sempre proponha o próximo passo.",
          "Silêncio após a proposta de fechamento é OURO. Deixe o cliente responder.",
          "Nunca termine uma conversa sem definir QUANDO falam de novo."
        ]
      },
      {
        id: "step5",
        title: "Formalizando com Contrato",
        description: "Contrato protege você E passa profissionalismo. Use sempre.",
        icon: FileText,
        details: [
          "POR QUE USAR CONTRATO:",
          "  → Protege você de calotes e mudanças de escopo",
          "  → Protege o cliente (ele sabe exatamente o que vai receber)",
          "  → Passa PROFISSIONALISMO - diferencia você de amadores",
          "  → Evita discussões futuras - tudo está documentado",
          "",
          "COMO CRIAR O CONTRATO:",
          "1. Acesse a aba 'Contratos' no menu lateral do dashboard",
          "2. Preencha: dados do contratante (você) e contratado (cliente)",
          "3. Defina: escopo detalhado, valores, prazos, forma de pagamento",
          "4. O sistema gera contrato com cláusulas essenciais automaticamente",
          "5. Envie o link para assinatura digital - não precisa imprimir!",
          "6. Após assinado, ambas as partes recebem cópia por email"
        ],
        tips: [
          "NUNCA comece trabalho sem contrato assinado E entrada paga. Nunca. Jamais.",
          "Contrato simples de 2 páginas é melhor que nenhum contrato",
          "Inclua cláusula de 'rodadas de ajuste' para evitar infinitas revisões"
        ],
        warning: "Cliente que resiste a assinar contrato = RED FLAG. Provavelmente vai dar problema. Insista ou desista do cliente."
      },
      {
        id: "step6",
        title: "Recebendo Pagamento",
        description: "Dinheiro na conta = projeto fechado. Antes disso, é só conversa.",
        icon: CreditCard,
        details: [
          "REGRAS DE PAGAMENTO:",
          "",
          "1. SEMPRE cobre entrada antes de começar:",
          "   → Mínimo 50% de entrada",
          "   → Ideal: 100% à vista (ofereça desconto)",
          "   → Aceitável: 50% entrada + 50% na entrega",
          "",
          "2. FORMAS DE PAGAMENTO:",
          "   → Pix (mais rápido, sem taxa) - PRIORIZE",
          "   → Transferência bancária (seguro, sem taxa)",
          "   → Cartão parcelado (taxa você ou cliente absorve)",
          "",
          "3. APÓS RECEBER:",
          "   → Envie comprovante de recebimento",
          "   → Agradeça a confiança",
          "   → Confirme cronograma: 'Em X dias envio primeira versão'",
          "   → Solicite materiais: logo, fotos, textos"
        ],
        tips: [
          "'Pago depois de pronto' = NUNCA ACEITE. Você VAI tomar calote.",
          "Cliente que não paga entrada provavelmente vai dar problema no projeto todo",
          "Ofereça 5-10% de desconto para 100% à vista - vale a paz de espírito"
        ],
        warning: "SEM DINHEIRO NA CONTA = SEM TRABALHO COMEÇADO. Essa regra não tem exceção. Não caia em papo de 'confia em mim'."
      },
      {
        id: "step7",
        title: "Entregando e Fidelizando",
        description: "Entrega excelente = indicações = novos clientes = receita passiva.",
        icon: Star,
        details: [
          "DURANTE O PROJETO:",
          "  → Mantenha comunicação ativa: atualizações a cada 2-3 dias",
          "  → Use o site demo como base e finalize com ajustes solicitados",
          "  → Inclua até 2-3 rodadas de ajustes no preço (defina no contrato)",
          "  → Entregue ANTES do prazo se possível - impressiona o cliente",
          "",
          "NA ENTREGA:",
          "  → Faça uma 'entrega formal' - marque uma call de 15min ou grave vídeo",
          "  → Mostre TUDO funcionando: site, formulários, WhatsApp, agenda",
          "  → Ensine o básico: como editar textos, onde ver estatísticas",
          "  → Entregue um 'manual' simples com principais instruções",
          "",
          "PÓS-ENTREGA (CRÍTICO!):",
          "  → PEÇA AVALIAÇÃO: 'Você poderia deixar uma avaliação no Google sobre nosso trabalho?'",
          "  → PEÇA INDICAÇÃO: 'Conhece alguém que também precisa de um site profissional?'",
          "  → OFEREÇA MANUTENÇÃO: plano mensal de R$97-197 para atualizações"
        ],
        tips: [
          "Cliente satisfeito indica em média 3-5 novos clientes. CULTIVE essa relação!",
          "Avaliação 5 estrelas no Google atrai novos clientes automaticamente",
          "Plano de manutenção = receita recorrente. 10 clientes x R$150/mês = R$1.500 fixo"
        ],
        example: "SCRIPT PÓS-ENTREGA: 'Carlos, que bom que você gostou do resultado! Fico muito feliz. Posso te pedir um favor? Se possível, deixa uma avaliaçãozinha no Google sobre o trabalho - ajuda muito outros empresários a me conhecerem. E se lembrar de alguém que também precisa de presença digital, me indica! Tenho uma condição especial para indicações. Valeu demais!'"
      }
    ]
  }
];

export function HelpCenterTab() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentSection = guideSections.find(s => s.id === selectedSection);
  const currentStep = currentSection?.steps[currentStepIndex];

  const handleNextStep = () => {
    if (currentSection && currentStepIndex < currentSection.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSelectSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentStepIndex(0);
  };

  const handleBack = () => {
    setSelectedSection(null);
    setCurrentStepIndex(0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-xl bg-primary/20 shrink-0">
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Central de Ajuda Completa</h2>
          <p className="text-white/60 text-xs sm:text-sm">
            Guia DETALHADO passo a passo para prospectar, criar projetos e fechar contratos
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedSection ? (
          <motion.div
            key="sections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Important Notice */}
            <Card className="bg-gradient-to-br from-red-500/10 via-orange-500/5 to-amber-500/10 border-red-500/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-red-300 mb-1">⚠️ REGRA DE OURO: Link Demo é OBRIGATÓRIO!</h4>
                    <p className="text-xs text-red-300/80 leading-relaxed">
                      <strong>Propostas SEM link demo = 5% de conversão.</strong> Propostas COM link demo = <strong>35% de conversão</strong>. 
                      Isso é 7x mais eficiente! <strong>SEMPRE</strong> crie o site demo na Biblioteca ANTES de enviar qualquer proposta. 
                      Sem o link do site funcionando, você está literalmente jogando dinheiro fora.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-lg sm:text-xl font-bold text-primary">7x</div>
                <div className="text-[10px] sm:text-xs text-white/60">Mais conversão com demo</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-lg sm:text-xl font-bold text-green-400">35%</div>
                <div className="text-[10px] sm:text-xs text-white/60">Taxa com link demo</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-lg sm:text-xl font-bold text-amber-400">5-7</div>
                <div className="text-[10px] sm:text-xs text-white/60">Follow-ups necessários</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-lg sm:text-xl font-bold text-cyan-400">21x</div>
                <div className="text-[10px] sm:text-xs text-white/60">Mais vendas em 5min</div>
              </div>
            </div>

            {/* Section Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {guideSections.map((section, index) => {
                const Icon = section.icon;
                const isGoldenTips = section.id === 'golden-tips';
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`${isGoldenTips 
                        ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/30 hover:border-amber-400/50' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'} transition-all cursor-pointer group h-full`}
                      onClick={() => handleSelectSection(section.id)}
                    >
                      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-2 sm:p-2.5 rounded-lg ${isGoldenTips ? 'bg-amber-500/20 group-hover:bg-amber-500/30' : 'bg-primary/20 group-hover:bg-primary/30'} transition-colors shrink-0`}>
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isGoldenTips ? 'text-amber-400' : 'text-primary'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className={`text-sm sm:text-base ${isGoldenTips ? 'text-amber-200 group-hover:text-amber-100' : 'text-white group-hover:text-primary'} transition-colors truncate`}>
                              {section.title}
                            </CardTitle>
                          </div>
                          <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isGoldenTips ? 'text-amber-400/40 group-hover:text-amber-300' : 'text-white/40 group-hover:text-primary'} group-hover:translate-x-1 transition-all shrink-0`} />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                        <p className={`text-xs sm:text-sm ${isGoldenTips ? 'text-amber-300/70' : 'text-white/60'} line-clamp-2`}>{section.description}</p>
                        <div className="mt-2 sm:mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className={`${isGoldenTips ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/70'} text-[10px] sm:text-xs`}>
                            {section.steps.length} {isGoldenTips ? 'dicas' : 'passos detalhados'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Workflow Summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2 p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />
                  Resumo do Fluxo Completo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">1</div>
                    <span>Prospectar leads</span>
                  </div>
                  <ArrowRight className="hidden sm:block w-3 h-3 text-white/30" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">2</div>
                    <span>Criar site demo</span>
                  </div>
                  <ArrowRight className="hidden sm:block w-3 h-3 text-white/30" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">3</div>
                    <span>Gerar proposta</span>
                  </div>
                  <ArrowRight className="hidden sm:block w-3 h-3 text-white/30" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">4</div>
                    <span>Incluir link demo</span>
                  </div>
                  <ArrowRight className="hidden sm:block w-3 h-3 text-white/30" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-medium">5</div>
                    <span>Fechar contrato!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="steps"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Back button and section title */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2 sm:px-3"
              >
                <ChevronLeft className="w-4 h-4 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                {currentSection && (
                  <>
                    <currentSection.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span className="text-sm sm:text-base text-white font-medium truncate">{currentSection.title}</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            {currentSection && (
              <div className="flex items-center gap-1 sm:gap-2">
                {currentSection.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`flex-1 h-1 sm:h-1.5 rounded-full transition-all ${
                      index === currentStepIndex 
                        ? 'bg-primary' 
                        : index < currentStepIndex 
                          ? 'bg-primary/50' 
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Current step content */}
            {currentStep && (
              <ScrollArea className="h-[calc(100vh-300px)] sm:h-auto">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-xl bg-primary/20 shrink-0">
                        <currentStep.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-primary/20 text-primary border-0 text-[10px] sm:text-xs">
                            Passo {currentStepIndex + 1} de {currentSection?.steps.length}
                          </Badge>
                        </div>
                        <CardTitle className="text-base sm:text-lg text-white">
                          {currentStep.title}
                        </CardTitle>
                        <p className="text-white/60 mt-1 text-xs sm:text-sm">{currentStep.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6 pt-0 sm:pt-0">
                    {/* Warning if exists */}
                    {currentStep.warning && (
                      <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-sm text-red-300">{currentStep.warning}</p>
                        </div>
                      </div>
                    )}

                    {/* Details list */}
                    <div className="space-y-2 sm:space-y-3">
                      <h4 className="text-xs sm:text-sm font-medium text-white/80 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        O que fazer:
                      </h4>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {currentStep.details.map((detail, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-start gap-2 sm:gap-3 ${detail.startsWith('  →') ? 'ml-4 sm:ml-6' : ''}`}
                          >
                            {!detail.startsWith('  →') && detail.trim() !== '' && (
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                            )}
                            <span className={`text-xs sm:text-sm ${detail.startsWith('  →') ? 'text-white/50' : 'text-white/70'} leading-relaxed whitespace-pre-wrap`}>
                              {detail}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Example if exists */}
                    {currentStep.example && (
                      <div className="p-3 sm:p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-medium text-cyan-300 mb-1">💡 Exemplo Prático:</h5>
                            <p className="text-xs sm:text-sm text-cyan-300/80 leading-relaxed">{currentStep.example}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Script if exists */}
                    {currentStep.script && (
                      <div className="p-3 sm:p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-medium text-purple-300 mb-1">📝 Script/Modelo de Mensagem:</h5>
                            <p className="text-xs sm:text-sm text-purple-300/80 leading-relaxed italic">"{currentStep.script}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tips if exists */}
                    {currentStep.tips && currentStep.tips.length > 0 && currentStep.tips[0] !== "" && (
                      <div className="p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <h5 className="text-xs font-medium text-amber-300 mb-2 flex items-center gap-1.5">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                          Dicas Pro:
                        </h5>
                        <ul className="space-y-1.5">
                          {currentStep.tips.filter(tip => tip !== "").map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-amber-300/80 leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between pt-2 sm:pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevStep}
                        disabled={currentStepIndex === 0}
                        className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 h-8 sm:h-9"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </Button>
                      {currentSection && currentStepIndex < currentSection.steps.length - 1 ? (
                        <Button
                          size="sm"
                          onClick={handleNextStep}
                          className="bg-primary hover:bg-primary/80 text-white h-8 sm:h-9"
                        >
                          Próximo
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleBack}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
