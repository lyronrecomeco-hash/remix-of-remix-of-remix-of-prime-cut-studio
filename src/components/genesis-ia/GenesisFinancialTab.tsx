import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Target,
  Wallet,
  CreditCard,
  PiggyBank,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface GenesisFinancialTabProps {
  userId: string;
}

// Mock data for demonstration
const revenueData = [
  { month: "Jan", receita: 45000, despesas: 32000, lucro: 13000 },
  { month: "Fev", receita: 52000, despesas: 35000, lucro: 17000 },
  { month: "Mar", receita: 48000, despesas: 31000, lucro: 17000 },
  { month: "Abr", receita: 61000, despesas: 38000, lucro: 23000 },
  { month: "Mai", receita: 55000, despesas: 34000, lucro: 21000 },
  { month: "Jun", receita: 67000, despesas: 40000, lucro: 27000 },
  { month: "Jul", receita: 72000, despesas: 42000, lucro: 30000 },
];

const weeklyData = [
  { day: "Seg", valor: 12500 },
  { day: "Ter", valor: 15800 },
  { day: "Qua", valor: 11200 },
  { day: "Qui", valor: 18900 },
  { day: "Sex", valor: 22100 },
  { day: "Sáb", valor: 8500 },
  { day: "Dom", valor: 5200 },
];

const categoryData = [
  { name: "Assinaturas", value: 45, color: "hsl(217 91% 60%)" },
  { name: "Serviços", value: 25, color: "hsl(145 70% 50%)" },
  { name: "Produtos", value: 20, color: "hsl(280 70% 60%)" },
  { name: "Outros", value: 10, color: "hsl(45 90% 55%)" },
];

const transactionsData = [
  { id: 1, name: "Plano Premium", type: "entrada", value: 299, date: "Hoje, 14:32" },
  { id: 2, name: "Servidor Cloud", type: "saida", value: 89, date: "Hoje, 11:20" },
  { id: 3, name: "Plano Business", type: "entrada", value: 599, date: "Ontem, 18:45" },
  { id: 4, name: "API Credits", type: "entrada", value: 150, date: "Ontem, 09:15" },
  { id: 5, name: "Marketing", type: "saida", value: 450, date: "18 Jan, 16:00" },
];

const chartConfig = {
  receita: { label: "Receita", color: "hsl(217 91% 60%)" },
  despesas: { label: "Despesas", color: "hsl(0 72% 51%)" },
  lucro: { label: "Lucro", color: "hsl(145 70% 50%)" },
  valor: { label: "Valor", color: "hsl(217 91% 60%)" },
};

export function GenesisFinancialTab({ userId }: GenesisFinancialTabProps) {
  const [period, setPeriod] = useState("7d");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const stats = useMemo(() => ({
    totalRevenue: 400000,
    monthlyRevenue: 72000,
    expenses: 42000,
    profit: 30000,
    growth: 12.5,
    clients: 1250,
    avgTicket: 299,
    conversionRate: 8.4,
  }), []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend,
    color = "primary",
  }: {
    title: string;
    value: string;
    change?: string;
    icon: React.ElementType;
    trend?: "up" | "down";
    color?: "primary" | "success" | "destructive" | "warning";
  }) => {
    const colorClasses = {
      primary: "bg-primary/15 text-primary",
      success: "bg-emerald-500/15 text-emerald-400",
      destructive: "bg-destructive/15 text-destructive",
      warning: "bg-amber-500/15 text-amber-400",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              {change && (
                <div className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-destructive"}`}>
                  {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {change}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Visão Financeira</h2>
          <p className="text-sm text-muted-foreground">Acompanhe suas métricas em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-card/50 border-border/50">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="bg-card/50 border-border/50">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Total"
          value={formatCurrency(stats.totalRevenue)}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
          color="primary"
        />
        <StatCard
          title="Receita Mensal"
          value={formatCurrency(stats.monthlyRevenue)}
          change="+8.2%"
          icon={TrendingUp}
          trend="up"
          color="success"
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(stats.expenses)}
          change="-3.1%"
          icon={CreditCard}
          trend="down"
          color="destructive"
        />
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(stats.profit)}
          change="+15.7%"
          icon={PiggyBank}
          trend="up"
          color="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clientes Ativos"
          value={stats.clients.toLocaleString()}
          change="+5.3%"
          icon={Users}
          trend="up"
          color="primary"
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(stats.avgTicket)}
          change="+2.8%"
          icon={Target}
          trend="up"
          color="warning"
        />
        <StatCard
          title="Taxa Conversão"
          value={`${stats.conversionRate}%`}
          change="+1.2%"
          icon={TrendingUp}
          trend="up"
          color="success"
        />
        <StatCard
          title="Crescimento"
          value={`${stats.growth}%`}
          change="+4.5%"
          icon={BarChart3}
          trend="up"
          color="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Evolução Financeira</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={chartType === "area" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("area")}
                    className="h-8 px-3"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className="h-8 px-3"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                {chartType === "area" ? (
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(145 70% 50%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(145 70% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 20%)" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(210 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(210 20% 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                    <Area type="monotone" dataKey="receita" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#colorReceita)" />
                    <Area type="monotone" dataKey="lucro" stroke="hsl(145 70% 50%)" strokeWidth={2} fill="url(#colorLucro)" />
                  </AreaChart>
                ) : (
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 20%)" vertical={false} />
                    <XAxis dataKey="month" stroke="hsl(210 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(210 20% 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                    <Bar dataKey="receita" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lucro" fill="hsl(145 70% 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ChartContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Receita</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Lucro</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Receita por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 11%)",
                        border: "1px solid hsl(217 40% 20%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-medium text-foreground ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Performance Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 20%)" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(210 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(210 20% 55%)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                  <Bar dataKey="valor" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  Transações Recentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionsData.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === "entrada" ? "bg-emerald-500/15" : "bg-destructive/15"}`}>
                        {tx.type === "entrada" ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${tx.type === "entrada" ? "text-emerald-400" : "text-destructive"}`}>
                      {tx.type === "entrada" ? "+" : "-"}{formatCurrency(tx.value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
