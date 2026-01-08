/**
 * Genesis Sobre Page - Documentação Institucional Completa
 * Página informativa com demo ao vivo e animações avançadas
 */

import { useState, useEffect, useRef } from 'react';
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
  WifiOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// ============= ANIMATED COMPONENTS =============

// Floating Particles Background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-primary/20"
        initial={{ 
          x: Math.random() * 100 + '%', 
          y: Math.random() * 100 + '%',
          scale: Math.random() * 0.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2
        }}
        animate={{ 
          y: [null, '-100vh'],
          opacity: [null, 0]
        }}
        transition={{
          duration: Math.random() * 20 + 15,
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
      className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
      animate={{ 
        scale: [1, 1.2, 1],
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
      animate={{ 
        scale: [1.2, 1, 1.2],
        x: [0, -40, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"
      animate={{ 
        scale: [1, 1.3, 1],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
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

// ============= LIVE DEMO COMPONENT =============

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
      <div className="h-72 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/30 to-background">
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'bg-gradient-to-br from-primary to-blue-600'
                }`}>
                  {message.role === 'user' 
                    ? <User className="w-4 h-4 text-primary" />
                    : <Bot className="w-4 h-4 text-white" />
                  }
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
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
      <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Perguntas técnicas sugeridas:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 border border-primary/20"
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Faça uma pergunta técnica..."
            disabled={isLoading}
            className="flex-1 bg-muted/50 border-border/50 focus:border-primary"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            size="icon" 
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

// ============= FLOW DEMO COMPONENT =============

const FlowDemoVisualization = () => {
  const [activeStep, setActiveStep] = useState(0);
  
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
    <div className="relative p-6 bg-muted/30 rounded-2xl border">
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
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
                "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                activeStep === index ? step.color : "bg-muted"
              )}>
                <step.icon className={cn(
                  "w-6 h-6",
                  activeStep === index ? "text-white" : "text-muted-foreground"
                )} />
              </div>
              <span className="text-xs mt-2 text-center whitespace-nowrap">{step.label}</span>
            </motion.div>
            
            {index < flowSteps.length - 1 && (
              <motion.div 
                className="w-8 h-0.5 mx-2"
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
        className="mt-4 p-4 bg-card rounded-lg border"
      >
        <p className="text-sm text-muted-foreground">
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
  const [instances] = useState([
    { name: 'Vendas Principal', phone: '+55 11 99999-1234', status: 'connected', messages: 1247 },
    { name: 'Suporte 24h', phone: '+55 11 88888-5678', status: 'connected', messages: 892 },
    { name: 'Financeiro', phone: '+55 21 77777-9012', status: 'connected', messages: 456 },
  ]);

  return (
    <div className="space-y-3">
      {instances.map((instance, index) => (
        <motion.div
          key={instance.name}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:shadow-md transition-shadow"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-500" />
            </div>
            <motion.span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold truncate">{instance.name}</h4>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{instance.phone}</p>
          </div>
          <div className="text-right">
            <motion.div 
              className="text-lg font-bold text-primary"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {instance.messages.toLocaleString()}
            </motion.div>
            <p className="text-xs text-muted-foreground">msgs/dia</p>
          </div>
        </motion.div>
      ))}
    </div>
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
      description: 'Conexão simultânea de múltiplos números WhatsApp Business. Cada instância opera de forma independente com sessão persistente, permitindo gestão centralizada de diversos canais de atendimento.',
      gradient: 'from-green-500/20 to-emerald-500/10',
      features: ['Sessões persistentes', 'Anti-ban nativo', 'Webhook configurável']
    },
    {
      icon: Bot,
      title: 'Chatbots com IA Contextual',
      description: 'Motor de processamento de linguagem natural (NLP) integrado à Luna IA. Entende contexto, histórico de conversas, e responde de forma humanizada.',
      gradient: 'from-purple-500/20 to-pink-500/10',
      features: ['Memória de contexto', 'Análise de sentimento', 'Fallback inteligente']
    },
    {
      icon: GitBranch,
      title: 'Flow Builder Visual',
      description: 'Editor drag-and-drop para construção de automações complexas sem código. Suporta condicionais, loops, variáveis dinâmicas e integrações HTTP.',
      gradient: 'from-blue-500/20 to-cyan-500/10',
      features: ['15+ tipos de nós', 'Variáveis dinâmicas', 'Debug em tempo real']
    },
    {
      icon: Brain,
      title: 'Luna IA - Motor Inteligente',
      description: 'IA proprietária treinada para contextos de negócios. Gera respostas, analisa sentimentos, classifica intenções e automatiza decisões.',
      gradient: 'from-amber-500/20 to-orange-500/10',
      features: ['GPT integrado', 'Fine-tuning por tenant', 'Aprendizado contínuo']
    },
  ];

  const technicalStack = [
    { icon: Server, label: 'Backend Serverless', desc: 'Edge Functions com cold start <50ms' },
    { icon: Database, label: 'PostgreSQL', desc: 'Banco relacional com RLS nativo' },
    { icon: Lock, label: 'Criptografia E2E', desc: 'AES-256 para dados sensíveis' },
    { icon: RefreshCw, label: 'Realtime', desc: 'WebSockets para sync instantâneo' },
    { icon: Webhook, label: 'Webhooks', desc: 'Eventos HTTP configuráveis' },
    { icon: FileJson, label: 'API REST', desc: 'Endpoints documentados com OpenAPI' },
  ];

  const architectureFeatures = [
    {
      icon: Layers,
      title: 'Multi-Tenant Isolado',
      description: 'Cada cliente opera em ambiente completamente isolado. Políticas de Row Level Security (RLS) garantem segregação total de dados no nível do banco.',
    },
    {
      icon: Gauge,
      title: 'Auto-Scaling Horizontal',
      description: 'Infraestrutura escala automaticamente baseada em demanda. Suporta picos de milhões de mensagens sem degradação de performance.',
    },
    {
      icon: Network,
      title: 'CDN Global',
      description: 'Assets e APIs distribuídos em edge locations globais. Latência média inferior a 100ms para qualquer região do Brasil.',
    },
    {
      icon: History,
      title: 'Backup Contínuo',
      description: 'Point-in-time recovery com retenção de 30 dias. Backups automáticos a cada 5 minutos com replicação geográfica.',
    },
  ];

  const securityFeatures = [
    { icon: Fingerprint, title: 'Autenticação MFA', desc: 'Multi-factor authentication obrigatório' },
    { icon: Eye, title: 'Audit Logs', desc: 'Registro imutável de todas as ações' },
    { icon: Shield, title: 'LGPD Compliant', desc: 'Conformidade total com proteção de dados' },
    { icon: Lock, title: 'SOC 2 Type II', desc: 'Certificação enterprise em andamento' },
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
        className="relative py-20 md:py-32 overflow-hidden"
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
                Documentação Técnica Completa + Demo Ao Vivo
              </Badge>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="block">Genesis Hub</span>
              <span className="block text-xl sm:text-2xl md:text-3xl text-muted-foreground mt-4">
                Plataforma de <TypewriterText texts={['Automação WhatsApp', 'Chatbots Inteligentes', 'IA Contextual', 'Multi-Instâncias']} />
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Documentação completa da arquitetura, módulos, capacidades técnicas e 
              <strong className="text-foreground"> demonstração ao vivo </strong>
              da plataforma enterprise de automação.
            </p>

            {/* Quick nav */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {[
                { name: 'Demo ao Vivo', icon: Play },
                { name: 'Módulos', icon: Blocks },
                { name: 'Arquitetura', icon: Server },
                { name: 'Segurança', icon: Shield },
              ].map((item) => (
                <motion.a 
                  key={item.name}
                  href={`#${item.name.toLowerCase().replace(' ', '-')}`}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-2"
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

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-y relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <motion.div 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1"
                  whileHover={{ scale: 1.1 }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </motion.div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO SECTION */}
      <Section
        id="demo-ao-vivo"
        badge="🔴 AO VIVO"
        title="Teste a Luna IA em Tempo Real"
        subtitle="Esta é a mesma inteligência artificial que processa milhões de mensagens. Faça perguntas técnicas e veja como ela responde."
        className="bg-gradient-to-b from-background via-primary/5 to-background"
      >
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <LiveDemoChat />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="p-6 border-primary/20">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Instâncias Ativas (Simulação)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InstanceStatusDemo />
              </CardContent>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Performance Real</h4>
                  <p className="text-sm text-muted-foreground">
                    O tempo de resposta que você está experimentando é real. 
                    Edge Functions processam em <strong>&lt;50ms</strong> de cold start, 
                    e a Luna IA responde em média em <strong>&lt;3 segundos</strong>.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Separator />

      {/* Flow Demo */}
      <Section
        id="flow-demo"
        badge="Automação"
        title="Visualização de Flow em Tempo Real"
        subtitle="Veja como uma mensagem flui pelo sistema, desde o recebimento até a resposta automatizada."
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <FlowDemoVisualization />
        </motion.div>
      </Section>

      <Separator />

      {/* Módulos Core */}
      <Section
        id="módulos"
        badge="Funcionalidades"
        title="Módulos Principais"
        subtitle="Os quatro pilares que formam a base da plataforma Genesis."
        className="bg-muted/10"
      >
        <div className="grid md:grid-cols-2 gap-6">
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
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br",
                      module.gradient
                    )}>
                      <module.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{module.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{module.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {module.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
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

      {/* Stack Técnica */}
      <Section
        id="arquitetura"
        badge="Tecnologia"
        title="Arquitetura & Stack Técnica"
        subtitle="Infraestrutura enterprise construída para escala e confiabilidade."
      >
        <div className="space-y-12">
          {/* Tech Stack Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {technicalStack.map((tech, idx) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full text-center p-4 hover:shadow-lg transition-all hover:border-primary/30">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <tech.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{tech.label}</h4>
                  <p className="text-xs text-muted-foreground">{tech.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Architecture Features */}
          <div className="grid md:grid-cols-2 gap-6">
            {architectureFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Performance Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-primary/20">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Métricas de Performance (Dados Reais)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Latência Média', value: '<100ms' },
                    { label: 'Throughput', value: '10k msg/s' },
                    { label: 'Cold Start', value: '<50ms' },
                    { label: 'SLA', value: '99.95%' },
                  ].map((metric) => (
                    <motion.div 
                      key={metric.label} 
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl font-bold text-primary">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Separator />

      {/* Segurança */}
      <Section
        id="segurança"
        badge="Compliance"
        title="Segurança & Conformidade"
        subtitle="Padrões enterprise de proteção de dados e privacidade."
        className="bg-muted/10"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full p-5 text-center hover:shadow-lg transition-all hover:border-green-500/30">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Card className="p-6 bg-green-500/5 border-green-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold mb-2">Compromisso com Segurança</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). 
                  Políticas de Row Level Security (RLS) garantem isolamento completo entre tenants. 
                  Logs de auditoria imutáveis registram todas as operações sensíveis do sistema.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/30 relative">
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
