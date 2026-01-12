// Reaction Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Heart } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

export const ReactionNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  const emojis = data.config?.expectedEmojis || [];
  
  return (
    <BaseNode {...props} icon={Heart} title="Reação Esperada" category="interactive">
      {emojis.length > 0 && (
        <div className="flex gap-1">
          {emojis.map((emoji: string, i: number) => (
            <span key={i} className="text-lg">{emoji}</span>
          ))}
        </div>
      )}
    </BaseNode>
  );
});

ReactionNode.displayName = 'ReactionNode';
