// Real-time Error Logs Panel
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, CheckCircle2, AlertCircle, Clock, AlertTriangle, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FlowErrorLog } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RealTimeErrorLogsProps {
  errors: FlowErrorLog[];
  onClose: () => void;
  onResolve: (id: string) => void;
}

const errorTypeConfig = {
  validation: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  execution: { icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  timeout: { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  api: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  unknown: { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

export const RealTimeErrorLogs = ({ errors, onClose, onResolve }: RealTimeErrorLogsProps) => {
  const unresolvedErrors = errors.filter(e => !e.resolved);
  const resolvedErrors = errors.filter(e => e.resolved);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute right-4 top-4 bottom-4 w-96 bg-card border rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-card to-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold">Logs em Tempo Real</h3>
            <p className="text-xs text-muted-foreground">
              {unresolvedErrors.length} erro{unresolvedErrors.length !== 1 ? 's' : ''} ativo{unresolvedErrors.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Live indicator */}
      <div className="px-4 py-2 border-b bg-muted/20 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs text-muted-foreground">Monitoramento ativo</span>
      </div>

      {/* Error List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {unresolvedErrors.length === 0 && resolvedErrors.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500/30" />
              <p className="text-muted-foreground text-sm">Nenhum erro detectado</p>
              <p className="text-xs text-muted-foreground mt-1">O flow está funcionando corretamente</p>
            </div>
          )}

          {/* Unresolved Errors */}
          {unresolvedErrors.map((error, index) => {
            const config = errorTypeConfig[error.errorType];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  "bg-gradient-to-r from-red-500/5 to-transparent border-red-500/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-lg", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                        {error.errorType}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(error.timestamp), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{error.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Nó: {error.nodeId.split('-')[0]}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onResolve(error.id)}
                  >
                    Resolver
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {/* Resolved Errors */}
          {resolvedErrors.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground">Resolvidos</span>
              </div>
              {resolvedErrors.slice(0, 5).map((error) => (
                <div
                  key={error.id}
                  className="p-2 rounded-lg bg-muted/30 opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-muted-foreground truncate flex-1">{error.message}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Atualizações automáticas a cada 10 segundos
        </p>
      </div>
    </motion.div>
  );
};
