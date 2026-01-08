/**
 * Genesis Economy System - Data Hooks
 * Enterprise-grade hooks for economy management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============ TYPES ============

export interface EconomyPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  is_recommended: boolean;
  price_monthly: number;
  price_yearly: number | null;
  billing_cycle: 'monthly' | 'yearly' | 'lifetime';
  credits_included: number;
  max_instances: number;
  max_flows: number;
  max_messages_month: number;
  max_ai_calls_month: number;
  max_webhooks: number;
  features_enabled: {
    chatbot: boolean;
    flow_builder: boolean;
    luna_ai: boolean;
    templates: boolean;
    priority_support: boolean;
  };
  overusage_behavior: 'block' | 'charge_credits' | 'suggest_upgrade';
  processing_priority: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreditPackage {
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
  created_at: string;
  updated_at: string;
}

export interface ConsumptionRule {
  id: string;
  action_type: string;
  action_label: string;
  credits_cost: number;
  description: string | null;
  is_active: boolean;
  priority_source: 'plan_first' | 'credits_first' | 'plan_only' | 'credits_only';
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'suspended' | 'trial';
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  messages_used: number;
  ai_calls_used: number;
  flow_executions_used: number;
  webhooks_used: number;
  usage_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConsumptionLog {
  id: string;
  user_id: string;
  action_type: string;
  credits_consumed: number;
  source_type: 'plan' | 'credits' | 'bonus';
  source_id: string | null;
  instance_id: string | null;
  chatbot_id: string | null;
  flow_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface EconomyAnalytics {
  id: string;
  date: string;
  metric_type: string;
  metric_value: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============ PLANS HOOKS ============

export function useEconomyPlans() {
  return useQuery({
    queryKey: ['economy-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as EconomyPlan[];
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EconomyPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('genesis_economy_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-plans'] });
      toast.success('Plano atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar plano: ' + error.message);
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Omit<EconomyPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('genesis_economy_plans')
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-plans'] });
      toast.success('Plano criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar plano: ' + error.message);
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('genesis_economy_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-plans'] });
      toast.success('Plano removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover plano: ' + error.message);
    },
  });
}

// ============ CREDIT PACKAGES HOOKS ============

export function useCreditPackages() {
  return useQuery({
    queryKey: ['economy-credit-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_credit_packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as CreditPackage[];
    },
  });
}

export function useUpdateCreditPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CreditPackage> & { id: string }) => {
      const { data, error } = await supabase
        .from('genesis_economy_credit_packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-credit-packages'] });
      toast.success('Pacote atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pacote: ' + error.message);
    },
  });
}

export function useCreateCreditPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pkg: Omit<CreditPackage, 'id' | 'created_at' | 'updated_at' | 'price_per_credit'>) => {
      const { data, error } = await supabase
        .from('genesis_economy_credit_packages')
        .insert(pkg)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-credit-packages'] });
      toast.success('Pacote criado');
    },
    onError: (error) => {
      toast.error('Erro ao criar pacote: ' + error.message);
    },
  });
}

export function useDeleteCreditPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('genesis_economy_credit_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-credit-packages'] });
      toast.success('Pacote removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover pacote: ' + error.message);
    },
  });
}

// ============ CONSUMPTION RULES HOOKS ============

export function useConsumptionRules() {
  return useQuery({
    queryKey: ['economy-consumption-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_consumption_rules')
        .select('*')
        .order('action_type', { ascending: true });

      if (error) throw error;
      return data as ConsumptionRule[];
    },
  });
}

export function useUpdateConsumptionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ConsumptionRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('genesis_economy_consumption_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-consumption-rules'] });
      toast.success('Regra atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar regra: ' + error.message);
    },
  });
}

export function useCreateConsumptionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<ConsumptionRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('genesis_economy_consumption_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economy-consumption-rules'] });
      toast.success('Regra criada');
    },
    onError: (error) => {
      toast.error('Erro ao criar regra: ' + error.message);
    },
  });
}

// ============ SUBSCRIPTIONS HOOKS ============

export function useUserSubscriptions() {
  return useQuery({
    queryKey: ['economy-user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genesis_economy_user_subscriptions')
        .select(`
          *,
          genesis_users (id, email, name),
          genesis_economy_plans (name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ============ CONSUMPTION LOGS HOOKS ============

export function useConsumptionLogs(options?: { limit?: number; userId?: string }) {
  return useQuery({
    queryKey: ['economy-consumption-logs', options],
    queryFn: async () => {
      let query = supabase
        .from('genesis_economy_consumption_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConsumptionLog[];
    },
  });
}

// ============ ANALYTICS HOOKS ============

export function useEconomyAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['economy-analytics', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('genesis_economy_analytics')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EconomyAnalytics[];
    },
  });
}

// ============ AGGREGATED STATS ============

export function useEconomyStats() {
  return useQuery({
    queryKey: ['economy-stats'],
    queryFn: async () => {
      // Get active subscriptions count by plan
      const { data: subsData } = await supabase
        .from('genesis_economy_user_subscriptions')
        .select('plan_id, status')
        .eq('status', 'active');

      // Get total consumption last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: consumptionData } = await supabase
        .from('genesis_economy_consumption_log')
        .select('credits_consumed, action_type')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get plans data
      const { data: plansData } = await supabase
        .from('genesis_economy_plans')
        .select('id, name, price_monthly')
        .eq('is_active', true);

      const totalActiveSubscriptions = subsData?.length || 0;
      const totalCreditsConsumed = consumptionData?.reduce((sum, log) => sum + Number(log.credits_consumed), 0) || 0;
      
      // Calculate MRR
      const planPrices = new Map(plansData?.map(p => [p.id, p.price_monthly]) || []);
      const mrr = subsData?.reduce((sum, sub) => sum + (planPrices.get(sub.plan_id) || 0), 0) || 0;

      return {
        totalActiveSubscriptions,
        totalCreditsConsumed,
        mrr,
        consumptionByAction: consumptionData?.reduce((acc, log) => {
          acc[log.action_type] = (acc[log.action_type] || 0) + Number(log.credits_consumed);
          return acc;
        }, {} as Record<string, number>) || {},
      };
    },
  });
}
