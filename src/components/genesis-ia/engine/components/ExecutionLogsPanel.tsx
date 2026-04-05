import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import type { FlowValidationError, BlockCategory } from '../types';
import { CATEGORY_META } from '../types';

interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
  category?: BlockCategory;
}

interface ExecutionLogsPanelProps {
  logs: ExecutionLog[];
  validationErrors: FlowValidationError[];
}

const LEVEL_ICON = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
};

const LEVEL_COLOR = {
  info: 'text-white/45',
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
};

export const ExecutionLogsPanel = ({ logs, validationErrors }: ExecutionLogsPanelProps) => {
  const actionLogs = useMemo(() => logs.filter(l => l.category === 'action'), [logs]);
  const otherLogs = useMemo(() => logs.filter(l => l.category !== 'action'), [logs]);

  if (logs.length === 0 && validationErrors.length === 0) return null;

  return (
    <div className="border-t border-white/[0.06] bg-white/[0.02]">
      <div className="px-3 py-1.5 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Execução</span>
          {actionLogs.length > 0 && (
            <span className="text-[9px] px-1.5 py-0 rounded bg-emerald-500/10 text-emerald-400/80">
              {actionLogs.filter(l => l.level === 'success').length} ação(ões) OK
            </span>
          )}
        </div>
        <span className="text-[9px] text-white/20">{logs.length} log(s)</span>
      </div>
      <ScrollArea className="max-h-[160px]">
        <div className="p-2 space-y-0.5">
          {validationErrors.length > 0 && (
            <div className="space-y-0.5 mb-1 pb-1 border-b border-white/[0.04]">
              {validationErrors.map((e, i) => (
                <div key={`v-${i}`} className={`flex items-start gap-1.5 px-1.5 py-1 rounded text-[10px] ${
                  e.severity === 'error' ? 'bg-red-500/[0.06] text-red-300' : 'bg-yellow-500/[0.06] text-yellow-300'
                }`}>
                  {e.severity === 'error' ? <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                  <span>{e.nodeLabel}: {e.message}</span>
                </div>
              ))}
            </div>
          )}
          {logs.map(log => {
            const Icon = LEVEL_ICON[log.level];
            const color = LEVEL_COLOR[log.level];
            const catMeta = log.category ? CATEGORY_META[log.category] : null;
            return (
              <div key={log.id} className="flex items-start gap-1.5 px-1.5 py-0.5 text-[10px]">
                <Icon className={`w-3 h-3 mt-0.5 flex-shrink-0 ${color}`} />
                <span className={`flex-1 ${color}`}>{log.message}</span>
                <span className="text-white/15 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
