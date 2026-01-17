import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle2, Award, Users, Clock, Heart, Shield, Star } from 'lucide-react';

const PetshopAbout = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const stats = [
    { icon: Users, value: '5.000+', label: 'Pets Atendidos', color: 'from-blue-500 to-indigo-500' },
    { icon: Award, value: '10+', label: 'Anos', color: 'from-petshop-orange to-amber-500' },
    { icon: Heart, value: '100%', label: 'Amor', color: 'from-pink-500 to-rose-500' },
  ];

  const features = [
    { icon: Star, text: 'Profissionais certificados' },
    { icon: Shield, text: 'Produtos premium' },
    { icon: Heart, text: 'Ambiente climatizado' },
    { icon: Award, text: 'Atendimento VIP' },
  ];

  return (
    <section id="sobre" className="py-12 sm:py-20 bg-gradient-to-b from-white to-petshop-cream" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
                alt="Equipe Seu Xodó Petshop"
                className="w-full h-64 sm:h-80 lg:h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-petshop-dark/60 via-transparent to-transparent" />
              
              {/* Trust Badge */}
              <motion.div 
                className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-petshop-orange to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <span className="text-lg sm:text-xl">🏆</span>
                  </div>
                  <div>
                    <p className="font-bold text-petshop-dark text-xs sm:text-sm">Melhor Petshop</p>
                    <p className="text-petshop-gray text-[10px] sm:text-xs">Recife 2023</p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Stats Overlay - Mobile optimized */}
            <motion.div 
              className="absolute -bottom-4 sm:-bottom-6 left-2 right-2 sm:left-4 sm:right-4 md:left-6 md:right-6"
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5 grid grid-cols-3 gap-2 sm:gap-4 border border-gray-100">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center"
                    initial={{ scale: 0.8 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 shadow-lg`}>
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <p className="text-lg sm:text-2xl font-extrabold text-petshop-dark">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-petshop-gray font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-6 order-1 lg:order-2 mb-8 lg:mb-0"
          >
            <motion.span 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-petshop-orange/10 to-amber-500/10 text-petshop-orange px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 border border-petshop-orange/20"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sobre Nós
            </motion.span>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-petshop-dark mb-4 sm:mb-6 leading-tight">
              Mais que um petshop,
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-petshop-orange to-amber-500">
                somos família
              </span>
            </h2>
            
            <p className="text-petshop-gray text-sm sm:text-lg mb-6 sm:mb-8 leading-relaxed">
              Desde 2014, cuidando do seu melhor amigo com amor, carinho e profissionalismo. 
              Sua confiança é nossa maior conquista! 🐾
            </p>

            {/* Features Grid - Mobile optimized */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-petshop-orange/30 transition-all"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-petshop-orange/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-petshop-orange" />
                  </div>
                  <span className="text-petshop-dark text-xs sm:text-sm font-medium leading-tight">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Card */}
            <motion.div 
              className="bg-gradient-to-r from-petshop-orange/10 to-amber-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-petshop-orange/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-petshop-orange to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-petshop-orange/30">
                  <span className="text-2xl sm:text-3xl">🐕</span>
                </div>
                <div>
                  <p className="font-bold text-petshop-dark text-sm sm:text-base">Agende uma visita!</p>
                  <p className="text-petshop-gray text-xs sm:text-sm">Conheça nosso espaço e equipe</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PetshopAbout;
