// Trigger Node - Start triggers for flows
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Play, Smartphone, Globe, Calendar, Zap } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

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
        return nodeData.config.instanceName && (
          <p>Instância: {nodeData.config.instanceName}</p>
        );
      case 'webhook-trigger':
        return nodeData.config.webhookUrl && (
          <p className="truncate">URL: {nodeData.config.webhookUrl}</p>
        );
      case 'schedule-trigger':
        return nodeData.config.schedule && (
          <p>Horário: {nodeData.config.schedule}</p>
        );
      default:
        return <p>Ponto de entrada do flow</p>;
    }
  };

  return (
    <BaseNode
      {...props}
      icon={config.icon}
      title={config.title}
      category="flow-control"
    >
      {getConfigPreview()}
    </BaseNode>
  );
});

TriggerNode.displayName = 'TriggerNode';
