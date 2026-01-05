import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, Building2, Users, MessageSquare, TrendingUp, Award, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Dono de Barbearia',
    company: 'Barbearia Premium SP',
    avatar: '👨‍💼',
    content: 'Reduzi meu tempo de atendimento em 80%. Agora meus clientes agendam sozinhos e eu foco no que importa: cortar cabelo.',
    rating: 5,
    metric: '+127 agendamentos/mês',
  },
  {
    name: 'Dra. Ana Oliveira',
    role: 'Proprietária',
    company: 'Clínica Estética Bella',
    avatar: '👩‍⚕️',
    content: 'A Luna responde dúvidas sobre procedimentos 24h. Minhas pacientes adoram a rapidez e eu não perco mais leads à noite.',
    rating: 5,
    metric: '3x mais conversões',
  },
  {
    name: 'Roberto Santos',
    role: 'Gerente',
    company: 'Restaurante Sabor & Arte',
    avatar: '👨‍🍳',
    content: 'Triplicamos as reservas. O sistema qualifica os clientes antes mesmo de eu atender. Melhor investimento do ano.',
    rating: 5,
    metric: 'ROI de 450%',
  },
];

const stats = [
  { icon: Users, value: '2.847', label: 'Empresas ativas', suffix: '+' },
  { icon: MessageSquare, value: '10M', label: 'Mensagens/mês', suffix: '+' },
  { icon: TrendingUp, value: '340', label: 'ROI médio', suffix: '%' },
  { icon: Award, value: '4.9', label: 'Avaliação média', suffix: '/5' },
];

const niches = [
  'Barbearias', 'Clínicas', 'Restaurantes', 'Academias', 
  'Salões', 'Consultórios', 'E-commerce', 'Imobiliárias',
  'Advocacia', 'Contabilidade', 'Odontologia', 'Pet Shops',
];

const VendaSocialProof = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}<span className="text-xl">{stat.suffix}</span>
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
          <p className="text-center text-muted-foreground mb-6">Usado por empresas de todos os segmentos</p>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex animate-scroll-x">
              {[...niches, ...niches].map((niche, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-5 py-2.5 mx-2 rounded-full bg-card border border-border/50 whitespace-nowrap hover:border-primary/30 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm">{niche}</span>
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
            Depoimentos Reais
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Empresários que
            <br />
            <span className="text-primary">transformaram seu negócio</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all flex flex-col">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed flex-1">
                  "{testimonial.content}"
                </p>

                {/* Metric Badge */}
                <div className="inline-flex items-center gap-1 px-3 py-1.5 mb-4 rounded-full bg-green-500/10 text-green-500 text-sm font-medium w-fit">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {testimonial.metric}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: Shield, text: 'Dados Criptografados' },
            { icon: Award, text: 'Suporte Brasileiro' },
            { icon: Users, text: 'LGPD Compliant' },
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
          animation: scroll-x 25s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default VendaSocialProof;
