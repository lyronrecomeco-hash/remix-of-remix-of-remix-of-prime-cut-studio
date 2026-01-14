import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ProspectingContext, 
  IntentTemplate, 
  RegionCode, 
  MessageIntent,
  CountryDetectionResult,
  FormalityLevel,
  DirectnessLevel,
  EmojiTolerance,
  DecisionSpeed,
  ChannelType,
  BusinessHours,
  COUNTRY_PHONE_PREFIXES,
  COUNTRY_TLDS
} from './types';

interface UseGlobalContextsReturn {
  // Data
  contexts: ProspectingContext[];
  templates: IntentTemplate[];
  
  // Selected
  selectedContext: ProspectingContext | null;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchContexts: () => Promise<void>;
  fetchTemplates: (contextId: string) => Promise<void>;
  selectContext: (context: ProspectingContext | null) => void;
  getContextByCountry: (countryCode: string) => ProspectingContext | null;
  getContextsByRegion: (region: RegionCode) => ProspectingContext[];
  getTemplateByIntent: (contextId: string, intent: MessageIntent) => IntentTemplate | null;
  
  // Auto-detection
  detectCountryByPhone: (phone: string) => CountryDetectionResult;
  detectCountryByDomain: (domain: string) => CountryDetectionResult;
  autoDetectContext: (phone?: string, domain?: string) => Promise<ProspectingContext | null>;
}

export const useGlobalContexts = (): UseGlobalContextsReturn => {
  const [contexts, setContexts] = useState<ProspectingContext[]>([]);
  const [templates, setTemplates] = useState<IntentTemplate[]>([]);
  const [selectedContext, setSelectedContext] = useState<ProspectingContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active contexts
  const fetchContexts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('global_contexts')
        .select('*')
        .eq('is_active', true)
        .order('region_code')
        .order('country_name');

      if (fetchError) throw fetchError;

      const mappedContexts: ProspectingContext[] = (data || []).map(row => ({
        id: row.id,
        region_code: row.region_code as RegionCode,
        country_code: row.country_code,
        country_name: row.country_name,
        language: row.language,
        timezone: row.timezone,
        formality_level: row.formality_level as FormalityLevel,
        directness_level: row.directness_level as DirectnessLevel,
        emoji_tolerance: row.emoji_tolerance as EmojiTolerance,
        decision_speed: row.decision_speed as DecisionSpeed,
        channel_priority: row.channel_priority as ChannelType[],
        business_hours: row.business_hours as unknown as BusinessHours,
        compliance_tags: row.compliance_tags as string[],
        is_active: row.is_active,
      }));

      setContexts(mappedContexts);
    } catch (err) {
      console.error('Error fetching global contexts:', err);
      setError('Erro ao carregar contextos globais');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch templates for a specific context
  const fetchTemplates = useCallback(async (contextId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('intent_templates')
        .select('*')
        .eq('context_id', contextId)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const mappedTemplates: IntentTemplate[] = (data || []).map(row => ({
        id: row.id,
        context_id: row.context_id,
        intent: row.intent as MessageIntent,
        base_message: row.base_message,
        subject_line: row.subject_line,
        tone_guidelines: row.tone_guidelines,
        opening_style: row.opening_style,
        closing_style: row.closing_style,
        forbidden_patterns: row.forbidden_patterns || [],
        required_elements: row.required_elements || [],
        max_length: row.max_length,
        allowed_variables: row.allowed_variables as string[] || [],
        is_active: row.is_active,
        version: row.version,
      }));

      setTemplates(mappedTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, []);

  // Select a context
  const selectContext = useCallback((context: ProspectingContext | null) => {
    setSelectedContext(context);
    if (context) {
      fetchTemplates(context.id);
    } else {
      setTemplates([]);
    }
  }, [fetchTemplates]);

  // Get context by country code
  const getContextByCountry = useCallback((countryCode: string): ProspectingContext | null => {
    return contexts.find(c => c.country_code === countryCode) || null;
  }, [contexts]);

  // Get contexts by region
  const getContextsByRegion = useCallback((region: RegionCode): ProspectingContext[] => {
    return contexts.filter(c => c.region_code === region);
  }, [contexts]);

  // Get template by intent
  const getTemplateByIntent = useCallback((contextId: string, intent: MessageIntent): IntentTemplate | null => {
    return templates.find(t => t.context_id === contextId && t.intent === intent) || null;
  }, [templates]);

  // Detect country by phone number
  const detectCountryByPhone = useCallback((phone: string): CountryDetectionResult => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
    
    // Check each country's prefixes
    for (const [countryCode, prefixes] of Object.entries(COUNTRY_PHONE_PREFIXES)) {
      for (const prefix of prefixes) {
        if (cleanPhone.startsWith(prefix)) {
          const context = contexts.find(c => c.country_code === countryCode);
          return {
            country_code: countryCode,
            country_name: context?.country_name || null,
            language: context?.language || null,
            confidence: 0.9,
            source: 'phone',
            needs_confirmation: false,
          };
        }
      }
    }

    // Brazilian number without prefix (starts with area code)
    if (/^[1-9][1-9]\d{8,9}$/.test(cleanPhone)) {
      const context = contexts.find(c => c.country_code === 'BR');
      return {
        country_code: 'BR',
        country_name: context?.country_name || 'Brasil',
        language: 'pt-BR',
        confidence: 0.7,
        source: 'phone',
        needs_confirmation: true,
      };
    }

    return {
      country_code: null,
      country_name: null,
      language: null,
      confidence: 0,
      source: 'phone',
      needs_confirmation: true,
    };
  }, [contexts]);

  // Detect country by domain
  const detectCountryByDomain = useCallback((domain: string): CountryDetectionResult => {
    const lowerDomain = domain.toLowerCase();
    
    // Check TLDs
    for (const [tld, countryCode] of Object.entries(COUNTRY_TLDS)) {
      if (lowerDomain.endsWith(tld)) {
        const context = contexts.find(c => c.country_code === countryCode);
        return {
          country_code: countryCode,
          country_name: context?.country_name || null,
          language: context?.language || null,
          confidence: 0.85,
          source: 'domain',
          needs_confirmation: false,
        };
      }
    }

    // .com defaults to US with lower confidence
    if (lowerDomain.endsWith('.com')) {
      const context = contexts.find(c => c.country_code === 'US');
      return {
        country_code: 'US',
        country_name: context?.country_name || 'United States',
        language: 'en-US',
        confidence: 0.5,
        source: 'domain',
        needs_confirmation: true,
      };
    }

    return {
      country_code: null,
      country_name: null,
      language: null,
      confidence: 0,
      source: 'domain',
      needs_confirmation: true,
    };
  }, [contexts]);

  // Auto-detect context from phone and/or domain
  const autoDetectContext = useCallback(async (
    phone?: string, 
    domain?: string
  ): Promise<ProspectingContext | null> => {
    let bestDetection: CountryDetectionResult | null = null;

    // Try phone detection first (usually more reliable)
    if (phone) {
      const phoneDetection = detectCountryByPhone(phone);
      if (phoneDetection.confidence > 0) {
        bestDetection = phoneDetection;
      }
    }

    // Try domain detection
    if (domain) {
      const domainDetection = detectCountryByDomain(domain);
      if (!bestDetection || domainDetection.confidence > bestDetection.confidence) {
        bestDetection = domainDetection;
      }
    }

    // If we have a detection with sufficient confidence, return the context
    if (bestDetection?.country_code && bestDetection.confidence >= 0.7) {
      return getContextByCountry(bestDetection.country_code);
    }

    // If confidence is low but we have a result, still return it (caller should check needs_confirmation)
    if (bestDetection?.country_code) {
      return getContextByCountry(bestDetection.country_code);
    }

    return null;
  }, [detectCountryByPhone, detectCountryByDomain, getContextByCountry]);

  // Initial fetch
  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  return {
    contexts,
    templates,
    selectedContext,
    loading,
    error,
    fetchContexts,
    fetchTemplates,
    selectContext,
    getContextByCountry,
    getContextsByRegion,
    getTemplateByIntent,
    detectCountryByPhone,
    detectCountryByDomain,
    autoDetectContext,
  };
};
