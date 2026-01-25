import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Video, 
  Sparkles, 
  Copy, 
  Check,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const TikTokScriptGenerator = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `🎬 **Gerador de Roteiros TikTok**

Olá! Sou seu assistente especializado em criar roteiros virais para TikTok focados em promover a **Genesis IA**.

Me conte sobre o vídeo que você quer criar:
• Qual o objetivo? (atrair leads, mostrar funcionalidade, prova social)
• Qual estilo? (tutorial, POV, antes/depois, talking head)
• Duração desejada? (15s, 30s, 60s)
• Tem algum gancho específico em mente?

Vou criar um roteiro completo com:
✅ Gancho inicial (primeiros 3 segundos)
✅ Desenvolvimento com retenção
✅ CTA poderoso para conversão

⚠️ **Importante:** Este gerador é exclusivo para conteúdo profissional da Genesis IA. Não são aceitos pedidos de conteúdo ofensivo, discriminatório ou inapropriado.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Filtrar mensagem de boas-vindas (primeira mensagem do assistant)
      const chatHistory = messages.filter((m, i) => !(i === 0 && m.role === 'assistant'));
      
      const response = await supabase.functions.invoke('tiktok-script-generator', {
        body: { 
          messages: [...chatHistory, { role: 'user', content: userMessage }]
        }
      });

      if (response.error) throw response.error;

      const assistantMessage = response.data?.response || 'Desculpe, não consegui gerar o roteiro. Tente novamente.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error('Erro ao gerar roteiro');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Roteiro copiado!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
      content: `🎬 **Gerador de Roteiros TikTok**

Olá! Sou seu assistente especializado em criar roteiros virais para TikTok focados em promover a **Genesis IA**.

Me conte sobre o vídeo que você quer criar:
• Qual o objetivo? (atrair leads, mostrar funcionalidade, prova social)
• Qual estilo? (tutorial, POV, antes/depois, talking head)
• Duração desejada? (15s, 30s, 60s)
• Tem algum gancho específico em mente?

Vou criar um roteiro completo com:
✅ Gancho inicial (primeiros 3 segundos)
✅ Desenvolvimento com retenção
✅ CTA poderoso para conversão

⚠️ **Importante:** Este gerador é exclusivo para conteúdo profissional da Genesis IA. Não são aceitos pedidos de conteúdo ofensivo, discriminatório ou inapropriado.`
      }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 overflow-hidden" style={{ borderRadius: '14px' }}>
      {/* Header */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">Gerador de Roteiros</h4>
            <p className="text-xs text-white/60">IA especializada em scripts virais</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="h-9 px-3 text-white/60 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="h-[350px] overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 ${
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-white/5 border border-white/10'
                }`}
                style={{ borderRadius: '12px' }}
              >
                <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                {msg.role === 'assistant' && index > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(msg.content, index)}
                    className="mt-3 h-7 px-3 text-xs text-white/50 hover:text-white"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-primary" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copiar roteiro
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Criando roteiro viral...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva o vídeo que quer criar..."
            className="min-h-[48px] max-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-[48px] w-[48px] p-0 bg-primary hover:bg-primary/80"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-white/50 mt-3 text-center">
          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
          Roteiros focados em promover a Genesis IA
        </p>
      </div>
    </div>
  );
};
