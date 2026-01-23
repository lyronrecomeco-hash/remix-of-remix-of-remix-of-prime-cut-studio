import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { NICHE_CONTEXTS, NICHE_CATEGORIES } from '../nicheContexts';

// Niche illustration images - professional representations
const NICHE_IMAGES: Record<string, string> = {
  'hamburgueria': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'pizzaria': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
  'restaurante': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  'cafeteria': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  'barbearia': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop',
  'salao-beleza': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  'clinica-estetica': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop',
  'academia': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'clinica-medica': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop',
  'odontologia': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
  'personal-trainer': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'nutricionista': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  'petshop': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
  'veterinaria': 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=300&fit=crop',
  'imobiliaria': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
  'advocacia': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  'contabilidade': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
  'escola-curso': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
  'fotografo': 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&h=300&fit=crop',
  'agencia-marketing': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
  'startup-tech': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
};

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
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selectedCategory === cat.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Niches Grid - Similar to Template Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredNiches.map((niche, index) => {
          const isSelected = formData.nicheId === niche.id;
          const imageUrl = NICHE_IMAGES[niche.id];
          
          return (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => updateFormData('nicheId', niche.id)}
              className={`group relative rounded-xl overflow-hidden border text-left transition-all hover:-translate-y-1 ${
                isSelected
                  ? 'border-primary/50 ring-2 ring-primary/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Image */}
              <div className="relative h-28 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                {imageUrl ? (
                  <>
                    <img 
                      src={imageUrl} 
                      alt={niche.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">{niche.emoji}</span>
                  </div>
                )}
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                {/* Emoji Badge */}
                <div className="absolute bottom-2 left-2 text-xl bg-black/30 rounded-lg px-1.5 py-0.5 backdrop-blur-sm">
                  {niche.emoji}
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="p-3 bg-card">
                <h4 className="text-sm font-semibold text-foreground line-clamp-1">{niche.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{niche.description}</p>
              </div>
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
