/**
 * Genesis Sobre Page - Documentação Institucional
 * Página informativa e completa sobre a plataforma Genesis
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  Puzzle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Animated counter component
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
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
  <section id={id} className={cn("py-16 md:py-24", className)}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        {badge && <Badge className="mb-4" variant="outline">{badge}</Badge>}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-lg text-muted-foreground max-w-3xl">{subtitle}</p>}
      </motion.div>
      {children}
    </div>
  </section>
);

// Info Card component
const InfoCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
      <CardContent className="p-6">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
          gradient || "from-primary/20 to-primary/5"
        )}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Sobre() {
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

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
    },
    {
      icon: Bot,
      title: 'Chatbots com IA Contextual',
      description: 'Motor de processamento de linguagem natural (NLP) integrado à Luna IA. Entende contexto, histórico de conversas, e responde de forma humanizada. Suporta fallback para atendimento humano.',
      gradient: 'from-purple-500/20 to-pink-500/10',
    },
    {
      icon: GitBranch,
      title: 'Flow Builder Visual',
      description: 'Editor drag-and-drop para construção de automações complexas sem código. Suporta condicionais, loops, variáveis dinâmicas, integrações HTTP e processamento assíncrono.',
      gradient: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      icon: Brain,
      title: 'Luna IA - Motor Inteligente',
      description: 'IA proprietária treinada para contextos de negócios. Gera respostas, analisa sentimentos, classifica intenções e automatiza decisões baseadas em regras configuráveis.',
      gradient: 'from-amber-500/20 to-orange-500/10',
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
      description: 'Cada cliente opera em ambiente completamente isolado. Políticas de Row Level Security (RLS) garantem segregação total de dados no nível do banco de dados.',
    },
    {
      icon: Gauge,
      title: 'Auto-Scaling Horizontal',
      description: 'Infraestrutura escala automaticamente baseada em demanda. Suporta picos de milhões de mensagens sem degradação de performance ou latência.',
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
    { icon: Fingerprint, title: 'Autenticação MFA', desc: 'Multi-factor authentication obrigatório para admins' },
    { icon: Eye, title: 'Audit Logs', desc: 'Registro imutável de todas as ações no sistema' },
    { icon: Shield, title: 'LGPD Compliant', desc: 'Conformidade total com a Lei Geral de Proteção de Dados' },
    { icon: Lock, title: 'SOC 2 Type II', desc: 'Certificação de segurança enterprise em andamento' },
  ];

  const economySystem = [
    { icon: Package, title: 'Planos Configuráveis', desc: 'Sistema flexível de planos com limites e recursos customizáveis' },
    { icon: Zap, title: 'Créditos Consumíveis', desc: 'Modelo pay-per-use para ações específicas (mensagens, IA, webhooks)' },
    { icon: BarChart3, title: 'Analytics de Consumo', desc: 'Dashboard em tempo real de uso e custos por tenant' },
    { icon: Settings, title: 'Regras de Overusage', desc: 'Configuração de comportamento quando limites são atingidos' },
  ];

  const integrations = [
    'WhatsApp Business API',
    'OpenAI / GPT',
    'Google Sheets',
    'Webhooks HTTP',
    'Stripe / Pagamentos',
    'CRMs (HubSpot, Pipedrive)',
    'ERPs diversos',
    'APIs REST customizadas',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold">Genesis</span>
                <span className="text-xs text-muted-foreground ml-2">Documentação</span>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">v2.0 Enterprise</Badge>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Documentação Técnica Completa
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="block">Genesis Hub</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-muted-foreground mt-2">
                Plataforma de Automação WhatsApp Enterprise
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              A Genesis é uma plataforma SaaS completa para automação de comunicação empresarial via WhatsApp. 
              Este documento detalha a arquitetura, módulos, capacidades técnicas e diferenciais da solução.
            </p>

            {/* Quick nav */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {['Visão Geral', 'Módulos', 'Arquitetura', 'Segurança', 'Economia'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  {item}
                </a>
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
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-y">
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
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visão Geral */}
      <Section 
        id="visão-geral"
        badge="Introdução"
        title="O que é a Genesis?"
        subtitle="Uma visão completa da plataforma e seu propósito no ecossistema de automação empresarial."
      >
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Propósito
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-sm leading-relaxed space-y-3">
                <p>
                  A Genesis foi desenvolvida para resolver o problema de <strong>escalabilidade no atendimento via WhatsApp</strong>. 
                  Empresas que recebem alto volume de mensagens precisam de automação inteligente, não apenas respostas automáticas genéricas.
                </p>
                <p>
                  A plataforma combina <strong>chatbots com IA contextual</strong>, <strong>fluxos visuais programáveis</strong> e 
                  <strong> gestão multi-instância</strong> para criar uma solução enterprise completa.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  Para Quem
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-muted-foreground text-sm leading-relaxed space-y-3">
                <p>
                  <strong>Empresas de médio e grande porte</strong> que precisam automatizar atendimento, vendas e suporte via WhatsApp 
                  sem perder a personalização e o contexto das conversas.
                </p>
                <p>
                  <strong>Agências e consultorias</strong> que gerenciam múltiplos clientes e precisam de uma plataforma white-label 
                  para oferecer serviços de automação.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Section>

      <Separator />

      {/* Módulos Core */}
      <Section
        id="módulos"
        badge="Funcionalidades"
        title="Módulos Principais"
        subtitle="Os quatro pilares que formam a base da plataforma Genesis."
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
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br",
                    module.gradient
                  )}>
                    <module.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{module.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
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
        className="bg-muted/20"
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
              >
                <Card className="h-full text-center p-4 hover:shadow-md transition-shadow">
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
              <InfoCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          {/* Performance Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  Métricas de Performance
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
                    <div key={metric.label} className="text-center">
                      <div className="text-2xl font-bold text-primary">{metric.value}</div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
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
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full p-5 text-center">
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

      <Separator />

      {/* Sistema de Economia */}
      <Section
        id="economia"
        badge="Monetização"
        title="Sistema de Economia"
        subtitle="Modelo flexível de planos e créditos para diferentes casos de uso."
        className="bg-muted/20"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {economySystem.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full p-5">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Como Funciona o Consumo</CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm text-muted-foreground space-y-3">
            <p>
              O sistema de economia da Genesis opera em duas camadas: <strong>Planos</strong> (limites mensais fixos) e <strong>Créditos</strong> (consumo avulso).
            </p>
            <p>
              Cada ação no sistema tem um custo em créditos definido pelo administrador. Por exemplo: envio de mensagem WhatsApp (1 crédito), 
              resposta da Luna IA (3 créditos), execução de flow (2 créditos).
            </p>
            <p>
              Quando o usuário atinge o limite do plano, o sistema pode: bloquear a ação, consumir créditos avulsos, ou sugerir upgrade — 
              tudo configurável pelo owner da plataforma.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Separator />

      {/* Integrações */}
      <Section
        badge="Ecossistema"
        title="Integrações Disponíveis"
        subtitle="Conecte a Genesis com suas ferramentas existentes."
      >
        <div className="flex flex-wrap gap-3">
          {integrations.map((integration, idx) => (
            <motion.div
              key={integration}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Puzzle className="w-3 h-3 mr-2" />
                {integration}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Genesis Hub</span>
              <Badge variant="outline" className="text-xs">Documentação</Badge>
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
