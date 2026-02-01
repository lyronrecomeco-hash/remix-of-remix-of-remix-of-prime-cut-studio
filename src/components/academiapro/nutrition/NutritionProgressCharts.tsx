import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  goal: number;
}

interface NutritionProgressChartsProps {
  userId: string;
  dailyCalorieGoal: number;
}

export function NutritionProgressCharts({ userId, dailyCalorieGoal }: NutritionProgressChartsProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, [userId, weekOffset]);

  const loadWeeklyData = async () => {
    setIsLoading(true);
    
    const today = new Date();
    const currentWeekStart = startOfWeek(subDays(today, weekOffset * 7), { weekStartsOn: 0 });
    const currentWeekEnd = endOfWeek(subDays(today, weekOffset * 7), { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
    
    const weekData: DailyData[] = [];
    
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Get meal logs for this day
      const { data: meals } = await supabase
        .from('gym_meal_logs' as any)
        .select('calories, protein_grams, carbs_grams, fat_grams')
        .eq('user_id', userId)
        .gte('logged_at', `${dateStr}T00:00:00`)
        .lte('logged_at', `${dateStr}T23:59:59`);
      
      // Get hydration logs for this day
      const { data: hydration } = await supabase
        .from('gym_hydration_logs' as any)
        .select('amount_ml')
        .eq('user_id', userId)
        .gte('logged_at', `${dateStr}T00:00:00`)
        .lte('logged_at', `${dateStr}T23:59:59`);
      
      const dayCalories = (meals as any[] || []).reduce((sum, m) => sum + (m.calories || 0), 0);
      const dayProtein = (meals as any[] || []).reduce((sum, m) => sum + (m.protein_grams || 0), 0);
      const dayCarbs = (meals as any[] || []).reduce((sum, m) => sum + (m.carbs_grams || 0), 0);
      const dayFat = (meals as any[] || []).reduce((sum, m) => sum + (m.fat_grams || 0), 0);
      const dayWater = (hydration as any[] || []).reduce((sum, h) => sum + (h.amount_ml || 0), 0);
      
      weekData.push({
        date: format(day, 'EEE', { locale: ptBR }),
        calories: dayCalories,
        protein: Math.round(dayProtein),
        carbs: Math.round(dayCarbs),
        fat: Math.round(dayFat),
        water: dayWater,
        goal: dailyCalorieGoal
      });
    }
    
    setWeeklyData(weekData);
    setIsLoading(false);
  };

  const getWeekDateRange = () => {
    const today = new Date();
    const start = startOfWeek(subDays(today, weekOffset * 7), { weekStartsOn: 0 });
    const end = endOfWeek(subDays(today, weekOffset * 7), { weekStartsOn: 0 });
    return `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM', { locale: ptBR })}`;
  };

  const avgCalories = weeklyData.length > 0 
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length)
    : 0;

  const daysOnTarget = weeklyData.filter(d => 
    d.calories >= dailyCalorieGoal * 0.9 && d.calories <= dailyCalorieGoal * 1.1
  ).length;

  const getBarColor = (calories: number) => {
    const percentage = (calories / dailyCalorieGoal) * 100;
    if (percentage < 80) return 'hsl(var(--chart-3))'; // Under
    if (percentage > 110) return 'hsl(var(--destructive))'; // Over
    return 'hsl(var(--primary))'; // On target
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Progresso Semanal</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setWeekOffset(prev => prev + 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[120px] text-center">
            {getWeekDateRange()}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setWeekOffset(prev => Math.max(0, prev - 1))}
            disabled={weekOffset === 0}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Média diária</span>
          </div>
          <p className="text-xl font-bold">{avgCalories} <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Dias na meta</span>
          </div>
          <p className="text-xl font-bold">{daysOnTarget}<span className="text-sm font-normal text-muted-foreground">/7 dias</span></p>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`${value} kcal`, 'Calorias']}
            />
            <Bar 
              dataKey="calories" 
              radius={[4, 4, 0, 0]}
            >
              {weeklyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.calories)} />
              ))}
            </Bar>
            {/* Goal line */}
            <Bar 
              dataKey="goal" 
              fill="transparent"
              stroke="hsl(var(--primary))"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Na meta</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-chart-3" />
          <span>Abaixo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive" />
          <span>Acima</span>
        </div>
      </div>

      {/* Macros Distribution */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3">Distribuição média de macros</p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={weeklyData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="protein" 
                stackId="1"
                stroke="hsl(210 100% 60%)" 
                fill="hsl(210 100% 60% / 0.3)"
                name="Proteína (g)"
              />
              <Area 
                type="monotone" 
                dataKey="carbs" 
                stackId="1"
                stroke="hsl(45 100% 50%)" 
                fill="hsl(45 100% 50% / 0.3)"
                name="Carbos (g)"
              />
              <Area 
                type="monotone" 
                dataKey="fat" 
                stackId="1"
                stroke="hsl(0 70% 55%)" 
                fill="hsl(0 70% 55% / 0.3)"
                name="Gordura (g)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
