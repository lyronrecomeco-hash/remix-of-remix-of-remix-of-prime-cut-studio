import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2, Sparkles, Rocket, Cpu, Cloud, Zap, Shield } from 'lucide-react';
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
    gradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-500/20 hover:border-pink-500/40',
    bgGlow: 'from-pink-500/10 to-rose-600/5',
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
    gradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    bgGlow: 'from-blue-500/10 to-cyan-600/5',
  },
];

const GenesisCommercialPartnerships = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="parcerias" ref={ref} className="py-24 md:py-32 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.08),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      <div className="container px-4 relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400"
          >
            <Rocket className="w-4 h-4" />
            Nossas Parcerias
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-white">
            Conectados com as
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              melhores tecnologias
            </span>
          </h2>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Parcerias estratégicas que garantem 
            <span className="text-purple-400 font-semibold"> qualidade, performance e inovação</span> contínua.
          </p>
        </motion.div>

        {/* Partnership Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {partnerships.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative h-full p-8 rounded-3xl bg-slate-900/70 backdrop-blur-sm border ${partner.borderColor} transition-all duration-500 overflow-hidden`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${partner.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Logo */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative mb-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${partner.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                  <div className="relative bg-white/10 backdrop-blur rounded-2xl p-4 w-fit">
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {partner.title}
                </h3>
                <p className={`text-sm font-semibold mb-4 bg-gradient-to-r ${partner.gradient} bg-clip-text text-transparent`}>
                  {partner.subtitle}
                </p>

                {/* Description */}
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {partner.description}
                </p>

                {/* Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${partner.gradient} mb-6`}>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">{partner.badge}</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">{partner.badgeDesc}</p>

                {/* Benefits */}
                <ul className="space-y-3">
                  {partner.benefits.map((benefit, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${partner.gradient} flex items-center justify-center`}>
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-slate-300 text-sm">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Decorative */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${partner.gradient} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 items-center"
        >
          {[
            { icon: Shield, text: 'Segurança Certificada' },
            { icon: Cpu, text: 'IA de Última Geração' },
            { icon: Cloud, text: 'Cloud Enterprise' },
            { icon: Zap, text: '99.9% Uptime' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-500">
              <item.icon className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialPartnerships;
