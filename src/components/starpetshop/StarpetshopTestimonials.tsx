import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, Heart, Award } from 'lucide-react';

const StarpetshopTestimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const testimonials = [
    {
      name: 'Mariana Costa',
      pet: 'Tutora do Thor',
      avatar: 'MC',
      text: 'O Thor tinha problemas sérios nos dentes e a equipe da Star cuidou dele com muito carinho. Hoje ele come normalmente!',
      rating: 5,
    },
    {
      name: 'Carlos Eduardo',
      pet: 'Tutor da Luna',
      avatar: 'CE',
      text: 'Atendimento excepcional! A Luna precisou de uma extração e foi tudo muito tranquilo. Equipe muito profissional.',
      rating: 5,
    },
    {
      name: 'Ana Paula',
      pet: 'Tutora do Bob',
      avatar: 'AP',
      text: 'Confio na Star Petshop há anos. O Bob faz limpeza dental regularmente e nunca tivemos problemas. Recomendo!',
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
    <section className="py-12 sm:py-20 bg-gradient-to-br from-red-600 to-rose-600" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-white/20 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
            Depoimentos
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 sm:mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-white/80 text-sm sm:text-lg px-4">
            A satisfação dos tutores e o bem-estar dos pets são nossa maior recompensa 🐾
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl"
            >
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-red-200 mb-2 sm:mb-3" />
              <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-4">
                "{testimonial.text}"
              </p>
              <div className="flex gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" />
                ))}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-[10px] sm:text-xs">{testimonial.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-white/10"
            >
              <badge.icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-yellow-300 mb-1.5 sm:mb-2" fill="currentColor" />
              <p className="text-lg sm:text-2xl font-extrabold text-white">{badge.value}</p>
              <p className="text-white/70 text-[10px] sm:text-xs">{badge.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StarpetshopTestimonials;
