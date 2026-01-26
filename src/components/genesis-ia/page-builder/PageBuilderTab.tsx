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
  Wand2,
  Lightbulb,
  ChevronRight,
  Music,
  ShoppingCart,
  BarChart3,
  Building2,
  UtensilsCrossed,
  Palette,
  AlertTriangle,
  Cpu,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportToZip } from './PageBuilderExport';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PageBuilderPreview } from './PageBuilderPreview';

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
  { icon: Music, text: 'Clone do Spotify com player' },
  { icon: ShoppingCart, text: 'E-commerce moderno' },
  { icon: BarChart3, text: 'Dashboard SaaS analytics' },
  { icon: Building2, text: 'Landing imobiliária' },
  { icon: UtensilsCrossed, text: 'Delivery app cardápio' },
  { icon: Palette, text: 'Portfolio designer' },
];

// Compact Loading Animation - Genesis Theme
const GeneratingAnimation = ({ progress }: { progress: number }) => {
  const steps = ['Analisando', 'Processando', 'Estruturando', 'Estilizando', 'Finalizando'];
  const currentStepIndex = Math.min(Math.floor(progress / 20), steps.length - 1);

  return (
    <div className="h-full flex items-center justify-center bg-background/50">
      <div className="relative z-10 text-center max-w-sm px-6">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <Cpu className="w-7 h-7 text-primary" />
            </motion.div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">Gemini 2.5 Pro</h2>
        <p className="text-sm text-muted-foreground mb-6">Gerando código React + Tailwind</p>

        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                idx <= currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`}
              animate={idx === currentStepIndex ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          ))}
        </div>

        <motion.p
          key={currentStepIndex}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-primary font-medium mb-4"
        >
          {steps[currentStepIndex]}...
        </motion.p>

        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
};

// Empty Preview State - Compact
const EmptyPreviewState = () => (
  <div className="h-full flex items-center justify-center bg-background/30">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Eye className="w-5 h-5 text-primary/50" />
      </div>
      <p className="text-sm text-muted-foreground">Preview</p>
    </motion.div>
  </div>
);

// Error State Component - Compact
const PreviewErrorState = ({ error }: { error: string }) => (
  <div className="h-full flex items-center justify-center bg-background/30 p-4">
    <div className="max-w-md w-full">
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">Erro</h3>
            <pre className="text-xs text-destructive bg-background/50 p-2 rounded-lg overflow-auto max-h-20 whitespace-pre-wrap break-words">
              {error}
            </pre>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const PageBuilderTab = ({ onBack }: PageBuilderTabProps) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isGenerating) {
      setGeneratingProgress(0);
      const interval = setInterval(() => {
        setGeneratingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 6 + 2;
        });
      }, 600);
      return () => clearInterval(interval);
    } else {
      setGeneratingProgress(100);
    }
  }, [isGenerating]);

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
    setPreviewError(null);

    try {
      const { data, error } = await supabase.functions.invoke('page-ai-builder', {
        body: { prompt: userMessage.content, style: 'modern' }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao gerar página');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '✨ Página gerada com Gemini 2.5 Pro!',
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
    setPreviewError(null);
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

  // Empty State - Initial Screen (Compact Design)
  if (messages.length === 0 && !currentCode) {
    return (
      <div className="h-full flex flex-col fixed inset-0 z-50 bg-background">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Page Builder</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cpu className="w-3.5 h-3.5" />
              <span>Gemini 2.5 Pro</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="flex justify-center mb-5"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center mb-6"
            >
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1.5">
                O que vamos <span className="text-primary">construir?</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Descreva sua página e a IA criará código React + Tailwind
              </p>
            </motion.div>

            {/* Input Card - Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5"
            >
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex: Landing page para startup de IA com hero, features, pricing..."
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none text-sm p-4 pb-14 focus:outline-none min-h-[100px]"
                />
                
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">{prompt.length}</span>
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || prompt.length < 5}
                    size="sm"
                    className="h-8 px-4 bg-primary hover:bg-primary/90 disabled:opacity-30 rounded-lg text-xs font-medium gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Gerar
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Suggestions - Compact Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-xs font-medium text-muted-foreground">Sugestões</span>
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
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg text-left transition-all group"
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary/70" />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground line-clamp-1 flex-1">{suggestion.text}</span>
                      <ChevronRight className="w-3 h-3 text-muted group-hover:text-primary/50 shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Builder Interface - Compact & Glassmorphism
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Toolbar - Compact */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-foreground text-xs"
          >
            {isChatOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isChatOpen ? 'Fechar' : 'Chat'}</span>
          </Button>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
            <Cpu className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Gemini Pro</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="ghost"
            size="sm"
            className={`h-7 px-2 gap-1.5 text-xs ${showCode ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            disabled={!currentCode}
          >
            {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCode ? 'Preview' : 'Código'}</span>
          </Button>
          
          <Button onClick={handleCopyCode} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" disabled={!currentCode}>
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          
          <Button onClick={openInNewTab} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" disabled={!currentCode}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          
          <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          
          <div className="h-4 w-px bg-white/10 mx-1" />
          
          <Button onClick={handleExport} size="sm" className="h-7 px-3 gap-1.5 bg-primary hover:bg-primary/90 text-xs" disabled={!currentCode}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          <Button onClick={handleNewChat} variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-foreground text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel - Compact */}
          <AnimatePresence initial={false}>
            {isChatOpen && (
              <ResizablePanel defaultSize={25} minSize={18} maxSize={35} className="bg-white/[0.02]">
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="h-full flex flex-col"
                >
                  {/* Messages - Compact */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[90%] rounded-lg px-3 py-2 ${
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white/5 text-foreground border border-white/10'
                        }`}>
                          <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                          {msg.code && (
                            <button
                              onClick={() => {
                                setCurrentCode(msg.code!);
                                setPreviewError(null);
                              }}
                              className={`mt-1.5 text-[10px] flex items-center gap-1 underline-offset-2 hover:underline ${
                                msg.role === 'user'
                                  ? 'text-primary-foreground/80 hover:text-primary-foreground'
                                  : 'text-primary/80 hover:text-primary'
                              }`}
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-3 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground mb-1.5">Gerando...</p>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary"
                                style={{ width: `${generatingProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input - Compact */}
                  <div className="p-3 border-t border-white/10">
                    <div className="relative bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <textarea
                        ref={inputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva alterações..."
                        disabled={isGenerating}
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/60 resize-none text-xs p-3 pr-20 pb-10 focus:outline-none min-h-[48px] max-h-[120px] overflow-y-auto disabled:opacity-50"
                        rows={2}
                      />

                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">{prompt.length}</span>
                        <Button
                          onClick={handleGenerate}
                          disabled={!prompt.trim() || isGenerating}
                          size="sm"
                          className="h-7 px-3 bg-primary hover:bg-primary/90 disabled:opacity-30 rounded-md gap-1.5"
                        >
                          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
                          <span className="text-xs">Enviar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ResizablePanel>
            )}
          </AnimatePresence>

          {isChatOpen && <ResizableHandle withHandle className="bg-white/5 hover:bg-primary/20 transition-colors w-0.5" />}

          {/* Preview Panel */}
          <ResizablePanel defaultSize={isChatOpen ? 75 : 100}>
            <div className="h-full flex flex-col bg-background/50">
              {isGenerating ? (
                <GeneratingAnimation progress={generatingProgress} />
              ) : currentCode ? (
                showCode ? (
                  <div className="h-full overflow-auto p-3">
                    <pre className="text-xs text-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                      {currentCode}
                    </pre>
                  </div>
                ) : previewError ? (
                  <PreviewErrorState error={previewError} />
                ) : (
                  <div className="h-full w-full p-2">
                    <div className="h-full w-full rounded-lg overflow-hidden shadow-xl border border-white/10 bg-background">
                      <PageBuilderPreview code={currentCode} />
                    </div>
                  </div>
                )
              ) : (
                <EmptyPreviewState />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

// HTML Preview Generator with TypeScript support and better error handling
function generateHtmlPreview(code: string): string {
  if (!code || typeof code !== 'string') {
    return `<!DOCTYPE html><html><body><div style="padding:40px;color:#666;">Código inválido</div></body></html>`;
  }

  // Clean imports and exports
  let cleanedCode = code;
  
  // Remove all import statements (multi-line and single-line)
  cleanedCode = cleanedCode.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*\n?/g, '');
  cleanedCode = cleanedCode.replace(/import\s+['"][^'"]+['"];?\s*\n?/g, '');
  cleanedCode = cleanedCode.replace(/import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*\n?/g, '');
  
  // Remove TypeScript type annotations that Babel might not handle well
  cleanedCode = cleanedCode.replace(/:\s*React\.FC\s*(<[^>]*>)?/g, '');
  cleanedCode = cleanedCode.replace(/:\s*React\.ReactNode/g, '');
  cleanedCode = cleanedCode.replace(/:\s*JSX\.Element/g, '');
  
  // Handle export patterns - convert to PageComponent
  cleanedCode = cleanedCode.replace(/export\s+default\s+function\s+(\w+)/g, 'function PageComponent');
  cleanedCode = cleanedCode.replace(/export\s+default\s+(\w+);?\s*$/gm, '');
  cleanedCode = cleanedCode.replace(/export\s+default\s+(function\s*)?\(/g, 'function PageComponent(');
  cleanedCode = cleanedCode.replace(/export\s+default\s+(?:memo|forwardRef)\s*\([^)]*\)/g, '');
  cleanedCode = cleanedCode.replace(/export\s+\{[^}]*\};?\s*\n?/g, '');
  cleanedCode = cleanedCode.replace(/export\s+default\s+/g, 'const PageComponent = ');

  // Ensure we have PageComponent
  if (!cleanedCode.includes('PageComponent')) {
    cleanedCode = cleanedCode.replace(/function\s+Page\s*\(/g, 'function PageComponent(');
    cleanedCode = cleanedCode.replace(/const\s+Page\s*=\s*\(\s*\)\s*=>/g, 'const PageComponent = () =>');
    
    if (!cleanedCode.includes('PageComponent')) {
      const funcMatch = cleanedCode.match(/(?:function|const)\s+([A-Z]\w*)\s*(?:=\s*\(\s*\)\s*=>|\()/);
      if (funcMatch) {
        const compName = funcMatch[1];
        cleanedCode += `\nvar PageComponent = ${compName};`;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
      }
    }
  <\/script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"><\/script>
  
  <script>
    // Pre-define globals before Babel compilation
    window.React = React;
    window.ReactDOM = ReactDOM;
    
    // Framer motion mock
    window.motion = new Proxy({}, {
      get: function(target, prop) {
        return function MotionComponent(props) {
          var children = props.children;
          var className = props.className || '';
          var style = props.style || {};
          var rest = {};
          Object.keys(props).forEach(function(key) {
            if (!['initial','animate','exit','whileHover','whileTap','whileInView','transition','variants','viewport','layout','layoutId','drag','dragConstraints','children','className','style'].includes(key)) {
              rest[key] = props[key];
            }
          });
          return React.createElement(prop, Object.assign({}, rest, { className: className, style: style }), children);
        };
      }
    });
    
    window.AnimatePresence = function(props) { return props.children; };
    window.useInView = function() { return [null, true]; };
    window.useAnimation = function() { return { start: function(){}, stop: function(){} }; };
    window.useScroll = function() { return { scrollY: { get: function() { return 0; } }, scrollYProgress: { get: function() { return 0; } } }; };
    window.useTransform = function(val, input, output) { return output ? output[0] : 0; };
    window.useSpring = function(val) { return val; };
    window.useMotionValue = function(val) { return { get: function() { return val; }, set: function(){} }; };
    
    // React hooks as globals
    window.useState = React.useState;
    window.useEffect = React.useEffect;
    window.useRef = React.useRef;
    window.useCallback = React.useCallback;
    window.useMemo = React.useMemo;
    window.useContext = React.useContext;
    window.createContext = React.createContext;
    window.Fragment = React.Fragment;
    
    // Lucide icons helper
    function createLucideIcon(name) {
      return function IconComponent(props) {
        props = props || {};
        var size = props.size || 24;
        var className = props.className || '';
        var color = props.color;
        var strokeWidth = props.strokeWidth || 2;
        var kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        
        var span = React.createElement('span', {
          className: className + ' inline-flex items-center justify-center',
          style: { width: size, height: size, color: color },
          dangerouslySetInnerHTML: { __html: '' },
          ref: function(node) {
            if (node && typeof lucide !== 'undefined') {
              var iconData = lucide.icons[kebabName] || lucide.icons[name.toLowerCase()] || lucide.icons['circle'];
              if (iconData) {
                try {
                  node.innerHTML = iconData.toSvg({ width: size, height: size, 'stroke-width': strokeWidth });
                } catch(e) {}
              }
            }
          }
        });
        return span;
      };
    }
    
    // Define common icons
    var iconNames = [
      'Sparkles','Rocket','Star','Heart','Check','CheckCircle','CheckCircle2','ArrowRight','ArrowUpRight','ArrowLeft','ArrowUp','ArrowDown',
      'Play','Pause','PlayCircle','Shield','ShieldCheck','Zap','Crown','Trophy','Target','Users','Users2','Globe','Globe2',
      'Mail','Phone','MapPin','Calendar','Clock','ChevronRight','ChevronDown','ChevronLeft','ChevronUp','ChevronsRight','ChevronsLeft',
      'Menu','X','XCircle','Instagram','Twitter','Facebook','Linkedin','Github','Youtube','Twitch','Dribbble',
      'CreditCard','Wallet','BarChart','BarChart2','BarChart3','TrendingUp','TrendingDown','Award','Headphones','Headset',
      'MessageCircle','MessageSquare','Send','Image','Camera','Video','Music','Music2','Mic','Mic2',
      'Code','Code2','Terminal','Laptop','Smartphone','Monitor','Tablet','Wifi','Cloud','CloudUpload','CloudDownload',
      'Lock','Unlock','Key','Eye','EyeOff','Settings','Settings2','Bell','BellRing','Search','Filter',
      'Home','Building','Building2','Store','ShoppingCart','ShoppingBag','Package','Box','Boxes','Archive',
      'Layers','Layers2','Layers3','Grid','Grid2','Grid3','Layout','LayoutGrid','LayoutDashboard',
      'Palette','Brush','PenTool','Scissors','Wand','Wand2','Sparkle',
      'Coffee','Utensils','UtensilsCrossed','Wine','Beer','Pizza','Cake','Apple','Cherry','Leaf','Flower','Flower2',
      'Sun','Moon','Stars','Umbrella','Droplet','Droplets','Flame','Wind','Snowflake',
      'ThumbsUp','ThumbsDown','Share','Share2','Link','Link2','ExternalLink','Download','Upload','UploadCloud',
      'File','FileText','FileCode','FileImage','FileVideo','FileAudio','Files','Folder','FolderOpen',
      'Trash','Trash2','Edit','Edit2','Edit3','Pencil','PenSquare','Plus','Minus','PlusCircle','MinusCircle',
      'RefreshCw','RefreshCcw','RotateCw','RotateCcw','Loader','Loader2',
      'AlertCircle','AlertTriangle','Info','HelpCircle','Circle','CircleDot','Square','Diamond','Hexagon','Octagon',
      'Gem','Briefcase','GraduationCap','BookOpen','Book','Bookmark','BookMarked','Tag','Tags',
      'DollarSign','Euro','PoundSterling','Percent','Receipt','Coins','Banknote','Wallet2',
      'Activity','PieChart','LineChart','AreaChart','Database','Server','HardDrive','Cpu','Bot','Brain',
      'Lightbulb','Megaphone','Gift','Party','Balloon','Verified','BadgeCheck','Medal',
      'Power','Battery','BatteryCharging','Gauge','Compass','Navigation','Map',
      'Car','Truck','Bike','Train','Plane','Ship','Anchor','Flag','Mountain','Trees','Tree','Waves',
      'Infinity','Hash','AtSign','Asterisk','Quote','Type','Bold','Italic','Underline','AlignLeft','AlignCenter','AlignRight',
      'List','ListOrdered','CheckSquare','SquareCheck','CircleCheck','BadgeX','Ban','Slash',
      'Volume','Volume1','Volume2','VolumeX','Maximize','Maximize2','Minimize','Minimize2','Move','Grab',
      'Hand','HandMetal','Pointer','MousePointer','MousePointer2','Cursor','Touch','Fingerprint',
      'QrCode','Barcode','Scan','ScanLine','Focus','Crosshair','Aperture','CameraOff',
      'Printer','Save','Copy','Clipboard','ClipboardCheck','ClipboardList','ClipboardCopy',
      'CalendarDays','CalendarCheck','CalendarClock','Timer','TimerOff','Hourglass','Watch','Stopwatch',
      'Sunrise','Sunset','CloudSun','CloudMoon','CloudRain','CloudSnow','CloudLightning','Thermometer',
      'Heart','HeartHandshake','HeartPulse','Stethoscope','Pill','Syringe','Activity','Bone',
      'User','UserPlus','UserMinus','UserCheck','UserX','UserCircle','UserCog','Users',
      'Building','Building2','Castle','Church','Factory','Hotel','Landmark','School','Hospital','Store',
      'Bed','Sofa','Armchair','Bath','Tv','Refrigerator','WashingMachine','Fan','Lamp','LampDesk',
      'Shirt','Pants','Dress','Glasses','Hat','Watch','Gem','Ring','Crown','Wallet',
      'GraduationCap','Backpack','PencilRuler','Calculator','Scissors','Eraser','Paperclip','Pin','Pushpin',
      'Guitar','Piano','Drum','Headphones','Speaker','Radio','Podcast','Mic','Play','Pause','SkipBack','SkipForward',
      'Gamepad','Joystick','Dice1','Dice2','Dice3','Dice4','Dice5','Dice6','Puzzle','ToyBrick',
      'Baby','Cat','Dog','Bird','Fish','Bug','Turtle','Rabbit','Rat','Snail',
      'Footprints','Paw','Bone','Feather','Shell','Egg','Milk','Soup','Salad','Sandwich',
      'Coffee','Wine','Beer','Martini','GlassWater','CupSoda','Candy','Cookie','Croissant','Popcorn'
    ];
    
    iconNames.forEach(function(name) { window[name] = createLucideIcon(name); });
  <\/script>
  
  <script type="text/babel">
    ${cleanedCode}
    
    try {
      if (typeof PageComponent !== 'undefined') {
        ReactDOM.createRoot(document.getElementById('root')).render(<PageComponent />);
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:40px;color:red;">Component not found</div>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML = '<div style="padding:40px;color:red;">Render Error: ' + err.message + '</div>';
    }
  <\/script>
</body>
</html>`;
}
