import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, FileText, Target, Layers, Shield, CheckSquare, BarChart, Send,
  Copy, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AICommandPanelProps {
  isGenerating: boolean;
  streamContent: string;
  outputs: { type: string; title: string; content: string }[];
  onGenerate: (type: string, instruction?: string) => void;
}

const QUICK_ACTIONS = [
  { type: 'analyze', label: 'Analisar Canvas', icon: BarChart, desc: 'IA analisa tudo' },
  { type: 'prompt', label: 'Gerar Prompt', icon: FileText, desc: 'Prompt completo' },
  { type: 'scope', label: 'Escopo Técnico', icon: Layers, desc: 'Escopo detalhado' },
  { type: 'blueprint', label: 'Blueprint', icon: Target, desc: 'Arquitetura técnica' },
  { type: 'strategy', label: 'Estratégia', icon: Shield, desc: 'Estratégia comercial' },
  { type: 'checklist', label: 'Checklist', icon: CheckSquare, desc: 'Tarefas organizadas' },
  { type: 'executive', label: 'Resumo', icon: FileText, desc: 'Resumo executivo' },
];

export const AICommandPanel = ({ isGenerating, streamContent, outputs, onGenerate }: AICommandPanelProps) => {
  const [customInstruction, setCustomInstruction] = useState('');
  const [activeOutput, setActiveOutput] = useState<number | null>(null);

  const handleCustomGenerate = () => {
    if (!customInstruction.trim()) return;
    onGenerate('prompt', customInstruction);
    setCustomInstruction('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Actions */}
      <div className="p-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Ações IA</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.type}
                whileTap={{ scale: 0.95 }}
                disabled={isGenerating}
                onClick={() => onGenerate(action.type)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left disabled:opacity-40"
              >
                <Icon className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-[10px] text-white/70 truncate">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Instruction */}
      <div className="p-3 border-b border-white/5">
        <div className="flex gap-1.5">
          <input
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
            placeholder="Instrução personalizada..."
            className="flex-1 h-8 px-2.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
          />
          <Button
            size="sm"
            disabled={isGenerating || !customInstruction.trim()}
            onClick={handleCustomGenerate}
            className="h-8 w-8 p-0 bg-primary/20 hover:bg-primary/30 border-0"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Stream / Output */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isGenerating && streamContent && (
          <div className="p-3 bg-white/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Gerando...</span>
            </div>
            <div className="text-xs text-white/70 prose prose-invert prose-xs max-w-none">
              <ReactMarkdown>{streamContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {outputs.map((output, i) => (
          <div key={i} className="group">
            <button
              onClick={() => setActiveOutput(activeOutput === i ? null : i)}
              className="w-full flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-medium text-white/80">{output.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); copyToClipboard(output.content); }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Copy className="w-3 h-3 text-white/40" />
              </button>
            </button>
            {activeOutput === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-1 p-3 bg-white/5 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto"
              >
                <div className="text-xs text-white/70 prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{output.content}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {!isGenerating && outputs.length === 0 && !streamContent && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-xs text-white/30">Use as ações acima ou<br />escreva uma instrução</p>
          </div>
        )}
      </div>
    </div>
  );
};
