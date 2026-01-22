import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Maximize2,
  Minimize2,
  ExternalLink,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  Wand2,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportToZip } from './PageBuilderExport';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface PageBuilderTabProps {
  onBack?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  timestamp: Date;
}

const promptSuggestions = [
  { icon: '🎵', text: 'Clone do Spotify com player' },
  { icon: '🛒', text: 'E-commerce moderno com carrinho' },
  { icon: '📊', text: 'Dashboard SaaS analytics' },
  { icon: '🏠', text: 'Landing imobiliária premium' },
  { icon: '🍔', text: 'Delivery app com cardápio' },
  { icon: '💼', text: 'Portfolio criativo designer' },
];

export const PageBuilderTab = ({ onBack }: PageBuilderTabProps) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 5) {
      toast.error('Descreva melhor sua página');
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('page-ai-builder', {
        body: { prompt: userMessage.content, style: 'modern' }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar página');
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '✨ Página gerada com sucesso! Você pode visualizar o resultado ao lado.',
        code: data.code,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentCode(data.code);
      toast.success('Página gerada!');
    } catch (error) {
      console.error('Error generating page:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Erro: ${error instanceof Error ? error.message : 'Falha ao gerar página'}. Tente novamente.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erro ao gerar página');
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
    if (!currentCode) return;
    try {
      await exportToZip(currentCode, messages[messages.length - 2]?.content || 'pagina');
      toast.success('Projeto exportado!');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const handleCopyCode = async () => {
    if (!currentCode) return;
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentCode(null);
    setPrompt('');
    setShowCode(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    inputRef.current?.focus();
  };

  const openInNewTab = () => {
    if (!currentCode) return;
    const html = generateHtmlPreview(currentCode);
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  // Empty State - No messages yet
  if (messages.length === 0 && !currentCode) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          {/* Hero */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/30"
            >
              <Wand2 className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              O que vamos{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                construir hoje?
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-white/50 max-w-lg mx-auto"
            >
              Descreva sua página em detalhes e a IA criará código React + Tailwind profissional em segundos.
            </motion.p>
          </div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white/60">Descreva sua página</span>
              </div>
              
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Crie uma landing page para uma startup de IA com hero animado, seção de features com ícones, depoimentos de clientes, planos de preços e footer profissional..."
                className="w-full bg-transparent text-white placeholder:text-white/25 resize-none text-base p-4 pb-16 focus:outline-none min-h-[160px]"
              />
              
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span className="text-xs text-white/30">{prompt.length} caracteres</span>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || prompt.length < 5}
                  className="h-10 px-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-semibold gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/40">Sugestões para começar</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {promptSuggestions.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl text-left transition-all group"
                >
                  <span className="text-xl">{suggestion.icon}</span>
                  <span className="text-sm text-white/70 group-hover:text-white/90">{suggestion.text}</span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 ml-auto" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main Builder Interface with Chat + Preview
  return (
    <div className={`h-full flex flex-col bg-slate-950 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 backdrop-blur-sm border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          {/* Toggle Chat */}
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            variant="ghost"
            size="sm"
            className="gap-2 text-white/60 hover:text-white hover:bg-white/10"
          >
            {isChatOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isChatOpen ? 'Fechar chat' : 'Abrir chat'}</span>
          </Button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Página ativa</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* View Toggle */}
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="ghost"
            size="sm"
            className={`gap-2 ${showCode ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            {showCode ? <Eye className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{showCode ? 'Preview' : 'Código'}</span>
          </Button>
          
          <Button onClick={handleCopyCode} variant="ghost" size="sm" className="text-white/60 hover:text-white" disabled={!currentCode}>
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </Button>
          
          <Button onClick={openInNewTab} variant="ghost" size="sm" className="text-white/60 hover:text-white" disabled={!currentCode}>
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          <Button
            onClick={handleExport}
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-500"
            disabled={!currentCode}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          <Button
            onClick={handleNewChat}
            variant="outline"
            size="sm"
            className="gap-2 border-white/20 text-white/80 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>
      </div>

      {/* Main Content - Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <AnimatePresence initial={false}>
            {isChatOpen && (
              <ResizablePanel 
                defaultSize={30} 
                minSize={20} 
                maxSize={50}
                className="bg-slate-900/50"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                            : 'bg-white/10 text-white/90 border border-white/10'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.code && (
                            <button
                              onClick={() => setCurrentCode(msg.code!)}
                              className="mt-2 text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Ver esta versão
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10"
                      >
                        <div className="relative">
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">Gerando página...</p>
                          <p className="text-xs text-white/40">Isso pode levar alguns segundos</p>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva alterações ou uma nova página..."
                        disabled={isGenerating}
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 resize-none text-sm p-3 pr-12 focus:outline-none focus:border-purple-500/50 min-h-[80px] disabled:opacity-50"
                        rows={3}
                      />
                      <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        size="icon"
                        className="absolute bottom-3 right-3 h-8 w-8 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded-lg"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </ResizablePanel>
            )}
          </AnimatePresence>

          {isChatOpen && <ResizableHandle withHandle className="bg-white/5 hover:bg-purple-500/30 transition-colors" />}

          {/* Preview Panel */}
          <ResizablePanel defaultSize={isChatOpen ? 70 : 100}>
            <div className="h-full flex flex-col bg-slate-950">
              {currentCode ? (
                showCode ? (
                  <div className="h-full overflow-auto p-4">
                    <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/10">
                      {currentCode}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full w-full bg-white rounded-lg overflow-hidden m-2 mr-2 mb-2 shadow-2xl">
                    <iframe
                      srcDoc={generateHtmlPreview(currentCode)}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin"
                      title="Page Preview"
                    />
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40">Envie uma mensagem para gerar sua página</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

// HTML Preview Generator with full React + Tailwind support
function generateHtmlPreview(code: string): string {
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
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
        },
      },
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
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
    const motion = new Proxy({}, {
      get: (_, prop) => React.forwardRef((props, ref) => {
        const { initial, animate, whileHover, whileTap, whileInView, transition, variants, exit, ...rest } = props;
        return React.createElement(prop, { ...rest, ref });
      })
    });
    
    const AnimatePresence = ({ children }) => children;
    const useInView = () => [null, true];
    
    const createIcon = (name) => (props) => {
      const { className = '', size = 24 } = props;
      const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
      return React.createElement('span', { 
        className: className + ' inline-flex items-center justify-center',
        style: { width: size, height: size },
        ref: (node) => {
          if (node && typeof lucide !== 'undefined') {
            const icon = lucide.icons[kebab] || lucide.icons[name.toLowerCase()];
            if (icon) node.innerHTML = icon.toSvg({ class: className, width: size, height: size });
          }
        }
      });
    };
    
    const icons = ['Sparkles','Rocket','Star','Heart','Check','CheckCircle','ArrowRight','ArrowUpRight','Play','Shield','ShieldCheck','Zap','Crown','Trophy','Target','Users','Globe','Mail','Phone','MapPin','Calendar','Clock','ChevronRight','ChevronDown','ChevronLeft','ChevronUp','Menu','X','Instagram','Twitter','Facebook','Linkedin','Github','Youtube','CreditCard','Wallet','BarChart','TrendingUp','Award','Headphones','MessageCircle','Send','Image','Camera','Video','Music','Mic','Code','Terminal','Laptop','Smartphone','Monitor','Wifi','Cloud','Lock','Key','Eye','Settings','Bell','Search','Scissors','Brush','Palette','Layers','Grid','Layout','Box','Package','ShoppingCart','ShoppingBag','Store','Home','Building','MapPinned','Navigation','Compass','Car','Plane','Train','Bus','Bike','Utensils','Coffee','Wine','Beer','Pizza','Cake','Apple','Leaf','Sun','Moon','CloudSun','Umbrella','Droplet','Flame','Snowflake','Wind','ThumbsUp','ThumbsDown','MessageSquare','Share','Share2','Link','ExternalLink','Download','Upload','File','FileText','Folder','Archive','Trash','Edit','Pencil','Plus','Minus','ArrowLeft','ArrowUp','ArrowDown','RefreshCw','RotateCw','RotateCcw','Loader','AlertCircle','AlertTriangle','Info','HelpCircle','XCircle','CheckCircle2','CircleDot','Circle','Square','Triangle','Hexagon','Octagon','Pentagon','Diamond','Gem','Sparkle','Wand','Wand2','Briefcase','GraduationCap','BookOpen','Bookmark','Tag','Tags','Hash','AtSign','DollarSign','Euro','PoundSterling','Percent','Activity','PieChart','LineChart','Database','Server','HardDrive','Cpu','Bot','Brain','Lightbulb','Megaphone','Gift','PartyPopper','Confetti','BadgeCheck','Verified','Crown','Medal','Fire'];
    icons.forEach(name => { window[name] = createIcon(name); });
    
    const { useState, useEffect, useRef, useCallback, useMemo } = React;

    ${cleanedCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(PageComponent));
  </script>
</body>
</html>`;
}
