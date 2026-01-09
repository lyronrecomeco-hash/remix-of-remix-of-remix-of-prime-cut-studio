import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  onboarding_completed: boolean;
  onboarding_step: number;
  keyboard_shortcuts_enabled: boolean;
  notifications_enabled: boolean;
  language: string;
  timezone: string;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  onboarding_completed: false,
  onboarding_step: 0,
  keyboard_shortcuts_enabled: true,
  notifications_enabled: true,
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences
  useEffect(() => {
    if (!user) {
      // Use localStorage for unauthenticated users
      const stored = localStorage.getItem('user_preferences');
      if (stored) {
        try {
          setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
        } catch {
          setPreferences(defaultPreferences);
        }
      }
      setIsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading preferences:', error);
        }

        if (data) {
          setPreferences({
            theme: data.theme as UserPreferences['theme'],
            onboarding_completed: data.onboarding_completed,
            onboarding_step: data.onboarding_step,
            keyboard_shortcuts_enabled: data.keyboard_shortcuts_enabled,
            notifications_enabled: data.notifications_enabled,
            language: data.language,
            timezone: data.timezone,
          });
        } else {
          // Create default preferences for new user
          await supabase.from('user_preferences').insert({
            user_id: user.id,
            ...defaultPreferences,
          });
        }
      } catch (err) {
        console.error('Error in loadPreferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Apply theme
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (preferences.theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', isDark);
        root.classList.toggle('genesis-dark', isDark);
        root.classList.toggle('genesis-light', !isDark);
      } else {
        root.classList.toggle('dark', preferences.theme === 'dark');
        root.classList.toggle('genesis-dark', preferences.theme === 'dark');
        root.classList.toggle('genesis-light', preferences.theme === 'light');
      }
    };

    applyTheme();

    // Listen for system theme changes
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [preferences.theme]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    if (!user) {
      localStorage.setItem('user_preferences', JSON.stringify(newPreferences));
      return;
    }

    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Error updating preferences:', err);
    }
  }, [user, preferences]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    updatePreferences({ theme: newTheme });
  }, [preferences.theme, updatePreferences]);

  // Set specific theme
  const setTheme = useCallback((theme: UserPreferences['theme']) => {
    updatePreferences({ theme });
  }, [updatePreferences]);

  // Complete onboarding step
  const completeOnboardingStep = useCallback((step: number) => {
    updatePreferences({ 
      onboarding_step: step,
      onboarding_completed: step >= 5, // Assuming 5 steps
    });
  }, [updatePreferences]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    toggleTheme,
    setTheme,
    completeOnboardingStep,
    isLightMode: preferences.theme === 'light',
    isDarkMode: preferences.theme === 'dark',
  };
}

export default useUserPreferences;
