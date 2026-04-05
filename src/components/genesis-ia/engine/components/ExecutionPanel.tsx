import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, CheckCircle2, AlertCircle, ArrowRight, Zap, ExternalLink,
  Copy, MessageSquare, Calendar, ChevronDown, ChevronRight, Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import type { EngineNode } from '../types';
import { BUILD_CONNECTORS, type BuildConnector } from '../buildConnectors';
import { buildLovableUrl } from '@/utils/lovable-build-url';

interface ExecutionPanelProps {
  nodes: EngineNode[];
  outputs: { type: string; title: string; content: string }[];
  onGenerate: (type: string, instruction?: string) => void;
  isGenerating: boolean;
  prospectContext: Record<string, unknown>;
}

const CRITICAL_BLOCKS = ['prospect', 'diagnosis', 'pain', 'strategy', 'offer', 'scope', 'structure'];
const RECOMMENDED_BLOCKS = ['opportunity', 'differentials', 'objections', 'approach', 'integrations', 'automation', 'followup', 'checklist', 'deploy', 'prompt'];

interface NextAction {
  label: string;
  description: string;
  icon: React.ElementType;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export const ExecutionPanel = ({ nodes, outputs, onGenerate, isGenerating, prospectContext }: ExecutionPanelProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('readiness');
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  const blockTypes = useMemo(() => nodes.map(n => n.data?.nodeType).filter(Boolean), [nodes]);
  const filledBlocks = useMemo(() => nodes.filter(n => n.data?.content?.trim()), [nodes]);

  // Readiness Score
  const readiness = useMemo(() => {
    let score = 0;
    let total = 0;
    const missing: string[] = [];

    CRITICAL_BLOCKS.forEach(type => {
      total += 10;
      const node = nodes.find(n => n.data?.nodeType === type);
      if (node && node.data?.content?.trim()) {
        score += 10;
      } else if (node) {
        score += 4;
        missing.push(type);
      } else {
        missing.push(type);
      }
    });

    RECOMMENDED_BLOCKS.forEach(type => {
      total += 5;
      const node = nodes.find(n => n.data?.nodeType === type);
      if (node && node.data?.content?.trim()) {
        score += 5;
      } else if (node) {
        score += 2;
      }
    });

    // Bonus for outputs
    if (outputs.some(o => o.type === 'prompt')) { score += 10; total += 10; }
    else { total += 10; }
    if (outputs.some(o => o.type === 'scope')) { score += 5; total += 5; }
    else { total += 5; }
    if (outputs.some(o => o.type === 'blueprint')) { score += 5; total += 5; }
    else { total += 5; }

    const pct = Math.min(100, Math.round((score / total) * 100));
    return { score: pct, missing, filledCount: filledBlocks.length, totalNodes: nodes.length };
  }, [nodes, outputs, filledBlocks]);

  // Next Best Actions
  const nextActions = useMemo<NextAction[]>(() => {
    const actions: NextAction[] = [];

    if (nodes.length <= 3) {
      actions.push({
        label: 'Montar Estrutura',
        description: 'IA monta os blocos estratégicos no canvas',
        icon: Zap,
        action: 'build_structure',
        priority: 'high',
      });
    }

    const hasDiagnosis = nodes.some(n => n.data?.nodeType === 'diagnosis' && n.data?.content?.trim());
    const hasStrategy = nodes.some(n => n.data?.nodeType === 'strategy' && n.data?.content?.trim());
    const hasScope = nodes.some(n => n.data?.nodeType === 'scope' && n.data?.content?.trim());
    const hasPrompt = outputs.some(o => o.type === 'prompt');
    const hasBlueprint = outputs.some(o => o.type === 'blueprint');

    if (!hasDiagnosis && nodes.length > 1) {
      actions.push({ label: 'Preencher Diagnóstico', description: 'Diagnosticar situação do cliente', icon: AlertCircle, action: 'analyze', priority: 'high' });
    }
    if (!hasStrategy && hasDiagnosis) {
      actions.push({ label: 'Gerar Estratégia', description: 'Definir plano comercial de conversão', icon: Zap, action: 'strategy', priority: 'high' });
    }
    if (!hasScope && hasStrategy) {
      actions.push({ label: 'Definir Escopo', description: 'Escopo técnico completo da solução', icon: CheckCircle2, action: 'scope', priority: 'medium' });
    }
    if (!hasBlueprint && hasScope) {
      actions.push({ label: 'Gerar Blueprint', description: 'Arquitetura técnica detalhada', icon: Rocket, action: 'blueprint', priority: 'medium' });
    }
    if (!hasPrompt && readiness.score >= 50) {
      actions.push({ label: 'Gerar Prompt Final', description: 'Consolidar tudo em prompt para build', icon: Rocket, action: 'prompt', priority: readiness.score >= 70 ? 'high' : 'medium' });
    }
    if (hasPrompt && readiness.score >= 60) {
      actions.push({ label: 'Iniciar Build', description: 'Enviar para plataforma de desenvolvimento', icon: ExternalLink, action: 'open_connectors', priority: 'high' });
    }

    return actions.slice(0, 4);
  }, [nodes, outputs, readiness]);

  // Build prompt for a specific connector
  const getPromptForConnector = (connectorId: string): string => {
    const promptOutput = outputs.find(o => o.type === 'prompt');
    if (!promptOutput) return '';

    const connector = BUILD_CONNECTORS.find(c => c.id === connectorId);
    if (!connector) return promptOutput.content;

    // Add connector-specific header
    const header = connector.promptPrefix || '';
    return header ? `${header}\n\n${promptOutput.content}` : promptOutput.content;
  };

  const handleConnectorAction = (connector: BuildConnector) => {
    const promptOutput = outputs.find(o => o.type === 'prompt');

    if (!promptOutput) {
      toast.error('Gere o Prompt Final primeiro antes de enviar para build.');
      return;
    }

    const prompt = getPromptForConnector(connector.id);

    if (connector.id === 'lovable') {
      const url = buildLovableUrl(prompt);
      window.open(url, '_blank');
      toast.success('Abrindo Lovable com o prompt...');
      return;
    }

    if (connector.buildUrl) {
      const url = connector.buildUrl(prompt);
      window.open(url, '_blank');
      toast.success(`Abrindo ${connector.name}...`);
      return;
    }

    // Fallback: copy to clipboard
    navigator.clipboard.writeText(prompt);
    toast.success(`Prompt copiado! Cole no ${connector.name}.`);
    if (connector.url) {
      setTimeout(() => window.open(connector.url, '_blank'), 500);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === 'open_connectors') {
      setExpandedSection('connectors');
      return;
    }
    onGenerate(action);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const scoreColor = readiness.score >= 80 ? 'text-green-400' : readiness.score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const progressColor = readiness.score >= 80 ? 'bg-green-500' : readiness.score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1 p-3">
      {/* Readiness Score */}
      <div>
        <button
          onClick={() => toggleSection('readiness')}
          className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
        >
          {expandedSection === 'readiness' ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Prontidão
        </button>
        <AnimatePresence>
          {expandedSection === 'readiness' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[11px] text-white/60">Execução</span>
                  </div>
                  <span className={`text-sm font-bold ${scoreColor}`}>{readiness.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${readiness.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
                  <span>{readiness.filledCount}/{readiness.totalNodes} blocos preenchidos</span>
                  <span>{outputs.length} saídas geradas</span>
                </div>
                {readiness.missing.length > 0 && readiness.missing.length <= 5 && (
                  <div className="mt-2 pt-2 border-t border-white/[0.04]">
                    <p className="text-[10px] text-white/25">Faltam: {readiness.missing.join(', ')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Best Action */}
      {nextActions.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('actions')}
            className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
          >
            {expandedSection === 'actions' ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Próxima Ação
          </button>
          <AnimatePresence>
            {expandedSection === 'actions' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1 pb-2">
                  {nextActions.map((action, i) => {
                    const Icon = action.icon;
                    const isFirst = i === 0;
                    return (
                      <motion.button
                        key={action.action}
                        whileTap={{ scale: 0.98 }}
                        disabled={isGenerating}
                        onClick={() => handleActionClick(action.action)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-left disabled:opacity-30 group ${
                          isFirst
                            ? 'bg-primary/[0.06] border border-primary/[0.12] hover:bg-primary/[0.10]'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isFirst ? 'bg-primary/15' : 'bg-white/[0.04]'
                        }`}>
                          <Icon className={`w-3.5 h-3.5 ${isFirst ? 'text-primary' : 'text-white/40'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs block ${isFirst ? 'text-white/90 font-medium' : 'text-white/70'}`}>{action.label}</span>
                          <span className="text-[10px] text-white/25 block truncate">{action.description}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-white/15 group-hover:text-white/30 transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Build Connectors */}
      <div>
        <button
          onClick={() => toggleSection('connectors')}
          className="w-full flex items-center gap-1.5 px-1 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
        >
          {expandedSection === 'connectors' ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Build & Deploy
        </button>
        <AnimatePresence>
          {expandedSection === 'connectors' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pb-2">
                {!outputs.some(o => o.type === 'prompt') && (
                  <div className="p-2.5 bg-yellow-500/[0.06] border border-yellow-500/[0.12] rounded-lg mb-1">
                    <p className="text-[10px] text-yellow-400/80">Gere o Prompt Final antes de enviar para build</p>
                  </div>
                )}
                {BUILD_CONNECTORS.map((connector) => {
                  const hasPrompt = outputs.some(o => o.type === 'prompt');
                  return (
                    <motion.button
                      key={connector.id}
                      whileTap={{ scale: 0.98 }}
                      disabled={!hasPrompt}
                      onClick={() => handleConnectorAction(connector)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-all text-left disabled:opacity-20 group"
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-white/[0.04] overflow-hidden">
                        {connector.icon ? (
                          <img src={connector.icon} alt={connector.name} className="w-5 h-5 rounded-sm" />
                        ) : (
                          <Rocket className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">{connector.name}</span>
                          {connector.oneClick && (
                            <span className="text-[8px] px-1 py-0.5 bg-primary/20 text-primary rounded font-medium">1-click</span>
                          )}
                        </div>
                        <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors block truncate">{connector.description}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/10 group-hover:text-white/30 transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
