/**
 * Hook para buscar dados financeiros reais do banco de dados
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FinancialMetrics {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  totalClients: number;
  conversionRate: number;
  revenueByCategory: {
    name: string;
    value: number;
    color: string;
  }[];
  revenueEvolution: {
    month: string;
    receita: number;
    lucro: number;
  }[];
  isLoading: boolean;
  error: string | null;
}

export function useFinancialData(): FinancialMetrics {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        // Buscar pagamentos confirmados
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('checkout_payments')
          .select('amount_cents, paid_at, promo_link_id, source, created_at')
          .eq('status', 'paid');

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        // Buscar contratos assinados
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('total_value, created_at, status');

        if (contractsError) throw contractsError;
        setContracts(contractsData?.filter(c => c.status === 'signed') || []);

        // Buscar referrals ativos
        const { data: referralsData, error: referralsError } = await supabase
          .from('promo_referrals')
          .select('plan_value, created_at, status');

        if (referralsError) throw referralsError;
        setReferrals(referralsData?.filter(r => r.status === 'active') || []);

      } catch (err) {
        console.error('Error loading financial data:', err);
        setError('Erro ao carregar dados financeiros');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calcular receitas
    const paymentRevenue = payments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;
    const contractRevenue = contracts.reduce((sum, c) => sum + (c.total_value || 0), 0);
    const totalRevenue = paymentRevenue + contractRevenue;

    // Receita deste mês
    const thisMonthPayments = payments.filter(p => {
      const date = new Date(p.paid_at || p.created_at);
      return date >= thisMonthStart;
    });
    const thisMonthContracts = contracts.filter(c => {
      const date = new Date(c.created_at);
      return date >= thisMonthStart;
    });
    const thisMonth = 
      thisMonthPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100 +
      thisMonthContracts.reduce((sum, c) => sum + (c.total_value || 0), 0);

    // Receita mês passado
    const lastMonthPayments = payments.filter(p => {
      const date = new Date(p.paid_at || p.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonthContracts = contracts.filter(c => {
      const date = new Date(c.created_at);
      return date >= lastMonthStart && date <= lastMonthEnd;
    });
    const lastMonth = 
      lastMonthPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100 +
      lastMonthContracts.reduce((sum, c) => sum + (c.total_value || 0), 0);

    // Crescimento
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Clientes únicos
    const totalClients = payments.length + contracts.length;

    // Taxa de conversão (referrals / total)
    const conversionRate = referrals.length > 0 && payments.length > 0
      ? (referrals.length / payments.length) * 100
      : 0;

    // Receita por categoria
    const directPayments = payments.filter(p => !p.promo_link_id && p.source !== 'promo');
    const promoPayments = payments.filter(p => p.promo_link_id || p.source === 'promo');

    const directRevenue = directPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;
    const promoRevenue = promoPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;

    const revenueByCategory = [
      { name: 'Assinaturas Diretas', value: directRevenue, color: 'hsl(var(--chart-1))' },
      { name: 'Indicações (Promo)', value: promoRevenue, color: 'hsl(var(--chart-2))' },
      { name: 'Contratos', value: contractRevenue, color: 'hsl(var(--chart-3))' },
    ].filter(c => c.value > 0);

    // Evolução mensal (últimos 6 meses)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthPayments = payments.filter(p => {
        const pDate = new Date(p.paid_at || p.created_at);
        return pDate >= date && pDate <= monthEnd;
      });
      const monthContracts = contracts.filter(c => {
        const cDate = new Date(c.created_at);
        return cDate >= date && cDate <= monthEnd;
      });

      const receita = 
        monthPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100 +
        monthContracts.reduce((sum, c) => sum + (c.total_value || 0), 0);

      // Lucro estimado (70% da receita)
      const lucro = receita * 0.7;

      months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receita,
        lucro,
      });
    }

    return {
      totalRevenue,
      thisMonth,
      lastMonth,
      growth,
      totalClients,
      conversionRate,
      revenueByCategory,
      revenueEvolution: months,
      isLoading,
      error,
    };
  }, [payments, contracts, referrals, isLoading, error]);
}
