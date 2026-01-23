import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useFromScratch } from '../FromScratchContext';
import { AI_TARGETS } from '../types';

// AI Logo components
const AILogos: Record<string, React.ReactNode> = {
  lovable: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#9333ea" />
      <path d="M12 6L6 12L12 18L18 12L12 6Z" fill="white" />
    </svg>
  ),
  cursor: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#000" />
      <path d="M8 6L8 18L12 14L16 18L16 6L8 6Z" fill="white" />
    </svg>
  ),
  v0: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#000" />
      <path d="M12 6L6 18H18L12 6Z" fill="white" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#3b82f6" />
      <path d="M13 6L8 13H11L10 18L16 11H13L13 6Z" fill="white" />
    </svg>
  ),
  windsurf: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#0ea5e9" />
      <path d="M6 16C8 12 12 8 18 8C12 10 10 14 6 16Z" fill="white" />
    </svg>
  ),
  chatgpt: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#10a37f" />
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill="white" />
    </svg>
  ),
  claude: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#d97706" />
      <circle cx="12" cy="12" r="5" fill="white" />
      <circle cx="12" cy="12" r="3" fill="#d97706" />
    </svg>
  ),
  'google-studio': (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#4285f4" />
      <path d="M7 12L12 7L17 12L12 17L7 12Z" fill="white" />
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
      <rect width="24" height="24" rx="6" fill="#6b7280" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12">✨</text>
    </svg>
  ),
};

export function StepTargetAI() {
  const { formData, updateFormData } = useFromScratch();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Onde você vai usar o prompt?
        </h3>
        <p className="text-muted-foreground">
          Selecione a IA ou ferramenta de destino para otimizar as instruções
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex justify-center mb-3">
                {AILogos[ai.id] || <div className="text-3xl">{ai.icon}</div>}
              </div>
              <h4 className="font-semibold text-foreground text-center text-sm">{ai.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 text-center line-clamp-2">
                {ai.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            placeholder="Ex: Gemini, Replit Agent, Cody..."
            className="bg-white/5 border-white/10"
          />
        </motion.div>
      )}

      {/* Info about selected AI */}
      {formData.targetAI && formData.targetAI !== 'other' && (
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-lg mx-auto">
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
