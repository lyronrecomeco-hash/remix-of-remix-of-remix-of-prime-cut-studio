import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Stethoscope, Heart, Star, Check, Clock, Award, Sparkles } from 'lucide-react';

import gallery1 from '@/assets/starpetshop/gallery-1.jpg';
import gallery3 from '@/assets/starpetshop/gallery-3.jpg';
import gallery4 from '@/assets/starpetshop/gallery-4.jpg';
import gallery6 from '@/assets/starpetshop/gallery-6.jpg';

interface StarpetshopServicesProps {
  onScheduleClick: () => void;
}

const StarpetshopServices = ({ onScheduleClick }: StarpetshopServicesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const services = [
    {
      icon: Stethoscope,
      title: 'Consulta Veterinária',
      shortDesc: 'Atendimento completo',
      description: 'Avaliação clínica completa do seu pet, com diagnóstico preciso e tratamento adequado.',
      image: gallery3,
      price: 'R$ 120',
      priceLabel: 'a partir de',
      duration: '30min',
      highlight: 'Clínica Geral',
      highlightColor: 'from-red-500 to-rose-500',
      features: ['Exame físico', 'Diagnóstico', 'Orientações', 'Tratamento'],
    },
    {
      icon: Heart,
      title: 'Odontologia Veterinária',
      shortDesc: 'Especialidade da casa',
      description: 'Cuidados especializados para a saúde bucal do seu pet, prevenindo doenças.',
      image: gallery4,
      price: 'R$ 150',
      priceLabel: 'a partir de',
      duration: '45min',
      highlight: 'Especialidade',
      highlightColor: 'from-rose-500 to-red-600',
      features: ['Avaliação bucal', 'Limpeza dental', 'Tratamento', 'Prevenção'],
    },
    {
      icon: Star,
      title: 'Limpeza Dental',
      shortDesc: 'Sorriso saudável',
      description: 'Limpeza dental profissional para remover tártaro e prevenir doenças periodontais.',
      image: gallery1,
      price: 'R$ 300',
      priceLabel: 'a partir de',
      duration: '1h',
      highlight: 'Mais Procurado',
      highlightColor: 'from-red-600 to-rose-500',
      features: ['Remoção tártaro', 'Polimento', 'Fluorização', 'Orientações'],
    },
    {
      icon: Award,
      title: 'Cirurgias Odontológicas',
      shortDesc: 'Casos complexos',
      description: 'Procedimentos cirúrgicos especializados para casos que necessitam de intervenção.',
      image: gallery6,
      price: 'Consultar',
      priceLabel: 'valor sob',
      duration: 'Variável',
      highlight: 'Avançado',
      highlightColor: 'from-rose-600 to-red-500',
      features: ['Extrações', 'Fraturas', 'Tumores', 'Correções'],
    },
  ];

  return (
    <section id="servicos" className="py-16 sm:py-24 bg-gradient-to-b from-white via-red-50/30 to-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
        >
          <motion.span 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 text-red-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-red-500/20"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Award className="w-4 h-4" />
            Nossos Serviços
          </motion.span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Cuidado completo para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">
              seu pet
            </span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg md:text-xl leading-relaxed px-4">
            Atendimento veterinário de excelência com especialidade em odontologia animal.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
            >
              {/* Image Section */}
              <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
                
                {/* Highlight Badge */}
                {service.highlight && (
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className={`bg-gradient-to-r ${service.highlightColor} text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg`}>
                      {service.highlight}
                    </span>
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-end justify-between">
                  <div className="bg-white/95 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg">
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-medium">{service.priceLabel}</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-red-600">{service.price}</p>
                  </div>
                  
                  {service.duration && (
                    <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-sm px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">{service.duration}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-4 sm:p-6 md:p-8">
                {/* Title row */}
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                    <service.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{service.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{service.shortDesc}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed hidden sm:block">{service.description}</p>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {service.features.map((feature, i) => (
                    <span key={i} className="text-xs sm:text-sm text-gray-900 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                      </span>
                      <span className="truncate">{feature}</span>
                    </span>
                  ))}
                </div>
                
                <Button
                  onClick={onScheduleClick}
                  className="w-full h-11 sm:h-14 text-sm sm:text-lg font-bold bg-gradient-to-r from-red-500 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 group/btn"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Agendar Agora
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA - Mobile only */}
        <motion.div 
          className="mt-8 sm:hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-2xl p-4 text-center border border-red-500/20">
            <p className="text-sm text-gray-900 font-medium mb-2">
              Precisa de ajuda para escolher?
            </p>
            <a 
              href="https://wa.me/553436623787"
              className="text-red-600 font-bold text-sm flex items-center justify-center gap-2"
            >
              Fale conosco pelo WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StarpetshopServices;
