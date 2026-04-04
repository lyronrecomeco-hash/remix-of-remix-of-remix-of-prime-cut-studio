
-- Engine Sessions
CREATE TABLE public.engine_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  proposal_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nova Sessão',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  viewport JSONB DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  prospect_context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engine_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own engine sessions"
  ON public.engine_sessions FOR ALL
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id::text FROM public.affiliates WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    affiliate_id IN (
      SELECT id::text FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- Engine Snapshots
CREATE TABLE public.engine_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.engine_sessions(id) ON DELETE CASCADE,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engine_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own engine snapshots"
  ON public.engine_snapshots FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT es.id FROM public.engine_sessions es
      JOIN public.affiliates a ON es.affiliate_id = a.id::text
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT es.id FROM public.engine_sessions es
      JOIN public.affiliates a ON es.affiliate_id = a.id::text
      WHERE a.user_id = auth.uid()
    )
  );

-- Engine Outputs
CREATE TABLE public.engine_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.engine_sessions(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL DEFAULT 'prompt',
  title TEXT NOT NULL DEFAULT 'Saída',
  content TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engine_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own engine outputs"
  ON public.engine_outputs FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT es.id FROM public.engine_sessions es
      JOIN public.affiliates a ON es.affiliate_id = a.id::text
      WHERE a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT es.id FROM public.engine_sessions es
      JOIN public.affiliates a ON es.affiliate_id = a.id::text
      WHERE a.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_engine_sessions_affiliate ON public.engine_sessions(affiliate_id);
CREATE INDEX idx_engine_sessions_proposal ON public.engine_sessions(proposal_id);
CREATE INDEX idx_engine_snapshots_session ON public.engine_snapshots(session_id);
CREATE INDEX idx_engine_outputs_session ON public.engine_outputs(session_id);

-- Updated_at trigger
CREATE TRIGGER update_engine_sessions_updated_at
  BEFORE UPDATE ON public.engine_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
