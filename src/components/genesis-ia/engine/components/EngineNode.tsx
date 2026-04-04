import { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, GripVertical, AlertTriangle, Target, Star,
  Sparkles
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, AlertTriangle, Target, Star,
};

// Field hints per block type for guided editing
const FIELD_HINTS: Record<string, string[]> = {
  prospect: ['Empresa', 'Contato', 'Nicho', 'Telefone', 'Email', 'Contexto'],
  diagnosis: ['Situação atual', 'Problemas detectados', 'Falhas digitais', 'Lacunas'],
  pain: ['Dor principal', 'Impacto no negócio', 'Urgência', 'Argumento central'],
  opportunity: ['O que pode ser vendido', 'Potencial de melhora', 'Ticket possível'],
  strategy: ['Caminho recomendado', 'Ordem de ações', 'Raciocínio comercial'],
  offer: ['O que será ofertado', 'Formato', 'Valor percebido', 'Posicionamento'],
  differentials: ['Pontos de destaque', 'Defesa comercial', 'Por que é forte'],
  objections: ['Objeções prováveis', 'Respostas preparadas', 'Mitigação'],
  approach: ['Mensagem inicial', 'Canal ideal', 'Tom', 'CTA recomendado'],
  scope: ['O que entra', 'O que não entra', 'Entregáveis'],
  structure: ['Frontend', 'Backend', 'Banco', 'Autenticação', 'Painéis'],
  integrations: ['APIs', 'Serviços externos', 'Conexões necessárias'],
  automation: ['Fluxos automáticos', 'Gatilhos', 'Ações de rotina'],
  followup: ['Sequência comercial', 'Lembretes', 'Continuidade'],
  checklist: ['Etapas', 'Itens executáveis', 'Status'],
  deploy: ['Ambiente', 'Publicação', 'Direcionamento'],
  prompt: ['Prompt consolidado', 'Frontend', 'Backend', 'DB', 'Integrações'],
  notes: ['Anotações livres'],
};

interface EngineNodeProps {
  data: {
    label: string;
    content: string;
    nodeType: string;
    icon?: string;
    color?: string;
    description?: string;
    onContentChange?: (content: string) => void;
  };
  selected?: boolean;
}

export const EngineNodeComponent = memo(({ data, selected }: EngineNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const Icon = ICON_MAP[data.icon || 'StickyNote'] || StickyNote;
  const color = data.color || '#3b82f6';
  const hints = FIELD_HINTS[data.nodeType] || [];

  useEffect(() => {
    setContent(data.content || '');
  }, [data.content]);

  const handleBlur = () => {
    setIsEditing(false);
    data.onContentChange?.(content);
  };

  const hasContent = content.trim().length > 0;

  return (
    <div
      className={`relative min-w-[220px] max-w-[300px] rounded-lg border transition-all duration-150 ${
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
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-white/80 block truncate">{data.label}</span>
          {data.description && !hasContent && (
            <span className="text-[9px] text-white/20 block truncate">{data.description}</span>
          )}
        </div>
        <GripVertical className="w-3 h-3 text-white/15 cursor-grab flex-shrink-0" />
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full min-h-[70px] text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-md p-2 text-white/70 resize-none focus:outline-none focus:border-primary/40 leading-relaxed"
            placeholder={hints.length > 0 ? hints.join(' • ') : 'Escreva aqui...'}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="min-h-[36px] text-[11px] cursor-text hover:bg-white/[0.02] rounded-md p-1.5 -mx-1.5 transition-colors"
          >
            {hasContent ? (
              <div className="text-white/50 whitespace-pre-wrap leading-relaxed">{content}</div>
            ) : (
              <div className="text-white/20 italic">
                {hints.length > 0 ? (
                  <div className="space-y-0.5">
                    {hints.slice(0, 4).map((h, i) => (
                      <span key={i} className="block text-[10px]">• {h}</span>
                    ))}
                    {hints.length > 4 && <span className="text-[9px] text-white/15">+{hints.length - 4} campos</span>}
                  </div>
                ) : (
                  'Clique para editar...'
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

EngineNodeComponent.displayName = 'EngineNodeComponent';
