import { motion } from 'framer-motion';
import { Rocket, BarChart3, DollarSign, Target, LucideIcon } from 'lucide-react';

export interface Choice {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const defaultChoices: Choice[] = [
  {
    id: 'grow',
    icon: Rocket,
    title: 'Crescer com previsibilidade',
    description: 'Escalar sem surpresas, com métricas claras'
  },
  {
    id: 'organize',
    icon: BarChart3,
    title: 'Organizar o caos operacional',
    description: 'Processos fluidos, menos retrabalho'
  },
  {
    id: 'revenue',
    icon: DollarSign,
    title: 'Maximizar receita recorrente',
    description: 'Fidelização e aumento de ticket médio'
  },
  {
    id: 'scale',
    icon: Target,
    title: 'Escalar sem perder controle',
    description: 'Crescimento sustentável e organizado'
  }
];

interface GuidedChoicesProps {
  choices?: Choice[];
  onSelect: (choice: Choice) => void;
  selectedId?: string;
}

export const GuidedChoices = ({ 
  choices = defaultChoices, 
  onSelect,
  selectedId
}: GuidedChoicesProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
      {choices.map((choice, index) => {
        const isSelected = selectedId === choice.id;
        
        return (
          <motion.button
            key={choice.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(choice)}
            className={`
              group relative overflow-hidden p-6 rounded-2xl text-left
              transition-all duration-300 border-2
              ${isSelected 
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10'
              }
            `}
          >
            {/* Gradient background on hover/select */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              animate={isSelected ? { opacity: 1 } : {}}
            />
            
            {/* Icon */}
            <div className={`
              relative z-10 inline-flex p-3 rounded-xl mb-4 transition-colors
              ${isSelected 
                ? 'bg-primary text-white' 
                : 'bg-white/10 text-white/70 group-hover:bg-primary/20 group-hover:text-primary'
              }
            `}>
              <choice.icon className="w-6 h-6" />
            </div>
            
            {/* Content */}
            <div className="relative z-10">
              <h3 className={`font-semibold text-lg mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-white'}`}>
                {choice.title}
              </h3>
              <p className="text-sm text-white/60">
                {choice.description}
              </p>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
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
  );
};
