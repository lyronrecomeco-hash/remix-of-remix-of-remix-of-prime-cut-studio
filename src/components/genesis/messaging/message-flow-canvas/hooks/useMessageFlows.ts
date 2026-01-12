import { useState, useCallback, useEffect } from 'react';
import type { MessageFlow, MessageNode, MessageEdge, FlowErrorLog } from '../types';

const STORAGE_KEY = 'genesis_message_flows';
const ERROR_LOG_KEY = 'genesis_flow_errors';

export const useMessageFlows = () => {
  const [flows, setFlows] = useState<MessageFlow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [errorLogs, setErrorLogs] = useState<FlowErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Toggle flow active status
  const toggleFlowActive = useCallback((flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      updateFlow(flowId, { isActive: !flow.isActive });
    }
  }, [flows, updateFlow]);

  return {
    flows,
    selectedFlow,
    selectedFlowId,
    setSelectedFlowId,
    errorLogs,
    loading,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    updateNodes,
    updateEdges,
    getFlow,
    toggleFlowActive,
    addErrorLog,
    resolveError,
    clearResolvedErrors
  };
};
