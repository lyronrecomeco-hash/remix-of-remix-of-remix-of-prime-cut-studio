import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationError {
  code: string;
  message: string;
  nodeId?: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  stats: {
    nodeCount: number;
    edgeCount: number;
    triggerCount: number;
    endCount: number;
    orphanNodes: number;
  };
}

interface FlowNode {
  id: string;
  type: string;
  data: {
    type: string;
    label: string;
    config?: Record<string, any>;
  };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

// Node types that are triggers
const TRIGGER_TYPES = ['trigger', 'wa_start', 'webhook_trigger', 'cron_trigger', 'webhook_in'];

// Node types that are ends
const END_TYPES = ['end'];

// Node types that require configuration
const REQUIRES_CONFIG: Record<string, string[]> = {
  'message': ['text'],
  'wa_send_text': ['text'],
  'http_request_advanced': ['url'],
  'webhook_trigger': ['path'],
  'ai_prompt_execute': ['prompt'],
  'ai_decision': ['decision_prompt'],
  'subflow_call': ['flow_id'],
};

function validateFlow(nodes: FlowNode[], edges: FlowEdge[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Stats
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const triggerNodes = nodes.filter(n => TRIGGER_TYPES.includes(n.data?.type || n.type));
  const endNodes = nodes.filter(n => END_TYPES.includes(n.data?.type || n.type));
  const triggerCount = triggerNodes.length;
  const endCount = endNodes.length;

  // 1. Check if flow is empty
  if (nodeCount === 0) {
    errors.push({
      code: 'EMPTY_FLOW',
      message: 'O fluxo está vazio. Adicione pelo menos um nó.',
      severity: 'error'
    });
    return { valid: false, errors, warnings, stats: { nodeCount, edgeCount, triggerCount, endCount, orphanNodes: 0 } };
  }

  // 2. Check for trigger
  if (triggerCount === 0) {
    errors.push({
      code: 'NO_TRIGGER',
      message: 'O fluxo precisa de pelo menos um nó de gatilho para iniciar.',
      severity: 'error'
    });
  }

  // 3. Find orphan nodes (nodes without any connections)
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const orphanNodes: FlowNode[] = [];
  nodes.forEach(node => {
    // Triggers can be the start, so they only need outgoing
    const nodeType = node.data?.type || node.type;
    if (TRIGGER_TYPES.includes(nodeType)) {
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing && nodeCount > 1) {
        warnings.push({
          code: 'UNCONNECTED_TRIGGER',
          message: `O gatilho "${node.data?.label || node.id}" não está conectado a nenhum nó.`,
          nodeId: node.id,
          severity: 'warning'
        });
        orphanNodes.push(node);
      }
    } else if (END_TYPES.includes(nodeType)) {
      // End nodes only need incoming
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming) {
        warnings.push({
          code: 'UNREACHABLE_END',
          message: `O nó de fim "${node.data?.label || node.id}" é inalcançável.`,
          nodeId: node.id,
          severity: 'warning'
        });
        orphanNodes.push(node);
      }
    } else {
      // Regular nodes need connections
      if (!connectedNodeIds.has(node.id)) {
        warnings.push({
          code: 'ORPHAN_NODE',
          message: `O nó "${node.data?.label || node.id}" está desconectado do fluxo.`,
          nodeId: node.id,
          severity: 'warning'
        });
        orphanNodes.push(node);
      }
    }
  });

  // 4. Check for loops (using DFS)
  const hasLoop = detectLoop(nodes, edges);
  if (hasLoop) {
    warnings.push({
      code: 'LOOP_DETECTED',
      message: 'Um loop foi detectado no fluxo. Loops podem causar execução infinita.',
      severity: 'warning'
    });
  }

  // 5. Check required configuration
  nodes.forEach(node => {
    const nodeType = node.data?.type || node.type;
    const requiredFields = REQUIRES_CONFIG[nodeType];
    
    if (requiredFields) {
      requiredFields.forEach(field => {
        const value = node.data?.config?.[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push({
            code: 'MISSING_CONFIG',
            message: `O nó "${node.data?.label || nodeType}" requer o campo "${field}".`,
            nodeId: node.id,
            severity: 'error'
          });
        }
      });
    }
  });

  // 6. Check dead-end nodes (non-end nodes without outgoing connections)
  nodes.forEach(node => {
    const nodeType = node.data?.type || node.type;
    if (!END_TYPES.includes(nodeType)) {
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing && connectedNodeIds.has(node.id)) {
        warnings.push({
          code: 'DEAD_END',
          message: `O nó "${node.data?.label || node.id}" é um beco sem saída.`,
          nodeId: node.id,
          severity: 'warning'
        });
      }
    }
  });

  // 7. Check AI nodes have API access (just warning for now)
  const aiNodes = nodes.filter(n => ['ai_prompt_execute', 'ai_decision', 'ai_embedding', 'ai'].includes(n.data?.type || n.type));
  if (aiNodes.length > 0) {
    warnings.push({
      code: 'AI_NODES_PRESENT',
      message: `O fluxo contém ${aiNodes.length} nó(s) de IA. Certifique-se de que a API Lovable AI está configurada.`,
      severity: 'warning'
    });
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    stats: {
      nodeCount,
      edgeCount,
      triggerCount,
      endCount,
      orphanNodes: orphanNodes.length,
    }
  };
}

function detectLoop(nodes: FlowNode[], edges: FlowEdge[]): boolean {
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => adjacencyList.set(node.id, []));
  edges.forEach(edge => {
    const list = adjacencyList.get(edge.source) || [];
    list.push(edge.target);
    adjacencyList.set(edge.source, list);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, flow_id, flow_data, new_status } = await req.json();

    console.log(`[FlowValidator] Action: ${action}, Flow ID: ${flow_id}`);

    if (action === 'validate') {
      // Validate flow data
      let nodes: FlowNode[] = [];
      let edges: FlowEdge[] = [];

      if (flow_data) {
        nodes = flow_data.nodes || [];
        edges = flow_data.edges || [];
      } else if (flow_id) {
        // Fetch from database
        const { data: rule, error } = await supabase
          .from('whatsapp_automation_rules')
          .select('flow_data')
          .eq('id', flow_id)
          .single();

        if (error || !rule) {
          return new Response(JSON.stringify({ error: 'Flow not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        nodes = rule.flow_data?.nodes || [];
        edges = rule.flow_data?.edges || [];
      }

      const result = validateFlow(nodes, edges);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'transition') {
      if (!flow_id || !new_status) {
        return new Response(JSON.stringify({ error: 'flow_id and new_status are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // If transitioning to 'validated' or 'active', run validation first
      if (new_status === 'validated' || new_status === 'active') {
        const { data: rule, error: fetchError } = await supabase
          .from('whatsapp_automation_rules')
          .select('flow_data, lifecycle_status')
          .eq('id', flow_id)
          .single();

        if (fetchError || !rule) {
          return new Response(JSON.stringify({ error: 'Flow not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const nodes = rule.flow_data?.nodes || [];
        const edges = rule.flow_data?.edges || [];
        const validation = validateFlow(nodes, edges);

        // For 'active', flow must be valid
        if (new_status === 'active' && !validation.valid) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Flow cannot be activated: validation failed',
            validation
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // For 'validated', we allow with warnings but not errors
        if (new_status === 'validated' && validation.errors.length > 0) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Flow has validation errors',
            validation
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Call the database function to transition status
        const { data: transitionResult, error: transitionError } = await supabase
          .rpc('update_flow_lifecycle_status', {
            p_flow_id: flow_id,
            p_new_status: new_status,
            p_validation_result: validation
          });

        if (transitionError) {
          console.error('[FlowValidator] Transition error:', transitionError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: transitionError.message 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          result: transitionResult,
          validation
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // For other transitions (pause, draft, error), just call the function
      const { data: transitionResult, error: transitionError } = await supabase
        .rpc('update_flow_lifecycle_status', {
          p_flow_id: flow_id,
          p_new_status: new_status
        });

      if (transitionError) {
        console.error('[FlowValidator] Transition error:', transitionError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: transitionError.message 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        result: transitionResult
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[FlowValidator] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
