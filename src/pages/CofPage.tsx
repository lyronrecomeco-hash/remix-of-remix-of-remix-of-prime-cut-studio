import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  MessageSquare,
  Bot,
  Rocket,
  DollarSign,
  Clock,
  Target,
  Award,
  Play,
  ChevronDown,
  Sparkles,
  BarChart3,
  Building2,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VendaHeader from '@/components/venda/VendaHeader';
import { useNavigate } from 'react-router-dom';

// Animated counter component
const AnimatedCounter = ({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, isInView]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
};

// Typewriter effect
const TypeWriter = ({ text, speed = 50 }: { text: string; speed?: number }) => {
  const [displayed, setDisplayed] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, isInView]);

  return (
    <span ref={ref}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-6 bg-primary ml-1"
      />
    </span>
  );
};

const CofPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Journey steps data
  const journeySteps = [
    {
      phase: 'Onde você está',
      title: 'Atendimento Manual',
      pain: 'Leads perdidos, equipe sobrecarregada, vendas limitadas ao horário comercial',
      metric: '20%',
      metricLabel: 'taxa de resposta'
    },
    {
      phase: 'Primeiros 30 dias',
      title: 'Automação Básica',
      benefit: 'Respostas instantâneas 24/7, leads capturados automaticamente',
      metric: '60%',
      metricLabel: 'mais respostas'
    },
    {
      phase: '60 dias',
      title: 'IA Ativada',
      benefit: 'Luna conversa, qualifica e vende enquanto você foca no estratégico',
      metric: '3x',
      metricLabel: 'mais conversões'
    },
    {
      phase: '90 dias+',
      title: 'Escala Total',
      benefit: 'Operação rodando no automático, múltiplos canais, equipe focada em alto valor',
      metric: '+340%',
      metricLabel: 'em vendas'
    }
  ];

  // Value propositions
  const values = [
    {
      icon: Clock,
      title: 'Tempo é Dinheiro',
      description: 'Cada minuto que um lead espera, a chance de venda cai 10%. Com Genesis, resposta em segundos.',
      stat: '< 5s',
      statLabel: 'tempo de resposta'
    },
    {
      icon: DollarSign,
      title: 'ROI Garantido',
      description: 'Empresas economizam em média R$89.000/mês ao substituir atendimento manual por automação.',
      stat: 'R$89k',
      statLabel: 'economia mensal'
    },
    {
      icon: TrendingUp,
      title: 'Crescimento Exponencial',
      description: 'Não é linear. Quanto mais você escala, mais eficiente fica. Margem aumenta conforme você cresce.',
      stat: '+340%',
      statLabel: 'crescimento médio'
    }
  ];

  // Trust indicators
  const trustIndicators = [
    { value: 500, suffix: '+', label: 'Empresas ativas' },
    { value: 2, suffix: 'M+', label: 'Mensagens/mês' },
    { value: 99, suffix: '.9%', label: 'Uptime' },
    { value: 4, suffix: '.9★', label: 'Avaliação' }
  ];

  // FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: 'Quanto tempo leva para começar?',
      a: 'Menos de 5 minutos. Você conecta seu WhatsApp, escolhe um template ou cria do zero, e já está funcionando. Sem código, sem complexidade.'
    },
    {
      q: 'Funciona para qualquer tipo de negócio?',
      a: 'Sim. E-commerce, clínicas, restaurantes, imobiliárias, infoprodutos, serviços... Temos templates prontos para cada segmento.'
    },
    {
      q: 'E se meu número for bloqueado?',
      a: 'Nosso sistema anti-ban inteligente protege seu número com padrões naturais de envio. Se necessário, suportamos multi-instâncias para distribuir volume.'
    },
    {
      q: 'A Luna (IA) substitui minha equipe?',
      a: 'Não substitui, potencializa. Luna cuida do volume, sua equipe foca em negociações complexas e relacionamento. É um multiplicador de força.'
    },
    {
      q: 'Quanto custa?',
      a: 'Temos planos a partir de R$97/mês. O plano ideal depende do seu volume. Agende uma conversa para entender qual faz mais sentido.'
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <VendaHeader />

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center relative pt-20">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 pointer-events-none">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
          />
        </motion.div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Plataforma #1 em Automação WhatsApp
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Transforme conversas em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                <TypeWriter text="receita recorrente" speed={80} />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              A Genesis automatiza seu atendimento no WhatsApp com inteligência artificial, 
              convertendo leads 24 horas por dia enquanto você foca no que importa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90"
                onClick={() => navigate('/genesis/login')}
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14"
                onClick={() => navigate('/venda-genesis/agentes-ia')}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {trustIndicators.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    <AnimatedCounter target={item.value} suffix={item.suffix} />
                  </p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-muted-foreground" />
          </motion.div>
        </div>
      </section>

      {/* Value Section */}
      <section className="py-24 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              Por que Genesis?
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              O custo de <span className="text-primary">não automatizar</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cada lead não respondido é dinheiro deixado na mesa. 
              Cada atendimento lento é um cliente indo para o concorrente.
            </p>
          </motion.div>

          <div className="space-y-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <value.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{value.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">{value.description}</p>
                </div>
                <div className="w-full md:w-64 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-primary">{value.stat}</p>
                  <p className="text-sm text-muted-foreground">{value.statLabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              Sua Jornada
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              De onde você está para <span className="text-primary">onde quer chegar</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma transformação progressiva. Sem pressa, mas com direção clara.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-primary to-green-500" />

            {journeySteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative flex items-center mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 -ml-2 rounded-full bg-primary border-4 border-background z-10" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <Badge variant="outline" className={`mb-2 ${i === 0 ? 'text-amber-500 border-amber-500/30' : 'text-primary border-primary/30'}`}>
                    {step.phase}
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-3">
                    {step.pain || step.benefit}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${i === 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                    <span className="text-2xl font-bold">{step.metric}</span>
                    <span className="text-sm">{step.metricLabel}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              <Heart className="w-4 h-4 mr-2 inline text-red-500" />
              Quem usa, recomenda
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Histórias de <span className="text-primary">transformação</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "De 50 atendimentos/dia para 500, com a mesma equipe. A Genesis não é custo, é investimento.",
                author: "Carlos M.",
                role: "CEO, E-commerce Moda",
                result: "+900% em atendimentos"
              },
              {
                quote: "Antes perdia 70% dos leads por falta de tempo. Hoje a Luna qualifica todos e agenda para mim.",
                author: "Fernanda S.",
                role: "Corretora de Imóveis",
                result: "3x mais fechamentos"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <p className="text-lg mb-6 text-muted-foreground italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {testimonial.result}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              Dúvidas?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas <span className="text-primary">frequentes</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-border/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-muted-foreground">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 blur-3xl"
        />

        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Pronto para <span className="text-primary">transformar</span> seu atendimento?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Comece gratuitamente. Sem compromisso. Em 5 minutos você já está operando.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="text-lg px-10 h-16 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90"
                onClick={() => navigate('/genesis/login')}
              >
                Criar Minha Conta Grátis
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Setup em 5 minutos
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Suporte humanizado
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
};

export default CofPage;
