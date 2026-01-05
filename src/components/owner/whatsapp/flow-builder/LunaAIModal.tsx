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
  Star
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
  { icon: '🎯', text: 'Atendimento ao cliente com menu' },
  { icon: '🛒', text: 'Funil de vendas com CRM' },
  { icon: '📅', text: 'Agendamento automático' },
  { icon: '🔧', text: 'Suporte técnico com FAQ' },
  { icon: '🚀', text: 'Onboarding de novos leads' },
  { icon: '💳', text: 'Checkout e pagamentos' }
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

  // Reset state when modal opens - NO INITIAL MESSAGE
  useEffect(() => {
    if (open) {
      // Luna starts fresh, waiting for user input
      setMessages([]);
      setConversationPhase(1);
      setCurrentProposal(null);
      setPendingPrompt('');
      setInput('');
      
      // Focus textarea
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build flow on canvas node by node
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
    
    toast.success('✨ Fluxo criado!', {
      id: toastId,
      description: `${nodes.length} nós criados`
    });
  }, [onApplyFlow, onOpenChange, onSaveFlow]);

  // Handle proposal approval
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
        content: '✅ Aprovado!',
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
        throw new Error('Resposta inválida');
      }

    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar');
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Erro ao construir. Tente novamente.',
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

  // Reject proposal
  const rejectProposal = useCallback(() => {
    setCurrentProposal(null);
    setConversationPhase(1);
    
    setMessages(prev => [...prev, {
      id: `reject-${Date.now()}`,
      role: 'assistant',
      content: '💡 Sem problemas! Me conta o que gostaria de ajustar?',
      timestamp: new Date(),
      phase: 1
    }]);
  }, []);

  // Main send message function
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
          content: data.message || 'Como posso ajudar?',
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
        content: error instanceof Error ? error.message : 'Erro ao processar.',
        timestamp: new Date(),
        isError: true
      }]);
      toast.error('Erro ao processar');
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
        isExpanded ? "max-w-4xl h-[90vh]" : "max-w-xl h-[70vh]"
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Luna</h3>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary">
                IA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isLoading ? 'Pensando...' : currentProposal ? 'Aguardando aprovação' : 'Pronta para criar'}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nova conversa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 space-y-4 min-h-full">
            {messages.length === 0 ? (
              // Empty state - Luna waiting
              <div className="flex flex-col items-center justify-center h-full py-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-4 ring-primary/10 mb-4">
                    <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Oi! Sou a Luna 👋</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Me conta o que você quer automatizar e eu construo o fluxo pra você.
                  </p>
                </motion.div>

                {/* Quick suggestions */}
                <div className="mt-6 w-full max-w-md">
                  <p className="text-xs text-muted-foreground text-center mb-3">Sugestões rápidas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setInput(suggestion.text)}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                      >
                        <span className="text-lg">{suggestion.icon}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          {suggestion.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Messages list
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === 'user' ? 'bg-primary' : 'overflow-hidden'
                    )}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-primary-foreground" />
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
                        "inline-block p-3 rounded-2xl text-sm",
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md',
                        message.isError && 'bg-destructive/10 text-destructive'
                      )}>
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                          </p>
                        ))}
                      </div>

                      {/* Proposal Card */}
                      {message.proposal && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Proposta</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">
                              ~{message.proposal.estimatedNodes} nós
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground mb-3">
                            {message.proposal.objective}
                          </p>

                          {message.proposal.steps.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              {message.proposal.steps.slice(0, 4).map((step, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  <span>{step.icon}</span>
                                  <span className="text-muted-foreground">{step.title}</span>
                                </div>
                              ))}
                              {message.proposal.steps.length > 4 && (
                                <p className="text-[10px] text-muted-foreground">
                                  +{message.proposal.steps.length - 4} mais etapas
                                </p>
                              )}
                            </div>
                          )}

                          {!message.isPlanApproved && (
                            <div className="flex gap-2 pt-2 border-t border-primary/10">
                              <Button 
                                size="sm" 
                                className="flex-1 h-8"
                                onClick={approveProposal}
                                disabled={isLoading}
                              >
                                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 h-8"
                                onClick={rejectProposal}
                                disabled={isLoading}
                              >
                                <ThumbsDown className="w-3.5 h-3.5 mr-1.5" />
                                Ajustar
                              </Button>
                            </div>
                          )}

                          {message.isPlanApproved && (
                            <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600">Aprovado</span>
                            </div>
                          )}
                        </motion.div>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-1 px-1">
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
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                  <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md p-3">
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }} 
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-muted/30">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva o que você quer automatizar..."
              className="min-h-[56px] max-h-32 resize-none pr-12 rounded-xl bg-background border-border/50"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className={cn(
                "absolute right-2 bottom-2 h-8 w-8 rounded-lg transition-all",
                input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
              disabled={!input.trim() || isLoading}
              onClick={() => sendMessage()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Luna usa IA para criar fluxos. Revise antes de publicar.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
