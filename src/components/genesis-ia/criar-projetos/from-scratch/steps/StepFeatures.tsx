import { motion } from 'framer-motion';
import { Zap, Link } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { COMMON_FEATURES, INTEGRATIONS } from '../types';

export function StepFeatures() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();

  const suggestedFeatures = selectedNiche?.suggestedFeatures || [];
  const allFeatures = [...new Set([...suggestedFeatures, ...COMMON_FEATURES])];

  const toggleFeature = (feature: string) => {
    const current = formData.selectedFeatures;
    if (current.includes(feature)) {
      updateFormData('selectedFeatures', current.filter(f => f !== feature));
    } else {
      updateFormData('selectedFeatures', [...current, feature]);
    }
  };

  const toggleIntegration = (integration: string) => {
    const current = formData.integrations;
    if (current.includes(integration)) {
      updateFormData('integrations', current.filter(i => i !== integration));
    } else {
      updateFormData('integrations', [...current, integration]);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Funcionalidades e Integrações
        </h3>
        <p className="text-muted-foreground">
          Selecione as features e integrações do projeto
        </p>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Zap className="w-4 h-4 text-blue-400" />
          Funcionalidades
        </label>
        <div className="flex flex-wrap gap-2">
          {allFeatures.map((feature, index) => {
            const isSelected = formData.selectedFeatures.includes(feature);
            const isSuggested = suggestedFeatures.includes(feature);
            
            return (
              <motion.button
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => toggleFeature(feature)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {feature}
                {isSuggested && !isSelected && (
                  <span className="ml-1 text-xs text-emerald-400">⭐</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Integrations */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Link className="w-4 h-4 text-emerald-400" />
          Integrações Externas
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {INTEGRATIONS.map((integration, index) => {
            const isSelected = formData.integrations.includes(integration.id);
            
            return (
              <motion.button
                key={integration.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleIntegration(integration.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-xl block mb-1">{integration.icon}</span>
                <span className="text-sm font-medium line-clamp-1">{integration.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {formData.selectedFeatures.length} feature(s) • {formData.integrations.length} integração(ões)
      </div>
    </div>
  );
}
