import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const visualStyles = [
  {
    id: 'moderno-minimalista',
    label: 'Moderno Minimalista',
    description: 'Clean, espaçoso, tipografia bold',
    preview: 'bg-gradient-to-br from-slate-50 to-white',
    accent: 'bg-slate-900',
  },
  {
    id: 'elegante-luxo',
    label: 'Elegante & Luxo',
    description: 'Sofisticado, dourado, serif fonts',
    preview: 'bg-gradient-to-br from-amber-50 to-stone-100',
    accent: 'bg-amber-600',
  },
  {
    id: 'vibrante-colorido',
    label: 'Vibrante & Colorido',
    description: 'Cores fortes, energético, divertido',
    preview: 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
    accent: 'bg-gradient-to-r from-pink-500 to-purple-500',
  },
  {
    id: 'corporativo',
    label: 'Corporativo',
    description: 'Profissional, confiável, azul',
    preview: 'bg-gradient-to-br from-blue-50 to-slate-50',
    accent: 'bg-blue-600',
  },
  {
    id: 'natural-organico',
    label: 'Natural & Orgânico',
    description: 'Tons terrosos, texturas, verde',
    preview: 'bg-gradient-to-br from-green-50 to-amber-50',
    accent: 'bg-green-600',
  },
  {
    id: 'tech-futurista',
    label: 'Tech & Futurista',
    description: 'Dark mode, neon, gradientes',
    preview: 'bg-gradient-to-br from-slate-900 to-slate-800',
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
    <div className="space-y-8">
      {/* Visual Style */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Estilo Visual *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {visualStyles.map((style, index) => {
            const isSelected = formData.visualStyle === style.id;
            
            return (
              <motion.button
                key={style.id}
                type="button"
                onClick={() => updateFormData({ visualStyle: style.id })}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden transition-all duration-300",
                  isSelected
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Preview */}
                <div className={cn("h-24 relative", style.preview)}>
                  {/* Mock elements */}
                  <div className="absolute inset-4 flex flex-col gap-2">
                    <div className={cn("h-3 w-16 rounded", style.accent)} />
                    <div className="h-2 w-24 rounded bg-current/20" />
                    <div className="h-2 w-20 rounded bg-current/10" />
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3 bg-background">
                  <p className="text-sm font-medium">{style.label}</p>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="styleIndicator"
                    className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color Presets */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Paleta de Cores
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-primary shadow-lg"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex gap-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-xs font-medium">{preset.name}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Cores Personalizadas
        </Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Primária</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
              />
              <span className="text-xs text-muted-foreground uppercase">
                {formData.primaryColor}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Secundária</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
              />
              <span className="text-xs text-muted-foreground uppercase">
                {formData.secondaryColor}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Destaque</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => updateFormData({ accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
              />
              <span className="text-xs text-muted-foreground uppercase">
                {formData.accentColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <motion.div 
        className="p-4 rounded-xl border border-border"
        style={{
          background: `linear-gradient(135deg, ${formData.primaryColor}10, ${formData.secondaryColor}10)`,
        }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg"
            style={{ backgroundColor: formData.primaryColor }}
          />
          <div className="flex-1">
            <p 
              className="font-bold"
              style={{ color: formData.primaryColor }}
            >
              Preview do Título
            </p>
            <p className="text-sm text-muted-foreground">
              Texto de exemplo com a paleta selecionada
            </p>
          </div>
          <button 
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: formData.accentColor }}
          >
            CTA Button
          </button>
        </div>
      </motion.div>
    </div>
  );
};
