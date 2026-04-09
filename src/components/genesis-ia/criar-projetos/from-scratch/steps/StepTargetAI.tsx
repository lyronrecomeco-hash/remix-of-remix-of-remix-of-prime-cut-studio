import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check, Sparkles, Info, X, Monitor, Code2 } from 'lucide-react';
import { useFromScratch } from '../FromScratchContext';
import { CodeStyle } from '../types';

// Import AI icons
import lovableIcon from '@/assets/ai-icons/lovable.ico';
import cursorIcon from '@/assets/ai-icons/cursor.png';
import v0Icon from '@/assets/ai-icons/v0.svg';
import boltIcon from '@/assets/ai-icons/bolt.svg';
import windsurfIcon from '@/assets/ai-icons/windsurf.svg';
import traeIcon from '@/assets/ai-icons/trae.png';
import replitIcon from '@/assets/ai-icons/replit.png';
import antigravityIcon from '@/assets/ai-icons/antigravity.png';
import chatgptIcon from '@/assets/ai-icons/chatgpt.webp';
import claudeIcon from '@/assets/ai-icons/claude.png';
import googleStudioIcon from '@/assets/ai-icons/google-studio.png';

const SITE_AI_TARGETS = [
  // IDEs
  { id: 'lovable', name: 'Lovable', description: 'Apps React com 1 clique', category: 'builder' },
  { id: 'antigravity', name: 'Antigravity', description: 'IDE agêntica do Google', category: 'ide' },
  { id: 'cursor', name: 'Cursor', description: 'IDE com IA integrada', category: 'ide' },
  { id: 'windsurf', name: 'Windsurf', description: 'IDE IA da Codeium', category: 'ide' },
  { id: 'trae', name: 'Trae', description: 'IDE IA da ByteDance', category: 'ide' },
  // Builders
  { id: 'v0', name: 'v0 (Vercel)', description: 'Gerador de UI shadcn', category: 'builder' },
  { id: 'bolt', name: 'Bolt.new', description: 'Full-stack no browser', category: 'builder' },
  { id: 'replit', name: 'Replit', description: 'IDE online + deploy', category: 'builder' },
  // Chat
  { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI GPT', category: 'chat' },
  { id: 'claude', name: 'Claude', description: 'Anthropic Claude', category: 'chat' },
  { id: 'google-studio', name: 'AI Studio', description: 'Google Gemini', category: 'chat' },
];

const AI_ICONS: Record<string, string> = {
  'lovable': lovableIcon,
  'cursor': cursorIcon,
  'v0': v0Icon,
  'bolt': boltIcon,
  'windsurf': windsurfIcon,
  'trae': traeIcon,
  'replit': replitIcon,
  'antigravity': antigravityIcon,
  'chatgpt': chatgptIcon,
  'claude': claudeIcon,
  'google-studio': googleStudioIcon,
};

const CODE_STYLES: { id: CodeStyle; name: string; description: string; icon: React.ReactNode; tags: string[] }[] = [
  {
    id: 'modern',
    name: 'Código Moderno',
    description: 'React, TypeScript, Tailwind, Vite',
    icon: <Monitor className="w-5 h-5" />,
    tags: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'traditional',
    name: 'Código Tradicional',
    description: 'PHP, HTML, CSS, JavaScript',
    icon: <Code2 className="w-5 h-5" />,
    tags: ['PHP', 'HTML', 'JS'],
  },
];

export function StepTargetAI() {
  const { formData, updateFormData } = useFromScratch();
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <div className="space-y-4">
      {/* Code Style Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Tipo de Código</p>
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Info className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {CODE_STYLES.map((style) => {
            const isSelected = formData.codeStyle === style.id;
            return (
              <motion.button
                key={style.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFormData('codeStyle', style.id)}
                className={`relative p-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                    {style.icon}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold">{style.name}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{style.description}</p>
                <div className="flex gap-1 mt-1.5">
                  {style.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">{tag}</span>
                  ))}
                </div>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* AI Target Grid */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">IA de Destino</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SITE_AI_TARGETS.map((ai, index) => {
            const isSelected = formData.targetAI === ai.id;
            const iconSrc = AI_ICONS[ai.id];
            
            return (
              <motion.button
                key={ai.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => updateFormData('targetAI', ai.id as any)}
                className={`relative p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  {iconSrc ? (
                    <img src={iconSrc} alt={ai.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain" loading="lazy" />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-semibold leading-tight">{ai.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{ai.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}

          {/* Other Option */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SITE_AI_TARGETS.length * 0.02 }}
            onClick={() => updateFormData('targetAI', 'other')}
            className={`relative p-2.5 sm:p-3 rounded-xl border transition-all ${
              formData.targetAI === 'other'
                ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs font-semibold">Outro</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Especificar</p>
              </div>
            </div>
            {formData.targetAI === 'other' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
              </div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Custom AI Input */}
      {formData.targetAI === 'other' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5"
        >
          <label className="text-xs text-muted-foreground">Especifique a ferramenta</label>
          <Input
            value={formData.otherAI || ''}
            onChange={(e) => updateFormData('otherAI', e.target.value)}
            placeholder="Ex: GitHub Copilot, Cody..."
            className="bg-white/5 border-white/10 h-8 sm:h-10 text-xs sm:text-sm"
          />
        </motion.div>
      )}

      {/* Info */}
      {formData.targetAI && formData.targetAI !== 'other' && (
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
            💡 Prompt otimizado para <span className="text-primary font-medium">{SITE_AI_TARGETS.find(a => a.id === formData.targetAI)?.name}</span>
            {' '}com código <span className="text-primary font-medium">{formData.codeStyle === 'modern' ? 'moderno' : 'tradicional'}</span>
          </p>
        </div>
      )}

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold">🆚 Código Moderno vs Tradicional</h3>
                <button onClick={() => setShowInfoModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-primary" />
                    <p className="text-xs sm:text-sm font-semibold text-primary">Código Moderno</p>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                    <strong>Stack:</strong> React, TypeScript, Tailwind CSS, Vite, Shadcn/UI
                  </p>
                  <ul className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 space-y-0.5">
                    <li>✅ Interface reativa e dinâmica (SPA)</li>
                    <li>✅ Componentização e reutilização de código</li>
                    <li>✅ Tipagem forte com TypeScript</li>
                    <li>✅ Ideal para apps complexos e dashboards</li>
                    <li>✅ Ecossistema rico de bibliotecas</li>
                    <li>⚠️ Requer conhecimento de React para editar</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <p className="text-xs sm:text-sm font-semibold text-amber-400">Código Tradicional</p>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                    <strong>Stack:</strong> PHP 8+, HTML5, CSS3, JavaScript, MySQL
                  </p>
                  <ul className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 space-y-0.5">
                    <li>✅ Fácil de hospedar (qualquer hosting PHP)</li>
                    <li>✅ SEO nativo excelente (páginas server-side)</li>
                    <li>✅ Menor curva de aprendizado para editar</li>
                    <li>✅ Ideal para sites institucionais e landing pages</li>
                    <li>✅ Compatível com WordPress e CMS</li>
                    <li>⚠️ Menos dinâmico que frameworks modernos</li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center">
                    💡 <strong>Dica:</strong> Para IDEs como Cursor, Antigravity e Trae, ambos os estilos funcionam. Para Lovable e v0, apenas código moderno é suportado.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
