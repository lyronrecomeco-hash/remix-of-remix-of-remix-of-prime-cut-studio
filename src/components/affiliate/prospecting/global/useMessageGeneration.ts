import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProspectingContext, 
  IntentTemplate, 
  MessageIntent,
  ChannelType,
  MessageGenerationRequest,
  MessageGenerationResponse,
  ComplianceCheck
} from './types';

interface UseMessageGenerationReturn {
  generating: boolean;
  error: string | null;
  lastGeneration: MessageGenerationResponse | null;
  generateMessage: (request: MessageGenerationRequest) => Promise<MessageGenerationResponse | null>;
  validateCompliance: (context: ProspectingContext, channel: ChannelType) => ComplianceCheck[];
  checkBusinessHours: (context: ProspectingContext) => boolean;
  logMessage: (
    affiliateId: string,
    prospectId: string | null,
    context: ProspectingContext,
    template: IntentTemplate | null,
    intent: MessageIntent,
    message: string,
    channel: ChannelType,
    detectionConfidence: number | null,
    manualOverride: boolean
  ) => Promise<void>;
}

export const useMessageGeneration = (): UseMessageGenerationReturn => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneration, setLastGeneration] = useState<MessageGenerationResponse | null>(null);

  // Validate compliance based on context
  const validateCompliance = useCallback((
    context: ProspectingContext, 
    channel: ChannelType
  ): ComplianceCheck[] => {
    const checks: ComplianceCheck[] = [];

    // GDPR check for EU countries
    if (context.compliance_tags.includes('GDPR')) {
      checks.push({
        tag: 'GDPR',
        passed: channel !== 'whatsapp' || context.channel_priority.includes('whatsapp'),
        message: channel === 'whatsapp' && !context.channel_priority.includes('whatsapp')
          ? 'WhatsApp não é canal prioritário em países GDPR. Considere email/LinkedIn.'
          : 'Conforme com GDPR.',
      });
    }

    // LGPD check for Brazil
    if (context.compliance_tags.includes('LGPD')) {
      checks.push({
        tag: 'LGPD',
        passed: true,
        message: 'WhatsApp é aceito no Brasil com consentimento implícito comercial.',
      });
    }

    // CCPA check for California/US
    if (context.compliance_tags.includes('CCPA')) {
      checks.push({
        tag: 'CCPA',
        passed: true,
        message: 'Conforme com CCPA para comunicação B2B.',
      });
    }

    // CAN-SPAM for US emails
    if (context.compliance_tags.includes('CAN-SPAM') && channel === 'email') {
      checks.push({
        tag: 'CAN-SPAM',
        passed: true,
        message: 'Incluir opção de unsubscribe em emails.',
      });
    }

    return checks;
  }, []);

  // Check if current time is within business hours
  const checkBusinessHours = useCallback((context: ProspectingContext): boolean => {
    try {
      // Get current time in the context's timezone
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: context.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      
      const timeString = formatter.format(now);
      const [hours, minutes] = timeString.split(':').map(Number);
      const currentMinutes = hours * 60 + minutes;

      const [startHour, startMin] = context.business_hours.start.split(':').map(Number);
      const [endHour, endMin] = context.business_hours.end.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } catch {
      return true; // Default to true if timezone check fails
    }
  }, []);

  // Generate message using AI
  const generateMessage = useCallback(async (
    request: MessageGenerationRequest
  ): Promise<MessageGenerationResponse | null> => {
    setGenerating(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Validate compliance first
      const complianceChecks = validateCompliance(request.context, request.channel);
      const failedChecks = complianceChecks.filter(c => !c.passed);
      
      if (failedChecks.length > 0) {
        setError(`Falha de compliance: ${failedChecks.map(c => c.message).join(', ')}`);
        return null;
      }

      // Build the prompt based on context and template
      const systemPrompt = buildSystemPrompt(request.context, request.template, request.intent);
      const userPrompt = buildUserPrompt(request.prospect_data, request.intent);

      // Call Supabase Edge Function for AI generation
      const { data, error: fnError } = await supabase.functions.invoke('global-message-generator', {
        body: {
          system_prompt: systemPrompt,
          user_prompt: userPrompt,
          context: request.context,
          template: request.template,
          intent: request.intent,
          channel: request.channel,
          prospect_data: request.prospect_data,
        },
      });

      if (fnError) throw fnError;

      const generationTime = Date.now() - startTime;

      const response: MessageGenerationResponse = {
        message: data.message || '',
        subject_line: data.subject_line,
        warnings: data.warnings || [],
        compliance_checks: complianceChecks,
        generation_time_ms: generationTime,
        tokens_used: data.tokens_used || 0,
      };

      setLastGeneration(response);
      return response;

    } catch (err) {
      console.error('Error generating message:', err);
      setError('Erro ao gerar mensagem. Tente novamente.');
      return null;
    } finally {
      setGenerating(false);
    }
  }, [validateCompliance]);

  // Log generated message for auditing
  const logMessage = useCallback(async (
    affiliateId: string,
    prospectId: string | null,
    context: ProspectingContext,
    template: IntentTemplate | null,
    intent: MessageIntent,
    message: string,
    channel: ChannelType,
    detectionConfidence: number | null,
    manualOverride: boolean
  ): Promise<void> => {
    try {
      const contextSnapshot = JSON.parse(JSON.stringify(context));
      await supabase.from('prospecting_message_logs').insert([{
        affiliate_id: affiliateId,
        prospect_id: prospectId,
        context_id: context.id,
        template_id: template?.id || null,
        context_snapshot: contextSnapshot,
        intent,
        generated_message: message,
        channel_used: channel,
        auto_detected_country: context.country_code,
        auto_detected_language: context.language,
        detection_confidence: detectionConfidence,
        manual_override: manualOverride,
        ai_model_used: 'gemini-2.5-flash',
        tokens_used: lastGeneration?.tokens_used || null,
        generation_time_ms: lastGeneration?.generation_time_ms || null,
      }]);
    } catch (err) {
      console.error('Error logging message:', err);
    }
  }, [lastGeneration]);

  return {
    generating,
    error,
    lastGeneration,
    generateMessage,
    validateCompliance,
    checkBusinessHours,
    logMessage,
  };
};

// ==================== HELPER FUNCTIONS ====================

function buildSystemPrompt(
  context: ProspectingContext, 
  template: IntentTemplate | null,
  intent: MessageIntent
): string {
  const basePrompt = `You are a global B2B sales assistant specialized in culturally-aware communication.

STRICT RULES - You MUST follow these:

1. LANGUAGE: Write ONLY in ${context.language}. Never mix languages.

2. FORMALITY: Level ${context.formality_level}/5
   ${context.formality_level >= 4 ? '- Use formal pronouns and titles' : '- Casual but professional tone'}

3. DIRECTNESS: Level ${context.directness_level}/5
   ${context.directness_level >= 4 ? '- Be direct and to the point' : '- Build rapport before the ask'}

4. EMOJIS: Tolerance ${context.emoji_tolerance}/5
   ${context.emoji_tolerance === 0 ? '- NEVER use emojis' : context.emoji_tolerance >= 4 ? '- Emojis are welcome' : '- Use emojis sparingly if at all'}

5. COMPLIANCE: Respect these regulations: ${context.compliance_tags.join(', ') || 'None'}

6. CHANNEL PRIORITY: ${context.channel_priority.join(' > ')}

7. BUSINESS HOURS: ${context.business_hours.start} - ${context.business_hours.end} (${context.timezone})

8. COUNTRY CONTEXT: ${context.country_name} (${context.region_code})

${template ? `
TEMPLATE GUIDELINES:
- Tone: ${template.tone_guidelines}
- Opening: ${template.opening_style || 'Standard greeting'}
- Closing: ${template.closing_style || 'Standard closing'}
- Max Length: ${template.max_length} characters
- FORBIDDEN patterns: ${template.forbidden_patterns.join(', ') || 'None'}
- REQUIRED elements: ${template.required_elements.join(', ') || 'None'}
` : ''}

INTENT: ${intent}

Generate a message that feels native to ${context.country_name}, not translated.`;

  return basePrompt;
}

function buildUserPrompt(
  prospectData: Record<string, string | undefined>,
  intent: MessageIntent
): string {
  const variables = Object.entries(prospectData)
    .filter(([_, value]) => value)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `Generate a ${intent.replace('_', ' ')} message for this prospect:

${variables}

Return ONLY the message text, nothing else.`;
}
