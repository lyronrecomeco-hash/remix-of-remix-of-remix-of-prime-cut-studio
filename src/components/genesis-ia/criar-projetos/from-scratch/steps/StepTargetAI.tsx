import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check, Sparkles } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { AI_TARGETS } from '../types';

// Import AI icons
import lovableIcon from '@/assets/ai-icons/lovable.ico';
import cursorIcon from '@/assets/ai-icons/cursor.png';
import v0Icon from '@/assets/ai-icons/v0.svg';
import boltIcon from '@/assets/ai-icons/bolt.svg';
import windsurfIcon from '@/assets/ai-icons/windsurf.svg';
import chatgptIcon from '@/assets/ai-icons/chatgpt.webp';
import claudeIcon from '@/assets/ai-icons/claude.png';
import googleIcon from '@/assets/ai-icons/google-studio.png';

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
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {AI_TARGETS.map((ai, index) => {
          const isSelected = formData.targetAI === ai.id;
          const iconSrc = AI_ICONS[ai.id];
          
          return (
            <motion.button
              key={ai.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => updateFormData('targetAI', ai.id)}
              className={`relative p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {iconSrc ? (
                  <img src={iconSrc} alt={ai.name} className="w-10 h-10 rounded-lg object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                    {ai.icon}
                  </div>
                )}
                <span className="text-sm font-medium text-center">{ai.name}</span>
              </div>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          );
        })}

        {/* Other Option */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: AI_TARGETS.length * 0.02 }}
          onClick={() => updateFormData('targetAI', 'other')}
          className={`relative p-4 rounded-xl border transition-all ${
            formData.targetAI === 'other'
              ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-10 h-10 text-muted-foreground" />
            <span className="text-sm font-medium">Outro</span>
          </div>
          {formData.targetAI === 'other' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Custom AI Input */}
      {formData.targetAI === 'other' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-sm text-muted-foreground">Especifique a ferramenta</label>
          <Input
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            placeholder="Ex: Replit Agent, GitHub Copilot..."
            className="bg-white/5 border-white/10 h-10 text-sm"
          />
        </motion.div>
      )}

      {/* Info */}
      {formData.targetAI && formData.targetAI !== 'other' && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-muted-foreground text-center">
            💡 Prompt otimizado para <span className="text-primary font-medium">{AI_TARGETS.find(a => a.id === formData.targetAI)?.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
