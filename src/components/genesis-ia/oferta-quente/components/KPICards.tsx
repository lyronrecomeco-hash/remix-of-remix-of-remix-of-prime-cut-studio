import { motion } from 'framer-motion';
import { Flame, TrendingUp, Zap, Target } from 'lucide-react';
import { HotOffer } from '../types';

interface KPICardsProps {
  offers: HotOffer[];
}

export const KPICards = ({ offers }: KPICardsProps) => {
  const totalOffers = offers.length;
  const avgScore = totalOffers > 0 ? Math.round(offers.reduce((sum, o) => sum + o.heat_score, 0) / totalOffers) : 0;
  const hotOffers = offers.filter(o => o.heat_score >= 70).length;
  const avgTicket = totalOffers > 0
    ? Math.round(offers.reduce((sum, o) => sum + (o.suggested_ticket || 0), 0) / Math.max(1, offers.filter(o => o.suggested_ticket).length))
    : 0;

  const kpis = [
    { icon: Flame, label: 'Ofertas Encontradas', value: totalOffers.toString(), color: 'text-orange-400', bg: 'from-orange-500/10 to-red-500/10' },
    { icon: TrendingUp, label: 'Score Médio', value: avgScore.toString(), color: 'text-blue-400', bg: 'from-blue-500/10 to-cyan-500/10' },
    { icon: Zap, label: 'Ofertas Quentes (70+)', value: hotOffers.toString(), color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/10' },
    { icon: Target, label: 'Ticket Médio', value: avgTicket > 0 ? `R$ ${avgTicket.toLocaleString('pt-BR')}` : '—', color: 'text-emerald-400', bg: 'from-emerald-500/10 to-green-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`p-3 rounded-xl bg-gradient-to-br ${kpi.bg} border border-white/[0.06] backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2 mb-1">
            <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            <span className="text-[10px] text-white/40 uppercase tracking-wider">{kpi.label}</span>
          </div>
          <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
