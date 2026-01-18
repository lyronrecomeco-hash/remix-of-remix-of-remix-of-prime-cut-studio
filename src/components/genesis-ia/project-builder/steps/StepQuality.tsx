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
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          Qualidade e Regras
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
          Padrões técnicos para seu projeto
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  w-full flex items-center gap-5 p-6 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/10' 
                    : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Icon className={`w-7 h-7 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`text-lg font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>

                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary' : 'border-2 border-muted-foreground/30'}
                `}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 p-5 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-base text-muted-foreground text-center">
            💡 Recomendamos manter todas as opções ativas para um projeto profissional
          </p>
        </div>
      </div>
    </div>
  );
};
