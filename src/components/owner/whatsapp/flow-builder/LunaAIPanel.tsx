import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Lightbulb, 
  Wand2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FlowNode, FlowEdge } from './types';
import lunaAvatar from '@/assets/luna-avatar.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  flow?: { nodes: FlowNode[]; edges: FlowEdge[] };
  summary?: string;
  tips?: string[];
  timestamp: Date;
  isError?: boolean;
}

interface LunaAIPanelProps {
  onApplyFlow: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  currentNodes?: FlowNode[];
  currentEdges?: FlowEdge[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const QUICK_PROMPTS = [
  { icon: MessageSquare, label: 'Atendimento', prompt: 'Crie um fluxo de atendimento ao cliente com menu de opções, FAQ e transferência para humano' },
  { icon: Sparkles, label: 'Vendas', prompt: 'Crie um fluxo de vendas com apresentação de produtos, perguntas de qualificação e fechamento' },
  { icon: Lightbulb, label: 'Suporte', prompt: 'Crie um fluxo de suporte técnico com triagem de problemas, soluções automáticas e escalação' },
  { icon: Wand2, label: 'Agendamento', prompt: 'Crie um fluxo de agendamento com seleção de data, horário e confirmação' },
];

export const LunaAIPanel = ({ 
  onApplyFlow, 
  currentNodes = [], 
  currentEdges = [],
  isCollapsed = false,
  onToggleCollapse
}: LunaAIPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou a **Luna**, sua assistente de IA especializada em criar fluxos de automação para WhatsApp. 🤖✨\n\nDescreva o fluxo que você deseja criar e eu vou gerar automaticamente todos os nós e conexões para você!\n\nVocê pode me pedir coisas como:\n- "Crie um atendimento para barbearia"\n- "Fluxo de vendas com catálogo de produtos"\n- "Suporte técnico com FAQ automático"',
        timestamp: new Date()
      }]);
    }
  }, []);

  const sendMessage = async (prompt?: string) => {
    const messageContent = prompt || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      const context = currentNodes.length > 0 ? {
        nodes: currentNodes.map(n => ({ id: n.id, type: n.data.type, label: n.data.label })),
        edges: currentEdges.map(e => ({ source: e.source, target: e.target }))
      } : null;

      const { data, error } = await supabase.functions.invoke('flow-ai-builder', {
        body: { prompt: messageContent, context }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.summary || 'Fluxo gerado com sucesso!',
        flow: data.flow,
        summary: data.summary,
        tips: data.tips,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao gerar fluxo:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erro ao gerar fluxo');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFlow = (flow: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
    onApplyFlow(flow.nodes, flow.edges);
    toast.success('Fluxo aplicado ao canvas!');
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: 'Chat limpo! Estou pronta para criar um novo fluxo. O que você deseja?',
      timestamp: new Date()
    }]);
    setShowQuickPrompts(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 48 }}
        className="h-full bg-card border-l border-border flex flex-col items-center py-4"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Luna IA - Criador de Fluxos</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 380, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-card border-l border-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Luna IA
                <Badge variant="secondary" className="text-[10px] bg-purple-500/20 text-purple-400">
                  AVANÇADA
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Criadora de Fluxos Inteligente</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpar chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8">
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === 'user' 
                    ? 'bg-primary' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                )}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 max-w-[280px]",
                  message.role === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    "inline-block p-3 rounded-2xl text-sm",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : message.isError 
                        ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm'
                        : 'bg-muted rounded-tl-sm'
                  )}>
                    {message.isError && (
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Erro</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </div>
                  </div>

                  {/* Flow Preview & Apply */}
                  {message.flow && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span className="text-xs font-medium">Fluxo Gerado</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {message.flow.nodes.length} nós
                        </Badge>
                      </div>
                      
                      {message.tips && message.tips.length > 0 && (
                        <div className="mb-3 space-y-1">
                          {message.tips.slice(0, 2).map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                              <Lightbulb className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        onClick={() => applyFlow(message.flow!)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        size="sm"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Aplicar ao Canvas
                      </Button>
                    </motion.div>
                  )}

                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  <span className="text-sm text-muted-foreground">Criando fluxo...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      <AnimatePresence>
        {showQuickPrompts && !isLoading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Sugestões rápidas</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowQuickPrompts(false)}
                className="h-6 px-2 text-xs"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => sendMessage(item.prompt)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left group"
                >
                  <item.icon className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o fluxo que você deseja criar..."
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shrink-0"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Luna usa IA avançada para criar fluxos automaticamente
        </p>
      </div>
    </motion.div>
  );
};
