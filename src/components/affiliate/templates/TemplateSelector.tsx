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
  PenLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TemplateInfo } from './types';

interface TemplateSelectorProps {
  onSelect: (template: TemplateInfo) => void;
}

type Category = 'all' | 'beauty' | 'food' | 'health' | 'services' | 'education';

const categories = [
  { id: 'all' as Category, label: 'Todos', icon: LayoutGrid },
  { id: 'beauty' as Category, label: 'Beleza & Estética', icon: Scissors },
  { id: 'food' as Category, label: 'Alimentação & Delivery', icon: UtensilsCrossed },
  { id: 'health' as Category, label: 'Fitness & Saúde', icon: Dumbbell },
  { id: 'services' as Category, label: 'Serviços', icon: Scale },
  { id: 'education' as Category, label: 'Educação', icon: GraduationCap },
];

const templates: TemplateInfo[] = [
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
    }
  },
  {
    id: 'academia',
    name: 'Academia Fitness',
    description: 'Academias, personal trainers e crossfit',
    category: 'health',
    route: '/academia',
    gradient: 'from-red-900 via-zinc-900 to-zinc-950',
    accent: 'red',
    available: false,
    preview: {
      title: 'Power Gym',
      subtitle: 'Transforme seu corpo',
      badge: '💪 Treine com os melhores'
    }
  },
  {
    id: 'clinica',
    name: 'Clínica Médica',
    description: 'Consultórios, clínicas e especialistas',
    category: 'health',
    route: '/clinica',
    gradient: 'from-blue-900 via-zinc-900 to-zinc-950',
    accent: 'blue',
    available: false,
    preview: {
      title: 'Clínica Vida',
      subtitle: 'Cuidando de você',
      badge: '🏥 Saúde em primeiro lugar'
    }
  },
  {
    id: 'restaurante',
    name: 'Restaurante & Delivery',
    description: 'Cardápio digital e pedidos online',
    category: 'food',
    route: '/restaurante',
    gradient: 'from-orange-900 via-zinc-900 to-zinc-950',
    accent: 'orange',
    available: false,
    preview: {
      title: 'Sabor & Arte',
      subtitle: 'Gastronomia de verdade',
      badge: '🍽️ Cardápio digital'
    }
  },
  {
    id: 'imobiliaria',
    name: 'Imobiliária',
    description: 'Catálogo de imóveis e corretores',
    category: 'services',
    route: '/imobiliaria',
    gradient: 'from-emerald-900 via-zinc-900 to-zinc-950',
    accent: 'emerald',
    available: false,
    preview: {
      title: 'Prime Imóveis',
      subtitle: 'Seu lar ideal',
      badge: '🏠 Os melhores imóveis'
    }
  },
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
    id: 'petshop',
    name: 'Pet Shop',
    description: 'Banho, tosa e produtos pet',
    category: 'services',
    route: '/petshop',
    gradient: 'from-violet-900 via-zinc-900 to-zinc-950',
    accent: 'violet',
    available: false,
    preview: {
      title: 'Pet Love',
      subtitle: 'Amor em cada patinha',
      badge: '🐾 Cuidado especial'
    }
  },
  {
    id: 'escola',
    name: 'Escola & Cursos',
    description: 'Matrículas e cursos online',
    category: 'education',
    route: '/escola',
    gradient: 'from-purple-900 via-zinc-900 to-zinc-950',
    accent: 'purple',
    available: false,
    preview: {
      title: 'EduTech',
      subtitle: 'Aprenda sem limites',
      badge: '📚 Educação de qualidade'
    }
  },
];

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h2 className="text-xl font-bold text-foreground">Escolha um Template</h2>
        <p className="text-sm text-muted-foreground">
          Selecione um modelo e personalize para seu cliente.
        </p>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
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
              className={`gap-2 ${isActive ? '' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </Button>
          );
        })}
      </motion.div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            <div className={`relative h-48 bg-gradient-to-br ${template.gradient} overflow-hidden`}>
              {/* Mock Phone/Screen Preview */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-28 h-44 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                  {/* Phone Screen Content */}
                  <div className="absolute inset-1 rounded-xl bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
                    <div className="p-3 space-y-2 text-center">
                      {/* Mini Badge */}
                      <div className={`inline-block px-2 py-0.5 text-[8px] bg-${template.accent}-500/20 text-${template.accent}-300 rounded-full border border-${template.accent}-500/30`}>
                        {template.preview.badge}
                      </div>
                      {/* Title */}
                      <div className="text-[10px] font-bold text-white leading-tight">
                        {template.preview.title}
                      </div>
                      <div className="text-[7px] text-white/60">
                        {template.preview.subtitle}
                      </div>
                      {/* Mock Buttons */}
                      <div className="pt-2 space-y-1">
                        <div className={`h-4 rounded bg-${template.accent}-500/60`} />
                        <div className="h-4 rounded border border-white/20" />
                      </div>
                      {/* Mock Stats */}
                      <div className="flex justify-center gap-2 pt-2">
                        <div className="text-center">
                          <div className="text-[8px] font-bold text-white">10+</div>
                          <div className="text-[5px] text-white/40">Anos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[8px] font-bold text-white">5k+</div>
                          <div className="text-[5px] text-white/40">Clientes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[8px] font-bold text-white">4.9</div>
                          <div className="text-[5px] text-white/40">Nota</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-b-xl" />
                </div>
              </div>

              {/* Glow Effect */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-${template.accent}-500/20 rounded-full blur-3xl pointer-events-none`} />

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {template.available ? (
                  <Badge className="bg-green-500/90 text-white border-0 shadow-lg text-xs">
                    Disponível
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm border-white/10 text-white/80 text-xs gap-1">
                    <Lock className="w-3 h-3" />
                    Em breve
                  </Badge>
                )}
              </div>

              {/* Hover Overlay */}
              {template.available && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <PenLine className="w-4 h-4" />
                    Personalizar
                  </Button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-foreground">{template.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {template.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground"
      >
        <Sparkles className="w-4 h-4" />
        <span>Novos templates são adicionados toda semana</span>
      </motion.div>
    </div>
  );
}
