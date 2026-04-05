import { useState, useCallback } from 'react';
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
}

export interface EngineAIActivityLog {
  id: string;
  level: 'info' | 'success' | 'error';
  message: string;
  createdAt: number;
}

const CANVAS_ACTIONS = new Set(['build_structure']);

const TITLE_MAP: Record<string, string> = {
  chat: 'Chat IA',
  prompt: 'Build Spec (Prompt)',
  scope: 'Escopo Técnico',
  blueprint: 'Blueprint Técnico',
  strategy: 'Estratégia Comercial',
  checklist: 'Checklist de Implementação',
  executive: 'Resumo Executivo',
  analyze: 'Análise do Canvas',
  objections: 'Fluxo de Objeções',
  deploy_plan: 'Plano de Entrega',
  enrich_context: 'Contexto Enriquecido',
  build_structure: 'Estrutura do Canvas',
};

const DEFAULT_USER_MESSAGES: Record<string, string> = {
  chat: 'Quero ajuda estratégica para evoluir este projeto.',
  build_structure: 'Monte a melhor estrutura possível para este canvas.',
  analyze: 'Analise o canvas atual e diga o que melhorar.',
  enrich_context: 'Enriqueça o contexto do negócio com profundidade.',
  strategy: 'Defina a estratégia comercial ideal para fechar este cliente.',
  scope: 'Defina o escopo técnico completo da solução.',
  blueprint: 'Crie o blueprint técnico completo.',
  prompt: 'Gere o build spec definitivo para construir o sistema.',
  checklist: 'Organize tudo em um checklist de execução.',
  deploy_plan: 'Monte o plano de entrega e deploy.',
};

export function useEngineAI({ nodes, edges, prospectContext, sessionId, onCanvasAction }: UseEngineAIProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [outputs, setOutputs] = useState<{ type: string; title: string; content: string }[]>([]);
  const [lastActionType, setLastActionType] = useState<string | null>(null);
  const [messages, setMessages] = useState<EngineAIMessage[]>([]);
  const [activityLog, setActivityLog] = useState<EngineAIActivityLog[]>([]);

  const pushActivity = useCallback((message: string, level: EngineAIActivityLog['level'] = 'info') => {
    setActivityLog(prev => [...prev.slice(-19), {
      id: `${level}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      level,
      message,
      createdAt: Date.now(),
    }]);
  }, []);

  const pushUserMessage = useCallback((content: string, type: string, title: string) => {
    setMessages(prev => [...prev.slice(-39), {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'user',
      content,
      type,
      title,
      createdAt: Date.now(),
    }]);
  }, []);

  const upsertAssistantMessage = useCallback((messageId: string, content: string, type: string, title: string, isStreaming: boolean) => {
    const normalizedContent = normalizeAIContent(content);
    setMessages(prev => {
      const next = [...prev];
      const index = next.findIndex(message => message.id === messageId);
      const item: EngineAIMessage = {
        id: messageId,
        role: 'assistant',
        content: normalizedContent,
        type,
        title,
        createdAt: index >= 0 ? next[index].createdAt : Date.now(),
        isStreaming,
      };
      if (index >= 0) next[index] = item;
      else next.push(item);
      return next.slice(-40);
    });
  }, []);

  const generateStructure = useCallback(async (instruction?: string) => {
    if (!onCanvasAction) return;

    const assistantId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const title = TITLE_MAP.build_structure;

    setIsGenerating(true);
    setStreamContent('');
    pushActivity('Montando estrutura estratégica no canvas...', 'info');
    upsertAssistantMessage(assistantId, 'Estruturando o canvas com base no contexto do prospect...', 'build_structure', title, true);
    toast.info('Montando estrutura no canvas...');

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-engine-output`;
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ type: n.data.nodeType, data: n.data })),
          edges,
          prospect_context: prospectContext,
          output_type: 'build_structure',
          user_instruction: instruction || 'Monte a melhor estrutura de conversão para este prospect',
          session_id: sessionId,
        }),
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
      } catch {
        throw new Error('IA não retornou estrutura válida');
      }

      if (result?.nodes?.length) {
        onCanvasAction({ type: 'add_nodes', nodes: result.nodes, edges: result.edges || [] });
        const summary = [
          '## Estrutura criada com sucesso',
          '',
          `- **Blocos sugeridos:** ${result.nodes.length}`,
          `- **Conexões sugeridas:** ${(result.edges || []).length}`,
          '',
          'Revise os blocos no canvas e peça ajustes pelo chat se quiser refinar.',
        ].join('\n');
        upsertAssistantMessage(assistantId, summary, 'build_structure', title, false);
        pushActivity(`${result.nodes.length} bloco(s) adicionados ao canvas.`, 'success');
        toast.success(`${result.nodes.length} blocos adicionados ao canvas!`);
      } else {
        throw new Error('IA não gerou blocos válidos');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao montar estrutura';
      upsertAssistantMessage(assistantId, `## Não consegui montar a estrutura\n\n**Motivo:** ${message}`, 'build_structure', title, false);
      pushActivity(message, 'error');
      toast.error('Erro ao montar estrutura');
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

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-engine-output`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ type: n.data.nodeType, data: n.data })),
          edges,
          prospect_context: prospectContext,
          output_type: outputType,
          user_instruction: userInstruction,
          session_id: sessionId,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          pushActivity('Limite de requisições excedido. Tente novamente em instantes.', 'error');
          toast.error('Limite de requisições excedido. Tente novamente em instantes.');
          return;
        }
        if (resp.status === 402) {
          pushActivity('Créditos insuficientes.', 'error');
          toast.error('Créditos insuficientes.');
          return;
        }
        throw new Error('Falha ao gerar');
      }

      if (!resp.body) throw new Error('Sem resposta');

      const fullContent = await readSSEStream(resp.body, (partial) => {
        const formatted = normalizeAIContent(partial);
        setStreamContent(formatted);
        upsertAssistantMessage(assistantId, formatted, outputType, title, true);
      });

      const formattedContent = normalizeAIContent(fullContent);
      upsertAssistantMessage(assistantId, formattedContent, outputType, title, false);

      if (outputType !== 'chat') {
        setOutputs(prev => [...prev, { type: outputType, title, content: formattedContent }]);
      }

      pushActivity(`${title} concluído.`, 'success');
      toast.success('Geração concluída!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar com IA';
      upsertAssistantMessage(assistantId, `## Não consegui concluir\n\n**Motivo:** ${message}`, outputType, title, false);
      pushActivity(message, 'error');
      toast.error('Erro ao gerar com IA');
    } finally {
      setIsGenerating(false);
    }
  }, [edges, generateStructure, nodes, prospectContext, pushActivity, pushUserMessage, sessionId, upsertAssistantMessage]);

  return {
    isGenerating,
    streamContent,
    outputs,
    messages,
    activityLog,
    lastActionType,
    generate,
    clearStream: () => setStreamContent(''),
    clearOutputs: () => setOutputs([]),
    clearMessages: () => setMessages([]),
    clearActivityLog: () => setActivityLog([]),
  };
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
      if (payload === '[DONE]') {
        streamDone = true;
        return;
      }

      try {
        const parsed = JSON.parse(payload);
        const content = extractDeltaContent(parsed);
        if (content) {
          fullContent += content;
          onProgress(fullContent);
        }
      } catch {
      }
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

function extractDeltaContent(payload: any) {
  const deltaContent = payload?.choices?.[0]?.delta?.content;
  if (typeof deltaContent === 'string') return deltaContent;
  if (Array.isArray(deltaContent)) {
    return deltaContent.map((part: any) => typeof part === 'string' ? part : part?.text || part?.content || '').join('');
  }
  const messageContent = payload?.choices?.[0]?.message?.content;
  if (typeof messageContent === 'string') return messageContent;
  if (Array.isArray(messageContent)) {
    return messageContent.map((part: any) => typeof part === 'string' ? part : part?.text || part?.content || '').join('');
  }
  return '';
}