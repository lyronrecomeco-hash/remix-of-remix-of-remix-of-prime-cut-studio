import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, TrendingUp, Clock, Users } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Dr. Carlos Mendes',
    role: 'CEO',
    company: 'Clínica Premium Saúde',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    content: 'A Luna transformou nosso atendimento. Antes perdíamos 60% dos leads fora do horário comercial. Hoje convertemos 24h por dia. Faturamento aumentou 47% em 3 meses.',
    metrics: { conversao: '+47%', leads: '3x mais', tempo: '24/7' },
    rating: 5,
  },
  {
    id: 2,
    name: 'Amanda Souza',
    role: 'Fundadora',
    company: 'AS Estética',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    content: 'Economizo 4 horas por dia que gastava respondendo WhatsApp. A Luna agenda consultas, envia lembretes e até faz remarketing. Melhor investimento que fiz.',
    metrics: { economia: '4h/dia', agendamentos: '+120%', satisfacao: '98%' },
    rating: 5,
  },
  {
    id: 3,
    name: 'Ricardo Santos',
    role: 'Proprietário',
    company: 'Barbearia Vintage',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'Setup em 5 minutos, como prometido. Já no primeiro mês tive ROI de 400%. A Luna entende gírias e o jeito dos meus clientes falarem. Impressionante.',
    metrics: { roi: '400%', setup: '5min', cancelamentos: '-70%' },
    rating: 5,
  },
  {
    id: 4,
    name: 'Fernanda Lima',
    role: 'Diretora',
    company: 'FL Consultoria',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    content: 'Testei 5 plataformas antes. O Genesis é disparado o melhor. A IA realmente entende o que o cliente quer e qualifica leads com precisão. Suporte incrível também.',
    metrics: { qualificacao: '95%', resposta: '<3s', conversao: '+85%' },
    rating: 5,
  },
];

const SiteTestimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev + 1) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">
            <Star className="w-4 h-4 fill-yellow-500" />
            +2.800 avaliações 5 estrelas
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            O que nossos clientes{' '}
            <span className="text-green-600">dizem</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empresas reais, resultados reais.
            <strong className="text-gray-900"> Veja o que estão conquistando.</strong>
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Quote */}
                  <Quote className="w-10 h-10 text-green-200 mb-6" />
                  <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
                    "{activeTestimonial.content}"
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {Object.entries(activeTestimonial.metrics).map(([key, value], i) => (
                      <div key={key} className="text-center p-4 bg-gray-50 rounded-2xl">
                        <p className="text-2xl font-bold text-green-600">{value}</p>
                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={activeTestimonial.image}
                        alt={activeTestimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-green-100"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{activeTestimonial.name}</p>
                        <p className="text-sm text-gray-500">
                          {activeTestimonial.role} • {activeTestimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-8 py-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setActiveIndex(index); setIsAutoPlaying(false); }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeIndex === index ? 'bg-green-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Logos / Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 mb-6">Empresas que confiam no Genesis Hub</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {['Clínicas', 'Restaurantes', 'E-commerce', 'Barbearias', 'Consultórios', 'Academias'].map((item, i) => (
              <div key={i} className="text-lg font-bold text-gray-400">{item}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteTestimonials;
