export interface Prospect {
  id: string;
  affiliate_id: string;
  company_name: string;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_address: string | null;
  company_city: string | null;
  company_state: string | null;
  niche: string | null;
  analysis_data: AnalysisData | null;
  analysis_score: number;
  missing_features: string[];
  pain_points: string[];
  generated_proposal: ProposalData | null;
  proposal_generated_at: string | null;
  status: ProspectStatus;
  auto_send_enabled: boolean;
  scheduled_send_at: string | null;
  sent_at: string | null;
  sent_via: string | null;
  message_sent: string | null;
  reply_received: string | null;
  reply_received_at: string | null;
  source: string;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type ProspectStatus = 
  | 'pending' 
  | 'analyzing' 
  | 'analyzed' 
  | 'proposal_ready' 
  | 'sent' 
  | 'replied' 
  | 'converted' 
  | 'rejected' 
  | 'failed';

export interface AnalysisData {
  hasWebsite: boolean;
  hasWhatsAppButton: boolean;
  hasOnlineScheduling: boolean;
  hasChatbot: boolean;
  hasOnlinePayment: boolean;
  hasSocialMedia: boolean;
  hasSSL: boolean;
  isMobileResponsive: boolean;
  loadTime?: string;
  seoScore?: number;
  missingFeatures: string[];
  painPoints: string[];
  opportunities: string[];
}

export interface ProposalData {
  headline: string;
  problema_identificado: string;
  solucao_proposta: string;
  beneficios: string[];
  casos_de_sucesso: string;
  oferta_especial: string;
  investimento: string;
  proximo_passo: string;
  mensagem_whatsapp: string;
  assunto_email: string;
  raw_content?: string;
}

export interface ProspectSettings {
  id: string;
  affiliate_id: string;
  auto_send_enabled: boolean;
  genesis_instance_id: string | null;
  send_start_hour: number;
  send_end_hour: number;
  send_days: number[];
  daily_limit: number;
  messages_per_hour: number;
  min_delay_seconds: number;
  max_delay_seconds: number;
  warmup_enabled: boolean;
  warmup_day: number;
  warmup_increment_percent: number;
  message_template: string;
  include_proposal_link: boolean;
  include_analysis: boolean;
  total_sent_today: number;
  total_sent_week: number;
  total_sent_month: number;
  last_sent_at: string | null;
}

export interface ProspectStats {
  total: number;
  pending: number;
  analyzing: number;
  analyzed: number;
  proposal_ready: number;
  sent: number;
  replied: number;
  converted: number;
  failed: number;
  avgScore: number;
}
