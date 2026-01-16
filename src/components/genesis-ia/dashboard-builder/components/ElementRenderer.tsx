import React from 'react';
import { DashboardElement } from '../types';
import { 
  Search, 
  Radar, 
  Sparkles, 
  Home, 
  Settings, 
  Users, 
  BarChart3,
  Brain,
  Zap,
  Globe,
  Target,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ElementRendererProps {
  element: DashboardElement;
  isEditMode: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Search,
  Radar,
  Sparkles,
  Home,
  Settings,
  Users,
  BarChart3,
  Brain,
  Zap,
  Globe,
  Target,
  TrendingUp,
};

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isEditMode }) => {
  const textStyle = {
    color: element.styles.textColor,
    fontSize: element.styles.fontSize,
    fontWeight: element.styles.fontWeight,
  };

  switch (element.type) {
    case 'card':
      const IconComponent = element.content.icon 
        ? ICON_MAP[element.content.icon] || Brain 
        : Brain;
      
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
          </div>
          {element.content.title && (
            <h3 
              className="text-base font-semibold mb-1"
              style={textStyle}
            >
              {element.content.title}
            </h3>
          )}
          {element.content.description && (
            <p 
              className="text-sm text-muted-foreground mb-3 flex-1"
              style={{ color: element.styles.textColor ? `${element.styles.textColor}80` : undefined }}
            >
              {element.content.description}
            </p>
          )}
          {element.content.badge && (
            <Badge 
              variant="outline" 
              className={element.content.badgeClass || 'bg-primary/10 text-primary border-primary/30'}
            >
              {element.content.badge}
            </Badge>
          )}
        </div>
      );

    case 'text':
      return (
        <div 
          className="h-full flex items-center"
          style={textStyle}
        >
          {isEditMode ? (
            <span>{element.content.text || 'Clique para editar texto'}</span>
          ) : (
            <span>{element.content.text}</span>
          )}
        </div>
      );

    case 'image':
      return element.content.imageUrl ? (
        <img 
          src={element.content.imageUrl} 
          alt="Element" 
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
          <span className="text-muted-foreground text-sm">
            {isEditMode ? 'Adicione uma imagem' : ''}
          </span>
        </div>
      );

    case 'spacer':
      return isEditMode ? (
        <div className="w-full h-full border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
          <span className="text-muted-foreground/50 text-xs">Espaçador</span>
        </div>
      ) : null;

    case 'divider':
      return (
        <div 
          className="w-full h-full"
          style={{ backgroundColor: element.styles.backgroundColor }}
        />
      );

    case 'stat':
      return (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <span 
            className="text-3xl font-bold"
            style={textStyle}
          >
            {element.content.statValue || '0'}
          </span>
          <span 
            className="text-sm text-muted-foreground mt-1"
            style={{ color: element.styles.textColor ? `${element.styles.textColor}80` : undefined }}
          >
            {element.content.statLabel || 'Estatística'}
          </span>
        </div>
      );

    case 'button':
      return (
        <Button 
          className="w-full h-full"
          style={{
            backgroundColor: element.styles.backgroundColor,
            color: element.styles.textColor,
          }}
          onClick={(e) => {
            if (isEditMode) {
              e.preventDefault();
              e.stopPropagation();
            } else if (element.content.link) {
              window.location.href = element.content.link;
            }
          }}
        >
          {element.content.buttonText || 'Botão'}
        </Button>
      );

    default:
      return null;
  }
};
