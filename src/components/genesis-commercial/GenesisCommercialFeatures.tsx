import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  MessageSquare, Palette, MousePointer, Rocket,
  Sparkles, ArrowRight
} from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Responda as Perguntas',
    description: 'Explique seu projeto, público e objetivos. Nossa IA compreenderá o planejamento e estrutura ideal.',
  },
  {
    icon: Palette,
    number: '02',
    title: 'Visualize e Personalize',
    description: 'Personalize cores, fontes e design de forma simples para refletir a identidade do seu negócio.',
  },
  {
    icon: MousePointer,
    number: '03',
    title: 'Gere com 1 clique',
    description: 'Em segundos, sua solução completa está pronta: website, sistemas e páginas de vendas inclusas.',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Publique e Lucre',
    description: 'Publique online, conecte seu método de pagamento e comece a lucrar com seu novo produto digital.',
  },
];

const GenesisCommercialFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="recursos" ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />
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
            Como Funciona
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Com a <span className="text-primary">Genesis</span>, desenvolver um SaaS é{' '}
            <span className="text-primary">fácil, ágil e eficiente</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para criar SaaS profissionais e escaláveis, em um único lugar.
          </p>
        </motion.div>

        {/* Steps Flow - ZOD Style */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2 z-0" />
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Arrow between cards - Mobile/Tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-primary rotate-90 md:rotate-0" />
                    </motion.div>
                  </div>
                )}

                {/* Card */}
                <motion.div 
                  className="relative h-full p-6 rounded-2xl bg-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-primary/10"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 text-4xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <step.icon className="w-7 h-7 text-primary" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed relative z-10">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow between cards - Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 z-10">
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;