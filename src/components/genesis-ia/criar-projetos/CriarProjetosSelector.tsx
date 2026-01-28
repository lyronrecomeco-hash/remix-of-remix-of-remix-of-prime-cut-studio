import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  Dumbbell,
  Stethoscope,
  UtensilsCrossed,
  Scale,
  GraduationCap,
  Sparkles,
  Lock,
  LayoutGrid,
  PawPrint,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import petshopPreview from '@/assets/petshop/hero-dog-bath.jpg';
import barbeariaPreview from '@/assets/templates/barbearia-preview.png';
import academiaPreview from '@/assets/templates/academia-preview.png';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: Category;
  route: string;
  gradient: string;
  accent: string;
  available: boolean;
  preview: {
    title: string;
    subtitle: string;
    badge: string;
  };
  previewImage?: string;
}

interface CriarProjetosSelectorProps {
  onSelect: (template: TemplateInfo) => void;
  onBack: () => void;
}

type Category = 'all' | 'beauty' | 'food' | 'health' | 'services' | 'education' | 'pets';

const categories = [
  { id: 'all' as Category, label: 'Disponíveis', icon: LayoutGrid },
  { id: 'pets' as Category, label: 'Pet Shop', icon: PawPrint },
  { id: 'beauty' as Category, label: 'Beleza & Estética', icon: Scissors },
  { id: 'food' as Category, label: 'Alimentação', icon: UtensilsCrossed },
  { id: 'health' as Category, label: 'Saúde', icon: Dumbbell },
  { id: 'services' as Category, label: 'Serviços', icon: Scale },
  { id: 'education' as Category, label: 'Educação', icon: GraduationCap },
];

const templates: TemplateInfo[] = [
  // PET SHOP - DISPONÍVEL
  {
    id: 'petshop',
    name: 'Pet Shop Completo',
    description: 'Sistema completo para pet shops com agendamento e gestão',
    category: 'pets',
    route: '/petshop',
    gradient: 'from-orange-600 via-amber-700 to-orange-900',
    accent: 'orange',
    available: true,
    preview: {
      title: 'Seu Xodó Pet',
      subtitle: 'Cuidado Premium',
      badge: '🐾 Sistema Completo'
    },
    previewImage: petshopPreview
  },
  // BARBEARIA - DISPONÍVEL
  {
    id: 'barbearia',
    name: 'Barbearia Premium',
    description: 'Para barbearias modernas e tradicionais',
    category: 'beauty',
    route: '/barbearia',
    gradient: 'from-amber-900 via-zinc-900 to-zinc-950',
    accent: 'amber',
    available: true,
    preview: {
      title: 'Barber Studio',
      subtitle: 'Tradição e Estilo',
      badge: '✂️ Experiência Premium'
    },
    previewImage: barbeariaPreview
  },
  // ACADEMIA - DISPONÍVEL
  {
    id: 'academia',
    name: 'Academia & Fitness',
    description: 'Academias e personal trainers',
    category: 'health',
    route: '/academia',
    gradient: 'from-red-900 via-zinc-900 to-zinc-950',
    accent: 'red',
    available: true,
    preview: {
      title: 'FitPower',
      subtitle: 'Transforme seu corpo',
      badge: '💪 Treino personalizado'
    },
    previewImage: academiaPreview
  },
  // EM BREVE
  {
    id: 'salao',
    name: 'Salão de Beleza',
    description: 'Salões, nail designers e estéticas',
    category: 'beauty',
    route: '/salao',
    gradient: 'from-pink-900 via-zinc-900 to-zinc-950',
    accent: 'pink',
    available: false,
    preview: {
      title: 'Belle Studio',
      subtitle: 'Realce sua beleza',
      badge: '💅 Beleza & Bem-estar'
    }
  },
  {
    id: 'pizzaria',
    name: 'Pizzaria & Delivery',
    description: 'Pizzarias com sistema de pedidos',
    category: 'food',
    route: '/pizzaria',
    gradient: 'from-red-900 via-zinc-900 to-zinc-950',
    accent: 'red',
    available: false,
    preview: {
      title: 'Pizza Express',
      subtitle: 'Sabor em casa',
      badge: '🍕 Pedidos Online'
    }
  },
];

export function CriarProjetosSelector({ onSelect, onBack }: CriarProjetosSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredTemplates = activeCategory === 'all' 
    ? templates.filter(t => t.available) 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-7 w-7 sm:h-8 sm:w-8">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Escolha um Template</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Selecione um modelo e personalize para seu cliente.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-1.5 sm:gap-2"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={`gap-1.5 sm:gap-2 h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3 ${isActive ? '' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
            </Button>
          );
        })}
      </motion.div>

      {/* Templates Grid - Fixed width cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 max-w-4xl">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative rounded-xl overflow-hidden border border-border/50 bg-card transition-all duration-300 ${
              template.available 
                ? 'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer hover:-translate-y-1' 
                : 'opacity-70'
            }`}
            onClick={() => template.available && onSelect(template)}
          >
            {/* Preview Area */}
            <div className={`relative h-28 sm:h-36 lg:h-44 overflow-hidden ${template.previewImage ? '' : `bg-gradient-to-br ${template.gradient}`}`}>
              {/* Real Preview with image */}
              {template.previewImage ? (
                <>
                  <img 
                    src={template.previewImage} 
                    alt={`${template.name} Preview`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white">
                    <div className="text-[10px] sm:text-xs font-medium text-primary mb-0.5 sm:mb-1">{template.preview.badge}</div>
                    <div className="text-sm sm:text-base font-bold">{template.preview.title}</div>
                    <div className="text-[10px] sm:text-xs text-white/70">{template.preview.subtitle}</div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mock Phone/Screen Preview */}
                  <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
                    <div className="relative w-16 sm:w-24 h-28 sm:h-40 bg-black/40 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-1 rounded-lg sm:rounded-xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
                        <div className="p-2 sm:p-3 space-y-1 sm:space-y-2 text-center">
                          <div className="inline-block px-1.5 sm:px-2 py-0.5 text-[6px] sm:text-[8px] bg-white/20 text-white rounded-full">
                            {template.preview.badge}
                          </div>
                          <div className="text-[8px] sm:text-[10px] font-bold text-white leading-tight">
                            {template.preview.title}
                          </div>
                          <div className="text-[6px] sm:text-[8px] text-white/70">
                            {template.preview.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Coming Soon Overlay */}
              {!template.available && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <Badge variant="secondary" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Em breve
                  </Badge>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-2.5 sm:p-3 space-y-0.5 sm:space-y-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-xs sm:text-sm">
                {template.name}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 sm:py-12 text-muted-foreground"
        >
          <p className="text-xs sm:text-sm">Nenhum template disponível nesta categoria ainda.</p>
        </motion.div>
      )}
    </div>
  );
}
