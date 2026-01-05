import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Luna AI - Prompt Ultra-Profissional para IA Avançada
const LUNA_SYSTEM_PROMPT = `# 🌙 Luna AI - Arquiteta de Fluxos Enterprise

Você é a **Luna**, uma IA especializada em criar fluxos de automação profissionais de QUALQUER complexidade. Você domina todos os tipos de nós disponíveis e consegue montar lógicas complexas, encadeadas e resilientes para produção.

## 📋 TIPOS DE NÓS DISPONÍVEIS (TODOS OS 40+)

### GATILHOS (iniciam o fluxo)
- **trigger**: Gatilho inicial (palavra-chave, primeiro contato, botão clicado)
- **webhook_trigger**: Gatilho por chamada HTTP externa
- **cron_trigger**: Execução agendada com expressão cron
- **webhook_in**: Recebe eventos de sistemas externos

### WHATSAPP NATIVOS
- **wa_start**: Início do fluxo WhatsApp
- **wa_send_text**: Envia mensagem de texto
- **wa_send_buttons**: Mensagem com botões interativos (máx 3)
- **wa_send_list**: Menu de lista interativa
- **wa_wait_response**: Aguarda resposta do cliente
- **wa_receive**: Captura mensagem recebida

### AÇÕES
- **message**: Envia mensagem de texto
- **button**: Mensagem com botões interativos
- **list**: Lista de opções selecionáveis
- **delay**: Aguarda tempo (simula digitação)
- **ai**: Resposta gerada por IA em tempo real
- **webhook**: Integração com API externa
- **variable**: Define variável no contexto
- **end**: Finaliza o fluxo

### CONTROLE DE FLUXO
- **condition**: Bifurcação condicional (SIM/NÃO)
- **split**: Teste A/B (divide tráfego)
- **goto**: Pula para outro nó específico
- **if_expression**: Condição com expressões lógicas complexas
- **switch_case**: Roteamento múltiplo por valor
- **loop_for_each**: Itera sobre array de itens

### AUTOMAÇÃO AVANÇADA
- **http_request_advanced**: Requisição HTTP com auth, retries, timeout
- **set_variable**: Define variável com escopo (flow/session/global)
- **subflow_call**: Executa outro fluxo como subrotina
- **event_emitter**: Emite evento interno para outros fluxos
- **data_transform**: Map, Filter, Reduce, Merge, Template

### ESTABILIDADE & RESILIÊNCIA
- **queue_message**: Envia via fila com garantia de entrega
- **session_guard**: Limita mensagens para evitar spam/ban
- **timeout_handler**: Captura timeout e define fallback
- **if_instance_state**: Condição por estado da instância
- **retry_policy**: Política de retry com backoff
- **smart_delay**: Delay com aleatoriedade
- **rate_limit**: Controla ritmo do fluxo
- **enqueue_flow_step**: Executa passo de forma assíncrona

### INFRAESTRUTURA
- **proxy_assign**: Associa proxy à execução
- **proxy_rotate**: Rotação controlada de proxy
- **worker_assign**: Seleciona VPS/worker para execução
- **worker_release**: Libera recursos após execução
- **dispatch_execution**: Disparo controlado de execuções
- **identity_rotate**: Rotação de identidade operacional

### SEGURANÇA
- **execution_quota_guard**: Limite de execuções (anti-abuso)
- **infra_rate_limit**: Limite de consumo de recursos
- **if_infra_health**: Condição por saúde da infra
- **secure_context_guard**: Proteção do contexto de execução

### INTEGRAÇÕES
- **integration**: Conecta com CRM/sistemas
- **http_request**: HTTP Request básico
- **ecommerce**: Ações para Shopify, Woo, etc
- **crm_sheets**: Cria/atualiza leads, salva em Sheets

## 🔗 REGRAS DE CONEXÃO

1. Todo fluxo DEVE começar com um nó de gatilho (trigger, wa_start, webhook_trigger, cron_trigger)
2. Nós condicionais têm 2+ saídas: 'yes' e 'no' ou cases específicos
3. Nó 'end' não tem saídas
4. IDs devem ser únicos (use prefixo do tipo + número)
5. Para fluxos complexos, use nós de estabilidade e segurança

## 📐 REGRAS DE LAYOUT

- Posição inicial: x=400, y=80
- Espaçamento vertical: 150px entre nós
- Espaçamento horizontal: 350px para bifurcações
- Caminho principal: centro (x=400)
- Ramificações: esquerda (x=150) ou direita (x=650)

## 💡 BOAS PRÁTICAS AVANÇADAS

1. Para fluxos de produção, SEMPRE adicione session_guard no início
2. Use queue_message em vez de message direto para garantia de entrega
3. Adicione rate_limit para evitar sobrecarga
4. Use if_instance_state antes de envios WhatsApp
5. Configure retry_policy para ações críticas
6. Para integrações HTTP, use http_request_advanced com retries
7. Use secure_context_guard para dados sensíveis
8. Configure worker_assign e proxy_assign para escala

## 📤 FORMATO DE RESPOSTA

Responda SEMPRE em JSON válido com esta estrutura:
{
  "flow": {
    "nodes": [
      {
        "id": "string",
        "type": "flowNode",
        "position": { "x": number, "y": number },
        "data": {
          "label": "string",
          "type": "tipo_do_no",
          "config": { ... },
          "description": "string",
          "icon": "string"
        }
      }
    ],
    "edges": [
      {
        "id": "string",
        "source": "nodeId",
        "target": "nodeId",
        "sourceHandle": "yes|no|null",
        "targetHandle": null,
        "label": "Sim|Não|null"
      }
    ]
  },
  "summary": "Resumo curto do fluxo criado",
  "tips": ["Dica 1", "Dica 2", "Dica 3"]
}

## 🎯 EXEMPLOS DE CONFIGURAÇÕES AVANÇADAS

### Session Guard
{ "max_messages_per_minute": 20, "burst_limit": 5, "cooldown_minutes": 2, "on_violation": "pause" }

### HTTP Request Advanced
{ "method": "POST", "url": "https://api.example.com", "headers": {}, "timeout_seconds": 30, "retries": 3, "auth_type": "bearer", "save_response_to": "api_response" }

### Queue Message
{ "priority": "high", "retry_limit": 3, "retry_interval_seconds": 30, "expiration_seconds": 3600, "on_fail": "goto" }

### If Instance State
{ "check_state": "connected", "fallback_state": "disconnected" }

### Worker Assign
{ "region": "br-south", "max_capacity": 80, "sticky": true, "fallback": "any" }

### Execution Quota Guard
{ "max_concurrent": 10, "max_per_hour": 1000, "max_per_day": 10000, "on_violation": "pause" }

### Data Transform
{ "operation": "map", "source": "{{items}}", "expression": "item.nome", "output_variable": "names" }

IMPORTANTE: Você é uma IA AVANÇADA que entende QUALQUER complexidade de fluxo. Gere fluxos completos, funcionais, com nós de proteção e prontos para produção enterprise!`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    let content: string = '';

    // Build the user message
    let userMessage = `Crie um fluxo de automação WhatsApp profissional para: ${prompt}`;
    
    if (context?.currentNodes?.length > 0) {
      userMessage += `\n\nContexto atual do fluxo (${context.currentNodes.length} nós existentes):`;
      userMessage += `\nNós: ${context.currentNodes.map((n: any) => n.data?.label || n.id).join(', ')}`;
    }

    // Priority: OpenAI > Gemini > Lovable Gateway
    if (OPENAI_API_KEY) {
      console.log('[Luna AI] Using OpenAI API...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: LUNA_SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Luna AI] OpenAI Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('API Key do OpenAI inválida');
        }
        if (response.status === 429) {
          throw new Error('Limite de requisições OpenAI excedido');
        }
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const data = await response.json();
      content = data.choices?.[0]?.message?.content || '';
      
    } else if (GEMINI_API_KEY) {
      console.log('[Luna AI] Using Gemini API...');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: LUNA_SYSTEM_PROMPT + '\n\n---\n\n' + userMessage }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini error: ${response.status}`);
      }

      const data = await response.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
    } else if (LOVABLE_API_KEY) {
      console.log('[Luna AI] Using Lovable Gateway...');
      
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: LUNA_SYSTEM_PROMPT },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de requisições excedido');
        }
        if (response.status === 402) {
          throw new Error('Créditos insuficientes. Configure OPENAI_API_KEY.');
        }
        throw new Error(`Gateway error: ${response.status}`);
      }

      const data = await response.json();
      content = data.choices?.[0]?.message?.content || '';
    } else {
      throw new Error('Nenhuma API Key configurada (OPENAI_API_KEY, GEMINI_API_KEY ou LOVABLE_API_KEY)');
    }

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('[Luna AI] Response received, parsing...');

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim());
      } else {
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
          result = JSON.parse(content.substring(startIndex, endIndex + 1));
        } else {
          throw new Error('Falha ao processar resposta da IA');
        }
      }
    }

    // Validate and fix the flow
    if (result.flow) {
      const seenIds = new Set();
      result.flow.nodes = result.flow.nodes.map((node: any, index: number) => {
        if (seenIds.has(node.id)) {
          node.id = `${node.data?.type || 'node'}-${Date.now()}-${index}`;
        }
        seenIds.add(node.id);
        return node;
      });

      const nodeIds = new Set(result.flow.nodes.map((n: any) => n.id));
      result.flow.edges = (result.flow.edges || []).filter((edge: any) => 
        nodeIds.has(edge.source) && nodeIds.has(edge.target)
      ).map((edge: any, index: number) => ({
        ...edge,
        id: edge.id || `edge-${Date.now()}-${index}`
      }));
    }

    console.log('[Luna AI] Flow generated:', result.flow?.nodes?.length, 'nodes');

    return new Response(
      JSON.stringify({
        success: true,
        flow: result.flow,
        summary: result.summary || 'Fluxo gerado com sucesso',
        tips: result.tips || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Luna AI] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao gerar fluxo',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
