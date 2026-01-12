import { ReactNode } from 'react';
import { Bot, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WhatsAppScreenProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  inputArea?: ReactNode;
}

const WhatsAppScreen = ({ title, subtitle = 'online', icon, children, inputArea }: WhatsAppScreenProps) => {
  return (
    <div className="h-[520px] flex flex-col bg-[#0b141a]">
      {/* Status Bar */}
      <div className="bg-[#1f2c33] px-4 pt-10 pb-2 flex items-center justify-between shrink-0">
        <span className="text-white text-xs font-medium">9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>
          </svg>
          <div className="w-5 h-2.5 border border-white/60 rounded-sm relative">
            <div className="absolute inset-[1px] right-[3px] bg-white/80 rounded-sm" />
            <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-white/60 rounded-r" />
          </div>
        </div>
      </div>

      {/* WhatsApp Header */}
      <div className="bg-[#1f2c33] px-3 py-2 flex items-center gap-3 border-b border-[#2a3942] shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
          {icon || <Bot className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm truncate">{title}</span>
            <Badge className="bg-primary/20 text-primary text-[9px] border-primary/30 shrink-0 px-1.5">IA</Badge>
          </div>
          <span className="text-xs text-primary">{subtitle}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Input Area */}
      {inputArea || (
        <div className="bg-[#1f2c33] px-3 py-2 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
            <span className="text-sm text-[#8696a0]">Mensagem</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppScreen;
