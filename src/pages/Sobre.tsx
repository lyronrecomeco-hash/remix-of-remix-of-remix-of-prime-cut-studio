/**
 * Genesis Sobre Page - Institutional World-Class Page
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
  Play,
  BarChart3,
  Clock,
  Target,
  Layers,
  Code,
  Lock,
  Cpu,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

// Floating particles background
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-primary/20"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          x: [null, Math.random() * window.innerWidth],
          y: [null, Math.random() * window.innerHeight],
        }}
        transition={{
          duration: 20 + Math.random() * 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    ))}
  </div>
);

export default function Sobre() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const stats = [
    { value: 2500000, label: 'Mensagens Processadas', suffix: '+' },
    { value: 1200, label: 'Empresas Ativas', suffix: '+' },
    { value: 99.9, label: 'Uptime Garantido', suffix: '%' },
    { value: 50, label: 'Países Atendidos', suffix: '+' },
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'WhatsApp Multicanal',
      description: 'Conecte múltiplas instâncias WhatsApp e gerencie todas as conversas em um único lugar.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Bot,
      title: 'Chatbots Inteligentes',
      description: 'IA avançada que entende contexto e responde de forma natural, 24/7.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: GitBranch,
      title: 'Flow Builder Visual',
      description: 'Crie automações complexas sem código com nosso editor drag-and-drop.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Segurança Enterprise',
      description: 'Criptografia de ponta, conformidade LGPD e infraestrutura em nível bancário.',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const useCases = [
    { icon: Building2, title: 'Varejo', desc: 'Atendimento automatizado e vendas 24/7' },
    { icon: Users, title: 'Serviços', desc: 'Agendamentos e suporte inteligente' },
    { icon: TrendingUp, title: 'E-commerce', desc: 'Recuperação de carrinhos e pós-venda' },
    { icon: Globe, title: 'SaaS', desc: 'Onboarding e suporte técnico escalável' },
  ];

  const differentials = [
    { icon: Cpu, title: 'Arquitetura Escalável', desc: 'Processa milhões de mensagens sem perda de performance' },
    { icon: Lock, title: 'Zero Downtime', desc: 'Infraestrutura redundante em múltiplas regiões' },
    { icon: Code, title: 'API First', desc: 'Integre com qualquer sistema em minutos' },
    { icon: Layers, title: 'Multi-tenant', desc: 'Isole dados e personalize por cliente' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Genesis</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
              <a href="#architecture" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Arquitetura</a>
              <a href="#cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Casos de Uso</a>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/genesis/login')}>
                Entrar
              </Button>
              <Button onClick={() => navigate('/genesis/login')} className="gap-2">
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma Enterprise de Automação
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="block">Automação Inteligente</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                para WhatsApp Business
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              A Genesis é a plataforma mais avançada do Brasil para automação de comunicação empresarial. 
              Chatbots com IA, fluxos visuais e integração completa — tudo em uma única solução enterprise.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/genesis/login')} className="gap-2 text-lg px-8 py-6">
                Teste Grátis por 14 Dias
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                <Play className="w-5 h-5" />
                Ver Demonstração
              </Button>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="outline">Recursos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo que você precisa para escalar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma suite completa de ferramentas enterprise para transformar sua comunicação
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full group hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 overflow-hidden">
                  <CardContent className="p-8">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br",
                      feature.gradient
                    )}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="outline">Arquitetura</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Construída para Enterprise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Infraestrutura robusta que escala com seu negócio
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentials.map((diff, idx) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <diff.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{diff.title}</h3>
                  <p className="text-sm text-muted-foreground">{diff.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Technical highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Clock, label: 'Latência Média', value: '<100ms' },
              { icon: BarChart3, label: 'Mensagens/Segundo', value: '10.000+' },
              { icon: Target, label: 'SLA Garantido', value: '99.95%' },
            ].map((item, idx) => (
              <div key={item.label} className="flex items-center gap-4 p-6 bg-card rounded-xl border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="cases" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="outline">Casos de Uso</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Para todos os segmentos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empresas de diversos setores confiam na Genesis para escalar seu atendimento
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all cursor-pointer border-primary/10 hover:border-primary/30">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Pronto para transformar seu atendimento?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Junte-se a mais de 1.200 empresas que já automatizaram sua comunicação com a Genesis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/genesis/login')} className="gap-2 text-lg px-10 py-6">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg px-10 py-6">
                Falar com Vendas
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              Sem cartão de crédito • 14 dias grátis • Suporte incluído
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">Genesis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/termos" className="hover:text-foreground transition-colors">Termos</a>
              <a href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
