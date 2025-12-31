
-- =============================================
-- CRM SYSTEM - COMPLETE DATABASE SCHEMA
-- =============================================

-- Enum for CRM user roles
CREATE TYPE public.crm_role AS ENUM ('admin', 'manager', 'collaborator');

-- Enum for lead status
CREATE TYPE public.crm_lead_status AS ENUM ('new', 'active', 'won', 'lost');

-- Enum for task type
CREATE TYPE public.crm_task_type AS ENUM ('call', 'meeting', 'followup', 'internal');

-- Enum for task status
CREATE TYPE public.crm_task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- =============================================
-- CRM TENANTS (Each CRM account/company)
-- =============================================
CREATE TABLE public.crm_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment TEXT,
  owner_user_id UUID NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_tenants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM USERS (Users within a CRM tenant)
-- =============================================
CREATE TABLE public.crm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL,
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role crm_role NOT NULL DEFAULT 'collaborator',
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auth_user_id, crm_tenant_id)
);

ALTER TABLE public.crm_users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM PIPELINES
-- =============================================
CREATE TABLE public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.crm_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM FUNNELS
-- =============================================
CREATE TABLE public.crm_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_funnels ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM FUNNEL STAGES
-- =============================================
CREATE TABLE public.crm_funnel_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  funnel_id UUID NOT NULL REFERENCES public.crm_funnels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  position INTEGER DEFAULT 0,
  is_final BOOLEAN DEFAULT false,
  is_won BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_funnel_stages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM TAGS
-- =============================================
CREATE TABLE public.crm_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(crm_tenant_id, name)
);

ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM LOSS REASONS
-- =============================================
CREATE TABLE public.crm_loss_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_loss_reasons ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM CUSTOM FIELDS
-- =============================================
CREATE TABLE public.crm_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_custom_fields ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM LEADS
-- =============================================
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  funnel_id UUID REFERENCES public.crm_funnels(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.crm_funnel_stages(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  responsible_id UUID REFERENCES public.crm_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  origin TEXT,
  value NUMERIC DEFAULT 0,
  status crm_lead_status DEFAULT 'new',
  loss_reason_id UUID REFERENCES public.crm_loss_reasons(id),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.crm_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM LEAD TAGS (Many-to-Many)
-- =============================================
CREATE TABLE public.crm_lead_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.crm_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id, tag_id)
);

ALTER TABLE public.crm_lead_tags ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM LEAD HISTORY
-- =============================================
CREATE TABLE public.crm_lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.crm_users(id),
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_lead_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM TASKS
-- =============================================
CREATE TABLE public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.crm_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.crm_users(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type crm_task_type DEFAULT 'internal',
  status crm_task_status DEFAULT 'pending',
  priority INTEGER DEFAULT 2,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CRM AUDIT LOGS
-- =============================================
CREATE TABLE public.crm_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crm_tenant_id UUID NOT NULL REFERENCES public.crm_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.crm_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Get CRM tenant ID for current user
CREATE OR REPLACE FUNCTION public.get_crm_tenant_id(_auth_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT crm_tenant_id
  FROM public.crm_users
  WHERE auth_user_id = _auth_user_id
    AND is_active = true
  LIMIT 1
$$;

-- Check if user belongs to CRM tenant
CREATE OR REPLACE FUNCTION public.is_crm_member(_auth_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.crm_users
    WHERE auth_user_id = _auth_user_id
      AND crm_tenant_id = _tenant_id
      AND is_active = true
  )
$$;

-- Check if user is CRM admin
CREATE OR REPLACE FUNCTION public.is_crm_admin(_auth_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.crm_users
    WHERE auth_user_id = _auth_user_id
      AND role = 'admin'
      AND is_active = true
  )
$$;

-- Get CRM user ID
CREATE OR REPLACE FUNCTION public.get_crm_user_id(_auth_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.crm_users
  WHERE auth_user_id = _auth_user_id
    AND is_active = true
  LIMIT 1
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- CRM Tenants
CREATE POLICY "CRM users can view their tenant"
ON public.crm_tenants FOR SELECT
USING (is_crm_member(auth.uid(), id) OR is_owner(auth.uid()));

CREATE POLICY "CRM admins can update their tenant"
ON public.crm_tenants FOR UPDATE
USING (is_crm_member(auth.uid(), id) AND is_crm_admin(auth.uid()));

CREATE POLICY "Owner can manage all tenants"
ON public.crm_tenants FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Users
CREATE POLICY "CRM users can view their teammates"
ON public.crm_users FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) OR is_owner(auth.uid()));

CREATE POLICY "CRM admins can manage users"
ON public.crm_users FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()));

CREATE POLICY "Owner can manage all CRM users"
ON public.crm_users FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Pipelines
CREATE POLICY "CRM users can view pipelines"
ON public.crm_pipelines FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM admins can manage pipelines"
ON public.crm_pipelines FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all pipelines"
ON public.crm_pipelines FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Funnels
CREATE POLICY "CRM users can view funnels"
ON public.crm_funnels FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM admins can manage funnels"
ON public.crm_funnels FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all funnels"
ON public.crm_funnels FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Funnel Stages
CREATE POLICY "CRM users can view stages"
ON public.crm_funnel_stages FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM admins can manage stages"
ON public.crm_funnel_stages FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all stages"
ON public.crm_funnel_stages FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Tags
CREATE POLICY "CRM users can view tags"
ON public.crm_tags FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM users can manage tags"
ON public.crm_tags FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all tags"
ON public.crm_tags FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Loss Reasons
CREATE POLICY "CRM users can view loss reasons"
ON public.crm_loss_reasons FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM admins can manage loss reasons"
ON public.crm_loss_reasons FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all loss reasons"
ON public.crm_loss_reasons FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Custom Fields
CREATE POLICY "CRM users can view custom fields"
ON public.crm_custom_fields FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM admins can manage custom fields"
ON public.crm_custom_fields FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all custom fields"
ON public.crm_custom_fields FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Leads
CREATE POLICY "CRM users can view leads"
ON public.crm_leads FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM users can manage leads"
ON public.crm_leads FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all leads"
ON public.crm_leads FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Lead Tags
CREATE POLICY "CRM users can manage lead tags"
ON public.crm_lead_tags FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.crm_leads
    WHERE id = lead_id
    AND crm_tenant_id = get_crm_tenant_id(auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.crm_leads
    WHERE id = lead_id
    AND crm_tenant_id = get_crm_tenant_id(auth.uid())
  )
);

-- CRM Lead History
CREATE POLICY "CRM users can view lead history"
ON public.crm_lead_history FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM users can insert lead history"
ON public.crm_lead_history FOR INSERT
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

-- CRM Tasks
CREATE POLICY "CRM users can view tasks"
ON public.crm_tasks FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "CRM users can manage tasks"
ON public.crm_tasks FOR ALL
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()))
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can manage all tasks"
ON public.crm_tasks FOR ALL
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));

-- CRM Audit Logs
CREATE POLICY "CRM admins can view audit logs"
ON public.crm_audit_logs FOR SELECT
USING (crm_tenant_id = get_crm_tenant_id(auth.uid()) AND is_crm_admin(auth.uid()));

CREATE POLICY "CRM users can insert audit logs"
ON public.crm_audit_logs FOR INSERT
WITH CHECK (crm_tenant_id = get_crm_tenant_id(auth.uid()));

CREATE POLICY "Owner can view all audit logs"
ON public.crm_audit_logs FOR SELECT
USING (is_owner(auth.uid()));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_crm_users_auth_user ON public.crm_users(auth_user_id);
CREATE INDEX idx_crm_users_tenant ON public.crm_users(crm_tenant_id);
CREATE INDEX idx_crm_leads_tenant ON public.crm_leads(crm_tenant_id);
CREATE INDEX idx_crm_leads_funnel ON public.crm_leads(funnel_id);
CREATE INDEX idx_crm_leads_stage ON public.crm_leads(stage_id);
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_responsible ON public.crm_leads(responsible_id);
CREATE INDEX idx_crm_tasks_tenant ON public.crm_tasks(crm_tenant_id);
CREATE INDEX idx_crm_tasks_lead ON public.crm_tasks(lead_id);
CREATE INDEX idx_crm_tasks_assigned ON public.crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_due ON public.crm_tasks(due_date);
CREATE INDEX idx_crm_audit_tenant ON public.crm_audit_logs(crm_tenant_id);
CREATE INDEX idx_crm_lead_history_lead ON public.crm_lead_history(lead_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.crm_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_tenants_updated_at
BEFORE UPDATE ON public.crm_tenants
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();

CREATE TRIGGER crm_users_updated_at
BEFORE UPDATE ON public.crm_users
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();

CREATE TRIGGER crm_leads_updated_at
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();

CREATE TRIGGER crm_tasks_updated_at
BEFORE UPDATE ON public.crm_tasks
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();

CREATE TRIGGER crm_pipelines_updated_at
BEFORE UPDATE ON public.crm_pipelines
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();

CREATE TRIGGER crm_funnels_updated_at
BEFORE UPDATE ON public.crm_funnels
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();

CREATE TRIGGER crm_stages_updated_at
BEFORE UPDATE ON public.crm_funnel_stages
FOR EACH ROW EXECUTE FUNCTION public.crm_update_timestamp();
