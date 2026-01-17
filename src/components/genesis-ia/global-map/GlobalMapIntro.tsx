import { useState } from 'react';
import { 
  Globe2, 
  Sparkles, 
  Zap, 
  Moon, 
  Sun,
  MapPin,
  TrendingUp,
  Eye,
  Rocket,
  ArrowRight,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface GlobalMapIntroProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}

const features = [
  {
    icon: Globe2,
    title: 'Mapa 3D Global',
    description: 'Visualize empresas em todo o mundo com um globo interativo em 3D',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Target,
    title: 'Status por Cores',
    description: 'Vermelho = sem site, Amarelo = parcial, Verde = completo',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  {
    icon: Moon,
    title: 'Detecção Noturna',
    description: 'Filtro especial para negócios que operam à noite',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  {
    icon: Clock,
    title: 'Horário em Tempo Real',
    description: 'Veja quais empresas estão abertas agora baseado no fuso horário',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  },
  {
    icon: TrendingUp,
    title: 'Score de Oportunidade',
    description: 'Cada empresa recebe uma pontuação de potencial de venda',
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    icon: Sparkles,
    title: 'Ultra Interativo',
    description: 'Arraste, rotacione, zoom - controle total do mapa',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10'
  }
];

export const GlobalMapIntro = ({ open, onOpenChange, onStart }: GlobalMapIntroProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
            <Globe2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Mapa Global 3D
          </DialogTitle>
          <DialogDescription className="text-base">
            Explore empresas ao redor do mundo em um mapa 3D interativo ultra avançado
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "p-4 rounded-xl border transition-all duration-300 cursor-default",
                hoveredFeature === index 
                  ? "border-primary/50 shadow-lg shadow-primary/10 scale-[1.02]" 
                  : "border-border/50"
              )}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", feature.bg)}>
                <feature.icon className={cn("w-5 h-5", feature.color)} />
              </div>
              <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Legenda de Status
          </p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
              <span className="text-sm">Alta Oportunidade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
              <span className="text-sm">Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-sm">Baixa</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button 
            size="lg" 
            className="gap-2 px-8 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
            onClick={onStart}
          >
            <Rocket className="w-4 h-4" />
            Iniciar Exploração
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
