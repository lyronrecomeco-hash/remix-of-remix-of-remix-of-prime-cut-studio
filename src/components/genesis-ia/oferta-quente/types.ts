export interface HotOffer {
  id?: string;
  niche: string;
  headline: string;
  copy: string;
  cta_text: string;
  platform: string;
  format: string;
  heat_score: number;
  days_active: number;
  advertiser_name: string;
  creative_url: string | null;
  landing_url: string | null;
  hook: string | null;
  promise: string | null;
  mental_trigger: string | null;
  angle: string | null;
  ideal_niches: string[] | null;
  suggested_ticket: number | null;
  closing_chance: number | null;
  ai_blueprint: any | null;
  engagement_score: number;
  recurrence_count: number;
  country: string;
  language: string;
  tags: string[];
  is_saved?: boolean;
  created_at?: string;
}

export interface SearchFilters {
  platform: string;
  minScore: number;
  sortBy: 'heat_score' | 'days_active' | 'recurrence_count' | 'suggested_ticket';
  format: string;
}

export interface TrendingNiche {
  name: string;
  count: number;
  avgScore: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

export const NICHES = [
  'Estética', 'Odontologia', 'Emagrecimento', 'Fitness', 'Educação',
  'Marketing Digital', 'Finanças', 'Imobiliário', 'E-commerce', 'SaaS',
  'Saúde Mental', 'Nutrição', 'Advocacia', 'Contabilidade', 'Coaching',
  'Infoprodutos', 'Dropshipping', 'Restaurantes', 'Pet Shop', 'Moda',
];

export const PLATFORMS = [
  { value: 'all', label: 'Todas' },
  { value: 'Meta', label: 'Meta Ads' },
  { value: 'Google', label: 'Google Ads' },
  { value: 'TikTok', label: 'TikTok Ads' },
  { value: 'YouTube', label: 'YouTube Ads' },
];
