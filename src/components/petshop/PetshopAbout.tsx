import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { CheckCircle2, Award, Users, Clock } from 'lucide-react';

const PetshopAbout = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { icon: Users, value: '5.000+', label: 'Pets Atendidos' },
    { icon: Award, value: '10+', label: 'Anos de Experiência' },
    { icon: Clock, value: '24h', label: 'Suporte' },
  ];

  const features = [
    'Profissionais certificados e apaixonados por animais',
    'Produtos de alta qualidade e marcas premium',
    'Ambiente climatizado e seguro',
    'Atendimento personalizado para cada pet',
    'Acompanhamento veterinário completo',
    'Transporte com conforto e segurança',
  ];

  return (
    <section id="sobre" className="py-20 bg-petshop-cream" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600"
                alt="Equipe Seu Xodó Petshop"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-petshop-dark/50 to-transparent" />
            </div>
            
            {/* Stats Overlay */}
            <div className="absolute -bottom-8 left-4 right-4 md:left-8 md:right-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-6 h-6 text-petshop-orange mx-auto mb-2" />
                    <p className="text-2xl font-bold text-petshop-dark">{stat.value}</p>
                    <p className="text-xs text-petshop-gray">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pl-8"
          >
            <span className="inline-block bg-petshop-orange/10 text-petshop-orange px-4 py-2 rounded-full text-sm font-medium mb-4">
              Sobre Nós
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-petshop-dark mb-6 leading-tight">
              Mais que um petshop, somos uma família de{' '}
              <span className="text-petshop-orange">apaixonados por pets</span>
            </h2>
            
            <p className="text-petshop-gray text-lg mb-8 leading-relaxed">
              Desde 2014, o Seu Xodó Petshop tem sido referência em cuidados para animais 
              de estimação em São Paulo. Nossa missão é proporcionar bem-estar, saúde e 
              felicidade para seu melhor amigo, com muito carinho e profissionalismo.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-petshop-orange mt-0.5 flex-shrink-0" />
                  <span className="text-petshop-dark text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 bg-petshop-orange/10 rounded-xl">
              <div className="w-12 h-12 bg-petshop-orange rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="font-semibold text-petshop-dark">Premiado como melhor petshop</p>
                <p className="text-sm text-petshop-gray">Zona Sul de SP - 2023</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PetshopAbout;
