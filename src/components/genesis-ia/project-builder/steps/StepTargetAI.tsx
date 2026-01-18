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
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          Qual IA você vai usar?
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
          Isso ajuda a otimizar o prompt para a plataforma escolhida
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5 max-w-5xl mx-auto">
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
                relative p-6 lg:p-8 rounded-xl border-2 transition-all duration-200 text-center group
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
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              <span className="text-4xl lg:text-5xl mb-4 block">{option.icon}</span>
              <h4 className={`text-lg font-semibold mb-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                {option.name}
              </h4>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </motion.button>
          );
        })}
      </div>

      {formData.targetAI === 'other' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-6 max-w-md mx-auto"
        >
          <Input
            placeholder="Nome da IA que você vai usar..."
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            className="h-12 text-base"
          />
        </motion.div>
      )}
    </div>
  );
};
