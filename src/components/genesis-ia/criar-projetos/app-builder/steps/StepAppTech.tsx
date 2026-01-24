import { motion } from 'framer-motion';
import { Check, Smartphone, Wifi, BarChart3, Bell, Zap, Moon } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';

interface TechExtra {
  id: keyof Pick<ReturnType<typeof useAppBuilder>['formData'], 
    'isPWA' | 'hasOfflineMode' | 'hasAnalytics' | 'hasPushNotifications' | 'isPerformanceOptimized' | 'hasDarkMode'
  >;
  name: string;
  description: string;
  icon: React.ElementType;
  recommended: boolean;
}

export function StepAppTech() {
  const { formData, updateFormData } = useAppBuilder();

  const techExtras: TechExtra[] = [
    {
      id: 'isPWA',
      name: 'PWA (Progressive Web App)',
      description: 'Instale como app nativo no celular',
      icon: Smartphone,
      recommended: true
    },
    {
      id: 'hasOfflineMode',
      name: 'Modo Offline',
      description: 'Funciona sem conexão com internet',
      icon: Wifi,
      recommended: false
    },
    {
      id: 'hasAnalytics',
      name: 'Analytics',
      description: 'Métricas de uso e comportamento',
      icon: BarChart3,
      recommended: true
    },
    {
      id: 'hasPushNotifications',
      name: 'Push Notifications',
      description: 'Notificações no celular do usuário',
      icon: Bell,
      recommended: false
    },
    {
      id: 'isPerformanceOptimized',
      name: 'Performance Otimizada',
      description: 'Lazy loading, code splitting, cache',
      icon: Zap,
      recommended: true
    },
    {
      id: 'hasDarkMode',
      name: 'Suporte Dark Mode',
      description: 'Tema escuro automático',
      icon: Moon,
      recommended: true
    }
  ];

  const toggleExtra = (id: TechExtra['id']) => {
    updateFormData(id, !formData[id]);
  };

  const enabledCount = techExtras.filter(t => formData[t.id]).length;

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Extras Técnicos
        </h3>
        <p className="text-sm text-muted-foreground">
          Recursos avançados para seu aplicativo
        </p>
      </div>

      {/* Enabled count */}
      <div className="flex items-center justify-between px-1 mb-4">
        <span className="text-xs text-muted-foreground">
          {enabledCount} recurso(s) ativado(s)
        </span>
        <span className="text-xs text-primary flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Recomendado
        </span>
      </div>

      {/* Tech extras grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {techExtras.map((tech, index) => {
          const isEnabled = formData[tech.id];
          const Icon = tech.icon;

          return (
            <motion.button
              key={tech.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleExtra(tech.id)}
              className={`
                relative p-4 rounded-xl border transition-all text-left
                ${isEnabled 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                  : tech.recommended
                    ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              {/* Toggle indicator */}
              <div 
                className={`
                  absolute top-3 right-3 w-10 h-6 rounded-full transition-colors
                  ${isEnabled ? 'bg-primary' : 'bg-white/20'}
                `}
              >
                <motion.div
                  animate={{ x: isEnabled ? 18 : 2 }}
                  className="w-5 h-5 mt-0.5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  {isEnabled && <Check className="w-3 h-3 text-primary" />}
                </motion.div>
              </div>

              {/* Recommended badge */}
              {tech.recommended && !isEnabled && (
                <div className="absolute top-3 right-16 px-2 py-0.5 rounded-full bg-primary/20 text-[10px] text-primary font-medium">
                  Recomendado
                </div>
              )}

              <div className="flex items-start gap-3 pr-14">
                <div 
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${isEnabled ? 'bg-primary/20' : 'bg-white/10'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-white/60'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{tech.name}</h4>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
      >
        <p className="text-xs text-white/60 flex items-start gap-2">
          <Smartphone className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <span>
            PWA permite que seu app seja instalado como um aplicativo nativo, 
            com ícone na tela inicial e experiência fullscreen!
          </span>
        </p>
      </motion.div>
    </div>
  );
}
