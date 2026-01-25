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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className={`relative p-5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                isSelected ? 'bg-primary/20' : 'bg-white/10'
              }`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              
              <h3 className="text-base font-semibold mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {option.description}
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {option.features.map((feature) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div
                      key={feature.label}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                        isSelected 
                          ? 'bg-primary/10' 
                          : 'bg-white/5'
                      }`}
                    >
                      <FeatureIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Examples */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Exemplos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.examples.slice(0, 4).map((example) => (
                    <span
                      key={example}
                      className={`px-2 py-0.5 rounded text-[10px] ${
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
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-sm text-primary">
            {formData.projectType === 'app' 
              ? '📱 O formulário será otimizado para aplicativos com foco em funcionalidades, integrações e fluxos de usuário.'
              : '🌐 O formulário será otimizado para sites comerciais com foco em SEO, conversão e design visual.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
