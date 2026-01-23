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
    <div className="w-full">
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-lg shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  Escolha o Template
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Selecione o nicho para gerar um prompt preciso
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
                    relative p-3 rounded-xl border-2 transition-all duration-200 text-left group hover:-translate-y-1
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
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}

                  {/* Icon */}
                  <div className="text-3xl mb-2">{template.icon}</div>

                  {/* Name */}
                  <h3 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Continue Button - Compact */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
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
            className="h-9 px-4 text-sm"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};