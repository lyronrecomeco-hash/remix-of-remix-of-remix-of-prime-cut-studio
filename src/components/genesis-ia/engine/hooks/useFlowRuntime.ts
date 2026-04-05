import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { EngineNode, EngineEdge, BlockExecutionStatus, FlowExecutionStatus, FlowValidationError, PreFlightSummary, BlockCategory } from '../types';
import { BLOCK_CATEGORIES, CATEGORY_META, EXECUTABLE_BLOCKS } from '../types';

interface UseFlowRuntimeProps {
  nodes: EngineNode[];
  edges: EngineEdge[];
  setNodes: (nodes: EngineNode[]) => void;
  sessionId: string | null;
  userId: string | null;
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
  category?: BlockCategory;
}

export function useFlowRuntime({ nodes, edges, setNodes, sessionId, userId }: UseFlowRuntimeProps) {
  const [flowStatus, setFlowStatus] = useState<FlowExecutionStatus>('idle');
  const [validationErrors, setValidationErrors] = useState<FlowValidationError[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [preFlightSummary, setPreFlightSummary] = useState<PreFlightSummary | null>(null);
  const abortRef = useRef(false);

  const addLog = useCallback((nodeId: string, nodeLabel: string, level: ExecutionLog['level'], message: string, category?: BlockCategory) => {
    setExecutionLogs(prev => [...prev.slice(-99), {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nodeId, nodeLabel, level, message, category,
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

  // Classify nodes by their block category
  const classifyNodes = useCallback(() => {
    const classified: Record<BlockCategory, EngineNode[]> = {
      context: [], decision: [], action: [], control: [], output: [],
    };
    nodes.forEach(n => {
      const type = n.data?.nodeType;
      if (type && BLOCK_CATEGORIES[type]) {
        classified[BLOCK_CATEGORIES[type]].push(n);
      }
    });
    return classified;
  }, [nodes]);

  // Get topological order respecting edges
  const getExecutionOrder = useCallback((): string[] => {
    const nodeIds = new Set(nodes.map(n => n.id));
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    nodeIds.forEach(id => { inDegree.set(id, 0); adj.set(id, []); });
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
    nodeIds.forEach(id => { if (!order.includes(id)) order.push(id); });
    return order;
  }, [nodes, edges]);

  // Generate pre-flight summary
  const generatePreFlight = useCallback((): PreFlightSummary => {
    const classified = classifyNodes();
    const blockers: string[] = [];

    const contextFilled = classified.context.filter(n => n.data?.content?.trim()).length;
    const decisionFilled = classified.decision.filter(n => n.data?.content?.trim()).length;

    // Check for prospect
    const prospectNode = classified.context.find(n => n.data?.nodeType === 'prospect');
    if (!prospectNode || !prospectNode.data?.content?.trim()) {
      blockers.push('Prospect sem dados preenchidos');
    }

    // Analyze action blocks
    const actionDetails = classified.action.map(n => {
      const type = n.data?.nodeType!;
      const content = n.data?.content?.trim() || '';
      let ready = !!content;
      let detail = content ? 'Configurado' : 'Sem configuração';

      if (type === 'whatsapp') {
        const hasPhone = /\d{8,}/.test((prospectNode?.data?.content || '').replace(/\D/g, ''));
        const hasMessage = !!content || !!classified.action.find(a => a.data?.nodeType === 'approach')?.data?.content?.trim();
        ready = hasPhone && hasMessage;
        detail = !hasPhone ? 'Sem telefone no Prospect' : !hasMessage ? 'Sem mensagem definida' : 'Pronto para envio';
        if (!ready) blockers.push(`WhatsApp: ${detail}`);
      }

      if (type === 'approach' && !content) {
        detail = 'Mensagem de abordagem vazia';
      }

      // Check if connected
      const isConnected = edges.some(e => e.target === n.id) || edges.some(e => e.source === n.id);
      if (!isConnected && nodes.length > 1) {
        ready = false;
        detail = 'Desconectado do fluxo';
        blockers.push(`${n.data?.label}: desconectado do fluxo`);
      }

      return { label: n.data?.label || type, type, ready, detail };
    });

    if (classified.action.length === 0) {
      blockers.push('Nenhum bloco de ação no fluxo');
    }

    const summary: PreFlightSummary = {
      contextBlocks: { count: classified.context.length, filled: contextFilled },
      decisionBlocks: { count: classified.decision.length, filled: decisionFilled },
      actionBlocks: actionDetails,
      outputBlocks: { count: classified.output.length },
      controlBlocks: { count: classified.control.length },
      canExecute: blockers.length === 0,
      blockers,
    };

    setPreFlightSummary(summary);
    return summary;
  }, [classifyNodes, nodes, edges]);

  // Deep validation
  const validateFlow = useCallback((): FlowValidationError[] => {
    const errors: FlowValidationError[] = [];
    const classified = classifyNodes();

    if (nodes.length === 0) {
      errors.push({ nodeId: '', nodeLabel: 'Flow', message: 'Canvas vazio. Adicione blocos.', severity: 'error' });
      setValidationErrors(errors);
      return errors;
    }

    // Must have prospect
    const prospectNode = classified.context.find(n => n.data?.nodeType === 'prospect');
    if (!prospectNode) {
      errors.push({ nodeId: '', nodeLabel: 'Prospect', message: 'Bloco Prospect obrigatório — adicione ao canvas.', severity: 'error' });
    } else if (!prospectNode.data?.content?.trim()) {
      errors.push({ nodeId: prospectNode.id, nodeLabel: 'Prospect', message: 'Prospect sem dados preenchidos.', severity: 'error' });
    }

    // Must have at least one action block
    if (classified.action.length === 0) {
      errors.push({ nodeId: '', nodeLabel: 'Flow', message: 'Nenhum bloco de AÇÃO no fluxo. Adicione WhatsApp, Automação ou Deploy.', severity: 'error' });
    }

    // WhatsApp specific checks
    classified.action.filter(n => n.data?.nodeType === 'whatsapp').forEach(n => {
      const prospectContent = prospectNode?.data?.content || '';
      const hasPhone = /\d{8,}/.test(prospectContent.replace(/\D/g, ''));
      if (!hasPhone) {
        errors.push({ nodeId: n.id, nodeLabel: 'WhatsApp', message: 'Telefone não encontrado no Prospect.', severity: 'error' });
      }
      const approachNode = nodes.find(nd => nd.data?.nodeType === 'approach');
      const hasMessage = !!(n.data?.content?.trim()) || !!(approachNode?.data?.content?.trim());
      if (!hasMessage) {
        errors.push({ nodeId: n.id, nodeLabel: 'WhatsApp', message: 'Mensagem não definida (preencha Abordagem ou WhatsApp).', severity: 'error' });
      }
      // Check if WhatsApp is connected to the flow
      const connected = edges.some(e => e.target === n.id) || edges.some(e => e.source === n.id);
      if (!connected && nodes.length > 1) {
        errors.push({ nodeId: n.id, nodeLabel: 'WhatsApp', message: 'Bloco WhatsApp desconectado do fluxo.', severity: 'warning' });
      }
    });

    // Check disconnected nodes
    nodes.forEach(n => {
      const hasIn = edges.some(e => e.target === n.id);
      const hasOut = edges.some(e => e.source === n.id);
      if (!hasIn && !hasOut && nodes.length > 1) {
        const cat = BLOCK_CATEGORIES[n.data?.nodeType as keyof typeof BLOCK_CATEGORIES];
        const catLabel = cat ? CATEGORY_META[cat].label : '';
        errors.push({ nodeId: n.id, nodeLabel: n.data?.label || '', message: `"${n.data?.label}" [${catLabel}] está desconectado do fluxo.`, severity: 'warning' });
      }
    });

    // Check action blocks without content
    classified.action.forEach(n => {
      if (n.data?.nodeType !== 'whatsapp' && !n.data?.content?.trim()) {
        errors.push({ nodeId: n.id, nodeLabel: n.data?.label || '', message: `Bloco de ação "${n.data?.label}" sem configuração.`, severity: 'warning' });
      }
    });

    setValidationErrors(errors);
    return errors;
  }, [nodes, edges, classifyNodes]);

  // Execute a single node based on its category
  const executeNode = useCallback(async (node: EngineNode): Promise<boolean> => {
    const type = node.data?.nodeType;
    const category = type ? BLOCK_CATEGORIES[type] : undefined;
    const label = node.data?.label || type || 'Bloco';
    const content = node.data?.content?.trim();

    // Context & Decision: auto-validate (filled = success)
    if (category === 'context' || category === 'decision') {
      if (content) {
        updateNodeStatus(node.id, 'success');
        addLog(node.id, label, 'success', `✓ ${CATEGORY_META[category].label}: dados validados`, category);
      } else {
        updateNodeStatus(node.id, 'skipped');
        addLog(node.id, label, 'warning', `↷ ${CATEGORY_META[category].label}: vazio — ignorado`, category);
      }
      return true;
    }

    // Output: validate and mark
    if (category === 'output') {
      if (content) {
        updateNodeStatus(node.id, 'success');
        addLog(node.id, label, 'success', `✓ SAÍDA: "${label}" gerada`, category);
      } else {
        updateNodeStatus(node.id, 'skipped');
        addLog(node.id, label, 'warning', `↷ SAÍDA: "${label}" vazia`, category);
      }
      return true;
    }

    // Control: validate state
    if (category === 'control') {
      if (content) {
        updateNodeStatus(node.id, 'success');
        addLog(node.id, label, 'success', `✓ CONTROLE: "${label}" configurado`, category);
      } else {
        updateNodeStatus(node.id, 'skipped');
        addLog(node.id, label, 'warning', `↷ CONTROLE: "${label}" sem configuração`, category);
      }
      return true;
    }

    // Action: real execution
    if (category === 'action') {
      if (type === 'whatsapp') {
        return await executeWhatsAppBlock(node);
      }

      // approach: validate message exists
      if (type === 'approach') {
        if (content) {
          updateNodeStatus(node.id, 'success');
          addLog(node.id, label, 'success', '✓ AÇÃO: Mensagem de abordagem pronta', category);
        } else {
          updateNodeStatus(node.id, 'failed', 'Mensagem de abordagem vazia');
          addLog(node.id, label, 'error', '✗ AÇÃO: Mensagem de abordagem não definida', category);
          return false;
        }
        return true;
      }

      // automation/deploy: placeholder for real execution
      if (content) {
        updateNodeStatus(node.id, 'success');
        addLog(node.id, label, 'success', `✓ AÇÃO: "${label}" registrada`, category);
      } else {
        updateNodeStatus(node.id, 'skipped');
        addLog(node.id, label, 'warning', `↷ AÇÃO: "${label}" sem configuração`, category);
      }
      return true;
    }

    // Fallback
    updateNodeStatus(node.id, 'skipped');
    return true;
  }, [nodes, updateNodeStatus, addLog]);

  // Execute WhatsApp block
  const executeWhatsAppBlock = useCallback(async (node: EngineNode): Promise<boolean> => {
    const content = node.data?.content || '';
    const label = node.data?.label || 'WhatsApp';

    addLog(node.id, label, 'info', '⟳ Iniciando envio WhatsApp...', 'action');

    // Parse phone from prospect
    const prospectNode = nodes.find(n => n.data?.nodeType === 'prospect');
    const prospectContent = prospectNode?.data?.content || '';
    const phoneMatch = prospectContent.match(/(?:telefone|phone|número)[:\s]*([+\d\s()-]+)/i) 
      || content.match(/(?:telefone|phone|número)[:\s]*([+\d\s()-]+)/i);
    const phone = phoneMatch?.[1]?.replace(/\D/g, '') || '';

    // Get message from approach or WhatsApp block
    const approachNode = nodes.find(n => n.data?.nodeType === 'approach');
    const messageMatch = content.match(/(?:mensagem|message|texto)[:\s]*([\s\S]+?)(?=\n[A-Z]|$)/i);
    const message = messageMatch?.[1]?.trim() || approachNode?.data?.content?.trim() || '';

    if (!phone) {
      addLog(node.id, label, 'error', '✗ Telefone não encontrado. Preencha no bloco Prospect.', 'action');
      updateNodeStatus(node.id, 'failed', 'Telefone não encontrado');
      return false;
    }

    if (!message) {
      addLog(node.id, label, 'error', '✗ Mensagem não encontrada. Preencha na Abordagem ou WhatsApp.', 'action');
      updateNodeStatus(node.id, 'failed', 'Mensagem não encontrada');
      return false;
    }

    if (!userId) {
      addLog(node.id, label, 'error', '✗ Usuário não autenticado.', 'action');
      updateNodeStatus(node.id, 'failed', 'Usuário não autenticado');
      return false;
    }

    // Find active connector
    const { data: connectors } = await supabase
      .from('engine_whatsapp_connectors')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'connected')
      .limit(1);

    if (!connectors || connectors.length === 0) {
      addLog(node.id, label, 'error', '✗ Nenhum conector WhatsApp conectado.', 'action');
      updateNodeStatus(node.id, 'failed', 'Sem conector ativo');
      return false;
    }

    const connector = connectors[0];
    addLog(node.id, label, 'info', `→ Enviando para ${phone} via ${connector.name}...`, 'action');

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
        addLog(node.id, label, 'success', `✓ Mensagem enviada para ${phone}`, 'action');
        updateNodeStatus(node.id, 'success');
        return true;
      } else {
        const errorMsg = result.error || `Falha HTTP ${resp.status}`;
        addLog(node.id, label, 'error', `✗ ${errorMsg}`, 'action');
        updateNodeStatus(node.id, 'failed', errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      addLog(node.id, label, 'error', `✗ ${errorMsg}`, 'action');
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

    // Generate pre-flight
    const summary = generatePreFlight();
    if (!summary.canExecute) {
      setFlowStatus('failed');
      toast.error(`Bloqueios: ${summary.blockers.join(', ')}`);
      return;
    }

    setFlowStatus('running');
    setExecutionLogs([]);

    const classified = classifyNodes();
    const actionCount = classified.action.length;
    const contextCount = classified.context.filter(n => n.data?.content?.trim()).length;

    addLog('flow', 'Flow', 'info', `▶ Iniciando execução — ${contextCount} contextos, ${actionCount} ações`);

    // Reset all node statuses
    const resetNodes = nodes.map(n => ({
      ...n, data: { ...n.data, executionStatus: 'idle' as BlockExecutionStatus, executionError: undefined },
    }));
    setNodes(resetNodes as EngineNode[]);

    const order = getExecutionOrder();
    let allSuccess = true;
    let actionsExecuted = 0;
    let actionsFailed = 0;

    for (const nodeId of order) {
      if (abortRef.current) {
        addLog('flow', 'Flow', 'warning', '⏸ Fluxo pausado pelo usuário');
        setFlowStatus('paused');
        return;
      }

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const type = node.data?.nodeType;
      const category = type ? BLOCK_CATEGORIES[type] : undefined;
      updateNodeStatus(nodeId, 'running');

      // Different delay based on category
      const delay = category === 'action' ? 500 : 200;
      await new Promise(r => setTimeout(r, delay));

      const success = await executeNode(node);
      if (!success) {
        allSuccess = false;
        if (category === 'action') actionsFailed++;
      }
      if (category === 'action' && success) actionsExecuted++;
    }

    if (allSuccess) {
      addLog('flow', 'Flow', 'success', `✅ Fluxo concluído — ${actionsExecuted} ação(ões) executada(s)`);
      setFlowStatus('completed');
      toast.success('Fluxo executado com sucesso!');
    } else {
      addLog('flow', 'Flow', 'error', `⚠ Fluxo concluído com ${actionsFailed} falha(s)`);
      setFlowStatus('failed');
      toast.error(`Fluxo com ${actionsFailed} falha(s). Verifique os logs.`);
    }
  }, [nodes, edges, validateFlow, generatePreFlight, classifyNodes, getExecutionOrder, updateNodeStatus, addLog, setNodes, executeNode]);

  const pauseFlow = useCallback(() => { abortRef.current = true; }, []);

  const resetFlow = useCallback(() => {
    abortRef.current = false;
    setFlowStatus('idle');
    setValidationErrors([]);
    setExecutionLogs([]);
    setPreFlightSummary(null);
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
      await new Promise(r => setTimeout(r, 400));
      await executeNode(node);
    }

    const stillFailed = nodes.filter(n => n.data?.executionStatus === 'failed');
    if (stillFailed.length === 0) {
      setFlowStatus('completed');
      toast.success('Todos os blocos reexecutados com sucesso!');
    } else {
      setFlowStatus('failed');
    }
  }, [nodes, updateNodeStatus, addLog, executeNode]);

  return {
    flowStatus,
    validationErrors,
    executionLogs,
    preFlightSummary,
    validateFlow,
    generatePreFlight,
    runFlow,
    pauseFlow,
    resetFlow,
    retryFailed,
  };
}
