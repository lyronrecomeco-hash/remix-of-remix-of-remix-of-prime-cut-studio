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
    <div className="space-y-4">
      {/* Search and Categories */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nicho..."
            className="pl-9 bg-white/5 border-white/10 h-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !selectedCategory 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {NICHE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Niches Grid - Compact Icon-based */}
      <ScrollArea className="h-[280px] pr-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredNiches.map((niche, index) => {
            const isSelected = formData.nicheId === niche.id;
            
            return (
              <motion.button
                key={niche.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => updateFormData('nicheId', niche.id)}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                    : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10'
                }`}
              >
                {/* Emoji Icon */}
                <span className="text-2xl mb-1.5">{niche.emoji}</span>
                
                {/* Name */}
                <span className={`text-[10px] font-medium text-center leading-tight line-clamp-2 ${
                  isSelected ? 'text-primary' : 'text-foreground/80'
                }`}>
                  {niche.name}
                </span>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
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
            className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-[1.02] ${
              formData.nicheId === 'outro'
                ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-6 h-6 mb-1.5 text-yellow-500" />
            <span className={`text-[10px] font-medium text-center leading-tight ${
              formData.nicheId === 'outro' ? 'text-primary' : 'text-foreground/80'
            }`}>
              Outro Nicho
            </span>
            
            {formData.nicheId === 'outro' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        </div>
      </ScrollArea>

      {/* Custom Niche Input */}
      {formData.nicheId === 'outro' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <Input
            value={formData.customNiche || ''}
            onChange={(e) => updateFormData('customNiche', e.target.value)}
            placeholder="Digite o nicho do seu negócio..."
            className="bg-white/5 border-white/10 h-9 flex-1"
            autoFocus
          />
        </motion.div>
      )}
    </div>
  );
}
