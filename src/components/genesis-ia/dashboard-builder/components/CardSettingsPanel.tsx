import React from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CardData } from './DraggableCard';

interface CardSettingsPanelProps {
  card: CardData;
  onUpdate: (updates: Partial<CardData>) => void;
  onClose: () => void;
}

export const CardSettingsPanel: React.FC<CardSettingsPanelProps> = ({
  card,
  onUpdate,
  onClose,
}) => {
  const updateStyles = (updates: Partial<CardData['styles']>) => {
    onUpdate({ styles: { ...card.styles, ...updates } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border shadow-2xl z-[200] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Configurações do Card</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Content */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Conteúdo</h4>
            
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={card.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={card.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={card.badge}
                onChange={(e) => onUpdate({ badge: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Visível</Label>
              <Switch
                checked={card.visible}
                onCheckedChange={(checked) => onUpdate({ visible: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Styles */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Estilos</h4>

            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={card.styles.backgroundColor?.startsWith('#') ? card.styles.backgroundColor : '#1e293b'}
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={card.styles.backgroundColor || ''}
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  placeholder="hsl(var(--card))"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor da Borda</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={card.styles.borderColor?.startsWith('#') ? card.styles.borderColor : '#334155'}
                  onChange={(e) => updateStyles({ borderColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={card.styles.borderColor || ''}
                  onChange={(e) => updateStyles({ borderColor: e.target.value })}
                  placeholder="hsl(var(--border))"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raio da Borda: {card.styles.borderRadius || 12}px</Label>
              <Slider
                value={[card.styles.borderRadius || 12]}
                min={0}
                max={32}
                step={1}
                onValueChange={([value]) => updateStyles({ borderRadius: value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor do Título</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={card.styles.titleColor?.startsWith('#') ? card.styles.titleColor : '#ffffff'}
                  onChange={(e) => updateStyles({ titleColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={card.styles.titleColor || ''}
                  onChange={(e) => updateStyles({ titleColor: e.target.value })}
                  placeholder="hsl(var(--foreground))"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor da Descrição</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={card.styles.descriptionColor?.startsWith('#') ? card.styles.descriptionColor : '#94a3b8'}
                  onChange={(e) => updateStyles({ descriptionColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={card.styles.descriptionColor || ''}
                  onChange={(e) => updateStyles({ descriptionColor: e.target.value })}
                  placeholder="hsl(var(--muted-foreground))"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Fundo do Ícone</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={card.styles.iconBackgroundColor?.startsWith('#') ? card.styles.iconBackgroundColor : '#3b82f6'}
                  onChange={(e) => updateStyles({ iconBackgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={card.styles.iconBackgroundColor || ''}
                  onChange={(e) => updateStyles({ iconBackgroundColor: e.target.value })}
                  placeholder="hsl(var(--primary) / 0.1)"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Ícone</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={card.styles.iconColor?.startsWith('#') ? card.styles.iconColor : '#3b82f6'}
                  onChange={(e) => updateStyles({ iconColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={card.styles.iconColor || ''}
                  onChange={(e) => updateStyles({ iconColor: e.target.value })}
                  placeholder="hsl(var(--primary))"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Position */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Posição & Ordem</h4>

            <div className="space-y-2">
              <Label>Ordem: {card.order}</Label>
              <Slider
                value={[card.order]}
                min={0}
                max={10}
                step={1}
                onValueChange={([value]) => onUpdate({ order: value })}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
