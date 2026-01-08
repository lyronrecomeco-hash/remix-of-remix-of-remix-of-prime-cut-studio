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
  const startCampaign = async (id: string) => {
    try {
      // First update status to running
      const updated = await updateCampaign(id, { 
        status: 'running', 
        started_at: new Date().toISOString() 
      });

      if (!updated) return false;

      // Call the campaign worker edge function
      const { data, error } = await supabase.functions.invoke('genesis-campaign-worker', {
        body: { campaign_id: id, action: 'start' }
      });

      if (error) {
        console.error('Error starting campaign worker:', error);
        toast.error('Erro ao iniciar worker da campanha');
        // Revert status if worker fails
        await updateCampaign(id, { status: 'draft' });
        return false;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Erro ao processar campanha');
        await updateCampaign(id, { status: 'draft' });
        return false;
      }

      toast.success(`Campanha iniciada! ${data.processed || 0} mensagens na fila.`);
      return true;
    } catch (error) {
      console.error('Error starting campaign:', error);
      toast.error('Erro ao iniciar campanha');
      return false;
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
  };
}
