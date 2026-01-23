import { motion } from 'framer-motion';
import { EVOLUTION_TYPES, EVOLUTION_CATEGORIES, EvolutionType } from './evolutionTypes';
import { cn } from '@/lib/utils';

interface EvolutionCardsProps {
  selectedType: EvolutionType | null;
  onSelect: (type: EvolutionType) => void;
}

export function EvolutionCards({ selectedType, onSelect }: EvolutionCardsProps) {
  // Group by category
  const groupedTypes = EVOLUTION_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, EvolutionType[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedTypes).map(([category, types]) => {
        const categoryInfo = EVOLUTION_CATEGORIES[category as keyof typeof EVOLUTION_CATEGORIES];
        
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full bg-gradient-to-r",
                categoryInfo.color
              )} />
              <h3 className="text-sm font-medium text-muted-foreground">
                {categoryInfo.label}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
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
                      "relative p-3 sm:p-4 rounded-xl border text-left transition-all duration-200",
                      "hover:scale-[1.02] hover:shadow-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border bg-card/50 hover:border-primary/30 hover:bg-card"
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selected-evolution"
                        className="absolute inset-0 rounded-xl border-2 border-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    
                    <div className="relative z-10">
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3",
                        "bg-gradient-to-br",
                        categoryInfo.color,
                        "text-white"
                      )}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-tight mb-1">
                        {type.title}
                      </h4>
                      
                      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight line-clamp-2">
                        {type.description}
                      </p>
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
