/**
 * Genesis Sobre Page - Documentação Institucional Completa
 * Página informativa com demo ao vivo, Flow Builder e envio WhatsApp real
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { 
  Zap, 
  MessageSquare, 
  Bot, 
  GitBranch, 
  Shield, 
  TrendingUp,
  Users,
  Building2,
  Globe,
  Sparkles,
  CheckCircle,
  BarChart3,
  Clock,
  Target,
  Layers,
  Code,
  Lock,
  Cpu,
  ChevronDown,
  Server,
  Database,
  Workflow,
  Brain,
  Settings,
  Webhook,
  FileJson,
  Blocks,
  Network,
  Gauge,
  Eye,
  Fingerprint,
  History,
  RefreshCw,
  Terminal,
  Package,
  Puzzle,
  Send,
  User,
  Play,
  ArrowRight,
  CheckCircle2,
  Activity,
  Smartphone,
  MousePointerClick,
  Timer,
  Wifi,
  WifiOff,
  Phone,
  MessageCircle,
  Check,
  X,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Rocket,
  PartyPopper
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealFlowBuilderDemo } from '@/components/sobre/RealFlowBuilderDemo';

// ============= ANIMATED COMPONENTS =============

// Floating Particles Background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: Math.random() * 6 + 2,
          height: Math.random() * 6 + 2,
          background: `radial-gradient(circle, hsl(var(--primary) / ${Math.random() * 0.3 + 0.1}), transparent)`,
        }}
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: Math.random() * 100 + '%',
          scale: Math.random() * 0.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2
        }}
        animate={{ 
          y: [null, '-100vh'],
          x: [null, `${Math.random() * 20 - 10}%`],
          opacity: [null, 0],
          rotate: [0, 360]
        }}
        transition={{
          duration: Math.random() * 25 + 15,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 10
        }}
      />
    ))}
  </div>
);

// Animated Gradient Orbs
const GradientOrbs = () => (
  <>
    <motion.div 
      className="absolute top-20 left-10 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"
      animate={{ 
        scale: [1, 1.3, 1],
        x: [0, 50, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-radial from-blue-500/15 to-transparent rounded-full blur-3xl"
      animate={{ 
        scale: [1.2, 1, 1.2],
        x: [0, -60, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-radial from-green-500/10 to-transparent rounded-full blur-3xl"
      animate={{ 
        scale: [1, 1.4, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
    />
  </>
);

// Animated counter component
const AnimatedCounter = ({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Typewriter effect
const TypewriterText = ({ texts }: { texts: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = texts[currentIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentIndex, texts]);

  return (
    <span className="text-primary">
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-8 bg-primary ml-1"
      />
    </span>
  );
};

// Section component for consistent styling
const Section = ({ 
  id, 
  title, 
  subtitle, 
  badge, 
  children, 
  className 
}: { 
  id?: string;
  title: string; 
  subtitle?: string; 
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={cn("py-16 md:py-24 relative", className)}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        {badge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">{badge}</Badge>
          </motion.div>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-muted-foreground max-w-3xl">{subtitle}</p>}
      </motion.div>
      {children}
    </div>
  </section>
);

// 3D Card with tilt effect
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 20);
    setRotateY((centerX - x) / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d'
      }}
      className={cn("transition-transform duration-200", className)}
    >
      {children}
    </motion.div>
  );
};

// ============= LIVE DEMO CHAT =============

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const LiveDemoChat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou a Luna IA, o motor inteligente do Genesis Hub.\n\nPode me fazer qualquer pergunta sobre a plataforma! Estou aqui para demonstrar como funciono em tempo real. 🚀',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    '🤖 Como a Luna processa linguagem natural?',
    '🔄 Como funcionam os flows?',
    '📊 Quais métricas são rastreadas?',
    '🔒 Como é a segurança da plataforma?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('proposal-chat', {
        body: {
          message: text,
          context: {
            isVendaDemo: true,
            conversationHistory,
          },
          systemPrompt: `Você é a Luna, a IA do Genesis Hub. Esta é uma página de DOCUMENTAÇÃO TÉCNICA, então responda de forma técnica e detalhada.

SOBRE O GENESIS HUB:
- Plataforma SaaS completa para automação WhatsApp enterprise
- Multi-tenant com isolamento total via RLS (Row Level Security)
- Flow Builder visual drag-and-drop com 15+ tipos de nós
- Motor de NLP (Processamento de Linguagem Natural) proprietário
- Integrações via webhooks, API REST, e conectores nativos

ARQUITETURA TÉCNICA:
- Backend: Edge Functions serverless com cold start <50ms
- Banco: PostgreSQL com RLS nativo e replicação
- Realtime: WebSockets para sync instantâneo
- Criptografia: AES-256 para dados sensíveis, TLS 1.3 em trânsito
- CDN: Edge locations globais, latência <100ms no Brasil

MÓDULOS PRINCIPAIS:
1. WhatsApp Multi-Instância: conexão simultânea de múltiplos números
2. Chatbots com IA Contextual: entende contexto e histórico
3. Flow Builder Visual: automações complexas sem código
4. Luna IA: NLP avançado, análise de sentimento, classificação de intenções

SISTEMA DE ECONOMIA:
- Planos com limites configuráveis
- Créditos consumíveis por ação
- Analytics de consumo em tempo real
- Regras de overusage customizáveis

REGRAS:
1. Respostas técnicas e detalhadas (3-5 frases)
2. Use terminologia técnica correta
3. Seja objetivo e informativo
4. Cite dados específicos quando relevante
5. Use 1 emoji por resposta no máximo
6. Não faça CTAs de venda, isso é documentação`,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'Desculpe, ocorreu um erro na comunicação.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ocorreu um erro técnico na demonstração. O sistema de edge functions pode estar processando. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/30 shadow-2xl shadow-primary/10 bg-card/95 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-cyan-600 p-4 flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Activity className="w-2 h-2 text-white" />
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white">Luna IA</h3>
            <Badge className="bg-white/20 text-white text-[10px] border-white/30">LIVE</Badge>
          </div>
          <p className="text-sm text-white/80">Motor de NLP do Genesis Hub</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/30 to-background">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-gradient-to-br from-primary to-blue-600'
                }`}>
                  {message.role === 'user' 
                    ? <User className="w-3.5 h-3.5 text-primary" />
                    : <Bot className="w-3.5 h-3.5 text-white" />
                  }
                </div>
                <div className={`rounded-2xl px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border/50 rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-3 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 border border-primary/20"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta técnica..."
            disabled={isLoading}
            className="flex-1 h-9 text-sm bg-muted/50 border-border/50 focus:border-primary"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            size="sm" 
            className="shrink-0 h-9 w-9 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

// ============= WHATSAPP TEST MESSAGE =============

const WhatsAppTestMessage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length >= 12) return digits;
    if (digits.length === 10 || digits.length === 11) return `55${digits}`;
    return digits;
  };

  const formatPhoneDisplay = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length <= 2) return clean;
    if (clean.length <= 4) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length <= 9) return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const sendTestMessage = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      setError('Digite um número válido com DDD');
      return;
    }

    setIsSending(true);
    setError('');
    setSent(false);

    try {
      const normalizedPhone = normalizePhone(phoneNumber);
      
      // Mensagem profissional da Genesis Hub
      const genesisMessage = `🚀 *Genesis Hub - Plataforma de Automação*

Olá! Esta é uma mensagem de demonstração enviada diretamente pela nossa plataforma.

✅ *O que você acabou de experimentar:*
• Envio automatizado via API WhatsApp Business
• Latência média de processamento: <3 segundos
• Infraestrutura serverless com 99.9% de uptime

💡 *Imagine automatizar:*
• Atendimento 24/7 com IA contextual
• Disparos em massa segmentados
• Chatbots inteligentes sem código
• Integrações com seu CRM

🔗 A Genesis processa milhões de mensagens por mês para empresas de todos os portes.

_Esta mensagem foi enviada pela demonstração pública do Genesis Hub._`;

      // Usar o proxy do genesis-backend-proxy com a instância do super admin
      const { data, error: fnError } = await supabase.functions.invoke('genesis-backend-proxy', {
        body: {
          action: 'demo-send',
          to: normalizedPhone,
          message: genesisMessage,
        },
      });

      if (fnError) throw fnError;

      if (data?.success) {
        setSent(true);
        toast.success('Mensagem enviada com sucesso!', {
          description: 'Verifique seu WhatsApp 📱',
          icon: <PartyPopper className="w-4 h-4" />
        });
      } else {
        throw new Error(data?.error || 'Falha no envio');
      }
    } catch (err: any) {
      console.error('Erro ao enviar:', err);
      setError('Não foi possível enviar. Tente novamente.');
      toast.error('Erro no envio', {
        description: 'O sistema pode estar processando outras requisições'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/10 bg-card/95 backdrop-blur-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">Teste Real no WhatsApp</h3>
              <Badge className="bg-white/20 text-white text-[10px] border-white/30">LIVE</Badge>
            </div>
            <p className="text-sm text-white/80">Receba uma mensagem agora</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 space-y-4">
        {!sent ? (
          <>
            <div className="text-center space-y-2">
              <motion.div 
                className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Smartphone className="w-8 h-8 text-green-600" />
              </motion.div>
              <h4 className="font-bold text-lg">Experimente o Envio Real</h4>
              <p className="text-sm text-muted-foreground">
                Digite seu número e receba uma mensagem demonstrando o poder da plataforma Genesis.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Seu WhatsApp (com DDD)
                </label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(formatPhoneDisplay(e.target.value));
                    setError('');
                  }}
                  placeholder="(27) 99999-9999"
                  className="text-center text-lg font-mono h-12 border-green-500/30 focus:border-green-500"
                  maxLength={16}
                />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <Button 
                onClick={sendTestMessage}
                disabled={isSending || phoneNumber.replace(/\D/g, '').length < 10}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Enviar Mensagem de Teste
                  </>
                )}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                ⚡ Latência média: menos de 3 segundos
              </p>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <motion.div 
              className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <div>
              <h4 className="font-bold text-xl text-green-600">Mensagem Enviada! 🎉</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Verifique seu WhatsApp. A mensagem deve chegar em segundos.
              </p>
            </div>

            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-xs text-muted-foreground mb-2">Isso demonstra:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['API Robusta', 'Baixa Latência', 'Alta Disponibilidade'].map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                setSent(false);
                setPhoneNumber('');
              }}
              className="border-green-500/30"
            >
              Testar outro número
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

// ============= FLOW DEMO VISUALIZATION =============

const FlowDemoVisualization = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const flowSteps = [
    { id: 'trigger', label: 'Mensagem Recebida', icon: MessageSquare, color: 'bg-green-500' },
    { id: 'condition', label: 'Análise de Intenção', icon: Brain, color: 'bg-purple-500' },
    { id: 'luna', label: 'Luna IA Processa', icon: Bot, color: 'bg-blue-500' },
    { id: 'action', label: 'Ação Executada', icon: Zap, color: 'bg-amber-500' },
    { id: 'response', label: 'Resposta Enviada', icon: Send, color: 'bg-primary' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % flowSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative p-4 sm:p-6 bg-muted/30 rounded-2xl border overflow-x-auto">
      <div className={cn(
        "flex items-center gap-2 sm:gap-4",
        isMobile ? "min-w-max pb-2" : "justify-between flex-wrap"
      )}>
        {flowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              animate={{
                scale: activeStep === index ? 1.1 : 1,
                opacity: activeStep >= index ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className={cn(
                "w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors",
                activeStep === index ? step.color : "bg-muted"
              )}>
                <step.icon className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6",
                  activeStep === index ? "text-white" : "text-muted-foreground"
                )} />
              </div>
              <span className="text-[10px] sm:text-xs mt-1 sm:mt-2 text-center whitespace-nowrap">{step.label}</span>
            </motion.div>
            
            {index < flowSteps.length - 1 && (
              <motion.div 
                className="w-4 sm:w-8 h-0.5 mx-1 sm:mx-2"
                animate={{
                  backgroundColor: activeStep > index ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>
      
      <motion.div 
        key={activeStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 sm:mt-4 p-3 sm:p-4 bg-card rounded-lg border"
      >
        <p className="text-xs sm:text-sm text-muted-foreground">
          {activeStep === 0 && "📱 Mensagem do cliente recebida via webhook da API WhatsApp Business"}
          {activeStep === 1 && "🧠 NLP classifica intenção: suporte, venda, dúvida, reclamação..."}
          {activeStep === 2 && "🤖 Luna IA processa contexto, histórico e gera resposta personalizada"}
          {activeStep === 3 && "⚡ Sistema executa ações: atualiza CRM, envia email, dispara webhook..."}
          {activeStep === 4 && "✅ Resposta enviada ao cliente em <3 segundos via API"}
        </p>
      </motion.div>
    </div>
  );
};

// ============= INSTANCE STATUS DEMO =============

const InstanceStatusDemo = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const instances = [
    { name: 'Vendas Principal', phone: '+55 11 99999-1234', status: 'connected', messages: 1247 },
    { name: 'Suporte 24h', phone: '+55 11 88888-5678', status: 'connected', messages: 892 },
    { name: 'Financeiro', phone: '+55 21 77777-9012', status: 'connected', messages: 456 },
  ];

  return (
    <div className="space-y-2">
      {instances.map((instance, index) => (
        <motion.div
          key={instance.name}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-card rounded-xl border hover:shadow-md transition-shadow"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
            </div>
            <motion.span 
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs sm:text-sm truncate">{instance.name}</h4>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{instance.phone}</p>
          </div>
          <div className="text-right shrink-0">
            <motion.div 
              className="text-xs sm:text-sm font-bold text-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {instance.messages.toLocaleString()}
            </motion.div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">msgs/dia</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============= CAMPAIGNS DEMO =============

const CampaignsDemo = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'schedule'>('overview');
  
  const campaigns = [
    { 
      name: 'Black Friday 2024', 
      status: 'active', 
      sent: 15420, 
      delivered: 15180, 
      read: 12340, 
      clicks: 3420,
      progress: 85 
    },
    { 
      name: 'Recuperação Carrinho', 
      status: 'active', 
      sent: 8920, 
      delivered: 8750, 
      read: 7200, 
      clicks: 2100,
      progress: 100 
    },
    { 
      name: 'Boas-vindas Novos Clientes', 
      status: 'scheduled', 
      sent: 0, 
      delivered: 0, 
      read: 0, 
      clicks: 0,
      progress: 0 
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Sistema de Campanhas</CardTitle>
              <p className="text-xs text-muted-foreground">Disparo em massa segmentado</p>
            </div>
          </div>
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            3 Campanhas Ativas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { id: 'overview', label: 'Campanhas', icon: Rocket },
            { id: 'metrics', label: 'Métricas', icon: BarChart3 },
            { id: 'schedule', label: 'Agendamento', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-background shadow text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {campaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-muted/50 rounded-lg border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        campaign.status === 'active' ? "bg-green-500 animate-pulse" : "bg-amber-500"
                      )} />
                      <span className="font-medium text-sm">{campaign.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {campaign.status === 'active' ? 'Ativa' : 'Agendada'}
                    </Badge>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${campaign.progress}%` }}
                      transition={{ duration: 1, delay: idx * 0.2 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>{campaign.sent.toLocaleString()} enviadas</span>
                    <span>{campaign.progress}% concluído</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { label: 'Taxa de Entrega', value: '98.4%', icon: CheckCircle, color: 'text-green-500' },
                { label: 'Taxa de Leitura', value: '81.3%', icon: Eye, color: 'text-blue-500' },
                { label: 'Taxa de Cliques', value: '22.5%', icon: MousePointerClick, color: 'text-purple-500' },
                { label: 'Conversão', value: '8.7%', icon: Target, color: 'text-amber-500' },
              ].map((metric, idx) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 bg-muted/50 rounded-lg border text-center"
                >
                  <metric.icon className={cn("w-5 h-5 mx-auto mb-1", metric.color)} />
                  <div className="text-lg font-bold">{metric.value}</div>
                  <div className="text-[10px] text-muted-foreground">{metric.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="p-3 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Agendamento Inteligente</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  IA analisa horários de maior engajamento de cada contato
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center text-xs font-medium",
                        idx === 0 || idx === 6 
                          ? "bg-muted text-muted-foreground" 
                          : "bg-primary/20 text-primary"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-700 dark:text-green-400">
                  Próxima campanha agendada para hoje às 14:30
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features list */}
        <div className="pt-3 border-t">
          <div className="flex flex-wrap gap-1">
            {['Segmentação Avançada', 'Templates Dinâmicos', 'A/B Testing', 'Rate Limiting'].map((feature) => (
              <Badge key={feature} variant="outline" className="text-[10px]">
                <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============= MAIN COMPONENT =============

export default function Sobre() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const stats = [
    { value: 2500000, label: 'Mensagens Processadas', suffix: '+' },
    { value: 1200, label: 'Empresas Utilizando', suffix: '+' },
    { value: 99.9, label: 'Disponibilidade', suffix: '%' },
    { value: 50, label: 'Integrações Disponíveis', suffix: '+' },
  ];

  const coreModules = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Multi-Instância',
      description: 'Conexão simultânea de múltiplos números WhatsApp Business. Cada instância opera de forma independente com sessão persistente.',
      gradient: 'from-green-500/20 to-emerald-500/10',
      features: ['Sessões persistentes', 'Anti-ban nativo', 'Webhook configurável']
    },
    {
      icon: Bot,
      title: 'Chatbots com IA Contextual',
      description: 'Motor de NLP integrado à Luna IA. Entende contexto, histórico de conversas, e responde de forma humanizada.',
      gradient: 'from-purple-500/20 to-pink-500/10',
      features: ['Memória de contexto', 'Análise de sentimento', 'Fallback inteligente']
    },
    {
      icon: GitBranch,
      title: 'Flow Builder Visual',
      description: 'Editor drag-and-drop para automações complexas sem código. Suporta condicionais, loops e variáveis dinâmicas.',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      features: ['15+ tipos de nós', 'Variáveis dinâmicas', 'Debug em tempo real']
    },
    {
      icon: Brain,
      title: 'Luna IA - Motor Inteligente',
      description: 'IA proprietária para contextos de negócios. Gera respostas, analisa sentimentos e classifica intenções.',
      gradient: 'from-amber-500/20 to-orange-500/10',
      features: ['GPT integrado', 'Fine-tuning por tenant', 'Aprendizado contínuo']
    },
  ];

  const technicalStack = [
    { icon: Server, label: 'Backend Serverless', desc: 'Edge Functions <50ms' },
    { icon: Database, label: 'PostgreSQL', desc: 'Banco com RLS nativo' },
    { icon: Lock, label: 'Criptografia E2E', desc: 'AES-256 para dados' },
    { icon: RefreshCw, label: 'Realtime', desc: 'WebSockets sync' },
    { icon: Webhook, label: 'Webhooks', desc: 'Eventos HTTP' },
    { icon: FileJson, label: 'API REST', desc: 'OpenAPI docs' },
  ];

  const securityFeatures = [
    { icon: Fingerprint, title: 'Autenticação MFA', desc: 'Multi-factor obrigatório' },
    { icon: Eye, title: 'Audit Logs', desc: 'Registro imutável' },
    { icon: Shield, title: 'LGPD Compliant', desc: 'Proteção de dados' },
    { icon: Lock, title: 'SOC 2 Type II', desc: 'Certificação enterprise' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Floating Background Elements */}
      <FloatingParticles />
      <GradientOrbs />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Zap className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <span className="text-xl font-bold">Genesis</span>
                <span className="text-xs text-muted-foreground ml-2">Documentação</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex bg-green-500/10 text-green-600 border-green-500/20">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                Sistema Online
              </Badge>
              <Badge variant="outline" className="hidden sm:flex">v2.0 Enterprise</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section 
        className="relative py-16 md:py-24 overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Teste ao Vivo + Flow Builder + Envio WhatsApp Real
              </Badge>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="block">Genesis Hub</span>
              <span className="block text-xl sm:text-2xl md:text-3xl text-muted-foreground mt-4">
                Plataforma de <TypewriterText texts={['Automação WhatsApp', 'Chatbots Inteligentes', 'IA Contextual', 'Multi-Instâncias']} />
              </span>
            </h1>
            
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              Documentação completa com <strong className="text-foreground">demonstrações ao vivo</strong>, 
              Flow Builder interativo e envio real de mensagens WhatsApp.
            </p>

            {/* Quick nav */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {[
                { name: 'Teste WhatsApp', icon: MessageCircle, color: 'hover:bg-green-500' },
                { name: 'Flow Builder', icon: GitBranch, color: 'hover:bg-blue-500' },
                { name: 'Campanhas', icon: Rocket, color: 'hover:bg-orange-500' },
                { name: 'Luna IA', icon: Bot, color: 'hover:bg-purple-500' },
              ].map((item) => (
                <motion.a 
                  key={item.name}
                  href={`#${item.name.toLowerCase().replace(' ', '-')}`}
                  className={cn(
                    "px-4 py-2 rounded-full bg-muted transition-all flex items-center gap-2",
                    item.color, "hover:text-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        </div>
      </motion.section>

      {/* SEÇÃO 1: LUNA IA */}
      <Section
        id="luna-ia-demo"
        badge="🤖 INTELIGÊNCIA ARTIFICIAL"
        title="Luna IA - Motor de Processamento Natural"
        subtitle="Converse com a Luna, nossa IA de processamento de linguagem natural. Ela entende contexto, histórico e responde de forma humanizada em tempo real."
        className="bg-gradient-to-b from-background via-purple-500/5 to-background"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <LiveDemoChat />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                Capacidades da Luna IA
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Brain, title: 'NLP Avançado', desc: 'Entende variações de escrita, gírias e contexto regional brasileiro' },
                  { icon: MessageSquare, title: 'Memória de Contexto', desc: 'Mantém histórico da conversa para respostas coerentes' },
                  { icon: Zap, title: 'Classificação de Intenção', desc: 'Identifica automaticamente se é venda, suporte ou dúvida' },
                  { icon: TrendingUp, title: 'Análise de Sentimento', desc: 'Detecta frustração ou satisfação para adaptar tom' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Separator />

      {/* SEÇÃO 2: FLOW BUILDER */}
      <Section
        id="flow-builder"
        badge="🔧 AUTOMAÇÃO VISUAL"
        title="Flow Builder - Crie Fluxos Sem Código"
        subtitle="Editor drag-and-drop para criar automações complexas. Arraste nós, conecte-os e veja o fluxo em ação com simulação em tempo real."
        className="bg-gradient-to-b from-background via-blue-500/5 to-background"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <RealFlowBuilderDemo />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-500" />
                Recursos do Flow Builder
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Blocks, title: '15+ Tipos de Nós', desc: 'Gatilhos, condições, ações, delays, IA, webhooks e mais' },
                  { icon: GitBranch, title: 'Condicionais Avançadas', desc: 'Divida fluxos com lógica baseada em variáveis e contexto' },
                  { icon: Activity, title: 'Simulação em Tempo Real', desc: 'Teste seu fluxo antes de ativar com preview visual' },
                  { icon: Code, title: 'Variáveis Dinâmicas', desc: 'Use {{nome}}, {{telefone}} e dados coletados no fluxo' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Flow Visualization */}
            <FlowDemoVisualization />
          </motion.div>
        </div>
      </Section>

      <Separator />

      {/* SEÇÃO 3: WHATSAPP TESTE REAL */}
      <Section
        id="teste-whatsapp"
        badge="📱 ENVIO REAL"
        title="Teste o Envio via WhatsApp Agora"
        subtitle="Digite seu número e receba uma mensagem demonstrando a API de envio do Genesis. É real - você vai receber no seu WhatsApp!"
        className="bg-gradient-to-b from-background via-green-500/5 to-background"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <WhatsAppTestMessage />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-500" />
                API WhatsApp Business
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Zap, title: 'Latência < 3 segundos', desc: 'Envio instantâneo via conexão direta com servidores WhatsApp' },
                  { icon: Shield, title: 'Anti-Ban Nativo', desc: 'Proteção automática com rate limiting e delays humanizados' },
                  { icon: Activity, title: 'Multi-Instância', desc: 'Conecte múltiplos números simultaneamente com sessão persistente' },
                  { icon: Webhook, title: 'Webhooks em Tempo Real', desc: 'Receba eventos de mensagens, leituras e status de entrega' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Performance metrics */}
            <Card className="p-5 bg-green-500/5 border-green-500/20">
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { value: '<50ms', label: 'Cold Start' },
                  { value: '<3s', label: 'Latência' },
                  { value: '99.9%', label: 'Uptime' },
                  { value: '10k/s', label: 'Throughput' },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="text-lg font-bold text-green-600">{metric.value}</div>
                    <div className="text-[10px] text-muted-foreground">{metric.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Separator />

      {/* Flow Demo Visualization */}
      <Section
        id="luna-ia"
        badge="Automação"
        title="Como uma Mensagem Flui pelo Sistema"
        subtitle="Visualização em tempo real do pipeline de processamento de mensagens."
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <FlowDemoVisualization />
        </motion.div>
      </Section>

      <Separator />

      {/* Campaigns Section */}
      <Section
        id="campanhas"
        badge="Disparo em Massa"
        title="Sistema de Campanhas Inteligentes"
        subtitle="Envie milhares de mensagens segmentadas com análise de resultados em tempo real."
        className="bg-gradient-to-b from-background via-orange-500/5 to-background"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <CampaignsDemo />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <Card className="p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-orange-500" />
                Funcionalidades Avançadas
              </h3>
              <div className="space-y-3">
                {[
                  { 
                    icon: Users, 
                    title: 'Segmentação Inteligente', 
                    desc: 'Crie públicos dinâmicos baseados em comportamento, tags, histórico de compras e muito mais.' 
                  },
                  { 
                    icon: Clock, 
                    title: 'Agendamento Otimizado', 
                    desc: 'IA identifica o melhor horário de envio para cada contato maximizando engajamento.' 
                  },
                  { 
                    icon: BarChart3, 
                    title: 'Analytics em Tempo Real', 
                    desc: 'Dashboard com métricas de entrega, leitura, cliques e conversões em tempo real.' 
                  },
                  { 
                    icon: Shield, 
                    title: 'Rate Limiting Automático', 
                    desc: 'Controle de velocidade inteligente para evitar bloqueios e garantir entregas.' 
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">ROI Comprovado</h4>
                  <p className="text-xs text-muted-foreground">Resultados de clientes reais</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">340%</div>
                  <div className="text-[10px] text-muted-foreground">Aumento em Vendas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">-67%</div>
                  <div className="text-[10px] text-muted-foreground">Custo por Lead</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">4.2x</div>
                  <div className="text-[10px] text-muted-foreground">Taxa de Conversão</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Instance Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                Instâncias Ativas
              </h4>
              <Badge variant="outline" className="text-green-600 border-green-500/30">
                3 Conectadas
              </Badge>
            </div>
            <InstanceStatusDemo />
          </Card>
        </motion.div>
      </Section>

      <Separator />

      {/* Core Modules */}
      <Section
        badge="Funcionalidades"
        title="Módulos Principais"
        subtitle="Os quatro pilares da plataforma Genesis."
        className="bg-muted/10"
      >
        <div className="grid md:grid-cols-2 gap-5">
          {coreModules.map((module, idx) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <TiltCard>
                <Card className="h-full overflow-hidden">
                  <CardContent className="p-5">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                      module.gradient
                    )}>
                      <module.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{module.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">{module.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {module.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </Section>

      <Separator />

      {/* Technical Stack */}
      <Section
        id="arquitetura"
        badge="Tecnologia"
        title="Stack Técnica"
        subtitle="Infraestrutura enterprise construída para escala."
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {technicalStack.map((tech, idx) => (
            <motion.div
              key={tech.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full text-center p-3 hover:shadow-lg transition-all hover:border-primary/30">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <tech.icon className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-semibold text-xs mb-0.5">{tech.label}</h4>
                <p className="text-[10px] text-muted-foreground">{tech.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      <Separator />

      {/* Security */}
      <Section
        badge="Compliance"
        title="Segurança & Conformidade"
        subtitle="Padrões enterprise de proteção de dados."
        className="bg-muted/10"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full p-4 text-center hover:shadow-lg transition-all hover:border-green-500/30">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-bold text-sm mb-0.5">{feature.title}</h4>
                <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-6 border-t bg-muted/30 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Zap className="w-4 h-4 text-primary-foreground" />
              </motion.div>
              <span className="font-bold">Genesis Hub</span>
              <Badge variant="outline" className="text-xs">Documentação Técnica</Badge>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Genesis Hub. Plataforma Enterprise de Automação WhatsApp.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
