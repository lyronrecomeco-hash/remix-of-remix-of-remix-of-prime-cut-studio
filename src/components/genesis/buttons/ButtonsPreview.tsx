import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCheck, List as ListIcon, ChevronRight, ExternalLink } from 'lucide-react';
import { InteractiveMessage, MessageType } from './types';

interface ButtonsPreviewProps {
  message: InteractiveMessage;
}

export function ButtonsPreview({ message }: ButtonsPreviewProps) {
  const [isListOpen, setIsListOpen] = useState(false);

  // Parse WhatsApp formatting
  const parseFormatting = (text: string) => {
    let parsed = text;
    // Bold: *text*
    parsed = parsed.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    // Italic: _text_
    parsed = parsed.replace(/_([^_]+)_/g, '<em>$1</em>');
    // Strikethrough: ~text~
    parsed = parsed.replace(/~([^~]+)~/g, '<del>$1</del>');
    // Line breaks
    parsed = parsed.replace(/\n/g, '<br/>');
    return parsed;
  };

  const formattedMessage = parseFormatting(message.text || 'Digite sua mensagem...');

  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="w-[300px] h-[520px] bg-[#0b141a] rounded-[2rem] p-2.5 shadow-2xl border-4 border-[#1f2c34]">
        {/* Notch */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0b141a] rounded-b-xl z-10" />
        
        {/* Screen */}
        <div className="w-full h-full rounded-[1.5rem] overflow-hidden flex flex-col bg-[#0b141a]">
          {/* WhatsApp Header */}
          <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Genesis</p>
              <p className="text-[#8696a0] text-[10px]">online</p>
            </div>
          </div>

          {/* Chat Area */}
          <div 
            className="flex-1 p-2.5 overflow-y-auto"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#0b141a',
            }}
          >
            {/* Message Bubble */}
            <div className="max-w-[90%] ml-auto">
              <div className="bg-[#005c4b] rounded-lg rounded-tr-none p-2.5 shadow-sm">
                {/* Message Content */}
                <div 
                  className="text-[#e9edef] text-[13px] whitespace-pre-wrap break-words leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formattedMessage }}
                />
                
                {/* Footer */}
                {message.footer && (
                  <p className="text-[#8696a0] text-[10px] mt-1.5 pt-1.5 border-t border-[#ffffff15]">
                    {message.footer}
                  </p>
                )}

                {/* Timestamp & Checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-[#8696a0]">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>

              {/* Reply Buttons (for buttons type) */}
              {message.type === 'buttons' && message.buttons.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {message.buttons.map((btn) => (
                    <button
                      key={btn.id}
                      className={cn(
                        "w-full bg-[#1f2c34] text-[#00a884] text-[13px] font-medium py-2 px-3 rounded-lg",
                        "hover:bg-[#2a3942] transition-all",
                        "border border-[#2a3942] flex items-center justify-center gap-2"
                      )}
                    >
                      {btn.type === 'url' && <ExternalLink className="w-3.5 h-3.5" />}
                      {btn.text || 'Botão'}
                    </button>
                  ))}
                </div>
              )}

              {/* URL Button (for url type) */}
              {message.type === 'url' && message.buttons.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  {message.buttons.filter(b => b.type === 'url').map((btn) => (
                    <button
                      key={btn.id}
                      className={cn(
                        "w-full bg-[#1f2c34] text-[#00a884] text-[13px] font-medium py-2 px-3 rounded-lg",
                        "hover:bg-[#2a3942] transition-all",
                        "border border-[#2a3942] flex items-center justify-center gap-2"
                      )}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {btn.text || 'Acessar'}
                    </button>
                  ))}
                </div>
              )}

              {/* List Button (for list type) */}
              {message.type === 'list' && message.listSections.length > 0 && (
                <button
                  onClick={() => setIsListOpen(true)}
                  className="w-full mt-1.5 bg-[#1f2c34] text-[#00a884] text-[13px] font-medium py-2 px-3 rounded-lg hover:bg-[#2a3942] transition-all border border-[#2a3942] flex items-center justify-center gap-2"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                  {message.buttonText || 'Ver opções'}
                </button>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#1f2c34] px-2.5 py-2 flex items-center gap-2">
            <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5">
              <span className="text-[#8696a0] text-xs">Mensagem</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* List Modal Overlay */}
      {isListOpen && (
        <div 
          className="absolute inset-0 bg-black/50 flex items-end justify-center rounded-[2rem] overflow-hidden"
          onClick={() => setIsListOpen(false)}
        >
          <div 
            className="w-full bg-[#1f2c34] rounded-t-xl max-h-[60%] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* List Header */}
            <div className="px-3 py-2 border-b border-[#2a3942]">
              <p className="text-white font-medium text-center text-sm">{message.buttonText || 'Opções'}</p>
            </div>
            
            {/* List Sections */}
            <div className="overflow-y-auto max-h-[200px]">
              {message.listSections.map((section) => (
                <div key={section.id}>
                  <p className="px-3 py-1.5 text-[#00a884] text-[10px] font-medium uppercase tracking-wider bg-[#182229]">
                    {section.title || 'Seção'}
                  </p>
                  {section.rows.map((row) => (
                    <button
                      key={row.id}
                      onClick={() => setIsListOpen(false)}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[#2a3942] transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="text-white text-[13px]">{row.title || 'Opção'}</p>
                        {row.description && (
                          <p className="text-[#8696a0] text-[10px] mt-0.5">{row.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8696a0]" />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
