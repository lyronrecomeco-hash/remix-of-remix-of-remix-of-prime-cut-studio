import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SiteCustomization } from '@/components/genesis-ia/settings/SiteCustomizationSection';

const DEFAULT_CUSTOMIZATION: SiteCustomization = {
  header: {
    title: 'Genesis Hub',
    subtitle: '',
  },
  hero: {
    badge: '🚀 Plataforma #1 em Automação Inteligente',
    title: 'Transforme seu negócio com',
    highlight: 'Inteligência Artificial',
    subtitle: 'A plataforma mais completa para automação de atendimento, geração de leads e gestão inteligente do seu negócio.',
    ctaText: 'Começar Agora',
    ctaSecondaryText: 'Ver Demonstração',
  },
  pricing: {
    title: 'Planos e Preços',
    subtitle: 'Escolha o plano ideal para o seu negócio',
  },
  footer: {
    description: 'A plataforma mais completa para automação e gestão inteligente do seu negócio.',
    copyright: '© 2025 Genesis Hub. Todos os direitos reservados.',
  },
};

export function useSiteCustomization() {
  const [customization, setCustomization] = useState<SiteCustomization>(DEFAULT_CUSTOMIZATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomization();
  }, []);

  const loadCustomization = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('settings')
        .eq('setting_type', 'site_customization')
        .is('user_id', null)
        .maybeSingle();

      if (data?.settings) {
        setCustomization({ ...DEFAULT_CUSTOMIZATION, ...(data.settings as Partial<SiteCustomization>) });
      }
    } catch (error) {
      console.error('Error loading site customization:', error);
    } finally {
      setLoading(false);
    }
  };

  return { customization, loading };
}
