import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * CAKTO EVENT SIMULATOR
 * 
 * Simulates Cakto events without sending actual messages.
 * Returns what campaign would be triggered and preview of message.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { instanceId, integrationId, eventType, customer, product, orderValue } = await req.json();

    if (!instanceId || !eventType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CaktoSimulator] Simulating ${eventType} for instance ${instanceId}`);

    // Find matching rule
    const { data: rules } = await supabase
      .from('genesis_cakto_event_rules')
      .select('*, campaign:genesis_campaigns(*)')
      .eq('instance_id', instanceId)
      .eq('event_type', eventType)
      .eq('is_active', true);

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          campaign_name: 'Nenhuma regra configurada',
          preview_message: 'Configure uma regra para este evento no painel de Regras.',
          would_send: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rule = rules[0];
    const campaign = rule.campaign;

    if (!campaign) {
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          campaign_name: 'Campanha não encontrada',
          preview_message: 'A campanha configurada não existe mais.',
          would_send: false,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get campaign first message for preview
    const { data: messages } = await supabase
      .from('genesis_campaign_messages')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('order_index', { ascending: true })
      .limit(1);

    let previewMessage = 'Mensagem não configurada';
    if (messages && messages.length > 0) {
      previewMessage = messages[0].content || 'Mensagem vazia';
      
      // Replace variables
      previewMessage = previewMessage
        .replace(/\{nome\}/gi, customer?.name || 'Cliente')
        .replace(/\{name\}/gi, customer?.name || 'Cliente')
        .replace(/\{produto\}/gi, product?.name || 'Produto')
        .replace(/\{product\}/gi, product?.name || 'Produto')
        .replace(/\{valor\}/gi, `R$ ${orderValue?.toFixed(2) || '0,00'}`)
        .replace(/\{value\}/gi, `R$ ${orderValue?.toFixed(2) || '0,00'}`);
    }

    // Calculate delay info
    const delayMin = rule.delay_seconds || 0;
    const delayMax = rule.delay_max_seconds || delayMin;
    const delayInfo = delayMax > delayMin 
      ? `${delayMin}-${delayMax}s` 
      : delayMin > 0 ? `${delayMin}s` : 'imediato';

    return new Response(
      JSON.stringify({
        success: true,
        simulated: true,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        preview_message: previewMessage,
        delay: delayInfo,
        anti_ban: rule.anti_ban_enabled,
        would_send: !!customer?.phone,
        customer_phone: customer?.phone || 'Não informado',
        event_type: eventType,
        credits_estimate: 0,
        note: '⚠️ Nenhuma mensagem foi enviada. Nenhum crédito foi consumido.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CaktoSimulator] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
