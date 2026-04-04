import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Building2, Search, TrendingUp, Zap, Layers, Monitor, Server, Database,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, GripVertical
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Search, TrendingUp, Zap, Layers, Monitor, Server, Database,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal,
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

  const handleBlur = () => {
    setIsEditing(false);
    data.onContentChange?.(content);
  };

  return (
    <div
      className={`relative min-w-[220px] max-w-[320px] rounded-xl border transition-all duration-200 ${
        selected ? 'ring-2 ring-primary shadow-lg' : 'shadow-md'
      }`}
      style={{
        background: 'hsl(220 25% 13%)',
        borderColor: selected ? color : 'rgba(255,255,255,0.1)',
      }}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !border-2 !bg-white/20" style={{ borderColor: color }} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !border-2 !bg-white/20" style={{ borderColor: color }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <GripVertical className="w-3 h-3 text-white/30 cursor-grab" />
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}33` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-xs font-semibold text-white/90 flex-1 truncate">{data.label}</span>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full min-h-[60px] text-xs bg-white/5 border border-white/10 rounded-lg p-2 text-white/80 resize-none focus:outline-none focus:border-primary/50"
            placeholder="Escreva aqui..."
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="min-h-[40px] text-xs text-white/60 cursor-text hover:text-white/80 transition-colors whitespace-pre-wrap"
          >
            {content || 'Clique para editar...'}
          </div>
        )}
      </div>
    </div>
  );
});

EngineNodeComponent.displayName = 'EngineNodeComponent';
