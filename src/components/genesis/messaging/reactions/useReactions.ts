import { useState, useCallback } from 'react';
import type { Reaction } from '../types';

export const useReactions = (instanceId: string) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    if (!instanceId) return;
    
    setLoading(true);
    // TODO: Implement when whatsapp_reactions table is created
    // For now, reactions will be captured via VPS script and displayed here
    console.log('Reactions fetch not yet implemented - table needs to be created');
    setLoading(false);
  }, [instanceId]);

  return {
    reactions,
    loading,
    refresh: fetchReactions
  };
};
