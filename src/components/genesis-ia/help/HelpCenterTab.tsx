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
    tip: "Clínicas de estética, barbearias premium e restaurantes com delivery têm maior ticket médio e conversão."
  },
  {
    icon: Star,
    title: "Mire em 1-3 estrelas",
    tip: "Empresas com avaliações baixas estão desesperadas por ajuda - são leads muito mais quentes!"
  },
  {
    icon: Zap,
    title: "Responda em até 5 minutos",
    tip: "Leads respondidos em menos de 5 minutos têm 21x mais chances de converter."
  },
  {
    icon: MessageSquare,
    title: "Use áudio no WhatsApp",
    tip: "Mensagens de áudio de 30-60s geram 3x mais respostas que texto."
  },
  {
    icon: Link,
    title: "SEMPRE inclua o link demo",
    tip: "Propostas com link do site demo têm 5x mais conversão. O cliente PRECISA ver na prática!"
  },
  {
    icon: Lightbulb,
    title: "Crie urgência real",
    tip: "Ofereça desconto por tempo limitado (48h) ou vagas limitadas para acelerar a decisão."
  }
];

const guideSections: GuideSection[] = [
  {
    id: "prospecting",
    title: "Prospecção de Clientes",
    description: "Como encontrar empresas que precisam de presença digital",
    icon: Search,
    steps: [
      {
        id: "step1",
        title: "Acessar 'Encontrar Clientes'",
        description: "No menu principal, clique em 'Encontrar Clientes' para iniciar sua busca.",
        icon: Search,
        details: [
          "Clique no card 'Encontrar Clientes' na tela inicial",
          "Você será direcionado para a ferramenta de busca inteligente",
          "A busca utiliza IA para encontrar empresas sem presença digital"
        ],
        tips: [
          "Defina seu nicho antes de começar",
          "Busque por cidades menores primeiro - menos concorrência"
        ]
      },
      {
        id: "step2",
        title: "Definir Critérios de Busca",
        description: "Configure os filtros para encontrar leads qualificados.",
        icon: Target,
        details: [
          "Escolha o nicho de atuação (ex: clínicas, restaurantes, academias)",
          "Selecione a cidade e estado",
          "Defina a quantidade de resultados desejados",
          "Use filtros de avaliação (estrelas) para qualidade"
        ],
        tips: [
          "Empresas com 1-3 estrelas são mais propensas a precisar de ajuda",
          "Nichos de saúde e beleza costumam converter bem"
        ]
      },
      {
        id: "step3",
        title: "Analisar Resultados",
        description: "Avalie cada empresa encontrada antes de salvar.",
        icon: ClipboardCheck,
        details: [
          "Verifique se a empresa tem site ou redes sociais",
          "Analise as avaliações e comentários no Google",
          "Observe horário de funcionamento e telefone disponível",
          "Clique em 'Ver Detalhes' para mais informações"
        ],
        tips: [
          "Empresas sem site são leads mais quentes",
          "WhatsApp disponível facilita o contato inicial"
        ]
      },
      {
        id: "step4",
        title: "Salvar Leads Qualificados",
        description: "Salve os melhores prospects para trabalhar depois.",
        icon: CheckCircle2,
        details: [
          "Clique no botão 'Salvar' no card da empresa",
          "O lead será adicionado à sua lista de prospects",
          "Você pode adicionar notas e tags para organização",
          "Acesse seus leads salvos na aba 'Propostas Aceitas'"
        ]
      }
    ]
  },
  {
    id: "radar",
    title: "Radar Global",
    description: "Busca automática de leads em escala",
    icon: Radar,
    steps: [
      {
        id: "step1",
        title: "Entender o Radar",
        description: "O Radar Global busca leads automaticamente em diversas cidades.",
        icon: Globe,
        details: [
          "O Radar varre múltiplas cidades simultaneamente",
          "Encontra empresas sem presença digital de forma automática",
          "Prioriza leads com maior potencial de conversão",
          "Atualiza constantemente com novos resultados"
        ]
      },
      {
        id: "step2",
        title: "Aceitar Leads do Radar",
        description: "Revise e aceite os melhores leads encontrados.",
        icon: UserCheck,
        details: [
          "Acesse a aba 'Radar Global' no menu",
          "Revise os leads apresentados com score de qualidade",
          "Clique em 'Aceitar' para adicionar à sua lista",
          "Leads aceitos vão para 'Propostas Aceitas'"
        ],
        tips: [
          "Aceite leads com score acima de 70 para melhor conversão"
        ]
      }
    ]
  },
  {
    id: "library",
    title: "Biblioteca de Projetos",
    description: "Crie projetos do zero ou use modelos prontos",
    icon: Library,
    steps: [
      {
        id: "step1",
        title: "Acessar a Biblioteca",
        description: "Acesse a biblioteca de templates e ferramentas.",
        icon: Library,
        details: [
          "Clique em 'Biblioteca' no menu lateral",
          "Você verá opções de criação e modelos prontos",
          "Escolha entre 'Começar do Zero' ou 'Modelos Prontos'"
        ]
      },
      {
        id: "step2",
        title: "Começar do Zero",
        description: "Crie um projeto totalmente personalizado.",
        icon: Sparkles,
        details: [
          "Selecione 'Começar do Zero'",
          "Escolha o tipo de projeto (Landing Page, Sistema, etc)",
          "Selecione o nicho da empresa cliente",
          "Preencha informações sobre a identidade visual",
          "Defina objetivos, páginas e funcionalidades",
          "O sistema gerará um prompt otimizado para IA"
        ],
        tips: [
          "Quanto mais detalhes fornecer, melhor será o resultado",
          "Use as cores da marca do cliente quando possível"
        ]
      },
      {
        id: "step3",
        title: "Usar Modelo Pronto",
        description: "Escolha um template já otimizado.",
        icon: FileText,
        details: [
          "Navegue pelos modelos disponíveis por categoria",
          "Cada modelo já vem otimizado para o nicho",
          "Clique para visualizar preview do modelo",
          "Personalize com as informações do cliente"
        ]
      },
      {
        id: "step4",
        title: "Gerar e Usar na Lovable",
        description: "Use o prompt gerado na plataforma Lovable.",
        icon: Rocket,
        details: [
          "Revise o prompt final gerado pelo sistema",
          "Clique em 'Copiar Prompt' para copiar",
          "Clique em 'Ir para Lovable' - use nosso link especial para ganhar 10 créditos!",
          "Cole o prompt no Lovable e aguarde a mágica acontecer",
          "O site será gerado automaticamente pela IA"
        ],
        tips: [
          "Ao criar conta na Lovable pelo nosso link, você ganha 10 créditos grátis!",
          "Salve prompts que funcionaram bem para reutilizar"
        ]
      },
      {
        id: "step5",
        title: "Publicar e Obter Link Demo",
        description: "Publique o site e copie o link para usar na proposta.",
        icon: Link,
        details: [
          "Após o site ficar pronto no Lovable, clique em 'Publicar'",
          "Aguarde a publicação ser concluída",
          "Copie o link do site publicado (ex: suaempresa.lovable.app)",
          "ESTE LINK É ESSENCIAL para enviar na proposta ao cliente!",
          "O cliente precisa VER o site funcionando para fechar negócio"
        ],
        warning: "SEM o link demo, sua proposta terá conversão muito baixa. O cliente precisa visualizar o site!"
      }
    ]
  },
  {
    id: "proposals",
    title: "Propostas Personalizadas",
    description: "Gere propostas de venda para cada cliente",
    icon: MessageSquare,
    steps: [
      {
        id: "step1",
        title: "Acessar Propostas",
        description: "Acesse a ferramenta de geração de propostas.",
        icon: FileText,
        details: [
          "Clique em 'Propostas Personalizadas' na tela inicial",
          "Escolha entre criar nova ou ver propostas salvas",
          "Para nova proposta, clique em 'Criar Proposta'"
        ]
      },
      {
        id: "step2",
        title: "Selecionar Nicho e Preencher Dados",
        description: "Escolha o nicho e preencha informações do cliente.",
        icon: Building2,
        details: [
          "Selecione o nicho da empresa (clínica, restaurante, etc)",
          "Preencha o nome da empresa e contato",
          "Informe os principais problemas que a empresa tem",
          "Descreva o que o cliente deseja alcançar",
          "Responda às perguntas de qualificação"
        ],
        tips: [
          "Quanto mais detalhes, melhor a proposta gerada",
          "Mencione dores específicas do cliente"
        ]
      },
      {
        id: "step3",
        title: "Gerar Proposta com IA",
        description: "IA gera uma proposta comercial completa.",
        icon: Sparkles,
        details: [
          "Com base nas respostas, a IA gera uma proposta personalizada",
          "A proposta inclui: dores identificadas, solução, benefícios e ROI",
          "Você pode escolher o tom (agressivo, persuasivo, dor)",
          "Revise a proposta e ajuste se necessário"
        ],
        tips: [
          "Use tom agressivo para leads frios",
          "Tom persuasivo funciona melhor para leads quentes"
        ]
      },
      {
        id: "step4",
        title: "Incluir Link do Site Demo",
        description: "FUNDAMENTAL: adicione o link do site que você criou.",
        icon: Link,
        details: [
          "ANTES de enviar, inclua o link do site demo criado na Lovable",
          "Cole o link (ex: empresa.lovable.app) na mensagem",
          "Escreva algo como: 'Já criei um protótipo do seu site, veja: [link]'",
          "O cliente PRECISA ver o site funcionando para decidir"
        ],
        warning: "Propostas SEM link demo têm conversão de apenas 5%. COM link, sobe para 35%!"
      },
      {
        id: "step5",
        title: "Enviar para o Cliente",
        description: "Copie e envie a proposta via WhatsApp.",
        icon: Send,
        details: [
          "Clique em 'Copiar Proposta' ou 'Enviar WhatsApp'",
          "Personalize a mensagem com o nome do cliente",
          "Inclua o link do site demo que você criou",
          "Envie e acompanhe a resposta"
        ],
        tips: [
          "Envie em horário comercial (9h-18h)",
          "Segunda e terça têm melhor taxa de resposta"
        ]
      }
    ]
  },
  {
    id: "closing",
    title: "Fechando o Contrato",
    description: "Como converter leads em clientes pagantes",
    icon: Handshake,
    steps: [
      {
        id: "step1",
        title: "Primeiro Contato",
        description: "Faça uma abordagem profissional com site demo.",
        icon: MessageSquare,
        details: [
          "Use a proposta gerada + link do site demo",
          "Personalize a mensagem com o nome da empresa",
          "Seja direto: 'Vi que sua empresa precisa de presença digital'",
          "Mostre o site: 'Já fiz um protótipo, veja: [link]'",
          "Ofereça uma conversa rápida de 5 minutos"
        ],
        tips: [
          "Envie nos horários comerciais",
          "Segunda e terça costumam ter melhor resposta",
          "Mensagem curta + link demo = melhor conversão"
        ]
      },
      {
        id: "step2",
        title: "Apresentar Solução",
        description: "Mostre como você pode ajudar com evidências.",
        icon: Rocket,
        details: [
          "Explique o problema que identificou",
          "Mostre o site demo que você criou",
          "Apresente sua solução de forma simples",
          "Use dados e números quando possível"
        ],
        tips: [
          "Foque nos benefícios, não nas features",
          "'Você vai ter mais clientes' > 'Site responsivo'"
        ]
      },
      {
        id: "step3",
        title: "Negociar Valores",
        description: "Defina preços e condições.",
        icon: Target,
        details: [
          "Tenha uma tabela de preços base definida",
          "Ofereça opções (básico, intermediário, completo)",
          "Facilite o pagamento (pix, parcelado, etc)",
          "Deixe claro o que está incluído"
        ],
        tips: [
          "Nunca dê desconto de primeira",
          "Inclua bônus em vez de baixar preço"
        ]
      },
      {
        id: "step4",
        title: "Formalizar Contrato",
        description: "Documente tudo para segurança.",
        icon: FileText,
        details: [
          "Acesse a aba 'Contratos' no menu",
          "Crie um novo contrato com os dados do cliente",
          "Defina escopo, prazos e valores",
          "Envie para assinatura digital"
        ],
        tips: [
          "Sempre formalize por escrito",
          "Contrato protege você e o cliente"
        ]
      },
      {
        id: "step5",
        title: "Iniciar Projeto",
        description: "Finalize o site e entregue valor.",
        icon: Rocket,
        details: [
          "Use o site demo como base e finalize com ajustes",
          "Adicione conteúdo real do cliente (fotos, textos)",
          "Configure domínio personalizado se contratado",
          "Mantenha o cliente atualizado do progresso",
          "Entregue antes do prazo quando possível"
        ],
        tips: [
          "Entregas parciais geram confiança",
          "Peça feedback durante o processo"
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
            {/* Golden Tips Card */}
            <Card className="bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-500/30">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-amber-300">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                  Dicas de Ouro para Prospectar
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {goldenTips.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-2.5 sm:p-3 rounded-lg bg-black/20 border border-amber-500/20"
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-md bg-amber-500/20 shrink-0">
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-amber-200 mb-0.5">{item.title}</h4>
                            <p className="text-[10px] sm:text-xs text-amber-300/70 leading-relaxed">{item.tip}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-red-300 mb-1">IMPORTANTE: Link Demo é Obrigatório!</h4>
                    <p className="text-xs text-red-300/80 leading-relaxed">
                      Para enviar propostas com alta conversão, você PRECISA criar o site demo na Lovable primeiro e incluir o link na mensagem. 
                      Propostas sem link demo têm apenas 5% de conversão. Com o link, a conversão sobe para 35%!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {guideSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group h-full"
                      onClick={() => handleSelectSection(section.id)}
                    >
                      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-2 sm:p-2.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm sm:text-base text-white group-hover:text-primary transition-colors truncate">
                              {section.title}
                            </CardTitle>
                          </div>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                        <p className="text-xs sm:text-sm text-white/60 line-clamp-2">{section.description}</p>
                        <div className="mt-2 sm:mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-white/10 text-white/70 text-[10px] sm:text-xs">
                            {section.steps.length} passos
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Lovable CTA */}
            <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                      🎁 Ganhe 10 Créditos Grátis na Lovable!
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      Crie sua conta na Lovable pelo nosso link e ganhe créditos extras para criar sites com IA.
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.open('https://lovable.dev/invite/G0FY6YR', '_blank')}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Criar Conta
                  </Button>
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
