import React from 'react';
import { motion } from 'framer-motion';
import { Check, Code, Search, Zap, Smartphone } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';

const QUALITY_OPTIONS = [
  {
    key: 'productionReady' as const,
    icon: Code,
    title: 'Código Pronto para Produção',
    description: 'Código limpo, otimizado e sem bugs',
  },
  {
    key: 'seoOptimized' as const,
    icon: Search,
    title: 'SEO Otimizado',
    description: 'Meta tags, schema, sitemap e boas práticas',
  },
  {
    key: 'performanceOptimized' as const,
    icon: Zap,
    title: 'Performance Otimizada',
    description: 'Lazy loading, code splitting, cache',
  },
  {
    key: 'mobileFirst' as const,
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Design responsivo priorizando mobile',
  },
];

export const StepQuality: React.FC = () => {
  const { formData, updateFormData } = useProjectBuilder();

  const toggleOption = (key: keyof typeof formData) => {
    const current = formData[key];
    if (typeof current === 'boolean') {
      updateFormData(key, !current as never);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Qualidade e Regras
        </h3>
        <p className="text-muted-foreground">
          Padrões técnicos para seu projeto
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-3">
          {QUALITY_OPTIONS.map((option, index) => {
            const isSelected = formData[option.key] === true;
            const Icon = option.icon;

            return (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => toggleOption(option.key)}
                className={`
                  w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                <div className={`
                  w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary' : 'border-2 border-muted-foreground/30'}
                `}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            💡 Recomendamos manter todas as opções ativas para um projeto profissional
          </p>
        </div>
      </div>
    </div>
  );
};
