import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { AI_TARGETS } from '../types';

export function StepTargetAI() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Onde você vai usar o prompt?
        </h3>
        <p className="text-muted-foreground">
          Selecione a IA ou ferramenta de destino para otimizar as instruções
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {AI_TARGETS.map((ai, index) => {
          const isSelected = formData.targetAI === ai.id;
          
          return (
            <motion.button
              key={ai.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => updateFormData('targetAI', ai.id)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-3xl mb-2">{ai.icon}</div>
              <h4 className="font-semibold text-foreground">{ai.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {ai.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
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
          className="max-w-md mx-auto"
        >
          <label className="text-sm font-medium block mb-2">
            Nome da IA ou Ferramenta
          </label>
          <Input
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            placeholder="Ex: Claude, Gemini, Windsurf..."
            className="bg-white/5 border-white/10"
          />
        </motion.div>
      )}

      {/* Info about selected AI */}
      {formData.targetAI && formData.targetAI !== 'other' && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground text-center">
            O prompt será otimizado com instruções específicas para{' '}
            <span className="text-foreground font-medium">
              {AI_TARGETS.find(ai => ai.id === formData.targetAI)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
