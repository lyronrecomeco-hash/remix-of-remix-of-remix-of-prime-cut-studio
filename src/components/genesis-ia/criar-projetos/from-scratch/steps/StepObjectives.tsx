import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StepObjectives() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();
  const [customInput, setCustomInput] = useState('');

  const suggestedObjectives = selectedNiche?.defaultObjectives || [
    'Apresentar a empresa',
    'Captar clientes',
    'Gerar leads',
    'Vender produtos/serviços',
    'Construir autoridade',
    'Facilitar contato',
  ];

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
    <ScrollArea className="h-[320px] pr-2">
      <div className="space-y-4 max-w-2xl">
        {/* Suggested Objectives */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4 text-primary" />
            Objetivos Sugeridos
            {selectedNiche && <span className="text-xs text-muted-foreground">para {selectedNiche.name}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedObjectives.map((objective, index) => {
              const isSelected = formData.selectedObjectives.includes(objective);
              return (
                <motion.button
                  key={objective}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => toggleObjective(objective)}
                  className={`relative px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'bg-primary/20 border-primary/50 text-primary pr-7'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-foreground'
                  }`}
                >
                  {objective}
                  {isSelected && (
                    <Check className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Custom Objectives */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Adicionar Personalizado</label>
          <div className="flex gap-2">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Digite um objetivo..."
              className="bg-white/5 border-white/10 h-9"
              onKeyDown={(e) => e.key === 'Enter' && addCustomObjective()}
            />
            <Button onClick={addCustomObjective} size="icon" variant="outline" className="h-9 w-9">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {formData.customObjectives.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.customObjectives.map((objective) => (
                <span
                  key={objective}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/20 border border-primary/50 text-primary text-xs"
                >
                  {objective}
                  <button
                    onClick={() => removeCustomObjective(objective)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Selected Count */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            totalSelected > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
          }`}>
            {totalSelected}
          </div>
          <span className="text-xs text-muted-foreground">objetivo(s) selecionado(s)</span>
        </div>
      </div>
    </ScrollArea>
  );
}
