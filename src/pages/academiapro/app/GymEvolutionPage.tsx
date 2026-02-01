import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Scale, 
  Ruler, 
  Trophy,
  Calendar,
  Plus,
  Target,
  Activity,
  ChevronDown
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function GymEvolutionPage() {
  const { profile, user } = useGymAuth();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [workoutStats, setWorkoutStats] = useState({ total: 0, thisMonth: 0 });
  const [openAddMeasurement, setOpenAddMeasurement] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [isLoading, setIsLoading] = useState(true);
  const [newMeasurement, setNewMeasurement] = useState({
    weight_kg: '',
    body_fat_percent: '',
    chest_cm: '',
    waist_cm: '',
    hip_cm: '',
    arm_cm: '',
    thigh_cm: ''
  });

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchMeasurements(),
      fetchPersonalRecords(),
      fetchWorkoutStats()
    ]);
    setIsLoading(false);
  };

  const fetchMeasurements = async () => {
    // Using profile data for now as measurements table may not exist
    if (profile?.weight_kg) {
      setMeasurements([{
        measured_at: new Date().toISOString(),
        weight_kg: profile.weight_kg,
        body_fat_percent: null
      }]);
    }
  };

  const fetchPersonalRecords = async () => {
    const { data } = await (supabase
      .from('gym_personal_records' as any) as any)
      .select(`
        *,
        gym_exercises(name)
      `)
      .eq('user_id', user?.id)
      .order('achieved_at', { ascending: false })
      .limit(10);

    if (data) setPersonalRecords(data);
  };

  const fetchWorkoutStats = async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [total, thisMonth] = await Promise.all([
      supabase
        .from('gym_workout_logs')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null),
      supabase
        .from('gym_workout_logs')
        .select('id', { count: 'exact' })
        .eq('user_id', user?.id)
        .gte('started_at', monthStart.toISOString())
        .not('completed_at', 'is', null)
    ]);

    setWorkoutStats({
      total: total.count || 0,
      thisMonth: thisMonth.count || 0
    });
  };

  const handleAddMeasurement = async () => {
    // Update profile with new measurements
    const updateData: any = {};
    if (newMeasurement.weight_kg) updateData.weight_kg = parseFloat(newMeasurement.weight_kg);

    if (Object.keys(updateData).length === 0) {
      toast.error('Preencha pelo menos um campo');
      return;
    }

    const { error } = await supabase
      .from('gym_profiles')
      .update(updateData)
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Erro ao salvar medidas');
      return;
    }

    toast.success('Medidas registradas!');
    setOpenAddMeasurement(false);
    setNewMeasurement({
      weight_kg: '',
      body_fat_percent: '',
      chest_cm: '',
      waist_cm: '',
      hip_cm: '',
      arm_cm: '',
      thigh_cm: ''
    });
    fetchMeasurements();
  };

  const getChartData = () => {
    return measurements.map(m => ({
      date: format(new Date(m.measured_at), 'dd/MM'),
      weight: m.weight_kg,
      bodyFat: m.body_fat_percent,
      chest: m.chest_cm,
      waist: m.waist_cm,
      arm: m.arm_cm
    }));
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      weight: 'Peso (kg)',
      bodyFat: 'Gordura (%)',
      chest: 'Peito (cm)',
      waist: 'Cintura (cm)',
      arm: 'Braço (cm)'
    };
    return labels[metric] || metric;
  };

  const chartData = getChartData();
  const latestMeasurement = measurements[measurements.length - 1];
  const previousMeasurement = measurements[measurements.length - 2];

  const getChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return current - previous;
  };

  const weightChange = getChange(latestMeasurement?.weight_kg, previousMeasurement?.weight_kg);

  return (
    <div className="p-4 lg:p-0 space-y-6 pb-24 lg:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-2"
      >
        <div>
          <h1 className="text-2xl font-bold">Minha Evolução</h1>
          <p className="text-zinc-400 text-sm">Acompanhe seu progresso</p>
        </div>
        <Dialog open={openAddMeasurement} onOpenChange={setOpenAddMeasurement}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Registrar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Medidas</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.weight_kg}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, weight_kg: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="70.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Gordura (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.body_fat_percent}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, body_fat_percent: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="15.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Peito (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.chest_cm}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, chest_cm: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Cintura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.waist_cm}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, waist_cm: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="80"
                />
              </div>
              <div className="space-y-2">
                <Label>Braço (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.arm_cm}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, arm_cm: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="35"
                />
              </div>
              <div className="space-y-2">
                <Label>Coxa (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newMeasurement.thigh_cm}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, thigh_cm: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="55"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddMeasurement}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Salvar Medidas
            </Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Scale className="w-5 h-5 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{latestMeasurement?.weight_kg || '--'}</p>
          <p className="text-xs text-zinc-400">Peso atual (kg)</p>
          {weightChange && (
            <p className={`text-xs mt-1 ${weightChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </p>
          )}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Activity className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{latestMeasurement?.body_fat_percent || '--'}</p>
          <p className="text-xs text-zinc-400">Gordura (%)</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Target className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{workoutStats.thisMonth}</p>
          <p className="text-xs text-zinc-400">Treinos este mês</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <Trophy className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{personalRecords.length}</p>
          <p className="text-xs text-zinc-400">Recordes pessoais</p>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Gráfico de Evolução</h3>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="weight">Peso</SelectItem>
              <SelectItem value="bodyFat">Gordura</SelectItem>
              <SelectItem value="chest">Peito</SelectItem>
              <SelectItem value="waist">Cintura</SelectItem>
              <SelectItem value="arm">Braço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis 
                dataKey="date" 
                stroke="#71717a" 
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #27272a',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#colorMetric)"
                name={getMetricLabel(selectedMetric)}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <p>Registre suas medidas para ver o gráfico</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Personal Records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 lg:p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Recordes Pessoais
        </h3>

        {personalRecords.length > 0 ? (
          <div className="space-y-3">
            {personalRecords.slice(0, 5).map((pr) => (
              <div 
                key={pr.id}
                className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl"
              >
                <div>
                  <p className="font-medium">{pr.gym_exercises?.name}</p>
                  <p className="text-xs text-zinc-400">
                    {format(new Date(pr.achieved_at), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">{pr.weight_kg} kg</p>
                  <p className="text-xs text-zinc-400">{pr.reps} reps</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
            <p>Nenhum recorde registrado ainda</p>
            <p className="text-sm">Complete seus treinos para registrar PRs!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
