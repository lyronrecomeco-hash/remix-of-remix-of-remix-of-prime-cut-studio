import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  Dumbbell,
  Trophy,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function GymWorkoutExecution() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const { user } = useGymAuth();
  
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (workoutId) {
      fetchWorkout();
    }
  }, [workoutId]);

  // Workout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && !isResting) {
      interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, isResting]);

  // Rest timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setIsRunning(false);
            if (soundEnabled) {
              playSound();
            }
            return restTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, isRunning, timeRemaining, restTime, soundEnabled]);

  const playSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  };

  const fetchWorkout = async () => {
    const { data } = await supabase
      .from('gym_user_workouts')
      .select(`
        *,
        gym_user_workout_exercises(
          *,
          gym_exercises(*)
        )
      `)
      .eq('id', workoutId)
      .single();

    if (data) {
      setWorkout(data);
      setExercises(data.gym_user_workout_exercises || []);
      // Default rest time of 60 seconds
      setRestTime(60);
      setTimeRemaining(60);
    }
    setIsLoading(false);
  };

  const startWorkout = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('gym_workout_logs')
      .insert({
        user_id: user.id,
        workout_id: workoutId,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (data) {
      setWorkoutLogId(data.id);
      setWorkoutStarted(true);
    }
  };

  const completeSet = () => {
    const currentExercise = exercises[currentExerciseIndex];
    const exerciseId = currentExercise.id;
    
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), currentSet]
    }));

    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setTimeRemaining(restTime);
      setIsRunning(true);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(true);
      setTimeRemaining(restTime);
      setIsRunning(true);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    if (workoutLogId) {
      await supabase
        .from('gym_workout_logs')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: totalTime
        })
        .eq('id', workoutLogId);
    }
    toast.success('Treino concluído! 💪');
    navigate('/academiapro/app/treinos');
  };

  const skipRest = () => {
    setIsResting(false);
    setIsRunning(false);
    setTimeRemaining(restTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = exercises.length > 0 
    ? ((currentExerciseIndex * 100) / exercises.length) + 
      ((currentSet / (exercises[currentExerciseIndex]?.sets || 1)) * (100 / exercises.length))
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="font-semibold">{workout?.name}</h1>
            <p className="text-xs text-zinc-400">{formatTime(totalTime)} transcorrido</p>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 -mr-2">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
          </button>
        </div>
        <Progress value={progress} className="mt-3 h-1 bg-zinc-800" />
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-32">
        {!workoutStarted ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center mb-6">
              <Dumbbell className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{workout?.name}</h2>
            <p className="text-zinc-400 mb-6">
              {exercises.length} exercícios • ~{workout?.estimated_duration || 60} min
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-xs">
              {exercises.slice(0, 3).map((ex, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-zinc-400 truncate">{ex.gym_exercises?.name}</p>
                  <p className="font-semibold text-sm">{ex.sets}x{ex.reps}</p>
                </div>
              ))}
            </div>
            <Button 
              onClick={startWorkout}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-12"
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Treino
            </Button>
          </motion.div>
        ) : isResting ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <p className="text-zinc-400 text-sm mb-4">Descanse</p>
            <div className="relative mb-6">
              <div className="w-48 h-48 rounded-full border-4 border-zinc-800 flex items-center justify-center">
                <span className="text-5xl font-bold">{timeRemaining}</span>
              </div>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray={`${(timeRemaining / restTime) * 289} 289`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-zinc-400 mb-6">
              Próximo: <span className="text-white font-medium">
                {currentSet <= currentExercise.sets 
                  ? `Série ${currentSet} de ${currentExercise.sets}`
                  : exercises[currentExerciseIndex + 1]?.gym_exercises?.name || 'Finalizar'
                }
              </span>
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsRunning(!isRunning)}
                className="border-zinc-700"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button 
                onClick={skipRest}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Pular descanso
              </Button>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExerciseIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Exercise Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-orange-500 font-medium">
                    Exercício {currentExerciseIndex + 1}/{exercises.length}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Série {currentSet}/{currentExercise?.sets}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  {currentExercise?.gym_exercises?.name}
                </h2>
                
                <p className="text-zinc-400 text-sm mb-6">
                  {currentExercise?.gym_exercises?.instructions || 'Execute o movimento com controle e boa forma.'}
                </p>

                {/* Exercise Video/Image Placeholder */}
                <div className="aspect-video bg-zinc-800 rounded-xl flex items-center justify-center mb-6">
                  <Dumbbell className="w-16 h-16 text-zinc-600" />
                </div>

                {/* Sets/Reps Info */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-2xl font-bold text-orange-500">{currentExercise?.sets}</p>
                    <p className="text-xs text-zinc-400">Séries</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-2xl font-bold">{currentExercise?.reps}</p>
                    <p className="text-xs text-zinc-400">Repetições</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-2xl font-bold">{currentExercise?.weight_kg || '--'}</p>
                    <p className="text-xs text-zinc-400">Kg</p>
                  </div>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2">
                {Array.from({ length: currentExercise?.sets || 0 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      completedSets[currentExercise?.id]?.includes(i + 1)
                        ? 'bg-orange-500'
                        : i + 1 === currentSet
                        ? 'bg-orange-500/50 ring-2 ring-orange-500'
                        : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Actions */}
      {workoutStarted && !isResting && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 p-4 pb-safe">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 h-14"
              onClick={() => {
                if (currentExerciseIndex > 0 || currentSet > 1) {
                  if (currentSet > 1) {
                    setCurrentSet(prev => prev - 1);
                  } else {
                    setCurrentExerciseIndex(prev => prev - 1);
                    setCurrentSet(exercises[currentExerciseIndex - 1]?.sets || 1);
                  }
                }
              }}
              disabled={currentExerciseIndex === 0 && currentSet === 1}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Anterior
            </Button>
            <Button
              className="flex-[2] bg-orange-500 hover:bg-orange-600 h-14 text-lg font-semibold"
              onClick={completeSet}
            >
              <Check className="w-5 h-5 mr-2" />
              Concluir Série
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
