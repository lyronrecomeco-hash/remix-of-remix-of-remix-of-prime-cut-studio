import { motion } from 'framer-motion';
import { Palette, Type, Sun, Moon, Monitor, Check, Brush } from 'lucide-react';
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
    <ScrollArea className="h-[400px]">
      <div className="space-y-6 pr-3">
        {/* Color Selection - Big Cards */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="w-4 h-4 text-primary" />
            Paleta de Cores
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allColorPresets.slice(0, 6).map((preset, index) => {
              const isSelected = formData.primaryColor === preset.primary;
              return (
                <motion.button
                  key={`${preset.primary}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    updateFormData('primaryColor', preset.primary);
                    updateFormData('secondaryColor', preset.secondary);
                  }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-full shadow-lg" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-full shadow-lg" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{preset.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Primária + Secundária
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Custom Colors */}
          <div className="flex gap-4 mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Primária:</span>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm font-mono">{formData.primaryColor}</span>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Secundária:</span>
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm font-mono">{formData.secondaryColor}</span>
            </div>
          </div>
        </div>

        {/* Theme Mode */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Tema</label>
          <div className="grid grid-cols-3 gap-3">
            {themeModes.map(({ id, icon: Icon, label }) => {
              const isSelected = formData.themeMode === id;
              return (
                <button
                  key={id}
                  onClick={() => updateFormData('themeMode', id)}
                  className={`relative p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label}</span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography - Big Cards */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Type className="w-4 h-4 text-primary" />
            Tipografia
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TYPOGRAPHY_OPTIONS.slice(0, 8).map((font, index) => {
              const isSelected = formData.typography === font;
              return (
                <motion.button
                  key={font}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => updateFormData('typography', font)}
                  className={`relative p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  style={{ fontFamily: font }}
                >
                  <p className="text-sm font-medium">{font}</p>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Visual Style - Big Cards */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Brush className="w-4 h-4 text-primary" />
            Estilo Visual
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VISUAL_STYLES.slice(0, 6).map((style, index) => {
              const isSelected = formData.visualStyle === style;
              return (
                <motion.button
                  key={style}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => updateFormData('visualStyle', style)}
                  className={`relative p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-sm font-medium">{style}</p>
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
