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
  Camera
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const projectTypes = [
  { id: 'loja', label: 'Loja/E-commerce', icon: Store, color: 'from-blue-500 to-blue-600' },
  { id: 'restaurante', label: 'Restaurante/Food', icon: Utensils, color: 'from-orange-500 to-orange-600' },
  { id: 'servicos', label: 'Serviços Profissionais', icon: Briefcase, color: 'from-slate-500 to-slate-600' },
  { id: 'saude', label: 'Saúde/Wellness', icon: Heart, color: 'from-rose-500 to-rose-600' },
  { id: 'educacao', label: 'Educação/Cursos', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600' },
  { id: 'imobiliaria', label: 'Imobiliária', icon: Home, color: 'from-emerald-500 to-emerald-600' },
  { id: 'automotivo', label: 'Automotivo', icon: Car, color: 'from-zinc-500 to-zinc-600' },
  { id: 'beleza', label: 'Beleza/Estética', icon: Scissors, color: 'from-pink-500 to-pink-600' },
  { id: 'fitness', label: 'Fitness/Academia', icon: Dumbbell, color: 'from-green-500 to-green-600' },
  { id: 'fotografia', label: 'Fotografia/Arte', icon: Camera, color: 'from-purple-500 to-purple-600' },
];

const languages = [
  { id: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { id: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { id: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { id: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { id: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
];

export const StepBasicInfo: React.FC = () => {
  const { formData, updateFormData } = useWizard();

  return (
    <div className="space-y-8">
      {/* Business Name */}
      <div className="space-y-3">
        <Label htmlFor="businessName" className="text-base font-medium">
          Nome do Negócio *
        </Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => updateFormData({ businessName: e.target.value })}
          placeholder="Ex: Barbearia do João, Clínica Vida..."
          className="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          Este nome será usado em todo o template
        </p>
      </div>

      {/* Project Type */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Tipo de Projeto *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {projectTypes.map((type, index) => {
            const Icon = type.icon;
            const isSelected = formData.projectType === type.id;
            
            return (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => updateFormData({ projectType: type.id })}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300",
                  "flex flex-col items-center gap-2 text-center",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-3 rounded-lg bg-gradient-to-br",
                  type.color,
                  "text-white"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium leading-tight">
                  {type.label}
                </span>
                
                {isSelected && (
                  <motion.div
                    layoutId="projectTypeIndicator"
                    className="absolute inset-0 rounded-xl border-2 border-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Idioma Principal
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languages.map((lang, index) => {
            const isSelected = formData.language === lang.id;
            
            return (
              <motion.button
                key={lang.id}
                type="button"
                onClick={() => updateFormData({ language: lang.id })}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-300",
                  "flex items-center gap-3",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
