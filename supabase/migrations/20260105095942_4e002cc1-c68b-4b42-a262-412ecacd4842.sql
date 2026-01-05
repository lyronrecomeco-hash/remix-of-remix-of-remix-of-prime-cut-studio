-- =====================================================
-- GENESIS FLOW BUILDER - AUTONOMOUS ENGINE MIGRATION
-- =====================================================

-- 1. Add flow lifecycle status column (ENUM for strict state machine)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flow_lifecycle_status') THEN
    CREATE TYPE flow_lifecycle_status AS ENUM ('draft', 'validated', 'active', 'paused', 'error');
  END IF;
END $$;

-- Add lifecycle status column (default is 'draft' for new flows)
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS lifecycle_status text DEFAULT 'draft';

-- 2. Add global configuration per flow
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS global_config jsonb DEFAULT '{
  "timeout_seconds": 300,
  "default_retries": 3,
  "max_concurrency": 10,
  "error_mode": "pause",
  "persist_context": true,
  "distributed_execution": false,
  "ai_config": {
    "provider": "lovable",
    "fallback_provider": null,
    "max_tokens": 4096,
    "temperature": 0.7
  }
}'::jsonb;

-- 3. Add validated_at timestamp
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS validated_at timestamp with time zone;

-- 4. Add validation_result for storing validation errors
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS validation_result jsonb DEFAULT '{"valid": false, "errors": [], "warnings": []}'::jsonb;

-- 5. Add activated_at timestamp
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS activated_at timestamp with time zone;

-- 6. Add paused_at timestamp
ALTER TABLE public.whatsapp_automation_rules 
ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone;

-- 7. Create flow execution history table
CREATE TABLE IF NOT EXISTS public.flow_execution_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id uuid NOT NULL REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE,
  execution_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  duration_ms integer,
  trigger_type text,
  trigger_data jsonb,
  context_snapshot jsonb DEFAULT '{}'::jsonb,
  node_timeline jsonb DEFAULT '[]'::jsonb,
  error_details jsonb,
  retry_count integer DEFAULT 0,
  parent_execution_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_flow_execution_history_flow_id ON public.flow_execution_history(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_execution_history_execution_id ON public.flow_execution_history(execution_id);
CREATE INDEX IF NOT EXISTS idx_flow_execution_history_status ON public.flow_execution_history(status);
CREATE INDEX IF NOT EXISTS idx_flow_execution_history_started_at ON public.flow_execution_history(started_at DESC);

-- 8. Create node execution log table
CREATE TABLE IF NOT EXISTS public.flow_node_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id uuid NOT NULL,
  flow_id uuid NOT NULL REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  node_type text NOT NULL,
  node_label text,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  duration_ms integer,
  input_data jsonb,
  output_data jsonb,
  error_message text,
  retry_attempt integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_flow_node_executions_execution_id ON public.flow_node_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_flow_node_executions_flow_id ON public.flow_node_executions(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_node_executions_node_id ON public.flow_node_executions(node_id);

-- 9. Create AI configuration table (per project/owner level)
CREATE TABLE IF NOT EXISTS public.flow_ai_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope_type text NOT NULL DEFAULT 'project',
  scope_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'lovable',
  api_key_encrypted text,
  model text DEFAULT 'google/gemini-2.5-flash',
  max_tokens integer DEFAULT 4096,
  temperature numeric(3,2) DEFAULT 0.7,
  fallback_provider text,
  fallback_model text,
  rate_limit_per_minute integer DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(scope_type, scope_id)
);

-- 10. Create flow context persistence table
CREATE TABLE IF NOT EXISTS public.flow_execution_context (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id uuid NOT NULL,
  flow_id uuid NOT NULL REFERENCES public.whatsapp_automation_rules(id) ON DELETE CASCADE,
  context_key text NOT NULL,
  context_value jsonb,
  scope text DEFAULT 'execution',
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(execution_id, context_key)
);

CREATE INDEX IF NOT EXISTS idx_flow_execution_context_execution_id ON public.flow_execution_context(execution_id);
CREATE INDEX IF NOT EXISTS idx_flow_execution_context_flow_id ON public.flow_execution_context(flow_id);

-- 11. Enable RLS on all new tables
ALTER TABLE public.flow_execution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_node_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_execution_context ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for flow_execution_history
CREATE POLICY "Users can view their flow executions" 
ON public.flow_execution_history 
FOR SELECT 
USING (
  flow_id IN (SELECT id FROM public.whatsapp_automation_rules WHERE user_id = auth.uid())
);

CREATE POLICY "System can insert flow executions" 
ON public.flow_execution_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update flow executions" 
ON public.flow_execution_history 
FOR UPDATE 
USING (true);

-- 13. Create RLS policies for flow_node_executions
CREATE POLICY "Users can view their node executions" 
ON public.flow_node_executions 
FOR SELECT 
USING (
  flow_id IN (SELECT id FROM public.whatsapp_automation_rules WHERE user_id = auth.uid())
);

CREATE POLICY "System can insert node executions" 
ON public.flow_node_executions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update node executions" 
ON public.flow_node_executions 
FOR UPDATE 
USING (true);

-- 14. Create RLS policies for flow_ai_settings
CREATE POLICY "Users can view their AI settings" 
ON public.flow_ai_settings 
FOR SELECT 
USING (scope_id = auth.uid() OR scope_type = 'global');

CREATE POLICY "Users can manage their AI settings" 
ON public.flow_ai_settings 
FOR ALL 
USING (scope_id = auth.uid());

-- 15. Create RLS policies for flow_execution_context
CREATE POLICY "Users can view their execution context" 
ON public.flow_execution_context 
FOR SELECT 
USING (
  flow_id IN (SELECT id FROM public.whatsapp_automation_rules WHERE user_id = auth.uid())
);

CREATE POLICY "System can manage execution context" 
ON public.flow_execution_context 
FOR ALL 
USING (true);

-- 16. Create function to update lifecycle status with validation
CREATE OR REPLACE FUNCTION public.update_flow_lifecycle_status(
  p_flow_id uuid,
  p_new_status text,
  p_validation_result jsonb DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_current_status text;
  v_allowed_transitions jsonb;
  v_result jsonb;
BEGIN
  -- Get current status
  SELECT lifecycle_status INTO v_current_status
  FROM public.whatsapp_automation_rules
  WHERE id = p_flow_id;
  
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Flow not found');
  END IF;
  
  -- Define allowed transitions
  v_allowed_transitions := '{
    "draft": ["validated"],
    "validated": ["active", "draft"],
    "active": ["paused", "error"],
    "paused": ["active", "draft"],
    "error": ["draft", "paused"]
  }'::jsonb;
  
  -- Check if transition is allowed
  IF NOT (v_allowed_transitions->v_current_status ? p_new_status) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', format('Transition from %s to %s not allowed', v_current_status, p_new_status),
      'current_status', v_current_status,
      'requested_status', p_new_status
    );
  END IF;
  
  -- Update status with appropriate timestamps
  UPDATE public.whatsapp_automation_rules
  SET 
    lifecycle_status = p_new_status,
    is_active = (p_new_status = 'active'),
    validated_at = CASE WHEN p_new_status = 'validated' THEN now() ELSE validated_at END,
    validation_result = COALESCE(p_validation_result, validation_result),
    activated_at = CASE WHEN p_new_status = 'active' THEN now() ELSE activated_at END,
    paused_at = CASE WHEN p_new_status = 'paused' THEN now() ELSE paused_at END,
    updated_at = now()
  WHERE id = p_flow_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'previous_status', v_current_status,
    'new_status', p_new_status,
    'transitioned_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 17. Enable realtime for execution monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.flow_execution_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flow_node_executions;