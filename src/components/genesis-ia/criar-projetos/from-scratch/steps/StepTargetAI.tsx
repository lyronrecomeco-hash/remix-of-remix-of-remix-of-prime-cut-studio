import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check, Sparkles } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';

// Import AI icons
import lovableIcon from '@/assets/ai-icons/lovable.ico';
import cursorIcon from '@/assets/ai-icons/cursor.png';
import v0Icon from '@/assets/ai-icons/v0.svg';
import boltIcon from '@/assets/ai-icons/bolt.svg';
import windsurfIcon from '@/assets/ai-icons/windsurf.svg';

// Only site-generating AIs
const SITE_AI_TARGETS = [
  { 
    id: 'lovable', 
    name: 'Lovable', 
    description: 'IA para criar apps React completos', 
  },
  { 
    id: 'cursor', 
    name: 'Cursor', 
    description: 'IDE com IA integrada', 
  },
  { 
    id: 'v0', 
    name: 'v0 (Vercel)', 
    description: 'Gerador de UI com shadcn', 
  },
  { 
    id: 'bolt', 
    name: 'Bolt.new', 
    description: 'Ambiente IA full-stack', 
  },
  { 
    id: 'windsurf', 
    name: 'Windsurf', 
    description: 'IDE IA da Codeium', 
  },
];

const AI_ICONS: Record<string, string> = {
  'lovable': lovableIcon,
  'cursor': cursorIcon,
  'v0': v0Icon,
  'bolt': boltIcon,
  'windsurf': windsurfIcon,
};

export function StepTargetAI() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SITE_AI_TARGETS.map((ai, index) => {
          const isSelected = formData.targetAI === ai.id;
          const iconSrc = AI_ICONS[ai.id];
          
          return (
            <motion.button
              key={ai.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => updateFormData('targetAI', ai.id as any)}
              className={`relative p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {iconSrc ? (
                  <img src={iconSrc} alt={ai.name} className="w-12 h-12 rounded-xl object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-semibold">{ai.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ai.description}</p>
                </div>
              </div>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          );
        })}

        {/* Other Option */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: SITE_AI_TARGETS.length * 0.03 }}
          onClick={() => updateFormData('targetAI', 'other')}
          className={`relative p-4 rounded-xl border transition-all ${
            formData.targetAI === 'other'
              ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Outro</p>
              <p className="text-xs text-muted-foreground mt-0.5">Especificar</p>
            </div>
          </div>
          {formData.targetAI === 'other' && (
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
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
            💡 Prompt otimizado para <span className="text-primary font-medium">{SITE_AI_TARGETS.find(a => a.id === formData.targetAI)?.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
