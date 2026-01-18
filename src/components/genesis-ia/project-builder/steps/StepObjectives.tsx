import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const StepObjectives: React.FC = () => {
  const { formData, updateFormData, selectedTemplate } = useProjectBuilder();
  const [customInput, setCustomInput] = React.useState('');

  const objectives = selectedTemplate?.objectives || [];

  const toggleObjective = (objective: string) => {
    const current = formData.selectedObjectives;
    if (current.includes(objective)) {
      updateFormData('selectedObjectives', current.filter(o => o !== objective));
    } else {
      updateFormData('selectedObjectives', [...current, objective]);
    }
  };

  const addCustomObjective = () => {
    if (customInput.trim()) {
      updateFormData('customObjective', customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Objetivos do Site
        </h3>
        <p className="text-muted-foreground">
          O que seu {selectedTemplate?.name} precisa alcançar?
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {objectives.map((objective, index) => {
            const isSelected = formData.selectedObjectives.includes(objective);

            return (
              <motion.button
                key={objective}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleObjective(objective)}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary' : 'border-2 border-muted-foreground/30'}
                `}>
                  {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
                <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                  {objective}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Objective */}
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar objetivo personalizado..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomObjective()}
          />
          <Button onClick={addCustomObjective} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.customObjective && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-sm text-primary">+ {formData.customObjective}</span>
          </div>
        )}
      </div>
    </div>
  );
};
