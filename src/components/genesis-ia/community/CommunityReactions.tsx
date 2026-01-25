import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

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
  fire: { emoji: '🔥', label: 'Fogo' },
  diamond: { emoji: '💎', label: 'Diamante' },
  energy: { emoji: '⚡', label: 'Energia' },
  target: { emoji: '🎯', label: 'Foco' },
  rocket: { emoji: '🚀', label: 'Foguete' }
};

export const CommunityReactions = ({ reactions, onReact }: CommunityReactionsProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const activeReactions = reactions.filter(r => r.count > 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Active reactions - compact pills */}
      {activeReactions.map((reaction) => {
        const config = REACTION_CONFIG[reaction.type];
        
        return (
          <motion.button
            key={reaction.type}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onReact(reaction.type);
            }}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              border transition-all duration-200
              ${reaction.hasReacted 
                ? 'bg-primary/20 border-primary/40 text-primary' 
                : 'bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50'
              }
            `}
          >
            <span className="text-sm">{config.emoji}</span>
            <span>{reaction.count}</span>
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
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/50 transition-colors"
        >
          <Plus className="w-4 h-4 text-muted-foreground" />
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
                <div className="bg-card border border-border rounded-xl px-2 py-2 shadow-2xl shadow-primary/10 flex gap-1">
                  {Object.entries(REACTION_CONFIG).map(([type, config]) => {
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
                          reaction?.hasReacted ? 'bg-primary/20' : 'hover:bg-muted/50'
                        }`}
                        title={config.label}
                      >
                        <span className="text-xl">{config.emoji}</span>
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
