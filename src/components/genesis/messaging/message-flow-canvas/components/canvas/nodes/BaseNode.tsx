// Base Node Component - Foundation for all message nodes
import { memo, ReactNode } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Settings } from 'lucide-react';

export interface BaseNodeData {
  label: string;
  config: Record<string, any>;
  isConfigured: boolean;
}

interface BaseNodeProps extends NodeProps {
  icon: React.ElementType;
  title: string;
  category: 'content' | 'interactive' | 'flow-control' | 'triggers' | 'group-management';
  children?: ReactNode;
  hasMultipleOutputs?: boolean;
  outputLabels?: string[];
}

const categoryStyles = {
  triggers: {
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    border: 'border-emerald-500/40 hover:border-emerald-500/60',
    icon: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    handle: '!bg-emerald-500',
  },
  content: {
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    border: 'border-blue-500/40 hover:border-blue-500/60',
    icon: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    handle: '!bg-blue-500',
  },
  interactive: {
    gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    border: 'border-purple-500/40 hover:border-purple-500/60',
    icon: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    handle: '!bg-purple-500',
  },
  'group-management': {
    gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
    border: 'border-rose-500/40 hover:border-rose-500/60',
    icon: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
    handle: '!bg-rose-500',
  },
  'flow-control': {
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    border: 'border-amber-500/40 hover:border-amber-500/60',
    icon: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    handle: '!bg-amber-500',
  },
};

export const BaseNode = memo(({ 
  data: rawData, 
  selected, 
  icon: Icon, 
  title, 
  category,
  children,
  hasMultipleOutputs = false,
  outputLabels = []
}: BaseNodeProps) => {
  const data = rawData as Record<string, unknown>;
  const nodeData: BaseNodeData = {
    label: (data?.label as string) || '',
    config: (data?.config as Record<string, any>) || {},
    isConfigured: (data?.isConfigured as boolean) || false,
  };
  const styles = categoryStyles[category] || categoryStyles['flow-control'];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "min-w-[180px] max-w-[220px] rounded-xl border-2 shadow-xl backdrop-blur-sm",
        "bg-card transition-all duration-200 cursor-pointer",
        styles.border,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl scale-105"
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "!w-4 !h-4 !border-[3px] !border-background !rounded-full transition-transform hover:scale-125",
          styles.handle
        )}
      />

      {/* Node Header */}
      <div className={cn("px-3 py-2.5 rounded-t-[10px] bg-gradient-to-r", styles.gradient)}>
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", styles.icon)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{nodeData.label || title}</p>
          </div>
          {nodeData.isConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <Settings className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 animate-pulse" />
          )}
        </div>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2 text-xs text-muted-foreground min-h-[32px]">
        {children || (
          <p className="italic flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Clique para configurar
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="px-3 pb-2.5">
        <Badge 
          variant="secondary" 
          className={cn(
            "text-[10px] font-medium",
            nodeData.isConfigured 
              ? "bg-green-500/10 text-green-600 border-green-500/20" 
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}
        >
          {nodeData.isConfigured ? '✓ Pronto' : '⚠ Configurar'}
        </Badge>
      </div>

      {/* Output Handles */}
      {hasMultipleOutputs ? (
        outputLabels.map((label, index) => (
          <Handle
            key={index}
            type="source"
            position={Position.Right}
            // NOTE: 1-based ids to match existing saved edges (output-1, output-2, ...)
            id={`output-${index + 1}`}
            className={cn(
              "!w-4 !h-4 !border-[3px] !border-background !rounded-full transition-transform hover:scale-125",
              styles.handle
            )}
            style={{ top: `${30 + (index * 25)}%` }}
          />
        ))
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className={cn(
            "!w-4 !h-4 !border-[3px] !border-background !rounded-full transition-transform hover:scale-125",
            styles.handle
          )}
        />
      )}
    </motion.div>
  );
});

BaseNode.displayName = 'BaseNode';
