import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const visualStyles = [
  {
    id: 'moderno-minimalista',
    label: 'Minimalista',
    description: 'Clean e espaçoso',
    bg: 'bg-gradient-to-br from-slate-50 to-white',
    accent: 'bg-slate-900',
  },
  {
    id: 'elegante-luxo',
    label: 'Luxo',
    description: 'Sofisticado',
    bg: 'bg-gradient-to-br from-amber-50 to-stone-100',
    accent: 'bg-amber-600',
  },
  {
    id: 'vibrante-colorido',
    label: 'Vibrante',
    description: 'Cores fortes',
    bg: 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
    accent: 'bg-gradient-to-r from-pink-500 to-purple-500',
  },
  {
    id: 'corporativo',
    label: 'Corporativo',
    description: 'Profissional',
    bg: 'bg-gradient-to-br from-blue-50 to-slate-50',
    accent: 'bg-blue-600',
  },
  {
    id: 'natural-organico',
    label: 'Natural',
    description: 'Tons terrosos',
    bg: 'bg-gradient-to-br from-green-50 to-amber-50',
    accent: 'bg-green-600',
  },
  {
    id: 'tech-futurista',
    label: 'Tech',
    description: 'Dark mode',
    bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
    accent: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  },
];

const colorPresets = [
  { primary: '#6366f1', secondary: '#8b5cf6', accent: '#f59e0b', name: 'Genesis' },
  { primary: '#3b82f6', secondary: '#0ea5e9', accent: '#10b981', name: 'Ocean' },
  { primary: '#ef4444', secondary: '#f97316', accent: '#eab308', name: 'Sunset' },
  { primary: '#22c55e', secondary: '#14b8a6', accent: '#06b6d4', name: 'Nature' },
  { primary: '#8b5cf6', secondary: '#d946ef', accent: '#f43f5e', name: 'Purple' },
  { primary: '#0f172a', secondary: '#334155', accent: '#f59e0b', name: 'Dark' },
];

export const StepVisualStyle: React.FC = () => {
  const { formData, updateFormData } = useWizard();

  const handleColorPreset = (preset: typeof colorPresets[0]) => {
    updateFormData({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  return (
    <div className="space-y-6">
      {/* Visual Style */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Estilo Visual</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {visualStyles.map((style, index) => {
            const isSelected = formData.visualStyle === style.id;
            
            return (
              <motion.button
                key={style.id}
                type="button"
                onClick={() => updateFormData({ visualStyle: style.id })}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative rounded-lg border-2 overflow-hidden transition-all duration-200",
                  isSelected
                    ? "border-primary shadow-md shadow-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                {/* Preview */}
                <div className={cn("h-12 relative", style.bg)}>
                  <div className="absolute inset-2 flex flex-col gap-1">
                    <div className={cn("h-2 w-8 rounded", style.accent)} />
                    <div className="h-1.5 w-10 rounded bg-current/20" />
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-2 bg-background">
                  <p className="text-[10px] font-semibold truncate">{style.label}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Paleta de Cores</Label>
        <div className="grid grid-cols-6 gap-2">
          {colorPresets.map((preset, index) => {
            const isSelected = 
              formData.primaryColor === preset.primary &&
              formData.secondaryColor === preset.secondary;
            
            return (
              <motion.button
                key={preset.name}
                type="button"
                onClick={() => handleColorPreset(preset)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex justify-center gap-0.5 mb-1.5">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-[9px] font-medium text-center">{preset.name}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Personalizar</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => updateFormData({ primaryColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Primária</p>
              <p className="text-xs font-mono uppercase truncate">{formData.primaryColor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Secundária</p>
              <p className="text-xs font-mono uppercase truncate">{formData.secondaryColor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => updateFormData({ accentColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Destaque</p>
              <p className="text-xs font-mono uppercase truncate">{formData.accentColor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <motion.div 
        className="p-3 rounded-lg border border-border"
        style={{
          background: `linear-gradient(135deg, ${formData.primaryColor}08, ${formData.secondaryColor}08)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: formData.primaryColor }}
          />
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-bold truncate"
              style={{ color: formData.primaryColor }}
            >
              {formData.businessName || 'Preview do Título'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Exemplo de texto com suas cores
            </p>
          </div>
          <button 
            className="px-3 py-1.5 rounded-md text-white text-xs font-medium shrink-0"
            style={{ backgroundColor: formData.accentColor }}
          >
            Botão
          </button>
        </div>
      </motion.div>
    </div>
  );
};
