import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  XCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlowErrorLog } from '../types';

interface ErrorLogsPanelProps {
  errors: FlowErrorLog[];
  onResolve: (errorId: string) => void;
  onClearResolved: () => void;
  compact?: boolean;
}

const ERROR_TYPE_CONFIG = {
  validation: { 
    label: 'Validação', 
    icon: AlertCircle, 
    color: 'text-amber-500 bg-amber-500/10' 
  },
  execution: { 
    label: 'Execução', 
    icon: Zap, 
    color: 'text-red-500 bg-red-500/10' 
  },
  timeout: { 
    label: 'Timeout', 
    icon: Clock, 
    color: 'text-orange-500 bg-orange-500/10' 
  },
  api: { 
    label: 'API', 
    icon: RefreshCw, 
    color: 'text-blue-500 bg-blue-500/10' 
  },
  unknown: { 
    label: 'Desconhecido', 
    icon: XCircle, 
    color: 'text-gray-500 bg-gray-500/10' 
  }
};

export const ErrorLogsPanel = ({ 
  errors, 
  onResolve, 
  onClearResolved,
  compact = false 
}: ErrorLogsPanelProps) => {
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const unresolvedErrors = errors.filter(e => !e.resolved);
  const resolvedErrors = errors.filter(e => e.resolved);
  const displayedErrors = showResolved ? errors : unresolvedErrors;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {unresolvedErrors.length > 0 ? (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {unresolvedErrors.length} erro{unresolvedErrors.length > 1 ? 's' : ''}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Sem erros
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Logs de Erros
            {unresolvedErrors.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unresolvedErrors.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            {resolvedErrors.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResolved(!showResolved)}
                  className="text-xs"
                >
                  {showResolved ? 'Ocultar Resolvidos' : `Ver ${resolvedErrors.length} Resolvidos`}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearResolved}
                  className="text-xs text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {displayedErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhum erro registrado</p>
              <p className="text-sm">Seus flows estão funcionando corretamente</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {displayedErrors.map((error) => {
                  const config = ERROR_TYPE_CONFIG[error.errorType];
                  const Icon = config.icon;
                  const isExpanded = expandedError === error.id;

                  return (
                    <motion.div
                      key={error.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        error.resolved 
                          ? "bg-muted/50 border-muted opacity-60" 
                          : "bg-background border-border hover:border-primary/30"
                      )}
                    >
                      <div 
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => setExpandedError(isExpanded ? null : error.id)}
                      >
                        <div className={cn("p-1.5 rounded-lg shrink-0", config.color)}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {config.label}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {error.nodeType}
                            </Badge>
                            {error.resolved && (
                              <Badge variant="outline" className="text-[10px] text-green-600">
                                Resolvido
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium line-clamp-1">{error.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(error.timestamp)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!error.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onResolve(error.id);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && error.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t"
                          >
                            <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(error.details, null, 2)}
                            </pre>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
