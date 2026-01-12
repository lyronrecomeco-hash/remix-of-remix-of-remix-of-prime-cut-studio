// List Message Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { List } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

export const ListMessageNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  
  return (
    <BaseNode {...props} icon={List} title="Lista" category="content">
      {data.config?.title && (
        <p className="line-clamp-1">{data.config.title}</p>
      )}
    </BaseNode>
  );
});

ListMessageNode.displayName = 'ListMessageNode';
