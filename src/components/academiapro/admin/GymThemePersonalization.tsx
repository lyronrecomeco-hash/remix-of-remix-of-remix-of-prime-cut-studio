import { motion } from 'framer-motion';
import { Palette, RotateCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGymTheme } from '@/hooks/useGymTheme';

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

export function GymThemePersonalization() {
  const { 
    theme, 
    isLoading, 
    isSaving, 
    updateThemePreview, 
    saveTheme, 
    resetToDefault 
  } = useGymTheme();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Personalização</h2>
            <p className="text-sm text-zinc-400">Customize as cores do sistema</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefault}
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrão
        </Button>
      </div>

      {/* Preview Card */}
      <div className="mb-6 p-4 rounded-xl border border-zinc-700" style={{ backgroundColor: theme.card_color }}>
        <p className="text-xs text-zinc-400 mb-3">Pré-visualização</p>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.primary_color }}
          >
            <Palette className="w-6 h-6" style={{ color: theme.text_color }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: theme.text_color }}>Academia Genesis</p>
            <p className="text-sm" style={{ color: theme.accent_color }}>Seu sistema personalizado</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
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

      {/* Color Pickers */}
      <div className="space-y-3">
        <Label className="text-sm text-zinc-400 uppercase tracking-wide">Cores do Sistema</Label>
        
        <ColorPicker
          label="Cor Primária"
          description="Botões, destaques e elementos principais"
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
      </div>

      {/* Save Button */}
      <Button 
        className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
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

      <p className="mt-3 text-xs text-zinc-500 text-center">
        As alterações serão aplicadas globalmente no login, painel admin e app do aluno
      </p>
    </motion.div>
  );
}
