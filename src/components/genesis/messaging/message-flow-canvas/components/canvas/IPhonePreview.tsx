// iPhone 16 Pro Preview Component - Positioned center-right with proper dimensions
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronLeft, Phone, Video, MoreVertical, Smile, Mic, Camera, Send, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'sent' | 'received';
  content: string;
  time: string;
}

interface IPhonePreviewProps {
  messages?: Message[];
  contactName?: string;
  className?: string;
}

const defaultMessages: Message[] = [
  { id: '1', type: 'received', content: 'Olá! 👋 Bem-vindo ao nosso atendimento automático.', time: '10:30' },
  { id: '2', type: 'received', content: 'Como posso ajudar você hoje?', time: '10:30' },
  { id: '3', type: 'sent', content: 'Quero saber sobre os serviços', time: '10:31' },
  { id: '4', type: 'received', content: 'Ótimo! Temos várias opções disponíveis:', time: '10:31' },
  { id: '5', type: 'received', content: '1️⃣ Plano Básico\n2️⃣ Plano Pro\n3️⃣ Plano Enterprise', time: '10:31' },
  { id: '6', type: 'sent', content: 'Me conta mais sobre o Pro', time: '10:32' },
];

export const IPhonePreview = ({ 
  messages = defaultMessages, 
  contactName = 'Atendimento Bot',
  className 
}: IPhonePreviewProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed right-6 top-[50%] -translate-y-1/2 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:scale-110 transition-transform"
        >
          <Smartphone className="w-7 h-7" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "fixed right-6 top-[50%] -translate-y-1/2 z-50",
        className
      )}
    >
      {/* iPhone 16 Pro Frame - Larger Size */}
      <div className="relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="absolute -left-14 top-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-xl hover:bg-card z-10 transition-all hover:scale-110"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Label */}
        <div className="absolute -left-14 top-20 -rotate-90 origin-right">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Preview ao vivo</span>
        </div>

        {/* iPhone Frame - Titanium Look */}
        <div className="relative w-[340px] h-[720px] bg-gradient-to-b from-[#3a3a3c] via-[#2c2c2e] to-[#1c1c1e] rounded-[55px] p-[12px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]">
          {/* Titanium border effect */}
          <div className="absolute inset-0 rounded-[55px] border border-white/10" />
          
          {/* Dynamic Island */}
          <div className="absolute top-[20px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-20 flex items-center justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#1a1a1a] ring-1 ring-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#0f3a24] ring-1 ring-[#22c55e]/30" />
          </div>
          
          {/* Screen */}
          <div className="relative w-full h-full bg-[#0b141a] rounded-[46px] overflow-hidden">
            {/* Status Bar */}
            <div className="h-[55px] flex items-end justify-between px-8 pb-2 text-white text-sm font-semibold">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C8.5 3 5.5 4.6 3.7 7.1L5.1 8.5C6.6 6.4 9.1 5 12 5s5.4 1.4 6.9 3.5l1.4-1.4C18.5 4.6 15.5 3 12 3z"/>
                  <path d="M12 7c-2.5 0-4.7 1.2-6 3l1.4 1.4c1-1.4 2.7-2.4 4.6-2.4s3.6 1 4.6 2.4L18 10c-1.3-1.8-3.5-3-6-3z"/>
                  <path d="M12 11c-1.5 0-2.8.7-3.6 1.8l1.4 1.4c.5-.7 1.3-1.2 2.2-1.2s1.7.5 2.2 1.2l1.4-1.4c-.8-1.1-2.1-1.8-3.6-1.8z"/>
                  <circle cx="12" cy="16" r="2"/>
                </svg>
                <svg className="w-6 h-5" viewBox="0 0 25 12" fill="currentColor">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35"/>
                  <rect x="23" y="3.5" width="1.5" height="5" rx="0.5" fill="currentColor" opacity="0.4"/>
                  <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/>
                </svg>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="h-[65px] bg-[#1f2c34] flex items-center px-3 gap-3 border-b border-black/20">
              <ChevronLeft className="w-7 h-7 text-[#00a884]" />
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-base font-medium truncate">{contactName}</h3>
                <p className="text-[#8696a0] text-sm">online</p>
              </div>
              <Video className="w-6 h-6 text-[#aebac1]" />
              <Phone className="w-6 h-6 text-[#aebac1] ml-5" />
              <MoreVertical className="w-6 h-6 text-[#aebac1] ml-5" />
            </div>

            {/* Chat Background */}
            <div 
              className="flex-1 h-[calc(100%-55px-65px-65px)] overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0b141a'
              }}
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                    className={cn(
                      "flex",
                      message.type === 'sent' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm relative shadow-sm",
                        message.type === 'sent' 
                          ? 'bg-[#005c4b] text-white rounded-tr-none' 
                          : 'bg-[#202c33] text-white rounded-tl-none'
                      )}
                    >
                      <p className="break-words leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <span className="text-[11px] text-[#8696a0] float-right mt-1.5 ml-3">
                        {message.time}
                        {message.type === 'sent' && (
                          <span className="ml-1 text-[#53bdeb]">✓✓</span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Bar */}
            <div className="h-[65px] bg-[#1f2c34] flex items-center px-3 gap-3 border-t border-black/20">
              <Smile className="w-7 h-7 text-[#8696a0]" />
              <div className="flex-1 bg-[#2a3942] rounded-full px-5 py-3 flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Mensagem"
                  className="w-full bg-transparent text-white text-sm placeholder:text-[#8696a0] focus:outline-none"
                />
              </div>
              <Camera className="w-7 h-7 text-[#8696a0]" />
              <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                {inputValue ? (
                  <Send className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-white/30 rounded-full" />
        </div>

        {/* Subtle reflection */}
        <div className="absolute inset-0 rounded-[55px] pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
};

IPhonePreview.displayName = 'IPhonePreview';
