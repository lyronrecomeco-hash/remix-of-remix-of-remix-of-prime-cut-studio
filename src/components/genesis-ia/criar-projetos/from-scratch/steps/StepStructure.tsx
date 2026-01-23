import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, X, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';

const COMMON_PAGES = [
  'Home', 'Sobre', 'Serviços', 'Produtos', 'Portfolio', 'Contato',
  'Blog', 'FAQ', 'Depoimentos', 'Galeria', 'Equipe', 'Preços',
  'Agendamento', 'Cardápio', 'Localização', 'Promoções'
];

export function StepStructure() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();
  const [customInput, setCustomInput] = useState('');

  const suggestedPages = useMemo(() => {
    if (selectedNiche?.suggestedPages) {
      return [...new Set([...selectedNiche.suggestedPages, ...COMMON_PAGES])];
    }
    return COMMON_PAGES;
  }, [selectedNiche]);

  const togglePage = (page: string) => {
    const current = formData.selectedPages;
    if (current.includes(page)) {
      updateFormData('selectedPages', current.filter(p => p !== page));
    } else {
      updateFormData('selectedPages', [...current, page]);
    }
  };

  const addCustomPage = () => {
    if (customInput.trim() && !formData.customPages.includes(customInput.trim())) {
      updateFormData('customPages', [...formData.customPages, customInput.trim()]);
      setCustomInput('');
    }
  };

  const removeCustomPage = (page: string) => {
    updateFormData('customPages', formData.customPages.filter(p => p !== page));
  };

  const allSelectedPages = [...formData.selectedPages, ...formData.customPages];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Estrutura do Projeto
        </h3>
        <p className="text-muted-foreground">
          Selecione as páginas/seções que o projeto terá
        </p>
      </div>

      {/* Suggested Pages */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <LayoutGrid className="w-4 h-4 text-blue-400" />
          Páginas Disponíveis
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestedPages.map((page, index) => {
            const isSelected = formData.selectedPages.includes(page);
            const isSuggested = selectedNiche?.suggestedPages?.includes(page);
            
            return (
              <motion.button
                key={page}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => togglePage(page)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {page}
                {isSuggested && !isSelected && (
                  <span className="ml-1 text-xs text-emerald-400">⭐</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Pages */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Adicionar Página Personalizada</label>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Ex: Parceiros, Certificações, Eventos..."
            className="bg-white/5 border-white/10"
            onKeyDown={(e) => e.key === 'Enter' && addCustomPage()}
          />
          <Button onClick={addCustomPage} size="icon" variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {formData.customPages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.customPages.map((page) => (
              <span
                key={page}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm"
              >
                {page}
                <button
                  onClick={() => removeCustomPage(page)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview Structure */}
      {allSelectedPages.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="text-sm font-medium mb-3 block">
            Estrutura do Menu ({allSelectedPages.length} páginas)
          </label>
          <div className="flex flex-wrap gap-2">
            {allSelectedPages.map((page, index) => (
              <span key={page} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <GripVertical className="w-3 h-3" />
                {page}
                {index < allSelectedPages.length - 1 && <span className="ml-2">→</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
