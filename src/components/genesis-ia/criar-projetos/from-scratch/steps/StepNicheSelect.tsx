import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { NICHE_CONTEXTS, NICHE_CATEGORIES } from '../nicheContexts';
import { APP_NICHE_CONTEXTS, APP_CATEGORIES } from '../appNicheContexts';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StepNicheSelect() {
  const { formData, updateFormData } = useFromScratch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isApp = formData.projectType === 'app';

  // Usar contextos diferentes baseado no tipo de projeto
  const categories = isApp ? APP_CATEGORIES : NICHE_CATEGORIES;

  const filteredNiches = useMemo(() => {
    let niches: Array<{ id: string; name: string; emoji: string; description: string; category: string }> = 
      isApp ? APP_NICHE_CONTEXTS : NICHE_CONTEXTS;
    
    if (selectedCategory) {
      niches = niches.filter(n => n.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      niches = niches.filter(n => 
        n.name.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query)
      );
    }
    
    return niches;
  }, [searchQuery, selectedCategory, isApp]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Info sobre tipo de projeto */}
      <div className="p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs sm:text-sm text-primary">
          {isApp 
            ? '📱 Selecionando tipo de sistema/aplicativo - com backend, autenticação e dashboard'
            : '🌐 Selecionando nicho para site comercial - focado em conversão e SEO'}
        </p>
      </div>

      {/* Search and Categories */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isApp ? "Buscar tipo de sistema..." : "Buscar nicho..."}
            className="pl-8 sm:pl-10 bg-white/5 border-white/10 h-8 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-medium transition-all ${
              !selectedCategory 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-medium transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Niches Grid */}
      <ScrollArea className="h-[200px] sm:h-[250px]">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2 pr-3">
          {filteredNiches.map((niche, index) => {
            const isSelected = formData.nicheId === niche.id;
            
            return (
              <motion.button
                key={niche.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => updateFormData('nicheId', niche.id)}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{niche.emoji}</span>
                <span className={`text-[9px] sm:text-xs font-medium text-center leading-tight line-clamp-2 ${
                  isSelected ? 'text-primary' : 'text-foreground/80'
                }`}>
                  {niche.name}
                </span>
                
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Custom Niche Input - para sites */}
      {!isApp && formData.nicheId === 'outro' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <Input
            value={formData.customNiche || ''}
            onChange={(e) => updateFormData('customNiche', e.target.value)}
            placeholder="Digite o nicho do seu negócio..."
            className="bg-white/5 border-white/10 h-8 sm:h-9 text-xs sm:text-sm flex-1"
            autoFocus
          />
        </motion.div>
      )}

      {/* Custom App Description - para apps */}
      {isApp && formData.nicheId === 'outro-app' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <Input
            value={formData.customNiche || ''}
            onChange={(e) => updateFormData('customNiche', e.target.value)}
            placeholder="Descreva o tipo de sistema que deseja criar..."
            className="bg-white/5 border-white/10 h-8 sm:h-9 text-xs sm:text-sm flex-1"
            autoFocus
          />
        </motion.div>
      )}
    </div>
  );
}
