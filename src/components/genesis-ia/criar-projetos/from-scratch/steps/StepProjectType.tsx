import { motion } from 'framer-motion';
import { Globe, Smartphone, Check } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';

const PROJECT_TYPES = [
  {
    id: 'app' as const,
    icon: Smartphone,
    title: 'Aplicativo Web',
    description: 'Sistema com login, dashboard e funcionalidades',
    features: ['CRUD', 'Auth', 'Dashboard', 'API']
  },
  {
    id: 'site' as const,
    icon: Globe,
    title: 'Site Comercial',
    description: 'Landing page focada em conversão e SEO',
    features: ['SEO', 'Responsivo', 'Conversão', 'Forms']
  }
];

export function StepProjectType() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="grid grid-cols-2 gap-3">
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
            className={`relative p-4 rounded-xl border text-left transition-all ${
              isSelected
                ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              isSelected ? 'bg-primary/20' : 'bg-white/10'
            }`}>
              <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <h3 className="text-sm font-semibold mb-1">{option.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {option.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {option.features.map((feature) => (
                <span
                  key={feature}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                    isSelected 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-white/10 text-muted-foreground'
                  }`}
                >
                  {feature}
                </span>
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
