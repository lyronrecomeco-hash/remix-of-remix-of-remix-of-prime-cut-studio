/**
 * GENESIS CAMPAIGNS - Types & Interfaces
 * Enterprise-grade campaign system types v2.0
 * Anti-Ban System Enabled
 */

// Tipos simplificados de campanha para facilitar entendimento
export type CampaignType = 'marketing' | 'notificacao' | 'integracao';

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
  | 'cooldown'
  | 'blacklisted';

export type LunaSimilarityLevel = 'low' | 'medium' | 'high';

export type BlacklistReason = 'blocked' | 'unsubscribed' | 'spam_reported' | 'manual' | 'quarantine';

export type SpamWordSeverity = 'low' | 'medium' | 'high' | 'critical';

// Anti-Ban Configuration
export interface AntiBanConfig {
  useInstancePool: boolean;
  typingSimulation: boolean;
  typingDurationMin: number;
  typingDurationMax: number;
  adaptiveDelay: boolean;
  respectWarmup: boolean;
  checkBlacklist: boolean;
  quarantineDays: number;
  prioritizeWarmLeads: boolean;
  peakHoursBoost: boolean;
  spamWordCheck: boolean;
  cooldownAfterBlockMinutes: number;
  maxBlocksBeforePause: number;
}

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
  // Anti-ban controls (legacy)
  delay_min_seconds: number;
  delay_max_seconds: number;
  batch_size: number;
  pause_after_batch: number;
  pause_duration_seconds: number;
  send_window_start: string;
  send_window_end: string;
  send_on_weekends: boolean;
  // Anti-ban controls v2.0
  use_instance_pool?: boolean;
  typing_simulation?: boolean;
  typing_duration_min?: number;
  typing_duration_max?: number;
  adaptive_delay?: boolean;
  respect_warmup?: boolean;
  check_blacklist?: boolean;
  quarantine_days?: number;
  prioritize_warm_leads?: boolean;
  peak_hours_boost?: boolean;
  spam_word_check?: boolean;
  cooldown_after_block_minutes?: number;
  max_blocks_before_pause?: number;
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
  // Anti-ban v2.0
  is_warm_lead?: boolean;
  previous_interaction_count?: number;
  spam_score?: number;
  instance_used_id?: string;
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
  // Anti-ban v2.0
  global_blacklist_enabled?: boolean;
  default_quarantine_days?: number;
  warmup_required_for_new?: boolean;
  peak_hours_start?: string;
  peak_hours_end?: string;
  peak_hours_afternoon_start?: string;
  peak_hours_afternoon_end?: string;
  max_daily_per_instance?: number;
  spam_word_block_level?: string;
  created_at: string;
  updated_at: string;
}

// Instance Pool for campaigns
export interface CampaignInstancePool {
  id: string;
  campaign_id: string;
  instance_id: string;
  priority: number;
  weight: number;
  is_active: boolean;
  messages_sent: number;
  messages_failed: number;
  blocks_count: number;
  last_used_at?: string;
  cooldown_until?: string;
  health_score: number;
  created_at: string;
}

// Contact Blacklist
export interface ContactBlacklist {
  id: string;
  user_id: string;
  phone_hash: string;
  phone_last4?: string;
  reason: BlacklistReason;
  source_campaign_id?: string;
  quarantine_until?: string;
  created_at: string;
}

// Instance Health Metrics
export interface InstanceHealthMetrics {
  id: string;
  instance_id: string;
  period_date: string;
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  messages_replied: number;
  messages_failed: number;
  messages_blocked: number;
  health_score: number;
  degradation_level: number;
  created_at: string;
  updated_at: string;
}

// Instance Warmup
export interface InstanceWarmup {
  id: string;
  instance_id: string;
  warmup_started_at: string;
  warmup_day: number;
  warmup_completed: boolean;
  warmup_completed_at?: string;
  day1_limit: number;
  day2_limit: number;
  day3_limit: number;
  day4_limit: number;
  day5_limit: number;
  day6_limit: number;
  day7_limit: number;
  day8_limit: number;
  day9_limit: number;
  day10_limit: number;
  messages_sent_today: number;
  last_message_date?: string;
  created_at: string;
  updated_at: string;
}

// Spam Words
export interface SpamWord {
  id: string;
  word: string;
  severity: SpamWordSeverity;
  category: string;
  is_active: boolean;
  created_at: string;
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
  // Anti-ban v2.0
  use_instance_pool?: boolean;
  typing_simulation?: boolean;
  adaptive_delay?: boolean;
  respect_warmup?: boolean;
  check_blacklist?: boolean;
  prioritize_warm_leads?: boolean;
  peak_hours_boost?: boolean;
  spam_word_check?: boolean;
}

export interface CampaignFormData extends 
  CampaignStep1Data, 
  CampaignStep2Data, 
  CampaignStep3Data, 
  CampaignStep4Data {}

// Labels simplificados e claros
export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  marketing: '📢 Marketing / Promoção',
  notificacao: '🔔 Notificação / Lembrete',
  integracao: '🔗 Acionada por Integração',
};

// Descrições para ajudar o usuário a entender cada tipo
export const CAMPAIGN_TYPE_DESCRIPTIONS: Record<CampaignType, string> = {
  marketing: 'Disparo em massa de promoções, novidades ou reengajamento',
  notificacao: 'Avisos, lembretes, confirmações e notificações',
  integracao: 'Acionada automaticamente por integrações (Shopify, WooCommerce, etc)',
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

// Anti-ban feature labels
export const ANTI_BAN_FEATURE_LABELS = {
  use_instance_pool: '🔄 Pool de Instâncias (Rotação)',
  typing_simulation: '⌨️ Simulação de Digitação',
  adaptive_delay: '⏱️ Delay Adaptativo',
  respect_warmup: '🌡️ Respeitar Warmup',
  check_blacklist: '🚫 Verificar Blacklist',
  prioritize_warm_leads: '🔥 Priorizar Warm Leads',
  peak_hours_boost: '📈 Boost Horário de Pico',
  spam_word_check: '🔍 Verificar Spam Words',
};

export const ANTI_BAN_FEATURE_DESCRIPTIONS = {
  use_instance_pool: 'Distribui envios entre múltiplas instâncias para reduzir risco de ban',
  typing_simulation: 'Envia indicador "digitando..." antes da mensagem para parecer humano',
  adaptive_delay: 'Ajusta delays automaticamente baseado em horário, volume e taxa de falha',
  respect_warmup: 'Respeita limites de envio para números novos em aquecimento',
  check_blacklist: 'Ignora contatos que já bloquearam ou reportaram spam',
  prioritize_warm_leads: 'Envia primeiro para contatos que já interagiram antes',
  peak_hours_boost: 'Otimiza envios para horários de maior engajamento',
  spam_word_check: 'Verifica mensagem por palavras que triggam filtros anti-spam',
};
