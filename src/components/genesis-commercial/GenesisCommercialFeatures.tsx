import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Layers, FileText, BarChart3, Users, Shield, 
  Sparkles, Rocket, PenTool
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Criador de Projetos',
    description: 'Crie sites personalizados para qualquer nicho: petshops, barbearias, academias e muito mais.',
  },
  {
    icon: FileText,
    title: 'Gerador de Propostas',
    description: 'Crie propostas profissionais com IA que impressionam e convertem seus prospects.',
  },
  {
    icon: PenTool,
    title: 'Copy de Vendas com IA',
    description: 'Gere textos de vendas persuasivos e personalizados em segundos.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Financeiro',
    description: 'Acompanhe métricas, receitas e performance do seu negócio em tempo real.',
  },
  {
    icon: Shield,
    title: 'Contratos Digitais',
    description: 'Crie e gerencie contratos profissionais com assinatura digital segura.',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'Organize e acompanhe todos os seus clientes e projetos em um só lugar.',
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
            Recursos Poderosos
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Tudo que você precisa{' '}
            <span className="text-primary">em um só lugar</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para{' '}
            <span className="text-primary font-semibold">criar, vender e escalar seu negócio</span>.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden">
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;
