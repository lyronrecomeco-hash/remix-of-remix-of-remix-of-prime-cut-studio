import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUp, 
  Code2, 
  Download, 
  RefreshCw, 
  Sparkles,
  Eye,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ExternalLink
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
  'Painel administrativo',
  'Página de loja',
  'Quadro kanban',
  'Landing SaaS',
];

type ViewState = 'input' | 'generating' | 'result';

export const PageBuilderTab = ({ onBack }: PageBuilderTabProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('input');
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const openInNewTab = () => {
    if (!generatedCode) return;
    const html = generateHtmlPreview(generatedCode);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Initial Input View - Clean and Professional
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
            Crie páginas completas em minutos, apenas descrevendo o que deseja.
          </motion.p>

          {/* Input Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
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
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950' : ''}`}>
      {/* Top Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-white/10"
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={handleNewPage}
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="h-4 w-px bg-white/20" />
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Página Gerada</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle View */}
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="ghost"
            size="sm"
            className={`gap-2 ${showCode ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            {showCode ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            {showCode ? 'Preview' : 'Código'}
          </Button>
          
          {/* Copy */}
          <Button
            onClick={handleCopyCode}
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </Button>
          
          {/* Open in New Tab */}
          <Button
            onClick={openInNewTab}
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          {/* Fullscreen Toggle */}
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <div className="h-4 w-px bg-white/20" />
          
          {/* Export */}
          <Button
            onClick={handleExport}
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          
          {/* New Page */}
          <Button
            onClick={handleNewPage}
            variant="outline"
            size="sm"
            className="gap-2 border-white/20 text-white/80 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            Nova
          </Button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {showCode ? (
          <div className="h-full overflow-auto bg-slate-950 p-4">
            <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap leading-relaxed">
              {generatedCode}
            </pre>
          </div>
        ) : (
          <div className="h-full w-full bg-white">
            <iframe
              srcDoc={generateHtmlPreview(generatedCode || '')}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Page Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Generate full HTML for iframe preview - FIXED VERSION
function generateHtmlPreview(code: string): string {
  // Clean the code
  const cleanedCode = code
    .replace(/import\s*\{[^}]*\}\s*from\s*['"]framer-motion['"];?/g, '')
    .replace(/import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"];?/g, '')
    .replace(/import\s*\{[^}]*\}\s*from\s*['"]react['"];?/g, '')
    .replace(/export\s+default\s+function\s+(\w+)/g, 'function PageComponent')
    .replace(/export\s+default\s+/g, 'const PageComponent = ')
    .replace(/function\s+Page\s*\(/g, 'function PageComponent(');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { font-family: 'Inter', system-ui, sans-serif; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  
  <script type="text/babel">
    // Mock framer-motion
    const motion = new Proxy({}, {
      get: (target, prop) => {
        return React.forwardRef((props, ref) => {
          const { initial, animate, whileHover, whileTap, whileInView, transition, variants, ...rest } = props;
          return React.createElement(prop, { ...rest, ref });
        });
      }
    });
    
    // Mock lucide-react icons
    const createIcon = (name) => {
      return (props) => {
        const { className = '', size = 24 } = props;
        const el = document.createElement('i');
        el.setAttribute('data-lucide', name.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase().slice(1));
        return React.createElement('span', { 
          className: className + ' inline-block',
          style: { width: size, height: size },
          dangerouslySetInnerHTML: { __html: '' },
          ref: (node) => {
            if (node && typeof lucide !== 'undefined') {
              const iconName = name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1) || name.toLowerCase();
              const icon = lucide.icons[iconName] || lucide.icons[name.toLowerCase()];
              if (icon) {
                node.innerHTML = icon.toSvg({ class: className, width: size, height: size });
              }
            }
          }
        });
      };
    };
    
    // Common icons
    const Sparkles = createIcon('sparkles');
    const Rocket = createIcon('rocket');
    const Star = createIcon('star');
    const Heart = createIcon('heart');
    const Check = createIcon('check');
    const CheckCircle = createIcon('check-circle');
    const ArrowRight = createIcon('arrow-right');
    const ArrowUpRight = createIcon('arrow-up-right');
    const Play = createIcon('play');
    const Shield = createIcon('shield');
    const ShieldCheck = createIcon('shield-check');
    const Zap = createIcon('zap');
    const Crown = createIcon('crown');
    const Trophy = createIcon('trophy');
    const Target = createIcon('target');
    const Users = createIcon('users');
    const Globe = createIcon('globe');
    const Mail = createIcon('mail');
    const Phone = createIcon('phone');
    const MapPin = createIcon('map-pin');
    const Calendar = createIcon('calendar');
    const Clock = createIcon('clock');
    const ChevronRight = createIcon('chevron-right');
    const ChevronDown = createIcon('chevron-down');
    const Menu = createIcon('menu');
    const X = createIcon('x');
    const Instagram = createIcon('instagram');
    const Twitter = createIcon('twitter');
    const Facebook = createIcon('facebook');
    const Linkedin = createIcon('linkedin');
    const Github = createIcon('github');
    const Youtube = createIcon('youtube');
    const CreditCard = createIcon('credit-card');
    const Wallet = createIcon('wallet');
    const BarChart = createIcon('bar-chart');
    const TrendingUp = createIcon('trending-up');
    const Award = createIcon('award');
    const Headphones = createIcon('headphones');
    const MessageCircle = createIcon('message-circle');
    const Send = createIcon('send');
    const Image = createIcon('image');
    const Camera = createIcon('camera');
    const Video = createIcon('video');
    const Music = createIcon('music');
    const Mic = createIcon('mic');
    const Code = createIcon('code');
    const Terminal = createIcon('terminal');
    const Laptop = createIcon('laptop');
    const Smartphone = createIcon('smartphone');
    const Monitor = createIcon('monitor');
    const Wifi = createIcon('wifi');
    const Cloud = createIcon('cloud');
    const Lock = createIcon('lock');
    const Key = createIcon('key');
    const Eye = createIcon('eye');
    const Settings = createIcon('settings');
    const Bell = createIcon('bell');
    const Search = createIcon('search');
    const Scissors = createIcon('scissors');
    const Brush = createIcon('brush');
    const Palette = createIcon('palette');
    const Layers = createIcon('layers');
    const Grid = createIcon('grid');
    const Layout = createIcon('layout');
    const Box = createIcon('box');
    const Package = createIcon('package');
    const ShoppingCart = createIcon('shopping-cart');
    const ShoppingBag = createIcon('shopping-bag');
    const Store = createIcon('store');
    const Home = createIcon('home');
    const Building = createIcon('building');
    const MapPinned = createIcon('map-pinned');
    const Navigation = createIcon('navigation');
    const Compass = createIcon('compass');
    const Car = createIcon('car');
    const Plane = createIcon('plane');
    const Train = createIcon('train');
    const Bus = createIcon('bus');
    const Bike = createIcon('bike');
    const Utensils = createIcon('utensils');
    const Coffee = createIcon('coffee');
    const Wine = createIcon('wine');
    const Beer = createIcon('beer');
    const Pizza = createIcon('pizza');
    const Cake = createIcon('cake');
    const Apple = createIcon('apple');
    const Leaf = createIcon('leaf');
    const Sun = createIcon('sun');
    const Moon = createIcon('moon');
    const CloudSun = createIcon('cloud-sun');
    const Umbrella = createIcon('umbrella');
    const Droplet = createIcon('droplet');
    const Flame = createIcon('flame');
    const Snowflake = createIcon('snowflake');
    const Wind = createIcon('wind');
    const ThumbsUp = createIcon('thumbs-up');
    const ThumbsDown = createIcon('thumbs-down');
    const MessageSquare = createIcon('message-square');
    const Share = createIcon('share');
    const Share2 = createIcon('share-2');
    const Link = createIcon('link');
    const ExternalLink = createIcon('external-link');
    const Download = createIcon('download');
    const Upload = createIcon('upload');
    const File = createIcon('file');
    const FileText = createIcon('file-text');
    const Folder = createIcon('folder');
    const Archive = createIcon('archive');
    const Trash = createIcon('trash');
    const Edit = createIcon('edit');
    const Pencil = createIcon('pencil');
    const Plus = createIcon('plus');
    const Minus = createIcon('minus');
    const ChevronLeft = createIcon('chevron-left');
    const ChevronUp = createIcon('chevron-up');
    const ArrowLeft = createIcon('arrow-left');
    const ArrowUp = createIcon('arrow-up');
    const ArrowDown = createIcon('arrow-down');
    const RefreshCw = createIcon('refresh-cw');
    const RotateCw = createIcon('rotate-cw');
    const RotateCcw = createIcon('rotate-ccw');
    const Loader = createIcon('loader');
    const AlertCircle = createIcon('alert-circle');
    const AlertTriangle = createIcon('alert-triangle');
    const Info = createIcon('info');
    const HelpCircle = createIcon('help-circle');
    const XCircle = createIcon('x-circle');
    const CheckCircle2 = createIcon('check-circle-2');
    const CircleDot = createIcon('circle-dot');
    const Circle = createIcon('circle');
    const Square = createIcon('square');
    const Triangle = createIcon('triangle');
    const Hexagon = createIcon('hexagon');
    const Octagon = createIcon('octagon');
    const Pentagon = createIcon('pentagon');
    const Diamond = createIcon('diamond');
    const Gem = createIcon('gem');
    const Sparkle = createIcon('sparkle');
    const Wand = createIcon('wand');
    const Wand2 = createIcon('wand-2');
    const Magic = createIcon('wand-2');

    // React hooks
    const { useState, useEffect, useRef, useCallback, useMemo } = React;

    // Generated component
    ${cleanedCode}

    // Render
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(PageComponent));
  </script>
</body>
</html>`;
}
