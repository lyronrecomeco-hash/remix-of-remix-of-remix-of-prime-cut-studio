import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Award, Users, Star, Stethoscope, Shield, Clock, CheckCircle2 } from 'lucide-react';

const StarpetshopAbout = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const stats = [
    { icon: Heart, value: '+5.000', label: 'Pets Atendidos', color: 'text-red-500' },
    { icon: Award, value: '+14', label: 'Anos de Experiência', color: 'text-yellow-500' },
    { icon: Users, value: '+3.000', label: 'Famílias Satisfeitas', color: 'text-red-600' },
  ];

  const differentials = [
    { icon: Stethoscope, title: 'Equipe Especializada', desc: 'Veterinários com formação em odontologia animal' },
    { icon: Shield, title: 'Equipamentos Modernos', desc: 'Tecnologia de ponta para diagnóstico e tratamento' },
    { icon: Clock, title: 'Atendimento Humanizado', desc: 'Cuidado e atenção que seu pet merece' },
    { icon: Star, title: 'Referência Regional', desc: 'Reconhecidos pela qualidade em Araxá e região' },
  ];

  return (
    <section id="sobre" className="py-20 bg-gray-50" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-red-600 font-semibold mb-4">
            <Star className="w-5 h-5" fill="currentColor" />
            NOSSA HISTÓRIA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mais de 14 Anos Cuidando de Quem Você Ama
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A Star Petshop nasceu do amor pelos animais e da dedicação em oferecer 
            atendimento veterinário de excelência em Araxá.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg text-center"
            >
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Especialistas em Saúde e Bem-Estar Animal
            </h3>
            <p className="text-gray-600 mb-6">
              Somos uma clínica veterinária completa, com foco especial em odontologia veterinária. 
              Nossa equipe é formada por profissionais apaixonados e qualificados, prontos para 
              oferecer o melhor cuidado ao seu companheiro.
            </p>
            <p className="text-gray-600 mb-6">
              Desde 2010, trabalhamos para proporcionar atendimento de qualidade, combinando 
              conhecimento técnico com amor e dedicação. Cada pet é tratado como membro da nossa família.
            </p>
            
            <div className="space-y-3">
              {[
                'Consultas veterinárias completas',
                'Odontologia veterinária especializada',
                'Limpeza dental e extrações',
                'Tratamento de doenças periodontais',
                'Cirurgias odontológicas',
                'Orientação e prevenção',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {differentials.map((diff, index) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-5 shadow-md flex items-start gap-4 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <diff.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{diff.title}</h4>
                  <p className="text-gray-600 text-sm">{diff.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StarpetshopAbout;
