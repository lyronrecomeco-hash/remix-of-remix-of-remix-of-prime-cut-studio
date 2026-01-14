import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const headingFonts = [
  { id: 'Inter', label: 'Inter', style: 'font-sans', sample: 'Aa' },
  { id: 'Poppins', label: 'Poppins', style: 'font-sans', sample: 'Aa' },
  { id: 'Montserrat', label: 'Montserrat', style: 'font-sans', sample: 'Aa' },
  { id: 'Playfair Display', label: 'Playfair', style: 'font-serif', sample: 'Aa' },
  { id: 'Roboto', label: 'Roboto', style: 'font-sans', sample: 'Aa' },
  { id: 'Oswald', label: 'Oswald', style: 'font-sans', sample: 'Aa' },
];

const bodyFonts = [
  { id: 'Inter', label: 'Inter', style: 'font-sans' },
  { id: 'Open Sans', label: 'Open Sans', style: 'font-sans' },
  { id: 'Lato', label: 'Lato', style: 'font-sans' },
  { id: 'Roboto', label: 'Roboto', style: 'font-sans' },
  { id: 'Source Sans Pro', label: 'Source Sans', style: 'font-sans' },
  { id: 'Nunito', label: 'Nunito', style: 'font-sans' },
];

const layoutStyles = [
  {
    id: 'hero-centered',
    label: 'Hero Centralizado',
    description: 'Conteúdo centralizado com impacto visual',
    preview: (
      <div className="flex flex-col items-center gap-1 p-2">
        <div className="w-12 h-2 bg-primary/60 rounded" />
        <div className="w-8 h-1.5 bg-muted-foreground/30 rounded" />
        <div className="w-10 h-4 bg-primary/40 rounded mt-1" />
      </div>
    ),
  },
  {
    id: 'hero-left',
    label: 'Hero Esquerda',
    description: 'Texto à esquerda, imagem à direita',
    preview: (
      <div className="flex gap-2 p-2">
        <div className="flex-1 flex flex-col gap-1">
          <div className="w-full h-2 bg-primary/60 rounded" />
          <div className="w-3/4 h-1.5 bg-muted-foreground/30 rounded" />
          <div className="w-8 h-3 bg-primary/40 rounded mt-1" />
        </div>
        <div className="w-8 h-10 bg-muted rounded" />
      </div>
    ),
  },
  {
    id: 'split-screen',
    label: 'Split Screen',
    description: '50/50 com dois blocos visuais',
    preview: (
      <div className="flex gap-1 p-2">
        <div className="flex-1 bg-primary/20 rounded h-12" />
        <div className="flex-1 bg-muted rounded h-12" />
      </div>
    ),
  },
  {
    id: 'full-width',
    label: 'Full Width',
    description: 'Seções de largura total',
    preview: (
      <div className="flex flex-col gap-1 p-2">
        <div className="w-full h-6 bg-primary/30 rounded" />
        <div className="w-full h-4 bg-muted rounded" />
        <div className="w-full h-4 bg-primary/20 rounded" />
      </div>
    ),
  },
  {
    id: 'card-grid',
    label: 'Card Grid',
    description: 'Layout baseado em cards',
    preview: (
      <div className="grid grid-cols-3 gap-1 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded" />
        ))}
      </div>
    ),
  },
  {
    id: 'asymmetric',
    label: 'Assimétrico',
    description: 'Layout dinâmico e moderno',
    preview: (
      <div className="flex flex-col gap-1 p-2">
        <div className="flex gap-1">
          <div className="w-2/3 h-6 bg-primary/40 rounded" />
          <div className="w-1/3 h-6 bg-muted rounded" />
        </div>
        <div className="flex gap-1">
          <div className="w-1/3 h-4 bg-muted rounded" />
          <div className="w-2/3 h-4 bg-primary/20 rounded" />
        </div>
      </div>
    ),
  },
];

export const StepTypography: React.FC = () => {
  const { formData, updateFormData } = useWizard();

  return (
    <div className="space-y-8">
      {/* Heading Font */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Fonte de Títulos *
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {headingFonts.map((font, index) => {
            const isSelected = formData.headingFont === font.id;
            
            return (
              <motion.button
                key={font.id}
                type="button"
                onClick={() => updateFormData({ headingFont: font.id })}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-300",
                  "flex flex-col items-center gap-2",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span 
                  className={cn("text-3xl font-bold", font.style)}
                  style={{ fontFamily: font.id }}
                >
                  {font.sample}
                </span>
                <span className="text-xs font-medium">{font.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Body Font */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Fonte de Texto *
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {bodyFonts.map((font, index) => {
            const isSelected = formData.bodyFont === font.id;
            
            return (
              <motion.button
                key={font.id}
                type="button"
                onClick={() => updateFormData({ bodyFont: font.id })}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-300",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span 
                  className={cn("text-sm", font.style)}
                  style={{ fontFamily: font.id }}
                >
                  {font.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Typography Preview */}
      {formData.headingFont && formData.bodyFont && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-border bg-muted/30"
        >
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <h3 
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: formData.headingFont }}
          >
            Título de Exemplo
          </h3>
          <p 
            className="text-sm text-muted-foreground"
            style={{ fontFamily: formData.bodyFont }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </motion.div>
      )}

      {/* Layout Style */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Estilo de Layout *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {layoutStyles.map((layout, index) => {
            const isSelected = formData.layoutStyle === layout.id;
            
            return (
              <motion.button
                key={layout.id}
                type="button"
                onClick={() => updateFormData({ layoutStyle: layout.id })}
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
                <div className="h-20 bg-background">
                  {layout.preview}
                </div>
                
                {/* Info */}
                <div className="p-3 bg-muted/30">
                  <p className="text-sm font-medium">{layout.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {layout.description}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="layoutIndicator"
                    className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
