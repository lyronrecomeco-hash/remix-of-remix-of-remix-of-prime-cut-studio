-- =============================================
-- GENESIS ACADEMIA - FULL FEATURE EXPANSION (FIXED)
-- =============================================

-- 1. INSTRUTORES (Instructor Management)
CREATE TABLE IF NOT EXISTS public.gym_instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialties TEXT[],
  cref TEXT,
  photo_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  hire_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. ADD STATUS TO GYM_PROFILES (Student Status)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_profiles' AND column_name = 'status') THEN
    ALTER TABLE public.gym_profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_profiles' AND column_name = 'instructor_id') THEN
    ALTER TABLE public.gym_profiles ADD COLUMN instructor_id UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_profiles' AND column_name = 'instructor_notes') THEN
    ALTER TABLE public.gym_profiles ADD COLUMN instructor_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_profiles' AND column_name = 'last_activity_at') THEN
    ALTER TABLE public.gym_profiles ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. AVALIAÇÃO FÍSICA (Physical Evaluation)
CREATE TABLE IF NOT EXISTS public.gym_physical_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instructor_id UUID,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  bmi DECIMAL(4,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  left_arm_cm DECIMAL(5,2),
  right_arm_cm DECIMAL(5,2),
  left_thigh_cm DECIMAL(5,2),
  right_thigh_cm DECIMAL(5,2),
  left_calf_cm DECIMAL(5,2),
  right_calf_cm DECIMAL(5,2),
  resting_heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  notes TEXT,
  photos JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. PROGRESSÃO DE CARGAS (Load Progression)
CREATE TABLE IF NOT EXISTS public.gym_exercise_progressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID,
  workout_exercise_id UUID,
  previous_weight_kg DECIMAL(6,2),
  current_weight_kg DECIMAL(6,2),
  progression_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progression_type TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. OBSERVAÇÕES POR EXERCÍCIO (Exercise Notes)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_user_workout_exercises' AND column_name = 'instructor_notes') THEN
    ALTER TABLE public.gym_user_workout_exercises ADD COLUMN instructor_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_user_workout_exercises' AND column_name = 'current_weight_kg') THEN
    ALTER TABLE public.gym_user_workout_exercises ADD COLUMN current_weight_kg DECIMAL(6,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_user_workout_exercises' AND column_name = 'auto_progression') THEN
    ALTER TABLE public.gym_user_workout_exercises ADD COLUMN auto_progression BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_user_workout_exercises' AND column_name = 'progression_increment_kg') THEN
    ALTER TABLE public.gym_user_workout_exercises ADD COLUMN progression_increment_kg DECIMAL(4,2) DEFAULT 2.5;
  END IF;
END $$;

-- 6. COMUNICAÇÃO / AVISOS (Announcements)
CREATE TABLE IF NOT EXISTS public.gym_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  target_audience TEXT DEFAULT 'all',
  target_user_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. LEITURA DE AVISOS (Announcement Reads)
CREATE TABLE IF NOT EXISTS public.gym_announcement_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- 8. PRESENÇA EM AULAS (Class Attendance)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_class_sessions' AND column_name = 'current_attendees') THEN
    ALTER TABLE public.gym_class_sessions ADD COLUMN current_attendees INTEGER DEFAULT 0;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.gym_class_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'enrolled',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- 9. HISTÓRICO FINANCEIRO DETALHADO
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_payments' AND column_name = 'reference_month') THEN
    ALTER TABLE public.gym_payments ADD COLUMN reference_month DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_payments' AND column_name = 'receipt_url') THEN
    ALTER TABLE public.gym_payments ADD COLUMN receipt_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gym_payments' AND column_name = 'notes') THEN
    ALTER TABLE public.gym_payments ADD COLUMN notes TEXT;
  END IF;
END $$;

-- 10. RELATÓRIOS CACHE
CREATE TABLE IF NOT EXISTS public.gym_reports_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL,
  report_period TEXT NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(report_type, report_period)
);

-- =============================================
-- RLS POLICIES (Using gym_user_roles for role check)
-- =============================================

-- Instructors
ALTER TABLE public.gym_instructors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view instructors" ON public.gym_instructors;
CREATE POLICY "Authenticated users can view instructors"
ON public.gym_instructors FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Staff can manage instructors" ON public.gym_instructors;
CREATE POLICY "Staff can manage instructors"
ON public.gym_instructors FOR ALL
TO authenticated
USING (public.is_gym_staff(auth.uid()));

-- Physical Evaluations
ALTER TABLE public.gym_physical_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own evaluations" ON public.gym_physical_evaluations;
CREATE POLICY "Users can view own evaluations"
ON public.gym_physical_evaluations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage evaluations" ON public.gym_physical_evaluations;
CREATE POLICY "Staff can manage evaluations"
ON public.gym_physical_evaluations FOR ALL
TO authenticated
USING (public.is_gym_staff(auth.uid()));

-- Exercise Progressions
ALTER TABLE public.gym_exercise_progressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progressions" ON public.gym_exercise_progressions;
CREATE POLICY "Users can view own progressions"
ON public.gym_exercise_progressions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own progressions" ON public.gym_exercise_progressions;
CREATE POLICY "Users can create own progressions"
ON public.gym_exercise_progressions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage all progressions" ON public.gym_exercise_progressions;
CREATE POLICY "Staff can manage all progressions"
ON public.gym_exercise_progressions FOR ALL
TO authenticated
USING (public.is_gym_staff(auth.uid()));

-- Announcements
ALTER TABLE public.gym_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view active announcements" ON public.gym_announcements;
CREATE POLICY "Users can view active announcements"
ON public.gym_announcements FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (starts_at IS NULL OR starts_at <= now())
  AND (expires_at IS NULL OR expires_at > now())
);

DROP POLICY IF EXISTS "Staff can manage announcements" ON public.gym_announcements;
CREATE POLICY "Staff can manage announcements"
ON public.gym_announcements FOR ALL
TO authenticated
USING (public.is_gym_staff(auth.uid()));

-- Announcement Reads
ALTER TABLE public.gym_announcement_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own reads" ON public.gym_announcement_reads;
CREATE POLICY "Users can manage own reads"
ON public.gym_announcement_reads FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Class Attendance
ALTER TABLE public.gym_class_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own attendance" ON public.gym_class_attendance;
CREATE POLICY "Users can view own attendance"
ON public.gym_class_attendance FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can manage all attendance" ON public.gym_class_attendance;
CREATE POLICY "Staff can manage all attendance"
ON public.gym_class_attendance FOR ALL
TO authenticated
USING (public.is_gym_staff(auth.uid()));

-- Reports Cache
ALTER TABLE public.gym_reports_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can access reports" ON public.gym_reports_cache;
CREATE POLICY "Staff can access reports"
ON public.gym_reports_cache FOR ALL
TO authenticated
USING (public.is_gym_staff(auth.uid()));

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION public.calculate_bmi(weight_kg DECIMAL, height_cm DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF height_cm IS NULL OR height_cm = 0 OR weight_kg IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ROUND((weight_kg / ((height_cm / 100) ^ 2))::DECIMAL, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if student can check-in (not blocked/overdue)
CREATE OR REPLACE FUNCTION public.can_student_checkin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM public.gym_profiles
  WHERE user_id = p_user_id;
  
  RETURN v_status IS NULL OR v_status NOT IN ('blocked', 'overdue');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update class session attendee count trigger
CREATE OR REPLACE FUNCTION public.update_class_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.gym_class_sessions
    SET current_attendees = (
      SELECT COUNT(*) FROM public.gym_class_attendance
      WHERE session_id = NEW.session_id AND status IN ('enrolled', 'present')
    )
    WHERE id = NEW.session_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.gym_class_sessions
    SET current_attendees = (
      SELECT COUNT(*) FROM public.gym_class_attendance
      WHERE session_id = OLD.session_id AND status IN ('enrolled', 'present')
    )
    WHERE id = OLD.session_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_class_attendees ON public.gym_class_attendance;
CREATE TRIGGER trigger_update_class_attendees
AFTER INSERT OR UPDATE OR DELETE ON public.gym_class_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_class_attendee_count();