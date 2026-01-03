import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Luna - IA especializada em criação de fluxos de WhatsApp
const LUNA_SYSTEM_PROMPT = `Você é a Luna, uma IA especializada em criar fluxos de automação para WhatsApp de forma visual e profissional.

## SUA MISSÃO
Analisar a descrição do usuário e gerar um fluxo de automação COMPLETO com nós e conexões.

## TIPOS DE NÓS DISPONÍVEIS
1. **trigger** - Gatilhos iniciais:
   - keywords: palavras-chave que ativam o fluxo
   - triggerType: 'keyword' | 'first_contact' | 'button_click' | 'webhook'

2. **message** - Enviar mensagem de texto:
   - text: conteúdo da mensagem
   - typing: true/false (simular digitação)

3. **button** - Mensagem com botões interativos:
   - text: texto da mensagem
   - buttons: array de {id: string, text: string}

4. **list** - Menu de lista:
   - title: título do menu
   - sections: array de {title: string, items: [{id: string, title: string, description?: string}]}

5. **condition** - Condições/Decisões:
   - field: campo a verificar (ex: 'message', 'button_id', 'user_name')
   - operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex'
   - value: valor a comparar

6. **delay** - Aguardar tempo:
   - seconds: tempo em segundos
   - showTyping: true/false

7. **ai** - Resposta com IA:
   - prompt: contexto/instruções para a IA
   - model: 'gemini-2.5-flash'
   - temperature: 0.0 a 1.0

8. **webhook** - Chamar API externa:
   - url: URL da API
   - method: 'GET' | 'POST' | 'PUT' | 'DELETE'
   - headers: objeto com headers
   - body: corpo da requisição

9. **variable** - Definir variável:
   - name: nome da variável
   - value: valor
   - source: 'static' | 'response' | 'user_input'

10. **end** - Finalizar fluxo:
    - endType: 'complete' | 'transfer' | 'error'

## REGRAS DE CONEXÃO
- Nós de condição têm DUAS saídas: 'yes' e 'no'
- Nós de split dividem em 'a' e 'b'
- Outros nós têm apenas uma saída padrão
- Todo fluxo DEVE começar com um nó 'trigger'
- Fluxos devem ter pelo menos um nó 'end' ou serem cíclicos

## LAYOUT AUTOMÁTICO
- Posicione nós de forma hierárquica (trigger no topo)
- Use espaçamento X de 300px entre colunas
- Use espaçamento Y de 150px entre linhas
- Ramificações devem ir para a direita

## FORMATO DE RESPOSTA (JSON VÁLIDO)
{
  "flow": {
    "nodes": [
      {
        "id": "node-1",
        "position": { "x": 400, "y": 50 },
        "data": {
          "label": "Nome do Nó",
          "type": "trigger",
          "config": { "keywords": ["oi", "olá"], "triggerType": "keyword" },
          "description": "Descrição breve"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2",
        "sourceHandle": null,
        "label": null
      }
    ]
  },
  "summary": "Breve resumo do que o fluxo faz",
  "tips": ["Dica 1", "Dica 2"]
}

## EXEMPLOS DE FLUXOS

### Atendimento Básico
Trigger → Saudação → Menu de Opções → Condição por botão → Respostas específicas → Encerramento

### Qualificação de Lead
Trigger → Pergunta nome → Captura → Pergunta interesse → Menu → Encaminha ou Agenda

### Suporte Técnico
Trigger → Menu de problemas → Condição → Sub-menus → IA para resolução ou Escalação

### Vendas
Trigger → Apresentação → Catálogo (lista) → Pergunta quantidade → Calcula total → Pagamento

SEMPRE gere um fluxo COMPLETO, FUNCIONAL e BEM CONECTADO. Não deixe nós soltos.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    
    if (!prompt) {
      throw new Error('Prompt é obrigatório');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log('[Luna] Processando prompt:', prompt.substring(0, 100));

    const userPrompt = context 
      ? `Contexto atual do fluxo:
${JSON.stringify(context, null, 2)}

Solicitação do usuário: ${prompt}

Analise o contexto e a solicitação. Se for para modificar o fluxo existente, retorne o fluxo COMPLETO modificado. Se for um fluxo novo, crie do zero.`
      : `Crie um fluxo completo de automação WhatsApp baseado nesta descrição:

${prompt}

Gere um fluxo COMPLETO com todos os nós e conexões necessárias.`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Luna] Erro na API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos na sua conta Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('[Luna] Resposta recebida, processando...');

    // Extrair JSON da resposta
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    // Tentar encontrar o JSON de outra forma se não encontrou
    if (!jsonMatch) {
      const startIndex = content.indexOf('{');
      const endIndex = content.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = content.substring(startIndex, endIndex + 1);
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[Luna] Erro ao parsear JSON:', parseError);
      console.log('[Luna] Conteúdo recebido:', content.substring(0, 500));
      throw new Error('Não foi possível interpretar a resposta da IA. Tente reformular sua descrição.');
    }

    // Validar estrutura
    if (!parsed.flow || !parsed.flow.nodes || !parsed.flow.edges) {
      throw new Error('Estrutura de fluxo inválida gerada pela IA');
    }

    // Garantir IDs únicos
    const nodeIds = new Set();
    parsed.flow.nodes = parsed.flow.nodes.map((node: any, index: number) => {
      let id = node.id || `node-${index + 1}`;
      while (nodeIds.has(id)) {
        id = `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      }
      nodeIds.add(id);
      return { ...node, id };
    });

    // Garantir conexões válidas
    parsed.flow.edges = parsed.flow.edges.filter((edge: any) => {
      return nodeIds.has(edge.source) && nodeIds.has(edge.target);
    }).map((edge: any, index: number) => ({
      ...edge,
      id: edge.id || `edge-${index + 1}-${Date.now()}`
    }));

    console.log('[Luna] Fluxo gerado:', parsed.flow.nodes.length, 'nós,', parsed.flow.edges.length, 'conexões');

    return new Response(
      JSON.stringify({
        success: true,
        flow: parsed.flow,
        summary: parsed.summary || 'Fluxo gerado com sucesso',
        tips: parsed.tips || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Luna] Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
