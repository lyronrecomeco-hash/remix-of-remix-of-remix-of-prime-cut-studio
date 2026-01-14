import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const headingFonts = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Poppins', label: 'Poppins' },
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Playfair Display', label: 'Playfair' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'Oswald', label: 'Oswald' },
];

const bodyFonts = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Open Sans', label: 'Open Sans' },
  { id: 'Lato', label: 'Lato' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'Source Sans Pro', label: 'Source Sans' },
  { id: 'Nunito', label: 'Nunito' },
];

const layoutStyles = [
  {
    id: 'single-page',
    label: 'Single Page',
    description: 'Uma página fluida',
    preview: (
      <div className="flex flex-col items-center gap-0.5 p-1.5">
        <div className="w-8 h-1.5 bg-primary/60 rounded" />
        <div className="w-6 h-1 bg-muted-foreground/30 rounded" />
        <div className="w-7 h-2 bg-primary/40 rounded mt-0.5" />
      </div>
    ),
  },
  {
    id: 'multi-section',
    label: 'Multi-seções',
    description: 'Navegação por seções',
    preview: (
      <div className="flex gap-1 p-1.5">
        <div className="flex-1 flex flex-col gap-0.5">
          <div className="w-full h-1.5 bg-primary/60 rounded" />
          <div className="w-3/4 h-1 bg-muted-foreground/30 rounded" />
        </div>
        <div className="w-5 h-6 bg-muted rounded" />
      </div>
    ),
  },
  {
    id: 'card-based',
    label: 'Cards',
    description: 'Layout em grid',
    preview: (
      <div className="grid grid-cols-3 gap-0.5 p-1.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded" />
        ))}
      </div>
    ),
  },
  {
    id: 'magazine',
    label: 'Magazine',
    description: 'Estilo editorial',
    preview: (
      <div className="flex flex-col gap-0.5 p-1.5">
        <div className="flex gap-0.5">
          <div className="w-2/3 h-4 bg-primary/40 rounded" />
          <div className="w-1/3 h-4 bg-muted rounded" />
        </div>
        <div className="flex gap-0.5">
          <div className="w-1/3 h-3 bg-muted rounded" />
          <div className="w-2/3 h-3 bg-primary/20 rounded" />
        </div>
      </div>
    ),
  },
];

export const StepTypography: React.FC = () => {
  const { formData, updateFormData } = useWizard();

  return (
    <div className="space-y-6">
      {/* Heading Font */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Fonte de Títulos</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {headingFonts.map((font, index) => {
            const isSelected = formData.headingFont === font.id;
            
            return (
              <motion.button
                key={font.id}
                type="button"
                onClick={() => updateFormData({ headingFont: font.id })}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-200",
                  "flex flex-col items-center gap-1",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span 
                  className="text-xl font-bold"
                  style={{ fontFamily: font.id }}
                >
                  Aa
                </span>
                <span className="text-[9px] font-medium text-muted-foreground">{font.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Body Font */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Fonte de Texto</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {bodyFonts.map((font, index) => {
            const isSelected = formData.bodyFont === font.id;
            
            return (
              <motion.button
                key={font.id}
                type="button"
                onClick={() => updateFormData({ bodyFont: font.id })}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-2.5 rounded-lg border-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span 
                  className="text-xs"
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
          className="p-3 rounded-lg border border-border bg-muted/20"
        >
          <p className="text-[10px] text-muted-foreground mb-2">Preview:</p>
          <h3 
            className="text-lg font-bold mb-1"
            style={{ fontFamily: formData.headingFont }}
          >
            Título de Exemplo
          </h3>
          <p 
            className="text-xs text-muted-foreground"
            style={{ fontFamily: formData.bodyFont }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </motion.div>
      )}

      {/* Layout Style */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Estilo de Layout</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {layoutStyles.map((layout, index) => {
            const isSelected = formData.layoutStyle === layout.id;
            
            return (
              <motion.button
                key={layout.id}
                type="button"
                onClick={() => updateFormData({ layoutStyle: layout.id })}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative rounded-lg border-2 overflow-hidden transition-all duration-200",
                  isSelected
                    ? "border-primary shadow-sm shadow-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                {/* Preview */}
                <div className="h-12 bg-background">
                  {layout.preview}
                </div>
                
                {/* Info */}
                <div className="p-1.5 bg-muted/30 border-t border-border">
                  <p className="text-[9px] font-medium text-center">{layout.label}</p>
                </div>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
