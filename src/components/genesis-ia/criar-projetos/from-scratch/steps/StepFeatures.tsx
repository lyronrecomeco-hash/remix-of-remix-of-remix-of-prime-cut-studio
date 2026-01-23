import { motion } from 'framer-motion';
import { Zap, Link, Check, Star } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { COMMON_FEATURES, INTEGRATIONS } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <ScrollArea className="h-[340px] pr-2">
      <div className="space-y-5 max-w-3xl">
        {/* Features */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Zap className="w-4 h-4 text-primary" />
            Funcionalidades
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allFeatures.map((feature, index) => {
              const isSelected = formData.selectedFeatures.includes(feature);
              const isSuggested = suggestedFeatures.includes(feature);
              
              return (
                <motion.button
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.015 }}
                  onClick={() => toggleFeature(feature)}
                  className={`relative px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {isSelected && <Check className="w-3 h-3" />}
                    {feature}
                    {isSuggested && !isSelected && <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Integrations */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Link className="w-4 h-4 text-primary" />
            Integrações Externas
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {INTEGRATIONS.map((integration, index) => {
              const isSelected = formData.integrations.includes(integration.id);
              
              return (
                <motion.button
                  key={integration.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => toggleIntegration(integration.id)}
                  className={`relative p-2 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{integration.icon}</span>
                  <span className="text-[10px] font-medium line-clamp-1">{integration.name}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              formData.selectedFeatures.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
            }`}>
              {formData.selectedFeatures.length}
            </div>
            <span className="text-xs text-muted-foreground">features</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              formData.integrations.length > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
            }`}>
              {formData.integrations.length}
            </div>
            <span className="text-xs text-muted-foreground">integrações</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
