// Trigger Node - Start triggers for flows
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Play, Smartphone, Globe, Calendar, Zap, CheckCircle, Wifi } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';
import { Badge } from '@/components/ui/badge';

const triggerConfig: Record<string, { icon: React.ElementType; title: string }> = {
  'start-trigger': { icon: Play, title: 'Início do Flow' },
  'instance-connector': { icon: Smartphone, title: 'Instância WhatsApp' },
  'webhook-trigger': { icon: Globe, title: 'Webhook' },
  'schedule-trigger': { icon: Calendar, title: 'Agendamento' },
};

export const TriggerNode = memo((props: NodeProps) => {
  const config = triggerConfig[props.type as string] || { icon: Zap, title: 'Gatilho' };
  const data = props.data as Record<string, unknown>;
  const nodeData: BaseNodeData = {
    label: (data?.label as string) || '',
    config: (data?.config as Record<string, any>) || {},
    isConfigured: (data?.isConfigured as boolean) || false,
  };

  const getConfigPreview = () => {
    if (!nodeData.isConfigured) return null;
    
    switch (props.type) {
      case 'instance-connector':
        return nodeData.config.instanceName ? (
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-600 font-medium">{nodeData.config.instanceName}</span>
          </div>
        ) : null;
      case 'webhook-trigger':
        return nodeData.config.webhookUrl && (
          <p className="truncate text-xs">URL: {nodeData.config.webhookUrl}</p>
        );
      case 'schedule-trigger':
        return nodeData.config.schedule && (
          <p className="text-xs">⏰ {nodeData.config.schedule}</p>
        );
      default:
        return <p className="text-xs text-emerald-600">▶ Ponto de entrada</p>;
    }
  };

  return (
    <BaseNode
      {...props}
      icon={config.icon}
      title={config.title}
      category="triggers"
    >
      {getConfigPreview()}
    </BaseNode>
  );
});

TriggerNode.displayName = 'TriggerNode';
