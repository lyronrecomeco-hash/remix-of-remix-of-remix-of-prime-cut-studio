import React from 'react';
import { X, Type, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextElementData } from './TextElement';

interface TextSettingsPanelProps {
  element: TextElementData;
  onUpdate: (updates: Partial<TextElementData>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export const TextSettingsPanel: React.FC<TextSettingsPanelProps> = ({
  element,
  onUpdate,
  onClose,
  onDelete,
}) => {
  const updateStyles = (updates: Partial<TextElementData['styles']>) => {
    onUpdate({ styles: { ...element.styles, ...updates } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border shadow-2xl z-[200] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Type className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">Editar Texto</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Texto</Label>
            <Textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Digite seu texto..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Typography */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Tipografia</h4>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Tamanho da Fonte</Label>
                <span className="text-sm text-muted-foreground">{element.styles.fontSize || 16}px</span>
              </div>
              <Slider
                value={[element.styles.fontSize || 16]}
                min={10}
                max={72}
                step={1}
                onValueChange={([value]) => updateStyles({ fontSize: value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Peso da Fonte</Label>
              <Select 
                value={element.styles.fontWeight || 'normal'} 
                onValueChange={(value) => updateStyles({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="500">Médio</SelectItem>
                  <SelectItem value="600">Semi-bold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="800">Extra-bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Alinhamento</Label>
              <ToggleGroup 
                type="single" 
                value={element.styles.textAlign || 'left'}
                onValueChange={(value) => value && updateStyles({ textAlign: value as 'left' | 'center' | 'right' })}
                className="justify-start"
              >
                <ToggleGroupItem value="left" className="flex-1">
                  <AlignLeft className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" className="flex-1">
                  <AlignCenter className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" className="flex-1">
                  <AlignRight className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Cores</h4>

            <div className="space-y-2">
              <Label className="text-sm">Cor do Texto</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.styles.color?.startsWith('#') ? element.styles.color : '#ffffff'}
                  onChange={(e) => updateStyles({ color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={element.styles.color || ''}
                  onChange={(e) => updateStyles({ color: e.target.value })}
                  placeholder="hsl(var(--foreground))"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.styles.backgroundColor?.startsWith('#') ? element.styles.backgroundColor : '#000000'}
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={element.styles.backgroundColor || ''}
                  onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                  placeholder="transparent"
                  className="flex-1"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => updateStyles({ backgroundColor: 'transparent' })}
              >
                Remover fundo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Spacing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Espaçamento</h4>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Padding</Label>
                <span className="text-sm text-muted-foreground">{element.styles.padding || 8}px</span>
              </div>
              <Slider
                value={[element.styles.padding || 8]}
                min={0}
                max={48}
                step={2}
                onValueChange={([value]) => updateStyles({ padding: value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Raio da Borda</Label>
                <span className="text-sm text-muted-foreground">{element.styles.borderRadius || 0}px</span>
              </div>
              <Slider
                value={[element.styles.borderRadius || 0]}
                min={0}
                max={24}
                step={1}
                onValueChange={([value]) => updateStyles({ borderRadius: value })}
              />
            </div>
          </div>

          <Separator />

          {/* Position */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Posição & Tamanho</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">X</Label>
                <Input
                  type="number"
                  value={Math.round(element.x)}
                  onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Y</Label>
                <Input
                  type="number"
                  value={Math.round(element.y)}
                  onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Largura</Label>
                <Input
                  type="number"
                  value={Math.round(element.width)}
                  onChange={(e) => onUpdate({ width: Math.max(100, Number(e.target.value)) })}
                  min={100}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Altura</Label>
                <Input
                  type="number"
                  value={Math.round(element.height)}
                  onChange={(e) => onUpdate({ height: Math.max(30, Number(e.target.value)) })}
                  min={30}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <Button
          variant="destructive"
          size="sm"
          className="w-full gap-2"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
          Excluir Texto
        </Button>
      </div>
    </motion.div>
  );
};
