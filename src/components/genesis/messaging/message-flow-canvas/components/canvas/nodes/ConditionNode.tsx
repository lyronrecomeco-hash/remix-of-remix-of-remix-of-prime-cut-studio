// Condition Node
import { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { GitBranch, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ConditionNodeData {
  label: string;
  config: Record<string, any>;
  isConfigured: boolean;
}

export const ConditionNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: ConditionNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  const { selected } = props;

  const conditionLabels: Record<string, string> = {
    response: 'Por Resposta',
    reaction: 'Por Reação',
    poll: 'Por Voto',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "min-w-[200px] max-w-[280px] rounded-xl border-2 shadow-lg backdrop-blur-sm",
        "bg-card/95 transition-all duration-200",
        "border-amber-500/40 hover:border-amber-500/60",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-background bg-amber-500"
      />

      {/* Node Header */}
      <div className="px-3 py-2 rounded-t-[10px] bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{data.label || 'Condição'}</p>
          </div>
          {data.isConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2 text-xs text-muted-foreground">
        {data.config?.conditionType ? (
          <Badge variant="outline" className="text-[10px]">
            {conditionLabels[data.config.conditionType] || data.config.conditionType}
          </Badge>
        ) : (
          <p className="italic">Clique duas vezes para configurar</p>
        )}
      </div>

      {/* Branch Labels */}
      <div className="px-3 pb-2 flex justify-end gap-4">
        <span className="text-[10px] text-green-600">✓ Sim</span>
        <span className="text-[10px] text-red-500">✗ Não</span>
      </div>

      {/* Output Handles - Yes/No branches */}
      <Handle
        type="source"
        position={Position.Right}
        id="yes"
        className="!w-3 !h-3 !border-2 !border-background bg-green-500"
        style={{ top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="no"
        className="!w-3 !h-3 !border-2 !border-background bg-red-500"
        style={{ top: '70%' }}
      />
    </motion.div>
  );
});

ConditionNode.displayName = 'ConditionNode';
