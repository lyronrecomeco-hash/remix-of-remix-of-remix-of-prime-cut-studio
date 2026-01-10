/**
 * CAKTO EVENTS - HOOK
 * Busca eventos recebidos da Cakto com paginação
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CaktoEvent, CaktoEventType } from '../types';

interface UseEventsOptions {
  limit?: number;
  eventType?: CaktoEventType;
}

export function useCaktoEvents(instanceId: string, options: UseEventsOptions = {}) {
  const { limit = 50, eventType } = options;
  const [events, setEvents] = useState<CaktoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchEvents = useCallback(async (reset: boolean = false) => {
    if (!instanceId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setOffset(0);
      }

      let query = supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: false })
        .range(reset ? 0 : offset, (reset ? 0 : offset) + limit - 1);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        if (fetchError.code === '42P01') {
          setEvents([]);
          setHasMore(false);
          return;
        }
        throw fetchError;
      }

      const newEvents = (data || []) as CaktoEvent[];
      
      if (reset) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setHasMore(newEvents.length === limit);
      if (!reset) {
        setOffset(prev => prev + newEvents.length);
      }
    } catch (err) {
      console.error('Error fetching Cakto events:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [instanceId, limit, eventType, offset]);

  // Fetch inicial
  useEffect(() => {
    fetchEvents(true);
  }, [instanceId, eventType]);

  // Realtime updates
  useEffect(() => {
    if (!instanceId) return;

    const channel = supabase
      .channel(`cakto-events-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'genesis_cakto_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          if (payload.new) {
            setEvents(prev => [payload.new as CaktoEvent, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'genesis_cakto_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          if (payload.new) {
            setEvents(prev => 
              prev.map(e => e.id === (payload.new as CaktoEvent).id ? payload.new as CaktoEvent : e)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [instanceId]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchEvents(false);
    }
  };

  return {
    events,
    loading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchEvents(true),
  };
}
