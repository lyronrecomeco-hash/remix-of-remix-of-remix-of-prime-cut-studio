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
            className="pl-10 bg-white/5 border-white/10 h-10 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
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
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
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
      <ScrollArea className="h-[250px]">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 pr-3">
          {filteredNiches.map((niche, index) => {
            const isSelected = formData.nicheId === niche.id;
            
            return (
              <motion.button
                key={niche.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => updateFormData('nicheId', niche.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-2xl mb-1">{niche.emoji}</span>
                <span className={`text-xs font-medium text-center leading-tight line-clamp-2 ${
                  isSelected ? 'text-primary' : 'text-foreground/80'
                }`}>
                  {niche.name}
                </span>
                
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
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
            className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
              formData.nicheId === 'outro'
                ? 'border-primary bg-primary/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <Sparkles className="w-6 h-6 mb-1 text-yellow-500" />
            <span className={`text-xs font-medium text-center ${
              formData.nicheId === 'outro' ? 'text-primary' : 'text-foreground/80'
            }`}>
              Outro
            </span>
            
            {formData.nicheId === 'outro' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
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
          className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
        >
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <Input
            value={formData.customNiche || ''}
            onChange={(e) => updateFormData('customNiche', e.target.value)}
            placeholder="Digite o nicho do seu negócio..."
            className="bg-white/5 border-white/10 h-9 text-sm flex-1"
            autoFocus
          />
        </motion.div>
      )}
    </div>
  );
}
