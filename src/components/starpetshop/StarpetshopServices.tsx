import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Stethoscope, Heart, Star, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StarpetshopServicesProps {
  onScheduleClick: () => void;
}

const StarpetshopServices = ({ onScheduleClick }: StarpetshopServicesProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const services = [
    {
      icon: Stethoscope,
      title: 'Consulta Veterinária',
      description: 'Avaliação clínica completa do seu pet, com diagnóstico preciso e tratamento adequado.',
      features: [
        'Exame físico completo',
        'Avaliação do histórico de saúde',
        'Orientações de cuidados',
        'Encaminhamento especializado',
      ],
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Heart,
      title: 'Odontologia Veterinária',
      description: 'Cuidados especializados para a saúde bucal do seu pet, prevenindo doenças e garantindo bem-estar.',
      features: [
        'Avaliação odontológica',
        'Limpeza dental profissional',
        'Tratamento de cáries',
        'Extrações quando necessário',
      ],
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      highlight: true,
    },
    {
      icon: Star,
      title: 'Procedimentos Odontológicos',
      description: 'Tratamentos especializados para casos que necessitam de intervenção cirúrgica.',
      features: [
        'Cirurgias periodontais',
        'Tratamento de fraturas dentárias',
        'Remoção de tumores orais',
        'Correções ortodônticas',
      ],
      color: 'from-amber-500 to-red-500',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <section id="servicos" className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-red-600 font-semibold mb-4">
            <Stethoscope className="w-5 h-5" />
            NOSSOS SERVIÇOS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cuidado Completo para seu Pet
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos atendimento veterinário de excelência, com especialidade em 
            odontologia animal. Conheça nossos serviços.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 ${
                service.highlight ? 'ring-2 ring-red-500 ring-offset-2' : ''
              }`}
            >
              {service.highlight && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Especialidade
                </div>
              )}
              
              <div className="p-6">
                <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={onScheduleClick}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 group/btn"
                >
                  Agendar Consulta
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            O Sorriso do Seu Pet Merece Cuidado Especial
          </h3>
          <p className="text-red-100 mb-6 max-w-xl mx-auto">
            Agende uma avaliação e descubra como podemos ajudar seu pet a ter 
            uma vida mais saudável e feliz.
          </p>
          <Button
            onClick={onScheduleClick}
            size="lg"
            className="bg-white text-red-700 hover:bg-red-50 font-semibold px-8"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default StarpetshopServices;
