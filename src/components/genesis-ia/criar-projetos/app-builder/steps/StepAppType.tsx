import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { APP_TYPES } from '../types';

export function StepAppType() {
  const { formData, updateFormData } = useAppBuilder();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Qual tipo de aplicativo você quer criar?
        </h3>
        <p className="text-sm text-muted-foreground">
          Escolha a categoria que melhor descreve seu projeto
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {APP_TYPES.map((appType, index) => {
          const isSelected = formData.appType === appType.id;

          return (
            <motion.button
              key={appType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                updateFormData('appType', appType.id);
                // Auto-select suggested screens and features
                updateFormData('selectedScreens', ['login', ...appType.suggestedScreens]);
                updateFormData('selectedFeatures', appType.suggestedFeatures);
              }}
              className={`
                relative p-4 rounded-xl border transition-all text-left
                ${isSelected 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              {/* Icon */}
              <div className="text-3xl mb-3">{appType.icon}</div>

              {/* Name */}
              <h4 className="text-sm font-semibold text-white mb-1">
                {appType.name}
              </h4>

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {appType.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
