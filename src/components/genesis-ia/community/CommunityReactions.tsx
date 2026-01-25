import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Diamond, Zap, Target, Rocket } from 'lucide-react';

interface Reaction {
  type: 'fire' | 'diamond' | 'energy' | 'target' | 'rocket';
  count: number;
  hasReacted: boolean;
}

interface CommunityReactionsProps {
  reactions: Reaction[];
  onReact: (type: string) => void;
}

const REACTION_CONFIG = {
  fire: { 
    icon: Flame, 
    label: 'Fire',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    hoverBg: 'hover:bg-orange-500/30'
  },
  diamond: { 
    icon: Diamond, 
    label: 'Diamond',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    hoverBg: 'hover:bg-cyan-500/30'
  },
  energy: { 
    icon: Zap, 
    label: 'Energy',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    hoverBg: 'hover:bg-yellow-500/30'
  },
  target: { 
    icon: Target, 
    label: 'Target',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    hoverBg: 'hover:bg-red-500/30'
  },
  rocket: { 
    icon: Rocket, 
    label: 'Rocket',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    hoverBg: 'hover:bg-purple-500/30'
  }
};

export const CommunityReactions = ({ reactions, onReact }: CommunityReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active reactions */}
      {activeReactions.map((reaction) => {
        const config = REACTION_CONFIG[reaction.type];
        const Icon = config.icon;
        
        return (
          <motion.button
            key={reaction.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReact(reaction.type)}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
              ${config.bgColor} ${config.hoverBg}
              ${reaction.hasReacted ? 'ring-1 ring-white/20' : ''}
              transition-all duration-200
            `}
          >
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={`text-xs font-medium ${config.color}`}>
              {reaction.count}
            </span>
          </motion.button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white/80"
        >
          <span className="text-sm">+</span>
          <span className="text-xs">Reagir</span>
        </motion.button>

        {/* Reaction picker */}
        <AnimatePresence>
          {showPicker && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowPicker(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full left-0 mb-2 z-50 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-xl"
              >
                <div className="flex gap-1">
                  {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.2, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          onReact(type);
                          setShowPicker(false);
                        }}
                        className={`p-2 rounded-lg ${config.hoverBg} transition-colors`}
                        title={config.label}
                      >
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityReactions;
