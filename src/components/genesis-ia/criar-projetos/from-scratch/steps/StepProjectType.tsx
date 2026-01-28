import { motion } from 'framer-motion';
import { Globe, Smartphone, Check, Database, Lock, LineChart, Palette, Search, MessageSquare, ShoppingCart } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';

const PROJECT_TYPES = [
  {
    id: 'app' as const,
    icon: Smartphone,
    title: 'Aplicativo Web',
    description: 'Sistema completo com backend, autenticação e dashboard de gestão',
    features: [
      { icon: Lock, label: 'Autenticação' },
      { icon: Database, label: 'Banco de Dados' },
      { icon: LineChart, label: 'Dashboard' },
      { icon: MessageSquare, label: 'Notificações' }
    ],
    examples: ['Sistema de Agendamento', 'CRM', 'Gestão de Estoque', 'ERP', 'Marketplace']
  },
  {
    id: 'site' as const,
    icon: Globe,
    title: 'Site Comercial',
    description: 'Landing page ou site institucional focado em conversão e SEO',
    features: [
      { icon: Search, label: 'SEO Otimizado' },
      { icon: Palette, label: 'Design Responsivo' },
      { icon: MessageSquare, label: 'Formulários' },
      { icon: ShoppingCart, label: 'Integração' }
    ],
    examples: ['Landing Page', 'Site Institucional', 'Portfólio', 'Blog', 'Cardápio Digital']
  }
];

export function StepProjectType() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {PROJECT_TYPES.map((option, index) => {
          const isSelected = formData.projectType === option.id;
          const Icon = option.icon;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateFormData('projectType', option.id)}
              className={`relative p-3 sm:p-5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-4 ${
                isSelected ? 'bg-primary/20' : 'bg-white/10'
              }`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              
              <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">{option.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
                {option.description}
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                {option.features.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div
                      key={feature.label}
                      className={`flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg ${
                        isSelected 
                          ? 'bg-primary/10' 
                          : 'bg-white/5'
                      }`}
                    >
                      <FeatureIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-[10px] sm:text-xs ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Examples */}
              <div className="pt-2 sm:pt-3 border-t border-white/10">
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">Exemplos:</p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {option.examples.slice(0, 3).map((example) => (
                    <span
                      key={example}
                      className={`px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] ${
                        isSelected 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-white/10 text-muted-foreground'
                      }`}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Box based on selection */}
      {formData.projectType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-xs sm:text-sm text-primary">
            {formData.projectType === 'app' 
              ? '📱 O formulário será otimizado para aplicativos com foco em funcionalidades, integrações e fluxos de usuário.'
              : '🌐 O formulário será otimizado para sites comerciais com foco em SEO, conversão e design visual.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
