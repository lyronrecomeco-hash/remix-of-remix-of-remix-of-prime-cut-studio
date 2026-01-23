import { motion } from 'framer-motion';
import { EVOLUTION_TYPES, EvolutionType } from './evolutionTypes';
import { cn } from '@/lib/utils';

interface EvolutionCardsProps {
  selectedType: EvolutionType | null;
  onSelect: (type: EvolutionType) => void;
}

// Group types by category for display
const CATEGORY_GROUPS = [
  {
    id: 'build',
    label: 'O QUE VAMOS CONSTRUIR OU ARRUMAR?',
    types: ['add-function', 'fix-bug', 'visual-ui'],
  },
  {
    id: 'technical',
    label: 'AJUSTES TÉCNICOS E INTEGRAÇÕES',
    types: ['adjust-function', 'integrate-tool', 'improve-ai', 'refactor-code', 'add-image'],
  },
  {
    id: 'finalization',
    label: 'FINALIZAÇÃO',
    types: ['optimization', 'make-pwa'],
  },
];

export function EvolutionCards({ selectedType, onSelect }: EvolutionCardsProps) {
  return (
    <div className="space-y-5">
      {CATEGORY_GROUPS.map((group) => {
        const types = group.types
          .map((id) => EVOLUTION_TYPES.find((t) => t.id === id))
          .filter(Boolean) as EvolutionType[];

        if (types.length === 0) return null;

        return (
          <div key={group.id} className="space-y-2">
            {/* Category Label */}
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {group.label}
            </span>

            {/* Cards Grid - Primary Colors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {types.map((type, index) => {
                const Icon = type.icon;
                const isSelected = selectedType?.id === type.id;

                return (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onSelect(type)}
                    className={cn(
                      'relative p-3 rounded-lg border text-center transition-all duration-200',
                      'hover:scale-[1.01] hover:bg-white/10',
                      'focus:outline-none focus:ring-2 focus:ring-primary/50',
                      'min-h-[90px] flex flex-col items-center justify-center gap-2',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                        : 'border-white/10 bg-white/5 hover:border-primary/30'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selected-evolution"
                        className="absolute inset-0 rounded-lg border-2 border-primary"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center mb-1',
                          isSelected ? 'bg-primary/20' : 'bg-white/10'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      </div>

                      <h4
                        className={cn(
                          'text-[10px] font-semibold leading-tight uppercase tracking-wide',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {type.title}
                      </h4>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
