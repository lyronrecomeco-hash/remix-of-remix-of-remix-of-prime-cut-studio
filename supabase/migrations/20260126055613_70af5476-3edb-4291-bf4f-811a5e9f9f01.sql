-- Tabela principal de missões sprint
CREATE TABLE public.genesis_sprint_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL,
  mission_data JSONB NOT NULL,
  form_answers JSONB,
  is_active BOOLEAN DEFAULT true,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de progresso das ações
CREATE TABLE public.genesis_sprint_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.genesis_sprint_missions(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mission_id, action_id, date)
);

-- Índices para performance
CREATE INDEX idx_sprint_missions_affiliate ON public.genesis_sprint_missions(affiliate_id);
CREATE INDEX idx_sprint_missions_active ON public.genesis_sprint_missions(affiliate_id, is_active);
CREATE INDEX idx_sprint_progress_mission ON public.genesis_sprint_progress(mission_id);
CREATE INDEX idx_sprint_progress_date ON public.genesis_sprint_progress(mission_id, date);

-- RLS para genesis_sprint_missions
ALTER TABLE public.genesis_sprint_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sprint missions"
ON public.genesis_sprint_missions FOR SELECT
USING (affiliate_id = auth.uid());

CREATE POLICY "Users can create own sprint missions"
ON public.genesis_sprint_missions FOR INSERT
WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "Users can update own sprint missions"
ON public.genesis_sprint_missions FOR UPDATE
USING (affiliate_id = auth.uid());

CREATE POLICY "Users can delete own sprint missions"
ON public.genesis_sprint_missions FOR DELETE
USING (affiliate_id = auth.uid());

-- RLS para genesis_sprint_progress
ALTER TABLE public.genesis_sprint_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sprint progress"
ON public.genesis_sprint_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.genesis_sprint_missions m
    WHERE m.id = mission_id AND m.affiliate_id = auth.uid()
  )
);

CREATE POLICY "Users can create own sprint progress"
ON public.genesis_sprint_progress FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.genesis_sprint_missions m
    WHERE m.id = mission_id AND m.affiliate_id = auth.uid()
  )
);

CREATE POLICY "Users can update own sprint progress"
ON public.genesis_sprint_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.genesis_sprint_missions m
    WHERE m.id = mission_id AND m.affiliate_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_sprint_missions_updated_at
BEFORE UPDATE ON public.genesis_sprint_missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();