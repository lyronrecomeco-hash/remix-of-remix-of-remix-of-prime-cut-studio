import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { APP_FEATURES } from '../types';

export function StepAppFeatures() {
  const { formData, updateFormData, getCurrentAppType } = useAppBuilder();
  const appType = getCurrentAppType();

  const toggleFeature = (featureId: string) => {
    const current = formData.selectedFeatures;
    if (current.includes(featureId)) {
      updateFormData('selectedFeatures', current.filter(id => id !== featureId));
    } else {
      updateFormData('selectedFeatures', [...current, featureId]);
    }
  };

  // Group features by category
  const categories = [
    { id: 'auth', name: '🔐 Autenticação', features: APP_FEATURES.filter(f => f.category === 'auth') },
    { id: 'data', name: '📊 Dados', features: APP_FEATURES.filter(f => f.category === 'data') },
    { id: 'ui', name: '🎨 Interface', features: APP_FEATURES.filter(f => f.category === 'ui') },
    { id: 'integration', name: '🔗 Integrações', features: APP_FEATURES.filter(f => f.category === 'integration') },
    { id: 'advanced', name: '⚡ Avançado', features: APP_FEATURES.filter(f => f.category === 'advanced') },
  ];

  const suggestedIds = appType?.suggestedFeatures || [];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Funcionalidades
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecione os recursos do seu {appType?.name || 'app'}
        </p>
      </div>

      {/* Selected count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {formData.selectedFeatures.length} funcionalidade(s) selecionada(s)
        </span>
        <span className="text-xs text-primary flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Sugeridas para {appType?.name}
        </span>
      </div>

      {/* Features by category */}
      <div className="space-y-4">
        {categories.map((category, catIndex) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-white/80">{category.name}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {category.features.map((feature, index) => {
                const isSelected = formData.selectedFeatures.includes(feature.id);
                const isSuggested = suggestedIds.includes(feature.id);

                return (
                  <motion.button
                    key={feature.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIndex * 0.1 + index * 0.02 }}
                    onClick={() => toggleFeature(feature.id)}
                    className={`
                      relative p-3 rounded-xl border transition-all text-left
                      ${isSelected 
                        ? 'bg-primary/10 border-primary' 
                        : isSuggested
                          ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}

                    {isSuggested && !isSelected && (
                      <div className="absolute top-2 right-2">
                        <Zap className="w-3 h-3 text-primary" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{feature.icon}</span>
                      <h5 className="text-xs font-medium text-white truncate">{feature.name}</h5>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{feature.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
