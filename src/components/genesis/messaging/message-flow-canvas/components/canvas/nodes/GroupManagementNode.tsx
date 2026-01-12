// Group Management Node - Nodes for group management with complete config previews
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
    const cfg = nodeData.config;
    
    switch (props.type) {
      case 'group-welcome':
        return (
          <div className="space-y-1">
            {cfg.welcomeMessage && <p className="line-clamp-2">{cfg.welcomeMessage}</p>}
            {cfg.mentionMember && <span className="text-xs opacity-70">📌 Menciona membro</span>}
            {cfg.sendRules && <span className="text-xs opacity-70 ml-1">📋 +Regras</span>}
          </div>
        );

      case 'group-goodbye':
        return cfg.goodbyeMessage && <p className="line-clamp-2">{cfg.goodbyeMessage}</p>;

      case 'keyword-filter':
      case 'keyword-delete':
        return (
          <div className="space-y-1">
            <p>{cfg.keywords?.length || 0} palavras bloqueadas</p>
            {cfg.action && <span className="text-xs opacity-70">Ação: {cfg.action}</span>}
          </div>
        );

      case 'member-kick':
        return (
          <div className="space-y-1">
            <p>Após {cfg.maxWarnings || 3} avisos</p>
            {cfg.addToBlacklist && <span className="text-xs opacity-70">🚫 +Blacklist</span>}
          </div>
        );

      case 'member-warn':
        return (
          <div className="space-y-1">
            {cfg.warningMessage && <p className="line-clamp-2">{cfg.warningMessage}</p>}
            {cfg.expireHours && <span className="text-xs opacity-70">Expira em {cfg.expireHours}h</span>}
          </div>
        );

      case 'group-reminder':
        return (
          <div className="space-y-1">
            {cfg.reminderTime && <p>⏰ {cfg.reminderTime}</p>}
            {cfg.repeat && <span className="text-xs opacity-70">{cfg.repeat}</span>}
          </div>
        );

      case 'anti-spam':
        return (
          <div className="space-y-1">
            <p>Máx {cfg.maxMessages || 5} msgs/{cfg.timeWindow || 60}s</p>
            <span className="text-xs opacity-70">
              Ação: {cfg.action || 'warn'}
              {cfg.detectMediaFlood && ' 📷'}
              {cfg.detectStickerFlood && ' 🎭'}
            </span>
          </div>
        );

      case 'anti-link':
        return (
          <div className="space-y-1">
            <p>{cfg.blockAll ? 'Bloqueia todos' : 'Whitelist ativa'}</p>
            <span className="text-xs opacity-70">
              {cfg.allowedDomains?.length || 0} domínios permitidos
              {cfg.blockGroupLinks && ' 🔗'}
            </span>
          </div>
        );

      case 'group-rules':
        return (
          <div className="space-y-1">
            {cfg.rules && <p className="line-clamp-2">{cfg.rules.substring(0, 50)}...</p>}
            <span className="text-xs opacity-70">Gatilho: {cfg.trigger || 'comando'}</span>
          </div>
        );

      case 'member-counter':
        return (
          <div className="space-y-1">
            <p>Mostra: {cfg.showOn || 'marcos'}</p>
            {cfg.includeStats && <span className="text-xs opacity-70">📊 +Estatísticas</span>}
          </div>
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
