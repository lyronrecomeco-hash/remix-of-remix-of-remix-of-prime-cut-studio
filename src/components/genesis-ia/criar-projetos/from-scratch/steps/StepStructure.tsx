import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, X, Check, Star } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Suggested Pages */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium">
          <LayoutGrid className="w-3.5 h-3.5 text-primary" />
          Páginas Disponíveis
        </label>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPages.map((page, index) => {
            const isSelected = formData.selectedPages.includes(page);
            const isSuggested = selectedNiche?.suggestedPages?.includes(page);
            
            return (
              <motion.button
                key={page}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.015 }}
                onClick={() => togglePage(page)}
                className={`relative px-2 py-1 rounded-lg border text-[11px] transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-1">
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                  {page}
                  {isSuggested && !isSelected && <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Pages */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Adicionar Página</label>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Ex: Parceiros, Certificações..."
            className="bg-white/5 border-white/10 h-8 text-xs flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustomPage()}
          />
          <Button onClick={addCustomPage} size="icon" variant="outline" className="h-8 w-8">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        {formData.customPages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {formData.customPages.map((page) => (
              <span
                key={page}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/20 border border-primary/50 text-primary text-[11px]"
              >
                {page}
                <button
                  onClick={() => removeCustomPage(page)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview Structure */}
      {allSelectedPages.length > 0 && (
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-medium text-muted-foreground">Estrutura do Menu</label>
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {allSelectedPages.length} páginas
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {allSelectedPages.map((page, index) => (
              <span key={page} className="text-[10px] text-foreground/70">
                {page}{index < allSelectedPages.length - 1 && <span className="mx-1 text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
