import { 
  Scissors, 
  Dumbbell, 
  Stethoscope, 
  UtensilsCrossed, 
  Home, 
  GraduationCap,
  PawPrint,
  Scale,
  Sparkles,
  Wrench,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NicheTemplate } from './types';

interface TemplateSelectorProps {
  templates: NicheTemplate[];
  onSelect: (template: NicheTemplate) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors,
  Dumbbell,
  Stethoscope,
  UtensilsCrossed,
  Home,
  GraduationCap,
  PawPrint,
  Scale,
  Sparkles,
  Wrench,
};

export const TemplateSelector = ({ templates, onSelect }: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Templates por Nicho
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = ICON_MAP[template.icon] || Sparkles;
          
          return (
            <Card
              key={template.id}
              className="group relative overflow-hidden border border-border bg-card cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${template.suggestedColors.primary}20`,
                    }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: template.suggestedColors.primary }}
                    />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
                </div>
                
                {/* Content */}
                <h4 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {template.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>
                
                {/* Footer */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${template.suggestedColors.primary}10`,
                      borderColor: `${template.suggestedColors.primary}30`,
                      color: template.suggestedColors.primary,
                    }}
                  >
                    {template.niche}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {template.defaultPages.length} páginas
                  </span>
                </div>

                {/* Color Preview */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">Cores:</span>
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: template.suggestedColors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: template.suggestedColors.secondary }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
