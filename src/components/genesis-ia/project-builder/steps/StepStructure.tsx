import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, X } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const COMMON_PAGES = [
  'Home',
  'Sobre',
  'Serviços',
  'Produtos',
  'Contato',
  'FAQ',
  'Blog',
  'Galeria',
  'Depoimentos',
  'Localização',
];

export const StepStructure: React.FC = () => {
  const { formData, updateFormData, selectedTemplate } = useProjectBuilder();
  const [customInput, setCustomInput] = React.useState('');

  // Merge template suggested pages with common pages
  const allPages = React.useMemo(() => {
    const templatePages = selectedTemplate?.suggestedPages || [];
    const merged = [...new Set([...templatePages, ...COMMON_PAGES])];
    return merged;
  }, [selectedTemplate]);

  // Pre-select template pages on mount
  React.useEffect(() => {
    if (selectedTemplate && formData.selectedPages.length === 0) {
      updateFormData('selectedPages', selectedTemplate.suggestedPages);
    }
  }, [selectedTemplate]);

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

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Estrutura do Site
        </h3>
        <p className="text-muted-foreground">
          Selecione as páginas que seu site terá
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Suggested Pages */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allPages.map((page, index) => {
            const isSelected = formData.selectedPages.includes(page);
            const isSuggested = selectedTemplate?.suggestedPages.includes(page);

            return (
              <motion.button
                key={page}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => togglePage(page)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all text-sm
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-border bg-card hover:border-primary/50 text-foreground'
                  }
                  ${isSuggested && !isSelected ? 'border-dashed' : ''}
                `}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {page}
                {isSuggested && <span className="text-xs opacity-60">✨</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Custom Pages */}
        {formData.customPages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {formData.customPages.map((page) => (
              <div
                key={page}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm"
              >
                {page}
                <button
                  onClick={() => removeCustomPage(page)}
                  className="w-4 h-4 rounded-full hover:bg-primary/30 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Page */}
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar página personalizada..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomPage()}
          />
          <Button onClick={addCustomPage} variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          ✨ Páginas sugeridas para {selectedTemplate?.name}
        </p>
      </div>
    </div>
  );
};
