import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dumbbell, Play, Calendar, Clock } from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function GymWorkoutsPage() {
  const { profile } = useGymAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      fetchWorkouts();
    }
  }, [profile]);

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('gym_user_workouts')
      .select(`
        *,
        gym_user_workout_exercises(
          id,
          sets,
          reps,
          gym_exercises(name, muscle_group_id)
        )
      `)
      .eq('user_id', profile?.user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setWorkouts(data);
    }
    setIsLoading(false);
  };

  const formatDays = (days: number[] | null) => {
    if (!days || days.length === 0) return 'Sem dias definidos';
    return days.map(d => WEEKDAYS[d]).join(', ');
  };

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="text-2xl font-bold">Meus Treinos</h1>
        <p className="text-muted-foreground text-sm">Seus treinos personalizados</p>
      </motion.div>

      {/* Workouts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))
        ) : workouts.length > 0 ? (
          workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-4 hover:border-border/80 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{workout.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{formatDays(workout.day_of_week)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-primary font-medium">
                    {workout.gym_user_workout_exercises?.length || 0}
                  </span>
                  <p className="text-xs text-muted-foreground">exercícios</p>
                </div>
              </div>

              {/* Exercise preview */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1">
                {workout.gym_user_workout_exercises?.slice(0, 3).map((ex: any, i: number) => (
                  <div key={i} className="flex-shrink-0 bg-muted/50 rounded-lg px-3 py-2 min-w-[90px]">
                    <p className="text-xs text-muted-foreground truncate">
                      {ex.gym_exercises?.name || 'Exercício'}
                    </p>
                    <p className="text-sm font-medium">{ex.sets}x{ex.reps}</p>
                  </div>
                ))}
                {workout.gym_user_workout_exercises?.length > 3 && (
                  <div className="flex-shrink-0 bg-muted/50 rounded-lg px-3 py-2 flex items-center">
                    <span className="text-sm text-muted-foreground">
                      +{workout.gym_user_workout_exercises.length - 3}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link to={`/academiapro/app/treinos/${workout.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-border hover:bg-muted">
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Detalhes
                  </Button>
                </Link>
                <Link to={`/academiapro/app/treinos/${workout.id}/executar`}>
                  <Button className="bg-primary hover:bg-primary/80 px-4">
                    <Play className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-card border border-border rounded-2xl p-8 text-center">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhum treino encontrado</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Seu instrutor ainda não criou treinos para você
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
