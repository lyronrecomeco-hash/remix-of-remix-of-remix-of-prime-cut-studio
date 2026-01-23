import { motion } from 'framer-motion';
import { Settings, Smartphone, Search, BarChart3, Zap, Accessibility, Lightbulb } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StepExtras() {
  const { formData, updateFormData } = useFromScratch();

  const extras = [
    {
      key: 'isPWA' as const,
      icon: Smartphone,
      title: 'PWA',
      description: 'Instalável, offline, push',
    },
    {
      key: 'hasAdvancedSEO' as const,
      icon: Search,
      title: 'SEO Avançado',
      description: 'Meta tags, sitemap, schema',
    },
    {
      key: 'hasAnalytics' as const,
      icon: BarChart3,
      title: 'Analytics',
      description: 'GA4, eventos, funis',
    },
    {
      key: 'isPerformanceOptimized' as const,
      icon: Zap,
      title: 'Performance',
      description: 'Lazy load, cache, CWV',
    },
    {
      key: 'isMobileFirst' as const,
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Design mobile prioritário',
    },
    {
      key: 'hasAccessibility' as const,
      icon: Accessibility,
      title: 'Acessibilidade',
      description: 'WCAG, ARIA, teclado',
    },
  ];

  const enabledCount = extras.filter(e => formData[e.key]).length;

  return (
    <ScrollArea className="h-[340px] pr-2">
      <div className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {extras.map((extra, index) => {
            const Icon = extra.icon;
            const isEnabled = formData[extra.key];
            
            return (
              <motion.div
                key={extra.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-3 rounded-xl border transition-all ${
                  isEnabled
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-white/[0.02] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{extra.title}</h4>
                      <p className="text-[10px] text-muted-foreground">{extra.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => updateFormData(extra.key, checked)}
                    className="scale-90"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            enabledCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
          }`}>
            {enabledCount}
          </div>
          <span className="text-xs text-muted-foreground">de {extras.length} recursos ativados</span>
        </div>

        {/* Tip */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-medium">Dica: </span>
              Para projetos comerciais, recomendamos manter todas as opções ativas.
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
