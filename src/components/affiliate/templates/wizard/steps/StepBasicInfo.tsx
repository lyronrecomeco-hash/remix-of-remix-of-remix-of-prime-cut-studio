import React from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  Utensils, 
  Briefcase, 
  Heart, 
  GraduationCap, 
  Home,
  Car,
  Scissors,
  Dumbbell,
  Camera,
  Building2,
  Stethoscope
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const projectTypes = [
  { id: 'loja', label: 'Loja', icon: Store },
  { id: 'restaurante', label: 'Restaurante', icon: Utensils },
  { id: 'servicos', label: 'Serviços', icon: Briefcase },
  { id: 'saude', label: 'Saúde', icon: Stethoscope },
  { id: 'educacao', label: 'Educação', icon: GraduationCap },
  { id: 'imobiliaria', label: 'Imobiliária', icon: Home },
  { id: 'automotivo', label: 'Automotivo', icon: Car },
  { id: 'beleza', label: 'Beleza', icon: Scissors },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'fotografia', label: 'Fotografia', icon: Camera },
  { id: 'corporativo', label: 'Corporativo', icon: Building2 },
  { id: 'clinica', label: 'Clínica', icon: Heart },
];

const languages = [
  { id: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { id: 'en-US', label: 'English', flag: '🇺🇸' },
  { id: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { id: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { id: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
];

export const StepBasicInfo: React.FC = () => {
  const { formData, updateFormData } = useWizard();

  return (
    <div className="space-y-6">
      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-sm font-semibold flex items-center gap-2">
          Nome do Negócio
          <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">obrigatório</span>
        </Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => updateFormData({ businessName: e.target.value })}
          placeholder="Ex: Barbearia Premium, Clínica Vida..."
          className="h-11"
        />
      </div>

      {/* Project Type */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Tipo de Projeto</Label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {projectTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = formData.projectType === type.id;
            
            return (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => updateFormData({ projectType: type.id })}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all duration-200",
                  "flex flex-col items-center gap-1.5",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {type.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Idioma do Site</Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {languages.map((lang, index) => {
            const isSelected = formData.language === lang.id;
            
            return (
              <motion.button
                key={lang.id}
                type="button"
                onClick={() => updateFormData({ language: lang.id })}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-2.5 rounded-lg border-2 transition-all duration-200",
                  "flex items-center justify-center gap-2",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {lang.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
