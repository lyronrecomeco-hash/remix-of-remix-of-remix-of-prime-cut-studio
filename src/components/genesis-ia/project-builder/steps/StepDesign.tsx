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
      <div className="text-center mb-10">
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
          Design & Visual
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto">
          Configure a aparência do seu projeto
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Color Presets */}
        <div>
          <Label className="mb-4 block text-base font-medium">Paletas Sugeridas</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:shadow-md transition-all bg-background"
              >
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-full shadow-sm ring-2 ring-background"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full shadow-sm ring-2 ring-background"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground font-medium">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="primaryColor" className="text-base font-medium">Cor Primária</Label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="w-14 h-12 rounded-xl border-2 border-border cursor-pointer"
              />
              <Input
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => updateFormData('primaryColor', e.target.value)}
                className="flex-1 h-12 text-base font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="secondaryColor" className="text-base font-medium">Cor Secundária</Label>
            <div className="flex gap-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="w-14 h-12 rounded-xl border-2 border-border cursor-pointer"
              />
              <Input
                id="secondaryColor"
                value={formData.secondaryColor}
                onChange={(e) => updateFormData('secondaryColor', e.target.value)}
                className="flex-1 h-12 text-base font-mono"
              />
            </div>
          </div>
        </div>

        {/* Theme */}
        <div>
          <Label className="mb-4 block text-base font-medium">Tema Base</Label>
          <div className="flex gap-4">
            {(['light', 'dark'] as const).map((theme) => {
              const isSelected = formData.theme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => updateFormData('theme', theme)}
                  className={`
                    flex-1 flex items-center justify-center gap-4 p-5 lg:p-6 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                      : 'border-border bg-background hover:border-primary/50 hover:shadow-md'
                    }
                  `}
                >
                  {theme === 'light' ? (
                    <Sun className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  ) : (
                    <Moon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <span className={`text-lg font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {theme === 'light' ? 'Claro' : 'Escuro'}
                  </span>
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography */}
        <div>
          <Label className="mb-4 block text-base font-medium">Tipografia</Label>
          <div className="flex flex-wrap gap-3">
            {TYPOGRAPHY_OPTIONS.map((font) => {
              const isSelected = formData.typography === font;
              return (
                <button
                  key={font}
                  onClick={() => updateFormData('typography', font)}
                  className={`
                    px-5 py-3 rounded-xl border-2 text-base transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10 text-primary font-medium' 
                      : 'border-border bg-background hover:border-primary/50 text-foreground'
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
          <Label className="mb-4 block text-base font-medium">Estilo Visual</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VISUAL_STYLES.map((style) => {
              const isSelected = formData.visualStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => updateFormData('visualStyle', style)}
                  className={`
                    p-4 rounded-xl border-2 text-base transition-all text-left
                    ${isSelected 
                      ? 'border-primary bg-primary/10 text-primary font-medium' 
                      : 'border-border bg-background hover:border-primary/50 text-foreground'
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
