// Button Message Node
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { LayoutGrid } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const ButtonMessageNode = memo((props: NodeProps) => {
  const rawData = props.data as Record<string, unknown>;
  const data: BaseNodeData = {
    label: (rawData?.label as string) || '',
    config: (rawData?.config as Record<string, any>) || {},
    isConfigured: (rawData?.isConfigured as boolean) || false,
  };
  const buttons = data.config?.buttons || [];
  
  return (
    <BaseNode {...props} icon={LayoutGrid} title="Botões" category="content">
      {buttons.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {buttons.slice(0, 3).map((btn: any, i: number) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {btn.text || `Botão ${i + 1}`}
            </Badge>
          ))}
        </div>
      ) : null}
    </BaseNode>
  );
});

ButtonMessageNode.displayName = 'ButtonMessageNode';
