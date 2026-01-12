import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Bot, Check, CheckCheck, 
  Play, Pause, RotateCcw, Sparkles, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  time: string;
  buttons?: string[];
}

const conversationScript: Message[] = [
  { id: '1', role: 'user', content: 'Oi, boa tarde!', time: '14:32' },
  { id: '2', role: 'bot', content: '👋 Olá! Seja bem-vindo(a) à *Clínica Estética Premium*!\n\nSou a *Luna*, sua assistente virtual. Estou aqui para ajudar você a agendar consultas, tirar dúvidas e muito mais!\n\nComo posso ajudar hoje?', time: '14:32', buttons: ['📅 Agendar', '💰 Preços', '📍 Localização', '👤 Falar com Atendente'] },
  { id: '3', role: 'user', content: '📅 Agendar', time: '14:33' },
  { id: '4', role: 'bot', content: 'Perfeito! 🎉 Vamos agendar sua consulta.\n\nQual procedimento você tem interesse?', time: '14:33', buttons: ['💆 Limpeza de Pele', '💉 Botox', '✨ Peeling', '🔮 Outros'] },
  { id: '5', role: 'user', content: '💉 Botox', time: '14:34' },
  { id: '6', role: 'bot', content: 'Excelente escolha! 💉\n\nPara o procedimento de *Botox*, temos as seguintes datas disponíveis:\n\n📅 *Segunda 15/01* - 10h, 14h, 16h\n📅 *Terça 16/01* - 9h, 11h, 15h\n📅 *Quarta 17/01* - 10h, 14h\n\nQual data e horário você prefere?', time: '14:34' },
  { id: '7', role: 'user', content: 'Terça às 15h', time: '14:35' },
  { id: '8', role: 'bot', content: '✅ *Agendamento confirmado!*\n\n📋 *Resumo:*\n• Procedimento: Botox\n• Data: Terça, 16/01/2024\n• Horário: 15:00\n• Local: Av. Paulista, 1000\n\nVocê receberá um lembrete 24h antes!\n\n_Posso ajudar com mais alguma coisa?_', time: '14:35', buttons: ['✅ Está ótimo!', '📝 Remarcar'] },
  { id: '9', role: 'user', content: '✅ Está ótimo!', time: '14:36' },
  { id: '10', role: 'bot', content: '😊 Maravilha! Seu agendamento foi salvo.\n\nAté terça! Qualquer dúvida, é só me chamar aqui.\n\n_Atendimento por IA - Luna Genesis_ 🤖✨', time: '14:36' },
];

const VendaRealWhatsApp = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Play conversation
  useEffect(() => {
    if (!isPlaying || currentIndex >= conversationScript.length) {
      if (currentIndex >= conversationScript.length) {
        setIsPlaying(false);
      }
      return;
    }

    const nextMessage = conversationScript[currentIndex];
    
    if (nextMessage.role === 'bot') {
      setShowTyping(true);
      const typingDelay = setTimeout(() => {
        setShowTyping(false);
        setMessages(prev => [...prev, nextMessage]);
        setCurrentIndex(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(typingDelay);
    } else {
      const delay = setTimeout(() => {
        setMessages(prev => [...prev, nextMessage]);
        setCurrentIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [isPlaying, currentIndex]);

  // Auto-play when in view
  useEffect(() => {
    if (isInView && messages.length === 0) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, messages.length]);

  const handlePlay = () => {
    if (currentIndex >= conversationScript.length) {
      // Reset and play again
      setMessages([]);
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setMessages([]);
    setCurrentIndex(0);
    setShowTyping(false);
  };

  return (
    <section id="demo" ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-green-500/10 border border-green-500/20 text-green-500"
          >
            <MessageSquare className="w-4 h-4" />
            Conversa Real
            <Badge variant="secondary" className="ml-1 text-[10px] bg-green-500/20 text-green-500 border-green-500/30">AO VIVO</Badge>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Veja a Genesis
            <br />
            <span className="text-green-500">em ação</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma conversa <span className="text-foreground font-semibold">real</span> entre um cliente e a Luna IA.
            <br className="hidden md:block" />
            Atendimento automático, natural e que <span className="text-green-500 font-semibold">converte</span>.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto">
          {/* iPhone Frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-2 border-border/80 shadow-2xl shadow-black/20 rounded-[2.5rem] bg-black p-3">
              {/* iPhone Notch */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-10" />
              </div>

              {/* WhatsApp Container */}
              <div className="rounded-[2rem] overflow-hidden bg-[#0b141a]">
                {/* WhatsApp Header */}
                <div className="bg-[#1f2c33] px-4 py-3 flex items-center gap-3 border-b border-[#2a3942]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">Clínica Estética Premium</span>
                      <Badge className="bg-green-500/20 text-green-400 text-[9px] border-green-500/30">IA</Badge>
                    </div>
                    <span className="text-xs text-green-400">online • Luna IA ativa</span>
                  </div>
                  <Phone className="w-5 h-5 text-[#8696a0]" />
                </div>

                {/* Messages Container */}
                <div 
                  className="h-[450px] overflow-y-auto p-4 space-y-3"
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h60v60H0z" fill="%230b141a"/%3E%3Cpath d="M30 5v50M5 30h50" stroke="%231a2e35" stroke-width="0.5"/%3E%3C/svg%3E")',
                    backgroundSize: '60px 60px'
                  }}
                >
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#005c4b] text-white rounded-tr-none' 
                            : 'bg-[#1f2c33] text-white rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                        
                        {/* Buttons */}
                        {msg.buttons && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.buttons.map((btn, i) => (
                              <span 
                                key={i} 
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/30"
                              >
                                {btn}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-[#8696a0]">{msg.time}</span>
                          {msg.role === 'user' && (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {showTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="bg-[#1f2c33] rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="bg-[#1f2c33] px-3 py-2 flex items-center gap-2 border-t border-[#2a3942]">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                    <span className="text-sm text-[#8696a0]">Digite uma mensagem</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Controls */}
            <div className="flex justify-center gap-3 mt-6">
              {isPlaying ? (
                <Button onClick={handlePause} variant="outline" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pausar
                </Button>
              ) : (
                <Button onClick={handlePlay} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4" />
                  {currentIndex >= conversationScript.length ? 'Replay' : 'Iniciar'}
                </Button>
              )}
              <Button onClick={handleReset} variant="ghost" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8 text-center">
              <div>
                <div className="text-2xl font-bold text-green-500">~3s</div>
                <div className="text-xs text-muted-foreground">Tempo de resposta</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">97%</div>
                <div className="text-xs text-muted-foreground">Taxa de resolução</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">24/7</div>
                <div className="text-xs text-muted-foreground">Disponibilidade</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VendaRealWhatsApp;
