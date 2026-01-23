/**
 * Hook para buscar dados financeiros reais do banco de dados
 */

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RevenueHistoryItem {
  month: string;
  receita: number;
}

interface FinancialData {
  totalRevenue: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
  directSubscriptions: number;
  promoSubscriptions: number;
  contractsRevenue: number;
  activeSubscriptions: number;
  signedContracts: number;
  revenueHistory: RevenueHistoryItem[];
}

interface UseFinancialDataReturn {
  data: FinancialData;
  isLoading: boolean;
  period: string;
  setPeriod: (p: string) => void;
}

export function useFinancialData(userId?: string): UseFinancialDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [payments, setPayments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        // Buscar pagamentos confirmados
        const { data: paymentsData } = await supabase
          .from('checkout_payments')
          .select('amount_cents, paid_at, promo_link_id, source, created_at')
          .eq('status', 'paid');

        setPayments(paymentsData || []);

        // Buscar contratos assinados
        const { data: contractsData } = await supabase
          .from('contracts')
          .select('total_value, created_at, status');

        setContracts(contractsData?.filter(c => c.status === 'signed') || []);

        // Buscar assinaturas ativas
        const { data: subsData } = await supabase
          .from('genesis_subscriptions')
          .select('id, status')
          .eq('status', 'active');

        setSubscriptions(subsData || []);

      } catch (err) {
        console.error('Error loading financial data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [userId, period]);

  const data = useMemo((): FinancialData => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Receitas por tipo
    const directPayments = payments.filter(p => !p.promo_link_id && p.source !== 'promo');
    const promoPayments = payments.filter(p => p.promo_link_id || p.source === 'promo');

    const directSubscriptions = directPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;
    const promoSubscriptions = promoPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;
    const contractsRevenue = contracts.reduce((sum, c) => sum + (c.total_value || 0), 0);

    const totalRevenue = directSubscriptions + promoSubscriptions + contractsRevenue;

    // Este mês
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

    // Mês passado
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

    // Histórico mensal
    const revenueHistory: RevenueHistoryItem[] = [];
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

      revenueHistory.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receita,
      });
    }

    return {
      totalRevenue,
      thisMonth,
      lastMonth,
      growth,
      directSubscriptions,
      promoSubscriptions,
      contractsRevenue,
      activeSubscriptions: subscriptions.length,
      signedContracts: contracts.length,
      revenueHistory,
    };
  }, [payments, contracts, subscriptions]);

  return { data, isLoading, period, setPeriod };
}
