// Audio PTT Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Mic } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

export const AudioPttNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  
  return (
    <BaseNode {...props} icon={Mic} title="Áudio PTT" category="content">
      {data.config?.audioName && (
        <p className="line-clamp-1">🎙️ {data.config.audioName}</p>
      )}
    </BaseNode>
  );
});

AudioPttNode.displayName = 'AudioPttNode';
