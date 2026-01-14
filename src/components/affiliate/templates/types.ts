// Tipos para o Sistema de Templates Personalizados

export interface TemplateConfig {
  business: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    slogan: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  };
  language: string;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  features: {
    showPricing: boolean;
    showTeam: boolean;
    showGallery: boolean;
  };
}

export interface AffiliateTemplateConfig {
  id: string;
  affiliate_id: string;
  template_slug: string;
  template_name: string;
  unique_code: string;
  client_name: string | null;
  config: TemplateConfig;
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  route: string;
  gradient: string;
  accent: string;
  available: boolean;
  preview: {
    title: string;
    subtitle: string;
    badge: string;
  };
}

export const DEFAULT_CONFIG: TemplateConfig = {
  business: {
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    slogan: '',
  },
  branding: {
    primaryColor: '#D4AF37',
    secondaryColor: '#1A1A1A',
    accentColor: '#FFFFFF',
    logoUrl: null,
  },
  language: 'pt-BR',
  typography: {
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
  },
  features: {
    showPricing: true,
    showTeam: true,
    showGallery: false,
  },
};

export const AVAILABLE_LANGUAGES = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Español' },
];

export const AVAILABLE_FONTS = [
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Oswald', label: 'Oswald' },
];
