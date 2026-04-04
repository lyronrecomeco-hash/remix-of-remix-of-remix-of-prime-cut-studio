import { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, GripVertical, AlertTriangle, Target, Star
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, AlertTriangle, Target, Star,
};

interface EngineNodeProps {
  data: {
    label: string;
    content: string;
    nodeType: string;
    icon?: string;
    color?: string;
    onContentChange?: (content: string) => void;
  };
  selected?: boolean;
}

export const EngineNodeComponent = memo(({ data, selected }: EngineNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const Icon = ICON_MAP[data.icon || 'StickyNote'] || StickyNote;
  const color = data.color || '#3b82f6';

  useEffect(() => {
    setContent(data.content || '');
  }, [data.content]);

  const handleBlur = () => {
    setIsEditing(false);
    data.onContentChange?.(content);
  };

  return (
    <div
      className={`relative min-w-[200px] max-w-[280px] rounded-lg border transition-all duration-150 ${
        selected ? 'ring-1 ring-primary/50' : ''
      }`}
      style={{
        background: 'hsl(220 25% 12%)',
        borderColor: selected ? `${color}80` : 'rgba(255,255,255,0.06)',
        boxShadow: selected ? `0 0 20px ${color}15` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !border-[1.5px] !bg-white/10 !border-white/20" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !border-[1.5px] !bg-white/10 !border-white/20" />

      {/* Top accent line */}
      <div className="h-0.5 rounded-t-lg" style={{ background: `${color}60` }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <Icon className="w-3 h-3" style={{ color }} />
        </div>
        <span className="text-[11px] font-semibold text-white/80 flex-1 truncate">{data.label}</span>
        <GripVertical className="w-3 h-3 text-white/15 cursor-grab" />
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full min-h-[50px] text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-md p-2 text-white/70 resize-none focus:outline-none focus:border-primary/40 leading-relaxed"
            placeholder="Escreva aqui..."
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="min-h-[32px] text-[11px] text-white/40 cursor-text hover:text-white/60 transition-colors whitespace-pre-wrap leading-relaxed"
          >
            {content || 'Clique para editar...'}
          </div>
        )}
      </div>
    </div>
  );
});

EngineNodeComponent.displayName = 'EngineNodeComponent';
