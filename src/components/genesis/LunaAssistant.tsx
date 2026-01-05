import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image, 
  X, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User,
  Loader2,
  FileText,
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Zap,
  MessageSquare,
  Lightbulb,
  Code,
  HelpCircle,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const QUICK_ACTIONS = [
  { icon: Lightbulb, label: 'O que é a Genesis?', prompt: 'Me explique o que é a plataforma Genesis e como ela pode me ajudar.' },
  { icon: MessageSquare, label: 'Criar automação', prompt: 'Quero criar uma automação de WhatsApp para atendimento ao cliente.' },
  { icon: Code, label: 'Ajuda com fluxos', prompt: 'Como funciona o Flow Builder? Me dê dicas de como criar fluxos eficientes.' },
  { icon: HelpCircle, label: 'Tirar dúvidas', prompt: 'Tenho algumas dúvidas sobre como usar a plataforma.' },
  { icon: Rocket, label: 'Dicas de vendas', prompt: 'Me dê dicas de como usar automações para aumentar minhas vendas.' },
  { icon: Zap, label: 'Melhorar bot', prompt: 'Como posso melhorar meu chatbot para ter conversas mais naturais?' },
];

export function LunaAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleFileUpload = useCallback((files: FileList | null, type: 'image' | 'file') => {
    if (!files) return;
    
    const newAttachments: Attachment[] = [];
    
    Array.from(files).forEach(file => {
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 25 * 1024 * 1024; // 10MB images, 25MB files
      
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} muito grande. Máximo: ${type === 'image' ? '10MB' : '25MB'}`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type,
          url: e.target?.result as string,
          size: file.size
        });
        
        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const sendMessage = useCallback(async (customPrompt?: string) => {
    const messageText = customPrompt || input.trim();
    if (!messageText && attachments.length === 0) return;
    
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
    
    // Add typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }]);
    
    try {
      // Build context with attachments
      let contextMessage = messageText;
      if (userMessage.attachments?.length) {
        const attachmentInfo = userMessage.attachments
          .map(a => `[${a.type === 'image' ? '🖼️ Imagem' : '📄 Arquivo'}: ${a.name}]`)
          .join(', ');
        contextMessage = `${messageText}\n\n[Anexos: ${attachmentInfo}]`;
      }
      
      // Build conversation history
      const conversationHistory = messages
        .filter(m => !m.isTyping)
        .map(m => ({
          role: m.role,
          content: m.content
        }));
      
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
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      if (error) throw error;
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.message || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== typingId));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Ops! Algo deu errado. Por favor, tente novamente em alguns instantes. 😅',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  }, [input, attachments, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setAttachments([]);
    toast.success('Conversa limpa!');
  }, []);

  const copyMessage = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copiado!');
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    if (message.isTyping) {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 items-start"
        >
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={lunaAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <Bot className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-primary">Luna</span>
              <Badge variant="secondary" className="text-xs">IA</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
              <span className="text-sm">Pensando...</span>
            </div>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 items-start group",
          isUser && "flex-row-reverse"
        )}
      >
        <Avatar className={cn(
          "w-10 h-10 border-2",
          isUser ? "border-secondary" : "border-primary/20"
        )}>
          {isUser ? (
            <>
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src={lunaAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className={cn("flex-1 max-w-[85%]", isUser && "text-right")}>
          <div className={cn("flex items-center gap-2 mb-1", isUser && "justify-end")}>
            <span className={cn(
              "text-base font-semibold",
              isUser ? "text-foreground" : "text-primary"
            )}>
              {isUser ? 'Você' : 'Luna'}
            </span>
            {!isUser && <Badge variant="secondary" className="text-xs">IA</Badge>}
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn("flex flex-wrap gap-2 mb-2", isUser && "justify-end")}>
              {message.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="relative group/attachment"
                >
                  {attachment.type === 'image' ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/attachment:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs">{attachment.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm truncate max-w-24">{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(attachment.size)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Message content */}
          <div className={cn(
            "rounded-2xl px-4 py-3 inline-block text-left",
            isUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted"
          )}>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
          
          {/* Actions */}
          {!isUser && (
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => copyMessage(message.content, message.id)}
              >
                {copiedId === message.id ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      isFullscreen && "fixed inset-0 z-50 bg-background"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-primary/30">
              <AvatarImage src={lunaAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Sparkles className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">Luna IA</h2>
            <p className="text-sm text-muted-foreground">Sua assistente inteligente</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            disabled={messages.length === 0}
            title="Limpar conversa"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Minimizar' : 'Maximizar'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Avatar className="w-20 h-20">
                  <AvatarImage src={lunaAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Sparkles className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">Olá! Eu sou a Luna 🌙</h3>
              <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                Sua parceira de automação na Genesis. Posso te ajudar com dúvidas, criar fluxos, 
                analisar arquivos e muito mais!
              </p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {QUICK_ACTIONS.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors group"
                      onClick={() => sendMessage(action.prompt)}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <action.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-center">{action.label}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map(renderMessage)}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
      
      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-muted/30 p-3"
          >
            <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
              {attachments.map(attachment => (
                <motion.div
                  key={attachment.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative group"
                >
                  {attachment.type === 'image' ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm truncate max-w-20">{attachment.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="border-t p-4 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            {/* File Upload Buttons */}
            <div className="flex gap-1">
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
              
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                title="Enviar imagem"
              >
                <Image className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Enviar arquivo"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Text Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                className="min-h-[44px] max-h-[150px] resize-none pr-12 text-base"
                disabled={isLoading}
              />
            </div>
            
            {/* Send Button */}
            <Button
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => sendMessage()}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Luna pode analisar imagens, documentos e te ajudar com qualquer dúvida sobre a Genesis.
          </p>
        </div>
      </div>
    </div>
  );
}
