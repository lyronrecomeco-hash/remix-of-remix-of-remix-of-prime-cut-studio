import { useCallback } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  nodeId?: string;
  type: 'error';
  message: string;
  code: string;
}

interface ValidationWarning {
  nodeId?: string;
  type: 'warning';
  message: string;
  code: string;
}

// Define trigger types that are considered flow entry points
const TRIGGER_TYPES = [
  'trigger',
  'wa_start',
  'wa_receive',
  'webhook_trigger',
  'cron_trigger',
  'webhook_universal_trigger',
  'webhook_in',
];

// Define end types that are considered flow exit points
const END_TYPES = ['end'];

// Types that don't need outgoing connections
const TERMINAL_TYPES = [...END_TYPES, 'goto', 'subflow_call', 'webhook_response'];

export const useFlowValidation = () => {
  const validateFlow = useCallback((nodes: any[], edges: any[]): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for empty flow
    if (nodes.length === 0) {
      errors.push({
        type: 'error',
        message: 'O fluxo está vazio. Adicione pelo menos um nó.',
        code: 'EMPTY_FLOW'
      });
      return { isValid: false, errors, warnings };
    }

    // Get node type safely - handle both direct type and nested data.type
    const getNodeType = (node: any): string => {
      if (typeof node.data?.type === 'string') return node.data.type;
      if (typeof node.type === 'string' && node.type !== 'flowNode') return node.type;
      return '';
    };

    const getNodeLabel = (node: any): string => {
      return node.data?.label || node.label || `Nó ${node.id}`;
    };

    // Check for trigger node - use the list of trigger types
    const triggerNodes = nodes.filter(n => {
      const nodeType = getNodeType(n);
      return TRIGGER_TYPES.includes(nodeType);
    });

    if (triggerNodes.length === 0) {
      errors.push({
        type: 'error',
        message: 'O fluxo precisa de pelo menos um gatilho (trigger) para iniciar.',
        code: 'NO_TRIGGER'
      });
    }

    // Check for orphan nodes (no connections)
    const connectedNodes = new Set<string>();
    edges.forEach(e => {
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });

    nodes.forEach(node => {
      // Skip if only one node (triggers can be alone)
      if (nodes.length === 1) return;
      
      const nodeType = getNodeType(node);
      const isTrigger = TRIGGER_TYPES.includes(nodeType);
      
      // Triggers only need outgoing, non-triggers need at least one connection
      if (!connectedNodes.has(node.id) && nodes.length > 1) {
        // Don't warn about lone triggers if there are other nodes
        if (isTrigger && nodes.length === 1) return;
        
        warnings.push({
          nodeId: node.id,
          type: 'warning',
          message: `O nó "${getNodeLabel(node)}" não está conectado a nenhum outro nó.`,
          code: 'ORPHAN_NODE'
        });
      }
    });

    // Check for dead ends (non-terminal nodes without outgoing connections)
    const sourcesSet = new Set(edges.map(e => e.source));
    nodes.forEach(node => {
      const nodeType = getNodeType(node);
      const isTerminal = TERMINAL_TYPES.includes(nodeType);
      
      // Skip terminal nodes - they don't need outgoing connections
      if (isTerminal) return;
      
      // Check if node has any outgoing connection
      if (!sourcesSet.has(node.id)) {
        warnings.push({
          nodeId: node.id,
          type: 'warning',
          message: `O nó "${getNodeLabel(node)}" não leva a lugar nenhum.`,
          code: 'DEAD_END'
        });
      }
    });

    // Validate condition nodes have both paths
    nodes.forEach(node => {
      const nodeType = getNodeType(node);
      if (nodeType === 'condition' || nodeType === 'split' || nodeType === 'if_expression') {
        const outgoingEdges = edges.filter(e => e.source === node.id);
        const hasYes = outgoingEdges.some(e => e.sourceHandle === 'yes' || e.sourceHandle === 'true');
        const hasNo = outgoingEdges.some(e => e.sourceHandle === 'no' || e.sourceHandle === 'false');
        
        if (!hasYes || !hasNo) {
          warnings.push({
            nodeId: node.id,
            type: 'warning',
            message: `O nó de condição "${getNodeLabel(node)}" deveria ter ambos os caminhos (Sim e Não).`,
            code: 'INCOMPLETE_CONDITION'
          });
        }
      }
    });

    // Validate required config fields
    nodes.forEach(node => {
      const nodeType = getNodeType(node);
      const config = node.data?.config || {};
      const label = getNodeLabel(node);
      
      switch (nodeType) {
        case 'message':
        case 'wa_send_text':
          if (!config.text?.trim() && !config.message?.trim()) {
            errors.push({
              nodeId: node.id,
              type: 'error',
              message: `O nó "${label}" precisa de uma mensagem.`,
              code: 'MISSING_MESSAGE'
            });
          }
          break;
        case 'webhook':
        case 'http_request':
        case 'http_request_advanced':
          if (!config.url?.trim()) {
            errors.push({
              nodeId: node.id,
              type: 'error',
              message: `O nó "${label}" precisa de uma URL.`,
              code: 'MISSING_URL'
            });
          }
          break;
        case 'ai':
        case 'ai_prompt_execute':
          if (!config.prompt?.trim()) {
            warnings.push({
              nodeId: node.id,
              type: 'warning',
              message: `O nó "${label}" não tem um prompt definido.`,
              code: 'MISSING_PROMPT'
            });
          }
          break;
        case 'delay':
        case 'smart_delay':
          if (!config.duration && !config.seconds && !config.delay) {
            warnings.push({
              nodeId: node.id,
              type: 'warning',
              message: `O nó "${label}" não tem tempo de espera definido.`,
              code: 'MISSING_DELAY'
            });
          }
          break;
        case 'trigger':
          if (!config.keyword?.trim() && !config.event?.trim() && !config.pattern?.trim()) {
            warnings.push({
              nodeId: node.id,
              type: 'warning',
              message: `O nó "${label}" não tem palavras-chave ou evento definido.`,
              code: 'MISSING_TRIGGER_CONFIG'
            });
          }
          break;
      }
    });

    // Check for loops (simple detection)
    const hasLoop = detectLoop(nodes, edges);
    if (hasLoop) {
      warnings.push({
        type: 'warning',
        message: 'O fluxo contém um loop. Certifique-se de que isso é intencional.',
        code: 'FLOW_LOOP'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  return { validateFlow };
};

// Simple loop detection using DFS
function detectLoop(nodes: any[], edges: any[]): boolean {
  const adjacency = new Map<string, string[]>();
  nodes.forEach(n => adjacency.set(n.id, []));
  edges.forEach(e => adjacency.get(e.source)?.push(e.target));

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    for (const neighbor of adjacency.get(nodeId) || []) {
      if (dfs(neighbor)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node.id)) return true;
  }

  return false;
}
