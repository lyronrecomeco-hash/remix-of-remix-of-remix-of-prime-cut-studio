// Poll Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { BarChart2 } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const PollNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  const options = data.config?.options || [];
  
  return (
    <BaseNode {...props} icon={BarChart2} title="Enquete" category="interactive">
      {data.config?.question && (
        <div className="space-y-1">
          <p className="line-clamp-1 font-medium">{data.config.question}</p>
          {options.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {options.length} opções
            </p>
          )}
        </div>
      )}
    </BaseNode>
  );
});

PollNode.displayName = 'PollNode';
