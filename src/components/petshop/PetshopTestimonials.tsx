import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const PetshopTestimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const testimonials = [
    {
      name: 'Maria Silva',
      pet: 'Mel - Golden Retriever',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'Minha Mel fica feliz demais quando vai ao Seu Xodó! A equipe é super carinhosa e o banho fica impecável. Recomendo de olhos fechados!',
      rating: 5,
    },
    {
      name: 'João Santos',
      pet: 'Thor - Bulldog Francês',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'Deixei meu Thor na hospedagem durante as férias e fiquei muito tranquilo. Enviaram fotos todos os dias! Voltou super feliz.',
      rating: 5,
    },
    {
      name: 'Ana Oliveira',
      pet: 'Mimi - Gata Persa',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      text: 'A Dra. do veterinário é incrível! Minha Mimi que tem pavor de consultas, ficou super tranquila. Atendimento nota 10!',
      rating: 5,
    },
    {
      name: 'Pedro Costa',
      pet: 'Bob - Shih Tzu',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      text: 'O Bob sempre sai lindão da tosa! Profissionais super capacitados e preços justos. Somos clientes há 3 anos e nunca tivemos problemas.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block bg-petshop-orange/10 text-petshop-orange px-4 py-2 rounded-full text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-petshop-dark mb-4">
            O que dizem os{' '}
            <span className="text-petshop-orange">papais e mamães</span> dos pets
          </h2>
          <p className="text-petshop-gray text-lg">
            A satisfação dos nossos clientes é nosso maior prêmio. Veja o que eles falam sobre nós!
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-petshop-cream rounded-2xl p-6 relative"
            >
              <Quote className="w-8 h-8 text-petshop-orange/30 absolute top-4 right-4" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-petshop-dark text-sm mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-petshop-dark">{testimonial.name}</p>
                  <p className="text-xs text-petshop-gray">{testimonial.pet}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-8"
        >
          <div className="flex items-center gap-2 text-petshop-dark">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm">⭐</div>
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm">⭐</div>
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-sm">⭐</div>
            </div>
            <span className="font-semibold">4.9/5</span>
            <span className="text-petshop-gray">no Google</span>
          </div>
          
          <div className="h-8 w-px bg-gray-300 hidden md:block" />
          
          <div className="text-center">
            <span className="font-bold text-2xl text-petshop-orange">500+</span>
            <span className="text-petshop-gray ml-2">avaliações positivas</span>
          </div>
          
          <div className="h-8 w-px bg-gray-300 hidden md:block" />
          
          <div className="text-center">
            <span className="font-bold text-2xl text-petshop-orange">98%</span>
            <span className="text-petshop-gray ml-2">taxa de satisfação</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PetshopTestimonials;
