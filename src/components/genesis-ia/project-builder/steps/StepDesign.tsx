import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sun, Moon } from 'lucide-react';
import { useProjectBuilder } from '../ProjectBuilderContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TYPOGRAPHY_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Nunito',
  'Playfair Display',
  'Source Sans Pro',
];

const VISUAL_STYLES = [
  'Moderno e Clean',
  'Minimalista',
  'Corporativo',
  'Divertido e Colorido',
  'Elegante e Sofisticado',
  'Rústico e Natural',
  'Tecnológico e Futurista',
  'Clássico e Tradicional',
];

const COLOR_PRESETS = [
  { primary: '#10b981', secondary: '#3b82f6', name: 'Verde & Azul' },
  { primary: '#8b5cf6', secondary: '#ec4899', name: 'Roxo & Rosa' },
  { primary: '#f59e0b', secondary: '#ef4444', name: 'Laranja & Vermelho' },
  { primary: '#06b6d4', secondary: '#8b5cf6', name: 'Ciano & Roxo' },
  { primary: '#84cc16', secondary: '#22c55e', name: 'Lima & Verde' },
  { primary: '#f43f5e', secondary: '#fb7185', name: 'Rose & Pink' },
];

export const StepDesign: React.FC = () => {
  const { formData, updateFormData } = useProjectBuilder();

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateFormData('primaryColor', preset.primary);
    updateFormData('secondaryColor', preset.secondary);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Design & Visual
        </h3>
        <p className="text-muted-foreground">
          Configure a aparência do seu projeto
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Color Presets */}
        <div>
          <Label className="mb-3 block">Paletas Sugeridas</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Cor Secundária</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                id="secondaryColor"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Theme */}
        <div>
          <Label className="mb-3 block">Tema Base</Label>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((theme) => {
              const isSelected = formData.theme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => updateFormData('theme', theme)}
                  className={`
                    flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-card hover:border-primary/50'
                    }
                  `}
                >
                  {theme === 'light' ? (
                    <Sun className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  ) : (
                    <Moon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={isSelected ? 'text-primary font-medium' : 'text-foreground'}>
                    {theme === 'light' ? 'Claro' : 'Escuro'}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography */}
        <div>
          <Label className="mb-3 block">Tipografia</Label>
          <div className="flex flex-wrap gap-2">
            {TYPOGRAPHY_OPTIONS.map((font) => {
              const isSelected = formData.typography === font;
              return (
                <button
                  key={font}
                  onClick={() => updateFormData('typography', font)}
                  className={`
                    px-4 py-2 rounded-full border-2 text-sm transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-card hover:border-primary/50 text-foreground'
                    }
                  `}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Style */}
        <div>
          <Label className="mb-3 block">Estilo Visual</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {VISUAL_STYLES.map((style) => {
              const isSelected = formData.visualStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => updateFormData('visualStyle', style)}
                  className={`
                    p-3 rounded-xl border-2 text-sm transition-all text-left
                    ${isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-card hover:border-primary/50 text-foreground'
                    }
                  `}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
