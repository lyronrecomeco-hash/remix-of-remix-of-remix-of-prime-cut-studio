// Templates Profissionais Completos por Nicho
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

// ===================== CLÍNICA / SAÚDE =====================
const clinicaTemplate: ProfessionalTemplate = {
  id: 'clinica',
  name: 'Clínica Médica',
  slug: 'clinica',
  category: 'saude',
  icon: '🏥',
  color: 'from-red-500 to-rose-600',
  description: 'Atendimento para clínicas médicas, consultórios e hospitais',
  keywords: ['consulta', 'médico', 'agendar', 'exame', 'doutor', 'saúde', 'clínica', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Clínica',
    company_name: 'Clínica São Lucas',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️ Bem-vindo(a) à *{{empresa}}*\n\nSomos especializados em cuidar da sua saúde com carinho e profissionalismo.',
    afternoon_greeting: 'Boa tarde! 🌤️ Bem-vindo(a) à *{{empresa}}*\n\nSomos especializados em cuidar da sua saúde com carinho e profissionalismo.',
    evening_greeting: 'Boa noite! 🌙 Bem-vindo(a) à *{{empresa}}*\n\nMesmo fora do horário, estamos aqui para ajudar!',
    menu_title: '🏥 Menu Principal',
    menu_description: 'Escolha uma opção digitando o número:',
    menu_options: [
      { id: '1', text: '📅 Agendar consulta', description: 'Marque sua consulta', action: 'message', next_step_id: '', response_message: '📅 *Agendamento de Consulta*\n\nPor favor, informe:\n\n1️⃣ Especialidade desejada\n2️⃣ Data de preferência\n3️⃣ Turno (manhã/tarde)\n\nNossa equipe retornará em breve para confirmar! ✨', collect_data: false },
      { id: '2', text: '🔄 Remarcar consulta', description: 'Altere data/horário', action: 'message', next_step_id: '', response_message: '🔄 *Remarcação*\n\nPara remarcar, preciso de:\n\n• Seu nome completo\n• Data da consulta atual\n• Nova data desejada\n\nAguarde a confirmação! 📋', collect_data: true, data_type: 'name', data_variable: 'nome_paciente' },
      { id: '3', text: '❌ Cancelar consulta', description: 'Cancele agendamento', action: 'message', next_step_id: '', response_message: '❌ *Cancelamento*\n\nInforme seu nome e a data da consulta que deseja cancelar.\n\n⚠️ Cancelamentos devem ser feitos com 24h de antecedência.', collect_data: false },
      { id: '4', text: '📋 Resultados de exames', description: 'Consulte resultados', action: 'message', next_step_id: '', response_message: '📋 *Resultados de Exames*\n\nPara consultar seus resultados:\n\n1️⃣ Acesse: www.clinica.com.br/resultados\n2️⃣ Use seu CPF e data de nascimento\n\nOu me informe seu nome completo e CPF que verifico para você! 🔐', collect_data: true, data_type: 'cpf', data_variable: 'cpf_paciente' },
      { id: '5', text: '👨‍⚕️ Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '👨‍⚕️ *Transferindo...*\n\nAguarde um momento que um de nossos atendentes irá te atender!\n\n⏰ Horário: Seg-Sex 7h-19h | Sáb 7h-12h', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🤔 Não entendi sua resposta.\n\nPor favor, digite apenas o *número* da opção desejada (1, 2, 3, 4 ou 5).',
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é a assistente virtual da clínica médica {{empresa}}.

Seu papel:
- Ajudar pacientes com agendamentos e dúvidas
- Coletar informações necessárias (nome, especialidade, data)
- Ser empática e profissional

Informações importantes:
- Especialidades: Clínico Geral, Cardiologia, Ortopedia, Pediatria, Ginecologia
- Horário: Segunda a Sexta 7h-19h, Sábado 7h-12h
- Convênios: Unimed, Bradesco Saúde, SulAmérica, Particular

NUNCA invente horários ou disponibilidade. Se não souber, direcione para atendente.`,
    ai_temperature: 0.5,
    ai_rules: ['Nunca invente horários disponíveis', 'Seja empática com pacientes', 'Colete nome e CPF antes de verificar dados', 'Direcione emergências para 192 (SAMU)'],
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { 
        id: 'main_menu', 
        type: 'menu', 
        message: '🏥 Menu Principal\n\nEscolha uma opção:', 
        options: [
          { id: '1', text: '📅 Agendar consulta', next: 'agendar' },
          { id: '2', text: '🔄 Remarcar consulta', next: 'remarcar' },
          { id: '3', text: '❌ Cancelar consulta', next: 'cancelar' },
          { id: '4', text: '📋 Resultados de exames', next: 'resultados' },
          { id: '5', text: '👨‍⚕️ Falar com atendente', next: 'transfer' },
        ]
      },
      agendar: { id: 'agendar', type: 'text', message: '📅 *Agendamento de Consulta*\n\nPor favor, informe:\n\n1️⃣ Especialidade desejada\n2️⃣ Data de preferência\n3️⃣ Turno (manhã/tarde)', next: 'transfer' },
      remarcar: { id: 'remarcar', type: 'input', message: '🔄 *Remarcação*\n\nInforme seu nome completo:', input_type: 'name', input_variable: 'nome_paciente', next: 'transfer' },
      cancelar: { id: 'cancelar', type: 'text', message: '❌ *Cancelamento*\n\nInforme seu nome e a data da consulta.', next: 'transfer' },
      resultados: { id: 'resultados', type: 'input', message: '📋 Informe seu CPF para consultar resultados:', input_type: 'cpf', input_variable: 'cpf_paciente', next: 'transfer' },
      transfer: { id: 'transfer', type: 'transfer', message: '👨‍⚕️ Transferindo para atendente...', transfer_message: 'Aguarde um momento!' },
      end: { id: 'end', type: 'end', message: '✅ Obrigado por entrar em contato! Volte sempre. 💙' },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== BARBEARIA =====================
const barbeariaTemplate: ProfessionalTemplate = {
  id: 'barbearia',
  name: 'Barbearia',
  slug: 'barbearia',
  category: 'beleza',
  icon: '💈',
  color: 'from-amber-500 to-orange-600',
  description: 'Atendimento para barbearias e salões masculinos',
  keywords: ['corte', 'barba', 'cabelo', 'agendar', 'barbearia', 'barbeiro', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Barbearia',
    company_name: 'Barbearia Premium',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia, parceiro! ☀️💈\n\nBem-vindo à *{{empresa}}*!\n\nO que vai ser hoje?',
    afternoon_greeting: 'E aí, chegou a hora de dar um trato no visual! 🔥💈\n\nBem-vindo à *{{empresa}}*!',
    evening_greeting: 'Boa noite! 🌙💈\n\nA *{{empresa}}* tá fechada agora, mas deixa sua mensagem que amanhã a gente resolve!',
    menu_title: '💈 Menu da Barbearia',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '✂️ Agendar horário', description: 'Marque seu corte', action: 'message', next_step_id: '', response_message: '✂️ *Agendar Horário*\n\nQual serviço você quer?\n\n1️⃣ Corte masculino - R$ 45\n2️⃣ Barba - R$ 30\n3️⃣ Corte + Barba - R$ 65\n4️⃣ Sobrancelha - R$ 15\n5️⃣ Pigmentação - R$ 80\n\nMe diz o número e a data/horário de preferência! 📅', collect_data: false },
      { id: '2', text: '💰 Ver preços', description: 'Tabela de preços', action: 'message', next_step_id: '', response_message: '💰 *Tabela de Preços*\n\n✂️ Corte Masculino - R$ 45\n🧔 Barba Completa - R$ 30\n✂️🧔 Corte + Barba - R$ 65\n👁️ Sobrancelha - R$ 15\n🎨 Pigmentação - R$ 80\n💆 Hidratação - R$ 40\n👶 Corte Infantil - R$ 35\n\n📍 Aceitamos Pix, Cartão e Dinheiro!', collect_data: false },
      { id: '3', text: '📍 Endereço e horário', description: 'Localização', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nRua das Barbearias, 123 - Centro\n\n⏰ *Horário de Funcionamento:*\nSeg-Sex: 9h às 20h\nSábado: 9h às 18h\nDomingo: Fechado\n\n📱 Chega mais!', collect_data: false },
      { id: '4', text: '👨‍🦱 Escolher barbeiro', description: 'Veja a equipe', action: 'message', next_step_id: '', response_message: '👨‍🦱 *Nossa Equipe*\n\n1️⃣ *João* - Especialista em degradê\n2️⃣ *Carlos* - Mestre em barba\n3️⃣ *Pedro* - Cortes clássicos\n4️⃣ *Lucas* - Pigmentação\n\nQual você prefere? Me fala que agendo com ele! 🔥', collect_data: false },
      { id: '5', text: '📱 Falar no WhatsApp', description: 'Contato direto', action: 'transfer', next_step_id: '', response_message: '📱 Beleza! Já vou te passar pro nosso atendente!\n\nAguarda aí que é rapidinho! 🤙', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '😅 Não entendi, parceiro!\n\nDigita só o *número* da opção (1, 2, 3, 4 ou 5).',
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
        message: '💈 Menu', 
        options: [
          { id: '1', text: '✂️ Agendar', next: 'agendar' },
          { id: '2', text: '💰 Preços', next: 'precos' },
          { id: '3', text: '📍 Endereço', next: 'endereco' },
          { id: '4', text: '👨‍🦱 Barbeiros', next: 'barbeiros' },
          { id: '5', text: '📱 WhatsApp', next: 'transfer' },
        ]
      },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== RESTAURANTE =====================
const restauranteTemplate: ProfessionalTemplate = {
  id: 'restaurante',
  name: 'Restaurante',
  slug: 'restaurante',
  category: 'alimentacao',
  icon: '🍽️',
  color: 'from-green-500 to-emerald-600',
  description: 'Atendimento para restaurantes, lanchonetes e delivery',
  keywords: ['cardápio', 'pedido', 'delivery', 'reserva', 'restaurante', 'comida', 'oi', 'olá'],
  isFeatured: true,
  form: {
    name: 'Atendimento Restaurante',
    company_name: 'Restaurante Sabor & Arte',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ☀️🍳\n\nBem-vindo ao *{{empresa}}*!\n\nNosso café da manhã está imperdível hoje!',
    afternoon_greeting: 'Boa tarde! 🌤️🍽️\n\nBem-vindo ao *{{empresa}}*!\n\nO almoço executivo tá uma delícia!',
    evening_greeting: 'Boa noite! 🌙🍷\n\nBem-vindo ao *{{empresa}}*!\n\nQue tal jantar com a gente?',
    menu_title: '🍽️ Menu do Restaurante',
    menu_description: 'O que deseja?',
    menu_options: [
      { id: '1', text: '📋 Ver cardápio', description: 'Conheça nossos pratos', action: 'message', next_step_id: '', response_message: '📋 *Nosso Cardápio*\n\n🥗 *Entradas*\nSalada Caesar - R$ 28\nCarpaccio - R$ 42\n\n🍝 *Pratos Principais*\nFilé à Parmegiana - R$ 55\nSalmão Grelhado - R$ 72\nRisoto de Cogumelos - R$ 48\n\n🍰 *Sobremesas*\nPetit Gateau - R$ 32\nTiramisù - R$ 28\n\n🍹 *Bebidas*\nSucos Naturais - R$ 12\nRefrigerantes - R$ 8\n\n📱 Para pedido completo, acesse: link.do/cardapio', collect_data: false },
      { id: '2', text: '🛵 Fazer pedido delivery', description: 'Peça em casa', action: 'message', next_step_id: '', response_message: '🛵 *Delivery*\n\n📍 Área de entrega: até 5km\n⏰ Tempo médio: 40-60 min\n💰 Taxa: R$ 5 a R$ 12\n\nPara pedir:\n1️⃣ Informe seu endereço\n2️⃣ O que deseja do cardápio\n3️⃣ Forma de pagamento\n\nOu peça pelo iFood: @saborarte 📲', collect_data: true, data_type: 'custom', data_variable: 'endereco_entrega' },
      { id: '3', text: '📅 Fazer reserva', description: 'Reserve sua mesa', action: 'message', next_step_id: '', response_message: '📅 *Reserva de Mesa*\n\nPor favor, informe:\n\n• Seu nome\n• Data desejada\n• Horário\n• Quantidade de pessoas\n\n📍 Capacidade: até 80 pessoas\n🎉 Eventos: consulte disponibilidade!', collect_data: true, data_type: 'name', data_variable: 'nome_reserva' },
      { id: '4', text: '⏰ Horário e localização', description: 'Onde estamos', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nRua da Gastronomia, 456 - Centro\n\n⏰ *Horários:*\nSeg-Qui: 11h às 23h\nSex-Sáb: 11h às 01h\nDomingo: 11h às 16h\n\n🅿️ Estacionamento próprio gratuito\n♿ Acessibilidade disponível\n\n📱 (11) 99999-9999', collect_data: false },
      { id: '5', text: '👨‍🍳 Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '👨‍🍳 Opa! Já vou te passar para nossa equipe!\n\nAguarde um momentinho... 🍽️', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🤔 Não entendi!\n\nDigite o *número* da opção (1, 2, 3, 4 ou 5).',
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é o atendente virtual do restaurante {{empresa}}.

Especialidades: Culinária contemporânea brasileira
Horário: Seg-Qui 11h-23h, Sex-Sáb 11h-01h, Dom 11h-16h

Ajude com:
- Informações do cardápio
- Reservas (colete nome, data, horário, pessoas)
- Dúvidas sobre delivery

NUNCA confirme reservas ou pedidos sozinho. Sempre transfira para confirmação.`,
    ai_temperature: 0.6,
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '🍽️ Menu', options: [] },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== SALÃO DE BELEZA =====================
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
    evening_greeting: 'Boa noite! ✨💄\n\nO *{{empresa}}* está fechado agora, mas deixa sua mensagem que amanhã entramos em contato!',
    menu_title: '💅 Menu do Salão',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '💇‍♀️ Agendar horário', description: 'Marque seu atendimento', action: 'message', next_step_id: '', response_message: '💇‍♀️ *Agendar Horário*\n\nQual serviço você deseja?\n\n1️⃣ Corte feminino\n2️⃣ Coloração/Mechas\n3️⃣ Escova/Penteado\n4️⃣ Manicure/Pedicure\n5️⃣ Design de sobrancelhas\n6️⃣ Maquiagem\n\nMe diz o serviço e a data/horário de preferência! 💕', collect_data: false },
      { id: '2', text: '💰 Tabela de preços', description: 'Valores dos serviços', action: 'message', next_step_id: '', response_message: '💰 *Tabela de Preços*\n\n💇‍♀️ *Cabelo*\nCorte Feminino - R$ 80\nColoração - a partir de R$ 150\nMechas - a partir de R$ 200\nEscova - R$ 50\nHidratação - R$ 70\n\n💅 *Unhas*\nManicure - R$ 35\nPedicure - R$ 40\nManicure + Pedicure - R$ 65\n\n✨ *Outros*\nSobrancelha - R$ 25\nMaquiagem Social - R$ 120\nMaquiagem Noiva - R$ 280\n\n*Consulte pacotes especiais! 💕', collect_data: false },
      { id: '3', text: '👰 Pacotes para noivas', description: 'Dia da Noiva', action: 'message', next_step_id: '', response_message: '👰 *Pacotes Noiva*\n\n✨ *Dia da Noiva Completo* - R$ 650\nInclui: Penteado, Maquiagem, Manicure, Pedicure\n\n💍 *Pacote Madrinhas* - R$ 350/pessoa\nPenteado + Maquiagem\n\n💐 *Make + Penteado* - R$ 380\n\n📸 Teste de make grátis!\n\nMe conta a data do casamento que verifico disponibilidade! 💕', collect_data: true, data_type: 'custom', data_variable: 'data_casamento' },
      { id: '4', text: '📍 Localização', description: 'Onde estamos', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nRua da Beleza, 789 - Centro\n\n⏰ *Horários:*\nSeg-Sex: 9h às 20h\nSábado: 9h às 18h\nDomingo: Fechado\n\n🅿️ Estacionamento próximo\n\n📱 (11) 99999-9999\n📸 @studiobelezafeminina', collect_data: false },
      { id: '5', text: '💬 Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '💬 Aguarde um momento que nossa equipe já vai te atender! 💕✨', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '💕 Ops, não entendi!\n\nDigite apenas o *número* da opção desejada (1, 2, 3, 4 ou 5).',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {
      greeting: { id: 'greeting', type: 'greeting', message: '', next: 'main_menu' },
      main_menu: { id: 'main_menu', type: 'menu', message: '💅 Menu', options: [] },
    },
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== ACADEMIA / FITNESS =====================
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
    morning_greeting: 'Bom dia! ☀️💪\n\nBem-vindo(a) à *{{empresa}}*!\n\nBora começar o dia com energia?',
    afternoon_greeting: 'Boa tarde! 🔥💪\n\nBem-vindo(a) à *{{empresa}}*!\n\nPronto(a) para treinar?',
    evening_greeting: 'Boa noite! 🌙💪\n\nA *{{empresa}}* tá te esperando!\n\nNunca é tarde para treinar!',
    menu_title: '💪 Menu Academia',
    menu_description: 'O que você precisa?',
    menu_options: [
      { id: '1', text: '📋 Planos e preços', description: 'Conheça nossos planos', action: 'message', next_step_id: '', response_message: '📋 *Planos Power Fit*\n\n🥉 *Mensal* - R$ 99/mês\nMusculação + Cardio\n\n🥈 *Trimestral* - R$ 79/mês\n3 meses + Avaliação física\n\n🥇 *Anual* - R$ 59/mês\n12 meses + Personal 1x mês\n\n⭐ *Plano Premium* - R$ 149/mês\nTudo liberado + Aulas + Nutricionista\n\n💳 Pagamento: Pix, Cartão, Boleto\n🎁 Primeira semana GRÁTIS!', collect_data: false },
      { id: '2', text: '🆕 Fazer matrícula', description: 'Quero me matricular', action: 'message', next_step_id: '', response_message: '🆕 *Matrícula*\n\n📍 Compareça em uma de nossas unidades com:\n\n• RG e CPF\n• Comprovante de residência\n• Cartão ou dados para débito\n\n🎁 *Promoção:* Matrícula GRÁTIS essa semana!\n\nOu me passa seu nome e WhatsApp que ligamos para você! 📞', collect_data: true, data_type: 'name', data_variable: 'nome_interessado' },
      { id: '3', text: '⏰ Horários das aulas', description: 'Grade de aulas', action: 'message', next_step_id: '', response_message: '⏰ *Grade de Aulas*\n\n🧘 *Yoga* - Seg/Qua/Sex 7h\n🚴 *Spinning* - Ter/Qui 19h\n💃 *Zumba* - Seg/Qua 20h\n🏋️ *Funcional* - Ter/Qui/Sáb 8h\n🥊 *Muay Thai* - Seg/Qua/Sex 21h\n\n📍 Academia abre: 6h às 23h (Seg-Sex)\nSábado: 8h às 14h\n\n*Aulas inclusas nos planos Premium!', collect_data: false },
      { id: '4', text: '👤 Personal Trainer', description: 'Treino personalizado', action: 'message', next_step_id: '', response_message: '👤 *Personal Trainer*\n\nTreino personalizado para seus objetivos!\n\n📊 *Avulso:* R$ 80/sessão\n📦 *Pacote 8 sessões:* R$ 560\n📦 *Pacote 12 sessões:* R$ 720\n\n✅ Inclui:\n• Avaliação física\n• Periodização\n• Acompanhamento de dieta\n\nQuer agendar uma aula experimental? 💪', collect_data: false },
      { id: '5', text: '📱 Falar com consultor', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '📱 Beleza! Já vou te passar para um consultor!\n\n💪 Aguarde que é rapidinho!', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '💪 Não entendi!\n\nDigita o *número* da opção (1, 2, 3, 4 ou 5).',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {},
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== IMOBILIÁRIA =====================
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
      { id: '1', text: '🔍 Buscar imóvel', description: 'Encontre seu imóvel', action: 'message', next_step_id: '', response_message: '🔍 *Buscar Imóvel*\n\nPara encontrar o imóvel ideal, me conta:\n\n1️⃣ Compra ou Aluguel?\n2️⃣ Casa ou Apartamento?\n3️⃣ Bairro de preferência?\n4️⃣ Quantos quartos?\n5️⃣ Faixa de preço?\n\nVou buscar as melhores opções! 🏡', collect_data: true, data_type: 'custom', data_variable: 'tipo_busca' },
      { id: '2', text: '🏷️ Anunciar imóvel', description: 'Vender ou alugar', action: 'message', next_step_id: '', response_message: '🏷️ *Anunciar Imóvel*\n\n📊 Avaliação GRÁTIS do seu imóvel!\n\nPara anunciar, preciso de:\n• Tipo (casa/apto)\n• Endereço\n• Fotos\n• Informações do imóvel\n\n💰 Comissão competitiva!\n📸 Fotos profissionais inclusas!\n\nQuer agendar uma visita de avaliação?', collect_data: false },
      { id: '3', text: '📅 Agendar visita', description: 'Visite um imóvel', action: 'message', next_step_id: '', response_message: '📅 *Agendar Visita*\n\nPara agendar uma visita, me informe:\n\n• Código ou endereço do imóvel\n• Data desejada\n• Horário de preferência\n\n🚗 Nosso corretor te acompanha!\n📋 Leve documento com foto.', collect_data: true, data_type: 'custom', data_variable: 'codigo_imovel' },
      { id: '4', text: '💳 Financiamento', description: 'Simule financiamento', action: 'message', next_step_id: '', response_message: '💳 *Financiamento*\n\n🏦 Trabalhamos com todos os bancos!\n\n✅ Simulação gratuita\n✅ Assessoria completa\n✅ Melhores taxas\n\nPara simular, preciso de:\n• Valor do imóvel\n• Valor de entrada\n• Renda familiar\n\nQuer fazer uma simulação?', collect_data: false },
      { id: '5', text: '👨‍💼 Falar com corretor', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '👨‍💼 Excelente! Um de nossos corretores já vai te atender!\n\n🏠 Aguarde um momento...', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🏠 Não entendi sua mensagem.\n\nPor favor, digite o *número* da opção desejada.',
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é o atendente virtual da imobiliária {{empresa}}.

Ajude clientes a:
- Encontrar imóveis (pergunte: tipo, bairro, quartos, preço)
- Entender o processo de compra/aluguel
- Agendar visitas

NUNCA invente preços ou disponibilidade. Sempre confirme com corretor.`,
    ai_temperature: 0.5,
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {},
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== PET SHOP =====================
const petshopTemplate: ProfessionalTemplate = {
  id: 'petshop',
  name: 'Pet Shop',
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
    afternoon_greeting: 'Boa tarde! 🌤️🐾\n\nBem-vindo(a) ao *{{empresa}}*!\n\nSeu pet merece o melhor!',
    evening_greeting: 'Boa noite! 🌙🐾\n\nO *{{empresa}}* está fechado, mas deixa sua mensagem!\n\n🚨 Emergências: (11) 99999-9999',
    menu_title: '🐾 Menu Pet Shop',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '🛁 Banho e Tosa', description: 'Agende o banho', action: 'message', next_step_id: '', response_message: '🛁 *Banho e Tosa*\n\n🐕 *Cães*\nBanho P - R$ 45\nBanho M - R$ 60\nBanho G - R$ 80\nTosa higiênica - +R$ 20\nTosa completa - +R$ 40\n\n🐈 *Gatos*\nBanho - R$ 70\nTosa - R$ 90\n\n📅 Me fala o nome do pet, porte e data desejada!', collect_data: true, data_type: 'custom', data_variable: 'nome_pet' },
      { id: '2', text: '🏥 Consulta veterinária', description: 'Agende consulta', action: 'message', next_step_id: '', response_message: '🏥 *Veterinário*\n\n👨‍⚕️ Consulta: R$ 150\n💉 Vacinas: a partir de R$ 80\n🔬 Exames: consulte\n\n⏰ Atendimento:\nSeg-Sex: 8h às 20h\nSáb: 8h às 14h\n\n🚨 *Emergência 24h:* (11) 99999-9999\n\nQual o nome do pet e o motivo?', collect_data: true, data_type: 'custom', data_variable: 'motivo_consulta' },
      { id: '3', text: '🛒 Produtos', description: 'Rações e acessórios', action: 'message', next_step_id: '', response_message: '🛒 *Produtos*\n\n🥣 *Rações Premium*\nGolden, Premier, Royal Canin, N&D\n\n🧸 *Acessórios*\nColeiras, brinquedos, camas, roupas\n\n💊 *Medicamentos*\nAntipulgas, vermífugos, vitaminas\n\n🚚 Entrega em até 24h!\n📍 Ou retire na loja!\n\nO que você procura?', collect_data: false },
      { id: '4', text: '🏨 Hotel Pet', description: 'Hospedagem', action: 'message', next_step_id: '', response_message: '🏨 *Hotel Pet*\n\nDeixe seu pet conosco com tranquilidade!\n\n🐕 *Diária Cães*\nP: R$ 60 | M: R$ 80 | G: R$ 100\n\n🐈 *Diária Gatos:* R$ 50\n\n✅ Inclui:\n• Alimentação\n• Passeios\n• Monitoramento 24h\n• Fotos diárias\n\n📅 Reserve com antecedência!', collect_data: false },
      { id: '5', text: '📱 Falar com atendente', description: 'Atendimento humano', action: 'transfer', next_step_id: '', response_message: '📱 Aguarde que já vamos te atender! 🐾\n\nEnquanto isso, me conta o nome do seu pet! 🐶🐱', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🐾 Ops, não entendi!\n\nDigite o *número* da opção (1, 2, 3, 4 ou 5).',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {},
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== ESCRITÓRIO DE ADVOCACIA =====================
const advocaciaTemplate: ProfessionalTemplate = {
  id: 'advocacia',
  name: 'Escritório de Advocacia',
  slug: 'advocacia',
  category: 'juridico',
  icon: '⚖️',
  color: 'from-slate-600 to-slate-800',
  description: 'Atendimento para escritórios de advocacia',
  keywords: ['advogado', 'processo', 'consulta', 'jurídico', 'direito', 'advocacia', 'oi', 'olá'],
  isFeatured: false,
  form: {
    name: 'Atendimento Advocacia',
    company_name: 'Oliveira & Associados Advocacia',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: 'Bom dia! ⚖️\n\nBem-vindo(a) ao escritório *{{empresa}}*.\n\nComo podemos ajudar?',
    afternoon_greeting: 'Boa tarde! ⚖️\n\nBem-vindo(a) ao escritório *{{empresa}}*.\n\nEstamos à disposição.',
    evening_greeting: 'Boa noite! ⚖️\n\nO escritório *{{empresa}}* está fechado.\n\nDeixe sua mensagem para retorno.',
    menu_title: '⚖️ Menu Advocacia',
    menu_description: 'Selecione uma opção:',
    menu_options: [
      { id: '1', text: '📋 Áreas de atuação', description: 'Nossas especialidades', action: 'message', next_step_id: '', response_message: '📋 *Áreas de Atuação*\n\n⚖️ Direito Civil\n👔 Direito Trabalhista\n🏠 Direito Imobiliário\n👨‍👩‍👧 Direito de Família\n💼 Direito Empresarial\n🛡️ Direito do Consumidor\n⚠️ Direito Criminal\n\nQual área você precisa?', collect_data: false },
      { id: '2', text: '📅 Agendar consulta', description: 'Marque atendimento', action: 'message', next_step_id: '', response_message: '📅 *Agendar Consulta*\n\n💰 Consulta inicial: R$ 200\n(valor deduzido se contratar)\n\n📍 Presencial ou Online\n⏰ Seg-Sex: 9h às 18h\n\nPara agendar, informe:\n• Seu nome\n• Área do direito\n• Breve descrição do caso\n• Data de preferência', collect_data: true, data_type: 'name', data_variable: 'nome_cliente' },
      { id: '3', text: '📂 Acompanhar processo', description: 'Status do seu caso', action: 'message', next_step_id: '', response_message: '📂 *Acompanhar Processo*\n\nPara consultar seu processo:\n\n• Informe seu CPF\n• Ou número do processo\n\n🔐 Suas informações são sigilosas.\n\nAguarde que verificamos para você.', collect_data: true, data_type: 'cpf', data_variable: 'cpf_cliente' },
      { id: '4', text: '📍 Localização', description: 'Nosso endereço', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nAv. Paulista, 1000 - Sala 1502\nBela Vista - São Paulo/SP\n\n⏰ *Horário:*\nSeg-Sex: 9h às 18h\n\n🅿️ Estacionamento conveniado\n📞 (11) 3333-4444', collect_data: false },
      { id: '5', text: '👨‍💼 Falar com advogado', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '👨‍💼 Aguarde um momento.\n\nUm de nossos advogados irá atendê-lo.', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '⚖️ Desculpe, não compreendi.\n\nDigite apenas o *número* da opção desejada.',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {},
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== ESCOLA / CURSOS =====================
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
    morning_greeting: 'Bom dia! ☀️📚\n\nBem-vindo(a) ao *{{empresa}}*!\n\nVamos transformar seu futuro através da educação!',
    afternoon_greeting: 'Boa tarde! 🌤️📚\n\nBem-vindo(a) ao *{{empresa}}*!\n\nComo podemos ajudar?',
    evening_greeting: 'Boa noite! 🌙📚\n\nO *{{empresa}}* está fechado agora.\n\nDeixe sua mensagem para retorno!',
    menu_title: '📚 Menu Escola',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '📋 Cursos disponíveis', description: 'Conheça os cursos', action: 'message', next_step_id: '', response_message: '📋 *Nossos Cursos*\n\n💻 *Tecnologia*\nProgramação, Design, Marketing Digital\n\n📊 *Gestão*\nAdministração, RH, Finanças\n\n🌍 *Idiomas*\nInglês, Espanhol, Francês\n\n✨ *Profissionalizantes*\nAuxiliar Administrativo, Atendimento\n\n📱 Presencial e Online!\n\nQual área te interessa?', collect_data: false },
      { id: '2', text: '💰 Valores e mensalidades', description: 'Preços e formas', action: 'message', next_step_id: '', response_message: '💰 *Investimento*\n\n📚 *Cursos Livres*\nA partir de R$ 49/mês\n\n🎓 *Técnicos*\nA partir de R$ 199/mês\n\n🌍 *Idiomas*\nA partir de R$ 149/mês\n\n💳 *Formas de Pagamento:*\n• Boleto\n• Cartão (até 12x)\n• Pix (5% desconto)\n\n🎁 Matrícula GRÁTIS essa semana!', collect_data: false },
      { id: '3', text: '📝 Fazer matrícula', description: 'Quero me matricular', action: 'message', next_step_id: '', response_message: '📝 *Matrícula*\n\nÓtima escolha! 🎉\n\nPara se matricular, preciso de:\n• Seu nome completo\n• Curso de interesse\n• Turno (manhã/tarde/noite)\n\n📍 Ou compareça em nossa sede:\nRua da Educação, 500\n\n📞 (11) 99999-9999', collect_data: true, data_type: 'name', data_variable: 'nome_aluno' },
      { id: '4', text: '📅 Horários das aulas', description: 'Grade horária', action: 'message', next_step_id: '', response_message: '📅 *Horários*\n\n☀️ *Manhã:* 8h às 12h\n🌤️ *Tarde:* 14h às 18h\n🌙 *Noite:* 19h às 22h\n🏠 *Online:* Flexível\n\n📍 *Endereço:*\nRua da Educação, 500 - Centro\n\n🚌 Próximo ao metrô!', collect_data: false },
      { id: '5', text: '📱 Falar com secretaria', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '📱 Aguarde um momento!\n\nNossa secretaria já vai te atender! 📚✨', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '📚 Não entendi sua mensagem.\n\nDigite o *número* da opção desejada (1-5).',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {},
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// ===================== OFICINA MECÂNICA =====================
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
    evening_greeting: 'Boa noite! 🌙🔧\n\nO *{{empresa}}* está fechado.\n\n🚨 Guincho 24h: (11) 99999-9999',
    menu_title: '🔧 Menu Oficina',
    menu_description: 'Escolha uma opção:',
    menu_options: [
      { id: '1', text: '🛠️ Serviços e preços', description: 'O que fazemos', action: 'message', next_step_id: '', response_message: '🛠️ *Nossos Serviços*\n\n🛢️ Troca de óleo - R$ 89\n🔋 Revisão elétrica - R$ 150\n🎯 Alinhamento + Balanceamento - R$ 100\n🔧 Freios (pastilhas) - R$ 180\n❄️ Ar condicionado - R$ 120\n⚙️ Revisão completa - R$ 350\n\n🚗 Qual serviço você precisa?', collect_data: false },
      { id: '2', text: '📅 Agendar serviço', description: 'Marque horário', action: 'message', next_step_id: '', response_message: '📅 *Agendar Serviço*\n\nPara agendar, informe:\n\n• Seu nome\n• Modelo do veículo\n• Placa\n• Serviço desejado\n• Data/horário de preferência\n\n🚗 Leva e traz disponível!', collect_data: true, data_type: 'name', data_variable: 'nome_cliente' },
      { id: '3', text: '📊 Orçamento', description: 'Solicite orçamento', action: 'message', next_step_id: '', response_message: '📊 *Orçamento*\n\n📋 Orçamento GRÁTIS!\n\nMe informe:\n• Modelo e ano do veículo\n• Problema ou serviço\n• Fotos (se possível)\n\n⏰ Retornamos em até 2 horas!', collect_data: true, data_type: 'custom', data_variable: 'veiculo' },
      { id: '4', text: '📍 Localização', description: 'Onde estamos', action: 'message', next_step_id: '', response_message: '📍 *Localização*\n\nAv. dos Automóveis, 1500\nJardim Industrial\n\n⏰ *Horário:*\nSeg-Sex: 8h às 18h\nSábado: 8h às 13h\n\n🅿️ Estacionamento próprio\n🚌 Próximo ao ponto de ônibus\n\n📞 (11) 3333-4444\n🚨 Guincho: (11) 99999-9999', collect_data: false },
      { id: '5', text: '📱 Falar com mecânico', description: 'Atendimento', action: 'transfer', next_step_id: '', response_message: '📱 Beleza! Já vou te passar para nosso consultor!\n\n🔧 Aguarde um momento...', collect_data: false },
    ],
    max_attempts: 3,
    fallback_message: '🔧 Não entendi!\n\nDigita o *número* da opção (1, 2, 3, 4 ou 5).',
    fail_action: 'transfer',
    ai_mode: 'disabled',
  },
  flowConfig: {
    version: '2.0',
    startStep: 'greeting',
    steps: {},
    greetings: { morning: '', afternoon: '', evening: '' },
  },
};

// Export all templates
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

export const getTemplatesByCategory = (category: string): ProfessionalTemplate[] => {
  return PROFESSIONAL_TEMPLATES.filter(t => t.category === category);
};
