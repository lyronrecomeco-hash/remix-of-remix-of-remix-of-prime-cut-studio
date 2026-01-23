import { motion } from 'framer-motion';
import { Palette, Type, Sun, Moon, Monitor } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { TYPOGRAPHY_OPTIONS, VISUAL_STYLES, COLOR_PRESETS, ThemeMode } from '../types';

export function StepVisual() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();

  const allColorPresets = selectedNiche?.colorSuggestions 
    ? [...selectedNiche.colorSuggestions, ...COLOR_PRESETS]
    : COLOR_PRESETS;

  const themeModes: { id: ThemeMode; icon: React.ElementType; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Escuro' },
    { id: 'auto', icon: Monitor, label: 'Automático' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Design Visual
        </h3>
        <p className="text-muted-foreground">
          Defina as cores, tipografia e estilo do projeto
        </p>
      </div>

      {/* Color Presets */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Palette className="w-4 h-4 text-primary" />
          Paleta de Cores
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {allColorPresets.slice(0, 12).map((preset, index) => {
            const isSelected = formData.primaryColor === preset.primary;
            return (
              <motion.button
                key={`${preset.primary}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  updateFormData('primaryColor', preset.primary);
                  updateFormData('secondaryColor', preset.secondary);
                }}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-primary/50 ring-2 ring-primary/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex gap-1 mb-2 justify-center">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1 text-center block">
                  {preset.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Colors */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Cor Primária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm font-mono text-muted-foreground">{formData.primaryColor}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground block mb-1">Cor Secundária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm font-mono text-muted-foreground">{formData.secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Mode */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Tema</label>
        <div className="flex gap-2">
          {themeModes.map(({ id, icon: Icon, label }) => {
            const isSelected = formData.themeMode === id;
            return (
              <button
                key={id}
                onClick={() => updateFormData('themeMode', id)}
                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Type className="w-4 h-4 text-primary" />
          Tipografia
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPOGRAPHY_OPTIONS.map((font) => {
            const isSelected = formData.typography === font;
            return (
              <button
                key={font}
                onClick={() => updateFormData('typography', font)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Style */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Estilo Visual</label>
        <div className="flex flex-wrap gap-2">
          {VISUAL_STYLES.map((style) => {
            const isSelected = formData.visualStyle === style;
            return (
              <button
                key={style}
                onClick={() => updateFormData('visualStyle', style)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
