import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

export type IntegrationProvider = 'shopify' | 'woocommerce' | 'nuvemshop' | 'mercadoshops' | 'rdstation' | 'cakto';
export type IntegrationStatus = 'pending' | 'connected' | 'error' | 'disconnected';

export interface InstanceIntegration {
  id: string;
  instance_id: string;
  user_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  store_url?: string;
  store_name?: string;
  webhook_url?: string;
  error_message?: string;
  last_sync_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export function useInstanceIntegrations(instanceId: string) {
  const { genesisUser } = useGenesisAuth();
  const [integrations, setIntegrations] = useState<InstanceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!instanceId || !genesisUser?.id) {
      setIntegrations([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('genesis_instance_integrations')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('user_id', genesisUser.id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        // Table may not exist yet
        if (fetchError.code === '42P01') {
          setIntegrations([]);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      setIntegrations((data || []) as InstanceIntegration[]);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar integrações');
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }, [instanceId, genesisUser?.id]);

  // Initial fetch
  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // Realtime updates
  useEffect(() => {
    if (!instanceId) return;

    const channel = supabase
      .channel(`integrations-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genesis_instance_integrations',
          filter: `instance_id=eq.${instanceId}`,
        },
        () => {
          fetchIntegrations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [instanceId, fetchIntegrations]);

  // Get integration by provider
  const getIntegration = useCallback((provider: IntegrationProvider): InstanceIntegration | undefined => {
    return integrations.find(i => i.provider === provider);
  }, [integrations]);

  // Check if provider is connected
  const isConnected = useCallback((provider: IntegrationProvider): boolean => {
    const integration = getIntegration(provider);
    return integration?.status === 'connected';
  }, [getIntegration]);

  // Get status for a provider
  const getStatus = useCallback((provider: IntegrationProvider): IntegrationStatus | null => {
    const integration = getIntegration(provider);
    return integration?.status ?? null;
  }, [getIntegration]);

  return {
    integrations,
    loading,
    error,
    refetch: fetchIntegrations,
    getIntegration,
    isConnected,
    getStatus,
  };
}
