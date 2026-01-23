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
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-2">
        {/* Color Presets */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <Palette className="w-3.5 h-3.5 text-primary" />
            Paleta de Cores
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {allColorPresets.slice(0, 20).map((preset, index) => {
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
                  className={`relative p-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary/50 ring-1 ring-primary/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex gap-0.5 justify-center">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Custom Colors */}
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0"
              />
              <span className="text-[10px] font-mono text-muted-foreground">{formData.primaryColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0"
              />
              <span className="text-[10px] font-mono text-muted-foreground">{formData.secondaryColor}</span>
            </div>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Tema</label>
          <div className="flex gap-1.5">
            {themeModes.map(({ id, icon: Icon, label }) => {
              const isSelected = formData.themeMode === id;
              return (
                <button
                  key={id}
                  onClick={() => updateFormData('themeMode', id)}
                  className={`relative flex-1 p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px]">{label}</span>
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium">
            <Type className="w-3.5 h-3.5 text-primary" />
            Tipografia
          </label>
          <div className="flex flex-wrap gap-1">
            {TYPOGRAPHY_OPTIONS.map((font) => {
              const isSelected = formData.typography === font;
              return (
                <button
                  key={font}
                  onClick={() => updateFormData('typography', font)}
                  className={`relative px-2 py-1 rounded-lg border text-[10px] transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Style */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Estilo Visual</label>
          <div className="flex flex-wrap gap-1">
            {VISUAL_STYLES.map((style) => {
              const isSelected = formData.visualStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => updateFormData('visualStyle', style)}
                  className={`relative px-2 py-1 rounded-lg border text-[10px] transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {style}
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
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
