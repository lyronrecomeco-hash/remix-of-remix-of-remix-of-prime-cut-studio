// Flow Templates Modal - Pre-configured complex templates
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Sparkles,
  ShoppingCart,
  Users,
  MessageSquare,
  Calendar,
  HeartHandshake,
  Bell,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MessageNode, MessageEdge } from '../../types';

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  tags: string[];
  icon: React.ElementType;
  featured?: boolean;
  nodes: MessageNode[];
  edges: MessageEdge[];
}

interface FlowTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (nodes: MessageNode[], edges: MessageEdge[]) => void;
}

// Pre-configured complex templates
const flowTemplates: FlowTemplate[] = [
  {
    id: 'welcome-sequence',
    name: 'Sequência de Boas-vindas',
    description: 'Flow completo para receber novos contatos com mensagem personalizada, delay humanizado e menu interativo.',
    category: 'engagement',
    complexity: 'medium',
    tags: ['onboarding', 'welcome', 'menu'],
    icon: HeartHandshake,
    featured: true,
    nodes: [
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Início', config: { triggerType: 'new_contact' }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando...', config: { action: 'typing', duration: 3 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Saudação', config: { message: 'Olá {{nome}}! 👋\n\nSeja muito bem-vindo(a)! Fico feliz em te receber aqui.\n\nComo posso te ajudar hoje?', useFormatting: true }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 850, y: 200 }, data: { label: 'Delay 2s', config: { baseDelay: 2, variation: 1, antiBan: true }, isConfigured: true } },
      { id: 'buttons-1', type: 'button-message', position: { x: 1100, y: 200 }, data: { label: 'Menu Principal', config: { message: 'Escolha uma opção abaixo:', buttons: [{ id: '1', text: '📦 Nossos Produtos' }, { id: '2', text: '💰 Preços e Planos' }, { id: '3', text: '🤝 Falar com Atendente' }] }, isConfigured: true } },
      { id: 'condition-1', type: 'condition', position: { x: 1350, y: 200 }, data: { label: 'Qual opção?', config: { variable: 'button_clicked' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'buttons-1' },
      { id: 'e5', source: 'buttons-1', target: 'condition-1' },
    ],
  },
  {
    id: 'ecommerce-catalog',
    name: 'Catálogo E-commerce',
    description: 'Flow avançado para apresentar produtos, capturar interesse e direcionar para compra com menu de categorias.',
    category: 'sales',
    complexity: 'complex',
    tags: ['vendas', 'produtos', 'catalogo'],
    icon: ShoppingCart,
    featured: true,
    nodes: [
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 250 }, data: { label: 'Início', config: { triggerType: 'keyword', keywords: ['comprar', 'produtos', 'catálogo'] }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 250 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 250 }, data: { label: 'Apresentação', config: { message: '🛍️ *Bem-vindo à nossa loja!*\n\nTemos os melhores produtos com preços incríveis. Dá uma olhada nas categorias:', useFormatting: true }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 850, y: 250 }, data: { label: 'Delay', config: { baseDelay: 1.5, variation: 0.5, antiBan: true }, isConfigured: true } },
      { id: 'list-1', type: 'list-message', position: { x: 1100, y: 250 }, data: { label: 'Categorias', config: { title: 'Nossas Categorias', buttonText: 'Ver Categorias', sections: [{ title: 'Produtos', rows: [{ id: '1', title: '👕 Vestuário', description: 'Roupas e acessórios' }, { id: '2', title: '📱 Eletrônicos', description: 'Tech e gadgets' }, { id: '3', title: '🏠 Casa', description: 'Decoração e utilidades' }] }] }, isConfigured: true } },
      { id: 'condition-1', type: 'condition', position: { x: 1350, y: 150 }, data: { label: 'Vestuário?', config: { variable: 'selected_item', value: '1' }, isConfigured: true } },
      { id: 'condition-2', type: 'condition', position: { x: 1350, y: 350 }, data: { label: 'Eletrônicos?', config: { variable: 'selected_item', value: '2' }, isConfigured: true } },
      { id: 'text-2', type: 'advanced-text', position: { x: 1600, y: 150 }, data: { label: 'Produtos Vestuário', config: { message: '👕 *VESTUÁRIO*\n\n✨ Camisetas a partir de R$ 49,90\n✨ Calças a partir de R$ 89,90\n✨ Vestidos a partir de R$ 129,90\n\nQuer ver fotos? Me conta qual item!' }, isConfigured: true } },
      { id: 'text-3', type: 'advanced-text', position: { x: 1600, y: 350 }, data: { label: 'Produtos Tech', config: { message: '📱 *ELETRÔNICOS*\n\n🔥 Smartphones a partir de R$ 999\n🔥 Fones Bluetooth a partir de R$ 79\n🔥 Smartwatches a partir de R$ 199\n\nQuer saber mais sobre algum?' }, isConfigured: true } },
      { id: 'poll-1', type: 'poll', position: { x: 1850, y: 250 }, data: { label: 'Interesse', config: { question: 'O que achou dos produtos?', options: ['😍 Amei! Quero comprar', '🤔 Ainda tenho dúvidas', '💬 Quero ver outras opções'], allowMultiple: false }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'list-1' },
      { id: 'e5', source: 'list-1', target: 'condition-1', sourceHandle: 'output-yes' },
      { id: 'e6', source: 'list-1', target: 'condition-2', sourceHandle: 'output-no' },
      { id: 'e7', source: 'condition-1', target: 'text-2' },
      { id: 'e8', source: 'condition-2', target: 'text-3' },
      { id: 'e9', source: 'text-2', target: 'poll-1' },
      { id: 'e10', source: 'text-3', target: 'poll-1' },
    ],
  },
  {
    id: 'group-moderation',
    name: 'Moderação Completa de Grupo',
    description: 'Sistema completo de moderação com anti-spam, anti-link, boas-vindas, avisos e regras automáticas.',
    category: 'groups',
    complexity: 'complex',
    tags: ['grupo', 'moderação', 'segurança'],
    icon: Shield,
    featured: true,
    nodes: [
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 300 }, data: { label: 'Novo Membro', config: { triggerType: 'member_join' }, isConfigured: true } },
      { id: 'welcome-1', type: 'group-welcome', position: { x: 350, y: 300 }, data: { label: 'Boas-vindas', config: { welcomeMessage: '👋 Seja bem-vindo(a) {{nome}}!\n\nFicamos felizes em ter você aqui! 🎉\n\nLeia as regras abaixo para uma boa convivência.', mentionMember: true }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 600, y: 300 }, data: { label: 'Delay 3s', config: { baseDelay: 3, variation: 1, antiBan: true }, isConfigured: true } },
      { id: 'rules-1', type: 'group-rules', position: { x: 850, y: 300 }, data: { label: 'Regras', config: { rules: '📋 *REGRAS DO GRUPO*\n\n1️⃣ Respeite todos os membros\n2️⃣ Proibido spam e flood\n3️⃣ Sem links externos\n4️⃣ Sem conteúdo ofensivo\n5️⃣ Mantenha o foco do grupo\n\n⚠️ Violações resultam em advertência/banimento.' }, isConfigured: true } },
      { id: 'antispam-1', type: 'anti-spam', position: { x: 350, y: 500 }, data: { label: 'Anti-Spam', config: { maxMessages: 5, action: 'warn', muteTime: 60 }, isConfigured: true } },
      { id: 'antilink-1', type: 'anti-link', position: { x: 600, y: 500 }, data: { label: 'Anti-Link', config: { blockAll: true, whitelist: [], action: 'delete_warn' }, isConfigured: true } },
      { id: 'keyword-1', type: 'keyword-filter', position: { x: 850, y: 500 }, data: { label: 'Palavrões', config: { keywords: ['palavrao1', 'palavrao2'], caseInsensitive: true, action: 'delete' }, isConfigured: true } },
      { id: 'warn-1', type: 'member-warn', position: { x: 1100, y: 400 }, data: { label: 'Advertir', config: { warningMessage: '⚠️ @{{nome}}, esta é sua advertência {{avisos}}/3. Mais uma violação e você será removido(a).' }, isConfigured: true } },
      { id: 'kick-1', type: 'member-kick', position: { x: 1350, y: 400 }, data: { label: 'Remover', config: { maxWarnings: 3, kickMessage: '🚫 {{nome}} foi removido(a) por exceder o limite de advertências.' }, isConfigured: true } },
      { id: 'goodbye-1', type: 'group-goodbye', position: { x: 100, y: 500 }, data: { label: 'Despedida', config: { goodbyeMessage: '👋 {{nome}} saiu do grupo. Até mais!', mentionMember: false }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'welcome-1' },
      { id: 'e2', source: 'welcome-1', target: 'delay-1' },
      { id: 'e3', source: 'delay-1', target: 'rules-1' },
      { id: 'e4', source: 'antispam-1', target: 'warn-1' },
      { id: 'e5', source: 'antilink-1', target: 'warn-1' },
      { id: 'e6', source: 'keyword-1', target: 'warn-1' },
      { id: 'e7', source: 'warn-1', target: 'kick-1' },
    ],
  },
  {
    id: 'appointment-booking',
    name: 'Agendamento Inteligente',
    description: 'Sistema de agendamento com verificação de disponibilidade, confirmação e lembretes automáticos.',
    category: 'scheduling',
    complexity: 'complex',
    tags: ['agendamento', 'booking', 'lembrete'],
    icon: Calendar,
    nodes: [
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 250 }, data: { label: 'Início', config: { triggerType: 'keyword', keywords: ['agendar', 'marcar', 'horário'] }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 350, y: 250 }, data: { label: 'Boas-vindas', config: { message: '📅 *Agendamento Online*\n\nVamos marcar seu horário? É rápido e fácil!\n\nMe conta qual serviço você precisa:' }, isConfigured: true } },
      { id: 'list-1', type: 'list-message', position: { x: 600, y: 250 }, data: { label: 'Serviços', config: { title: 'Escolha o serviço', buttonText: 'Ver Serviços', sections: [{ title: 'Serviços', rows: [{ id: 's1', title: 'Consulta', description: '60 min - R$ 150' }, { id: 's2', title: 'Retorno', description: '30 min - R$ 80' }, { id: 's3', title: 'Avaliação', description: '45 min - R$ 120' }] }] }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 850, y: 250 }, data: { label: 'Delay', config: { baseDelay: 1, variation: 0.5, antiBan: true }, isConfigured: true } },
      { id: 'http-1', type: 'http-request', position: { x: 1100, y: 250 }, data: { label: 'Buscar Horários', config: { method: 'GET', url: 'https://api.exemplo.com/horarios', headers: { 'Content-Type': 'application/json' } }, isConfigured: true } },
      { id: 'buttons-1', type: 'button-message', position: { x: 1350, y: 250 }, data: { label: 'Confirmar', config: { message: '✅ Horário disponível!\n\n📅 Data: {{data}}\n⏰ Hora: {{hora}}\n💼 Serviço: {{servico}}\n\nConfirma o agendamento?', buttons: [{ id: 'yes', text: '✅ Confirmar' }, { id: 'no', text: '❌ Outro horário' }] }, isConfigured: true } },
      { id: 'text-2', type: 'advanced-text', position: { x: 1600, y: 250 }, data: { label: 'Confirmado', config: { message: '🎉 *Agendamento Confirmado!*\n\n📅 {{data}} às {{hora}}\n📍 Endereço: Rua Exemplo, 123\n\n⏰ Enviaremos um lembrete 1h antes.\n\nAté lá! 😊' }, isConfigured: true } },
      { id: 'schedule-1', type: 'schedule-trigger', position: { x: 1850, y: 250 }, data: { label: 'Lembrete', config: { type: 'relative', offset: -60, unit: 'minutes' }, isConfigured: true } },
      { id: 'text-3', type: 'advanced-text', position: { x: 2100, y: 250 }, data: { label: 'Msg Lembrete', config: { message: '⏰ *Lembrete de Agendamento*\n\nOlá {{nome}}!\n\nSeu horário é daqui a 1 hora:\n📅 {{data}} às {{hora}}\n\nTe esperamos! 🙌' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'text-1' },
      { id: 'e2', source: 'text-1', target: 'list-1' },
      { id: 'e3', source: 'list-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'http-1' },
      { id: 'e5', source: 'http-1', target: 'buttons-1' },
      { id: 'e6', source: 'buttons-1', target: 'text-2' },
      { id: 'e7', source: 'text-2', target: 'schedule-1' },
      { id: 'e8', source: 'schedule-1', target: 'text-3' },
    ],
  },
  {
    id: 'support-bot',
    name: 'Suporte Inteligente',
    description: 'Chatbot de suporte com FAQ, triagem automática e transferência para atendente humano.',
    category: 'support',
    complexity: 'complex',
    tags: ['suporte', 'atendimento', 'faq'],
    icon: MessageSquare,
    nodes: [
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 300 }, data: { label: 'Início', config: { triggerType: 'any_message' }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 300 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 300 }, data: { label: 'Menu Suporte', config: { message: '🤖 *Central de Suporte*\n\nOlá! Sou o assistente virtual.\nComo posso ajudar?' }, isConfigured: true } },
      { id: 'buttons-1', type: 'button-message', position: { x: 850, y: 300 }, data: { label: 'Opções', config: { message: 'Selecione uma categoria:', buttons: [{ id: '1', text: '❓ Dúvidas Frequentes' }, { id: '2', text: '🔧 Problema Técnico' }, { id: '3', text: '👤 Falar com Humano' }] }, isConfigured: true } },
      { id: 'condition-1', type: 'condition', position: { x: 1100, y: 200 }, data: { label: 'FAQ?', config: { variable: 'button_clicked', value: '1' }, isConfigured: true } },
      { id: 'condition-2', type: 'condition', position: { x: 1100, y: 400 }, data: { label: 'Técnico?', config: { variable: 'button_clicked', value: '2' }, isConfigured: true } },
      { id: 'list-1', type: 'list-message', position: { x: 1350, y: 200 }, data: { label: 'FAQ', config: { title: 'Perguntas Frequentes', buttonText: 'Ver FAQ', sections: [{ title: 'Dúvidas', rows: [{ id: 'f1', title: 'Como alterar senha?', description: 'Passo a passo' }, { id: 'f2', title: 'Formas de pagamento', description: 'Cartão, Pix, Boleto' }, { id: 'f3', title: 'Prazo de entrega', description: 'Calcule o prazo' }] }] }, isConfigured: true } },
      { id: 'poll-1', type: 'poll', position: { x: 1350, y: 400 }, data: { label: 'Tipo Problema', config: { question: 'Qual tipo de problema?', options: ['App não abre', 'Erro de login', 'Lentidão', 'Outro problema'], allowMultiple: false }, isConfigured: true } },
      { id: 'text-2', type: 'advanced-text', position: { x: 1600, y: 300 }, data: { label: 'Transferir', config: { message: '👤 *Transferindo para Atendente*\n\nAguarde um momento, em breve um de nossos atendentes irá te responder.\n\n⏱️ Tempo médio de espera: 5 minutos' }, isConfigured: true } },
      { id: 'variable-1', type: 'set-variable', position: { x: 1850, y: 300 }, data: { label: 'Marcar Humano', config: { name: 'needs_human', value: 'true' }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 2100, y: 300 }, data: { label: 'Fim', config: { action: 'transfer_to_human' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'buttons-1' },
      { id: 'e4', source: 'buttons-1', target: 'condition-1' },
      { id: 'e5', source: 'buttons-1', target: 'condition-2' },
      { id: 'e6', source: 'condition-1', target: 'list-1' },
      { id: 'e7', source: 'condition-2', target: 'poll-1' },
      { id: 'e8', source: 'buttons-1', target: 'text-2', sourceHandle: 'output-3' },
      { id: 'e9', source: 'text-2', target: 'variable-1' },
      { id: 'e10', source: 'variable-1', target: 'end-1' },
    ],
  },
  {
    id: 'lead-qualification',
    name: 'Qualificação de Leads',
    description: 'Captura e qualifica leads automaticamente com perguntas estratégicas e pontuação.',
    category: 'sales',
    complexity: 'medium',
    tags: ['leads', 'vendas', 'qualificação'],
    icon: Users,
    nodes: [
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 250 }, data: { label: 'Novo Lead', config: { triggerType: 'new_contact' }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 350, y: 250 }, data: { label: 'Intro', config: { message: '👋 Olá! Que bom te conhecer!\n\nPara te ajudar melhor, posso fazer algumas perguntas rápidas?' }, isConfigured: true } },
      { id: 'poll-1', type: 'poll', position: { x: 600, y: 250 }, data: { label: 'Cargo', config: { question: 'Qual seu cargo/função?', options: ['CEO/Diretor', 'Gerente', 'Analista', 'Outro'], allowMultiple: false }, isConfigured: true } },
      { id: 'poll-2', type: 'poll', position: { x: 850, y: 250 }, data: { label: 'Empresa', config: { question: 'Tamanho da empresa?', options: ['1-10 funcionários', '11-50 funcionários', '51-200 funcionários', '+200 funcionários'], allowMultiple: false }, isConfigured: true } },
      { id: 'poll-3', type: 'poll', position: { x: 1100, y: 250 }, data: { label: 'Urgência', config: { question: 'Quando pretende implementar?', options: ['Imediatamente', 'Próximos 30 dias', 'Próximos 3 meses', 'Apenas pesquisando'], allowMultiple: false }, isConfigured: true } },
      { id: 'variable-1', type: 'set-variable', position: { x: 1350, y: 250 }, data: { label: 'Score Lead', config: { name: 'lead_score', value: '{{calculated_score}}' }, isConfigured: true } },
      { id: 'condition-1', type: 'condition', position: { x: 1600, y: 250 }, data: { label: 'Lead Quente?', config: { variable: 'lead_score', operator: '>=', value: '70' }, isConfigured: true } },
      { id: 'text-2', type: 'advanced-text', position: { x: 1850, y: 150 }, data: { label: 'Lead HOT', config: { message: '🔥 Perfeito! Você é exatamente o perfil que buscamos!\n\nVou conectar você com nosso especialista agora.' }, isConfigured: true } },
      { id: 'text-3', type: 'advanced-text', position: { x: 1850, y: 350 }, data: { label: 'Lead Warm', config: { message: '📋 Obrigado pelas informações!\n\nVou enviar nosso material e um consultor entrará em contato em breve.' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'text-1' },
      { id: 'e2', source: 'text-1', target: 'poll-1' },
      { id: 'e3', source: 'poll-1', target: 'poll-2' },
      { id: 'e4', source: 'poll-2', target: 'poll-3' },
      { id: 'e5', source: 'poll-3', target: 'variable-1' },
      { id: 'e6', source: 'variable-1', target: 'condition-1' },
      { id: 'e7', source: 'condition-1', target: 'text-2', sourceHandle: 'output-yes' },
      { id: 'e8', source: 'condition-1', target: 'text-3', sourceHandle: 'output-no' },
    ],
  },
  {
    id: 'notification-blast',
    name: 'Disparo de Notificações',
    description: 'Envio de notificações em massa com verificação de horário e controle anti-spam.',
    category: 'engagement',
    complexity: 'simple',
    tags: ['notificação', 'broadcast', 'massa'],
    icon: Bell,
    nodes: [
      { id: 'trigger-1', type: 'schedule-trigger', position: { x: 100, y: 250 }, data: { label: 'Agendado', config: { schedule: '0 10 * * *', timezone: 'America/Sao_Paulo' }, isConfigured: true } },
      { id: 'condition-1', type: 'condition', position: { x: 350, y: 250 }, data: { label: 'Horário OK?', config: { variable: 'current_hour', operator: 'between', value: '8-20' }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 600, y: 250 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 850, y: 250 }, data: { label: 'Notificação', config: { message: '🔔 *Novidade Especial!*\n\nOlá {{nome}}!\n\n{{mensagem_notificacao}}\n\n👉 Responda SIM para saber mais!' }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 1100, y: 250 }, data: { label: 'Anti-Spam', config: { baseDelay: 5, variation: 3, antiBan: true }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 1350, y: 250 }, data: { label: 'Fim', config: {}, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2', source: 'condition-1', target: 'presence-1' },
      { id: 'e3', source: 'presence-1', target: 'text-1' },
      { id: 'e4', source: 'text-1', target: 'delay-1' },
      { id: 'e5', source: 'delay-1', target: 'end-1' },
    ],
  },
];

const categories = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'engagement', label: 'Engajamento', icon: HeartHandshake },
  { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  { id: 'groups', label: 'Grupos', icon: Users },
  { id: 'scheduling', label: 'Agendamento', icon: Calendar },
  { id: 'support', label: 'Suporte', icon: MessageSquare },
];

export const FlowTemplatesModal = ({
  open,
  onOpenChange,
  onSelectTemplate,
}: FlowTemplatesModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);

  const filteredTemplates = flowTemplates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: FlowTemplate) => {
    onSelectTemplate(template.nodes, template.edges);
    onOpenChange(false);
  };

  const getComplexityBadge = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">Simples</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">Médio</Badge>;
      case 'complex':
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">Complexo</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden z-[200]">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-amber-500/10 to-primary/5">
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            Templates de Flow
          </DialogTitle>
          <DialogDescription>
            Escolha um template pronto e totalmente configurado para começar rapidamente
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-1.5"
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 max-h-[60vh]">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg hover:border-primary/30",
                    selectedTemplate?.id === template.id && "border-primary ring-2 ring-primary/20",
                    template.featured && "border-amber-500/30"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2.5 rounded-xl",
                          template.featured ? "bg-amber-500/10" : "bg-primary/10"
                        )}>
                          <template.icon className={cn(
                            "w-5 h-5",
                            template.featured ? "text-amber-600" : "text-primary"
                          )} />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {template.name}
                            {template.featured && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      {getComplexityBadge(template.complexity)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-2 mb-3">
                      {template.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        {template.nodes.length} nós
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {selectedTemplate && (
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <selectedTemplate.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedTemplate.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTemplate.nodes.length} nós • {selectedTemplate.edges.length} conexões
                </p>
              </div>
            </div>
            <Button onClick={() => handleSelectTemplate(selectedTemplate)} className="gap-2">
              <Check className="w-4 h-4" />
              Usar Template
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
