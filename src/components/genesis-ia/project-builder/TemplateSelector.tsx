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
    <div className="w-full px-2 sm:px-0">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                  Escolha o Template
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Selecione o nicho para gerar um prompt preciso
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm mb-3 sm:mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {TEMPLATES.map((template, index) => {
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onSelect(template)}
                  className={`
                    relative p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left group hover:-translate-y-1
                    ${isSelected 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50 hover:shadow-md'
                    }
                  `}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{template.icon}</div>

                  {/* Name */}
                  <h3 className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Continue Button - Compact */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left">
            {selectedTemplate ? (
              <>Selecionado: <span className="font-medium text-foreground">{selectedTemplate.icon} {selectedTemplate.name}</span></>
            ) : (
              'Selecione um template para continuar'
            )}
          </p>
          
          <Button
            onClick={onContinue}
            disabled={!selectedTemplate}
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto"
          >
            Continuar
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};