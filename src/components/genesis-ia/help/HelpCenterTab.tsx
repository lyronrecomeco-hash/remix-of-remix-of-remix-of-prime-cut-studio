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
  Rocket
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
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  steps: Step[];
}

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
          "O sistema gerará um prompt otimizado"
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
        title: "Salvar e Usar o Prompt",
        description: "Salve o prompt gerado para usar no Lovable.",
        icon: CheckCircle2,
        details: [
          "Revise o prompt final gerado",
          "Clique em 'Copiar Prompt' para área de transferência",
          "Clique em 'Ir para Lovable' para criar o projeto",
          "Cole o prompt no Lovable e aguarde a mágica"
        ],
        tips: [
          "Salve prompts que funcionaram bem para reutilizar",
          "Personalize o prompt com informações específicas do cliente"
        ]
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
        title: "Selecionar Nicho",
        description: "Escolha o nicho do seu cliente.",
        icon: Building2,
        details: [
          "Selecione o nicho da empresa (clínica, restaurante, etc)",
          "O sistema carregará perguntas específicas do nicho",
          "Responda às perguntas para qualificar o cliente"
        ]
      },
      {
        id: "step3",
        title: "Gerar Proposta",
        description: "IA gera uma proposta personalizada.",
        icon: Sparkles,
        details: [
          "Com base nas respostas, a IA gera uma proposta",
          "A proposta inclui problema, solução e benefícios",
          "Você pode escolher o tom (agressivo, persuasivo, etc)",
          "Revise e ajuste se necessário"
        ],
        tips: [
          "Use tom agressivo para leads frios",
          "Tom persuasivo funciona melhor para leads quentes"
        ]
      },
      {
        id: "step4",
        title: "Enviar para o Cliente",
        description: "Copie e envie a proposta via WhatsApp.",
        icon: Send,
        details: [
          "Clique em 'Copiar Proposta'",
          "Abra o WhatsApp do lead",
          "Cole e personalize se necessário",
          "Envie e acompanhe a resposta"
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
        description: "Faça uma abordagem profissional.",
        icon: MessageSquare,
        details: [
          "Use a proposta gerada como base",
          "Personalize a mensagem com o nome da empresa",
          "Seja direto e mostre que entende o problema deles",
          "Ofereça uma conversa rápida de 5 minutos"
        ],
        tips: [
          "Envie nos horários comerciais",
          "Segunda e terça costumam ter melhor resposta",
          "Evite mensagens muito longas no primeiro contato"
        ]
      },
      {
        id: "step2",
        title: "Apresentar Solução",
        description: "Mostre como você pode ajudar.",
        icon: Rocket,
        details: [
          "Explique o problema que identificou",
          "Apresente sua solução de forma simples",
          "Mostre exemplos de trabalhos anteriores se tiver",
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
        description: "Comece a entregar valor.",
        icon: Rocket,
        details: [
          "Volte à Biblioteca com o prompt salvo",
          "Crie o projeto no Lovable",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/20">
          <HelpCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Central de Ajuda</h2>
          <p className="text-white/60 text-sm">
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
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
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
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base text-white group-hover:text-primary transition-colors">
                            {section.title}
                          </CardTitle>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-white/60">{section.description}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                          {section.steps.length} passos
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="steps"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Back button and section title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                {currentSection && (
                  <>
                    <currentSection.icon className="w-5 h-5 text-primary" />
                    <span className="text-white font-medium">{currentSection.title}</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress indicator */}
            {currentSection && (
              <div className="flex items-center gap-2">
                {currentSection.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
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
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/20 shrink-0">
                      <currentStep.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/20 text-primary border-0 text-xs">
                          Passo {currentStepIndex + 1} de {currentSection?.steps.length}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-white">
                        {currentStep.title}
                      </CardTitle>
                      <p className="text-white/60 mt-1">{currentStep.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Details list */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/80">O que fazer:</h4>
                    <ul className="space-y-2">
                      {currentStep.details.map((detail, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-white/70"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  {currentStep.tips && currentStep.tips.length > 0 && (
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <h4 className="text-sm font-medium text-cyan-400 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Dicas Pro
                      </h4>
                      <ul className="space-y-1">
                        {currentStep.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-cyan-300/80 flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 shrink-0 mt-1" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      variant="ghost"
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                      className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    
                    {currentSection && currentStepIndex < currentSection.steps.length - 1 ? (
                      <Button
                        onClick={handleNextStep}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Próximo
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleBack}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Concluído
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Steps overview sidebar on larger screens */}
            {currentSection && (
              <Card className="bg-white/5 border-white/10 lg:hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white/80">Todos os passos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-auto">
                    <div className="space-y-2">
                      {currentSection.steps.map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                          <button
                            key={step.id}
                            onClick={() => setCurrentStepIndex(index)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                              index === currentStepIndex 
                                ? 'bg-primary/20 text-foreground' 
                                : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg ${
                              index === currentStepIndex ? 'bg-primary/30' : 'bg-muted/20'
                            }`}>
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm truncate">{step.title}</span>
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
