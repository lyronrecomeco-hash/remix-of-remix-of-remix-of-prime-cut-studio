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
      // Se não tem userId, não carrega dados (cada usuário vê seus próprios dados)
      if (!userId) {
        setPayments([]);
        setContracts([]);
        setSubscriptions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Buscar pagamentos confirmados do usuário específico
        // Primeiro precisamos encontrar o customer_id associado ao user
        const { data: genesisUser } = await supabase
          .from('genesis_users')
          .select('email')
          .eq('auth_user_id', userId)
          .single();

        if (!genesisUser?.email) {
          setPayments([]);
          setContracts([]);
          setSubscriptions([]);
          setIsLoading(false);
          return;
        }

        // Buscar customer por email
        const { data: customer } = await supabase
          .from('checkout_customers')
          .select('id')
          .eq('email', genesisUser.email)
          .single();

        if (customer?.id) {
          // Buscar pagamentos do customer
          const { data: paymentsData } = await supabase
            .from('checkout_payments')
            .select('amount_cents, paid_at, promo_link_id, source, created_at')
            .eq('status', 'paid')
            .eq('customer_id', customer.id);

          setPayments(paymentsData || []);
        } else {
          setPayments([]);
        }

        // Buscar contratos do usuário (por user_id ou affiliate)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const contractsResult: { data: any[] | null } = await (supabase as any)
          .from('contracts')
          .select('total_value, created_at, status')
          .eq('created_by', userId)
          .eq('status', 'signed');

        setContracts(contractsResult.data || []);

        // Buscar assinaturas ativas do usuário
        const { data: genesisUserData } = await supabase
          .from('genesis_users')
          .select('id')
          .eq('auth_user_id', userId)
          .single();

        if (genesisUserData?.id) {
          const { data: subsData } = await supabase
            .from('genesis_subscriptions')
            .select('id, status')
            .eq('user_id', genesisUserData.id)
            .eq('status', 'active');

          setSubscriptions(subsData || []);
        } else {
          setSubscriptions([]);
        }

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
