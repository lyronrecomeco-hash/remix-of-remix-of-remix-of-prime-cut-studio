import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Star, 
  Image,
  Phone,
  Mail,
  Clock,
  Users,
  ShoppingCart,
  FileText,
  Video,
  Share2,
  Bell,
  Search,
  Check
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const allFeatures = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, popular: true },
  { id: 'contact-form', label: 'Formulário', icon: Mail, popular: true },
  { id: 'booking', label: 'Agendamento', icon: Calendar, popular: true },
  { id: 'pricing', label: 'Preços', icon: CreditCard, popular: true },
  { id: 'testimonials', label: 'Depoimentos', icon: Star, popular: true },
  { id: 'map', label: 'Mapa', icon: MapPin, popular: true },
  { id: 'portfolio', label: 'Portfólio', icon: Image },
  { id: 'social', label: 'Redes Sociais', icon: Share2 },
  { id: 'faq', label: 'FAQ', icon: FileText },
  { id: 'phone', label: 'Click to Call', icon: Phone },
  { id: 'schedule', label: 'Horários', icon: Clock },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'products', label: 'Produtos', icon: ShoppingCart },
  { id: 'gallery', label: 'Galeria', icon: Image },
  { id: 'video', label: 'Vídeo', icon: Video },
  { id: 'newsletter', label: 'Newsletter', icon: Bell },
];

export const StepFeatures: React.FC = () => {
  const { formData, updateFormData } = useWizard();

  const toggleFeature = (featureId: string) => {
    const current = formData.features;
    const updated = current.includes(featureId)
      ? current.filter(f => f !== featureId)
      : [...current, featureId];
    updateFormData({ features: updated });
  };

  const selectedCount = formData.features.length;
  const popularFeatures = allFeatures.filter(f => f.popular);
  const otherFeatures = allFeatures.filter(f => !f.popular);

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
        <span className="text-xs text-muted-foreground">
          Mínimo: 2 funcionalidades
        </span>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-full",
          selectedCount >= 2 
            ? "bg-primary/10 text-primary" 
            : "bg-muted text-muted-foreground"
        )}>
          {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Popular Features */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          ⭐ Mais Populares
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {popularFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isSelected = formData.features.includes(feature.id);
            
            return (
              <motion.button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all duration-200",
                  "flex flex-col items-center gap-1.5",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[9px] font-medium text-center leading-tight",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {feature.label}
                </span>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Other Features */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">
          Outras Opções
        </Label>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {otherFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const isSelected = formData.features.includes(feature.id);
            
            return (
              <motion.button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative p-2 rounded-lg border transition-all duration-200",
                  "flex items-center gap-1.5",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <Icon className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-[10px] font-medium truncate",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {feature.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Features Summary */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-3 rounded-lg border border-primary/20 bg-primary/5"
        >
          <p className="text-xs font-semibold text-primary mb-2">
            Selecionadas ({selectedCount}):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {formData.features.map(featureId => {
              const feature = allFeatures.find(f => f.id === featureId);
              if (!feature) return null;
              
              return (
                <span
                  key={featureId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded-full font-medium"
                >
                  {feature.label}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
