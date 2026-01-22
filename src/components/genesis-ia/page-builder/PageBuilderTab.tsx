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
  ChevronRight,
  Music,
  ShoppingCart,
  BarChart3,
  Building2,
  UtensilsCrossed,
  Palette
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
  { icon: Music, text: 'Clone do Spotify com player', color: 'emerald' },
  { icon: ShoppingCart, text: 'E-commerce moderno', color: 'blue' },
  { icon: BarChart3, text: 'Dashboard SaaS analytics', color: 'purple' },
  { icon: Building2, text: 'Landing imobiliária', color: 'amber' },
  { icon: UtensilsCrossed, text: 'Delivery app cardápio', color: 'rose' },
  { icon: Palette, text: 'Portfolio designer', color: 'cyan' },
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
      if (!data.success) throw new Error(data.error || 'Erro ao gerar página');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '✨ Página gerada com sucesso! Visualize ao lado.',
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
        content: `❌ ${error instanceof Error ? error.message : 'Erro ao gerar'}`,
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
    } catch {
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

  // Empty State - Padronizado com Genesis-IA
  if (messages.length === 0 && !currentCode) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
          
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              O que vamos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                construir hoje?
              </span>
            </h1>
            <p className="text-sm text-white/50">
              Descreva sua página e a IA criará código React + Tailwind
            </p>
          </motion.div>

          {/* Input Box - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-white/50">Descreva sua página</span>
              </div>
              
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Landing page para startup de IA com hero, features, pricing..."
                className="w-full bg-transparent text-white placeholder:text-white/20 resize-none text-sm p-4 pb-14 focus:outline-none min-h-[120px]"
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-xs text-white/30">{prompt.length}</span>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || prompt.length < 5}
                  size="sm"
                  className="h-8 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-30 rounded-lg text-xs font-medium gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Suggestions - Cards padronizados */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-white/40">Sugestões</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {promptSuggestions.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-lg text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs text-white/70 group-hover:text-white/90 line-clamp-2">{suggestion.text}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-400 ml-auto shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main Builder Interface
  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950' : ''}`}>
      {/* Top Toolbar - Glassmorphism */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 backdrop-blur-sm border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-white/60 hover:text-white hover:bg-white/10 text-xs"
          >
            {isChatOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isChatOpen ? 'Fechar' : 'Chat'}</span>
          </Button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400">Ativo</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="ghost"
            size="sm"
            className={`h-8 gap-1.5 text-xs ${showCode ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCode ? 'Preview' : 'Código'}</span>
          </Button>
          
          <Button onClick={handleCopyCode} variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white" disabled={!currentCode}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          
          <Button onClick={openInNewTab} variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white" disabled={!currentCode}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          
          <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          <Button onClick={handleExport} size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs" disabled={!currentCode}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          <Button onClick={handleNewChat} variant="ghost" size="sm" className="h-8 gap-1.5 text-white/60 hover:text-white hover:bg-white/10 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <AnimatePresence initial={false}>
            {isChatOpen && (
              <ResizablePanel defaultSize={28} minSize={20} maxSize={45} className="bg-white/[0.02]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[90%] rounded-xl px-3 py-2 ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                            : 'bg-white/5 text-white/90 border border-white/10'
                        }`}>
                          <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                          {msg.code && (
                            <button
                              onClick={() => setCurrentCode(msg.code!)}
                              className="mt-1.5 text-[10px] text-purple-300 hover:text-purple-200 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Ver versão
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10"
                      >
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        <div>
                          <p className="text-xs text-white/80">Gerando...</p>
                          <p className="text-[10px] text-white/40">Aguarde alguns segundos</p>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-white/10">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva alterações..."
                        disabled={isGenerating}
                        className="w-full bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 resize-none text-xs p-2.5 pr-10 focus:outline-none focus:border-purple-500/50 min-h-[60px] disabled:opacity-50"
                        rows={2}
                      />
                      <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        size="icon"
                        className="absolute bottom-2 right-2 h-7 w-7 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 rounded-md"
                      >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </ResizablePanel>
            )}
          </AnimatePresence>

          {isChatOpen && <ResizableHandle withHandle className="bg-white/5 hover:bg-emerald-500/30 transition-colors w-1" />}

          {/* Preview Panel */}
          <ResizablePanel defaultSize={isChatOpen ? 72 : 100}>
            <div className="h-full flex flex-col">
              {currentCode ? (
                showCode ? (
                  <div className="h-full overflow-auto p-3">
                    <pre className="text-xs text-white/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
                      {currentCode}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full w-full p-2">
                    <div className="h-full w-full bg-white rounded-lg overflow-hidden shadow-2xl">
                      <iframe
                        srcDoc={generateHtmlPreview(currentCode)}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                        title="Preview"
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white/20" />
                    </div>
                    <p className="text-xs text-white/40">Envie uma mensagem para gerar</p>
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

// HTML Preview Generator
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
  <script>tailwind.config={theme:{extend:{fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:'Inter',system-ui,sans-serif}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}</style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script type="text/babel">
    const motion=new Proxy({},{get:(_,prop)=>React.forwardRef((props,ref)=>{const{initial,animate,whileHover,whileTap,whileInView,transition,variants,exit,...rest}=props;return React.createElement(prop,{...rest,ref})})});
    const AnimatePresence=({children})=>children;
    const useInView=()=>[null,true];
    const createIcon=(name)=>(props)=>{const{className='',size=24}=props;const kebab=name.replace(/([A-Z])/g,'-$1').toLowerCase().replace(/^-/,'');return React.createElement('span',{className:className+' inline-flex items-center justify-center',style:{width:size,height:size},ref:(node)=>{if(node&&typeof lucide!=='undefined'){const icon=lucide.icons[kebab]||lucide.icons[name.toLowerCase()];if(icon)node.innerHTML=icon.toSvg({class:className,width:size,height:size})}}})};
    const icons=['Sparkles','Rocket','Star','Heart','Check','CheckCircle','ArrowRight','ArrowUpRight','Play','Shield','ShieldCheck','Zap','Crown','Trophy','Target','Users','Globe','Mail','Phone','MapPin','Calendar','Clock','ChevronRight','ChevronDown','ChevronLeft','ChevronUp','Menu','X','Instagram','Twitter','Facebook','Linkedin','Github','Youtube','CreditCard','Wallet','BarChart','TrendingUp','Award','Headphones','MessageCircle','Send','Image','Camera','Video','Music','Mic','Code','Terminal','Laptop','Smartphone','Monitor','Wifi','Cloud','Lock','Key','Eye','Settings','Bell','Search','Scissors','Brush','Palette','Layers','Grid','Layout','Box','Package','ShoppingCart','ShoppingBag','Store','Home','Building','MapPinned','Navigation','Compass','Car','Plane','Train','Bus','Bike','Utensils','Coffee','Wine','Beer','Pizza','Cake','Apple','Leaf','Sun','Moon','CloudSun','Umbrella','Droplet','Flame','Snowflake','Wind','ThumbsUp','ThumbsDown','MessageSquare','Share','Share2','Link','ExternalLink','Download','Upload','File','FileText','Folder','Archive','Trash','Edit','Pencil','Plus','Minus','ArrowLeft','ArrowUp','ArrowDown','RefreshCw','RotateCw','RotateCcw','Loader','AlertCircle','AlertTriangle','Info','HelpCircle','XCircle','CheckCircle2','CircleDot','Circle','Square','Triangle','Hexagon','Octagon','Pentagon','Diamond','Gem','Sparkle','Wand','Wand2','Briefcase','GraduationCap','BookOpen','Bookmark','Tag','Tags','Hash','AtSign','DollarSign','Euro','PoundSterling','Percent','Activity','PieChart','LineChart','Database','Server','HardDrive','Cpu','Bot','Brain','Lightbulb','Megaphone','Gift','PartyPopper','Confetti','BadgeCheck','Verified','Medal','Fire'];
    icons.forEach(name=>{window[name]=createIcon(name)});
    const{useState,useEffect,useRef,useCallback,useMemo}=React;
    ${cleanedCode}
    const root=ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(PageComponent));
  </script>
</body>
</html>`;
}
