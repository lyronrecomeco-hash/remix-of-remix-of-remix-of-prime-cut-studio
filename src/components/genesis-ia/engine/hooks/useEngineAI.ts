import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { EngineNode, EngineEdge } from '../types';

interface UseEngineAIProps {
  nodes: EngineNode[];
  edges: EngineEdge[];
  prospectContext: Record<string, unknown>;
  sessionId: string | null;
  onCanvasAction?: (action: { type: string; nodes?: any[]; edges?: any[] }) => void;
}

export interface EngineAIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: string;
  title: string;
  createdAt: number;
  isStreaming?: boolean;
  pendingApproval?: boolean;
  approvalData?: { title: string; description: string };
}

export interface EngineAIActivityLog {
  id: string;
  level: 'info' | 'success' | 'error';
  message: string;
  createdAt: number;
}

const CANVAS_ACTIONS = new Set(['build_structure']);

const TITLE_MAP: Record<string, string> = {
  chat: 'Copiloto',
  prompt: 'Build Spec',
  scope: 'Escopo Técnico',
  blueprint: 'Blueprint Técnico',
  strategy: 'Estratégia Comercial',
  checklist: 'Checklist',
  executive: 'Resumo Executivo',
  analyze: 'Análise do Canvas',
  objections: 'Objeções',
  deploy_plan: 'Plano de Entrega',
  enrich_context: 'Contexto Enriquecido',
  build_structure: 'Estrutura do Canvas',
};

const DEFAULT_USER_MESSAGES: Record<string, string> = {
  build_structure: 'Monte a melhor estrutura possível para este canvas.',
  analyze: 'Analise o canvas atual e diga o que melhorar.',
  enrich_context: 'Enriqueça o contexto do negócio.',
  strategy: 'Defina a estratégia comercial ideal.',
  scope: 'Defina o escopo técnico completo.',
  blueprint: 'Crie o blueprint técnico.',
  prompt: 'Gere o build spec definitivo.',
  checklist: 'Organize em checklist de execução.',
  deploy_plan: 'Monte o plano de entrega.',
};

export function useEngineAI({ nodes, edges, prospectContext, sessionId, onCanvasAction }: UseEngineAIProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [outputs, setOutputs] = useState<{ type: string; title: string; content: string }[]>([]);
  const [lastActionType, setLastActionType] = useState<string | null>(null);
  const [messages, setMessages] = useState<EngineAIMessage[]>([]);
  const [activityLog, setActivityLog] = useState<EngineAIActivityLog[]>([]);
  const pendingPlanRef = useRef<string | null>(null);

  const pushActivity = useCallback((message: string, level: EngineAIActivityLog['level'] = 'info') => {
    setActivityLog(prev => [...prev.slice(-19), {
      id: `${level}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level, message, createdAt: Date.now(),
    }]);
  }, []);

  const pushUserMessage = useCallback((content: string, type: string, title: string) => {
    setMessages(prev => [...prev.slice(-39), {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'user', content, type, title, createdAt: Date.now(),
    }]);
  }, []);

  const upsertAssistantMessage = useCallback((messageId: string, content: string, type: string, title: string, isStreaming: boolean, extra?: Partial<EngineAIMessage>) => {
    const normalizedContent = normalizeAIContent(content);
    setMessages(prev => {
      const next = [...prev];
      const index = next.findIndex(m => m.id === messageId);
      const item: EngineAIMessage = {
        id: messageId,
        role: 'assistant',
        content: normalizedContent,
        type, title,
        createdAt: index >= 0 ? next[index].createdAt : Date.now(),
        isStreaming,
        ...extra,
      };
      if (index >= 0) next[index] = item;
      else next.push(item);
      return next.slice(-40);
    });
  }, []);

  // Handle approval/rejection from UI
  const handleApproval = useCallback((approved: boolean) => {
    if (approved) {
      // User approved — trigger execution
      pushActivity('Plano aprovado! Implementando no canvas...', 'success');
      generate('build_structure', pendingPlanRef.current || undefined);
    } else {
      pushActivity('Plano reprovado pelo usuário.', 'info');
      toast.info('Plano reprovado. Descreva o que deseja ajustar.');
    }
    // Clear approval states
    setMessages(prev => prev.map(m => m.pendingApproval ? { ...m, pendingApproval: false } : m));
    pendingPlanRef.current = null;
  }, [pushActivity]);

  const generateStructure = useCallback(async (instruction?: string) => {
    if (!onCanvasAction) return;

    const assistantId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const title = TITLE_MAP.build_structure;

    setIsGenerating(true);
    setStreamContent('');
    pushActivity('Montando estrutura no canvas...', 'info');
    upsertAssistantMessage(assistantId, 'Estruturando o canvas...', 'build_structure', title, true);

    try {
      const resp = await fetchAI({
        nodes, edges, prospectContext, sessionId,
        output_type: 'build_structure',
        user_instruction: instruction || 'Monte a melhor estrutura de conversão',
      });

      if (!resp.ok) throw new Error('Falha ao montar estrutura');
      if (!resp.body) throw new Error('Sem resposta');

      const fullContent = await readSSEStream(resp.body, (partial) => {
        setStreamContent(normalizeAIContent(partial));
      });

      let result: { nodes?: any[]; edges?: any[] } | null = null;
      try {
        const trimmed = fullContent.trim();
        if (trimmed.startsWith('{')) result = JSON.parse(trimmed);
        else {
          const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) || trimmed.match(/(\{[\s\S]*\})/);
          if (jsonMatch) result = JSON.parse(jsonMatch[1].trim());
        }
      } catch { throw new Error('IA não retornou estrutura válida'); }

      if (result?.nodes?.length) {
        onCanvasAction({ type: 'add_nodes', nodes: result.nodes, edges: result.edges || [] });
        upsertAssistantMessage(assistantId, `## ✅ Estrutura criada\n\n- **${result.nodes.length}** blocos adicionados\n- **${(result.edges || []).length}** conexões\n\nRevise no canvas e peça ajustes pelo chat.`, 'build_structure', title, false);
        pushActivity(`${result.nodes.length} bloco(s) adicionados.`, 'success');
        toast.success(`${result.nodes.length} blocos adicionados!`);
      } else {
        throw new Error('IA não gerou blocos');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro';
      upsertAssistantMessage(assistantId, `## ❌ Erro\n\n${msg}`, 'build_structure', title, false);
      pushActivity(msg, 'error');
      toast.error(msg);
    } finally {
      setIsGenerating(false);
      setStreamContent('');
    }
  }, [edges, nodes, onCanvasAction, prospectContext, pushActivity, sessionId, upsertAssistantMessage]);

  const generate = useCallback(async (outputType: string, userInstruction?: string) => {
    setLastActionType(outputType);
    const title = TITLE_MAP[outputType] || 'Saída';
    const userMessage = (userInstruction || DEFAULT_USER_MESSAGES[outputType] || `Gerar ${title}`).trim();
    pushUserMessage(userMessage, outputType, title);

    if (CANVAS_ACTIONS.has(outputType)) return generateStructure(userInstruction);

    setIsGenerating(true);
    setStreamContent('');
    pushActivity(`Gerando ${title}...`, 'info');

    const assistantId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    upsertAssistantMessage(assistantId, '', outputType, title, true);

    try {
      // Build chat history for context
      const chatHistory = messages
        .filter(m => m.type === 'chat')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetchAI({
        nodes, edges, prospectContext, sessionId,
        output_type: outputType,
        user_instruction: userInstruction,
        chat_history: outputType === 'chat' ? chatHistory : undefined,
      });

      if (!resp.ok) {
        if (resp.status === 429) { pushActivity('Limite excedido.', 'error'); toast.error('Limite excedido.'); return; }
        if (resp.status === 402) { pushActivity('Créditos insuficientes.', 'error'); toast.error('Créditos insuficientes.'); return; }
        throw new Error('Falha ao gerar');
      }
      if (!resp.body) throw new Error('Sem resposta');

      const fullContent = await readSSEStream(resp.body, (partial) => {
        const formatted = normalizeAIContent(partial);
        setStreamContent(formatted);
        upsertAssistantMessage(assistantId, formatted, outputType, title, true);
      });

      const formattedContent = normalizeAIContent(fullContent);

      // Parse action blocks from AI response
      const { cleanContent, actions } = parseActionBlocks(formattedContent);

      let hasPendingApproval = false;
      for (const action of actions) {
        if (action.type === 'approval') {
          hasPendingApproval = true;
          pendingPlanRef.current = userInstruction || userMessage;
        } else if (action.type === 'execute_plan') {
          // AI confirmed execution — trigger canvas build
          pushActivity('Implementando plano aprovado...', 'info');
          setTimeout(() => generateStructure(pendingPlanRef.current || undefined), 500);
        }
      }

      upsertAssistantMessage(assistantId, cleanContent, outputType, title, false, {
        pendingApproval: hasPendingApproval,
        approvalData: hasPendingApproval ? actions.find(a => a.type === 'approval') as any : undefined,
      });

      if (outputType !== 'chat') {
        setOutputs(prev => [...prev, { type: outputType, title, content: cleanContent }]);
      }

      pushActivity(`${title} concluído.`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar';
      upsertAssistantMessage(assistantId, `## ❌ Erro\n\n${msg}`, outputType, title, false);
      pushActivity(msg, 'error');
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [edges, generateStructure, messages, nodes, prospectContext, pushActivity, pushUserMessage, sessionId, upsertAssistantMessage]);

  return {
    isGenerating, streamContent, outputs, messages, activityLog, lastActionType,
    generate, handleApproval,
    clearStream: () => setStreamContent(''),
    clearOutputs: () => setOutputs([]),
    clearMessages: () => setMessages([]),
    clearActivityLog: () => setActivityLog([]),
  };
}

function fetchAI(params: Record<string, any>) {
  const { nodes, edges, prospectContext, sessionId, ...rest } = params;
  return fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-engine-output`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      nodes: (nodes || []).map((n: any) => ({ type: n.data?.nodeType || n.type, data: n.data })),
      edges,
      prospect_context: prospectContext,
      session_id: sessionId,
      ...rest,
    }),
  });
}

function parseActionBlocks(content: string) {
  const actionRegex = /```action\s*\n([\s\S]*?)\n```/g;
  const actions: any[] = [];
  let cleanContent = content;

  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    try {
      actions.push(JSON.parse(match[1].trim()));
    } catch {}
    cleanContent = cleanContent.replace(match[0], '');
  }

  return { cleanContent: cleanContent.trim(), actions };
}

function normalizeAIContent(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/([^\n])\n(##\s)/g, '$1\n\n$2')
    .trim();
}

async function readSSEStream(body: ReadableStream<Uint8Array>, onProgress: (content: string) => void): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let fullContent = '';
  let streamDone = false;

  const flushBuffer = () => {
    let separatorIndex: number;
    while ((separatorIndex = textBuffer.indexOf('\n\n')) !== -1) {
      const rawEvent = textBuffer.slice(0, separatorIndex);
      textBuffer = textBuffer.slice(separatorIndex + 2);
      const payload = rawEvent
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trim())
        .join('');

      if (!payload) continue;
      if (payload === '[DONE]') { streamDone = true; return; }

      try {
        const parsed = JSON.parse(payload);
        const content = parsed?.choices?.[0]?.delta?.content;
        if (typeof content === 'string') {
          fullContent += content;
          onProgress(fullContent);
        }
      } catch {}
    }
  };

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    flushBuffer();
  }

  if (textBuffer.trim()) {
    textBuffer += '\n\n';
    flushBuffer();
  }

  return fullContent;
}
