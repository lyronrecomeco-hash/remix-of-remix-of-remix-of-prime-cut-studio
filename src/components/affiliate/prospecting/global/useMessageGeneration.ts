import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProspectingContext, 
  IntentTemplate, 
  MessageIntent,
  ChannelType,
  ComplianceCheck
} from './types';

interface GeneratedMessage {
  message: string;
  subject_line?: string;
  cultural_adaptations: string[];
  compliance_notes?: string[];
  suggested_send_time?: string;
  alternative_openings?: string[];
  validation: {
    valid: boolean;
    warnings: string[];
  };
  metadata: {
    country_code: string;
    language_code: string;
    intent_type: string;
    channel: string;
    generated_at: string;
  };
}

interface ProspectData {
  company_name: string;
  contact_name?: string;
  niche?: string;
  pain_points?: string[];
  website?: string;
}

interface AffiliateData {
  name: string;
  company?: string;
}

interface UseMessageGenerationReturn {
  generating: boolean;
  error: string | null;
  lastGeneration: GeneratedMessage | null;
  generateMessage: (
    context: ProspectingContext,
    template: IntentTemplate,
    prospect: ProspectData,
    affiliate: AffiliateData,
    channel: ChannelType,
    customInstructions?: string
  ) => Promise<GeneratedMessage | null>;
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
  const [lastGeneration, setLastGeneration] = useState<GeneratedMessage | null>(null);

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
      return true;
    }
  }, []);

  // Generate message using Edge Function
  const generateMessage = useCallback(async (
    context: ProspectingContext,
    template: IntentTemplate,
    prospect: ProspectData,
    affiliate: AffiliateData,
    channel: ChannelType,
    customInstructions?: string
  ): Promise<GeneratedMessage | null> => {
    setGenerating(true);
    setError(null);

    try {
      // Validate compliance first
      const complianceChecks = validateCompliance(context, channel);
      const failedChecks = complianceChecks.filter(c => !c.passed);
      
      if (failedChecks.length > 0) {
        setError(`Falha de compliance: ${failedChecks.map(c => c.message).join(', ')}`);
        return null;
      }

      // Transform context to match Edge Function expected format
      const edgeFunctionPayload = {
        context: {
          country_code: context.country_code,
          country_name: context.country_name,
          language_code: context.language,
          formality_level: context.formality_level,
          directness_level: context.directness_level,
          emoji_tolerance: context.emoji_tolerance,
          decision_speed: context.decision_speed,
          preferred_channels: context.channel_priority,
          business_hours_start: context.business_hours.start,
          business_hours_end: context.business_hours.end,
          timezone: context.timezone,
          currency_code: 'BRL', // Default, could be expanded
          cultural_notes: [], // Could be added to context
          forbidden_phrases: template.forbidden_patterns,
          recommended_phrases: template.required_elements,
          holidays: [],
        },
        template: {
          intent_type: template.intent,
          base_message: template.base_message,
          subject_line: template.subject_line || '',
          tone_guidelines: [template.tone_guidelines],
          opening_style: template.opening_style || '',
          closing_style: template.closing_style || '',
          forbidden_patterns: template.forbidden_patterns,
          required_elements: template.required_elements,
          max_length: template.max_length,
        },
        prospect,
        affiliate,
        channel,
        customInstructions,
      };

      const { data, error: fnError } = await supabase.functions.invoke('global-message-generator', {
        body: edgeFunctionPayload,
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Erro na edge function');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao gerar mensagem');
      }

      const generatedData = data.data as GeneratedMessage;
      setLastGeneration(generatedData);
      return generatedData;

    } catch (err) {
      console.error('Error generating message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar mensagem';
      setError(errorMessage);
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
        ai_model_used: 'google/gemini-3-flash-preview',
        tokens_used: null,
        generation_time_ms: null,
      }]);
    } catch (err) {
      console.error('Error logging message:', err);
    }
  }, []);

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
