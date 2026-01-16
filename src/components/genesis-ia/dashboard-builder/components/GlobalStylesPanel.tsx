import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '../types';

interface GlobalStylesPanelProps {
  globalStyles: DashboardLayout['globalStyles'];
  onUpdate: (styles: Partial<DashboardLayout['globalStyles']>) => void;
  onClose: () => void;
}

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

export const GlobalStylesPanel: React.FC<GlobalStylesPanelProps> = ({
  globalStyles,
  onUpdate,
  onClose,
}) => {
  const updateGradient = (updates: Partial<NonNullable<DashboardLayout['globalStyles']['backgroundGradient']>>) => {
    onUpdate({
      backgroundGradient: {
        enabled: globalStyles.backgroundGradient?.enabled ?? false,
        from: globalStyles.backgroundGradient?.from ?? '#0f172a',
        to: globalStyles.backgroundGradient?.to ?? '#1e293b',
        direction: globalStyles.backgroundGradient?.direction ?? 'to bottom',
        ...updates,
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
        <h3 className="font-semibold">Estilos Globais</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-4 space-y-6">
          {/* Background Color */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Cor de Fundo</h4>
            <div className="flex gap-2">
              <Input
                type="color"
                value={globalStyles.backgroundColor?.startsWith('#') 
                  ? globalStyles.backgroundColor 
                  : '#0f172a'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={globalStyles.backgroundColor || ''}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="hsl(var(--background))"
                className="flex-1"
              />
            </div>
          </div>

          <Separator />

          {/* Background Gradient */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Gradiente de Fundo</h4>
              <Switch
                checked={globalStyles.backgroundGradient?.enabled || false}
                onCheckedChange={(checked) => updateGradient({ enabled: checked })}
              />
            </div>

            {globalStyles.backgroundGradient?.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Cor Inicial</Label>
                  <Input
                    type="color"
                    value={globalStyles.backgroundGradient?.from || '#0f172a'}
                    onChange={(e) => updateGradient({ from: e.target.value })}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Final</Label>
                  <Input
                    type="color"
                    value={globalStyles.backgroundGradient?.to || '#1e293b'}
                    onChange={(e) => updateGradient({ to: e.target.value })}
                    className="w-full h-10 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Direção</Label>
                  <Select
                    value={globalStyles.backgroundGradient?.direction || 'to bottom'}
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

          {/* Grid Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Grid</h4>
            
            <div className="space-y-2">
              <Label>Colunas: {globalStyles.gridColumns}</Label>
              <Slider
                value={[globalStyles.gridColumns]}
                onValueChange={([value]) => onUpdate({ gridColumns: value })}
                min={1}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Espaçamento: {globalStyles.gap}px</Label>
              <Slider
                value={[globalStyles.gap]}
                onValueChange={([value]) => onUpdate({ gap: value })}
                min={0}
                max={50}
                step={1}
              />
            </div>
          </div>

          <Separator />

          {/* Preset Colors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Presets de Cor</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                '#0f172a', '#1e293b', '#18181b', '#09090b',
                '#1e1b4b', '#172554', '#0c4a6e', '#064e3b',
                '#3b0764', '#4c0519', '#431407', '#713f12',
              ].map((color) => (
                <button
                  key={color}
                  className="w-full h-10 rounded-lg border border-border hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => onUpdate({ backgroundColor: color })}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};
