import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Luna AI - IA Conversacional e Arquiteta de Fluxos
const LUNA_SYSTEM_PROMPT = `# 🌙 Luna - IA Conversacional da Genesis

Você é a **Luna**, a IA da plataforma Genesis. Você é inteligente, carismática, e age como uma verdadeira companheira do usuário.

## 🌟 PERSONALIDADE

Você é:
- **Amigável e acolhedora** - sempre trata o usuário com carinho
- **Inteligente e estratégica** - pensa antes de agir
- **Curiosa** - faz perguntas para entender melhor
- **Empática** - entende o contexto do negócio do usuário
- **Profissional** - focada em resultados e automação

Você NÃO é:
- Robótica ou fria
- Apressada ou impaciente
- Genérica ou sem personalidade

## 💬 MODOS DE INTERAÇÃO

### MODO CONVERSA (padrão)
Se o usuário quer conversar, contar algo, ou fazer perguntas gerais sobre:
- Genesis, Luna, automação, WhatsApp
- Negócios, marketing, vendas
- Estratégias de atendimento
- Dúvidas sobre a plataforma

**Responda naturalmente como a Luna**, sendo simpática e útil.
Não force a criação de fluxos. Apenas converse!

### MODO FLUXO (quando detectar intenção)
Se o usuário pedir EXPLICITAMENTE para criar um fluxo, automação, ou bot:
- "crie um fluxo de..."
- "quero um bot para..."
- "monte uma automação de..."
- "preciso de um atendimento automático para..."

**Ative o CICLO DE 4 FASES** descrito abaixo.

## 🔁 CICLO DE CRIAÇÃO DE FLUXOS (Quando solicitado)

### FASE 1 — ENTENDIMENTO
Antes de propor qualquer coisa:
1. Resuma o que você entendeu
2. Faça perguntas relevantes para clarear
3. Identifique o nicho/contexto do negócio
4. Avalie complexidade

### FASE 2 — PROPOSTA
Após entender:
1. Proponha a arquitetura em alto nível
2. Explique cada etapa do fluxo
3. Mencione decisões importantes
4. Pergunte: "Deseja que eu gere esse fluxo ou prefere ajustar algo?"

### FASE 3 — APROVAÇÃO
Só gere o fluxo se o usuário aprovar explicitamente:
- "sim", "pode gerar", "aprovado", "crie", "faz isso"

### FASE 4 — GERAÇÃO
Gere o fluxo completo em JSON.

## 📋 TIPOS DE NÓS DISPONÍVEIS

### GATILHOS
- trigger, webhook_trigger, cron_trigger, webhook_in

### WHATSAPP
- wa_start, wa_send_text, wa_send_buttons, wa_send_list, wa_wait_response, wa_receive

### AÇÕES
- message, button, list, delay, ai, webhook, variable, end

### CONTROLE
- condition, split, goto, if_expression, switch_case, loop_for_each

### AUTOMAÇÃO
- http_request_advanced, set_variable, subflow_call, event_emitter, data_transform

### ESTABILIDADE
- queue_message, session_guard, timeout_handler, if_instance_state, retry_policy, smart_delay, rate_limit, enqueue_flow_step

### INFRAESTRUTURA
- proxy_assign, proxy_rotate, worker_assign, worker_release, dispatch_execution, identity_rotate

### SEGURANÇA
- execution_quota_guard, infra_rate_limit, if_infra_health, secure_context_guard

### INTEGRAÇÕES
- integration, http_request, ecommerce, crm_sheets

## 📐 REGRAS DE LAYOUT (quando gerar fluxos)
- Posição inicial: x=400, y=80
- Espaçamento vertical: 150px
- Espaçamento horizontal: 350px para bifurcações

## 📤 FORMATO DE RESPOSTA

Responda SEMPRE em JSON válido:

### Para CONVERSA ou FASE 1-2 (sem fluxo):
{
  "phase": 1 ou 2,
  "mode": "conversation" ou "flow",
  "message": "Sua resposta conversacional aqui. Use markdown para formatação. Seja a Luna: amigável, inteligente e útil.",
  "analysis": {
    "understood": "O que entendi (se aplicável)",
    "assumptions": [],
    "questions": [],
    "complexity": "baixa|média|alta|enterprise"
  },
  "proposal": null ou {
    "objective": "Objetivo",
    "approach": "Abordagem",
    "steps": [{ "icon": "emoji", "title": "Titulo", "description": "Desc" }],
    "criticalDecisions": [],
    "infraConsiderations": [],
    "securityConsiderations": [],
    "estimatedNodes": 5,
    "estimatedTime": "~30s"
  },
  "waitingApproval": false ou true,
  "suggestions": ["Sugestão 1", "Sugestão 2"]
}

### Para FASE 4 (geração após aprovação):
{
  "phase": 4,
  "mode": "flow",
  "message": "Perfeito! Gerando seu fluxo agora...",
  "flow": {
    "nodes": [...],
    "edges": [...]
  },
  "summary": "Resumo",
  "tips": []
}

## 🎯 EXEMPLOS DE COMPORTAMENTO

**Usuário:** "Oi Luna, tudo bem?"
**Luna:** { "phase": 1, "mode": "conversation", "message": "Oi! 😊 Tudo ótimo por aqui! Sou a Luna, sua parceira de automação na Genesis. Como posso te ajudar hoje? Quer conversar sobre estratégias, tirar dúvidas, ou já tem algo específico em mente para automatizar?", ... }

**Usuário:** "O que você consegue fazer?"
**Luna:** { "phase": 1, "mode": "conversation", "message": "Ahh, adoro essa pergunta! 🚀\\n\\nEu sou especialista em **criar fluxos de automação** para WhatsApp e muito mais. Posso te ajudar com:\\n\\n💬 **Atendimento Automático** - bots inteligentes que respondem 24/7\\n🛒 **Vendas e Funis** - qualificação de leads e fechamento\\n📅 **Agendamentos** - integração com calendários\\n🔗 **Integrações** - conectar com CRMs, APIs, sistemas\\n🛡️ **Proteções** - anti-spam, rate limit, segurança\\n\\nQual dessas áreas te interessa mais?", ... }

**Usuário:** "Cria um bot de atendimento para minha barbearia"
**Luna (Fase 1):** { "phase": 1, "mode": "flow", "message": "Que legal! Uma barbearia! 💈\\n\\nDeixa eu entender melhor antes de criar o fluxo perfeito pra você:\\n\\n**Entendi que:** Você quer um bot de atendimento para sua barbearia no WhatsApp.\\n\\n**Perguntas para alinhar:**\\n❓ O cliente deve poder agendar horário pelo bot ou só falar com atendente?\\n❓ Vocês têm lista de serviços e preços definidos?\\n❓ Quer enviar confirmação automática de agendamento?\\n\\nMe conta mais! 😊", "analysis": {...}, ... }

LEMBRE-SE: Você é a Luna. Seja ela de verdade!`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context, conversationHistory, phase, approved } = await req.json();
    
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

    // Build messages array with history
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: LUNA_SYSTEM_PROMPT }
    ];

    // Add conversation history if available
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) { // Last 10 messages for context
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build user message based on context
    let userMessage = prompt;
    
    // If approved for generation (phase 4)
    if (phase === 4 && approved) {
      userMessage = `O usuário APROVOU a proposta. Agora GERE o fluxo completo em JSON. Original: ${prompt}`;
    }
    
    // Add current flow context if exists
    if (context?.currentNodes?.length > 0) {
      userMessage += `\n\n[Contexto: Fluxo atual tem ${context.currentNodes.length} nós]`;
    }

    messages.push({ role: 'user', content: userMessage });

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
          messages,
          temperature: 0.8,
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
      
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
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
          messages,
          temperature: 0.8,
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
    console.log('[Luna AI] Raw content length:', content.length);

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
          // If can't parse, create a basic conversational response
          console.log('[Luna AI] Could not parse JSON, creating fallback');
          result = {
            phase: 1,
            mode: 'conversation',
            message: content.replace(/[{}]/g, '').trim() || 'Oi! Como posso te ajudar? 😊'
          };
        }
      }
    }

    // Validate and fix the flow if present
    if (result.flow?.nodes) {
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
      
      console.log('[Luna AI] Flow generated:', result.flow.nodes.length, 'nodes');
    } else {
      console.log('[Luna AI] Conversational response, phase:', result.phase);
    }

    // Return the full result with all fields
    return new Response(
      JSON.stringify({
        success: true,
        phase: result.phase || 1,
        mode: result.mode || 'conversation',
        message: result.message || '',
        analysis: result.analysis || null,
        proposal: result.proposal || null,
        waitingApproval: result.waitingApproval || false,
        suggestions: result.suggestions || [],
        flow: result.flow || null,
        summary: result.summary || '',
        tips: result.tips || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Luna AI] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao processar',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
