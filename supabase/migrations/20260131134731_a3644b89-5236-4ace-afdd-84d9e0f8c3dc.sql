-- Enum para roles da academia
CREATE TYPE public.gym_role AS ENUM ('aluno', 'instrutor', 'admin');

-- Enum para status de assinatura
CREATE TYPE public.gym_subscription_status AS ENUM ('active', 'inactive', 'pending', 'cancelled');

-- Enum para dificuldade de exercicio
CREATE TYPE public.exercise_difficulty AS ENUM ('iniciante', 'intermediario', 'avancado');

-- Tabela de perfis da academia
CREATE TABLE public.gym_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    birth_date DATE,
    gender TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    goals TEXT[],
    medical_restrictions TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de roles da academia
CREATE TABLE public.gym_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role gym_role NOT NULL DEFAULT 'aluno',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, role)
);

-- Tabela de planos
CREATE TABLE public.gym_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de assinaturas
CREATE TABLE public.gym_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.gym_plans(id) ON DELETE SET NULL,
    status gym_subscription_status DEFAULT 'pending',
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de grupos musculares
CREATE TABLE public.gym_muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de exercicios
CREATE TABLE public.gym_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    image_url TEXT,
    muscle_group_id UUID REFERENCES public.gym_muscle_groups(id) ON DELETE SET NULL,
    difficulty exercise_difficulty DEFAULT 'iniciante',
    equipment TEXT,
    instructions TEXT[],
    tips TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de templates de treino
CREATE TABLE public.gym_workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    difficulty exercise_difficulty DEFAULT 'iniciante',
    estimated_duration_min INTEGER DEFAULT 60,
    target_muscle_groups TEXT[],
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de exercicios do template
CREATE TABLE public.gym_workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.gym_workout_templates(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.gym_exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    sets INTEGER DEFAULT 3,
    reps TEXT DEFAULT '12',
    rest_seconds INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de treinos atribuidos aos alunos
CREATE TABLE public.gym_user_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.gym_workout_templates(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    day_of_week INTEGER[],
    is_active BOOLEAN DEFAULT true,
    starts_at DATE,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de exercicios do treino do usuario
CREATE TABLE public.gym_user_workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_workout_id UUID REFERENCES public.gym_user_workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.gym_exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    sets INTEGER DEFAULT 3,
    reps TEXT DEFAULT '12',
    rest_seconds INTEGER DEFAULT 60,
    weight_kg NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de logs de treino (historico)
CREATE TABLE public.gym_workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    user_workout_id UUID REFERENCES public.gym_user_workouts(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    calories_burned INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de logs de exercicios
CREATE TABLE public.gym_exercise_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_log_id UUID REFERENCES public.gym_workout_logs(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.gym_exercises(id) ON DELETE SET NULL NOT NULL,
    sets_completed INTEGER,
    reps_completed TEXT,
    weight_used_kg NUMERIC,
    notes TEXT,
    is_pr BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de aulas coletivas
CREATE TABLE public.gym_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    max_capacity INTEGER DEFAULT 20,
    duration_minutes INTEGER DEFAULT 60,
    recurring_days INTEGER[],
    start_time TIME,
    location TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de sessoes de aulas (instancias)
CREATE TABLE public.gym_class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.gym_classes(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de reservas de aulas
CREATE TABLE public.gym_class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.gym_class_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (session_id, user_id)
);

-- Tabela de check-ins
CREATE TABLE public.gym_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    method TEXT DEFAULT 'manual',
    notes TEXT
);

-- Tabela de medidas corporais
CREATE TABLE public.gym_body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    weight_kg NUMERIC,
    body_fat_percent NUMERIC,
    chest_cm NUMERIC,
    waist_cm NUMERIC,
    hips_cm NUMERIC,
    biceps_left_cm NUMERIC,
    biceps_right_cm NUMERIC,
    thigh_left_cm NUMERIC,
    thigh_right_cm NUMERIC,
    calf_left_cm NUMERIC,
    calf_right_cm NUMERIC,
    notes TEXT,
    measured_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de fotos de progresso
CREATE TABLE public.gym_progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    photo_type TEXT DEFAULT 'front',
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de records pessoais (PRs)
CREATE TABLE public.gym_personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.gym_exercises(id) ON DELETE CASCADE NOT NULL,
    weight_kg NUMERIC NOT NULL,
    reps INTEGER DEFAULT 1,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (user_id, exercise_id, weight_kg, reps)
);

-- Tabela de notificacoes
CREATE TABLE public.gym_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.gym_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_workout_template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_user_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_user_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_notifications ENABLE ROW LEVEL SECURITY;

-- Function to check gym role
CREATE OR REPLACE FUNCTION public.has_gym_role(_user_id uuid, _role gym_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.gym_user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is gym admin or instructor
CREATE OR REPLACE FUNCTION public.is_gym_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.gym_user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'instrutor')
  )
$$;

-- RLS Policies
CREATE POLICY "gym_profiles_select" ON public.gym_profiles FOR SELECT USING (auth.uid() = user_id OR public.is_gym_staff(auth.uid()));
CREATE POLICY "gym_profiles_update" ON public.gym_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "gym_profiles_insert" ON public.gym_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gym_profiles_staff" ON public.gym_profiles FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_roles_select" ON public.gym_user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gym_roles_admin" ON public.gym_user_roles FOR ALL USING (public.has_gym_role(auth.uid(), 'admin'));

CREATE POLICY "gym_plans_select" ON public.gym_plans FOR SELECT USING (is_active = true);
CREATE POLICY "gym_plans_admin" ON public.gym_plans FOR ALL USING (public.has_gym_role(auth.uid(), 'admin'));

CREATE POLICY "gym_subs_select" ON public.gym_subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_gym_staff(auth.uid()));
CREATE POLICY "gym_subs_staff" ON public.gym_subscriptions FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_muscle_select" ON public.gym_muscle_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "gym_muscle_admin" ON public.gym_muscle_groups FOR ALL USING (public.has_gym_role(auth.uid(), 'admin'));

CREATE POLICY "gym_exercises_select" ON public.gym_exercises FOR SELECT USING (is_active = true);
CREATE POLICY "gym_exercises_staff" ON public.gym_exercises FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_templates_select" ON public.gym_workout_templates FOR SELECT USING (is_public = true OR public.is_gym_staff(auth.uid()));
CREATE POLICY "gym_templates_staff" ON public.gym_workout_templates FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_template_ex_select" ON public.gym_workout_template_exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "gym_template_ex_staff" ON public.gym_workout_template_exercises FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_user_workouts_select" ON public.gym_user_workouts FOR SELECT USING (auth.uid() = user_id OR public.is_gym_staff(auth.uid()));
CREATE POLICY "gym_user_workouts_staff" ON public.gym_user_workouts FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_user_workout_ex_select" ON public.gym_user_workout_exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "gym_user_workout_ex_staff" ON public.gym_user_workout_exercises FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_logs_own" ON public.gym_workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "gym_logs_staff" ON public.gym_workout_logs FOR SELECT USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_ex_logs" ON public.gym_exercise_logs FOR ALL TO authenticated USING (true);

CREATE POLICY "gym_classes_select" ON public.gym_classes FOR SELECT USING (is_active = true);
CREATE POLICY "gym_classes_staff" ON public.gym_classes FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_sessions_select" ON public.gym_class_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "gym_sessions_staff" ON public.gym_class_sessions FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_bookings_own" ON public.gym_class_bookings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "gym_bookings_staff" ON public.gym_class_bookings FOR SELECT USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_checkins_select" ON public.gym_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gym_checkins_insert" ON public.gym_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gym_checkins_staff" ON public.gym_check_ins FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_measurements_select" ON public.gym_body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gym_measurements_staff" ON public.gym_body_measurements FOR ALL USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_photos_own" ON public.gym_progress_photos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "gym_photos_staff" ON public.gym_progress_photos FOR SELECT USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_prs_own" ON public.gym_personal_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "gym_prs_staff" ON public.gym_personal_records FOR SELECT USING (public.is_gym_staff(auth.uid()));

CREATE POLICY "gym_notifications_own" ON public.gym_notifications FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.gym_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gym_profiles_updated_at BEFORE UPDATE ON public.gym_profiles FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();
CREATE TRIGGER gym_plans_updated_at BEFORE UPDATE ON public.gym_plans FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();
CREATE TRIGGER gym_subscriptions_updated_at BEFORE UPDATE ON public.gym_subscriptions FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();
CREATE TRIGGER gym_exercises_updated_at BEFORE UPDATE ON public.gym_exercises FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();
CREATE TRIGGER gym_workout_templates_updated_at BEFORE UPDATE ON public.gym_workout_templates FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();
CREATE TRIGGER gym_user_workouts_updated_at BEFORE UPDATE ON public.gym_user_workouts FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();
CREATE TRIGGER gym_classes_updated_at BEFORE UPDATE ON public.gym_classes FOR EACH ROW EXECUTE FUNCTION public.gym_update_updated_at();