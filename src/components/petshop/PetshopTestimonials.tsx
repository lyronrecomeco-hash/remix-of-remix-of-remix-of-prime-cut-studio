import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote, Heart, MessageCircle } from 'lucide-react';

const PetshopTestimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const testimonials = [
    {
      name: 'Maria Silva',
      pet: 'Mel - Golden Retriever',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'Minha Mel fica feliz demais quando vai ao Seu Xodó! A equipe é super carinhosa e o banho fica impecável.',
      rating: 5,
    },
    {
      name: 'João Santos',
      pet: 'Thor - Bulldog Francês',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'Deixei meu Thor na hospedagem durante as férias e fiquei muito tranquilo. Enviaram fotos todos os dias!',
      rating: 5,
    },
    {
      name: 'Ana Oliveira',
      pet: 'Mimi - Gata Persa',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      text: 'A Dra. do veterinário é incrível! Minha Mimi que tem pavor de consultas, ficou super tranquila.',
      rating: 5,
    },
    {
      name: 'Pedro Costa',
      pet: 'Bob - Shih Tzu',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      text: 'O Bob sempre sai lindão da tosa! Profissionais super capacitados e preços justos.',
      rating: 5,
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-petshop-cream/50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-petshop-orange/10 to-amber-500/10 text-petshop-orange px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 border border-petshop-orange/20">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Depoimentos
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-petshop-dark mb-3 sm:mb-4 px-2">
            O que dizem os{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-petshop-orange to-amber-500">papais e mamães</span>
          </h2>
          <p className="text-petshop-gray text-sm sm:text-lg px-4">
            A satisfação dos nossos clientes é nossa maior conquista! ❤️
          </p>
        </motion.div>

        {/* Testimonials Grid - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-petshop-orange/20 absolute top-3 sm:top-4 right-3 sm:right-4" />
              
              <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-petshop-dark text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed line-clamp-4">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover border-2 border-petshop-orange/20"
                />
                <div>
                  <p className="font-bold text-petshop-dark text-xs sm:text-sm">{testimonial.name}</p>
                  <p className="text-[10px] sm:text-xs text-petshop-gray flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400" />
                    {testimonial.pet}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 sm:mt-12 bg-gradient-to-r from-petshop-orange/10 to-amber-500/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-petshop-orange/20"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { value: '4.9/5', label: 'Google', icon: '⭐' },
              { value: '500+', label: 'Avaliações', icon: '💬' },
              { value: '98%', label: 'Satisfação', icon: '❤️' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <span className="text-lg sm:text-2xl">{stat.icon}</span>
                <p className="text-lg sm:text-2xl font-extrabold text-petshop-dark">{stat.value}</p>
                <p className="text-petshop-gray text-[10px] sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PetshopTestimonials;
