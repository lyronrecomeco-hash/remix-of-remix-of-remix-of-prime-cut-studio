import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { AI_TARGETS } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import AI icons
import lovableIcon from '@/assets/ai-icons/lovable.ico';
import cursorIcon from '@/assets/ai-icons/cursor.png';
import v0Icon from '@/assets/ai-icons/v0.svg';
import boltIcon from '@/assets/ai-icons/bolt.svg';
import windsurfIcon from '@/assets/ai-icons/windsurf.svg';
import chatgptIcon from '@/assets/ai-icons/chatgpt.webp';
import claudeIcon from '@/assets/ai-icons/claude.png';
import googleIcon from '@/assets/ai-icons/google-studio.png';

// AI Icons mapping
const AI_ICONS: Record<string, string> = {
  'lovable': lovableIcon,
  'cursor': cursorIcon,
  'v0': v0Icon,
  'bolt': boltIcon,
  'windsurf': windsurfIcon,
  'chatgpt': chatgptIcon,
  'claude': claudeIcon,
  'google-studio': googleIcon,
};

export function StepTargetAI() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <ScrollArea className="h-[320px] pr-2">
      <div className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {AI_TARGETS.map((ai, index) => {
            const isSelected = formData.targetAI === ai.id;
            const iconSrc = AI_ICONS[ai.id];
            
            return (
              <motion.button
                key={ai.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => updateFormData('targetAI', ai.id)}
                className={`relative p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-primary/10 border-primary ring-1 ring-primary/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {iconSrc ? (
                    <img 
                      src={iconSrc} 
                      alt={ai.name} 
                      className="w-8 h-8 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {ai.icon}
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-foreground text-center text-xs">{ai.name}</h4>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom AI Input */}
        {formData.targetAI === 'other' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <label className="text-xs font-medium block mb-2 text-muted-foreground">
              Nome da IA ou Ferramenta
            </label>
            <Input
              value={formData.otherAI || ''}
              onChange={(e) => updateFormData('otherAI', e.target.value)}
              placeholder="Ex: Gemini, Replit Agent, Cody..."
              className="bg-white/5 border-white/10 h-9"
              autoFocus
            />
          </motion.div>
        )}

        {/* Info about selected AI */}
        {formData.targetAI && formData.targetAI !== 'other' && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground text-center">
              Prompt otimizado para{' '}
              <span className="text-primary font-medium">
                {AI_TARGETS.find(ai => ai.id === formData.targetAI)?.name}
              </span>
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
