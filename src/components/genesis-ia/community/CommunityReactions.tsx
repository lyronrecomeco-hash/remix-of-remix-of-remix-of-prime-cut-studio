import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Diamond, Zap, Target, Rocket, Plus } from 'lucide-react';

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
    label: '🔥',
    color: 'text-orange-400',
    activeColor: 'text-orange-500',
    bgActive: 'bg-orange-500/20',
    borderActive: 'border-orange-500/30'
  },
  diamond: { 
    icon: Diamond, 
    label: '💎',
    color: 'text-cyan-400',
    activeColor: 'text-cyan-500',
    bgActive: 'bg-cyan-500/20',
    borderActive: 'border-cyan-500/30'
  },
  energy: { 
    icon: Zap, 
    label: '⚡',
    color: 'text-yellow-400',
    activeColor: 'text-yellow-500',
    bgActive: 'bg-yellow-500/20',
    borderActive: 'border-yellow-500/30'
  },
  target: { 
    icon: Target, 
    label: '🎯',
    color: 'text-red-400',
    activeColor: 'text-red-500',
    bgActive: 'bg-red-500/20',
    borderActive: 'border-red-500/30'
  },
  rocket: { 
    icon: Rocket, 
    label: '🚀',
    color: 'text-purple-400',
    activeColor: 'text-purple-500',
    bgActive: 'bg-purple-500/20',
    borderActive: 'border-purple-500/30'
  }
};

export const CommunityReactions = ({ reactions, onReact }: CommunityReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active reactions - compact pills */}
      {activeReactions.map((reaction) => {
        const config = REACTION_CONFIG[reaction.type];
        const Icon = config.icon;
        
        return (
          <motion.button
            key={reaction.type}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onReact(reaction.type);
            }}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs
              border transition-all duration-200
              ${reaction.hasReacted 
                ? `${config.bgActive} ${config.borderActive}` 
                : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20'
              }
            `}
          >
            <Icon className={`w-3.5 h-3.5 ${reaction.hasReacted ? config.activeColor : config.color}`} />
            <span className={`font-medium ${reaction.hasReacted ? config.activeColor : 'text-white/70'}`}>
              {reaction.count}
            </span>
          </motion.button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(!showPicker);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4 text-blue-400/60" />
        </motion.button>

        {/* Reaction picker */}
        <AnimatePresence>
          {showPicker && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPicker(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
              >
                <div className="bg-[hsl(220,30%,12%)] border border-blue-500/30 rounded-xl px-2 py-2 shadow-2xl shadow-blue-500/10 flex gap-1">
                  {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                    const Icon = config.icon;
                    const reaction = reactions.find(r => r.type === type);
                    
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReact(type);
                          setShowPicker(false);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          reaction?.hasReacted ? config.bgActive : 'hover:bg-white/10'
                        }`}
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
