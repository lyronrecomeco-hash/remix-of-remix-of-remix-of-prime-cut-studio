/**
 * Hook for syncing Cakto data (products and orders)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncStats {
  total: number;
  inserted: number;
  skipped: number;
  errors: number;
}

interface UseCaktoSyncReturn {
  syncProducts: (integrationId: string) => Promise<boolean>;
  syncOrders: (integrationId: string, options?: { startDate?: string; fullSync?: boolean }) => Promise<boolean>;
  syncAll: (integrationId: string) => Promise<boolean>;
  loading: boolean;
  lastSyncStats: SyncStats | null;
}

export function useCaktoSync(): UseCaktoSyncReturn {
  const [loading, setLoading] = useState(false);
  const [lastSyncStats, setLastSyncStats] = useState<SyncStats | null>(null);

  const syncProducts = useCallback(async (integrationId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cakto-sync', {
        body: {
          action: 'sync_products',
          integrationId,
        },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message || 'Produtos sincronizados!');
        return true;
      } else {
        toast.error(data?.error || 'Erro ao sincronizar produtos');
        return false;
      }
    } catch (err) {
      console.error('[useCaktoSync] syncProducts error:', err);
      toast.error('Erro ao sincronizar produtos');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncOrders = useCallback(async (
    integrationId: string, 
    options?: { startDate?: string; fullSync?: boolean }
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cakto-sync', {
        body: {
          action: 'sync_orders',
          integrationId,
          startDate: options?.startDate,
          fullSync: options?.fullSync,
        },
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(data.message || 'Pedidos sincronizados!');
        if (data.stats) {
          setLastSyncStats(data.stats);
        }
        return true;
      } else {
        toast.error(data?.error || 'Erro ao sincronizar pedidos');
        return false;
      }
    } catch (err) {
      console.error('[useCaktoSync] syncOrders error:', err);
      toast.error('Erro ao sincronizar pedidos');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAll = useCallback(async (integrationId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Sync products first
      const productsSuccess = await syncProducts(integrationId);
      if (!productsSuccess) {
        toast.warning('Produtos não sincronizados, continuando com pedidos...');
      }

      // Then sync orders
      const ordersSuccess = await syncOrders(integrationId);
      
      if (productsSuccess && ordersSuccess) {
        toast.success('Sincronização completa!');
        return true;
      }
      
      return ordersSuccess;
    } catch (err) {
      console.error('[useCaktoSync] syncAll error:', err);
      toast.error('Erro na sincronização');
      return false;
    } finally {
      setLoading(false);
    }
  }, [syncProducts, syncOrders]);

  return {
    syncProducts,
    syncOrders,
    syncAll,
    loading,
    lastSyncStats,
  };
}
