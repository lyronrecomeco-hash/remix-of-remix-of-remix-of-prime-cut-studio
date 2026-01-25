import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  FileText, 
  GraduationCap, 
  Smartphone,
  Target,
  Zap,
  ChevronRight,
  Lock,
  Sparkles
} from 'lucide-react';

const resources = [
  {
    id: 'radar',
    icon: Radar,
    title: 'Radar de Prospecção',
    subtitle: 'IA que encontra clientes por você',
    description: 'Varredura automática de empresas em todo Brasil. A IA analisa, qualifica e entrega leads prontos para prospecção.',
    features: ['Busca por nicho e região', 'Score de qualificação', 'Dados de contato'],
    locked: false,
    color: 'primary',
  },
  {
    id: 'proposals',
    icon: FileText,
    title: 'Propostas com IA',
    subtitle: 'Feche negócios mais rápido',
    description: 'Gere propostas comerciais personalizadas em segundos. A IA entende o cliente e cria argumentos de venda únicos.',
    features: ['Perguntas qualificadoras', 'Copy persuasiva', 'Formato profissional'],
    locked: false,
    color: 'cyan',
  },
  {
    id: 'academy',
    icon: GraduationCap,
    title: 'Academia de Vendas',
    subtitle: 'Aprenda a fechar mais',
    description: 'Treinamentos práticos de vendas, objeções, cold call e estratégias de conversão para escalar resultados.',
    features: ['Simulador de objeções', 'Scripts de ligação', 'Técnicas avançadas'],
    locked: false,
    color: 'violet',
  },
  {
    id: 'apps',
    icon: Smartphone,
    title: 'Biblioteca de Apps',
    subtitle: 'Templates prontos para usar',
    description: 'Catálogo de aplicativos virais e modelos testados para diferentes nichos de mercado.',
    features: ['Petshop, barbearia, clínicas...', 'Customização total', 'Deploy em 1 clique'],
    locked: true,
    color: 'emerald',
  },
  {
    id: 'sprint',
    icon: Zap,
    title: 'Missão Sprint',
    subtitle: 'Metas + execução guiada',
    description: 'Defina sua meta financeira e receba um plano de ação diário com tarefas práticas para atingir o objetivo.',
    features: ['Plano personalizado', 'Reset diário', 'Atalhos para recursos'],
    locked: true,
    color: 'amber',
  },
  {
    id: 'contracts',
    icon: Target,
    title: 'Gestão de Contratos',
    subtitle: 'Organize seus clientes',
    description: 'Acompanhe todos os seus contratos, pagamentos e status de projetos em um painel centralizado.',
    features: ['Controle de recorrência', 'Alertas de vencimento', 'Histórico completo'],
    locked: true,
    color: 'rose',
  },
];

const GenesisCommercialResources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      primary: { bg: 'bg-primary/15', border: 'border-primary/30', text: 'text-primary' },
      cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', text: 'text-cyan-400' },
      violet: { bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-400' },
      emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
      amber: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
      rose: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
    };
    return colors[color] || colors.primary;
  };

  return (
    <section id="recursos" ref={ref} className="py-24 md:py-32 relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

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
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Recursos Inclusos
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
            Tudo que você precisa para{' '}
            <span className="text-primary">fechar negócios</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Ferramentas profissionais integradas em uma única plataforma. Sem complexidade, sem curva de aprendizado.
          </p>
        </motion.div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {resources.map((resource, index) => {
            const colors = getColorClasses(resource.color);
            const Icon = resource.icon;
            const isHovered = hoveredId === resource.id;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                onMouseEnter={() => setHoveredId(resource.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative"
              >
                <div className={`
                  relative h-full rounded-2xl border bg-card/60 backdrop-blur-sm p-6 
                  transition-all duration-300 cursor-pointer overflow-hidden
                  ${isHovered ? `border-${resource.color === 'primary' ? 'primary' : resource.color + '-500'}/40 bg-card/80` : 'border-border/60 hover:border-border'}
                  ${resource.locked ? 'opacity-80' : ''}
                `}>
                  {/* Locked overlay */}
                  {resource.locked && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/80 text-muted-foreground text-[10px] font-medium">
                        <Lock className="w-3 h-3" />
                        Assinante
                      </div>
                    </div>
                  )}

                  {/* Gradient glow on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 ${colors.bg} pointer-events-none`}
                        style={{ opacity: 0.3 }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-lg font-bold text-foreground mb-1">{resource.title}</h3>
                    <p className={`text-sm ${colors.text} font-medium mb-3`}>{resource.subtitle}</p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Features list */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {resource.features.map((feature, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <ChevronRight className={`w-3 h-3 ${colors.text}`} />
                              {feature}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">6 ferramentas</span> integradas por um único valor mensal
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisCommercialResources;
