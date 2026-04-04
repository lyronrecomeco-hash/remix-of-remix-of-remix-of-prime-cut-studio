import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { EngineNode, EngineEdge, NODE_CATALOG } from '../types';

interface UseEngineAIProps {
  nodes: EngineNode[];
  edges: EngineEdge[];
  prospectContext: Record<string, unknown>;
  sessionId: string | null;
  onCanvasAction?: (action: { type: string; nodes?: any[]; edges?: any[] }) => void;
}

export function useEngineAI({ nodes, edges, prospectContext, sessionId, onCanvasAction }: UseEngineAIProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [outputs, setOutputs] = useState<{ type: string; title: string; content: string }[]>([]);

  const generate = useCallback(async (outputType: string, userInstruction?: string) => {
    // Special: build_structure creates nodes via AI
    if (outputType === 'build_structure') {
      return generateStructure(userInstruction);
    }

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
        objections: 'Fluxo de Objeções',
        deploy_plan: 'Plano de Entrega',
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

  // Generate structure: AI creates nodes on the canvas
  const generateStructure = useCallback(async (instruction?: string) => {
    if (!onCanvasAction) return;
    setIsGenerating(true);
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
        }),
      });

      if (!resp.ok) throw new Error('Falha');
      
      const text = await resp.text();
      // Parse the non-streamed JSON response
      let result;
      try {
        // Try to extract JSON from potential SSE wrapping
        const lines = text.split('\n').filter(l => l.startsWith('data: ') && l.slice(6).trim() !== '[DONE]');
        let fullContent = '';
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6).trim());
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) fullContent += c;
          } catch {}
        }
        
        // Extract JSON from markdown code blocks if present
        const jsonMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)```/) || fullContent.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1].trim());
        }
      } catch {
        toast.error('IA não retornou estrutura válida');
        return;
      }

      if (result?.nodes) {
        onCanvasAction({
          type: 'add_nodes',
          nodes: result.nodes,
          edges: result.edges || [],
        });
        toast.success(`${result.nodes.length} blocos adicionados ao canvas!`);
      }
    } catch (err) {
      console.error('Structure generation error:', err);
      toast.error('Erro ao montar estrutura');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, prospectContext, onCanvasAction]);

  return {
    isGenerating,
    streamContent,
    outputs,
    generate,
    clearStream: () => setStreamContent(''),
    clearOutputs: () => setOutputs([]),
  };
}
