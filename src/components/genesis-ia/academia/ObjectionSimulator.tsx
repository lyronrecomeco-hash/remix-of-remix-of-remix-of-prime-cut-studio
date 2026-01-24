import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Send, 
  RotateCcw, 
  Sparkles, 
  User, 
  Bot,
  Trophy,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Loader2
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

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  clientPersona: string;
  objection: string;
}

const scenarios: Scenario[] = [
  // Cenários de PRIMEIRO CONTATO / ABORDAGEM
  {
    id: 'first-contact',
    title: '"Quem é você?"',
    description: 'Primeiro contato frio com cliente',
    difficulty: 'easy',
    clientPersona: 'Dona de salão de beleza, 42 anos, recebe muitas mensagens de vendedores. Está desconfiada e ocupada.',
    objection: 'Oi, quem é você? Como conseguiu meu número? Não tenho interesse em nada, estou ocupada agora.'
  },
  {
    id: 'presentation',
    title: '"Me apresente sua solução"',
    description: 'Cliente pediu para você apresentar',
    difficulty: 'easy',
    clientPersona: 'Dono de pizzaria, 35 anos, curioso. Viu seu anúncio e quer entender melhor antes de decidir.',
    objection: 'Vi seu anúncio e fiquei curioso. Me explica rapidinho o que vocês fazem e como funciona? Tenho só 5 minutos.'
  },
  {
    id: 'whatsapp-cold',
    title: '"Mensagem no WhatsApp"',
    description: 'Abordagem inicial via WhatsApp',
    difficulty: 'medium',
    clientPersona: 'Gerente de clínica odontológica, 40 anos, profissional. Recebeu sua mensagem e está avaliando se vale responder.',
    objection: 'Recebi sua mensagem. O que exatamente vocês oferecem? Já recebi muitas propostas assim e nenhuma deu resultado.'
  },
  // Cenários de OBJEÇÕES CLÁSSICAS
  {
    id: 'price',
    title: '"Está muito caro"',
    description: 'Cliente interessado mas acha o preço alto',
    difficulty: 'easy',
    clientPersona: 'Dono de restaurante, 45 anos, cético com tecnologia. Ele gostou da apresentação mas precisa justificar o investimento.',
    objection: 'Olha, achei interessante o que você mostrou, mas R$ 1.500 por mês é muito caro pra mim. Meu sobrinho faz um site por R$ 500.'
  },
  {
    id: 'think',
    title: '"Preciso pensar"',
    description: 'Cliente indeciso que quer adiar a decisão',
    difficulty: 'medium',
    clientPersona: 'Gerente de loja de roupas, 35 anos, já teve experiências ruins com agências. Está interessada mas tem medo de errar.',
    objection: 'Gostei muito da proposta, mas preciso pensar com calma. Deixa eu analisar melhor e te retorno na semana que vem, pode ser?'
  },
  {
    id: 'competitor',
    title: '"Já tenho fornecedor"',
    description: 'Cliente satisfeito com solução atual',
    difficulty: 'hard',
    clientPersona: 'Dono de academia, 40 anos, pragmático. Já usa um sistema há 2 anos e não vê motivo para mudar.',
    objection: 'Agradeço o contato, mas já tenho um sistema que funciona bem. Não faz sentido trocar agora e passar pela curva de aprendizado de novo.'
  },
  {
    id: 'time',
    title: '"Não tenho tempo"',
    description: 'Cliente muito ocupado para implementar',
    difficulty: 'medium',
    clientPersona: 'Advogada, 38 anos, workaholic. Reconhece que precisa mas acha que não tem tempo para lidar com isso agora.',
    objection: 'Eu sei que preciso melhorar minha presença online, mas agora estou com muitos processos. Não tenho tempo pra ficar acompanhando implementação.'
  },
  // Cenários AVANÇADOS
  {
    id: 'no-budget',
    title: '"Não tenho orçamento"',
    description: 'Cliente sem verba disponível',
    difficulty: 'hard',
    clientPersona: 'Dono de loja de materiais, 50 anos, conservador. Empresa familiar com finanças apertadas no momento.',
    objection: 'Olha, sinceramente não tenho orçamento pra isso agora. O ano tá difícil, as vendas caíram, não posso assumir mais um custo fixo.'
  },
  {
    id: 'spouse',
    title: '"Preciso falar com meu sócio"',
    description: 'Cliente precisa consultar terceiros',
    difficulty: 'medium',
    clientPersona: 'Co-proprietária de pet shop, 32 anos, animada mas não decide sozinha. Divide decisões com o marido/sócio.',
    objection: 'Adorei a proposta! Mas não posso decidir isso sozinha, preciso falar com meu sócio primeiro. Ele viaja muito, só volta semana que vem.'
  },
  {
    id: 'bad-experience',
    title: '"Já fui enganado antes"',
    description: 'Cliente com experiência negativa anterior',
    difficulty: 'hard',
    clientPersona: 'Dono de oficina mecânica, 55 anos, desconfiado. Já contratou agência que não entregou resultados.',
    objection: 'Cara, já contratei uma agência dessas aí. Paguei 6 meses e não vi resultado nenhum. Me senti enganado. Por que seria diferente com vocês?'
  },
  {
    id: 'works-fine',
    title: '"Meu negócio vai bem assim"',
    description: 'Cliente não vê necessidade de mudança',
    difficulty: 'medium',
    clientPersona: 'Dona de padaria tradicional, 48 anos, confiante. Negócio funciona há 20 anos do mesmo jeito.',
    objection: 'Minha padaria funciona há 20 anos assim. Meus clientes me conhecem, não preciso de internet. Funciona bem do jeito que está.'
  }
];

export const ObjectionSimulator = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startSimulation = (scenario: Scenario) => {
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

  const getDifficultyColor = (diff: Scenario['difficulty']) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-500/20 text-emerald-400';
      case 'medium': return 'bg-amber-500/20 text-amber-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
    }
  };

  const getDifficultyLabel = (diff: Scenario['difficulty']) => {
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
          scenario: selectedScenario,
          userResponse: input,
          conversationHistory
        }
      });

      if (error) throw error;

      setIsTyping(false);

      // Add client response
      if (data.clientResponse) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '-client',
          role: 'client',
          content: data.clientResponse
        }]);
      }

      // Add feedback
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
      console.error('Simulator error:', error);
      toast.error('Erro ao processar resposta. Tente novamente.');
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Scenario Selection
  if (!selectedScenario) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Escolha um cenário</h3>
            <p className="text-xs text-white/50">Pratique respostas para situações reais de vendas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {scenarios.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => startSimulation(scenario)}
              className="text-left p-4 bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.08] transition-all group"
              style={{ borderRadius: '14px' }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors line-clamp-1">
                  {scenario.title}
                </h4>
                <Badge className={`text-[10px] px-2 py-0.5 ${getDifficultyColor(scenario.difficulty)}`}>
                  {getDifficultyLabel(scenario.difficulty)}
                </Badge>
              </div>
              <p className="text-xs text-white/50 line-clamp-2">{scenario.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex flex-col h-[520px] bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '14px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-white text-sm truncate">{selectedScenario.title}</h4>
            <p className="text-xs text-white/40 truncate">{selectedScenario.clientPersona.split(',')[0]}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetSimulation}
          className="text-white/50 hover:text-white hover:bg-white/10 h-9 px-3 text-sm"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          Novo
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.role === 'feedback' ? (
                <div className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">Feedback da IA</span>
                  </div>
                  <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              ) : (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'client' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    {message.role === 'client' ? (
                      <User className="w-4 h-4 text-red-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2.5 rounded-xl ${
                    message.role === 'client' 
                      ? 'bg-white/10 border border-white/10' 
                      : 'bg-blue-500/20 border border-blue-500/20'
                  }`}>
                    <p className="text-sm text-white/90 whitespace-pre-wrap">{message.content}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-red-400" />
              </div>
              <div className="bg-white/10 border border-white/10 px-3 py-2.5 rounded-xl">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite sua resposta..."
            disabled={isLoading}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 h-10 w-10 p-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-white/30 mt-2 text-center">
          A IA analisará sua resposta e simulará a reação do cliente
        </p>
      </div>
    </div>
  );
};
