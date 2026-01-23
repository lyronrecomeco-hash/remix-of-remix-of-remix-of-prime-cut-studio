import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { NICHE_CONTEXTS, NICHE_CATEGORIES } from '../nicheContexts';

// Import niche images
import hamburgueriaImg from '@/assets/niches/hamburgueria.jpg';
import pizzariaImg from '@/assets/niches/pizzaria.jpg';
import restauranteImg from '@/assets/niches/restaurante.jpg';
import cafeteriaImg from '@/assets/niches/cafeteria.jpg';
import barbeariaImg from '@/assets/niches/barbearia.jpg';
import salaoImg from '@/assets/niches/salao-beleza.jpg';
import esteticaImg from '@/assets/niches/clinica-estetica.jpg';
import academiaImg from '@/assets/niches/academia.jpg';
import clinicaImg from '@/assets/niches/clinica-medica.jpg';
import odontologiaImg from '@/assets/niches/odontologia.jpg';
import personalImg from '@/assets/niches/personal-trainer.jpg';
import nutricionistaImg from '@/assets/niches/nutricionista.jpg';
import petshopImg from '@/assets/niches/petshop.jpg';
import veterinariaImg from '@/assets/niches/veterinaria.jpg';
import imobiliariaImg from '@/assets/niches/imobiliaria.jpg';
import advocaciaImg from '@/assets/niches/advocacia.jpg';
import contabilidadeImg from '@/assets/niches/contabilidade.jpg';
import escolaImg from '@/assets/niches/escola-curso.jpg';
import fotografoImg from '@/assets/niches/fotografo.jpg';
import marketingImg from '@/assets/niches/agencia-marketing.jpg';
import startupImg from '@/assets/niches/startup-tech.jpg';

// Niche illustration images mapping
const NICHE_IMAGES: Record<string, string> = {
  'hamburgueria': hamburgueriaImg,
  'pizzaria': pizzariaImg,
  'restaurante': restauranteImg,
  'cafeteria': cafeteriaImg,
  'barbearia': barbeariaImg,
  'salao-beleza': salaoImg,
  'clinica-estetica': esteticaImg,
  'academia': academiaImg,
  'clinica-medica': clinicaImg,
  'odontologia': odontologiaImg,
  'personal-trainer': personalImg,
  'nutricionista': nutricionistaImg,
  'petshop': petshopImg,
  'veterinaria': veterinariaImg,
  'imobiliaria': imobiliariaImg,
  'advocacia': advocaciaImg,
  'contabilidade': contabilidadeImg,
  'escola-curso': escolaImg,
  'fotografo': fotografoImg,
  'agencia-marketing': marketingImg,
  'startup-tech': startupImg,
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
    <div className="space-y-3">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground mb-0.5">
          Qual é o segmento do negócio?
        </h3>
        <p className="text-xs text-muted-foreground">
          Selecione o nicho para gerar um prompt contextualizado
        </p>
      </div>

      {/* Search and Categories Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
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
            className={`px-2 py-1 rounded-full text-[10px] transition-colors ${
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
              className={`px-2 py-1 rounded-full text-[10px] transition-colors ${
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

      {/* Niches Grid - Compact Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
        {filteredNiches.map((niche, index) => {
          const isSelected = formData.nicheId === niche.id;
          const imageUrl = NICHE_IMAGES[niche.id];
          
          return (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.015 }}
              onClick={() => updateFormData('nicheId', niche.id)}
              className={`group relative rounded-lg overflow-hidden border text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? 'border-primary ring-1 ring-primary/30 shadow-md shadow-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {/* Image */}
              <div className="relative h-16 overflow-hidden">
                {imageUrl ? (
                  <>
                    <img 
                      src={imageUrl} 
                      alt={niche.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <span className="text-xl">{niche.emoji}</span>
                  </div>
                )}
                
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </motion.div>
                )}
                
                {/* Emoji Badge */}
                <div className="absolute bottom-1 left-1 text-sm bg-black/40 rounded px-1 backdrop-blur-sm">
                  {niche.emoji}
                </div>
              </div>
              
              {/* Card Footer - Compact */}
              <div className="px-1.5 py-1 bg-card">
                <h4 className={`text-[10px] font-semibold line-clamp-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {niche.name}
                </h4>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Niche - Inline */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">Outro nicho:</span>
        <Input
          value={formData.customNiche || ''}
          onChange={(e) => {
            updateFormData('customNiche', e.target.value);
            if (e.target.value) updateFormData('nicheId', 'outro');
          }}
          placeholder="Digite o nicho personalizado..."
          className="bg-white/5 border-white/10 h-7 text-xs flex-1"
        />
      </div>
    </div>
  );
}