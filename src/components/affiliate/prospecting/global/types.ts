// ==================== GLOBAL PROSPECTING TYPES ====================

/**
 * Contexto de Prospecção Global
 * Objeto principal que a IA recebe para gerar mensagens culturalmente adaptadas
 */
export interface ProspectingContext {
  id: string;
  region_code: RegionCode;
  country_code: string;
  country_name: string;
  language: string;
  timezone: string;
  formality_level: FormalityLevel;
  directness_level: DirectnessLevel;
  emoji_tolerance: EmojiTolerance;
  decision_speed: DecisionSpeed;
  channel_priority: ChannelType[];
  business_hours: BusinessHours;
  compliance_tags: string[];
  is_active: boolean;
}

/**
 * Template de Intenção para mensagens
 */
export interface IntentTemplate {
  id: string;
  context_id: string;
  intent: MessageIntent;
  base_message: string;
  subject_line: string | null;
  tone_guidelines: string;
  opening_style: string | null;
  closing_style: string | null;
  forbidden_patterns: string[];
  required_elements: string[];
  max_length: number;
  allowed_variables: string[];
  is_active: boolean;
  version: number;
}

/**
 * Log de mensagens geradas para auditoria
 */
export interface ProspectingMessageLog {
  id: string;
  affiliate_id: string;
  prospect_id: string | null;
  context_id: string | null;
  template_id: string | null;
  context_snapshot: ProspectingContext;
  intent: MessageIntent;
  generated_message: string;
  channel_used: ChannelType;
  auto_detected_country: string | null;
  auto_detected_language: string | null;
  detection_confidence: number | null;
  manual_override: boolean;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  replied_at: string | null;
  ai_model_used: string | null;
  tokens_used: number | null;
  generation_time_ms: number | null;
  created_at: string;
}

// ==================== ENUMS & TYPES ====================

export type RegionCode = 'LATAM' | 'NA' | 'EU' | 'ASIA';

export type FormalityLevel = 1 | 2 | 3 | 4 | 5; // 1=informal, 5=muito formal

export type DirectnessLevel = 1 | 2 | 3 | 4 | 5; // 1=indireto, 5=muito direto

export type EmojiTolerance = 0 | 1 | 2 | 3 | 4 | 5; // 0=proibido, 5=liberado

export type DecisionSpeed = 'fast' | 'medium' | 'slow';

export type ChannelType = 'whatsapp' | 'email' | 'linkedin' | 'phone' | 'sms' | 'kakaotalk';

export type MessageIntent = 
  | 'first_contact' 
  | 'follow_up' 
  | 'objection_handling' 
  | 'demo_request' 
  | 'closing' 
  | 'reactivation';

export interface BusinessHours {
  start: string; // "09:00"
  end: string;   // "18:00"
}

// ==================== AUTO-DETECTION ====================

export interface CountryDetectionResult {
  country_code: string | null;
  country_name: string | null;
  language: string | null;
  confidence: number; // 0.00 - 1.00
  source: 'phone' | 'domain' | 'manual';
  needs_confirmation: boolean;
}

export interface PhoneDetectionInput {
  phone: string;
}

export interface DomainDetectionInput {
  domain: string;
}

// ==================== GENERATION REQUEST ====================

export interface MessageGenerationRequest {
  context: ProspectingContext;
  template: IntentTemplate | null;
  intent: MessageIntent;
  prospect_data: {
    nome: string;
    empresa: string;
    cargo?: string;
    nicho?: string;
    beneficio_principal?: string;
    resultado_numerico?: string;
    [key: string]: string | undefined;
  };
  channel: ChannelType;
}

export interface MessageGenerationResponse {
  message: string;
  subject_line?: string;
  warnings: string[];
  compliance_checks: ComplianceCheck[];
  generation_time_ms: number;
  tokens_used: number;
}

export interface ComplianceCheck {
  tag: string;
  passed: boolean;
  message: string;
}

// ==================== UI STATE ====================

export interface GlobalProspectingState {
  selectedContext: ProspectingContext | null;
  selectedRegion: RegionCode | null;
  selectedCountry: string | null;
  autoDetectedContext: CountryDetectionResult | null;
  isLoading: boolean;
  error: string | null;
}

// ==================== LABELS & DESCRIPTIONS ====================

export const REGION_LABELS: Record<RegionCode, string> = {
  LATAM: 'América Latina',
  NA: 'América do Norte',
  EU: 'Europa',
  ASIA: 'Ásia & Oceania',
};

export const REGION_FLAGS: Record<RegionCode, string> = {
  LATAM: '🌎',
  NA: '🌎',
  EU: '🌍',
  ASIA: '🌏',
};

export const INTENT_LABELS: Record<MessageIntent, string> = {
  first_contact: 'Primeiro Contato',
  follow_up: 'Follow-up',
  objection_handling: 'Contorno de Objeção',
  demo_request: 'Agendamento de Demo',
  closing: 'Fechamento',
  reactivation: 'Reativação',
};

export const INTENT_DESCRIPTIONS: Record<MessageIntent, string> = {
  first_contact: 'Primeira abordagem ao prospect',
  follow_up: 'Acompanhamento após contato inicial',
  objection_handling: 'Resposta a objeções do prospect',
  demo_request: 'Confirmação de demonstração',
  closing: 'Fechamento da venda',
  reactivation: 'Reativação de lead inativo',
};

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  linkedin: 'LinkedIn',
  phone: 'Telefone',
  sms: 'SMS',
  kakaotalk: 'KakaoTalk',
};

export const CHANNEL_ICONS: Record<ChannelType, string> = {
  whatsapp: '📱',
  email: '📧',
  linkedin: '💼',
  phone: '📞',
  sms: '💬',
  kakaotalk: '💬',
};

export const FORMALITY_LABELS: Record<FormalityLevel, string> = {
  1: 'Muito Informal',
  2: 'Informal',
  3: 'Neutro',
  4: 'Formal',
  5: 'Muito Formal',
};

export const DIRECTNESS_LABELS: Record<DirectnessLevel, string> = {
  1: 'Muito Indireto',
  2: 'Indireto',
  3: 'Neutro',
  4: 'Direto',
  5: 'Muito Direto',
};

export const DECISION_SPEED_LABELS: Record<DecisionSpeed, string> = {
  fast: 'Rápida',
  medium: 'Média',
  slow: 'Lenta',
};

// ==================== COUNTRY PHONE PREFIXES ====================

export const COUNTRY_PHONE_PREFIXES: Record<string, string[]> = {
  BR: ['+55', '55'],
  US: ['+1'],
  CA: ['+1'],
  MX: ['+52', '52'],
  AR: ['+54', '54'],
  CO: ['+57', '57'],
  CL: ['+56', '56'],
  UK: ['+44', '44'],
  DE: ['+49', '49'],
  FR: ['+33', '33'],
  ES: ['+34', '34'],
  PT: ['+351', '351'],
  IT: ['+39', '39'],
  NL: ['+31', '31'],
  BE: ['+32', '32'],
  AT: ['+43', '43'],
  CH: ['+41', '41'],
  SE: ['+46', '46'],
  NO: ['+47', '47'],
  DK: ['+45', '45'],
  FI: ['+358', '358'],
  PL: ['+48', '48'],
  CZ: ['+420', '420'],
  JP: ['+81', '81'],
  KR: ['+82', '82'],
  SG: ['+65', '65'],
  AU: ['+61', '61'],
  NZ: ['+64', '64'],
  IN: ['+91', '91'],
  AE: ['+971', '971'],
  IL: ['+972', '972'],
};

// ==================== DOMAIN TLDs ====================

export const COUNTRY_TLDS: Record<string, string> = {
  '.br': 'BR',
  '.us': 'US',
  '.ca': 'CA',
  '.mx': 'MX',
  '.ar': 'AR',
  '.co': 'CO',
  '.cl': 'CL',
  '.uk': 'UK',
  '.de': 'DE',
  '.fr': 'FR',
  '.es': 'ES',
  '.pt': 'PT',
  '.it': 'IT',
  '.nl': 'NL',
  '.be': 'BE',
  '.at': 'AT',
  '.ch': 'CH',
  '.se': 'SE',
  '.no': 'NO',
  '.dk': 'DK',
  '.fi': 'FI',
  '.pl': 'PL',
  '.cz': 'CZ',
  '.jp': 'JP',
  '.kr': 'KR',
  '.sg': 'SG',
  '.au': 'AU',
  '.nz': 'NZ',
  '.in': 'IN',
  '.ae': 'AE',
  '.il': 'IL',
};
