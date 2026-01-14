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
  Search
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useWizard } from '../WizardContext';
import { cn } from '@/lib/utils';

const featureCategories = [
  {
    title: 'Comunicação',
    features: [
      { id: 'whatsapp', label: 'Botão WhatsApp', icon: MessageCircle, popular: true },
      { id: 'contact-form', label: 'Formulário de Contato', icon: Mail, popular: true },
      { id: 'phone', label: 'Click to Call', icon: Phone },
      { id: 'chat', label: 'Chat Online', icon: MessageCircle },
    ],
  },
  {
    title: 'Agendamento',
    features: [
      { id: 'booking', label: 'Sistema de Agendamento', icon: Calendar, popular: true },
      { id: 'schedule', label: 'Horário de Funcionamento', icon: Clock },
      { id: 'availability', label: 'Calendário de Disponibilidade', icon: Calendar },
    ],
  },
  {
    title: 'E-commerce',
    features: [
      { id: 'products', label: 'Catálogo de Produtos', icon: ShoppingCart },
      { id: 'pricing', label: 'Tabela de Preços', icon: CreditCard, popular: true },
      { id: 'cart', label: 'Carrinho de Compras', icon: ShoppingCart },
    ],
  },
  {
    title: 'Social Proof',
    features: [
      { id: 'testimonials', label: 'Depoimentos', icon: Star, popular: true },
      { id: 'reviews', label: 'Avaliações', icon: Star },
      { id: 'clients', label: 'Clientes/Parceiros', icon: Users },
      { id: 'portfolio', label: 'Portfólio/Galeria', icon: Image, popular: true },
    ],
  },
  {
    title: 'Localização',
    features: [
      { id: 'map', label: 'Mapa Integrado', icon: MapPin, popular: true },
      { id: 'directions', label: 'Como Chegar', icon: MapPin },
      { id: 'branches', label: 'Múltiplas Unidades', icon: MapPin },
    ],
  },
  {
    title: 'Mídia',
    features: [
      { id: 'gallery', label: 'Galeria de Fotos', icon: Image },
      { id: 'video', label: 'Vídeo de Apresentação', icon: Video },
      { id: 'social', label: 'Redes Sociais', icon: Share2, popular: true },
    ],
  },
  {
    title: 'Recursos Extras',
    features: [
      { id: 'blog', label: 'Blog/Notícias', icon: FileText },
      { id: 'faq', label: 'FAQ/Perguntas Frequentes', icon: FileText, popular: true },
      { id: 'newsletter', label: 'Newsletter', icon: Bell },
      { id: 'search', label: 'Busca', icon: Search },
    ],
  },
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

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <span className="text-sm text-muted-foreground">
          Selecione pelo menos 2 funcionalidades
        </span>
        <span className={cn(
          "text-sm font-medium px-2 py-1 rounded-full",
          selectedCount >= 2 
            ? "bg-primary/10 text-primary" 
            : "bg-muted text-muted-foreground"
        )}>
          {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Feature Categories */}
      <div className="space-y-6">
        {featureCategories.map((category, catIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">
              {category.title}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {category.features.map((feature, index) => {
                const Icon = feature.icon;
                const isSelected = formData.features.includes(feature.id);
                
                return (
                  <motion.button
                    key={feature.id}
                    type="button"
                    onClick={() => toggleFeature(feature.id)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIndex * 0.1 + index * 0.02 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all duration-300",
                      "flex items-center gap-2",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-xs font-medium truncate">
                      {feature.label}
                    </span>
                    
                    {feature.popular && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                        ★
                      </span>
                    )}
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                      >
                        <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Features Summary */}
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-xl border border-primary/20 bg-primary/5"
        >
          <p className="text-sm font-medium text-primary mb-2">
            Funcionalidades selecionadas:
          </p>
          <div className="flex flex-wrap gap-2">
            {formData.features.map(featureId => {
              const feature = featureCategories
                .flatMap(c => c.features)
                .find(f => f.id === featureId);
              
              if (!feature) return null;
              
              return (
                <span
                  key={featureId}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
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
