import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Quais são os objetivos do projeto?
        </h3>
        <p className="text-muted-foreground">
          Selecione os objetivos principais que o site/app deve alcançar
        </p>
      </div>

      {/* Suggested Objectives */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Target className="w-4 h-4 text-primary" />
          Objetivos Sugeridos {selectedNiche && `para ${selectedNiche.name}`}
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestedObjectives.map((objective, index) => {
            const isSelected = formData.selectedObjectives.includes(objective);
            return (
              <motion.button
                key={objective}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => toggleObjective(objective)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-foreground'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {objective}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Objectives */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Objetivos Personalizados</label>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Digite um objetivo personalizado..."
            className="bg-white/5 border-white/10"
            onKeyDown={(e) => e.key === 'Enter' && addCustomObjective()}
          />
          <Button onClick={addCustomObjective} size="icon" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {formData.customObjectives.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.customObjectives.map((objective) => (
              <span
                key={objective}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm"
              >
                {objective}
                <button
                  onClick={() => removeCustomObjective(objective)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selected Count */}
      <div className="text-center text-sm text-muted-foreground">
        {formData.selectedObjectives.length + formData.customObjectives.length} objetivo(s) selecionado(s)
      </div>
    </div>
  );
}
