// =====================================================
// WHATSAPP PREVIEW PANEL - Simulação real do fluxo
// Posicionado no canto superior direito estilo Android Studio
// =====================================================

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  Send,
  Check,
  CheckCheck,
  Mic,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Bot,
  RotateCcw,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FlowNode, FlowEdge } from './types';

interface Message {
  id: string;
  type: 'sent' | 'received';
  content: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  isButtons?: boolean;
  buttons?: { id: string; text: string }[];
  isList?: boolean;
  listTitle?: string;
  listItems?: { id: string; title: string; description?: string }[];
  isMedia?: boolean;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
}

interface WhatsAppPreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FlowNode[];
  edges?: FlowEdge[];
  selectedNode?: FlowNode | null;
  onSimulateResponse?: (response: string) => void;
}

export const WhatsAppPreviewPanel = memo(({ 
  isOpen, 
  onClose, 
  nodes,
  edges = [],
  selectedNode,
  onSimulateResponse
}: WhatsAppPreviewPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isWaitingInput, setIsWaitingInput] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Find the start node
  const findStartNode = useCallback(() => {
    return nodes.find(n => 
      n.data.type === 'trigger' || 
      n.data.type === 'wa_start'
    );
  }, [nodes]);

  // Find next node from edges
  const findNextNode = useCallback((currentId: string, handleId?: string) => {
    const edge = edges.find(e => {
      if (e.source === currentId) {
        if (handleId) return e.sourceHandle === handleId;
        return true;
      }
      return false;
    });
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target);
  }, [edges, nodes]);

  // Process a single node
  const processNode = useCallback(async (node: FlowNode): Promise<{ waitForInput: boolean; inputType?: string }> => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const config = node.data.config || {};

    switch (node.data.type) {
      case 'wa_send_text':
      case 'message':
        setIsTyping(true);
        await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
        setIsTyping(false);
        
        const textContent = config.message || node.data.label || 'Mensagem do bot';
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          type: 'received',
          content: textContent,
          time,
          status: 'read'
        }]);

        // Check for media attachment
        if (config.mediaUrl) {
          await new Promise(r => setTimeout(r, 300));
          setMessages(prev => [...prev, {
            id: `media-${Date.now()}`,
            type: 'received',
            content: '',
            time,
            status: 'read',
            isMedia: true,
            mediaType: config.mediaType || 'image',
            mediaUrl: config.mediaUrl
          }]);
        }
        return { waitForInput: false };

      case 'wa_send_buttons':
        setIsTyping(true);
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        setIsTyping(false);

        const buttonMsg = config.message || 'Escolha uma opção:';
        const buttons = config.buttons || [
          { id: 'btn1', text: 'Opção 1' },
          { id: 'btn2', text: 'Opção 2' }
        ];

        setMessages(prev => [...prev, {
          id: `btns-${Date.now()}`,
          type: 'received',
          content: buttonMsg,
          time,
          status: 'read',
          isButtons: true,
          buttons: buttons.map((b: any, i: number) => ({ 
            id: b.id || `btn-${i}`, 
            text: b.text || b.label || `Botão ${i + 1}` 
          }))
        }]);
        return { waitForInput: config.waitForResponse !== false, inputType: 'button' };

      case 'wa_send_list':
        setIsTyping(true);
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        setIsTyping(false);

        const listMsg = config.message || 'Selecione uma opção:';
        const sections = config.sections || [{ items: [{ id: 'item1', title: 'Item 1' }] }];
        const allItems = sections.flatMap((s: any) => s.items || []);

        setMessages(prev => [...prev, {
          id: `list-${Date.now()}`,
          type: 'received',
          content: listMsg,
          time,
          status: 'read',
          isList: true,
          listTitle: config.buttonText || 'Ver opções',
          listItems: allItems.map((item: any, i: number) => ({
            id: item.id || `item-${i}`,
            title: item.title || `Item ${i + 1}`,
            description: item.description
          }))
        }]);
        return { waitForInput: true, inputType: 'list' };

      case 'wa_wait_response':
      case 'wa_receive':
        return { waitForInput: true, inputType: config.responseType || 'text' };

      case 'delay':
        const delayMs = (config.delay || 1) * 1000;
        await new Promise(r => setTimeout(r, Math.min(delayMs, 3000)));
        return { waitForInput: false };

      case 'condition':
        // For simulation, always take the "yes" path
        return { waitForInput: false };

      default:
        return { waitForInput: false };
    }
  }, []);

  // Run simulation from a starting node
  const runSimulation = useCallback(async (startNode: FlowNode) => {
    setIsSimulationRunning(true);
    setCurrentNodeId(startNode.id);
    
    let currentNode: FlowNode | null | undefined = startNode;
    
    while (currentNode) {
      const result = await processNode(currentNode);
      
      if (result.waitForInput) {
        setIsWaitingInput(true);
        setCurrentNodeId(currentNode.id);
        setIsSimulationRunning(false);
        return; // Pause and wait for user input
      }

      // Find next node
      const nextNode = findNextNode(currentNode.id, 
        currentNode.data.type === 'condition' ? 'yes' : undefined
      );
      
      if (!nextNode) break;
      
      currentNode = nextNode;
      setCurrentNodeId(nextNode.id);
      
      // Small delay between nodes
      await new Promise(r => setTimeout(r, 200));
    }
    
    setIsSimulationRunning(false);
    setCurrentNodeId(null);
  }, [processNode, findNextNode]);

  // Continue simulation after user input
  const continueAfterInput = useCallback((userResponse: string) => {
    if (!currentNodeId) return;

    // Add user message
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'sent',
      content: userResponse,
      time,
      status: 'read'
    }]);

    setIsWaitingInput(false);
    onSimulateResponse?.(userResponse);

    // Find next node and continue
    const currentNode = nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    const nextNode = findNextNode(currentNodeId);
    if (nextNode) {
      setTimeout(() => runSimulation(nextNode), 500);
    }
  }, [currentNodeId, nodes, findNextNode, runSimulation, onSimulateResponse]);

  // Start simulation
  const startSimulation = useCallback(() => {
    setMessages([]);
    setIsWaitingInput(false);
    setCurrentNodeId(null);
    
    const startNode = findStartNode();
    if (startNode) {
      // Find the first connected node after start
      const firstNode = findNextNode(startNode.id);
      if (firstNode) {
        runSimulation(firstNode);
      } else {
        // If no connection, try to run from start node itself
        runSimulation(startNode);
      }
    } else if (nodes.length > 0) {
      // No start node, run from first message node
      const firstMsgNode = nodes.find(n => 
        ['wa_send_text', 'wa_send_buttons', 'wa_send_list', 'message'].includes(n.data.type)
      );
      if (firstMsgNode) {
        runSimulation(firstMsgNode);
      }
    }
  }, [findStartNode, findNextNode, nodes, runSimulation]);

  // Auto-start on open
  useEffect(() => {
    if (isOpen && nodes.length > 0 && messages.length === 0) {
      const timer = setTimeout(startSimulation, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, nodes.length]);

  // Handle user text input
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    continueAfterInput(inputValue.trim());
    setInputValue('');
  };

  // Handle button/list click
  const handleInteractiveClick = (text: string) => {
    continueAfterInput(text);
  };

  // Reset simulation
  const resetSimulation = () => {
    setMessages([]);
    setIsWaitingInput(false);
    setCurrentNodeId(null);
    setIsSimulationRunning(false);
    setTimeout(startSimulation, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          "max-md:inset-0 max-md:right-0 max-md:top-0 max-md:flex max-md:items-center max-md:justify-center max-md:bg-black/60 max-md:backdrop-blur-sm max-md:p-4"
        )}
      >
        {/* Phone Frame */}
        <div className="relative">
          {/* Control buttons */}
          <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={resetSimulation}
                className="h-8 px-3 text-xs bg-background/90 backdrop-blur-sm shadow-md gap-1.5"
                disabled={isSimulationRunning}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </Button>
              {!isSimulationRunning && messages.length === 0 && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={startSimulation}
                  className="h-8 px-3 text-xs shadow-md gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Iniciar
                </Button>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm shadow-md"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Phone Frame - Compact for desktop */}
          <div className="w-[280px] h-[540px] max-md:w-[320px] max-md:h-[600px] bg-black rounded-[36px] p-1.5 shadow-2xl ring-1 ring-white/10">
            <div className="w-full h-full bg-[#0b141a] rounded-[30px] overflow-hidden flex flex-col">
              
              {/* Status Bar */}
              <div className="bg-[#0b141a] px-4 py-1 flex items-center justify-between text-[10px] text-[#8696a0]">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-2 bg-white/80 rounded-sm" />
                    <div className="w-1 h-2.5 bg-white/80 rounded-sm" />
                    <div className="w-1 h-3 bg-white/80 rounded-sm" />
                    <div className="w-1 h-3.5 bg-white/60 rounded-sm" />
                  </div>
                  <span className="ml-1">100%</span>
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="bg-[#1f2c34] px-2 py-1.5 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-[#00a884]" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a884] to-[#25d366] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">Genesis Bot</p>
                  <p className="text-[#8696a0] text-[10px]">
                    {isTyping ? 'digitando...' : isSimulationRunning ? 'online' : 'online'}
                  </p>
                </div>
                <Video className="w-4 h-4 text-[#aebac1]" />
                <Phone className="w-4 h-4 text-[#aebac1] ml-2" />
                <MoreVertical className="w-4 h-4 text-[#aebac1] ml-2" />
              </div>

              {/* Chat Area */}
              <div 
                ref={chatRef}
                className="flex-1 overflow-y-auto p-2 space-y-1.5"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23182229" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  backgroundColor: '#0b141a'
                }}
              >
                {/* Date Chip */}
                <div className="flex justify-center mb-2">
                  <span className="bg-[#1f2c34]/80 text-[#8696a0] text-[9px] px-2.5 py-0.5 rounded-md">
                    Hoje
                  </span>
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "flex",
                      msg.type === 'sent' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[85%] rounded-lg p-1.5 relative text-xs",
                        msg.type === 'sent' 
                          ? 'bg-[#005c4b] rounded-tr-none' 
                          : 'bg-[#1f2c34] rounded-tl-none'
                      )}
                    >
                      {/* Media */}
                      {msg.isMedia && (
                        <div className="mb-1 rounded overflow-hidden bg-[#2a3942] p-4 flex items-center justify-center">
                          <div className="text-[#8696a0] text-[10px]">
                            📷 {msg.mediaType === 'image' ? 'Imagem' : msg.mediaType === 'video' ? 'Vídeo' : 'Arquivo'}
                          </div>
                        </div>
                      )}

                      {/* Text content */}
                      {msg.content && (
                        <p className="text-[#e9edef] text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      )}

                      {/* Interactive Buttons */}
                      {msg.isButtons && msg.buttons && (
                        <div className="mt-1.5 space-y-1">
                          {msg.buttons.map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => isWaitingInput && handleInteractiveClick(btn.text)}
                              disabled={!isWaitingInput}
                              className={cn(
                                "w-full py-1.5 text-[10px] text-[#00a884] border border-[#00a884]/30 rounded transition-colors",
                                isWaitingInput && "hover:bg-[#00a884]/10 cursor-pointer",
                                !isWaitingInput && "opacity-50"
                              )}
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Interactive List */}
                      {msg.isList && msg.listItems && (
                        <div className="mt-1.5 border-t border-[#2a3942] pt-1.5">
                          <p className="text-[10px] text-[#00a884] mb-1">{msg.listTitle}</p>
                          {msg.listItems.slice(0, 3).map((item) => (
                            <button
                              key={item.id}
                              onClick={() => isWaitingInput && handleInteractiveClick(item.title)}
                              disabled={!isWaitingInput}
                              className={cn(
                                "w-full py-1 px-1.5 text-left rounded transition-colors",
                                isWaitingInput && "hover:bg-[#2a3942] cursor-pointer",
                                !isWaitingInput && "opacity-50"
                              )}
                            >
                              <p className="text-[#e9edef] text-[10px]">{item.title}</p>
                              {item.description && (
                                <p className="text-[#8696a0] text-[9px] truncate">{item.description}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Time and Status */}
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        <span className="text-[#8696a0] text-[9px]">{msg.time}</span>
                        {msg.type === 'sent' && (
                          msg.status === 'read' ? (
                            <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                          ) : (
                            <Check className="w-3 h-3 text-[#8696a0]" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#1f2c34] rounded-lg rounded-tl-none p-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                              className="w-1.5 h-1.5 bg-[#8696a0] rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {messages.length === 0 && !isTyping && !isSimulationRunning && (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <MessageSquare className="w-10 h-10 text-[#8696a0]/40 mb-2" />
                    <p className="text-[#8696a0] text-xs mb-3">
                      Clique em "Iniciar" para simular o fluxo
                    </p>
                    <Button
                      size="sm"
                      onClick={startSimulation}
                      className="h-7 px-4 text-[10px] gap-1.5"
                    >
                      <Play className="w-3 h-3" />
                      Simular Fluxo
                    </Button>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="bg-[#1f2c34] px-2 py-1.5 flex items-center gap-1.5">
                <button className="p-1.5 text-[#8696a0] hover:text-white transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="p-1.5 text-[#8696a0] hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isWaitingInput ? "Digite sua resposta..." : "Mensagem"}
                    disabled={!isWaitingInput}
                    className={cn(
                      "w-full bg-transparent text-[#e9edef] text-xs placeholder-[#8696a0] outline-none",
                      !isWaitingInput && "opacity-50"
                    )}
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!isWaitingInput || !inputValue.trim()}
                  className={cn(
                    "p-1.5 transition-colors",
                    isWaitingInput && inputValue.trim() 
                      ? "text-[#00a884]" 
                      : "text-[#8696a0]"
                  )}
                >
                  {inputValue ? (
                    <Send className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

WhatsAppPreviewPanel.displayName = 'WhatsAppPreviewPanel';
