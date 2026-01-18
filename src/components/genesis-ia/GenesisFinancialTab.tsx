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
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="w-full space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Financeiro</h2>
          <p className="text-xs text-muted-foreground">Acompanhe suas métricas</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-24 h-8 bg-card border-border text-xs">
            <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
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
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {/* Faturamento Total */}
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Faturamento Total</p>
          </CardContent>
        </Card>

        {/* Este Mês */}
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                +{stats.growth}%
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(stats.thisMonth)}</p>
            <p className="text-xs text-muted-foreground">Neste Mês</p>
          </CardContent>
        </Card>

        {/* Mês Passado */}
        <Card className="bg-card border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                <ArrowDownRight className="w-3 h-3" />
                Ref.
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(stats.lastMonth)}</p>
            <p className="text-xs text-muted-foreground">Mês Passado</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Main Chart - Evolução */}
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              Evolução do Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={revenueData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145 70% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145 70% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 16%)" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(210 20% 40%)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(210 20% 40%)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Area type="monotone" dataKey="receita" stroke="hsl(217 91% 60%)" strokeWidth={2} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="lucro" stroke="hsl(145 70% 50%)" strokeWidth={2} fill="url(#colorLucro)" />
              </AreaChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground">Receita</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">Lucro</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-primary" />
              Por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="h-[130px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
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
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground truncate">{item.name}</span>
                  <span className="text-[10px] font-medium text-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              Performance Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ChartContainer config={chartConfig} className="h-[160px] w-full">
              <BarChart data={weeklyData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 40% 16%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(210 20% 40%)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(210 20% 40%)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                <Bar dataKey="valor" fill="hsl(217 91% 60%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
