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
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          Estrutura do Site
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
          Selecione as páginas que seu site terá
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Suggested Pages */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
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
                  flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all text-base
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary font-medium shadow-md shadow-primary/10' 
                    : 'border-border bg-background hover:border-primary/50 text-foreground hover:shadow-md'
                  }
                  ${isSuggested && !isSelected ? 'border-dashed' : ''}
                `}
              >
                {isSelected && <Check className="w-4 h-4" />}
                {page}
                {isSuggested && <span className="text-sm opacity-60">✨</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Custom Pages */}
        {formData.customPages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {formData.customPages.map((page) => (
              <div
                key={page}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/20 text-primary text-base font-medium"
              >
                {page}
                <button
                  onClick={() => removeCustomPage(page)}
                  className="w-5 h-5 rounded-full hover:bg-primary/30 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Page */}
        <div className="flex gap-3 max-w-xl mx-auto">
          <Input
            placeholder="Adicionar página personalizada..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomPage()}
            className="h-12 text-base"
          />
          <Button onClick={addCustomPage} variant="outline" size="icon" className="h-12 w-12">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          ✨ Páginas sugeridas para {selectedTemplate?.name}
        </p>
      </div>
    </div>
  );
};
