import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Scissors, Stethoscope, Home, ShoppingBag, Check, Clock, Award } from 'lucide-react';

import serviceGrooming from '@/assets/petshop/service-grooming.jpg';
import serviceVet from '@/assets/petshop/service-vet.jpg';
import serviceDaycare from '@/assets/petshop/service-daycare.jpg';
import serviceShop from '@/assets/petshop/service-shop.jpg';

interface PetshopServicesProps {
  onScheduleClick: () => void;
}

const PetshopServices = ({ onScheduleClick }: PetshopServicesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const services = [
    {
      icon: Scissors,
      title: 'Banho & Tosa',
      description: 'Banho completo com produtos premium, tosa higiênica ou estética, hidratação e perfume especial para deixar seu pet lindo e cheiroso.',
      image: serviceGrooming,
      price: 'R$ 60',
      priceLabel: 'a partir de',
      duration: '1h - 2h',
      highlight: 'Mais Popular',
      features: ['Banho completo', 'Tosa higiênica/estética', 'Corte de unhas', 'Limpeza de ouvidos', 'Hidratação', 'Perfume especial'],
    },
    {
      icon: Stethoscope,
      title: 'Veterinária',
      description: 'Consultas, vacinas, exames e tratamentos com veterinários experientes e carinhosos que tratam seu pet como família.',
      image: serviceVet,
      price: 'R$ 150',
      priceLabel: 'consulta',
      duration: '30min - 1h',
      highlight: null,
      features: ['Consultas gerais', 'Vacinação completa', 'Exames laboratoriais', 'Cirurgias', 'Emergências', 'Retorno gratuito'],
    },
    {
      icon: Home,
      title: 'Hotel & Creche',
      description: 'Hospedagem confortável e creche diária com atividades, brincadeiras, socialização e muito carinho para seu amiguinho.',
      image: serviceDaycare,
      price: 'R$ 80',
      priceLabel: 'diária',
      duration: '24h',
      highlight: 'Webcam 24h',
      features: ['Hospedagem 24h', 'Creche diária', 'Área de recreação', 'Alimentação inclusa', 'Câmeras online', 'Relatório diário'],
    },
    {
      icon: ShoppingBag,
      title: 'Pet Shop',
      description: 'Rações, petiscos, acessórios, brinquedos e tudo que seu pet precisa das melhores marcas nacionais e importadas.',
      image: serviceShop,
      price: 'Diversos',
      priceLabel: 'produtos',
      duration: null,
      highlight: 'Delivery Grátis',
      features: ['Rações premium', 'Acessórios exclusivos', 'Brinquedos interativos', 'Medicamentos', 'Higiene', 'Delivery grátis*'],
    },
  ];

  return (
    <section id="servicos" className="py-24 bg-gradient-to-b from-white to-petshop-cream/30" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-petshop-orange/10 text-petshop-orange px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
            <Award className="w-4 h-4" />
            Nossos Serviços
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-petshop-dark mb-6 leading-tight">
            Tudo que seu pet precisa em{' '}
            <span className="text-petshop-orange relative">
              um só lugar
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="#F97316" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="text-petshop-gray text-lg md:text-xl leading-relaxed">
            Oferecemos uma gama completa de serviços para garantir o bem-estar, 
            saúde e felicidade do seu melhor amigo.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              {/* Image Section */}
              <div className="relative h-56 md:h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-petshop-dark via-petshop-dark/20 to-transparent" />
                
                {/* Highlight Badge */}
                {service.highlight && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-petshop-orange text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      {service.highlight}
                    </span>
                  </div>
                )}

                {/* Price Badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg">
                    <p className="text-xs text-petshop-gray uppercase tracking-wide">{service.priceLabel}</p>
                    <p className="text-2xl font-bold text-petshop-orange">{service.price}</p>
                  </div>
                  
                  {service.duration && (
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <Clock className="w-4 h-4 text-petshop-gray" />
                      <span className="text-sm font-medium text-petshop-dark">{service.duration}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-petshop-orange to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-petshop-orange/30">
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-petshop-dark">{service.title}</h3>
                </div>
                
                <p className="text-petshop-gray mb-6 leading-relaxed">{service.description}</p>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {service.features.map((feature, i) => (
                    <span key={i} className="text-sm text-petshop-dark flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </span>
                      {feature}
                    </span>
                  ))}
                </div>
                
                <Button
                  onClick={onScheduleClick}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-petshop-orange to-orange-500 hover:from-orange-500 hover:to-petshop-orange text-white rounded-2xl shadow-lg shadow-petshop-orange/30 transition-all duration-300 group/btn"
                >
                  Agendar Agora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetshopServices;
