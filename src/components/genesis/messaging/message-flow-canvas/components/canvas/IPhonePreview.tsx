// iPhone 16 Pro Preview Component
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
  { id: '4', type: 'received', content: 'Ótimo! Temos várias opções disponíveis. Selecione uma:', time: '10:31' },
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
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-2xl"
        >
          <Smartphone className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "fixed right-6 top-1/2 -translate-y-1/2 z-50",
        className
      )}
    >
      {/* iPhone 16 Pro Frame */}
      <div className="relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="absolute -left-12 top-4 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-card z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* iPhone Frame */}
        <div className="relative w-[280px] h-[580px] bg-[#1a1a1a] rounded-[45px] p-[10px] shadow-[0_0_0_3px_#2a2a2a,0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          {/* Dynamic Island */}
          <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-20" />
          
          {/* Screen */}
          <div className="relative w-full h-full bg-[#0b141a] rounded-[38px] overflow-hidden">
            {/* Status Bar */}
            <div className="h-[48px] flex items-end justify-between px-6 pb-1 text-white text-xs font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C8.5 3 5.5 4.6 3.7 7.1L5.1 8.5C6.6 6.4 9.1 5 12 5s5.4 1.4 6.9 3.5l1.4-1.4C18.5 4.6 15.5 3 12 3z"/>
                  <path d="M12 7c-2.5 0-4.7 1.2-6 3l1.4 1.4c1-1.4 2.7-2.4 4.6-2.4s3.6 1 4.6 2.4L18 10c-1.3-1.8-3.5-3-6-3z"/>
                  <path d="M12 11c-1.5 0-2.8.7-3.6 1.8l1.4 1.4c.5-.7 1.3-1.2 2.2-1.2s1.7.5 2.2 1.2l1.4-1.4c-.8-1.1-2.1-1.8-3.6-1.8z"/>
                  <circle cx="12" cy="16" r="2"/>
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <rect x="20" y="10" width="2" height="4" rx="0.5" fill="currentColor"/>
                  <rect x="4" y="9" width="12" height="6" rx="1" fill="currentColor"/>
                </svg>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="h-[56px] bg-[#1f2c34] flex items-center px-2 gap-2">
              <ChevronLeft className="w-6 h-6 text-[#00a884]" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25d366] to-[#128c7e] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm font-medium truncate">{contactName}</h3>
                <p className="text-[#8696a0] text-xs">online</p>
              </div>
              <Video className="w-5 h-5 text-[#aebac1]" />
              <Phone className="w-5 h-5 text-[#aebac1] ml-4" />
              <MoreVertical className="w-5 h-5 text-[#aebac1] ml-4" />
            </div>

            {/* Chat Background */}
            <div 
              className="flex-1 h-[calc(100%-48px-56px-56px)] overflow-y-auto p-3 space-y-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0b141a'
              }}
            >
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex",
                      message.type === 'sent' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] px-3 py-2 rounded-lg text-sm relative",
                        message.type === 'sent' 
                          ? 'bg-[#005c4b] text-white rounded-tr-none' 
                          : 'bg-[#202c33] text-white rounded-tl-none'
                      )}
                    >
                      <p className="break-words leading-relaxed">{message.content}</p>
                      <span className="text-[10px] text-[#8696a0] float-right mt-1 ml-2">
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
            <div className="h-[56px] bg-[#1f2c34] flex items-center px-2 gap-2">
              <Smile className="w-6 h-6 text-[#8696a0]" />
              <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Mensagem"
                  className="w-full bg-transparent text-white text-sm placeholder:text-[#8696a0] focus:outline-none"
                />
              </div>
              <Camera className="w-6 h-6 text-[#8696a0]" />
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
                {inputValue ? (
                  <Send className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-white/30 rounded-full" />
        </div>

        {/* Reflection/Shine effect */}
        <div className="absolute inset-0 rounded-[45px] pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
};

IPhonePreview.displayName = 'IPhonePreview';
