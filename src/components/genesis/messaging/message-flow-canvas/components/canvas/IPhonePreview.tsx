// iPhone Preview Component - Style matching Flow Builder (WhatsAppPreviewPanel)
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Mic, Camera, Send, X, RotateCcw, Play, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MessageEdge, MessageNode } from '../../types';

interface Message {
  id: string;
  type: 'sent' | 'received';
  content: string;
  time: string;
}

interface IPhonePreviewProps {
  /** If provided, takes precedence over flowNodes/flowEdges */
  messages?: Message[];
  /** When provided, preview will be derived from the flow in real-time */
  flowNodes?: MessageNode[];
  flowEdges?: MessageEdge[];
  contactName?: string;
  className?: string;
  onClose?: () => void;
  onRestart?: () => void;
  onStart?: () => void;
  isSimulating?: boolean;
}

const defaultMessages: Message[] = [
  { id: '1', type: 'received', content: 'Olá! 👋 Bem-vindo ao nosso atendimento automático.', time: '10:30' },
  { id: '2', type: 'received', content: 'Como posso ajudar você hoje?', time: '10:30' },
  { id: '3', type: 'sent', content: 'Quero saber sobre os serviços', time: '10:31' },
  { id: '4', type: 'received', content: 'Ótimo! Temos várias opções disponíveis:', time: '10:31' },
  { id: '5', type: 'received', content: '1️⃣ Plano Básico\n2️⃣ Plano Pro\n3️⃣ Plano Enterprise', time: '10:31' },
];

const isTriggerNode = (type: string) =>
  type === 'start-trigger' ||
  type === 'instance-connector' ||
  type === 'webhook-trigger' ||
  type === 'schedule-trigger';

const formatTime = (index: number) => {
  const baseMinutes = 9 * 60 + 41; // 09:41
  const minutes = baseMinutes + index;
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const nodeToPreviewText = (node: MessageNode): string => {
  const cfg = node.data?.config || {};

  switch (node.type) {
    case 'advanced-text':
      return (cfg.message || '').trim();

    case 'button-message': {
      const msg = (cfg.message || '').trim();
      const buttons: any[] = cfg.buttons || [];
      const list = buttons
        .filter((b) => (b?.text || '').trim())
        .map((b, i) => `${i + 1}) ${String(b.text).trim()}`)
        .join('\n');
      return [msg, list].filter(Boolean).join('\n\n');
    }

    case 'list-message': {
      const msg = (cfg.message || '').trim();
      const items: any[] = cfg.items || [];
      const list = items
        .filter((it) => (it?.title || '').trim())
        .map((it, i) => `${i + 1}) ${String(it.title).trim()}`)
        .join('\n');
      return [msg, list].filter(Boolean).join('\n\n');
    }

    case 'poll': {
      const q = (cfg.question || '').trim();
      const opts: any[] = cfg.options || [];
      const list = opts
        .filter((o) => String(o || '').trim())
        .map((o, i) => `${i + 1}) ${String(o).trim()}`)
        .join('\n');
      return [q, list].filter(Boolean).join('\n\n');
    }

    case 'smart-delay': {
      const ms = Number(cfg.delay ?? 2000);
      const seconds = Math.max(0, Math.round(ms / 1000));
      return `⏳ Delay: ${seconds}s`;
    }

    case 'presence':
      return '⌨️ Simulando presença (digitando...)';

    case 'http-request':
      return `🌐 HTTP ${(cfg.method || 'GET').toString().toUpperCase()} ${cfg.url || ''}`.trim();

    case 'set-variable':
      return `🔧 Definir variável: ${cfg.variableName || 'variavel'} = ${cfg.value ?? ''}`.trim();

    case 'end-flow':
      return (cfg.message || '✅ Fim do flow.').trim();

    default:
      return (node.data?.label || '').trim();
  }
};

const buildPreviewMessagesFromFlow = (flowNodes: MessageNode[], flowEdges: MessageEdge[]): Message[] => {
  const byId = new Map(flowNodes.map((n) => [n.id, n] as const));

  const outgoing = new Map<string, MessageEdge[]>();
  for (const e of flowEdges) {
    const arr = outgoing.get(e.source) || [];
    arr.push(e);
    outgoing.set(e.source, arr);
  }

  // deterministic edge ordering (left-to-right)
  for (const [source, arr] of outgoing.entries()) {
    arr.sort((a, b) => {
      const na = byId.get(a.target);
      const nb = byId.get(b.target);
      const ax = na?.position?.x ?? 0;
      const bx = nb?.position?.x ?? 0;
      if (ax !== bx) return ax - bx;
      const ay = na?.position?.y ?? 0;
      const by = nb?.position?.y ?? 0;
      return ay - by;
    });
    outgoing.set(source, arr);
  }

  const startNode =
    flowNodes.find((n) => n.type === 'start-trigger') ||
    flowNodes.find((n) => n.type === 'instance-connector') ||
    flowNodes.find((n) => !isTriggerNode(n.type)) ||
    flowNodes[0];

  if (!startNode) return [];

  const visited = new Set<string>();
  const messages: Message[] = [];

  let currentId: string | undefined = startNode.id;
  let msgIndex = 0;
  let safety = 0;

  while (currentId && safety < 100) {
    safety++;
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const node = byId.get(currentId);
    if (!node) break;

    if (!isTriggerNode(node.type)) {
      const content = nodeToPreviewText(node);
      if (content) {
        messages.push({
          id: `pv_${node.id}`,
          type: 'received',
          content,
          time: formatTime(msgIndex),
        });
        msgIndex++;
      }
    }

    const next = (outgoing.get(currentId) || [])[0];
    currentId = next?.target;
  }

  return messages;
};

export const IPhonePreview = ({ 
  messages,
  flowNodes,
  flowEdges,
  contactName = 'Genesis Bot',
  className,
  onClose,
  onRestart,
  onStart,
  isSimulating = false
}: IPhonePreviewProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const renderedMessages = useMemo(() => {
    if (messages !== undefined) return messages;
    if (flowNodes !== undefined) return buildPreviewMessagesFromFlow(flowNodes, flowEdges || []);
    return defaultMessages;
  }, [messages, flowNodes, flowEdges]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "fixed z-50",
        // Desktop: canto superior direito estilo Android Studio
        "right-4 top-20",
        // Mobile: fullscreen
        "max-md:inset-0 max-md:right-0 max-md:top-0 max-md:flex max-md:items-center max-md:justify-center max-md:bg-black/60 max-md:backdrop-blur-sm max-md:p-4",
        className
      )}
    >
      <div className="relative">
        {/* Control buttons */}
        <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onRestart}
              className="h-8 px-3 text-xs bg-background/90 backdrop-blur-sm shadow-md gap-1.5"
              disabled={isSimulating}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </Button>
            {!isSimulating && renderedMessages.length === 0 && onStart && (
              <Button
                size="sm"
                variant="default"
                onClick={onStart}
                className="h-8 px-3 text-xs shadow-md gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Iniciar
              </Button>
            )}
          </div>
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm shadow-md"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Phone Frame - Compact for desktop */}
        <div className="w-[280px] h-[540px] max-md:w-[320px] max-md:h-[600px] bg-black rounded-[36px] p-1.5 shadow-2xl ring-1 ring-white/10">
          <div className="w-full h-full bg-[#0b141a] rounded-[30px] overflow-hidden flex flex-col">
            
            {/* Status Bar */}
            <div className="bg-[#0b141a] px-4 py-1 flex items-center justify-between text-[10px] text-[#8696a0]">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C8.5 3 5.5 4.6 3.7 7.1L5.1 8.5C6.6 6.4 9.1 5 12 5s5.4 1.4 6.9 3.5l1.4-1.4C18.5 4.6 15.5 3 12 3z"/>
                  <path d="M12 7c-2.5 0-4.7 1.2-6 3l1.4 1.4c1-1.4 2.7-2.4 4.6-2.4s3.6 1 4.6 2.4L18 10c-1.3-1.8-3.5-3-6-3z"/>
                  <circle cx="12" cy="14" r="2"/>
                </svg>
                <svg className="w-5 h-4" viewBox="0 0 25 12" fill="currentColor">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35"/>
                  <rect x="23" y="3.5" width="1.5" height="5" rx="0.5" fill="currentColor" opacity="0.4"/>
                  <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/>
                </svg>
              </div>
            </div>

            {/* WhatsApp Header */}
            <div className="bg-[#1f2c34] px-2 py-1.5 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-[#00a884]" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a884] to-[#25d366] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{contactName}</p>
                <p className="text-[#8696a0] text-[10px]">
                  {isTyping ? 'digitando...' : isSimulating ? 'online' : 'online'}
                </p>
              </div>
              <Video className="w-4 h-4 text-[#aebac1]" />
              <Phone className="w-4 h-4 text-[#aebac1] ml-2" />
              <MoreVertical className="w-4 h-4 text-[#aebac1] ml-2" />
            </div>

            {/* Chat Background */}
            <div 
              className="flex-1 overflow-y-auto p-3 space-y-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#0b141a'
              }}
            >
              <AnimatePresence>
                {renderedMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex",
                      message.type === 'sent' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] px-2.5 py-1.5 rounded-lg text-[13px] relative",
                        message.type === 'sent' 
                          ? 'bg-[#005c4b] text-white rounded-tr-none' 
                          : 'bg-[#202c33] text-white rounded-tl-none'
                      )}
                    >
                      <p className="break-words leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <span className="text-[10px] text-[#8696a0] float-right mt-1 ml-2">
                        {message.time}
                        {message.type === 'sent' && (
                          <span className="ml-0.5 text-[#53bdeb]">✓✓</span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#202c33] rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-[#8696a0] rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#8696a0] rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-[#8696a0] rounded-full"
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <div className="bg-[#1f2c34] flex items-center px-2 py-1.5 gap-2">
              <Smile className="w-5 h-5 text-[#8696a0] flex-shrink-0" />
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Mensagem"
                  className="w-full bg-transparent text-white text-[13px] placeholder:text-[#8696a0] focus:outline-none"
                />
              </div>
              <Camera className="w-5 h-5 text-[#8696a0] flex-shrink-0" />
              <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center flex-shrink-0">
                {inputValue ? (
                  <Send className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

IPhonePreview.displayName = 'IPhonePreview';
