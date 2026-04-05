import { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Wifi, WifiOff, Send, Settings, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

interface WhatsAppNodeProps {
  data: {
    label: string;
    content: string;
    nodeType: string;
    color?: string;
    description?: string;
    onContentChange?: (content: string) => void;
    connectorStatus?: string;
  };
  selected?: boolean;
}

export const WhatsAppNodeComponent = memo(({ data, selected }: WhatsAppNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const color = '#25d366'; // WhatsApp green

  useEffect(() => { setContent(data.content || ''); }, [data.content]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    data.onContentChange?.(content);
  }, [content, data]);

  const hasContent = content.trim().length > 0;
  const status = data.connectorStatus || 'disconnected';

  return (
    <div
      className={`relative min-w-[240px] max-w-[320px] rounded-lg border transition-all duration-150 ${
        selected ? 'ring-1 ring-green-500/50' : ''
      }`}
      style={{
        background: 'hsl(220 25% 12%)',
        borderColor: selected ? `${color}80` : 'rgba(255,255,255,0.06)',
        boxShadow: selected ? `0 0 20px ${color}15` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !border-[1.5px] !bg-white/10 !border-white/20" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !border-[1.5px] !bg-white/10 !border-white/20" />

      {/* Top accent */}
      <div className="h-0.5 rounded-t-lg" style={{ background: `${color}60` }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <MessageSquare className="w-3 h-3" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-white/80 block truncate">{data.label || 'WhatsApp'}</span>
          <div className="flex items-center gap-1 mt-0.5">
            {status === 'connected' ? (
              <Wifi className="w-2.5 h-2.5 text-green-400" />
            ) : (
              <WifiOff className="w-2.5 h-2.5 text-red-400/50" />
            )}
            <span className={`text-[9px] ${status === 'connected' ? 'text-green-400/70' : 'text-white/20'}`}>
              {status === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {hasContent && (
            <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="p-0.5 hover:bg-white/10 rounded transition-colors">
              {isExpanded ? <ChevronDown className="w-3 h-3 text-white/25" /> : <ChevronRight className="w-3 h-3 text-white/25" />}
            </button>
          )}
          <GripVertical className="w-3 h-3 text-white/15 cursor-grab flex-shrink-0" />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full min-h-[70px] text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-md p-2 text-white/70 resize-none focus:outline-none focus:border-green-500/40 leading-relaxed"
            placeholder="Provider: ChatPro&#10;Telefone: ...&#10;Mensagem: ...&#10;Agendamento: ..."
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="min-h-[36px] text-[11px] cursor-text hover:bg-white/[0.02] rounded-md p-1.5 -mx-1.5 transition-colors"
          >
            {hasContent ? (
              <div className="text-white/50 leading-relaxed">
                {isExpanded ? (
                  <div className="whitespace-pre-wrap">{content}</div>
                ) : (
                  <div className="line-clamp-3">{content.split('\n').filter(l => l.trim()).slice(0, 3).join(' • ').slice(0, 100)}</div>
                )}
              </div>
            ) : (
              <div className="text-white/20 italic space-y-0.5">
                <span className="block text-[10px]">• Provider</span>
                <span className="block text-[10px]">• Telefone</span>
                <span className="block text-[10px]">• Mensagem</span>
                <span className="block text-[10px]">• Agendamento</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions hint */}
      <div className="px-3 pb-2 flex gap-1">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/[0.06] border border-green-500/[0.1]">
          <Send className="w-2.5 h-2.5 text-green-400/50" />
          <span className="text-[8px] text-green-400/50">Envio</span>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
          <Settings className="w-2.5 h-2.5 text-white/20" />
          <span className="text-[8px] text-white/20">Config</span>
        </div>
      </div>
    </div>
  );
});

WhatsAppNodeComponent.displayName = 'WhatsAppNodeComponent';
