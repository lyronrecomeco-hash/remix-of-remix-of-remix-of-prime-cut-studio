import { useState } from 'react';
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
  Eye,
  ArrowRight,
  Zap,
  Layout,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NicheTemplate } from './types';

interface TemplateGalleryProps {
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

export const TemplateGallery = ({ templates, onSelect }: TemplateGalleryProps) => {
  const [previewTemplate, setPreviewTemplate] = useState<NicheTemplate | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => {
          const Icon = ICON_MAP[template.icon] || Sparkles;
          const isHovered = hoveredId === template.id;
          
          return (
            <Card
              key={template.id}
              className={`
                group relative overflow-hidden cursor-pointer transition-all duration-300
                border-2 hover:border-primary/50
                ${isHovered ? 'shadow-2xl shadow-primary/20 scale-[1.02]' : 'shadow-lg'}
              `}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview Mockup Header */}
              <div 
                className="relative h-32 overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${template.suggestedColors.primary}, ${template.suggestedColors.secondary})`,
                }}
              >
                {/* Mini App Preview */}
                <div className="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 bg-white/30 rounded w-3/4" />
                    <div className="h-2 bg-white/20 rounded w-1/2" />
                    <div className="flex gap-1 mt-2">
                      <div className="h-6 bg-white/30 rounded flex-1" />
                      <div className="h-6 bg-white/20 rounded flex-1" />
                    </div>
                  </div>
                </div>

                {/* Icon Badge */}
                <div 
                  className="absolute -bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border-2 border-background"
                  style={{ backgroundColor: template.suggestedColors.primary }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Preview Button on Hover */}
                <div className={`
                  absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300
                  ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </div>

              <CardContent className="pt-8 pb-4 px-4" onClick={() => onSelect(template)}>
                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layout className="w-3 h-3" />
                      {template.defaultPages.length} páginas
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {template.suggestedFeatures.length} recursos
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${template.suggestedColors.primary}20`,
                        color: template.suggestedColors.primary,
                        border: `1px solid ${template.suggestedColors.primary}30`,
                      }}
                    >
                      {template.niche}
                    </Badge>
                    
                    <ArrowRight className={`
                      w-5 h-5 text-primary transition-all duration-300
                      ${isHovered ? 'translate-x-1 opacity-100' : 'opacity-0'}
                    `} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: previewTemplate.suggestedColors.primary }}
                  >
                    {(() => {
                      const Icon = ICON_MAP[previewTemplate.icon] || Sparkles;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold">{previewTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {previewTemplate.description}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Target Audience */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Público-alvo
                  </h4>
                  <p className="text-foreground">{previewTemplate.targetAudience}</p>
                </div>

                {/* Main Task */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Principal Tarefa
                  </h4>
                  <p className="text-foreground">{previewTemplate.mainTask}</p>
                </div>

                {/* Pages */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Páginas Incluídas ({previewTemplate.defaultPages.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.defaultPages.map((page, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {page}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Recursos Sugeridos ({previewTemplate.suggestedFeatures.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.suggestedFeatures.map((feature, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Paleta de Cores
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-white/20"
                        style={{ backgroundColor: previewTemplate.suggestedColors.primary }}
                      />
                      <span className="text-sm text-muted-foreground">Primária</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-white/20"
                        style={{ backgroundColor: previewTemplate.suggestedColors.secondary }}
                      />
                      <span className="text-sm text-muted-foreground">Secundária</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={() => {
                    onSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  <Zap className="w-5 h-5" />
                  Usar este Template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
