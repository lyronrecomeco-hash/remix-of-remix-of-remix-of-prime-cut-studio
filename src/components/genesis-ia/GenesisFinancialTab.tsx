import { useState, useMemo } from "react";
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
} from "recharts";

interface GenesisFinancialTabProps {
  userId: string;
}

const revenueData = [
  { month: "Jan", receita: 45000, lucro: 13000 },
  { month: "Fev", receita: 52000, lucro: 17000 },
  { month: "Mar", receita: 48000, lucro: 17000 },
  { month: "Abr", receita: 61000, lucro: 23000 },
  { month: "Mai", receita: 55000, lucro: 21000 },
  { month: "Jun", receita: 67000, lucro: 27000 },
  { month: "Jul", receita: 72000, lucro: 30000 },
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

const chartConfig = {
  receita: { label: "Receita", color: "hsl(217 91% 60%)" },
  lucro: { label: "Lucro", color: "hsl(145 70% 50%)" },
  valor: { label: "Valor", color: "hsl(217 91% 60%)" },
};

export function GenesisFinancialTab({ userId }: GenesisFinancialTabProps) {
  const [period, setPeriod] = useState("30d");

  const stats = useMemo(() => ({
    totalRevenue: 400000,
    thisMonth: 72000,
    lastMonth: 67000,
    growth: 7.5,
  }), []);

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
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="w-full max-w-6xl mx-auto space-y-5 px-1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Financeiro</h2>
          <p className="text-sm text-muted-foreground">Acompanhe suas métricas</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-28 h-9 bg-card border-border text-sm">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Main Stats - 3 Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Faturamento Total */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +12%
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Faturamento Total</p>
          </CardContent>
        </Card>

        {/* Este Mês */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{stats.growth}%
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.thisMonth)}</p>
            <p className="text-sm text-muted-foreground">Neste Mês</p>
          </CardContent>
        </Card>

        {/* Mês Passado */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Referência
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.lastMonth)}</p>
            <p className="text-sm text-muted-foreground">Mês Passado</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart - Evolução */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Evolução do Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145 70% 50%)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(145 70% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 18%)" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(210 20% 45%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(210 20% 45%)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Area type="monotone" dataKey="receita" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="lucro" stroke="hsl(145 70% 50%)" strokeWidth={2} fill="url(#colorLucro)" />
              </AreaChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-5 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Lucro</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" />
              Por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
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
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  <span className="text-xs font-medium text-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Chart - Full Width */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Performance Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 18%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(210 20% 45%)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(210 20% 45%)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="valor" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
