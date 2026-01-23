import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { NICHE_CONTEXTS, NICHE_CATEGORIES } from '../nicheContexts';

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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Qual é o segmento do negócio?
        </h3>
        <p className="text-muted-foreground">
          Isso nos ajuda a gerar um prompt com contexto específico para o nicho
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar nicho..."
          className="pl-10 bg-white/5 border-white/10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !selectedCategory 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          Todos
        </button>
        {NICHE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Niches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {filteredNiches.map((niche, index) => {
          const isSelected = formData.nicheId === niche.id;
          
          return (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => updateFormData('nicheId', niche.id)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-2">{niche.emoji}</div>
              <h4 className="text-sm font-medium text-foreground line-clamp-1">{niche.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{niche.description}</p>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom Niche */}
      <div className="max-w-md mx-auto mt-6">
        <p className="text-sm text-muted-foreground text-center mb-2">
          Não encontrou seu nicho?
        </p>
        <Input
          value={formData.customNiche || ''}
          onChange={(e) => {
            updateFormData('customNiche', e.target.value);
            if (e.target.value) updateFormData('nicheId', 'outro');
          }}
          placeholder="Digite o nicho personalizado..."
          className="bg-white/5 border-white/10 text-center"
        />
      </div>
    </div>
  );
}
