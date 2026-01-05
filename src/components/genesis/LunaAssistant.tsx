import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  ImageIcon, 
  X, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User,
  Loader2,
  FileText,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Zap,
  MessageSquare,
  Lightbulb,
  Code,
  HelpCircle,
  Rocket,
  Plus,
  History,
  Trash2,
  ChevronRight,
  Brain,
  Wand2,
  TrendingUp,
  Shield,
  Settings2,
  ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import lunaAvatar from '@/assets/luna-avatar.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  isTyping?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  size?: number;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

const CAPABILITIES = [
  { 
    icon: Brain, 
    title: 'Assistente Inteligente',
    description: 'Respondo suas dúvidas sobre automação e estratégias de negócio',
    color: 'from-violet-500 to-purple-600'
  },
  { 
    icon: Wand2, 
    title: 'Criador de Fluxos',
    description: 'Ajudo a projetar automações complexas de WhatsApp',
    color: 'from-blue-500 to-cyan-600'
  },
  { 
    icon: TrendingUp, 
    title: 'Análise de Dados',
    description: 'Analiso prints, documentos e métricas do seu negócio',
    color: 'from-emerald-500 to-teal-600'
  },
  { 
    icon: Shield, 
    title: 'Suporte Técnico',
    description: 'Resolvo problemas e otimizo suas configurações',
    color: 'from-orange-500 to-amber-600'
  },
];

const QUICK_PROMPTS = [
  { icon: MessageSquare, label: 'Criar bot de atendimento', prompt: 'Quero criar um bot de atendimento ao cliente para WhatsApp. Me ajude a planejar o fluxo.' },
  { icon: Lightbulb, label: 'Dicas de automação', prompt: 'Quais são as melhores práticas para criar automações eficientes no WhatsApp?' },
  { icon: Code, label: 'Ajuda com fluxos', prompt: 'Preciso de ajuda para entender como funciona o Flow Builder e seus componentes.' },
  { icon: Rocket, label: 'Escalar vendas', prompt: 'Como posso usar automações para aumentar minhas vendas e converter mais leads?' },
];

export function LunaAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleFileUpload = useCallback((files: FileList | null, type: 'image' | 'file') => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
      
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} muito grande. Máximo: ${type === 'image' ? '10MB' : '25MB'}`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachments(prev => [...prev, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type,
          url: e.target?.result as string,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const startNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'Nova conversa',
      preview: '',
      timestamp: new Date(),
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (customPrompt?: string) => {
    const messageText = customPrompt || input.trim();
    if (!messageText && attachments.length === 0) return;
    
    // Auto-create conversation if needed
    if (!activeConversation) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: messageText.slice(0, 30) + (messageText.length > 30 ? '...' : ''),
        preview: messageText.slice(0, 50),
        timestamp: new Date(),
        messages: []
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversation(newConv.id);
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);
    
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }]);
    
    try {
      let contextMessage = messageText;
      if (userMessage.attachments?.length) {
        const attachmentInfo = userMessage.attachments
          .map(a => `[${a.type === 'image' ? '🖼️ Imagem' : '📄 Arquivo'}: ${a.name}]`)
          .join(', ');
        contextMessage = `${messageText}\n\n[Anexos: ${attachmentInfo}]`;
      }
      
      const conversationHistory = messages
        .filter(m => !m.isTyping)
        .map(m => ({ role: m.role, content: m.content }));
      
      const { data, error } = await supabase.functions.invoke('flow-ai-builder', {
        body: {
          prompt: contextMessage,
          conversationHistory,
          context: {
            mode: 'assistant',
            hasAttachments: !!userMessage.attachments?.length,
            attachmentTypes: userMessage.attachments?.map(a => a.type) || []
          }
        }
      });
      
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      if (error) throw error;
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.message || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation preview
      if (activeConversation) {
        setConversations(prev => prev.map(c => 
          c.id === activeConversation 
            ? { ...c, preview: messageText.slice(0, 50), timestamp: new Date() }
            : c
        ));
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Ops! Algo deu errado. Por favor, tente novamente em alguns instantes. 😅',
        timestamp: new Date()
      }]);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  }, [input, attachments, messages, activeConversation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveConversation(null);
    toast.success('Conversa limpa!');
  }, []);

  const copyMessage = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    
    if (message.isTyping) {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 py-6 px-4"
        >
          <Avatar className="w-9 h-9 border border-primary/20 shrink-0">
            <AvatarImage src={lunaAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Luna</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Pensando...</span>
            </div>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group py-6 px-4 transition-colors",
          isUser && "bg-muted/30"
        )}
      >
        <div className="max-w-3xl mx-auto flex gap-4">
          <Avatar className={cn(
            "w-9 h-9 shrink-0 border",
            isUser ? "border-secondary/50" : "border-primary/20"
          )}>
            {isUser ? (
              <AvatarFallback className="bg-gradient-to-br from-secondary/50 to-secondary/30">
                <User className="w-4 h-4" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={lunaAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{isUser ? 'Você' : 'Luna'}</span>
              <span className="text-xs text-muted-foreground">
                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map(attachment => (
                  <div key={attachment.id} className="relative">
                    {attachment.type === 'image' ? (
                      <div className="w-48 h-32 rounded-xl overflow-hidden border bg-muted">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-32">{attachment.name}</p>
                          {attachment.size && (
                            <p className="text-xs text-muted-foreground">{formatBytes(attachment.size)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Message content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {/* Actions */}
            {!isUser && (
              <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copyMessage(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 relative"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Avatar className="w-16 h-16">
              <AvatarImage src={lunaAvatar} />
              <AvatarFallback className="bg-primary/10">
                <Sparkles className="w-8 h-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-3">
            Olá! Sou a <span className="text-primary">Luna</span> 🌙
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sua assistente de IA na Genesis. Posso ajudar com automações, 
            tirar dúvidas e analisar seus arquivos.
          </p>
        </div>
        
        {/* Capabilities Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {CAPABILITIES.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="h-full border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                    cap.color
                  )}>
                    <cap.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{cap.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Quick Prompts */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Comece com uma sugestão:</p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_PROMPTS.map((prompt, index) => (
              <motion.button
                key={prompt.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => sendMessage(prompt.prompt)}
                className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <prompt.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{prompt.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-xl overflow-hidden border">
      {/* Sidebar - Conversation History */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r bg-muted/20 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b">
              <Button 
                onClick={startNewConversation}
                className="w-full gap-2 justify-start"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Nova Conversa
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setActiveConversation(conv.id);
                          setMessages(conv.messages);
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-lg transition-colors group",
                          activeConversation === conv.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{conv.preview}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversations(prev => prev.filter(c => c.id !== conv.id));
                              if (activeConversation === conv.id) {
                                setActiveConversation(null);
                                setMessages([]);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
                onClick={clearChat}
              >
                <Trash2 className="w-4 h-4" />
                Limpar tudo
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-primary/20">
                <AvatarImage src={lunaAvatar} />
                <AvatarFallback className="bg-primary/10">
                  <Sparkles className="w-4 h-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-sm font-semibold">Luna IA</h2>
                <p className="text-xs text-muted-foreground">Online • Pronta para ajudar</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearChat}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpar conversa</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Messages or Empty State */}
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <ScrollArea ref={scrollRef} className="flex-1">
            <div className="divide-y divide-border/50">
              {messages.map((msg, idx) => renderMessage(msg, idx))}
            </div>
          </ScrollArea>
        )}
        
        {/* Attachments Preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-muted/20 px-4 py-3"
            >
              <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
                {attachments.map(attachment => (
                  <motion.div
                    key={attachment.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative group"
                  >
                    {attachment.type === 'image' ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border">
                        <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm truncate max-w-20">{attachment.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input Area */}
        <div className="border-t p-4 bg-card/30 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 rounded-2xl border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              {/* File Upload Buttons */}
              <div className="flex gap-1 shrink-0">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files, 'image')}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files, 'file')}
                />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar imagem</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar arquivo</TooltipContent>
                </Tooltip>
              </div>
              
              {/* Text Input */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte qualquer coisa..."
                className="flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 text-[15px] py-2.5 px-2"
                disabled={isLoading}
              />
              
              {/* Send Button */}
              <Button
                size="sm"
                className="h-9 w-9 p-0 rounded-xl shrink-0"
                onClick={() => sendMessage()}
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              Luna pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
