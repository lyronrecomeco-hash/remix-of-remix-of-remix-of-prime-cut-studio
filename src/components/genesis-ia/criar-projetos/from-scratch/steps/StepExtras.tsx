import { motion } from 'framer-motion';
import { Smartphone, Search, BarChart3, Zap, Accessibility, Check } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { Switch } from '@/components/ui/switch';

export function StepExtras() {
  const { formData, updateFormData } = useFromScratch();

  const extras = [
    { key: 'isPWA' as const, icon: Smartphone, title: 'PWA', description: 'Instalável, offline' },
    { key: 'hasAdvancedSEO' as const, icon: Search, title: 'SEO', description: 'Meta tags, schema' },
    { key: 'hasAnalytics' as const, icon: BarChart3, title: 'Analytics', description: 'GA4, eventos' },
    { key: 'isPerformanceOptimized' as const, icon: Zap, title: 'Performance', description: 'Lazy, cache' },
    { key: 'isMobileFirst' as const, icon: Smartphone, title: 'Mobile First', description: 'Design mobile' },
    { key: 'hasAccessibility' as const, icon: Accessibility, title: 'Acessibilidade', description: 'WCAG, ARIA' },
  ];

  const enabledCount = extras.filter(e => formData[e.key]).length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {extras.map((extra, index) => {
          const Icon = extra.icon;
          const isEnabled = formData[extra.key];
          
          return (
            <motion.div
              key={extra.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`relative p-2.5 rounded-xl border transition-all ${
                isEnabled
                  ? 'bg-primary/10 border-primary/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isEnabled ? 'bg-primary/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-3 h-3 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-medium">{extra.title}</h4>
                    <p className="text-[9px] text-muted-foreground">{extra.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => updateFormData(extra.key, checked)}
                  className="scale-75"
                />
              </div>
              {isEnabled && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            enabledCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
          }`}>
            {enabledCount}
          </div>
          <span className="text-[10px] text-muted-foreground">
            de {extras.length} recursos ativados
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground">
          💡 Recomendamos todos ativos
        </span>
      </div>
    </div>
  );
}
