// =====================================================
// FLOW TEMPLATES - Templates prontos profissionais
// Drag-and-drop para o canvas (igual ComponentsModal)
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search,
  GripVertical,
  Smartphone,
  Webhook,
  Zap,
  Shield,
  Clock,
  MessageSquare,
  LayoutGrid,
  List,
  GitBranch,
  Timer,
  CircleStop,
  Gauge,
  Lock,
  Filter,
  Repeat,
  Play,
  Send,
  Star,
  X,
  CheckCircle,
  AlertTriangle,
  FileJson,
  Layers,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FlowNode, FlowEdge, NodeType } from './types';

// =====================================================
// TEMPLATE INTERFACE
// =====================================================

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'whatsapp' | 'webhook' | 'automation';
  difficulty: 'easy' | 'medium' | 'advanced';
  nodeCount: number;
  tags: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  userConfigurableFields: string[];
  securityFeatures: string[];
  lifecycleStatus: 'validated';
}

// =====================================================
// TEMPLATE 1: WhatsApp Atendimento Básico (Menu + Espera)
// =====================================================

const TEMPLATE_WA_ATENDIMENTO: FlowTemplate = {
  id: 'wa-atendimento-basico',
  name: 'WhatsApp Atendimento Básico',
  description: 'Fluxo pronto de atendimento inicial via WhatsApp, com menu interativo e espera de resposta do usuário.',
  icon: Smartphone,
  category: 'whatsapp',
  difficulty: 'easy',
  nodeCount: 10,
  tags: ['WhatsApp', 'Menu', 'Atendimento', 'Interativo'],
  userConfigurableFields: [
    'Texto da mensagem inicial',
    'Opções do menu (botões)',
    'Tempo de espera (timeout)',
    'Mensagem de timeout'
  ],
  securityFeatures: [
    'secure_context_guard - Isolamento de contexto',
    'session_guard - Proteção anti-spam',
    'timeout_handler - Tratamento de inatividade'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'wa-start-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Início WhatsApp', 
        type: 'wa_start' as NodeType, 
        config: { triggerType: 'message_received' }, 
        description: 'Inicia quando mensagem é recebida' 
      }
    },
    {
      id: 'secure-guard-1',
      type: 'flowNode',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Proteção de Contexto', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true, reset_on_end: true }, 
        description: 'Garante isolamento de sessão' 
      }
    },
    {
      id: 'session-guard-1',
      type: 'flowNode',
      position: { x: 300, y: 290 },
      data: { 
        label: 'Proteção de Sessão', 
        type: 'session_guard' as NodeType, 
        config: { max_messages_per_minute: 20, burst_limit: 5, cooldown_minutes: 2, on_violation: 'pause' }, 
        description: 'Limita mensagens para evitar ban' 
      }
    },
    {
      id: 'wa-text-1',
      type: 'flowNode',
      position: { x: 300, y: 410 },
      data: { 
        label: 'Mensagem Inicial', 
        type: 'wa_send_text' as NodeType, 
        config: { text: 'Olá! 👋 Seja bem-vindo(a) ao nosso atendimento. Como posso ajudar você hoje?', typing: true, typingDuration: 2 }, 
        description: 'Saudação personalizada' 
      }
    },
    {
      id: 'wa-buttons-1',
      type: 'flowNode',
      position: { x: 300, y: 530 },
      data: { 
        label: 'Menu Principal', 
        type: 'wa_send_buttons' as NodeType, 
        config: { 
          text: 'Escolha uma das opções abaixo:', 
          buttons: [
            { id: 'info', text: 'ℹ️ Informações' },
            { id: 'atendimento', text: '👤 Falar com Atendente' },
            { id: 'horarios', text: '🕐 Horários' }
          ] 
        }, 
        description: 'Menu com botões interativos' 
      }
    },
    {
      id: 'wa-wait-1',
      type: 'flowNode',
      position: { x: 300, y: 660 },
      data: { 
        label: 'Aguardar Resposta', 
        type: 'wa_wait_response' as NodeType, 
        config: { timeout_seconds: 120, expected_type: 'button_reply' }, 
        description: 'Espera resposta do usuário (2 min)' 
      }
    },
    {
      id: 'timeout-handler-1',
      type: 'flowNode',
      position: { x: 550, y: 660 },
      data: { 
        label: 'Tratamento Timeout', 
        type: 'timeout_handler' as NodeType, 
        config: { timeout_seconds: 120, on_timeout: 'message', fallback_message: 'Não recebi sua resposta. Se precisar, é só me chamar novamente! 😊' }, 
        description: 'Mensagem se usuário não responder' 
      }
    },
    {
      id: 'if-expression-1',
      type: 'flowNode',
      position: { x: 300, y: 790 },
      data: { 
        label: 'Decide Caminho', 
        type: 'if_expression' as NodeType, 
        config: { expression: '{{button_id}} == "atendimento"', logic: 'and', fallback: 'no' }, 
        description: 'Direciona baseado na escolha' 
      }
    },
    {
      id: 'wa-text-2',
      type: 'flowNode',
      position: { x: 100, y: 920 },
      data: { 
        label: 'Encaminha Atendente', 
        type: 'wa_send_text' as NodeType, 
        config: { text: 'Perfeito! Um atendente entrará em contato em breve. Aguarde alguns instantes. 🙏', typing: true }, 
        description: 'Resposta para atendimento humano' 
      }
    },
    {
      id: 'end-1',
      type: 'flowNode',
      position: { x: 300, y: 1050 },
      data: { 
        label: 'Fim do Fluxo', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Encerramento correto' 
      }
    }
  ],
  edges: [
    { id: 'e1-2', source: 'wa-start-1', target: 'secure-guard-1' },
    { id: 'e2-3', source: 'secure-guard-1', target: 'session-guard-1' },
    { id: 'e3-4', source: 'session-guard-1', target: 'wa-text-1' },
    { id: 'e4-5', source: 'wa-text-1', target: 'wa-buttons-1' },
    { id: 'e5-6', source: 'wa-buttons-1', target: 'wa-wait-1' },
    { id: 'e6-7', source: 'wa-wait-1', target: 'timeout-handler-1', sourceHandle: 'timeout' },
    { id: 'e6-8', source: 'wa-wait-1', target: 'if-expression-1' },
    { id: 'e8-9', source: 'if-expression-1', target: 'wa-text-2', sourceHandle: 'yes' },
    { id: 'e9-10', source: 'wa-text-2', target: 'end-1' },
    { id: 'e8-10', source: 'if-expression-1', target: 'end-1', sourceHandle: 'no' },
    { id: 'e7-10', source: 'timeout-handler-1', target: 'end-1' }
  ]
};

// =====================================================
// TEMPLATE 2: Webhook → WhatsApp (PIX Gerado, Não Pago)
// =====================================================

const TEMPLATE_WEBHOOK_PIX: FlowTemplate = {
  id: 'webhook-pix-reminder',
  name: 'Webhook PIX → WhatsApp',
  description: 'Recebe webhook externo de PIX criado mas não pago e dispara lembrete automático no WhatsApp do cliente.',
  icon: Webhook,
  category: 'webhook',
  difficulty: 'medium',
  nodeCount: 12,
  tags: ['Webhook', 'PIX', 'Pagamento', 'Lembrete', 'Automático'],
  userConfigurableFields: [
    'Texto da mensagem de lembrete',
    'Campo do payload com telefone',
    'Campo do payload com nome',
    'Campo do payload com valor',
    'ID do webhook (path)'
  ],
  securityFeatures: [
    'webhook_auth_guard - Validação de token',
    'webhook_rate_limit - Proteção contra flood',
    'webhook_deduplication - Evita duplicatas',
    'secure_context_guard - Isolamento',
    'execution_quota_guard - Limite de execuções'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'webhook-trigger-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Webhook PIX', 
        type: 'webhook_trigger' as NodeType, 
        config: { method: 'POST', path: '/pix-created', secret: '', validate_payload: true }, 
        description: 'Recebe evento de PIX gerado' 
      }
    },
    {
      id: 'webhook-auth-1',
      type: 'flowNode',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Validação Auth', 
        type: 'webhook_auth_guard' as NodeType, 
        config: { auth_type: 'bearer', token_header: 'Authorization', on_fail: 'reject' }, 
        description: 'Valida token de autenticação' 
      }
    },
    {
      id: 'webhook-rate-1',
      type: 'flowNode',
      position: { x: 300, y: 290 },
      data: { 
        label: 'Rate Limit', 
        type: 'webhook_rate_limit' as NodeType, 
        config: { requests_per_minute: 100, requests_per_hour: 1000, on_exceed: 'queue' }, 
        description: 'Proteção contra flood' 
      }
    },
    {
      id: 'webhook-dedup-1',
      type: 'flowNode',
      position: { x: 300, y: 410 },
      data: { 
        label: 'Deduplicação', 
        type: 'webhook_deduplication' as NodeType, 
        config: { dedup_field: 'transaction_id', ttl_seconds: 86400, on_duplicate: 'skip' }, 
        description: 'Evita processar evento duplicado' 
      }
    },
    {
      id: 'secure-guard-2',
      type: 'flowNode',
      position: { x: 300, y: 530 },
      data: { 
        label: 'Proteção Contexto', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true }, 
        description: 'Isola contexto da execução' 
      }
    },
    {
      id: 'data-transform-1',
      type: 'flowNode',
      position: { x: 300, y: 650 },
      data: { 
        label: 'Extrair Dados', 
        type: 'data_transform' as NodeType, 
        config: { 
          operation: 'map', 
          source: '{{payload}}', 
          expression: '{ nome: $.customer.name, telefone: $.customer.phone, valor: $.amount, status: $.status }',
          output_variable: 'pix_data'
        }, 
        description: 'Extrai nome, telefone, valor e status' 
      }
    },
    {
      id: 'if-expression-2',
      type: 'flowNode',
      position: { x: 300, y: 770 },
      data: { 
        label: 'PIX Pendente?', 
        type: 'if_expression' as NodeType, 
        config: { expression: '{{pix_data.status}} == "pending"', logic: 'and', fallback: 'end' }, 
        description: 'Só continua se status = pending' 
      }
    },
    {
      id: 'quota-guard-1',
      type: 'flowNode',
      position: { x: 300, y: 890 },
      data: { 
        label: 'Limite Execuções', 
        type: 'execution_quota_guard' as NodeType, 
        config: { max_concurrent: 10, max_per_hour: 500, max_per_day: 2000 }, 
        description: 'Controla quota de execuções' 
      }
    },
    {
      id: 'wa-text-pix',
      type: 'flowNode',
      position: { x: 300, y: 1010 },
      data: { 
        label: 'Enviar Lembrete', 
        type: 'wa_send_text' as NodeType, 
        config: { 
          text: 'Olá {{pix_data.nome}}! 💰\n\nNotamos que você gerou um PIX no valor de R$ {{pix_data.valor}}, mas ainda não foi pago.\n\nSe precisar de ajuda, estamos à disposição! 😊',
          typing: true,
          typingDuration: 3,
          phone_variable: '{{pix_data.telefone}}'
        }, 
        description: 'Mensagem de lembrete personalizada' 
      }
    },
    {
      id: 'webhook-response-1',
      type: 'flowNode',
      position: { x: 550, y: 770 },
      data: { 
        label: 'Resposta HTTP', 
        type: 'webhook_response' as NodeType, 
        config: { status_code: 200, body: '{ "success": true, "message": "Lembrete enviado" }', content_type: 'application/json' }, 
        description: 'Retorna sucesso ao sistema externo' 
      }
    },
    {
      id: 'webhook-dead-1',
      type: 'flowNode',
      position: { x: 550, y: 1010 },
      data: { 
        label: 'Dead Letter', 
        type: 'webhook_dead_letter' as NodeType, 
        config: { reason: 'delivery_failed', retry_count: 3, alert_on_fail: true }, 
        description: 'Registra falhas para reprocessamento' 
      }
    },
    {
      id: 'end-2',
      type: 'flowNode',
      position: { x: 300, y: 1140 },
      data: { 
        label: 'Fim', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Execução finalizada' 
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'webhook-trigger-1', target: 'webhook-auth-1' },
    { id: 'e2', source: 'webhook-auth-1', target: 'webhook-rate-1' },
    { id: 'e3', source: 'webhook-rate-1', target: 'webhook-dedup-1' },
    { id: 'e4', source: 'webhook-dedup-1', target: 'secure-guard-2' },
    { id: 'e5', source: 'secure-guard-2', target: 'data-transform-1' },
    { id: 'e6', source: 'data-transform-1', target: 'if-expression-2' },
    { id: 'e7', source: 'if-expression-2', target: 'quota-guard-1', sourceHandle: 'yes' },
    { id: 'e8', source: 'quota-guard-1', target: 'wa-text-pix' },
    { id: 'e9', source: 'wa-text-pix', target: 'webhook-response-1' },
    { id: 'e10', source: 'webhook-response-1', target: 'end-2' },
    { id: 'e11', source: 'if-expression-2', target: 'end-2', sourceHandle: 'no' },
    { id: 'e12', source: 'wa-text-pix', target: 'webhook-dead-1', sourceHandle: 'error' }
  ]
};

// =====================================================
// TEMPLATE 3: Webhook Universal → Automação Genérica
// =====================================================

const TEMPLATE_WEBHOOK_UNIVERSAL: FlowTemplate = {
  id: 'webhook-universal-automation',
  name: 'Webhook Universal → Automação',
  description: 'Permite que QUALQUER webhook dispare um fluxo genérico de automação, sem dependência de WhatsApp.',
  icon: Zap,
  category: 'automation',
  difficulty: 'advanced',
  nodeCount: 14,
  tags: ['Webhook', 'Automação', 'Universal', 'Loop', 'Subflow'],
  userConfigurableFields: [
    'Campos do payload a extrair',
    'Condições de decisão',
    'Ações finais (HTTP, etc)',
    'Configuração de loop (se array)'
  ],
  securityFeatures: [
    'webhook_auth_guard - Autenticação',
    'webhook_signature_verify - Verificação HMAC',
    'secure_context_guard - Isolamento',
    'execution_quota_guard - Cotas',
    'infra_rate_limit - Limite de recursos'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'webhook-uni-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Webhook Universal', 
        type: 'webhook_universal_trigger' as NodeType, 
        config: { path: '/automation', methods: ['POST', 'PUT'], content_types: ['application/json'] }, 
        description: 'Aceita qualquer webhook externo' 
      }
    },
    {
      id: 'webhook-sig-1',
      type: 'flowNode',
      position: { x: 300, y: 160 },
      data: { 
        label: 'Verificar Assinatura', 
        type: 'webhook_signature_verify' as NodeType, 
        config: { algorithm: 'sha256', secret_env: 'WEBHOOK_SECRET', header: 'X-Signature', on_fail: 'reject' }, 
        description: 'Valida assinatura HMAC' 
      }
    },
    {
      id: 'webhook-auth-2',
      type: 'flowNode',
      position: { x: 300, y: 270 },
      data: { 
        label: 'Auth Guard', 
        type: 'webhook_auth_guard' as NodeType, 
        config: { auth_type: 'api_key', token_header: 'X-API-Key', on_fail: 'reject' }, 
        description: 'Valida chave de API' 
      }
    },
    {
      id: 'secure-guard-3',
      type: 'flowNode',
      position: { x: 300, y: 380 },
      data: { 
        label: 'Contexto Seguro', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true, reset_on_end: true }, 
        description: 'Isola execução' 
      }
    },
    {
      id: 'quota-guard-2',
      type: 'flowNode',
      position: { x: 300, y: 490 },
      data: { 
        label: 'Quota Guard', 
        type: 'execution_quota_guard' as NodeType, 
        config: { max_concurrent: 20, max_per_hour: 1000, max_per_day: 5000 }, 
        description: 'Limita execuções simultâneas' 
      }
    },
    {
      id: 'infra-rate-1',
      type: 'flowNode',
      position: { x: 300, y: 600 },
      data: { 
        label: 'Rate Limit Infra', 
        type: 'infra_rate_limit' as NodeType, 
        config: { cpu_limit_percent: 80, memory_limit_mb: 512, throughput_limit: 100, cooldown_seconds: 60 }, 
        description: 'Protege recursos do sistema' 
      }
    },
    {
      id: 'webhook-parser-1',
      type: 'flowNode',
      position: { x: 300, y: 710 },
      data: { 
        label: 'Parse Payload', 
        type: 'webhook_payload_parser' as NodeType, 
        config: { parser_type: 'jsonpath', expressions: { items: '$.data.items', action: '$.action', metadata: '$.metadata' } }, 
        description: 'Extrai campos do payload' 
      }
    },
    {
      id: 'if-expression-3',
      type: 'flowNode',
      position: { x: 300, y: 830 },
      data: { 
        label: 'É Array?', 
        type: 'if_expression' as NodeType, 
        config: { expression: 'Array.isArray({{items}})', logic: 'and', fallback: 'no' }, 
        description: 'Verifica se items é array' 
      }
    },
    {
      id: 'loop-foreach-1',
      type: 'flowNode',
      position: { x: 100, y: 950 },
      data: { 
        label: 'Loop Items', 
        type: 'loop_for_each' as NodeType, 
        config: { array_source: '{{items}}', item_variable: 'item', index_variable: 'idx', limit: 100, delay_between: 0.5, on_error: 'continue' }, 
        description: 'Itera sobre cada item' 
      }
    },
    {
      id: 'dispatch-1',
      type: 'flowNode',
      position: { x: 100, y: 1070 },
      data: { 
        label: 'Dispatch Paralelo', 
        type: 'dispatch_execution' as NodeType, 
        config: { batch_size: 10, spacing_seconds: 1, max_parallel: 5, time_window: { start: '00:00', end: '23:59' } }, 
        description: 'Executa subprocessos em paralelo' 
      }
    },
    {
      id: 'http-advanced-1',
      type: 'flowNode',
      position: { x: 500, y: 950 },
      data: { 
        label: 'HTTP Request', 
        type: 'http_request_advanced' as NodeType, 
        config: { method: 'POST', url: '{{metadata.callback_url}}', headers: '{"Content-Type": "application/json"}', body: '{{item}}', timeout_seconds: 30, retries: 3, save_response_to: 'http_result' }, 
        description: 'Envia dados para sistema externo' 
      }
    },
    {
      id: 'event-emitter-1',
      type: 'flowNode',
      position: { x: 300, y: 1190 },
      data: { 
        label: 'Emitir Evento', 
        type: 'event_emitter' as NodeType, 
        config: { event_name: 'automation_completed', payload: '{ "items_processed": {{idx}}, "status": "success" }', scope: 'project' }, 
        description: 'Emite evento de conclusão' 
      }
    },
    {
      id: 'webhook-response-2',
      type: 'flowNode',
      position: { x: 300, y: 1310 },
      data: { 
        label: 'Resposta Final', 
        type: 'webhook_response' as NodeType, 
        config: { status_code: 200, body: '{ "success": true, "processed": true }', content_type: 'application/json' }, 
        description: 'Retorna sucesso' 
      }
    },
    {
      id: 'end-3',
      type: 'flowNode',
      position: { x: 300, y: 1420 },
      data: { 
        label: 'Fim', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Execução finalizada' 
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'webhook-uni-1', target: 'webhook-sig-1' },
    { id: 'e2', source: 'webhook-sig-1', target: 'webhook-auth-2' },
    { id: 'e3', source: 'webhook-auth-2', target: 'secure-guard-3' },
    { id: 'e4', source: 'secure-guard-3', target: 'quota-guard-2' },
    { id: 'e5', source: 'quota-guard-2', target: 'infra-rate-1' },
    { id: 'e6', source: 'infra-rate-1', target: 'webhook-parser-1' },
    { id: 'e7', source: 'webhook-parser-1', target: 'if-expression-3' },
    { id: 'e8', source: 'if-expression-3', target: 'loop-foreach-1', sourceHandle: 'yes' },
    { id: 'e9', source: 'loop-foreach-1', target: 'dispatch-1' },
    { id: 'e10', source: 'dispatch-1', target: 'event-emitter-1' },
    { id: 'e11', source: 'if-expression-3', target: 'http-advanced-1', sourceHandle: 'no' },
    { id: 'e12', source: 'http-advanced-1', target: 'event-emitter-1' },
    { id: 'e13', source: 'event-emitter-1', target: 'webhook-response-2' },
    { id: 'e14', source: 'webhook-response-2', target: 'end-3' }
  ]
};

// =====================================================
// TEMPLATE 4: Google Calendar - Lembrete de Consulta
// =====================================================

const TEMPLATE_CALENDAR_REMINDER: FlowTemplate = {
  id: 'calendar-appointment-reminder',
  name: '📅 Lembrete de Consulta',
  description: 'Envia lembrete automático no WhatsApp quando um evento do Google Calendar está prestes a iniciar.',
  icon: Clock,
  category: 'calendar' as any,
  difficulty: 'easy',
  nodeCount: 7,
  tags: ['Google Calendar', 'Lembrete', 'WhatsApp', 'Consulta', 'Agendamento'],
  userConfigurableFields: [
    'Minutos antes do evento',
    'Mensagem de lembrete',
    'Filtro de título (opcional)',
    'Instância WhatsApp'
  ],
  securityFeatures: [
    'secure_context_guard - Isolamento de contexto',
    'session_guard - Proteção anti-spam',
    'deduplication - Evita lembretes duplicados'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'cal-trigger-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Gatilho Calendário', 
        type: 'google_calendar_trigger' as NodeType, 
        config: { triggerType: 'event_starting', minutesBefore: 30, calendarId: 'primary', deduplication: true }, 
        description: 'Dispara 30min antes do evento' 
      }
    },
    {
      id: 'secure-guard-cal-1',
      type: 'flowNode',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Proteção Contexto', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true }, 
        description: 'Isola execução' 
      }
    },
    {
      id: 'data-transform-cal-1',
      type: 'flowNode',
      position: { x: 300, y: 290 },
      data: { 
        label: 'Extrair Dados', 
        type: 'data_transform' as NodeType, 
        config: { 
          operation: 'map', 
          source: '{{event}}', 
          expression: '{ nome: $.attendees[0].displayName, telefone: $.extendedProperties.private.phone, titulo: $.summary, horario: $.start.dateTime }',
          output_variable: 'evento_data'
        }, 
        description: 'Extrai nome, telefone e horário' 
      }
    },
    {
      id: 'if-has-phone-1',
      type: 'flowNode',
      position: { x: 300, y: 410 },
      data: { 
        label: 'Tem Telefone?', 
        type: 'if_expression' as NodeType, 
        config: { expression: '{{evento_data.telefone}} != null && {{evento_data.telefone}} != ""', logic: 'and', fallback: 'end' }, 
        description: 'Só envia se tiver telefone' 
      }
    },
    {
      id: 'session-guard-cal-1',
      type: 'flowNode',
      position: { x: 300, y: 530 },
      data: { 
        label: 'Proteção Sessão', 
        type: 'session_guard' as NodeType, 
        config: { max_messages_per_minute: 10, burst_limit: 3, cooldown_minutes: 1, on_violation: 'pause' }, 
        description: 'Limita envios' 
      }
    },
    {
      id: 'wa-text-cal-1',
      type: 'flowNode',
      position: { x: 300, y: 650 },
      data: { 
        label: 'Enviar Lembrete', 
        type: 'wa_send_text' as NodeType, 
        config: { 
          text: 'Olá {{evento_data.nome}}! 📅\n\nLembrete: Sua consulta "{{evento_data.titulo}}" começa em 30 minutos.\n\n⏰ Horário: {{evento_data.horario}}\n\nContamos com sua presença! 😊',
          typing: true,
          typingDuration: 2,
          phone_variable: '{{evento_data.telefone}}'
        }, 
        description: 'Mensagem de lembrete personalizada' 
      }
    },
    {
      id: 'end-cal-1',
      type: 'flowNode',
      position: { x: 300, y: 780 },
      data: { 
        label: 'Fim', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Execução finalizada' 
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'cal-trigger-1', target: 'secure-guard-cal-1' },
    { id: 'e2', source: 'secure-guard-cal-1', target: 'data-transform-cal-1' },
    { id: 'e3', source: 'data-transform-cal-1', target: 'if-has-phone-1' },
    { id: 'e4', source: 'if-has-phone-1', target: 'session-guard-cal-1', sourceHandle: 'yes' },
    { id: 'e5', source: 'session-guard-cal-1', target: 'wa-text-cal-1' },
    { id: 'e6', source: 'wa-text-cal-1', target: 'end-cal-1' },
    { id: 'e7', source: 'if-has-phone-1', target: 'end-cal-1', sourceHandle: 'no' }
  ]
};

// =====================================================
// TEMPLATE 5: Google Calendar - Confirmação de Agendamento
// =====================================================

const TEMPLATE_CALENDAR_CONFIRMATION: FlowTemplate = {
  id: 'calendar-booking-confirmation',
  name: '✅ Confirmação de Agendamento',
  description: 'Cria evento no Google Calendar e envia confirmação automática no WhatsApp.',
  icon: CheckCircle,
  category: 'calendar' as any,
  difficulty: 'medium',
  nodeCount: 8,
  tags: ['Google Calendar', 'Agendamento', 'Confirmação', 'WhatsApp', 'Criação'],
  userConfigurableFields: [
    'Título do evento',
    'Duração padrão',
    'Mensagem de confirmação',
    'Instância WhatsApp'
  ],
  securityFeatures: [
    'secure_context_guard - Isolamento de contexto',
    'session_guard - Proteção anti-spam'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'wa-start-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Início WhatsApp', 
        type: 'wa_start' as NodeType, 
        config: { triggerType: 'message_received' }, 
        description: 'Recebe dados do agendamento' 
      }
    },
    {
      id: 'secure-guard-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Proteção Contexto', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true }, 
        description: 'Isola execução' 
      }
    },
    {
      id: 'data-transform-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 290 },
      data: { 
        label: 'Preparar Dados', 
        type: 'data_transform' as NodeType, 
        config: { 
          operation: 'map', 
          source: '{{context}}', 
          expression: '{ nome: $.nome, telefone: $.from, data: $.data_agendamento, hora: $.hora_agendamento, servico: $.servico }',
          output_variable: 'agendamento'
        }, 
        description: 'Extrai dados do agendamento' 
      }
    },
    {
      id: 'cal-create-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 410 },
      data: { 
        label: 'Criar Evento', 
        type: 'google_calendar_create_event' as NodeType, 
        config: { 
          title: 'Consulta - {{agendamento.nome}} - {{agendamento.servico}}',
          startTime: '{{agendamento.data}}T{{agendamento.hora}}:00',
          endTime: '{{agendamento.data}}T{{agendamento.hora_fim}}:00',
          description: 'Agendamento via WhatsApp\nCliente: {{agendamento.nome}}\nTelefone: {{agendamento.telefone}}\nServiço: {{agendamento.servico}}',
          timezone: 'America/Sao_Paulo',
          saveEventIdTo: 'evento_criado_id'
        }, 
        description: 'Adiciona à agenda' 
      }
    },
    {
      id: 'if-created-1',
      type: 'flowNode',
      position: { x: 300, y: 530 },
      data: { 
        label: 'Evento Criado?', 
        type: 'if_expression' as NodeType, 
        config: { expression: '{{evento_criado_id}} != null', logic: 'and', fallback: 'error' }, 
        description: 'Verifica se criou com sucesso' 
      }
    },
    {
      id: 'session-guard-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 650 },
      data: { 
        label: 'Proteção Sessão', 
        type: 'session_guard' as NodeType, 
        config: { max_messages_per_minute: 10, burst_limit: 3, cooldown_minutes: 1, on_violation: 'pause' }, 
        description: 'Limita envios' 
      }
    },
    {
      id: 'wa-text-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 770 },
      data: { 
        label: 'Enviar Confirmação', 
        type: 'wa_send_text' as NodeType, 
        config: { 
          text: '✅ *Agendamento Confirmado!*\n\nOlá {{agendamento.nome}}!\n\n📅 Data: {{agendamento.data}}\n⏰ Horário: {{agendamento.hora}}\n💼 Serviço: {{agendamento.servico}}\n\nVocê receberá um lembrete antes do horário.\n\nAté lá! 👋',
          typing: true,
          typingDuration: 2
        }, 
        description: 'Mensagem de confirmação' 
      }
    },
    {
      id: 'end-conf-1',
      type: 'flowNode',
      position: { x: 300, y: 890 },
      data: { 
        label: 'Fim', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Execução finalizada' 
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'wa-start-conf-1', target: 'secure-guard-conf-1' },
    { id: 'e2', source: 'secure-guard-conf-1', target: 'data-transform-conf-1' },
    { id: 'e3', source: 'data-transform-conf-1', target: 'cal-create-conf-1' },
    { id: 'e4', source: 'cal-create-conf-1', target: 'if-created-1' },
    { id: 'e5', source: 'if-created-1', target: 'session-guard-conf-1', sourceHandle: 'yes' },
    { id: 'e6', source: 'session-guard-conf-1', target: 'wa-text-conf-1' },
    { id: 'e7', source: 'wa-text-conf-1', target: 'end-conf-1' },
    { id: 'e8', source: 'if-created-1', target: 'end-conf-1', sourceHandle: 'no' }
  ]
};

// =====================================================
// TEMPLATE 6: Google Calendar - Reagendamento
// =====================================================

const TEMPLATE_CALENDAR_RESCHEDULE: FlowTemplate = {
  id: 'calendar-reschedule',
  name: '🔁 Reagendamento',
  description: 'Atualiza evento no Google Calendar e notifica o cliente sobre a nova data/hora.',
  icon: Repeat,
  category: 'calendar' as any,
  difficulty: 'medium',
  nodeCount: 7,
  tags: ['Google Calendar', 'Reagendamento', 'Atualização', 'WhatsApp'],
  userConfigurableFields: [
    'Nova data/hora',
    'Mensagem de reagendamento',
    'Instância WhatsApp'
  ],
  securityFeatures: [
    'secure_context_guard - Isolamento de contexto',
    'session_guard - Proteção anti-spam'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'wa-start-resch-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Início WhatsApp', 
        type: 'wa_start' as NodeType, 
        config: { triggerType: 'message_received' }, 
        description: 'Recebe solicitação de reagendamento' 
      }
    },
    {
      id: 'secure-guard-resch-1',
      type: 'flowNode',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Proteção Contexto', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true }, 
        description: 'Isola execução' 
      }
    },
    {
      id: 'cal-update-resch-1',
      type: 'flowNode',
      position: { x: 300, y: 290 },
      data: { 
        label: 'Atualizar Evento', 
        type: 'google_calendar_update_event' as NodeType, 
        config: { 
          eventId: '{{event_id}}',
          newStartTime: '{{nova_data}}T{{nova_hora}}:00',
          newEndTime: '{{nova_data}}T{{nova_hora_fim}}:00',
          sendUpdates: true
        }, 
        description: 'Atualiza data/hora na agenda' 
      }
    },
    {
      id: 'session-guard-resch-1',
      type: 'flowNode',
      position: { x: 300, y: 410 },
      data: { 
        label: 'Proteção Sessão', 
        type: 'session_guard' as NodeType, 
        config: { max_messages_per_minute: 10, burst_limit: 3, cooldown_minutes: 1, on_violation: 'pause' }, 
        description: 'Limita envios' 
      }
    },
    {
      id: 'wa-text-resch-1',
      type: 'flowNode',
      position: { x: 300, y: 530 },
      data: { 
        label: 'Notificar Cliente', 
        type: 'wa_send_text' as NodeType, 
        config: { 
          text: '🔄 *Reagendamento Confirmado!*\n\nOlá {{nome}}!\n\nSeu compromisso foi reagendado para:\n\n📅 Nova Data: {{nova_data}}\n⏰ Novo Horário: {{nova_hora}}\n\nSe precisar de mais alterações, é só avisar! 😊',
          typing: true,
          typingDuration: 2
        }, 
        description: 'Mensagem de reagendamento' 
      }
    },
    {
      id: 'end-resch-1',
      type: 'flowNode',
      position: { x: 300, y: 650 },
      data: { 
        label: 'Fim', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Execução finalizada' 
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'wa-start-resch-1', target: 'secure-guard-resch-1' },
    { id: 'e2', source: 'secure-guard-resch-1', target: 'cal-update-resch-1' },
    { id: 'e3', source: 'cal-update-resch-1', target: 'session-guard-resch-1' },
    { id: 'e4', source: 'session-guard-resch-1', target: 'wa-text-resch-1' },
    { id: 'e5', source: 'wa-text-resch-1', target: 'end-resch-1' }
  ]
};

// =====================================================
// TEMPLATE 7: Google Calendar - Agenda como Fonte de Verdade
// =====================================================

const TEMPLATE_CALENDAR_SOURCE_OF_TRUTH: FlowTemplate = {
  id: 'calendar-source-of-truth',
  name: '📆 Agenda Controla Tudo',
  description: 'Usa o Google Calendar como fonte de verdade. WhatsApp apenas notifica sobre eventos.',
  icon: Calendar,
  category: 'calendar' as any,
  difficulty: 'advanced',
  nodeCount: 10,
  tags: ['Google Calendar', 'Fonte de Verdade', 'Sincronização', 'WhatsApp', 'Automação'],
  userConfigurableFields: [
    'Intervalo de verificação',
    'Mensagem para eventos novos',
    'Mensagem para alterações',
    'Mensagem para cancelamentos'
  ],
  securityFeatures: [
    'secure_context_guard - Isolamento de contexto',
    'session_guard - Proteção anti-spam',
    'deduplication - Evita notificações duplicadas',
    'quota_guard - Limite de execuções'
  ],
  lifecycleStatus: 'validated',
  nodes: [
    {
      id: 'cal-trigger-sot-1',
      type: 'flowNode',
      position: { x: 300, y: 50 },
      data: { 
        label: 'Monitorar Agenda', 
        type: 'google_calendar_trigger' as NodeType, 
        config: { triggerType: 'event_created', calendarId: 'primary', pollingInterval: 60, deduplication: true }, 
        description: 'Detecta novos eventos' 
      }
    },
    {
      id: 'secure-guard-sot-1',
      type: 'flowNode',
      position: { x: 300, y: 170 },
      data: { 
        label: 'Proteção Contexto', 
        type: 'secure_context_guard' as NodeType, 
        config: { isolate_context: true, prevent_leak: true }, 
        description: 'Isola execução' 
      }
    },
    {
      id: 'quota-guard-sot-1',
      type: 'flowNode',
      position: { x: 300, y: 290 },
      data: { 
        label: 'Limite Execuções', 
        type: 'execution_quota_guard' as NodeType, 
        config: { max_concurrent: 5, max_per_hour: 100, max_per_day: 500 }, 
        description: 'Controla quota' 
      }
    },
    {
      id: 'data-transform-sot-1',
      type: 'flowNode',
      position: { x: 300, y: 410 },
      data: { 
        label: 'Extrair Dados', 
        type: 'data_transform' as NodeType, 
        config: { 
          operation: 'map', 
          source: '{{event}}', 
          expression: '{ nome: $.attendees[0].displayName || "Cliente", telefone: $.extendedProperties.private.phone, titulo: $.summary, data: $.start.dateTime, tipo_mudanca: $.status }',
          output_variable: 'evento'
        }, 
        description: 'Processa dados do evento' 
      }
    },
    {
      id: 'if-has-phone-sot-1',
      type: 'flowNode',
      position: { x: 300, y: 530 },
      data: { 
        label: 'Tem Telefone?', 
        type: 'if_expression' as NodeType, 
        config: { expression: '{{evento.telefone}} != null && {{evento.telefone}} != ""', logic: 'and', fallback: 'end' }, 
        description: 'Só notifica se tiver telefone' 
      }
    },
    {
      id: 'switch-tipo-1',
      type: 'flowNode',
      position: { x: 300, y: 650 },
      data: { 
        label: 'Tipo de Evento', 
        type: 'switch_node' as NodeType, 
        config: { field: '{{trigger_type}}', cases: ['event_created', 'event_updated', 'event_cancelled'], default_route: 'end' }, 
        description: 'Direciona por tipo de mudança' 
      }
    },
    {
      id: 'session-guard-sot-1',
      type: 'flowNode',
      position: { x: 100, y: 780 },
      data: { 
        label: 'Proteção Sessão', 
        type: 'session_guard' as NodeType, 
        config: { max_messages_per_minute: 10, burst_limit: 3, cooldown_minutes: 1, on_violation: 'pause' }, 
        description: 'Limita envios' 
      }
    },
    {
      id: 'wa-text-sot-new',
      type: 'flowNode',
      position: { x: 100, y: 900 },
      data: { 
        label: 'Novo Agendamento', 
        type: 'wa_send_text' as NodeType, 
        config: { 
          text: '🆕 *Novo Agendamento!*\n\nOlá {{evento.nome}}!\n\nSeu compromisso foi agendado:\n\n📅 {{evento.titulo}}\n⏰ {{evento.data}}\n\nContamos com sua presença! 😊',
          typing: true,
          typingDuration: 2,
          phone_variable: '{{evento.telefone}}'
        }, 
        description: 'Notifica novo agendamento' 
      }
    },
    {
      id: 'wa-text-sot-update',
      type: 'flowNode',
      position: { x: 300, y: 900 },
      data: { 
        label: 'Alteração', 
        type: 'wa_send_text' as NodeType, 
        config: { 
          text: '✏️ *Agendamento Atualizado*\n\nOlá {{evento.nome}}!\n\nHouve uma alteração no seu compromisso:\n\n📅 {{evento.titulo}}\n⏰ {{evento.data}}\n\nQualquer dúvida, estamos à disposição!',
          typing: true,
          typingDuration: 2,
          phone_variable: '{{evento.telefone}}'
        }, 
        description: 'Notifica alteração' 
      }
    },
    {
      id: 'end-sot-1',
      type: 'flowNode',
      position: { x: 300, y: 1030 },
      data: { 
        label: 'Fim', 
        type: 'end' as NodeType, 
        config: { endType: 'complete' }, 
        description: 'Execução finalizada' 
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'cal-trigger-sot-1', target: 'secure-guard-sot-1' },
    { id: 'e2', source: 'secure-guard-sot-1', target: 'quota-guard-sot-1' },
    { id: 'e3', source: 'quota-guard-sot-1', target: 'data-transform-sot-1' },
    { id: 'e4', source: 'data-transform-sot-1', target: 'if-has-phone-sot-1' },
    { id: 'e5', source: 'if-has-phone-sot-1', target: 'switch-tipo-1', sourceHandle: 'yes' },
    { id: 'e6', source: 'switch-tipo-1', target: 'session-guard-sot-1', sourceHandle: 'event_created' },
    { id: 'e7', source: 'session-guard-sot-1', target: 'wa-text-sot-new' },
    { id: 'e8', source: 'wa-text-sot-new', target: 'end-sot-1' },
    { id: 'e9', source: 'switch-tipo-1', target: 'wa-text-sot-update', sourceHandle: 'event_updated' },
    { id: 'e10', source: 'wa-text-sot-update', target: 'end-sot-1' },
    { id: 'e11', source: 'if-has-phone-sot-1', target: 'end-sot-1', sourceHandle: 'no' }
  ]
};

// =====================================================
// ALL TEMPLATES
// =====================================================

const FLOW_TEMPLATES: FlowTemplate[] = [
  TEMPLATE_WA_ATENDIMENTO,
  TEMPLATE_WEBHOOK_PIX,
  TEMPLATE_WEBHOOK_UNIVERSAL,
  TEMPLATE_CALENDAR_REMINDER,
  TEMPLATE_CALENDAR_CONFIRMATION,
  TEMPLATE_CALENDAR_RESCHEDULE,
  TEMPLATE_CALENDAR_SOURCE_OF_TRUTH
];

const CATEGORIES = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', icon: Smartphone },
  webhook: { label: 'Webhook', color: '#8b5cf6', icon: Webhook },
  automation: { label: 'Automação', color: '#f59e0b', icon: Zap },
  calendar: { label: 'Calendário', color: '#4285F4', icon: Clock }
};

const DIFFICULTY_CONFIG = {
  easy: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Fácil' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Médio' },
  advanced: { bg: 'bg-rose-500/10', text: 'text-rose-500', label: 'Avançado' }
};

// =====================================================
// COMPONENT
// =====================================================

interface FlowTemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (nodes: FlowNode[], edges: FlowEdge[]) => void;
}

export const FlowTemplates = ({ open, onClose, onSelectTemplate }: FlowTemplatesProps) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    if (open) {
      setDraggingId(null);
      setHoveredId(null);
      setSearch('');
      setSelectedCategory(null);
      setExpandedId(null);
    }
  }, [open]);

  const filteredTemplates = FLOW_TEMPLATES.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: FlowTemplate) => {
    // Generate unique IDs to avoid conflicts
    const timestamp = Date.now();
    const uniqueNodes = template.nodes.map((n, idx) => ({
      ...n,
      id: `${n.id}-${timestamp}-${idx}`
    }));
    
    // Update edge references
    const idMap = template.nodes.reduce((acc, n, idx) => {
      acc[n.id] = `${n.id}-${timestamp}-${idx}`;
      return acc;
    }, {} as Record<string, string>);
    
    const uniqueEdges = template.edges.map((e, idx) => ({
      ...e,
      id: `${e.id}-${timestamp}-${idx}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target
    }));
    
    onSelectTemplate(uniqueNodes, uniqueEdges);
    onClose();
  };

  const handleDragStart = (event: React.DragEvent, template: FlowTemplate) => {
    setDraggingId(template.id);
    
    // Prepare template data with unique IDs
    const timestamp = Date.now();
    const uniqueNodes = template.nodes.map((n, idx) => ({
      ...n,
      id: `${n.id}-${timestamp}-${idx}`
    }));
    
    const idMap = template.nodes.reduce((acc, n, idx) => {
      acc[n.id] = `${n.id}-${timestamp}-${idx}`;
      return acc;
    }, {} as Record<string, string>);
    
    const uniqueEdges = template.edges.map((e, idx) => ({
      ...e,
      id: `${e.id}-${timestamp}-${idx}`,
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target
    }));
    
    const templateData = { 
      type: 'flow_template',
      nodes: uniqueNodes, 
      edges: uniqueEdges 
    };
    
    event.dataTransfer.setData('application/flowtemplate', JSON.stringify(templateData));
    event.dataTransfer.effectAllowed = 'move';
    
    // Custom drag image
    const dragEl = document.createElement('div');
    dragEl.className = 'bg-card border rounded-lg p-3 shadow-xl flex items-center gap-2';
    dragEl.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <span class="text-sm font-medium">${template.name}</span>
    `;
    dragEl.style.position = 'absolute';
    dragEl.style.top = '-1000px';
    document.body.appendChild(dragEl);
    event.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
    
    setTimeout(() => {
      onClose();
      setDraggingId(null);
    }, 100);
  };

  const handleDragEnd = () => setDraggingId(null);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl">
        {/* Premium Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border/50 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">Templates de Fluxo</h2>
                  <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    {FLOW_TEMPLATES.length} prontos
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Arraste ou clique para aplicar ao canvas
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-destructive/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Buscar templates... (ex: WhatsApp, PIX, webhook)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-10 h-12 bg-background border-border/50 rounded-xl text-base shadow-sm"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearch('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-9 px-4 rounded-full text-sm font-medium"
            >
              <Star className="w-4 h-4 mr-2" />
              Todos ({FLOW_TEMPLATES.length})
            </Button>
            
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const count = FLOW_TEMPLATES.filter(t => t.category === key).length;
              const isSelected = selectedCategory === key;
              const Icon = cat.icon;
              
              return (
                <Button
                  key={key}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(isSelected ? null : key)}
                  className="h-9 px-4 rounded-full text-sm font-medium gap-2"
                  style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                  <span className="opacity-70">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, index) => {
                  const category = CATEGORIES[template.category];
                  const difficulty = DIFFICULTY_CONFIG[template.difficulty];
                  const Icon = template.icon;
                  const isExpanded = expandedId === template.id;
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, template)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => setHoveredId(template.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={cn(
                        "group relative rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing",
                        "hover:shadow-lg hover:-translate-y-0.5",
                        draggingId === template.id && "opacity-50 scale-95",
                        hoveredId === template.id ? "border-primary/50 bg-primary/5 shadow-md" : "border-border/50 bg-card"
                      )}
                    >
                      {/* Card Header */}
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <Icon className="w-7 h-7" style={{ color: category.color }} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-base truncate">{template.name}</h3>
                              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ borderColor: category.color, color: category.color }}
                              >
                                {category.label}
                              </Badge>
                              <Badge variant="outline" className={cn('text-xs', difficulty.bg, difficulty.text)}>
                                {difficulty.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-muted/50">
                                {template.nodeCount} nós
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Validado
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expand/Collapse Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 w-full justify-between text-xs text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : template.id);
                          }}
                        >
                          <span>{isExpanded ? 'Menos detalhes' : 'Ver detalhes'}</span>
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                            <ArrowRight className="w-4 h-4 rotate-90" />
                          </motion.div>
                        </Button>
                        
                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 mt-3 border-t border-border/50 space-y-3">
                                {/* User Configurable Fields */}
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <FileJson className="w-3 h-3" />
                                    Campos configuráveis:
                                  </p>
                                  <ul className="text-xs space-y-1 text-muted-foreground">
                                    {template.userConfigurableFields.map((field, i) => (
                                      <li key={i} className="flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-primary" />
                                        {field}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {/* Security Features */}
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Segurança incluída:
                                  </p>
                                  <ul className="text-xs space-y-1 text-muted-foreground">
                                    {template.securityFeatures.map((feature, i) => (
                                      <li key={i} className="flex items-start gap-1.5">
                                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                  {template.tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Apply Button */}
                      <div className="px-5 pb-5">
                        <Button
                          className="w-full gap-2"
                          onClick={() => handleSelect(template)}
                        >
                          <Play className="w-4 h-4" />
                          Aplicar Template
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhum template encontrado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Tente buscar com outros termos</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Templates prontos para produção
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                Segurança integrada
              </span>
            </div>
            <span>Arraste para o canvas ou clique em "Aplicar"</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
