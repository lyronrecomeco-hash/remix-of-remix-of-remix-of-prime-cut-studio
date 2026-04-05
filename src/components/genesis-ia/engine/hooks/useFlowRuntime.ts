import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { EngineNode, EngineEdge, BlockExecutionStatus, FlowExecutionStatus, FlowValidationError } from '../types';
import { EXECUTABLE_BLOCKS, NODE_CATALOG } from '../types';

interface UseFlowRuntimeProps {
  nodes: EngineNode[];
  edges: EngineEdge[];
  setNodes: (nodes: EngineNode[]) => void;
  sessionId: string | null;
  userId: string | null;
}

interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

export function useFlowRuntime({ nodes, edges, setNodes, sessionId, userId }: UseFlowRuntimeProps) {
  const [flowStatus, setFlowStatus] = useState<FlowExecutionStatus>('idle');
  const [validationErrors, setValidationErrors] = useState<FlowValidationError[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const abortRef = useRef(false);

  const addLog = useCallback((nodeId: string, nodeLabel: string, level: ExecutionLog['level'], message: string) => {
    setExecutionLogs(prev => [...prev.slice(-99), {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nodeId, nodeLabel, level, message,
      timestamp: Date.now(),
    }]);
  }, []);

  const updateNodeStatus = useCallback((nodeId: string, status: BlockExecutionStatus, error?: string) => {
    const updated = nodes.map(n =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, executionStatus: status, executionError: error || undefined, lastExecutedAt: Date.now() } }
        : n
    );
    setNodes(updated as EngineNode[]);
  }, [nodes, setNodes]);

  // Get topological order of nodes based on edges
  const getExecutionOrder = useCallback((): string[] => {
    const nodeIds = new Set(nodes.map(n => n.id));
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    nodeIds.forEach(id => {
      inDegree.set(id, 0);
      adj.set(id, []);
    });

    edges.forEach(e => {
      if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
        adj.get(e.source)!.push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
    });

    const queue = [...nodeIds].filter(id => (inDegree.get(id) || 0) === 0);
    const order: string[] = [];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      order.push(curr);
      for (const next of adj.get(curr) || []) {
        inDegree.set(next, (inDegree.get(next) || 0) - 1);
        if (inDegree.get(next) === 0) queue.push(next);
      }
    }

    // Add any remaining (disconnected) nodes
    nodeIds.forEach(id => { if (!order.includes(id)) order.push(id); });
    return order;
  }, [nodes, edges]);

  // Validate flow before execution
  const validateFlow = useCallback((): FlowValidationError[] => {
    const errors: FlowValidationError[] = [];

    if (nodes.length === 0) {
      errors.push({ nodeId: '', nodeLabel: 'Flow', message: 'Canvas vazio. Adicione blocos.', severity: 'error' });
      return errors;
    }

    // Check for required prospect block
    const prospectNode = nodes.find(n => n.data?.nodeType === 'prospect');
    if (!prospectNode || !prospectNode.data?.content?.trim()) {
      errors.push({ nodeId: prospectNode?.id || '', nodeLabel: 'Prospect', message: 'Bloco Prospect obrigatório e precisa ter dados.', severity: 'error' });
    }

    // Check each node for completeness
    nodes.forEach(n => {
      const type = n.data?.nodeType;
      const label = n.data?.label || type || 'Bloco';
      const content = n.data?.content?.trim();

      // WhatsApp needs specific validation
      if (type === 'whatsapp') {
        if (!content) {
          errors.push({ nodeId: n.id, nodeLabel: label, message: 'Bloco WhatsApp sem configuração (telefone, mensagem).', severity: 'error' });
        } else {
          // Check for phone in content
          const hasPhone = /telefone|phone|número/i.test(content) && /\d{8,}/.test(content.replace(/\D/g, ''));
          const hasMessage = /mensagem|message|texto/i.test(content);
          if (!hasPhone) errors.push({ nodeId: n.id, nodeLabel: label, message: 'Telefone não encontrado no bloco WhatsApp.', severity: 'warning' });
          if (!hasMessage) errors.push({ nodeId: n.id, nodeLabel: label, message: 'Mensagem não definida no bloco WhatsApp.', severity: 'warning' });
        }
      }

      // Check disconnected nodes (no edges)
      const hasIncoming = edges.some(e => e.target === n.id);
      const hasOutgoing = edges.some(e => e.source === n.id);
      if (!hasIncoming && !hasOutgoing && nodes.length > 1) {
        errors.push({ nodeId: n.id, nodeLabel: label, message: `"${label}" está desconectado do fluxo.`, severity: 'warning' });
      }
    });

    setValidationErrors(errors);
    return errors;
  }, [nodes, edges]);

  // Execute a single content block
  const executeContentBlock = useCallback(async (node: EngineNode) => {
    const content = node.data?.content?.trim();
    if (content) {
      updateNodeStatus(node.id, 'success');
      addLog(node.id, node.data?.label || '', 'success', 'Bloco preenchido — OK');
    } else {
      updateNodeStatus(node.id, 'skipped');
      addLog(node.id, node.data?.label || '', 'warning', 'Bloco vazio — ignorado');
    }
  }, [updateNodeStatus, addLog]);

  // Execute WhatsApp block
  const executeWhatsAppBlock = useCallback(async (node: EngineNode): Promise<boolean> => {
    const content = node.data?.content || '';
    const label = node.data?.label || 'WhatsApp';

    addLog(node.id, label, 'info', 'Iniciando envio WhatsApp...');

    // Parse phone from content
    const phoneMatch = content.match(/(?:telefone|phone|número)[:\s]*([+\d\s()-]+)/i);
    const messageMatch = content.match(/(?:mensagem|message|texto)[:\s]*([\s\S]+?)(?=\n[A-Z]|$)/i);

    // Also check prospect node for phone
    let phone = phoneMatch?.[1]?.replace(/\D/g, '') || '';
    let message = messageMatch?.[1]?.trim() || '';

    if (!phone) {
      const prospectNode = nodes.find(n => n.data?.nodeType === 'prospect');
      const prospectContent = prospectNode?.data?.content || '';
      const prospectPhone = prospectContent.match(/(?:telefone|phone)[:\s]*([+\d\s()-]+)/i);
      phone = prospectPhone?.[1]?.replace(/\D/g, '') || '';
    }

    if (!message) {
      const approachNode = nodes.find(n => n.data?.nodeType === 'approach');
      message = approachNode?.data?.content?.trim() || '';
    }

    if (!phone) {
      addLog(node.id, label, 'error', 'Telefone não encontrado. Preencha no bloco Prospect ou WhatsApp.');
      updateNodeStatus(node.id, 'failed', 'Telefone não encontrado');
      return false;
    }

    if (!message) {
      addLog(node.id, label, 'error', 'Mensagem não encontrada. Preencha no bloco Abordagem ou WhatsApp.');
      updateNodeStatus(node.id, 'failed', 'Mensagem não encontrada');
      return false;
    }

    // Find active WhatsApp connector
    if (!userId) {
      addLog(node.id, label, 'error', 'Usuário não autenticado.');
      updateNodeStatus(node.id, 'failed', 'Usuário não autenticado');
      return false;
    }

    const { data: connectors } = await supabase
      .from('engine_whatsapp_connectors')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'connected')
      .limit(1);

    if (!connectors || connectors.length === 0) {
      addLog(node.id, label, 'error', 'Nenhum conector WhatsApp conectado. Configure nas configurações.');
      updateNodeStatus(node.id, 'failed', 'Sem conector conectado');
      return false;
    }

    const connector = connectors[0];
    addLog(node.id, label, 'info', `Enviando para ${phone} via ${connector.name}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chatpro-proxy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'send_message',
            connector_id: connector.id,
            phone,
            message,
            session_id: sessionId,
          }),
        }
      );
      const result = await resp.json();

      if (resp.ok && result.success) {
        addLog(node.id, label, 'success', `✓ Mensagem enviada para ${phone}`);
        updateNodeStatus(node.id, 'success');
        return true;
      } else {
        const errorMsg = result.error || `Falha HTTP ${resp.status}`;
        addLog(node.id, label, 'error', `✗ ${errorMsg}`);
        updateNodeStatus(node.id, 'failed', errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(node.id, label, 'error', `✗ ${errorMsg}`);
      updateNodeStatus(node.id, 'failed', errorMsg);
      return false;
    }
  }, [nodes, userId, sessionId, addLog, updateNodeStatus]);

  // Run the entire flow
  const runFlow = useCallback(async () => {
    abortRef.current = false;

    // Validate first
    const errors = validateFlow();
    const criticalErrors = errors.filter(e => e.severity === 'error');
    if (criticalErrors.length > 0) {
      setFlowStatus('failed');
      toast.error(`${criticalErrors.length} erro(s) de validação. Corrija antes de executar.`);
      return;
    }

    setFlowStatus('running');
    setExecutionLogs([]);
    addLog('flow', 'Flow', 'info', '▶ Iniciando execução do fluxo...');

    // Reset all node statuses
    const resetNodes = nodes.map(n => ({
      ...n, data: { ...n.data, executionStatus: 'idle' as BlockExecutionStatus, executionError: undefined },
    }));
    setNodes(resetNodes as EngineNode[]);

    const order = getExecutionOrder();
    let allSuccess = true;

    for (const nodeId of order) {
      if (abortRef.current) {
        addLog('flow', 'Flow', 'warning', '⏸ Fluxo pausado pelo usuário');
        setFlowStatus('paused');
        return;
      }

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const type = node.data?.nodeType;
      updateNodeStatus(nodeId, 'running');
      addLog(nodeId, node.data?.label || '', 'info', `Executando "${node.data?.label}"...`);

      // Small delay for visual feedback
      await new Promise(r => setTimeout(r, 300));

      if (type === 'whatsapp') {
        const success = await executeWhatsAppBlock(node);
        if (!success) allSuccess = false;
      } else if (EXECUTABLE_BLOCKS.includes(type as any)) {
        // For automation blocks, just mark as success for now
        if (node.data?.content?.trim()) {
          updateNodeStatus(nodeId, 'success');
          addLog(nodeId, node.data?.label || '', 'success', 'Automação registrada');
        } else {
          updateNodeStatus(nodeId, 'skipped');
          addLog(nodeId, node.data?.label || '', 'warning', 'Sem configuração — ignorado');
        }
      } else {
        await executeContentBlock(node);
      }
    }

    if (allSuccess) {
      addLog('flow', 'Flow', 'success', '✅ Fluxo concluído com sucesso!');
      setFlowStatus('completed');
      toast.success('Fluxo executado com sucesso!');
    } else {
      addLog('flow', 'Flow', 'error', '⚠ Fluxo concluído com erros');
      setFlowStatus('failed');
      toast.error('Fluxo concluído com erros. Verifique os logs.');
    }
  }, [nodes, edges, validateFlow, getExecutionOrder, updateNodeStatus, addLog, setNodes, executeContentBlock, executeWhatsAppBlock]);

  const pauseFlow = useCallback(() => {
    abortRef.current = true;
  }, []);

  const resetFlow = useCallback(() => {
    abortRef.current = false;
    setFlowStatus('idle');
    setValidationErrors([]);
    setExecutionLogs([]);
    const resetNodes = nodes.map(n => ({
      ...n, data: { ...n.data, executionStatus: 'idle' as BlockExecutionStatus, executionError: undefined },
    }));
    setNodes(resetNodes as EngineNode[]);
  }, [nodes, setNodes]);

  const retryFailed = useCallback(async () => {
    const failedNodes = nodes.filter(n => n.data?.executionStatus === 'failed');
    if (failedNodes.length === 0) {
      toast.info('Nenhum bloco com falha para reexecutar.');
      return;
    }
    
    setFlowStatus('running');
    addLog('flow', 'Flow', 'info', `🔄 Reexecutando ${failedNodes.length} bloco(s) com falha...`);

    for (const node of failedNodes) {
      updateNodeStatus(node.id, 'running');
      await new Promise(r => setTimeout(r, 300));

      if (node.data?.nodeType === 'whatsapp') {
        await executeWhatsAppBlock(node);
      } else {
        await executeContentBlock(node);
      }
    }

    const stillFailed = nodes.filter(n => n.data?.executionStatus === 'failed');
    if (stillFailed.length === 0) {
      setFlowStatus('completed');
      toast.success('Todos os blocos reexecutados com sucesso!');
    } else {
      setFlowStatus('failed');
    }
  }, [nodes, updateNodeStatus, addLog, executeWhatsAppBlock, executeContentBlock]);

  return {
    flowStatus,
    validationErrors,
    executionLogs,
    validateFlow,
    runFlow,
    pauseFlow,
    resetFlow,
    retryFailed,
  };
}
