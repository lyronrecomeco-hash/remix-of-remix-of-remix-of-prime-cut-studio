// Group Management Node - Nodes for group management
import { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { 
  UserPlus, UserMinus, Filter, Trash2, UserX, AlertTriangle, 
  Bell, ShieldAlert, Link2Off, BookOpen, Hash, Users
} from 'lucide-react';
import { BaseNode, BaseNodeData } from './BaseNode';

const groupConfig: Record<string, { icon: React.ElementType; title: string }> = {
  'group-welcome': { icon: UserPlus, title: 'Boas-vindas' },
  'group-goodbye': { icon: UserMinus, title: 'Despedida' },
  'keyword-filter': { icon: Filter, title: 'Filtro de Palavras' },
  'keyword-delete': { icon: Trash2, title: 'Apagar Mensagem' },
  'member-kick': { icon: UserX, title: 'Remover Membro' },
  'member-warn': { icon: AlertTriangle, title: 'Avisar Membro' },
  'group-reminder': { icon: Bell, title: 'Lembrete' },
  'anti-spam': { icon: ShieldAlert, title: 'Anti-Spam' },
  'anti-link': { icon: Link2Off, title: 'Anti-Link' },
  'group-rules': { icon: BookOpen, title: 'Regras do Grupo' },
  'member-counter': { icon: Hash, title: 'Contador de Membros' },
};

export const GroupManagementNode = memo((props: NodeProps) => {
  const config = groupConfig[props.type as string] || { icon: Users, title: 'Gestão de Grupo' };
  const data = props.data as Record<string, unknown>;
  const nodeData: BaseNodeData = {
    label: (data?.label as string) || '',
    config: (data?.config as Record<string, any>) || {},
    isConfigured: (data?.isConfigured as boolean) || false,
  };

  const getConfigPreview = () => {
    if (!nodeData.isConfigured) return null;
    
    switch (props.type) {
      case 'group-welcome':
        return nodeData.config.welcomeMessage && (
          <p className="line-clamp-2">{nodeData.config.welcomeMessage}</p>
        );
      case 'keyword-filter':
      case 'keyword-delete':
        return nodeData.config.keywords?.length > 0 && (
          <p>{nodeData.config.keywords.length} palavras configuradas</p>
        );
      case 'member-kick':
        return nodeData.config.maxWarnings && (
          <p>Após {nodeData.config.maxWarnings} avisos</p>
        );
      case 'member-warn':
        return nodeData.config.warningMessage && (
          <p className="line-clamp-2">{nodeData.config.warningMessage}</p>
        );
      case 'group-reminder':
        return nodeData.config.reminderTime && (
          <p>Lembrete: {nodeData.config.reminderTime}</p>
        );
      case 'anti-spam':
        return nodeData.config.maxMessages && (
          <p>Máx {nodeData.config.maxMessages} msgs/min</p>
        );
      case 'anti-link':
        return (
          <p>Bloqueia links externos</p>
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
      category="interactive"
    >
      {getConfigPreview()}
    </BaseNode>
  );
});

GroupManagementNode.displayName = 'GroupManagementNode';
