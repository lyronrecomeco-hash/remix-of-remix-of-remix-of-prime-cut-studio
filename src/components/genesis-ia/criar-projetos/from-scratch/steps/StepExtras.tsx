import { motion } from 'framer-motion';
import { Settings, Smartphone, Search, BarChart3, Zap, Accessibility } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { Switch } from '@/components/ui/switch';

export function StepExtras() {
  const { formData, updateFormData } = useFromScratch();

  const extras = [
    {
      key: 'isPWA' as const,
      icon: Smartphone,
      title: 'Progressive Web App (PWA)',
      description: 'Instalável como app, funciona offline, notificações push',
      color: 'text-purple-400',
    },
    {
      key: 'hasAdvancedSEO' as const,
      icon: Search,
      title: 'SEO Avançado',
      description: 'Meta tags, sitemap, structured data, canonical URLs',
      color: 'text-blue-400',
    },
    {
      key: 'hasAnalytics' as const,
      icon: BarChart3,
      title: 'Analytics & Tracking',
      description: 'Google Analytics 4, eventos de conversão, funis',
      color: 'text-emerald-400',
    },
    {
      key: 'isPerformanceOptimized' as const,
      icon: Zap,
      title: 'Performance Otimizada',
      description: 'Lazy loading, code splitting, cache, Core Web Vitals',
      color: 'text-orange-400',
    },
    {
      key: 'isMobileFirst' as const,
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Design primário para mobile, depois adaptado para desktop',
      color: 'text-cyan-400',
    },
    {
      key: 'hasAccessibility' as const,
      icon: Accessibility,
      title: 'Acessibilidade (WCAG)',
      description: 'Contraste, navegação por teclado, screen readers, ARIA',
      color: 'text-pink-400',
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Recursos Extras
        </h3>
        <p className="text-muted-foreground">
          Configure recursos avançados e padrões de qualidade
        </p>
      </div>

      <div className="space-y-3">
        {extras.map((extra, index) => {
          const Icon = extra.icon;
          const isEnabled = formData[extra.key];
          
          return (
            <motion.div
              key={extra.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                isEnabled
                  ? 'bg-white/5 border-white/20'
                  : 'bg-white/[0.02] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${extra.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{extra.title}</h4>
                    <p className="text-sm text-muted-foreground">{extra.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateFormData(extra.key, checked)}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm text-primary font-medium">Dica Profissional</p>
            <p className="text-sm text-muted-foreground mt-1">
              Para projetos comerciais, recomendamos manter todas as opções ativas para 
              garantir qualidade, performance e boas práticas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
