/**
 * Genesis Economy Integration Hook
 * Integrates the new economy system with the Genesis panel
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';

export interface EconomyPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  is_recommended: boolean;
  price_monthly: number;
  price_yearly: number | null;
  billing_cycle: string;
  credits_included: number;
  max_instances: number;
  max_flows: number;
  max_messages_month: number;
  max_ai_calls_month: number;
  max_webhooks: number;
  features_enabled: {
    chatbot?: boolean;
    flow_builder?: boolean;
    luna_ai?: boolean;
    templates?: boolean;
    priority_support?: boolean;
  } | Record<string, unknown>;
  overusage_behavior: string;
  processing_priority: number;
  display_order: number;
}

export interface EconomyCreditPackage {
  id: string;
  name: string;
  credits_amount: number;
  price: number;
  price_per_credit: number;
  bonus_credits: number;
  is_active: boolean;
  is_recommended: boolean;
  is_not_recommended: boolean;
  expiration_days: number | null;
  display_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  messages_used: number;
  ai_calls_used: number;
  flow_executions_used: number;
  webhooks_used: number;
  usage_reset_at: string;
  plan?: EconomyPlan;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits_purchased: number;
  credits_bonus: number;
  credits_used: number;
  credits_available: number;
  expires_at: string | null;
}

export interface ConsumptionRule {
  id: string;
  action_type: string;
  action_label: string;
  credits_cost: number;
  description: string;
  is_active: boolean;
  priority_source: string;
}

export function useGenesisEconomyIntegration() {
  const { genesisUser } = useGenesisAuth();
  const queryClient = useQueryClient();

  // Fetch active plans
  const plansQuery = useQuery({
    queryKey: ['economy-plans-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as EconomyPlan[];
    },
  });

  // Fetch active credit packages
  const packagesQuery = useQuery({
    queryKey: ['economy-packages-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as EconomyCreditPackage[];
    },
  });

  // Fetch consumption rules
  const rulesQuery = useQuery({
    queryKey: ['economy-rules-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_consumption_rules')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data as ConsumptionRule[];
    },
  });

  // Fetch user's active subscription
  const subscriptionQuery = useQuery({
    queryKey: ['user-subscription', genesisUser?.id],
    queryFn: async () => {
      if (!genesisUser?.id) return null;

      const { data, error } = await supabase
        .from('genesis_economy_user_subscriptions')
        .select(`
          *,
          genesis_economy_plans (*)
        `)
        .eq('user_id', genesisUser.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          plan: data.genesis_economy_plans as unknown as EconomyPlan,
        } as UserSubscription & { plan: EconomyPlan };
      }
      
      return null;
    },
    enabled: !!genesisUser?.id,
  });

  // Fetch user's credits
  const creditsQuery = useQuery({
    queryKey: ['user-credits', genesisUser?.id],
    queryFn: async () => {
      if (!genesisUser?.id) return null;

      const { data, error } = await supabase
        .from('genesis_economy_user_credits')
        .select('*')
        .eq('user_id', genesisUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Sum all available credits
      const totalCredits = data?.reduce((sum, credit) => {
        // Check if not expired
        if (credit.expires_at && new Date(credit.expires_at) < new Date()) {
          return sum;
        }
        return sum + (credit.credits_available || 0);
      }, 0) || 0;

      return {
        total: totalCredits,
        details: data as UserCredits[],
      };
    },
    enabled: !!genesisUser?.id,
  });

  // Fetch consumption history
  const consumptionQuery = useQuery({
    queryKey: ['consumption-history', genesisUser?.id],
    queryFn: async () => {
      if (!genesisUser?.id) return [];

      const { data, error } = await supabase
        .from('genesis_economy_consumption_log')
        .select('*')
        .eq('user_id', genesisUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!genesisUser?.id,
  });

  // Calculate usage stats
  const usageStats = {
    messagesUsed: subscriptionQuery.data?.messages_used || 0,
    messagesLimit: subscriptionQuery.data?.plan?.max_messages_month || 0,
    aiCallsUsed: subscriptionQuery.data?.ai_calls_used || 0,
    aiCallsLimit: subscriptionQuery.data?.plan?.max_ai_calls_month || 0,
    flowExecutionsUsed: subscriptionQuery.data?.flow_executions_used || 0,
    flowsLimit: subscriptionQuery.data?.plan?.max_flows || 0,
    webhooksUsed: subscriptionQuery.data?.webhooks_used || 0,
    webhooksLimit: subscriptionQuery.data?.plan?.max_webhooks || 0,
    creditsAvailable: creditsQuery.data?.total || 0,
    currentPlan: subscriptionQuery.data?.plan || null,
    features: subscriptionQuery.data?.plan?.features_enabled || {
      chatbot: true,
      flow_builder: false,
      luna_ai: false,
      templates: false,
      priority_support: false,
    },
  };

  // Check if user can perform action
  const canPerformAction = (actionType: string): { allowed: boolean; reason?: string } => {
    const rule = rulesQuery.data?.find(r => r.action_type === actionType);
    if (!rule) return { allowed: true };

    const creditsCost = rule.credits_cost;
    const subscription = subscriptionQuery.data;
    const credits = creditsQuery.data?.total || 0;

    // Check plan limits first
    if (subscription?.plan) {
      const plan = subscription.plan;
      
      if (actionType.includes('message') && subscription.messages_used >= plan.max_messages_month) {
        if (plan.overusage_behavior === 'block') {
          return { allowed: false, reason: 'Limite de mensagens do plano atingido' };
        }
        // If charge_credits, check credits
        if (plan.overusage_behavior === 'charge_credits' && credits < creditsCost) {
          return { allowed: false, reason: 'Créditos insuficientes' };
        }
      }

      if (actionType.includes('ai') && subscription.ai_calls_used >= plan.max_ai_calls_month) {
        if (plan.overusage_behavior === 'block') {
          return { allowed: false, reason: 'Limite de chamadas IA do plano atingido' };
        }
        if (plan.overusage_behavior === 'charge_credits' && credits < creditsCost) {
          return { allowed: false, reason: 'Créditos insuficientes' };
        }
      }
    }

    // If no subscription, check credits
    if (!subscription && credits < creditsCost) {
      return { allowed: false, reason: 'Créditos insuficientes' };
    }

    return { allowed: true };
  };

  return {
    // Data
    plans: plansQuery.data || [],
    packages: packagesQuery.data || [],
    rules: rulesQuery.data || [],
    subscription: subscriptionQuery.data,
    credits: creditsQuery.data,
    consumptionHistory: consumptionQuery.data || [],
    usageStats,

    // Loading states
    isLoading: plansQuery.isLoading || packagesQuery.isLoading || subscriptionQuery.isLoading,
    isLoadingCredits: creditsQuery.isLoading,

    // Helpers
    canPerformAction,

    // Refetch
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-plans-active'] });
      queryClient.invalidateQueries({ queryKey: ['economy-packages-active'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
    },
  };
}
