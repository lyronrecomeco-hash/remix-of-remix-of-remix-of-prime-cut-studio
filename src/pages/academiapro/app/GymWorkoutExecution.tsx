import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  Dumbbell,
  Trophy,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Target,
  Timer,
  Award,
  TrendingUp,
  Sparkles,
  SkipForward
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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
  const [calories, setCalories] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastPR, setLastPR] = useState<any>(null);

  useEffect(() => {
    if (workoutId) fetchWorkout();
  }, [workoutId]);

  // Workout timer with calorie estimation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && !isResting) {
      interval = setInterval(() => {
        setTotalTime(prev => prev + 1);
        // Estimate ~6 calories per minute during active exercise
        if (totalTime > 0 && totalTime % 10 === 0) {
          setCalories(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, isResting, totalTime]);

  // Rest timer with haptic feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 4 && prev > 1 && soundEnabled) {
            playTickSound();
          }
          if (prev <= 1) {
            setIsResting(false);
            setIsRunning(false);
            if (soundEnabled) playCompleteSound();
            vibrateDevice([100, 50, 100]);
            return restTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, isRunning, timeRemaining, restTime, soundEnabled]);

  const vibrateDevice = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const playTickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 50);
    } catch {}
  };

  const playCompleteSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.2;
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1100;
        setTimeout(() => oscillator.stop(), 150);
      }, 150);
    } catch {}
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['hsl(var(--primary))', '#22c55e', '#eab308']
    });
  };

  const fetchWorkout = async () => {
    const { data } = await supabase
      .from('gym_user_workouts')
      .select(`*, gym_user_workout_exercises(*, gym_exercises(*))`)
      .eq('id', workoutId)
      .single();

    if (data) {
      setWorkout(data);
      setExercises(data.gym_user_workout_exercises || []);
      setRestTime(60);
      setTimeRemaining(60);
    }
    setIsLoading(false);
  };

  const startWorkout = async () => {
    if (!user) return;
    vibrateDevice([50]);

    const { data, error } = await supabase
      .from('gym_workout_logs')
      .insert({ user_id: user.id, workout_id: workoutId, started_at: new Date().toISOString() })
      .select()
      .single();

    if (data) {
      setWorkoutLogId(data.id);
      setWorkoutStarted(true);
      toast.success('🔥 Treino iniciado! Vamos lá!');
    }
  };

  const completeSet = async () => {
    const currentExercise = exercises[currentExerciseIndex];
    const exerciseId = currentExercise.id;
    
    vibrateDevice([30]);
    setStreak(prev => prev + 1);
    
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), currentSet]
    }));

    // Check for PR (simplified)
    if (currentExercise.weight_kg && currentSet === currentExercise.sets) {
      // Could add actual PR checking logic here
    }

    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      setIsResting(true);
      setTimeRemaining(restTime);
      setIsRunning(true);
    } else if (currentExerciseIndex < exercises.length - 1) {
      // Exercise complete celebration
      setShowCelebration(true);
      triggerCelebration();
      setTimeout(() => setShowCelebration(false), 1500);
      
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
        .update({ completed_at: new Date().toISOString(), duration_seconds: totalTime })
        .eq('id', workoutLogId);
    }
    
    triggerCelebration();
    setTimeout(() => triggerCelebration(), 300);
    
    toast.success('🏆 Treino concluído! Parabéns!');
    setTimeout(() => navigate('/academiapro/app/treinos'), 2000);
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

  const totalSets = useMemo(() => 
    exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0)
  , [exercises]);

  const completedTotalSets = useMemo(() => 
    Object.values(completedSets).reduce((acc, sets) => acc + sets.length, 0)
  , [completedSets]);

  const progress = totalSets > 0 ? (completedTotalSets / totalSets) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="font-bold text-sm truncate">{workout?.name}</h1>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatTime(totalTime)}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {calories} kcal
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                {streak}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2 -mr-2 hover:bg-muted rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 relative">
          <Progress value={progress} className="h-2 bg-muted" />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>{completedTotalSets}/{totalSets} séries</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {!workoutStarted ? (
          /* Start Screen */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center py-8"
          >
            <motion.div 
              className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-6 relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Dumbbell className="w-14 h-14 text-primary" />
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-2">{workout?.name}</h2>
            <p className="text-muted-foreground mb-6">
              {exercises.length} exercícios • {totalSets} séries • ~{workout?.estimated_duration || 45} min
            </p>
            
            {/* Exercise Preview */}
            <div className="w-full max-w-sm space-y-2 mb-8">
              {exercises.slice(0, 4).map((ex, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{ex.gym_exercises?.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.sets}x{ex.reps} {ex.weight_kg && `• ${ex.weight_kg}kg`}</p>
                  </div>
                </motion.div>
              ))}
              {exercises.length > 4 && (
                <p className="text-xs text-muted-foreground">+{exercises.length - 4} exercícios</p>
              )}
            </div>
            
            <Button 
              onClick={startWorkout}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 h-14 text-lg font-bold shadow-lg shadow-primary/30"
            >
              <Play className="w-6 h-6 mr-2" />
              COMEÇAR TREINO
            </Button>
          </motion.div>
        ) : isResting ? (
          /* Rest Screen */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center py-8"
          >
            <p className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo de Descanso
            </p>
            
            <div className="relative mb-6">
              <motion.div 
                className="w-52 h-52 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${(timeRemaining / restTime) * 360}deg, hsl(var(--muted)) 0deg)`
                }}
              >
                <div className="w-44 h-44 rounded-full bg-background flex items-center justify-center">
                  <motion.span 
                    key={timeRemaining}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold tabular-nums"
                  >
                    {timeRemaining}
                  </motion.span>
                </div>
              </motion.div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 mb-6 w-full max-w-xs">
              <p className="text-xs text-muted-foreground mb-1">Próximo</p>
              <p className="font-semibold">
                {currentSet < currentExercise?.sets 
                  ? `Série ${currentSet + 1} de ${currentExercise.sets}`
                  : exercises[currentExerciseIndex + 1]?.gym_exercises?.name || '🏆 Finalizar'
                }
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className="border-border h-12 px-6"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button 
                onClick={skipRest}
                size="lg"
                className="bg-primary hover:bg-primary/90 h-12 px-6"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Pular
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Exercise Screen */
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentExerciseIndex}-${currentSet}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-4"
            >
              {/* Celebration Overlay */}
              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: 2, duration: 0.3 }}
                      >
                        <Award className="w-24 h-24 text-yellow-500 mx-auto" />
                      </motion.div>
                      <p className="text-2xl font-bold mt-2">Exercício Completo!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exercise Info Card */}
              <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center justify-between mb-4 relative">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                      {currentExerciseIndex + 1}/{exercises.length}
                    </span>
                    <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                      Série {currentSet}/{currentExercise?.sets}
                    </span>
                  </div>
                  {streak >= 5 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 bg-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1 rounded-full"
                    >
                      <Flame className="w-3 h-3" />
                      {streak} streak
                    </motion.div>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{currentExercise?.gym_exercises?.name}</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {currentExercise?.gym_exercises?.instructions || 'Execute o movimento com controle.'}
                </p>

                {/* Visual Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background)/0.5)_100%)]" />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Dumbbell className="w-20 h-20 text-muted-foreground/50" />
                  </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="bg-muted/50 border border-border/50 rounded-xl p-4 text-center"
                  >
                    <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold text-primary">{currentExercise?.sets}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Séries</p>
                  </motion.div>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="bg-muted/50 border border-border/50 rounded-xl p-4 text-center"
                  >
                    <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{currentExercise?.reps}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Reps</p>
                  </motion.div>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    className="bg-muted/50 border border-border/50 rounded-xl p-4 text-center"
                  >
                    <Dumbbell className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{currentExercise?.weight_kg || '--'}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Kg</p>
                  </motion.div>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 py-2">
                {Array.from({ length: currentExercise?.sets || 0 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      scale: completedSets[currentExercise?.id]?.includes(i + 1) ? [1, 1.3, 1] : 1,
                      backgroundColor: completedSets[currentExercise?.id]?.includes(i + 1)
                        ? 'hsl(var(--primary))'
                        : i + 1 === currentSet
                        ? 'hsl(var(--primary) / 0.5)'
                        : 'hsl(var(--muted))'
                    }}
                    className={`w-3 h-3 rounded-full ${
                      i + 1 === currentSet && !completedSets[currentExercise?.id]?.includes(i + 1)
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
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
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border p-4 pb-safe"
        >
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              variant="outline"
              className="flex-1 border-border h-14"
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
              className="flex-[2] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-14 text-lg font-bold shadow-lg shadow-primary/30"
              onClick={completeSet}
            >
              <Check className="w-6 h-6 mr-2" />
              CONCLUIR
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
