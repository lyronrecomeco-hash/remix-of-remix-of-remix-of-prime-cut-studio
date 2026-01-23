import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-foreground mb-1">
          Onde você vai usar o prompt?
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecione a IA para otimizar as instruções
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
        {AI_TARGETS.map((ai, index) => {
          const isSelected = formData.targetAI === ai.id;
          const iconSrc = AI_ICONS[ai.id];
          
          return (
            <motion.button
              key={ai.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateFormData('targetAI', ai.id)}
              className={`relative p-3 rounded-xl border-2 text-left transition-all hover:-translate-y-1 ${
                isSelected
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex justify-center mb-2">
                {iconSrc ? (
                  <img 
                    src={iconSrc} 
                    alt={ai.name} 
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {ai.icon}
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-foreground text-center text-sm">{ai.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 text-center line-clamp-2">
                {ai.description}
              </p>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
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
          className="max-w-sm mx-auto"
        >
          <label className="text-sm font-medium block mb-2">
            Nome da IA ou Ferramenta
          </label>
          <Input
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            placeholder="Ex: Gemini, Replit Agent, Cody..."
            className="bg-white/5 border-white/10"
          />
        </motion.div>
      )}

      {/* Info about selected AI */}
      {formData.targetAI && formData.targetAI !== 'other' && (
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 max-w-md mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            O prompt será otimizado para{' '}
            <span className="text-foreground font-medium">
              {AI_TARGETS.find(ai => ai.id === formData.targetAI)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}