import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { NICHE_CONTEXTS, NICHE_CATEGORIES } from '../nicheContexts';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StepNicheSelect() {
  const { formData, updateFormData } = useFromScratch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredNiches = useMemo(() => {
    let niches = NICHE_CONTEXTS;
    
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
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-3">
      {/* Search and Categories */}
      <div className="flex flex-col gap-2">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nicho..."
            className="pl-8 bg-white/5 border-white/10 h-8 text-xs"
          />
        </div>
        
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
              !selectedCategory 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            Todos
          </button>
          {NICHE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
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
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 pr-2">
          {filteredNiches.map((niche, index) => {
            const isSelected = formData.nicheId === niche.id;
            
            return (
              <motion.button
                key={niche.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => updateFormData('nicheId', niche.id)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-lg mb-0.5">{niche.emoji}</span>
                <span className={`text-[8px] font-medium text-center leading-tight line-clamp-2 ${
                  isSelected ? 'text-primary' : 'text-foreground/80'
                }`}>
                  {niche.name}
                </span>
                
                {isSelected && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2 h-2 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
          
          {/* Outro Nicho Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: filteredNiches.length * 0.01 }}
            onClick={() => updateFormData('nicheId', 'outro')}
            className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              formData.nicheId === 'outro'
                ? 'border-primary bg-primary/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-yellow-500" />
            <span className={`text-[8px] font-medium text-center ${
              formData.nicheId === 'outro' ? 'text-primary' : 'text-foreground/80'
            }`}>
              Outro
            </span>
            
            {formData.nicheId === 'outro' && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2 h-2 text-primary-foreground" />
              </div>
            )}
          </motion.button>
        </div>
      </ScrollArea>

      {/* Custom Niche Input */}
      {formData.nicheId === 'outro' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <Input
            value={formData.customNiche || ''}
            onChange={(e) => updateFormData('customNiche', e.target.value)}
            placeholder="Digite o nicho do seu negócio..."
            className="bg-white/5 border-white/10 h-7 text-xs flex-1"
            autoFocus
          />
        </motion.div>
      )}
    </div>
  );
}
