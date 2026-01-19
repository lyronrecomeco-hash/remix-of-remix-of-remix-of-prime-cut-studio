import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, Heart, Award } from 'lucide-react';

const StarpetshopTestimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const testimonials = [
    {
      name: 'Mariana Costa',
      pet: 'Tutora do Thor',
      avatar: 'MC',
      text: 'O Thor tinha problemas sérios nos dentes e a equipe da Star cuidou dele com muito carinho. Hoje ele come normalmente e está muito mais feliz!',
      rating: 5,
    },
    {
      name: 'Carlos Eduardo',
      pet: 'Tutor da Luna',
      avatar: 'CE',
      text: 'Atendimento excepcional! A Luna precisou de uma extração e foi tudo muito tranquilo. A equipe é muito profissional e atenciosa.',
      rating: 5,
    },
    {
      name: 'Ana Paula',
      pet: 'Tutora do Bob',
      avatar: 'AP',
      text: 'Confio na Star Petshop há anos. O Bob faz limpeza dental regularmente e nunca tivemos problemas. Recomendo a todos!',
      rating: 5,
    },
    {
      name: 'Roberto Silva',
      pet: 'Tutor do Max',
      avatar: 'RS',
      text: 'A odontologia veterinária deles é referência em Araxá. O Max tinha mau hálito terrível e depois do tratamento ficou perfeito!',
      rating: 5,
    },
  ];

  const badges = [
    { icon: Star, value: '4.9/5', label: 'Avaliação Google' },
    { icon: Heart, value: '+5.000', label: 'Pets Atendidos' },
    { icon: Award, value: '14+', label: 'Anos de Experiência' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-600 to-red-700" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-red-200 font-semibold mb-4">
            <Heart className="w-5 h-5" fill="currentColor" />
            DEPOIMENTOS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-red-100 max-w-2xl mx-auto">
            A satisfação dos tutores e o bem-estar dos pets são nossa maior recompensa.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl"
            >
              <Quote className="w-8 h-8 text-red-200 mb-4" />
              <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                "{testimonial.text}"
              </p>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
            >
              <badge.icon className="w-6 h-6 mx-auto text-yellow-300 mb-2" fill="currentColor" />
              <p className="text-2xl font-bold text-white">{badge.value}</p>
              <p className="text-red-200 text-xs">{badge.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StarpetshopTestimonials;
