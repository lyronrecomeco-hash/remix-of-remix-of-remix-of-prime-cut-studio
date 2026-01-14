import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GlobalContext {
  country_code: string;
  country_name: string;
  language_code: string;
  formality_level: string;
  directness_level: string;
  emoji_tolerance: string;
  decision_speed: string;
  preferred_channels: string[];
  business_hours_start: string;
  business_hours_end: string;
  timezone: string;
  currency_code: string;
  cultural_notes: string[];
  forbidden_phrases: string[];
  recommended_phrases: string[];
  holidays: Record<string, unknown>[];
}

interface IntentTemplate {
  intent_type: string;
  base_message: string;
  subject_line: string;
  tone_guidelines: string[];
  opening_style: string;
  closing_style: string;
  forbidden_patterns: string[];
  required_elements: string[];
  max_length: number;
}

interface GenerationRequest {
  context: GlobalContext;
  template: IntentTemplate;
  prospect: {
    company_name: string;
    contact_name?: string;
    niche?: string;
    pain_points?: string[];
    website?: string;
  };
  affiliate: {
    name: string;
    company?: string;
  };
  channel: string;
  customInstructions?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const request: GenerationRequest = await req.json();
    const { context, template, prospect, affiliate, channel, customInstructions } = request;

    // Build system prompt with cultural context
    const systemPrompt = buildSystemPrompt(context, template, channel);
    
    // Build user prompt with prospect details
    const userPrompt = buildUserPrompt(template, prospect, affiliate, customInstructions);

    console.log("Generating message for:", {
      country: context.country_code,
      intent: template.intent_type,
      channel,
      prospect: prospect.company_name
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_prospecting_message",
              description: "Generate a culturally-adapted prospecting message",
              parameters: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "The generated message content"
                  },
                  subject_line: {
                    type: "string",
                    description: "Email subject line (if applicable)"
                  },
                  cultural_adaptations: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of cultural adaptations applied"
                  },
                  compliance_notes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Compliance considerations for this message"
                  },
                  suggested_send_time: {
                    type: "string",
                    description: "Suggested time to send based on business hours"
                  },
                  alternative_openings: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 alternative opening lines"
                  }
                },
                required: ["message", "cultural_adaptations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_prospecting_message" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);

    // Validate against forbidden patterns
    const validationResult = validateMessage(generatedContent.message, context, template);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...generatedContent,
          validation: validationResult,
          metadata: {
            country_code: context.country_code,
            language_code: context.language_code,
            intent_type: template.intent_type,
            channel,
            generated_at: new Date().toISOString()
          }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildSystemPrompt(context: GlobalContext, template: IntentTemplate, channel: string): string {
  const channelGuidelines = getChannelGuidelines(channel);
  
  return `You are an expert international business development specialist creating prospecting messages.

## TARGET COUNTRY: ${context.country_name} (${context.country_code})
- Language: ${context.language_code}
- Formality Level: ${context.formality_level}
- Directness: ${context.directness_level}
- Emoji Tolerance: ${context.emoji_tolerance}
- Decision Speed: ${context.decision_speed}

## CULTURAL NOTES
${context.cultural_notes.map(note => `- ${note}`).join('\n')}

## RECOMMENDED PHRASES
${context.recommended_phrases.map(phrase => `✓ "${phrase}"`).join('\n')}

## FORBIDDEN PHRASES (NEVER USE)
${context.forbidden_phrases.map(phrase => `✗ "${phrase}"`).join('\n')}

## MESSAGE INTENT: ${template.intent_type.toUpperCase()}
${template.tone_guidelines.map(g => `- ${g}`).join('\n')}

## OPENING STYLE
${template.opening_style}

## CLOSING STYLE
${template.closing_style}

## REQUIRED ELEMENTS
${template.required_elements.map(el => `- ${el}`).join('\n')}

## FORBIDDEN PATTERNS
${template.forbidden_patterns.map(p => `- ${p}`).join('\n')}

## CHANNEL: ${channel.toUpperCase()}
${channelGuidelines}

## LENGTH LIMIT
Maximum ${template.max_length} characters

## CRITICAL RULES
1. Write ENTIRELY in ${context.language_code} language
2. Match the formality level exactly (${context.formality_level})
3. Never use any forbidden phrases or patterns
4. Include all required elements naturally
5. Respect cultural communication norms
6. Be authentic, not robotic
7. Focus on value proposition, not features`;
}

function buildUserPrompt(
  template: IntentTemplate,
  prospect: GenerationRequest['prospect'],
  affiliate: GenerationRequest['affiliate'],
  customInstructions?: string
): string {
  let prompt = `Generate a ${template.intent_type} message for:

## PROSPECT
- Company: ${prospect.company_name}
${prospect.contact_name ? `- Contact: ${prospect.contact_name}` : ''}
${prospect.niche ? `- Industry: ${prospect.niche}` : ''}
${prospect.website ? `- Website: ${prospect.website}` : ''}
${prospect.pain_points?.length ? `- Pain Points: ${prospect.pain_points.join(', ')}` : ''}

## SENDER
- Name: ${affiliate.name}
${affiliate.company ? `- Company: ${affiliate.company}` : ''}

## BASE TEMPLATE REFERENCE
${template.base_message}

## SUBJECT LINE REFERENCE (if email)
${template.subject_line}`;

  if (customInstructions) {
    prompt += `\n\n## ADDITIONAL INSTRUCTIONS\n${customInstructions}`;
  }

  prompt += `\n\nGenerate a culturally-adapted, personalized message following all guidelines above.`;

  return prompt;
}

function getChannelGuidelines(channel: string): string {
  const guidelines: Record<string, string> = {
    whatsapp: `- Keep it conversational and concise
- Use line breaks for readability
- Emojis allowed based on tolerance level
- No formal salutations needed
- Quick to the point`,
    email: `- Include proper salutation
- Professional formatting
- Clear subject line
- Signature expected
- Can be slightly longer`,
    linkedin: `- Professional tone
- Reference mutual connections if any
- Keep under 300 characters for connection requests
- Personalize based on profile`,
    sms: `- Ultra-concise (160 chars ideal)
- No emojis in formal cultures
- Clear call to action
- Identify yourself immediately`
  };

  return guidelines[channel] || guidelines.whatsapp;
}

function validateMessage(
  message: string,
  context: GlobalContext,
  template: IntentTemplate
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check forbidden phrases
  for (const phrase of context.forbidden_phrases) {
    if (message.toLowerCase().includes(phrase.toLowerCase())) {
      warnings.push(`Contains forbidden phrase: "${phrase}"`);
    }
  }

  // Check forbidden patterns
  for (const pattern of template.forbidden_patterns) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      warnings.push(`Contains forbidden pattern: "${pattern}"`);
    }
  }

  // Check length
  if (message.length > template.max_length) {
    warnings.push(`Exceeds max length: ${message.length}/${template.max_length}`);
  }

  // Check emoji tolerance
  const emojiCount = (message.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (context.emoji_tolerance === 'none' && emojiCount > 0) {
    warnings.push(`Contains emojis but culture has no emoji tolerance`);
  }
  if (context.emoji_tolerance === 'minimal' && emojiCount > 2) {
    warnings.push(`Too many emojis for minimal tolerance culture`);
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}
