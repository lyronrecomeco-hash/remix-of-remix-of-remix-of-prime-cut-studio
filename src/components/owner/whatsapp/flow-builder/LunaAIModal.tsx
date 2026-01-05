import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  User, 
  Lightbulb, 
  Wand2,
  MessageSquare,
  Zap,
  CheckCircle2,
  GitBranch,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Target,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Bot,
  ArrowRight,
  Mic,
  Paperclip,
  MoreHorizontal,
  ChevronDown,
  Star,
  Rocket,
  Brain,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  analysis?: LunaAnalysis;
  proposal?: FlowProposal;
  timestamp: Date;
  isError?: boolean;
  isPlanApproved?: boolean;
  phase?: 1 | 2 | 3 | 4;
}

interface LunaAnalysis {
  understood: string;
  assumptions: string[];
  questions: string[];
  complexity: 'baixa' | 'média' | 'alta' | 'enterprise';
}

interface FlowProposal {
  objective: string;
  approach: string;
  steps: { icon: string; title: string; description: string }[];
  criticalDecisions?: string[];
  infraConsiderations?: string[];
  securityConsiderations?: string[];
  estimatedNodes: number;
  estimatedTime: string;
}

interface LunaAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFlow: (nodes: FlowNode[], edges: FlowEdge[]) => void;
  currentNodes?: FlowNode[];
  currentEdges?: FlowEdge[];
  flowId?: string;
  onSaveFlow?: () => Promise<void>;
}

const SUGGESTIONS = [
  { icon: '🎯', text: 'Atendimento ao cliente com menu de opções', category: 'Suporte' },
  { icon: '🛒', text: 'Funil de vendas completo com qualificação', category: 'Vendas' },
  { icon: '📅', text: 'Sistema de agendamento automático', category: 'Agendamentos' },
  { icon: '🔧', text: 'Suporte técnico com FAQ inteligente', category: 'Suporte' },
  { icon: '🚀', text: 'Onboarding automatizado para novos leads', category: 'Marketing' },
  { icon: '💳', text: 'Fluxo de checkout e pagamento PIX', category: 'Vendas' },
  { icon: '📊', text: 'Pesquisa de satisfação NPS automática', category: 'Feedback' },
  { icon: '🔔', text: 'Sistema de notificações e lembretes', category: 'Notificações' }
];

export const LunaAIModal = ({ 
  open,
  onOpenChange,
  onApplyFlow, 
  currentNodes = [], 
  currentEdges = [],
  flowId,
  onSaveFlow
}: LunaAIModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<FlowProposal | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string>('');
  const [conversationPhase, setConversationPhase] = useState<1 | 2 | 3 | 4>(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setMessages([]);
      setConversationPhase(1);
      setCurrentProposal(null);
      setPendingPrompt('');
      setInput('');
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildFlowOnCanvas = useCallback(async (nodes: FlowNode[], edges: FlowEdge[]) => {
    onOpenChange(false);
    
    const analysisTime = 2000;
    const connectionTime = 2000;
    const finishTime = 1500;
    const availableForNodes = 45000 - analysisTime - connectionTime - finishTime;
    const perNodeTime = Math.min(3000, Math.floor(availableForNodes / nodes.length));
    
    const toastId = toast.loading('🤖 Luna construindo...', {
      description: 'Analisando estrutura...'
    });
    
    await new Promise(r => setTimeout(r, analysisTime));
    
    const addedNodes: FlowNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeLabel = node.data?.label || `Nó ${i + 1}`;
      
      toast.loading(`🤖 Luna construindo...`, {
        id: toastId,
        description: `${nodeLabel} (${i + 1}/${nodes.length})`
      });
      
      addedNodes.push(node);
      onApplyFlow([...addedNodes], []);
      
      await new Promise(r => setTimeout(r, perNodeTime * (0.7 + Math.random() * 0.5)));
    }
    
    toast.loading(`🤖 Luna construindo...`, { id: toastId, description: 'Conectando...' });
    await new Promise(r => setTimeout(r, connectionTime));
    onApplyFlow(addedNodes, edges);
    
    if (onSaveFlow) {
      toast.loading(`🤖 Luna construindo...`, { id: toastId, description: 'Salvando...' });
      try { await onSaveFlow(); } catch (e) { console.error(e); }
    }
    
    await new Promise(r => setTimeout(r, finishTime));
    
    toast.success('✨ Fluxo criado com sucesso!', {
      id: toastId,
      description: `${nodes.length} nós criados e conectados`
    });
  }, [onApplyFlow, onOpenChange, onSaveFlow]);

  const approveProposal = useCallback(async () => {
    if (!currentProposal || !pendingPrompt) return;
    
    setMessages(prev => prev.map(msg => 
      msg.proposal && !msg.isPlanApproved 
        ? { ...msg, isPlanApproved: true }
        : msg
    ));
    
    setConversationPhase(4);
    setIsLoading(true);
    
    try {
      const approvalMsg: Message = {
        id: `approve-${Date.now()}`,
        role: 'user',
        content: '✅ Aprovado! Pode construir.',
        timestamp: new Date(),
        phase: 3
      };
      setMessages(prev => [...prev, approvalMsg]);
      
      const { data, error } = await supabase.functions.invoke('flow-ai-builder', {
        body: { 
          prompt: pendingPrompt, 
          context: null,
          phase: 4,
          approved: true
        }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      if (data.flow?.nodes) {
        await buildFlowOnCanvas(data.flow.nodes, data.flow.edges || []);
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar fluxo');
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Ops! Houve um erro ao construir o fluxo. Tente novamente com uma descrição diferente.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setCurrentProposal(null);
      setPendingPrompt('');
      setConversationPhase(1);
    }
  }, [currentProposal, pendingPrompt, buildFlowOnCanvas]);

  const rejectProposal = useCallback(() => {
    setCurrentProposal(null);
    setConversationPhase(1);
    
    setMessages(prev => [...prev, {
      id: `reject-${Date.now()}`,
      role: 'assistant',
      content: '💡 Entendido! Me conta o que gostaria de ajustar na proposta? Posso modificar a estrutura, adicionar mais etapas ou simplificar.',
      timestamp: new Date(),
      phase: 1
    }]);
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

    try {
      const { data, error } = await supabase.functions.invoke('flow-ai-builder', {
        body: { 
          prompt: messageContent, 
          context: { currentNodes, currentEdges },
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      const responsePhase = data.phase || 1;
      
      if (responsePhase === 4 && data.flow?.nodes) {
        await buildFlowOnCanvas(data.flow.nodes, data.flow.edges || []);
      } else {
        const proposal: FlowProposal | undefined = data.proposal ? {
          objective: data.proposal.objective || '',
          approach: data.proposal.approach || '',
          steps: data.proposal.steps || [],
          criticalDecisions: data.proposal.criticalDecisions,
          infraConsiderations: data.proposal.infraConsiderations,
          securityConsiderations: data.proposal.securityConsiderations,
          estimatedNodes: data.proposal.estimatedNodes || 5,
          estimatedTime: data.proposal.estimatedTime || '~30s'
        } : undefined;

        if (proposal && proposal.objective) {
          setCurrentProposal(proposal);
          setPendingPrompt(messageContent);
          setConversationPhase(2);
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message || 'Como posso ajudar você hoje?',
          analysis: data.analysis,
          proposal,
          timestamp: new Date(),
          phase: responsePhase as 1 | 2 | 3 | 4
        };

        setMessages(prev => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error('Erro:', error);
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Erro ao processar sua mensagem.',
        timestamp: new Date(),
        isError: true
      }]);
      toast.error('Erro ao processar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentProposal(null);
    setPendingPrompt('');
    setConversationPhase(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "flex flex-col p-0 gap-0 overflow-hidden border-0 bg-background shadow-2xl",
        isExpanded ? "max-w-5xl h-[90vh]" : "max-w-2xl h-[80vh]"
      )}>
        {/* Premium Header */}
        <div className="flex items-center gap-4 p-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg shadow-primary/20">
              <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">Luna</h3>
              <Badge className="text-sm px-3 py-0.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/20">
                <Brain className="w-3.5 h-3.5 mr-1.5" />
                IA Arquiteta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Pensando na melhor solução...
                </span>
              ) : currentProposal ? (
                'Aguardando sua aprovação para construir'
              ) : (
                'Pronta para criar automações incríveis'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={clearChat}>
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nova conversa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:text-destructive" onClick={() => onOpenChange(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-6 space-y-6 min-h-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center max-w-lg"
                >
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-primary/20 shadow-xl shadow-primary/20 mb-6">
                    <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Olá! Eu sou a Luna 👋</h3>
                  <p className="text-base text-muted-foreground mb-2">
                    Sou sua arquiteta de automações com IA. Me conta o que você quer automatizar e eu construo o fluxo completo para você.
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Posso criar desde atendimentos simples até funis de vendas complexos com integrações.
                  </p>
                </motion.div>

                {/* Quick suggestions */}
                <div className="mt-8 w-full">
                  <p className="text-sm text-muted-foreground text-center mb-4 font-medium">
                    💡 Ideias para começar
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTIONS.map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          setInput(suggestion.text);
                          textareaRef.current?.focus();
                        }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                      >
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">
                            {suggestion.text}
                          </span>
                          <span className="text-xs text-muted-foreground">{suggestion.category}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex gap-4",
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md",
                      message.role === 'user' ? 'bg-primary' : 'overflow-hidden ring-2 ring-primary/20'
                    )}>
                      {message.role === 'user' ? (
                        <User className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "flex-1 max-w-[85%]",
                      message.role === 'user' ? 'text-right' : 'text-left'
                    )}>
                      <div className={cn(
                        "inline-block p-4 rounded-2xl text-base leading-relaxed",
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md',
                        message.isError && 'bg-destructive/10 text-destructive border border-destructive/20'
                      )}>
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-2' : ''}>
                            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        ))}
                      </div>

                      {/* Proposal Card */}
                      {message.proposal && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold">Proposta de Automação</h4>
                              <p className="text-sm text-muted-foreground">{message.proposal.objective}</p>
                            </div>
                          </div>

                          {/* Steps */}
                          {message.proposal.steps?.length > 0 && (
                            <div className="space-y-3 mb-5">
                              {message.proposal.steps.map((step, i) => (
                                <div key={i} className="flex gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-lg">{step.icon}</span>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-semibold">{step.title}</h5>
                                    <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 mb-5 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Target className="w-4 h-4" />
                              <span className="font-medium">{message.proposal.estimatedNodes} nós</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{message.proposal.estimatedTime}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          {!message.isPlanApproved && (
                            <div className="flex gap-3">
                              <Button
                                onClick={approveProposal}
                                disabled={isLoading}
                                className="flex-1 h-12 text-base bg-primary hover:bg-primary/90 gap-2"
                              >
                                <Rocket className="w-5 h-5" />
                                Aprovar e Construir
                              </Button>
                              <Button
                                variant="outline"
                                onClick={rejectProposal}
                                disabled={isLoading}
                                className="h-12 px-6 text-base"
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Ajustar
                              </Button>
                            </div>
                          )}

                          {message.isPlanApproved && (
                            <div className="flex items-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-sm font-medium">Plano aprovado - Construindo...</span>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-md">
                  <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md p-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-base text-muted-foreground">Luna está pensando...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-5 border-t bg-gradient-to-t from-muted/30 to-transparent">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descreva a automação que você precisa..."
                className="min-h-[56px] max-h-40 resize-none pr-12 text-base rounded-xl border-border/50 focus:border-primary/50 bg-background"
                disabled={isLoading}
              />
            </div>
            
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="h-14 w-14 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Enter</kbd> para enviar • <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">Shift+Enter</kbd> para nova linha
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
