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
  Target,
  Scan
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GymQRScanner } from '@/components/academiapro/app/GymQRScanner';

export default function GymHomePage() {
  const { profile, user } = useGymAuth();
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
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
      (supabase
        .from('gym_personal_records' as any) as any)
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
    <div className="p-4 lg:p-0 space-y-6 pb-24 lg:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-2"
      >
        <div>
          <p className="text-muted-foreground text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold">{profile?.full_name?.split(' ')[0] || 'Atleta'}</h1>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setShowCheckIn(true)}
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          <Scan className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* QR Scanner Modal */}
      <GymQRScanner open={showCheckIn} onOpenChange={setShowCheckIn} />

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-primary/20 border border-primary/30 rounded-xl p-3 text-center">
          <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.streak}</p>
          <p className="text-[10px] text-muted-foreground">Sequência</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Dumbbell className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.workoutsThisWeek}</p>
          <p className="text-[10px] text-muted-foreground">Esta semana</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-xl font-bold">{stats.totalPRs}</p>
          <p className="text-[10px] text-muted-foreground">PRs</p>
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
          <Link to="/academiapro/app/treinos" className="text-primary text-sm flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {todayWorkout ? (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{todayWorkout.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {todayWorkout.gym_user_workout_exercises?.length || 0} exercícios
                </p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Timer className="w-4 h-4" />
                ~60 min
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto -mx-1 px-1">
              {todayWorkout.gym_user_workout_exercises?.slice(0, 3).map((ex: any, i: number) => (
                <div key={i} className="flex-shrink-0 flex-1 min-w-[100px] bg-muted/50 rounded-lg p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {ex.gym_exercises?.name || 'Exercício'}
                  </p>
                  <p className="text-sm font-medium">{ex.sets}x{ex.reps}</p>
                </div>
              ))}
            </div>

            <Link to={`/academiapro/app/treinos/${todayWorkout.id}/executar`}>
              <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Treino
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Nenhum treino programado para hoje</p>
            <Link to="/academiapro/app/treinos">
              <Button variant="outline" className="border-border hover:bg-muted">
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
          <div className="bg-primary/20 border border-primary/30 rounded-xl p-4 hover:border-primary/50 transition-all h-full">
            <Target className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-medium">Meu Plano</h3>
            <p className="text-xs text-muted-foreground">Agenda personalizada</p>
          </div>
        </Link>
        <Link to="/academiapro/app/aulas">
          <div className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-all h-full">
            <CalendarDays className="w-6 h-6 text-muted-foreground mb-2" />
            <h3 className="font-medium">Aulas Coletivas</h3>
            <p className="text-xs text-muted-foreground">Agende sua aula</p>
          </div>
        </Link>
        <Link to="/academiapro/app/evolucao">
          <div className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-all h-full">
            <TrendingUp className="w-6 h-6 text-muted-foreground mb-2" />
            <h3 className="font-medium">Minha Evolução</h3>
            <p className="text-xs text-muted-foreground">Veja seu progresso</p>
          </div>
        </Link>
        <Link to="/academiapro/app/treinos">
          <div className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-all h-full">
            <Dumbbell className="w-6 h-6 text-muted-foreground mb-2" />
            <h3 className="font-medium">Treinos</h3>
            <p className="text-xs text-muted-foreground">Biblioteca de treinos</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
