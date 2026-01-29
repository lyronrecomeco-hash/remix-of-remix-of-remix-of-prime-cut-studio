import { motion } from 'framer-motion';
import { Smartphone, Search, BarChart3, Zap, Accessibility, Check, Monitor, Tablet, MonitorUp } from 'lucide-react';
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

  const responsiveOptions = [
    { key: 'responsiveMobile' as const, icon: Smartphone, title: 'Mobile', description: '< 640px (celulares)' },
    { key: 'responsiveTablet' as const, icon: Tablet, title: 'Tablet', description: '640px - 1024px' },
    { key: 'responsiveDesktop' as const, icon: Monitor, title: 'Desktop', description: '1024px - 1440px' },
    { key: 'responsiveLargeScreen' as const, icon: MonitorUp, title: 'Large Screen', description: '> 1440px (monitores grandes)' },
  ];

  const enabledCount = extras.filter(e => formData[e.key]).length;
  const responsiveCount = responsiveOptions.filter(r => formData[r.key]).length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Extras Section */}
      <div className="space-y-2">
        <h4 className="text-xs sm:text-sm font-medium text-white/70 flex items-center gap-2">
          ⚡ Recursos Avançados
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {extras.map((extra, index) => {
            const Icon = extra.icon;
            const isEnabled = formData[extra.key];
            
            return (
              <motion.div
                key={extra.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`relative p-3 sm:p-4 rounded-xl border transition-all ${
                  isEnabled
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      isEnabled ? 'bg-primary/20' : 'bg-white/10'
                    }`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium">{extra.title}</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{extra.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => updateFormData(extra.key, checked)}
                  />
                </div>
                {isEnabled && (
                  <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Responsiveness Section */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <h4 className="text-xs sm:text-sm font-medium text-white/70 flex items-center gap-2">
          📱 Responsividade por Dispositivo
        </h4>
        <p className="text-[10px] sm:text-xs text-muted-foreground mb-2">
          Selecione os dispositivos que o projeto deve suportar
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {responsiveOptions.map((option, index) => {
            const Icon = option.icon;
            const isEnabled = formData[option.key];
            
            return (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => updateFormData(option.key, !isEnabled)}
                className={`relative p-3 sm:p-4 rounded-xl border transition-all text-center ${
                  isEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                  isEnabled ? 'bg-emerald-500/20' : 'bg-white/10'
                }`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isEnabled ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                </div>
                <h4 className="text-xs sm:text-sm font-medium">{option.title}</h4>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">{option.description}</p>
                {isEnabled && (
                  <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
              enabledCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
            }`}>
              {enabledCount}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">recursos</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${
              responsiveCount > 0 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-muted-foreground'
            }`}>
              {responsiveCount}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">dispositivos</span>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          💡 Mobile + Desktop recomendados
        </span>
      </div>
    </div>
  );
}