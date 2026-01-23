import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, X, Check, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';

const DEFAULT_OBJECTIVES = [
  'Aumentar vendas online',
  'Capturar leads',
  'Fortalecer presença digital',
  'Automatizar processos',
  'Melhorar atendimento',
  'Gerar autoridade',
  'Expandir alcance',
  'Fidelizar clientes'
];

export function StepObjectives() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();
  const [customInput, setCustomInput] = useState('');

  const suggestedObjectives = useMemo(() => {
    if (selectedNiche?.defaultObjectives) {
      return [...new Set([...selectedNiche.defaultObjectives, ...DEFAULT_OBJECTIVES])];
    }
    return DEFAULT_OBJECTIVES;
  }, [selectedNiche]);

  const toggleObjective = (objective: string) => {
    const current = formData.selectedObjectives;
    if (current.includes(objective)) {
      updateFormData('selectedObjectives', current.filter(o => o !== objective));
    } else {
      updateFormData('selectedObjectives', [...current, objective]);
    }
  };

  const addCustomObjective = () => {
    if (customInput.trim() && !formData.customObjectives.includes(customInput.trim())) {
      updateFormData('customObjectives', [...formData.customObjectives, customInput.trim()]);
      setCustomInput('');
    }
  };

  const removeCustomObjective = (objective: string) => {
    updateFormData('customObjectives', formData.customObjectives.filter(o => o !== objective));
  };

  const totalSelected = formData.selectedObjectives.length + formData.customObjectives.length;

  return (
    <div className="space-y-4">
      {/* Suggested Objectives */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Target className="w-4 h-4 text-primary" />
          Objetivos Sugeridos
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestedObjectives.map((objective, index) => {
            const isSelected = formData.selectedObjectives.includes(objective);
            const isSuggested = selectedNiche?.defaultObjectives?.includes(objective);
            
            return (
              <motion.button
                key={objective}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => toggleObjective(objective)}
                className={`relative px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {objective}
                  {isSuggested && !isSelected && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Objective */}
      <div className="space-y-3">
        <label className="text-sm text-muted-foreground">Adicionar Objetivo</label>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Ex: Integrar com sistema ERP"
            className="bg-white/5 border-white/10 h-10 text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustomObjective()}
          />
          <Button onClick={addCustomObjective} size="icon" variant="outline" className="h-10 w-10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {formData.customObjectives.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.customObjectives.map((objective) => (
              <span
                key={objective}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm"
              >
                {objective}
                <button
                  onClick={() => removeCustomObjective(objective)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          totalSelected > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
        }`}>
          {totalSelected}
        </div>
        <span className="text-sm text-muted-foreground">
          {totalSelected === 1 ? 'objetivo selecionado' : 'objetivos selecionados'}
        </span>
      </div>
    </div>
  );
}
