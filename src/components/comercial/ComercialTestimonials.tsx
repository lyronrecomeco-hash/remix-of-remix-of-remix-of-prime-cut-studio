import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Verified } from 'lucide-react';

const testimonials = [
  {
    name: 'Carla Mendes',
    role: 'Dona de E-commerce',
    company: 'Loja Beleza Natural',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    content: 'Triplicamos as vendas no primeiro mês! A Luna responde os clientes de madrugada, quando eu estou dormindo. Já acordei com 15 pedidos confirmados.',
    rating: 5,
    result: '+340% vendas',
  },
  {
    name: 'Ricardo Santos',
    role: 'Consultor Imobiliário',
    company: 'RS Imóveis',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: 'Antes eu perdia leads porque não conseguia responder rápido. Agora a Luna qualifica todos e me entrega só os clientes prontos para visita.',
    rating: 5,
    result: '+85 leads/mês',
  },
  {
    name: 'Amanda Lima',
    role: 'CEO',
    company: 'Clínica Estética AL',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: 'Reduzi minha equipe de atendimento de 4 para 1 pessoa. A Luna faz o trabalho de 3 atendentes e nunca reclama de hora extra!',
    rating: 5,
    result: '-75% custo',
  },
  {
    name: 'Pedro Oliveira',
    role: 'Dono de Academia',
    company: 'FitPro Gym',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'As matrículas explodiram! A Luna tira dúvidas sobre planos, horários e já agenda a visita. Economia de tempo absurda.',
    rating: 5,
    result: '+120 matrículas',
  },
  {
    name: 'Juliana Costa',
    role: 'Advogada',
    company: 'JC Advocacia',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    content: 'Profissionalismo no atendimento do escritório 24h. Clientes elogiam a rapidez e eu consigo focar no que importa: os casos.',
    rating: 5,
    result: '+45 clientes',
  },
];

const ComercialTestimonials = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="depoimentos" ref={ref} className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-emerald-50/30 to-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-3xl translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 mb-6"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold text-amber-600">Depoimentos Reais</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Empresas que <span className="text-emerald-500">transformaram</span>
            <span className="block mt-2">seus resultados</span>
          </h2>
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="relative">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100"
            >
              {/* Quote Icon */}
              <Quote className="w-12 h-12 text-emerald-200 mb-6" />

              {/* Content */}
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8 font-medium">
                "{testimonials[currentIndex].content}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-lg">{testimonials[currentIndex].name}</p>
                      <Verified className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-gray-500">{testimonials[currentIndex].role}</p>
                    <p className="text-emerald-600 font-medium text-sm">{testimonials[currentIndex].company}</p>
                  </div>
                </div>

                {/* Result Badge */}
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl">
                  <p className="text-white font-bold text-xl">{testimonials[currentIndex].result}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mt-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentIndex === index
                        ? 'bg-emerald-500 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Logos / Trust */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm font-medium mb-6">Empresas que confiam na Genesis</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-50 grayscale">
            {['E-commerce', 'Imobiliárias', 'Clínicas', 'Academias', 'Escritórios'].map((name) => (
              <div key={name} className="px-6 py-3 bg-gray-100 rounded-xl">
                <span className="font-bold text-gray-600">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComercialTestimonials;
