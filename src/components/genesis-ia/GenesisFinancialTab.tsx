import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Target,
  Loader2,
  Info,
  UserPlus,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useFinancialData } from "@/hooks/useFinancialData";

interface GenesisFinancialTabProps {
  userId: string;
  userEmail?: string;
}

// Conta especial com dados financeiros reais simulados para produção de conteúdo
const CONTENT_ACCOUNT_EMAIL = "lyronrecomeco@gmail.com";

// Métricas SaaS estratégicas - valores realistas para operação consolidada
// Ticket médio: R$450/mês | LTV: R$5.400 | CAC: R$180 | Churn: 3.2%
const CONTENT_ACCOUNT_FINANCIAL_DATA = {
  totalRevenue: 127450, // MRR acumulado 6 meses
  thisMonth: 28970, // MRR atual (64 clientes x R$452 ticket médio)
  lastMonth: 24380, // MRR anterior
  growth: 18.82, // Crescimento MoM saudável
  directSubscriptions: 71820, // 56% orgânico
  promoSubscriptions: 38290, // 30% via afiliados/promo
  contractsRevenue: 17340, // 14% enterprise/anual
  activeSubscriptions: 64, // Clientes ativos
  signedContracts: 8, // Contratos enterprise
  referrals: 31,
  convertedReferrals: 12,
  revenueHistory: [
    { month: 'Ago', receita: 12840 },  // 28 clientes
    { month: 'Set', receita: 16290 },  // 36 clientes (+8)
    { month: 'Out', receita: 19750 },  // 44 clientes (+8)
    { month: 'Nov', receita: 24380 },  // 54 clientes (+10)
    { month: 'Dez', receita: 26220 },  // 58 clientes (+4 fim de ano)
    { month: 'Jan', receita: 28970 },  // 64 clientes (+6)
  ],
};

// Vendas recentes - mix realista de planos
const CONTENT_ACCOUNT_CONTRACTS = [
  { id: 1, client: 'Plano Anual', value: 1997, date: '2026-01-26', status: 'signed' },
  { id: 2, client: 'Plano Mensal', value: 297, date: '2026-01-25', status: 'signed' },
  { id: 3, client: 'Plano Trimestral', value: 697, date: '2026-01-24', status: 'signed' },
  { id: 4, client: 'Plano Mensal', value: 297, date: '2026-01-23', status: 'signed' },
  { id: 5, client: 'Plano Mensal', value: 297, date: '2026-01-22', status: 'signed' },
  { id: 6, client: 'Plano Anual', value: 1997, date: '2026-01-21', status: 'signed' },
  { id: 7, client: 'Plano Trimestral', value: 697, date: '2026-01-20', status: 'signed' },
  { id: 8, client: 'Plano Mensal', value: 297, date: '2026-01-19', status: 'signed' },
  { id: 9, client: 'Plano Mensal', value: 297, date: '2026-01-18', status: 'signed' },
  { id: 10, client: 'Plano Anual', value: 1997, date: '2026-01-17', status: 'signed' },
  { id: 11, client: 'Plano Trimestral', value: 697, date: '2026-01-15', status: 'signed' },
  { id: 12, client: 'Plano Mensal', value: 297, date: '2026-01-14', status: 'signed' },
];

export function GenesisFinancialTab({ userId, userEmail }: GenesisFinancialTabProps) {
  const { data: realData, isLoading, period, setPeriod } = useFinancialData(userId);

  // Conta de conteúdo usa dados financeiros próprios
  const isContentAccount = userEmail === CONTENT_ACCOUNT_EMAIL;
  const data = isContentAccount ? CONTENT_ACCOUNT_FINANCIAL_DATA : realData;
  const contracts = isContentAccount ? CONTENT_ACCOUNT_CONTRACTS : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading && !isContentAccount) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const categoryData = [
    { name: "Assinaturas Diretas", value: data.directSubscriptions, color: "hsl(217 91% 60%)" },
    { name: "Assinaturas Promo", value: data.promoSubscriptions, color: "hsl(280 70% 60%)" },
    { name: "Contratos", value: data.contractsRevenue, color: "hsl(145 70% 50%)" },
  ].filter(c => c.value > 0);

  const totalRevenue = data.directSubscriptions + data.promoSubscriptions + data.contractsRevenue;
  const categoryDataPercent = categoryData.map(c => ({
    ...c,
    percent: totalRevenue > 0 ? Math.round((c.value / totalRevenue) * 100) : 0
  }));

  // Métricas de indicações
  const referrals = isContentAccount ? CONTENT_ACCOUNT_FINANCIAL_DATA.referrals : 0;
  const convertedReferrals = isContentAccount ? CONTENT_ACCOUNT_FINANCIAL_DATA.convertedReferrals : 0;

  return (
    <TooltipProvider>
      <motion.div 
        className="w-full space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Financeiro</h2>
              <p className="text-sm text-white/50">Dados do sistema</p>
            </div>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-28 h-10 bg-white/5 border-white/10" style={{ borderRadius: '10px' }}>
              <Calendar className="w-4 h-4 mr-2 text-white/50" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Main Stats - 4 Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Faturamento Total */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Info className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">
                      Soma de todas as receitas: assinaturas diretas, promocionais e contratos fechados desde o início.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.totalRevenue)}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-white/50">Faturamento Total</p>
                {data.growth > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    +{data.growth.toFixed(1)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Este Mês */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                {data.growth > 0 ? (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    +{data.growth.toFixed(1)}%
                  </div>
                ) : data.growth < 0 ? (
                  <div className="flex items-center gap-1 text-xs font-medium text-red-400">
                    <ArrowDownRight className="w-3 h-3" />
                    {data.growth.toFixed(1)}%
                  </div>
                ) : null}
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.thisMonth)}</p>
              <p className="text-sm text-white/50 mt-1">Neste Mês</p>
            </CardContent>
          </Card>

          {/* Mês Passado */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-xs text-white/40">Referência</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.lastMonth)}</p>
              <p className="text-sm text-white/50 mt-1">Mês Passado</p>
            </CardContent>
          </Card>

          {/* Indicações */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-purple-400" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Info className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[250px]">
                    <p className="text-xs">
                      Total de indicações feitas e quantas converteram em clientes pagantes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-2xl font-bold text-white">{referrals}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-white/50">Indicações</p>
                {convertedReferrals > 0 && (
                  <span className="text-xs text-emerald-400">{convertedReferrals} convertidas</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Chart - Evolução */}
          <Card className="bg-white/5 border-white/10 lg:col-span-2" style={{ borderRadius: '14px' }}>
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Evolução do Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 18%)" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(210 20% 50%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(210 20% 50%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 11%)",
                        border: "1px solid hsl(217 40% 20%)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Receita"]}
                    />
                    <Area type="monotone" dataKey="receita" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#colorReceita)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-white/50">Receita</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                Receita por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {categoryDataPercent.length > 0 ? (
                <>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDataPercent}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryDataPercent.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "hsl(222 47% 11%)",
                            border: "1px solid hsl(217 40% 20%)",
                            borderRadius: "8px",
                            fontSize: "13px",
                          }}
                          formatter={(value: number) => [formatCurrency(value), ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {categoryDataPercent.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-white/50">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-white/40 text-sm">
                  Sem dados de receita ainda
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Assinaturas Ativas */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-7 h-7 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{data.activeSubscriptions}</p>
                  <p className="text-sm text-white/50">Assinaturas Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contratos Fechados */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{data.signedContracts}</p>
                  <p className="text-sm text-white/50">Contratos Fechados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taxa de Conversão */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Target className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">
                    {referrals > 0 ? Math.round((convertedReferrals / referrals) * 100) : 0}%
                  </p>
                  <p className="text-sm text-white/50">Taxa de Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contracts List (only for content account) */}
        {isContentAccount && contracts.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
              <CardHeader className="pb-2 px-5 pt-5">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Contratos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{contract.client}</p>
                          <p className="text-xs text-white/50">
                            {new Date(contract.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">
                          {formatCurrency(contract.value)}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          Assinado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}
