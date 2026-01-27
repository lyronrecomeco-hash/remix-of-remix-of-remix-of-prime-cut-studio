// Contextos específicos para Aplicativos Web (com backend, auth, dashboard)

import { BackendRequirement } from './nicheContexts';

export interface AppNicheContext {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'gestao' | 'saas' | 'marketplace' | 'automacao' | 'comunicacao' | 'financeiro' | 'educacao' | 'saude' | 'outro';
  contextPrompt: string;
  defaultObjectives: string[];
  suggestedModules: string[];  // Diferente de páginas - são módulos/funcionalidades
  coreFeatures: string[];
  databaseEntities: string[];  // Tabelas principais do sistema
  userRoles: string[];  // Tipos de usuários
  backendRequirements: BackendRequirement[];
}

export const APP_NICHE_CONTEXTS: AppNicheContext[] = [
  // GESTÃO
  {
    id: 'agendamento',
    name: 'Sistema de Agendamento',
    emoji: '📅',
    description: 'Agenda online com gestão de horários e clientes',
    category: 'gestao',
    contextPrompt: `Um sistema de agendamento completo precisa de calendário visual, gestão de disponibilidade, notificações automáticas e dashboard de métricas. O fluxo deve permitir que clientes agendem online 24h, enquanto o administrador gerencia horários, profissionais e serviços. Confirmações automáticas por WhatsApp/email são essenciais.`,
    defaultObjectives: [
      'Automatizar agendamentos online',
      'Reduzir no-shows com lembretes',
      'Gestão de múltiplos profissionais',
      'Dashboard com métricas',
      'Histórico de clientes',
      'Relatórios de ocupação'
    ],
    suggestedModules: ['Dashboard', 'Agenda', 'Clientes', 'Serviços', 'Profissionais', 'Relatórios', 'Configurações'],
    coreFeatures: [
      'Calendário visual interativo',
      'Gestão de disponibilidade',
      'Confirmação automática',
      'Lembretes por WhatsApp',
      'Página de agendamento público',
      'Dashboard com métricas',
      'Histórico de atendimentos',
      'Gestão de clientes'
    ],
    databaseEntities: ['usuarios', 'profissionais', 'servicos', 'agendamentos', 'clientes', 'horarios_disponiveis'],
    userRoles: ['admin', 'profissional', 'recepcionista'],
    backendRequirements: [
      {
        id: 'auth-system',
        name: 'Sistema de Autenticação',
        description: 'Login seguro com diferentes perfis de acesso',
        technicalSpec: `
## AUTENTICAÇÃO E AUTORIZAÇÃO

### Implementação:
- Usar Supabase Auth para autenticação
- Tabela 'profiles' para dados adicionais do usuário
- Tabela 'user_roles' para controle de permissões
- RLS policies baseadas no role do usuário

### Roles do Sistema:
\`\`\`typescript
type UserRole = 'admin' | 'profissional' | 'recepcionista';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: Date;
}
\`\`\`

### Proteção de Rotas:
- Middleware verificando sessão ativa
- Redirect para login se não autenticado
- Verificação de role para acesso a módulos específicos
`
      },
      {
        id: 'booking-engine',
        name: 'Motor de Agendamentos',
        description: 'Lógica completa de disponibilidade e conflitos',
        technicalSpec: `
## MOTOR DE AGENDAMENTOS

### Estrutura de Dados:
\`\`\`typescript
interface Service {
  id: string;
  name: string;
  duration: number; // minutos
  price: number;
  color: string; // para calendário
  active: boolean;
}

interface Professional {
  id: string;
  user_id: string;
  name: string;
  services: string[]; // IDs dos serviços que atende
  schedule: WeeklySchedule;
}

interface WeeklySchedule {
  [dayOfWeek: number]: {
    enabled: boolean;
    start: string; // "09:00"
    end: string;   // "18:00"
    breaks: { start: string; end: string }[];
  };
}

interface Appointment {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: Date;
}
\`\`\`

### Lógica de Disponibilidade:
1. Buscar horários de trabalho do profissional para o dia
2. Remover horários já agendados
3. Remover breaks/pausas
4. Calcular slots baseados na duração do serviço
5. Retornar array de horários disponíveis

### Validações:
- Não permitir agendamento no passado
- Verificar conflito com outros agendamentos
- Respeitar antecedência mínima configurável
- Limite de agendamentos por dia/cliente
`
      },
      {
        id: 'notification-system',
        name: 'Sistema de Notificações',
        description: 'Lembretes automáticos por WhatsApp e email',
        technicalSpec: `
## NOTIFICAÇÕES AUTOMÁTICAS

### Tipos de Notificação:
1. Confirmação imediata (ao agendar)
2. Lembrete 24h antes
3. Lembrete 1h antes (opcional)
4. Notificação de cancelamento
5. Notificação de reagendamento

### Mensagem WhatsApp (Template):
\`\`\`
📅 *Lembrete de Agendamento*

Olá {cliente_nome}!

Seu agendamento está confirmado:
📌 {servico_nome}
👤 Com: {profissional_nome}
📅 {data_formatada}
⏰ {horario}
📍 {endereco}

Para cancelar ou reagendar, acesse:
{link_gestao}

{nome_empresa}
\`\`\`

### Implementação:
- Edge Function com cron job para lembretes
- Integração com API WhatsApp (Evolution/Z-API)
- Fallback para email se WhatsApp falhar
- Log de todas as notificações enviadas
`
      }
    ]
  },
  {
    id: 'crm',
    name: 'CRM / Gestão de Clientes',
    emoji: '👥',
    description: 'Relacionamento com clientes e pipeline de vendas',
    category: 'gestao',
    contextPrompt: `Um CRM moderno precisa de pipeline visual Kanban, automações de follow-up, histórico completo de interações e dashboard de métricas de vendas. Integração com WhatsApp para comunicação direta. Tags e segmentação para campanhas. Importação de leads de múltiplas fontes.`,
    defaultObjectives: [
      'Centralizar dados de clientes',
      'Gerenciar pipeline de vendas',
      'Automatizar follow-ups',
      'Histórico de interações',
      'Métricas de conversão',
      'Segmentação de clientes'
    ],
    suggestedModules: ['Dashboard', 'Contatos', 'Pipeline', 'Tarefas', 'Campanhas', 'Relatórios', 'Integrações'],
    coreFeatures: [
      'Pipeline Kanban visual',
      'Gestão de contatos',
      'Histórico de interações',
      'Tarefas e lembretes',
      'Automação de follow-up',
      'Importação de leads',
      'Integração WhatsApp',
      'Dashboard de vendas'
    ],
    databaseEntities: ['contatos', 'negocios', 'etapas_pipeline', 'atividades', 'tarefas', 'tags', 'campanhas'],
    userRoles: ['admin', 'vendedor', 'gerente'],
    backendRequirements: [
      {
        id: 'contacts-system',
        name: 'Gestão de Contatos',
        description: 'CRUD completo com campos customizados',
        technicalSpec: `
## SISTEMA DE CONTATOS

### Estrutura:
\`\`\`typescript
interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: 'manual' | 'import' | 'form' | 'whatsapp';
  tags: string[];
  custom_fields: Record<string, any>;
  assigned_to?: string; // user_id do vendedor
  created_at: Date;
  updated_at: Date;
}

interface Activity {
  id: string;
  contact_id: string;
  type: 'note' | 'call' | 'email' | 'whatsapp' | 'meeting';
  content: string;
  created_by: string;
  created_at: Date;
}
\`\`\`

### Funcionalidades:
- Busca e filtros avançados
- Importação CSV/Excel
- Merge de contatos duplicados
- Timeline de atividades
- Campos customizáveis por empresa
`
      },
      {
        id: 'pipeline-kanban',
        name: 'Pipeline Kanban',
        description: 'Gestão visual de negócios em andamento',
        technicalSpec: `
## PIPELINE KANBAN

### Estrutura:
\`\`\`typescript
interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  probability: number; // 0-100%
}

interface Deal {
  id: string;
  contact_id: string;
  title: string;
  value: number;
  stage_id: string;
  expected_close_date?: Date;
  assigned_to: string;
  lost_reason?: string;
  won_at?: Date;
  lost_at?: Date;
  created_at: Date;
}
\`\`\`

### UI Kanban:
- Drag and drop entre colunas
- Cards com info resumida do negócio
- Valor total por etapa
- Filtros por vendedor/período
- Cores por probabilidade
`
      }
    ]
  },
  {
    id: 'estoque',
    name: 'Gestão de Estoque',
    emoji: '📦',
    description: 'Controle de produtos, entradas e saídas',
    category: 'gestao',
    contextPrompt: `Sistema de estoque com cadastro de produtos, controle de entradas/saídas, alertas de estoque baixo, relatórios de movimentação e integração com vendas. Dashboard mostrando produtos críticos e valores em estoque. Histórico completo de movimentações.`,
    defaultObjectives: [
      'Controlar entradas e saídas',
      'Alertas de estoque baixo',
      'Cadastro de produtos',
      'Relatórios de movimentação',
      'Inventário preciso',
      'Histórico de operações'
    ],
    suggestedModules: ['Dashboard', 'Produtos', 'Movimentações', 'Fornecedores', 'Inventário', 'Relatórios'],
    coreFeatures: [
      'Cadastro de produtos com SKU',
      'Entradas e saídas',
      'Alerta de estoque mínimo',
      'Múltiplos locais/depósitos',
      'Histórico de movimentações',
      'Relatórios de giro',
      'Leitor de código de barras',
      'Inventário físico'
    ],
    databaseEntities: ['produtos', 'categorias', 'movimentacoes', 'fornecedores', 'locais', 'inventarios'],
    userRoles: ['admin', 'estoquista', 'comprador'],
    backendRequirements: [
      {
        id: 'stock-control',
        name: 'Controle de Estoque',
        description: 'Movimentações com rastreabilidade completa',
        technicalSpec: `
## CONTROLE DE ESTOQUE

### Estrutura:
\`\`\`typescript
interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  unit: 'un' | 'kg' | 'lt' | 'mt';
  cost_price: number;
  sale_price: number;
  min_stock: number;
  current_stock: number;
  location_id: string;
  barcode?: string;
  active: boolean;
}

interface StockMovement {
  id: string;
  product_id: string;
  type: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantity: number;
  unit_cost?: number;
  reason: string;
  reference?: string; // NF, pedido, etc
  created_by: string;
  created_at: Date;
}
\`\`\`

### Regras de Negócio:
- Estoque nunca pode ficar negativo
- Custo médio calculado automaticamente
- Alerta quando atingir estoque mínimo
- Log de todas as alterações
`
      }
    ]
  },
  {
    id: 'financeiro',
    name: 'Gestão Financeira',
    emoji: '💰',
    description: 'Contas a pagar/receber e fluxo de caixa',
    category: 'financeiro',
    contextPrompt: `Sistema financeiro com controle de contas a pagar e receber, fluxo de caixa, categorização de despesas, conciliação bancária e relatórios gerenciais. Dashboard com visão geral da saúde financeira. Alertas de vencimentos.`,
    defaultObjectives: [
      'Controlar contas a pagar',
      'Gerenciar contas a receber',
      'Fluxo de caixa projetado',
      'Categorizar despesas',
      'Relatórios financeiros',
      'Alertas de vencimento'
    ],
    suggestedModules: ['Dashboard', 'Contas a Pagar', 'Contas a Receber', 'Fluxo de Caixa', 'Categorias', 'Relatórios'],
    coreFeatures: [
      'Lançamentos de receitas/despesas',
      'Categorização automática',
      'Fluxo de caixa projetado',
      'Alertas de vencimento',
      'Conciliação bancária',
      'Relatórios DRE',
      'Centro de custos',
      'Anexo de comprovantes'
    ],
    databaseEntities: ['lancamentos', 'categorias', 'contas_bancarias', 'centros_custo', 'fornecedores', 'clientes'],
    userRoles: ['admin', 'financeiro', 'contador'],
    backendRequirements: [
      {
        id: 'transactions',
        name: 'Sistema de Lançamentos',
        description: 'Controle de receitas e despesas',
        technicalSpec: `
## LANÇAMENTOS FINANCEIROS

### Estrutura:
\`\`\`typescript
interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  description: string;
  amount: number;
  due_date: Date;
  paid_date?: Date;
  category_id: string;
  cost_center_id?: string;
  bank_account_id?: string;
  contact_id?: string; // cliente ou fornecedor
  recurrence?: RecurrenceConfig;
  attachments: string[];
  notes?: string;
  created_at: Date;
}

interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  end_date?: Date;
  occurrences?: number;
}
\`\`\`

### Dashboard:
- Saldo atual por conta
- Receitas vs Despesas (gráfico)
- Próximos vencimentos
- Contas atrasadas
- Fluxo de caixa 30/60/90 dias
`
      }
    ]
  },
  {
    id: 'pdv',
    name: 'PDV / Frente de Caixa',
    emoji: '🛒',
    description: 'Ponto de venda com controle de vendas',
    category: 'gestao',
    contextPrompt: `Sistema PDV otimizado para velocidade com busca rápida de produtos, carrinho visual, múltiplas formas de pagamento, impressão de cupom e integração com estoque. Interface touch-friendly para tablets. Fechamento de caixa e relatórios de vendas.`,
    defaultObjectives: [
      'Registrar vendas rapidamente',
      'Múltiplas formas de pagamento',
      'Controle de caixa',
      'Integração com estoque',
      'Relatórios de vendas',
      'Cupom fiscal/não fiscal'
    ],
    suggestedModules: ['PDV', 'Vendas', 'Caixa', 'Produtos', 'Clientes', 'Relatórios'],
    coreFeatures: [
      'Busca rápida de produtos',
      'Carrinho visual',
      'Pagamento múltiplo',
      'Desconto por item/total',
      'Abertura/fechamento caixa',
      'Sangria e suprimento',
      'Impressão de cupom',
      'Vendas a prazo'
    ],
    databaseEntities: ['vendas', 'itens_venda', 'produtos', 'clientes', 'caixas', 'movimentacoes_caixa'],
    userRoles: ['admin', 'caixa', 'gerente'],
    backendRequirements: [
      {
        id: 'sales-engine',
        name: 'Motor de Vendas',
        description: 'Processamento rápido de vendas',
        technicalSpec: `
## MOTOR DE VENDAS PDV

### Estrutura:
\`\`\`typescript
interface Sale {
  id: string;
  number: number; // sequencial
  customer_id?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  status: 'pending' | 'completed' | 'cancelled';
  cashier_id: string;
  cash_register_id: string;
  created_at: Date;
}

interface SaleItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

interface Payment {
  method: 'dinheiro' | 'pix' | 'debito' | 'credito' | 'prazo';
  amount: number;
  installments?: number;
  change?: number; // troco
}
\`\`\`

### UI PDV:
- Layout otimizado (produtos à esquerda, carrinho à direita)
- Busca por nome, código ou barcode
- Atalhos de teclado (F2 busca, F4 pagamento, etc)
- Calculadora de troco
- Últimas vendas para consulta rápida
`
      }
    ]
  },
  {
    id: 'marketplace',
    name: 'Marketplace / E-commerce',
    emoji: '🛍️',
    description: 'Plataforma de vendas com múltiplos vendedores',
    category: 'marketplace',
    contextPrompt: `Marketplace com cadastro de vendedores, catálogo de produtos, carrinho, checkout com pagamento, gestão de pedidos e comissionamento. Dashboard para admin e para vendedores. Sistema de avaliações e busca avançada.`,
    defaultObjectives: [
      'Cadastro de vendedores',
      'Catálogo de produtos',
      'Checkout com pagamento',
      'Gestão de pedidos',
      'Sistema de comissões',
      'Avaliações de produtos'
    ],
    suggestedModules: ['Vitrine', 'Carrinho', 'Checkout', 'Pedidos', 'Vendedores', 'Admin', 'Avaliações'],
    coreFeatures: [
      'Catálogo com filtros',
      'Carrinho persistente',
      'Checkout multi-vendedor',
      'Gateway de pagamento',
      'Split de pagamento',
      'Gestão de pedidos',
      'Avaliações e reviews',
      'Painel do vendedor'
    ],
    databaseEntities: ['produtos', 'categorias', 'vendedores', 'pedidos', 'itens_pedido', 'avaliacoes', 'comissoes'],
    userRoles: ['admin', 'vendedor', 'cliente'],
    backendRequirements: [
      {
        id: 'checkout-system',
        name: 'Sistema de Checkout',
        description: 'Carrinho e pagamento integrado',
        technicalSpec: `
## CHECKOUT E PAGAMENTO

### Estrutura:
\`\`\`typescript
interface CartItem {
  product_id: string;
  seller_id: string;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment: PaymentInfo;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  created_at: Date;
}

type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
\`\`\`

### Pagamento:
- Integração com Stripe/Mercado Pago
- Split automático para vendedores
- Comissão retida na plataforma
- Webhook para atualizar status
`
      }
    ]
  },
  {
    id: 'lms',
    name: 'Plataforma de Cursos',
    emoji: '🎓',
    description: 'EAD com aulas, módulos e certificados',
    category: 'educacao',
    contextPrompt: `Plataforma LMS com organização em cursos e módulos, player de vídeo, progresso do aluno, quizzes, certificados e comunidade. Área administrativa para gestão de conteúdo. Dashboard de engajamento e conclusões.`,
    defaultObjectives: [
      'Hospedar cursos em vídeo',
      'Organizar em módulos',
      'Controlar progresso',
      'Emitir certificados',
      'Área de membros',
      'Métricas de engajamento'
    ],
    suggestedModules: ['Cursos', 'Player', 'Progresso', 'Certificados', 'Comunidade', 'Admin', 'Dashboard'],
    coreFeatures: [
      'Catálogo de cursos',
      'Player de vídeo',
      'Progresso automático',
      'Quizzes e exercícios',
      'Certificado digital',
      'Comentários por aula',
      'Área de downloads',
      'Gamificação'
    ],
    databaseEntities: ['cursos', 'modulos', 'aulas', 'matriculas', 'progresso', 'certificados', 'comentarios'],
    userRoles: ['admin', 'instrutor', 'aluno'],
    backendRequirements: [
      {
        id: 'course-player',
        name: 'Player de Cursos',
        description: 'Reprodução com tracking de progresso',
        technicalSpec: `
## PLAYER E PROGRESSO

### Estrutura:
\`\`\`typescript
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor_id: string;
  modules: Module[];
  total_duration: number;
  is_published: boolean;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  video_url?: string;
  content?: string;
  duration: number;
  order: number;
}

interface Progress {
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  watch_time: number;
  completed_at?: Date;
}
\`\`\`

### Player Features:
- Salvar posição do vídeo
- Marcar aula como concluída
- Próxima aula automática
- Velocidade de reprodução
- Notas por aula
`
      }
    ]
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk / Suporte',
    emoji: '🎧',
    description: 'Sistema de tickets e atendimento ao cliente',
    category: 'comunicacao',
    contextPrompt: `Sistema de helpdesk com abertura de tickets, fila de atendimento, SLA, base de conhecimento e relatórios. Dashboard para gestores acompanharem métricas. Chat integrado para atendimento em tempo real.`,
    defaultObjectives: [
      'Centralizar atendimentos',
      'Controlar SLA',
      'Base de conhecimento',
      'Relatórios de performance',
      'Satisfação do cliente',
      'Automações de resposta'
    ],
    suggestedModules: ['Tickets', 'Fila', 'Chat', 'Base de Conhecimento', 'Relatórios', 'Configurações'],
    coreFeatures: [
      'Abertura de tickets',
      'Fila por prioridade',
      'Respostas automáticas',
      'Base de conhecimento',
      'SLA configurável',
      'Pesquisa de satisfação',
      'Macros de resposta',
      'Chat em tempo real'
    ],
    databaseEntities: ['tickets', 'mensagens', 'agentes', 'departamentos', 'artigos', 'avaliacoes_atendimento'],
    userRoles: ['admin', 'agente', 'supervisor', 'cliente'],
    backendRequirements: [
      {
        id: 'ticket-system',
        name: 'Sistema de Tickets',
        description: 'Fluxo completo de atendimento',
        technicalSpec: `
## SISTEMA DE TICKETS

### Estrutura:
\`\`\`typescript
interface Ticket {
  id: string;
  number: number;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  department_id: string;
  assigned_to?: string;
  requester_id: string;
  requester_email: string;
  sla_due_at?: Date;
  first_response_at?: Date;
  resolved_at?: Date;
  messages: TicketMessage[];
  created_at: Date;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'customer' | 'agent';
  sender_id: string;
  content: string;
  attachments: string[];
  is_internal: boolean; // nota interna
  created_at: Date;
}
\`\`\`
`
      }
    ]
  },
  // NOVOS: SAAS
  {
    id: 'saas-subscription',
    name: 'SaaS com Assinaturas',
    emoji: '💎',
    description: 'Plataforma SaaS com planos e cobrança recorrente',
    category: 'saas',
    contextPrompt: `Plataforma SaaS com múltiplos planos de assinatura, trial gratuito, gestão de billing, área do cliente e painel admin. Integração com gateway de pagamento para cobrança recorrente. Dashboard de métricas de MRR, churn e LTV.`,
    defaultObjectives: [
      'Cobrança recorrente automatizada',
      'Múltiplos planos e preços',
      'Trial gratuito',
      'Gestão de assinantes',
      'Métricas SaaS (MRR, Churn, LTV)',
      'Painel administrativo'
    ],
    suggestedModules: ['Dashboard', 'Assinaturas', 'Planos', 'Clientes', 'Billing', 'Analytics', 'Configurações'],
    coreFeatures: [
      'Planos de assinatura',
      'Checkout integrado',
      'Portal do cliente',
      'Upgrade/Downgrade de planos',
      'Cancelamento e retenção',
      'Métricas de MRR/ARR',
      'Webhooks de pagamento',
      'Emails transacionais'
    ],
    databaseEntities: ['usuarios', 'planos', 'assinaturas', 'faturas', 'pagamentos', 'metricas'],
    userRoles: ['admin', 'subscriber', 'support'],
    backendRequirements: []
  },
  {
    id: 'saas-white-label',
    name: 'SaaS White Label',
    emoji: '🏷️',
    description: 'Sistema multi-tenant com personalização por cliente',
    category: 'saas',
    contextPrompt: `Plataforma SaaS multi-tenant onde cada cliente tem seu próprio ambiente personalizado (cores, logo, domínio). Gestão centralizada para admin e painéis isolados por tenant. Ideal para revenda de software.`,
    defaultObjectives: [
      'Multi-tenant isolado',
      'Personalização por cliente',
      'Domínio customizado',
      'Gestão centralizada',
      'Billing por tenant',
      'Relatórios por tenant'
    ],
    suggestedModules: ['Super Admin', 'Tenants', 'Usuários', 'Configurações', 'Billing', 'Logs'],
    coreFeatures: [
      'Isolamento de dados',
      'Tema por tenant',
      'Domínio customizado',
      'Gestão de usuários por tenant',
      'Limites por plano',
      'Relatórios consolidados',
      'Onboarding automatizado'
    ],
    databaseEntities: ['tenants', 'tenant_users', 'tenant_configs', 'plans', 'subscriptions'],
    userRoles: ['super_admin', 'tenant_admin', 'tenant_user'],
    backendRequirements: []
  },
  // DELIVERY E PEDIDOS
  {
    id: 'delivery-app',
    name: 'App de Delivery',
    emoji: '🛵',
    description: 'Sistema de pedidos e entregas com tracking',
    category: 'marketplace',
    contextPrompt: `Aplicativo de delivery com cardápio digital, carrinho, checkout, pagamento online, acompanhamento em tempo real e gestão de entregadores. Painel admin para restaurantes e dashboard de operações.`,
    defaultObjectives: [
      'Cardápio digital completo',
      'Carrinho e checkout',
      'Pagamento online',
      'Tracking em tempo real',
      'Gestão de entregadores',
      'Relatórios de vendas'
    ],
    suggestedModules: ['Cardápio', 'Pedidos', 'Entregas', 'Clientes', 'Entregadores', 'Pagamentos', 'Relatórios'],
    coreFeatures: [
      'Cardápio com fotos',
      'Carrinho persistente',
      'Múltiplas formas de pagamento',
      'Estimativa de tempo',
      'Tracking do pedido',
      'Chat com entregador',
      'Avaliações',
      'Cupons de desconto'
    ],
    databaseEntities: ['produtos', 'categorias', 'pedidos', 'itens_pedido', 'entregas', 'entregadores', 'avaliacoes'],
    userRoles: ['admin', 'restaurante', 'entregador', 'cliente'],
    backendRequirements: []
  },
  {
    id: 'ordering-system',
    name: 'Sistema de Pedidos',
    emoji: '📋',
    description: 'Gestão de pedidos para restaurantes e lojas',
    category: 'gestao',
    contextPrompt: `Sistema de gestão de pedidos para estabelecimentos com totem de autoatendimento, comanda digital, integração com cozinha/produção e controle de filas. Ideal para fast-food, padarias, açaíterias.`,
    defaultObjectives: [
      'Autoatendimento (totem/QR)',
      'Comanda digital',
      'Integração com cozinha',
      'Controle de filas',
      'Relatórios de vendas',
      'Gestão de estoque'
    ],
    suggestedModules: ['Totem', 'Pedidos', 'Cozinha', 'Caixa', 'Produtos', 'Relatórios'],
    coreFeatures: [
      'Interface de totem touch',
      'QR Code na mesa',
      'Painel da cozinha',
      'Chamada por senha',
      'Impressão de comanda',
      'Split de pagamento',
      'Promoções e combos',
      'Tempo médio de preparo'
    ],
    databaseEntities: ['produtos', 'pedidos', 'itens_pedido', 'comandas', 'filas', 'caixas'],
    userRoles: ['admin', 'caixa', 'cozinha', 'atendente'],
    backendRequirements: []
  },
  {
    id: 'booking-platform',
    name: 'Plataforma de Reservas',
    emoji: '🎫',
    description: 'Reservas para eventos, restaurantes, hotéis',
    category: 'gestao',
    contextPrompt: `Sistema de reservas com disponibilidade em tempo real, confirmação automática, lembretes, gestão de capacidade e integração com calendário. Ideal para restaurantes, hotéis, eventos e espaços.`,
    defaultObjectives: [
      'Reservas online 24h',
      'Disponibilidade em tempo real',
      'Confirmação automática',
      'Gestão de capacidade',
      'Lista de espera',
      'Relatórios de ocupação'
    ],
    suggestedModules: ['Reservas', 'Calendário', 'Clientes', 'Espaços', 'Check-in', 'Relatórios'],
    coreFeatures: [
      'Calendário de disponibilidade',
      'Reserva por período',
      'Confirmação por WhatsApp/Email',
      'Lembretes automáticos',
      'Check-in digital',
      'Política de cancelamento',
      'Lista de espera',
      'Overbooking controlado'
    ],
    databaseEntities: ['espacos', 'reservas', 'clientes', 'horarios', 'politicas', 'lista_espera'],
    userRoles: ['admin', 'recepcionista', 'cliente'],
    backendRequirements: []
  },
  // AUTOMAÇÃO
  {
    id: 'workflow-automation',
    name: 'Automação de Processos',
    emoji: '🔄',
    description: 'Builder de workflows e automações',
    category: 'automacao',
    contextPrompt: `Plataforma de automação com builder visual de workflows, triggers baseados em eventos, integrações via API e histórico de execuções. Similar a Zapier/n8n para automações internas.`,
    defaultObjectives: [
      'Builder visual de workflows',
      'Triggers automáticos',
      'Integrações via API',
      'Histórico de execuções',
      'Monitoramento de erros',
      'Templates prontos'
    ],
    suggestedModules: ['Workflows', 'Triggers', 'Execuções', 'Integrações', 'Templates', 'Logs'],
    coreFeatures: [
      'Editor visual drag-and-drop',
      'Triggers por evento/tempo',
      'Ações condicionais',
      'Variáveis e transformações',
      'Retry automático',
      'Webhooks',
      'Logs detalhados',
      'Versionamento'
    ],
    databaseEntities: ['workflows', 'triggers', 'execucoes', 'logs', 'integracoes', 'templates'],
    userRoles: ['admin', 'editor', 'viewer'],
    backendRequirements: []
  },
  {
    id: 'chatbot-builder',
    name: 'Builder de Chatbots',
    emoji: '🤖',
    description: 'Criador de chatbots e fluxos de atendimento',
    category: 'automacao',
    contextPrompt: `Plataforma de criação de chatbots com builder visual de fluxos, integração com WhatsApp/Instagram, IA para respostas, transferência para humano e analytics de conversas.`,
    defaultObjectives: [
      'Builder visual de fluxos',
      'Integração WhatsApp',
      'Respostas com IA',
      'Transferência para humano',
      'Analytics de conversas',
      'Templates por nicho'
    ],
    suggestedModules: ['Builder', 'Chatbots', 'Conversas', 'Analytics', 'Integrações', 'Templates'],
    coreFeatures: [
      'Editor de fluxos visual',
      'Variáveis de contexto',
      'Respostas com IA/GPT',
      'Menus e botões',
      'Envio de mídia',
      'Horário de atendimento',
      'Filas de atendimento',
      'Relatórios de performance'
    ],
    databaseEntities: ['chatbots', 'fluxos', 'sessoes', 'mensagens', 'analytics', 'templates'],
    userRoles: ['admin', 'builder', 'atendente'],
    backendRequirements: []
  },
  // COMUNICAÇÃO
  {
    id: 'team-chat',
    name: 'Chat de Equipe',
    emoji: '💬',
    description: 'Comunicação interna para times',
    category: 'comunicacao',
    contextPrompt: `Plataforma de comunicação para equipes com canais, mensagens diretas, compartilhamento de arquivos, threads e integrações. Similar ao Slack para uso interno.`,
    defaultObjectives: [
      'Comunicação em tempo real',
      'Canais por projeto/equipe',
      'Mensagens diretas',
      'Compartilhamento de arquivos',
      'Busca no histórico',
      'Integrações'
    ],
    suggestedModules: ['Canais', 'Mensagens', 'Arquivos', 'Membros', 'Busca', 'Configurações'],
    coreFeatures: [
      'Chat em tempo real',
      'Canais públicos/privados',
      'Threads de discussão',
      'Menções e notificações',
      'Upload de arquivos',
      'Emoji reactions',
      'Busca global',
      'Status de presença'
    ],
    databaseEntities: ['canais', 'mensagens', 'arquivos', 'membros', 'threads', 'notificacoes'],
    userRoles: ['admin', 'member', 'guest'],
    backendRequirements: []
  },
  // SAÚDE
  {
    id: 'clinic-management',
    name: 'Gestão de Clínicas',
    emoji: '🏥',
    description: 'Sistema completo para clínicas e consultórios',
    category: 'saude',
    contextPrompt: `Sistema de gestão para clínicas com prontuário eletrônico, agendamento, prescrições, faturamento e relatórios. Compliance com LGPD e segurança de dados de saúde.`,
    defaultObjectives: [
      'Prontuário eletrônico',
      'Agendamento integrado',
      'Prescrições digitais',
      'Faturamento',
      'Relatórios médicos',
      'Compliance LGPD'
    ],
    suggestedModules: ['Agenda', 'Pacientes', 'Prontuários', 'Prescrições', 'Faturamento', 'Relatórios'],
    coreFeatures: [
      'Prontuário completo',
      'Histórico do paciente',
      'Prescrição digital',
      'Atestados e laudos',
      'Agenda visual',
      'Fila de espera',
      'Convênios',
      'Teleconsulta'
    ],
    databaseEntities: ['pacientes', 'prontuarios', 'consultas', 'prescricoes', 'documentos', 'convenios'],
    userRoles: ['admin', 'medico', 'recepcionista', 'paciente'],
    backendRequirements: []
  },
  // FINANCEIRO
  {
    id: 'invoice-system',
    name: 'Faturamento e NF',
    emoji: '🧾',
    description: 'Emissão de faturas e notas fiscais',
    category: 'financeiro',
    contextPrompt: `Sistema de faturamento com emissão de faturas, boletos, integração com gateway de pagamento, gestão de cobranças e relatórios financeiros. Integração com contabilidade.`,
    defaultObjectives: [
      'Emissão de faturas',
      'Cobrança automática',
      'Boleto e PIX',
      'Gestão de inadimplentes',
      'Relatórios financeiros',
      'Integração contábil'
    ],
    suggestedModules: ['Faturas', 'Clientes', 'Cobranças', 'Pagamentos', 'Relatórios', 'Configurações'],
    coreFeatures: [
      'Geração de faturas',
      'Cobrança recorrente',
      'Múltiplos gateways',
      'Régua de cobrança',
      'Nota fiscal automática',
      'Conciliação bancária',
      'Relatório de inadimplência',
      'API para integrações'
    ],
    databaseEntities: ['clientes', 'faturas', 'itens_fatura', 'pagamentos', 'cobrancas', 'notas_fiscais'],
    userRoles: ['admin', 'financeiro', 'cliente'],
    backendRequirements: []
  },
  // HR / RH
  {
    id: 'hr-system',
    name: 'Gestão de RH',
    emoji: '👔',
    description: 'Recursos humanos, folha e colaboradores',
    category: 'gestao',
    contextPrompt: `Sistema de RH com cadastro de colaboradores, controle de ponto, férias, folha de pagamento simplificada, avaliações de desempenho e organograma. Portal do colaborador incluso.`,
    defaultObjectives: [
      'Cadastro de colaboradores',
      'Controle de ponto',
      'Gestão de férias',
      'Avaliações de desempenho',
      'Portal do colaborador',
      'Organograma'
    ],
    suggestedModules: ['Colaboradores', 'Ponto', 'Férias', 'Avaliações', 'Portal', 'Relatórios'],
    coreFeatures: [
      'Ficha de colaborador',
      'Registro de ponto',
      'Banco de horas',
      'Solicitação de férias',
      'Avaliação 360°',
      'Holerite digital',
      'Documentos do colaborador',
      'Onboarding digital'
    ],
    databaseEntities: ['colaboradores', 'registros_ponto', 'ferias', 'avaliacoes', 'documentos', 'departamentos'],
    userRoles: ['admin', 'rh', 'gestor', 'colaborador'],
    backendRequirements: []
  },
  // IMOBILIÁRIO
  {
    id: 'real-estate',
    name: 'Sistema Imobiliário',
    emoji: '🏠',
    description: 'Gestão de imóveis, locações e vendas',
    category: 'gestao',
    contextPrompt: `Sistema para imobiliárias com cadastro de imóveis, gestão de locações e vendas, CRM de clientes, contratos, visitas e integração com portais. Dashboard de performance por corretor.`,
    defaultObjectives: [
      'Cadastro de imóveis',
      'Gestão de locações',
      'CRM de clientes',
      'Agendamento de visitas',
      'Contratos digitais',
      'Relatórios de vendas'
    ],
    suggestedModules: ['Imóveis', 'Clientes', 'Visitas', 'Contratos', 'Corretores', 'Relatórios'],
    coreFeatures: [
      'Ficha do imóvel',
      'Galeria de fotos',
      'Match imóvel x cliente',
      'Agenda de visitas',
      'Proposta digital',
      'Contrato eletrônico',
      'Integração com portais',
      'Comissões'
    ],
    databaseEntities: ['imoveis', 'clientes', 'visitas', 'propostas', 'contratos', 'corretores'],
    userRoles: ['admin', 'corretor', 'proprietario', 'cliente'],
    backendRequirements: []
  },
  {
    id: 'outro-app',
    name: 'Outro Sistema',
    emoji: '⚙️',
    description: 'Sistema personalizado com suas especificações',
    category: 'outro',
    contextPrompt: `Sistema personalizado que requer definição clara de entidades, fluxos de usuário e regras de negócio. Importante definir os diferentes perfis de acesso e permissões. Dashboard administrativo e relatórios são essenciais para gestão.`,
    defaultObjectives: [
      'Automatizar processos',
      'Centralizar informações',
      'Controle de acesso',
      'Dashboard de gestão',
      'Relatórios customizados',
      'Integração com outros sistemas'
    ],
    suggestedModules: ['Dashboard', 'Cadastros', 'Operacional', 'Relatórios', 'Configurações', 'Usuários'],
    coreFeatures: [
      'Autenticação segura',
      'Controle de permissões',
      'CRUD de entidades',
      'Dashboard com métricas',
      'Relatórios exportáveis',
      'Logs de auditoria',
      'Backup automático',
      'API para integrações'
    ],
    databaseEntities: [],
    userRoles: ['admin', 'operador', 'visualizador'],
    backendRequirements: []
  }
];

export const APP_CATEGORIES = [
  { id: 'gestao', name: 'Gestão', emoji: '📊' },
  { id: 'saas', name: 'SaaS', emoji: '☁️' },
  { id: 'marketplace', name: 'Marketplace', emoji: '🛍️' },
  { id: 'automacao', name: 'Automação', emoji: '⚡' },
  { id: 'comunicacao', name: 'Comunicação', emoji: '💬' },
  { id: 'financeiro', name: 'Financeiro', emoji: '💰' },
  { id: 'educacao', name: 'Educação', emoji: '📚' },
  { id: 'saude', name: 'Saúde', emoji: '🏥' },
  { id: 'outro', name: 'Outro', emoji: '⚙️' },
] as const;

export function getAppNicheById(id: string): AppNicheContext | undefined {
  return APP_NICHE_CONTEXTS.find(niche => niche.id === id);
}
