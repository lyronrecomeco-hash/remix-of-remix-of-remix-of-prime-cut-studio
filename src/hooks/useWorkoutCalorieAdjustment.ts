import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface WorkoutData {
  totalWorkouts: number;
  totalDuration: number;
  estimatedCaloriesBurned: number;
  adjustedCalorieGoal: number;
}

export function useWorkoutCalorieAdjustment(userId: string | undefined, baseCalorieGoal: number) {
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    totalWorkouts: 0,
    totalDuration: 0,
    estimatedCaloriesBurned: 0,
    adjustedCalorieGoal: baseCalorieGoal
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    loadTodayWorkouts();
  }, [userId, baseCalorieGoal]);

  const loadTodayWorkouts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // Get completed workout logs for today
      const { data: workoutLogs } = await supabase
        .from('gym_workout_logs' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('workout_date', today);

      if (workoutLogs && workoutLogs.length > 0) {
        // Calculate metrics
        const totalWorkouts = workoutLogs.length;
        
        // Estimate duration based on sets completed (avg 2 min per set including rest)
        const totalSets = workoutLogs.reduce((sum: number, log: any) => sum + (log.sets_completed || 1), 0);
        const totalDuration = totalSets * 2; // minutes
        
        // Estimate calories burned (rough estimate: 5-8 kcal per minute of weight training)
        const caloriesPerMinute = 6;
        const estimatedCaloriesBurned = Math.round(totalDuration * caloriesPerMinute);
        
        // Adjust calorie goal: add back ~70% of burned calories (to maintain deficit but fuel recovery)
        const adjustedCalorieGoal = baseCalorieGoal + Math.round(estimatedCaloriesBurned * 0.7);

        setWorkoutData({
          totalWorkouts,
          totalDuration,
          estimatedCaloriesBurned,
          adjustedCalorieGoal
        });
      } else {
        // No workouts today
        setWorkoutData({
          totalWorkouts: 0,
          totalDuration: 0,
          estimatedCaloriesBurned: 0,
          adjustedCalorieGoal: baseCalorieGoal
        });
      }
    } catch (error) {
      console.error('Error loading workout data:', error);
      setWorkoutData({
        totalWorkouts: 0,
        totalDuration: 0,
        estimatedCaloriesBurned: 0,
        adjustedCalorieGoal: baseCalorieGoal
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { workoutData, isLoading, refresh: loadTodayWorkouts };
}
