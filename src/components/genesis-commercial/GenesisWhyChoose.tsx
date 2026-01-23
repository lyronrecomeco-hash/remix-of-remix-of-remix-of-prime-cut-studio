import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Palette, 
  BarChart3, 
  Globe, 
  Shield,
  Bot,
  Layers,
  Check
} from 'lucide-react';

const features = [
  {
    id: 'ai',
    icon: Bot,
    title: 'IA que entende você',
    description: 'Nossa inteligência artificial não apenas gera — ela compreende seu contexto, seu nicho e suas necessidades.',
    highlight: 'Geração contextual avançada',
    demo: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Analisando contexto...</span>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <p className="text-xs text-foreground/80">
            "Quero criar um sistema para clínicas de estética"
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary/10 rounded-lg p-3 border border-primary/20"
        >
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/90">
              Identificado: agendamentos, prontuários, controle financeiro, fidelização...
            </p>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'evolution',
    icon: Zap,
    title: 'Evolução contínua',
    description: 'Atualize e evolua seus projetos existentes sem recriar do zero. Iteração inteligente e rápida.',
    highlight: 'Versões ilimitadas',
    demo: (
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-foreground/80">Quiz Interativo v2.1</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Atualizado agora</span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between bg-muted/20 rounded-lg p-3 border border-border/30"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/50" />
            <span className="text-xs text-foreground/60">Quiz Interativo v2.0</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Ontem</span>
        </motion.div>
      </div>
    ),
  },
  {
    id: 'visual',
    icon: Palette,
    title: 'Design system completo',
    description: 'Cores, tipografia, espaçamentos — tudo harmonizado automaticamente para um visual profissional.',
    highlight: 'Zero conhecimento em design',
    demo: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Qual estilo para seu SaaS?</span>
        </div>
        <div className="flex gap-2">
          {['Futurista', 'Minimalista', 'Corporativo'].map((style, i) => (
            <motion.button
              key={style}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={
                'px-3 py-1.5 text-xs rounded-lg border transition-all ' +
                (i === 1
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 text-foreground/70 border-border/50 hover:border-border')
              }
            >
              {style}
            </motion.button>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics integrado',
    description: 'Acompanhe métricas, conversões e performance do seu SaaS em tempo real, direto do painel.',
    highlight: 'Dados em tempo real',
    demo: (
      <div className="flex items-end justify-center gap-1.5 h-20">
        {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="w-6 rounded-t bg-gradient-to-t from-primary/60 to-primary"
          />
        ))}
      </div>
    ),
  },
];

const bonusFeatures = [
  { icon: Globe, label: 'Multi-idioma nativo' },
  { icon: Shield, label: 'Segurança enterprise' },
  { icon: Layers, label: 'Templates premium' },
];

const GenesisWhyChoose = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [activeFeature, setActiveFeature] = useState('ai');

  const currentFeature = features.find((f) => f.id === activeFeature) || features[0];

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 relative overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <div className="container px-4 relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="w-4 h-4" />
            Diferenciais
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
            Por que escolher a <span className="text-primary">Genesis</span>?
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Não somos apenas mais um gerador de sites. Somos a plataforma completa para criar, evoluir e escalar seu negócio digital.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Main Feature Card */}
          <div className="lg:row-span-2 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 md:p-8 relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <currentFeature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{currentFeature.title}</h3>
                  <span className="text-xs text-primary">{currentFeature.highlight}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {currentFeature.description}
              </p>

              {/* Demo Area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-background/50 rounded-xl border border-border/50 p-4 min-h-[120px]"
                >
                  {currentFeature.demo}
                </motion.div>
              </AnimatePresence>

              {/* Feature Tabs */}
              <div className="flex flex-wrap gap-2 mt-6">
                {features.map((f) => {
                  const Icon = f.icon;
                  const isActive = f.id === activeFeature;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFeature(f.id)}
                      className={
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ' +
                        (isActive
                          ? 'bg-primary/15 border-primary/30 text-primary'
                          : 'bg-muted/20 border-border/50 text-muted-foreground hover:border-border hover:text-foreground')
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {f.title.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 relative overflow-hidden group hover:border-primary/30 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-foreground mb-2">Prompts para qualquer ferramenta</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gere prompts otimizados para Lovable, Cursor, Bolt, v0 e mais. Um projeto, múltiplas possibilidades.
              </p>
              <div className="flex items-center gap-3">
                {['Lovable', 'Cursor', 'Bolt', 'v0'].map((tool, i) => (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="w-9 h-9 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {tool[0]}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 relative overflow-hidden group hover:border-primary/30 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-foreground mb-2">E muito mais...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recursos enterprise-ready para escalar seu negócio sem limites.
              </p>
              <div className="flex flex-wrap gap-2">
                {bonusFeatures.map((bonus, i) => {
                  const Icon = bonus.icon;
                  return (
                    <motion.div
                      key={bonus.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/50 text-xs text-muted-foreground"
                    >
                      <Icon className="w-3 h-3" />
                      {bonus.label}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GenesisWhyChoose;
