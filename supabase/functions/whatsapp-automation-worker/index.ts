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

// Process a single action
async function processAction(
  supabase: any,
  action: any,
  eventData: any,
  projectId: string
): Promise<{ success: boolean; result?: any; error?: string }> {
  console.log(`Processing action: ${action.type}`, action);

  switch (action.type) {
    case 'send_message': {
      const { instanceId, to, message, messageType = 'text' } = action.config;
      
      // Replace variables in message
      let finalMessage = message;
      if (eventData) {
        Object.keys(eventData).forEach(key => {
          finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), eventData[key] || '');
        });
      }

      // Get instance and backend config
      const { data: instance } = await supabase
        .from('whatsapp_instances')
        .select('*, whatsapp_backend_config(*)')
        .eq('id', instanceId)
        .single();

      if (!instance) {
        return { success: false, error: 'Instance not found' };
      }

      const backend = instance.whatsapp_backend_config?.[0];
      if (!backend || !backend.is_connected) {
        return { success: false, error: 'Backend not connected' };
      }

      try {
        const response = await fetch(`${backend.backend_url}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${backend.backend_token}`,
            'X-Instance-Token': instance.instance_token,
          },
          body: JSON.stringify({
            to: (to || eventData?.from || '').replace(/\D/g, ''),
            message: finalMessage,
            type: messageType,
          }),
        });

        const result = await response.json();
        
        await supabase.from('whatsapp_message_logs').insert({
          instance_id: instanceId,
          recipient: to || eventData?.from,
          message_type: messageType,
          content: finalMessage,
          status: response.ok ? 'sent' : 'failed',
          external_id: result.messageId,
          metadata: { automation: true, projectId },
        });

        return { success: response.ok, result };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Unknown error' };
      }
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
    for (const action of rule.actions || []) {
      const result = await processAction(supabase, action, event.event_data, event.project_id);
      actionResults.push({ action: action.type, ...result });

      // Stop if action failed and stopOnError is set
      if (!result.success && action.stopOnError) {
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
