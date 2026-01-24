import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Send, 
  RotateCcw, 
  User, 
  Bot,
  Lightbulb,
  Loader2,
  Mic,
  PhoneCall,
  PhoneOff,
  Play,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'client' | 'user' | 'feedback';
  content: string;
}

interface PhoneGuide {
  id: string;
  title: string;
  niche: string;
  difficulty: 'easy' | 'medium' | 'hard';
  objective: string;
  steps: {
    title: string;
    script: string;
    tip: string;
  }[];
  commonObjections: {
    objection: string;
    response: string;
  }[];
  clientPersona: string;
  simulationOpener: string;
}

const phoneGuides: PhoneGuide[] = [
  {
    id: 'academia-matricula',
    title: 'Academia - Processo de Matrícula',
    niche: 'Academia',
    difficulty: 'medium',
    objective: 'Entender o fluxo atual de matrículas e apresentar soluções de automação',
    clientPersona: 'Dono de academia de bairro, 38 anos, administra sozinho. Usa caderno para controlar tudo.',
    simulationOpener: 'Alô? Academia Força Total, bom dia!',
    steps: [
      {
        title: '1. Apresentação Inicial',
        script: '"Bom dia! Meu nome é [SEU NOME], sou consultor de automação para academias. Estou ligando porque vi que a Força Total tem excelente avaliação no Google. Posso tomar 2 minutinhos do seu tempo?"',
        tip: 'Sempre mencione algo específico sobre o negócio para mostrar que pesquisou.'
      },
      {
        title: '2. Qualificação',
        script: '"Perfeito! Me conta, como funciona hoje quando uma pessoa quer se matricular na academia? Ela precisa ir até aí presencialmente?"',
        tip: 'Deixe o cliente falar. Quanto mais ele explicar, mais dores você identifica.'
      },
      {
        title: '3. Identificar Dor',
        script: '"Entendi. E quando o aluno quer renovar ou consultar os pagamentos, como vocês fazem esse controle?"',
        tip: 'Anote mentalmente cada problema mencionado para usar depois.'
      },
      {
        title: '4. Apresentar Solução',
        script: '"Interessante. Olha, muitas academias como a sua estavam perdendo tempo com isso até implementar um sistema que permite matrícula online, controle de pagamentos automático e até lembrete pro aluno que tá sumindo. Posso te mostrar como funciona?"',
        tip: 'Conecte a solução diretamente com as dores que ele mencionou.'
      }
    ],
    commonObjections: [
      {
        objection: '"Já uso um sistema"',
        response: '"Que bom! Qual sistema você usa? Pergunto porque muitos donos de academia me dizem que usam planilha ou caderno e chamam de sistema. Se for algo robusto, ótimo! Se não, vale a pena comparar."'
      },
      {
        objection: '"Não tenho tempo agora"',
        response: '"Entendo perfeitamente, você deve estar no meio da correria. Posso te mandar um vídeo de 2 minutos pelo WhatsApp mostrando como funciona? Aí você vê quando puder e me diz se faz sentido conversar."'
      }
    ]
  },
  {
    id: 'clinica-agendamento',
    title: 'Clínica - Agendamentos',
    niche: 'Clínica',
    difficulty: 'medium',
    objective: 'Apresentar solução para caos no agendamento e alto volume de WhatsApp',
    clientPersona: 'Recepcionista de clínica odontológica, 28 anos, sobrecarregada com WhatsApp.',
    simulationOpener: 'Clínica Sorriso Perfeito, bom dia! Em que posso ajudar?',
    steps: [
      {
        title: '1. Apresentação com Empatia',
        script: '"Bom dia! Meu nome é [SEU NOME]. Imagino que você deve estar com bastante coisa pra fazer aí, vou ser breve. Trabalho com automação de agendamentos pra clínicas. Vocês ainda agendam pelo WhatsApp?"',
        tip: 'Reconheça que a pessoa está ocupada - isso gera empatia imediata.'
      },
      {
        title: '2. Explorar o Problema',
        script: '"Quantas mensagens mais ou menos você recebe por dia pedindo horário? E como você controla isso, é numa agenda física ou sistema?"',
        tip: 'Números concretos (200 mensagens/dia) são poderosos para a proposta.'
      },
      {
        title: '3. Mostrar que Entende',
        script: '"Nossa, 200 mensagens... E aposto que metade é gente perguntando horário disponível, né? Imagino o trabalho de ficar respondendo um por um."',
        tip: 'Reflita o problema de volta para mostrar que você realmente entende.'
      },
      {
        title: '4. Propor Próximo Passo',
        script: '"Olha, tenho clínicas usando um sistema que responde automaticamente os horários disponíveis e já agenda direto. A recepcionista só confirma. Será que o dentista/dono teria 10 minutos essa semana pra eu mostrar?"',
        tip: 'Peça para falar com quem decide, mas valorize o papel da recepcionista.'
      }
    ],
    commonObjections: [
      {
        objection: '"O doutor não gosta dessas coisas de tecnologia"',
        response: '"Entendo! Muitos médicos pensam assim no início. Mas quando veem que vão parar de perder pacientes por demora na resposta, mudam de ideia. Posso mandar um material simples pra você mostrar pra ele?"'
      },
      {
        objection: '"Já tentamos um sistema e não deu certo"',
        response: '"Poxa, que chato isso. O que aconteceu? Pergunto porque dependendo do problema, pode ser algo que a gente resolve fácil. Às vezes era só falta de suporte ou treinamento."'
      }
    ]
  },
  {
    id: 'restaurante-delivery',
    title: 'Restaurante - Delivery',
    niche: 'Restaurante',
    difficulty: 'hard',
    objective: 'Mostrar alternativa ao iFood com taxas menores',
    clientPersona: 'Dono de pizzaria, 35 anos, paga 27% de taxa pro iFood.',
    simulationOpener: 'Pizzaria do João, boa tarde!',
    steps: [
      {
        title: '1. Entrada Direta',
        script: '"Boa tarde! Sou [SEU NOME], trabalho com delivery direto pra restaurantes. Vi vocês no iFood e imagino que as taxas devem estar pesando, né? Posso fazer uma pergunta rápida?"',
        tip: 'Ser direto sobre o problema gera curiosidade.'
      },
      {
        title: '2. Quantificar a Dor',
        script: '"Quanto mais ou menos você paga de taxa por mês pro iFood? E desse faturamento que vem de lá, você consegue ter o contato dos clientes?"',
        tip: 'Faça o cliente calcular o prejuízo - isso cria urgência.'
      },
      {
        title: '3. Plantar a Semente',
        script: '"Então deixa eu ver se entendi: você paga R$ 5 mil por mês de taxa e não fica com o contato do cliente pra fidelizar? O cliente é do iFood, não seu..."',
        tip: 'Reformule o problema de forma impactante.'
      },
      {
        title: '4. Apresentar Alternativa',
        script: '"Muitas pizzarias estão montando um cardápio digital próprio, com pedido pelo WhatsApp automatizado. Taxa zero, cliente seu. E continua no iFood pros novos. Faz sentido eu te mostrar como funciona?"',
        tip: 'Não diga pra sair do iFood, mas sim usar os dois canais.'
      }
    ],
    commonObjections: [
      {
        objection: '"70% dos meus pedidos vêm do iFood, não posso sair"',
        response: '"E nem deve sair! A ideia é manter o iFood pra captar clientes novos, mas fazer os recorrentes pedirem direto com você. Se 30% dos pedidos migrar, já são R$ 1.500 por mês que você para de pagar de taxa."'
      },
      {
        objection: '"Meus clientes só usam iFood"',
        response: '"Será? Testa comigo: coloca um papelzinho na caixa da pizza com desconto pra pedir direto pelo WhatsApp. Aposto que em 1 mês você tem 50 clientes pedindo fora do iFood."'
      }
    ]
  },
  {
    id: 'advocacia-captacao',
    title: 'Advocacia - Presença Digital',
    niche: 'Advocacia',
    difficulty: 'hard',
    objective: 'Mostrar que presença digital não é publicidade proibida',
    clientPersona: 'Advogado, 55 anos, tradicional, só trabalha com indicação.',
    simulationOpener: 'Escritório Mendes Advocacia, boa tarde.',
    steps: [
      {
        title: '1. Abordagem Respeitosa',
        script: '"Boa tarde, doutor! Meu nome é [SEU NOME]. Sei que advogados têm restrições sobre publicidade pela OAB, e não é sobre isso que quero falar. É sobre presença digital profissional. Posso explicar a diferença em 1 minuto?"',
        tip: 'Antecipar a objeção da OAB desarma o cliente imediatamente.'
      },
      {
        title: '2. Educar sobre o Permitido',
        script: '"A OAB proíbe captação ativa, mas permite totalmente ter um site institucional, Google Meu Negócio e até conteúdo educativo no Instagram. Seu escritório aparece quando alguém pesquisa advogado trabalhista em [cidade]?"',
        tip: 'Use pergunta retórica para fazer ele perceber a lacuna.'
      },
      {
        title: '3. Criar Urgência Sutil',
        script: '"Enquanto isso, advogados mais novos estão aparecendo nessas buscas e pegando clientes que poderiam ser seus. Não por serem melhores, mas por serem encontrados."',
        tip: 'Compare com concorrência, não com ele diretamente.'
      },
      {
        title: '4. Propor algo Simples',
        script: '"Minha sugestão é começar pelo básico: Google Meu Negócio bem configurado. É gratuito e já faz você aparecer quando procuram advogado na sua área. Posso te mostrar como fica?"',
        tip: 'Comece pequeno - advogados tradicionais não gostam de mudanças bruscas.'
      }
    ],
    commonObjections: [
      {
        objection: '"Advogado não pode fazer propaganda"',
        response: '"Concordo 100%, e propaganda é diferente de presença digital. Ter um site com seu currículo e áreas de atuação é permitido. Aparecer no Google quando procuram seu nome é permitido. Isso não é propaganda, é informação."'
      },
      {
        objection: '"Só trabalho com indicação"',
        response: '"E indicação é ótimo! Mas quando alguém te indica, a primeira coisa que a pessoa faz é te pesquisar no Google. Se não te acha, pode desistir. Presença digital reforça a indicação, não substitui."'
      }
    ]
  },
  {
    id: 'cold-call-intro',
    title: 'Primeira Ligação Fria',
    niche: 'Geral',
    difficulty: 'hard',
    objective: 'Conseguir atenção em 10 segundos e não ser desligado',
    clientPersona: 'Empresário ocupado, 45 anos, recebe muitas ligações de vendedor.',
    simulationOpener: 'Alô? Quem é?',
    steps: [
      {
        title: '1. Gancho Inicial (10 segundos)',
        script: '"[NOME], bom dia! Vi que sua empresa [DADO ESPECÍFICO - ex: tem 4.8 estrelas no Google]. Sou especialista em [ÁREA] e tenho uma pergunta rápida de 20 segundos. Posso?"',
        tip: 'Mencionar algo específico mostra que não é ligação genérica.'
      },
      {
        title: '2. Pergunta Qualificadora',
        script: '"Vocês ainda fazem [PROCESSO MANUAL - ex: atendimento pelo WhatsApp pessoalmente]? Ou já automatizaram isso?"',
        tip: 'Pergunta sim/não facilita a resposta de quem está ocupado.'
      },
      {
        title: '3. Criar Curiosidade',
        script: '"Interessante. Pergunto porque empresas parecidas com a sua estavam [DOR COMUM] até [RESULTADO]. Você tem 5 minutos pra eu te mostrar o que mudou?"',
        tip: 'Use prova social implícita (empresas parecidas).'
      },
      {
        title: '4. Se Não Tiver Tempo',
        script: '"Entendo que está corrido. Posso te mandar um material de 2 minutos pelo WhatsApp? Se fizer sentido, você me responde quando puder."',
        tip: 'Sempre tenha um plano B que não exija tempo imediato.'
      }
    ],
    commonObjections: [
      {
        objection: '"Tô ocupado, pode ligar depois?"',
        response: '"Claro! Qual melhor horário? Manhã ou tarde? E qual seu WhatsApp pra eu te mandar um lembrete antes?"'
      },
      {
        objection: '"Manda por e-mail"',
        response: '"Posso mandar sim! Mas adianto que 80% das pessoas não abre e-mail comercial. Pelo WhatsApp você vê em 30 segundos. Qual prefere?"'
      }
    ]
  }
];

export const PhoneScenarios = () => {
  const [selectedGuide, setSelectedGuide] = useState<PhoneGuide | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeNiche, setActiveNiche] = useState<string>('Todos');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const niches = ['Todos', ...new Set(phoneGuides.map(s => s.niche))];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredGuides = activeNiche === 'Todos' 
    ? phoneGuides 
    : phoneGuides.filter(s => s.niche === activeNiche);

  const getDifficultyColor = (diff: PhoneGuide['difficulty']) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
    }
  };

  const getDifficultyLabel = (diff: PhoneGuide['difficulty']) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
    }
  };

  const copyScript = (script: string, stepId: string) => {
    navigator.clipboard.writeText(script);
    setCopiedStep(stepId);
    toast.success('Script copiado!');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const startSimulation = () => {
    if (!selectedGuide) return;
    setIsSimulating(true);
    setMessages([
      {
        id: '1',
        role: 'client',
        content: selectedGuide.simulationOpener
      }
    ]);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setMessages([]);
    setInput('');
  };

  const backToList = () => {
    setSelectedGuide(null);
    setIsSimulating(false);
    setMessages([]);
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedGuide || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === 'client' ? 'assistant' : m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('academia-simulator', {
        body: {
          scenario: {
            title: `[LIGAÇÃO] ${selectedGuide.title}`,
            objection: selectedGuide.simulationOpener,
            clientPersona: selectedGuide.clientPersona,
            initialContext: selectedGuide.objective
          },
          userResponse: input,
          conversationHistory
        }
      });

      if (error) throw error;

      setIsTyping(false);

      if (data.clientResponse) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-client',
          role: 'client',
          content: data.clientResponse
        }]);
      }

      if (data.feedback) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now().toString() + '-feedback',
            role: 'feedback',
            content: data.feedback
          }]);
        }, 500);
      }

    } catch (error) {
      console.error('Phone simulator error:', error);
      toast.error('Erro ao processar resposta. Tente novamente.');
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  // List View - Guide Selection
  if (!selectedGuide) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Guias de Ligação</h3>
            <p className="text-[10px] sm:text-xs text-white/50">Aprenda scripts e técnicas para converter por telefone</p>
          </div>
        </div>

        {/* Niche Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setActiveNiche(niche)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                activeNiche === niche
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {filteredGuides.map((guide, index) => (
            <motion.button
              key={guide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedGuide(guide)}
              className="text-left p-3 sm:p-4 bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all group"
              style={{ borderRadius: '14px' }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-400" />
                  <h4 className="font-medium text-white text-xs sm:text-sm group-hover:text-purple-300 transition-colors line-clamp-1">
                    {guide.title}
                  </h4>
                </div>
                <Badge className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 flex-shrink-0 ${getDifficultyColor(guide.difficulty)}`}>
                  {getDifficultyLabel(guide.difficulty)}
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-white/50 line-clamp-2 mb-2">{guide.objective}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-white/40">
                  {guide.niche}
                </Badge>
                <Badge variant="outline" className="text-[9px] bg-purple-500/10 border-purple-500/20 text-purple-400">
                  {guide.steps.length} etapas
                </Badge>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Simulation View
  if (isSimulating) {
    return (
      <div className="flex flex-col h-[400px] sm:h-[520px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '14px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-purple-500/5">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-xs sm:text-sm truncate">Simulação: {selectedGuide.title}</h4>
              <p className="text-[10px] sm:text-xs text-white/40 truncate">{selectedGuide.clientPersona.split(',')[0]}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSimulation}
            className="text-white/50 hover:text-white hover:bg-white/10 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-red-400" />
            <span className="hidden sm:inline">Encerrar</span>
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 px-3 sm:px-4 py-2 sm:py-3">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {message.role === 'feedback' ? (
                  <div className="w-full p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      <span className="text-[10px] sm:text-xs font-semibold text-amber-400">Coach de Vendas</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                ) : (
                  <>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === 'client' ? 'bg-white/10' : 'bg-purple-500/20'
                    }`}>
                      {message.role === 'client' ? (
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                      )}
                    </div>
                    <div className={`max-w-[85%] sm:max-w-[80%] px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl ${
                      message.role === 'client' 
                        ? 'bg-white/10 border border-white/10' 
                        : 'bg-purple-500/20 border border-purple-500/20'
                    }`}>
                      <p className="text-xs sm:text-sm text-white/90 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 sm:gap-3"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/60" />
                </div>
                <div className="bg-white/10 border border-white/10 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl">
                  <div className="flex gap-1 sm:gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Sua resposta..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 sm:h-10 text-xs sm:text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 h-9 sm:h-10 px-3 sm:px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Guide Detail View
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={backToList}
          className="text-white/50 hover:text-white hover:bg-white/10"
        >
          ← Voltar
        </Button>
        <Button
          onClick={startSimulation}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-9 px-4 text-xs sm:text-sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Simular Ligação
        </Button>
      </div>

      {/* Guide Header */}
      <div className="p-4 sm:p-5 bg-white/5 border border-white/10" style={{ borderRadius: '14px' }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-bold text-white">{selectedGuide.title}</h2>
              <Badge className={`text-[9px] ${getDifficultyColor(selectedGuide.difficulty)}`}>
                {getDifficultyLabel(selectedGuide.difficulty)}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-white/60">{selectedGuide.objective}</p>
          </div>
        </div>
        
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] sm:text-xs font-medium text-purple-300">Perfil do Cliente</span>
          </div>
          <p className="text-xs text-white/70">{selectedGuide.clientPersona}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Roteiro da Ligação</h3>
        </div>
        
        {selectedGuide.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 sm:p-4 bg-white/5 border border-white/10 hover:border-purple-500/20 transition-all"
            style={{ borderRadius: '14px' }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-xs sm:text-sm font-semibold text-purple-300">{step.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyScript(step.script, `step-${index}`)}
                className="h-7 px-2 text-white/40 hover:text-white hover:bg-white/10"
              >
                {copiedStep === `step-${index}` ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
            
            <div className="p-2.5 bg-white/5 rounded-lg mb-2">
              <p className="text-xs sm:text-sm text-white/80 italic leading-relaxed">{step.script}</p>
            </div>
            
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] sm:text-xs text-amber-300/70">{step.tip}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Common Objections */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-semibold text-white">Objeções Comuns</h3>
        </div>
        
        {selectedGuide.commonObjections.map((obj, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="p-3 sm:p-4 bg-white/5 border border-white/10"
            style={{ borderRadius: '14px' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-red-400" />
              </div>
              <p className="text-xs sm:text-sm text-red-300 italic">{obj.objection}</p>
            </div>
            
            <div className="flex items-start gap-2 ml-7">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-emerald-300/80">{obj.response}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30" style={{ borderRadius: '14px' }}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-0.5">Pronto para praticar?</h4>
            <p className="text-xs text-white/60">Inicie uma simulação realista com IA</p>
          </div>
          <Button
            onClick={startSimulation}
            className="bg-white/10 hover:bg-white/20 border border-white/20"
          >
            <Play className="w-4 h-4 mr-2" />
            Simular
          </Button>
        </div>
      </div>
    </div>
  );
};
