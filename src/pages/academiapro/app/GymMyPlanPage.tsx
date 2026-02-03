import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Dumbbell, 
  Users, 
  Target, 
  Clock, 
  ChevronRight,
  User,
  CheckCircle2
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface StudentPlan {
  id: string;
  goals: string[];
  observations: string | null;
  start_date: string;
  instructor: {
    full_name: string;
  };
  plan: {
    name: string;
  } | null;
}

interface WorkoutSchedule {
  day_of_week: number;
  preferred_time: string;
  workout: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface ClassEnrollment {
  class: {
    id: string;
    name: string;
    day_of_week: number[];
    start_time: string;
    duration_minutes: number;
  };
}

export default function GymMyPlanPage() {
  const { profile } = useGymAuth();
  const [studentPlan, setStudentPlan] = useState<StudentPlan | null>(null);
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutSchedule[]>([]);
  const [classEnrollments, setClassEnrollments] = useState<ClassEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      fetchMyPlan();
    }
  }, [profile]);

  const fetchMyPlan = async () => {
    setIsLoading(true);
    
    try {
      // 1. Buscar plano do aluno
      const { data: planData, error: planError } = await supabase
        .from('gym_student_plans')
        .select(`
          id,
          goals,
          observations,
          start_date,
          instructor:gym_profiles!gym_student_plans_instructor_id_fkey(full_name),
          plan:gym_plans(name)
        `)
        .eq('student_id', profile?.user_id)
        .eq('status', 'active')
        .single();

      if (planData && !planError) {
        setStudentPlan(planData as any);

        // 2. Buscar agenda de treinos
        const { data: scheduleData } = await supabase
          .from('gym_student_workout_schedule')
          .select(`
            day_of_week,
            preferred_time,
            workout:gym_user_workouts(id, name, description)
          `)
          .eq('student_plan_id', planData.id)
          .eq('is_active', true);

        if (scheduleData) {
          setWorkoutSchedule(scheduleData as any);
        }

        // 3. Buscar matrículas em aulas
        const { data: enrollmentsData } = await supabase
          .from('gym_student_class_enrollments')
          .select(`
            class:gym_classes(id, name, day_of_week, start_time, duration_minutes)
          `)
          .eq('student_plan_id', planData.id)
          .eq('is_active', true);

        if (enrollmentsData) {
          setClassEnrollments(enrollmentsData as any);
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Construir agenda semanal consolidada
  const buildWeeklyAgenda = () => {
    const agenda: { [key: number]: { workouts: WorkoutSchedule[]; classes: ClassEnrollment[] } } = {};
    
    // Inicializar todos os dias
    for (let i = 0; i < 7; i++) {
      agenda[i] = { workouts: [], classes: [] };
    }

    // Adicionar treinos
    workoutSchedule.forEach(ws => {
      agenda[ws.day_of_week].workouts.push(ws);
    });

    // Adicionar aulas
    classEnrollments.forEach(ce => {
      ce.class.day_of_week?.forEach(day => {
        agenda[day].classes.push(ce);
      });
    });

    return agenda;
  };

  const weeklyAgenda = buildWeeklyAgenda();
  const today = new Date().getDay();

  if (isLoading) {
    return (
      <div className="p-4 lg:p-0 space-y-4">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!studentPlan) {
    return (
      <div className="p-4 lg:p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-8 text-center"
        >
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhum plano encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Seu instrutor ainda não criou um plano personalizado para você.
          </p>
          <Link to="/academiapro/app">
            <Button variant="outline" className="border-border">
              Voltar ao início
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Meu Plano</h1>
        <p className="text-muted-foreground text-sm">
          Desde {format(new Date(studentPlan.start_date), "d 'de' MMMM", { locale: ptBR })}
        </p>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="bg-card border border-border rounded-xl p-4">
          <User className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Instrutor</p>
          <p className="font-medium text-sm truncate">{studentPlan.instructor?.full_name || '-'}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <Target className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Objetivos</p>
          <p className="font-medium text-sm">{studentPlan.goals?.length || 0}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <Dumbbell className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Treinos/semana</p>
          <p className="font-medium text-sm">{workoutSchedule.length}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Aulas</p>
          <p className="font-medium text-sm">{classEnrollments.length}</p>
        </div>
      </motion.div>

      {/* Goals */}
      {studentPlan.goals && studentPlan.goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Meus Objetivos
          </h3>
          <div className="flex flex-wrap gap-2">
            {studentPlan.goals.map((goal, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary"
              >
                {goal}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Weekly Agenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Agenda Semanal
        </h3>
        
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const dayData = weeklyAgenda[dayIndex];
            const isToday = dayIndex === today;
            const hasActivities = dayData.workouts.length > 0 || dayData.classes.length > 0;
            
            return (
              <div 
                key={dayIndex}
                className={`rounded-xl p-3 min-h-[140px] transition-all ${
                  isToday 
                    ? 'bg-primary/20 border-2 border-primary/50' 
                    : hasActivities
                      ? 'bg-card border border-border'
                      : 'bg-card/50 border border-border'
                }`}
              >
                <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-primary/30' : 'border-border'}`}>
                  <p className={`text-xs ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{dayName}</p>
                  {isToday && <span className="text-[10px] text-primary font-medium">HOJE</span>}
                </div>
                
                <div className="space-y-2">
                  {dayData.workouts.map((ws, i) => (
                    <Link 
                      key={`w-${i}`}
                      to={`/academiapro/app/treinos/${ws.workout.id}`}
                      className="block p-2 bg-primary/10 rounded-lg text-xs hover:bg-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-1 text-primary mb-1">
                        <Dumbbell className="w-3 h-3" />
                        <span>{ws.preferred_time}</span>
                      </div>
                      <p className="text-foreground truncate">{ws.workout.name}</p>
                    </Link>
                  ))}
                  
                  {dayData.classes.map((ce, i) => (
                    <div 
                      key={`c-${i}`}
                      className="p-2 bg-accent/10 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-1 text-accent-foreground mb-1">
                        <Users className="w-3 h-3" />
                        <span>{ce.class.start_time?.slice(0, 5)}</span>
                      </div>
                      <p className="text-foreground truncate">{ce.class.name}</p>
                    </div>
                  ))}
                  
                  {!hasActivities && (
                    <p className="text-muted-foreground text-xs text-center pt-4">Descanso</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View - List */}
        <div className="md:hidden space-y-3">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const dayData = weeklyAgenda[dayIndex];
            const isToday = dayIndex === today;
            const hasActivities = dayData.workouts.length > 0 || dayData.classes.length > 0;
            
            if (!hasActivities && !isToday) return null;
            
            return (
              <div 
                key={dayIndex}
                className={`rounded-xl p-4 ${
                  isToday 
                    ? 'bg-primary/20 border border-primary/50' 
                    : 'bg-card border border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isToday ? 'text-primary' : ''}`}>{dayName}</span>
                    {isToday && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Hoje</span>
                    )}
                  </div>
                </div>
                
                {hasActivities ? (
                  <div className="space-y-2">
                    {dayData.workouts.map((ws, i) => (
                      <Link 
                        key={`w-${i}`}
                        to={`/academiapro/app/treinos/${ws.workout.id}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{ws.workout.name}</p>
                            <p className="text-xs text-muted-foreground">{ws.preferred_time}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </Link>
                    ))}
                    
                    {dayData.classes.map((ce, i) => (
                      <div 
                        key={`c-${i}`}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{ce.class.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ce.class.start_time?.slice(0, 5)} · {ce.class.duration_minutes}min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Dia de descanso</p>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Observations */}
      {studentPlan.observations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <h3 className="font-semibold mb-2">Observações do Instrutor</h3>
          <p className="text-muted-foreground text-sm">{studentPlan.observations}</p>
        </motion.div>
      )}
    </div>
  );
}
