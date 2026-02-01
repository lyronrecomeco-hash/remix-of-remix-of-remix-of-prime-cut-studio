import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Flame, 
  TrendingUp, 
  CalendarDays, 
  ChevronRight,
  Play,
  Trophy,
  Timer,
  Target
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function GymHomePage() {
  const { profile } = useGymAuth();
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    totalPRs: 0,
    streak: 0
  });

  useEffect(() => {
    if (profile?.user_id) {
      fetchTodayWorkout();
      fetchStats();
    }
  }, [profile]);

  const fetchTodayWorkout = async () => {
    const today = new Date().getDay();
    
    const { data } = await supabase
      .from('gym_user_workouts')
      .select(`
        *,
        gym_user_workout_exercises(
          *,
          gym_exercises(*)
        )
      `)
      .eq('user_id', profile?.user_id)
      .eq('is_active', true)
      .contains('day_of_week', [today])
      .single();

    if (data) {
      setTodayWorkout(data);
    }
  };

  const fetchStats = async () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [workoutsRes, prsRes] = await Promise.all([
      supabase
        .from('gym_workout_logs')
        .select('id', { count: 'exact' })
        .eq('user_id', profile?.user_id)
        .gte('started_at', weekStart.toISOString()),
      supabase
        .from('gym_personal_records')
        .select('id', { count: 'exact' })
        .eq('user_id', profile?.user_id)
    ]);

    setStats({
      workoutsThisWeek: workoutsRes.count || 0,
      totalPRs: prsRes.count || 0,
      streak: calculateStreak(workoutsRes.count || 0)
    });
  };

  const calculateStreak = (workouts: number) => {
    return Math.min(workouts, 7);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <p className="text-zinc-400 text-sm">{greeting()},</p>
        <h1 className="text-2xl font-bold">{profile?.full_name?.split(' ')[0] || 'Atleta'}</h1>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.streak}</p>
          <p className="text-[10px] text-zinc-400">Sequência</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <Dumbbell className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.workoutsThisWeek}</p>
          <p className="text-[10px] text-zinc-400">Esta semana</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.totalPRs}</p>
          <p className="text-[10px] text-zinc-400">PRs</p>
        </div>
      </motion.div>

      {/* Today's Workout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Treino de Hoje</h2>
          <Link to="/academiapro/app/treinos" className="text-orange-500 text-sm flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {todayWorkout ? (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{todayWorkout.name}</h3>
                <p className="text-zinc-400 text-sm">
                  {todayWorkout.gym_user_workout_exercises?.length || 0} exercícios
                </p>
              </div>
              <div className="flex items-center gap-1 text-zinc-400 text-sm">
                <Timer className="w-4 h-4" />
                ~60 min
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto -mx-1 px-1">
              {todayWorkout.gym_user_workout_exercises?.slice(0, 3).map((ex: any, i: number) => (
                <div key={i} className="flex-shrink-0 flex-1 min-w-[100px] bg-zinc-800/50 rounded-lg p-2">
                  <p className="text-xs text-zinc-400 truncate">
                    {ex.gym_exercises?.name || 'Exercício'}
                  </p>
                  <p className="text-sm font-medium">{ex.sets}x{ex.reps}</p>
                </div>
              ))}
            </div>

            <Link to={`/academiapro/app/treinos/${todayWorkout.id}/executar`}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Treino
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">Nenhum treino programado para hoje</p>
            <Link to="/academiapro/app/treinos">
              <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                Ver meus treinos
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <Link to="/academiapro/app/meu-plano">
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/50 transition-all h-full">
            <Target className="w-6 h-6 text-orange-500 mb-2" />
            <h3 className="font-medium">Meu Plano</h3>
            <p className="text-xs text-zinc-400">Agenda personalizada</p>
          </div>
        </Link>
        <Link to="/academiapro/app/aulas">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all h-full">
            <CalendarDays className="w-6 h-6 text-zinc-400 mb-2" />
            <h3 className="font-medium">Aulas Coletivas</h3>
            <p className="text-xs text-zinc-400">Agende sua aula</p>
          </div>
        </Link>
        <Link to="/academiapro/app/evolucao">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all h-full">
            <TrendingUp className="w-6 h-6 text-zinc-400 mb-2" />
            <h3 className="font-medium">Minha Evolução</h3>
            <p className="text-xs text-zinc-400">Veja seu progresso</p>
          </div>
        </Link>
        <Link to="/academiapro/app/treinos">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all h-full">
            <Dumbbell className="w-6 h-6 text-zinc-400 mb-2" />
            <h3 className="font-medium">Treinos</h3>
            <p className="text-xs text-zinc-400">Biblioteca de treinos</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
