import { motion } from 'framer-motion';
import { Palette, Type, Sun, Moon, Monitor, Check } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { TYPOGRAPHY_OPTIONS, VISUAL_STYLES, COLOR_PRESETS, ThemeMode } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

export function StepVisual() {
  const { formData, updateFormData, selectedNiche } = useFromScratch();

  const allColorPresets = selectedNiche?.colorSuggestions 
    ? [...selectedNiche.colorSuggestions, ...COLOR_PRESETS]
    : COLOR_PRESETS;

  const themeModes: { id: ThemeMode; icon: React.ElementType; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Claro' },
    { id: 'dark', icon: Moon, label: 'Escuro' },
    { id: 'auto', icon: Monitor, label: 'Auto' },
  ];

  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-5 pr-3">
        {/* Color Presets */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="w-4 h-4 text-primary" />
            Paleta de Cores
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {allColorPresets.slice(0, 16).map((preset, index) => {
              const isSelected = formData.primaryColor === preset.primary;
              return (
                <motion.button
                  key={`${preset.primary}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => {
                    updateFormData('primaryColor', preset.primary);
                    updateFormData('secondaryColor', preset.secondary);
                  }}
                  className={`relative p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary/50 ring-1 ring-primary/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex gap-1 justify-center">
                    <div 
                      className="w-5 h-5 rounded-full" 
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-5 h-5 rounded-full" 
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Custom Colors */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <span className="text-xs font-mono text-muted-foreground">{formData.primaryColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-0"
              />
              <span className="text-xs font-mono text-muted-foreground">{formData.secondaryColor}</span>
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
                  className={`relative flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
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
                  className={`relative px-3 py-2 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
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
                  className={`relative px-3 py-2 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {style}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
