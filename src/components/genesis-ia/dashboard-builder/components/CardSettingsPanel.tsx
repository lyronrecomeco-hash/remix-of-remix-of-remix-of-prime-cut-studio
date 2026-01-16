import React, { useState } from 'react';
import { X, Eye, EyeOff, Type, Palette, Move, Image, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CardData } from './DraggableCard';

// Available icons
const AVAILABLE_ICONS = [
  'Search', 'Radar', 'Settings', 'Home', 'Star', 'Sparkles', 
  'Grid3X3', 'LayoutDashboard', 'User', 'Users', 'Mail', 'Phone',
  'Calendar', 'Clock', 'Bell', 'Heart', 'Bookmark', 'Flag',
  'Zap', 'Target', 'TrendingUp', 'BarChart', 'PieChart', 'Activity',
  'Globe', 'Map', 'Navigation', 'Compass', 'Layers', 'Box'
];

interface CardSettingsPanelProps {
  card: CardData;
  onUpdate: (updates: Partial<CardData>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export const CardSettingsPanel: React.FC<CardSettingsPanelProps> = ({
  card,
  onUpdate,
  onClose,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState('content');

  const updateStyles = (updates: Partial<CardData['styles']>) => {
    onUpdate({ styles: { ...card.styles, ...updates } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-96 h-full bg-background border-l border-border shadow-2xl z-[200] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Editar Card</h3>
            <p className="text-xs text-muted-foreground">{card.title}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger 
            value="content" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Type className="w-4 h-4 mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger 
            value="styles"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Palette className="w-4 h-4 mr-2" />
            Estilos
          </TabsTrigger>
          <TabsTrigger 
            value="position"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Move className="w-4 h-4 mr-2" />
            Posição
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Content Tab */}
          <TabsContent value="content" className="p-4 space-y-6 mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Título</Label>
                <Input
                  value={card.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="Digite o título..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Descrição</Label>
                <Textarea
                  value={card.description}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Digite a descrição..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Ícone</Label>
                <Select value={card.icon} onValueChange={(value) => onUpdate({ icon: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="grid grid-cols-5 gap-1 p-2">
                      {AVAILABLE_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon} className="p-2 cursor-pointer">
                          {icon}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Badge</Label>
                <Input
                  value={card.badge}
                  onChange={(e) => onUpdate({ badge: e.target.value })}
                  placeholder="Texto do badge..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Classe do Badge</Label>
                <Select 
                  value={card.badgeClass} 
                  onValueChange={(value) => onUpdate({ badgeClass: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estilo do badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-primary/10 text-primary border-primary/30">Primary</SelectItem>
                    <SelectItem value="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Emerald</SelectItem>
                    <SelectItem value="bg-amber-500/10 text-amber-400 border-amber-500/30">Amber</SelectItem>
                    <SelectItem value="bg-rose-500/10 text-rose-400 border-rose-500/30">Rose</SelectItem>
                    <SelectItem value="bg-violet-500/10 text-violet-400 border-violet-500/30">Violet</SelectItem>
                    <SelectItem value="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">Cyan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Visível</Label>
                  <p className="text-xs text-muted-foreground">Mostrar este card no dashboard</p>
                </div>
                <Switch
                  checked={card.visible}
                  onCheckedChange={(checked) => onUpdate({ visible: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="p-4 space-y-6 mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={card.styles.backgroundColor?.startsWith('#') ? card.styles.backgroundColor : '#1e293b'}
                    onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
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
                <Label className="text-sm font-medium">Cor da Borda</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={card.styles.borderColor?.startsWith('#') ? card.styles.borderColor : '#334155'}
                    onChange={(e) => updateStyles({ borderColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
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
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Raio da Borda</Label>
                  <span className="text-sm text-muted-foreground">{card.styles.borderRadius || 12}px</span>
                </div>
                <Slider
                  value={[card.styles.borderRadius || 12]}
                  min={0}
                  max={32}
                  step={1}
                  onValueChange={([value]) => updateStyles({ borderRadius: value })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cor do Título</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={card.styles.titleColor?.startsWith('#') ? card.styles.titleColor : '#ffffff'}
                    onChange={(e) => updateStyles({ titleColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
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
                <Label className="text-sm font-medium">Cor da Descrição</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={card.styles.descriptionColor?.startsWith('#') ? card.styles.descriptionColor : '#94a3b8'}
                    onChange={(e) => updateStyles({ descriptionColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={card.styles.descriptionColor || ''}
                    onChange={(e) => updateStyles({ descriptionColor: e.target.value })}
                    placeholder="hsl(var(--muted-foreground))"
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Fundo do Ícone</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={card.styles.iconBackgroundColor?.startsWith('#') ? card.styles.iconBackgroundColor : '#3b82f6'}
                    onChange={(e) => updateStyles({ iconBackgroundColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
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
                <Label className="text-sm font-medium">Cor do Ícone</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={card.styles.iconColor?.startsWith('#') ? card.styles.iconColor : '#3b82f6'}
                    onChange={(e) => updateStyles({ iconColor: e.target.value })}
                    className="w-14 h-10 p-1 cursor-pointer"
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
          </TabsContent>

          {/* Position Tab */}
          <TabsContent value="position" className="p-4 space-y-6 mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Posição X</Label>
                  <Input
                    type="number"
                    value={Math.round(card.x)}
                    onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Posição Y</Label>
                  <Input
                    type="number"
                    value={Math.round(card.y)}
                    onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Largura</Label>
                  <Input
                    type="number"
                    value={Math.round(card.width)}
                    onChange={(e) => onUpdate({ width: Math.max(150, Number(e.target.value)) })}
                    min={150}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Altura</Label>
                  <Input
                    type="number"
                    value={Math.round(card.height)}
                    onChange={(e) => onUpdate({ height: Math.max(100, Number(e.target.value)) })}
                    min={100}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Ordem</Label>
                  <span className="text-sm text-muted-foreground">{card.order}</span>
                </div>
                <Slider
                  value={[card.order]}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={([value]) => onUpdate({ order: value })}
                />
                <p className="text-xs text-muted-foreground">
                  Define a ordem de exibição no modo grid
                </p>
              </div>

              <Separator />

              {/* Preset Sizes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tamanhos Predefinidos</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate({ width: 200, height: 120 })}
                    className="justify-start"
                  >
                    Pequeno (200×120)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate({ width: 300, height: 180 })}
                    className="justify-start"
                  >
                    Médio (300×180)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate({ width: 400, height: 240 })}
                    className="justify-start"
                  >
                    Grande (400×240)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate({ width: 500, height: 300 })}
                    className="justify-start"
                  >
                    Extra (500×300)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
          Excluir Card
        </Button>
      </div>
    </motion.div>
  );
};
