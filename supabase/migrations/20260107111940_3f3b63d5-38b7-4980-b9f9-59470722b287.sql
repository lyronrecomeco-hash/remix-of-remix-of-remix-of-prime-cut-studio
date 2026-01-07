-- =====================================================
-- CHATBOT SESSIONS TABLE
-- Gerencia estado de conversas por contato/instância
-- =====================================================
CREATE TABLE public.chatbot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.whatsapp_automations(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL,
  instance_id UUID REFERENCES public.genesis_instances(id) ON DELETE SET NULL,
  current_step TEXT DEFAULT 'start',
  awaiting_response BOOLEAN DEFAULT false,
  awaiting_type TEXT, -- 'menu', 'text', 'confirmation', etc
  expected_options JSONB, -- opções válidas quando aguardando menu
  context JSONB DEFAULT '{}',
  history JSONB DEFAULT '[]', -- histórico de mensagens recentes
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'timeout', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contact_id, instance_id, status) -- apenas 1 sessão ativa por contato+instância
);

-- Index para busca rápida de sessões ativas
CREATE INDEX idx_chatbot_sessions_active ON public.chatbot_sessions(contact_id, instance_id, status) WHERE status = 'active';
CREATE INDEX idx_chatbot_sessions_timeout ON public.chatbot_sessions(last_interaction_at) WHERE status = 'active';

-- =====================================================
-- CHATBOT TEMPLATES TABLE
-- Templates prontos para uso imediato
-- =====================================================
CREATE TABLE public.chatbot_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'comercial', 'suporte', 'agendamento', 'sac', '24h'
  icon TEXT DEFAULT 'bot',
  preview_image TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Template config (pre-built chatbot)
  trigger_type TEXT NOT NULL DEFAULT 'keyword',
  trigger_keywords TEXT[] DEFAULT '{}',
  response_type TEXT DEFAULT 'ai',
  response_content TEXT,
  
  -- AI Config
  ai_enabled BOOLEAN DEFAULT true,
  ai_system_prompt TEXT NOT NULL,
  ai_temperature NUMERIC DEFAULT 0.7,
  ai_model TEXT DEFAULT 'gpt-4o-mini',
  
  -- Flow structure for menu-based
  flow_structure JSONB, -- estrutura do fluxo com passos/menus
  menu_options JSONB, -- opções de menu
  
  -- Customizable fields
  editable_fields JSONB DEFAULT '["trigger_keywords", "response_content"]',
  variables JSONB DEFAULT '{}', -- {{empresa}}, {{horario}}, etc.
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- CHATBOT SESSION LOGS TABLE
-- Observabilidade completa das sessões
-- =====================================================
CREATE TABLE public.chatbot_session_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chatbot_sessions(id) ON DELETE CASCADE,
  chatbot_id UUID REFERENCES public.whatsapp_automations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'session_start', 'step_change', 'message_sent', 'message_received', 'luna_decision', 'timeout', 'error'
  event_data JSONB DEFAULT '{}',
  message_in TEXT,
  message_out TEXT,
  luna_reasoning TEXT, -- se IA decidiu algo
  step_from TEXT,
  step_to TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chatbot_session_logs_session ON public.chatbot_session_logs(session_id);
CREATE INDEX idx_chatbot_session_logs_chatbot ON public.chatbot_session_logs(chatbot_id);
CREATE INDEX idx_chatbot_session_logs_type ON public.chatbot_session_logs(event_type);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE public.chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_session_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para chatbot_sessions (service role pode tudo, usuários autenticados veem seus dados)
CREATE POLICY "Service role full access to sessions"
  ON public.chatbot_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para templates (públicos para leitura)
CREATE POLICY "Templates are publicly readable"
  ON public.chatbot_templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access to templates"
  ON public.chatbot_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para logs
CREATE POLICY "Service role full access to session logs"
  ON public.chatbot_session_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- INSERIR TEMPLATES PADRÃO
-- =====================================================
INSERT INTO public.chatbot_templates (name, slug, description, category, icon, is_featured, sort_order, trigger_type, trigger_keywords, response_type, ai_enabled, ai_system_prompt, ai_temperature, flow_structure, menu_options) VALUES

-- Template: Atendimento Comercial
('Atendimento Comercial', 'comercial', 'Bot de vendas com apresentação de produtos, preços e fechamento', 'comercial', 'shopping-cart', true, 1, 'keyword', 
ARRAY['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'preço', 'valor', 'orçamento', 'comprar', 'produto'],
'ai', true,
'Você é Luna, a atendente comercial virtual. Seu papel é:

1. SAUDAR o cliente de forma amigável
2. ENTENDER o que ele procura
3. APRESENTAR produtos/serviços de forma clara
4. RESPONDER dúvidas sobre preços e condições
5. CONDUZIR para o fechamento

REGRAS:
- Seja profissional mas descontraída
- Use emojis com moderação (máximo 2 por mensagem)
- Sempre pergunte se pode ajudar em mais algo
- Se não souber o preço exato, diga que vai verificar
- NUNCA invente informações sobre produtos
- Capture nome e contato quando apropriado

FLUXO SUGERIDO:
Saudação → Interesse → Apresentação → Dúvidas → Fechamento

Variáveis disponíveis: {{empresa}}, {{produto}}, {{horario}}',
0.7,
'{"steps": ["saudacao", "interesse", "apresentacao", "duvidas", "fechamento"]}',
'{"principal": [{"id": "1", "text": "📦 Ver produtos"}, {"id": "2", "text": "💰 Consultar preços"}, {"id": "3", "text": "📞 Falar com atendente"}]}'),

-- Template: Suporte Técnico
('Suporte Técnico', 'suporte', 'Bot de suporte com triagem, FAQ e escalonamento', 'suporte', 'headphones', true, 2, 'keyword',
ARRAY['ajuda', 'problema', 'erro', 'não funciona', 'bug', 'suporte', 'técnico', 'assistência'],
'ai', true,
'Você é Luna, a assistente de suporte técnico. Seu papel é:

1. IDENTIFICAR o problema do cliente
2. FAZER perguntas de triagem
3. OFERECER soluções conhecidas
4. ESCALONAR quando necessário

REGRAS:
- Seja paciente e empática
- Peça prints ou mais detalhes quando necessário
- Siga uma ordem lógica de troubleshooting
- Se não souber resolver, encaminhe para humano
- Sempre confirme se o problema foi resolvido

NÍVEIS DE SUPORTE:
1. FAQ automático
2. Troubleshooting guiado
3. Escalonamento para humano

NUNCA:
- Peça dados sensíveis (senhas, cartões)
- Prometa prazos que não pode cumprir
- Encerre sem confirmar resolução',
0.6,
'{"steps": ["identificacao", "triagem", "solucao", "confirmacao", "escalonamento"]}',
'{"principal": [{"id": "1", "text": "🔧 Problema técnico"}, {"id": "2", "text": "💳 Pagamento/Cobrança"}, {"id": "3", "text": "📱 Usar o app"}, {"id": "4", "text": "👤 Falar com suporte"}]}'),

-- Template: Agendamento
('Agendamento Inteligente', 'agendamento', 'Bot para agendar serviços com confirmação e lembretes', 'agendamento', 'calendar', true, 3, 'keyword',
ARRAY['agendar', 'marcar', 'horário', 'agenda', 'consulta', 'reservar', 'disponibilidade'],
'ai', true,
'Você é Luna, a assistente de agendamentos. Seu papel é:

1. PERGUNTAR qual serviço deseja
2. VERIFICAR disponibilidade
3. CONFIRMAR data e horário
4. COLETAR dados do cliente
5. CONFIRMAR agendamento

REGRAS:
- Sempre confirme os dados antes de finalizar
- Pergunte se é a primeira vez
- Informe sobre cancelamento/remarcação
- Envie resumo do agendamento

DADOS A COLETAR:
- Nome completo
- Telefone de contato
- Serviço desejado
- Data preferida
- Horário preferido

FORMATO DE CONFIRMAÇÃO:
✅ Agendamento confirmado!
📅 Data: [data]
⏰ Horário: [horário]
🏢 Serviço: [serviço]
👤 Cliente: [nome]',
0.7,
'{"steps": ["servico", "data", "horario", "dados", "confirmacao"]}',
'{"servicos": [{"id": "1", "text": "💇 Corte de cabelo"}, {"id": "2", "text": "💅 Manicure"}, {"id": "3", "text": "🧖 Tratamento"}], "horarios": [{"id": "manha", "text": "🌅 Manhã"}, {"id": "tarde", "text": "☀️ Tarde"}, {"id": "noite", "text": "🌙 Noite"}]}'),

-- Template: SAC
('SAC - Atendimento ao Cliente', 'sac', 'Bot de SAC com protocolo, reclamações e acompanhamento', 'sac', 'message-circle', false, 4, 'keyword',
ARRAY['reclamação', 'reclamar', 'ouvidoria', 'sac', 'protocolo', 'status', 'acompanhar'],
'ai', true,
'Você é Luna, a atendente do SAC. Seu papel é:

1. IDENTIFICAR o motivo do contato
2. GERAR protocolo de atendimento
3. REGISTRAR reclamações
4. ACOMPANHAR status
5. ENCAMINHAR quando necessário

REGRAS:
- Sempre gere um protocolo único
- Seja empática com reclamações
- Nunca discuta com o cliente
- Registre todos os detalhes
- Informe prazos realistas

PROTOCOLO:
Formato: SAC-YYYYMMDD-XXXX

CATEGORIAS:
1. Reclamação
2. Sugestão
3. Elogio
4. Informação
5. Acompanhamento',
0.6,
'{"steps": ["motivo", "protocolo", "registro", "encaminhamento", "conclusao"]}',
'{"motivos": [{"id": "1", "text": "😤 Reclamação"}, {"id": "2", "text": "💡 Sugestão"}, {"id": "3", "text": "⭐ Elogio"}, {"id": "4", "text": "📋 Acompanhar protocolo"}]}'),

-- Template: Atendimento 24h
('Atendimento 24h', '24h', 'Bot para atendimento fora do horário comercial', '24h', 'moon', true, 5, 'keyword',
ARRAY['*'],
'ai', true,
'Você é Luna, a atendente virtual 24 horas. Seu papel é:

1. INFORMAR que está fora do horário comercial
2. COLETAR mensagem para retorno
3. RESPONDER dúvidas básicas
4. AGENDAR retorno

REGRAS:
- Informe claramente o horário de atendimento humano
- Colete nome e contato para retorno
- Responda perguntas simples do FAQ
- Seja gentil e prestativa

MENSAGEM PADRÃO:
"Olá! 🌙 Nosso atendimento humano está encerrado no momento.

Horário de funcionamento: Segunda a Sexta, 8h às 18h

Posso ajudar com:
1️⃣ Deixar mensagem para retorno
2️⃣ Ver perguntas frequentes
3️⃣ Informações de contato"',
0.7,
'{"steps": ["saudacao", "opcao", "coleta", "confirmacao"]}',
'{"principal": [{"id": "1", "text": "📝 Deixar mensagem"}, {"id": "2", "text": "❓ Perguntas frequentes"}, {"id": "3", "text": "📞 Contatos"}]}');

-- Update trigger
CREATE OR REPLACE FUNCTION update_chatbot_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chatbot_sessions_updated_at
  BEFORE UPDATE ON public.chatbot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_sessions_updated_at();