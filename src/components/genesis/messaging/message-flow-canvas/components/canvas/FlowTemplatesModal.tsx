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
// IMPORTANTE: Todos templates incluem 'instance-connector' para garantir sync com whatsapp_automations
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
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Início', config: { triggerType: 'keyword', keywords: ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'menu', 'início'] }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando...', config: { action: 'typing', duration: 3 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Saudação', config: { message: '{{saudacao}}\n\nSeja muito bem-vindo(a) à {{empresa}}! 🎉\n\nSou a Luna, sua assistente virtual.\nComo posso te ajudar hoje?', useFormatting: true }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 850, y: 200 }, data: { label: 'Delay 2s', config: { baseDelay: 2, variation: 1, antiBan: true }, isConfigured: true } },
      { id: 'buttons-1', type: 'button-message', position: { x: 1100, y: 200 }, data: { label: 'Menu Principal', config: { message: '📋 *Menu Principal*\n\nEscolha uma opção:', buttons: [{ id: '1', text: '📦 Nossos Produtos' }, { id: '2', text: '💰 Preços e Planos' }, { id: '3', text: '🤝 Falar com Atendente' }] }, isConfigured: true } },
      { id: 'text-produtos', type: 'advanced-text', position: { x: 1350, y: 100 }, data: { label: 'Produtos', config: { message: '📦 *Nossos Produtos*\n\n✨ Produto A - R$ 99,90\n✨ Produto B - R$ 149,90\n✨ Produto C - R$ 199,90\n\nQual te interessa?' }, isConfigured: true } },
      { id: 'text-precos', type: 'advanced-text', position: { x: 1350, y: 250 }, data: { label: 'Preços', config: { message: '💰 *Planos e Preços*\n\n🥉 Básico: R$ 49/mês\n🥈 Pro: R$ 99/mês\n🥇 Premium: R$ 199/mês\n\nQual plano combina com você?' }, isConfigured: true } },
      { id: 'text-atendente', type: 'advanced-text', position: { x: 1350, y: 400 }, data: { label: 'Atendente', config: { message: '👤 *Transferindo para Atendente*\n\nAguarde um momento, em breve você será atendido por nossa equipe.\n\n⏱️ Horário: Seg-Sex, 08h às 18h' }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 1600, y: 250 }, data: { label: 'Fim', config: { message: '✅ Posso ajudar em mais algo? Digite *menu* para recomeçar!' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'buttons-1' },
      { id: 'e5', source: 'buttons-1', target: 'text-produtos', sourceHandle: 'output-1' },
      { id: 'e6', source: 'buttons-1', target: 'text-precos', sourceHandle: 'output-2' },
      { id: 'e7', source: 'buttons-1', target: 'text-atendente', sourceHandle: 'output-3' },
      { id: 'e8', source: 'text-produtos', target: 'end-1' },
      { id: 'e9', source: 'text-precos', target: 'end-1' },
      { id: 'e10', source: 'text-atendente', target: 'end-1' },
    ],
  },
  {
    id: 'ecommerce-catalog',
    name: 'Catálogo E-commerce Completo',
    description: 'Flow enterprise para e-commerce com catálogo, carrinho, pagamento e confirmação de pedido.',
    category: 'sales',
    complexity: 'complex',
    tags: ['vendas', 'produtos', 'catalogo', 'pagamento'],
    icon: ShoppingCart,
    featured: true,
    nodes: [
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Início', config: { triggerType: 'keyword', keywords: ['comprar', 'produtos', 'catálogo', 'loja', 'preço', 'orçamento'] }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Boas-vindas Loja', config: { message: '🛍️ *Bem-vindo(a) à {{empresa}}!*\n\n{{saudacao}}\n\nTemos os melhores produtos com preços incríveis e entrega rápida! 🚀', useFormatting: true }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 850, y: 200 }, data: { label: 'Delay 1.5s', config: { baseDelay: 1.5, variation: 0.5, antiBan: true }, isConfigured: true } },
      { id: 'list-1', type: 'list-message', position: { x: 1100, y: 200 }, data: { label: 'Categorias', config: { title: '📂 Nossas Categorias', buttonText: 'Ver Categorias', sections: [{ title: 'Departamentos', rows: [{ id: '1', title: '👕 Vestuário', description: 'Roupas, calçados e acessórios' }, { id: '2', title: '📱 Eletrônicos', description: 'Celulares, fones e gadgets' }, { id: '3', title: '🏠 Casa & Decoração', description: 'Móveis e utilidades' }, { id: '4', title: '💄 Beleza', description: 'Cosméticos e perfumes' }] }] }, isConfigured: true } },
      { id: 'text-vestuario', type: 'advanced-text', position: { x: 1350, y: 50 }, data: { label: 'Vestuário', config: { message: '👕 *VESTUÁRIO*\n\n✨ Camisetas Premium - R$ 69,90\n✨ Calças Jeans - R$ 129,90\n✨ Vestidos - R$ 159,90\n✨ Tênis Esportivo - R$ 249,90\n\n📸 Quer ver fotos? Digite o nome do item!' }, isConfigured: true } },
      { id: 'text-eletronicos', type: 'advanced-text', position: { x: 1350, y: 200 }, data: { label: 'Eletrônicos', config: { message: '📱 *ELETRÔNICOS*\n\n🔥 iPhone 15 - R$ 5.999\n🔥 Galaxy S24 - R$ 4.499\n🔥 AirPods Pro - R$ 1.799\n🔥 Apple Watch - R$ 2.999\n\n💳 Parcelamos em até 12x!' }, isConfigured: true } },
      { id: 'text-casa', type: 'advanced-text', position: { x: 1350, y: 350 }, data: { label: 'Casa', config: { message: '🏠 *CASA & DECORAÇÃO*\n\n🛋️ Sofá 3 lugares - R$ 1.999\n🛏️ Cama Box Queen - R$ 2.499\n🪑 Mesa de Jantar - R$ 899\n💡 Luminárias LED - R$ 199\n\n🚚 Frete grátis acima de R$ 500!' }, isConfigured: true } },
      { id: 'text-beleza', type: 'advanced-text', position: { x: 1350, y: 500 }, data: { label: 'Beleza', config: { message: '💄 *BELEZA*\n\n💋 Kit Maquiagem - R$ 299\n🧴 Skincare Completo - R$ 449\n🌸 Perfumes Importados - R$ 359\n💅 Kit Unhas - R$ 89\n\n🎁 Ganhe brindes em compras acima de R$ 200!' }, isConfigured: true } },
      { id: 'buttons-comprar', type: 'button-message', position: { x: 1600, y: 200 }, data: { label: 'Ação', config: { message: '🛒 O que deseja fazer?', buttons: [{ id: '1', text: '🛒 Adicionar ao Carrinho' }, { id: '2', text: '💳 Finalizar Compra' }, { id: '3', text: '↩️ Ver Outras Categorias' }] }, isConfigured: true } },
      { id: 'text-carrinho', type: 'advanced-text', position: { x: 1850, y: 100 }, data: { label: 'Carrinho', config: { message: '🛒 *Seu Carrinho*\n\nItem adicionado com sucesso! ✅\n\n📦 Produtos: {{quantidade}}\n💰 Total: R$ {{total}}\n\nDeseja continuar comprando ou finalizar?' }, isConfigured: true } },
      { id: 'text-pagamento', type: 'advanced-text', position: { x: 1850, y: 250 }, data: { label: 'Pagamento', config: { message: '💳 *Formas de Pagamento*\n\n1️⃣ PIX (5% desconto)\n2️⃣ Cartão de Crédito (até 12x)\n3️⃣ Boleto Bancário\n\nQual forma prefere?' }, isConfigured: true } },
      { id: 'text-confirmacao', type: 'advanced-text', position: { x: 2100, y: 200 }, data: { label: 'Confirmação', config: { message: '✅ *Pedido Confirmado!*\n\n🔢 Número: #{{pedido_id}}\n📦 Previsão: 3-5 dias úteis\n📍 Código de rastreio será enviado por aqui!\n\nObrigado por comprar conosco! 🙏' }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 2350, y: 200 }, data: { label: 'Fim', config: { message: '🛍️ Obrigado pela compra! Digite *menu* para novas compras.' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'list-1' },
      { id: 'e5', source: 'list-1', target: 'text-vestuario', sourceHandle: 'output-1' },
      { id: 'e6', source: 'list-1', target: 'text-eletronicos', sourceHandle: 'output-2' },
      { id: 'e7', source: 'list-1', target: 'text-casa', sourceHandle: 'output-3' },
      { id: 'e8', source: 'list-1', target: 'text-beleza', sourceHandle: 'output-4' },
      { id: 'e9', source: 'text-vestuario', target: 'buttons-comprar' },
      { id: 'e10', source: 'text-eletronicos', target: 'buttons-comprar' },
      { id: 'e11', source: 'text-casa', target: 'buttons-comprar' },
      { id: 'e12', source: 'text-beleza', target: 'buttons-comprar' },
      { id: 'e13', source: 'buttons-comprar', target: 'text-carrinho', sourceHandle: 'output-1' },
      { id: 'e14', source: 'buttons-comprar', target: 'text-pagamento', sourceHandle: 'output-2' },
      { id: 'e15', source: 'buttons-comprar', target: 'list-1', sourceHandle: 'output-3' },
      { id: 'e16', source: 'text-carrinho', target: 'buttons-comprar' },
      { id: 'e17', source: 'text-pagamento', target: 'text-confirmacao' },
      { id: 'e18', source: 'text-confirmacao', target: 'end-1' },
    ],
  },
  {
    id: 'group-moderation',
    name: 'Moderação Enterprise de Grupo',
    description: 'Sistema completo de moderação com anti-spam, anti-link, filtros de palavras, boas-vindas, avisos progressivos, contador de membros e regras automáticas.',
    category: 'groups',
    complexity: 'complex',
    tags: ['grupo', 'moderação', 'segurança', 'admin'],
    icon: Shield,
    featured: true,
    nodes: [
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Novo Membro', config: { triggerType: 'member_join' }, isConfigured: true } },
      { id: 'welcome-1', type: 'group-welcome', position: { x: 350, y: 200 }, data: { label: 'Boas-vindas', config: { welcomeMessage: '👋 *Seja bem-vindo(a), @{{nome}}!*\n\nFicamos muito felizes em ter você aqui! 🎉\n\nPor favor, leia as regras abaixo para uma boa convivência.', mentionMember: true, delay: 2, sendRules: true, attachImage: false }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 600, y: 200 }, data: { label: 'Delay 3s', config: { baseDelay: 3, variation: 1, antiBan: true }, isConfigured: true } },
      { id: 'rules-1', type: 'group-rules', position: { x: 850, y: 200 }, data: { label: 'Regras', config: { rules: '📋 *REGRAS DO GRUPO*\n\n1️⃣ Respeite todos os membros\n2️⃣ Proibido spam e flood\n3️⃣ Sem links externos (exceto liberados)\n4️⃣ Sem conteúdo ofensivo ou NSFW\n5️⃣ Mantenha o foco do grupo\n6️⃣ Sem áudios longos (+1min)\n7️⃣ Não compartilhe fake news\n\n⚠️ *Penalidades:*\n• 1ª violação: Aviso\n• 2ª violação: Mute 1h\n• 3ª violação: Remoção\n\n_Administração reserva-se o direito de remover sem aviso._', trigger: 'command', triggerKeywords: 'regras, rules, normas', pinMessage: true }, isConfigured: true } },
      { id: 'counter-1', type: 'member-counter', position: { x: 1100, y: 200 }, data: { label: 'Contador', config: { messageFormat: '🎉 *Somos {{total}} membros!*\n\nObrigado por fazer parte dessa comunidade!', showOn: 'milestone', milestones: [50, 100, 250, 500, 1000], includeStats: true }, isConfigured: true } },
      { id: 'antispam-1', type: 'anti-spam', position: { x: 350, y: 400 }, data: { label: 'Anti-Spam', config: { maxMessages: 5, timeWindow: 60, action: 'warn', muteTime: 60, spamWarning: '⚠️ @{{nome}}, evite spam! Você será silenciado se continuar.', ignoreAdmins: true, detectMediaFlood: true, detectStickerFlood: true }, isConfigured: true } },
      { id: 'antilink-1', type: 'anti-link', position: { x: 600, y: 400 }, data: { label: 'Anti-Link', config: { blockAll: false, action: 'delete_warn', allowedDomains: ['youtube.com', 'instagram.com', 'sualoja.com.br'], linkWarning: '🚫 @{{nome}}, links externos não são permitidos! Sua mensagem foi apagada.', ignoreAdmins: true, blockGroupLinks: true, blockPhoneNumbers: true }, isConfigured: true } },
      { id: 'keyword-1', type: 'keyword-filter', position: { x: 850, y: 400 }, data: { label: 'Filtro Palavras', config: { keywords: ['palavra1', 'palavra2', 'ofensa*', '*spam*'], caseInsensitive: true, action: 'delete', warningMessage: '⚠️ @{{nome}}, sua mensagem contém termos proibidos e foi removida.', ignoreAdmins: true, logViolations: true }, isConfigured: true } },
      { id: 'warn-1', type: 'member-warn', position: { x: 1100, y: 400 }, data: { label: 'Advertir', config: { warningMessage: '⚠️ *ADVERTÊNCIA {{avisos}}/3*\n\n@{{nome}}, você violou as regras do grupo.\n\nMotivo: {{motivo}}\n\n_Mais violações resultarão em remoção._', mentionMember: true, showCounter: true, expireHours: 24, logWarnings: true }, isConfigured: true } },
      { id: 'kick-1', type: 'member-kick', position: { x: 1350, y: 400 }, data: { label: 'Remover', config: { maxWarnings: 3, kickMessage: '🚫 *MEMBRO REMOVIDO*\n\n{{nome}} foi removido(a) por exceder o limite de advertências.\n\n_Respeitem as regras!_', notifyGroup: true, sendPrivateMessage: true, privateMessage: 'Você foi removido(a) do grupo por violar as regras repetidamente.', addToBlacklist: true }, isConfigured: true } },
      { id: 'goodbye-1', type: 'group-goodbye', position: { x: 100, y: 400 }, data: { label: 'Despedida', config: { goodbyeMessage: '👋 {{nome}} saiu do grupo.\n\n_Desejamos sucesso!_', mentionMember: false }, isConfigured: true } },
      { id: 'reminder-1', type: 'group-reminder', position: { x: 1350, y: 200 }, data: { label: 'Lembrete Regras', config: { reminderMessage: '📢 *LEMBRETE SEMANAL*\n\nOlá, membros! 👋\n\nNão esqueçam de ler e seguir as regras do grupo.\n\nDigite *regras* para visualizar.', reminderTime: '10:00', repeat: 'weekly' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'welcome-1' },
      { id: 'e2', source: 'welcome-1', target: 'delay-1' },
      { id: 'e3', source: 'delay-1', target: 'rules-1' },
      { id: 'e4', source: 'rules-1', target: 'counter-1' },
      { id: 'e5', source: 'antispam-1', target: 'warn-1' },
      { id: 'e6', source: 'antilink-1', target: 'warn-1' },
      { id: 'e7', source: 'keyword-1', target: 'warn-1' },
      { id: 'e8', source: 'warn-1', target: 'kick-1' },
    ],
  },
  {
    id: 'appointment-booking',
    name: 'Agendamento Inteligente',
    description: 'Sistema completo de agendamento com serviços, datas, confirmação e lembretes automáticos.',
    category: 'scheduling',
    complexity: 'complex',
    tags: ['agendamento', 'booking', 'lembrete', 'serviços'],
    icon: Calendar,
    nodes: [
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Início', config: { triggerType: 'keyword', keywords: ['agendar', 'marcar', 'horário', 'consulta', 'reservar', 'agenda'] }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Boas-vindas', config: { message: '📅 *Agendamento Online - {{empresa}}*\n\n{{saudacao}}\n\nVamos marcar seu horário? É rápido e fácil! 🚀\n\nEscolha o serviço desejado:' }, isConfigured: true } },
      { id: 'list-1', type: 'list-message', position: { x: 850, y: 200 }, data: { label: 'Serviços', config: { title: '🛎️ Nossos Serviços', buttonText: 'Ver Serviços', sections: [{ title: 'Serviços Disponíveis', rows: [{ id: 's1', title: '💼 Consulta Completa', description: '60 min - R$ 150,00' }, { id: 's2', title: '🔄 Retorno/Revisão', description: '30 min - R$ 80,00' }, { id: 's3', title: '📋 Avaliação Inicial', description: '45 min - R$ 120,00' }, { id: 's4', title: '⚡ Atendimento Express', description: '15 min - R$ 50,00' }] }] }, isConfigured: true } },
      { id: 'text-dias', type: 'advanced-text', position: { x: 1100, y: 200 }, data: { label: 'Dias', config: { message: '📆 *Escolha o dia:*\n\n1️⃣ Segunda-feira\n2️⃣ Terça-feira\n3️⃣ Quarta-feira\n4️⃣ Quinta-feira\n5️⃣ Sexta-feira\n\n_Digite o número do dia:_' }, isConfigured: true } },
      { id: 'text-horarios', type: 'advanced-text', position: { x: 1350, y: 200 }, data: { label: 'Horários', config: { message: '⏰ *Horários Disponíveis:*\n\n🟢 09:00\n🟢 10:00\n🟢 11:00\n🟢 14:00\n🟢 15:00\n🟢 16:00\n\n_Digite o horário desejado:_' }, isConfigured: true } },
      { id: 'buttons-1', type: 'button-message', position: { x: 1600, y: 200 }, data: { label: 'Confirmar', config: { message: '✅ *Confirme seu Agendamento:*\n\n📋 Serviço: {{servico}}\n📅 Data: {{data}}\n⏰ Hora: {{hora}}\n💰 Valor: R$ {{valor}}\n\nEstá correto?', buttons: [{ id: 'yes', text: '✅ Confirmar' }, { id: 'no', text: '❌ Alterar' }, { id: 'cancel', text: '🚫 Cancelar' }] }, isConfigured: true } },
      { id: 'text-confirmado', type: 'advanced-text', position: { x: 1850, y: 100 }, data: { label: 'Confirmado', config: { message: '🎉 *Agendamento Confirmado!*\n\n📋 Serviço: {{servico}}\n📅 Data: {{data}} às {{hora}}\n📍 Local: Rua Exemplo, 123 - Centro\n\n📱 Código: #{{codigo}}\n\n⏰ Enviaremos um lembrete 1h antes.\n\n_Para remarcar ou cancelar, digite "cancelar"._' }, isConfigured: true } },
      { id: 'text-alterar', type: 'advanced-text', position: { x: 1850, y: 300 }, data: { label: 'Alterar', config: { message: '🔄 Sem problemas! Vamos recomeçar.\n\nQual serviço você deseja agendar?' }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 2100, y: 200 }, data: { label: 'Fim', config: { message: '✅ Obrigado! Até breve! 👋\n\nDigite *agendar* para novo agendamento.' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'list-1' },
      { id: 'e4', source: 'list-1', target: 'text-dias' },
      { id: 'e5', source: 'text-dias', target: 'text-horarios' },
      { id: 'e6', source: 'text-horarios', target: 'buttons-1' },
      { id: 'e7', source: 'buttons-1', target: 'text-confirmado', sourceHandle: 'output-1' },
      { id: 'e8', source: 'buttons-1', target: 'text-alterar', sourceHandle: 'output-2' },
      { id: 'e9', source: 'buttons-1', target: 'end-1', sourceHandle: 'output-3' },
      { id: 'e10', source: 'text-confirmado', target: 'end-1' },
      { id: 'e11', source: 'text-alterar', target: 'list-1' },
    ],
  },
  {
    id: 'support-bot',
    name: 'Suporte Inteligente Enterprise',
    description: 'Chatbot completo de suporte com FAQ dinâmico, triagem de problemas, coleta de dados e transferência inteligente.',
    category: 'support',
    complexity: 'complex',
    tags: ['suporte', 'atendimento', 'faq', 'sac'],
    icon: MessageSquare,
    nodes: [
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Início', config: { triggerType: 'keyword', keywords: ['suporte', 'ajuda', 'help', 'problema', 'dúvida', 'atendimento'] }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Boas-vindas', config: { message: '🤖 *Central de Suporte - {{empresa}}*\n\n{{saudacao}}\n\nSou o assistente virtual e estou aqui para ajudar! Como posso te auxiliar hoje?' }, isConfigured: true } },
      { id: 'buttons-1', type: 'button-message', position: { x: 850, y: 200 }, data: { label: 'Menu Suporte', config: { message: '📋 Selecione uma opção:', buttons: [{ id: '1', text: '❓ Dúvidas Frequentes' }, { id: '2', text: '🔧 Problema Técnico' }, { id: '3', text: '👤 Falar com Humano' }] }, isConfigured: true } },
      { id: 'list-faq', type: 'list-message', position: { x: 1100, y: 100 }, data: { label: 'FAQ', config: { title: '❓ Perguntas Frequentes', buttonText: 'Ver Dúvidas', sections: [{ title: 'Conta', rows: [{ id: 'f1', title: '🔑 Como alterar minha senha?', description: 'Recuperação de acesso' }, { id: 'f2', title: '📧 Atualizar e-mail', description: 'Trocar e-mail cadastrado' }] }, { title: 'Pagamentos', rows: [{ id: 'f3', title: '💳 Formas de pagamento', description: 'PIX, Cartão, Boleto' }, { id: 'f4', title: '🧾 Segunda via de boleto', description: 'Gerar novo boleto' }] }, { title: 'Entregas', rows: [{ id: 'f5', title: '📦 Rastrear pedido', description: 'Acompanhe sua entrega' }, { id: 'f6', title: '🚚 Prazo de entrega', description: 'Calcule o prazo' }] }] }, isConfigured: true } },
      { id: 'text-senha', type: 'advanced-text', position: { x: 1350, y: 50 }, data: { label: 'Resp Senha', config: { message: '🔑 *Como alterar sua senha:*\n\n1️⃣ Acesse nosso site/app\n2️⃣ Clique em "Esqueci minha senha"\n3️⃣ Informe seu e-mail\n4️⃣ Clique no link enviado\n5️⃣ Crie uma nova senha\n\n_Precisa de mais ajuda?_' }, isConfigured: true } },
      { id: 'poll-problema', type: 'poll', position: { x: 1100, y: 300 }, data: { label: 'Tipo Problema', config: { question: '🔧 Qual tipo de problema você está enfrentando?', options: ['📱 App não abre/trava', '🔐 Erro de login', '🐢 Sistema lento', '💳 Problema com pagamento', '📦 Pedido não chegou', '🔴 Outro problema'], allowMultiple: false }, isConfigured: true } },
      { id: 'text-coleta', type: 'advanced-text', position: { x: 1350, y: 300 }, data: { label: 'Coleta Dados', config: { message: '📝 Para resolver seu problema, preciso de algumas informações:\n\n1️⃣ Seu nome completo\n2️⃣ E-mail cadastrado\n3️⃣ Descrição detalhada do problema\n\n_Por favor, envie essas informações:_' }, isConfigured: true } },
      { id: 'text-protocolo', type: 'advanced-text', position: { x: 1600, y: 300 }, data: { label: 'Protocolo', config: { message: '✅ *Chamado Registrado!*\n\n🔢 Protocolo: #{{protocolo}}\n📧 Resposta em até 24h\n\nAcompanhe pelo e-mail cadastrado.\n\n_Posso ajudar em mais algo?_' }, isConfigured: true } },
      { id: 'text-humano', type: 'advanced-text', position: { x: 1100, y: 450 }, data: { label: 'Transferir', config: { message: '👤 *Transferindo para Atendente*\n\nAguarde um momento, em breve um de nossos atendentes irá te responder.\n\n⏱️ Tempo médio de espera: 5 minutos\n📅 Horário: Seg-Sex, 08h às 18h\n\n_Enquanto isso, já pode descrever seu problema!_' }, isConfigured: true } },
      { id: 'buttons-mais', type: 'button-message', position: { x: 1850, y: 200 }, data: { label: 'Mais ajuda?', config: { message: '🤔 Posso ajudar em mais alguma coisa?', buttons: [{ id: '1', text: '✅ Sim, outra dúvida' }, { id: '2', text: '👋 Não, obrigado!' }] }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 2100, y: 200 }, data: { label: 'Fim', config: { message: '😊 Foi um prazer ajudar!\n\nSe precisar, é só chamar novamente.\n\nAté mais! 👋' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'buttons-1' },
      { id: 'e4', source: 'buttons-1', target: 'list-faq', sourceHandle: 'output-1' },
      { id: 'e5', source: 'buttons-1', target: 'poll-problema', sourceHandle: 'output-2' },
      { id: 'e6', source: 'buttons-1', target: 'text-humano', sourceHandle: 'output-3' },
      { id: 'e7', source: 'list-faq', target: 'text-senha' },
      { id: 'e8', source: 'text-senha', target: 'buttons-mais' },
      { id: 'e9', source: 'poll-problema', target: 'text-coleta' },
      { id: 'e10', source: 'text-coleta', target: 'text-protocolo' },
      { id: 'e11', source: 'text-protocolo', target: 'buttons-mais' },
      { id: 'e12', source: 'buttons-mais', target: 'buttons-1', sourceHandle: 'output-1' },
      { id: 'e13', source: 'buttons-mais', target: 'end-1', sourceHandle: 'output-2' },
      { id: 'e14', source: 'text-humano', target: 'end-1' },
    ],
  },
  {
    id: 'lead-qualification',
    name: 'Qualificação de Leads Enterprise',
    description: 'Sistema completo de captura e qualificação de leads com perguntas estratégicas, pontuação automática e roteamento inteligente.',
    category: 'sales',
    complexity: 'complex',
    tags: ['leads', 'vendas', 'qualificação', 'crm'],
    icon: Users,
    nodes: [
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'start-trigger', position: { x: 100, y: 200 }, data: { label: 'Novo Lead', config: { triggerType: 'keyword', keywords: ['orçamento', 'preço', 'informação', 'cotação', 'proposta', 'interesse'] }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Intro', config: { message: '👋 *Olá! Que bom te conhecer!*\n\n{{saudacao}}\n\nSou da {{empresa}} e vou te ajudar a encontrar a melhor solução! 🚀\n\nPara isso, posso fazer algumas perguntinhas rápidas?' }, isConfigured: true } },
      { id: 'buttons-inicio', type: 'button-message', position: { x: 850, y: 200 }, data: { label: 'Iniciar', config: { message: '📋 São apenas 4 perguntas:', buttons: [{ id: '1', text: '✅ Vamos lá!' }, { id: '2', text: '📞 Prefiro ligar' }] }, isConfigured: true } },
      { id: 'poll-cargo', type: 'poll', position: { x: 1100, y: 150 }, data: { label: 'Cargo', config: { question: '👤 Qual seu cargo/função na empresa?', options: ['CEO/Sócio/Diretor', 'Gerente/Coordenador', 'Analista/Especialista', 'Assistente/Auxiliar', 'Autônomo/MEI'], allowMultiple: false }, isConfigured: true } },
      { id: 'poll-empresa', type: 'poll', position: { x: 1350, y: 150 }, data: { label: 'Tamanho', config: { question: '🏢 Qual o tamanho da sua empresa?', options: ['1-10 funcionários', '11-50 funcionários', '51-200 funcionários', '201-1000 funcionários', '+1000 funcionários'], allowMultiple: false }, isConfigured: true } },
      { id: 'poll-urgencia', type: 'poll', position: { x: 1600, y: 150 }, data: { label: 'Urgência', config: { question: '⏰ Quando pretende implementar a solução?', options: ['Urgente (esta semana)', 'Próximos 30 dias', '1-3 meses', '3-6 meses', 'Apenas pesquisando'], allowMultiple: false }, isConfigured: true } },
      { id: 'poll-investimento', type: 'poll', position: { x: 1850, y: 150 }, data: { label: 'Investimento', config: { question: '💰 Qual faixa de investimento você considera?', options: ['Até R$ 500/mês', 'R$ 500-2.000/mês', 'R$ 2.000-5.000/mês', 'Acima de R$ 5.000/mês', 'A definir'], allowMultiple: false }, isConfigured: true } },
      { id: 'text-hot', type: 'advanced-text', position: { x: 2100, y: 50 }, data: { label: 'Lead HOT 🔥', config: { message: '🔥 *Perfeito, {{nome}}!*\n\nVocê é exatamente o perfil que buscamos!\n\n📞 Vou conectar você AGORA com nosso especialista para uma demonstração personalizada.\n\nEle entrará em contato em instantes!' }, isConfigured: true } },
      { id: 'text-warm', type: 'advanced-text', position: { x: 2100, y: 200 }, data: { label: 'Lead WARM', config: { message: '📋 *Obrigado pelas informações, {{nome}}!*\n\nBased nas suas respostas, preparei algo especial para você:\n\n📧 Enviarei nosso material completo\n📞 Um consultor entrará em contato em até 24h\n\nEnquanto isso, alguma dúvida específica?' }, isConfigured: true } },
      { id: 'text-cold', type: 'advanced-text', position: { x: 2100, y: 350 }, data: { label: 'Lead COLD', config: { message: '📝 *Entendi, {{nome}}!*\n\nVou enviar nosso material informativo para você conhecer melhor nossas soluções.\n\n📧 Fique de olho no seu WhatsApp!\n\nQuando estiver pronto para avançar, é só me chamar! 🚀' }, isConfigured: true } },
      { id: 'text-ligar', type: 'advanced-text', position: { x: 1100, y: 350 }, data: { label: 'Preferiu Ligar', config: { message: '📞 *Sem problemas!*\n\nNosso time está disponível:\n\n📱 (11) 99999-9999\n⏰ Seg-Sex, 08h às 18h\n\nOu se preferir, posso agendar uma ligação para você!' }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 2350, y: 200 }, data: { label: 'Fim', config: { message: '🙏 Obrigado pelo interesse!\n\nDigite *menu* para recomeçar.' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'buttons-inicio' },
      { id: 'e4', source: 'buttons-inicio', target: 'poll-cargo', sourceHandle: 'output-1' },
      { id: 'e5', source: 'buttons-inicio', target: 'text-ligar', sourceHandle: 'output-2' },
      { id: 'e6', source: 'poll-cargo', target: 'poll-empresa' },
      { id: 'e7', source: 'poll-empresa', target: 'poll-urgencia' },
      { id: 'e8', source: 'poll-urgencia', target: 'poll-investimento' },
      { id: 'e9', source: 'poll-investimento', target: 'text-hot' },
      { id: 'e10', source: 'poll-investimento', target: 'text-warm' },
      { id: 'e11', source: 'poll-investimento', target: 'text-cold' },
      { id: 'e12', source: 'text-hot', target: 'end-1' },
      { id: 'e13', source: 'text-warm', target: 'end-1' },
      { id: 'e14', source: 'text-cold', target: 'end-1' },
      { id: 'e15', source: 'text-ligar', target: 'end-1' },
    ],
  },
  {
    id: 'notification-blast',
    name: 'Disparo de Notificações',
    description: 'Envio de notificações em massa com verificação de horário, segmentação e controle anti-spam.',
    category: 'engagement',
    complexity: 'medium',
    tags: ['notificação', 'broadcast', 'campanha'],
    icon: Bell,
    nodes: [
      { id: 'instance-1', type: 'instance-connector', position: { x: 100, y: 50 }, data: { label: '📱 Instância WhatsApp', config: { instanceId: '' }, isConfigured: false } },
      { id: 'trigger-1', type: 'schedule-trigger', position: { x: 100, y: 200 }, data: { label: 'Agendado', config: { schedule: '0 10 * * *', timezone: 'America/Sao_Paulo' }, isConfigured: true } },
      { id: 'presence-1', type: 'presence', position: { x: 350, y: 200 }, data: { label: 'Digitando', config: { action: 'typing', duration: 2 }, isConfigured: true } },
      { id: 'text-1', type: 'advanced-text', position: { x: 600, y: 200 }, data: { label: 'Notificação', config: { message: '🔔 *Novidade Especial da {{empresa}}!*\n\n{{saudacao}}, {{nome}}!\n\n{{mensagem_notificacao}}\n\n👉 Responda *SIM* para saber mais!\n👉 Responda *PARAR* para não receber mais' }, isConfigured: true } },
      { id: 'delay-1', type: 'smart-delay', position: { x: 850, y: 200 }, data: { label: 'Anti-Spam', config: { baseDelay: 5, variation: 3, antiBan: true }, isConfigured: true } },
      { id: 'end-1', type: 'end-flow', position: { x: 1100, y: 200 }, data: { label: 'Fim', config: { message: '' }, isConfigured: true } },
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'presence-1' },
      { id: 'e2', source: 'presence-1', target: 'text-1' },
      { id: 'e3', source: 'text-1', target: 'delay-1' },
      { id: 'e4', source: 'delay-1', target: 'end-1' },
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
