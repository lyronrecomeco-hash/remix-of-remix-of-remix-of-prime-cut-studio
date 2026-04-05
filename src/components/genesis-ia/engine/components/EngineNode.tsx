import { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, GripVertical, AlertTriangle, Target, Star,
  Sparkles, ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, SkipForward
} from 'lucide-react';
import type { BlockExecutionStatus, EngineNodeType } from '../types';
import { BLOCK_CATEGORIES, CATEGORY_META } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, AlertTriangle, Target, Star,
};

// Structured fields per block type for guided editing
const BLOCK_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  prospect: [
    { key: 'empresa', label: 'Empresa', placeholder: 'Nome do negócio' },
    { key: 'contato', label: 'Contato', placeholder: 'Nome do decisor' },
    { key: 'nicho', label: 'Nicho', placeholder: 'Segmento do negócio' },
    { key: 'telefone', label: 'Telefone', placeholder: '+55 ...' },
    { key: 'email', label: 'Email', placeholder: 'email@empresa.com' },
    { key: 'endereco', label: 'Endereço', placeholder: 'Rua, bairro, cidade - UF' },
    { key: 'website', label: 'Website', placeholder: 'https://...' },
    { key: 'instagram', label: 'Instagram', placeholder: '@perfil' },
    { key: 'servicos', label: 'Serviços', placeholder: 'Principais serviços oferecidos' },
    { key: 'contexto', label: 'Contexto', placeholder: 'Situação e cenário atual' },
  ],
  diagnosis: [
    { key: 'situacao', label: 'Situação Atual', placeholder: 'Como está o negócio hoje' },
    { key: 'problemas', label: 'Problemas', placeholder: 'Problemas detectados' },
    { key: 'falhas', label: 'Falhas Digitais', placeholder: 'Falhas na presença digital' },
    { key: 'lacunas', label: 'Lacunas', placeholder: 'O que falta no negócio' },
  ],
  pain: [
    { key: 'dor', label: 'Dor Principal', placeholder: 'Qual a dor central' },
    { key: 'impacto', label: 'Impacto', placeholder: 'Como afeta o negócio' },
    { key: 'urgencia', label: 'Urgência', placeholder: 'Nível de urgência' },
    { key: 'argumento', label: 'Argumento Central', placeholder: 'Como explorar comercialmente' },
  ],
  opportunity: [
    { key: 'servico', label: 'O que vender', placeholder: 'Serviço/produto recomendado' },
    { key: 'potencial', label: 'Potencial', placeholder: 'Potencial de melhora' },
    { key: 'ticket', label: 'Ticket Possível', placeholder: 'R$ estimado' },
    { key: 'prioridade', label: 'Prioridade', placeholder: 'Alta / Média / Baixa' },
  ],
  strategy: [
    { key: 'caminho', label: 'Caminho', placeholder: 'Estratégia recomendada' },
    { key: 'acoes', label: 'Ordem de Ações', placeholder: 'Passo a passo' },
    { key: 'proposta', label: 'Proposta', placeholder: 'O que oferecer' },
    { key: 'raciocinio', label: 'Raciocínio', placeholder: 'Lógica comercial' },
  ],
  offer: [
    { key: 'oferta', label: 'Oferta', placeholder: 'O que será ofertado' },
    { key: 'formato', label: 'Formato', placeholder: 'Setup + recorrência, pacote, etc' },
    { key: 'valor', label: 'Valor Percebido', placeholder: 'Benefícios para o cliente' },
    { key: 'posicionamento', label: 'Posicionamento', placeholder: 'Como posicionar a oferta' },
  ],
  differentials: [
    { key: 'destaques', label: 'Pontos de Destaque', placeholder: 'Diferenciais competitivos' },
    { key: 'defesa', label: 'Defesa Comercial', placeholder: 'Argumentos de defesa' },
    { key: 'forca', label: 'Por que é forte', placeholder: 'Razões de superioridade' },
  ],
  objections: [
    { key: 'objecoes', label: 'Objeções Prováveis', placeholder: 'O que o cliente pode dizer' },
    { key: 'respostas', label: 'Respostas', placeholder: 'Como responder cada objeção' },
    { key: 'mitigacao', label: 'Mitigação', placeholder: 'Reduzir resistência' },
  ],
  approach: [
    { key: 'mensagem', label: 'Mensagem Inicial', placeholder: 'Primeiro contato' },
    { key: 'canal', label: 'Canal', placeholder: 'WhatsApp, email, telefone...' },
    { key: 'tom', label: 'Tom', placeholder: 'Consultivo, direto, casual...' },
    { key: 'cta', label: 'CTA', placeholder: 'Call to action recomendado' },
  ],
  scope: [
    { key: 'entra', label: 'O que entra', placeholder: 'Funcionalidades inclusas' },
    { key: 'nao_entra', label: 'O que NÃO entra', placeholder: 'Fora do escopo' },
    { key: 'entregaveis', label: 'Entregáveis', placeholder: 'O que será entregue' },
    { key: 'prazo', label: 'Prazo', placeholder: 'Estimativa de tempo' },
  ],
  structure: [
    { key: 'frontend', label: 'Frontend', placeholder: 'React, Next, etc' },
    { key: 'backend', label: 'Backend', placeholder: 'Node, Supabase, etc' },
    { key: 'banco', label: 'Banco de Dados', placeholder: 'PostgreSQL, etc' },
    { key: 'auth', label: 'Autenticação', placeholder: 'Email/senha, OAuth, etc' },
    { key: 'paineis', label: 'Painéis', placeholder: 'Admin, cliente, público' },
    { key: 'apis', label: 'APIs', placeholder: 'Endpoints principais' },
  ],
  integrations: [
    { key: 'servico', label: 'Serviço', placeholder: 'Nome da integração' },
    { key: 'finalidade', label: 'Finalidade', placeholder: 'Para que serve' },
    { key: 'auth_type', label: 'Auth', placeholder: 'API Key, OAuth, etc' },
    { key: 'endpoint', label: 'Endpoint', placeholder: 'URL base' },
    { key: 'webhook', label: 'Webhook', placeholder: 'URL de callback' },
  ],
  automation: [
    { key: 'tipo', label: 'Tipo', placeholder: 'WhatsApp, email, webhook...' },
    { key: 'gatilho', label: 'Gatilho', placeholder: 'Quando dispara' },
    { key: 'acao', label: 'Ação', placeholder: 'O que acontece' },
    { key: 'canal', label: 'Canal', placeholder: 'Meio de comunicação' },
    { key: 'delay', label: 'Delay', placeholder: 'Imediato, 1h, 24h...' },
    { key: 'fallback', label: 'Fallback', placeholder: 'Se falhar, fazer...' },
  ],
  followup: [
    { key: 'sequencia', label: 'Sequência', placeholder: 'Passos do follow-up' },
    { key: 'timing', label: 'Timing', placeholder: 'Quando cada contato' },
    { key: 'canal', label: 'Canal', placeholder: 'WhatsApp, email, call...' },
    { key: 'template', label: 'Template', placeholder: 'Modelo de mensagem' },
  ],
  whatsapp: [
    { key: 'provider', label: 'Provider', placeholder: 'ChatPro' },
    { key: 'telefone', label: 'Telefone', placeholder: '+55 ...' },
    { key: 'mensagem', label: 'Mensagem', placeholder: 'Texto a enviar' },
    { key: 'agendamento', label: 'Agendamento', placeholder: 'Imediato, data...' },
    { key: 'gatilho', label: 'Gatilho', placeholder: 'Quando disparar' },
    { key: 'status', label: 'Status', placeholder: 'Pendente, enviado...' },
  ],
  checklist: [
    { key: 'itens', label: 'Itens', placeholder: 'Lista de tarefas' },
    { key: 'fase', label: 'Fase', placeholder: 'Setup, Core, Deploy...' },
    { key: 'responsavel', label: 'Responsável', placeholder: 'Quem executa' },
  ],
  deploy: [
    { key: 'destino', label: 'Destino', placeholder: 'Vercel, Lovable, etc' },
    { key: 'dominio', label: 'Domínio', placeholder: 'URL do projeto' },
    { key: 'banco', label: 'Banco', placeholder: 'Supabase, Neon, etc' },
    { key: 'storage', label: 'Storage', placeholder: 'S3, Supabase Storage...' },
    { key: 'env_vars', label: 'Env Vars', placeholder: 'Variáveis necessárias' },
    { key: 'script', label: 'Script', placeholder: 'Comandos de deploy' },
  ],
  prompt: [
    { key: 'prompt', label: 'Prompt Consolidado', placeholder: 'Prompt completo para build' },
    { key: 'frontend', label: 'Frontend', placeholder: 'Detalhes de frontend' },
    { key: 'backend', label: 'Backend', placeholder: 'Detalhes de backend' },
    { key: 'db', label: 'Banco de Dados', placeholder: 'Schema e migrations' },
    { key: 'integracoes', label: 'Integrações', placeholder: 'APIs e serviços' },
  ],
  notes: [
    { key: 'notas', label: 'Anotações', placeholder: 'Notas livres...' },
  ],
};

interface EngineNodeProps {
  data: {
    label: string;
    content: string;
    nodeType: string;
    icon?: string;
    color?: string;
    description?: string;
    executionStatus?: BlockExecutionStatus;
    executionError?: string;
    onContentChange?: (content: string) => void;
  };
  selected?: boolean;
}

const EXEC_STATUS_INDICATOR: Record<BlockExecutionStatus, { icon: React.ElementType; color: string; pulse?: boolean }> = {
  idle: { icon: () => null, color: 'transparent' },
  ready: { icon: CheckCircle2, color: '#60a5fa' },
  running: { icon: Loader2, color: '#a78bfa', pulse: true },
  success: { icon: CheckCircle2, color: '#34d399' },
  failed: { icon: XCircle, color: '#f87171' },
  skipped: { icon: SkipForward, color: '#6b7280' },
};

export const EngineNodeComponent = memo(({ data, selected }: EngineNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const Icon = ICON_MAP[data.icon || 'StickyNote'] || StickyNote;
  const color = data.color || '#3b82f6';
  const fields = BLOCK_FIELDS[data.nodeType] || [{ key: 'content', label: 'Conteúdo', placeholder: 'Escreva aqui...' }];

  // Block category
  const blockCategory = BLOCK_CATEGORIES[data.nodeType as EngineNodeType];
  const categoryMeta = blockCategory ? CATEGORY_META[blockCategory] : null;

  useEffect(() => {
    setContent(data.content || '');
  }, [data.content]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    data.onContentChange?.(content);
  }, [content, data]);

  const hasContent = content.trim().length > 0;

  const contentPreview = hasContent
    ? content.split('\n').filter(l => l.trim()).slice(0, 3).join(' • ').slice(0, 100)
    : null;

  const execStatus = data.executionStatus || 'idle';
  const execIndicator = EXEC_STATUS_INDICATOR[execStatus];
  const ExecIcon = execIndicator.icon;

  // Handle style based on category
  const isAction = blockCategory === 'action';
  const handleBorderColor = isAction ? '#10b98180' : 'rgba(255,255,255,0.2)';

  return (
    <div
      className={`relative min-w-[240px] max-w-[320px] rounded-lg border transition-all duration-150 ${
        selected ? 'ring-1 ring-primary/50' : ''
      } ${execStatus === 'running' ? 'ring-1 ring-purple-400/30' : ''} ${execStatus === 'failed' ? 'ring-1 ring-red-400/20' : ''}`}
      style={{
        background: 'hsl(220 25% 12%)',
        borderColor: execStatus === 'running' ? '#a78bfa50' : execStatus === 'failed' ? '#f8717130' : execStatus === 'success' ? '#34d39930' : selected ? `${color}80` : 'rgba(255,255,255,0.06)',
        boxShadow: selected ? `0 0 20px ${color}15` : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <Handle type="target" position={Position.Left} 
        className="!w-2.5 !h-2.5 !border-[1.5px] !bg-white/10"
        style={{ borderColor: handleBorderColor }}
      />
      <Handle type="source" position={Position.Right} 
        className="!w-2.5 !h-2.5 !border-[1.5px] !bg-white/10"
        style={{ borderColor: handleBorderColor }}
      />

      {/* Execution status indicator */}
      {execStatus !== 'idle' && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${execIndicator.pulse ? 'animate-pulse' : ''}`}
            style={{ background: `${execIndicator.color}30`, border: `1px solid ${execIndicator.color}50` }}>
            <ExecIcon className="w-2.5 h-2.5" style={{ color: execIndicator.color }} />
          </div>
        </div>
      )}

      {/* Top accent line */}
      <div className="h-0.5 rounded-t-lg" style={{ background: `${color}60` }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <Icon className="w-3 h-3" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-white/80 truncate">{data.label}</span>
            {/* Category badge */}
            {categoryMeta && (
              <span 
                className="text-[7px] font-bold uppercase tracking-wider px-1 py-0 rounded flex-shrink-0"
                style={{ 
                  color: `${categoryMeta.color}90`,
                  background: `${categoryMeta.color}12`,
                }}
              >
                {categoryMeta.label}
              </span>
            )}
          </div>
          {data.description && !hasContent && (
            <span className="text-[9px] text-white/20 block truncate">{data.description}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {hasContent && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-white/25" />
              ) : (
                <ChevronRight className="w-3 h-3 text-white/25" />
              )}
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
            className="w-full min-h-[90px] text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-md p-2 text-white/70 resize-none focus:outline-none focus:border-primary/40 leading-relaxed"
            placeholder={fields.map(f => `${f.label}: ${f.placeholder}`).join('\n')}
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
                  <div className="line-clamp-3">{contentPreview}</div>
                )}
              </div>
            ) : (
              <div className="text-white/20 italic space-y-0.5">
                {fields.slice(0, 4).map((f) => (
                  <span key={f.key} className="block text-[10px]">• {f.label}</span>
                ))}
                {fields.length > 4 && <span className="text-[9px] text-white/15">+{fields.length - 4} campos</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fill indicator */}
      {hasContent && (
        <div className="h-0.5 mx-3 mb-2 rounded-full overflow-hidden bg-white/[0.04]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (content.length / 200) * 100)}%`,
              background: execStatus === 'success' ? '#34d39960' : execStatus === 'failed' ? '#f8717160' : `${color}60`,
            }}
          />
        </div>
      )}

      {/* Execution error */}
      {data.executionError && (
        <div className="mx-3 mb-2 px-2 py-1 rounded bg-red-500/[0.08] border border-red-500/[0.12]">
          <span className="text-[9px] text-red-300/80">{data.executionError}</span>
        </div>
      )}
    </div>
  );
});

EngineNodeComponent.displayName = 'EngineNodeComponent';
