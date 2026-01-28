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
  AlertTriangle
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
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  steps: Step[];
}

const goldenTips = [
  {
    icon: Target,
    title: "Escolha nichos lucrativos",
    tip: "Clínicas de estética, barbearias premium e restaurantes com delivery têm maior ticket médio e conversão. Foque em negócios que faturam acima de R$10k/mês - eles valorizam mais a presença digital."
  },
  {
    icon: Star,
    title: "Mire em empresas 1-3 estrelas",
    tip: "Empresas com avaliações baixas no Google estão desesperadas por ajuda - são leads muito mais quentes! Elas sabem que precisam melhorar e estão abertas a soluções. Mencione as avaliações na abordagem."
  },
  {
    icon: Zap,
    title: "Responda em até 5 minutos",
    tip: "Leads respondidos em menos de 5 minutos têm 21x mais chances de converter. Configure notificações e tenha templates prontos para resposta rápida. Velocidade mata a concorrência!"
  },
  {
    icon: MessageSquare,
    title: "Use áudio no WhatsApp",
    tip: "Mensagens de áudio de 30-60 segundos geram 3x mais respostas que texto puro. Seja pessoal, mencione o nome da empresa e mostre que você pesquisou sobre o negócio deles."
  },
  {
    icon: Link,
    title: "SEMPRE inclua o link demo do site",
    tip: "Propostas com link do site demo têm 5x mais conversão (de 5% para 35%!). O cliente PRECISA visualizar o site funcionando. Crie o demo ANTES de enviar a proposta - essa é a chave do fechamento!"
  },
  {
    icon: Lightbulb,
    title: "Crie urgência real e escassez",
    tip: "Ofereça desconto por tempo limitado (48h máximo) ou mencione que você só atende X clientes por mês. A escassez acelera a tomada de decisão. Nunca deixe o lead 'pensar' por muito tempo."
  },
  {
    icon: UserCheck,
    title: "Faça follow-up estratégico",
    tip: "80% das vendas acontecem após o 5º contato! Programe lembretes: 24h, 3 dias, 7 dias. Varie a abordagem: texto, áudio, imagem do site. Persistência educada = conversão."
  },
  {
    icon: Handshake,
    title: "Feche no WhatsApp, não espere reunião",
    tip: "Quanto mais etapas no processo, mais chance de perder o cliente. Envie proposta simplificada por WhatsApp, aceite pagamento via Pix na hora. Facilite ao máximo para o cliente dizer SIM."
  }
];

const guideSections: GuideSection[] = [
  {
    id: "golden-tips",
    title: "Dicas de Ouro",
    description: "Estratégias comprovadas para maximizar suas conversões",
    icon: Lightbulb,
    steps: goldenTips.map((tip, index) => ({
      id: `tip-${index}`,
      title: tip.title,
      description: tip.tip,
      icon: tip.icon,
      details: [tip.tip],
      tips: []
    }))
  },
  {
    id: "prospecting",
    title: "Prospecção de Clientes",
    description: "Como encontrar empresas que precisam de presença digital",
    icon: Search,
    steps: [
      {
        id: "step1",
        title: "Acessar a Ferramenta de Prospecção",
        description: "O primeiro passo é acessar a ferramenta 'Encontrar Clientes' no menu principal.",
        icon: Search,
        details: [
          "Clique no card 'Encontrar Clientes' na tela inicial do dashboard",
          "Você será direcionado para a ferramenta de busca inteligente que utiliza IA",
          "A busca encontra empresas que NÃO têm presença digital adequada",
          "Essas são empresas com sites desatualizados, sem site, ou com baixa avaliação",
          "Cada empresa encontrada é um potencial cliente para seus serviços"
        ],
        tips: [
          "Defina seu nicho de atuação antes de começar - especialização vende mais",
          "Comece buscando em cidades menores - menos concorrência e donos mais acessíveis",
          "Nichos de saúde, beleza e alimentação costumam ter maior ticket médio"
        ]
      },
      {
        id: "step2",
        title: "Configurar os Filtros de Busca",
        description: "Configure os filtros para encontrar leads realmente qualificados que têm potencial de compra.",
        icon: Target,
        details: [
          "NICHO: Escolha o segmento (clínicas, restaurantes, academias, salões, etc)",
          "LOCALIZAÇÃO: Selecione cidade e estado - comece pela sua região",
          "QUANTIDADE: Defina quantos resultados deseja (10-50 é ideal para começar)",
          "AVALIAÇÃO: Filtre por estrelas no Google - 1-3 estrelas são leads mais quentes",
          "Use a combinação certa: nicho lucrativo + cidade pequena + baixa avaliação = OURO"
        ],
        tips: [
          "Empresas com 1-3 estrelas estão desesperadas por ajuda - taxa de conversão 3x maior",
          "Cidades com 50-200 mil habitantes têm menos concorrência e donos mais acessíveis",
          "Nichos premium (clínicas, advocacia, arquitetura) pagam tickets maiores"
        ]
      },
      {
        id: "step3",
        title: "Analisar Cada Empresa",
        description: "Antes de salvar, analise cada empresa para garantir que é um lead qualificado.",
        icon: ClipboardCheck,
        details: [
          "SITE ATUAL: Verifique se tem site - se não tem, é lead quente. Se tem site ruim, também é oportunidade",
          "REDES SOCIAIS: Veja Instagram/Facebook - perfis abandonados indicam oportunidade",
          "AVALIAÇÕES: Leia os comentários negativos - são dores que você pode resolver",
          "CONTATO: Confirme se tem WhatsApp disponível - facilita muito a abordagem",
          "HORÁRIO: Empresas que funcionam em horário comercial são mais fáceis de contatar",
          "Clique em 'Ver Detalhes' para acessar informações completas da empresa"
        ],
        tips: [
          "Anote as dores específicas mencionadas nas avaliações - use na proposta",
          "Empresas sem resposta aos comentários negativos = donos sobrecarregados = oportunidade",
          "Verifique a concorrência local - se tem competitor com bom site, mostre a diferença"
        ]
      },
      {
        id: "step4",
        title: "Salvar e Organizar os Leads",
        description: "Salve os melhores prospects para trabalhar de forma organizada.",
        icon: CheckCircle2,
        details: [
          "Clique no botão 'Salvar' no card de cada empresa qualificada",
          "O lead será adicionado à sua lista de prospects automaticamente",
          "Adicione NOTAS com informações importantes (dores, oportunidades identificadas)",
          "Use TAGS para organizar por prioridade (quente, morno, frio)",
          "Acesse seus leads salvos na aba 'Propostas' para dar continuidade",
          "Organize sua prospecção: salve 20-30 leads por dia, trabalhe 5-10 por dia"
        ],
        tips: [
          "Qualidade > quantidade: melhor ter 10 leads qualificados que 100 aleatórios",
          "Leads 'quentes' devem ser contatados em até 24h para não esfriar",
          "Mantenha uma rotina: 1h de prospecção pela manhã = 20+ leads/dia"
        ]
      }
    ]
  },
  {
    id: "radar",
    title: "Radar Global",
    description: "Busca automática de leads em escala nacional",
    icon: Radar,
    steps: [
      {
        id: "step1",
        title: "Entender o Poder do Radar",
        description: "O Radar Global é sua máquina de geração de leads automática que trabalha 24/7.",
        icon: Globe,
        details: [
          "O Radar varre MÚLTIPLAS cidades simultaneamente buscando oportunidades",
          "Encontra empresas sem presença digital de forma totalmente automática",
          "Usa algoritmos de IA para priorizar leads com maior potencial de conversão",
          "Atualiza constantemente com novos resultados frescos todos os dias",
          "Cada lead já vem com score de qualidade calculado automaticamente",
          "Você foca no contato, o Radar foca na busca - produtividade máxima!"
        ],
        tips: [
          "Configure o Radar uma vez e deixe rodando - ele trabalha enquanto você vende",
          "Leads do Radar já vêm pré-qualificados pela IA"
        ]
      },
      {
        id: "step2",
        title: "Aceitar os Melhores Leads",
        description: "Revise e aceite os leads mais promissores encontrados pelo Radar.",
        icon: UserCheck,
        details: [
          "Acesse a aba 'Radar Global' no menu lateral esquerdo",
          "Revise os leads apresentados - cada um tem um SCORE de qualidade (0-100)",
          "SCORE 80-100: Lead quente, prioridade máxima - contatar imediatamente",
          "SCORE 60-79: Lead bom, vale a pena abordar na sequência",
          "SCORE abaixo de 60: Analise caso a caso antes de aceitar",
          "Clique em 'Aceitar' para adicionar o lead à sua lista de trabalho",
          "Leads aceitos vão automaticamente para a aba 'Propostas'"
        ],
        tips: [
          "Aceite leads com score acima de 70 para melhor taxa de conversão",
          "Processe os leads diariamente - leads frescos convertem mais",
          "O Radar aprende com suas aceitações e melhora as sugestões"
        ]
      }
    ]
  },
  {
    id: "library",
    title: "Biblioteca de Projetos",
    description: "Crie projetos do zero ou use modelos prontos para cada cliente",
    icon: Library,
    steps: [
      {
        id: "step1",
        title: "Acessar a Biblioteca de Projetos",
        description: "A Biblioteca é onde você cria os sites demo que vão impressionar seus clientes.",
        icon: Library,
        details: [
          "Clique em 'Biblioteca' no menu lateral esquerdo",
          "Você verá duas opções principais: 'Começar do Zero' e 'Modelos Prontos'",
          "'Começar do Zero': wizard guiado com 11 etapas para projeto 100% personalizado",
          "'Modelos Prontos': templates já otimizados por nicho, prontos para usar",
          "Cada projeto salvo fica acessível em 'Meus Projetos' para reutilização"
        ],
        tips: [
          "Use 'Começar do Zero' para clientes premium que pagam mais",
          "Use 'Modelos Prontos' para volume e velocidade"
        ]
      },
      {
        id: "step2",
        title: "Wizard 'Começar do Zero' - Etapas 1-4",
        description: "Configure as bases do projeto seguindo cada etapa do wizard.",
        icon: Sparkles,
        details: [
          "ETAPA 1 - TIPO: Escolha Site Comercial ou Aplicativo Web",
          "ETAPA 2 - NICHO: Selecione o segmento (barbearia, clínica, restaurante, etc)",
          "ETAPA 3 - INFORMAÇÕES: Nome da empresa, descrição do negócio",
          "ETAPA 4 - IDENTIDADE: Cores da marca, estilo visual desejado",
          "O sistema usa essas informações para gerar um prompt altamente personalizado",
          "Cada campo preenchido melhora a qualidade final do site gerado"
        ],
        tips: [
          "Se não souber as cores, pesquise no Instagram/Facebook do cliente",
          "Descreva o negócio em detalhes - quanto mais, melhor o resultado"
        ]
      },
      {
        id: "step3",
        title: "Wizard 'Começar do Zero' - Etapas 5-8",
        description: "Defina funcionalidades e objetivos do projeto.",
        icon: Target,
        details: [
          "ETAPA 5 - OBJETIVOS: O que o site precisa alcançar? (vendas, agendamentos, contato)",
          "ETAPA 6 - PÁGINAS: Quais páginas o site terá (home, sobre, serviços, contato)",
          "ETAPA 7 - FUNCIONALIDADES: Formulário de contato, WhatsApp, agendamento online",
          "ETAPA 8 - DIFERENCIAIS: O que destaca esse negócio dos concorrentes",
          "Marque todas as funcionalidades relevantes para o nicho do cliente",
          "O wizard injeta lógica de backend específica para cada funcionalidade"
        ],
        tips: [
          "Barbearias precisam de agendamento, restaurantes de cardápio com delivery",
          "Sempre inclua botão de WhatsApp - é o que mais converte no Brasil"
        ]
      },
      {
        id: "step4",
        title: "Wizard 'Começar do Zero' - Etapas 9-11 e Geração",
        description: "Finalize o wizard e gere o prompt otimizado.",
        icon: FileText,
        details: [
          "ETAPA 9 - CONTEÚDO: Textos, slogans, informações específicas",
          "ETAPA 10 - REFERÊNCIAS: Links de sites que o cliente gosta (opcional)",
          "ETAPA 11 - REVISÃO: Confira tudo antes de gerar",
          "Clique em 'Gerar Prompt' para criar o comando otimizado para a IA",
          "O prompt gerado inclui TODAS as especificações que você preencheu",
          "Salve o projeto para acessar depois em 'Meus Projetos'"
        ],
        tips: [
          "Revise cuidadosamente antes de gerar - erros aqui viram erros no site",
          "Projetos salvos podem ser editados e reutilizados"
        ]
      },
      {
        id: "step5",
        title: "Criar na Lovable com Link de Convite",
        description: "Use o botão 'Criar na Lovable' para abrir com 10 créditos grátis!",
        icon: Rocket,
        details: [
          "Após gerar o prompt, clique no botão 'Criar na Lovable'",
          "O sistema abre a Lovable automaticamente com nosso LINK DE CONVITE ESPECIAL",
          "Ao criar conta pelo link, você ganha 10 CRÉDITOS GRÁTIS adicionais!",
          "O prompt é copiado automaticamente para você colar no chat",
          "Aguarde a IA gerar o site completo (geralmente 2-5 minutos)",
          "A Lovable cria sites profissionais com código limpo e responsivo"
        ],
        tips: [
          "Cada crédito = 1 solicitação. Use com sabedoria!",
          "Peça ajustes no chat se precisar: 'mude a cor do botão para azul'"
        ],
        warning: "IMPORTANTE: Use sempre o botão da plataforma para abrir a Lovable. Assim você ganha os créditos grátis!"
      },
      {
        id: "step6",
        title: "Publicar e Copiar Link Demo",
        description: "Publique o site e obtenha o link para enviar ao cliente.",
        icon: Link,
        details: [
          "Quando o site estiver pronto na Lovable, clique em 'Publish' no canto superior direito",
          "Aguarde a publicação ser concluída (geralmente 1-2 minutos)",
          "A Lovable gera um link como: nomedaempresa.lovable.app",
          "COPIE ESSE LINK - você vai precisar dele para a proposta!",
          "O link funciona em qualquer dispositivo - móvel e desktop",
          "O cliente verá exatamente como o site dele vai ficar"
        ],
        warning: "ESTE LINK É OBRIGATÓRIO na proposta! Sem ele, conversão cai de 35% para apenas 5%."
      }
    ]
  },
  {
    id: "proposals",
    title: "Propostas Personalizadas",
    description: "Gere propostas comerciais persuasivas com IA para cada cliente",
    icon: MessageSquare,
    steps: [
      {
        id: "step1",
        title: "Acessar a Ferramenta de Propostas",
        description: "Acesse o gerador de propostas para criar abordagens personalizadas.",
        icon: FileText,
        details: [
          "Clique em 'Propostas Personalizadas' na tela inicial do dashboard",
          "Você verá o wizard de criação de propostas comerciais",
          "As propostas são geradas por IA com base nos dados que você fornecer",
          "Cada proposta é única e focada nas dores específicas do cliente",
          "Propostas salvas ficam em 'Minhas Propostas' para reutilização"
        ],
        tips: [
          "Crie o site demo ANTES de gerar a proposta",
          "Tenha em mãos: nome da empresa, problemas identificados, contato"
        ]
      },
      {
        id: "step2",
        title: "Selecionar Nicho e Preencher Dados do Cliente",
        description: "Informe detalhes do cliente para a IA gerar proposta relevante.",
        icon: Building2,
        details: [
          "NICHO: Selecione o segmento exato (clínica odontológica, barbearia, etc)",
          "NOME DA EMPRESA: Digite o nome correto para personalizar a mensagem",
          "CONTATO: WhatsApp e/ou email para follow-up",
          "PROBLEMAS: Liste as dores que você identificou (site ruim, sem redes, etc)",
          "OBJETIVOS: O que o cliente quer alcançar (mais clientes, automatizar agendamento)",
          "PERGUNTAS: Responda às perguntas de qualificação do wizard"
        ],
        tips: [
          "Quanto mais detalhes, mais persuasiva fica a proposta",
          "Use informações das avaliações negativas do Google para identificar dores"
        ]
      },
      {
        id: "step3",
        title: "Escolher Tom e Gerar com IA",
        description: "Selecione o estilo de comunicação e deixe a IA trabalhar.",
        icon: Sparkles,
        details: [
          "TOM AGRESSIVO: Para leads frios que nunca ouviram de você. Foca na dor.",
          "TOM PERSUASIVO: Para leads mornos que já demonstraram interesse",
          "TOM DOR: Enfatiza os problemas atuais e o custo de não agir",
          "Clique em 'Gerar Proposta' e aguarde a IA processar",
          "A proposta inclui: gancho inicial, identificação de dores, solução, benefícios e CTA",
          "Revise a proposta gerada e faça ajustes manuais se necessário"
        ],
        tips: [
          "Tom agressivo funciona melhor para primeiro contato frio",
          "Se o lead já respondeu antes, use tom persuasivo"
        ]
      },
      {
        id: "step4",
        title: "OBRIGATÓRIO: Incluir Link do Site Demo",
        description: "Adicione o link do site que você criou - isso é FUNDAMENTAL!",
        icon: Link,
        details: [
          "PARE AQUI SE NÃO TEM O LINK! Volte e crie o site demo primeiro.",
          "Cole o link do site demo (ex: empresa.lovable.app) na proposta",
          "Adicione uma frase como: 'Já criei um protótipo do seu site, veja funcionando: [link]'",
          "O cliente precisa VISUALIZAR o site para entender o valor",
          "Sites demo impressionam porque mostram resultado ANTES do pagamento",
          "Essa técnica diferencia você de 99% da concorrência que só promete"
        ],
        warning: "DADOS REAIS: Propostas SEM link demo = 5% de conversão. COM link demo = 35% de conversão. É 7x mais eficiente!"
      },
      {
        id: "step5",
        title: "Enviar pelo WhatsApp no Momento Certo",
        description: "Timing e formato corretos maximizam a taxa de resposta.",
        icon: Send,
        details: [
          "Clique em 'Copiar Proposta' para copiar o texto formatado",
          "Ou clique em 'Enviar WhatsApp' para abrir direto no WhatsApp",
          "HORÁRIOS IDEAIS: 9h-11h e 14h-17h (horário comercial)",
          "DIAS IDEAIS: Segunda, terça e quarta têm maiores taxas de resposta",
          "Evite finais de semana e feriados - donos estão ocupados operando",
          "Envie primeiro uma mensagem de texto, depois áudio de 30-60 segundos"
        ],
        tips: [
          "Áudio personalizado após o texto aumenta resposta em 3x",
          "Se não responder em 24h, envie follow-up educado"
        ]
      }
    ]
  },
  {
    id: "closing",
    title: "Fechando o Contrato",
    description: "Converta leads em clientes pagantes com técnicas comprovadas",
    icon: Handshake,
    steps: [
      {
        id: "step1",
        title: "Primeira Abordagem com Impacto",
        description: "O primeiro contato precisa ser profissional e direto.",
        icon: MessageSquare,
        details: [
          "ESTRUTURA DA MENSAGEM: Gancho + Dor + Solução + Link Demo + CTA",
          "GANCHO: 'Olá [nome], vi sua empresa no Google e notei algo importante...'",
          "DOR: 'Vi que vocês não têm site/têm site desatualizado/avaliações baixas'",
          "SOLUÇÃO: 'Ajudo empresas como a sua a ter presença digital profissional'",
          "LINK: 'Inclusive já fiz um protótipo para vocês, veja: [link demo]'",
          "CTA: 'Podemos conversar 5 minutos sobre isso? Qual melhor horário?'"
        ],
        tips: [
          "Mensagem curta + link demo = melhor resultado",
          "Personalize com o NOME da empresa - mostra que pesquisou"
        ]
      },
      {
        id: "step2",
        title: "Lidar com Objeções Comuns",
        description: "Respostas prontas para as principais objeções que você vai ouvir.",
        icon: Target,
        details: [
          "'Não tenho dinheiro': 'Entendo! Por isso facilito: você pode parcelar em X vezes'",
          "'Deixa pra depois': 'Quanto tempo faz que está pensando nisso? Cada dia sem site são clientes perdendo...'",
          "'Já tenho um sobrinho': 'Ótimo! Só uma pergunta: o site está gerando clientes? Posso mostrar a diferença'",
          "'Vou pensar': 'Claro! O que exatamente precisa pensar? Talvez eu possa esclarecer agora'",
          "'Está caro': 'Quanto você acha que perde por mês sem uma presença digital adequada?'",
          "Sempre redirecione para o VALOR, não para o preço"
        ],
        tips: [
          "Nunca descarte uma objeção - é uma oportunidade de educar",
          "Use perguntas para entender a real preocupação por trás"
        ]
      },
      {
        id: "step3",
        title: "Apresentar Pacotes e Preços",
        description: "Estruture sua oferta com opções para diferentes perfis.",
        icon: Rocket,
        details: [
          "PACOTE BÁSICO: Site simples + WhatsApp + formulário. Preço de entrada.",
          "PACOTE INTERMEDIÁRIO: Site + funcionalidades do nicho + 3 meses suporte",
          "PACOTE PREMIUM: Tudo + domínio + email profissional + 6 meses suporte",
          "Sempre apresente 3 opções - maioria escolhe o do meio",
          "Destaque o pacote intermediário como 'mais popular'",
          "Inclua BÔNUS em vez de dar desconto (ex: criação de logo grátis)"
        ],
        tips: [
          "Precifique o básico pelo que o mercado paga, não pelo seu medo",
          "Pacote premium existe para fazer o intermediário parecer bom negócio"
        ]
      },
      {
        id: "step4",
        title: "Formalizar com Contrato Digital",
        description: "Proteja você e o cliente com documentação adequada.",
        icon: FileText,
        details: [
          "Acesse a aba 'Contratos' no menu lateral do dashboard",
          "Preencha os dados: contratante, contratado, escopo, valores, prazos",
          "O sistema gera contrato com cláusulas essenciais automaticamente",
          "Envie para assinatura digital via link - não precisa imprimir",
          "O contrato define: o que será entregue, quando, quanto custa, o que acontece se atrasar",
          "Guarde o contrato assinado em local seguro para referência"
        ],
        tips: [
          "NUNCA comece sem contrato assinado - protege ambas as partes",
          "Contrato também passa profissionalismo e gera confiança"
        ]
      },
      {
        id: "step5",
        title: "Receber Pagamento e Iniciar",
        description: "Finalize a venda e comece o projeto com o pé direito.",
        icon: CheckCircle2,
        details: [
          "Solicite pelo menos 50% de entrada antes de começar",
          "FORMAS DE PAGAMENTO: Pix (mais usado), transferência, cartão parcelado",
          "Envie comprovante de recebimento e agradeça a confiança",
          "Defina cronograma: 'Em X dias envio a primeira versão para aprovação'",
          "Solicite materiais do cliente: logo, fotos, textos, informações",
          "Mantenha comunicação ativa: atualizações a cada 2-3 dias"
        ],
        tips: [
          "Nunca aceite 'pago depois de pronto' - isso dá errado",
          "Cliente que não paga entrada provavelmente vai dar problema"
        ]
      },
      {
        id: "step6",
        title: "Entregar e Fidelizar",
        description: "Uma boa entrega gera indicações e recorrência.",
        icon: Star,
        details: [
          "Use o site demo como base e finalize com ajustes solicitados",
          "Adicione o conteúdo real do cliente (fotos, textos, preços)",
          "Faça até 2 rodadas de ajustes incluídas no preço",
          "Configure domínio personalizado se contratado (domínio.com.br)",
          "Ensine o básico ao cliente: como editar, onde ver estatísticas",
          "PEÇA AVALIAÇÃO: 'Poderia deixar uma avaliação no Google sobre nosso trabalho?'"
        ],
        tips: [
          "Cliente satisfeito indica 3-5 novos clientes em média",
          "Ofereça plano de manutenção mensal para receita recorrente"
        ]
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
          <h2 className="text-lg sm:text-xl font-semibold text-white">Central de Ajuda</h2>
          <p className="text-white/60 text-xs sm:text-sm">
            Guia completo para prospectar, criar projetos e fechar contratos
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
                    <h4 className="text-sm font-medium text-red-300 mb-1">⚠️ CRÍTICO: Link Demo é Obrigatório!</h4>
                    <p className="text-xs text-red-300/80 leading-relaxed">
                      Para enviar propostas com alta conversão, você <strong>PRECISA</strong> criar o site demo na Lovable primeiro e incluir o link na mensagem. 
                      Propostas sem link demo têm apenas 5% de conversão. Com o link, a conversão sobe para <strong>35%</strong>! 
                      Vá em Biblioteca → Criar Projeto → Lovable para criar o site demo antes de enviar qualquer proposta.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                            {section.steps.length} {isGoldenTips ? 'dicas' : 'passos'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
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
                    <h4 className="text-xs sm:text-sm font-medium text-white/80">O que fazer:</h4>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {currentStep.details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 sm:gap-3 text-white/70"
                        >
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  {currentStep.tips && currentStep.tips.length > 0 && (
                    <div className="p-3 sm:p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <h4 className="text-xs sm:text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        Dicas Pro
                      </h4>
                      <ul className="space-y-1">
                        {currentStep.tips.map((tip, index) => (
                          <li key={index} className="text-xs sm:text-sm text-cyan-300/80 flex items-start gap-2">
                            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 mt-1" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                      className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                      Anterior
                    </Button>
                    
                    {currentSection && currentStepIndex < currentSection.steps.length - 1 ? (
                      <Button
                        onClick={handleNextStep}
                        className="bg-primary hover:bg-primary/90 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                      >
                        Próximo
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBack}
                        className="bg-cyan-600 hover:bg-cyan-700 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                      >
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                        Concluído
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Steps overview on mobile */}
            {currentSection && (
              <Card className="bg-white/5 border-white/10 sm:hidden">
                <CardHeader className="pb-2 p-3">
                  <CardTitle className="text-xs text-white/80">Todos os passos</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <ScrollArea className="h-auto">
                    <div className="space-y-1.5">
                      {currentSection.steps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                          <button
                            key={step.id}
                            onClick={() => setCurrentStepIndex(index)}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                              index === currentStepIndex 
                                ? 'bg-primary/20 text-foreground' 
                                : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'
                            }`}
                          >
                            <div className={`p-1 rounded-md ${
                              index === currentStepIndex ? 'bg-primary/30' : 'bg-muted/20'
                            }`}>
                              <StepIcon className="w-3 h-3" />
                            </div>
                            <span className="text-xs truncate">{step.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
