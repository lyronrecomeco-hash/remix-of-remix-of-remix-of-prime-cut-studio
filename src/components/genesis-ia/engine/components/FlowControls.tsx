import { useState } from 'react';
import { 
  Play, Pause, RotateCcw, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, Loader2, RefreshCw, ChevronDown, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { FlowExecutionStatus, FlowValidationError, PreFlightSummary } from '../types';

interface FlowControlsProps {
  flowStatus: FlowExecutionStatus;
  validationErrors: FlowValidationError[];
  preFlightSummary: PreFlightSummary | null;
  onValidate: () => FlowValidationError[];
  onGeneratePreFlight: () => PreFlightSummary;
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
  flowStatus, validationErrors, preFlightSummary,
  onValidate, onGeneratePreFlight, onRun, onPause, onReset, onRetryFailed, nodeCount,
}: FlowControlsProps) => {
  const [showPreFlight, setShowPreFlight] = useState(false);
  const config = STATUS_CONFIG[flowStatus];
  const StatusIcon = config.icon;
  const criticalErrors = validationErrors.filter(e => e.severity === 'error');
  const isRunning = flowStatus === 'running';

  const handleExecuteClick = () => {
    const errors = onValidate();
    const critical = errors.filter(e => e.severity === 'error');
    if (critical.length > 0) return;
    
    const summary = onGeneratePreFlight();
    if (summary.canExecute) {
      setShowPreFlight(true);
    }
  };

  const confirmExecution = () => {
    setShowPreFlight(false);
    onRun();
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

      {/* Run / Pause with pre-flight */}
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
        <Popover open={showPreFlight} onOpenChange={setShowPreFlight}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExecuteClick}
              disabled={nodeCount < 2}
              className="h-7 px-2 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1"
              title="Executar fluxo"
            >
              <Play className="w-3 h-3" />
              <span className="hidden lg:inline">Executar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-0 border-white/10 bg-[hsl(220_25%_13%)]" 
            align="end"
            sideOffset={8}
          >
            {preFlightSummary && (
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-white/80">Resumo de Execução</span>
                </div>
                
                <div className="space-y-1.5 text-[10px]">
                  {preFlightSummary.contextBlocks.count > 0 && (
                    <div className="flex items-center justify-between text-white/50">
                      <span>📋 Contexto</span>
                      <span className="text-white/30">{preFlightSummary.contextBlocks.filled}/{preFlightSummary.contextBlocks.count} preenchidos</span>
                    </div>
                  )}
                  {preFlightSummary.decisionBlocks.count > 0 && (
                    <div className="flex items-center justify-between text-white/50">
                      <span>🎯 Decisão</span>
                      <span className="text-white/30">{preFlightSummary.decisionBlocks.filled}/{preFlightSummary.decisionBlocks.count} preenchidos</span>
                    </div>
                  )}
                  
                  {preFlightSummary.actionBlocks.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1">
                      <span className="text-white/60 font-medium">⚡ Ações que serão executadas:</span>
                      {preFlightSummary.actionBlocks.map((action, i) => (
                        <div key={i} className="flex items-center gap-1.5 pl-2">
                          {action.ready ? (
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                          )}
                          <span className={action.ready ? 'text-white/50' : 'text-red-300/80'}>
                            {action.label}: {action.detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {preFlightSummary.outputBlocks.count > 0 && (
                    <div className="flex items-center justify-between text-white/50 mt-1">
                      <span>📤 Saídas</span>
                      <span className="text-white/30">{preFlightSummary.outputBlocks.count} bloco(s)</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPreFlight(false)}
                    className="flex-1 h-7 text-[10px] text-white/40 hover:text-white/60"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={confirmExecution}
                    className="flex-1 h-7 text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
                  >
                    <Play className="w-2.5 h-2.5 mr-1" />
                    Confirmar
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
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
