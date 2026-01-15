/**
 * PROSPECT AUTOMATION - Active Job Card
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Zap,
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Building2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { AutomationJob, ExecutionLogEntry } from './types';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActiveJobCardProps {
  job: AutomationJob;
  onPause: (jobId: string) => void;
  onResume: (jobId: string) => void;
  onCancel: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Clock },
  scheduled: { label: 'Agendado', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Clock },
  running: { label: 'Em Execução', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: Activity },
  paused: { label: 'Pausado', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: Pause },
  completed: { label: 'Concluído', color: 'bg-primary/10 text-primary border-primary/30', icon: CheckCircle },
  failed: { label: 'Falhou', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: Square },
};

export const ActiveJobCard = ({
  job,
  onPause,
  onResume,
  onCancel,
  onDelete,
}: ActiveJobCardProps) => {
  const [showLogs, setShowLogs] = useState(false);

  const statusConfig = STATUS_CONFIG[job.status];
  const StatusIcon = statusConfig.icon;
  const progress = job.total_prospects > 0 
    ? ((job.sent_count + job.failed_count) / job.total_prospects) * 100 
    : 0;

  const isActive = job.status === 'running' || job.status === 'paused' || job.status === 'scheduled';
  const canPause = job.status === 'running';
  const canResume = job.status === 'paused';
  const canCancel = job.status === 'running' || job.status === 'paused' || job.status === 'scheduled';
  const canDelete = !isActive;

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-primary" />
            Automação em Andamento
          </CardTitle>
          <Badge className={`${statusConfig.color} gap-1.5 border`}>
            <StatusIcon className={`w-3 h-3 ${job.status === 'running' ? 'animate-pulse' : ''}`} />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {job.sent_count + job.failed_count} / {job.total_prospects}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              {job.sent_count} enviados
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-500" />
              {job.failed_count} falhas
            </span>
          </div>
        </div>

        {/* Time info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {job.started_at && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Iniciado {formatDistanceToNow(new Date(job.started_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          )}
          {job.scheduled_at && job.status === 'scheduled' && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Agendado para {format(new Date(job.scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
            </span>
          )}
        </div>

        {/* Last error */}
        {job.last_error && (
          <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {job.last_error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canPause && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPause(job.id)}
              className="flex-1 gap-1.5"
            >
              <Pause className="w-4 h-4" />
              Pausar
            </Button>
          )}
          {canResume && (
            <Button
              size="sm"
              onClick={() => onResume(job.id)}
              className="flex-1 gap-1.5"
            >
              <Play className="w-4 h-4" />
              Retomar
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onCancel(job.id)}
              className="gap-1.5"
            >
              <Square className="w-4 h-4" />
              Cancelar
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(job.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Logs */}
        {job.execution_log && job.execution_log.length > 0 && (
          <Collapsible open={showLogs} onOpenChange={setShowLogs}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2">
                {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Ver Log de Execução ({job.execution_log.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="h-[200px] mt-2 rounded border p-2">
                <div className="space-y-2">
                  {[...job.execution_log].reverse().map((log: ExecutionLogEntry, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-xs flex items-start gap-2 ${
                        log.status === 'sent'
                          ? 'bg-green-500/10'
                          : log.status === 'failed'
                          ? 'bg-red-500/10'
                          : 'bg-yellow-500/10'
                      }`}
                    >
                      {log.status === 'sent' ? (
                        <CheckCircle className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                      ) : log.status === 'failed' ? (
                        <XCircle className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-yellow-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium truncate">{log.prospectName}</span>
                        </div>
                        {log.error && (
                          <p className="text-red-600 mt-1">{log.error}</p>
                        )}
                        {log.delayUsed && (
                          <p className="text-muted-foreground mt-1">Delay: {log.delayUsed}s</p>
                        )}
                      </div>
                      <span className="text-muted-foreground shrink-0">
                        {log.timestamp && format(new Date(log.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
