import { motion } from 'framer-motion';
import { Monitor, Smartphone } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';

export function StepProjectType() {
  const { formData, updateFormData } = useFromScratch();

  const options = [
    {
      id: 'app' as const,
      icon: Monitor,
      title: 'Aplicativo Web',
      description: 'Com painel administrativo, autenticação, banco de dados e CRUD completo',
      features: ['Dashboard admin', 'Login/Cadastro', 'Banco de dados', 'Gestão de dados'],
    },
    {
      id: 'site' as const,
      icon: Smartphone,
      title: 'Site Comercial',
      description: 'Landing page ou site institucional focado em conversão e SEO',
      features: ['SEO otimizado', 'Formulários', 'Alta conversão', 'Performance'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Que tipo de projeto você deseja criar?
        </h3>
        <p className="text-muted-foreground">
          Isso define a estrutura e funcionalidades base do seu projeto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {options.map((option, index) => {
          const Icon = option.icon;
          const isSelected = formData.projectType === option.id;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => updateFormData('projectType', option.id)}
              className={`relative p-6 rounded-xl border text-left transition-all duration-300 ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isSelected ? 'bg-blue-500/20' : 'bg-white/10'
              }`}>
                <Icon className={`w-7 h-7 ${isSelected ? 'text-blue-400' : 'text-muted-foreground'}`} />
              </div>
              
              <h4 className="text-lg font-semibold text-foreground mb-2">{option.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {option.features.map((feature) => (
                  <span
                    key={feature}
                    className={`text-xs px-2 py-1 rounded-full ${
                      isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-muted-foreground'
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {isSelected && (
                <motion.div
                  layoutId="projectTypeSelected"
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
