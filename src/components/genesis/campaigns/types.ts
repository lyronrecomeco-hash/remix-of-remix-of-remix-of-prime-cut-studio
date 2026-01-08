/**
 * GENESIS CAMPAIGNS - Types & Interfaces
 * Enterprise-grade campaign system types
 */

export type CampaignType = 'mass_send' | 'reengagement' | 'promotion' | 'reminder' | 'custom';

export type CampaignStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'stopped_by_system';

export type ContactStatus = 
  | 'pending' 
  | 'queued' 
  | 'sending' 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'replied' 
  | 'failed' 
  | 'blocked' 
  | 'skipped' 
  | 'rate_limited' 
  | 'cooldown';

export type LunaSimilarityLevel = 'low' | 'medium' | 'high';

export interface Campaign {
  id: string;
  user_id: string;
  instance_id: string;
  name: string;
  description?: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  // Message
  message_template: string;
  message_variables?: Record<string, unknown>;
  media_url?: string;
  media_type?: string;
  // Luna AI
  luna_enabled: boolean;
  luna_variations_count: number;
  luna_similarity_level: LunaSimilarityLevel;
  luna_generated_variations?: string[];
  // Anti-ban controls
  delay_min_seconds: number;
  delay_max_seconds: number;
  batch_size: number;
  pause_after_batch: number;
  pause_duration_seconds: number;
  send_window_start: string;
  send_window_end: string;
  send_on_weekends: boolean;
  // Stats
  total_contacts: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  replied_count: number;
  failed_count: number;
  blocked_count: number;
  // Economy
  credits_estimated: number;
  credits_consumed: number;
  // Time
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
  metadata?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  updated_at: string;
  // Relations
  instance?: {
    id: string;
    name: string;
    status: string;
    phone_number?: string;
  };
}

export interface CampaignContact {
  id: string;
  campaign_id: string;
  contact_phone: string;
  contact_name?: string;
  contact_data?: Record<string, unknown>;
  status: ContactStatus;
  message_sent?: string;
  variation_index?: number;
  attempt_count: number;
  max_attempts: number;
  locked_at?: string;
  last_attempt_at?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  replied_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignLog {
  id: string;
  campaign_id: string;
  contact_id?: string;
  event_type: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface CampaignAudience {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  filters: Record<string, unknown>;
  contact_count: number;
  last_calculated_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignSettings {
  id: string;
  user_id: string;
  max_messages_per_minute: number;
  max_messages_per_hour: number;
  max_messages_per_day: number;
  auto_pause_on_block: boolean;
  block_threshold: number;
  cooldown_after_block_hours: number;
  typing_simulation: boolean;
  read_receipt_delay: boolean;
  emergency_stop_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Step wizard types
export interface CampaignStep1Data {
  name: string;
  description: string;
  campaign_type: CampaignType;
  instance_id: string;
}

export interface CampaignStep2Data {
  contacts: Array<{
    phone: string;
    name?: string;
    data?: Record<string, unknown>;
  }>;
  audience_id?: string;
}

export interface CampaignStep3Data {
  message_template: string;
  media_url?: string;
  media_type?: string;
  luna_enabled: boolean;
  luna_variations_count: number;
  luna_similarity_level: LunaSimilarityLevel;
}

export interface CampaignStep4Data {
  delay_min_seconds: number;
  delay_max_seconds: number;
  batch_size: number;
  pause_after_batch: number;
  pause_duration_seconds: number;
  send_window_start: string;
  send_window_end: string;
  send_on_weekends: boolean;
}

export interface CampaignFormData extends 
  CampaignStep1Data, 
  CampaignStep2Data, 
  CampaignStep3Data, 
  CampaignStep4Data {}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  mass_send: 'Disparo em Massa',
  reengagement: 'Reengajamento',
  promotion: 'Promoção',
  reminder: 'Aviso / Lembrete',
  custom: 'Personalizado',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  running: 'Em Execução',
  paused: 'Pausada',
  completed: 'Concluída',
  failed: 'Falhou',
  cancelled: 'Cancelada',
  stopped_by_system: 'Parada pelo Sistema',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  running: 'bg-green-500/10 text-green-500 border-green-500/20',
  paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  stopped_by_system: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};
