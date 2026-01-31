-- ===========================================
-- TABELAS PARA PLANO PERSONALIZADO DO ALUNO
-- ===========================================

-- 1. Plano geral do aluno (vincula aluno ao instrutor e metas)
CREATE TABLE public.gym_student_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.gym_profiles(user_id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.gym_profiles(user_id),
  plan_id UUID REFERENCES public.gym_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  goals TEXT[] DEFAULT '{}',
  observations TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- 2. Agendamento de treinos semanais do aluno
CREATE TABLE public.gym_student_workout_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_plan_id UUID NOT NULL REFERENCES public.gym_student_plans(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.gym_user_workouts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  preferred_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_plan_id, workout_id, day_of_week)
);

-- 3. Matrículas em aulas coletivas
CREATE TABLE public.gym_student_class_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_plan_id UUID NOT NULL REFERENCES public.gym_student_plans(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.gym_classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(student_plan_id, class_id)
);

-- ===========================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================
CREATE INDEX idx_gym_student_plans_student ON public.gym_student_plans(student_id);
CREATE INDEX idx_gym_student_plans_instructor ON public.gym_student_plans(instructor_id);
CREATE INDEX idx_gym_student_workout_schedule_plan ON public.gym_student_workout_schedule(student_plan_id);
CREATE INDEX idx_gym_student_class_enrollments_plan ON public.gym_student_class_enrollments(student_plan_id);

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- gym_student_plans
ALTER TABLE public.gym_student_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos podem ver seu próprio plano"
ON public.gym_student_plans FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Instrutores e admins podem ver todos os planos"
ON public.gym_student_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gym_user_roles
    WHERE user_id = auth.uid() AND role IN ('instrutor', 'admin')
  )
);

CREATE POLICY "Instrutores e admins podem criar planos"
ON public.gym_student_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.gym_user_roles
    WHERE user_id = auth.uid() AND role IN ('instrutor', 'admin')
  )
);

CREATE POLICY "Instrutores e admins podem atualizar planos"
ON public.gym_student_plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.gym_user_roles
    WHERE user_id = auth.uid() AND role IN ('instrutor', 'admin')
  )
);

CREATE POLICY "Instrutores e admins podem deletar planos"
ON public.gym_student_plans FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.gym_user_roles
    WHERE user_id = auth.uid() AND role IN ('instrutor', 'admin')
  )
);

-- gym_student_workout_schedule
ALTER TABLE public.gym_student_workout_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos podem ver sua agenda de treinos"
ON public.gym_student_workout_schedule FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gym_student_plans
    WHERE id = student_plan_id AND student_id = auth.uid()
  )
);

CREATE POLICY "Instrutores e admins podem gerenciar agenda de treinos"
ON public.gym_student_workout_schedule FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_user_roles
    WHERE user_id = auth.uid() AND role IN ('instrutor', 'admin')
  )
);

-- gym_student_class_enrollments
ALTER TABLE public.gym_student_class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alunos podem ver suas matrículas em aulas"
ON public.gym_student_class_enrollments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gym_student_plans
    WHERE id = student_plan_id AND student_id = auth.uid()
  )
);

CREATE POLICY "Instrutores e admins podem gerenciar matrículas"
ON public.gym_student_class_enrollments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_user_roles
    WHERE user_id = auth.uid() AND role IN ('instrutor', 'admin')
  )
);

-- ===========================================
-- TRIGGER PARA UPDATED_AT
-- ===========================================
CREATE TRIGGER update_gym_student_plans_updated_at
BEFORE UPDATE ON public.gym_student_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();