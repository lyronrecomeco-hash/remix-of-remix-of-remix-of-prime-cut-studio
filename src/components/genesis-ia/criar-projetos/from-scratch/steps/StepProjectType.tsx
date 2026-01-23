import { motion } from 'framer-motion';
import { Monitor, Smartphone, Check } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';

export function StepProjectType() {
  const { formData, updateFormData } = useFromScratch();

  const options = [
    {
      id: 'app' as const,
      icon: Monitor,
      title: 'Aplicativo Web',
      description: 'Painel admin, autenticação e banco de dados',
      features: ['Dashboard', 'Login', 'CRUD', 'BD'],
    },
    {
      id: 'site' as const,
      icon: Smartphone,
      title: 'Site Comercial',
      description: 'Landing page focada em conversão e SEO',
      features: ['SEO', 'Forms', 'Conversão', 'Speed'],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      {options.map((option, index) => {
        const Icon = option.icon;
        const isSelected = formData.projectType === option.id;
        
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => updateFormData('projectType', option.id)}
            className={`relative p-5 rounded-xl border text-left transition-all ${
              isSelected
                ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/10'
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
              isSelected ? 'bg-primary/20' : 'bg-white/10'
            }`}>
              <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <h4 className="text-base font-semibold text-foreground mb-1">{option.title}</h4>
            <p className="text-xs text-muted-foreground mb-3">{option.description}</p>
            
            <div className="flex flex-wrap gap-1.5">
              {option.features.map((feature) => (
                <span
                  key={feature}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'
                  }`}
                >
                  {feature}
                </span>
              ))}
            </div>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
