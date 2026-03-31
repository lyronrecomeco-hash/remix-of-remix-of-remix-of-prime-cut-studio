import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SiteCustomization, DEFAULT_CUSTOMIZATION } from '@/types/siteCustomization';

function deepMerge(defaults: any, overrides: any): any {
  const result = { ...defaults };
  for (const key in overrides) {
    if (
      overrides[key] &&
      typeof overrides[key] === 'object' &&
      !Array.isArray(overrides[key]) &&
      defaults[key] &&
      typeof defaults[key] === 'object'
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else if (overrides[key] !== undefined) {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function useSiteCustomization() {
  const [customization, setCustomization] = useState<SiteCustomization>(DEFAULT_CUSTOMIZATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('settings')
          .eq('setting_type', 'site_customization')
          .is('user_id', null)
          .maybeSingle();

        if (data?.settings) {
          setCustomization(deepMerge(DEFAULT_CUSTOMIZATION, data.settings));
        }
      } catch (error) {
        console.error('Error loading site customization:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { customization, loading };
}
