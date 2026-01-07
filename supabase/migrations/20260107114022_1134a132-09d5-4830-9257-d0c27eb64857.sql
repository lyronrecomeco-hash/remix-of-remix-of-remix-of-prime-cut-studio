-- Atualizar templates com response_content padrão (mensagem de boas-vindas)
-- para funcionarem com ou sem IA

UPDATE chatbot_templates 
SET response_content = E'Olá! 👋 Bem-vindo ao nosso atendimento comercial!\n\nComo posso ajudar você hoje?\n\n1️⃣ Ver produtos\n2️⃣ Consultar preços\n3️⃣ Falar com atendente\n\nDigite o número da opção desejada:',
    ai_enabled = true
WHERE slug = 'comercial';

UPDATE chatbot_templates 
SET response_content = E'Olá! 🛠️ Sou o assistente de suporte técnico.\n\nComo posso ajudar?\n\n1️⃣ Problema técnico\n2️⃣ Pagamento/Cobrança\n3️⃣ Usar o app\n4️⃣ Falar com suporte\n\nDigite o número da opção:',
    ai_enabled = true
WHERE slug = 'suporte';

UPDATE chatbot_templates 
SET response_content = E'Olá! 📅 Vamos agendar seu horário?\n\nQual serviço você deseja?\n\n1️⃣ Corte de cabelo\n2️⃣ Manicure\n3️⃣ Tratamento\n\nDigite o número da opção:',
    ai_enabled = true
WHERE slug = 'agendamento';

UPDATE chatbot_templates 
SET response_content = E'Olá! 😊 Obrigado por entrar em contato!\n\nEm que posso ajudar?\n\n1️⃣ Informações sobre pedido\n2️⃣ Reclamação\n3️⃣ Elogio/Sugestão\n4️⃣ Outros assuntos\n\nDigite a opção desejada:',
    ai_enabled = true
WHERE slug = 'sac';

UPDATE chatbot_templates 
SET response_content = E'Olá! 🌙 Obrigado por entrar em contato!\n\nEstamos fora do horário de atendimento, mas deixe sua mensagem que retornaremos assim que possível.\n\nOu selecione uma opção:\n\n1️⃣ Deixar mensagem\n2️⃣ Ver horário de funcionamento\n3️⃣ Urgência (será atendido por IA)',
    ai_enabled = true
WHERE slug = '24h';