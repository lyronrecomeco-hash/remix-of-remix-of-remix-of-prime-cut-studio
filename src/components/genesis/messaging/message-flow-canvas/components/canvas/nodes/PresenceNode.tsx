// Presence Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Radio } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const PresenceNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  
  return (
    <BaseNode {...props} icon={Radio} title="Presença" category="flow-control">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {data.config?.presenceType === 'recording' ? '🎙️ Gravando' : '⌨️ Digitando'}
        </Badge>
        {data.config?.duration && (
          <span className="text-[10px]">{data.config.duration}s</span>
        )}
      </div>
    </BaseNode>
  );
});

PresenceNode.displayName = 'PresenceNode';
