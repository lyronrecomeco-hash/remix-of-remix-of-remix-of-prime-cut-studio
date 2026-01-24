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
  PhoneOff
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

interface PhoneScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  niche: string;
  clientPersona: string;
  initialContext: string;
  objection: string;
}

const phoneScenarios: PhoneScenario[] = [
  // Cenários de LIGAÇÃO INICIAL
  {
    id: 'cold-call-intro',
    title: 'Primeira Ligação Fria',
    description: 'Apresentação inicial por telefone',
    difficulty: 'medium',
    niche: 'Geral',
    clientPersona: 'Empresário ocupado, 45 anos, atende celular enquanto dirige.',
    initialContext: 'Você ligou para o número comercial. A pessoa atendeu rapidamente.',
    objection: 'Alô? Quem é? Tô ocupado aqui, pode ser rápido?'
  },
  {
    id: 'callback-interest',
    title: 'Retorno de Lead',
    description: 'Lead que preencheu formulário',
    difficulty: 'easy',
    niche: 'Geral',
    clientPersona: 'Gerente de marketing, 32 anos, preencheu formulário há 2 dias e esqueceu.',
    initialContext: 'Este lead demonstrou interesse preenchendo um formulário. Você está retornando.',
    objection: 'Oi... formulário? Ah, acho que preenchi algo sim. Mas já não lembro bem o que era.'
  },
  // Cenários por NICHO - Academia
  {
    id: 'academia-matricula',
    title: 'Academia - Processo de Matrícula',
    description: 'Entender fluxo atual de matrículas',
    difficulty: 'medium',
    niche: 'Academia',
    clientPersona: 'Dono de academia de bairro, 38 anos, administra sozinho. Usa caderno para controlar tudo.',
    initialContext: 'Você ligou para entender como funciona o processo de matrícula atual.',
    objection: 'Oi, academia Força Total, tudo bem? Matrícula? Funciona normal, a pessoa vem aqui, preenche a ficha e pronto. Por quê?'
  },
  {
    id: 'academia-retencao',
    title: 'Academia - Retenção de Alunos',
    description: 'Problema comum de cancelamentos',
    difficulty: 'hard',
    niche: 'Academia',
    clientPersona: 'Gerente de academia, 42 anos, frustrado com taxa de cancelamento alta.',
    initialContext: 'Descobriu pela pesquisa que a academia tem muitos cancelamentos.',
    objection: 'Olha, não sei se você pode ajudar. Meu problema é que as pessoas vêm 2 meses e somem. Já tentei de tudo.'
  },
  // Cenários por NICHO - Clínica
  {
    id: 'clinica-agendamento',
    title: 'Clínica - Agendamentos',
    description: 'Processo de marcação de consultas',
    difficulty: 'medium',
    niche: 'Clínica',
    clientPersona: 'Recepcionista de clínica odontológica, 28 anos, sobrecarregada com WhatsApp.',
    initialContext: 'Você ligou para entender como funcionam os agendamentos.',
    objection: 'Oi, Clínica Sorriso Perfeito! Agendamento? Ai, é uma loucura. Recebo 200 mensagens por dia no WhatsApp. Anota aí na agenda de papel mesmo. Espera um segundo que tá tocando outro telefone...'
  },
  {
    id: 'clinica-noshow',
    title: 'Clínica - Faltas em Consultas',
    description: 'Alto índice de no-show',
    difficulty: 'hard',
    niche: 'Clínica',
    clientPersona: 'Dentista dono de clínica, 50 anos, perde dinheiro com faltas.',
    initialContext: 'Pesquisou e viu que a clínica tem muitos horários vagos por faltas.',
    objection: 'Você não imagina o prejuízo. Semana passada tive 8 faltas. O paciente marca e não vem. Depois quer remarcar. Já cobro taxa mas não resolve.'
  },
  // Cenários por NICHO - Restaurante
  {
    id: 'restaurante-delivery',
    title: 'Restaurante - Delivery',
    description: 'Gestão de pedidos delivery',
    difficulty: 'medium',
    niche: 'Restaurante',
    clientPersona: 'Dono de pizzaria, 35 anos, paga taxas altas do iFood.',
    initialContext: 'Você ligou para entender a operação de delivery.',
    objection: 'O iFood me mata nas taxas, pago 27%! Mas não consigo sair porque é de lá que vem 70% dos pedidos. O que você sugere?'
  },
  {
    id: 'restaurante-reservas',
    title: 'Restaurante - Reservas',
    description: 'Sistema de reservas inexistente',
    difficulty: 'easy',
    niche: 'Restaurante',
    clientPersona: 'Gerente de restaurante familiar, 45 anos, usa caderno para reservas.',
    initialContext: 'Você ligou para entender como funcionam as reservas.',
    objection: 'Reserva? A gente anota no caderninho. Às vezes dá problema porque alguém não avisou que cancelou, aí chega o cliente e não tem mesa...'
  },
  // Cenários por NICHO - Advocacia
  {
    id: 'advocacia-captacao',
    title: 'Advocacia - Captação de Clientes',
    description: 'Escritório dependente de indicações',
    difficulty: 'hard',
    niche: 'Advocacia',
    clientPersona: 'Advogado, 55 anos, escritório tradicional, não acredita em marketing digital.',
    initialContext: 'Você ligou para apresentar soluções de presença digital.',
    objection: 'Olha, advogado não pode fazer publicidade. A OAB proíbe. Eu só trabalho com indicação mesmo, não preciso disso.'
  },
  {
    id: 'advocacia-followup',
    title: 'Advocacia - Acompanhamento de Processos',
    description: 'Clientes ligam pedindo atualização',
    difficulty: 'medium',
    niche: 'Advocacia',
    clientPersona: 'Advogada, 38 anos, passa muito tempo ao telefone dando satisfação.',
    initialContext: 'Você descobriu que ela gasta horas por dia atualizando clientes.',
    objection: 'Meu maior problema é que o cliente liga toda hora querendo saber do processo. Gasto 3 horas por dia só nisso. Não tenho tempo nem para pegar casos novos.'
  },
  // Cenários de OBJEÇÃO AVANÇADA
  {
    id: 'competitor-happy',
    title: 'Satisfeito com Concorrente',
    description: 'Já usa solução similar',
    difficulty: 'hard',
    niche: 'Geral',
    clientPersona: 'Empresário, 40 anos, usa concorrente há 1 ano e está razoavelmente satisfeito.',
    initialContext: 'Descobriu que a empresa já usa uma solução parecida.',
    objection: 'Já uso o [Concorrente X] há um ano. Funciona bem, pago R$ 300 por mês. Por que eu trocaria? Ia ter que migrar tudo, treinar equipe de novo...'
  },
  {
    id: 'bad-timing',
    title: 'Momento Ruim',
    description: 'Empresa passando por dificuldades',
    difficulty: 'hard',
    niche: 'Geral',
    clientPersona: 'Empresário, 48 anos, empresa em crise financeira.',
    initialContext: 'A empresa está passando por momento difícil.',
    objection: 'Olha, sinceramente? Esse ano foi terrível. Tive que demitir 3 funcionários. Não é momento pra investir em nada. Talvez ano que vem.'
  }
];

export const PhoneScenarios = () => {
  const [selectedScenario, setSelectedScenario] = useState<PhoneScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeNiche, setActiveNiche] = useState<string>('Todos');
  const scrollRef = useRef<HTMLDivElement>(null);

  const niches = ['Todos', ...new Set(phoneScenarios.map(s => s.niche))];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredScenarios = activeNiche === 'Todos' 
    ? phoneScenarios 
    : phoneScenarios.filter(s => s.niche === activeNiche);

  const startSimulation = (scenario: PhoneScenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        id: '1',
        role: 'client',
        content: scenario.objection
      }
    ]);
  };

  const resetSimulation = () => {
    setSelectedScenario(null);
    setMessages([]);
    setInput('');
  };

  const getDifficultyColor = (diff: PhoneScenario['difficulty']) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
    }
  };

  const getDifficultyLabel = (diff: PhoneScenario['difficulty']) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedScenario || isLoading) return;

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
            ...selectedScenario,
            title: `[LIGAÇÃO] ${selectedScenario.title}`,
            objection: selectedScenario.objection,
            clientPersona: `${selectedScenario.clientPersona} [CONTEXTO: ${selectedScenario.initialContext}]`
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

  // Scenario Selection
  if (!selectedScenario) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Simulador de Ligações</h3>
            <p className="text-[10px] sm:text-xs text-white/50">Pratique chamadas de vendas por nicho</p>
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
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {filteredScenarios.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => startSimulation(scenario)}
              className="text-left p-3 sm:p-4 bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all group"
              style={{ borderRadius: '12px' }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <h4 className="font-medium text-white text-xs sm:text-sm group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {scenario.title}
                  </h4>
                </div>
                <Badge className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 flex-shrink-0 ${getDifficultyColor(scenario.difficulty)}`}>
                  {getDifficultyLabel(scenario.difficulty)}
                </Badge>
              </div>
              <p className="text-[10px] sm:text-xs text-white/50 line-clamp-2 mb-1.5">{scenario.description}</p>
              <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-white/40">
                {scenario.niche}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex flex-col h-[400px] sm:h-[520px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '12px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-emerald-500/5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-white text-xs sm:text-sm truncate">{selectedScenario.title}</h4>
            <p className="text-[10px] sm:text-xs text-white/40 truncate">{selectedScenario.niche} • {selectedScenario.clientPersona.split(',')[0]}</p>
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

      {/* Context Banner */}
      <div className="px-3 sm:px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20">
        <p className="text-[10px] sm:text-xs text-emerald-300/70">
          <strong>Contexto:</strong> {selectedScenario.initialContext}
        </p>
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
                    message.role === 'client' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    {message.role === 'client' ? (
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                    ) : (
                      <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                    )}
                  </div>
                  <div className={`max-w-[85%] sm:max-w-[80%] px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl ${
                    message.role === 'client' 
                      ? 'bg-white/10 border border-white/10' 
                      : 'bg-blue-500/20 border border-blue-500/20'
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
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
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
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-white/10 bg-white/5">
        <div className="flex gap-2 sm:gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="O que você diria por telefone..."
            disabled={isLoading}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9 sm:h-10 text-xs sm:text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </Button>
        </div>
        <p className="text-[9px] sm:text-xs text-white/30 mt-1.5 sm:mt-2 text-center">
          Simule a conversa telefônica e receba feedback em tempo real
        </p>
      </div>
    </div>
  );
};
