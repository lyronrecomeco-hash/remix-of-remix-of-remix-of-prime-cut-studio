import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles, Send, Loader2, Cpu, LayoutGrid, MessageSquare,
  Bot, User, Clock3, Wand2, ScrollText, Braces, ClipboardList, Rocket,
  Search, LineChart, MessageCircleMore, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import type { EngineNode } from '../types';
import type { EngineAIActivityLog, EngineAIMessage } from '../hooks/useEngineAI';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AICommandPanelProps {
  isGenerating: boolean;
  outputs: { type: string; title: string; content: string }[];
  onGenerate: (type: string, instruction?: string) => void;
  messages: EngineAIMessage[];
  activityLog: EngineAIActivityLog[];
  prospectName?: string;
  nodes?: EngineNode[];
  lastActionType?: string | null;
  onAutoArrange?: () => void;
  onOpenWhatsApp?: () => void;
  onApproval?: (approved: boolean) => void;
}

const QUICK_ACTIONS = [
  { type: 'build_structure', label: 'Montar canvas', icon: Wand2 },
  { type: 'analyze', label: 'Analisar', icon: LineChart },
  { type: 'enrich_context', label: 'Enriquecer', icon: Search },
  { type: 'strategy', label: 'Estratégia', icon: MessageCircleMore },
  { type: 'scope', label: 'Escopo', icon: ScrollText },
  { type: 'blueprint', label: 'Blueprint', icon: Braces },
  { type: 'prompt', label: 'Build spec', icon: Sparkles },
  { type: 'checklist', label: 'Checklist', icon: ClipboardList },
  { type: 'deploy_plan', label: 'Entrega', icon: Rocket },
];

export const AICommandPanel = ({
  isGenerating, outputs, onGenerate, messages, activityLog, prospectName,
  nodes = [], lastActionType, onAutoArrange, onOpenWhatsApp, onApproval,
}: AICommandPanelProps) => {
  const [customInstruction, setCustomInstruction] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const canvasInfo = useMemo(() => {
    const blockTypes = nodes.map(n => n.data?.nodeType).filter(Boolean);
    const hasStructure = blockTypes.length > 3;
    const filledBlocks = nodes.filter(n => n.data?.content?.trim()).length;
    return { blockCount: nodes.length, hasStructure, filledBlocks };
  }, [nodes]);

  const quickActions = useMemo(() => {
    if (!canvasInfo.hasStructure) {
      return QUICK_ACTIONS.filter((a) => ['build_structure', 'enrich_context', 'analyze'].includes(a.type));
    }
    return QUICK_ACTIONS;
  }, [canvasInfo.hasStructure]);

  const recentLogs = useMemo(() => activityLog.slice(-6).reverse(), [activityLog]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, recentLogs]);

  const handleCustomGenerate = () => {
    if (!customInstruction.trim()) return;
    onGenerate('chat', customInstruction.trim());
    setCustomInstruction('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-white/80">Copiloto do Engine</h3>
            {prospectName && <p className="text-[10px] text-white/30 truncate">{prospectName}</p>}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/20">
            <span>{canvasInfo.blockCount} blocos</span>
            <span>•</span>
            <span>{canvasInfo.filledBlocks} preenchidos</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isActive = lastActionType === action.type && isGenerating;
            return (
              <button
                key={action.type}
                disabled={isGenerating}
                onClick={() => onGenerate(action.type)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] transition-colors ${
                  isActive
                    ? 'border-primary/30 bg-primary/12 text-primary'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white/80'
                }`}
              >
                <Icon className="h-3 w-3" />
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 text-[10px] text-white/25">
          <span>{outputs.length} doc(s) gerado(s)</span>
          <div className="flex items-center gap-2">
            {onAutoArrange && canvasInfo.hasStructure && (
              <button onClick={onAutoArrange} className="inline-flex items-center gap-1 hover:text-white/60 transition-colors">
                <LayoutGrid className="w-3 h-3" /> Organizar
              </button>
            )}
            {onOpenWhatsApp && (
              <button onClick={onOpenWhatsApp} className="inline-flex items-center gap-1 hover:text-white/60 transition-colors">
                <MessageSquare className="w-3 h-3" /> WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-3">
          {/* Empty state */}
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center">
              <Bot className="mx-auto mb-3 h-8 w-8 text-primary/70" />
              <p className="text-sm font-medium text-white/75">Converse com o Copiloto</p>
              <p className="mt-1 text-xs leading-relaxed text-white/30">
                Descreva sua ideia, peça estratégia, análise ou qualquer ajuda. A IA entende sua intenção.
              </p>
            </div>
          ) : messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[92%] rounded-2xl border px-3 py-2.5 ${message.role === 'user' ? 'border-primary/25 bg-primary/12 text-white/90' : 'border-white/[0.06] bg-white/[0.03] text-white/75'}`}>
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-white/30">
                  {message.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary/80" />}
                  <span>{message.role === 'user' ? 'Você' : message.title}</span>
                  {message.isStreaming && <Loader2 className="h-3 w-3 animate-spin text-primary/80" />}
                </div>

                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{message.content}</p>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none break-words leading-relaxed [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-xs [&_li]:my-0.5 [&_p]:my-2 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{message.content || (message.isStreaming ? 'Pensando...' : '')}</ReactMarkdown>
                  </div>
                )}

                {/* Approval Buttons */}
                {message.pendingApproval && onApproval && (
                  <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onApproval(true)}
                      disabled={isGenerating}
                      className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 flex-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onApproval(false)}
                      disabled={isGenerating}
                      className="h-8 rounded-lg text-xs gap-1.5 flex-1 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reprovar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] p-3 flex-shrink-0">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5">
          <textarea
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCustomGenerate();
              }
            }}
            rows={2}
            placeholder="Descreva sua ideia, peça análise, estratégia ou qualquer coisa..."
            className="min-h-[56px] w-full resize-none bg-transparent px-1 text-xs text-white/80 placeholder:text-white/22 focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
            <span className="text-[10px] text-white/22">Enter envia • Shift+Enter quebra linha</span>
            <Button
              size="sm"
              disabled={isGenerating || !customInstruction.trim()}
              onClick={handleCustomGenerate}
              className="h-9 rounded-xl bg-primary/20 px-3 text-white hover:bg-primary/30 border border-primary/20 hover:border-primary/40"
            >
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
