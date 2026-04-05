import { 
  Play, Pause, RotateCcw, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlowExecutionStatus, FlowValidationError } from '../types';

interface FlowControlsProps {
  flowStatus: FlowExecutionStatus;
  validationErrors: FlowValidationError[];
  onValidate: () => FlowValidationError[];
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  onRetryFailed: () => void;
  nodeCount: number;
}

const STATUS_CONFIG: Record<FlowExecutionStatus, { label: string; color: string; icon: React.ElementType }> = {
  idle: { label: 'Pronto', color: 'text-white/40', icon: Play },
  validating: { label: 'Validando...', color: 'text-yellow-400', icon: ShieldCheck },
  running: { label: 'Executando...', color: 'text-primary', icon: Loader2 },
  paused: { label: 'Pausado', color: 'text-yellow-400', icon: Pause },
  completed: { label: 'Concluído', color: 'text-emerald-400', icon: CheckCircle2 },
  failed: { label: 'Com erros', color: 'text-red-400', icon: XCircle },
};

export const FlowControls = ({
  flowStatus, validationErrors, onValidate, onRun, onPause, onReset, onRetryFailed, nodeCount,
}: FlowControlsProps) => {
  const config = STATUS_CONFIG[flowStatus];
  const StatusIcon = config.icon;
  const criticalErrors = validationErrors.filter(e => e.severity === 'error');
  const isRunning = flowStatus === 'running';

  const handleValidateAndRun = () => {
    const errors = onValidate();
    const critical = errors.filter(e => e.severity === 'error');
    if (critical.length === 0) {
      onRun();
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Status indicator */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] ${config.color}`}>
        <StatusIcon className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
        <span className="text-[10px] font-medium">{config.label}</span>
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Validate */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onValidate()}
        disabled={isRunning}
        className="h-7 px-2 text-[10px] text-white/40 hover:text-white hover:bg-white/5 gap-1"
        title="Validar fluxo"
      >
        <ShieldCheck className="w-3 h-3" />
        <span className="hidden lg:inline">Validar</span>
        {criticalErrors.length > 0 && (
          <span className="ml-0.5 px-1 py-0 rounded-full bg-red-500/20 text-red-400 text-[9px]">
            {criticalErrors.length}
          </span>
        )}
      </Button>

      {/* Run / Pause */}
      {isRunning ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPause}
          className="h-7 px-2 text-[10px] text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 gap-1"
        >
          <Pause className="w-3 h-3" />
          <span className="hidden lg:inline">Pausar</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleValidateAndRun}
          disabled={nodeCount < 2}
          className="h-7 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1"
          title="Executar fluxo"
        >
          <Play className="w-3 h-3" />
          <span className="hidden lg:inline">Executar</span>
        </Button>
      )}

      {/* Retry failed */}
      {flowStatus === 'failed' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetryFailed}
          className="h-7 px-2 text-[10px] text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden lg:inline">Retry</span>
        </Button>
      )}

      {/* Reset */}
      {flowStatus !== 'idle' && !isRunning && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 px-2 text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 gap-1"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};
