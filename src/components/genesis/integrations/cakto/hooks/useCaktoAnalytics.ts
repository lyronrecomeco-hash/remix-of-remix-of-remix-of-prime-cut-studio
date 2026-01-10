/**
 * CAKTO ANALYTICS - HOOK
 * Busca dados agregados de analytics da Cakto
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CaktoAnalytics, AnalyticsPeriod } from '../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  checkouts_started: number;
  purchases_approved: number;
  purchases_refused: number;
  purchases_refunded: number;
  cart_abandonments: number;
  total_revenue: number;
  conversion_rate: number;
  daily: CaktoAnalytics[];
}

export function useCaktoAnalytics(instanceId: string, integrationId?: string, period: AnalyticsPeriod = '7d') {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (period) {
      case 'today':
        start = startOfDay(new Date());
        break;
      case '7d':
        start = startOfDay(subDays(new Date(), 7));
        break;
      case '30d':
        start = startOfDay(subDays(new Date(), 30));
        break;
      default:
        start = startOfDay(subDays(new Date(), 7));
    }

    return { start, end };
  }, [period]);

  const fetchAnalytics = useCallback(async () => {
    if (!instanceId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      let query = supabase
        .from('genesis_cakto_analytics')
        .select('*')
        .eq('instance_id', instanceId)
        .gte('date', format(dateRange.start, 'yyyy-MM-dd'))
        .lte('date', format(dateRange.end, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data: analytics, error: fetchError } = await query;

      if (fetchError) {
        // Tabela pode não existir ainda
        if (fetchError.code === '42P01') {
          setData({
            checkouts_started: 0,
            purchases_approved: 0,
            purchases_refused: 0,
            purchases_refunded: 0,
            cart_abandonments: 0,
            total_revenue: 0,
            conversion_rate: 0,
            daily: [],
          });
          return;
        }
        throw fetchError;
      }

      // Agregar dados
      const totals = (analytics || []).reduce(
        (acc, day) => ({
          checkouts_started: acc.checkouts_started + (day.checkouts_started || 0),
          purchases_approved: acc.purchases_approved + (day.purchases_approved || 0),
          purchases_refused: acc.purchases_refused + (day.purchases_refused || 0),
          purchases_refunded: acc.purchases_refunded + (day.purchases_refunded || 0),
          cart_abandonments: acc.cart_abandonments + (day.cart_abandonments || 0),
          total_revenue: acc.total_revenue + Number(day.total_revenue || 0),
        }),
        {
          checkouts_started: 0,
          purchases_approved: 0,
          purchases_refused: 0,
          purchases_refunded: 0,
          cart_abandonments: 0,
          total_revenue: 0,
        }
      );

      // Calcular taxa de conversão
      const conversionRate = totals.checkouts_started > 0
        ? (totals.purchases_approved / totals.checkouts_started) * 100
        : 0;

      setData({
        ...totals,
        conversion_rate: conversionRate,
        daily: (analytics || []) as CaktoAnalytics[],
      });
    } catch (err) {
      console.error('Error fetching Cakto analytics:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [instanceId, integrationId, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Realtime updates - both analytics and events tables
  useEffect(() => {
    if (!instanceId) return;

    // Channel for analytics table
    const analyticsChannel = supabase
      .channel(`cakto-analytics-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genesis_cakto_analytics',
          filter: `instance_id=eq.${instanceId}`,
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    // Channel for events table - triggers analytics refetch on new events
    const eventsChannel = supabase
      .channel(`cakto-events-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'genesis_cakto_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        () => {
          // Refetch analytics when new event arrives
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      analyticsChannel.unsubscribe();
      eventsChannel.unsubscribe();
    };
  }, [instanceId, fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
