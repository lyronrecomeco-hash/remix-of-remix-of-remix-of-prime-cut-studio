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
    <div className="space-y-8">
      {CATEGORY_GROUPS.map((group) => {
        const types = group.types
          .map((id) => EVOLUTION_TYPES.find((t) => t.id === id))
          .filter(Boolean) as EvolutionType[];

        if (types.length === 0) return null;

        return (
          <div key={group.id} className="space-y-4">
            {/* Category Label */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {group.label}
              </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {types.map((type, index) => {
                const Icon = type.icon;
                const isSelected = selectedType?.id === type.id;

                return (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onSelect(type)}
                    className={cn(
                      'relative p-5 rounded-xl border text-center transition-all duration-200',
                      'hover:scale-[1.02] hover:bg-white/10',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                      'min-h-[130px] flex flex-col items-center justify-center gap-3',
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                        : 'border-white/10 bg-white/5 hover:border-blue-500/30'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selected-evolution"
                        className="absolute inset-0 rounded-xl border-2 border-blue-500"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center mb-2',
                          isSelected ? 'bg-blue-500/20' : 'bg-white/10'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-6 h-6',
                            isSelected ? 'text-blue-400' : 'text-muted-foreground'
                          )}
                        />
                      </div>

                      <h4
                        className={cn(
                          'text-sm font-semibold leading-tight uppercase tracking-wide',
                          isSelected ? 'text-blue-300' : 'text-foreground'
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
