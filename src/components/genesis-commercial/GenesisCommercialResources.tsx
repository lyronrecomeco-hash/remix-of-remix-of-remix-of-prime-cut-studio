import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Radar, 
  FileText, 
  GraduationCap, 
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';

const resources = [
  {
    id: 'radar',
    icon: Radar,
    title: 'Radar de Prospecção',
    highlight: 'IA encontra clientes por você',
    description: 'Enquanto você dorme, nossa IA varre o Brasil inteiro buscando empresas prontas para comprar.',
  },
  {
    id: 'proposals',
    icon: FileText,
    title: 'Propostas Inteligentes',
    highlight: 'Feche em minutos, não dias',
    description: 'Gere propostas personalizadas que convertem. A IA entende o cliente e cria argumentos únicos.',
  },
  {
    id: 'academy',
    icon: GraduationCap,
    title: 'Academia de Vendas',
    highlight: 'Domine a arte de fechar',
    description: 'Simuladores de objeções, scripts de ligação e técnicas avançadas de negociação.',
  },
];

const GenesisCommercialResources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section id="recursos" ref={ref} className="py-20 md:py-28 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
      </div>

      <div className="container px-4 relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Zap className="w-4 h-4" />
            Ferramentas que Vendem
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-foreground">
            Seu arsenal completo de{' '}
            <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              vendas
            </span>
          </h2>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Tudo integrado. Tudo automatizado. Tudo para você <span className="text-primary font-semibold">vender mais</span>.
          </p>
        </motion.div>

        {/* Resources - Horizontal Cards */}
        <div className="space-y-4">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            const isHovered = hoveredId === resource.id;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
                onMouseEnter={() => setHoveredId(resource.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative"
              >
                <div className={`
                  relative flex items-center gap-6 rounded-2xl border p-5 md:p-6
                  bg-card/50 backdrop-blur-sm cursor-pointer
                  transition-all duration-300
                  ${isHovered ? 'border-primary/40 bg-primary/5 scale-[1.01]' : 'border-border/50 hover:border-border'}
                `}>
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isHovered ? 'bg-primary/20 scale-110' : 'bg-primary/10'}
                  `}>
                    <Icon className={`w-7 h-7 transition-colors duration-300 ${isHovered ? 'text-primary' : 'text-primary/70'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg md:text-xl font-bold text-foreground">{resource.title}</h3>
                      <span className={`
                        hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                        transition-all duration-300
                        ${isHovered ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'}
                      `}>
                        {resource.highlight}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isHovered ? 'bg-primary text-primary-foreground translate-x-1' : 'bg-muted/50 text-muted-foreground'}
                  `}>
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Glow effect */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-cyan-500/5 to-primary/5 pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* "E muito mais..." Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-cyan-500/10 to-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
              E muito mais...
            </span>
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Biblioteca de apps, gestão de contratos, missões de vendas e recursos exclusivos para assinantes.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialResources;
