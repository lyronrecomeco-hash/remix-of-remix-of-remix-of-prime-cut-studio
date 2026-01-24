import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { formData, userName } = await req.json()

    const {
      goal_title,
      goal_value,
      goal_deadline,
      current_situation,
      main_obstacle,
      available_resources,
      daily_hours,
      priority_focus
    } = formData

    // Calculate days from deadline
    const deadlineDays = parseInt(goal_deadline) || 30

    const systemPrompt = `Você é um mentor de execução de vendas de alta performance. 
Sua função é criar planos de ação PRÁTICOS e EXECUTÁVEIS para metas de vendas e prospecção.

CONTEXTO DO USUÁRIO:
- Nome: ${userName}
- Meta: ${goal_title}
- Valor alvo: ${goal_value}
- Prazo: ${goal_deadline}
- Situação atual: ${current_situation}
- Maior obstáculo: ${main_obstacle}
- Recursos disponíveis: ${available_resources || 'Não especificado'}
- Horas diárias: ${daily_hours}
- Foco prioritário: ${priority_focus}

REGRAS:
1. Crie um nome de missão IMPACTANTE e curto (max 4 palavras)
2. Defina uma meta diária ESPECÍFICA e mensurável
3. Gere 5-7 ações CONCRETAS e ordenadas por prioridade
4. Cada ação deve ter:
   - Título claro e direto
   - Descrição prática de como executar
   - Tipo (prospecting, follow-up, proposal, negotiation, closing, analysis)
   - Prioridade (high, medium, low)
   - Tempo estimado realista
5. A mensagem de motivação deve ser DIRETA, sem clichês
6. As métricas de sucesso devem ser MENSURÁVEIS

Responda APENAS com JSON válido no formato:
{
  "mission_name": "Nome Impactante",
  "goal_summary": "Resumo da meta em uma frase",
  "daily_target": "Meta específica por dia",
  "total_days": ${deadlineDays},
  "actions": [
    {
      "id": "action_1",
      "title": "Título da ação",
      "description": "Descrição prática",
      "type": "prospecting",
      "priority": "high",
      "estimatedTime": "30 min",
      "status": "pending",
      "linkedResource": "prospects"
    }
  ],
  "motivation_message": "Mensagem direta e motivacional",
  "success_metrics": ["Métrica 1", "Métrica 2", "Métrica 3"]
}`

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

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
          { 
            role: 'user', 
            content: `Crie o plano de execução para a meta: "${goal_title}" com valor ${goal_value} em ${goal_deadline}. Foco em ${priority_focus}. O maior desafio é: ${main_obstacle}.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos para continuar.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const errorText = await response.text()
      console.error('AI Gateway error:', response.status, errorText)
      throw new Error(`AI Gateway error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    let sprint
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content]
      const jsonStr = jsonMatch[1].trim()
      sprint = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content)
      // Fallback sprint
      sprint = {
        mission_name: "Sprint de Vendas",
        goal_summary: goal_title,
        daily_target: "Executar ações prioritárias",
        total_days: deadlineDays,
        actions: [
          {
            id: "action_1",
            title: "Mapear leads prioritários",
            description: "Identifique os 10 leads mais quentes da sua lista",
            type: "prospecting",
            priority: "high",
            estimatedTime: "1 hora",
            status: "pending"
          },
          {
            id: "action_2",
            title: "Enviar mensagens de abordagem",
            description: "Entre em contato com os leads mapeados via WhatsApp",
            type: "prospecting",
            priority: "high",
            estimatedTime: "2 horas",
            status: "pending"
          },
          {
            id: "action_3",
            title: "Fazer follow-up dos contatos anteriores",
            description: "Retome conversas que esfriaram nos últimos 7 dias",
            type: "follow-up",
            priority: "medium",
            estimatedTime: "1 hora",
            status: "pending"
          },
          {
            id: "action_4",
            title: "Preparar propostas personalizadas",
            description: "Crie propostas para leads interessados",
            type: "proposal",
            priority: "high",
            estimatedTime: "1.5 horas",
            status: "pending"
          },
          {
            id: "action_5",
            title: "Analisar métricas do dia",
            description: "Revise resultados e ajuste estratégia",
            type: "analysis",
            priority: "low",
            estimatedTime: "30 min",
            status: "pending"
          }
        ],
        motivation_message: `${userName}, sua meta de ${goal_value} é alcançável. Foque em ${priority_focus} e execute uma ação de cada vez. Consistência vence talento.`,
        success_metrics: [
          "Contatos realizados por dia",
          "Propostas enviadas",
          "Taxa de resposta",
          "Conversões fechadas"
        ]
      }
    }

    return new Response(
      JSON.stringify({ sprint }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
