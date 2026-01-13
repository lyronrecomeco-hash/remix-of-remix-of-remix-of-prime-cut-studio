-- ============================================
-- GENESIS PROFESSIONAL FEATURES - FULL STRUCTURE
-- ============================================

-- 1. JORNADA DE TRABALHO (restrição horário de acesso)
CREATE TABLE IF NOT EXISTS public.genesis_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, day_of_week)
);

-- 2. CONFIGURAÇÕES DE SEGURANÇA (senhas fortes, ocultar telefone)
CREATE TABLE IF NOT EXISTS public.genesis_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  require_strong_password BOOLEAN DEFAULT true,
  min_password_length INTEGER DEFAULT 8,
  require_uppercase BOOLEAN DEFAULT true,
  require_number BOOLEAN DEFAULT true,
  require_special_char BOOLEAN DEFAULT false,
  hide_phone_partially BOOLEAN DEFAULT true,
  phone_visible_digits INTEGER DEFAULT 4,
  session_timeout_minutes INTEGER DEFAULT 480,
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. IA ASSISTENTE - Histórico de sugestões e reescritas
CREATE TABLE IF NOT EXISTS public.genesis_ai_assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  instance_id UUID,
  session_id UUID,
  action_type TEXT NOT NULL CHECK (action_type IN ('transcription', 'suggestion', 'rewrite', 'summary', 'copilot')),
  input_text TEXT,
  output_text TEXT,
  rewrite_style TEXT, -- conciso, profissional, amigável, revisar
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CHAT INTERNO ENTRE AGENTES
CREATE TABLE IF NOT EXISTS public.genesis_internal_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  name TEXT,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'department')),
  department_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.genesis_internal_chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.genesis_internal_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.genesis_internal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.genesis_internal_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'document', 'system')),
  media_url TEXT,
  media_mimetype TEXT,
  reply_to_id UUID REFERENCES public.genesis_internal_messages(id),
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AVALIAÇÃO NPS
CREATE TABLE IF NOT EXISTS public.genesis_nps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  session_id UUID,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  agent_id UUID,
  agent_name TEXT,
  department TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DISTRIBUIÇÃO AUTOMÁTICA DE ATENDIMENTO
CREATE TABLE IF NOT EXISTS public.genesis_routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  distribution_method TEXT DEFAULT 'round_robin' CHECK (distribution_method IN ('round_robin', 'least_busy', 'random', 'skills_based', 'weighted')),
  conditions JSONB DEFAULT '[]',
  target_type TEXT DEFAULT 'agent' CHECK (target_type IN ('agent', 'department', 'queue')),
  target_ids UUID[],
  max_concurrent_per_agent INTEGER DEFAULT 10,
  timeout_seconds INTEGER DEFAULT 300,
  fallback_action TEXT DEFAULT 'queue',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CARTEIRIZAÇÃO (segmentação por agente)
CREATE TABLE IF NOT EXISTS public.genesis_contact_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  assigned_agent_id UUID NOT NULL,
  instance_id UUID NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'vip')),
  notes TEXT,
  tags TEXT[],
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contact_phone, instance_id)
);

-- 8. DEPARTAMENTOS (com restrição de agentes)
CREATE TABLE IF NOT EXISTS public.genesis_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'users',
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '{}',
  auto_assign BOOLEAN DEFAULT false,
  max_queue_size INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.genesis_department_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.genesis_departments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'supervisor', 'manager')),
  can_transfer_out BOOLEAN DEFAULT true,
  can_view_others_chats BOOLEAN DEFAULT false,
  max_concurrent INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(department_id, user_id)
);

-- 9. MOTIVOS DE FINALIZAÇÃO
CREATE TABLE IF NOT EXISTS public.genesis_closure_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  requires_note BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. WIDGET PARA WEBSITES
CREATE TABLE IF NOT EXISTS public.genesis_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  domain_whitelist TEXT[],
  position TEXT DEFAULT 'bottom-right' CHECK (position IN ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  theme JSONB DEFAULT '{"primaryColor": "#25D366", "textColor": "#ffffff", "bubbleSize": 60}',
  welcome_message TEXT DEFAULT 'Olá! Como posso ajudar?',
  away_message TEXT DEFAULT 'Estamos offline. Deixe sua mensagem!',
  collect_info BOOLEAN DEFAULT true,
  required_fields TEXT[] DEFAULT ARRAY['name', 'phone'],
  utm_tracking BOOLEAN DEFAULT true,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. WIDGET LEADS (identificação marketing)
CREATE TABLE IF NOT EXISTS public.genesis_widget_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES public.genesis_widgets(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL,
  name TEXT,
  phone TEXT,
  email TEXT,
  page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  first_message TEXT,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. AGENDA MULTIAGENTE
CREATE TABLE IF NOT EXISTS public.genesis_agent_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  client_phone TEXT NOT NULL,
  client_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  reminder_minutes INTEGER[] DEFAULT ARRAY[60, 15],
  reminder_sent BOOLEAN[] DEFAULT ARRAY[false, false],
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  auto_message TEXT,
  auto_message_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. DISPAROS EM MASSA (campanhas para listas/etiquetas)
CREATE TABLE IF NOT EXISTS public.genesis_broadcast_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'paused', 'completed', 'cancelled')),
  target_type TEXT DEFAULT 'contacts' CHECK (target_type IN ('contacts', 'tags', 'segment', 'import')),
  target_tags TEXT[],
  target_segment_id UUID,
  message_template TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'template')),
  media_url TEXT,
  template_id UUID,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  rate_limit_per_minute INTEGER DEFAULT 20,
  delay_between_ms INTEGER DEFAULT 3000,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.genesis_broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.genesis_broadcast_campaigns(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  variables JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'read', 'failed', 'skipped')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. RELATÓRIOS
CREATE TABLE IF NOT EXISTS public.genesis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID,
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('synthetic', 'analytic', 'nps', 'agent_performance', 'department', 'campaign')),
  name TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  filters JSONB DEFAULT '{}',
  data JSONB DEFAULT '{}',
  file_url TEXT,
  file_format TEXT CHECK (file_format IN ('json', 'csv', 'xlsx', 'pdf')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Métricas agregadas para relatórios sintéticos
CREATE TABLE IF NOT EXISTS public.genesis_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  date DATE NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  new_conversations INTEGER DEFAULT 0,
  closed_conversations INTEGER DEFAULT 0,
  total_messages_in INTEGER DEFAULT 0,
  total_messages_out INTEGER DEFAULT 0,
  avg_response_time_seconds NUMERIC,
  avg_conversation_duration_seconds NUMERIC,
  avg_first_response_seconds NUMERIC,
  nps_responses INTEGER DEFAULT 0,
  nps_score_avg NUMERIC,
  transfers INTEGER DEFAULT 0,
  escalations INTEGER DEFAULT 0,
  unique_contacts INTEGER DEFAULT 0,
  new_contacts INTEGER DEFAULT 0,
  returning_contacts INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, date)
);

-- Métricas por agente
CREATE TABLE IF NOT EXISTS public.genesis_agent_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  date DATE NOT NULL,
  conversations_handled INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  avg_response_time_seconds NUMERIC,
  avg_handling_time_seconds NUMERIC,
  nps_responses INTEGER DEFAULT 0,
  nps_score_avg NUMERIC,
  transfers_in INTEGER DEFAULT 0,
  transfers_out INTEGER DEFAULT 0,
  first_response_within_sla INTEGER DEFAULT 0,
  resolution_within_sla INTEGER DEFAULT 0,
  online_minutes INTEGER DEFAULT 0,
  away_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instance_id, agent_id, date)
);

-- 15. RESPOSTAS RÁPIDAS COM MÚLTIPLAS MÍDIAS
CREATE TABLE IF NOT EXISTS public.genesis_quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  user_id UUID,
  shortcut TEXT NOT NULL,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]', -- Array de mensagens com tipo e conteúdo
  category TEXT DEFAULT 'general',
  tags TEXT[],
  use_count INTEGER DEFAULT 0,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. PERSONALIZAÇÃO (logotipo)
CREATE TABLE IF NOT EXISTS public.genesis_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#22c55e',
  company_name TEXT,
  custom_domain TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.genesis_work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_ai_assistant_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_internal_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_internal_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_contact_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_department_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_closure_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_widget_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_agent_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genesis_branding ENABLE ROW LEVEL SECURITY;

-- RLS Policies (user-based access)
-- Work Schedules
CREATE POLICY "Users can manage their work schedules" ON public.genesis_work_schedules FOR ALL USING (auth.uid() = user_id);

-- Security Settings
CREATE POLICY "Users can manage their security settings" ON public.genesis_security_settings FOR ALL USING (auth.uid() = user_id);

-- AI Assistant Logs
CREATE POLICY "Users can view their AI logs" ON public.genesis_ai_assistant_logs FOR ALL USING (auth.uid() = user_id);

-- Internal Chats - users in chat can access
CREATE POLICY "Chat members can access chats" ON public.genesis_internal_chats FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_internal_chat_members WHERE chat_id = id AND user_id = auth.uid()));

CREATE POLICY "Chat members can access membership" ON public.genesis_internal_chat_members FOR ALL 
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.genesis_internal_chat_members m WHERE m.chat_id = chat_id AND m.user_id = auth.uid()));

CREATE POLICY "Chat members can access messages" ON public.genesis_internal_messages FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_internal_chat_members WHERE chat_id = genesis_internal_messages.chat_id AND user_id = auth.uid()));

-- Instance-based policies (via genesis_instances ownership)
CREATE POLICY "Instance owners can manage NPS" ON public.genesis_nps_surveys FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage routing" ON public.genesis_routing_rules FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage assignments" ON public.genesis_contact_assignments FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage departments" ON public.genesis_departments FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Department access" ON public.genesis_department_agents FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_departments d JOIN public.genesis_instances i ON d.id = department_id AND i.id = d.instance_id WHERE i.user_id = auth.uid()));

CREATE POLICY "Instance owners can manage closure reasons" ON public.genesis_closure_reasons FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage widgets" ON public.genesis_widgets FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can view widget leads" ON public.genesis_widget_leads FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage schedules" ON public.genesis_agent_schedules FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage broadcasts" ON public.genesis_broadcast_campaigns FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Campaign owners can manage recipients" ON public.genesis_broadcast_recipients FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_broadcast_campaigns c JOIN public.genesis_instances i ON c.id = campaign_id AND i.id = c.instance_id WHERE i.user_id = auth.uid()));

CREATE POLICY "Users can manage their reports" ON public.genesis_reports FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Instance owners can view metrics" ON public.genesis_metrics_daily FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can view agent metrics" ON public.genesis_agent_metrics_daily FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Instance owners can manage quick replies" ON public.genesis_quick_replies FOR ALL 
USING (EXISTS (SELECT 1 FROM public.genesis_instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage their branding" ON public.genesis_branding FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_schedules_user ON public.genesis_work_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.genesis_ai_assistant_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_action ON public.genesis_ai_assistant_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_internal_messages_chat ON public.genesis_internal_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_nps_instance ON public.genesis_nps_surveys(instance_id);
CREATE INDEX IF NOT EXISTS idx_routing_instance ON public.genesis_routing_rules(instance_id);
CREATE INDEX IF NOT EXISTS idx_assignments_instance ON public.genesis_contact_assignments(instance_id);
CREATE INDEX IF NOT EXISTS idx_departments_instance ON public.genesis_departments(instance_id);
CREATE INDEX IF NOT EXISTS idx_widgets_instance ON public.genesis_widgets(instance_id);
CREATE INDEX IF NOT EXISTS idx_widget_leads_widget ON public.genesis_widget_leads(widget_id);
CREATE INDEX IF NOT EXISTS idx_schedules_instance ON public.genesis_agent_schedules(instance_id);
CREATE INDEX IF NOT EXISTS idx_schedules_agent ON public.genesis_agent_schedules(agent_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_instance ON public.genesis_broadcast_campaigns(instance_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_campaign ON public.genesis_broadcast_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_instance ON public.genesis_metrics_daily(instance_id);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_daily_instance ON public.genesis_agent_metrics_daily(instance_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_instance ON public.genesis_quick_replies(instance_id);