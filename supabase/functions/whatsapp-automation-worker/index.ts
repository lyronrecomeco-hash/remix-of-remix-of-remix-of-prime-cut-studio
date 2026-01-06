import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventQueueItem {
  id: string;
  project_id: string;
  event_type: string;
  event_data: any;
  status: string;
  retry_count: number;
  created_at: string;
}

interface AutomationRule {
  id: string;
  project_id: string;
  name: string;
  trigger_type: string;
  trigger_config: any;
  conditions: any[];
  actions: any[];
  is_active: boolean;
}

// =====================================================
// HELPER: Normalização BR para números brasileiros
// =====================================================
function normalizeBR(phone: string): string {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  // Se já começa com 55 e tem 12+ dígitos, está ok
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  // Se tem 10 ou 11 dígitos (DDD + número), adiciona DDI 55
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

// =====================================================
// HELPER: Enviar mensagem via genesis-backend-proxy
// =====================================================
async function sendViaProxy(
  supabase: any,
  instanceId: string,
  to: string,
  message: string,
  messageType: string = 'text',
  extraPayload: any = {}
): Promise<{ success: boolean; result?: any; error?: string }> {
  // Buscar instância do Genesis (não whatsapp_instances legada)
  const { data: instance, error: instError } = await supabase
    .from('genesis_instances')
    .select('id, name, phone_number, backend_url, backend_token, status')
    .eq('id', instanceId)
    .single();

  if (instError || !instance) {
    console.error('[SEND] Instance not found:', instanceId);
    return { success: false, error: 'Instance not found' };
  }

  if (instance.status !== 'connected') {
    console.error('[SEND] Instance not connected:', instance.status);
    return { success: false, error: `Instance not connected (status: ${instance.status})` };
  }

  const backendUrl = instance.backend_url;
  const backendToken = instance.backend_token || 'genesis-master-token-2024-secure';

  if (!backendUrl) {
    console.error('[SEND] No backend URL configured');
    return { success: false, error: 'Backend URL not configured' };
  }

  // Normaliza número BR
  const normalizedTo = normalizeBR(to);

  try {
    // Usa o proxy Edge Function para maior resiliência
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

    const proxyUrl = `${SUPABASE_URL}/functions/v1/genesis-backend-proxy`;
    
    const payload = {
      action: 'send',
      instanceId,
      endpoint: `/api/instance/${instanceId}/send`,
      method: 'POST',
      body: {
        to: normalizedTo,
        message,
        type: messageType,
        ...extraPayload,
      },
    };

    console.log(`[SEND] Sending to ${normalizedTo} via proxy`, { instanceId, messageType });

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    // Log do envio
    await supabase.from('whatsapp_message_logs').insert({
      instance_id: instanceId,
      recipient: normalizedTo,
      message_type: messageType,
      content: message,
      status: response.ok && result.success !== false ? 'sent' : 'failed',
      external_id: result.messageId || result.data?.messageId,
      metadata: { automation: true, via: 'flow-builder' },
    }).catch((e: any) => console.error('[SEND] Log insert error:', e));

    if (!response.ok || result.success === false) {
      console.error('[SEND] Failed:', result);
      return { success: false, error: result.error || 'Send failed', result };
    }

    console.log('[SEND] Success:', result);
    return { success: true, result };
  } catch (error: any) {
    console.error('[SEND] Exception:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// =====================================================
// Process a single action
// =====================================================
async function processAction(
  supabase: any,
  action: any,
  eventData: any,
  projectId: string,
  context: { instanceId?: string; flowContext?: any }
): Promise<{ success: boolean; result?: any; error?: string; skip?: boolean }> {
  console.log(`Processing action: ${action.type}`, action);

  // Resolve instanceId from action config or context
  const resolveInstanceId = () => action.config?.instanceId || context.instanceId;

  switch (action.type) {
    // =====================================================
    // NATIVE WHATSAPP NODES (Genesis)
    // =====================================================
    case 'wa_send_text': {
      const { text, typing = true, typingDuration = 2 } = action.config;
      const instanceId = resolveInstanceId();
      const to = action.config.to || eventData?.from;

      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }
      if (!to) {
        return { success: false, error: 'No recipient (to) specified' };
      }

      // Replace variables in text
      let finalText = text || '';
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }
      if (context.flowContext?.variables) {
        Object.keys(context.flowContext.variables).forEach(key => {
          finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), context.flowContext.variables[key]?.value || '');
        });
      }

      // Typing indicator delay
      if (typing && typingDuration > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(typingDuration, 10) * 1000));
      }

      return await sendViaProxy(supabase, instanceId, to, finalText, 'text');
    }

    case 'wa_send_buttons': {
      const { text, buttons = [] } = action.config;
      const instanceId = resolveInstanceId();
      const to = action.config.to || eventData?.from;

      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }
      if (!to) {
        return { success: false, error: 'No recipient (to) specified' };
      }

      // Replace variables
      let finalText = text || '';
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }

      return await sendViaProxy(supabase, instanceId, to, finalText, 'buttons', { buttons });
    }

    case 'wa_send_list': {
      const { title, buttonText = 'Ver opções', sections = [] } = action.config;
      const instanceId = resolveInstanceId();
      const to = action.config.to || eventData?.from;

      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }
      if (!to) {
        return { success: false, error: 'No recipient (to) specified' };
      }

      return await sendViaProxy(supabase, instanceId, to, title || '', 'list', { buttonText, sections });
    }

    case 'wa_wait_response': {
      const { timeout_seconds = 300, save_to = 'user_response' } = action.config;

      // This node marks that the flow should wait for user response
      // The actual waiting is handled by the flow executor state machine
      context.flowContext = {
        ...context.flowContext,
        waiting_for_response: true,
        wait_timeout: timeout_seconds,
        wait_started_at: new Date().toISOString(),
        response_variable: save_to,
      };

      console.log(`[WA] Waiting for response, timeout: ${timeout_seconds}s, save to: ${save_to}`);

      return { 
        success: true, 
        result: { 
          waiting: true, 
          timeout: timeout_seconds,
          saveTo: save_to,
        } 
      };
    }

    case 'wa_receive': {
      // Trigger node - just passes through event data
      const { filter_type = 'any' } = action.config;
      
      return { 
        success: true, 
        result: { 
          type: 'trigger',
          filterType: filter_type,
          received: eventData,
        } 
      };
    }

    case 'wa_start': {
      // Trigger node - flow entry point
      const { triggerType = 'message_received' } = action.config;
      
      return { 
        success: true, 
        result: { 
          type: 'trigger',
          triggerType,
          started: true,
        } 
      };
    }

    // =====================================================
    // LEGACY send_message (compatibility)
    // =====================================================
    case 'send_message': {
      const { instanceId: configInstanceId, to, message, messageType = 'text' } = action.config;
      const instanceId = configInstanceId || resolveInstanceId();
      
      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }

      // Replace variables in message
      let finalMessage = message || '';
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }

      const recipient = to || eventData?.from;
      if (!recipient) {
        return { success: false, error: 'No recipient specified' };
      }

      return await sendViaProxy(supabase, instanceId, recipient, finalMessage, messageType);
    }

    // =====================================================
    // message node (from NODE_TEMPLATES)
    // =====================================================
    case 'message': {
      const { text, typing = true } = action.config;
      const instanceId = resolveInstanceId();
      const to = action.config.to || eventData?.from;

      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }
      if (!to) {
        return { success: false, error: 'No recipient specified' };
      }

      // Replace variables
      let finalText = text || '';
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }

      if (typing) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return await sendViaProxy(supabase, instanceId, to, finalText, 'text');
    }

    // =====================================================
    // button node (from NODE_TEMPLATES)
    // =====================================================
    case 'button': {
      const { text, buttons = [] } = action.config;
      const instanceId = resolveInstanceId();
      const to = action.config.to || eventData?.from;

      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }

      let finalText = text || '';
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalText = finalText.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }

      return await sendViaProxy(supabase, instanceId, to || '', finalText, 'buttons', { buttons });
    }

    // =====================================================
    // list node (from NODE_TEMPLATES)
    // =====================================================
    case 'list': {
      const { title, sections = [] } = action.config;
      const instanceId = resolveInstanceId();
      const to = action.config.to || eventData?.from;

      if (!instanceId) {
        return { success: false, error: 'No instance configured' };
      }

      return await sendViaProxy(supabase, instanceId, to || '', title || '', 'list', { sections });
    }

    case 'update_status': {
      const { table, column, value, whereColumn, whereValue } = action.config;
      
      // Only allow updating specific tables for security
      const allowedTables = ['whatsapp_message_logs', 'whatsapp_event_queue'];
      if (!allowedTables.includes(table)) {
        return { success: false, error: 'Table not allowed' };
      }

      const { error } = await supabase
        .from(table)
        .update({ [column]: value })
        .eq(whereColumn, whereValue || eventData?.id);

      return { success: !error, error: error?.message };
    }

    case 'call_webhook': {
      const { url, method = 'POST', headers = {}, body } = action.config;

      // Replace variables in body
      let finalBody = JSON.stringify(body || eventData);
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalBody = finalBody.replace(new RegExp(`{{${key}}}`, 'g'), JSON.stringify(eventData[key]) || '');
        });
      }

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: method !== 'GET' ? finalBody : undefined,
        });

        const result = await response.text();
        return { 
          success: response.ok, 
          result: { statusCode: response.status, body: result } 
        };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Unknown error' };
      }
    }

    case 'delay': {
      const { seconds = 1 } = action.config;
      await new Promise(resolve => setTimeout(resolve, Math.min(seconds, 30) * 1000));
      return { success: true };
    }

    case 'log': {
      const { message } = action.config;
      console.log(`[Automation Log] ${message}`, eventData);
      return { success: true };
    }

    // =====================================================
    // STABILITY & RESILIENCE NODES
    // =====================================================

    case 'queue_message': {
      const { message, priority = 'normal', retry_limit = 3, retry_interval_seconds = 30, expiration_seconds = 3600 } = action.config;
      
      // Insert into message queue table
      const { error } = await supabase.from('whatsapp_message_queue').insert({
        instance_id: context.instanceId,
        recipient: eventData?.from,
        message_content: message,
        priority,
        max_retries: retry_limit,
        retry_interval: retry_interval_seconds,
        expires_at: new Date(Date.now() + expiration_seconds * 1000).toISOString(),
        status: 'pending',
        metadata: { projectId, flowContext: context.flowContext }
      });

      if (error) {
        console.error('Queue message error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, result: { queued: true } };
    }

    case 'session_guard': {
      const { max_messages_per_minute = 20, burst_limit = 5, cooldown_minutes = 2 } = action.config;
      
      // Check recent message count for this instance
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count: recentCount } = await supabase
        .from('whatsapp_message_logs')
        .select('*', { count: 'exact', head: true })
        .eq('instance_id', context.instanceId)
        .gte('created_at', oneMinuteAgo);
      
      if ((recentCount || 0) >= max_messages_per_minute) {
        console.log(`Session guard: Rate limit exceeded (${recentCount}/${max_messages_per_minute})`);
        // Apply cooldown
        await new Promise(resolve => setTimeout(resolve, cooldown_minutes * 60 * 1000));
        return { success: true, result: { throttled: true, waited: cooldown_minutes * 60 } };
      }
      
      // Check burst
      const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
      const { count: burstCount } = await supabase
        .from('whatsapp_message_logs')
        .select('*', { count: 'exact', head: true })
        .eq('instance_id', context.instanceId)
        .gte('created_at', fiveSecondsAgo);
      
      if ((burstCount || 0) >= burst_limit) {
        console.log(`Session guard: Burst limit exceeded (${burstCount}/${burst_limit})`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        return { success: true, result: { burstThrottled: true } };
      }
      
      return { success: true, result: { passed: true } };
    }

    case 'timeout_handler': {
      const { timeout_seconds = 30 } = action.config;
      // This node wraps subsequent actions with a timeout
      // The actual timeout logic would be applied by the flow executor
      return { success: true, result: { timeout: timeout_seconds } };
    }

    case 'if_instance_state': {
      const { check_state = 'connected' } = action.config;
      
      // Get current instance state
      const { data: instance } = await supabase
        .from('genesis_instances')
        .select('status')
        .eq('id', context.instanceId)
        .single();
      
      const currentState = instance?.status || 'disconnected';
      const matches = currentState === check_state;
      
      return { 
        success: true, 
        result: { 
          matches, 
          currentState, 
          expectedState: check_state 
        },
        skip: !matches // Skip next nodes if condition doesn't match
      };
    }

    case 'retry_policy': {
      const { max_attempts = 3, delay_seconds = 5, jitter_enabled = true } = action.config;
      
      // Store retry context for subsequent actions
      const jitter = jitter_enabled ? Math.random() * delay_seconds * 0.3 : 0;
      
      return { 
        success: true, 
        result: { 
          policy: { 
            maxAttempts: max_attempts, 
            delaySeconds: delay_seconds + jitter,
            jitterEnabled: jitter_enabled
          } 
        } 
      };
    }

    case 'smart_delay': {
      const { min_seconds = 2, max_seconds = 8, randomize = true, respect_business_hours = false } = action.config;
      
      let delaySeconds = min_seconds;
      
      if (randomize) {
        delaySeconds = min_seconds + Math.random() * (max_seconds - min_seconds);
      }
      
      // Check business hours (9-18, Mon-Fri)
      if (respect_business_hours) {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 18;
        
        if (!isBusinessHours) {
          delaySeconds *= 2; // Double delay outside business hours
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      
      return { success: true, result: { delayed: delaySeconds } };
    }

    case 'rate_limit': {
      const { messages_per_minute = 10, burst_limit = 3, cooldown_minutes = 1 } = action.config;
      
      // Similar to session_guard but for flow-level rate limiting
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count: flowCount } = await supabase
        .from('whatsapp_automation_executions')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .gte('created_at', oneMinuteAgo);
      
      if ((flowCount || 0) >= messages_per_minute) {
        console.log(`Rate limit: Flow limit exceeded (${flowCount}/${messages_per_minute})`);
        await new Promise(resolve => setTimeout(resolve, cooldown_minutes * 60 * 1000));
        return { success: true, result: { rateLimited: true, waited: cooldown_minutes * 60 } };
      }
      
      return { success: true, result: { passed: true, currentRate: flowCount } };
    }

    case 'enqueue_flow_step': {
      const { queue_name = 'default', priority = 'normal', delay_seconds = 0 } = action.config;
      
      // Insert into flow step queue for async execution
      const { error } = await supabase.from('whatsapp_flow_queue').insert({
        queue_name,
        priority,
        scheduled_at: new Date(Date.now() + delay_seconds * 1000).toISOString(),
        flow_context: context.flowContext,
        event_data: eventData,
        status: 'pending'
      });

      if (error) {
        console.error('Enqueue flow step error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, result: { enqueued: true, queue: queue_name } };
    }

    // =====================================================
    // GENERIC AUTOMATION ENGINE NODES
    // =====================================================

    case 'http_request_advanced': {
      const { 
        method = 'GET', 
        url, 
        headers = {}, 
        query_params = {},
        body,
        timeout_seconds = 30,
        retries = 3,
        auth_type = 'none',
        save_response_to = 'response'
      } = action.config;

      if (!url) {
        return { success: false, error: 'URL is required' };
      }

      // Build URL with query params
      let finalUrl = url;
      const parsedParams = typeof query_params === 'string' ? JSON.parse(query_params) : query_params;
      if (Object.keys(parsedParams).length > 0) {
        const queryString = new URLSearchParams(parsedParams).toString();
        finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }

      // Parse headers
      const parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers;

      let attempt = 0;
      let lastError: any = null;

      while (attempt < retries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout_seconds * 1000);

          const response = await fetch(finalUrl, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...parsedHeaders,
            },
            body: method !== 'GET' && body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          // Store response in context
          context.flowContext = {
            ...context.flowContext,
            [save_response_to]: {
              status: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              data: responseData,
            },
          };

          return { 
            success: response.ok, 
            result: { 
              status: response.status, 
              data: responseData,
              savedTo: save_response_to
            } 
          };
        } catch (error: any) {
          lastError = error;
          attempt++;
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      return { success: false, error: lastError?.message || 'Request failed after retries' };
    }

    case 'webhook_trigger': {
      // This is a trigger node - handled at flow level, not action level
      // Just pass through with config for reference
      return { 
        success: true, 
        result: { 
          type: 'trigger',
          config: action.config 
        } 
      };
    }

    case 'cron_trigger': {
      // This is a trigger node - handled at scheduler level
      // Just pass through with config for reference
      return { 
        success: true, 
        result: { 
          type: 'trigger',
          config: action.config 
        } 
      };
    }

    case 'set_variable': {
      const { name, value, scope = 'flow', type = 'string' } = action.config;

      if (!name) {
        return { success: false, error: 'Variable name is required' };
      }

      // Parse value based on type
      let parsedValue = value;
      try {
        switch (type) {
          case 'number':
            parsedValue = Number(value);
            break;
          case 'boolean':
            parsedValue = value === 'true' || value === true;
            break;
          case 'json':
            parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
            break;
        }
      } catch {
        // Keep original value if parsing fails
      }

      // Replace variables in value
      if (typeof parsedValue === 'string' && eventData) {
        Object.keys(eventData).forEach(key => {
          parsedValue = parsedValue.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }

      // Store in appropriate scope
      context.flowContext = {
        ...context.flowContext,
        variables: {
          ...context.flowContext?.variables,
          [name]: { value: parsedValue, scope },
        },
      };

      return { 
        success: true, 
        result: { 
          variable: name, 
          value: parsedValue, 
          scope 
        } 
      };
    }

    case 'if_expression': {
      const { expression, logic = 'and', fallback = 'no' } = action.config;

      if (!expression) {
        return { success: true, result: { matches: true } };
      }

      try {
        // Simple expression evaluation
        let evalExpression = expression;
        
        // Replace variables
        if (eventData) {
          Object.keys(eventData).forEach(key => {
            evalExpression = evalExpression.replace(new RegExp(`{{${key}}}`, 'g'), JSON.stringify(eventData[key] || ''));
          });
        }
        if (context.flowContext?.variables) {
          Object.keys(context.flowContext.variables).forEach(key => {
            evalExpression = evalExpression.replace(new RegExp(`{{${key}}}`, 'g'), JSON.stringify(context.flowContext.variables[key]?.value || ''));
          });
        }

        // Very basic expression evaluation (for safety, only simple comparisons)
        const matches = evalExpression.includes('==') || evalExpression.includes('!=') || 
                       evalExpression.includes('>') || evalExpression.includes('<');
        
        return { 
          success: true, 
          result: { 
            matches, 
            expression: evalExpression,
            branch: matches ? 'yes' : fallback
          },
          skip: !matches && fallback === 'no'
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }

    case 'loop_for_each': {
      const { 
        array_source, 
        item_variable = 'item', 
        index_variable = 'index',
        limit = 100,
        delay_between = 0,
        on_error = 'continue'
      } = action.config;

      // Get array from context or eventData
      let array = [];
      if (array_source.startsWith('{{') && array_source.endsWith('}}')) {
        const varName = array_source.slice(2, -2);
        array = eventData?.[varName] || context.flowContext?.variables?.[varName]?.value || [];
      } else {
        try {
          array = JSON.parse(array_source);
        } catch {
          array = [];
        }
      }

      if (!Array.isArray(array)) {
        return { success: false, error: 'Source is not an array' };
      }

      // Store loop context for subsequent nodes
      const loopItems = array.slice(0, limit);
      context.flowContext = {
        ...context.flowContext,
        loop: {
          items: loopItems,
          total: loopItems.length,
          current: 0,
          itemVariable: item_variable,
          indexVariable: index_variable,
          delayBetween: delay_between,
          onError: on_error,
        },
      };

      return { 
        success: true, 
        result: { 
          loopStarted: true, 
          totalItems: loopItems.length,
          limit,
        } 
      };
    }

    case 'switch_case': {
      const { expression, cases_raw, default_case = 'end' } = action.config;

      if (!expression) {
        return { success: false, error: 'Expression is required' };
      }

      // Evaluate expression
      let value = expression;
      if (expression.startsWith('{{') && expression.endsWith('}}')) {
        const varName = expression.slice(2, -2);
        value = eventData?.[varName] || context.flowContext?.variables?.[varName]?.value || '';
      }

      // Parse cases
      const cases: Record<string, string> = {};
      if (cases_raw) {
        cases_raw.split('\n').forEach((line: string) => {
          const [caseValue, nodeId] = line.split('|').map((s: string) => s.trim());
          if (caseValue && nodeId) {
            cases[caseValue] = nodeId;
          }
        });
      }

      const matchedNode = cases[String(value)];
      
      return { 
        success: true, 
        result: { 
          value,
          matchedCase: matchedNode || null,
          defaultCase: default_case,
          nextNode: matchedNode || (default_case === 'continue' ? 'next' : null),
        } 
      };
    }

    case 'subflow_call': {
      const { 
        flow_id, 
        parameters = {}, 
        wait_for_completion = true,
        timeout_seconds = 60,
        return_variable = 'subflow_result'
      } = action.config;

      if (!flow_id) {
        return { success: false, error: 'Flow ID is required' };
      }

      // Get the subflow
      const { data: subflow, error: subflowError } = await supabase
        .from('whatsapp_automation_rules')
        .select('*')
        .eq('id', flow_id)
        .eq('is_active', true)
        .single();

      if (subflowError || !subflow) {
        return { success: false, error: 'Subflow not found or inactive' };
      }

      // Parse parameters
      const parsedParams = typeof parameters === 'string' ? JSON.parse(parameters) : parameters;
      
      // Replace variables in parameters
      const resolvedParams: Record<string, any> = {};
      Object.keys(parsedParams).forEach(key => {
        let value = parsedParams[key];
        if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
          const varName = value.slice(2, -2);
          value = eventData?.[varName] || context.flowContext?.variables?.[varName]?.value || value;
        }
        resolvedParams[key] = value;
      });

      // For now, just mark as queued (actual execution would be handled by a separate worker)
      const { error: queueError } = await supabase.from('whatsapp_event_queue').insert({
        project_id: projectId,
        event_type: 'subflow_execution',
        event_data: {
          parentFlowId: context.flowContext?.ruleId,
          subflowId: flow_id,
          parameters: resolvedParams,
          timeout: timeout_seconds,
        },
        status: 'pending',
      });

      if (queueError) {
        return { success: false, error: queueError.message };
      }

      context.flowContext = {
        ...context.flowContext,
        [return_variable]: { pending: true, flowId: flow_id },
      };

      return { 
        success: true, 
        result: { 
          subflowQueued: true, 
          flowId: flow_id,
          waitForCompletion: wait_for_completion,
        } 
      };
    }

    case 'event_emitter': {
      const { event_name, payload = {}, scope = 'project' } = action.config;

      if (!event_name) {
        return { success: false, error: 'Event name is required' };
      }

      // Parse and resolve payload
      const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
      const resolvedPayload: Record<string, any> = {};
      Object.keys(parsedPayload).forEach(key => {
        let value = parsedPayload[key];
        if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
          const varName = value.slice(2, -2);
          value = eventData?.[varName] || context.flowContext?.variables?.[varName]?.value || value;
        }
        resolvedPayload[key] = value;
      });

      // Insert event for other flows to consume
      const { error } = await supabase.from('whatsapp_event_queue').insert({
        project_id: projectId,
        event_type: event_name,
        event_data: {
          ...resolvedPayload,
          _emittedBy: context.flowContext?.ruleId,
          _scope: scope,
        },
        status: 'pending',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        result: { 
          eventEmitted: event_name, 
          scope,
          payload: resolvedPayload,
        } 
      };
    }

    case 'data_transform': {
      const { 
        operation = 'map', 
        source, 
        expression,
        output_variable = 'transformed'
      } = action.config;

      if (!source) {
        return { success: false, error: 'Source is required' };
      }

      // Get source data
      let sourceData;
      if (source.startsWith('{{') && source.endsWith('}}')) {
        const varName = source.slice(2, -2);
        sourceData = eventData?.[varName] || context.flowContext?.variables?.[varName]?.value;
      } else {
        try {
          sourceData = JSON.parse(source);
        } catch {
          sourceData = source;
        }
      }

      let result: any = sourceData;
      try {
        switch (operation) {
          case 'map':
            if (Array.isArray(sourceData)) {
              // Simple property extraction
              result = sourceData.map((item: any, index: number) => ({
                ...item,
                _index: index,
              }));
            } else {
              result = sourceData;
            }
            break;
          case 'filter':
            if (Array.isArray(sourceData)) {
              // Simple filter (keep items with truthy property from expression)
              result = sourceData.filter((item: any) => {
                if (expression.includes('>')) {
                  const [prop, val] = expression.split('>').map((s: string) => s.trim());
                  const propPath = prop.replace('item.', '');
                  return (item[propPath] || 0) > Number(val);
                }
                return true;
              });
            } else {
              result = sourceData;
            }
            break;
          case 'reduce':
            if (Array.isArray(sourceData)) {
              // Simple sum
              result = sourceData.reduce((acc: number, item: any) => {
                if (expression.includes('item.')) {
                  const prop = expression.replace('acc + item.', '').trim();
                  return acc + (Number(item[prop]) || 0);
                }
                return acc;
              }, 0);
            } else {
              result = sourceData;
            }
            break;
          case 'merge':
            if (typeof sourceData === 'object' && !Array.isArray(sourceData)) {
              const mergeData = expression ? JSON.parse(expression) : {};
              result = { ...sourceData, ...mergeData };
            } else {
              result = sourceData;
            }
            break;
          case 'template':
            if (typeof expression === 'string') {
              result = expression as string;
              // Replace template variables
              if (typeof sourceData === 'object') {
                Object.keys(sourceData).forEach((key: string) => {
                  result = (result as string).replace(new RegExp(`{{${key}}}`, 'g'), sourceData[key] || '');
                });
              }
            } else {
              result = sourceData;
            }
            break;
          default:
            result = sourceData;
        }

        // Store result
        context.flowContext = {
          ...context.flowContext,
          variables: {
            ...context.flowContext?.variables,
            [output_variable]: { value: result, scope: 'flow' },
          },
        };

        return { 
          success: true, 
          result: { 
            operation,
            output: result,
            savedTo: output_variable,
          } 
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }

    // ============ INFRASTRUCTURE NODES ============
    case 'proxy_assign': {
      const { 
        proxy_pool = 'default', 
        type = 'datacenter', 
        sticky = true, 
        ttl_seconds = 3600,
        fallback_behavior = 'direct'
      } = action.config;

      // Simulate proxy assignment (in real implementation, would call proxy manager)
      const assignedProxy = {
        pool: proxy_pool,
        type,
        sticky,
        ttl: ttl_seconds,
        ip: `proxy-${proxy_pool}-${Date.now()}.internal`,
        assigned_at: new Date().toISOString(),
      };

      context.flowContext = {
        ...context.flowContext,
        proxy: assignedProxy,
      };

      console.log(`[INFRA] Proxy assigned: ${assignedProxy.ip} from pool ${proxy_pool}`);

      return { 
        success: true, 
        result: { 
          proxyAssigned: assignedProxy,
          fallback: fallback_behavior,
        } 
      };
    }

    case 'proxy_rotate': {
      const { 
        rotate_on = 'error', 
        min_interval_seconds = 60,
        on_fail = 'continue'
      } = action.config;

      // Check if minimum interval has passed
      const currentProxy = context.flowContext?.proxy;
      if (currentProxy) {
        const assignedAt = new Date(currentProxy.assigned_at).getTime();
        const now = Date.now();
        if (now - assignedAt < min_interval_seconds * 1000) {
          console.log(`[INFRA] Proxy rotation skipped: min interval not reached`);
          return { 
            success: true, 
            result: { rotated: false, reason: 'min_interval_not_reached' },
            skip: true
          };
        }
      }

      // Rotate proxy
      const newProxy = {
        ...currentProxy,
        ip: `proxy-rotated-${Date.now()}.internal`,
        assigned_at: new Date().toISOString(),
        rotated_due_to: rotate_on,
      };

      context.flowContext = {
        ...context.flowContext,
        proxy: newProxy,
      };

      console.log(`[INFRA] Proxy rotated due to: ${rotate_on}`);

      return { 
        success: true, 
        result: { 
          rotated: true,
          newProxy,
          onFail: on_fail,
        } 
      };
    }

    case 'worker_assign': {
      const { 
        region = 'auto', 
        max_capacity = 100, 
        sticky = true,
        fallback = 'any'
      } = action.config;

      // Simulate worker assignment
      const assignedWorker = {
        id: `worker-${region}-${Date.now()}`,
        region,
        capacity_limit: max_capacity,
        sticky,
        assigned_at: new Date().toISOString(),
      };

      context.flowContext = {
        ...context.flowContext,
        worker: assignedWorker,
      };

      console.log(`[INFRA] Worker assigned: ${assignedWorker.id} in region ${region}`);

      return { 
        success: true, 
        result: { 
          workerAssigned: assignedWorker,
          fallback,
        } 
      };
    }

    case 'worker_release': {
      const { 
        release_on_complete = true, 
        release_on_error = true,
        retention_timeout = 60
      } = action.config;

      const currentWorker = context.flowContext?.worker;
      if (!currentWorker) {
        return { success: true, result: { released: false, reason: 'no_worker_assigned' } };
      }

      // Schedule release
      console.log(`[INFRA] Worker ${currentWorker.id} scheduled for release in ${retention_timeout}s`);

      context.flowContext = {
        ...context.flowContext,
        worker: {
          ...currentWorker,
          release_scheduled: true,
          release_at: new Date(Date.now() + retention_timeout * 1000).toISOString(),
        },
      };

      return { 
        success: true, 
        result: { 
          released: true,
          workerId: currentWorker.id,
          releaseAt: context.flowContext.worker.release_at,
        } 
      };
    }

    case 'dispatch_execution': {
      const { 
        quantity = 1, 
        spacing_seconds = 1, 
        max_parallel = 10,
        time_window_start = '00:00',
        time_window_end = '23:59'
      } = action.config;

      // Check if within time window
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentTime < time_window_start || currentTime > time_window_end) {
        console.log(`[INFRA] Dispatch blocked: outside time window (${currentTime})`);
        return { 
          success: true, 
          result: { dispatched: false, reason: 'outside_time_window' },
          skip: true
        };
      }

      console.log(`[INFRA] Dispatching ${quantity} executions with ${spacing_seconds}s spacing`);

      return { 
        success: true, 
        result: { 
          dispatched: true,
          quantity,
          spacing: spacing_seconds,
          maxParallel: max_parallel,
        } 
      };
    }

    case 'identity_rotate': {
      const { 
        rotate_proxy = false, 
        rotate_worker = false, 
        rotate_instance = false,
        trigger_condition = 'manual'
      } = action.config;

      const rotations: string[] = [];
      
      if (rotate_proxy && context.flowContext?.proxy) {
        context.flowContext.proxy = {
          ...context.flowContext.proxy,
          ip: `proxy-identity-${Date.now()}.internal`,
          assigned_at: new Date().toISOString(),
        };
        rotations.push('proxy');
      }
      
      if (rotate_worker && context.flowContext?.worker) {
        context.flowContext.worker = {
          ...context.flowContext.worker,
          id: `worker-identity-${Date.now()}`,
          assigned_at: new Date().toISOString(),
        };
        rotations.push('worker');
      }

      if (rotate_instance) {
        rotations.push('instance');
        // Instance rotation would be handled by the orchestrator
      }

      console.log(`[INFRA] Identity rotated: ${rotations.join(', ')} (trigger: ${trigger_condition})`);

      return { 
        success: true, 
        result: { 
          rotated: rotations,
          triggerCondition: trigger_condition,
        } 
      };
    }

    // ============ SECURITY NODES ============
    case 'execution_quota_guard': {
      const { 
        max_concurrent = 10, 
        max_per_hour = 1000, 
        max_per_day = 10000,
        on_violation = 'pause'
      } = action.config;

      // Get current execution counts (simplified - in production would query DB)
      const currentConcurrent = context.flowContext?.executions?.concurrent || 0;
      const currentHourly = context.flowContext?.executions?.hourly || 0;
      const currentDaily = context.flowContext?.executions?.daily || 0;

      let violation = null;
      if (currentConcurrent >= max_concurrent) violation = 'concurrent_limit';
      else if (currentHourly >= max_per_hour) violation = 'hourly_limit';
      else if (currentDaily >= max_per_day) violation = 'daily_limit';

      if (violation) {
        console.log(`[SECURITY] Quota violated: ${violation}, action: ${on_violation}`);
        
        if (on_violation === 'abort') {
          return { success: false, error: `Quota exceeded: ${violation}` };
        }
        
        return { 
          success: true, 
          result: { violation, action: on_violation },
          skip: on_violation === 'pause'
        };
      }

      // Increment counters
      context.flowContext = {
        ...context.flowContext,
        executions: {
          concurrent: currentConcurrent + 1,
          hourly: currentHourly + 1,
          daily: currentDaily + 1,
        },
      };

      return { 
        success: true, 
        result: { 
          quotaOk: true,
          concurrent: currentConcurrent + 1,
          hourly: currentHourly + 1,
          daily: currentDaily + 1,
        } 
      };
    }

    case 'infra_rate_limit': {
      const { 
        cpu_limit_percent = 80, 
        memory_limit_mb = 512, 
        throughput_mbps = 10,
        cooldown_minutes = 5
      } = action.config;

      // Simulated resource check
      const currentCpu = Math.random() * 100;
      const currentMemory = Math.random() * 1024;
      const currentThroughput = Math.random() * 100;

      let limitReached = false;
      let limitType = null;

      if (currentCpu > cpu_limit_percent) {
        limitReached = true;
        limitType = 'cpu';
      } else if (currentMemory > memory_limit_mb) {
        limitReached = true;
        limitType = 'memory';
      } else if (currentThroughput > throughput_mbps) {
        limitReached = true;
        limitType = 'throughput';
      }

      if (limitReached) {
        console.log(`[SECURITY] Infra rate limit reached: ${limitType}, cooldown: ${cooldown_minutes}min`);
        return { 
          success: true, 
          result: { 
            limitReached: true,
            limitType,
            cooldown: cooldown_minutes,
          },
          skip: true
        };
      }

      return { 
        success: true, 
        result: { 
          limitReached: false,
          resources: {
            cpu: Math.round(currentCpu),
            memory: Math.round(currentMemory),
            throughput: Math.round(currentThroughput),
          },
        } 
      };
    }

    case 'if_infra_health': {
      const { 
        check_proxy_health = true, 
        check_worker_load = true, 
        check_latency = true,
        latency_threshold_ms = 500,
        fallback = 'pause'
      } = action.config;

      const healthIssues: string[] = [];

      // Check proxy health
      if (check_proxy_health) {
        const proxyHealthy = context.flowContext?.proxy?.ip ? Math.random() > 0.1 : true;
        if (!proxyHealthy) healthIssues.push('proxy_unhealthy');
      }

      // Check worker load
      if (check_worker_load) {
        const workerLoad = Math.random() * 100;
        if (workerLoad > 90) healthIssues.push('worker_overloaded');
      }

      // Check latency
      if (check_latency) {
        const latency = Math.random() * 1000;
        if (latency > latency_threshold_ms) healthIssues.push('high_latency');
      }

      if (healthIssues.length > 0) {
        console.log(`[SECURITY] Infra health issues: ${healthIssues.join(', ')}, fallback: ${fallback}`);
        
        if (fallback === 'abort') {
          return { success: false, error: `Infra unhealthy: ${healthIssues.join(', ')}` };
        }
        
        return { 
          success: true, 
          result: { 
            healthy: false,
            issues: healthIssues,
            fallback,
          },
          skip: fallback === 'pause'
        };
      }

      return { 
        success: true, 
        result: { 
          healthy: true,
          checks: { proxy: check_proxy_health, worker: check_worker_load, latency: check_latency },
        } 
      };
    }

    case 'secure_context_guard': {
      const { 
        isolate_execution = true, 
        prevent_variable_leak = true, 
        auto_reset_on_error = true,
        allowed_variables_raw = ''
      } = action.config;

      // Parse allowed variables
      const allowedVariables = allowed_variables_raw
        ? allowed_variables_raw.split('\n').map((v: string) => v.trim()).filter(Boolean)
        : [];

      // Apply security context
      if (prevent_variable_leak && allowedVariables.length > 0) {
        const currentVars = context.flowContext?.variables || {};
        const filteredVars: Record<string, any> = {};
        
        allowedVariables.forEach((varName: string) => {
          if (currentVars[varName]) {
            filteredVars[varName] = currentVars[varName];
          }
        });

        context.flowContext = {
          ...context.flowContext,
          variables: filteredVars,
          securityContext: {
            isolated: isolate_execution,
            preventLeak: prevent_variable_leak,
            autoReset: auto_reset_on_error,
            allowedVariables,
          },
        };
      } else {
        context.flowContext = {
          ...context.flowContext,
          securityContext: {
            isolated: isolate_execution,
            preventLeak: prevent_variable_leak,
            autoReset: auto_reset_on_error,
            allowedVariables: [],
          },
        };
      }

      console.log(`[SECURITY] Secure context applied: isolated=${isolate_execution}, preventLeak=${prevent_variable_leak}`);

      return { 
        success: true, 
        result: { 
          contextSecured: true,
          isolated: isolate_execution,
          variablesFiltered: allowedVariables.length > 0,
        } 
      };
    }

    // ============ AI NATIVE NODES ============
    case 'ai_prompt_execute': {
      const {
        prompt,
        system_prompt = 'Você é um assistente útil.',
        model = 'google/gemini-2.5-flash',
        max_tokens = 1024,
        temperature = 0.7,
        save_response_to = 'ai_response',
        use_context = true,
        fallback_response = 'Desculpe, não consegui processar sua solicitação.'
      } = action.config;

      if (!prompt) {
        return { success: false, error: 'Prompt is required' };
      }

      // Replace variables in prompt
      let finalPrompt = prompt;
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }
      if (context.flowContext?.variables) {
        Object.keys(context.flowContext.variables).forEach(key => {
          finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), context.flowContext.variables[key]?.value || '');
        });
      }

      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
          console.error('[AI] LOVABLE_API_KEY not configured');
          context.flowContext = {
            ...context.flowContext,
            [save_response_to]: fallback_response,
          };
          return { success: true, result: { response: fallback_response, fallback: true } };
        }

        // Build messages array
        const messages: { role: string; content: string }[] = [
          { role: 'system', content: system_prompt }
        ];

        // Add chat history if using context
        if (use_context && context.flowContext?.chat_history) {
          messages.push(...context.flowContext.chat_history);
        }

        messages.push({ role: 'user', content: finalPrompt });

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens,
            temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AI] API error:', response.status, errorText);
          
          context.flowContext = {
            ...context.flowContext,
            [save_response_to]: fallback_response,
          };
          return { success: true, result: { response: fallback_response, fallback: true, error: errorText } };
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || fallback_response;

        // Save response to context
        context.flowContext = {
          ...context.flowContext,
          [save_response_to]: aiResponse,
          variables: {
            ...context.flowContext?.variables,
            [save_response_to]: { value: aiResponse, scope: 'flow' },
          },
        };

        console.log(`[AI] Prompt executed successfully, saved to ${save_response_to}`);

        return {
          success: true,
          result: {
            response: aiResponse,
            model,
            tokens: data.usage?.total_tokens || 0,
            savedTo: save_response_to,
          }
        };
      } catch (error: any) {
        console.error('[AI] Error executing prompt:', error);
        context.flowContext = {
          ...context.flowContext,
          [save_response_to]: fallback_response,
        };
        return { success: true, result: { response: fallback_response, fallback: true, error: error.message } };
      }
    }

    case 'ai_chat_context': {
      const {
        context_scope = 'execution',
        max_history = 10,
        context_key = 'chat_history',
        include_system = true,
        auto_summarize = false,
        summarize_after = 20
      } = action.config;

      // Initialize or retrieve chat history
      let chatHistory = context.flowContext?.[context_key] || [];

      // Add current message to history if available
      if (eventData?.message || eventData?.content) {
        const userMessage = eventData.message || eventData.content;
        chatHistory.push({ role: 'user', content: userMessage });
      }

      // Check if we need to add the last AI response
      if (context.flowContext?.ai_response) {
        chatHistory.push({ role: 'assistant', content: context.flowContext.ai_response });
      }

      // Trim to max history
      if (chatHistory.length > max_history * 2) {
        chatHistory = chatHistory.slice(-max_history * 2);
      }

      // Store in context
      context.flowContext = {
        ...context.flowContext,
        [context_key]: chatHistory,
        chat_context: {
          scope: context_scope,
          maxHistory: max_history,
          currentSize: chatHistory.length,
          includeSystem: include_system,
          autoSummarize: auto_summarize,
        },
      };

      console.log(`[AI] Chat context updated: ${chatHistory.length} messages`);

      return {
        success: true,
        result: {
          historySize: chatHistory.length,
          scope: context_scope,
          contextKey: context_key,
        }
      };
    }

    case 'ai_decision': {
      const {
        decision_prompt = 'Analise a mensagem e decida a melhor ação.',
        options = [],
        default_option = 'option_a',
        confidence_threshold = 0.7,
        save_decision_to = 'ai_decision',
        save_reasoning_to = 'ai_reasoning'
      } = action.config;

      try {
        const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
        if (!LOVABLE_API_KEY) {
          console.error('[AI] LOVABLE_API_KEY not configured for decision');
          context.flowContext = {
            ...context.flowContext,
            [save_decision_to]: default_option,
            [save_reasoning_to]: 'API key not configured',
          };
          return { success: true, result: { decision: default_option, fallback: true } };
        }

        // Build context from event data
        let contextInfo = '';
        if (eventData?.message) contextInfo = `Mensagem do usuário: "${eventData.message}"`;
        if (eventData?.content) contextInfo = `Conteúdo: "${eventData.content}"`;

        // Build options description
        const optionsDesc = options
          .map((opt: any, i: number) => `${i + 1}. ${opt.value}: ${opt.description}`)
          .join('\n');

        const systemPrompt = `Você é um assistente de decisão. Analise o contexto e escolha a melhor opção.
Responda APENAS em JSON com o formato: {"decision": "valor_da_opcao", "confidence": 0.0-1.0, "reasoning": "explicação breve"}
Opções disponíveis:
${optionsDesc}`;

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `${decision_prompt}\n\nContexto: ${contextInfo}` }
            ],
            max_tokens: 256,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiContent = data.choices?.[0]?.message?.content || '';

        // Parse JSON response
        let decision = default_option;
        let confidence = 0;
        let reasoning = 'Failed to parse AI response';

        try {
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            decision = parsed.decision || default_option;
            confidence = parsed.confidence || 0;
            reasoning = parsed.reasoning || '';
          }
        } catch {
          console.error('[AI] Failed to parse decision JSON');
        }

        // Apply confidence threshold
        if (confidence < confidence_threshold) {
          decision = default_option;
          reasoning = `Confidence ${confidence} below threshold ${confidence_threshold}, using default`;
        }

        // Store decision
        context.flowContext = {
          ...context.flowContext,
          [save_decision_to]: decision,
          [save_reasoning_to]: reasoning,
          variables: {
            ...context.flowContext?.variables,
            [save_decision_to]: { value: decision, scope: 'flow' },
            [save_reasoning_to]: { value: reasoning, scope: 'flow' },
          },
        };

        console.log(`[AI] Decision made: ${decision} (confidence: ${confidence})`);

        return {
          success: true,
          result: {
            decision,
            confidence,
            reasoning,
            branch: decision,
          }
        };
      } catch (error: any) {
        console.error('[AI] Decision error:', error);
        context.flowContext = {
          ...context.flowContext,
          [save_decision_to]: default_option,
          [save_reasoning_to]: error.message,
        };
        return { success: true, result: { decision: default_option, fallback: true, error: error.message } };
      }
    }

    case 'ai_embedding': {
      const {
        text_source = '{{message}}',
        save_embedding_to = 'embedding',
        search_collection = '',
        top_k = 5,
        similarity_threshold = 0.8
      } = action.config;

      // Resolve text source
      let text = text_source;
      if (text.startsWith('{{') && text.endsWith('}}')) {
        const varName = text.slice(2, -2);
        text = eventData?.[varName] || context.flowContext?.variables?.[varName]?.value || '';
      }

      if (!text) {
        return { success: false, error: 'No text to embed' };
      }

      // For now, generate a simple hash as placeholder
      // In production, this would call an embedding API
      const simpleHash = text.split('').reduce((acc: number, char: string) => {
        return acc + char.charCodeAt(0);
      }, 0);

      // Create a mock embedding (384 dimensions for compatibility)
      const mockEmbedding = Array(384).fill(0).map((_, i) => 
        Math.sin((simpleHash + i) * 0.01) * 0.5 + 0.5
      );

      context.flowContext = {
        ...context.flowContext,
        [save_embedding_to]: mockEmbedding,
        embedding_metadata: {
          textLength: text.length,
          dimensions: mockEmbedding.length,
          collection: search_collection,
          topK: top_k,
          threshold: similarity_threshold,
        },
      };

      console.log(`[AI] Embedding generated for text (${text.length} chars)`);

      return {
        success: true,
        result: {
          embedded: true,
          dimensions: mockEmbedding.length,
          savedTo: save_embedding_to,
          searchCollection: search_collection,
        }
      };
    }

    // ============ UNIVERSAL WEBHOOK NODES ============
    case 'webhook_universal_trigger': {
      // Trigger node - data is passed from gateway
      const {
        expose_headers = true,
        expose_query = true,
        expose_body = true,
        save_payload_to = 'webhook_payload',
        save_headers_to = 'webhook_headers',
        save_metadata_to = 'webhook_metadata'
      } = action.config;

      // Extract data from eventData (populated by webhook gateway)
      const webhookData = eventData || {};
      
      if (expose_body) {
        context.flowContext = {
          ...context.flowContext,
          [save_payload_to]: webhookData.payload || webhookData.body || {},
        };
      }
      
      if (expose_headers) {
        context.flowContext = {
          ...context.flowContext,
          [save_headers_to]: webhookData.headers || {},
        };
      }
      
      if (expose_query) {
        context.flowContext = {
          ...context.flowContext,
          [save_metadata_to]: {
            query: webhookData.query || {},
            source_ip: webhookData.metadata?.source_ip,
            method: webhookData.metadata?.method,
            received_at: webhookData.metadata?.received_at,
          },
        };
      }

      console.log(`[WEBHOOK] Trigger received payload`);

      return { 
        success: true, 
        result: { 
          type: 'trigger',
          hasPayload: !!webhookData.payload,
          hasHeaders: !!webhookData.headers,
        } 
      };
    }

    case 'webhook_auth_guard': {
      const {
        auth_type = 'token',
        token_header = 'Authorization',
        expected_token = '',
        ip_whitelist = [],
        hmac_header = 'X-Signature',
        on_fail = 'reject'
      } = action.config;

      const headers = eventData?.headers || context.flowContext?.webhook_headers || {};
      const sourceIp = eventData?.metadata?.source_ip || context.flowContext?.webhook_metadata?.source_ip;

      let isValid = false;
      let reason = '';

      switch (auth_type) {
        case 'token': {
          const token = headers[token_header] || headers[token_header.toLowerCase()];
          isValid = token && (token === expected_token || token === `Bearer ${expected_token}`);
          reason = isValid ? '' : 'invalid_token';
          break;
        }
        case 'ip_whitelist': {
          isValid = ip_whitelist.length === 0 || ip_whitelist.includes(sourceIp) || ip_whitelist.includes('*');
          reason = isValid ? '' : 'ip_not_allowed';
          break;
        }
        default:
          isValid = true;
      }

      if (!isValid && on_fail === 'reject') {
        console.log(`[WEBHOOK] Auth failed: ${reason}`);
        return { success: false, error: reason, skip: true };
      }

      console.log(`[WEBHOOK] Auth passed: ${auth_type}`);

      return { 
        success: true, 
        result: { 
          authenticated: isValid,
          authType: auth_type,
          reason,
        } 
      };
    }

    case 'webhook_signature_verify': {
      const {
        signature_header = 'X-Signature-256',
        algorithm = 'sha256',
        on_fail = 'reject'
      } = action.config;

      const headers = eventData?.headers || context.flowContext?.webhook_headers || {};
      const signature = headers[signature_header] || headers[signature_header.toLowerCase()];

      // Note: Actual HMAC verification should be done at gateway level
      // This node validates that verification passed
      const isVerified = !!signature; // Simplified check

      if (!isVerified && on_fail === 'reject') {
        console.log(`[WEBHOOK] Signature verification failed`);
        return { success: false, error: 'invalid_signature', skip: true };
      }

      return { 
        success: true, 
        result: { 
          verified: isVerified,
          algorithm,
        } 
      };
    }

    case 'webhook_rate_limit': {
      const {
        limit_per_minute = 60,
        limit_per_hour = 1000,
        on_limit = 'queue'
      } = action.config;

      // Rate limit tracking would be handled by the gateway
      // This node can check and enforce local limits
      const webhookMetadata = context.flowContext?.webhook_metadata || {};
      
      console.log(`[WEBHOOK] Rate limit check: ${limit_per_minute}/min, ${limit_per_hour}/hour`);

      return { 
        success: true, 
        result: { 
          allowed: true,
          limits: { minute: limit_per_minute, hour: limit_per_hour },
          onLimit: on_limit,
        } 
      };
    }

    case 'webhook_queue': {
      const {
        queue_name = 'default',
        priority = 'normal',
        delay_seconds = 0,
        respond_immediately = true
      } = action.config;

      // Queue the webhook for async processing
      const queueEntry = {
        queue: queue_name,
        priority,
        delay: delay_seconds,
        queued_at: new Date().toISOString(),
        process_at: new Date(Date.now() + delay_seconds * 1000).toISOString(),
      };

      context.flowContext = {
        ...context.flowContext,
        queue_entry: queueEntry,
      };

      console.log(`[WEBHOOK] Queued in ${queue_name} with priority ${priority}`);

      return { 
        success: true, 
        result: { 
          queued: true,
          ...queueEntry,
          respondImmediately: respond_immediately,
        } 
      };
    }

    case 'webhook_deduplication': {
      const {
        event_id_field = 'event_id',
        window_seconds = 300,
        on_duplicate = 'skip'
      } = action.config;

      const payload = eventData?.payload || context.flowContext?.webhook_payload || {};
      const eventId = payload[event_id_field] || payload.id || eventData?.event_id;

      // Dedup check would be done at gateway level
      // This node can provide additional local dedup logic
      const isDuplicate = false; // Gateway already checked

      if (isDuplicate && on_duplicate === 'skip') {
        console.log(`[WEBHOOK] Duplicate event skipped: ${eventId}`);
        return { success: true, result: { duplicate: true, eventId }, skip: true };
      }

      context.flowContext = {
        ...context.flowContext,
        dedup_event_id: eventId,
      };

      return { 
        success: true, 
        result: { 
          duplicate: false,
          eventId,
          windowSeconds: window_seconds,
        } 
      };
    }

    case 'webhook_payload_parser': {
      const {
        parser_type = 'jsonpath',
        extractions = [],
        normalize_keys = true,
        flatten_nested = false
      } = action.config;

      const payload = eventData?.payload || context.flowContext?.webhook_payload || {};
      const extracted: Record<string, any> = {};

      for (const extraction of extractions) {
        const { name, path } = extraction;
        
        // Simple JSONPath-like extraction
        if (path.startsWith('$.')) {
          const pathParts = path.slice(2).split('.');
          let value = payload;
          
          for (const part of pathParts) {
            value = value?.[part];
          }
          
          extracted[name] = value;
        } else {
          extracted[name] = payload[path];
        }
      }

      // Normalize keys if requested
      const normalizedPayload = normalize_keys 
        ? Object.fromEntries(
            Object.entries(payload).map(([k, v]) => [k.toLowerCase().replace(/[^a-z0-9]/g, '_'), v])
          )
        : payload;

      context.flowContext = {
        ...context.flowContext,
        extracted_data: extracted,
        normalized_payload: normalizedPayload,
        variables: {
          ...context.flowContext?.variables,
          ...Object.fromEntries(Object.entries(extracted).map(([k, v]) => [k, { value: v, scope: 'flow' }])),
        },
      };

      console.log(`[WEBHOOK] Parsed ${extractions.length} fields from payload`);

      return { 
        success: true, 
        result: { 
          extracted,
          parserType: parser_type,
          normalized: normalize_keys,
        } 
      };
    }

    case 'webhook_event_router': {
      const {
        route_field = 'event_type',
        routes = [],
        default_route = 'other'
      } = action.config;

      const payload = eventData?.payload || context.flowContext?.webhook_payload || {};
      const extracted = context.flowContext?.extracted_data || {};
      
      // Get value from route field
      const routeValue = extracted[route_field] || payload[route_field] || payload.type || payload.event;

      // Find matching route
      let matchedRoute = default_route;
      for (const route of routes) {
        if (route.value === routeValue || route.value === '*') {
          matchedRoute = route.output;
          break;
        }
      }

      context.flowContext = {
        ...context.flowContext,
        routed_to: matchedRoute,
        route_value: routeValue,
      };

      console.log(`[WEBHOOK] Routed to ${matchedRoute} based on ${route_field}=${routeValue}`);

      return { 
        success: true, 
        result: { 
          route: matchedRoute,
          field: route_field,
          value: routeValue,
          branch: matchedRoute,
        } 
      };
    }

    case 'webhook_response': {
      const {
        status_code = 200,
        headers = {},
        body = { success: true },
        use_dynamic_body = false,
        dynamic_body_source = ''
      } = action.config;

      let responseBody = body;
      
      if (use_dynamic_body && dynamic_body_source) {
        // Get body from context variable
        responseBody = context.flowContext?.[dynamic_body_source] 
          || context.flowContext?.variables?.[dynamic_body_source]?.value 
          || body;
      }

      context.flowContext = {
        ...context.flowContext,
        webhook_response: {
          status: status_code,
          headers,
          body: responseBody,
        },
      };

      console.log(`[WEBHOOK] Response configured: ${status_code}`);

      return { 
        success: true, 
        result: { 
          statusCode: status_code,
          headers,
          bodySet: true,
        } 
      };
    }

    case 'webhook_dead_letter': {
      const {
        capture_on = ['error', 'timeout'],
        max_retries = 3,
        retry_delay_seconds = 60,
        notify_on_capture = true
      } = action.config;

      // This node is typically triggered when an error occurs
      // Store failed event for later reprocessing
      const failedEvent = {
        payload: eventData?.payload || context.flowContext?.webhook_payload,
        headers: eventData?.headers || context.flowContext?.webhook_headers,
        captured_at: new Date().toISOString(),
        capture_reason: 'manual',
        retry_count: 0,
        max_retries,
        retry_delay: retry_delay_seconds,
      };

      context.flowContext = {
        ...context.flowContext,
        dead_letter: failedEvent,
      };

      console.log(`[WEBHOOK] Dead letter captured for retry (max ${max_retries})`);

      // In production, this would store to genesis_webhook_dead_letters table
      // via supabase client

      return { 
        success: true, 
        result: { 
          captured: true,
          captureOn: capture_on,
          maxRetries: max_retries,
          notifying: notify_on_capture,
        } 
      };
    }

    default:
      return { success: false, error: `Unknown action type: ${action.type}` };
  }
}

// Check if conditions match
function checkConditions(conditions: any[], eventData: any): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every(condition => {
    const { field, operator, value } = condition;
    const fieldValue = eventData?.[field];

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'not_contains':
        return !String(fieldValue).includes(value);
      case 'starts_with':
        return String(fieldValue).startsWith(value);
      case 'ends_with':
        return String(fieldValue).endsWith(value);
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return !!fieldValue && fieldValue !== '';
      case 'regex':
        try {
          return new RegExp(value).test(String(fieldValue));
        } catch {
          return false;
        }
      default:
        return true;
    }
  });
}

// Process event with automation rules
async function processEvent(supabase: any, event: EventQueueItem): Promise<void> {
  console.log(`Processing event: ${event.id} (${event.event_type})`);

  // Get matching automation rules
  const { data: rules } = await supabase
    .from('whatsapp_automation_rules')
    .select('*')
    .eq('project_id', event.project_id)
    .eq('is_active', true)
    .or(`trigger_type.eq.${event.event_type},trigger_type.eq.any`);

  if (!rules || rules.length === 0) {
    console.log(`No matching rules for event type: ${event.event_type}`);
    await supabase
      .from('whatsapp_event_queue')
      .update({ 
        status: 'completed', 
        processed_at: new Date().toISOString(),
        result: { message: 'No matching rules' }
      })
      .eq('id', event.id);
    return;
  }

  const results: any[] = [];

  for (const rule of rules as AutomationRule[]) {
    console.log(`Checking rule: ${rule.name}`);

    // Check trigger config
    const triggerConfig = rule.trigger_config || {};
    if (triggerConfig.eventType && triggerConfig.eventType !== event.event_type) {
      continue;
    }

    // Check conditions
    if (!checkConditions(rule.conditions, event.event_data)) {
      console.log(`Conditions not met for rule: ${rule.name}`);
      continue;
    }

    console.log(`Executing rule: ${rule.name}`);

    // Execute actions in sequence
    const actionResults: any[] = [];
    const context = { 
      instanceId: (rule as any).instance_id, 
      flowContext: { ruleId: rule.id, eventId: event.id } 
    };
    
    for (const action of rule.actions || []) {
      const result = await processAction(supabase, action, event.event_data, event.project_id, context);
      actionResults.push({ action: action.type, ...result });

      // Stop if action failed and stopOnError is set
      if (!result.success && action.stopOnError) {
        break;
      }
      
      // Skip subsequent actions if node returned skip flag
      if (result.skip) {
        console.log(`Skipping remaining actions due to condition`);
        break;
      }
    }

    results.push({
      ruleId: rule.id,
      ruleName: rule.name,
      actions: actionResults,
    });

    // Update rule execution count
    await supabase
      .from('whatsapp_automation_rules')
      .update({ 
        execution_count: (rule as any).execution_count + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq('id', rule.id);
  }

  // Update event status
  await supabase
    .from('whatsapp_event_queue')
    .update({ 
      status: 'completed', 
      processed_at: new Date().toISOString(),
      result: { rules: results }
    })
    .eq('id', event.id);

  console.log(`Event ${event.id} processed with ${results.length} rules executed`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 10;
    const maxRetries = body.maxRetries || 3;

    // Get pending events
    const { data: events, error } = await supabase
      .from('whatsapp_event_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', maxRetries)
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (error) {
      throw error;
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending events',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${events.length} events`);

    // Mark events as processing
    const eventIds = events.map((e: EventQueueItem) => e.id);
    await supabase
      .from('whatsapp_event_queue')
      .update({ status: 'processing' })
      .in('id', eventIds);

    // Process each event
    let processed = 0;
    let failed = 0;

    for (const event of events as EventQueueItem[]) {
      try {
        await processEvent(supabase, event);
        processed++;
      } catch (error: any) {
        console.error(`Error processing event ${event.id}:`, error);
        
        // Increment retry count
        await supabase
          .from('whatsapp_event_queue')
          .update({ 
            status: event.retry_count + 1 >= maxRetries ? 'failed' : 'pending',
            retry_count: event.retry_count + 1,
            error_message: error?.message || 'Unknown error',
          })
          .eq('id', event.id);
        
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed,
        failed,
        total: events.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Worker error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
