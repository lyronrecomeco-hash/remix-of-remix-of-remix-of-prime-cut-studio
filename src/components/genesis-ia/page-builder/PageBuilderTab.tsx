import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  Code2, 
  Download, 
  RefreshCw, 
  Sparkles,
  Eye,
  FileCode,
  Copy,
  Check,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportToZip } from './PageBuilderExport';

interface PageBuilderTabProps {
  onBack?: () => void;
}

const promptSuggestions = [
  'Clone do Spotify',
  'Criar um painel administrativo',
  'Criar uma página de loja',
  'Criar um quadro kanban',
  'Landing page moderna',
];

type ViewState = 'input' | 'generating' | 'result';

export const PageBuilderTab = ({ onBack }: PageBuilderTabProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('input');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 5) {
      toast.error('Descreva melhor sua página');
      return;
    }

    setViewState('generating');
    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      const { data, error } = await supabase.functions.invoke('page-ai-builder', {
        body: { prompt, style: 'modern' }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar página');
      }

      setGeneratedCode(data.code);
      setViewState('result');
      toast.success('Página gerada com sucesso!');
    } catch (error) {
      console.error('Error generating page:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar página');
      setViewState('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleExport = async () => {
    if (!generatedCode) return;
    
    try {
      await exportToZip(generatedCode, prompt);
      toast.success('Projeto exportado! Extraia e rode: npm install && npm run dev');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Erro ao exportar projeto');
    }
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewPage = () => {
    setGeneratedCode(null);
    setPrompt('');
    setShowCode(false);
    setViewState('input');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    inputRef.current?.focus();
  };

  // Initial Input View - Like Lasy AI
  if (viewState === 'input') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Genesis Page Builder</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Dê vida às suas{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              ideias com IA
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg text-white/50 mb-8 max-w-md mx-auto"
          >
            Crie páginas completas e funcionais em minutos, apenas descrevendo o que deseja.
          </motion.p>

          {/* Input Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-[#0f1629] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Crie uma landing page para..."
              className="w-full bg-transparent text-white placeholder:text-white/30 resize-none text-base p-5 pb-16 focus:outline-none min-h-[140px]"
              rows={4}
            />
            
            {/* Send Button */}
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                size="icon"
                className="h-10 w-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl"
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <p className="text-sm text-white/40 mb-3">Sem ideias? Tente uma destas opções:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {promptSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white/80 transition-all rounded-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Generating View
  if (viewState === 'generating') {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            </div>
            <motion.div
              className="absolute -inset-4 rounded-[2rem] bg-purple-500/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-2">Gerando sua página...</h2>
          <p className="text-white/50 mb-6">A IA está criando código React + Tailwind</p>
          
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 max-w-md mx-auto">
            <p className="text-sm text-white/60 italic">"{prompt}"</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Result View - Split Layout
  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Left Panel - Controls */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[320px] flex-shrink-0 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={handleNewPage}
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">Página Gerada</h1>
            <p className="text-xs text-white/50">React + Tailwind + Framer Motion</p>
          </div>
        </div>

        {/* Info Card */}
        <div 
          className="bg-white/5 border border-white/10 p-4 mb-4"
          style={{ borderRadius: '14px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Sucesso!</span>
          </div>
          <p className="text-xs text-white/50 line-clamp-2">"{prompt}"</p>
        </div>

        {/* Actions */}
        <div 
          className="bg-white/5 border border-white/10 p-4 flex-1 flex flex-col gap-3"
          style={{ borderRadius: '14px' }}
        >
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="outline"
            className="w-full gap-2 border-white/10 hover:bg-white/5 text-white justify-start rounded-xl"
          >
            {showCode ? <Eye className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
            {showCode ? 'Ver Preview' : 'Ver Código'}
          </Button>
          
          <Button
            onClick={handleCopyCode}
            variant="outline"
            className="w-full gap-2 border-white/10 hover:bg-white/5 text-white justify-start rounded-xl"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Código'}
          </Button>

          <Button
            onClick={handleExport}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white justify-start rounded-xl"
          >
            <Download className="w-4 h-4" />
            Exportar Projeto (.zip)
          </Button>

          <div className="flex-1" />

          <Button
            onClick={handleNewPage}
            variant="ghost"
            className="w-full gap-2 text-white/60 hover:text-white hover:bg-white/5 justify-start rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Criar Nova Página
          </Button>
        </div>
      </motion.div>

      {/* Right Panel - Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-[400px] lg:min-h-0"
      >
        <div 
          className="h-full bg-white/5 border border-white/10 overflow-hidden flex flex-col"
          style={{ borderRadius: '14px' }}
        >
          {/* Browser Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-white/40 ml-2">
                {showCode ? 'Código TSX' : 'Preview'}
              </span>
            </div>
            <Button
              onClick={() => setShowCode(!showCode)}
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-white/60 hover:text-white gap-1"
            >
              {showCode ? <Eye className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
              {showCode ? 'Preview' : 'Código'}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {showCode ? (
              <pre className="p-4 text-xs text-white/80 font-mono whitespace-pre-wrap">
                {generatedCode}
              </pre>
            ) : (
              <iframe
                srcDoc={generateHtmlPreview(generatedCode || '')}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts"
                title="Page Preview"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Generate full HTML for iframe preview
function generateHtmlPreview(code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="importmap">
    {
      "imports": {
        "framer-motion": "https://esm.sh/framer-motion@10.16.4?bundle",
        "lucide-react": "https://esm.sh/lucide-react@0.292.0?bundle"
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    const { motion } = await import('framer-motion');
    const LucideIcons = await import('lucide-react');
    
    // Make icons available globally
    Object.keys(LucideIcons).forEach(key => {
      window[key] = LucideIcons[key];
    });
    window.motion = motion;
    
    ${code.replace(/import\s*{[^}]*}\s*from\s*['"]framer-motion['"];?/g, '')
         .replace(/import\s*{[^}]*}\s*from\s*['"]lucide-react['"];?/g, '')
         .replace(/import\s*{[^}]*}\s*from\s*['"]react['"];?/g, '')
         .replace(/export\s+default\s+/g, 'const PageComponent = ')}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(PageComponent || Page));
  </script>
</body>
</html>
  `.trim();
}
