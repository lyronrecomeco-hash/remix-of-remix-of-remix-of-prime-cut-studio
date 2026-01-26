import { motion } from 'framer-motion';
import { Smartphone, Search, BarChart3, Zap, Accessibility, Check, Monitor } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { Switch } from '@/components/ui/switch';

export function StepExtras() {
  const { formData, updateFormData } = useFromScratch();

  const extras = [
    { key: 'isPWA' as const, icon: Smartphone, title: 'PWA', description: 'App instalável, funciona offline' },
    { key: 'hasAdvancedSEO' as const, icon: Search, title: 'SEO Avançado', description: 'Meta tags, schema markup' },
    { key: 'hasAnalytics' as const, icon: BarChart3, title: 'Analytics', description: 'GA4, eventos customizados' },
    { key: 'isPerformanceOptimized' as const, icon: Zap, title: 'Performance', description: 'Lazy loading, cache' },
    { key: 'hasAccessibility' as const, icon: Accessibility, title: 'Acessibilidade', description: 'WCAG 2.1, ARIA' },
  ];

  const enabledCount = extras.filter(e => formData[e.key]).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {extras.map((extra, index) => {
          const Icon = extra.icon;
          const isEnabled = formData[extra.key];
          
          return (
            <motion.div
              key={extra.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isEnabled
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isEnabled ? 'bg-primary/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{extra.title}</h4>
                    <p className="text-xs text-muted-foreground">{extra.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateFormData(extra.key, checked)}
                />
              </div>
              {isEnabled && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            enabledCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
          }`}>
            {enabledCount}
          </div>
          <span className="text-sm text-muted-foreground">
            de {extras.length} recursos ativados
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          💡 Recomendamos todos ativos
        </span>
      </div>
    </div>
  );
}
