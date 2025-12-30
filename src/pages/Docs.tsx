import React, { useState } from 'react';
import { 
  Book, 
  Shield,
  Megaphone,
  Webhook,
  Bell,
  ChevronRight,
  Search,
  Smartphone,
  Zap,
  Info,
  ArrowLeft,
  ArrowRight,
  Key,
  AlertTriangle,
  Users,
  HelpCircle,
  DollarSign,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  Send,
  Menu,
  X,
  Home,
  Star,
  CheckCircle,
  Sparkles,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: DocContent[];
}

interface DocContent {
  subtitle?: string;
  text?: string;
  list?: string[];
  tip?: string;
  warning?: string;
}

const documentationSections: DocSection[] = [
  {
    id: 'boas-vindas',
    title: 'Boas-vindas',
    icon: Sparkles,
    content: [
      {
        subtitle: 'Bem-vindo à Central de Documentação Genesis',
        text: 'Seja bem-vindo à documentação oficial do Genesis - o sistema de gestão mais completo para barbearias. Aqui você encontrará todos os guias, tutoriais e informações necessárias para dominar cada funcionalidade do sistema e maximizar os resultados do seu negócio.'
      },
      {
        subtitle: 'O que é o Genesis?',
        text: 'O Genesis é uma plataforma completa de gestão desenvolvida especificamente para barbearias modernas. Com ele, você gerencia agendamentos, equipe, finanças, marketing e relacionamento com clientes em um único lugar, de forma simples e profissional.',
        list: [
          'Sistema de agendamento online 24/7 para seus clientes',
          'Gestão completa de barbeiros, serviços e horários',
          'Fila de espera inteligente com notificações',
          'Integração com WhatsApp para comunicação automatizada',
          'Campanhas de marketing com inteligência artificial',
          'Dashboard financeiro e relatórios de desempenho',
          'Site comercial personalizável para sua barbearia',
          'Sistema de avaliações e feedbacks dos clientes'
        ]
      },
      {
        subtitle: 'Como usar esta documentação',
        text: 'Navegue pelas categorias no menu lateral para encontrar o que precisa. Use a busca para encontrar tópicos específicos rapidamente. Cada seção contém instruções detalhadas, dicas importantes e alertas para evitar erros comuns.',
        list: [
          'Primeiros Passos: Comece aqui para configurar sua barbearia',
          'Site Comercial: Personalize seu site público e atraia mais clientes',
          'Agendamentos: Gerencie toda sua agenda de forma eficiente',
          'Integrações: Configure WhatsApp, webhooks e notificações',
          'Marketing: Crie campanhas para fidelizar e reconquistar clientes',
          'Segurança: Proteja seu sistema e dados com as melhores práticas',
          'Suporte: Saiba como obter ajuda quando precisar'
        ],
        tip: 'Recomendamos ler as seções na ordem apresentada se você está começando. Cada seção foi organizada para construir seu conhecimento de forma progressiva.'
      }
    ]
  },
  {
    id: 'site-comercial',
    title: 'Site Comercial',
    icon: Globe,
    content: [
      {
        subtitle: 'Seu Site Profissional',
        text: 'O Genesis inclui um site comercial completo e personalizável para sua barbearia. Seus clientes podem conhecer seus serviços, ver fotos do trabalho, localização e agendar diretamente - tudo em um visual profissional que representa sua marca.'
      },
      {
        subtitle: 'Seções do Site',
        text: 'O site é dividido em seções que você pode personalizar completamente:',
        list: [
          'Hero (Banner Principal): Primeira impressão do cliente. Defina título impactante, descrição e botão de ação.',
          'Sobre Nós: Conte a história da sua barbearia, sua missão e diferenciais.',
          'Serviços: Liste todos os serviços oferecidos com preços e descrições atrativas.',
          'Galeria: Mostre fotos dos cortes, ambiente e equipe. Imagens de qualidade vendem!',
          'Depoimentos: Exiba avaliações de clientes satisfeitos para gerar confiança.',
          'Localização: Mapa interativo, endereço completo e horários de funcionamento.',
          'Rodapé: Links para redes sociais, termos de uso e informações de contato.'
        ]
      },
      {
        subtitle: 'Como Personalizar o Site',
        text: 'Acesse o painel administrativo e siga estes passos:',
        list: [
          '1. Vá em Configurações > Textos do Site',
          '2. Selecione a seção que deseja editar',
          '3. Preencha os campos com seu conteúdo personalizado',
          '4. Clique em Salvar para aplicar as alterações',
          '5. Visualize o site público para conferir o resultado'
        ],
        tip: 'Use textos curtos e objetivos. Clientes leem rápido - cada palavra deve agregar valor.'
      },
      {
        subtitle: 'Galeria de Fotos',
        text: 'A galeria é uma das seções mais importantes. Fotos de qualidade geram mais agendamentos:',
        list: [
          'Use fotos de alta resolução (mínimo 800x600 pixels)',
          'Mostre diferentes estilos de cortes e barbas',
          'Inclua fotos do ambiente da barbearia',
          'Fotos com boa iluminação convertem mais',
          'Atualize regularmente com trabalhos recentes'
        ],
        warning: 'Evite fotos desfocadas, escuras ou de baixa qualidade. Elas passam impressão de amadorismo.'
      },
      {
        subtitle: 'Redes Sociais e Contato',
        text: 'Configure suas redes sociais em Configurações > Barbearia:',
        list: [
          'Instagram: Essencial! Clientes buscam referências visuais',
          'Facebook: Bom para alcançar público mais amplo',
          'WhatsApp: Link direto para contato rápido',
          'Google Maps: Facilita a localização dos clientes'
        ]
      },
      {
        subtitle: 'Link de Agendamento',
        text: 'Compartilhe o link de agendamento para seus clientes agendarem online:',
        list: [
          'Encontre o link em Configurações > Link de Agendamento',
          'Copie e compartilhe no Instagram, WhatsApp, cartões de visita',
          'O link leva direto para a tela de agendamento',
          'Funciona 24 horas, 7 dias por semana'
        ],
        tip: 'Coloque o link de agendamento na bio do Instagram e no status do WhatsApp Business para máximo alcance.'
      }
    ]
  },
  {
    id: 'feedbacks',
    title: 'Sistema de Feedbacks',
    icon: Star,
    content: [
      {
        subtitle: 'Avaliações dos Clientes',
        text: 'O sistema de feedbacks permite que clientes avaliem seus atendimentos. Essas avaliações ajudam a melhorar o serviço e servem como prova social para novos clientes.'
      },
      {
        subtitle: 'Como Funciona',
        text: 'O fluxo de avaliação é simples e automático:',
        list: [
          '1. Após o atendimento ser marcado como "Concluído"',
          '2. O cliente recebe um link de avaliação (via WhatsApp ou SMS)',
          '3. Ele avalia de 1 a 5 estrelas e pode deixar um comentário',
          '4. A avaliação aparece no painel para sua análise',
          '5. Avaliações aprovadas podem aparecer no site público'
        ]
      },
      {
        subtitle: 'Gerenciando Feedbacks',
        text: 'No painel, acesse a aba Feedbacks para:',
        list: [
          'Ver todas as avaliações recebidas',
          'Filtrar por nota (1-5 estrelas)',
          'Aprovar feedbacks para exibição pública',
          'Responder comentários de clientes',
          'Identificar pontos de melhoria'
        ]
      },
      {
        subtitle: 'Boas Práticas',
        list: [
          'Responda feedbacks negativos de forma profissional',
          'Agradeça feedbacks positivos publicamente',
          'Use críticas construtivas para melhorar',
          'Peça avaliação logo após o atendimento',
          'Exiba as melhores avaliações no site'
        ],
        tip: 'Clientes que recebem resposta aos feedbacks têm 70% mais chance de voltar, mesmo após experiências negativas.'
      },
      {
        subtitle: 'Link de Avaliação',
        text: 'Para compartilhar manualmente o link de avaliação:',
        list: [
          'Acesse Feedbacks > Copiar Link',
          'Envie para o cliente via WhatsApp',
          'O link é único para sua barbearia',
          'Pode ser usado em QR Codes no estabelecimento'
        ]
      }
    ]
  },
  {
    id: 'primeiros-passos',
    title: 'Primeiros Passos',
    icon: Zap,
    content: [
      {
        subtitle: 'Bem-vindo ao Genesis',
        text: 'O Genesis é um sistema completo de gestão para barbearias. Este guia vai ajudá-lo a configurar e utilizar todas as funcionalidades disponíveis. Siga as instruções abaixo para começar.'
      },
      {
        subtitle: 'Configuração Inicial Obrigatória',
        text: 'Antes de disponibilizar o agendamento online para seus clientes, você PRECISA configurar os seguintes itens:',
        list: [
          'Dados da Barbearia: Acesse Configurações > Barbearia e preencha nome, endereço completo, telefone e número de WhatsApp. Estas informações aparecem no site público e são usadas nas mensagens automáticas.',
          'Horários de Funcionamento: Em Configurações > Horários, defina os dias e horários que a barbearia funciona. Horários não configurados não aparecerão para agendamento.',
          'Serviços Oferecidos: Na aba Serviços, cadastre cada serviço com nome, descrição, preço e duração em minutos. A duração é crucial para calcular os horários disponíveis.',
          'Equipe de Barbeiros: Adicione todos os barbeiros com foto, especialidades e experiência. Barbeiros sem foto ou inativos não aparecem para agendamento.',
          'Horários Individuais: Cada barbeiro pode ter horários próprios. Configure em Horários > selecione o barbeiro > defina os dias e horários dele.'
        ],
        warning: 'Sem essas configurações, o agendamento online não funcionará. Clientes verão mensagens de erro ou horários indisponíveis.'
      },
      {
        subtitle: 'Ordem Recomendada de Configuração',
        text: 'Para evitar problemas, siga esta ordem exata:',
        list: [
          '1º Passo: Configure os dados básicos da barbearia (nome, endereço, contatos)',
          '2º Passo: Defina os horários de funcionamento geral do estabelecimento',
          '3º Passo: Cadastre todos os serviços com preços e durações corretas',
          '4º Passo: Adicione os barbeiros com fotos profissionais',
          '5º Passo: Configure os horários individuais de cada barbeiro',
          '6º Passo: Faça um agendamento teste pelo site público para validar',
          '7º Passo: Configure as integrações (WhatsApp, notificações push)'
        ],
        tip: 'Recomendamos fazer todo o processo de configuração em um dia, antes de divulgar o link de agendamento para os clientes.'
      },
      {
        subtitle: 'Primeiros Agendamentos',
        text: 'Após a configuração, seus clientes podem agendar de duas formas:',
        list: [
          'Pelo link de agendamento que você compartilha (encontrado em Configurações > Link Agendamento)',
          'Diretamente pelo seu site, caso tenha integrado o Genesis',
          'Você também pode criar agendamentos manualmente pela Agenda no painel admin'
        ]
      }
    ]
  },
  {
    id: 'agendamentos',
    title: 'Gestão de Agendamentos',
    icon: Calendar,
    content: [
      {
        subtitle: 'Visualizando a Agenda',
        text: 'A tela de Agenda é o coração do sistema. Nela você visualiza todos os agendamentos do dia, semana ou mês, podendo filtrar por barbeiro, status ou período.',
        list: [
          'Vista Diária: Ideal para acompanhar o dia a dia, mostra todos os horários ocupados e livres',
          'Vista Semanal: Permite planejar a semana e identificar períodos de alta/baixa demanda',
          'Filtro por Barbeiro: Veja apenas os agendamentos de um barbeiro específico',
          'Filtro por Status: Filtre por confirmados, pendentes, concluídos ou cancelados'
        ]
      },
      {
        subtitle: 'Status dos Agendamentos',
        text: 'Cada agendamento passa por diferentes status durante seu ciclo de vida:',
        list: [
          'Pendente: Agendamento criado, aguardando confirmação ou chegada do cliente',
          'Confirmado: Cliente confirmou presença (via WhatsApp ou pelo site)',
          'Em Atendimento: Cliente chegou e está sendo atendido',
          'Concluído: Atendimento finalizado com sucesso',
          'Cancelado: Cliente ou barbearia cancelou o agendamento',
          'Não Compareceu: Cliente não apareceu no horário marcado'
        ],
        tip: 'Manter os status atualizados é essencial para relatórios precisos e para o funcionamento correto das notificações automáticas.'
      },
      {
        subtitle: 'Criando Agendamentos Manuais',
        text: 'Para criar um agendamento diretamente pelo painel:',
        list: [
          '1. Clique no botão "+ Novo Agendamento" na Agenda',
          '2. Selecione a data e horário desejados',
          '3. Escolha o barbeiro disponível naquele horário',
          '4. Selecione o(s) serviço(s) que será(ão) realizado(s)',
          '5. Preencha nome e telefone do cliente (com DDD)',
          '6. Confirme o agendamento'
        ],
        warning: 'Agendamentos manuais NÃO verificam conflitos automaticamente. Certifique-se de que o horário está realmente livre antes de criar.'
      },
      {
        subtitle: 'Editando e Cancelando',
        text: 'Para modificar um agendamento existente:',
        list: [
          'Clique no agendamento desejado na agenda',
          'Use os botões de ação para editar, remarcar ou cancelar',
          'Ao cancelar, uma mensagem automática é enviada ao cliente (se configurado)',
          'Reagendamentos atualizam o horário mantendo o mesmo protocolo'
        ]
      },
      {
        subtitle: 'Sistema de Protocolos',
        text: 'Cada agendamento recebe um número de protocolo único (ex: GNS-2024-001234). Este protocolo:',
        list: [
          'Identifica o agendamento de forma única no sistema',
          'É enviado ao cliente nas mensagens de confirmação',
          'Pode ser usado para buscar o agendamento rapidamente',
          'Aparece nos relatórios e histórico'
        ]
      }
    ]
  },
  {
    id: 'fila-espera',
    title: 'Fila de Espera',
    icon: Clock,
    content: [
      {
        subtitle: 'Como Funciona a Fila',
        text: 'O sistema de fila de espera permite gerenciar clientes que chegam sem agendamento ou que aguardam atendimento. A fila é organizada por ordem de chegada e tempo estimado.',
        list: [
          'Clientes são adicionados na ordem de chegada',
          'O sistema calcula automaticamente o tempo de espera estimado',
          'Quando chega a vez, o cliente é notificado (se push ativo)',
          'Você pode reorganizar a fila manualmente se necessário'
        ]
      },
      {
        subtitle: 'Adicionando à Fila',
        text: 'Para adicionar um cliente à fila:',
        list: [
          '1. Acesse a tela Fila de Espera',
          '2. Clique em "Adicionar à Fila"',
          '3. Informe nome e telefone do cliente',
          '4. Selecione o serviço desejado e o barbeiro (opcional)',
          '5. O sistema calcula a posição e tempo de espera'
        ]
      },
      {
        subtitle: 'Status na Fila',
        list: [
          'Aguardando: Cliente na fila, esperando ser chamado',
          'A Caminho: Cliente foi notificado e está se dirigindo à barbearia',
          'Sendo Atendido: Cliente já está no atendimento',
          'Desistiu: Cliente saiu da fila sem ser atendido'
        ],
        tip: 'Use o status "A Caminho" para clientes que você chamou pelo WhatsApp e estão vindo. Isso evita chamá-los novamente.'
      },
      {
        subtitle: 'Configurações da Fila',
        text: 'Em Configurações, você pode ajustar:',
        list: [
          'Tamanho máximo da fila (evita superlotação)',
          'Ativar/desativar alertas de sobrecarga',
          'Definir limite de agendamentos por dia',
          'Configurar mensagens automáticas de chamada'
        ]
      }
    ]
  },
  {
    id: 'whatsapp',
    title: 'Integração WhatsApp',
    icon: Send,
    content: [
      {
        subtitle: 'Sobre a Integração',
        text: 'O Genesis integra com o ChatPro para enviar mensagens automáticas via WhatsApp Business. Esta integração permite confirmações de agendamento, lembretes, chamadas da fila e mensagens de agradecimento sem intervenção manual.',
        warning: 'A integração requer uma conta ativa no ChatPro (serviço pago separado). O Genesis não inclui o serviço de WhatsApp, apenas a integração.'
      },
      {
        subtitle: 'Requisitos para Integração',
        text: 'Antes de configurar, você precisa ter:',
        list: [
          'Uma conta ativa no ChatPro (chatpro.com.br)',
          'Um número de WhatsApp Business conectado ao ChatPro',
          'O Instance ID da sua conta ChatPro',
          'O Token de API gerado no painel do ChatPro',
          'Créditos de mensagens disponíveis na sua conta ChatPro'
        ]
      },
      {
        subtitle: 'Como Configurar o ChatPro',
        text: 'Siga estes passos para ativar a integração:',
        list: [
          '1. Acesse Configurações > ChatPro no painel Genesis',
          '2. Cole o Instance ID fornecido pelo ChatPro (formato: sua-instancia)',
          '3. Cole o Token da API (sequência alfanumérica longa)',
          '4. Defina o endpoint base: https://api.chatpro.com.br',
          '5. Clique em "Salvar" e depois em "Testar Conexão"',
          '6. Se aparecer "Conexão OK", está funcionando'
        ],
        warning: 'O número do WhatsApp deve estar conectado e online no ChatPro ANTES de configurar aqui. Verifique no painel do ChatPro se o status está "Conectado".'
      },
      {
        subtitle: 'Templates de Mensagens',
        text: 'Configure os templates em Configurações > Templates. Cada tipo de mensagem tem seu próprio template:',
        list: [
          'Confirmação de Agendamento: Enviada automaticamente quando um cliente agenda. Inclua data, hora, serviço e endereço.',
          'Lembrete: Enviada X horas antes do horário (você configura quantas horas). Lembra o cliente do compromisso.',
          'Chamada da Fila: Enviada quando chega a vez do cliente na fila de espera.',
          'Agradecimento: Enviada após conclusão do atendimento. Boa oportunidade para pedir avaliação.',
          'Cancelamento: Enviada quando um agendamento é cancelado (pela barbearia ou cliente).'
        ]
      },
      {
        subtitle: 'Variáveis nos Templates',
        text: 'Use estas variáveis para personalizar as mensagens. Elas são substituídas automaticamente pelos dados reais:',
        list: [
          '{nome} → Nome do cliente (ex: João Silva)',
          '{data} → Data do agendamento (ex: 15/01/2024)',
          '{hora} → Horário (ex: 14:30)',
          '{servico} → Nome do serviço (ex: Corte + Barba)',
          '{barbeiro} → Nome do barbeiro (ex: Carlos)',
          '{protocolo} → Número do protocolo (ex: GNS-2024-001234)',
          '{barbearia} → Nome da barbearia',
          '{endereco} → Endereço completo',
          '{valor} → Valor total do serviço'
        ],
        tip: 'Exemplo de template: "Olá {nome}! Seu agendamento está confirmado para {data} às {hora} com {barbeiro}. Serviço: {servico}. Te esperamos em {endereco}!"'
      },
      {
        subtitle: 'Proteção Anti-Bloqueio (IMPORTANTE)',
        text: 'O WhatsApp pode bloquear números que enviam muitas mensagens. Para evitar isso, o Genesis tem proteções automáticas:',
        list: [
          'Delay entre mensagens: Mínimo de 10-15 segundos entre cada envio',
          'Limite diário: Máximo de mensagens por dia (comece com 50)',
          'Horários permitidos: Envio apenas em horário comercial (8h-20h)',
          'Warmup progressivo: Para contas novas, o limite aumenta gradualmente ao longo de 30 dias',
          'Pausa automática: A cada X mensagens, o sistema pausa Y segundos',
          'Detecção de erros: Se muitas mensagens falharem, o sistema pausa automaticamente'
        ],
        warning: 'NUNCA desative as proteções anti-bloqueio. Ignorar esses limites pode resultar em bloqueio PERMANENTE do seu número de WhatsApp!'
      },
      {
        subtitle: 'Quando as Mensagens são Enviadas',
        list: [
          'Confirmação: Imediatamente após o cliente criar o agendamento',
          'Lembrete: X horas antes (configurável, padrão: 2 horas)',
          'Chamada: Quando você clica em "Chamar" na fila',
          'Agradecimento: Quando muda o status para "Concluído"',
          'Cancelamento: Quando o agendamento é cancelado'
        ]
      }
    ]
  },
  {
    id: 'templates',
    title: 'Templates de Mensagens',
    icon: FileText,
    content: [
      {
        subtitle: 'O que são Templates',
        text: 'Templates são modelos de mensagens pré-configurados que o sistema usa para enviar comunicações automáticas aos clientes via WhatsApp. Cada tipo de evento tem seu próprio template.'
      },
      {
        subtitle: 'Tipos de Templates Disponíveis',
        list: [
          'appointment_confirmed: Quando um agendamento é confirmado',
          'appointment_reminder: Lembrete antes do horário',
          'appointment_cancelled: Quando um agendamento é cancelado',
          'queue_called: Quando o cliente é chamado da fila',
          'feedback_request: Solicitação de avaliação após atendimento',
          'welcome: Boas-vindas a novos clientes',
          'marketing: Mensagens promocionais e campanhas'
        ]
      },
      {
        subtitle: 'Personalizando Templates',
        text: 'Acesse Configurações > Templates para editar:',
        list: [
          '1. Selecione o template que deseja editar',
          '2. Modifique o texto conforme sua necessidade',
          '3. Use as variáveis disponíveis (ex: {nome}, {data})',
          '4. Opcionalmente, adicione uma imagem ou botão',
          '5. Ative ou desative o template conforme necessário',
          '6. Salve as alterações'
        ]
      },
      {
        subtitle: 'Recursos Avançados dos Templates',
        list: [
          'Imagem: Adicione uma imagem promocional ou logo',
          'Botão: Adicione um botão com link (ex: "Ver Agendamento")',
          'IA: Use inteligência artificial para gerar textos persuasivos',
          'Preview: Visualize como a mensagem ficará antes de salvar'
        ],
        tip: 'Mensagens com imagens e botões têm maior taxa de engajamento, mas use com moderação para não parecer spam.'
      }
    ]
  },
  {
    id: 'api-webhooks',
    title: 'API e Webhooks',
    icon: Webhook,
    content: [
      {
        subtitle: 'O que são Webhooks?',
        text: 'Webhooks são "ganchos" que enviam dados automaticamente para sistemas externos quando eventos acontecem no Genesis. São úteis para integrar com outros softwares, automações ou sistemas próprios.',
        list: [
          'Quando um cliente agenda: Envia os dados do agendamento para outro sistema',
          'Quando um atendimento é concluído: Dispara ação em um CRM ou ERP',
          'Quando há cancelamento: Atualiza uma planilha ou dashboard externo'
        ]
      },
      {
        subtitle: 'Eventos Disponíveis',
        text: 'Você pode configurar webhooks para os seguintes eventos:',
        list: [
          'appointment_created: Novo agendamento foi criado',
          'appointment_confirmed: Agendamento foi confirmado',
          'appointment_cancelled: Agendamento foi cancelado',
          'appointment_completed: Atendimento foi concluído',
          'appointment_noshow: Cliente não compareceu',
          'queue_added: Cliente adicionado à fila',
          'queue_called: Cliente foi chamado da fila'
        ]
      },
      {
        subtitle: 'Como Configurar',
        text: 'Para configurar um webhook:',
        list: [
          '1. Acesse Configurações > API',
          '2. Encontre o evento desejado na lista',
          '3. Cole a URL do webhook (endpoint do sistema destino)',
          '4. Ative o toggle para habilitar',
          '5. Clique em "Testar" para verificar se funciona',
          '6. Verifique se o sistema destino recebeu os dados de teste'
        ]
      },
      {
        subtitle: 'Formato dos Dados',
        text: 'Os webhooks enviam dados em formato JSON via POST. Exemplo de dados enviados:',
        list: [
          'event: Tipo do evento (ex: appointment_created)',
          'timestamp: Data/hora do evento',
          'data: Objeto com todos os dados relevantes (cliente, serviço, barbeiro, etc.)'
        ],
        tip: 'Use o Zapier ou Make.com para conectar o Genesis com centenas de outros aplicativos sem programação.'
      },
      {
        subtitle: 'Segurança dos Webhooks',
        text: 'Para garantir que os dados sejam seguros:',
        list: [
          'Use sempre URLs HTTPS (com SSL)',
          'Valide os dados recebidos no sistema destino',
          'Mantenha as URLs de webhook privadas',
          'Revise periodicamente quais webhooks estão ativos'
        ]
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Campanhas de Marketing',
    icon: Megaphone,
    content: [
      {
        subtitle: 'Sobre Marketing em Massa',
        text: 'O módulo de Marketing permite enviar mensagens promocionais para sua base de clientes via WhatsApp. Use para divulgar promoções, novos serviços ou reconquistar clientes inativos.',
        warning: 'Marketing em massa tem regras rígidas. Enviar spam pode resultar em bloqueio do WhatsApp e reclamações dos clientes. Use com responsabilidade.'
      },
      {
        subtitle: 'Criando uma Campanha',
        text: 'Para criar uma nova campanha de marketing:',
        list: [
          '1. Acesse a aba Marketing no menu lateral',
          '2. Clique em "Nova Campanha"',
          '3. Dê um nome identificador para a campanha',
          '4. Importe sua lista de contatos (ver opções abaixo)',
          '5. Escreva a mensagem ou use IA para gerar',
          '6. Opcionalmente, adicione imagem e botão de ação',
          '7. Agende para envio futuro ou inicie imediatamente'
        ]
      },
      {
        subtitle: 'Importando Contatos',
        text: 'Você pode importar contatos de várias formas:',
        list: [
          'Da base de clientes: Selecione clientes que já agendaram (recomendado)',
          'Por arquivo CSV: Importe planilha com colunas "nome" e "telefone"',
          'Manual: Digite os números um por um',
          'Filtros inteligentes: Clientes inativos há X dias, clientes frequentes, etc.'
        ],
        tip: 'Campanhas para clientes que já conhecem sua barbearia têm taxas de bloqueio muito menores.'
      },
      {
        subtitle: 'Usando IA para Criar Mensagens',
        text: 'O Genesis pode gerar mensagens persuasivas usando inteligência artificial:',
        list: [
          'Clique no botão "Gerar com IA" ao criar a campanha',
          'Descreva o objetivo: "promoção de corte masculino 30% off"',
          'A IA vai sugerir um texto otimizado',
          'Revise e ajuste conforme necessário antes de enviar'
        ]
      },
      {
        subtitle: 'Limites e Segurança',
        text: 'Configurações importantes em Marketing > Configurações:',
        list: [
          'Limite diário: Máximo de mensagens de marketing por dia (recomendado: 50-100)',
          'Delay mínimo/máximo: Tempo aleatório entre envios (10-30 segundos)',
          'Horário permitido: Janela de envio (ex: 9h às 19h)',
          'Pausa automática: A cada 10-20 mensagens, pausa de 2-5 minutos',
          'Warmup: Para números novos, limite começa baixo e aumenta gradualmente'
        ],
        warning: 'Ultrapassar os limites de segurança pode bloquear seu número permanentemente!'
      },
      {
        subtitle: 'Acompanhando Resultados',
        text: 'Após o envio, monitore os resultados:',
        list: [
          'Taxa de entrega: Porcentagem de mensagens que chegaram',
          'Erros: Números inválidos ou bloqueados',
          'Status individual: Veja o status de cada contato'
        ]
      }
    ]
  },
  {
    id: 'seguranca',
    title: 'Segurança do Sistema',
    icon: Shield,
    content: [
      {
        subtitle: 'Níveis de Acesso',
        text: 'O Genesis possui três perfis de usuário com permissões diferentes:',
        list: [
          'Super Admin: Acesso total ao sistema. Pode criar/remover outros usuários, ver logs de auditoria, alterar configurações críticas e acessar dados financeiros. Deve ser apenas o proprietário.',
          'Admin: Acesso administrativo amplo. Gerencia agendamentos, barbeiros, serviços e configurações gerais. Não pode criar/remover usuários nem ver logs sensíveis.',
          'Barbeiro: Acesso restrito. Vê apenas sua própria agenda, seus clientes e suas estatísticas. Não acessa configurações nem dados de outros barbeiros.'
        ],
        warning: 'NUNCA compartilhe credenciais de Super Admin. Crie contas Admin para gerentes e contas Barbeiro para a equipe.'
      },
      {
        subtitle: 'Configurações de Segurança',
        text: 'Em Configurações > Segurança você encontra ajustes importantes:',
        list: [
          'Timeout de Sessão: Tempo de inatividade até deslogar automaticamente (padrão: 30 minutos). Recomendado manter baixo para segurança.',
          'Limite de Tentativas de Login: Após X tentativas erradas, a conta é bloqueada temporariamente (padrão: 5 tentativas).',
          'Lista de IPs Permitidos: Restringe acesso apenas a IPs específicos. Útil se você sempre acessa do mesmo local.',
          'Autenticação em Dois Fatores: Camada extra de segurança ao fazer login (em desenvolvimento).'
        ]
      },
      {
        subtitle: 'Logs de Auditoria',
        text: 'O sistema registra automaticamente todas as ações importantes:',
        list: [
          'Logins: Data, hora, IP e sucesso/falha de cada tentativa',
          'Criações: Quando e quem criou agendamentos, serviços, barbeiros',
          'Edições: Alterações em dados, com valores antes/depois',
          'Exclusões: O que foi excluído e por quem',
          'Configurações: Mudanças em configurações do sistema'
        ],
        tip: 'Revise os logs periodicamente. Tentativas de login suspeitas ou ações incomuns podem indicar problemas de segurança.'
      },
      {
        subtitle: 'Boas Práticas de Segurança',
        list: [
          'Use senhas fortes (mínimo 8 caracteres, letras, números e símbolos)',
          'Não compartilhe senhas entre funcionários',
          'Desative usuários quando funcionários saírem',
          'Revise os logs regularmente',
          'Mantenha o timeout de sessão ativo',
          'Evite acessar de redes Wi-Fi públicas'
        ]
      }
    ]
  },
  {
    id: 'usuarios',
    title: 'Gestão de Usuários',
    icon: Users,
    content: [
      {
        subtitle: 'Criando Novos Usuários',
        text: 'Apenas Super Admins podem criar novos usuários. Para adicionar:',
        list: [
          '1. Acesse Usuários no menu lateral (apenas Super Admin vê esta opção)',
          '2. Clique em "Novo Usuário"',
          '3. Preencha o email (será usado para login)',
          '4. Defina um nome para identificação',
          '5. Crie uma senha temporária (peça para trocar no primeiro acesso)',
          '6. Selecione o nível de acesso (Admin ou Barbeiro)',
          '7. Opcionalmente, defina uma data de expiração'
        ]
      },
      {
        subtitle: 'Data de Expiração',
        text: 'A data de expiração é útil para acessos temporários:',
        list: [
          'Barbeiros em período de experiência: defina para 30-90 dias',
          'Consultores externos: defina para o período do projeto',
          'Demonstrações: defina para alguns dias',
          'Funcionários temporários: defina para o período do contrato'
        ],
        tip: 'Após a data de expiração, o usuário não consegue mais fazer login, mas os dados e histórico são preservados.'
      },
      {
        subtitle: 'Vinculando Barbeiro a Usuário',
        text: 'Para que um barbeiro acesse apenas sua própria agenda:',
        list: [
          '1. Primeiro cadastre o barbeiro na aba Barbeiros',
          '2. Depois crie um usuário com nível "Barbeiro"',
          '3. Vincule o usuário ao cadastro do barbeiro'
        ]
      },
      {
        subtitle: 'Desativando vs Excluindo',
        text: 'Há duas formas de remover acesso de um usuário:',
        list: [
          'Desativar: O usuário perde acesso imediatamente, mas todos os dados e histórico são preservados. Pode ser reativado depois. USE ESTA OPÇÃO.',
          'Excluir: Remove o usuário permanentemente. Histórico pode ficar inconsistente. EVITE USAR.'
        ],
        warning: 'Sempre desative (não exclua) funcionários que saíram. Isso mantém o histórico de atendimentos e logs de auditoria íntegros.'
      }
    ]
  },
  {
    id: 'notificacoes',
    title: 'Notificações Push',
    icon: Bell,
    content: [
      {
        subtitle: 'O que são Notificações Push?',
        text: 'Notificações Push são alertas que aparecem no navegador ou celular, mesmo quando você não está com o Genesis aberto. São ideais para receber avisos de novos agendamentos e eventos importantes em tempo real.'
      },
      {
        subtitle: 'Ativando as Notificações',
        text: 'Para começar a receber notificações:',
        list: [
          '1. Clique no ícone de sino (🔔) no canto superior do painel',
          '2. Quando o navegador perguntar, clique em "Permitir"',
          '3. Você verá uma confirmação de que as notificações estão ativas',
          '4. Em celulares, instale o app (ver seção PWA) para melhor funcionamento'
        ],
        warning: 'Se você bloqueou as notificações anteriormente, precisará desbloquear nas configurações do navegador/celular.'
      },
      {
        subtitle: 'Tipos de Alertas',
        text: 'Você receberá notificações para:',
        list: [
          'Novo agendamento: Quando um cliente agenda pelo site',
          'Cliente na fila: Quando alguém entra na fila de espera',
          'Alerta de sobrecarga: Quando há muitos agendamentos ou fila grande',
          'Login suspeito: Tentativas de login falhadas na sua conta'
        ]
      },
      {
        subtitle: 'Notificações não Funcionam?',
        text: 'Verifique os seguintes pontos:',
        list: [
          'Navegador: Verifique se as notificações estão permitidas (clique no cadeado ao lado da URL)',
          'Celular Android: Verifique as permissões do navegador nas configurações do telefone',
          'Celular iPhone: Notificações só funcionam se o app estiver instalado (PWA)',
          'Modo "Não Perturbe": Desative no celular ou computador',
          'Bloqueador de anúncios: Alguns podem bloquear notificações push'
        ],
        tip: 'Para melhor experiência em celulares, instale o Genesis como app (ver seção "Instalando no Celular").'
      }
    ]
  },
  {
    id: 'pwa',
    title: 'Instalando no Celular',
    icon: Smartphone,
    content: [
      {
        subtitle: 'Por que Instalar como App?',
        text: 'O Genesis pode ser instalado como um aplicativo no celular, oferecendo várias vantagens:',
        list: [
          'Ícone na tela inicial para acesso rápido',
          'Abre em tela cheia, como um app nativo',
          'Notificações push funcionando corretamente',
          'Funciona mesmo com internet lenta ou instável',
          'Não precisa abrir o navegador'
        ]
      },
      {
        subtitle: 'Instalando no Android (Chrome)',
        text: 'Siga estes passos no seu celular Android:',
        list: [
          '1. Abra o Chrome e acesse o painel do Genesis',
          '2. Faça login normalmente',
          '3. Toque nos 3 pontinhos (⋮) no canto superior direito',
          '4. Procure e toque em "Adicionar à tela inicial" ou "Instalar app"',
          '5. Confirme o nome do app (pode manter o padrão)',
          '6. Toque em "Adicionar" ou "Instalar"',
          '7. O ícone aparecerá na sua tela inicial'
        ]
      },
      {
        subtitle: 'Instalando no iPhone (Safari)',
        text: 'No iPhone, você PRECISA usar o Safari:',
        list: [
          '1. Abra o Safari (não funciona no Chrome)',
          '2. Acesse o painel do Genesis e faça login',
          '3. Toque no ícone de compartilhar (quadrado com seta para cima)',
          '4. Role as opções e toque em "Adicionar à Tela de Início"',
          '5. Confirme o nome do app',
          '6. Toque em "Adicionar"',
          '7. O ícone aparecerá na tela inicial'
        ],
        warning: 'No iPhone, OBRIGATÓRIO usar Safari. O Chrome no iOS não suporta instalação de apps web.'
      },
      {
        subtitle: 'Após Instalar',
        text: 'Depois de instalado:',
        list: [
          'Sempre acesse pelo ícone do app (não pelo navegador)',
          'O app abrirá em tela cheia',
          'Habilite as notificações push para receber alertas',
          'O login ficará salvo para acesso rápido'
        ]
      }
    ]
  },
  {
    id: 'backup',
    title: 'Backup e Restauração',
    icon: Key,
    content: [
      {
        subtitle: 'Importância do Backup',
        text: 'Backups protegem seus dados contra perdas acidentais, erros de configuração ou problemas técnicos. O Genesis permite exportar e importar todas as configurações e dados do sistema.'
      },
      {
        subtitle: 'Exportando Dados',
        text: 'Em Configurações > Backup você pode exportar:',
        list: [
          'Configurações completas: Todas as configurações do sistema em um arquivo JSON',
          'Lista de clientes: Todos os clientes cadastrados com telefones',
          'Histórico de agendamentos: Todos os agendamentos com datas e status',
          'Serviços e preços: Lista completa de serviços cadastrados',
          'Dados de barbeiros: Informações da equipe'
        ]
      },
      {
        subtitle: 'Como Exportar',
        list: [
          '1. Acesse Configurações > Backup',
          '2. Selecione o que deseja exportar',
          '3. Clique em "Exportar"',
          '4. Um arquivo será baixado para seu computador',
          '5. Guarde este arquivo em local seguro (nuvem, HD externo, etc.)'
        ],
        tip: 'Faça backup regularmente, especialmente antes de fazer grandes alterações nas configurações.'
      },
      {
        subtitle: 'Importando/Restaurando',
        text: 'Para restaurar um backup ou importar dados:',
        list: [
          '1. Acesse Configurações > Backup',
          '2. Clique em "Importar"',
          '3. Selecione o arquivo de backup',
          '4. Confirme a importação',
          '5. Aguarde o processamento'
        ],
        warning: 'Importar configurações SOBRESCREVE as atuais! Faça um backup do estado atual antes de restaurar um backup antigo.'
      }
    ]
  },
  {
    id: 'problemas',
    title: 'Problemas Comuns',
    icon: HelpCircle,
    content: [
      {
        subtitle: 'Agendamento não aparece na agenda',
        text: 'Se um agendamento foi criado mas não aparece:',
        list: [
          'Verifique se há filtros ativos (data, barbeiro, status) e limpe-os',
          'Confirme que a data selecionada está correta',
          'Verifique se o barbeiro selecionado é o correto',
          'Busque pelo protocolo do agendamento',
          'Verifique se o agendamento não foi cancelado'
        ]
      },
      {
        subtitle: 'Horários não aparecem para agendamento',
        text: 'Se clientes reclamam que não há horários disponíveis:',
        list: [
          'Verifique se os horários de funcionamento estão configurados',
          'Confirme que o barbeiro está ativo e disponível',
          'Verifique se o barbeiro não está de folga no dia',
          'Confirme que os horários individuais do barbeiro estão configurados',
          'Verifique se não há bloqueios de horário configurados'
        ]
      },
      {
        subtitle: 'WhatsApp não envia mensagens',
        text: 'Se as mensagens automáticas não estão funcionando:',
        list: [
          'Verifique se o ChatPro está configurado (Instance ID e Token)',
          'Confirme que o número está conectado no ChatPro',
          'Teste a conexão em Configurações > ChatPro',
          'Verifique se o template de mensagem está ativo',
          'Confirme que o número do cliente está correto (com DDD)',
          'Verifique se o limite diário não foi atingido',
          'Confirme que está dentro do horário permitido de envio'
        ]
      },
      {
        subtitle: 'Não recebo notificações',
        text: 'Se as notificações push não chegam:',
        list: [
          'Clique no sino para verificar se está inscrito',
          'Verifique as permissões do navegador',
          'Desative o modo "Não Perturbe" no celular/computador',
          'Desative bloqueadores de anúncios',
          'Em celulares, instale o app como PWA',
          'No iPhone, use apenas o Safari'
        ]
      },
      {
        subtitle: 'Sistema está lento',
        text: 'Se o Genesis está carregando devagar:',
        list: [
          'Limpe o cache do navegador (Ctrl+Shift+Delete)',
          'Feche outras abas do navegador',
          'Verifique sua conexão com a internet',
          'Tente usar outro navegador (Chrome recomendado)',
          'Evite usar durante horários de pico de internet',
          'Reinicie o navegador ou o computador'
        ]
      },
      {
        subtitle: 'Não consigo fazer login',
        text: 'Se não consegue acessar sua conta:',
        list: [
          'Verifique se email e senha estão corretos',
          'Tente redefinir a senha pelo link "Esqueci minha senha"',
          'Confirme que sua conta não expirou',
          'Verifique se sua conta não está desativada',
          'Após 5 tentativas erradas, aguarde 15 minutos',
          'Entre em contato com o Super Admin para verificar sua conta'
        ]
      }
    ]
  },
  {
    id: 'politicas',
    title: 'Políticas e Valores',
    icon: DollarSign,
    content: [
      {
        subtitle: 'Sobre o Sistema Genesis',
        text: 'O Genesis é um sistema de gestão para barbearias desenvolvido sob medida. Este documento esclarece as políticas de uso, reembolso e serviços adicionais.'
      },
      {
        subtitle: 'Política de Reembolso',
        text: 'Condições para solicitação de reembolso do sistema:',
        list: [
          'Período de teste: 7 dias após a ativação para solicitar reembolso integral',
          'Falhas comprovadas: Se o sistema apresentar bugs graves não solucionados em 72h úteis',
          'Reembolso parcial: Proporcional ao período não utilizado em cancelamentos antecipados',
          'Período mínimo: Após o período de teste, há carência de 30 dias para cancelamento',
          'Aviso prévio: Cancelamentos devem ser solicitados com 15 dias de antecedência'
        ],
        warning: 'Reembolsos NÃO se aplicam a: serviços já utilizados, personalizações entregues, integrações configuradas ou após o período de teste.'
      },
      {
        subtitle: 'O que ESTÁ Incluso no Plano',
        text: 'Serviços incluídos na mensalidade/licença:',
        list: [
          'Correções de bugs e falhas do sistema',
          'Atualizações de segurança',
          'Melhorias de performance',
          'Novas funcionalidades do roadmap padrão',
          'Suporte técnico durante horário comercial',
          'Backups automáticos dos dados',
          'Armazenamento na nuvem'
        ]
      },
      {
        subtitle: 'O que NÃO Está Incluso',
        text: 'Serviços que geram cobrança adicional:',
        list: [
          'Desenvolvimento de funcionalidades exclusivas',
          'Integrações com sistemas/APIs externos',
          'Migração de dados de sistemas anteriores',
          'Treinamentos presenciais ou extensos',
          'Consultoria de negócios, marketing ou processos',
          'Suporte fora do horário comercial (emergencial)',
          'Recuperação de dados por erro do usuário'
        ],
        warning: 'Funcionalidades solicitadas sem orçamento prévio aprovado não serão desenvolvidas.'
      }
    ]
  },
  {
    id: 'suporte',
    title: 'Suporte Técnico',
    icon: MessageSquare,
    content: [
      {
        subtitle: 'Canais de Atendimento',
        text: 'Entre em contato com o suporte técnico através dos seguintes canais:',
        list: [
          'WhatsApp Suporte: Resposta em até 2 horas em horário comercial',
          'Email de Suporte: Resposta em até 24 horas úteis',
          'Chamados pelo Sistema: Acompanhe o status em tempo real (em desenvolvimento)'
        ]
      },
      {
        subtitle: 'Horário de Atendimento',
        text: 'O suporte técnico funciona nos seguintes horários:',
        list: [
          'Segunda a Sexta-feira: 9h às 18h',
          'Sábados: 9h às 13h',
          'Domingos e Feriados: Apenas emergências críticas (sistema totalmente fora do ar)'
        ]
      },
      {
        subtitle: 'Níveis de Prioridade',
        text: 'Os chamados são classificados por prioridade:',
        list: [
          'Crítico: Sistema totalmente fora do ar. Atendimento imediato.',
          'Alto: Funcionalidade principal não funciona. Atendimento em até 4h.',
          'Médio: Funcionalidade secundária com problema. Atendimento em até 24h.',
          'Baixo: Dúvidas, sugestões, melhorias. Atendimento em até 48h.'
        ]
      },
      {
        subtitle: 'Antes de Abrir um Chamado',
        text: 'Para agilizar o atendimento, verifique primeiro:',
        list: [
          'Atualize a página (F5) e veja se o problema persiste',
          'Teste em outro navegador (Chrome recomendado)',
          'Verifique se sua internet está funcionando',
          'Consulte esta documentação para a seção relacionada ao problema',
          'Verifique se outros usuários reportam o mesmo problema',
          'Limpe o cache do navegador e tente novamente'
        ]
      },
      {
        subtitle: 'Informações para o Suporte',
        text: 'Ao abrir um chamado, inclua obrigatoriamente:',
        list: [
          'Descrição detalhada: O que aconteceu? O que você esperava que acontecesse?',
          'Passos para reproduzir: Como chegar ao erro, passo a passo',
          'Navegador e dispositivo: Chrome/Firefox/Safari? Computador ou celular?',
          'Capturas de tela: Print da tela mostrando o erro (se possível)',
          'Mensagem de erro: Copie qualquer mensagem de erro que aparecer',
          'Horário do problema: Quando o problema ocorreu pela primeira vez?'
        ],
        tip: 'Quanto mais detalhes você fornecer, mais rápido conseguiremos identificar e resolver o problema!'
      }
    ]
  }
];

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('boas-vindas');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSections = searchQuery
    ? documentationSections.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.some(c => 
          c.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.list?.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      )
    : documentationSections;

  const currentSection = documentationSections.find(s => s.id === activeSection);
  const currentIndex = documentationSections.findIndex(s => s.id === activeSection);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setActiveSection(documentationSections[currentIndex - 1].id);
    }
  };

  const goToNext = () => {
    if (currentIndex < documentationSections.length - 1) {
      setActiveSection(documentationSections[currentIndex + 1].id);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header fixo */}
      <header className="flex-shrink-0 h-16 border-b border-border bg-card z-50">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botão menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Genesis Docs</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Central de Documentação</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Site</span>
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Acessar Painel</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Container principal - ocupa resto da altura */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay mobile */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar FIXA - não rola */}
        <aside className={`
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          fixed lg:static
          inset-y-0 left-0 top-16 lg:top-0
          z-40 lg:z-auto
          w-72 lg:w-64 xl:w-72
          flex-shrink-0
          flex flex-col
          border-r border-border 
          bg-card
          transition-transform duration-200 ease-in-out
          h-[calc(100vh-64px)] lg:h-full
        `}>
          {/* Busca - fixa no topo da sidebar */}
          <div className="flex-shrink-0 p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 h-10 bg-secondary/50"
              />
            </div>
          </div>

          {/* Lista de seções - COM SCROLL PRÓPRIO */}
          <ScrollArea className="flex-1">
            <nav className="p-2">
              <ul className="space-y-1">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          setActiveSection(section.id);
                          setSearchQuery('');
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                          ${isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">{section.title}</span>
                        {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </ScrollArea>

          {/* Rodapé sidebar - fixo */}
          <div className="flex-shrink-0 p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Genesis Documentation v2.0
            </p>
          </div>
        </aside>

        {/* Conteúdo principal - ESTA ÁREA TEM SCROLL */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header da seção atual - fixo */}
          <div className="flex-shrink-0 px-4 lg:px-8 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 max-w-4xl">
              {currentSection && (() => {
                const Icon = currentSection.icon;
                return (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                );
              })()}
              <div className="min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-foreground truncate">
                  {currentSection?.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentIndex + 1} de {documentationSections.length} seções
                </p>
              </div>
            </div>
          </div>

          {/* Área de conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 lg:px-8 py-6 lg:py-8">
              <div className="max-w-4xl mx-auto">
                {currentSection && (
                  <div className="space-y-8">
                    {currentSection.content.map((content, idx) => (
                      <article key={idx} className="space-y-4">
                        {content.subtitle && (
                          <h3 className="text-lg font-semibold text-foreground border-l-4 border-primary pl-4 py-1">
                            {content.subtitle}
                          </h3>
                        )}

                        {content.text && (
                          <p className="text-muted-foreground leading-relaxed pl-5">
                            {content.text}
                          </p>
                        )}

                        {content.list && (
                          <ul className="space-y-2 pl-5">
                            {content.list.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {content.warning && (
                          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl ml-5">
                            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive leading-relaxed">
                              <strong>Atenção:</strong> {content.warning}
                            </p>
                          </div>
                        )}

                        {content.tip && (
                          <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl ml-5">
                            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-primary leading-relaxed">
                              <strong>Dica:</strong> {content.tip}
                            </p>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                {/* Espaçador para evitar que conteúdo fique atrás da navegação */}
                <div className="h-8" />
              </div>
            </div>
          </div>

          {/* Navegação entre seções - fixa no rodapé */}
          <div className="flex-shrink-0 px-4 lg:px-8 py-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              <div className="flex items-center gap-1.5">
                {documentationSections.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSection(documentationSections[idx].id)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Ir para seção ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex === documentationSections.length - 1}
                className="gap-2"
              >
                <span className="hidden sm:inline">Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
