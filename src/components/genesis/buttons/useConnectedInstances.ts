import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { InstanceOption } from './types';
import { 
  normalizeStatus, 
  calculateHeartbeatState, 
  calculateIsUsable 
} from '../hooks/useUnifiedInstanceStatus';

export function useConnectedInstances() {
  const { genesisUser } = useGenesisAuth();
  const [instances, setInstances] = useState<InstanceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async () => {
    if (!genesisUser?.id) {
      setInstances([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('genesis_instances')
        .select('id, name, phone_number, orchestrated_status, effective_status, status, last_heartbeat')
        .eq('user_id', genesisUser.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Filter only connected and usable instances
      const connectedInstances = (data || []).filter(instance => {
        const rawStatus = instance.orchestrated_status || instance.effective_status || instance.status;
        const status = normalizeStatus(rawStatus);
        const heartbeatState = calculateHeartbeatState(instance.last_heartbeat);
        const isUsable = calculateIsUsable(status, heartbeatState);
        
        return status === 'connected' && isUsable;
      });

      setInstances(connectedInstances);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching instances:', err);
      setError(err.message || 'Erro ao carregar instâncias');
    } finally {
      setLoading(false);
    }
  }, [genesisUser?.id]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  return { instances, loading, error, refetch: fetchInstances };
}
