import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import type { SendLog } from '../types';

interface LogsPanelProps {
  logs: SendLog[];
  maxHeight?: string;
}

export const LogsPanel = ({ logs, maxHeight = 'h-[180px]' }: LogsPanelProps) => {
  const getLogIcon = (type: SendLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">Logs de Atividade</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ScrollArea className={maxHeight}>
          {logs.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma atividade ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-2 py-1.5 text-xs border-b border-border/50 last:border-0"
                >
                  {getLogIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono">
                        {log.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      <span className="font-medium truncate">{log.message}</span>
                    </div>
                    {log.details && (
                      <p className="text-muted-foreground mt-0.5 truncate">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
