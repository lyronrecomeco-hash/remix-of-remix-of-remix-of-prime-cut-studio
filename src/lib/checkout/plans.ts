/**
 * CHECKOUT SYSTEM - Plans API
 * Funções para buscar e gerenciar planos
 */

import { supabase } from '@/integrations/supabase/client';

export interface CheckoutPlan {
  id: string;
  name: string;
  displayName: string;
  priceCents: number;
  promoPriceCents: number | null;
  durationMonths: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  discountPercentage: number | null;
  tagline: string | null;
}

/**
 * Busca todos os planos ativos
 */
export async function getActivePlans(): Promise<CheckoutPlan[]> {
  const { data, error } = await supabase
    .from('checkout_plans')
    .select('*')
    .eq('is_active', true)
    .order('duration_months', { ascending: true });

  if (error || !data) {
    console.error('Erro ao buscar planos:', error);
    return [];
  }

  return data.map(plan => ({
    id: plan.id,
    name: plan.name,
    displayName: plan.display_name,
    priceCents: plan.price_cents,
    promoPriceCents: plan.promo_price_cents,
    durationMonths: plan.duration_months,
    features: Array.isArray(plan.features) ? plan.features as string[] : [],
    isActive: plan.is_active,
    isPopular: plan.is_popular,
    discountPercentage: plan.discount_percentage,
    tagline: plan.tagline,
  }));
}

/**
 * Busca um plano pelo nome
 */
export async function getPlanByName(name: string): Promise<CheckoutPlan | null> {
  const { data, error } = await supabase
    .from('checkout_plans')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    displayName: data.display_name,
    priceCents: data.price_cents,
    promoPriceCents: data.promo_price_cents,
    durationMonths: data.duration_months,
    features: Array.isArray(data.features) ? data.features as string[] : [],
    isActive: data.is_active,
    isPopular: data.is_popular,
    discountPercentage: data.discount_percentage,
    tagline: data.tagline,
  };
}

/**
 * Atualiza um plano (apenas admin)
 */
export async function updatePlan(
  planId: string, 
  updates: Partial<{
    priceCents: number;
    promoPriceCents: number;
    discountPercentage: number;
    isPopular: boolean;
    features: string[];
    tagline: string;
  }>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};
  
  if (updates.priceCents !== undefined) updateData.price_cents = updates.priceCents;
  if (updates.promoPriceCents !== undefined) updateData.promo_price_cents = updates.promoPriceCents;
  if (updates.discountPercentage !== undefined) updateData.discount_percentage = updates.discountPercentage;
  if (updates.isPopular !== undefined) updateData.is_popular = updates.isPopular;
  if (updates.features !== undefined) updateData.features = updates.features;
  if (updates.tagline !== undefined) updateData.tagline = updates.tagline;

  const { error } = await supabase
    .from('checkout_plans')
    .update(updateData)
    .eq('id', planId);

  if (error) {
    console.error('Erro ao atualizar plano:', error);
    return false;
  }

  return true;
}

/**
 * Formata valor em centavos para exibição
 */
export function formatPlanPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Calcula preço original baseado no desconto
 */
export function calculateOriginalPrice(priceCents: number, discountPercentage: number): number {
  if (!discountPercentage || discountPercentage <= 0) return priceCents;
  return Math.round(priceCents / (1 - discountPercentage / 100));
}
