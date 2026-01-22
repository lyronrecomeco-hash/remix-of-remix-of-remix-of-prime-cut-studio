import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  Code2, 
  Download, 
  RefreshCw, 
  Sparkles,
  Palette,
  Eye,
  FileCode,
  Rocket,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PageBuilderPreview } from './PageBuilderPreview';
import { exportToZip } from './PageBuilderExport';

type PageStyle = 'modern' | 'minimal' | 'bold' | 'elegant';

interface PageBuilderTabProps {
  onBack?: () => void;
}

const styleOptions: { value: PageStyle; label: string; description: string; icon: string }[] = [
  { value: 'modern', label: 'Moderno', description: 'Gradientes vibrantes e animações', icon: '✨' },
  { value: 'minimal', label: 'Minimalista', description: 'Clean e espaçado', icon: '◻️' },
  { value: 'bold', label: 'Ousado', description: 'Cores fortes e impactantes', icon: '🔥' },
  { value: 'elegant', label: 'Elegante', description: 'Sofisticado e luxuoso', icon: '👑' },
];

const promptSuggestions = [
  'Landing page para SaaS de gestão financeira com hero, features e pricing',
  'Site de barbearia moderna com agendamento online e galeria de cortes',
  'Portfolio de fotógrafo com galeria minimalista e formulário de contato',
  'Landing page de app de delivery com features, depoimentos e download',
  'Site de academia com planos, horários e área de personal trainers',
];

export const PageBuilderTab = ({ onBack }: PageBuilderTabProps) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<PageStyle>('modern');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      toast.error('Descreva melhor sua página (mínimo 10 caracteres)');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      const { data, error } = await supabase.functions.invoke('page-ai-builder', {
        body: { prompt, style }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar página');
      }

      setGeneratedCode(data.code);
      toast.success('Página gerada com sucesso!');
    } catch (error) {
      console.error('Error generating page:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar página');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!generatedCode) return;
    
    try {
      await exportToZip(generatedCode, prompt);
      toast.success('Projeto exportado! Extraia e rode npm install && npm run dev');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Erro ao exportar projeto');
    }
  };

  const handleRegenerate = () => {
    setGeneratedCode(null);
    handleGenerate();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const selectedStyleOption = styleOptions.find(s => s.value === style);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
            <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Construir Página</h1>
            <p className="text-xs sm:text-sm text-white/50">Gere páginas React profissionais com IA</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Prompt Input */}
          <div 
            className="bg-white/5 border border-white/10 p-4 sm:p-5 space-y-4"
            style={{ borderRadius: '14px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Descreva sua página</span>
            </div>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Landing page para barbearia moderna com hero impactante, seção de serviços com preços, galeria de cortes e formulário de agendamento..."
              className="min-h-[120px] sm:min-h-[140px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none text-sm"
              style={{ borderRadius: '10px' }}
            />

            {/* Suggestions */}
            <div className="space-y-2">
              <span className="text-xs text-white/40">Sugestões:</span>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 transition-colors truncate max-w-[200px]"
                    style={{ borderRadius: '8px' }}
                  >
                    {suggestion.substring(0, 40)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Selector */}
          <div 
            className="bg-white/5 border border-white/10 p-4 sm:p-5"
            style={{ borderRadius: '14px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Estilo Visual</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-left"
                style={{ borderRadius: '10px' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{selectedStyleOption?.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{selectedStyleOption?.label}</div>
                    <div className="text-xs text-white/50">{selectedStyleOption?.description}</div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showStyleDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showStyleDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 overflow-hidden z-10"
                    style={{ borderRadius: '10px' }}
                  >
                    {styleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStyle(option.value);
                          setShowStyleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${
                          style === option.value ? 'bg-white/10' : ''
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{option.label}</div>
                          <div className="text-xs text-white/50">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold gap-2"
            style={{ borderRadius: '10px' }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Gerando página...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Gerar Página
              </>
            )}
          </Button>

          {/* Action Buttons when code is generated */}
          {generatedCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="flex-1 gap-2 border-white/10 hover:bg-white/5"
                style={{ borderRadius: '10px' }}
              >
                <RefreshCw className="w-4 h-4" />
                Regenerar
              </Button>
              <Button
                onClick={() => setShowCode(!showCode)}
                variant="outline"
                className="flex-1 gap-2 border-white/10 hover:bg-white/5"
                style={{ borderRadius: '10px' }}
              >
                {showCode ? <Eye className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
                {showCode ? 'Ver Preview' : 'Ver Código'}
              </Button>
              <Button
                onClick={handleExport}
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500"
                style={{ borderRadius: '10px' }}
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Right Panel - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
        >
          <div 
            className="h-full bg-white/5 border border-white/10 overflow-hidden"
            style={{ borderRadius: '14px' }}
          >
            {generatedCode ? (
              showCode ? (
                <div className="h-full overflow-auto">
                  <pre className="p-4 text-xs text-white/80 font-mono whitespace-pre-wrap">
                    {generatedCode}
                  </pre>
                </div>
              ) : (
                <PageBuilderPreview code={generatedCode} />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                  <Rocket className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sua página aparecerá aqui
                </h3>
                <p className="text-sm text-white/50 max-w-sm">
                  Descreva a página que deseja criar e clique em "Gerar Página" para ver o resultado em tempo real.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { icon: Code2, title: 'React Real', description: 'Código TSX profissional pronto para produção' },
          { icon: Palette, title: 'Tailwind CSS', description: 'Estilização moderna e responsiva' },
          { icon: Rocket, title: 'Pronto para Deploy', description: 'Exporte e hospede onde quiser' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 bg-white/5 border border-white/10"
            style={{ borderRadius: '12px' }}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">{item.title}</h4>
              <p className="text-xs text-white/50">{item.description}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
