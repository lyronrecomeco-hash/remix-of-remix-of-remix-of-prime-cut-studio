import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';
import { TargetAI } from '../types';
import { Input } from '@/components/ui/input';

const AI_OPTIONS: { id: TargetAI; name: string; description: string; icon: string }[] = [
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'Plataforma de criação de apps com IA',
    icon: '💜',
  },
  {
    id: 'google-studio',
    name: 'Google Studio IA',
    description: 'Suite de ferramentas Google',
    icon: '🔵',
  },
  {
    id: 'base64',
    name: 'Base64',
    description: 'Plataforma de desenvolvimento',
    icon: '🟢',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI ChatGPT',
    icon: '🤖',
  },
  {
    id: 'other',
    name: 'Outra',
    description: 'Especifique a IA',
    icon: '✨',
  },
];

export const StepTargetAI: React.FC = () => {
  const { formData, updateFormData } = useProjectBuilder();

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-10">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          Qual IA você vai usar?
        </h3>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto px-2">
          Isso ajuda a otimizar o prompt para a plataforma escolhida
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-5 max-w-5xl mx-auto">
        {AI_OPTIONS.map((option, index) => {
          const isSelected = formData.targetAI === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateFormData('targetAI', option.id)}
              className={`
                relative p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-200 text-center group
                ${isSelected 
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                  : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                </motion.div>
              )}

              <span className="text-2xl sm:text-3xl lg:text-5xl mb-2 sm:mb-4 block">{option.icon}</span>
              <h4 className={`text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {option.name}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{option.description}</p>
            </motion.button>
          );
        })}
      </div>

      {formData.targetAI === 'other' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 sm:pt-6 max-w-md mx-auto px-2"
        >
          <Input
            placeholder="Nome da IA que você vai usar..."
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            className="h-10 sm:h-12 text-sm sm:text-base"
          />
        </motion.div>
      )}
    </div>
  );
};
