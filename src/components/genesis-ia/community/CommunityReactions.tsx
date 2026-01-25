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
    bgActive: 'bg-orange-500/20'
  },
  diamond: { 
    icon: Diamond, 
    label: '💎',
    color: 'text-cyan-400',
    activeColor: 'text-cyan-500',
    bgActive: 'bg-cyan-500/20'
  },
  energy: { 
    icon: Zap, 
    label: '⚡',
    color: 'text-yellow-400',
    activeColor: 'text-yellow-500',
    bgActive: 'bg-yellow-500/20'
  },
  target: { 
    icon: Target, 
    label: '🎯',
    color: 'text-red-400',
    activeColor: 'text-red-500',
    bgActive: 'bg-red-500/20'
  },
  rocket: { 
    icon: Rocket, 
    label: '🚀',
    color: 'text-purple-400',
    activeColor: 'text-purple-500',
    bgActive: 'bg-purple-500/20'
  }
};

export const CommunityReactions = ({ reactions, onReact }: CommunityReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
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
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
              border transition-all duration-200
              ${reaction.hasReacted 
                ? `${config.bgActive} border-${config.color.split('-')[1]}-500/30` 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
              }
            `}
          >
            <Icon className={`w-3 h-3 ${reaction.hasReacted ? config.activeColor : config.color}`} />
            <span className={`font-medium ${reaction.hasReacted ? config.activeColor : 'text-white/70'}`}>
              {reaction.count}
            </span>
          </motion.button>
        );
      })}

      {/* Add reaction button - minimal */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(!showPicker);
          }}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-white/50" />
        </motion.button>

        {/* Reaction picker - floating */}
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
                <div className="bg-[#16181c] border border-white/10 rounded-full px-2 py-1.5 shadow-2xl flex gap-0.5">
                  {Object.entries(REACTION_CONFIG).map(([type, config]) => {
                    const Icon = config.icon;
                    const reaction = reactions.find(r => r.type === type);
                    
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.3, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReact(type);
                          setShowPicker(false);
                        }}
                        className={`p-1.5 rounded-full transition-colors ${
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
