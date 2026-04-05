import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, FileText, DollarSign, Target, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight,
  Search, Filter, Clock, CheckCircle2, XCircle, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PerformanceDashboardProps {
  affiliateId: string | null;
  userId: string;
}

interface MetricCard {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

interface ContractRow {
  id: string;
  company_name: string;
  status: string;
  value: number | null;
  type: string;
  recurring: boolean;
  next_billing: string | null;
  last_interaction: string;
}

export const PerformanceDashboard = ({ affiliateId, userId }: PerformanceDashboardProps) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    leadsToday: 0, leadsWeek: 0, leadsMonth: 0,
    scansTotal: 0, leadsConverted: 0, closeRate: 0,
    totalContracts: 0, activeContracts: 0, recurringContracts: 0,
    cancelledContracts: 0,
    revenueMonth: 0, revenueRecurring: 0, avgTicket: 0,
    proposalsSent: 0, proposalsAccepted: 0, avgCloseTime: 0,
  });
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [contractPage, setContractPage] = useState(0);
  const [responsePage, setResponsePage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (affiliateId) loadData();
  }, [affiliateId, period]);

  const loadData = async () => {
    if (!affiliateId) return;
    setLoading(true);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = startOfWeek(now, { locale: ptBR }).toISOString();
    const monthStart = startOfMonth(now).toISOString();

    try {
      // Leads / Prospects
      const [
        { count: leadsToday },
        { count: leadsWeek },
        { count: leadsMonth },
        { count: scansTotal },
      ] = await Promise.all([
        supabase.from('affiliate_prospects').select('*', { count: 'exact', head: true }).eq('affiliate_id', affiliateId).gte('created_at', todayStart),
        supabase.from('affiliate_prospects').select('*', { count: 'exact', head: true }).eq('affiliate_id', affiliateId).gte('created_at', weekStart),
        supabase.from('affiliate_prospects').select('*', { count: 'exact', head: true }).eq('affiliate_id', affiliateId).gte('created_at', monthStart),
        supabase.from('affiliate_prospects').select('*', { count: 'exact', head: true }).eq('affiliate_id', affiliateId),
      ]);

      // Proposals
      const { data: proposals } = await supabase
        .from('affiliate_proposals')
        .select('id, status, proposal_value, created_at, accepted_at')
        .eq('affiliate_id', affiliateId);

      const sent = proposals?.length || 0;
      const accepted = proposals?.filter(p => p.status === 'accepted').length || 0;
      const converted = proposals?.filter(p => ['accepted', 'completed'].includes(p.status)).length || 0;
      const closeRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;

      // Revenue
      const totalRevenue = proposals
        ?.filter(p => p.status === 'accepted' && p.proposal_value)
        .reduce((sum, p) => sum + (p.proposal_value || 0), 0) || 0;
      const avgTicket = accepted > 0 ? Math.round(totalRevenue / accepted) : 0;

      // Avg close time
      const closeTimes = proposals
        ?.filter(p => p.accepted_at && p.created_at)
        .map(p => {
          const created = new Date(p.created_at).getTime();
          const acc = new Date(p.accepted_at!).getTime();
          return (acc - created) / (1000 * 60 * 60 * 24);
        }) || [];
      const avgCloseTime = closeTimes.length > 0 ? Math.round(closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length) : 0;

      // Contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      const activeContracts = contractsData?.filter(c => c.status === 'active' || c.status === 'signed').length || 0;
      const recurringContracts = contractsData?.filter(c => c.payment_method === 'recurring' || c.payment_method === 'recorrente').length || 0;
      const cancelledContracts = contractsData?.filter(c => c.status === 'cancelled').length || 0;

      const contractRows: ContractRow[] = (contractsData || []).map(c => ({
        id: c.id,
        company_name: c.contracted_name || 'N/A',
        status: c.status || 'pending',
        value: c.total_value || null,
        type: c.service_type || 'Serviço',
        recurring: c.payment_method === 'recurring' || c.payment_method === 'recorrente',
        next_billing: c.end_date || null,
        last_interaction: c.updated_at || c.created_at,
      }));

      // Sends / Responses
      const { data: sendsData } = await supabase
        .from('affiliate_prospect_sends')
        .select('id, status, channel, created_at, sent_at, reply_content, replied_at, prospect_id')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false })
        .limit(50);

      const responsesFiltered = (sendsData || []).filter(s => s.reply_content || s.replied_at);

      setMetrics({
        leadsToday: leadsToday || 0,
        leadsWeek: leadsWeek || 0,
        leadsMonth: leadsMonth || 0,
        scansTotal: scansTotal || 0,
        leadsConverted: converted,
        closeRate,
        totalContracts: contractsData?.length || 0,
        activeContracts,
        recurringContracts,
        cancelledContracts,
        revenueMonth: totalRevenue,
        revenueRecurring: 0,
        avgTicket,
        proposalsSent: sent,
        proposalsAccepted: accepted,
        avgCloseTime,
      });

      setContracts(contractRows);
      setResponses(responsesFiltered);
    } catch (err) {
      console.error('Error loading performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const metricCards: MetricCard[] = [
    { label: 'Leads Hoje', value: String(metrics.leadsToday), icon: Users, trend: 'up' },
    { label: 'Leads Semana', value: String(metrics.leadsWeek), icon: Users },
    { label: 'Leads Mês', value: String(metrics.leadsMonth), icon: Users },
    { label: 'Scans Totais', value: String(metrics.scansTotal), icon: Search },
    { label: 'Convertidos', value: String(metrics.leadsConverted), icon: Target, trend: 'up' },
    { label: 'Taxa Fech.', value: `${metrics.closeRate}%`, icon: TrendingUp, trend: metrics.closeRate > 30 ? 'up' : 'down' },
    { label: 'Contratos Ativos', value: String(metrics.activeContracts), icon: FileText },
    { label: 'Recorrentes', value: String(metrics.recurringContracts), icon: Calendar },
    { label: 'Receita Total', value: `R$ ${metrics.revenueMonth.toLocaleString('pt-BR')}`, icon: DollarSign, trend: 'up' },
    { label: 'Ticket Médio', value: `R$ ${metrics.avgTicket.toLocaleString('pt-BR')}`, icon: BarChart3 },
    { label: 'Propostas Enviadas', value: String(metrics.proposalsSent), icon: FileText },
    { label: 'Propostas Aceitas', value: String(metrics.proposalsAccepted), icon: CheckCircle2, trend: 'up' },
  ];

  const paginatedContracts = contracts.slice(contractPage * PAGE_SIZE, (contractPage + 1) * PAGE_SIZE);
  const totalContractPages = Math.ceil(contracts.length / PAGE_SIZE);
  const paginatedResponses = responses.slice(responsePage * PAGE_SIZE, (responsePage + 1) * PAGE_SIZE);
  const totalResponsePages = Math.ceil(responses.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-white/40">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Performance & Pipeline</h2>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          {(['day', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                period === p ? 'bg-primary/20 text-primary' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-white/30" />
                {card.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400/80" />}
                {card.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-destructive/80" />}
              </div>
              <p className="text-lg font-bold text-white">{card.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Contracts Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/80">Contratos ({contracts.length})</h3>
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span>Página {contractPage + 1} de {Math.max(1, totalContractPages)}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setContractPage(Math.max(0, contractPage - 1))}
                disabled={contractPage === 0}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => setContractPage(Math.min(totalContractPages - 1, contractPage + 1))}
                disabled={contractPage >= totalContractPages - 1}
                className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">Nenhum contrato ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2.5 font-medium">Nome</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Tipo</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Recorrente</th>
                  <th className="text-left px-4 py-2.5 font-medium">Valor</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Última Interação</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContracts.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white/70 font-medium">{c.company_name}</td>
                    <td className="px-4 py-3 text-white/40 hidden sm:table-cell">{c.type}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {c.recurring ? (
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">Sim</Badge>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {c.value ? `R$ ${c.value.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          c.status === 'active' || c.status === 'signed' ? 'border-emerald-500/30 text-emerald-400' :
                          c.status === 'cancelled' ? 'border-destructive/30 text-destructive' :
                          'border-yellow-500/30 text-yellow-400'
                        }`}
                      >
                        {c.status === 'active' ? 'Ativo' : c.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-white/30 hidden lg:table-cell">
                      {format(new Date(c.last_interaction), 'dd/MM/yy', { locale: ptBR })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Responses / Feedbacks */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white/30" />
            Respostas e Feedbacks ({responses.length})
          </h3>
          {totalResponsePages > 1 && (
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <span>Página {responsePage + 1} de {totalResponsePages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setResponsePage(Math.max(0, responsePage - 1))}
                  disabled={responsePage === 0}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setResponsePage(Math.min(totalResponsePages - 1, responsePage + 1))}
                  disabled={responsePage >= totalResponsePages - 1}
                  className="p-1 hover:bg-white/10 rounded disabled:opacity-20"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {responses.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">Nenhuma resposta ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {paginatedResponses.map((r, i) => (
              <div key={r.id || i} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                    {r.channel || 'WhatsApp'}
                  </Badge>
                  <span className="text-[10px] text-white/20">
                    {r.reply_received_at ? format(new Date(r.reply_received_at), 'dd/MM HH:mm', { locale: ptBR }) : '—'}
                  </span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2">{r.reply_content || 'Resposta recebida'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
