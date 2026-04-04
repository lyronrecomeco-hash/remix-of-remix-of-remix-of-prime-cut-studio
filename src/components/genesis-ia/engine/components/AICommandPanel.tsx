import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, FileText, Target, Layers, Shield, CheckSquare, BarChart, Send,
  Copy, Loader2, Cpu, Zap, ChevronDown, ChevronRight, Terminal, Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AICommandPanelProps {
  isGenerating: boolean;
  streamContent: string;
  outputs: { type: string; title: string; content: string }[];
  onGenerate: (type: string, instruction?: string) => void;
  prospectName?: string;
}

const ACTION_GROUPS = [
  {
    label: 'Análise',
    actions: [
      { type: 'analyze', label: 'Analisar Canvas', icon: BarChart, desc: 'IA analisa todo o contexto' },
      { type: 'build_structure', label: 'Montar Estrutura', icon: Layers, desc: 'Cria blocos automaticamente no canvas' },
    ],
  },
  {
    label: 'Geração',
    actions: [
      { type: 'prompt', label: 'Prompt Completo', icon: Terminal, desc: 'Prompt para construir a solução' },
      { type: 'blueprint', label: 'Blueprint Técnico', icon: Target, desc: 'Arquitetura completa' },
      { type: 'scope', label: 'Escopo Técnico', icon: Layers, desc: 'Escopo detalhado da solução' },
    ],
  },
  {
    label: 'Comercial',
    actions: [
      { type: 'strategy', label: 'Estratégia Comercial', icon: Zap, desc: 'Argumentos e abordagem' },
      { type: 'executive', label: 'Resumo Executivo', icon: FileText, desc: 'Para apresentar ao cliente' },
      { type: 'objections', label: 'Fluxo de Objeções', icon: Shield, desc: 'Objeções e respostas' },
    ],
  },
  {
    label: 'Execução',
    actions: [
      { type: 'checklist', label: 'Checklist', icon: CheckSquare, desc: 'Tarefas organizadas por fase' },
      { type: 'deploy_plan', label: 'Plano de Entrega', icon: Rocket, desc: 'Roadmap de implementação' },
    ],
  },
];

export const AICommandPanel = ({ isGenerating, streamContent, outputs, onGenerate, prospectName }: AICommandPanelProps) => {
  const [customInstruction, setCustomInstruction] = useState('');
  const [activeOutput, setActiveOutput] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 'Análise': true, 'Geração': true });
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamContent]);

  const handleCustomGenerate = () => {
    if (!customInstruction.trim()) return;
    onGenerate('prompt', customInstruction);
    setCustomInstruction('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <div>
            <h3 className="text-xs font-semibold text-white/80">IA Contextual</h3>
            {prospectName && (
              <p className="text-[10px] text-white/30 truncate">{prospectName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Command Input */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex gap-1.5">
          <input
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCustomGenerate()}
            placeholder="Peça algo à IA..."
            className="flex-1 h-9 px-3 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-primary/40 transition-colors"
          />
          <Button
            size="sm"
            disabled={isGenerating || !customInstruction.trim()}
            onClick={handleCustomGenerate}
            className="h-9 w-9 p-0 bg-primary/20 hover:bg-primary/30 border border-primary/20 hover:border-primary/40"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto" ref={streamRef}>
        {/* Stream / Active Generation */}
        {isGenerating && streamContent && (
          <div className="p-3 border-b border-white/[0.06]">
            <div className="p-3 bg-primary/[0.06] border border-primary/[0.12] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[11px] font-medium text-primary">Gerando...</span>
              </div>
              <div className="text-xs text-white/60 prose prose-invert prose-xs max-w-none leading-relaxed">
                <ReactMarkdown>{streamContent}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions - Grouped */}
        <div className="p-3 space-y-1">
          {ACTION_GROUPS.map((group) => (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
              >
                {expandedGroups[group.label] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {group.label}
              </button>
              <AnimatePresence>
                {expandedGroups[group.label] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 pb-2">
                      {group.actions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <motion.button
                            key={action.type}
                            whileTap={{ scale: 0.98 }}
                            disabled={isGenerating}
                            onClick={() => onGenerate(action.type)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left disabled:opacity-30 group"
                          >
                            <div className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                              <Icon className="w-3.5 h-3.5 text-white/40 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors block">{action.label}</span>
                              <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors block truncate">{action.desc}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Outputs History */}
        {outputs.length > 0 && (
          <div className="px-3 pb-3 space-y-1.5">
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-1 pt-2">Histórico</h4>
            {outputs.map((output, i) => (
              <div key={i} className="group">
                <button
                  onClick={() => setActiveOutput(activeOutput === i ? null : i)}
                  className="w-full flex items-center justify-between p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary/60" />
                    <span className="text-xs font-medium text-white/70">{output.title}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(output.content); }}
                    className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3 h-3 text-white/30" />
                  </button>
                </button>
                <AnimatePresence>
                  {activeOutput === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 p-3 bg-white/[0.03] rounded-lg border border-white/[0.05] max-h-[250px] overflow-y-auto">
                        <div className="text-xs text-white/60 prose prose-invert prose-xs max-w-none leading-relaxed">
                          <ReactMarkdown>{output.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && outputs.length === 0 && !streamContent && (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-[11px] text-white/25 leading-relaxed">
              Use as ações ou escreva<br />uma instrução para a IA
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
