import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DashboardElement, 
  ElementContent, 
  ElementStyles, 
  AnimationType, 
  ANIMATION_OPTIONS 
} from '../types';

interface ElementSettingsPanelProps {
  element: DashboardElement;
  onUpdate: (updates: Partial<DashboardElement>) => void;
  onClose: () => void;
}

const ICON_OPTIONS = [
  'Search', 'Radar', 'Sparkles', 'Home', 'Settings', 'Users', 
  'BarChart3', 'Brain', 'Zap', 'Globe', 'Target', 'TrendingUp'
];

const SHADOW_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra Grande' },
];

const GRADIENT_DIRECTIONS = [
  { value: 'to right', label: 'Direita' },
  { value: 'to left', label: 'Esquerda' },
  { value: 'to top', label: 'Cima' },
  { value: 'to bottom', label: 'Baixo' },
  { value: 'to bottom right', label: 'Diagonal ↘' },
  { value: 'to bottom left', label: 'Diagonal ↙' },
  { value: 'to top right', label: 'Diagonal ↗' },
  { value: 'to top left', label: 'Diagonal ↖' },
];

export const ElementSettingsPanel: React.FC<ElementSettingsPanelProps> = ({
  element,
  onUpdate,
  onClose,
}) => {
  const updateContent = (updates: Partial<ElementContent>) => {
    onUpdate({
      content: { ...element.content, ...updates },
    });
  };

  const updateStyles = (updates: Partial<ElementStyles>) => {
    onUpdate({
      styles: { ...element.styles, ...updates },
    });
  };

  const updateGradient = (updates: Partial<NonNullable<ElementStyles['gradient']>>) => {
    onUpdate({
      styles: {
        ...element.styles,
        gradient: {
          enabled: element.styles.gradient?.enabled ?? false,
          from: element.styles.gradient?.from ?? '#3b82f6',
          to: element.styles.gradient?.to ?? '#8b5cf6',
          direction: element.styles.gradient?.direction ?? 'to right',
          ...updates,
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border shadow-xl z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Configurações</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-4 space-y-6">
          {/* Content Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Conteúdo</h4>
            
            {element.type === 'card' && (
              <>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={element.content.title || ''}
                    onChange={(e) => updateContent({ title: e.target.value })}
                    placeholder="Título do card"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={element.content.description || ''}
                    onChange={(e) => updateContent({ description: e.target.value })}
                    placeholder="Descrição"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={element.content.icon || 'Brain'}
                    onValueChange={(value) => updateContent({ icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Input
                    value={element.content.badge || ''}
                    onChange={(e) => updateContent({ badge: e.target.value })}
                    placeholder="Texto do badge"
                  />
                </div>
              </>
            )}

            {element.type === 'text' && (
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea
                  value={element.content.text || ''}
                  onChange={(e) => updateContent({ text: e.target.value })}
                  placeholder="Digite o texto..."
                  rows={4}
                />
              </div>
            )}

            {element.type === 'image' && (
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={element.content.imageUrl || ''}
                  onChange={(e) => updateContent({ imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}

            {element.type === 'stat' && (
              <>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    value={element.content.statValue || ''}
                    onChange={(e) => updateContent({ statValue: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rótulo</Label>
                  <Input
                    value={element.content.statLabel || ''}
                    onChange={(e) => updateContent({ statLabel: e.target.value })}
                    placeholder="Estatística"
                  />
                </div>
              </>
            )}

            {element.type === 'button' && (
              <>
                <div className="space-y-2">
                  <Label>Texto do Botão</Label>
                  <Input
                    value={element.content.buttonText || ''}
                    onChange={(e) => updateContent({ buttonText: e.target.value })}
                    placeholder="Botão"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link (URL)</Label>
                  <Input
                    value={element.content.link || ''}
                    onChange={(e) => updateContent({ link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Styles Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Estilos</h4>

            <div className="space-y-2">
              <Label>Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.styles.backgroundColor?.startsWith('#') 
                    ? element.styles.backgroundColor 
                    : '#ffffff'}
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={element.styles.backgroundColor || ''}
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  placeholder="hsl(var(--card)) ou #hex"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor do Texto</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.styles.textColor?.startsWith('#') 
                    ? element.styles.textColor 
                    : '#000000'}
                  onChange={(e) => updateStyles({ textColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={element.styles.textColor || ''}
                  onChange={(e) => updateStyles({ textColor: e.target.value })}
                  placeholder="hsl(var(--foreground)) ou #hex"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor da Borda</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.styles.borderColor?.startsWith('#') 
                    ? element.styles.borderColor 
                    : '#e5e5e5'}
                  onChange={(e) => updateStyles({ borderColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={element.styles.borderColor || ''}
                  onChange={(e) => updateStyles({ borderColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raio da Borda: {element.styles.borderRadius}px</Label>
              <Slider
                value={[element.styles.borderRadius || 12]}
                onValueChange={([value]) => updateStyles({ borderRadius: value })}
                min={0}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Padding: {element.styles.padding}px</Label>
              <Slider
                value={[element.styles.padding || 16]}
                onValueChange={([value]) => updateStyles({ padding: value })}
                min={0}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Opacidade: {Math.round((element.styles.opacity || 1) * 100)}%</Label>
              <Slider
                value={[(element.styles.opacity || 1) * 100]}
                onValueChange={([value]) => updateStyles({ opacity: value / 100 })}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Sombra</Label>
              <Select
                value={element.styles.shadow || 'sm'}
                onValueChange={(value) => updateStyles({ shadow: value as ElementStyles['shadow'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHADOW_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho da Fonte: {element.styles.fontSize}px</Label>
              <Slider
                value={[element.styles.fontSize || 14]}
                onValueChange={([value]) => updateStyles({ fontSize: value })}
                min={10}
                max={48}
                step={1}
              />
            </div>
          </div>

          <Separator />

          {/* Gradient Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Gradiente</h4>
              <Switch
                checked={element.styles.gradient?.enabled || false}
                onCheckedChange={(checked) => updateGradient({ enabled: checked })}
              />
            </div>

            {element.styles.gradient?.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Cor Inicial</Label>
                  <Input
                    type="color"
                    value={element.styles.gradient?.from || '#3b82f6'}
                    onChange={(e) => updateGradient({ from: e.target.value })}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Final</Label>
                  <Input
                    type="color"
                    value={element.styles.gradient?.to || '#8b5cf6'}
                    onChange={(e) => updateGradient({ to: e.target.value })}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Direção</Label>
                  <Select
                    value={element.styles.gradient?.direction || 'to right'}
                    onValueChange={(value) => updateGradient({ direction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADIENT_DIRECTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Animation Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Animação</h4>
            <Select
              value={element.animation || 'none'}
              onValueChange={(value) => onUpdate({ animation: value as AnimationType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Dimensions */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Dimensões</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Largura</Label>
                <Input
                  type="number"
                  value={element.width}
                  onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 100 })}
                  min={50}
                />
              </div>
              <div className="space-y-2">
                <Label>Altura</Label>
                <Input
                  type="number"
                  value={element.height}
                  onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 50 })}
                  min={20}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posição X</Label>
                <Input
                  type="number"
                  value={element.x}
                  onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={element.y}
                  onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
