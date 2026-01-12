// Advanced Text Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Type } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

export const AdvancedTextNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  
  return (
    <BaseNode {...props} icon={Type} title="Texto Avançado" category="content">
      {data.config?.message ? (
        <p className="line-clamp-2">{data.config.message}</p>
      ) : null}
    </BaseNode>
  );
});

AdvancedTextNode.displayName = 'AdvancedTextNode';
