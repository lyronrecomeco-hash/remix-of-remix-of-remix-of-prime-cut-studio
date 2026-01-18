import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Layers, ArrowRight } from 'lucide-react';
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
    <div className="w-full min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-12 w-12 rounded-xl shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Escolha o Template
                </h1>
              </div>
              <p className="text-base lg:text-lg text-muted-foreground">
                Selecione o nicho que melhor representa seu projeto. Isso ajudará a gerar um prompt mais preciso.
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {TEMPLATES.map((template, index) => {
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onSelect(template)}
                  className={`
                    relative p-5 lg:p-6 rounded-xl border-2 transition-all duration-200 text-left group
                    ${isSelected 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.02]' 
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
                    }
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className="text-4xl lg:text-5xl mb-4">{template.icon}</div>

                  {/* Name */}
                  <h3 className={`text-base lg:text-lg font-semibold mb-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {selectedTemplate ? (
              <>Selecionado: <span className="font-medium text-foreground">{selectedTemplate.icon} {selectedTemplate.name}</span></>
            ) : (
              'Selecione um template para continuar'
            )}
          </p>
          
          <Button
            onClick={onContinue}
            disabled={!selectedTemplate}
            size="lg"
            className="h-12 px-8 text-base min-w-[200px]"
          >
            Continuar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
