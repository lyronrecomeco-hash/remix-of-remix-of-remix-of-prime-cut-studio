import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Bot, CheckCheck, 
  Play, Pause, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import phoneMockup from '@/assets/phone-mockup.png';

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Scroll only inside messages container - NOT the page
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

  // Auto-play when in view (only once)
  useEffect(() => {
    if (isInView && !hasStarted) {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasStarted]);

  const handlePlay = () => {
    if (currentIndex >= conversationScript.length) {
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
    <section id="demo-whatsapp" ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

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
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <MessageSquare className="w-4 h-4" />
            Conversa Real
            <Badge variant="secondary" className="ml-1 text-[10px] bg-primary/20 text-primary border-primary/30">AO VIVO</Badge>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            Veja a Genesis
            <br />
            <span className="text-primary">em ação</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma conversa <span className="text-foreground font-semibold">real</span> entre um cliente e a Luna IA.
            <br className="hidden md:block" />
            Atendimento automático, natural e que <span className="text-primary font-semibold">converte</span>.
          </p>
        </motion.div>

        <div className="max-w-[320px] mx-auto">
          {/* Realistic Phone Frame */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Phone Image Container */}
            <div className="relative">
              {/* Phone Frame Image */}
              <img 
                src={phoneMockup} 
                alt="Phone" 
                className="w-full h-auto relative z-10 pointer-events-none"
              />
              
              {/* Screen Content - Positioned inside the phone */}
              <div className="absolute inset-[4%] top-[3%] bottom-[3%] rounded-[32px] overflow-hidden bg-[#0b141a]">
                {/* Status Bar */}
                <div className="bg-[#1f2c33] px-4 py-2 flex items-center justify-between">
                  <span className="text-white text-xs font-medium">14:32</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-white/60 rounded-sm">
                      <div className="w-2/3 h-full bg-white/60 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Header */}
                <div className="bg-[#1f2c33] px-3 py-2 flex items-center gap-2 border-b border-[#2a3942]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white text-xs truncate">Clínica Estética</span>
                      <Badge className="bg-primary/20 text-primary text-[8px] border-primary/30 shrink-0 px-1">IA</Badge>
                    </div>
                    <span className="text-[10px] text-primary">online</span>
                  </div>
                </div>

                {/* Messages Container - Fixed height, internal scroll */}
                <div 
                  ref={messagesContainerRef}
                  className="h-[340px] overflow-y-auto overflow-x-hidden p-2 space-y-1.5"
                  style={{ 
                    backgroundColor: '#0b141a',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h60v60H0z" fill="%230b141a"/%3E%3Cpath d="M30 5v50M5 30h50" stroke="%231a2e35" stroke-width="0.3"/%3E%3C/svg%3E")',
                    backgroundSize: '60px 60px'
                  }}
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-lg px-2 py-1.5 shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-[#005c4b] text-white rounded-tr-none' 
                            : 'bg-[#1f2c33] text-white rounded-tl-none'
                        }`}
                      >
                        <p className="text-[11px] whitespace-pre-line leading-relaxed">{msg.content}</p>
                        
                        {/* Buttons */}
                        {msg.buttons && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.buttons.map((btn, i) => (
                              <span 
                                key={i} 
                                className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/30"
                              >
                                {btn}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className="text-[8px] text-[#8696a0]">{msg.time}</span>
                          {msg.role === 'user' && (
                            <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
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
                        <div className="bg-[#1f2c33] rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8696a0] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input Bar */}
                <div className="bg-[#1f2c33] px-2 py-1.5 flex items-center gap-1.5 border-t border-[#2a3942]">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5">
                    <span className="text-[10px] text-[#8696a0]">Mensagem</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#00a884] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Below Phone */}
            <div className="flex justify-center gap-3 mt-6">
              {isPlaying ? (
                <Button onClick={handlePause} variant="outline" size="sm" className="gap-2">
                  <Pause className="w-4 h-4" />
                  Pausar
                </Button>
              ) : (
                <Button onClick={handlePlay} size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  {currentIndex >= conversationScript.length ? 'Replay' : 'Iniciar'}
                </Button>
              )}
              <Button onClick={handleReset} variant="ghost" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6 text-center">
              <div>
                <div className="text-xl font-bold text-primary">~3s</div>
                <div className="text-[10px] text-muted-foreground">Resposta</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">97%</div>
                <div className="text-[10px] text-muted-foreground">Resolução</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">24/7</div>
                <div className="text-[10px] text-muted-foreground">Disponível</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VendaRealWhatsApp;
