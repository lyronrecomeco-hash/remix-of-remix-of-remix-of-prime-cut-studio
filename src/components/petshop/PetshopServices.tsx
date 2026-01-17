import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Scissors, Stethoscope, Home, ShoppingBag, Dog, Sparkles } from 'lucide-react';

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
      description: 'Banho completo com produtos premium, tosa higiênica ou estética, hidratação e perfume especial.',
      image: serviceGrooming,
      price: 'A partir de R$ 60',
      features: ['Banho completo', 'Tosa higiênica', 'Corte de unhas', 'Limpeza de ouvidos'],
    },
    {
      icon: Stethoscope,
      title: 'Veterinária',
      description: 'Consultas, vacinas, exames e tratamentos com veterinários experientes e carinhosos.',
      image: serviceVet,
      price: 'Consulta R$ 150',
      features: ['Consultas gerais', 'Vacinação', 'Exames laboratoriais', 'Cirurgias'],
    },
    {
      icon: Home,
      title: 'Hotel & Creche',
      description: 'Hospedagem confortável e creche diária com atividades, brincadeiras e muito carinho.',
      image: serviceDaycare,
      price: 'Diária R$ 80',
      features: ['Hospedagem 24h', 'Creche diária', 'Área de recreação', 'Acompanhamento'],
    },
    {
      icon: ShoppingBag,
      title: 'Pet Shop',
      description: 'Rações, petiscos, acessórios, brinquedos e tudo que seu pet precisa das melhores marcas.',
      image: serviceShop,
      price: 'Diversos produtos',
      features: ['Rações premium', 'Acessórios', 'Brinquedos', 'Medicamentos'],
    },
  ];

  const additionalServices = [
    { icon: Dog, name: 'Adestramento' },
    { icon: Sparkles, name: 'Spa Pet' },
  ];

  return (
    <section id="servicos" className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block bg-petshop-orange/10 text-petshop-orange px-4 py-2 rounded-full text-sm font-medium mb-4">
            Nossos Serviços
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-petshop-dark mb-4">
            Tudo que seu pet precisa em um{' '}
            <span className="text-petshop-orange">só lugar</span>
          </h2>
          <p className="text-petshop-gray text-lg">
            Oferecemos uma gama completa de serviços para garantir o bem-estar 
            e a felicidade do seu melhor amigo.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-petshop-dark/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-petshop-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                    {service.price}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-petshop-orange/10 rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-petshop-orange" />
                  </div>
                  <h3 className="text-xl font-bold text-petshop-dark">{service.title}</h3>
                </div>
                
                <p className="text-petshop-gray mb-4">{service.description}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {service.features.map((feature, i) => (
                    <span key={i} className="text-sm text-petshop-dark flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-petshop-orange rounded-full" />
                      {feature}
                    </span>
                  ))}
                </div>
                
                <Button
                  onClick={onScheduleClick}
                  variant="outline"
                  className="w-full border-petshop-orange text-petshop-orange hover:bg-petshop-orange hover:text-white group/btn"
                >
                  Agendar
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <span className="text-petshop-gray font-medium">Também oferecemos:</span>
          {additionalServices.map((service, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 bg-petshop-cream px-4 py-2 rounded-full text-petshop-dark font-medium"
            >
              <service.icon className="w-4 h-4 text-petshop-orange" />
              {service.name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PetshopServices;
