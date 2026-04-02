import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PRESENCE_UPDATE_INTERVAL = 30000;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const ACTIVITY_SYNC_DEBOUNCE = 700;

type PresenceDetails = {
  userAgent: string;
  viewport: string;
  currentAction: string | null;
  lastSearch: string | null;
  lastClick: string | null;
};

function normalizeText(value: string | null | undefined, maxLength = 80) {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function isSearchLikeInput(target: HTMLInputElement | HTMLTextAreaElement) {
  const fingerprint = [
    target.type,
    target.name,
    target.id,
    target.placeholder,
    target.getAttribute('aria-label'),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return /search|buscar|pesquisa|pesquisar|filtro|filter|query/.test(fingerprint);
}

export function PresenceTracker() {
  const { user } = useAuth();
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartRef = useRef<string | null>(null);
  const detailsRef = useRef<PresenceDetails>({
    userAgent: '',
    viewport: '',
    currentAction: null,
    lastSearch: null,
    lastClick: null,
  });

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      const currentPage = `${window.location.pathname}${window.location.search}`;
      detailsRef.current.userAgent = navigator.userAgent.slice(0, 120);
      detailsRef.current.viewport = `${window.innerWidth}x${window.innerHeight}`;

      const { error } = await supabase
        .from('user_presence')
        .upsert(
          {
            user_id: user.id,
            is_online: isOnline,
            last_seen_at: new Date().toISOString(),
            last_login_at: isOnline && !sessionStartRef.current ? new Date().toISOString() : undefined,
            current_page: currentPage,
            device_info: JSON.stringify(detailsRef.current),
            session_started_at: sessionStartRef.current || new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          },
        );

      if (error && !error.message.includes('duplicate')) {
        console.error('[PresenceTracker] Error updating presence:', error);
      }

      if (!sessionStartRef.current && isOnline) {
        sessionStartRef.current = new Date().toISOString();
      }
    } catch (err) {
      console.error('[PresenceTracker] Exception:', err);
    }
  }, [user]);

  const schedulePresenceSync = useCallback((isOnline: boolean) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      updatePresence(isOnline);
    }, ACTIVITY_SYNC_DEBOUNCE);
  }, [updatePresence]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const checkInactivity = useCallback(() => {
    const timeSinceActivity = Date.now() - lastActivityRef.current;
    return timeSinceActivity < INACTIVITY_TIMEOUT;
  }, []);

  useEffect(() => {
    if (!user) return;

    updatePresence(true);

    intervalRef.current = setInterval(() => {
      const isActive = checkInactivity();
      updatePresence(isActive);
    }, PRESENCE_UPDATE_INTERVAL);

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const handleClick = (event: Event) => {
      handleActivity();
      const target = event.target as Element | null;
      const interactive = target?.closest('button, a, [role="button"], [role="tab"], [role="menuitem"]');
      const label = normalizeText(interactive?.textContent || interactive?.getAttribute('aria-label'));
      if (!label) return;

      detailsRef.current.lastClick = label;
      detailsRef.current.currentAction = `Interagindo com ${label}`;
      schedulePresenceSync(true);
    };

    const handleInput = (event: Event) => {
      handleActivity();
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (!isSearchLikeInput(target)) return;

      const term = normalizeText(target.value, 100);
      detailsRef.current.lastSearch = term;
      detailsRef.current.currentAction = term ? `Pesquisando por ${term}` : 'Navegando no sistema';
      schedulePresenceSync(true);
    };

    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        handleActivity();
        detailsRef.current.currentAction = 'Navegando no sistema';
        updatePresence(true);
      }
    };

    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('input', handleInput, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('click', handleClick);
      window.removeEventListener('input', handleInput);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updatePresence(false);
    };
  }, [user, updatePresence, handleActivity, checkInactivity, schedulePresenceSync]);

  return null;
}

export default PresenceTracker;
