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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Qual IA você vai usar?
        </h3>
        <p className="text-muted-foreground">
          Isso ajuda a otimizar o prompt para a plataforma escolhida
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                relative p-5 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              <span className="text-3xl mb-3 block">{option.icon}</span>
              <h4 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
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
          className="pt-4"
        >
          <Input
            placeholder="Nome da IA que você vai usar..."
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            className="max-w-md"
          />
        </motion.div>
      )}
    </div>
  );
};
