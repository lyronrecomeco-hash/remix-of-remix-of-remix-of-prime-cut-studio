import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function parseMaybeJson(text: string): Promise<any> {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

interface FoodItem {
  name: string;
  quantity_grams: number;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  fiber_grams: number;
  sodium_mg: number;
  confidence: number;
}

interface ParsedMeal {
  foods: FoodItem[];
  water_ml: number;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
  original_text: string;
}

const MEAL_ANALYSIS_PROMPT = `Você é um nutricionista especialista em análise de refeições.
Sua tarefa é analisar imagens ou descrições de refeições e retornar dados nutricionais precisos.

REGRAS IMPORTANTES:
1. Use a tabela TACO/USDA como referência para valores nutricionais
2. Estime porções realistas baseado no tamanho visual dos alimentos
3. Identifique TODOS os alimentos visíveis na imagem
4. Se houver líquidos/água visível, extraia a quantidade estimada em ml
5. Determine o tipo de refeição baseado nos alimentos (breakfast/lunch/snack/dinner)
6. Valores nutricionais devem ser por porção estimada, não por 100g
7. Inclua fibras e sódio nas estimativas

FORMATO DE RESPOSTA (JSON estrito):
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity_grams": número,
      "calories": número,
      "protein_grams": número,
      "carbs_grams": número,
      "fat_grams": número,
      "fiber_grams": número,
      "sodium_mg": número,
      "confidence": 0.0-1.0
    }
  ],
  "water_ml": número (0 se não visível),
  "meal_type": "breakfast|lunch|snack|dinner",
  "total_calories": número,
  "total_protein": número,
  "total_carbs": número,
  "total_fat": número,
  "total_fiber": número,
  "total_sodium": número,
  "original_text": "descrição breve dos alimentos identificados"
}

Referências nutricionais comuns (por porção típica):
- Arroz branco (150g): 195kcal, 4g prot, 43g carb, 0.4g gord
- Feijão carioca (100g): 76kcal, 5g prot, 14g carb, 0.5g gord
- Frango grelhado (100g): 165kcal, 31g prot, 0g carb, 3.6g gord
- Ovo frito (50g): 90kcal, 6g prot, 0.6g carb, 7g gord
- Salada verde (100g): 15kcal, 1g prot, 2g carb, 0.2g gord
- Pão francês (50g): 150kcal, 5g prot, 29g carb, 1.5g gord
- Banana (100g): 89kcal, 1g prot, 23g carb, 0.3g gord
- Maçã (150g): 78kcal, 0.4g prot, 21g carb, 0.2g gord`;

serve(async (req) => {
  console.log("[nutrition-voice-processor] Request received");
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, audio, image, text, userId, currentMacros, nutritionGoals } = await req.json();
    console.log(`[nutrition-voice-processor] Action: ${action}`);

    // Photo analysis action
    if (action === 'analyze-photo') {
      const lovableKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableKey) {
        throw new Error('Lovable API key not configured');
      }

      if (!image) {
        return jsonResponse({ success: false, error: 'No image provided' }, { status: 400 });
      }

      console.log("[nutrition-voice-processor] Analyzing photo with Gemini Vision...");

      const visionResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: MEAL_ANALYSIS_PROMPT,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                  },
                },
                {
                  type: 'text',
                  text: 'Analise esta imagem de refeição e retorne os dados nutricionais em JSON.',
                },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!visionResponse.ok) {
        const errorText = await visionResponse.text();
        const parsed = await parseMaybeJson(errorText);
        console.error("[nutrition-voice-processor] Vision error:", parsed || errorText);
        return jsonResponse(
          {
            success: false,
            error: parsed?.error?.message || `Vision API error: ${visionResponse.status}`,
          },
          { status: visionResponse.status },
        );
      }

      const visionResult = await visionResponse.json();
      const content = visionResult.choices?.[0]?.message?.content || '';
      console.log("[nutrition-voice-processor] Vision response:", content);

      // Check if AI couldn't identify food
      if (content.toLowerCase().includes('não consigo') || 
          content.toLowerCase().includes('não foi possível') ||
          content.toLowerCase().includes('não há alimentos') ||
          content.toLowerCase().includes('não contém') ||
          !content.includes('{')) {
        return jsonResponse({
          success: false,
          error: 'Não foi possível identificar alimentos na foto. Tente tirar uma foto mais clara do prato com os alimentos visíveis.'
        }, { status: 400 });
      }

      // Extract JSON from response (may be wrapped in markdown)
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      } else {
        // Try to find JSON object directly
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonContent = content.substring(jsonStart, jsonEnd + 1);
        }
      }

      let parsedMeal: ParsedMeal;
      try {
        parsedMeal = JSON.parse(jsonContent);
        
        // Validate required fields
        if (!parsedMeal.foods || !Array.isArray(parsedMeal.foods)) {
          throw new Error('Invalid meal structure');
        }
        
        // Ensure all numeric values are valid
        parsedMeal.foods = parsedMeal.foods.map(food => ({
          ...food,
          quantity_grams: Math.round(food.quantity_grams || 100),
          calories: Math.round(food.calories || 0),
          protein_grams: Math.round((food.protein_grams || 0) * 10) / 10,
          carbs_grams: Math.round((food.carbs_grams || 0) * 10) / 10,
          fat_grams: Math.round((food.fat_grams || 0) * 10) / 10,
          fiber_grams: Math.round((food.fiber_grams || 0) * 10) / 10,
          sodium_mg: Math.round(food.sodium_mg || 0),
          confidence: food.confidence || 0.8
        }));
        
        // Recalculate totals
        parsedMeal.total_calories = parsedMeal.foods.reduce((sum, f) => sum + f.calories, 0);
        parsedMeal.total_protein = Math.round(parsedMeal.foods.reduce((sum, f) => sum + f.protein_grams, 0) * 10) / 10;
        parsedMeal.total_carbs = Math.round(parsedMeal.foods.reduce((sum, f) => sum + f.carbs_grams, 0) * 10) / 10;
        parsedMeal.total_fat = Math.round(parsedMeal.foods.reduce((sum, f) => sum + f.fat_grams, 0) * 10) / 10;
        parsedMeal.total_fiber = Math.round(parsedMeal.foods.reduce((sum, f) => sum + f.fiber_grams, 0) * 10) / 10;
        parsedMeal.total_sodium = Math.round(parsedMeal.foods.reduce((sum, f) => sum + f.sodium_mg, 0));
        parsedMeal.water_ml = Math.round(parsedMeal.water_ml || 0);
        parsedMeal.meal_type = parsedMeal.meal_type || 'lunch';
        parsedMeal.original_text = parsedMeal.original_text || 'Análise de foto';
        
      } catch (e) {
        console.error("[nutrition-voice-processor] JSON parse error:", e, "Content:", jsonContent);
        return jsonResponse(
          { success: false, error: 'Não foi possível identificar os alimentos na foto. Tente tirar uma foto mais clara.' },
          { status: 400 }
        );
      }

      return jsonResponse({
        success: true,
        meal: parsedMeal,
      });
    }

    if (action === 'transcribe') {
      // Use Lovable AI (Gemini) for transcription via multimodal
      const lovableKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableKey) {
        throw new Error('Lovable API key not configured');
      }

      console.log("[nutrition-voice-processor] Calling Lovable AI for transcription...");

      const transcribeResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'Você é um transcritor de áudio. Transcreva fielmente o que foi dito no áudio. Responda APENAS com a transcrição, sem comentários adicionais. Se não conseguir entender, diga "Áudio não compreendido".',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'input_audio',
                  input_audio: {
                    data: audio,
                    format: 'webm',
                  },
                },
                {
                  type: 'text',
                  text: 'Transcreva o áudio acima em português brasileiro.',
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        const parsed = await parseMaybeJson(errorText);
        console.error("[nutrition-voice-processor] Lovable AI transcription error:", parsed || errorText);

        return jsonResponse(
          {
            success: false,
            error: parsed?.error?.message || `Transcription error: ${transcribeResponse.status}`,
            code: parsed?.error?.code || null,
          },
          { status: transcribeResponse.status },
        );
      }

      const transcribeResult = await transcribeResponse.json();
      const transcribedText = transcribeResult.choices?.[0]?.message?.content?.trim() || '';
      console.log("[nutrition-voice-processor] Transcription:", transcribedText);

      if (!transcribedText || transcribedText === 'Áudio não compreendido') {
        return jsonResponse(
          {
            success: false,
            error: 'Não foi possível entender o áudio. Tente falar mais claramente.',
          },
          { status: 400 },
        );
      }

      return jsonResponse({
        success: true,
        text: transcribedText,
      });
    }

    if (action === 'parse-meal') {
      // Use Lovable AI (GPT) to interpret the meal
      const lovableKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableKey) {
        throw new Error('Lovable API key not configured');
      }

      const systemPrompt = `Você é um nutricionista especialista em análise de refeições. 
Sua tarefa é interpretar descrições de refeições em português e retornar dados nutricionais precisos.

REGRAS IMPORTANTES:
1. Use a tabela TACO/USDA como referência para valores nutricionais
2. Estime porções realistas se não especificadas (ex: "arroz" = 150g porção típica)
3. Identifique todos os alimentos mencionados
4. Se mencionar água/líquidos, extraia a quantidade em ml
5. Determine o tipo de refeição baseado nos alimentos e horário implícito
6. Valores nutricionais devem ser por porção estimada, não por 100g
7. Inclua fibras e sódio nas estimativas

FORMATO DE RESPOSTA (JSON estrito):
{
  "foods": [
    {
      "name": "nome do alimento",
      "quantity_grams": número,
      "calories": número,
      "protein_grams": número,
      "carbs_grams": número,
      "fat_grams": número,
      "fiber_grams": número,
      "sodium_mg": número,
      "confidence": 0.0-1.0
    }
  ],
  "water_ml": número (0 se não mencionado),
  "meal_type": "breakfast|lunch|snack|dinner",
  "total_calories": número,
  "total_protein": número,
  "total_carbs": número,
  "total_fat": número,
  "total_fiber": número,
  "total_sodium": número,
  "original_text": "texto original"
}

Referências nutricionais comuns (por porção típica):
- Arroz branco (150g): 195kcal, 4g prot, 43g carb, 0.4g gord
- Feijão carioca (100g): 76kcal, 5g prot, 14g carb, 0.5g gord
- Frango grelhado (100g): 165kcal, 31g prot, 0g carb, 3.6g gord
- Ovo frito (50g): 90kcal, 6g prot, 0.6g carb, 7g gord
- Salada verde (100g): 15kcal, 1g prot, 2g carb, 0.2g gord
- Pão francês (50g): 150kcal, 5g prot, 29g carb, 1.5g gord
- Banana (100g): 89kcal, 1g prot, 23g carb, 0.3g gord
- Maçã (150g): 78kcal, 0.4g prot, 21g carb, 0.2g gord`;

      const userMessage = `Analise esta descrição de refeição e retorne os dados nutricionais em JSON:
"${text}"`;

      console.log("[nutrition-voice-processor] Calling Lovable AI for meal parsing...");
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[nutrition-voice-processor] AI error:", errorText);
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      const content = aiResult.choices[0]?.message?.content;
      console.log("[nutrition-voice-processor] AI Response:", content);

      let parsedMeal: ParsedMeal;
      try {
        parsedMeal = JSON.parse(content);
        parsedMeal.original_text = text;
      } catch (e) {
        console.error("[nutrition-voice-processor] JSON parse error:", e);
        throw new Error('Failed to parse AI response');
      }

      return jsonResponse({
        success: true,
        meal: parsedMeal,
      });
    }

    if (action === 'nutrition-chat') {
      // AI Nutritional Assistant
      const lovableKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableKey) {
        throw new Error('Lovable API key not configured');
      }

      const systemPrompt = `Você é um assistente nutricional inteligente e amigável.
Você ajuda o usuário com dúvidas sobre alimentação, sugestões de refeições e orientações nutricionais.

CONTEXTO DO USUÁRIO:
- Metas diárias: ${nutritionGoals?.daily_calories || 2000} kcal, ${nutritionGoals?.protein_grams || 150}g proteína, ${nutritionGoals?.carbs_grams || 200}g carboidratos, ${nutritionGoals?.fat_grams || 70}g gordura
- Consumo atual hoje: ${currentMacros?.calories || 0} kcal, ${currentMacros?.protein || 0}g proteína, ${currentMacros?.carbs || 0}g carboidratos, ${currentMacros?.fat || 0}g gordura
- Meta de água: ${nutritionGoals?.water_ml || 2500}ml, consumido: ${currentMacros?.water || 0}ml

INSTRUÇÕES:
1. Seja conciso e direto nas respostas
2. Considere o contexto nutricional do usuário ao dar sugestões
3. Sugira alimentos reais e práticos
4. Calcule calorias restantes quando relevante
5. Seja encorajador e positivo
6. Use emojis moderadamente para tornar a conversa agradável
7. Se perguntarem sobre alimentos específicos, forneça informações nutricionais aproximadas`;

      console.log("[nutrition-voice-processor] Calling nutrition chat AI...");
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[nutrition-voice-processor] Chat AI error:", errorText);
        throw new Error(`Chat AI error: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      const response = aiResult.choices[0]?.message?.content;

      return jsonResponse({
        success: true,
        response,
      });
    }

    return jsonResponse({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("[nutrition-voice-processor] Error:", errorMessage);
    return jsonResponse({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
});
