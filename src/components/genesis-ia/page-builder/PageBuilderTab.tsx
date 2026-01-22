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
  Palette,
  Code,
  Cpu,
  Layers,
  Zap,
  Globe
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

// Loading Animation Component - Genesis Theme
const GeneratingAnimation = () => {
  const steps = [
    { icon: Code, text: 'Analisando prompt...', delay: 0 },
    { icon: Cpu, text: 'Processando com IA...', delay: 1.5 },
    { icon: Layers, text: 'Estruturando componentes...', delay: 3 },
    { icon: Zap, text: 'Aplicando estilos...', delay: 4.5 },
    { icon: Globe, text: 'Finalizando página...', delay: 6 },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Animated Orbs */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl"
        animate={{
          x: [0, 50, 0, -50, 0],
          y: [0, -30, 0, 30, 0],
          scale: [1, 1.1, 1, 0.9, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl"
        animate={{
          x: [0, -40, 0, 40, 0],
          y: [0, 40, 0, -40, 0],
          scale: [1, 0.9, 1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/50 rounded-full"
          initial={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: 0.3,
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            opacity: [0.3, 0.8, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30" />
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wand2 className="w-10 h-10 text-purple-400" />
          </div>
          
          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-emerald-400"
              style={{
                top: '50%',
                left: '50%',
                marginTop: -4,
                marginLeft: -4,
              }}
              animate={{
                x: [0, Math.cos(i * Math.PI / 2) * 50],
                y: [0, Math.sin(i * Math.PI / 2) * 50],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold text-white mb-2"
        >
          Construindo sua página
        </motion.h2>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isPast = idx < currentStep;
            
            return (
              <motion.div
                key={idx}
                animate={{
                  scale: isActive ? 1.2 : 1,
                  opacity: isActive ? 1 : isPast ? 0.6 : 0.3,
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/30 border border-emerald-500/50' 
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <StepIcon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-white/40'}`} />
              </motion.div>
            );
          })}
        </div>

        {/* Current Step Text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-emerald-400 font-medium"
          >
            {steps[currentStep].text}
          </motion.p>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </div>
        </div>

        <p className="text-xs text-white/40 mt-4">
          Isso pode levar até 30 segundos...
        </p>
      </div>
    </div>
  );
};

// Empty Preview State
const EmptyPreviewState = () => (
  <div className="h-full flex items-center justify-center relative overflow-hidden">
    {/* Subtle Grid */}
    <div className="absolute inset-0 opacity-10">
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
      >
        <Eye className="w-7 h-7 text-white/20" />
      </motion.div>
      <p className="text-sm text-white/40 mb-1">Área de Preview</p>
      <p className="text-xs text-white/25">Envie uma mensagem para gerar sua página</p>
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

  // Empty State
  if (messages.length === 0 && !currentCode) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
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
      {/* Top Toolbar */}
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
            className={`h-8 gap-1.5 text-xs ${showCode ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            disabled={!currentCode}
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
                    
                    {/* Enhanced Loading State in Chat */}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 rounded-xl p-3 border border-purple-500/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <Wand2 className="w-4 h-4 text-purple-400" />
                            </div>
                            <motion.div
                              className="absolute -inset-1 rounded-lg bg-purple-500/20"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-white mb-1">Gerando sua página...</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                                  initial={{ width: '0%' }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 20, ease: "linear" }}
                                />
                              </div>
                              <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                            </div>
                            <p className="text-[10px] text-white/40 mt-1">A IA está criando código React + Tailwind</p>
                          </div>
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
              {isGenerating ? (
                <GeneratingAnimation />
              ) : currentCode ? (
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
                <EmptyPreviewState />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

// HTML Preview Generator - Fixed version
function generateHtmlPreview(code: string): string {
  // Clean imports and exports
  let cleanedCode = code
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]framer-motion['"];?\n?/g, '')
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]lucide-react['"];?\n?/g, '')
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]react['"];?\n?/g, '')
    .replace(/import\s+React\s+from\s+['"]react['"];?\n?/g, '');

  // Fix export default
  cleanedCode = cleanedCode
    .replace(/export\s+default\s+function\s+(\w+)/g, 'function PageComponent')
    .replace(/export\s+default\s+(\w+);?\s*$/gm, '')
    .replace(/export\s+default\s+/g, 'const PageComponent = ');

  // Ensure we have PageComponent
  if (!cleanedCode.includes('PageComponent') && cleanedCode.includes('function Page')) {
    cleanedCode = cleanedCode.replace(/function\s+Page\s*\(/g, 'function PageComponent(');
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
      }
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
  
  <script type="text/babel" data-presets="react">
    // Framer motion mock
    const motion = new Proxy({}, {
      get: function(target, prop) {
        return React.forwardRef(function(props, ref) {
          const { initial, animate, whileHover, whileTap, whileInView, transition, variants, exit, viewport, ...rest } = props;
          return React.createElement(prop, Object.assign({}, rest, { ref: ref }));
        });
      }
    });
    
    const AnimatePresence = function(props) { return props.children; };
    const useInView = function() { return [null, true]; };
    const useAnimation = function() { return {}; };
    
    // Lucide icons helper
    function createLucideIcon(name) {
      return function(props) {
        var className = props.className || '';
        var size = props.size || 24;
        var kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        
        return React.createElement('span', {
          className: className + ' inline-flex items-center justify-center',
          style: { width: size, height: size },
          ref: function(node) {
            if (node && typeof lucide !== 'undefined') {
              var iconData = lucide.icons[kebabName] || lucide.icons[name.toLowerCase()];
              if (iconData) {
                node.innerHTML = iconData.toSvg({ class: className, width: size, height: size });
              }
            }
          }
        });
      };
    }
    
    // Define all icons
    var iconNames = ['Sparkles','Rocket','Star','Heart','Check','CheckCircle','ArrowRight','ArrowUpRight','Play','Shield','ShieldCheck','Zap','Crown','Trophy','Target','Users','Globe','Mail','Phone','MapPin','Calendar','Clock','ChevronRight','ChevronDown','ChevronLeft','ChevronUp','Menu','X','Instagram','Twitter','Facebook','Linkedin','Github','Youtube','CreditCard','Wallet','BarChart','TrendingUp','Award','Headphones','MessageCircle','Send','Image','Camera','Video','Music','Mic','Code','Terminal','Laptop','Smartphone','Monitor','Wifi','Cloud','Lock','Key','Eye','Settings','Bell','Search','Home','Building','Store','ShoppingCart','ShoppingBag','Package','Box','Layers','Grid','Layout','Palette','Brush','Scissors','Coffee','Utensils','Wine','Beer','Pizza','Cake','Apple','Leaf','Sun','Moon','Umbrella','Droplet','Flame','Wind','ThumbsUp','ThumbsDown','MessageSquare','Share','Link','ExternalLink','Download','Upload','File','FileText','Folder','Trash','Edit','Pencil','Plus','Minus','ArrowLeft','ArrowUp','ArrowDown','RefreshCw','Loader','AlertCircle','AlertTriangle','Info','HelpCircle','XCircle','Circle','Square','Diamond','Gem','Wand','Wand2','Briefcase','GraduationCap','BookOpen','Bookmark','Tag','DollarSign','Percent','Activity','PieChart','LineChart','Database','Server','Cpu','Bot','Brain','Lightbulb','Megaphone','Gift','BadgeCheck','Medal','Fire','Verified'];
    
    iconNames.forEach(function(name) {
      window[name] = createLucideIcon(name);
    });
    
    // React hooks
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useRef = React.useRef;
    var useCallback = React.useCallback;
    var useMemo = React.useMemo;

    // Generated component code
    ${cleanedCode}

    // Render
    try {
      var root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(PageComponent));
    } catch (e) {
      console.error('Render error:', e);
      document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Erro ao renderizar: ' + e.message + '</div>';
    }
  </script>
</body>
</html>`;
}
