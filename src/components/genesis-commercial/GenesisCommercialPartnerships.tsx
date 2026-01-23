import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Sparkles, Shield, Cpu, Cloud, Zap } from 'lucide-react';
import lovableLogo from '@/assets/partners/lovable-logo.png';
import googleLogo from '@/assets/partners/google-logo.png';

const partnerships = [
  {
    name: 'Lovable',
    logo: lovableLogo,
    title: 'Parceria com Lovable',
    subtitle: 'Desenvolvimento Acelerado',
    description: 'Integração completa com a plataforma Lovable para desenvolvimento e deploy automático de projetos.',
    badge: 'Bônus Exclusivo!',
    badgeDesc: '10 créditos grátis na Lovable',
    benefits: [
      'Deploy automático de projetos',
      'Hospedagem profissional incluída',
      'Atualizações em tempo real',
    ],
  },
  {
    name: 'Google',
    logo: googleLogo,
    title: 'Parceria com Google',
    subtitle: 'Infraestrutura de Classe Mundial',
    description: 'Potencializado pela infraestrutura e IA do Google para máxima performance e confiabilidade.',
    badge: 'Tecnologia Google',
    badgeDesc: 'IA avançada e infraestrutura cloud',
    benefits: [
      'Google AI e Machine Learning',
      'Infraestrutura cloud confiável',
      'Escalabilidade garantida',
    ],
  },
];

const GenesisCommercialPartnerships = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="parcerias" ref={ref} className="py-24 md:py-32 bg-card relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.04),transparent_70%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Nossas Parcerias
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Conectados com as{' '}
            <span className="text-primary">melhores tecnologias</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Parcerias estratégicas que garantem qualidade, performance e inovação contínua.
          </p>
        </motion.div>

        {/* Partnership Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {partnerships.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-500 overflow-hidden hover:shadow-xl hover:shadow-primary/10">
                {/* Background Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Logo with animation */}
                <div className="relative mb-5">
                  <motion.div 
                    className="bg-muted/50 rounded-xl p-4 w-fit border border-border group-hover:border-primary/30 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <motion.img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="h-7 w-auto object-contain"
                      animate={{ 
                        filter: isInView ? 'brightness(1)' : 'brightness(0.7)'
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        filter: 'brightness(1.2) drop-shadow(0 0 8px hsl(var(--primary) / 0.5))'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </div>

                {/* Title with hover animation */}
                <motion.h3 
                  className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300"
                  whileHover={{ x: 4 }}
                >
                  {partner.title}
                </motion.h3>
                <motion.p 
                  className="text-sm font-semibold mb-3 text-primary"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1.02 }}
                >
                  {partner.subtitle}
                </motion.p>

                {/* Description */}
                <p className="text-muted-foreground mb-5 text-sm">
                  {partner.description}
                </p>

                {/* Badge with pulse animation */}
                <motion.div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3"
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 hsl(var(--primary) / 0)',
                      '0 0 0 4px hsl(var(--primary) / 0.1)',
                      '0 0 0 0 hsl(var(--primary) / 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </motion.div>
                  <span className="text-xs font-bold text-primary">{partner.badge}</span>
                </motion.div>
                <p className="text-xs text-muted-foreground mb-5">{partner.badgeDesc}</p>

                {/* Benefits with stagger animation */}
                <ul className="space-y-2.5">
                  {partner.benefits.map((benefit, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      whileHover={{ x: 6, scale: 1.02 }}
                      className="flex items-center gap-2.5 cursor-default"
                    >
                      <motion.div 
                        className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center"
                        whileHover={{ 
                          scale: 1.3, 
                          backgroundColor: 'hsl(var(--primary) / 0.3)' 
                        }}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                      </motion.div>
                      <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                        {benefit}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-wrap justify-center gap-6 items-center"
        >
          {[
            { icon: Shield, text: 'Segurança Certificada' },
            { icon: Cpu, text: 'IA de Última Geração' },
            { icon: Cloud, text: 'Cloud Enterprise' },
            { icon: Zap, text: '99.9% Uptime' },
          ].map((item, i) => (
            <motion.div 
              key={i} 
              className="flex items-center gap-2 text-muted-foreground"
              whileHover={{ scale: 1.05, color: 'hsl(var(--foreground))' }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <item.icon className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialPartnerships;