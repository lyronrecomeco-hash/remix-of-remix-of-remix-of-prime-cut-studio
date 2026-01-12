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

  const cfg = data.config || {};

  const itemsFromItems = Array.isArray(cfg.items) ? cfg.items : [];
  const itemsFromSections = Array.isArray(cfg.sections)
    ? cfg.sections.flatMap((s: any) => (Array.isArray(s?.rows) ? s.rows : []))
    : [];

  const rows = (itemsFromItems.length ? itemsFromItems : itemsFromSections)
    .map((it: any) => String(it?.title || it?.text || '').trim())
    .filter(Boolean);

  const outputLabels = rows.slice(0, 6).map((t, i) => t || `Opção ${i + 1}`);

  return (
    <BaseNode
      {...props}
      icon={List}
      title="Lista"
      category="content"
      hasMultipleOutputs={outputLabels.length > 0}
      outputLabels={outputLabels}
    >
      {cfg.title && <p className="line-clamp-1">{cfg.title}</p>}
    </BaseNode>
  );
});

ListMessageNode.displayName = 'ListMessageNode';
