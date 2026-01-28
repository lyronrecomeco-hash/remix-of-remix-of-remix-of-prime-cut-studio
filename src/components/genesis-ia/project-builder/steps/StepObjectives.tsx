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
    <div className="space-y-6 px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-10">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
          Objetivos do Site
        </h3>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto px-2">
          O que seu {selectedTemplate?.name} precisa alcançar?
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
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
                  flex items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/10' 
                    : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary' : 'border-2 border-muted-foreground/30'}
                `}>
                  {isSelected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />}
                </div>
                <span className={`text-sm sm:text-base ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                  {objective}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Objective */}
        <div className="flex gap-2 sm:gap-3 max-w-xl mx-auto">
          <Input
            placeholder="Adicionar objetivo personalizado..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomObjective()}
            className="h-10 sm:h-12 text-sm sm:text-base"
          />
          <Button onClick={addCustomObjective} variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {formData.customObjective && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 max-w-xl mx-auto">
            <span className="text-sm sm:text-base text-primary font-medium">+ {formData.customObjective}</span>
          </div>
        )}
      </div>
    </div>
  );
};
