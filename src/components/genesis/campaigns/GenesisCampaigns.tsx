/**
 * GENESIS CAMPAIGNS - Main Container Component
 * Enterprise-grade WhatsApp campaign management
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useCampaigns } from './useCampaigns';
import { CampaignsList } from './CampaignsList';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CampaignDetails } from './CampaignDetails';
import type { Campaign, CampaignFormData, CampaignContact, CampaignLog } from './types';

export function GenesisCampaigns() {
  const {
    campaigns,
    loading,
    fetchCampaigns,
    createCampaign,
    addContacts,
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    cancelCampaign,
    getCampaignContacts,
    getCampaignLogs,
  } = useCampaigns();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignContacts, setCampaignContacts] = useState<CampaignContact[]>([]);
  const [campaignLogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Handle create campaign
  const handleCreateCampaign = async (formData: CampaignFormData) => {
    const campaign = await createCampaign({
      instance_id: formData.instance_id,
      name: formData.name,
      description: formData.description,
      campaign_type: formData.campaign_type,
      message_template: formData.message_template,
      media_url: formData.media_url,
      media_type: formData.media_type,
      luna_enabled: formData.luna_enabled,
      luna_variations_count: formData.luna_variations_count,
      luna_similarity_level: formData.luna_similarity_level,
      delay_min_seconds: formData.delay_min_seconds,
      delay_max_seconds: formData.delay_max_seconds,
      batch_size: formData.batch_size,
      pause_after_batch: formData.pause_after_batch,
      pause_duration_seconds: formData.pause_duration_seconds,
      send_window_start: formData.send_window_start,
      send_window_end: formData.send_window_end,
      send_on_weekends: formData.send_on_weekends,
      total_contacts: formData.contacts.length,
      credits_estimated: formData.contacts.length,
    });

    if (campaign) {
      // Add contacts
      await addContacts(campaign.id, formData.contacts);
      setShowCreateModal(false);
      toast.success('Campanha criada! Configure e inicie quando estiver pronto.');
    }
  };

  // View campaign details
  const handleViewDetails = useCallback(async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailsLoading(true);
    
    try {
      const [contacts, logs] = await Promise.all([
        getCampaignContacts(campaign.id),
        getCampaignLogs(campaign.id),
      ]);
      setCampaignContacts(contacts);
      setCampaignLogs(logs);
    } catch (error) {
      console.error('Error loading campaign details:', error);
    } finally {
      setDetailsLoading(false);
    }
  }, [getCampaignContacts, getCampaignLogs]);

  // Refresh campaign details
  const handleRefreshDetails = useCallback(async () => {
    if (!selectedCampaign) return;
    
    setDetailsLoading(true);
    await fetchCampaigns();
    
    try {
      const [contacts, logs] = await Promise.all([
        getCampaignContacts(selectedCampaign.id),
        getCampaignLogs(selectedCampaign.id),
      ]);
      setCampaignContacts(contacts);
      setCampaignLogs(logs);
      
      // Update selected campaign with fresh data
      const updated = campaigns.find(c => c.id === selectedCampaign.id);
      if (updated) setSelectedCampaign(updated);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setDetailsLoading(false);
    }
  }, [selectedCampaign, fetchCampaigns, getCampaignContacts, getCampaignLogs, campaigns]);

  // Handle start campaign
  const handleStart = async (id: string) => {
    const success = await startCampaign(id);
    if (success) {
      toast.success('Campanha iniciada!');
      if (selectedCampaign?.id === id) {
        handleRefreshDetails();
      }
    }
  };

  // Handle pause campaign
  const handlePause = async (id: string) => {
    const success = await pauseCampaign(id);
    if (success) {
      toast.info('Campanha pausada');
      if (selectedCampaign?.id === id) {
        handleRefreshDetails();
      }
    }
  };

  // Handle cancel campaign
  const handleCancel = async () => {
    if (!selectedCampaign) return;
    const success = await cancelCampaign(selectedCampaign.id);
    if (success) {
      toast.info('Campanha cancelada');
      handleRefreshDetails();
    }
  };

  // Show details view
  if (selectedCampaign) {
    // Find updated campaign data
    const currentCampaign = campaigns.find(c => c.id === selectedCampaign.id) || selectedCampaign;
    
    return (
      <CampaignDetails
        campaign={currentCampaign}
        contacts={campaignContacts}
        logs={campaignLogs}
        onBack={() => setSelectedCampaign(null)}
        onStart={() => handleStart(currentCampaign.id)}
        onPause={() => handlePause(currentCampaign.id)}
        onCancel={handleCancel}
        onRefresh={handleRefreshDetails}
        loading={detailsLoading}
      />
    );
  }

  return (
    <>
      <CampaignsList
        campaigns={campaigns}
        loading={loading}
        onCreateNew={() => setShowCreateModal(true)}
        onViewDetails={handleViewDetails}
        onStart={handleStart}
        onPause={handlePause}
        onDelete={deleteCampaign}
      />

      <CreateCampaignModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={handleCreateCampaign}
      />
    </>
  );
}
