import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Native VPS configuration (GenesisPro backend)
const NATIVE_VPS_URL = 'http://72.62.108.24:3000';
const NATIVE_VPS_TOKEN = 'genesis-master-token-2024-secure';

interface GenesisProRequest {
  phone: string;
  message: string;
  event_type?: string;
  appointment_id?: string;
  client_name?: string;
  service_name?: string;
  barber_name?: string;
  date?: string;
  time?: string;
  queue_position?: number;
  user_email?: string; // Used to auto-detect Genesis instance
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: GenesisProRequest = await req.json();
    console.log('[GenesisPro] Send request:', payload);

    // First, try to find Genesis instance by user email
    let genesisInstance = null;
    
    if (payload.user_email) {
      // Find user in genesis_users by email
      const { data: genesisUser } = await supabase
        .from('genesis_users')
        .select('id')
        .eq('email', payload.user_email)
        .maybeSingle();

      if (genesisUser) {
        // Find connected instance for this user
        const { data: instance } = await supabase
          .from('genesis_instances')
          .select('*')
          .eq('user_id', genesisUser.id)
          .eq('status', 'connected')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (instance) {
          genesisInstance = instance;
          console.log('[GenesisPro] Found Genesis instance:', instance.id);
        }
      }
    }

    // Fallback to chatpro_config if no Genesis instance found
    if (!genesisInstance) {
      const { data: config } = await supabase
        .from('chatpro_config')
        .select('*')
        .limit(1)
        .single();

      if (config?.is_enabled && config?.instance_id) {
        // Check if this looks like a Genesis instance ID (UUID format)
        const isGenesisId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.instance_id);
        
        if (isGenesisId) {
          // Try to find this Genesis instance
          const { data: instance } = await supabase
            .from('genesis_instances')
            .select('*')
            .eq('id', config.instance_id)
            .eq('status', 'connected')
            .maybeSingle();

          if (instance) {
            genesisInstance = instance;
            console.log('[GenesisPro] Found Genesis instance from config:', instance.id);
          }
        } else if (config.base_endpoint?.includes('chatpro')) {
          // Legacy ChatPro - still support but warn
          console.log('[GenesisPro] Legacy ChatPro detected, using old API');
          return await sendViaChatPro(config, payload);
        }
      }
    }

    // Check if this event type should send
    if (payload.event_type) {
      const { data: templateData } = await supabase
        .from('message_templates')
        .select('chatpro_enabled')
        .eq('event_type', payload.event_type)
        .single();

      if (templateData && !templateData.chatpro_enabled) {
        console.log('[GenesisPro] Event disabled:', payload.event_type);
        return new Response(
          JSON.stringify({ success: false, error: 'Evento desabilitado para GenesisPro' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Format phone number (remove non-digits and ensure country code)
    let phone = payload.phone.replace(/\D/g, '');
    if (!phone.startsWith('55') && phone.length <= 11) {
      phone = '55' + phone;
    }

    // Send via Genesis VPS
    if (genesisInstance) {
      return await sendViaGenesis(genesisInstance, phone, payload.message);
    }

    // No instance found - try to use native VPS with any available instance
    console.log('[GenesisPro] No specific instance, searching for any connected...');
    
    const { data: anyInstance } = await supabase
      .from('genesis_instances')
      .select('*')
      .eq('status', 'connected')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (anyInstance) {
      return await sendViaGenesis(anyInstance, phone, payload.message);
    }

    // No connected instance at all
    console.error('[GenesisPro] No connected instance found');
    return new Response(
      JSON.stringify({ success: false, error: 'Nenhuma instância GenesisPro conectada. Acesse /genesis para conectar.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GenesisPro] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendViaGenesis(instance: any, phone: string, message: string) {
  const backendUrl = instance.backend_url || NATIVE_VPS_URL;
  const backendToken = instance.backend_token || NATIVE_VPS_TOKEN;
  
  const apiUrl = `${backendUrl}/${instance.id}/send-text`;
  console.log('[GenesisPro] Sending via Genesis:', { url: apiUrl, phone });

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${backendToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: phone,
      message: message,
    }),
  });

  const responseText = await response.text();
  console.log('[GenesisPro] Response:', response.status, responseText);

  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { raw: responseText };
  }

  if (!response.ok) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro Genesis: ${response.status}`,
        details: responseData 
      }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Mensagem enviada via GenesisPro',
      genesis_response: responseData 
    }),
    { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
  );
}

async function sendViaChatPro(config: any, payload: any) {
  let phone = payload.phone.replace(/\D/g, '');
  if (!phone.startsWith('55')) {
    phone = '55' + phone;
  }

  let baseUrl = config.base_endpoint.replace(/\/$/, '');
  if (baseUrl.includes(config.instance_id)) {
    baseUrl = `${baseUrl}/api/v1/send_message`;
  } else {
    baseUrl = `${baseUrl}/${config.instance_id}/api/v1/send_message`;
  }

  console.log('[GenesisPro] Fallback to ChatPro:', baseUrl);

  const chatproResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': config.api_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: phone,
      message: payload.message,
    }),
  });

  const responseText = await chatproResponse.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { raw: responseText };
  }

  if (!chatproResponse.ok) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro ChatPro: ${chatproResponse.status}`,
        details: responseData 
      }),
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Mensagem enviada via ChatPro (legacy)',
      chatpro_response: responseData 
    }),
    { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } }
  );
}
