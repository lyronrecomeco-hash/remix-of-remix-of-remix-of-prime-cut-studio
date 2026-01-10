/**
 * GENESIS CAMPAIGNS - Hook for campaign management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';
import type { Campaign, CampaignContact, CampaignLog, CampaignSettings } from './types';

export function useCampaigns() {
  const { genesisUser } = useGenesisAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CampaignSettings | null>(null);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async () => {
    if (!genesisUser) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('genesis_campaigns')
        .select(`
          *,
          instance:genesis_instances(id, name, status, phone_number)
        `)
        .eq('user_id', genesisUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as unknown as Campaign[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  }, [genesisUser]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!genesisUser) return;

    try {
      const { data, error } = await supabase
        .from('genesis_campaign_settings')
        .select('*')
        .eq('user_id', genesisUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('genesis_campaign_settings')
          .insert({ user_id: genesisUser.id })
          .select()
          .single();
        
        if (createError) throw createError;
        setSettings(newSettings as unknown as CampaignSettings);
      } else {
        setSettings(data as unknown as CampaignSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [genesisUser]);

  useEffect(() => {
    fetchCampaigns();
    fetchSettings();
  }, [fetchCampaigns, fetchSettings]);

  // Create campaign
  const createCampaign = async (campaignData: Record<string, unknown>) => {
    if (!genesisUser) return null;

    try {
      const insertData = {
        ...campaignData,
        user_id: genesisUser.id,
      };
      
      const { data, error } = await supabase
        .from('genesis_campaigns')
        .insert(insertData as never)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Campanha criada com sucesso!');
      await fetchCampaigns();
      return data as unknown as Campaign;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Erro ao criar campanha');
      return null;
    }
  };

  // Update campaign
  const updateCampaign = async (id: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('genesis_campaigns')
        .update(updates as never)
        .eq('id', id);

      if (error) throw error;
      
      await fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Erro ao atualizar campanha');
      return false;
    }
  };

  // Delete campaign
  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('genesis_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Campanha excluída');
      await fetchCampaigns();
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Erro ao excluir campanha');
      return false;
    }
  };

  // Add contacts to campaign
  const addContacts = async (campaignId: string, contacts: Array<{ phone: string; name?: string }>) => {
    try {
      const contactsToInsert = contacts.map(c => ({
        campaign_id: campaignId,
        contact_phone: c.phone,
        contact_name: c.name || null,
      }));

      const { error } = await supabase
        .from('genesis_campaign_contacts')
        .insert(contactsToInsert as never);

      if (error) throw error;

      // Update total_contacts
      await supabase
        .from('genesis_campaigns')
        .update({ total_contacts: contacts.length })
        .eq('id', campaignId);

      return true;
    } catch (error) {
      console.error('Error adding contacts:', error);
      toast.error('Erro ao adicionar contatos');
      return false;
    }
  };

  // Get campaign contacts
  const getCampaignContacts = async (campaignId: string): Promise<CampaignContact[]> => {
    try {
      const { data, error } = await supabase
        .from('genesis_campaign_contacts')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as CampaignContact[];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  };

  // Get campaign logs
  const getCampaignLogs = async (campaignId: string): Promise<CampaignLog[]> => {
    try {
      const { data, error } = await supabase
        .from('genesis_campaign_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as unknown as CampaignLog[];
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  };

  // Start campaign - calls edge function worker
  const startCampaign = async (id: string): Promise<{ 
    success: boolean; 
    outsideWindow?: boolean; 
    windowStart?: string; 
    windowEnd?: string;
    errorType?: string;
    errorMessage?: string;
  }> => {
    try {
      // Call the campaign worker edge function (don't update status first - let worker handle it)
      const { data, error } = await supabase.functions.invoke('genesis-campaign-worker', {
        body: { campaign_id: id, action: 'start' }
      });

      if (error) {
        console.error('Error starting campaign worker:', error);
        toast.error('Erro ao conectar com servidor');
        return { success: false, errorType: 'connection', errorMessage: 'Erro ao conectar com servidor' };
      }

      if (!data?.success) {
        const errorMsg = data?.error || '';
        
        // Check if it's a send window error
        if (errorMsg.includes('Envio permitido apenas entre')) {
          const match = errorMsg.match(/entre (\d{2}:\d{2}(?::\d{2})?) e (\d{2}:\d{2}(?::\d{2})?)/);
          return { 
            success: false, 
            outsideWindow: true,
            windowStart: match?.[1]?.substring(0, 5) || '08:00',
            windowEnd: match?.[2]?.substring(0, 5) || '22:00'
          };
        }
        
        // Check if backend not configured
        if (errorMsg.includes('Backend não configurado') || errorMsg.includes('URL do Backend')) {
          toast.error('Backend WhatsApp não configurado para esta instância. Configure o backend primeiro.');
          return { success: false, errorType: 'backend', errorMessage: errorMsg };
        }
        
        // Check if instance not connected
        if (errorMsg.includes('não está conectada') || errorMsg.includes('Instância')) {
          toast.error('Instância WhatsApp não está conectada. Conecte a instância primeiro.');
          return { success: false, errorType: 'instance', errorMessage: errorMsg };
        }

        toast.error(errorMsg || 'Erro ao processar campanha');
        return { success: false, errorType: 'unknown', errorMessage: errorMsg };
      }

      const processedCount = data.processed || 0;
      const remainingCount = data.remaining || 0;
      
      if (data.hasMore) {
        toast.success(`Campanha iniciada! ${processedCount} enviadas, ${remainingCount} restantes. Processando...`);
      } else if (data.completed) {
        toast.success('Campanha concluída com sucesso!');
      } else {
        toast.success(`Campanha iniciada! ${processedCount} mensagens processadas.`);
      }
      
      // Refresh campaigns list
      await fetchCampaigns();
      
      return { success: true };
    } catch (error) {
      console.error('Error starting campaign:', error);
      toast.error('Erro ao iniciar campanha');
      return { success: false, errorType: 'exception', errorMessage: String(error) };
    }
  };

  // Pause campaign
  const pauseCampaign = async (id: string) => {
    return updateCampaign(id, { 
      status: 'paused', 
      paused_at: new Date().toISOString() 
    });
  };

  // Cancel campaign
  const cancelCampaign = async (id: string) => {
    return updateCampaign(id, { status: 'cancelled' });
  };

  // Retry pending contacts (queued, pending, failed, or undelivered)
  const retryPendingContacts = async (campaignId: string): Promise<{ success: boolean; count: number }> => {
    try {
      // Get count of pending/failed contacts
      const { data: pendingContacts, error: fetchError } = await supabase
        .from('genesis_campaign_contacts')
        .select('id')
        .eq('campaign_id', campaignId)
        .in('status', ['queued', 'pending', 'failed', 'rate_limited', 'cooldown', 'undelivered']);

      if (fetchError) throw fetchError;

      const pendingCount = pendingContacts?.length || 0;
      
      if (pendingCount === 0) {
        toast.info('Não há contatos pendentes para reenviar');
        return { success: false, count: 0 };
      }

      // Reset pending contacts to 'pending' status
      const { error: updateError } = await supabase
        .from('genesis_campaign_contacts')
        .update({ 
          status: 'pending', 
          attempt_count: 0,
          error_message: null,
          locked_at: null,
          sent_at: null,
          message_sent: null
        } as never)
        .eq('campaign_id', campaignId)
        .in('status', ['queued', 'pending', 'failed', 'rate_limited', 'cooldown', 'undelivered']);

      if (updateError) throw updateError;

      // Update campaign status to draft if completed/failed
      const { error: campaignError } = await supabase
        .from('genesis_campaigns')
        .update({ status: 'draft' } as never)
        .eq('id', campaignId)
        .in('status', ['completed', 'failed', 'cancelled', 'stopped_by_system']);

      if (campaignError) {
        console.warn('Could not reset campaign status:', campaignError);
      }

      // Log retry action
      await supabase.from('genesis_campaign_logs').insert({
        campaign_id: campaignId,
        event_type: 'retry_pending',
        severity: 'info',
        message: `Reenvio iniciado para ${pendingCount} contatos pendentes`,
        details: { pending_count: pendingCount }
      } as never);

      toast.success(`${pendingCount} contatos preparados para reenvio. Clique em "Iniciar" para continuar.`);
      await fetchCampaigns();
      
      return { success: true, count: pendingCount };
    } catch (error) {
      console.error('Error retrying pending contacts:', error);
      toast.error('Erro ao preparar reenvio');
      return { success: false, count: 0 };
    }
  };

  // Mark sent contacts as undelivered for retry
  const markSentAsUndelivered = async (campaignId: string, contactIds?: string[]): Promise<{ success: boolean; count: number }> => {
    try {
      let query = supabase
        .from('genesis_campaign_contacts')
        .update({ 
          status: 'undelivered',
          error_message: 'Marcado para reenvio - não confirmado'
        } as never)
        .eq('campaign_id', campaignId)
        .eq('status', 'sent');

      if (contactIds && contactIds.length > 0) {
        query = query.in('id', contactIds);
      }

      const { error, count } = await query;

      if (error) throw error;

      const markedCount = count || 0;

      if (markedCount === 0) {
        toast.info('Nenhum contato para marcar como não entregue');
        return { success: false, count: 0 };
      }

      // Log action
      await supabase.from('genesis_campaign_logs').insert({
        campaign_id: campaignId,
        event_type: 'mark_undelivered',
        severity: 'warning',
        message: `${markedCount} contatos marcados como não entregues para reenvio`,
        details: { marked_count: markedCount, specific_ids: contactIds || 'all_sent' }
      } as never);

      toast.success(`${markedCount} contatos marcados para reenvio`);
      await fetchCampaigns();
      
      return { success: true, count: markedCount };
    } catch (error) {
      console.error('Error marking as undelivered:', error);
      toast.error('Erro ao marcar para reenvio');
      return { success: false, count: 0 };
    }
  };

  return {
    campaigns,
    loading,
    settings,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addContacts,
    getCampaignContacts,
    getCampaignLogs,
    startCampaign,
    pauseCampaign,
    cancelCampaign,
    retryPendingContacts,
    markSentAsUndelivered,
  };
}
