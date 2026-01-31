import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';

export default function GymAdminFinance() {
  const stats = [
    { 
      icon: DollarSign, 
      label: 'Receita do Mês', 
      value: 'R$ 0,00',
      change: '+0%',
      positive: true
    },
    { 
      icon: Users, 
      label: 'Planos Ativos', 
      value: '0',
      change: '+0%',
      positive: true
    },
    { 
      icon: CreditCard, 
      label: 'Recebimentos Pendentes', 
      value: 'R$ 0,00',
      change: '0',
      positive: false
    },
    { 
      icon: TrendingUp, 
      label: 'Ticket Médio', 
      value: 'R$ 0,00',
      change: '+0%',
      positive: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-zinc-400 mt-1">Controle financeiro da academia</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-orange-500" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-500' : 'text-zinc-400'}`}>
                {stat.positive ? <ArrowUp className="w-4 h-4" /> : null}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-zinc-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center"
      >
        <DollarSign className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Módulo Financeiro</h2>
        <p className="text-zinc-400 max-w-md mx-auto">
          Aqui você poderá gerenciar cobranças, recebimentos, relatórios financeiros
          e muito mais. Integração com gateways de pagamento disponível.
        </p>
      </motion.div>
    </div>
  );
}
