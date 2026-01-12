import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GenesisInstanceData {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'qr_pending';
}

export function useGenesisInstances() {
  const [instances, setInstances] = useState<GenesisInstanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInstances([]);
        return;
      }

      // Find genesis user by email
      const { data: genesisUser, error: genesisError } = await supabase
        .from('genesis_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (genesisError) {
        console.error('Error fetching genesis user:', genesisError);
        setError('Erro ao buscar usuário');
        return;
      }

      if (!genesisUser) {
        setInstances([]);
        return;
      }

      // Fetch instances for this genesis user
      const { data: instancesData, error: instancesError } = await supabase
        .from('genesis_instances')
        .select('id, name, phone_number, status')
        .eq('user_id', genesisUser.id)
        .order('created_at', { ascending: false });

      if (instancesError) {
        console.error('Error fetching instances:', instancesError);
        setError('Erro ao buscar instâncias');
        return;
      }

      const mapped: GenesisInstanceData[] = (instancesData || []).map(inst => ({
        id: inst.id,
        name: inst.name || 'Sem nome',
        phone: inst.phone_number || '',
        status: (inst.status as 'connected' | 'disconnected' | 'qr_pending') || 'disconnected'
      }));

      setInstances(mapped);
    } catch (err) {
      console.error('Error in fetchInstances:', err);
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  return {
    instances,
    loading,
    error,
    refetch: fetchInstances,
    connectedCount: instances.filter(i => i.status === 'connected').length
  };
}
