import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';

const COMMON_FEATURES = [
  'Botão WhatsApp flutuante',
  'Mapa de localização',
  'Formulário de contato',
  'Galeria de fotos',
  'Reviews/Depoimentos',
  'Newsletter',
  'Chat ao vivo',
  'Integração com redes sociais',
  'Área de login',
  'Sistema de busca',
];

export const StepFeatures: React.FC = () => {
  const { formData, updateFormData, selectedTemplate } = useProjectBuilder();

  // Merge template features with common features
  const allFeatures = React.useMemo(() => {
    const templateFeatures = selectedTemplate?.specificFeatures || [];
    const merged = [...new Set([...templateFeatures, ...COMMON_FEATURES])];
    return merged;
  }, [selectedTemplate]);

  // Pre-select template features on mount
  React.useEffect(() => {
    if (selectedTemplate && formData.selectedFeatures.length === 0) {
      updateFormData('selectedFeatures', selectedTemplate.specificFeatures);
    }
  }, [selectedTemplate]);

  const toggleFeature = (feature: string) => {
    const current = formData.selectedFeatures;
    if (current.includes(feature)) {
      updateFormData('selectedFeatures', current.filter(f => f !== feature));
    } else {
      updateFormData('selectedFeatures', [...current, feature]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Funcionalidades Específicas
        </h3>
        <p className="text-muted-foreground">
          Recursos que seu {selectedTemplate?.name} precisa
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allFeatures.map((feature, index) => {
            const isSelected = formData.selectedFeatures.includes(feature);
            const isSuggested = selectedTemplate?.specificFeatures.includes(feature);

            return (
              <motion.button
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleFeature(feature)}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary' : 'border-2 border-muted-foreground/30'}
                `}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {feature}
                  </span>
                  {isSuggested && (
                    <span className="ml-2 text-xs text-primary/60">✨ Recomendado</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          ✨ Funcionalidades recomendadas para {selectedTemplate?.name}
        </p>
      </div>
    </div>
  );
};
