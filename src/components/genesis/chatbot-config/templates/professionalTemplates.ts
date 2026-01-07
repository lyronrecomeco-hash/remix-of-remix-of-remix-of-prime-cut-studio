// Templates Profissionais Empresariais - V3 FINAL
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
  description: 'Atendimento humanizado para clínicas, consultórios e hospitais',
  keywords: ['consulta', 'médico', 'agendar', 'exame', 'doutor', 'saúde', 'clínica', 'oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'marcar', 'resultado'],
  isFeatured: true,
  form: {
    name: 'Atendimento Clínica',
    company_name: 'Clínica São Lucas',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia!* Seja bem-vindo(a) à *{{empresa}}*

Somos especializados em cuidar da sua saúde com carinho, dedicação e profissionalismo.

Nossa equipe está pronta para atendê-lo(a)! 💙

Como posso ajudar você hoje?`,
    afternoon_greeting: `🌤️ *Boa tarde!* Seja bem-vindo(a) à *{{empresa}}*

É um prazer ter você aqui! Estamos prontos para cuidar do que mais importa: *sua saúde*.

Como posso auxiliá-lo(a)?`,
    evening_greeting: `🌙 *Boa noite!* Obrigado por entrar em contato com a *{{empresa}}*

Nosso atendimento presencial encerrou, mas deixe sua mensagem que retornaremos logo pela manhã!

🚨 *Emergências:* Ligue 192 (SAMU) ou 193 (Bombeiros)

Cuide-se bem! 💙`,
    menu_title: '🏥 *Central de Atendimento*',
    menu_description: 'Escolha a opção que melhor atende sua necessidade:',
    menu_options: [
      { 
        id: '1', 
        text: '📅 Agendar Consulta', 
        description: 'Marque com nossos especialistas', 
        action: 'message', 
        next_step_id: 'agendar', 
        response_message: `📅 *Agendamento de Consulta*

Ficamos felizes em atendê-lo(a)! 

🩺 *Nossas Especialidades:*
• Clínico Geral
• Cardiologia  
• Ortopedia
• Pediatria
• Ginecologia/Obstetrícia
• Dermatologia
• Neurologia
• Endocrinologia
• Oftalmologia
• Otorrinolaringologia

━━━━━━━━━━━━━━━━━━

Para agilizar seu agendamento, informe:

1️⃣ *Especialidade* desejada
2️⃣ *Data e turno* de preferência (manhã/tarde)
3️⃣ *Convênio* ou Particular

📲 Nossa equipe confirmará seu horário em até *30 minutos*!

💙 Estamos aqui para cuidar de você!`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'dados_agendamento' 
      },
      { 
        id: '2', 
        text: '🔄 Remarcar ou Cancelar', 
        description: 'Altere seu agendamento existente', 
        action: 'message', 
        next_step_id: 'remarcar', 
        response_message: `🔄 *Remarcação ou Cancelamento*

Sem problemas! Estamos aqui para facilitar.

Para localizar seu agendamento, informe:
• ✏️ Seu *nome completo*
• 🆔 Seu *CPF*
• 📅 *Data* da consulta atual

━━━━━━━━━━━━━━━━━━

⚠️ *Importante:*
• Cancelamentos com *menos de 24h* de antecedência podem gerar taxa
• Não comparecimento (*no-show*) pode bloquear novos agendamentos

💡 Sugerimos *remarcar* ao invés de cancelar para não perder sua vaga!

Aguardando seus dados... 📋`, 
        collect_data: true, 
        data_type: 'name', 
        data_variable: 'nome_paciente' 
      },
      { 
        id: '3', 
        text: '📋 Resultados de Exames', 
        description: 'Consulte seus resultados', 
        action: 'message', 
        next_step_id: 'resultados', 
        response_message: `📋 *Central de Resultados*

Seus exames estão em boas mãos! 🔐

Para consultar seus resultados, precisamos confirmar sua identidade:

• ✏️ *Nome completo*
• 🆔 *CPF*
• 📅 *Data de nascimento*

━━━━━━━━━━━━━━━━━━

💻 *Acesso Online 24h:*
Você também pode acessar pelo portal:
👉 www.clinica.com.br/resultados

⏰ *Prazos de Liberação:*
• Exames laboratoriais: *até 48h*
• Exames de imagem: *até 5 dias úteis*
• Laudos especiais: *consulte recepção*

🔒 Sua privacidade é nossa prioridade!`, 
        collect_data: true, 
        data_type: 'cpf', 
        data_variable: 'cpf_paciente' 
      },
      { 
        id: '4', 
        text: '💊 Receitas e Atestados', 
        description: 'Solicite documentos médicos', 
        action: 'message', 
        next_step_id: 'documentos', 
        response_message: `💊 *Solicitação de Documentos*

Como podemos ajudar?

📄 *Receitas (renovação):*
• Envie foto da receita anterior
• Informe o medicamento e dosagem
• Prazo: *até 48h úteis*

📋 *Atestados:*
• Disponíveis em até *24h* após consulta
• Retire na recepção ou solicite por e-mail

━━━━━━━━━━━━━━━━━━

⚠️ *Atenção:*
• Renovações apenas para pacientes com consulta nos últimos *6 meses*
• Receitas de *medicamentos controlados* exigem consulta presencial
• Algumas solicitações podem requerer avaliação médica

👨‍⚕️ Qual documento você precisa?`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '👨‍⚕️ Atendimento Humano', 
        description: 'Falar com nossa equipe', 
        action: 'transfer', 
        next_step_id: 'transfer', 
        response_message: `👨‍⚕️ *Transferindo para Atendente*

Um de nossos atendentes irá te ajudar em instantes!

⏰ *Horário de Atendimento:*
• Segunda a Sexta: 7h às 19h
• Sábado: 7h às 12h
• Domingo: Fechado

━━━━━━━━━━━━━━━━━━

🚨 *Emergências:*
• SAMU: 192
• Bombeiros: 193

Aguarde um momento... 💙`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `🤔 Desculpe, não consegui entender sua mensagem.

Por favor, digite apenas o *número* da opção desejada:

1️⃣ Agendar Consulta
2️⃣ Remarcar/Cancelar
3️⃣ Resultados de Exames
4️⃣ Receitas e Atestados
5️⃣ Atendimento Humano

Estou aqui para ajudar! 💙`,
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é a assistente virtual da clínica médica {{empresa}}.

PERSONALIDADE:
- Empática, acolhedora e profissional
- Transmite confiança, cuidado e segurança
- Usa linguagem clara e acessível
- Demonstra genuína preocupação com o bem-estar do paciente

SEU PAPEL:
- Auxiliar pacientes com agendamentos, dúvidas e orientações gerais
- Coletar informações necessárias (nome, especialidade, data, convênio)
- Orientar sobre procedimentos e preparo para exames
- Direcionar para atendente humano quando necessário

INFORMAÇÕES DA CLÍNICA:
- Especialidades: Clínico Geral, Cardiologia, Ortopedia, Pediatria, Ginecologia, Dermatologia, Neurologia, Endocrinologia
- Horário: Segunda a Sexta 7h-19h, Sábado 7h-12h
- Convênios: Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro, Particular
- Endereço: {{endereco}}
- Telefone: {{telefone}}

REGRAS FUNDAMENTAIS:
❌ NUNCA invente horários disponíveis ou confirme agendamentos
❌ NUNCA dê diagnósticos, orientações médicas ou prescrições
❌ NUNCA minimize sintomas relatados pelo paciente
✅ Para EMERGÊNCIAS, direcione IMEDIATAMENTE para 192 (SAMU) ou 193 (Bombeiros)
✅ Sempre confirme informações antes de finalizar qualquer solicitação
✅ Seja gentil e paciente com pessoas ansiosas ou preocupadas
✅ Quando em dúvida, transfira para atendimento humano`,
    ai_temperature: 0.4,
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
        message: '🏥 *Central de Atendimento*\n\nEscolha uma opção:', 
        options: [
          { id: '1', text: '📅 Agendar Consulta', next: 'agendar' },
          { id: '2', text: '🔄 Remarcar/Cancelar', next: 'remarcar' },
          { id: '3', text: '📋 Resultados de Exames', next: 'resultados' },
          { id: '4', text: '💊 Receitas e Atestados', next: 'documentos' },
          { id: '5', text: '👨‍⚕️ Atendimento Humano', next: 'transfer' },
        ]
      },
      agendar: { id: 'agendar', type: 'input', message: '📅 Informe a especialidade, data e turno desejados.', input_type: 'custom', input_variable: 'dados_agendamento', next: 'confirm_agendar' },
      confirm_agendar: { id: 'confirm_agendar', type: 'text', message: '✅ Solicitação recebida!\n\nNossa equipe entrará em contato em até 30 minutos para confirmar.\n\n💙 Obrigado por escolher a {{empresa}}!', next: 'transfer' },
      remarcar: { id: 'remarcar', type: 'input', message: '🔄 Informe seu nome e CPF:', input_type: 'name', input_variable: 'nome_paciente', next: 'transfer' },
      resultados: { id: 'resultados', type: 'input', message: '📋 Informe seu CPF:', input_type: 'cpf', input_variable: 'cpf_paciente', next: 'transfer' },
      documentos: { id: 'documentos', type: 'text', message: '💊 Envie os detalhes da solicitação. Prazo: até 48h úteis.', next: 'transfer' },
      transfer: { id: 'transfer', type: 'transfer', message: '👨‍⚕️ Transferindo para atendente...\n\nAguarde um momento!', transfer_message: 'Seu atendimento será continuado por nossa equipe.' },
      end: { id: 'end', type: 'end', message: '✅ Obrigado por confiar na {{empresa}}!\n\n💙 Cuide-se bem! Estamos sempre aqui para você.' },
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
  description: 'Atendimento moderno e estiloso para barbearias',
  keywords: ['corte', 'barba', 'cabelo', 'agendar', 'barbearia', 'barbeiro', 'oi', 'olá', 'degradê', 'fade', 'platinado', 'preço', 'valor'],
  isFeatured: true,
  form: {
    name: 'Atendimento Barbearia',
    company_name: 'Barbearia Premium',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *E aí, parceiro! Bom dia!*

Bem-vindo à *{{empresa}}* 💈

Aqui o visual vira referência! Bora dar um trato nesse estilo?

Como posso te ajudar? 🔥`,
    afternoon_greeting: `🔥 *Fala, mestre! Boa tarde!*

Bem-vindo à *{{empresa}}* 💈

Chegou a hora de ficar *na régua*! Nossos barbeiros estão prontos.

O que você precisa? ✂️`,
    evening_greeting: `🌙 *Boa noite, parceiro!*

A *{{empresa}}* tá fechada agora, mas sua mensagem é importante!

📅 *Funcionamento:*
Seg-Sex: 9h às 20h
Sábado: 9h às 18h

Deixa aí o que precisa que amanhã a gente resolve! 💈`,
    menu_title: '💈 *Menu da Barbearia*',
    menu_description: 'Escolhe aí o que precisa:',
    menu_options: [
      { 
        id: '1', 
        text: '✂️ Agendar Horário', 
        description: 'Marque seu corte agora', 
        action: 'message', 
        next_step_id: '', 
        response_message: `✂️ *Vamos Agendar!*

Show! Bora garantir seu horário 🔥

💈 *Nossos Serviços:*

*CORTES*
• Corte Masculino Clássico — R$ 45
• Degradê/Fade — R$ 50
• Navalhado Premium — R$ 55
• Corte Infantil (até 12 anos) — R$ 35

*BARBA*
• Barba Completa — R$ 30
• Barba Navalhada — R$ 35
• Desenho de Barba — R$ 40

*COMBOS* 🎯
• Corte + Barba — R$ 65
• Corte + Sobrancelha — R$ 55
• Combo Completo (Corte+Barba+Sobrancelha) — R$ 80

*EXTRAS*
• Sobrancelha — R$ 15
• Pigmentação Capilar — R$ 80
• Platinado/Luzes — R$ 120
• Hidratação Capilar — R$ 40
• Relaxamento — R$ 60

━━━━━━━━━━━━━━━━━━

Para agendar, me fala:
1️⃣ Qual serviço?
2️⃣ Dia e horário?
3️⃣ Prefere algum barbeiro?

💇 Bora! `, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '💰 Tabela de Preços', 
        description: 'Valores atualizados', 
        action: 'message', 
        next_step_id: '', 
        response_message: `💰 *Tabela de Preços*

✂️ *CORTES*
┣ Corte Masculino — R$ 45
┣ Degradê / Fade — R$ 50
┣ Navalhado Premium — R$ 55
┣ Corte Infantil — R$ 35
┗ Corte Social — R$ 40

🧔 *BARBA*
┣ Barba Completa — R$ 30
┣ Barba Navalhada — R$ 35
┗ Desenho de Barba — R$ 40

🎯 *COMBOS (MAIS PEDIDOS)*
┣ Corte + Barba — R$ 65 ⭐
┣ Corte + Sobrancelha — R$ 55
┗ Completo (tudo incluso) — R$ 80

✨ *TRATAMENTOS*
┣ Sobrancelha — R$ 15
┣ Pigmentação — R$ 80
┣ Platinado/Luzes — R$ 120
┣ Hidratação — R$ 40
┗ Relaxamento — R$ 60

━━━━━━━━━━━━━━━━━━

💳 *Formas de Pagamento:*
Pix • Cartão (Débito/Crédito) • Dinheiro

🎁 *Programa Fidelidade:*
A cada 10 cortes, o próximo é *GRÁTIS*!

Bora agendar? 💈`, 
        collect_data: false 
      },
      { 
        id: '3', 
        text: '👨‍🦱 Nossa Equipe', 
        description: 'Conheça os barbeiros', 
        action: 'message', 
        next_step_id: '', 
        response_message: `👨‍🦱 *Nossa Equipe de Barbeiros*

Só profissional de elite aqui! 🔥

━━━━━━━━━━━━━━━━━━

*JOÃO SILVA* — Especialista em Degradê
⭐ 4.9 (250+ avaliações)
📅 Seg, Ter, Qua, Sex
🏆 "O mestre do fade perfeito"

*CARLOS SANTOS* — Mestre da Barba
⭐ 4.8 (200+ avaliações)
📅 Ter, Qua, Qui, Sáb
🏆 "Barba navalhada impecável"

*PEDRO OLIVEIRA* — Cortes Clássicos
⭐ 4.9 (220+ avaliações)
📅 Seg, Qua, Sex, Sáb
🏆 "Elegância e tradição"

*LUCAS COSTA* — Transformações
⭐ 4.7 (180+ avaliações)
📅 Ter, Qui, Sex, Sáb
🏆 "Platinado e pigmentação"

━━━━━━━━━━━━━━━━━━

Qual barbeiro você prefere?
Me fala que já agendo! 📅`, 
        collect_data: false 
      },
      { 
        id: '4', 
        text: '📍 Localização', 
        description: 'Endereço e horários', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📍 *Como Chegar*

*Endereço:*
Rua das Barbearias, 123 - Centro
(Próximo à Praça Central)

⏰ *Horário de Funcionamento:*
┣ Segunda a Sexta: 9h às 20h
┣ Sábado: 9h às 18h
┗ Domingo: Fechado

━━━━━━━━━━━━━━━━━━

🅿️ Estacionamento GRATUITO
♿ Ambiente acessível
☕ Cerveja e café cortesia
📺 TV com esportes
🎮 Videogame na espera

📱 WhatsApp: {{telefone}}
📸 Instagram: @barbeariapremium

Chega mais, parceiro! Te esperamos 🤙`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '📱 Falar no WhatsApp', 
        description: 'Atendimento direto', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `📱 *Beleza, parceiro!*

Já vou te passar pro nosso atendente confirmar seu horário!

⏱️ Tempo médio de resposta: 5 minutos

Aguarda aí que é rapidinho! 🤙💈`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `😅 Não entendi, parceiro!

Digita só o *número* da opção:

1️⃣ Agendar Horário
2️⃣ Tabela de Preços
3️⃣ Nossa Equipe
4️⃣ Localização
5️⃣ Falar no WhatsApp

Tô aqui! 💈`,
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
      agendar: { id: 'agendar', type: 'text', message: '✂️ Me diz qual serviço, data e barbeiro!', next: 'transfer' },
      precos: { id: 'precos', type: 'text', message: '💰 Tabela enviada!', next: 'main_menu' },
      barbeiros: { id: 'barbeiros', type: 'text', message: '👨‍🦱 Qual barbeiro você prefere?', next: 'transfer' },
      endereco: { id: 'endereco', type: 'text', message: '📍 Endereço enviado!', next: 'main_menu' },
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
  description: 'Atendimento gastronômico para restaurantes com delivery e reservas',
  keywords: ['cardápio', 'pedido', 'delivery', 'reserva', 'restaurante', 'comida', 'oi', 'olá', 'menu', 'prato', 'almoço', 'jantar'],
  isFeatured: true,
  form: {
    name: 'Atendimento Restaurante',
    company_name: 'Restaurante Sabor & Arte',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia!* Seja bem-vindo(a) ao *{{empresa}}* 🍳

Nosso café da manhã está imperdível hoje!

☕ Venha começar o dia com sabor e energia.

Como posso ajudar?`,
    afternoon_greeting: `🌤️ *Boa tarde!* Seja bem-vindo(a) ao *{{empresa}}* 🍽️

🍝 *Almoço Executivo:* R$ 34,90
(Entrada + Prato Principal + Bebida)

Está com fome? Vamos resolver isso! 😋`,
    evening_greeting: `🌙 *Boa noite!* Seja bem-vindo(a) ao *{{empresa}}* 🍷

Que tal um jantar especial hoje?

🕯️ Ambiente aconchegante te esperando!

Como posso ajudar?`,
    menu_title: '🍽️ *Menu do Restaurante*',
    menu_description: 'O que deseja hoje?',
    menu_options: [
      { 
        id: '1', 
        text: '📋 Ver Cardápio', 
        description: 'Conheça nossos pratos', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📋 *Nosso Cardápio*

🥗 *ENTRADAS*
┣ Salada Caesar — R$ 28
┣ Carpaccio de Carne — R$ 42
┣ Bruschetta Italiana — R$ 24
┣ Sopa do Dia — R$ 22
┗ Ceviche de Peixe — R$ 38

🍝 *PRATOS PRINCIPAIS*
┣ Filé à Parmegiana (400g) — R$ 58
┣ Salmão Grelhado c/ Legumes — R$ 75
┣ Risoto de Cogumelos Frescos — R$ 52
┣ Massa Carbonara Artesanal — R$ 45
┣ Picanha na Brasa (serve 2) — R$ 98
┣ Moqueca de Camarão — R$ 85
┗ Strogonoff de Filé — R$ 48

🍰 *SOBREMESAS*
┣ Petit Gateau — R$ 32
┣ Tiramisù — R$ 28
┣ Cheesecake NY — R$ 26
┣ Sorvete Artesanal (3 bolas) — R$ 22
┗ Pudim de Leite — R$ 18

🍹 *BEBIDAS*
┣ Sucos Naturais — R$ 14
┣ Refrigerantes — R$ 8
┣ Água Mineral — R$ 6
┣ Vinhos (taça) — a partir de R$ 28
┗ Chopp 500ml — R$ 16

━━━━━━━━━━━━━━━━━━

📱 *Cardápio completo com fotos:*
👉 menu.restaurante.com.br

O que te apetece? 😋`, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '🛵 Fazer Pedido Delivery', 
        description: 'Receba em casa', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🛵 *Delivery - Sabor na Sua Casa!*

📍 *Área de Entrega:* até 8km
⏱️ *Tempo Médio:* 40-60 minutos

💰 *Taxa de Entrega:*
┣ Até 3km — R$ 5
┣ 3km a 5km — R$ 8
┗ 5km a 8km — R$ 12

🎁 *FRETE GRÁTIS* em pedidos acima de R$ 100!

━━━━━━━━━━━━━━━━━━

📝 *Para pedir, informe:*

1️⃣ Seu *endereço completo* (rua, número, bairro)
2️⃣ *Itens do pedido*
3️⃣ *Observações* (ponto da carne, sem cebola, etc)
4️⃣ *Forma de pagamento*

💳 *Aceitamos:*
Pix • Cartão na entrega • Dinheiro (informe se precisa de troco)

━━━━━━━━━━━━━━━━━━

📲 *Ou peça pelo App:*
iFood: @saborarte
Rappi: @restaurantesaborarte

Me manda seu pedido! 🍽️`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'endereco_entrega' 
      },
      { 
        id: '3', 
        text: '📅 Fazer Reserva', 
        description: 'Reserve sua mesa', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📅 *Reserva de Mesa*

Será um prazer recebê-lo(a)! 🍷

Para reservar, informe:

👤 *Nome* para reserva
📆 *Data* desejada
⏰ *Horário*
👥 *Quantidade* de pessoas
🎉 *Ocasião especial?* (aniversário, negócios, romântico...)

━━━━━━━━━━━━━━━━━━

📍 *Capacidade:*
┣ Salão Principal: até 80 pessoas
┣ Área VIP: até 20 pessoas
┗ Área Externa: até 30 pessoas

🎊 *Eventos e Festas:*
Consulte disponibilidade para eventos privativos!

💡 *Importante:*
• Reservas confirmadas até *2h antes*
• Tolerância de *15 minutos* para chegada
• Cancelamento com *4h de antecedência*

Qual será a ocasião? 🥂`, 
        collect_data: true, 
        data_type: 'name', 
        data_variable: 'nome_reserva' 
      },
      { 
        id: '4', 
        text: '⏰ Horário e Local', 
        description: 'Como chegar', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📍 *Localização e Horários*

*Endereço:*
Rua da Gastronomia, 456 - Centro
(Em frente à Praça das Flores)

⏰ *Horário de Funcionamento:*
┣ Segunda a Quinta: 11h às 23h
┣ Sexta e Sábado: 11h às 01h
┗ Domingo: 11h às 16h

━━━━━━━━━━━━━━━━━━

🍳 *Almoço Executivo:*
Segunda a Sexta, 11h às 15h
*R$ 34,90* (entrada + prato + bebida)

━━━━━━━━━━━━━━━━━━

🅿️ Estacionamento próprio *GRATUITO*
♿ Totalmente acessível
👶 Kids Space disponível
🐕 Pet Friendly (área externa)
📶 WiFi gratuito

📱 {{telefone}}
📸 @restaurantesaborarte

Te esperamos! 🍽️`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '👨‍🍳 Falar com Atendente', 
        description: 'Atendimento humano', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `👨‍🍳 *Transferindo para Atendimento*

Nosso garçom virtual está te passando para a equipe!

⏱️ Aguarde um momento...

🍽️ Obrigado pela preferência!`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `🤔 Ops! Não entendi sua mensagem.

Por favor, digite o *número* da opção:

1️⃣ Ver Cardápio
2️⃣ Delivery
3️⃣ Fazer Reserva
4️⃣ Horário e Local
5️⃣ Falar com Atendente

Estou aqui para ajudar! 🍽️`,
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é o garçom virtual do restaurante {{empresa}}.

PERSONALIDADE:
- Acolhedor, simpático e apetitoso
- Sugere pratos de forma atraente e irresistível
- Cria desejo pela experiência gastronômica
- Usa descrições sensoriais (aromas, texturas, sabores)

INFORMAÇÕES DO RESTAURANTE:
- Especialidade: Culinária contemporânea brasileira
- Horário: Seg-Qui 11h-23h, Sex-Sáb 11h-01h, Dom 11h-16h
- Almoço Executivo: R$ 34,90 (Seg-Sex 11h-15h)
- Delivery: até 8km, 40-60min, taxa R$ 5-12
- Frete grátis acima de R$ 100

VOCÊ DEVE:
- Descrever pratos de forma apetitosa
- Sugerir harmonizações (vinho, sobremesa)
- Coletar pedidos completos
- Verificar área de entrega para delivery

REGRAS:
❌ NUNCA confirme reservas ou pedidos sem transferir para atendente
❌ NUNCA invente pratos ou preços
✅ Sempre pergunte sobre alergias e restrições alimentares
✅ Para pedidos delivery, colete endereço completo`,
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
  description: 'Atendimento elegante para salões de beleza e estética',
  keywords: ['cabelo', 'unha', 'manicure', 'corte', 'coloração', 'salão', 'beleza', 'oi', 'olá', 'escova', 'make', 'maquiagem', 'noiva'],
  isFeatured: true,
  form: {
    name: 'Atendimento Salão',
    company_name: 'Studio Beleza Feminina',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia, linda!* 💕

Bem-vinda ao *{{empresa}}*! ✨

Vamos cuidar da sua beleza hoje? Nossos profissionais estão prontos para te deixar ainda mais maravilhosa!

Como posso te ajudar? 💅`,
    afternoon_greeting: `🌸 *Boa tarde, querida!* 💕

Bem-vinda ao *{{empresa}}*! ✨

Pronta para um momento só seu? Relaxe e deixe a gente cuidar de você!

O que deseja? 💅`,
    evening_greeting: `🌙 *Boa noite, linda!* 💕

O *{{empresa}}* está fechado agora, mas sua mensagem é muito importante!

📅 *Funcionamento:*
Seg-Sex: 9h às 20h
Sábado: 9h às 18h

Deixa sua mensagem que amanhã cedo retornamos!

💕 Cuide-se! ✨`,
    menu_title: '💅 *Menu do Salão*',
    menu_description: 'Escolha como quer ficar ainda mais linda:',
    menu_options: [
      { 
        id: '1', 
        text: '💇‍♀️ Agendar Horário', 
        description: 'Marque seu atendimento', 
        action: 'message', 
        next_step_id: '', 
        response_message: `💇‍♀️ *Vamos Agendar seu Momento!*

Qual serviço você deseja? ✨

*CABELO* 💇‍♀️
┣ Corte Feminino — R$ 85
┣ Corte + Escova — R$ 120
┣ Escova Modelada — R$ 55
┣ Escova Progressiva — a partir de R$ 280
┣ Hidratação Profunda — R$ 75
┣ Cauterização — R$ 95
┣ Botox Capilar — R$ 160
┗ Penteado — a partir de R$ 80

*COLORAÇÃO* 🎨
┣ Coloração Global — a partir de R$ 180
┣ Mechas/Luzes — a partir de R$ 220
┣ Balayage/Ombré — a partir de R$ 380
┣ Platinado — a partir de R$ 350
┗ Tonalização — R$ 80

*UNHAS* 💅
┣ Manicure — R$ 38
┣ Pedicure — R$ 45
┣ Mani + Pedi — R$ 75
┣ Unhas em Gel — R$ 130
┣ Fibra de Vidro — R$ 180
┗ Nail Art — a partir de R$ 15

*ESTÉTICA* ✨
┣ Sobrancelha — R$ 28
┣ Sobrancelha + Buço — R$ 45
┣ Design + Henna — R$ 55
┣ Limpeza de Pele — R$ 160
┗ Maquiagem Social — R$ 130

━━━━━━━━━━━━━━━━━━

Me fala:
1️⃣ Qual serviço?
2️⃣ Dia e horário?
3️⃣ Profissional preferida?

Vou reservar pra você! 💕`, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '💰 Tabela de Preços', 
        description: 'Valores completos', 
        action: 'message', 
        next_step_id: '', 
        response_message: `💰 *Tabela de Preços Completa*

💇‍♀️ *CABELO*
┣ Corte Feminino — R$ 85
┣ Corte + Escova — R$ 120
┣ Escova Modelada — R$ 55
┣ Escova Progressiva — a partir R$ 280
┣ Hidratação Profunda — R$ 75
┣ Botox Capilar — R$ 160
┗ Penteado — a partir R$ 80

🎨 *COLORAÇÃO*
┣ Coloração Global — a partir R$ 180
┣ Mechas/Luzes — a partir R$ 220
┣ Balayage/Ombré — a partir R$ 380
┣ Platinado — a partir R$ 350
┣ Retoque de Raiz — R$ 120
┗ Tonalização — R$ 80

💅 *UNHAS*
┣ Manicure — R$ 38
┣ Pedicure — R$ 45
┣ Mani + Pedi — R$ 75
┣ Esmaltação em Gel — R$ 60
┣ Unhas em Gel — R$ 130
┣ Fibra de Vidro — R$ 180
┗ Alongamento — R$ 200

✨ *ESTÉTICA*
┣ Sobrancelha — R$ 28
┣ Design + Henna — R$ 55
┣ Depilação (consulte áreas)
┣ Limpeza de Pele — R$ 160
┣ Maquiagem Social — R$ 130
┗ Maquiagem Noiva — R$ 300

━━━━━━━━━━━━━━━━━━

💳 *Pagamento:*
Pix • Cartão (até 3x) • Dinheiro

🎁 *Na 5ª visita, 15% OFF!*

Qual serviço te interessa? 💕`, 
        collect_data: false 
      },
      { 
        id: '3', 
        text: '👰 Pacotes para Noivas', 
        description: 'Dia da Noiva especial', 
        action: 'message', 
        next_step_id: '', 
        response_message: `👰 *Pacotes Especiais para Noivas*

Seu dia merece ser perfeito! 💍✨

━━━━━━━━━━━━━━━━━━

👑 *DIA DA NOIVA COMPLETO* — R$ 750
┣ ✂️ Penteado Exclusivo
┣ 💄 Maquiagem HD Profissional
┣ 💅 Manicure + Pedicure
┣ ✨ Sobrancelha
┗ 🎁 Cronograma Capilar (1 mês antes)

💕 *NOIVA ESSENCIAL* — R$ 480
┣ ✂️ Penteado
┣ 💄 Maquiagem HD
┗ 💅 Manicure

💐 *PACOTE MADRINHAS* — R$ 380/pessoa
┣ Penteado + Maquiagem

👩‍👧 *MÃE DA NOIVA* — R$ 320
┣ Escova + Maquiagem

━━━━━━━━━━━━━━━━━━

🎁 *BÔNUS EXCLUSIVOS:*
✅ Teste de make GRÁTIS
✅ Ensaio de penteado incluso
✅ Kit emergência no dia
✅ Atendimento a domicílio (consulte)
✅ Fotos profissionais durante a produção

📅 Reserve com *antecedência!*
Datas de alta temporada lotam rápido.

💕 Qual a data do seu casamento?`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'data_casamento' 
      },
      { 
        id: '4', 
        text: '📍 Localização', 
        description: 'Como chegar', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📍 *Onde Estamos*

*Endereço:*
Rua da Beleza, 789 - Centro
(Próximo ao Shopping Central)

⏰ *Horários:*
┣ Segunda a Sexta: 9h às 20h
┣ Sábado: 9h às 18h
┗ Domingo: Fechado

━━━━━━━━━━━━━━━━━━

🅿️ Estacionamento conveniado (2h cortesia)
♿ Ambiente acessível
☕ Café, chá e água à vontade
📶 WiFi gratuito
📺 Revistas e Netflix disponíveis

📱 {{telefone}}
📸 Instagram: @studiobelezafeminina

💕 Te esperamos para cuidar de você! ✨`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '💬 Falar com Atendente', 
        description: 'Atendimento humano', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `💬 *Transferindo para Atendimento*

Aguarde um momento que nossa equipe já vai te atender com todo carinho! 💕

✨ Obrigada por escolher o {{empresa}}!`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `💕 Ops! Não entendi sua mensagem.

Por favor, digite apenas o *número* da opção:

1️⃣ Agendar Horário
2️⃣ Tabela de Preços
3️⃣ Pacotes Noivas
4️⃣ Localização
5️⃣ Falar com Atendente

Estou aqui para te ajudar! ✨`,
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
  description: 'Atendimento motivacional para academias e estúdios fitness',
  keywords: ['academia', 'treino', 'musculação', 'personal', 'matrícula', 'mensalidade', 'oi', 'olá', 'plano', 'aula'],
  isFeatured: true,
  form: {
    name: 'Atendimento Academia',
    company_name: 'Power Fit Academia',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia, campeão(ã)!* 💪

Bem-vindo(a) à *{{empresa}}*!

Bora começar o dia com ENERGIA TOTAL? 🔥

Seu corpo agradece cada treino. Como posso te ajudar?`,
    afternoon_greeting: `🔥 *Boa tarde!* 💪

Bem-vindo(a) à *{{empresa}}*!

Ainda dá tempo de treinar pesado hoje! Qual é a meta?

Como posso te ajudar a evoluir?`,
    evening_greeting: `🌙 *Boa noite, guerreiro(a)!* 💪

A *{{empresa}}* está esperando você!

Nunca é tarde para se superar. O único treino ruim é aquele que você não faz!

O que você precisa? 🏋️`,
    menu_title: '💪 *Menu da Academia*',
    menu_description: 'Escolha como quer evoluir:',
    menu_options: [
      { 
        id: '1', 
        text: '📋 Planos e Preços', 
        description: 'Conheça nossas opções', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📋 *Planos Power Fit*

Invista na sua saúde! 💪

━━━━━━━━━━━━━━━━━━

🥉 *PLANO MENSAL* — R$ 109/mês
┣ ✅ Musculação + Cardio
┣ ✅ Avaliação física básica
┗ ⏰ Acesso: horário comercial

🥈 *PLANO TRIMESTRAL* — R$ 89/mês
*(3x de R$ 267)*
┣ ✅ Tudo do mensal
┣ ✅ Avaliação física completa
┣ ✅ 1 sessão de personal GRÁTIS
┗ ⏰ Acesso livre (6h-23h)

🥇 *PLANO ANUAL* — R$ 69/mês ⭐
*(12x de R$ 69)*
┣ ✅ Tudo do trimestral
┣ ✅ Personal 1x/mês incluso
┣ ✅ Nutricionista (1 consulta)
┣ ✅ Armário individual
┗ 🏆 MELHOR CUSTO-BENEFÍCIO!

👑 *PLANO PREMIUM* — R$ 169/mês
┣ ✅ TUDO liberado
┣ ✅ Aulas coletivas ilimitadas
┣ ✅ Personal 2x/mês
┣ ✅ Nutricionista mensal
┣ ✅ Sauna e piscina
┗ ✅ Acesso 24h

━━━━━━━━━━━━━━━━━━

💳 *Pagamento:*
Pix • Cartão (até 12x) • Boleto • Débito recorrente

🎁 *PRIMEIRA SEMANA GRÁTIS!*
Venha conhecer sem compromisso.

Qual plano combina com você? 💪`, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '🆕 Fazer Matrícula', 
        description: 'Quero começar agora', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🆕 *Vamos Transformar Sua Vida!* 💪

Show! Você já tomou a decisão mais importante: COMEÇAR! 🔥

📍 *Para se matricular:*
Compareça em nossa unidade com:
• RG e CPF
• Comprovante de residência
• Cartão ou dados bancários

━━━━━━━━━━━━━━━━━━

🎁 *PROMOÇÃO DA SEMANA:*
✅ Matrícula *GRÁTIS* (economia de R$ 100!)
✅ Camiseta Power Fit exclusiva
✅ Avaliação física completa
✅ 3 sessões de personal GRÁTIS

━━━━━━━━━━━━━━━━━━

📲 Ou me passa seus dados que nossa equipe entra em contato:

• Nome completo
• WhatsApp
• Melhor horário para ligar

🏆 Bora mudar de vida? Estamos te esperando!`, 
        collect_data: true, 
        data_type: 'name', 
        data_variable: 'nome_interessado' 
      },
      { 
        id: '3', 
        text: '⏰ Horários das Aulas', 
        description: 'Grade de aulas coletivas', 
        action: 'message', 
        next_step_id: '', 
        response_message: `⏰ *Grade de Aulas Coletivas*

Diversão garantida! 🎯

━━━━━━━━━━━━━━━━━━

🧘 *YOGA*
Seg/Qua/Sex — 7h e 19h

🚴 *SPINNING*
Ter/Qui — 7h, 12h e 19h

💃 *ZUMBA*
Seg/Qua — 20h

🏋️ *FUNCIONAL*
Ter/Qui/Sáb — 8h e 18h

🥊 *MUAY THAI*
Seg/Qua/Sex — 21h

🧘‍♀️ *PILATES*
Ter/Qui — 9h e 17h

💪 *CROSSFIT*
Seg-Sex — 6h e 20h

🤸 *GAP (Glúteos)*
Ter/Qui — 19h

🧘 *ALONGAMENTO*
Seg/Qua/Sex — 12h

━━━━━━━━━━━━━━━━━━

📍 *Funcionamento Academia:*
┣ Seg-Sex: 6h às 23h
┣ Sábado: 8h às 14h
┗ Feriados: 8h às 12h

*Aulas inclusas no plano Premium!*
Outros planos: R$ 50/mês adicional.

Qual aula te interessa? 💪`, 
        collect_data: false 
      },
      { 
        id: '4', 
        text: '👤 Personal Trainer', 
        description: 'Treino personalizado', 
        action: 'message', 
        next_step_id: '', 
        response_message: `👤 *Personal Trainer*

Resultados REAIS com treino 100% personalizado! 🎯

━━━━━━━━━━━━━━━━━━

📊 *AVULSO*
R$ 90/sessão

📦 *PACOTE 8 SESSÕES*
R$ 640 (R$ 80/cada)
Economia de R$ 80!

📦 *PACOTE 12 SESSÕES* ⭐
R$ 840 (R$ 70/cada)
Economia de R$ 240!

📦 *PACOTE 20 SESSÕES*
R$ 1.200 (R$ 60/cada)
Economia de R$ 600!

━━━━━━━━━━━━━━━━━━

✅ *Todos os pacotes incluem:*
• Avaliação física completa
• Periodização personalizada
• Orientação nutricional básica
• Acompanhamento por app
• Ajustes semanais
• Suporte por WhatsApp

🎁 *AULA EXPERIMENTAL GRÁTIS!*

━━━━━━━━━━━━━━━━━━

Qual seu objetivo?
• Emagrecimento
• Ganho de massa
• Condicionamento
• Reabilitação
• Performance

Me conta que indicamos o personal ideal! 💪`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '📱 Falar com Consultor', 
        description: 'Atendimento humano', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `📱 *Transferindo para Consultor*

Um de nossos consultores vai te ajudar a escolher o melhor caminho para seus objetivos!

💪 Aguarde um momento...

🏆 Bora transformar sua vida juntos!`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `💪 Não entendi sua mensagem!

Por favor, digite o *número* da opção:

1️⃣ Planos e Preços
2️⃣ Fazer Matrícula
3️⃣ Horários das Aulas
4️⃣ Personal Trainer
5️⃣ Falar com Consultor

Estou aqui para te ajudar a evoluir! 🔥`,
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
  description: 'Atendimento consultivo para imobiliárias e corretores',
  keywords: ['imóvel', 'casa', 'apartamento', 'alugar', 'comprar', 'vender', 'corretor', 'oi', 'olá', 'financiamento'],
  isFeatured: false,
  form: {
    name: 'Atendimento Imobiliária',
    company_name: 'Imobiliária Lar Perfeito',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia!* 🏠

Bem-vindo(a) à *{{empresa}}*!

Vamos encontrar o imóvel dos seus sonhos? Estamos aqui para realizar esse objetivo com você!

Como posso ajudar?`,
    afternoon_greeting: `🌤️ *Boa tarde!* 🏠

Bem-vindo(a) à *{{empresa}}*!

Pronto(a) para dar o próximo passo na sua jornada imobiliária?

Como posso auxiliar você?`,
    evening_greeting: `🌙 *Boa noite!* 🏠

A *{{empresa}}* está à disposição!

Deixe sua mensagem com seus dados e preferências que retornaremos amanhã bem cedo!

🔑 Seu novo lar está mais perto do que imagina!`,
    menu_title: '🏠 *Menu Imobiliária*',
    menu_description: 'Como podemos ajudar você?',
    menu_options: [
      { 
        id: '1', 
        text: '🔍 Buscar Imóvel', 
        description: 'Encontre seu imóvel ideal', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🔍 *Vamos Encontrar seu Imóvel Ideal!*

Para uma busca assertiva, me conta:

━━━━━━━━━━━━━━━━━━

1️⃣ *Objetivo:* Compra ou Aluguel?

2️⃣ *Tipo:*
• Casa
• Apartamento
• Sobrado
• Kitnet/Studio
• Comercial
• Terreno

3️⃣ *Localização:*
Quais bairros ou regiões?

4️⃣ *Características:*
• Quantos quartos? (Suítes?)
• Vagas de garagem?
• Área mínima (m²)?

5️⃣ *Faixa de Preço:*
• Mínimo: R$ ____
• Máximo: R$ ____

6️⃣ *Diferenciais desejados:*
• Condomínio fechado
• Piscina
• Varanda gourmet
• Pet friendly
• Mobiliado

━━━━━━━━━━━━━━━━━━

📲 Quanto mais detalhes, melhor será nossa busca!

Pode me passar essas informações? 🏡`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'tipo_busca' 
      },
      { 
        id: '2', 
        text: '🏷️ Anunciar Imóvel', 
        description: 'Vender ou alugar seu imóvel', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🏷️ *Anuncie seu Imóvel Conosco!*

📊 *Avaliação GRATUITA* do seu imóvel!

━━━━━━━━━━━━━━━━━━

Para anunciar, precisamos de:
• Tipo do imóvel
• Endereço completo
• Metragem e quantidade de cômodos
• Valor pretendido (ou para avaliar)
• Fotos (mínimo 10 fotos)

━━━━━━━━━━━━━━━━━━

✅ *O que oferecemos:*
• Comissão competitiva do mercado
• Fotos profissionais *GRÁTIS*
• Anúncio em *15+ portais* imobiliários
• Tour virtual 360°
• Placas e faixas personalizadas
• Acompanhamento até a venda/locação
• Assessoria jurídica completa

💰 *Venda mais rápido:*
Nossos imóveis vendem em média em *45 dias*!

📅 Quer agendar uma visita de avaliação sem compromisso?`, 
        collect_data: false 
      },
      { 
        id: '3', 
        text: '📅 Agendar Visita', 
        description: 'Visite um imóvel', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📅 *Agendar Visita*

Perfeito! Nada melhor que ver pessoalmente! 🏡

Para agendar, informe:
• *Código ou endereço* do imóvel
• *Data* desejada
• *Horário* de preferência
• *Seu telefone* para confirmação

━━━━━━━━━━━━━━━━━━

🚗 *Nosso corretor te acompanha!*
📋 Leve documento com foto.

💡 *Dicas para a visita:*
• Visite em diferentes horários
• Avalie luminosidade natural
• Observe a vizinhança
• Verifique ruídos
• Teste torneiras e interruptores

🔑 Seu novo lar te espera!`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'codigo_imovel' 
      },
      { 
        id: '4', 
        text: '💳 Financiamento', 
        description: 'Simule seu financiamento', 
        action: 'message', 
        next_step_id: '', 
        response_message: `💳 *Financiamento Imobiliário*

Realize o sonho da casa própria! 🏡

━━━━━━━━━━━━━━━━━━

🏦 *Trabalhamos com TODOS os bancos!*
Caixa • Itaú • Bradesco • Santander • BB

✅ *O que oferecemos:*
• Simulação *GRATUITA*
• Assessoria completa
• Melhores taxas do mercado
• Carta de crédito inclusa
• Acompanhamento até a aprovação

━━━━━━━━━━━━━━━━━━

📊 *Condições Atuais:*
• Taxa: a partir de *9,49% a.a.*
• Prazo: até *35 anos*
• Entrada: a partir de *20%*
• Use seu FGTS!

━━━━━━━━━━━━━━━━━━

Para simular, informe:
• Valor do imóvel
• Valor de entrada disponível
• Renda familiar bruta

💰 Vamos encontrar a melhor condição para você!`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '👨‍💼 Falar com Corretor', 
        description: 'Atendimento personalizado', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `👨‍💼 *Transferindo para Corretor*

Excelente! Um de nossos corretores especializados já vai te atender!

🏠 Aguarde um momento...

🔑 Estamos prontos para encontrar seu imóvel ideal!`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `🏠 Desculpe, não entendi sua mensagem.

Por favor, digite o *número* da opção:

1️⃣ Buscar Imóvel
2️⃣ Anunciar Imóvel
3️⃣ Agendar Visita
4️⃣ Financiamento
5️⃣ Falar com Corretor

Estou aqui para ajudar! 🔑`,
    fail_action: 'transfer',
    ai_mode: 'support',
    ai_system_prompt: `Você é o corretor virtual da imobiliária {{empresa}}.

PERSONALIDADE:
- Profissional, consultivo e atencioso
- Entende profundamente as necessidades do cliente
- Faz perguntas estratégicas para qualificar
- Transmite segurança e conhecimento do mercado

VOCÊ DEVE AJUDAR CLIENTES A:
- Encontrar imóveis (pergunte: tipo, bairro, quartos, preço, características)
- Entender o processo de compra/aluguel
- Agendar visitas aos imóveis
- Simular financiamento
- Anunciar imóveis para venda/locação

INFORMAÇÕES IMPORTANTES:
- Taxa de financiamento atual: a partir de 9,49% a.a.
- Prazo máximo: 35 anos
- Entrada mínima: 20%
- FGTS pode ser utilizado

REGRAS FUNDAMENTAIS:
❌ NUNCA invente preços, disponibilidade ou características de imóveis
❌ NUNCA confirme visitas sem passar para um corretor humano
✅ Sempre colete informações completas antes de buscar imóveis
✅ Qualifique o cliente (capacidade financeira, urgência, motivação)
✅ Quando tiver todas as informações, transfira para corretor humano`,
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
  description: 'Atendimento carinhoso para pet shops e clínicas veterinárias',
  keywords: ['pet', 'cachorro', 'gato', 'banho', 'tosa', 'ração', 'veterinário', 'oi', 'olá', 'vacina', 'consulta'],
  isFeatured: false,
  form: {
    name: 'Atendimento Pet Shop',
    company_name: 'Pet Love',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia!* 🐾

Bem-vindo(a) ao *{{empresa}}*!

Seu pet merece o melhor! Como podemos cuidar dele hoje? 🐶🐱`,
    afternoon_greeting: `🌤️ *Boa tarde!* 🐾

Bem-vindo(a) ao *{{empresa}}*!

Pronto(a) para mimar seu melhor amigo? 💙

Como podemos ajudar?`,
    evening_greeting: `🌙 *Boa noite!* 🐾

O *{{empresa}}* está fechado agora, mas sua mensagem é importante!

🚨 *Emergências 24h:* (11) 99999-0000

Deixe sua mensagem que retornamos amanhã! 💙`,
    menu_title: '🐾 *Menu Pet Shop*',
    menu_description: 'Como podemos cuidar do seu pet?',
    menu_options: [
      { 
        id: '1', 
        text: '🛁 Banho e Tosa', 
        description: 'Agende o banho do seu pet', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🛁 *Banho e Tosa*

Seu pet vai ficar lindo e cheiroso! 🐕✨

━━━━━━━━━━━━━━━━━━

🐕 *CÃES*
┣ Banho P (até 5kg) — R$ 50
┣ Banho M (5-15kg) — R$ 65
┣ Banho G (15-30kg) — R$ 85
┗ Banho GG (+30kg) — R$ 110

✂️ *TOSA (adicional)*
┣ Tosa Higiênica — +R$ 25
┣ Tosa Completa — +R$ 50
┣ Tosa na Máquina — +R$ 40
┗ Tosa Padrão da Raça — +R$ 70

🐈 *GATOS*
┣ Banho — R$ 80
┗ Tosa — R$ 100

━━━━━━━━━━━━━━━━━━

🧴 *Incluso em todos os banhos:*
• Hidratação condicionante
• Perfume suave
• Limpeza de ouvidos
• Corte de unhas básico
• Lacinhos/gravatinhas

━━━━━━━━━━━━━━━━━━

📅 Para agendar, informe:
• Nome do pet e raça
• Porte (P/M/G/GG)
• Serviço desejado
• Data e horário preferidos

🐾 Vamos agendar?`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'nome_pet' 
      },
      { 
        id: '2', 
        text: '🏥 Veterinário', 
        description: 'Consultas e vacinas', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🏥 *Clínica Veterinária*

Cuidamos do seu pet com amor e profissionalismo! 💙

━━━━━━━━━━━━━━━━━━

👨‍⚕️ *CONSULTAS*
┣ Consulta Clínica — R$ 160
┣ Retorno (até 15 dias) — GRÁTIS
┗ Consulta de Emergência — R$ 220

💉 *VACINAS*
┣ V8/V10 (Cães) — R$ 95
┣ Antirrábica — R$ 75
┣ Giárdia — R$ 85
┗ Tríplice/Quádrupla (Gatos) — R$ 90

🔬 *EXAMES*
┣ Hemograma completo — R$ 120
┣ Bioquímico — R$ 180
┣ Ultrassom — R$ 280
┗ Raio-X — R$ 200

✂️ *CIRURGIAS*
┣ Castração Gatos — a partir R$ 380
┣ Castração Cães P/M — a partir R$ 480
┣ Castração Cães G — a partir R$ 580
┗ Limpeza de Tártaro — R$ 450

━━━━━━━━━━━━━━━━━━

⏰ *Atendimento:*
Seg-Sex: 8h às 20h
Sábado: 8h às 14h

🚨 *EMERGÊNCIA 24H:* (11) 99999-0000

Qual o nome e motivo da consulta? 🐾`, 
        collect_data: true, 
        data_type: 'custom', 
        data_variable: 'motivo_consulta' 
      },
      { 
        id: '3', 
        text: '🛒 Produtos', 
        description: 'Rações e acessórios', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🛒 *Loja Pet - Produtos*

Tudo para seu pet ser feliz! 🐾

━━━━━━━━━━━━━━━━━━

🥣 *RAÇÕES PREMIUM*
Golden • Premier • Royal Canin
N&D • Farmina • Gran Plus
Hills • Pro Plan • Biofresh

🧸 *ACESSÓRIOS*
Coleiras • Guias • Peitorais
Brinquedos • Camas • Casinhas
Roupas • Transportadores

💊 *FARMÁCIA PET*
Antipulgas • Vermífugos
Vitaminas • Suplementos
Shampoos medicamentosos

🎀 *HIGIENE*
Shampoos • Condicionadores
Perfumes • Escovas • Cortadores

━━━━━━━━━━━━━━━━━━

🚚 *DELIVERY em até 24h!*
Frete grátis acima de R$ 150

📍 Ou retire na loja!

O que você procura para seu pet? 💙`, 
        collect_data: false 
      },
      { 
        id: '4', 
        text: '🏨 Hotel Pet', 
        description: 'Hospedagem', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🏨 *Hotel Pet - Hospedagem*

Viaje tranquilo! Cuidamos do seu melhor amigo como se fosse nosso! 💙

━━━━━━━━━━━━━━━━━━

🐕 *DIÁRIA CÃES*
┣ Porte P (até 5kg) — R$ 70
┣ Porte M (5-15kg) — R$ 90
┣ Porte G (15-30kg) — R$ 110
┗ Porte GG (+30kg) — R$ 130

🐈 *DIÁRIA GATOS*
R$ 60 (espaço exclusivo felino)

━━━━━━━━━━━━━━━━━━

✅ *O que está incluso:*
• Alimentação premium
• Passeios 3x ao dia
• Monitoramento 24h por câmera
• Fotos e vídeos diários no WhatsApp
• Área climatizada
• Piscina para cães (verão)
• Muito, muito carinho! 💕

━━━━━━━━━━━━━━━━━━

📋 *Requisitos:*
• Vacinas em dia (carteirinha)
• Antipulgas/carrapatos atualizado
• Ficha de hospedagem preenchida

📅 Reserve com antecedência!
Feriados e férias lotam rápido.

Quando precisa hospedar? 🏡`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '📱 Falar com Atendente', 
        description: 'Atendimento humano', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `📱 *Transferindo para Atendente*

Aguarde um momento que vamos te atender com todo carinho! 🐾

💙 Enquanto isso, me conta o nome do seu pet! 🐶🐱`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `🐾 Ops! Não entendi sua mensagem.

Por favor, digite o *número* da opção:

1️⃣ Banho e Tosa
2️⃣ Veterinário
3️⃣ Produtos
4️⃣ Hotel Pet
5️⃣ Falar com Atendente

Estou aqui para ajudar! 💙`,
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
  description: 'Atendimento formal e profissional para escritórios de advocacia',
  keywords: ['advogado', 'processo', 'consulta', 'jurídico', 'direito', 'advocacia', 'oi', 'olá', 'caso', 'ação'],
  isFeatured: false,
  form: {
    name: 'Atendimento Advocacia',
    company_name: 'Oliveira & Associados Advocacia',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `⚖️ *Bom dia.*

Bem-vindo(a) ao escritório *{{empresa}}*.

Estamos à disposição para auxiliá-lo(a) em suas questões jurídicas.

Como podemos ajudar?`,
    afternoon_greeting: `⚖️ *Boa tarde.*

Bem-vindo(a) ao escritório *{{empresa}}*.

Nossa equipe está pronta para atendê-lo(a) com excelência.

Em que podemos ser úteis?`,
    evening_greeting: `⚖️ *Boa noite.*

O escritório *{{empresa}}* não está em expediente no momento.

Por favor, deixe sua mensagem com:
• Nome completo
• Breve descrição do assunto
• Telefone para contato

Retornaremos no próximo dia útil.`,
    menu_title: '⚖️ *Menu - Escritório de Advocacia*',
    menu_description: 'Selecione a opção desejada:',
    menu_options: [
      { 
        id: '1', 
        text: '📋 Áreas de Atuação', 
        description: 'Nossas especialidades', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📋 *Áreas de Atuação*

O escritório *{{empresa}}* atua nas seguintes áreas:

━━━━━━━━━━━━━━━━━━

⚖️ *DIREITO CIVIL*
Contratos • Indenizações • Cobranças
Responsabilidade Civil • Usucapião

👔 *DIREITO TRABALHISTA*
Reclamações • Acordos • Rescisões
Cálculos trabalhistas • Assédio

🏠 *DIREITO IMOBILIÁRIO*
Contratos • Usucapião • Despejo
Regularização • Incorporação

👨‍👩‍👧 *DIREITO DE FAMÍLIA*
Divórcio • Pensão Alimentícia
Guarda • Inventário • Testamento

💼 *DIREITO EMPRESARIAL*
Societário • Contratos comerciais
Recuperação Judicial • Falência

🛡️ *DIREITO DO CONSUMIDOR*
Indenizações • Negativação indevida
Recall • Vícios de produto

⚠️ *DIREITO CRIMINAL*
Defesa criminal • Habeas Corpus
Recursos • Execução penal

📑 *DIREITO PREVIDENCIÁRIO*
Aposentadorias • Benefícios
Revisões • Auxílios

━━━━━━━━━━━━━━━━━━

Em qual área podemos auxiliá-lo(a)?`, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '📅 Agendar Consulta', 
        description: 'Marque atendimento', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📅 *Agendamento de Consulta*

Estamos prontos para analisar seu caso.

━━━━━━━━━━━━━━━━━━

💰 *Consulta Inicial:* R$ 250
(Valor abatido em caso de contratação)

📍 *Modalidades de Atendimento:*
• Presencial (no escritório)
• Online (Zoom / Google Meet)

⏰ *Horários Disponíveis:*
Segunda a Sexta: 9h às 18h

━━━━━━━━━━━━━━━━━━

Para agendar, informe:
• Nome completo
• Área do direito
• Breve descrição do caso
• Data e horário preferidos
• Modalidade (presencial ou online)

🔐 *Sigilo absoluto garantido.*
Todas as informações são protegidas pelo sigilo profissional.`, 
        collect_data: true, 
        data_type: 'name', 
        data_variable: 'nome_cliente' 
      },
      { 
        id: '3', 
        text: '📂 Acompanhar Processo', 
        description: 'Status do seu caso', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📂 *Acompanhamento Processual*

Para consultar a situação do seu processo:

Informe um dos dados abaixo:
• CPF ou CNPJ
• Número do processo

━━━━━━━━━━━━━━━━━━

🔐 *Sigilo Profissional*
Suas informações são protegidas pelo sigilo advocatício.

⚠️ *Observação:*
Atualizações processuais podem levar até 48h para constar nos sistemas dos Tribunais.

━━━━━━━━━━━━━━━━━━

Aguarde que verificaremos o status do seu processo.`, 
        collect_data: true, 
        data_type: 'cpf', 
        data_variable: 'cpf_cliente' 
      },
      { 
        id: '4', 
        text: '📍 Localização', 
        description: 'Nosso endereço', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📍 *Localização do Escritório*

*Endereço:*
Av. Paulista, 1000 - Sala 1502
Bela Vista - São Paulo/SP
CEP: 01310-100

⏰ *Horário de Atendimento:*
Segunda a Sexta: 9h às 18h

━━━━━━━━━━━━━━━━━━

🅿️ Estacionamento conveniado (2h cortesia)
♿ Totalmente acessível
☕ Sala de espera climatizada

📞 Telefone: {{telefone}}
📧 E-mail: contato@escritorio.adv.br

📋 *Registro:* OAB/SP 123.456

━━━━━━━━━━━━━━━━━━

📍 *Como chegar:*
Próximo à estação Trianon-MASP do Metrô`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '👨‍💼 Falar com Advogado', 
        description: 'Atendimento direto', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `👨‍💼 *Transferindo para Atendimento*

Aguarde um momento.

Um de nossos advogados irá atendê-lo(a) em breve.

🔐 *Confidencialidade garantida.*`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `⚖️ Desculpe, não compreendi sua mensagem.

Por favor, digite apenas o *número* da opção desejada:

1️⃣ Áreas de Atuação
2️⃣ Agendar Consulta
3️⃣ Acompanhar Processo
4️⃣ Localização
5️⃣ Falar com Advogado`,
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
  description: 'Atendimento educacional para escolas, cursos e instituições de ensino',
  keywords: ['matrícula', 'curso', 'escola', 'aula', 'mensalidade', 'turma', 'oi', 'olá', 'estudar', 'aprender'],
  isFeatured: false,
  form: {
    name: 'Atendimento Escola',
    company_name: 'Instituto Saber',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia!* 📚

Bem-vindo(a) ao *{{empresa}}*!

🚀 Vamos transformar seu futuro através da educação!

Como podemos ajudar você a crescer?`,
    afternoon_greeting: `🌤️ *Boa tarde!* 📚

Bem-vindo(a) ao *{{empresa}}*!

✨ Nunca é tarde para aprender algo novo!

Em que podemos te ajudar?`,
    evening_greeting: `🌙 *Boa noite!* 📚

O *{{empresa}}* está fechado agora.

Deixe sua mensagem com:
• Nome e telefone
• Curso de interesse

Retornaremos amanhã!

🚀 Invista no seu futuro!`,
    menu_title: '📚 *Menu - Instituto de Ensino*',
    menu_description: 'Escolha como podemos te ajudar:',
    menu_options: [
      { 
        id: '1', 
        text: '📋 Cursos Disponíveis', 
        description: 'Conheça nossos cursos', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📋 *Nossos Cursos*

Transforme sua carreira! 🚀

━━━━━━━━━━━━━━━━━━

💻 *TECNOLOGIA*
• Programação (Python, Java, JS)
• Desenvolvimento Web Full Stack
• Design Gráfico / UI-UX
• Marketing Digital
• Data Science & Analytics
• Inteligência Artificial
• Cibersegurança

📊 *GESTÃO*
• Administração de Empresas
• Recursos Humanos
• Finanças e Contabilidade
• Logística
• Gestão de Projetos
• Empreendedorismo

🌍 *IDIOMAS*
• Inglês (básico ao avançado)
• Espanhol
• Francês
• Libras

✨ *PROFISSIONALIZANTES*
• Auxiliar Administrativo
• Atendimento ao Cliente
• Excel Avançado
• Oratória
• Vendas
• Secretariado

━━━━━━━━━━━━━━━━━━

📱 *Modalidades:*
Presencial • Online • Híbrido

Qual área te interessa? 🎯`, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '💰 Valores', 
        description: 'Mensalidades e formas de pagamento', 
        action: 'message', 
        next_step_id: '', 
        response_message: `💰 *Investimento em Educação*

Preços que cabem no seu bolso! 📚

━━━━━━━━━━━━━━━━━━

📚 *CURSOS LIVRES*
A partir de R$ 59/mês
Duração: 3-6 meses

🎓 *CURSOS TÉCNICOS*
A partir de R$ 229/mês
Duração: 12-24 meses

🌍 *IDIOMAS*
A partir de R$ 169/mês
Duração: Contínuo (níveis)

━━━━━━━━━━━━━━━━━━

💳 *Formas de Pagamento:*
• Boleto bancário
• Cartão de crédito (até 12x sem juros!)
• Pix (5% de desconto!)
• Débito recorrente

━━━━━━━━━━━━━━━━━━

🎁 *PROMOÇÃO DA SEMANA:*
✅ Matrícula GRÁTIS
✅ Material didático incluso
✅ Primeira mensalidade com 50% OFF
✅ Certificado reconhecido

🚀 Invista no seu futuro!`, 
        collect_data: false 
      },
      { 
        id: '3', 
        text: '📝 Fazer Matrícula', 
        description: 'Quero me matricular', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📝 *Matrícula*

Parabéns pela decisão de investir em você! 🎉

━━━━━━━━━━━━━━━━━━

Para se matricular, informe:
• Nome completo
• Curso de interesse
• Turno preferido (manhã/tarde/noite/online)
• Telefone para contato

━━━━━━━━━━━━━━━━━━

📍 *Ou compareça em nossa sede:*
Rua da Educação, 500 - Centro

📞 {{telefone}}

━━━━━━━━━━━━━━━━━━

🎁 *Benefícios exclusivos:*
• Matrícula gratuita essa semana
• Material didático incluso
• Acesso à plataforma online
• Certificado reconhecido

🚀 *Mude sua vida através da educação!*`, 
        collect_data: true, 
        data_type: 'name', 
        data_variable: 'nome_aluno' 
      },
      { 
        id: '4', 
        text: '📅 Horários', 
        description: 'Grade horária', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📅 *Horários das Aulas*

Flexibilidade para sua rotina! ⏰

━━━━━━━━━━━━━━━━━━

☀️ *MANHÃ:* 8h às 12h
🌤️ *TARDE:* 14h às 18h
🌙 *NOITE:* 19h às 22h
🏠 *ONLINE:* Horário flexível (acesso 24h)

━━━━━━━━━━━━━━━━━━

📍 *Nosso Endereço:*
Rua da Educação, 500 - Centro

🚌 Próximo ao metrô e ponto de ônibus!
🅿️ Estacionamento conveniado
♿ Totalmente acessível

━━━━━━━━━━━━━━━━━━

📚 *Estrutura:*
• Biblioteca completa
• Laboratórios de informática
• Salas climatizadas
• WiFi gratuito
• Cantina

Qual turno é melhor para você? 🎯`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '📱 Falar com Secretaria', 
        description: 'Atendimento humano', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `📱 *Transferindo para Secretaria*

Aguarde um momento!

Nossa equipe já vai te atender! 📚✨

🚀 Vamos transformar seu futuro juntos!`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `📚 Não entendi sua mensagem.

Por favor, digite o *número* da opção:

1️⃣ Cursos Disponíveis
2️⃣ Valores
3️⃣ Fazer Matrícula
4️⃣ Horários
5️⃣ Falar com Secretaria

Estou aqui para te ajudar! 🚀`,
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
  description: 'Atendimento técnico para oficinas mecânicas e auto centers',
  keywords: ['carro', 'manutenção', 'óleo', 'pneu', 'oficina', 'mecânico', 'oi', 'olá', 'freio', 'motor', 'problema'],
  isFeatured: false,
  form: {
    name: 'Atendimento Oficina',
    company_name: 'Auto Center Premium',
    response_type: 'list',
    use_dynamic_greeting: true,
    morning_greeting: `☀️ *Bom dia!* 🔧

Bem-vindo ao *{{empresa}}*!

Seu carro está em boas mãos! Como podemos ajudar com seu veículo? 🚗`,
    afternoon_greeting: `🌤️ *Boa tarde!* 🔧

Bem-vindo ao *{{empresa}}*!

Precisa de manutenção ou revisão? Estamos aqui para resolver! 🚗`,
    evening_greeting: `🌙 *Boa noite!* 🔧

O *{{empresa}}* está fechado agora.

🚨 *Guincho 24h:* (11) 99999-0000

Deixe sua mensagem que retornamos amanhã cedo! 🚗`,
    menu_title: '🔧 *Menu - Auto Center*',
    menu_description: 'Como podemos ajudar seu veículo?',
    menu_options: [
      { 
        id: '1', 
        text: '🛠️ Serviços e Preços', 
        description: 'O que fazemos', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🛠️ *Nossos Serviços*

Qualidade e transparência! 🚗

━━━━━━━━━━━━━━━━━━

🛢️ *TROCA DE ÓLEO*
┣ Óleo Sintético (5L) — R$ 210
┣ Óleo Semi-sintético (4L) — R$ 145
┗ Óleo Mineral (4L) — R$ 99
*(Filtro de óleo incluso)*

🔋 *ELÉTRICA*
┣ Revisão elétrica — R$ 160
┣ Bateria (instalada) — a partir R$ 380
┣ Alternador — consulte
┗ Motor de partida — consulte

🎯 *SUSPENSÃO E DIREÇÃO*
┣ Alinhamento + Balanceamento — R$ 120
┣ Revisão de suspensão — R$ 200
┣ Amortecedores (par + mão obra) — a partir R$ 480
┗ Terminal e pivô — consulte

🔧 *FREIOS*
┣ Pastilhas (par + mão obra) — R$ 200
┣ Discos (par + mão obra) — R$ 380
┗ Fluido de freio — R$ 90

❄️ *AR CONDICIONADO*
┣ Recarga de gás — R$ 140
┣ Higienização — R$ 90
┗ Filtro de cabine — R$ 70

⚙️ *REVISÃO COMPLETA* — R$ 390
*(50 itens verificados)*

━━━━━━━━━━━━━━━━━━

Qual serviço você precisa? 🔧`, 
        collect_data: false 
      },
      { 
        id: '2', 
        text: '📅 Agendar Serviço', 
        description: 'Marque horário', 
        action: 'message', 
        next_step_id: '', 
        response_message: `📅 *Agendar Serviço*

Vamos resolver o problema do seu carro! 🚗

━━━━━━━━━━━━━━━━━━

Para agendar, informe:
• 👤 Seu nome
• 🚗 Modelo do veículo e ano
• 🔢 Placa
• 🛠️ Serviço desejado
• ⚠️ Sintoma/problema (se houver)
• 📅 Data e horário preferidos

━━━━━━━━━━━━━━━━━━

🚗 *Serviço Leva e Traz GRÁTIS* em até 10km!

⏰ *Funcionamento:*
Seg-Sex: 8h às 18h
Sábado: 8h às 13h

Aguardo seus dados! 🔧`, 
        collect_data: true, 
        data_type: 'name', 
        data_variable: 'nome_cliente' 
      },
      { 
        id: '3', 
        text: '🔍 Diagnóstico', 
        description: 'Avaliação do veículo', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🔍 *Diagnóstico Veicular*

Descubra o que seu carro precisa! 🚗

━━━━━━━━━━━━━━━━━━

🖥️ *Scanner Computadorizado* — R$ 90
Leitura de erros eletrônicos

🔧 *Diagnóstico Completo* — R$ 170
Avaliação mecânica + eletrônica

✅ *Valor DEDUZIDO* se executar o serviço!

━━━━━━━━━━━━━━━━━━

📝 *O que você recebe:*
• Relatório detalhado com fotos
• Explicação transparente do problema
• Orçamento sem compromisso
• Prazo estimado do reparo

⚠️ *Sinais de atenção:*
• Barulho estranho
• Luz acesa no painel
• Trepidação ao freiar
• Vazamentos
• Superaquecimento
• Consumo alto de combustível

Me conta o sintoma do seu carro! 🔧`, 
        collect_data: false 
      },
      { 
        id: '4', 
        text: '🚗 Leva e Traz', 
        description: 'Buscamos seu carro', 
        action: 'message', 
        next_step_id: '', 
        response_message: `🚗 *Serviço Leva e Traz*

Comodidade total para você! 

━━━━━━━━━━━━━━━━━━

✅ Buscamos seu carro
✅ Fazemos o serviço
✅ Devolvemos onde você quiser

📍 *Área de cobertura:* 10km
💰 *Valor:* GRATUITO!

━━━━━━━━━━━━━━━━━━

⏰ Agende com 24h de antecedência

🚨 *Guincho 24h:* (11) 99999-0000
Para emergências e distâncias maiores

🔒 Seu veículo fica segurado durante todo o processo!

━━━━━━━━━━━━━━━━━━

Quer agendar com leva e traz?

Me fala seu endereço e horário! 🚗`, 
        collect_data: false 
      },
      { 
        id: '5', 
        text: '📱 Falar com Mecânico', 
        description: 'Atendimento técnico', 
        action: 'transfer', 
        next_step_id: '', 
        response_message: `📱 *Transferindo para Atendimento*

Nosso mecânico especialista já vai te atender!

🔧 Aguarde um momento...

🚗 Seu carro em boas mãos!`, 
        collect_data: false 
      },
    ],
    max_attempts: 3,
    fallback_message: `🔧 Não entendi sua mensagem.

Por favor, digite o *número* da opção:

1️⃣ Serviços e Preços
2️⃣ Agendar Serviço
3️⃣ Diagnóstico
4️⃣ Leva e Traz
5️⃣ Falar com Mecânico

Estou aqui para ajudar! 🚗`,
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
