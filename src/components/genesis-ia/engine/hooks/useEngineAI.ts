import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { EngineNode, EngineEdge } from '../types';

interface UseEngineAIProps {
  nodes: EngineNode[];
  edges: EngineEdge[];
  prospectContext: Record<string, unknown>;
  sessionId: string | null;
}

export function useEngineAI({ nodes, edges, prospectContext, sessionId }: UseEngineAIProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [outputs, setOutputs] = useState<{ type: string; title: string; content: string }[]>([]);

  const generate = useCallback(async (outputType: string, userInstruction?: string) => {
    setIsGenerating(true);
    setStreamContent('');

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
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error('Limite de requisições excedido. Tente novamente em instantes.');
          return;
        }
        if (resp.status === 402) {
          toast.error('Créditos insuficientes.');
          return;
        }
        throw new Error('Falha ao gerar');
      }

      if (!resp.body) throw new Error('Sem resposta');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setStreamContent(fullContent);
            }
          } catch { /* partial */ }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setStreamContent(fullContent);
            }
          } catch { /* ignore */ }
        }
      }

      const titleMap: Record<string, string> = {
        prompt: 'Prompt Completo',
        scope: 'Escopo Técnico',
        blueprint: 'Blueprint Técnico',
        strategy: 'Estratégia Comercial',
        checklist: 'Checklist de Implementação',
        executive: 'Resumo Executivo',
        analyze: 'Análise do Canvas',
      };

      setOutputs(prev => [...prev, {
        type: outputType,
        title: titleMap[outputType] || 'Saída',
        content: fullContent,
      }]);

      toast.success('Geração concluída!');
    } catch (err) {
      console.error('AI generation error:', err);
      toast.error('Erro ao gerar com IA');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, prospectContext]);

  return {
    isGenerating,
    streamContent,
    outputs,
    generate,
    clearStream: () => setStreamContent(''),
    clearOutputs: () => setOutputs([]),
  };
}
