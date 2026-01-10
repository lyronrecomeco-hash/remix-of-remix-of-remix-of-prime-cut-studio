/**
 * CAKTO INTEGRATION - HOOK PRINCIPAL
 * Gerencia estado da integração Cakto para uma instância
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

export interface CaktoIntegrationData {
  id: string;
  instance_id: string;
  provider: string;
  status: string;
  store_url?: string;
  store_name?: string;
  metadata: Record<string, unknown>;
  is_active?: boolean;
  webhook_url?: string;
  error_message?: string;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export function useCaktoIntegration(instanceId: string) {
  const { genesisUser } = useGenesisAuth();
  const [integration, setIntegration] = useState<CaktoIntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegration = useCallback(async () => {
    if (!instanceId || !genesisUser?.id) {
      setIntegration(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('genesis_instance_integrations')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('provider', 'cakto')
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setIntegration(data as CaktoIntegrationData | null);
    } catch (err) {
      console.error('Error fetching Cakto integration:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar integração');
      setIntegration(null);
    } finally {
      setLoading(false);
    }
  }, [instanceId, genesisUser?.id]);

  // Fetch inicial
  useEffect(() => {
    fetchIntegration();
  }, [fetchIntegration]);

  // Realtime updates
  useEffect(() => {
    if (!instanceId) return;

    const channel = supabase
      .channel(`cakto-integration-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genesis_instance_integrations',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as Record<string, unknown>).provider === 'cakto') {
            setIntegration(payload.new as CaktoIntegrationData);
          } else if (payload.eventType === 'DELETE' && payload.old && (payload.old as Record<string, unknown>).provider === 'cakto') {
            setIntegration(null);
          } else {
            fetchIntegration();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [instanceId, fetchIntegration]);

  // Helpers
  const isConnected = integration?.status === 'connected';
  const isActive = integration?.is_active !== false; // Default to true if undefined
  const hasError = integration?.status === 'error';

  return {
    integration,
    loading,
    error,
    isConnected,
    isActive,
    hasError,
    refetch: fetchIntegration,
  };
}
