import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface ButtonClickPayload {
  phone: string;
  button_id: string;
  template_id?: string;
  context?: Record<string, unknown>;
  instance_id?: string;
}

interface ConversationState {
  id: string;
  phone: string;
  current_state: string;
  context: Record<string, unknown>;
  last_template_id: string | null;
  last_action: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: ButtonClickPayload = await req.json();
    const { phone, button_id, template_id, context, instance_id } = payload;

    if (!phone || !button_id) {
      return new Response(
        JSON.stringify({ error: 'phone and button_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Webhook] Button click received: ${button_id} from ${phone}`);

    // 1. Log the button click
    const { data: clickLog, error: clickError } = await supabase
      .from('whatsapp_button_clicks')
      .insert({
        phone,
        button_id,
        template_id,
        context: context || {},
        instance_id,
      })
      .select()
      .single();

    if (clickError) {
      console.error('[Webhook] Error logging click:', clickError);
    }

    // 2. Get or create conversation state
    let { data: conversationState, error: stateError } = await supabase
      .from('whatsapp_conversation_states')
      .select('*')
      .eq('phone', phone)
      .single();

    if (stateError && stateError.code === 'PGRST116') {
      // No state found, create one
      const { data: newState, error: createError } = await supabase
        .from('whatsapp_conversation_states')
        .insert({
          phone,
          current_state: 'initial',
          context: {},
          instance_id,
        })
        .select()
        .single();

      if (createError) {
        console.error('[Webhook] Error creating state:', createError);
      } else {
        conversationState = newState;
      }
    }

    // 3. Find the button action
    const { data: buttonAction, error: actionError } = await supabase
      .from('whatsapp_button_actions')
      .select('*')
      .eq('button_id', button_id)
      .eq('is_active', true)
      .single();

    if (actionError) {
      console.log('[Webhook] No action found for button:', button_id);
    }

    let nextTemplateId: string | null = null;
    let actionExecuted: string | null = null;
    let newState: string = conversationState?.current_state || 'initial';
    let actionResult: Record<string, unknown> = {};

    if (buttonAction) {
      actionExecuted = buttonAction.action_type;
      
      // Execute action based on type
      switch (buttonAction.action_type) {
        case 'send_template':
          nextTemplateId = buttonAction.next_template_id;
          break;
        
        case 'update_state':
          newState = buttonAction.action_payload?.new_state || newState;
          break;
        
        case 'create_order':
          actionResult = { order_created: true, order_id: crypto.randomUUID() };
          newState = 'checkout';
          nextTemplateId = buttonAction.next_template_id;
          break;
        
        case 'confirm_order':
          actionResult = { order_confirmed: true };
          newState = 'awaiting_payment';
          nextTemplateId = buttonAction.next_template_id;
          break;
        
        case 'send_payment':
          actionResult = { payment_link_sent: true };
          newState = 'awaiting_payment';
          nextTemplateId = buttonAction.next_template_id;
          break;
        
        case 'confirm_payment':
          actionResult = { payment_confirmed: true };
          newState = 'payment_confirmed';
          nextTemplateId = buttonAction.next_template_id;
          break;
        
        case 'transfer_to_human':
          actionResult = { transferred: true };
          newState = 'human_support';
          break;
        
        case 'update_crm':
          // Trigger CRM update
          actionResult = { crm_updated: true };
          break;
        
        case 'send_followup':
          nextTemplateId = buttonAction.next_template_id;
          break;
        
        case 'custom':
          // Custom action - just log and update state
          actionResult = buttonAction.action_payload || {};
          if (buttonAction.action_payload?.new_state) {
            newState = buttonAction.action_payload.new_state;
          }
          break;
        
        default:
          console.log('[Webhook] Unknown action type:', buttonAction.action_type);
      }
    }

    // 4. Update conversation state
    if (conversationState) {
      const updatedContext = {
        ...conversationState.context,
        ...context,
        ...actionResult,
        last_button_clicked: button_id,
        last_click_at: new Date().toISOString(),
      };

      await supabase
        .from('whatsapp_conversation_states')
        .update({
          current_state: newState,
          context: updatedContext,
          last_template_id: template_id || conversationState.last_template_id,
          last_action: actionExecuted,
        })
        .eq('id', conversationState.id);
    }

    // 5. Get next template if needed
    let nextTemplate = null;
    if (nextTemplateId) {
      const { data: template } = await supabase
        .from('whatsapp_interactive_templates')
        .select('*')
        .eq('id', nextTemplateId)
        .eq('is_active', true)
        .single();
      
      nextTemplate = template;
    }

    // 6. Build response
    const response = {
      success: true,
      click_id: clickLog?.id,
      action_executed: actionExecuted,
      new_state: newState,
      next_template: nextTemplate ? {
        id: nextTemplate.id,
        name: nextTemplate.name,
        type: nextTemplate.template_type,
        content: nextTemplate.content,
        buttons: nextTemplate.buttons,
        list_sections: nextTemplate.list_sections,
      } : null,
      action_result: actionResult,
      conversation_context: conversationState?.context || {},
    };

    console.log('[Webhook] Response:', JSON.stringify(response));

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Webhook] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
