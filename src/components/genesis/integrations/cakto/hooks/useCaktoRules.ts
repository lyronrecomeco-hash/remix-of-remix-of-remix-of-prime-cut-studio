/**
 * CAKTO RULES - HOOK
 * Gerencia regras de evento → campanha
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CaktoEventRule, CaktoEventType } from '../types';
import { toast } from 'sonner';

export function useCaktoRules(instanceId: string, integrationId?: string) {
  const [rules, setRules] = useState<CaktoEventRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!instanceId) {
      setRules([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      let query = supabase
        .from('genesis_cakto_event_rules')
        .select('*')
        .eq('instance_id', instanceId)
        .order('created_at', { ascending: true });

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        if (fetchError.code === '42P01') {
          setRules([]);
          return;
        }
        throw fetchError;
      }

      setRules((data || []) as CaktoEventRule[]);
    } catch (err) {
      console.error('Error fetching Cakto rules:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar regras');
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [instanceId, integrationId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  // Realtime
  useEffect(() => {
    if (!instanceId) return;

    const channel = supabase
      .channel(`cakto-rules-${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'genesis_cakto_event_rules',
          filter: `instance_id=eq.${instanceId}`,
        },
        () => {
          fetchRules();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [instanceId, fetchRules]);

  // Criar/atualizar regra
  const saveRule = async (
    eventType: CaktoEventType,
    campaignId: string | null,
    settings: Partial<Omit<CaktoEventRule, 'id' | 'instance_id' | 'integration_id' | 'event_type' | 'campaign_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!instanceId || !integrationId) {
      toast.error('Integração não configurada');
      return null;
    }

    setSaving(true);
    try {
      const existingRule = rules.find(r => r.event_type === eventType && r.campaign_id === campaignId);

      if (existingRule) {
        // Update
        const { data, error } = await supabase
          .from('genesis_cakto_event_rules')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRule.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Regra atualizada');
        return data as CaktoEventRule;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('genesis_cakto_event_rules')
          .insert({
            instance_id: instanceId,
            integration_id: integrationId,
            event_type: eventType,
            campaign_id: campaignId,
            ...settings,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success('Regra criada');
        return data as CaktoEventRule;
      }
    } catch (err) {
      console.error('Error saving rule:', err);
      toast.error('Erro ao salvar regra');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Excluir regra
  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('genesis_cakto_event_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast.success('Regra removida');
      return true;
    } catch (err) {
      console.error('Error deleting rule:', err);
      toast.error('Erro ao remover regra');
      return false;
    }
  };

  // Toggle ativo
  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('genesis_cakto_event_rules')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', ruleId);

      if (error) throw error;
      toast.success(isActive ? 'Regra ativada' : 'Regra desativada');
      return true;
    } catch (err) {
      console.error('Error toggling rule:', err);
      toast.error('Erro ao alterar status');
      return false;
    }
  };

  // Buscar regra por evento
  const getRuleByEvent = (eventType: CaktoEventType) => {
    return rules.filter(r => r.event_type === eventType);
  };

  return {
    rules,
    loading,
    error,
    saving,
    refetch: fetchRules,
    saveRule,
    deleteRule,
    toggleRule,
    getRuleByEvent,
  };
}
