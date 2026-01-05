import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, Building2, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Dono de Barbearia',
    avatar: '👨‍💼',
    content: 'A Luna reduziu meu tempo de atendimento em 80%. Agora meus clientes agendam sozinhos!',
    rating: 5,
  },
  {
    name: 'Ana Oliveira',
    role: 'Clínica de Estética',
    avatar: '👩‍⚕️',
    content: 'Impressionante como a IA entende as dúvidas das clientes. Parece uma atendente real.',
    rating: 5,
  },
  {
    name: 'Roberto Santos',
    role: 'Restaurante',
    avatar: '👨‍🍳',
    content: 'Triplicamos as reservas depois que implementamos o Genesis. Melhor investimento do ano.',
    rating: 5,
  },
];

const stats = [
  { icon: Users, value: '2.500+', label: 'Empresas ativas' },
  { icon: MessageSquare, value: '10M+', label: 'Mensagens/mês' },
  { icon: TrendingUp, value: '340%', label: 'ROI médio' },
];

const niches = [
  'Barbearias', 'Clínicas', 'Restaurantes', 'Academias', 
  'Salões', 'Consultórios', 'Lojas', 'Imobiliárias',
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
          className="grid md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Niches Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20 overflow-hidden"
        >
          <p className="text-center text-muted-foreground mb-6">Usado por empresas de todos os segmentos</p>
          <div className="flex animate-scroll-x">
            {[...niches, ...niches].map((niche, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-6 py-3 mx-2 rounded-full bg-card border border-border whitespace-nowrap"
              >
                <Building2 className="w-4 h-4 text-primary" />
                <span>{niche}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            O que dizem nossos
            <br />
            <span className="text-primary">clientes</span>
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
              <Card className="p-6 h-full bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add scroll animation */}
      <style>{`
        @keyframes scroll-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-x {
          animation: scroll-x 20s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default VendaSocialProof;
