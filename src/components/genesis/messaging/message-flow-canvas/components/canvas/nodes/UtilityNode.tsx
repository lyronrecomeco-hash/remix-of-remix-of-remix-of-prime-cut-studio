// Utility Node - HTTP requests, variables, end flow
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { Globe, Variable, Square, Settings } from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

const utilityConfig: Record<string, { icon: React.ElementType; title: string }> = {
  'http-request': { icon: Globe, title: 'HTTP Request' },
  'set-variable': { icon: Variable, title: 'Definir Variável' },
  'end-flow': { icon: Square, title: 'Fim do Flow' },
};

export const UtilityNode = memo((props: NodeProps) => {
  const config = utilityConfig[props.type as string] || { icon: Settings, title: 'Utilidade' };
  const data = props.data as Record<string, unknown>;
  const nodeData: BaseNodeData = {
    label: (data?.label as string) || '',
    config: (data?.config as Record<string, any>) || {},
    isConfigured: (data?.isConfigured as boolean) || false,
  };

  const getConfigPreview = () => {
    if (!nodeData.isConfigured) return null;
    
    switch (props.type) {
      case 'http-request':
        return nodeData.config.url && (
          <div>
            <p className="font-medium">{nodeData.config.method || 'GET'}</p>
            <p className="truncate text-[10px]">{nodeData.config.url}</p>
          </div>
        );
      case 'set-variable':
        return nodeData.config.variableName && (
          <p>{nodeData.config.variableName} = {nodeData.config.value || '...'}</p>
        );
      case 'end-flow':
        return (
          <p>Encerra a execução</p>
        );
      default:
        return null;
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

UtilityNode.displayName = 'UtilityNode';
