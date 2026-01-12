// Smart Delay Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const SmartDelayNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  
  return (
    <BaseNode {...props} icon={Clock} title="Delay Inteligente" category="flow-control">
      <div className="flex items-center gap-2">
        {data.config?.baseDelay && (
          <Badge variant="outline" className="text-[10px]">
            ⏱️ {data.config.baseDelay}s
          </Badge>
        )}
        {data.config?.antiBan && (
          <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600">
            Anti-ban
          </Badge>
        )}
      </div>
    </BaseNode>
  );
});

SmartDelayNode.displayName = 'SmartDelayNode';
