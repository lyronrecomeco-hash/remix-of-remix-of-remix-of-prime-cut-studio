import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  onChange: (colors: ColorPickerProps['colors']) => void;
}

const PRESET_COLORS = [
  { name: 'Roxo', primary: '#7c3aed', secondary: '#a855f7' },
  { name: 'Azul', primary: '#2563eb', secondary: '#3b82f6' },
  { name: 'Verde', primary: '#059669', secondary: '#10b981' },
  { name: 'Vermelho', primary: '#dc2626', secondary: '#ef4444' },
  { name: 'Laranja', primary: '#ea580c', secondary: '#f97316' },
  { name: 'Rosa', primary: '#db2777', secondary: '#ec4899' },
  { name: 'Ciano', primary: '#0891b2', secondary: '#06b6d4' },
  { name: 'Âmbar', primary: '#d97706', secondary: '#f59e0b' },
  { name: 'Escuro', primary: '#1e293b', secondary: '#475569' },
  { name: 'Dourado', primary: '#1a1a2e', secondary: '#d4af37' },
];

export const ColorPicker = ({ colors, onChange }: ColorPickerProps) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const updateColor = (key: keyof typeof colors, value: string) => {
    onChange({ ...colors, [key]: value });
    setActivePreset(null);
  };

  const applyPreset = (preset: typeof PRESET_COLORS[0]) => {
    onChange({
      ...colors,
      primary: preset.primary,
      secondary: preset.secondary,
    });
    setActivePreset(preset.name);
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">Paletas prontas</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`
                flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-xs
                ${activePreset === preset.name 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex gap-0.5">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary">Cor Primária</Label>
          <div className="flex gap-2 mt-1">
            <div 
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              style={{ backgroundColor: colors.primary }}
            >
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={colors.primary}
              onChange={(e) => updateColor('primary', e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="secondary">Cor Secundária</Label>
          <div className="flex gap-2 mt-1">
            <div 
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              style={{ backgroundColor: colors.secondary }}
            >
              <input
                type="color"
                value={colors.secondary}
                onChange={(e) => updateColor('secondary', e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={colors.secondary}
              onChange={(e) => updateColor('secondary', e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="background">Cor de Fundo</Label>
          <div className="flex gap-2 mt-1">
            <div 
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              style={{ backgroundColor: colors.background }}
            >
              <input
                type="color"
                value={colors.background}
                onChange={(e) => updateColor('background', e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={colors.background}
              onChange={(e) => updateColor('background', e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="text">Cor do Texto</Label>
          <div className="flex gap-2 mt-1">
            <div 
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              style={{ backgroundColor: colors.text }}
            >
              <input
                type="color"
                value={colors.text}
                onChange={(e) => updateColor('text', e.target.value)}
                className="w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={colors.text}
              onChange={(e) => updateColor('text', e.target.value)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div 
        className="p-4 rounded-xl border border-border"
        style={{ 
          backgroundColor: colors.background,
          color: colors.text,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: colors.primary }}
          >
            A
          </div>
          <div>
            <p className="font-semibold" style={{ color: colors.text }}>Preview da Interface</p>
            <p className="text-sm opacity-70">Visualização em tempo real</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="px-3 py-1.5 rounded-lg text-sm text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Botão Primário
          </button>
          <button 
            className="px-3 py-1.5 rounded-lg text-sm text-white"
            style={{ backgroundColor: colors.secondary }}
          >
            Secundário
          </button>
        </div>
      </div>
    </div>
  );
};
