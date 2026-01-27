import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Plus, X, Check, Star, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';
import { getAppNicheById } from '../appNicheContexts';

// Páginas comuns para SITES
const COMMON_PAGES = [
  'Home', 'Sobre', 'Serviços', 'Produtos', 'Portfolio', 'Contato',
  'Blog', 'FAQ', 'Depoimentos', 'Galeria', 'Equipe', 'Preços',
  'Agendamento', 'Cardápio', 'Localização', 'Promoções'
];

// Módulos comuns para APPS
const COMMON_MODULES = [
  'Dashboard', 'Usuários', 'Configurações', 'Relatórios', 'Logs',
  'Notificações', 'Perfil', 'Ajuda', 'Integrações', 'Backup'
];

export function StepStructure() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();
  const [customInput, setCustomInput] = useState('');

  const isApp = formData.projectType === 'app';
  const appNiche = isApp ? getAppNicheById(formData.nicheId) : null;

  const suggestedPages = useMemo(() => {
    // Para Apps - usar módulos
    if (isApp && appNiche?.suggestedModules) {
      return [...new Set([...appNiche.suggestedModules, ...COMMON_MODULES])];
    }
    if (isApp) {
      return COMMON_MODULES;
    }
    
    // Para Sites - usar páginas
    if (selectedNiche?.suggestedPages) {
      return [...new Set([...selectedNiche.suggestedPages, ...COMMON_PAGES])];
    }
    return COMMON_PAGES;
  }, [selectedNiche, isApp, appNiche]);

  const labelText = isApp ? 'Módulos' : 'Páginas';

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
    <div className="space-y-5">
      {/* Suggested Pages/Modules */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          {isApp ? <Layers className="w-4 h-4 text-primary" /> : <LayoutGrid className="w-4 h-4 text-primary" />}
          {isApp ? 'Módulos do Sistema' : 'Páginas Disponíveis'}
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestedPages.map((page, index) => {
            const isSelected = formData.selectedPages.includes(page);
            const isSuggested = isApp 
              ? appNiche?.suggestedModules?.includes(page)
              : selectedNiche?.suggestedPages?.includes(page);
            
            return (
              <motion.button
                key={page}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.015 }}
                onClick={() => togglePage(page)}
                className={`relative px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {page}
                  {isSuggested && !isSelected && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Pages/Modules */}
      <div className="space-y-3">
        <label className="text-sm text-muted-foreground">
          Adicionar {isApp ? 'Módulo' : 'Página'}
        </label>
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={isApp ? "Ex: Inventário, Faturamento..." : "Ex: Parceiros, Certificações..."}
            className="bg-white/5 border-white/10 h-10 text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustomPage()}
          />
          <Button onClick={addCustomPage} size="icon" variant="outline" className="h-10 w-10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {formData.customPages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.customPages.map((page) => (
              <span
                key={page}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary text-sm"
              >
                {page}
                <button
                  onClick={() => removeCustomPage(page)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Preview Structure */}
      {allSelectedPages.length > 0 && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">
              {isApp ? 'Estrutura do Sistema' : 'Estrutura do Menu'}
            </label>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {allSelectedPages.length} {isApp ? 'módulos' : 'páginas'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allSelectedPages.map((page, index) => (
              <span key={page} className="text-sm text-foreground/70">
                {page}{index < allSelectedPages.length - 1 && <span className="mx-1.5 text-muted-foreground">→</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
