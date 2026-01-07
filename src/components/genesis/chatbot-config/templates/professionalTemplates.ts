// Templates Profissionais Completos por Nicho - V2 FINAL
import { FlowConfig, ChatbotFormState } from '../types';

export interface ProfessionalTemplate {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string;
  color: string;
  description: string;
  keywords: string[];
  isFeatured: boolean;
  form: Partial<ChatbotFormState>;
  flowConfig: FlowConfig;
}

// ===================== 1. CLÍNICA MÉDICA =====================
const clinicaTemplate: ProfessionalTemplate = {
  id: 'clinica-medica',
  name: 'Clínica Médica',
  slug: 'clinica-medica',
  category: 'saude',
  icon: '🏥',
  color: 'from-red-500 to-rose-600',
  description: 'Atendimento completo para clínicas, consultórios e hospitais',
  keywords: ['consulta', 'médico', 'agendar', 'exame', 'doutor', 'saúde', 'clínica', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Clínica',
    company_name: 'Clínica São Lucas',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️ Bem-vindo(a) à *{{empresa}}*\n\nSomos especializados em cuidar da sua saúde com carinho e profissionalismo.\n\n🏥 Como posso ajudar você hoje?',
    afternoon_greeting: 'Boa tarde! 🌤️ Bem-vindo(a) à *{{empresa}}*\n\nEstamos aqui para cuidar de você!\n\n🏥 Como posso ajudar?',
    evening_greeting: 'Boa noite! 🌙 Bem-vindo(a) à *{{empresa}}*\n\nMesmo fora do horário, deixe sua mensagem que retornamos amanhã!\n\n🚨 Emergências: 192 (SAMU)',
    menu_title: '🏥 Menu Principal',
    menu_description: 'Escolha uma opção digitando o número:',
    menu_options: [
      { id: '1', text: '📅 Agendar consulta', description: 'Marque sua consulta com especialista', action: 'message', next_step_id: 'agendar', response_message: '📅 *Agendamento de Consulta*\n\n🩺 *Especialidades disponíveis:*\n• Clínico Geral\n• Cardiologia\n• Ortopedia\n• Pediatria\n• Ginecologia\n• Dermatologia\n• Neurologia\n\nPor favor, informe:\n1️⃣ Especialidade desejada\n2️⃣ Data de preferência\n3️⃣ Turno (manhã/tarde)\n4️⃣ Convênio ou Particular\n\n✨ Nossa equipe confirmará em breve!', collect_data: true, data_type: 'custom', data_variable: 'dados_agendamento' },
      { id: '2', text: '🔄 Remarcar/Cancelar', description: 'Altere seu agendamento', action: 'message', next_step_id: 'remarcar', response_message: '🔄 *Remarcar ou Cancelar*\n\nInforme:\n• Seu nome completo\n• CPF\n• Data da consulta atual\n• Nova data desejada (ou escreva CANCELAR)\n\n⚠️ Cancelamentos devem ser feitos com 24h de antecedência para evitar taxa.\n\n📋 Aguarde confirmação!', collect_data: true, data_type: 'name', data_variable: 'nome_paciente' },
      { id: '3', text: '📋 Resultados de exames', description: 'Consulte seus resultados', action: 'message', next_step_id: 'resultados', response_message: '📋 *Resultados de Exames*\n\n🔐 Para sua segurança, informe:\n• Nome completo\n• CPF\n• Data de nascimento\n\n💻 Ou acesse: www.clinica.com.br/resultados\n\n⏰ Resultados disponíveis em até 48h após coleta.', collect_data: true, data_type: 'cpf', data_variable: 'cpf_paciente' },
      { id: '4', text: '💊 Receitas e atestados', description: 'Solicite documentos médicos', action: 'message', next_step_id: 'documentos', response_message: '💊 *Receitas e Atestados*\n\nPara solicitar:\n📱 Envie foto do documento anterior (se renovação)\n📝 Informe o medicamento ou motivo\n\n⚠️ *Importante:*\n• Renovações apenas para pacientes com consulta nos últimos 6 meses\n• Prazo: até 48h úteis\n• Receitas controladas exigem consulta presencial\n\n👨‍⚕️ Aguarde confirmação do médico.', collect_data: false },
      { id: '5', text: '👨‍⚕️ Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: 'transfer', response_message: '👨‍⚕️ *Transferindo...*\n\nUm de nossos atendentes irá te ajudar em instantes!\n\n⏰ *Horário de atendimento:*\nSeg-Sex: 7h às 19h\nSábado: 7h às 12h\n\n🚨 Emergências: 192 (SAMU)', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🤔 Não entendi sua resposta.\n\nPor favor, digite apenas o *número* da opção desejada:\n\n1️⃣ Agendar consulta\n2️⃣ Remarcar/Cancelar\n3️⃣ Resultados de exames\n4️⃣ Receitas e atestados\n5️⃣ Falar com atendente',
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é a assistente virtual da clínica médica {{empresa}}.

PERSONALIDADE:
- Empática e acolhedora
- Profissional e objetiva
- Transmite confiança e cuidado

SEU PAPEL:
- Ajudar pacientes com agendamentos e dúvidas
- Coletar informações necessárias (nome, especialidade, data, convênio)
- Orientar sobre procedimentos
- Direcionar para atendente quando necessário

INFORMAÇÕES DA CLÍNICA:
- Especialidades: Clínico Geral, Cardiologia, Ortopedia, Pediatria, Ginecologia, Dermatologia, Neurologia
- Horário: Segunda a Sexta 7h-19h, Sábado 7h-12h
- Convênios: Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro, Particular
- Endereço: {{endereco}}
- Telefone: {{telefone}}

REGRAS IMPORTANTES:
- NUNCA invente horários disponíveis ou faça agendamentos
- NUNCA dê diagnósticos ou orientações médicas
- Para EMERGÊNCIAS, direcione para 192 (SAMU) ou 193 (Bombeiros)
- Sempre confirme informações com o paciente antes de finalizar
- Seja gentil com pacientes ansiosos ou preocupados`,
    ai_temperature: 0.5,
    ai_rules: ['Nunca invente horários disponíveis', 'Nunca dê diagnósticos', 'Seja empática com pacientes', 'Colete nome e CPF antes de verificar dados', 'Direcione emergências para 192 (SAMU)'],
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { 
        id: 'main_menu', 
        type: 'menu', 
        message: '🏥 *Menu Principal*\n\nEscolha uma opção:', 
        options: [
          { id: '1', text: '📅 Agendar consulta', next: 'agendar' },
          { id: '2', text: '🔄 Remarcar/Cancelar', next: 'remarcar' },
          { id: '3', text: '📋 Resultados de exames', next: 'resultados' },
          { id: '4', text: '💊 Receitas e atestados', next: 'documentos' },
          { id: '5', text: '👨‍⚕️ Falar com atendente', next: 'transfer' },
        ]
      },
      agendar: { id: 'agendar', type: 'input', message: '📅 *Agendamento de Consulta*\n\nInforme a especialidade, data e turno desejados.', input_type: 'custom', input_variable: 'dados_agendamento', next: 'confirm_agendar' },
      confirm_agendar: { id: 'confirm_agendar', type: 'text', message: '✅ Recebemos sua solicitação!\n\nNossa equipe entrará em contato para confirmar seu agendamento.\n\n💙 Obrigado por escolher a {{empresa}}!', next: 'transfer' },
      remarcar: { id: 'remarcar', type: 'input', message: '🔄 *Remarcação*\n\nInforme seu nome e CPF:', input_type: 'name', input_variable: 'nome_paciente', next: 'transfer' },
      resultados: { id: 'resultados', type: 'input', message: '📋 Informe seu CPF:', input_type: 'cpf', input_variable: 'cpf_paciente', next: 'transfer' },
      documentos: { id: 'documentos', type: 'text', message: '💊 Envie os detalhes da solicitação. Prazo: até 48h úteis.', next: 'transfer' },
      transfer: { id: 'transfer', type: 'transfer', message: '👨‍⚕️ Transferindo para atendente humano...\n\nAguarde um momento!', transfer_message: 'Seu atendimento será continuado por nossa equipe.' },
      end: { id: 'end', type: 'end', message: '✅ Obrigado por entrar em contato com a {{empresa}}!\n\n💙 Cuide-se bem! Volte sempre.' },
    },
    greetings: { 
      morning: 'Bom dia! ☀️ Bem-vindo(a) à *{{empresa}}*', 
      afternoon: 'Boa tarde! 🌤️ Bem-vindo(a) à *{{empresa}}*', 
      evening: 'Boa noite! 🌙 A *{{empresa}}* agradece seu contato' 
    },
  },
};

// ===================== 2. BARBEARIA =====================
const barbeariaTemplate: ProfessionalTemplate = {
  id: 'barbearia',
  name: 'Barbearia',
  slug: 'barbearia',
  category: 'beleza',
  icon: '💈',
  color: 'from-amber-500 to-orange-600',
  description: 'Atendimento moderno para barbearias com agendamento e preços',
  keywords: ['corte', 'barba', 'cabelo', 'agendar', 'barbearia', 'barbeiro', 'oi', 'olá', 'degradê'],
  isFeatured: true,
  form: {
    name: 'Atendimento Barbearia',
    company_name: 'Barbearia Premium',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'E aí, parceiro! ☀️💈\n\nBem-vindo à *{{empresa}}*!\n\nBora dar um trato nesse visual?',
    afternoon_greeting: 'Fala, mestre! 🔥💈\n\nBem-vindo à *{{empresa}}*!\n\nChegou a hora de ficar estiloso!',
    evening_greeting: 'Boa noite, parceiro! 🌙💈\n\nA *{{empresa}}* tá fechada agora, mas deixa tua mensagem que amanhã a gente resolve!\n\n📅 Horário: Seg-Sex 9h-20h | Sáb 9h-18h',
    menu_title: '💈 Menu da Barbearia',
    menu_description: 'Escolhe aí:',
    menu_options: [
      { id: '1', text: '✂️ Agendar horário', description: 'Marque seu corte', action: 'message', next_step_id: '', response_message: '✂️ *Agendar Horário*\n\n🔥 *Nossos Serviços:*\n\n1️⃣ Corte masculino - R$ 45\n2️⃣ Barba completa - R$ 30\n3️⃣ Corte + Barba - R$ 65\n4️⃣ Sobrancelha - R$ 15\n5️⃣ Pigmentação - R$ 80\n6️⃣ Hidratação - R$ 40\n7️⃣ Corte infantil - R$ 35\n\nMe diz:\n• Qual serviço?\n• Data e horário?\n• Prefere algum barbeiro?\n\n📅 Agenda aí, parceiro!', collect_data: false },
      { id: '2', text: '💰 Ver preços', description: 'Tabela completa', action: 'message', next_step_id: '', response_message: '💰 *Tabela de Preços*\n\n✂️ Corte Masculino - R$ 45\n✂️ Corte Degradê - R$ 50\n🧔 Barba Completa - R$ 30\n🧔 Barba Navalhada - R$ 35\n✂️🧔 Corte + Barba - R$ 65\n👁️ Sobrancelha - R$ 15\n🎨 Pigmentação - R$ 80\n💆 Hidratação - R$ 40\n👶 Corte Infantil (até 10 anos) - R$ 35\n💎 Platinado - R$ 120\n\n💳 *Aceitamos:*\nPix • Cartão • Dinheiro\n\n🎁 Na 10ª visita, corte GRÁTIS!', collect_data: false },
      { id: '3', text: '👨‍🦱 Escolher barbeiro', description: 'Conheça a equipe', action: 'message', next_step_id: '', response_message: '👨‍🦱 *Nossa Equipe*\n\n1️⃣ *João* - Especialista em degradê\n⭐ 4.9 (230+ avaliações)\n📅 Seg, Ter, Qua, Sex\n\n2️⃣ *Carlos* - Mestre em barba\n⭐ 4.8 (180+ avaliações)\n📅 Ter, Qua, Qui, Sáb\n\n3️⃣ *Pedro* - Cortes clássicos\n⭐ 4.9 (200+ avaliações)\n📅 Seg, Qua, Sex, Sáb\n\n4️⃣ *Lucas* - Pigmentação e platinado\n⭐ 4.7 (150+ avaliações)\n📅 Ter, Qui, Sex, Sáb\n\nQual você prefere? Me fala que agendo! 🔥', collect_data: false },
      { id: '4', text: '📍 Endereço e horário', description: 'Como chegar', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nRua das Barbearias, 123 - Centro\n\n⏰ *Horário de Funcionamento:*\n• Seg-Sex: 9h às 20h\n• Sábado: 9h às 18h\n• Domingo: Fechado\n\n🅿️ Estacionamento gratuito\n♿ Acessível\n\n📱 WhatsApp: {{telefone}}\n📸 Instagram: @barbeariapremium\n\nChega mais, parceiro! 🤙', collect_data: false },
      { id: '5', text: '📱 Falar no WhatsApp', description: 'Contato direto', action: 'transfer', next_step_id: '', response_message: '📱 Beleza, parceiro! Já vou te passar pro nosso atendente!\n\nAguarda aí que é rapidinho! 🤙', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '😅 Não entendi, parceiro!\n\nDigita só o *número* da opção:\n1️⃣ Agendar\n2️⃣ Preços\n3️⃣ Barbeiros\n4️⃣ Endereço\n5️⃣ WhatsApp',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { 
        id: 'main_menu', 
        type: 'menu', 
        message: '💈 Menu da Barbearia', 
        options: [
          { id: '1', text: '✂️ Agendar', next: 'agendar' },
          { id: '2', text: '💰 Preços', next: 'precos' },
          { id: '3', text: '👨‍🦱 Barbeiros', next: 'barbeiros' },
          { id: '4', text: '📍 Endereço', next: 'endereco' },
          { id: '5', text: '📱 WhatsApp', next: 'transfer' },
        ]
      },
      agendar: { id: 'agendar', type: 'text', message: '✂️ Me diz qual serviço, data e barbeiro de preferência!', next: 'transfer' },
      precos: { id: 'precos', type: 'text', message: '💰 Tabela completa enviada!', next: 'main_menu' },
      barbeiros: { id: 'barbeiros', type: 'text', message: '👨‍🦱 Qual barbeiro você prefere?', next: 'transfer' },
      endereco: { id: 'endereco', type: 'text', message: '📍 Endereço e horários enviados!', next: 'main_menu' },
      transfer: { id: 'transfer', type: 'transfer', message: '📱 Passando pro atendimento!', transfer_message: 'Aguarda aí!' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 3. RESTAURANTE / DELIVERY =====================
const restauranteTemplate: ProfessionalTemplate = {
  id: 'restaurante',
  name: 'Restaurante / Delivery',
  slug: 'restaurante',
  category: 'alimentacao',
  icon: '🍽️',
  color: 'from-green-500 to-emerald-600',
  description: 'Atendimento para restaurantes com cardápio, delivery e reservas',
  keywords: ['cardápio', 'pedido', 'delivery', 'reserva', 'restaurante', 'comida', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Restaurante',
    company_name: 'Restaurante Sabor & Arte',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️🍳\n\nBem-vindo ao *{{empresa}}*!\n\nNosso café da manhã está imperdível hoje!',
    afternoon_greeting: 'Boa tarde! 🌤️🍽️\n\nBem-vindo ao *{{empresa}}*!\n\nNosso almoço executivo está uma delícia: R$ 32,90! 🍝',
    evening_greeting: 'Boa noite! 🌙🍷\n\nBem-vindo ao *{{empresa}}*!\n\nQue tal um jantar especial hoje?',
    menu_title: '🍽️ Menu do Restaurante',
    menu_description: 'O que deseja?',
    menu_options: [
      { id: '1', text: '📋 Ver cardápio', description: 'Conheça nossos pratos', action: 'message', next_step_id: '', response_message: '📋 *Nosso Cardápio*\n\n🥗 *Entradas*\nSalada Caesar - R$ 28\nCarpaccio - R$ 42\nBruschetta Italiana - R$ 24\nSopa do dia - R$ 22\n\n🍝 *Pratos Principais*\nFilé à Parmegiana - R$ 55\nSalmão Grelhado - R$ 72\nRisoto de Cogumelos - R$ 48\nMassa Carbonara - R$ 42\nPicanha na Brasa (2 pessoas) - R$ 95\n\n🍰 *Sobremesas*\nPetit Gateau - R$ 32\nTiramisù - R$ 28\nCheesecake NY - R$ 26\nSorvete artesanal - R$ 18\n\n🍹 *Bebidas*\nSucos naturais - R$ 12\nRefrigerantes - R$ 8\nVinhos (taça) - a partir de R$ 25\n\n📱 Cardápio completo: menu.restaurante.com', collect_data: false },
      { id: '2', text: '🛵 Fazer pedido delivery', description: 'Peça em casa', action: 'message', next_step_id: '', response_message: '🛵 *Delivery*\n\n📍 *Área de entrega:* até 5km\n⏰ *Tempo médio:* 40-60 minutos\n💰 *Taxa:* R$ 5 a R$ 12 (conforme distância)\n\n🎁 *FRETE GRÁTIS* acima de R$ 80!\n\n📝 *Para pedir, informe:*\n1️⃣ Seu endereço completo\n2️⃣ Itens do pedido\n3️⃣ Forma de pagamento\n\n💳 Aceitamos: Pix, Cartão na entrega, Dinheiro (informe troco)\n\n📲 Ou peça pelo iFood: @saborarte', collect_data: true, data_type: 'custom', data_variable: 'endereco_entrega' },
      { id: '3', text: '📅 Fazer reserva', description: 'Reserve sua mesa', action: 'message', next_step_id: '', response_message: '📅 *Reserva de Mesa*\n\nPor favor, informe:\n\n👤 Seu nome\n📆 Data desejada\n⏰ Horário\n👥 Quantidade de pessoas\n🎉 Ocasião especial? (aniversário, negócios, etc)\n\n📍 *Capacidade:* até 80 pessoas\n🎊 *Eventos e festas:* consulte disponibilidade!\n\n💡 Reservas confirmadas até 2h antes.', collect_data: true, data_type: 'name', data_variable: 'nome_reserva' },
      { id: '4', text: '⏰ Horário e localização', description: 'Onde estamos', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nRua da Gastronomia, 456 - Centro\n\n⏰ *Horários:*\n• Seg-Qui: 11h às 23h\n• Sex-Sáb: 11h às 01h\n• Domingo: 11h às 16h\n\n🍳 *Almoço Executivo:* Seg-Sex 11h-15h\n\n🅿️ Estacionamento próprio GRATUITO\n♿ Totalmente acessível\n👶 Kids space disponível\n\n📱 {{telefone}}', collect_data: false },
      { id: '5', text: '👨‍🍳 Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '👨‍🍳 Opa! Já vou te passar para nossa equipe!\n\nAguarde um momentinho... 🍽️', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🤔 Não entendi!\n\nDigite o *número* da opção:\n1️⃣ Cardápio\n2️⃣ Delivery\n3️⃣ Reserva\n4️⃣ Horário\n5️⃣ Atendente',
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é o atendente virtual do restaurante {{empresa}}.

PERSONALIDADE:
- Acolhedor e apetitoso
- Sugere pratos de forma atraente
- Cria desejo pela experiência

INFORMAÇÕES:
- Especialidade: Culinária contemporânea brasileira
- Horário: Seg-Qui 11h-23h, Sex-Sáb 11h-01h, Dom 11h-16h
- Almoço Executivo: R$ 32,90 (Seg-Sex)
- Delivery: até 5km, 40-60min, taxa R$ 5-12

AJUDE COM:
- Informações do cardápio
- Reservas (colete: nome, data, horário, pessoas)
- Pedidos delivery
- Sugestões de pratos

NUNCA confirme reservas ou pedidos sozinho - sempre transfira para confirmação humana.`,
    ai_temperature: 0.6,
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '🍽️ Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '👨‍🍳 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 4. SALÃO DE BELEZA =====================
const salaoTemplate: ProfessionalTemplate = {
  id: 'salao-beleza',
  name: 'Salão de Beleza',
  slug: 'salao-beleza',
  category: 'beleza',
  icon: '💅',
  color: 'from-pink-500 to-rose-600',
  description: 'Atendimento para salões de beleza e estética',
  keywords: ['cabelo', 'unha', 'manicure', 'corte', 'coloração', 'salão', 'beleza', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Salão',
    company_name: 'Studio Beleza Feminina',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia, linda! ☀️💕\n\nBem-vinda ao *{{empresa}}*!\n\nVamos cuidar da sua beleza hoje?',
    afternoon_greeting: 'Boa tarde! 🌸💅\n\nBem-vinda ao *{{empresa}}*!\n\nPronta para ficar ainda mais maravilhosa?',
    evening_greeting: 'Boa noite! ✨💄\n\nO *{{empresa}}* está fechado agora, mas deixa sua mensagem que amanhã entramos em contato!\n\n💕 Cuide-se!',
    menu_title: '💅 Menu do Salão',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '💇‍♀️ Agendar horário', description: 'Marque seu atendimento', action: 'message', next_step_id: '', response_message: '💇‍♀️ *Agendar Horário*\n\nQual serviço você deseja?\n\n1️⃣ Corte feminino\n2️⃣ Coloração/Mechas/Luzes\n3️⃣ Escova/Penteado\n4️⃣ Manicure/Pedicure\n5️⃣ Design de sobrancelhas\n6️⃣ Maquiagem\n7️⃣ Tratamentos (hidratação, botox, etc)\n\nMe diz o serviço e sua preferência de data/horário! 💕', collect_data: false },
      { id: '2', text: '💰 Tabela de preços', description: 'Valores dos serviços', action: 'message', next_step_id: '', response_message: '💰 *Tabela de Preços*\n\n💇‍♀️ *Cabelo*\nCorte Feminino - R$ 80\nColoração - a partir de R$ 150\nMechas/Luzes - a partir de R$ 200\nBalayage/Ombré - a partir de R$ 350\nEscova Simples - R$ 50\nHidratação Profunda - R$ 70\nBotox Capilar - R$ 150\nProgressiva - a partir de R$ 250\n\n💅 *Unhas*\nManicure - R$ 35\nPedicure - R$ 40\nManicure + Pedicure - R$ 65\nUnhas em Gel - R$ 120\nUnhas de Fibra - R$ 180\n\n✨ *Estética*\nSobrancelha - R$ 25\nSobrancelha + Buço - R$ 40\nMaquiagem Social - R$ 120\nMaquiagem Noiva - R$ 280\nLimpeza de Pele - R$ 150\n\n💕 Consulte nossos COMBOS!', collect_data: false },
      { id: '3', text: '👰 Pacotes para noivas', description: 'Dia da Noiva', action: 'message', next_step_id: '', response_message: '👰 *Pacotes Noiva*\n\n✨ *Dia da Noiva Completo* - R$ 650\n• Penteado\n• Maquiagem HD\n• Manicure + Pedicure\n• Sobrancelha\n\n💍 *Pacote Madrinhas* - R$ 350/pessoa\n• Penteado + Maquiagem\n\n💐 *Make + Penteado* - R$ 380\n\n🎁 *BÔNUS EXCLUSIVOS:*\n• Teste de make GRÁTIS\n• Ensaio de penteado incluso\n• Kit emergência no dia\n• Cronograma capilar antes do casamento\n\n📅 Qual a data do casamento?\n\n💕 Sonhamos junto com você!', collect_data: true, data_type: 'custom', data_variable: 'data_casamento' },
      { id: '4', text: '📍 Localização', description: 'Onde estamos', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nRua da Beleza, 789 - Centro\n\n⏰ *Horários:*\n• Seg-Sex: 9h às 20h\n• Sábado: 9h às 18h\n• Domingo: Fechado\n\n🅿️ Estacionamento conveniado\n♿ Acessível\n☕ Café e água à vontade\n\n📱 {{telefone}}\n📸 Instagram: @studiobelezafeminina\n\n💕 Te esperamos!', collect_data: false },
      { id: '5', text: '💬 Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '💬 Aguarde um momento que nossa equipe já vai te atender! 💕✨', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '💕 Ops, não entendi!\n\nDigite apenas o *número* da opção desejada:\n1️⃣ Agendar\n2️⃣ Preços\n3️⃣ Noivas\n4️⃣ Localização\n5️⃣ Atendente',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '💅 Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '💬 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 5. ACADEMIA / FITNESS =====================
const academiaTemplate: ProfessionalTemplate = {
  id: 'academia',
  name: 'Academia / Fitness',
  slug: 'academia',
  category: 'fitness',
  icon: '💪',
  color: 'from-blue-500 to-indigo-600',
  description: 'Atendimento para academias e estúdios fitness',
  keywords: ['academia', 'treino', 'musculação', 'personal', 'matrícula', 'mensalidade', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Academia',
    company_name: 'Power Fit Academia',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia, campeão! ☀️💪\n\nBem-vindo(a) à *{{empresa}}*!\n\nBora começar o dia com energia total?',
    afternoon_greeting: 'Boa tarde! 🔥💪\n\nBem-vindo(a) à *{{empresa}}*!\n\nPronto(a) para treinar pesado hoje?',
    evening_greeting: 'Boa noite! 🌙💪\n\nA *{{empresa}}* está esperando você!\n\nNunca é tarde para evoluir!',
    menu_title: '💪 Menu Academia',
    menu_description: 'O que você precisa?',
    menu_options: [
      { id: '1', text: '📋 Planos e preços', description: 'Conheça nossos planos', action: 'message', next_step_id: '', response_message: '📋 *Planos Power Fit*\n\n🥉 *Mensal* - R$ 99/mês\n• Musculação + Cardio\n• Avaliação física básica\n\n🥈 *Trimestral* - R$ 79/mês (3x de R$ 237)\n• Tudo do mensal\n• Avaliação física completa\n• 1 sessão de personal\n\n🥇 *Anual* - R$ 59/mês (12x de R$ 59)\n• Tudo do trimestral\n• Personal 1x/mês incluso\n• Acesso ilimitado\n• MELHOR CUSTO-BENEFÍCIO!\n\n⭐ *Premium* - R$ 149/mês\n• TUDO liberado\n• Aulas coletivas ilimitadas\n• Personal 2x/mês\n• Nutricionista incluso\n• Sauna e piscina\n\n💳 Pix, Cartão (até 12x), Boleto\n🎁 PRIMEIRA SEMANA GRÁTIS!', collect_data: false },
      { id: '2', text: '🆕 Fazer matrícula', description: 'Quero me matricular', action: 'message', next_step_id: '', response_message: '🆕 *Matrícula*\n\nShow! Vamos transformar sua vida! 💪\n\n📍 Compareça em nossa unidade com:\n• RG e CPF\n• Comprovante de residência\n• Cartão ou dados para débito\n\n🎁 *PROMOÇÃO ESPECIAL:*\nMatrícula GRÁTIS essa semana!\n+ Camiseta exclusiva de brinde!\n\n📍 Ou me passa seu:\n• Nome\n• WhatsApp\n\nQue nossa equipe liga para você! 📞', collect_data: true, data_type: 'name', data_variable: 'nome_interessado' },
      { id: '3', text: '⏰ Horários das aulas', description: 'Grade de aulas', action: 'message', next_step_id: '', response_message: '⏰ *Grade de Aulas*\n\n🧘 *Yoga* - Seg/Qua/Sex 7h e 19h\n🚴 *Spinning* - Ter/Qui 7h e 19h\n💃 *Zumba* - Seg/Qua 20h\n🏋️ *Funcional* - Ter/Qui/Sáb 8h e 18h\n🥊 *Muay Thai* - Seg/Qua/Sex 21h\n🧘‍♀️ *Pilates* - Ter/Qui 9h e 17h\n💪 *CrossFit* - Seg-Sex 6h e 20h\n🤸 *GAP (Glúteos)* - Ter/Qui 19h\n\n📍 *Funcionamento:*\n• Seg-Sex: 6h às 23h\n• Sábado: 8h às 14h\n• Feriados: 8h às 12h\n\n*Aulas inclusas no plano Premium!*', collect_data: false },
      { id: '4', text: '👤 Personal Trainer', description: 'Treino personalizado', action: 'message', next_step_id: '', response_message: '👤 *Personal Trainer*\n\nResultados REAIS com treino personalizado! 🎯\n\n📊 *Avulso:* R$ 80/sessão\n📦 *Pacote 8 sessões:* R$ 560 (R$ 70/cada)\n📦 *Pacote 12 sessões:* R$ 720 (R$ 60/cada)\n📦 *Pacote 20 sessões:* R$ 1.000 (R$ 50/cada)\n\n✅ *Todos incluem:*\n• Avaliação física completa\n• Periodização personalizada\n• Orientação nutricional\n• Acompanhamento por app\n• Ajustes semanais\n\n🎁 AULA EXPERIMENTAL GRÁTIS!\n\nQuer agendar? Me fala seu objetivo! 💪', collect_data: false },
      { id: '5', text: '📱 Falar com consultor', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '📱 Beleza! Já vou te passar para um consultor!\n\n💪 Aguarde que é rapidinho!', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '💪 Não entendi!\n\nDigita o *número* da opção:\n1️⃣ Planos\n2️⃣ Matrícula\n3️⃣ Aulas\n4️⃣ Personal\n5️⃣ Consultor',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '💪 Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '📱 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 6. IMOBILIÁRIA =====================
const imobiliariaTemplate: ProfessionalTemplate = {
  id: 'imobiliaria',
  name: 'Imobiliária',
  slug: 'imobiliaria',
  category: 'imoveis',
  icon: '🏠',
  color: 'from-cyan-500 to-teal-600',
  description: 'Atendimento para imobiliárias e corretores',
  keywords: ['imóvel', 'casa', 'apartamento', 'alugar', 'comprar', 'vender', 'corretor', 'oi', 'olá'],
  isFeatured: false,
  form: {
    name: 'Atendimento Imobiliária',
    company_name: 'Imobiliária Lar Perfeito',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️🏠\n\nBem-vindo(a) à *{{empresa}}*!\n\nVamos encontrar o imóvel dos seus sonhos?',
    afternoon_greeting: 'Boa tarde! 🌤️🏠\n\nBem-vindo(a) à *{{empresa}}*!\n\nComo posso ajudar você hoje?',
    evening_greeting: 'Boa noite! 🌙🏠\n\nA *{{empresa}}* está à disposição!\n\nDeixa sua mensagem que amanhã entramos em contato.',
    menu_title: '🏠 Menu Imobiliária',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '🔍 Buscar imóvel', description: 'Encontre seu imóvel', action: 'message', next_step_id: '', response_message: '🔍 *Buscar Imóvel*\n\nPara encontrar o imóvel ideal, me conta:\n\n1️⃣ Compra ou Aluguel?\n2️⃣ Casa, Apartamento ou Comercial?\n3️⃣ Bairro(s) de preferência?\n4️⃣ Quantos quartos?\n5️⃣ Faixa de preço?\n6️⃣ Garagem é essencial?\n7️⃣ Aceita financiamento?\n\nVou buscar as melhores opções! 🏡', collect_data: true, data_type: 'custom', data_variable: 'tipo_busca' },
      { id: '2', text: '🏷️ Anunciar imóvel', description: 'Vender ou alugar', action: 'message', next_step_id: '', response_message: '🏷️ *Anunciar Imóvel*\n\n📊 *Avaliação GRÁTIS* do seu imóvel!\n\nPara anunciar, preciso de:\n• Tipo (casa/apto/comercial)\n• Endereço\n• Metragem e quartos\n• Fotos (mínimo 10)\n\n✅ *O que oferecemos:*\n• Comissão competitiva\n• Fotos profissionais GRÁTIS\n• Anúncio em 15+ portais\n• Tour virtual 360°\n• Placas e faixas\n\n📅 Quer agendar uma visita de avaliação?', collect_data: false },
      { id: '3', text: '📅 Agendar visita', description: 'Visite um imóvel', action: 'message', next_step_id: '', response_message: '📅 *Agendar Visita*\n\nPara agendar uma visita, informe:\n\n• Código ou endereço do imóvel\n• Data desejada\n• Horário de preferência\n\n🚗 *Nosso corretor te acompanha!*\n📋 Leve documento com foto.\n\n💡 *Dica:* Visite em diferentes horários para avaliar luminosidade e vizinhança.', collect_data: true, data_type: 'custom', data_variable: 'codigo_imovel' },
      { id: '4', text: '💳 Financiamento', description: 'Simule financiamento', action: 'message', next_step_id: '', response_message: '💳 *Financiamento Imobiliário*\n\n🏦 Trabalhamos com TODOS os bancos!\n\n✅ Simulação gratuita\n✅ Assessoria completa\n✅ Melhores taxas do mercado\n✅ Carta de crédito inclusa\n\nPara simular, preciso de:\n• Valor do imóvel\n• Valor de entrada (mín. 20%)\n• Renda familiar bruta\n\n📊 *Taxa atual:* a partir de 9,5% a.a.\n📅 *Prazo:* até 35 anos\n\nQuer fazer uma simulação?', collect_data: false },
      { id: '5', text: '👨‍💼 Falar com corretor', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '👨‍💼 Excelente! Um de nossos corretores já vai te atender!\n\n🏠 Aguarde um momento...', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🏠 Não entendi sua mensagem.\n\nPor favor, digite o *número* da opção desejada.',
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é o corretor virtual da imobiliária {{empresa}}.

PERSONALIDADE:
- Profissional e consultivo
- Entende as necessidades do cliente
- Faz perguntas estratégicas

AJUDE CLIENTES A:
- Encontrar imóveis (pergunte: tipo, bairro, quartos, preço, garagem)
- Entender o processo de compra/aluguel
- Agendar visitas
- Simular financiamento

REGRAS:
- NUNCA invente preços ou disponibilidade
- Sempre confirme com corretor antes de prometer
- Colete informações completas antes de buscar imóveis`,
    ai_temperature: 0.5,
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '🏠 Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '👨‍💼 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 7. PET SHOP =====================
const petshopTemplate: ProfessionalTemplate = {
  id: 'petshop',
  name: 'Pet Shop / Veterinária',
  slug: 'petshop',
  category: 'pets',
  icon: '🐾',
  color: 'from-yellow-500 to-amber-600',
  description: 'Atendimento para pet shops e clínicas veterinárias',
  keywords: ['pet', 'cachorro', 'gato', 'banho', 'tosa', 'ração', 'veterinário', 'oi', 'olá'],
  isFeatured: false,
  form: {
    name: 'Atendimento Pet Shop',
    company_name: 'Pet Love',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️🐾\n\nBem-vindo(a) ao *{{empresa}}*!\n\nComo podemos cuidar do seu pet hoje?',
    afternoon_greeting: 'Boa tarde! 🌤️🐾\n\nBem-vindo(a) ao *{{empresa}}*!\n\nSeu pet merece o melhor! 🐶🐱',
    evening_greeting: 'Boa noite! 🌙🐾\n\nO *{{empresa}}* está fechado, mas deixa sua mensagem!\n\n🚨 Emergências: {{emergencia}}',
    menu_title: '🐾 Menu Pet Shop',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '🛁 Banho e Tosa', description: 'Agende o banho', action: 'message', next_step_id: '', response_message: '🛁 *Banho e Tosa*\n\n🐕 *Cães*\n• Banho P (até 5kg) - R$ 45\n• Banho M (5-15kg) - R$ 60\n• Banho G (15-30kg) - R$ 80\n• Banho GG (+30kg) - R$ 100\n• Tosa higiênica - +R$ 20\n• Tosa completa - +R$ 40\n• Tosa na máquina - +R$ 30\n\n🐈 *Gatos*\n• Banho - R$ 70\n• Tosa - R$ 90\n\n🧴 *Incluso:* Hidratação, perfume, lacinhos!\n\n📅 Me fala:\n• Nome e raça do pet\n• Porte (P/M/G/GG)\n• Data e horário desejado', collect_data: true, data_type: 'custom', data_variable: 'nome_pet' },
      { id: '2', text: '🏥 Consulta veterinária', description: 'Agende consulta', action: 'message', next_step_id: '', response_message: '🏥 *Veterinário*\n\n👨‍⚕️ *Consulta:* R$ 150\n💉 *Vacinas:* a partir de R$ 80\n🔬 *Exames:* consulte valores\n✂️ *Castração:*\n• Gatos: a partir de R$ 350\n• Cães P/M: a partir de R$ 450\n• Cães G: a partir de R$ 550\n\n🦷 *Limpeza de tártaro:* R$ 400\n\n⏰ *Atendimento:*\n• Seg-Sex: 8h às 20h\n• Sábado: 8h às 14h\n\n🚨 *EMERGÊNCIA 24H:* {{emergencia}}\n\nQual o nome do pet e o motivo?', collect_data: true, data_type: 'custom', data_variable: 'motivo_consulta' },
      { id: '3', text: '🛒 Produtos e rações', description: 'Rações e acessórios', action: 'message', next_step_id: '', response_message: '🛒 *Produtos*\n\n🥣 *Rações Premium*\nGolden, Premier, Royal Canin, N&D, Farmina, Gran Plus\n\n🧸 *Acessórios*\nColeiras, guias, brinquedos, camas, roupas, transportadores\n\n💊 *Farmácia Pet*\nAntipulgas, vermífugos, vitaminas, shampoos medicamentosos\n\n🎀 *Higiene*\nShampoos, condicionadores, perfumes, escovas\n\n🚚 *Delivery em até 24h!*\n📍 Ou retire na loja!\n\nO que você procura? Me conta que busco pra você! 🐾', collect_data: false },
      { id: '4', text: '🏨 Hotel Pet', description: 'Hospedagem', action: 'message', next_step_id: '', response_message: '🏨 *Hotel Pet*\n\nViaje tranquilo! Cuidamos do seu melhor amigo! 💙\n\n🐕 *Diária Cães*\n• P (até 5kg): R$ 60\n• M (5-15kg): R$ 80\n• G (15-30kg): R$ 100\n• GG (+30kg): R$ 120\n\n🐈 *Diária Gatos:* R$ 50\n\n✅ *Inclui:*\n• Alimentação premium\n• Passeios 3x ao dia\n• Monitoramento 24h por câmera\n• Fotos e vídeos diários\n• Área climatizada\n• Muito carinho! 💕\n\n📅 Reserve com antecedência!\n📋 Vacinas em dia obrigatórias.', collect_data: false },
      { id: '5', text: '📱 Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '📱 Aguarde que já vamos te atender! 🐾\n\nEnquanto isso, me conta o nome do seu pet! 🐶🐱', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🐾 Ops, não entendi!\n\nDigite o *número* da opção:\n1️⃣ Banho/Tosa\n2️⃣ Veterinário\n3️⃣ Produtos\n4️⃣ Hotel\n5️⃣ Atendente',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '🐾 Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '📱 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 8. ADVOCACIA =====================
const advocaciaTemplate: ProfessionalTemplate = {
  id: 'advocacia',
  name: 'Escritório de Advocacia',
  slug: 'advocacia',
  category: 'juridico',
  icon: '⚖️',
  color: 'from-slate-600 to-slate-800',
  description: 'Atendimento formal para escritórios de advocacia',
  keywords: ['advogado', 'processo', 'consulta', 'jurídico', 'direito', 'advocacia', 'oi', 'olá'],
  isFeatured: false,
  form: {
    name: 'Atendimento Advocacia',
    company_name: 'Oliveira & Associados Advocacia',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia. ⚖️\n\nBem-vindo(a) ao escritório *{{empresa}}*.\n\nComo podemos auxiliá-lo(a)?',
    afternoon_greeting: 'Boa tarde. ⚖️\n\nBem-vindo(a) ao escritório *{{empresa}}*.\n\nEstamos à disposição.',
    evening_greeting: 'Boa noite. ⚖️\n\nO escritório *{{empresa}}* está fechado no momento.\n\nDeixe sua mensagem para retorno no próximo dia útil.',
    menu_title: '⚖️ Menu Advocacia',
    menu_description: 'Selecione uma opção:',
    menu_options: [
      { id: '1', text: '📋 Áreas de atuação', description: 'Nossas especialidades', action: 'message', next_step_id: '', response_message: '📋 *Áreas de Atuação*\n\n⚖️ *Direito Civil*\nContratos, indenizações, cobranças, responsabilidade civil\n\n👔 *Direito Trabalhista*\nReclamações, acordos, rescisões, cálculos\n\n🏠 *Direito Imobiliário*\nContratos, usucapião, despejo, inventário\n\n👨‍👩‍👧 *Direito de Família*\nDivórcio, pensão alimentícia, guarda, inventário\n\n💼 *Direito Empresarial*\nContratos, societário, recuperação judicial\n\n🛡️ *Direito do Consumidor*\nReclamações, indenizações, negativação indevida\n\n⚠️ *Direito Criminal*\nDefesa, habeas corpus, recursos\n\n📑 *Direito Previdenciário*\nAposentadorias, benefícios, revisões\n\nQual área você precisa?', collect_data: false },
      { id: '2', text: '📅 Agendar consulta', description: 'Marque atendimento', action: 'message', next_step_id: '', response_message: '📅 *Agendar Consulta*\n\n💰 *Consulta inicial:* R$ 200\n(Valor deduzido se contratar nossos serviços)\n\n📍 *Modalidades:*\n• Presencial\n• Online (Zoom/Google Meet)\n\n⏰ *Horário:* Seg-Sex 9h às 18h\n\nPara agendar, informe:\n• Seu nome completo\n• Área do direito\n• Breve descrição do caso\n• Data e horário de preferência\n\n🔐 *Sigilo absoluto garantido.*', collect_data: true, data_type: 'name', data_variable: 'nome_cliente' },
      { id: '3', text: '📂 Acompanhar processo', description: 'Status do seu caso', action: 'message', next_step_id: '', response_message: '📂 *Acompanhar Processo*\n\nPara consultar seu processo:\n\n• Informe seu CPF/CNPJ\n• Ou número do processo\n\n🔐 Suas informações são protegidas por sigilo profissional.\n\n⚠️ Atualizações processuais podem levar até 48h para constar no sistema do Tribunal.\n\nAguarde que verificamos para você.', collect_data: true, data_type: 'cpf', data_variable: 'cpf_cliente' },
      { id: '4', text: '📍 Localização', description: 'Nosso endereço', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nAv. Paulista, 1000 - Sala 1502\nBela Vista - São Paulo/SP\nCEP: 01310-100\n\n⏰ *Horário de Atendimento:*\nSegunda a Sexta: 9h às 18h\n\n🅿️ Estacionamento conveniado (2h cortesia)\n♿ Totalmente acessível\n\n📞 {{telefone}}\n📧 contato@escritorio.com.br\n\n📋 OAB/SP: 123.456', collect_data: false },
      { id: '5', text: '👨‍💼 Falar com advogado', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '👨‍💼 Aguarde um momento.\n\nUm de nossos advogados irá atendê-lo em breve.\n\n🔐 Confidencialidade garantida.', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '⚖️ Desculpe, não compreendi.\n\nDigite apenas o *número* da opção desejada.',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '⚖️ Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '👨‍💼 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 9. ESCOLA / CURSOS =====================
const escolaTemplate: ProfessionalTemplate = {
  id: 'escola',
  name: 'Escola / Cursos',
  slug: 'escola',
  category: 'educacao',
  icon: '📚',
  color: 'from-violet-500 to-purple-600',
  description: 'Atendimento para escolas, cursos e instituições de ensino',
  keywords: ['matrícula', 'curso', 'escola', 'aula', 'mensalidade', 'turma', 'oi', 'olá'],
  isFeatured: false,
  form: {
    name: 'Atendimento Escola',
    company_name: 'Instituto Saber',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️📚\n\nBem-vindo(a) ao *{{empresa}}*!\n\nVamos transformar seu futuro através da educação! 🚀',
    afternoon_greeting: 'Boa tarde! 🌤️📚\n\nBem-vindo(a) ao *{{empresa}}*!\n\nComo podemos ajudar?',
    evening_greeting: 'Boa noite! 🌙📚\n\nO *{{empresa}}* está fechado agora.\n\nDeixe sua mensagem para retorno!',
    menu_title: '📚 Menu Escola',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '📋 Cursos disponíveis', description: 'Conheça os cursos', action: 'message', next_step_id: '', response_message: '📋 *Nossos Cursos*\n\n💻 *Tecnologia*\n• Programação (Python, Java, JavaScript)\n• Desenvolvimento Web Full Stack\n• Design Gráfico/UI-UX\n• Marketing Digital\n• Data Science & Analytics\n• Inteligência Artificial\n\n📊 *Gestão*\n• Administração de Empresas\n• Recursos Humanos\n• Finanças e Contabilidade\n• Logística\n• Gestão de Projetos\n\n🌍 *Idiomas*\n• Inglês (básico ao avançado)\n• Espanhol\n• Francês\n• Libras\n\n✨ *Profissionalizantes*\n• Auxiliar Administrativo\n• Atendimento ao Cliente\n• Excel Avançado\n• Oratória\n\n📱 Modalidades: Presencial e Online!\n\nQual área te interessa?', collect_data: false },
      { id: '2', text: '💰 Valores e mensalidades', description: 'Preços e formas', action: 'message', next_step_id: '', response_message: '💰 *Investimento*\n\n📚 *Cursos Livres*\nA partir de R$ 49/mês\nDuração: 3-6 meses\n\n🎓 *Cursos Técnicos*\nA partir de R$ 199/mês\nDuração: 12-24 meses\n\n🌍 *Idiomas*\nA partir de R$ 149/mês\nDuração: Contínuo (níveis)\n\n💳 *Formas de Pagamento:*\n• Boleto bancário\n• Cartão (até 12x sem juros!)\n• Pix (5% de desconto!)\n• Recorrência no cartão\n\n🎁 *PROMOÇÃO DA SEMANA:*\n✅ Matrícula GRÁTIS\n✅ Material didático incluso\n✅ Primeira mensalidade com 50% OFF!', collect_data: false },
      { id: '3', text: '📝 Fazer matrícula', description: 'Quero me matricular', action: 'message', next_step_id: '', response_message: '📝 *Matrícula*\n\nÓtima escolha! Invista no seu futuro! 🎉\n\nPara se matricular:\n\n• Seu nome completo\n• Curso de interesse\n• Turno preferido (manhã/tarde/noite/online)\n• Melhor forma de contato\n\n📍 Ou compareça em nossa sede:\nRua da Educação, 500 - Centro\n\n📞 {{telefone}}\n\n🎁 Garanta sua vaga com condições especiais!\n\n🚀 Mude sua vida através da educação!', collect_data: true, data_type: 'name', data_variable: 'nome_aluno' },
      { id: '4', text: '📅 Horários das aulas', description: 'Grade horária', action: 'message', next_step_id: '', response_message: '📅 *Horários das Aulas*\n\n☀️ *Manhã:* 8h às 12h\n🌤️ *Tarde:* 14h às 18h\n🌙 *Noite:* 19h às 22h\n🏠 *Online:* Horário flexível (acesso 24h)\n\n📍 *Nosso Endereço:*\nRua da Educação, 500 - Centro\n\n🚌 Próximo ao metrô e ponto de ônibus!\n🅿️ Estacionamento conveniado\n♿ Totalmente acessível\n\n📚 Biblioteca e laboratórios disponíveis!', collect_data: false },
      { id: '5', text: '📱 Falar com secretaria', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '📱 Aguarde um momento!\n\nNossa secretaria já vai te atender! 📚✨\n\n🚀 Vamos transformar seu futuro juntos!', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '📚 Não entendi sua mensagem.\n\nDigite o *número* da opção:\n1️⃣ Cursos\n2️⃣ Valores\n3️⃣ Matrícula\n4️⃣ Horários\n5️⃣ Secretaria',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '📚 Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '📱 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== 10. OFICINA MECÂNICA =====================
const oficinaTemplate: ProfessionalTemplate = {
  id: 'oficina',
  name: 'Oficina Mecânica',
  slug: 'oficina',
  category: 'automotivo',
  icon: '🔧',
  color: 'from-zinc-600 to-zinc-800',
  description: 'Atendimento para oficinas mecânicas e auto centers',
  keywords: ['carro', 'manutenção', 'óleo', 'pneu', 'oficina', 'mecânico', 'oi', 'olá'],
  isFeatured: false,
  form: {
    name: 'Atendimento Oficina',
    company_name: 'Auto Center Premium',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️🔧\n\nBem-vindo ao *{{empresa}}*!\n\nComo podemos ajudar com seu veículo?',
    afternoon_greeting: 'Boa tarde! 🌤️🔧\n\nBem-vindo ao *{{empresa}}*!\n\nSeu carro merece os melhores cuidados!',
    evening_greeting: 'Boa noite! 🌙🔧\n\nO *{{empresa}}* está fechado.\n\n🚨 Guincho 24h: {{guincho}}',
    menu_title: '🔧 Menu Oficina',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '🛠️ Serviços e preços', description: 'O que fazemos', action: 'message', next_step_id: '', response_message: '🛠️ *Nossos Serviços*\n\n🛢️ *Troca de Óleo*\n• Sintético (5L) - R$ 189\n• Semi-sintético (4L) - R$ 129\n• Mineral (4L) - R$ 89\n(Filtro de óleo incluso)\n\n🔋 *Elétrica*\n• Revisão elétrica - R$ 150\n• Bateria (instalada) - a partir R$ 350\n• Alternador/Motor partida - consulte\n\n🎯 *Suspensão e Direção*\n• Alinhamento + Balanceamento - R$ 100\n• Revisão suspensão - R$ 180\n• Amortecedores (par) - a partir R$ 400\n\n🔧 *Freios*\n• Pastilhas (par) - R$ 180\n• Discos (par) - R$ 350\n• Fluido de freio - R$ 80\n\n❄️ *Ar Condicionado*\n• Recarga de gás - R$ 120\n• Higienização - R$ 80\n• Filtro de cabine - R$ 60\n\n⚙️ *Revisão Completa* - R$ 350\n(50 itens verificados)\n\n🚗 Qual serviço você precisa?', collect_data: false },
      { id: '2', text: '📅 Agendar serviço', description: 'Marque horário', action: 'message', next_step_id: '', response_message: '📅 *Agendar Serviço*\n\nPara agendar, informe:\n\n👤 Seu nome\n🚗 Modelo do veículo\n🔢 Placa\n🛠️ Serviço desejado\n⚠️ Sintoma/problema (se houver)\n📅 Data/horário de preferência\n\n🚗 *Leva e traz GRÁTIS* em até 10km!\n\n⏰ *Funcionamento:*\n• Seg-Sex: 8h às 18h\n• Sábado: 8h às 13h', collect_data: true, data_type: 'name', data_variable: 'nome_cliente' },
      { id: '3', text: '🔍 Diagnóstico', description: 'Avaliação do veículo', action: 'message', next_step_id: '', response_message: '🔍 *Diagnóstico Veicular*\n\n🖥️ *Scanner computadorizado:* R$ 80\n(Leitura de erros eletrônicos)\n\n🔧 *Diagnóstico completo:* R$ 150\n(Avaliação mecânica + eletrônica)\n\n✅ Valor DEDUZIDO se fizer o serviço!\n\n📝 Relatório detalhado com fotos\n💬 Explicação transparente do problema\n📊 Orçamento sem compromisso\n\n⚠️ *Sinais de atenção:*\n• Barulho estranho\n• Luz no painel\n• Trepidação\n• Vazamentos\n\nMe conta o sintoma do seu carro!', collect_data: false },
      { id: '4', text: '🚗 Leva e traz', description: 'Comodidade', action: 'message', next_step_id: '', response_message: '🚗 *Serviço Leva e Traz*\n\n✅ Buscamos seu carro\n✅ Fazemos o serviço\n✅ Devolvemos onde você quiser\n\n📍 *Área de cobertura:* 10km\n💰 *Valor:* GRÁTIS!\n\n⏰ Agendamento com 24h de antecedência\n\n🚨 *Guincho 24h:* {{guincho}}\n(Para emergências e distâncias maiores - consulte valor)\n\n🔒 Seu veículo segurado durante todo processo!\n\nQuer agendar com leva e traz?', collect_data: false },
      { id: '5', text: '📱 Falar com mecânico', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '📱 Beleza! Vou te passar para nosso mecânico!\n\n🔧 Aguarde que já te atendemos!', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🔧 Não entendi.\n\nDigite o *número* da opção:\n1️⃣ Serviços\n2️⃣ Agendar\n3️⃣ Diagnóstico\n4️⃣ Leva e traz\n5️⃣ Mecânico',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '🔧 Menu', options: [] },
      transfer: { id: 'transfer', type: 'transfer', message: '📱 Transferindo...', transfer_message: '' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== EXPORT TEMPLATES =====================
export const PROFESSIONAL_TEMPLATES: ProfessionalTemplate[] = [
  clinicaTemplate,
  barbeariaTemplate,
  restauranteTemplate,
  salaoTemplate,
  academiaTemplate,
  imobiliariaTemplate,
  petshopTemplate,
  advocaciaTemplate,
  escolaTemplate,
  oficinaTemplate,
];

export const getTemplateById = (id: string): ProfessionalTemplate | undefined => {
  return PROFESSIONAL_TEMPLATES.find(t => t.id === id);
};

export const getTemplateBySlug = (slug: string): ProfessionalTemplate | undefined => {
  return PROFESSIONAL_TEMPLATES.find(t => t.slug === slug);
};

export const getTemplatesByCategory = (category: string): ProfessionalTemplate[] => {
  return PROFESSIONAL_TEMPLATES.filter(t => t.category === category);
};

export const getFeaturedTemplates = (): ProfessionalTemplate[] => {
  return PROFESSIONAL_TEMPLATES.filter(t => t.isFeatured);
};

export const TEMPLATE_CATEGORIES = [
  { id: 'saude', name: 'Saúde', icon: '🏥' },
  { id: 'beleza', name: 'Beleza', icon: '💅' },
  { id: 'alimentacao', name: 'Alimentação', icon: '🍽️' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'imoveis', name: 'Imóveis', icon: '🏠' },
  { id: 'pets', name: 'Pets', icon: '🐾' },
  { id: 'juridico', name: 'Jurídico', icon: '⚖️' },
  { id: 'educacao', name: 'Educação', icon: '📚' },
  { id: 'automotivo', name: 'Automotivo', icon: '🔧' },
  { id: 'comercial', name: 'Comercial', icon: '🛒' },
];
