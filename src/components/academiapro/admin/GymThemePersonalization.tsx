import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, RotateCcw, Save, Loader2, Image, Building2, Sun, Moon, Droplets, Flame, Leaf, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useGymTheme, GymThemeSettings } from '@/hooks/useGymTheme';

interface ColorPickerProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, description, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-zinc-400 truncate">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-zinc-600 cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-sm bg-zinc-700 border border-zinc-600 rounded-lg text-center font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// Pre-defined themes
const presetThemes: { name: string; icon: React.ReactNode; colors: Omit<GymThemeSettings, 'id'> }[] = [
  {
    name: 'Genesis (Padrão)',
    icon: <Flame className="w-5 h-5" />,
    colors: {
      primary_color: '#F97316',
      secondary_color: '#EA580C',
      accent_color: '#FB923C',
      background_color: '#09090B',
      card_color: '#18181B',
      text_color: '#FAFAFA',
    }
  },
  {
    name: 'Modo Claro',
    icon: <Sun className="w-5 h-5" />,
    colors: {
      primary_color: '#F97316',
      secondary_color: '#EA580C',
      accent_color: '#FB923C',
      background_color: '#F4F4F5',
      card_color: '#FFFFFF',
      text_color: '#18181B',
    }
  },
  {
    name: 'Oceano Azul',
    icon: <Droplets className="w-5 h-5" />,
    colors: {
      primary_color: '#3B82F6',
      secondary_color: '#2563EB',
      accent_color: '#60A5FA',
      background_color: '#0F172A',
      card_color: '#1E293B',
      text_color: '#F8FAFC',
    }
  },
  {
    name: 'Vermelho Intenso',
    icon: <Zap className="w-5 h-5" />,
    colors: {
      primary_color: '#EF4444',
      secondary_color: '#DC2626',
      accent_color: '#F87171',
      background_color: '#0C0A09',
      card_color: '#1C1917',
      text_color: '#FAFAF9',
    }
  },
  {
    name: 'Verde Natureza',
    icon: <Leaf className="w-5 h-5" />,
    colors: {
      primary_color: '#22C55E',
      secondary_color: '#16A34A',
      accent_color: '#4ADE80',
      background_color: '#052E16',
      card_color: '#14532D',
      text_color: '#F0FDF4',
    }
  },
  {
    name: 'Noite Escura',
    icon: <Moon className="w-5 h-5" />,
    colors: {
      primary_color: '#A855F7',
      secondary_color: '#9333EA',
      accent_color: '#C084FC',
      background_color: '#030712',
      card_color: '#111827',
      text_color: '#F9FAFB',
    }
  },
];

export function GymThemePersonalization() {
  const { 
    theme, 
    isLoading, 
    isSaving, 
    updateThemePreview, 
    saveTheme, 
    resetToDefault 
  } = useGymTheme();

  const [gymName, setGymName] = useState('Academia Genesis');
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);

  const applyPreset = (preset: typeof presetThemes[0]) => {
    updateThemePreview(preset.colors);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <div className="p-4 rounded-xl border border-zinc-700" style={{ backgroundColor: theme.card_color }}>
        <p className="text-xs text-zinc-400 mb-3">Pré-visualização</p>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.primary_color }}
          >
            <Palette className="w-6 h-6" style={{ color: theme.text_color }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: theme.text_color }}>{gymName}</p>
            <p className="text-sm" style={{ color: theme.accent_color }}>Seu sistema personalizado</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <div 
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: theme.primary_color, color: theme.text_color }}
          >
            Botão Primário
          </div>
          <div 
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: theme.secondary_color, color: theme.text_color }}
          >
            Botão Secundário
          </div>
        </div>
      </div>

      {/* Identity Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold">Identidade</h3>
            <p className="text-sm text-zinc-400">Nome e logo da academia</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="font-medium">Nome da Academia</p>
              <p className="text-sm text-zinc-400">Exibido em todo o sistema</p>
            </div>
            <Input
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-48 bg-zinc-700 border-zinc-600"
              placeholder="Nome da academia"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
            <div>
              <p className="font-medium">Logo da Academia</p>
              <p className="text-sm text-zinc-400">Imagem PNG ou SVG</p>
            </div>
            <Button variant="outline" size="sm" className="border-zinc-600 hover:bg-zinc-700">
              <Image className="w-4 h-4 mr-2" />
              Alterar Logo
            </Button>
          </div>
        </div>
      </div>

      {/* Preset Themes Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold">Temas Prontos</h3>
            <p className="text-sm text-zinc-400">Selecione um tema pré-configurado</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presetThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-700 hover:border-orange-500/50 transition-all group"
              style={{ backgroundColor: preset.colors.card_color }}
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: preset.colors.primary_color, color: preset.colors.text_color }}
              >
                {preset.icon}
              </div>
              <span 
                className="text-xs font-medium text-center"
                style={{ color: preset.colors.text_color }}
              >
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Colors Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Cores Personalizadas</h3>
              <p className="text-sm text-zinc-400">Ajuste cada cor manualmente</p>
            </div>
          </div>
          <Switch
            checked={showAdvancedColors}
            onCheckedChange={setShowAdvancedColors}
          />
        </div>
        
        {showAdvancedColors && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <ColorPicker
              label="Cor Primária"
              description="Botões e destaques principais"
              value={theme.primary_color}
              onChange={(value) => updateThemePreview({ primary_color: value })}
            />
            
            <ColorPicker
              label="Cor Secundária"
              description="Gradientes e elementos secundários"
              value={theme.secondary_color}
              onChange={(value) => updateThemePreview({ secondary_color: value })}
            />
            
            <ColorPicker
              label="Cor de Destaque"
              description="Links, badges e indicadores"
              value={theme.accent_color}
              onChange={(value) => updateThemePreview({ accent_color: value })}
            />
            
            <ColorPicker
              label="Cor de Fundo"
              description="Fundo geral do sistema"
              value={theme.background_color}
              onChange={(value) => updateThemePreview({ background_color: value })}
            />
            
            <ColorPicker
              label="Cor dos Cards"
              description="Fundo de cards e modais"
              value={theme.card_color}
              onChange={(value) => updateThemePreview({ card_color: value })}
            />
            
            <ColorPicker
              label="Cor do Texto"
              description="Textos principais e títulos"
              value={theme.text_color}
              onChange={(value) => updateThemePreview({ text_color: value })}
            />
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={resetToDefault}
          className="flex-1 border-zinc-700 hover:bg-zinc-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrão
        </Button>
        <Button 
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          onClick={() => saveTheme()}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Personalização
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        As alterações serão aplicadas globalmente no login, painel admin e app do aluno
      </p>
    </div>
  );
}
