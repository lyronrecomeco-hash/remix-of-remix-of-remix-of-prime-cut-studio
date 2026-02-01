import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GymThemeSettings {
  id?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  card_color: string;
  text_color: string;
}

const defaultTheme: GymThemeSettings = {
  primary_color: '#F97316',
  secondary_color: '#EA580C',
  accent_color: '#FB923C',
  background_color: '#09090B',
  card_color: '#18181B',
  text_color: '#FAFAFA',
};

// Convert hex to HSL
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Apply theme to CSS variables
function applyThemeToDOM(theme: GymThemeSettings) {
  const root = document.documentElement;
  
  // Apply gym-specific CSS variables
  root.style.setProperty('--gym-primary', hexToHSL(theme.primary_color));
  root.style.setProperty('--gym-secondary', hexToHSL(theme.secondary_color));
  root.style.setProperty('--gym-accent', hexToHSL(theme.accent_color));
  root.style.setProperty('--gym-background', hexToHSL(theme.background_color));
  root.style.setProperty('--gym-card', hexToHSL(theme.card_color));
  root.style.setProperty('--gym-text', hexToHSL(theme.text_color));
  
  // Store in localStorage for immediate access on reload
  localStorage.setItem('gym_theme', JSON.stringify(theme));
}

// Load theme from localStorage on initial page load
function loadThemeFromLocalStorage() {
  try {
    const stored = localStorage.getItem('gym_theme');
    if (stored) {
      const theme = JSON.parse(stored) as GymThemeSettings;
      applyThemeToDOM(theme);
      return theme;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function useGymTheme() {
  const [theme, setTheme] = useState<GymThemeSettings>(() => {
    return loadThemeFromLocalStorage() || defaultTheme;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch theme from database
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data, error } = await supabase
          .from('gym_theme_settings')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching theme:', error);
          return;
        }

        if (data) {
          const fetchedTheme: GymThemeSettings = {
            id: data.id,
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            accent_color: data.accent_color,
            background_color: data.background_color,
            card_color: data.card_color,
            text_color: data.text_color,
          };
          setTheme(fetchedTheme);
          applyThemeToDOM(fetchedTheme);
        } else {
          // Apply default theme
          applyThemeToDOM(defaultTheme);
        }
      } catch (err) {
        console.error('Error in fetchTheme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Update theme locally (for preview)
  const updateThemePreview = useCallback((updates: Partial<GymThemeSettings>) => {
    setTheme(prev => {
      const newTheme = { ...prev, ...updates };
      applyThemeToDOM(newTheme);
      return newTheme;
    });
  }, []);

  // Save theme to database
  const saveTheme = useCallback(async (themeToSave?: GymThemeSettings) => {
    const finalTheme = themeToSave || theme;
    setIsSaving(true);
    
    try {
      if (finalTheme.id) {
        // Update existing
        const { error } = await supabase
          .from('gym_theme_settings')
          .update({
            primary_color: finalTheme.primary_color,
            secondary_color: finalTheme.secondary_color,
            accent_color: finalTheme.accent_color,
            background_color: finalTheme.background_color,
            card_color: finalTheme.card_color,
            text_color: finalTheme.text_color,
          })
          .eq('id', finalTheme.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('gym_theme_settings')
          .insert({
            primary_color: finalTheme.primary_color,
            secondary_color: finalTheme.secondary_color,
            accent_color: finalTheme.accent_color,
            background_color: finalTheme.background_color,
            card_color: finalTheme.card_color,
            text_color: finalTheme.text_color,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setTheme(prev => ({ ...prev, id: data.id }));
        }
      }

      applyThemeToDOM(finalTheme);
      toast.success('Tema salvo com sucesso!');
      return true;
    } catch (err) {
      console.error('Error saving theme:', err);
      toast.error('Erro ao salvar tema');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [theme]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    const newTheme = { ...defaultTheme, id: theme.id };
    setTheme(newTheme);
    applyThemeToDOM(newTheme);
  }, [theme.id]);

  return {
    theme,
    isLoading,
    isSaving,
    updateThemePreview,
    saveTheme,
    resetToDefault,
    defaultTheme,
  };
}

export default useGymTheme;
