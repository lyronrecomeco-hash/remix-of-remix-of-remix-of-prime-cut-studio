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
  AlertCircle,
  Zap,
  CheckCircle2,
  GitBranch,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const QUICK_PROMPTS = [
  { icon: MessageSquare, label: 'Atendimento Completo', prompt: 'Crie um fluxo de atendimento ao cliente com menu de opções, FAQ, transferência para humano, proteção anti-spam e fila de mensagens' },
  { icon: Sparkles, label: 'Funil de Vendas', prompt: 'Crie um fluxo de vendas com apresentação de produtos, perguntas de qualificação, fechamento, integração com CRM e proteção de sessão' },
  { icon: Lightbulb, label: 'Suporte Técnico', prompt: 'Crie um fluxo de suporte técnico com triagem de problemas, soluções automáticas, escalação, timeout handler e retry automático' },
  { icon: Wand2, label: 'Agendamento', prompt: 'Crie um fluxo de agendamento com seleção de data, horário, confirmação, integração com API externa e rate limiting' },
  { icon: Zap, label: 'E-commerce', prompt: 'Crie um fluxo completo de e-commerce: catálogo, carrinho, checkout, pagamento, integração com Shopify e proteção de infraestrutura' },
  { icon: GitBranch, label: 'Automação Complexa', prompt: 'Crie uma automação sem WhatsApp: webhook trigger, chamada de API externa, loop de processamento, transformação de dados e emissão de eventos' },
  { icon: Clock, label: 'Cron + Notificações', prompt: 'Crie um fluxo agendado (cron) que busca dados de API, processa com loop, e envia notificações via WhatsApp com fila e retry' },
  { icon: Target, label: 'Sistema Resiliente', prompt: 'Crie um fluxo enterprise com: proxy assign, worker assign, session guard, rate limit, quota guard, secure context e timeout handler' },
];

const NODE_ICONS: Record<string, string> = {
  trigger: '⚡',
  wa_start: '▶️',
  message: '💬',
  wa_send_text: '💬',
  wa_send_buttons: '🔘',
  wa_send_list: '📋',
  wa_wait_response: '⏳',
  wa_receive: '📥',
  button: '🔘',
  list: '📋',
  condition: '🔀',
  delay: '⏱️',
  ai: '🤖',
  webhook: '🌐',
  variable: '📝',
  end: '🏁',
  // Automation
  http_request_advanced: '🔗',
  webhook_trigger: '📡',
  cron_trigger: '📅',
  set_variable: '📌',
  if_expression: '🧮',
  loop_for_each: '🔄',
  switch_case: '🔀',
  subflow_call: '📤',
  event_emitter: '📡',
  data_transform: '⚙️',
  // Stability
  queue_message: '📨',
  session_guard: '🛡️',
  timeout_handler: '⏰',
  if_instance_state: '📶',
  retry_policy: '🔁',
  smart_delay: '⏳',
  rate_limit: '⚡',
  enqueue_flow_step: '📋',
  // Infrastructure
  proxy_assign: '🌐',
  proxy_rotate: '🔄',
  worker_assign: '🖥️',
  worker_release: '🚪',
  dispatch_execution: '🚀',
  identity_rotate: '🔄',
  // Security
  execution_quota_guard: '🛡️',
  infra_rate_limit: '⚡',
  if_infra_health: '💓',
  secure_context_guard: '🔒',
};

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
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [currentProposal, setCurrentProposal] = useState<FlowProposal | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string>('');
  const [conversationPhase, setConversationPhase] = useState<1 | 2 | 3 | 4>(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! 👋 Sou a **Luna**, sua arquiteta de fluxos de automação.\n\n🧠 Eu NÃO sou um chatbot genérico. Eu **penso antes de executar**.\n\nMeu processo:\n\n📋 **FASE 1** — Entendo e analiso sua necessidade\n📐 **FASE 2** — Proponho uma arquitetura detalhada\n✅ **FASE 3** — Aguardo sua aprovação explícita\n🔧 **FASE 4** — Construo o fluxo no canvas\n\n*"Antes de executar, eu preciso entender e alinhar."*\n\n💡 Escolha uma sugestão ou descreva livremente o que precisa!',
        timestamp: new Date(),
        phase: 1
      }]);
      setConversationPhase(1);
    }
  }, [open, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build flow on canvas node by node (MAX 1 MINUTE)
  const buildFlowOnCanvas = useCallback(async (nodes: FlowNode[], edges: FlowEdge[]) => {
    // Close modal immediately when building starts
    onOpenChange(false);
    
    // Calculate timing: max 60 seconds total
    const analysisTime = 3000;
    const connectionTime = 3000;
    const finishTime = 2000;
    const availableForNodes = 60000 - analysisTime - connectionTime - finishTime;
    const perNodeTime = Math.min(5000, Math.floor(availableForNodes / nodes.length));
    
    // Show toast with progress
    const toastId = toast.loading('🤖 Luna está construindo o fluxo...', {
      description: 'Analisando estrutura...'
    });
    
    // Step 1: Analysis
    await new Promise(r => setTimeout(r, analysisTime));
    
    // Step 2: Add nodes one by one
    const addedNodes: FlowNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeLabel = node.data?.label || `Nó ${i + 1}`;
      
      toast.loading(`🤖 Luna está construindo o fluxo...`, {
        id: toastId,
        description: `Criando: ${nodeLabel} (${i + 1}/${nodes.length})`
      });
      
      addedNodes.push(node);
      onApplyFlow([...addedNodes], []);
      
      await new Promise(r => setTimeout(r, perNodeTime * (0.8 + Math.random() * 0.4)));
    }
    
    // Step 3: Connect edges
    toast.loading(`🤖 Luna está construindo o fluxo...`, {
      id: toastId,
      description: 'Conectando nós...'
    });
    await new Promise(r => setTimeout(r, connectionTime));
    onApplyFlow(addedNodes, edges);
    
    // Step 4: Save automatically
    toast.loading(`🤖 Luna está construindo o fluxo...`, {
      id: toastId,
      description: 'Salvando...'
    });
    
    if (onSaveFlow) {
      try {
        await onSaveFlow();
      } catch (error) {
        console.error('Error auto-saving flow:', error);
      }
    }
    
    await new Promise(r => setTimeout(r, finishTime));
    
    toast.success('🎉 Fluxo construído pela Luna!', {
      id: toastId,
      description: `${nodes.length} nós criados e salvos automaticamente`
    });
  }, [onApplyFlow, onOpenChange, onSaveFlow]);

  // Handle proposal approval - PHASE 3 to PHASE 4
  const approveProposal = useCallback(async () => {
    if (!currentProposal || !pendingPrompt) return;
    
    // Update message to show approved
    setMessages(prev => prev.map(msg => 
      msg.proposal && !msg.isPlanApproved 
        ? { ...msg, isPlanApproved: true }
        : msg
    ));
    
    setConversationPhase(4);
    setIsLoading(true);
    setShowQuickPrompts(false);
    
    try {
      // Add approval confirmation message
      const approvalMsg: Message = {
        id: `approve-${Date.now()}`,
        role: 'user',
        content: 'Aprovado! Pode gerar o fluxo.',
        timestamp: new Date(),
        phase: 3
      };
      setMessages(prev => [...prev, approvalMsg]);
      
      // Actually generate the flow via edge function
      const { data, error } = await supabase.functions.invoke('flow-ai-builder', {
        body: { 
          prompt: pendingPrompt, 
          context: null,
          phase: 4,
          approved: true
        }
      });

      if (error) throw new Error(error.message || 'Erro ao gerar fluxo');
      if (data.error) throw new Error(data.error);

      if (data.flow?.nodes) {
        // Close modal and start building on canvas
        await buildFlowOnCanvas(data.flow.nodes, data.flow.edges || []);
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      console.error('Erro ao gerar fluxo:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar fluxo');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Ocorreu um erro ao construir o fluxo. Por favor, tente novamente.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentProposal(null);
      setPendingPrompt('');
      setConversationPhase(1);
    }
  }, [currentProposal, pendingPrompt, buildFlowOnCanvas]);

  // Reject proposal and ask for modifications
  const rejectProposal = useCallback(() => {
    setCurrentProposal(null);
    setConversationPhase(1);
    
    const rejectMessage: Message = {
      id: `reject-${Date.now()}`,
      role: 'assistant',
      content: 'Entendi! 💡 Vamos ajustar.\n\nMe diga:\n- O que você gostaria de **modificar** na proposta?\n- Existe algo que **não ficou claro**?\n- Quer **adicionar** ou **remover** alguma etapa?\n\n*Estou aqui para alinhar antes de executar.*',
      timestamp: new Date(),
      phase: 1
    };
    setMessages(prev => [...prev, rejectMessage]);
    setShowQuickPrompts(false);
  }, []);

  // Main send message function with deliberative behavior
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
      // Call AI with deliberative prompt
      const { data, error } = await supabase.functions.invoke('flow-ai-builder', {
        body: { 
          prompt: messageContent, 
          context: { currentNodes, currentEdges },
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw new Error(error.message || 'Erro ao processar');
      if (data.error) throw new Error(data.error);

      // Handle response based on phase
      const responsePhase = data.phase || 2;
      
      if (responsePhase === 4 && data.flow?.nodes) {
        // Direct flow generation (only if user explicitly approved)
        await buildFlowOnCanvas(data.flow.nodes, data.flow.edges || []);
      } else {
        // Analysis or Proposal phase
        const proposal: FlowProposal | undefined = data.proposal ? {
          objective: data.proposal.objective || '',
          approach: data.proposal.approach || '',
          steps: data.proposal.steps || [],
          criticalDecisions: data.proposal.criticalDecisions,
          infraConsiderations: data.proposal.infraConsiderations,
          securityConsiderations: data.proposal.securityConsiderations,
          estimatedNodes: data.proposal.estimatedNodes || 5,
          estimatedTime: data.proposal.estimatedTime || '~30 segundos'
        } : undefined;

        if (proposal) {
          setCurrentProposal(proposal);
          setPendingPrompt(messageContent);
          setConversationPhase(2);
        }

        const analysisContent = data.analysis 
          ? `📋 **Fase 1 — Análise**\n\n**Entendi que:** ${data.analysis.understood}\n\n${data.analysis.assumptions?.length ? `**Suposições:**\n${data.analysis.assumptions.map((a: string) => `• ${a}`).join('\n')}\n\n` : ''}${data.analysis.questions?.length ? `**Perguntas para alinhar:**\n${data.analysis.questions.map((q: string) => `❓ ${q}`).join('\n')}\n\n` : ''}**Complexidade:** ${data.analysis.complexity}`
          : '';

        const proposalContent = proposal 
          ? `\n\n📐 **Fase 2 — Proposta de Arquitetura**\n\n**🎯 Objetivo:**\n${proposal.objective}\n\n**📐 Abordagem:**\n${proposal.approach}${proposal.criticalDecisions?.length ? `\n\n⚠️ **Decisões Críticas:**\n${proposal.criticalDecisions.map(d => `• ${d}`).join('\n')}` : ''}${proposal.infraConsiderations?.length ? `\n\n🖥️ **Infra:**\n${proposal.infraConsiderations.map(i => `• ${i}`).join('\n')}` : ''}${proposal.securityConsiderations?.length ? `\n\n🔒 **Segurança:**\n${proposal.securityConsiderations.map(s => `• ${s}`).join('\n')}` : ''}`
          : '';

        const finalMessage = data.message || (analysisContent + proposalContent) || 'Analisando sua solicitação...';

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: finalMessage,
          analysis: data.analysis,
          proposal,
          timestamp: new Date(),
          phase: responsePhase as 1 | 2 | 3 | 4
        };

        setMessages(prev => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error('Erro ao processar:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-gradient-to-b from-background to-background/95">
        {/* Header - Genesis Theme */}
        <DialogHeader className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative"
              animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center overflow-hidden ring-2 ring-primary/30">
                <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover rounded-full" style={{ mixBlendMode: 'normal' }} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </motion.div>
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                Luna IA
                <Badge className="bg-gradient-to-r from-primary to-primary/60 text-primary-foreground border-0 text-[10px]">
                  GENESIS
                </Badge>
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {isLoading 
                  ? '🔍 Processando...' 
                  : currentProposal 
                    ? `📋 Fase ${conversationPhase} — Aguardando aprovação` 
                    : `✨ Fase ${conversationPhase} — Arquiteta de Fluxos`
                }
              </p>
            </div>
          </div>
        </DialogHeader>

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
                      : 'bg-gradient-to-r from-primary to-primary/60 overflow-hidden'
                  )}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    "flex-1 max-w-[450px]",
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

                    {/* Proposal Preview & Approval */}
                    {message.proposal && !message.isPlanApproved && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Proposta de Arquitetura</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            <span>~{message.proposal.estimatedNodes} nós</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{message.proposal.estimatedTime}</span>
                          </div>
                        </div>
                        
                        {/* Steps preview */}
                        <div className="space-y-2 mb-4">
                          {message.proposal.steps.map((step, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-2 p-2 bg-background/50 rounded-lg"
                            >
                              <span className="text-base">{step.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">{step.title}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                              </div>
                              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                            </motion.div>
                          ))}
                        </div>

                        <div className="border-t border-border/50 pt-3">
                          <p className="text-xs text-muted-foreground mb-3 text-center">
                            Deseja que eu gere esse fluxo agora ou prefere ajustar algo antes?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={approveProposal}
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 gap-2"
                              size="sm"
                              disabled={isLoading}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Sim, gerar!
                            </Button>
                            <Button
                              onClick={rejectProposal}
                              variant="outline"
                              className="flex-1 gap-2"
                              size="sm"
                              disabled={isLoading}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              Ajustar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Approved badge */}
                    {message.proposal && message.isPlanApproved && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 p-3 bg-green-500/10 rounded-xl border border-green-500/30 flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500 font-medium">Proposta aprovada! Construindo...</span>
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
                      <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center overflow-hidden ring-1 ring-primary/20">
                        <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover rounded-full" />
                      </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Analisando...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts - Expanded Grid */}
        <AnimatePresence>
          {showQuickPrompts && !isLoading && messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 border-t border-border max-h-[200px] overflow-auto"
            >
              <p className="text-xs text-muted-foreground mb-3">💡 Escolha um tipo de fluxo ou descreva livremente:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUICK_PROMPTS.map((qp, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(qp.prompt)}
                    className="justify-start gap-2 h-auto py-2.5 px-3 text-xs hover:bg-primary/10 hover:border-primary/50 transition-all flex-col items-start"
                  >
                    <qp.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{qp.label}</span>
                  </Button>
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
              placeholder={currentProposal ? 'Aguardando aprovação da proposta...' : 'Descreva o fluxo que você precisa...'}
              className="min-h-[44px] max-h-32 resize-none text-sm"
              disabled={isLoading || !!currentProposal}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || !!currentProposal}
              className="px-3 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LunaAIModal;
