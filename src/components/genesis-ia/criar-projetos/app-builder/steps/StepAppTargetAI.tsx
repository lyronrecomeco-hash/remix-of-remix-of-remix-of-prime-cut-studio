import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useAppBuilder } from '../AppBuilderContext';
import { AI_TARGETS } from '../types';
import { Input } from '@/components/ui/input';

// AI emoji icons as fallback (no external SVG files needed)
const AI_EMOJI: Record<string, string> = {
  lovable: '💜',
  cursor: '🖱️',
  v0: '⚡',
  bolt: '🔩',
  windsurf: '🏄',
};

export function StepAppTargetAI() {
  const { formData, updateFormData } = useAppBuilder();

  // Filter to show only site-generating AIs
  const siteAIs = AI_TARGETS.filter(ai => 
    ['lovable', 'cursor', 'v0', 'bolt', 'windsurf', 'other'].includes(ai.id)
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Escolha a IA para gerar seu App
        </h3>
        <p className="text-sm text-muted-foreground">
          O prompt será otimizado para a plataforma escolhida
        </p>
      </div>

      {/* AI Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {siteAIs.map((ai, index) => {
          const isSelected = formData.targetAI === ai.id;
          const customEmoji = AI_EMOJI[ai.id];

          return (
            <motion.button
              key={ai.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateFormData('targetAI', ai.id)}
              className={`
                relative p-4 rounded-xl border transition-all text-left
                ${isSelected 
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              {/* Icon or Emoji */}
              <div className="mb-3">
                <span className="text-3xl">{customEmoji || ai.icon}</span>
              </div>

              {/* Name */}
              <h4 className="text-sm font-semibold text-white mb-1">{ai.name}</h4>

              {/* Description */}
              <p className="text-[10px] text-muted-foreground line-clamp-2">{ai.description}</p>

              {/* Lovable badge */}
              {ai.id === 'lovable' && (
                <div className="mt-2 px-2 py-1 rounded-full bg-primary/20 text-[10px] text-primary font-medium inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Deploy automático
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom AI Input */}
      {formData.targetAI === 'other' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <Input
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            placeholder="Nome da IA (ex: Replit, GitHub Copilot...)"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </motion.div>
      )}

      {/* Lovable benefit highlight */}
      {formData.targetAI === 'lovable' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-primary/10 border border-primary/30"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Benefícios do Lovable
              </h4>
              <ul className="text-xs text-white/70 space-y-1">
                <li>• 5 créditos diários grátis</li>
                <li>• Deploy automático na nuvem</li>
                <li>• Backend Supabase integrado</li>
                <li>• Prompt otimizado para stack React/Tailwind</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
