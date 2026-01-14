import React from 'react';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const visualStyles = [
  {
    id: 'moderno',
    label: 'Moderno',
    description: 'Clean e minimalista',
    bg: 'bg-gradient-to-br from-slate-50 to-white',
    accent: 'bg-slate-900',
    preview: { text: 'text-slate-900', button: 'bg-slate-900' }
  },
  {
    id: 'elegante',
    label: 'Elegante',
    description: 'Sofisticado e luxuoso',
    bg: 'bg-gradient-to-br from-amber-50 to-stone-100',
    accent: 'bg-amber-600',
    preview: { text: 'text-amber-900', button: 'bg-amber-600' }
  },
  {
    id: 'vibrante',
    label: 'Vibrante',
    description: 'Cores fortes e vivas',
    bg: 'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
    accent: 'bg-gradient-to-r from-pink-500 to-purple-500',
    preview: { text: 'text-purple-900', button: 'bg-purple-600' }
  },
  {
    id: 'corporativo',
    label: 'Corporativo',
    description: 'Profissional e sério',
    bg: 'bg-gradient-to-br from-blue-50 to-slate-50',
    accent: 'bg-blue-600',
    preview: { text: 'text-blue-900', button: 'bg-blue-600' }
  },
  {
    id: 'criativo',
    label: 'Criativo',
    description: 'Artístico e único',
    bg: 'bg-gradient-to-br from-orange-50 via-rose-50 to-violet-50',
    accent: 'bg-gradient-to-r from-orange-500 to-rose-500',
    preview: { text: 'text-rose-900', button: 'bg-rose-500' }
  },
  {
    id: 'rustico',
    label: 'Rústico',
    description: 'Aconchegante e natural',
    bg: 'bg-gradient-to-br from-amber-100 to-stone-200',
    accent: 'bg-amber-800',
    preview: { text: 'text-amber-900', button: 'bg-amber-800' }
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
      {/* Visual Style Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Estilo Visual</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative rounded-xl border-2 overflow-hidden transition-all duration-200",
                  isSelected
                    ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                )}
              >
                {/* Style Preview */}
                <div className={cn("h-20 relative p-3", style.bg)}>
                  <div className="h-full flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className={cn("h-2 w-16 rounded", style.accent)} />
                      <div className="h-1.5 w-12 rounded bg-current/20" />
                    </div>
                    <div className="flex gap-1">
                      <div className={cn("h-2 w-8 rounded-sm", style.accent, "opacity-80")} />
                      <div className="h-2 w-6 rounded-sm bg-current/10" />
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
                
                {/* Style Info */}
                <div className="p-2.5 bg-background border-t border-border/50">
                  <p className="text-xs font-bold">{style.label}</p>
                  <p className="text-[10px] text-muted-foreground">{style.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Paleta de Cores</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                  "p-3 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex justify-center gap-1 mb-2">
                  <div 
                    className="w-5 h-5 rounded-full shadow-inner" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-5 h-5 rounded-full shadow-inner" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-5 h-5 rounded-full shadow-inner" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-[10px] font-semibold text-center">{preset.name}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Personalizar Cores</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30">
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => updateFormData({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium">Primária</p>
              <p className="text-xs font-mono uppercase truncate">{formData.primaryColor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30">
            <input
              type="color"
              value={formData.secondaryColor}
              onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium">Secundária</p>
              <p className="text-xs font-mono uppercase truncate">{formData.secondaryColor}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30">
            <input
              type="color"
              value={formData.accentColor}
              onChange={(e) => updateFormData({ accentColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium">Destaque</p>
              <p className="text-xs font-mono uppercase truncate">{formData.accentColor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl border border-border overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${formData.primaryColor}10, ${formData.secondaryColor}10)`,
        }}
      >
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">Preview</p>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl shrink-0 shadow-lg"
            style={{ backgroundColor: formData.primaryColor }}
          />
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-bold truncate"
              style={{ color: formData.primaryColor }}
            >
              {formData.businessName || 'Nome do Negócio'}
            </p>
            <p 
              className="text-xs truncate"
              style={{ color: formData.secondaryColor }}
            >
              Descrição do seu negócio aqui
            </p>
          </div>
          <button 
            className="px-4 py-2 rounded-lg text-white text-xs font-bold shrink-0 shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundColor: formData.accentColor }}
          >
            CTA
          </button>
        </div>
      </motion.div>
    </div>
  );
};
