import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, Building2, Users, MessageSquare, TrendingUp, Award, Shield, CheckCircle2, ArrowRight, Verified } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Proprietário',
    company: 'Barbearia Premium SP',
    avatar: '👨‍💼',
    content: 'Reduzi meu tempo de atendimento em 80%. Agora meus clientes agendam sozinhos 24h e eu foco no que importa: cortar cabelo e faturar mais.',
    rating: 5,
    metric: '+127 agendamentos/mês',
    metricBefore: '32 agendamentos',
    verified: true,
    video: false,
  },
  {
    name: 'Dra. Ana Oliveira',
    role: 'Proprietária',
    company: 'Clínica Estética Bella',
    avatar: '👩‍⚕️',
    content: 'A Luna responde dúvidas sobre procedimentos 24h com precisão. Minhas pacientes adoram a rapidez e eu não perco mais leads à noite ou fim de semana.',
    rating: 5,
    metric: '3.2x mais conversões',
    metricBefore: 'R$ 18k → R$ 58k/mês',
    verified: true,
    video: false,
  },
  {
    name: 'Roberto Santos',
    role: 'Gerente Geral',
    company: 'Restaurante Sabor & Arte',
    avatar: '👨‍🍳',
    content: 'Triplicamos as reservas em 60 dias. O sistema qualifica os clientes automaticamente antes de eu atender. Melhor investimento do ano, sem dúvida.',
    rating: 5,
    metric: 'ROI de 470%',
    metricBefore: 'Payback em 23 dias',
    verified: true,
    video: false,
  },
];

const stats = [
  { icon: Users, value: 2847, label: 'Empresas ativas', suffix: '+', prefix: '' },
  { icon: MessageSquare, value: 10, label: 'Mensagens/mês', suffix: 'M+', prefix: '' },
  { icon: TrendingUp, value: 340, label: 'ROI médio', suffix: '%', prefix: '' },
  { icon: Award, value: 4.9, label: 'Avaliação média', suffix: '/5', prefix: '' },
];

const niches = [
  { name: 'Barbearias', count: '+340' },
  { name: 'Clínicas', count: '+280' },
  { name: 'Restaurantes', count: '+190' },
  { name: 'Academias', count: '+160' },
  { name: 'Salões', count: '+420' },
  { name: 'Consultórios', count: '+230' },
  { name: 'E-commerce', count: '+380' },
  { name: 'Imobiliárias', count: '+150' },
  { name: 'Advocacia', count: '+90' },
  { name: 'Contabilidade', count: '+120' },
  { name: 'Odontologia', count: '+270' },
  { name: 'Pet Shops', count: '+180' },
];

const AnimatedCounter = ({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = value;
    const duration = 2000;
    const isDecimal = value % 1 !== 0;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

const VendaSocialProof = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-primary/[0.02] to-muted/20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="container px-4 relative z-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20 max-w-5xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="p-5 md:p-6 text-center bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Niches Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20 overflow-hidden"
        >
          <p className="text-center text-muted-foreground mb-6">
            <span className="text-foreground font-semibold">+30 segmentos</span> já usam o Genesis Hub
          </p>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex animate-scroll-x">
              {[...niches, ...niches].map((niche, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-5 py-2.5 mx-2 rounded-full bg-card border border-border/50 whitespace-nowrap hover:border-primary/30 transition-colors group cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{niche.name}</span>
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                    {niche.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Star className="w-4 h-4 fill-current" />
            Resultados Reais • Verificados
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Empresários que
            <br />
            <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
              multiplicaram resultados
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de quem saiu do caos manual para o <span className="text-primary font-semibold">faturamento automático</span>.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => setActiveTestimonial(index)}
              className={`cursor-pointer transition-all ${activeTestimonial === index ? 'ring-2 ring-primary/50' : ''}`}
            >
              <Card className="p-6 md:p-8 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all flex flex-col relative overflow-hidden group">
                {/* Verified Badge */}
                {testimonial.verified && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] flex items-center gap-1">
                      <Verified className="w-3 h-3" />
                      Verificado
                    </Badge>
                  </div>
                )}
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative mb-6 flex-1">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                  <p className="text-foreground leading-relaxed pl-4">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex flex-col gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 font-bold w-fit">
                    <TrendingUp className="w-4 h-4" />
                    {testimonial.metric}
                  </div>
                  <span className="text-xs text-muted-foreground">{testimonial.metricBefore}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-3xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-primary">{testimonial.company}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <p className="text-lg text-muted-foreground mb-6">
            <span className="text-foreground font-bold">Quer ser o próximo caso de sucesso?</span>
          </p>
          <Button asChild size="lg" className="group shadow-xl shadow-primary/25">
            <Link to="/genesis" className="flex items-center gap-2">
              Começar Minha Transformação
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: Shield, text: 'Dados Criptografados' },
            { icon: Award, text: 'Suporte 100% Brasileiro' },
            { icon: CheckCircle2, text: 'Conformidade LGPD' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
              <badge.icon className="w-4 h-4 text-primary" />
              {badge.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll animation */}
      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 30s linear infinite;
        }
        .animate-scroll-x:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default VendaSocialProof;
