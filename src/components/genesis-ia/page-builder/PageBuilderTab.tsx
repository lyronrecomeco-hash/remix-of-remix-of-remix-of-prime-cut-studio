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
  { icon: Music, text: 'Clone do Spotify com player' },
  { icon: ShoppingCart, text: 'E-commerce moderno' },
  { icon: BarChart3, text: 'Dashboard SaaS analytics' },
  { icon: Building2, text: 'Landing imobiliária' },
  { icon: UtensilsCrossed, text: 'Delivery app cardápio' },
  { icon: Palette, text: 'Portfolio designer' },
];

// Professional Loading Animation - Genesis Theme
const GeneratingAnimation = ({ progress }: { progress: number }) => {
  const steps = ['Analisando', 'Processando', 'Estruturando', 'Estilizando', 'Finalizando'];
  const currentStepIndex = Math.min(Math.floor(progress / 20), steps.length - 1);

  return (
    <div className="h-full flex items-center justify-center bg-[hsl(220_25%_8%)]">
      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-md px-8">
        {/* Minimal Icon */}
        <div className="w-20 h-20 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
          </div>
          {/* Pulse ring */}
          <motion.div
            className="absolute -inset-2 rounded-3xl border border-emerald-500/20"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-2">Construindo sua página</h2>
        <p className="text-sm text-white/40 mb-8">A IA está gerando código React + Tailwind</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <motion.div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  idx < currentStepIndex 
                    ? 'bg-emerald-400' 
                    : idx === currentStepIndex 
                      ? 'bg-emerald-400' 
                      : 'bg-white/10'
                }`}
                animate={idx === currentStepIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {idx < steps.length - 1 && (
                <div className={`w-8 h-px ${idx < currentStepIndex ? 'bg-emerald-400/50' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Label */}
        <motion.p
          key={currentStepIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-emerald-400 font-medium mb-6"
        >
          {steps[currentStepIndex]}...
        </motion.p>

        {/* Progress Bar */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-[10px] text-white/30 mt-4">Isso pode levar até 30 segundos</p>
      </div>
    </div>
  );
};

// Empty Preview State
const EmptyPreviewState = () => (
  <div className="h-full flex items-center justify-center bg-[hsl(220_25%_8%)]">
    <div className="absolute inset-0 opacity-[0.02]">
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Eye className="w-6 h-6 text-white/20" />
      </div>
      <p className="text-sm text-white/40 mb-1">Área de Preview</p>
      <p className="text-xs text-white/20">Envie uma mensagem para gerar sua página</p>
    </motion.div>
  </div>
);

export const PageBuilderTab = ({ onBack }: PageBuilderTabProps) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Progress animation during generation
  useEffect(() => {
    if (isGenerating) {
      setGeneratingProgress(0);
      const interval = setInterval(() => {
        setGeneratingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 8 + 2;
        });
      }, 500);
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

    try {
      const { data, error } = await supabase.functions.invoke('page-ai-builder', {
        body: { prompt: userMessage.content, style: 'modern' }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao gerar página');

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '✨ Página gerada com sucesso!',
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

  // Empty State - Initial Screen
  if (messages.length === 0 && !currentCode) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 py-8 fixed inset-0 z-50 bg-[hsl(220_25%_8%)]">
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), 
                                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '80px 80px'
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl relative z-10"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Wand2 className="w-7 h-7 text-emerald-400" />
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
              O que vamos <span className="text-emerald-400">construir hoje?</span>
            </h1>
            <p className="text-sm text-white/40">
              Descreva sua página e a IA criará código React + Tailwind
            </p>
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-white/40">Descreva sua página</span>
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
                <span className="text-xs text-white/20">{prompt.length}</span>
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || prompt.length < 5}
                  size="sm"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-lg text-xs font-medium gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400/60" />
              <span className="text-xs font-medium text-white/30">Sugestões</span>
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
                    className="flex items-center gap-2.5 px-3 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-emerald-500/30 rounded-lg text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-400/70" />
                    </div>
                    <span className="text-xs text-white/50 group-hover:text-white/70 line-clamp-2">{suggestion.text}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-emerald-400/50 ml-auto shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main Builder Interface - Always fullscreen
  return (
    <div className="fixed inset-0 z-50 bg-[hsl(220_25%_8%)] flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-white/40 hover:text-white hover:bg-white/5 text-xs"
          >
            {isChatOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isChatOpen ? 'Fechar' : 'Chat'}</span>
          </Button>
          
          <div className="h-4 w-px bg-white/5" />
          
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-medium text-emerald-400">
              {isGenerating ? 'Gerando...' : 'Ativo'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="ghost"
            size="sm"
            className={`h-8 gap-1.5 text-xs ${showCode ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            disabled={!currentCode}
          >
            {showCode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showCode ? 'Preview' : 'Código'}</span>
          </Button>
          
          <Button onClick={handleCopyCode} variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/5" disabled={!currentCode}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          
          <Button onClick={openInNewTab} variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/5" disabled={!currentCode}>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          
          <Button onClick={() => setIsFullscreen(!isFullscreen)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/5">
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          
          <div className="h-4 w-px bg-white/5 mx-1" />
          
          <Button onClick={handleExport} size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs" disabled={!currentCode}>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          
          <Button onClick={handleNewChat} variant="ghost" size="sm" className="h-8 gap-1.5 text-white/40 hover:text-white hover:bg-white/5 text-xs">
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
              <ResizablePanel defaultSize={28} minSize={20} maxSize={40} className="bg-white/[0.01]">
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
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white/5 text-white/80 border border-white/5'
                        }`}>
                          <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
                          {msg.code && (
                            <button
                              onClick={() => setCurrentCode(msg.code!)}
                              className="mt-1.5 text-[10px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Ver versão
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Loading State in Chat */}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-xl p-3 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-white/80 mb-1">Gerando...</p>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-emerald-500"
                                style={{ width: `${generatingProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-white/5">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva alterações..."
                        disabled={isGenerating}
                        className="w-full bg-white/5 border border-white/5 rounded-lg text-white placeholder:text-white/20 resize-none text-xs p-2.5 pr-10 focus:outline-none focus:border-emerald-500/30 min-h-[60px] disabled:opacity-50"
                        rows={2}
                      />
                      <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        size="icon"
                        className="absolute bottom-2 right-2 h-7 w-7 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-md"
                      >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </ResizablePanel>
            )}
          </AnimatePresence>

          {isChatOpen && <ResizableHandle withHandle className="bg-white/[0.02] hover:bg-emerald-500/20 transition-colors w-1" />}

          {/* Preview Panel */}
          <ResizablePanel defaultSize={isChatOpen ? 72 : 100}>
            <div className="h-full flex flex-col bg-[hsl(220_25%_6%)]">
              {isGenerating ? (
                <GeneratingAnimation progress={generatingProgress} />
              ) : currentCode ? (
                showCode ? (
                  <div className="h-full overflow-auto p-4">
                    <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/5">
                      {currentCode}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full w-full p-3">
                    <div className="h-full w-full bg-white rounded-lg overflow-hidden">
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
                <EmptyPreviewState />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

// HTML Preview Generator - Fixed version with better error handling
function generateHtmlPreview(code: string): string {
  if (!code || typeof code !== 'string') {
    return `<!DOCTYPE html><html><body><div style="padding:40px;color:#666;">Código inválido</div></body></html>`;
  }

  // Clean imports and exports more robustly
  let cleanedCode = code
    // Remove all imports
    .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*\n?/g, '')
    .replace(/import\s+['"][^'"]+['"];?\s*\n?/g, '')
    // Handle export default function Name
    .replace(/export\s+default\s+function\s+(\w+)/g, 'function PageComponent')
    // Handle export default Name
    .replace(/export\s+default\s+(\w+);?\s*$/gm, '')
    // Handle export default at start of expression
    .replace(/export\s+default\s+/g, 'const PageComponent = ')
    // Handle export { X }
    .replace(/export\s+\{[^}]*\};?\s*\n?/g, '');

  // Ensure we have PageComponent
  if (!cleanedCode.includes('PageComponent')) {
    // Try to find the main function and rename it
    cleanedCode = cleanedCode.replace(/function\s+Page\s*\(/g, 'function PageComponent(');
    
    // If still no PageComponent, wrap in one
    if (!cleanedCode.includes('PageComponent')) {
      // Find first function declaration
      const funcMatch = cleanedCode.match(/function\s+(\w+)\s*\(/);
      if (funcMatch) {
        cleanedCode = cleanedCode.replace(
          new RegExp(`function\\s+${funcMatch[1]}\\s*\\(`), 
          'function PageComponent('
        );
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"><\/script>
  
  <script type="text/babel" data-presets="react">
    // Framer motion mock - handles all animation props gracefully
    const motion = new Proxy({}, {
      get: function(target, prop) {
        return React.forwardRef(function MotionComponent(props, ref) {
          const { 
            initial, animate, exit, whileHover, whileTap, whileInView, whileFocus, whileDrag,
            transition, variants, viewport, layout, layoutId, drag, dragConstraints,
            onAnimationStart, onAnimationComplete, onUpdate, onDragStart, onDrag, onDragEnd,
            style = {}, className, children, ...rest 
          } = props;
          return React.createElement(prop, { ...rest, style, className, ref }, children);
        });
      }
    });
    
    const AnimatePresence = function({ children }) { return children; };
    const useInView = function() { return [null, true]; };
    const useAnimation = function() { return { start: function(){}, stop: function(){} }; };
    const useScroll = function() { return { scrollY: { get: function() { return 0; } }, scrollYProgress: { get: function() { return 0; } } }; };
    const useTransform = function(val, input, output) { return output ? output[0] : 0; };
    const useSpring = function(val) { return val; };
    const useMotionValue = function(val) { return { get: function() { return val; }, set: function(){} }; };
    
    // Lucide icons helper with better icon support
    function createLucideIcon(name) {
      return function IconComponent(props) {
        const { className = '', size = 24, strokeWidth = 2, color, ...rest } = props || {};
        const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        
        return React.createElement('span', {
          className: className + ' inline-flex items-center justify-center',
          style: { width: size, height: size, color: color },
          ...rest,
          ref: function(node) {
            if (node && typeof lucide !== 'undefined') {
              var iconData = lucide.icons[kebabName] || lucide.icons[name.toLowerCase()] || lucide.icons['circle'];
              if (iconData) {
                try {
                  node.innerHTML = iconData.toSvg({ 
                    width: size, 
                    height: size,
                    'stroke-width': strokeWidth,
                    class: ''
                  });
                } catch(e) {
                  node.innerHTML = '';
                }
              }
            }
          }
        });
      };
    }
    
    // Define all common icons
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
      'Lightbulb','Megaphone','Gift','Party','Cake','Balloon','Verified','BadgeCheck','Medal','Award',
      'Flame','Fire','Bolt','Power','Battery','BatteryCharging','Gauge','Compass','Navigation','Map',
      'Car','Truck','Bike','Train','Plane','Ship','Anchor','Flag','Mountain','Trees','Tree','Waves',
      'Infinity','Hash','AtSign','Asterisk','Quote','Type','Bold','Italic','Underline','AlignLeft','AlignCenter','AlignRight',
      'List','ListOrdered','CheckSquare','SquareCheck','CircleCheck','BadgeX','Ban','Slash',
      'Volume','Volume1','Volume2','VolumeX','Maximize','Maximize2','Minimize','Minimize2','Move','Grab',
      'Hand','HandMetal','Pointer','MousePointer','MousePointer2','Cursor','Touch','Fingerprint',
      'QrCode','Barcode','Scan','ScanLine','Focus','Crosshair','Aperture','Camera','CameraOff',
      'Printer','Save','Copy','Clipboard','ClipboardCheck','ClipboardList','ClipboardCopy',
      'Calendar','CalendarDays','CalendarCheck','CalendarClock','Timer','TimerOff','Hourglass','Watch','Stopwatch',
      'Repeat','Repeat1','Shuffle','SkipBack','SkipForward','Rewind','FastForward',
      'Mic','MicOff','Radio','Podcast','Rss','Cast','Airplay','Tv','Monitor','Projector',
      'Gamepad','Gamepad2','Joystick','Dices','Puzzle','Crown','Swords','Shield','ShieldAlert','ShieldOff'
    ];
    
    iconNames.forEach(function(name) {
      window[name] = createLucideIcon(name);
    });
    
    // React hooks
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useRef = React.useRef;
    var useCallback = React.useCallback;
    var useMemo = React.useMemo;
    var useContext = React.useContext;
    var createContext = React.createContext;
    var Fragment = React.Fragment;

    // Generated component code
    ${cleanedCode}

    // Render with error boundary
    try {
      if (typeof PageComponent === 'undefined') {
        throw new Error('PageComponent não foi encontrado no código gerado');
      }
      var root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(PageComponent));
    } catch (e) {
      console.error('Render error:', e);
      document.getElementById('root').innerHTML = '<div style="padding: 40px; color: #ef4444; background: #0f172a; min-height: 100vh;"><h2 style="margin-bottom: 16px; font-size: 18px;">Erro ao renderizar</h2><pre style="background: #1e293b; padding: 16px; border-radius: 8px; overflow: auto; font-size: 12px; color: #f87171;">' + e.message + '</pre><p style="margin-top: 16px; color: #94a3b8; font-size: 14px;">Tente gerar novamente ou simplifique o prompt.</p></div>';
    }
  <\/script>
</body>
</html>`;
}
