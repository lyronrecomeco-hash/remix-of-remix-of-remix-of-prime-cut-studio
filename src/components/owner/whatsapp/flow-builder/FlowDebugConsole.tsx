import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Play,
  Loader2,
  Terminal,
  Zap,
  GitBranch,
  RefreshCw,
  Bug,
  Server,
  Laptop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidationIssue {
  nodeId?: string;
  type: 'error' | 'warning';
  message: string;
  code: string;
  source?: 'frontend' | 'backend';
}

interface FlowDebugConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId?: string;
  nodes: any[];
  edges: any[];
  onNavigateToNode: (nodeId: string) => void;
  localValidation: { errors: ValidationIssue[]; warnings: ValidationIssue[] };
}

interface TestResult {
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  source: 'frontend' | 'backend';
  message: string;
  details?: string;
  nodeId?: string;
}

export const FlowDebugConsole = memo(({
  isOpen,
  onClose,
  ruleId,
  nodes,
  edges,
  onNavigateToNode,
  localValidation,
}: FlowDebugConsoleProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [backendValidation, setBackendValidation] = useState<{ errors: ValidationIssue[]; warnings: ValidationIssue[] } | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState('issues');

  const addResult = useCallback((result: Omit<TestResult, 'timestamp'>) => {
    setTestResults(prev => [{
      ...result,
      timestamp: new Date(),
    }, ...prev]);
  }, []);

  // Helper to get node type consistently
  const getNodeType = useCallback((node: any): string => {
    if (typeof node.data?.type === 'string') return node.data.type;
    if (typeof node.type === 'string' && node.type !== 'flowNode') return node.type;
    return '';
  }, []);

  // Trigger types that count as flow entry points
  const TRIGGER_TYPES = ['trigger', 'wa_start', 'wa_receive', 'webhook_trigger', 'cron_trigger', 'webhook_universal_trigger', 'webhook_in'];
  const END_TYPES = ['end'];

  const runFullValidation = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    setBackendValidation(null);
    setActiveTab('console');

    try {
      // FASE 1: Validação Frontend
      addResult({
        type: 'info',
        source: 'frontend',
        message: 'Iniciando validação do cliente...',
      });

      await new Promise(r => setTimeout(r, 300));

      // Contagem de estatísticas - usando lógica precisa
      const triggerCount = nodes.filter(n => TRIGGER_TYPES.includes(getNodeType(n))).length;
      const endCount = nodes.filter(n => END_TYPES.includes(getNodeType(n))).length;
      const actionCount = nodes.filter(n => {
        const type = getNodeType(n);
        return !TRIGGER_TYPES.includes(type) && !END_TYPES.includes(type);
      }).length;
      const connectionCount = edges.length;

      addResult({
        type: 'info',
        source: 'frontend',
        message: `Fluxo analisado: ${nodes.length} nós, ${connectionCount} conexões`,
        details: `Gatilhos: ${triggerCount} | Ações: ${actionCount} | Fins: ${endCount}`,
      });

      // Reportar erros locais
      if (localValidation.errors.length > 0) {
        localValidation.errors.forEach(err => {
          addResult({
            type: 'error',
            source: 'frontend',
            message: err.message,
            nodeId: err.nodeId,
            details: `Código: ${err.code}`,
          });
        });
      }

      if (localValidation.warnings.length > 0) {
        localValidation.warnings.forEach(warn => {
          addResult({
            type: 'warning',
            source: 'frontend',
            message: warn.message,
            nodeId: warn.nodeId,
            details: `Código: ${warn.code}`,
          });
        });
      }

      if (localValidation.errors.length === 0 && localValidation.warnings.length === 0) {
        addResult({
          type: 'success',
          source: 'frontend',
          message: 'Validação local passou sem problemas!',
        });
      }

      // FASE 2: Validação Backend
      addResult({
        type: 'info',
        source: 'backend',
        message: 'Enviando para validação no servidor...',
      });

      await new Promise(r => setTimeout(r, 500));

      const flowData = {
        nodes: nodes.map(n => ({
          id: n.id,
          data: n.data,
        })),
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
        })),
      };

      const { data, error } = await supabase.functions.invoke('flow-validator', {
        body: {
          action: 'validate',
          flowData,
          ruleId,
        },
      });

      if (error) {
        addResult({
          type: 'error',
          source: 'backend',
          message: 'Falha ao conectar com validador',
          details: error.message,
        });
        throw error;
      }

      // Processar resultado do backend
      const backendErrors: ValidationIssue[] = (data?.errors || []).map((e: any) => ({
        ...e,
        source: 'backend' as const,
      }));
      const backendWarnings: ValidationIssue[] = (data?.warnings || []).map((w: any) => ({
        ...w,
        source: 'backend' as const,
      }));

      setBackendValidation({ errors: backendErrors, warnings: backendWarnings });

      if (backendErrors.length > 0) {
        backendErrors.forEach(err => {
          addResult({
            type: 'error',
            source: 'backend',
            message: err.message,
            nodeId: err.nodeId,
            details: `Código: ${err.code}`,
          });
        });
      }

      if (backendWarnings.length > 0) {
        backendWarnings.forEach(warn => {
          addResult({
            type: 'warning',
            source: 'backend',
            message: warn.message,
            nodeId: warn.nodeId,
            details: `Código: ${warn.code}`,
          });
        });
      }

      // Resultado final
      const totalErrors = localValidation.errors.length + backendErrors.length;
      const totalWarnings = localValidation.warnings.length + backendWarnings.length;

      if (totalErrors === 0) {
        addResult({
          type: 'success',
          source: 'backend',
          message: `Validação completa! ${totalWarnings} aviso(s)`,
          details: data?.isValid ? 'Fluxo está pronto para ativação' : 'Revise os avisos antes de ativar',
        });
        toast.success('Validação concluída!');
      } else {
        addResult({
          type: 'error',
          source: 'backend',
          message: `Validação falhou: ${totalErrors} erro(s), ${totalWarnings} aviso(s)`,
        });
        toast.error(`Encontrados ${totalErrors} erro(s)`);
      }

    } catch (error: any) {
      console.error('Validation error:', error);
      addResult({
        type: 'error',
        source: 'backend',
        message: 'Erro durante validação',
        details: error.message,
      });
    } finally {
      setIsRunning(false);
    }
  }, [nodes, edges, ruleId, localValidation, addResult, getNodeType]);

  // Combinar todas as issues
  const allErrors = [
    ...localValidation.errors.map(e => ({ ...e, source: 'frontend' as const })),
    ...(backendValidation?.errors || []),
  ];
  const allWarnings = [
    ...localValidation.warnings.map(w => ({ ...w, source: 'frontend' as const })),
    ...(backendValidation?.warnings || []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-0 right-0 bottom-0 w-96 bg-card/95 backdrop-blur-xl border-l shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold">Debug Console</h3>
                  <p className="text-xs text-muted-foreground">
                    Validação e testes de lógica
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Botão de teste */}
            <Button
              onClick={runFullValidation}
              disabled={isRunning}
              className="w-full gap-2"
              variant={allErrors.length > 0 ? "destructive" : "default"}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  Testar Lógica Completa
                </>
              )}
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-2 grid grid-cols-2">
              <TabsTrigger value="issues" className="gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Problemas
                {(allErrors.length + allWarnings.length) > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {allErrors.length + allWarnings.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="console" className="gap-2">
                <Terminal className="w-3.5 h-3.5" />
                Console
                {testResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {testResults.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Issues Tab */}
            <TabsContent value="issues" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {allErrors.length === 0 && allWarnings.length === 0 ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="font-medium text-green-600">Nenhum problema!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clique em "Testar Lógica" para validação completa
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Errors */}
                      {allErrors.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                            <XCircle className="w-4 h-4" />
                            Erros ({allErrors.length})
                          </div>
                          {allErrors.map((error, index) => (
                            <IssueCard
                              key={`error-${index}`}
                              issue={error}
                              onNavigate={error.nodeId ? () => onNavigateToNode(error.nodeId!) : undefined}
                            />
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {allWarnings.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            Avisos ({allWarnings.length})
                          </div>
                          {allWarnings.map((warning, index) => (
                            <IssueCard
                              key={`warning-${index}`}
                              issue={warning}
                              onNavigate={warning.nodeId ? () => onNavigateToNode(warning.nodeId!) : undefined}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Console Tab */}
            <TabsContent value="console" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Execute o teste para ver os logs</p>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'p-3 rounded-lg border font-mono text-xs',
                          result.type === 'success' && 'bg-green-500/5 border-green-500/20',
                          result.type === 'error' && 'bg-destructive/5 border-destructive/20',
                          result.type === 'warning' && 'bg-yellow-500/5 border-yellow-500/20',
                          result.type === 'info' && 'bg-blue-500/5 border-blue-500/20',
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {/* Icon */}
                          <div className="mt-0.5">
                            {result.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                            {result.type === 'error' && <XCircle className="w-3.5 h-3.5 text-destructive" />}
                            {result.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                            {result.type === 'info' && <Zap className="w-3.5 h-3.5 text-blue-500" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-muted-foreground">
                                {result.timestamp.toLocaleTimeString()}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'h-4 px-1.5 text-[10px]',
                                  result.source === 'frontend' ? 'border-blue-500/30 text-blue-600' : 'border-purple-500/30 text-purple-600'
                                )}
                              >
                                {result.source === 'frontend' ? (
                                  <><Laptop className="w-2.5 h-2.5 mr-1" />Client</>
                                ) : (
                                  <><Server className="w-2.5 h-2.5 mr-1" />Server</>
                                )}
                              </Badge>
                            </div>
                            <p className={cn(
                              'mt-1',
                              result.type === 'success' && 'text-green-600',
                              result.type === 'error' && 'text-destructive',
                              result.type === 'warning' && 'text-yellow-600',
                              result.type === 'info' && 'text-foreground',
                            )}>
                              {result.message}
                            </p>
                            {result.details && (
                              <p className="mt-1 text-muted-foreground text-[10px]">
                                {result.details}
                              </p>
                            )}
                            {result.nodeId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] mt-1"
                                onClick={() => onNavigateToNode(result.nodeId!)}
                              >
                                <ChevronRight className="w-3 h-3 mr-1" />
                                Ir para nó
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer Stats */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{nodes.length} nós • {edges.length} conexões</span>
              <div className="flex items-center gap-2">
                {allErrors.length > 0 && (
                  <span className="text-destructive">{allErrors.length} erros</span>
                )}
                {allWarnings.length > 0 && (
                  <span className="text-yellow-600">{allWarnings.length} avisos</span>
                )}
                {allErrors.length === 0 && allWarnings.length === 0 && (
                  <span className="text-green-600">OK</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

interface IssueCardProps {
  issue: ValidationIssue;
  onNavigate?: () => void;
}

const IssueCard = ({ issue, onNavigate }: IssueCardProps) => {
  const isError = issue.type === 'error';

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group',
        isError
          ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
          : 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
      )}
      onClick={onNavigate}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">{issue.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[10px]">
              {issue.code}
            </Badge>
            {issue.source && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  issue.source === 'frontend' ? 'border-blue-500/30 text-blue-600' : 'border-purple-500/30 text-purple-600'
                )}
              >
                {issue.source === 'frontend' ? 'Cliente' : 'Servidor'}
              </Badge>
            )}
          </div>
        </div>
        {onNavigate && (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-0.5" />
        )}
      </div>
    </motion.div>
  );
};

FlowDebugConsole.displayName = 'FlowDebugConsole';
