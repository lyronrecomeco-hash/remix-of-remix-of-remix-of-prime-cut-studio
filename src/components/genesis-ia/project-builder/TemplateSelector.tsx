import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATES, Template } from './types';

interface TemplateSelectorProps {
  selectedTemplate: Template | null;
  onSelect: (template: Template) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
  onBack,
  onContinue,
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Escolha o Template</h2>
          <p className="text-muted-foreground">Selecione o nicho que melhor representa seu projeto</p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {TEMPLATES.map((template, index) => {
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(template)}
              className={`
                relative p-5 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                  : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-3">{template.icon}</div>

              {/* Name */}
              <h3 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {template.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!selectedTemplate}
          size="lg"
          className="min-w-[200px]"
        >
          Continuar com {selectedTemplate?.name || 'Template'}
        </Button>
      </div>
    </div>
  );
};
