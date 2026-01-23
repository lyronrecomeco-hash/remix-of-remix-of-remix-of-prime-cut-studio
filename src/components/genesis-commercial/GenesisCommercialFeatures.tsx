import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageSquare, MousePointer, Palette, Rocket, Sparkles } from 'lucide-react';

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: MessageSquare,
    number: '1',
    title: 'Responda as Perguntas',
    description:
      'Explique seu projeto, público e propósito. A Genesis entende o contexto e organiza a estrutura ideal.',
  },
  {
    icon: Palette,
    number: '2',
    title: 'Visualize e Personalize',
    description:
      'Ajuste cores, tipografia e estilo com poucos cliques — mantendo um padrão visual profissional.',
  },
  {
    icon: MousePointer,
    number: '3',
    title: 'Gere com 1 clique',
    description:
      'Em instantes, seu projeto fica pronto para gerar páginas, fluxos e telas com consistência de design.',
  },
  {
    icon: Rocket,
    number: '4',
    title: 'Publique e Lucre',
    description:
      'Publique online, conecte integrações e comece a vender — com um produto escalável e bem estruturado.',
  },
];

const GenesisCommercialFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const cards = useMemo(
    () =>
      steps.map((s, idx) => ({
        ...s,
        align: idx % 2 === 0 ? 'left' : 'right',
        idx,
      })),
    []
  );

  useEffect(() => {
    if (!isPlaying || !isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, isInView]);

  return (
    <section 
      id="recursos" 
      ref={ref} 
      className="py-24 md:py-32 relative overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Como Funciona
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
            Com a <span className="text-primary">Genesis</span>, desenvolver um SaaS é{' '}
            <span className="text-primary">fácil, ágil e eficiente</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Um fluxo claro, visual e conectado — do questionário até a publicação.
          </p>
        </motion.div>

        {/* Timeline (ZOD-style) */}
        <div className="relative mx-auto max-w-5xl">
          {/* center line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border/70" />

          <div className="space-y-6 md:space-y-10">
            {cards.map((step) => {
              const Icon = step.icon;
              const isActive = step.idx === activeStep;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: step.idx * 0.08 }}
                  className="relative"
                  onMouseEnter={() => {
                    setActiveStep(step.idx);
                    setIsPlaying(false);
                  }}
                  onMouseLeave={() => setIsPlaying(true)}
                  onClick={() => {
                    setActiveStep(step.idx);
                    setIsPlaying(false);
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
                    {/* left slot */}
                    <div className={step.align === 'left' ? 'md:pr-10' : 'md:pr-10 md:order-2'}>
                      {step.align === 'left' && (
                        <motion.div
                          whileHover={{ y: -2 }}
                          className={
                            'relative rounded-2xl border bg-card/60 backdrop-blur-md p-6 ' +
                            (isActive
                              ? 'border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_20px_40px_-20px_hsl(var(--primary)/0.35)]'
                              : 'border-border/60')
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div className={
                              'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ' +
                              (isActive ? 'bg-primary/15 border-primary/25' : 'bg-muted/30 border-border/60')
                            }>
                              <Icon className={
                                'w-6 h-6 ' + (isActive ? 'text-primary' : 'text-muted-foreground')
                              } />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-foreground">
                                {step.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* right slot */}
                    <div className={step.align === 'right' ? 'md:pl-10' : 'md:pl-10 md:order-1'}>
                      {step.align === 'right' && (
                        <motion.div
                          whileHover={{ y: -2 }}
                          className={
                            'relative rounded-2xl border bg-card/60 backdrop-blur-md p-6 ' +
                            (isActive
                              ? 'border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.25),0_20px_40px_-20px_hsl(var(--primary)/0.35)]'
                              : 'border-border/60')
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div className={
                              'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ' +
                              (isActive ? 'bg-primary/15 border-primary/25' : 'bg-muted/30 border-border/60')
                            }>
                              <Icon className={
                                'w-6 h-6 ' + (isActive ? 'text-primary' : 'text-muted-foreground')
                              } />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-foreground">
                                {step.title}
                              </h3>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* center marker */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {/* connector */}
                    <div
                      className={
                        'absolute top-1/2 -translate-y-1/2 h-px w-10 ' +
                        (step.align === 'left' ? 'right-10' : 'left-10')
                      }
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, hsl(var(--primary)/0.6), transparent)',
                      }}
                    />

                    <motion.div
                      animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 1.6, repeat: isActive ? Infinity : 0 }}
                      className={
                        'relative w-12 h-12 rounded-full grid place-items-center border bg-background ' +
                        (isActive
                          ? 'border-primary/50 shadow-[0_0_24px_hsl(var(--primary)/0.35)]'
                          : 'border-border/70')
                      }
                    >
                      <span className={
                        'text-sm font-semibold ' +
                        (isActive ? 'text-primary' : 'text-muted-foreground')
                      }>
                        {step.number}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* small indicator */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden
              />
              {isPlaying ? 'Auto' : 'Manual'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenesisCommercialFeatures;
