import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MessageFlow, MessageNode, MessageEdge, FlowErrorLog } from '../types';

const STORAGE_KEY = 'genesis_message_flows';
const ERROR_LOG_KEY = 'genesis_flow_errors';

export const useMessageFlows = () => {
  const [flows, setFlows] = useState<MessageFlow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [errorLogs, setErrorLogs] = useState<FlowErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load flows from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFlows(JSON.parse(stored));
      }
      
      const storedErrors = localStorage.getItem(ERROR_LOG_KEY);
      if (storedErrors) {
        setErrorLogs(JSON.parse(storedErrors));
      }
    } catch (e) {
      console.error('Error loading message flows:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save flows to localStorage
  const saveFlows = useCallback((newFlows: MessageFlow[]) => {
    setFlows(newFlows);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlows));
  }, []);

  // Save error logs
  const saveErrorLogs = useCallback((logs: FlowErrorLog[]) => {
    setErrorLogs(logs);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
  }, []);

  // Sync flow to database (creates/updates whatsapp_automations)
  const syncFlowToDatabase = useCallback(async (flow: MessageFlow): Promise<boolean> => {
    try {
      setSyncing(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // Find genesis user
      const { data: genesisUser } = await supabase
        .from('genesis_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!genesisUser) {
        toast.error('Usuário Genesis não encontrado');
        return false;
      }

      // Extract instance ID from nodes (look for instance-connector node)
      const instanceNode = flow.nodes.find(n => n.type === 'instance-connector');
      const instanceId = instanceNode?.data?.config?.instanceId || null;

      if (!instanceId) {
        toast.error('Selecione uma instância no flow antes de ativar');
        return false;
      }

      // Extract trigger keywords from start-trigger node
      const startNode = flow.nodes.find(n => n.type === 'start-trigger');
      const triggerKeywords = startNode?.data?.config?.keywords || ['*'];
      const triggerType = startNode?.data?.config?.triggerType || 'keyword';

      // Convert flow nodes/edges to flow_config format for the engine
      const flowConfig = {
        version: '3.0',
        nodes: flow.nodes,
        edges: flow.edges,
        startStep: 'greeting',
        settings: {
          greeting_dynamic: true,
        },
        steps: convertNodesToSteps(flow.nodes, flow.edges)
      };

      // Check if chatbot already exists for this flow
      const { data: existingChatbot } = await supabase
        .from('whatsapp_automations')
        .select('id')
        .eq('name', `Flow: ${flow.name}`)
        .eq('instance_id', instanceId)
        .maybeSingle();

      const chatbotData = {
        name: `Flow: ${flow.name}`,
        description: flow.description || `Fluxo de mensagens: ${flow.name}`,
        trigger_type: triggerType,
        trigger_keywords: triggerKeywords,
        response_type: 'flow',
        response_content: null,
        is_active: flow.isActive,
        instance_id: instanceId,
        user_id: genesisUser.id,
        flow_config: JSON.parse(JSON.stringify(flowConfig)),
        ai_enabled: flow.nodes.some(n => n.data?.config?.aiEnabled),
        ai_model: 'google/gemini-2.5-flash',
        ai_temperature: 0.7,
        ai_system_prompt: 'Você é um assistente virtual inteligente e prestativo.',
        company_name: 'Empresa',
        max_attempts: 3,
        fallback_message: 'Desculpe, não entendi. Por favor, escolha uma das opções do menu.',
        delay_seconds: 1
      };

      if (existingChatbot) {
        // Update existing
        const { error } = await supabase
          .from('whatsapp_automations')
          .update(chatbotData)
          .eq('id', existingChatbot.id);

        if (error) throw error;
        console.log('[SYNC] Updated chatbot:', existingChatbot.id);
      } else {
        // Create new
        const { error } = await supabase
          .from('whatsapp_automations')
          .insert({
            ...chatbotData,
            priority: 1
          } as any);

        if (error) throw error;
        console.log('[SYNC] Created new chatbot for flow:', flow.name);
      }

      return true;
    } catch (error) {
      console.error('Error syncing flow to database:', error);
      toast.error('Erro ao sincronizar flow com o banco');
      return false;
    } finally {
      setSyncing(false);
    }
  }, []);

  // Helper: Convert nodes to engine steps format
  const convertNodesToSteps = (nodes: MessageNode[], edges: MessageEdge[]): Record<string, any> => {
    const steps: Record<string, any> = {};
    
    // Build edge map for finding next nodes
    const edgeMap = new Map<string, string[]>();
    edges.forEach(edge => {
      const existing = edgeMap.get(edge.source) || [];
      existing.push(edge.target);
      edgeMap.set(edge.source, existing);
    });

    nodes.forEach(node => {
      const nextNodes = edgeMap.get(node.id) || [];
      const nextStepId = nextNodes[0] || 'end_flow';

      switch (node.type) {
        case 'advanced-text':
          steps[node.id] = {
            id: node.id,
            type: 'text',
            message: node.data.config?.message || '',
            next: nextStepId
          };
          break;
        case 'button-message':
          steps[node.id] = {
            id: node.id,
            type: 'menu',
            message: node.data.config?.message || '',
            options: (node.data.config?.buttons || []).map((btn: any, i: number) => ({
              id: i + 1,
              text: btn.text,
              next: nextNodes[i] || nextStepId
            })),
            next: nextStepId
          };
          break;
        case 'list-message':
          steps[node.id] = {
            id: node.id,
            type: 'menu',
            message: node.data.config?.message || '',
            options: (node.data.config?.items || []).map((item: any, i: number) => ({
              id: i + 1,
              text: item.title,
              next: nextNodes[i] || nextStepId
            })),
            next: nextStepId
          };
          break;
        case 'poll':
          steps[node.id] = {
            id: node.id,
            type: 'menu',
            message: node.data.config?.question || '',
            options: (node.data.config?.options || []).map((opt: string, i: number) => ({
              id: i + 1,
              text: opt,
              next: nextStepId
            })),
            next: nextStepId
          };
          break;
        case 'smart-delay':
          steps[node.id] = {
            id: node.id,
            type: 'text',
            message: '⏳',
            delay: node.data.config?.delay || 2000,
            next: nextStepId
          };
          break;
        case 'condition':
          steps[node.id] = {
            id: node.id,
            type: 'ai',
            message: 'Analisando...',
            ai_enabled: true,
            next: nextStepId
          };
          break;
        case 'end-flow':
          steps[node.id] = {
            id: node.id,
            type: 'end',
            message: node.data.config?.message || 'Atendimento finalizado. Obrigado!'
          };
          break;
        default:
          steps[node.id] = {
            id: node.id,
            type: 'text',
            message: node.data.label || '',
            next: nextStepId
          };
      }
    });

    // Add default end step if not present
    if (!steps['end_flow']) {
      steps['end_flow'] = {
        id: 'end_flow',
        type: 'end',
        message: '✅ Atendimento finalizado. Obrigado!'
      };
    }

    return steps;
  };

  // Create new flow
  const createFlow = useCallback((name: string, description?: string): MessageFlow => {
    const newFlow: MessageFlow = {
      id: `mf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      description,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      stats: {
        totalExecutions: 0,
        successRate: 100,
        avgResponseTime: 0
      }
    };
    
    saveFlows([...flows, newFlow]);
    return newFlow;
  }, [flows, saveFlows]);

  // Update flow
  const updateFlow = useCallback((flowId: string, updates: Partial<MessageFlow>) => {
    const newFlows = flows.map(f => 
      f.id === flowId 
        ? { ...f, ...updates, updatedAt: new Date().toISOString() }
        : f
    );
    saveFlows(newFlows);
  }, [flows, saveFlows]);

  // Delete flow
  const deleteFlow = useCallback((flowId: string) => {
    saveFlows(flows.filter(f => f.id !== flowId));
    if (selectedFlowId === flowId) {
      setSelectedFlowId(null);
    }
  }, [flows, selectedFlowId, saveFlows]);

  // Duplicate flow
  const duplicateFlow = useCallback((flowId: string): MessageFlow | null => {
    const original = flows.find(f => f.id === flowId);
    if (!original) return null;

    const duplicated: MessageFlow = {
      ...original,
      id: `mf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${original.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
      stats: {
        totalExecutions: 0,
        successRate: 100,
        avgResponseTime: 0
      }
    };

    saveFlows([...flows, duplicated]);
    return duplicated;
  }, [flows, saveFlows]);

  // Update nodes in flow
  const updateNodes = useCallback((flowId: string, nodes: MessageNode[]) => {
    updateFlow(flowId, { nodes });
  }, [updateFlow]);

  // Update edges in flow
  const updateEdges = useCallback((flowId: string, edges: MessageEdge[]) => {
    updateFlow(flowId, { edges });
  }, [updateFlow]);

  // Add error log
  const addErrorLog = useCallback((error: Omit<FlowErrorLog, 'id' | 'timestamp' | 'resolved'>) => {
    const newError: FlowErrorLog = {
      ...error,
      id: `err_${Date.now()}`,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    const newLogs = [newError, ...errorLogs].slice(0, 100); // Keep last 100 errors
    saveErrorLogs(newLogs);
    return newError;
  }, [errorLogs, saveErrorLogs]);

  // Resolve error
  const resolveError = useCallback((errorId: string) => {
    const newLogs = errorLogs.map(e => 
      e.id === errorId ? { ...e, resolved: true } : e
    );
    saveErrorLogs(newLogs);
  }, [errorLogs, saveErrorLogs]);

  // Clear resolved errors
  const clearResolvedErrors = useCallback(() => {
    saveErrorLogs(errorLogs.filter(e => !e.resolved));
  }, [errorLogs, saveErrorLogs]);

  // Get selected flow
  const selectedFlow = flows.find(f => f.id === selectedFlowId) || null;

  // Get flow by ID
  const getFlow = useCallback((flowId: string) => {
    return flows.find(f => f.id === flowId) || null;
  }, [flows]);

  // Toggle flow active status with database sync
  const toggleFlowActive = useCallback(async (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      const newActiveState = !flow.isActive;
      updateFlow(flowId, { isActive: newActiveState });
      
      // Sync to database
      const updatedFlow = { ...flow, isActive: newActiveState };
      const success = await syncFlowToDatabase(updatedFlow);
      
      if (success) {
        toast.success(newActiveState ? 'Flow ativado e sincronizado!' : 'Flow desativado');
      }
    }
  }, [flows, updateFlow, syncFlowToDatabase]);

  // Save and activate flow (combined action)
  const saveAndActivateFlow = useCallback(async (flowId: string, nodes: MessageNode[], edges: MessageEdge[]) => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return false;

    // Update flow with new nodes/edges
    const updatedFlow: MessageFlow = {
      ...flow,
      nodes,
      edges,
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    // Save locally
    const newFlows = flows.map(f => f.id === flowId ? updatedFlow : f);
    saveFlows(newFlows);

    // Sync to database
    const success = await syncFlowToDatabase(updatedFlow);
    
    if (success) {
      toast.success('Flow salvo e ativado com sucesso!');
    }
    
    return success;
  }, [flows, saveFlows, syncFlowToDatabase]);

  return {
    flows,
    selectedFlow,
    selectedFlowId,
    setSelectedFlowId,
    errorLogs,
    loading,
    syncing,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    updateNodes,
    updateEdges,
    getFlow,
    toggleFlowActive,
    saveAndActivateFlow,
    syncFlowToDatabase,
    addErrorLog,
    resolveError,
    clearResolvedErrors
  };
};
