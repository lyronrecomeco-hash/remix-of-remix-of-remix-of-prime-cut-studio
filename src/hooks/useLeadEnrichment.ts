import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnrichedLeadData {
  id?: string;
  business: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    rating?: number;
    reviewsCount?: number;
    niche?: string;
    city?: string;
    state?: string;
    country?: string;
    placeId?: string;
  };
  validation: {
    email?: {
      isValid: boolean;
      syntaxValid: boolean;
      mxValid: boolean;
      isDisposable: boolean;
      isCatchAll: boolean;
      provider: string | null;
      domain: string;
    };
    phone?: {
      isValid: boolean;
      isMobile: boolean;
      hasWhatsapp: boolean;
      carrier: string | null;
      countryCode: string;
      formatted: string;
    };
  };
  websiteHealth?: {
    url: string;
    domain: string;
    httpStatus: number | null;
    isAccessible: boolean;
    responseTimeMs: number;
    hasSsl: boolean;
    sslValid: boolean;
    technologies: string[];
    cmsDetected: string | null;
    hasMetaPixel: boolean;
    hasGoogleTag: boolean;
    hasGoogleAnalytics: boolean;
    pageTitle: string | null;
    metaDescription: string | null;
    healthScore: number;
    healthStatus: 'healthy' | 'issues' | 'critical' | 'offline';
  };
  adsAnalysis?: {
    businessName: string;
    businessDomain: string | null;
    hasMetaAds: boolean;
    metaAdsCount: number;
    metaAdsStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown';
    metaPixelDetected: boolean;
    hasGoogleAds: boolean;
    googleAdsCount: number;
    googleAdsStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown';
    googleTagDetected: boolean;
    adPlatforms: string[];
    overallAdStatus: 'active' | 'paused_recently' | 'inactive' | 'unknown';
    campaignTypes: string[];
    investmentIndicator: 'recurring' | 'sporadic' | 'none' | 'unknown';
    estimatedMonthlySpend: 'low' | 'medium' | 'high' | 'unknown';
    lastAdDetectedAt: string | null;
  };
  scoring?: {
    opportunityScore: number;
    opportunityLevel: 'hot' | 'warm' | 'cool' | 'cold';
    digitalPresenceScore: number;
    digitalPresenceStatus: string;
    painPoints: string[];
    recommendedServices: string[];
    suggestedPitch: string;
    estimatedValueMin: number;
    estimatedValueMax: number;
    monthlyRecurrence: number;
    aiAnalysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      urgencyLevel: 'high' | 'medium' | 'low';
    };
  };
  enrichedAt: string;
}

interface UseLeadEnrichmentReturn {
  enrichedData: EnrichedLeadData | null;
  isLoading: boolean;
  error: string | null;
  enrichLead: (business: EnrichedLeadData['business'], affiliateId?: string, source?: 'radar' | 'encontrar_cliente' | 'manual') => Promise<EnrichedLeadData | null>;
  clearData: () => void;
}

export function useLeadEnrichment(): UseLeadEnrichmentReturn {
  const [enrichedData, setEnrichedData] = useState<EnrichedLeadData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrichLead = useCallback(async (
    business: EnrichedLeadData['business'],
    affiliateId?: string,
    source: 'radar' | 'encontrar_cliente' | 'manual' = 'manual'
  ): Promise<EnrichedLeadData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('enrich-lead-complete', {
        body: {
          business,
          affiliateId,
          source,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao enriquecer lead');
      }

      setEnrichedData(data.data);
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao enriquecer lead:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setEnrichedData(null);
    setError(null);
  }, []);

  return {
    enrichedData,
    isLoading,
    error,
    enrichLead,
    clearData,
  };
}
