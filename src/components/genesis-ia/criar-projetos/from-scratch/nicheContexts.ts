// Contextos automáticos por nicho para geração de prompts ultra-completos

// Tipos de requisitos backend por nicho
export interface BackendRequirement {
  id: string;
  name: string;
  description: string;
  technicalSpec: string;
}

export interface NicheContext {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'food' | 'beauty' | 'health' | 'services' | 'education' | 'pets' | 'tech' | 'real-estate' | 'legal' | 'creative';
  contextPrompt: string;
  defaultObjectives: string[];
  suggestedPages: string[];
  suggestedFeatures: string[];
  seoKeywords: string[];
  commonSections: string[];
  colorSuggestions: {
    primary: string;
    secondary: string;
    name: string;
  }[];
  // NOVO: Requisitos de backend funcional
  backendRequirements?: BackendRequirement[];
}

export const NICHE_CONTEXTS: NicheContext[] = [
  // ALIMENTAÇÃO
  {
    id: 'hamburgueria',
    name: 'Hamburgueria / Lanchonete',
    emoji: '🍔',
    description: 'Cardápio digital, pedidos e delivery de lanches',
    category: 'food',
    contextPrompt: `Uma hamburgueria moderna precisa capturar a essência do fast-food premium. O cardápio deve ser extremamente visual e apetitoso, com fotos de alta qualidade dos lanches em destaque. O design deve transmitir sabor e qualidade através de cores quentes e imagens que despertem o apetite. Sistema de pedidos integrado com WhatsApp é essencial para delivery rápido. Destaque para combos e promoções do dia com contagem regressiva. A experiência mobile deve ser prioridade absoluta, pois a maioria dos pedidos vem de smartphones. Incluir seção de avaliações de clientes para gerar confiança.`,
    defaultObjectives: [
      'Exibir cardápio digital atraente com fotos',
      'Receber pedidos via WhatsApp',
      'Mostrar localização com mapa interativo',
      'Destacar promoções e combos do dia',
      'Facilitar pedidos para delivery',
      'Exibir avaliações de clientes'
    ],
    suggestedPages: ['Home', 'Cardápio', 'Combos', 'Promoções', 'Localização', 'Contato', 'Sobre Nós'],
    suggestedFeatures: [
      'Cardápio interativo com categorias',
      'Fotos em alta qualidade dos produtos',
      'Sistema de carrinho de pedidos',
      'Horário de funcionamento',
      'Sistema de promoções com destaque',
      'Galeria de fotos do ambiente',
      'Depoimentos de clientes'
    ],
    seoKeywords: ['hamburgueria', 'lanche artesanal', 'delivery hamburguer', 'melhor hamburguer', 'fast food premium'],
    commonSections: ['Hero com destaque do dia', 'Cardápio em grid', 'Combos especiais', 'Sobre a casa', 'Localização', 'Avaliações'],
    colorSuggestions: [
      { primary: '#dc2626', secondary: '#fbbf24', name: 'Vermelho & Amarelo (Clássico)' },
      { primary: '#ea580c', secondary: '#1c1917', name: 'Laranja & Preto (Premium)' },
      { primary: '#b91c1c', secondary: '#fef3c7', name: 'Vermelho Escuro & Creme' }
    ],
    backendRequirements: [
      {
        id: 'cart-system',
        name: 'Sistema de Carrinho',
        description: 'Carrinho de compras completo com persistência local',
        technicalSpec: `
## CARRINHO DE COMPRAS (localStorage)

### Estado do Carrinho:
\`\`\`typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: 'P' | 'M' | 'G' | 'GG';
  extras?: { name: string; price: number }[];
  observations?: string;
  imageUrl?: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
}
\`\`\`

### Funcionalidades Obrigatórias:
- Adicionar item ao carrinho com quantidade
- Selecionar tamanho do lanche (P, M, G, GG) com preços diferentes
- Adicionar extras/adicionais (bacon extra, queijo extra, etc) com preço individual
- Campo de observações por item ("sem cebola", "bem passado", etc)
- Atualizar quantidade de itens
- Remover itens do carrinho
- Calcular subtotal automaticamente
- Opção de entrega ou retirada
- Taxa de entrega (R$ 5-10 configurável)
- Calcular total final
- Persistir carrinho no localStorage
- Badge com contador de itens no ícone do carrinho
- Drawer/Modal lateral para visualizar carrinho
`
      },
      {
        id: 'whatsapp-order',
        name: 'Pedido via WhatsApp',
        description: 'Mensagem formatada com pedido completo',
        technicalSpec: `
## INTEGRAÇÃO WHATSAPP PARA PEDIDOS

### Fluxo de Checkout:
1. Cliente monta o pedido no carrinho
2. Escolhe entrega ou retirada
3. Se entrega: preenche endereço completo (rua, número, bairro, complemento, CEP)
4. Preenche nome e telefone
5. Escolhe forma de pagamento (Dinheiro, PIX, Cartão na entrega)
6. Se dinheiro: campo para "troco para quanto?"
7. Clica em "Enviar Pedido"

### Formato da Mensagem WhatsApp:
\`\`\`
🍔 *NOVO PEDIDO - [NOME DA HAMBURGUERIA]*

📋 *ITENS DO PEDIDO:*
━━━━━━━━━━━━━━━━━
[Para cada item:]
• 2x Hambúrguer Artesanal (G) - R$ 45,00
   ➕ Bacon extra (+R$ 5,00)
   ➕ Queijo cheddar (+R$ 4,00)
   📝 Obs: Sem cebola, bem passado

• 1x Batata Frita Grande - R$ 18,00
━━━━━━━━━━━━━━━━━

💰 *RESUMO:*
Subtotal: R$ 72,00
Taxa de entrega: R$ 8,00
*TOTAL: R$ 80,00*

📍 *ENTREGA:*
Nome: João Silva
Tel: (11) 99999-9999
Endereço: Rua das Flores, 123
Bairro: Centro
Complemento: Apt 45
CEP: 01234-567

💳 *PAGAMENTO:*
Dinheiro (troco para R$ 100)

⏰ Pedido realizado: 14/01/2025 às 19:45
\`\`\`

### Código de Geração:
\`\`\`typescript
function generateWhatsAppMessage(cart: Cart, customer: CustomerInfo): string {
  // Formatar mensagem conforme template acima
  // Usar encodeURIComponent para URL
  // Retornar link: https://wa.me/55XXXXXXXXXXX?text=MENSAGEM
}
\`\`\`
`
      },
      {
        id: 'menu-management',
        name: 'Cardápio Dinâmico',
        description: 'Sistema de cardápio com categorias e preços',
        technicalSpec: `
## ESTRUTURA DO CARDÁPIO

### Categorias:
- Hamburgueres
- Combos
- Porções
- Bebidas
- Sobremesas

### Estrutura de Dados:
\`\`\`typescript
interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  prices: {
    size: 'P' | 'M' | 'G' | 'GG';
    price: number;
  }[];
  extras: {
    name: string;
    price: number;
  }[];
  imageUrl: string;
  isAvailable: boolean;
  isPromotion: boolean;
  promotionPrice?: number;
}
\`\`\`

### UI do Cardápio:
- Tabs ou accordion por categoria
- Card de produto com imagem, nome, descrição, preço "a partir de"
- Modal de detalhes ao clicar no produto
- Seletor de tamanho com preços
- Checkboxes para adicionais
- Campo de observações
- Botão "Adicionar ao Carrinho"
- Feedback visual de item adicionado
`
      }
    ]
  },
  {
    id: 'pizzaria',
    name: 'Pizzaria',
    emoji: '🍕',
    description: 'Cardápio de pizzas, pedidos e delivery',
    category: 'food',
    contextPrompt: `Uma pizzaria precisa de um cardápio digital que destaque os sabores de forma irresistível. O design deve remeter à tradição italiana com toques modernos. Sistema de montagem de pizza personalizada é um diferencial. Destaque para pizzas especiais da casa e promoções de rodízio ou combos. Integração com WhatsApp para pedidos de delivery é fundamental. Mostrar ingredientes frescos e processo de preparo gera confiança. Seção de bebidas e sobremesas complementa a experiência.`,
    defaultObjectives: [
      'Exibir cardápio completo de pizzas',
      'Sistema de pedidos via WhatsApp',
      'Destacar pizzas especiais da casa',
      'Mostrar promoções e rodízio',
      'Exibir tempo de entrega',
      'Apresentar ingredientes de qualidade'
    ],
    suggestedPages: ['Home', 'Cardápio', 'Pizzas Especiais', 'Promoções', 'Delivery', 'Contato'],
    suggestedFeatures: [
      'Cardápio categorizado por sabores',
      'Fotos das pizzas em destaque',
      'Sistema de carrinho',
      'Tempo estimado de entrega',
      'Promoções do dia',
      'Galeria do ambiente',
      'Mapa de área de entrega'
    ],
    seoKeywords: ['pizzaria', 'pizza delivery', 'pizza artesanal', 'rodizio pizza', 'melhor pizza'],
    commonSections: ['Hero com pizza destaque', 'Cardápio grid', 'Especiais da casa', 'Promoções', 'Delivery', 'Contato'],
    colorSuggestions: [
      { primary: '#dc2626', secondary: '#16a34a', name: 'Vermelho & Verde (Italiano)' },
      { primary: '#b91c1c', secondary: '#fef3c7', name: 'Vermelho & Creme' },
      { primary: '#1c1917', secondary: '#dc2626', name: 'Preto & Vermelho (Premium)' }
    ],
    backendRequirements: [
      {
        id: 'pizza-builder',
        name: 'Montador de Pizza',
        description: 'Sistema de pizza meio-a-meio e personalizada',
        technicalSpec: `
## SISTEMA DE MONTAGEM DE PIZZA

### Funcionalidades:
1. Escolher tamanho (Broto, Média, Grande, Gigante)
2. Opção de pizza inteira ou meio-a-meio
3. Se meio-a-meio: selecionar 2 sabores
4. Preço = maior preço dos 2 sabores
5. Bordas recheadas como adicional
6. Campo de observações

### Estrutura:
\`\`\`typescript
interface PizzaOrder {
  size: 'broto' | 'media' | 'grande' | 'gigante';
  isHalfHalf: boolean;
  flavor1: string;
  flavor2?: string;
  stuffedCrust?: 'catupiry' | 'cheddar' | 'chocolate';
  observations?: string;
  price: number;
}
\`\`\`

### Cálculo de Preço Meio-a-Meio:
\`\`\`typescript
const price = isHalfHalf 
  ? Math.max(flavor1Price, flavor2Price) 
  : flavor1Price;
\`\`\`
`
      },
      {
        id: 'cart-system',
        name: 'Sistema de Carrinho',
        description: 'Carrinho com pizzas e acompanhamentos',
        technicalSpec: `
## CARRINHO PARA PIZZARIA

Similar ao sistema de hamburgueria, mas adaptado:
- Suporte a pizzas meio-a-meio
- Bebidas (2L, lata, 600ml)
- Bordas recheadas
- Sobremesas
- Taxa de entrega por região
- Tempo estimado de entrega exibido
`
      },
      {
        id: 'whatsapp-order',
        name: 'Pedido via WhatsApp',
        description: 'Mensagem formatada para pedido de pizza',
        technicalSpec: `
## MENSAGEM WHATSAPP PIZZARIA

\`\`\`
🍕 *NOVO PEDIDO - [NOME DA PIZZARIA]*

📋 *PIZZAS:*
━━━━━━━━━━━━━━━━━
• 1x Pizza Grande
   🍕 1/2 Calabresa + 1/2 Portuguesa
   🧀 Borda: Catupiry (+R$ 8,00)
   📝 Obs: Bem assada

• 1x Pizza Média
   🍕 Margherita
━━━━━━━━━━━━━━━━━

🥤 *BEBIDAS:*
• 1x Coca-Cola 2L - R$ 14,00

💰 *TOTAL: R$ 95,00*

📍 *ENTREGA:*
[dados do cliente]

⏰ Tempo estimado: 45-60 min
\`\`\`
`
      }
    ]
  },
  {
    id: 'restaurante',
    name: 'Restaurante',
    emoji: '🍽️',
    description: 'Cardápio, reservas e experiência gastronômica',
    category: 'food',
    contextPrompt: `Um restaurante precisa transmitir a experiência gastronômica através do site. O design deve refletir a identidade do estabelecimento - seja sofisticado, casual, temático ou contemporâneo. Cardápio bem organizado com descrições que despertem o paladar. Sistema de reservas online é essencial. Galeria mostrando o ambiente, pratos e equipe cria conexão emocional. Chef's specials e menu degustação merecem destaque. Eventos especiais como música ao vivo ou datas comemorativas devem ter seção dedicada.`,
    defaultObjectives: [
      'Apresentar cardápio completo',
      'Sistema de reservas online',
      'Mostrar ambiente e experiência',
      'Destacar pratos especiais do chef',
      'Divulgar eventos e datas especiais',
      'Gerar desejo de visitar'
    ],
    suggestedPages: ['Home', 'Cardápio', 'Reservas', 'Galeria', 'Sobre', 'Eventos', 'Contato'],
    suggestedFeatures: [
      'Cardápio elegante com fotos',
      'Sistema de reservas',
      'Galeria do ambiente',
      'Menu do chef',
      'Calendário de eventos',
      'Depoimentos'
    ],
    seoKeywords: ['restaurante', 'gastronomia', 'reserva restaurante', 'jantar especial', 'experiência gastronômica'],
    commonSections: ['Hero atmosférico', 'Cardápio', 'Sobre o chef', 'Galeria', 'Reservas', 'Eventos'],
    colorSuggestions: [
      { primary: '#1c1917', secondary: '#d4af37', name: 'Preto & Dourado (Elegante)' },
      { primary: '#7c2d12', secondary: '#fef3c7', name: 'Marrom & Creme (Aconchegante)' },
      { primary: '#166534', secondary: '#fef3c7', name: 'Verde & Creme (Orgânico)' }
    ],
    backendRequirements: [
      {
        id: 'reservation-system',
        name: 'Sistema de Reservas',
        description: 'Reserva de mesas online com confirmação',
        technicalSpec: `
## SISTEMA DE RESERVAS

### Formulário de Reserva:
\`\`\`typescript
interface Reservation {
  date: Date;
  time: string; // slots: 12:00, 12:30, 13:00...
  partySize: number; // 1-12 pessoas
  name: string;
  phone: string;
  email: string;
  occasion?: 'aniversario' | 'romantico' | 'negocios' | 'outro';
  specialRequests?: string;
}
\`\`\`

### Funcionalidades:
1. Calendário para selecionar data (apenas dias futuros)
2. Horários disponíveis baseados no dia
3. Seletor de quantidade de pessoas
4. Campos de contato obrigatórios
5. Ocasião especial (opcional)
6. Pedidos especiais (cadeirinha, aniversário, etc)
7. Envio via WhatsApp formatado OU email
8. Confirmação visual após envio

### Mensagem WhatsApp:
\`\`\`
🍽️ *NOVA RESERVA - [RESTAURANTE]*

📅 Data: 15/01/2025
⏰ Horário: 20:00
👥 Pessoas: 4

👤 Nome: Maria Silva
📱 Tel: (11) 99999-9999
📧 Email: maria@email.com

🎉 Ocasião: Aniversário
📝 Obs: Mesa próxima à janela, por favor

Aguardando confirmação!
\`\`\`
`
      }
    ]
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria / Confeitaria',
    emoji: '☕',
    description: 'Café, doces e ambiente aconchegante',
    category: 'food',
    contextPrompt: `Uma cafeteria transmite aconchego e momentos especiais. O design deve ser acolhedor, com tons quentes e imagens que remetam ao aroma do café. Cardápio destacando cafés especiais, métodos de preparo, e harmonização com doces artesanais. Ambiente para trabalho remoto pode ser diferencial. Programa de fidelidade incentiva retorno. História dos grãos e processo de torrefação para cafés especiais agrega valor. Brunch e opções para diferentes momentos do dia.`,
    defaultObjectives: [
      'Apresentar menu de cafés e doces',
      'Destacar cafés especiais',
      'Mostrar ambiente acolhedor',
      'Programa de fidelidade',
      'Atrair público de trabalho remoto',
      'Promover eventos e workshops'
    ],
    suggestedPages: ['Home', 'Menu', 'Cafés Especiais', 'Doces', 'Ambiente', 'Sobre', 'Contato'],
    suggestedFeatures: [
      'Menu visual atraente',
      'Seção de cafés especiais',
      'Galeria do ambiente',
      'Horário de funcionamento',
      'Wi-Fi disponível',
      'Instagram feed',
      'Newsletter'
    ],
    seoKeywords: ['cafeteria', 'café especial', 'confeitaria', 'brunch', 'coworking café'],
    commonSections: ['Hero acolhedor', 'Menu', 'Cafés especiais', 'Ambiente', 'Sobre nós', 'Contato'],
    colorSuggestions: [
      { primary: '#78350f', secondary: '#fef3c7', name: 'Marrom Café & Creme' },
      { primary: '#1c1917', secondary: '#a16207', name: 'Preto & Âmbar' },
      { primary: '#fef3c7', secondary: '#78350f', name: 'Creme & Marrom (Claro)' }
    ]
  },

  // BELEZA & ESTÉTICA
  {
    id: 'barbearia',
    name: 'Barbearia',
    emoji: '💈',
    description: 'Agendamento, serviços e experiência premium',
    category: 'beauty',
    contextPrompt: `Uma barbearia moderna é mais que corte de cabelo - é uma experiência masculina completa. O design deve transmitir masculinidade sofisticada, misturando elementos vintage com modernidade. Sistema de agendamento online é fundamental para evitar filas. Perfil dos barbeiros com especialidades cria conexão pessoal. Galeria de cortes e estilos serve como portfólio. Área de produtos masculinos pode gerar receita adicional. Programa de fidelidade mantém clientes retornando. Ambiente com cerveja, sinuca ou outros diferenciais devem ser destacados.`,
    defaultObjectives: [
      'Sistema de agendamento online',
      'Apresentar equipe de barbeiros',
      'Exibir serviços e preços',
      'Galeria de cortes e estilos',
      'Fidelizar clientes',
      'Vender produtos masculinos'
    ],
    suggestedPages: ['Home', 'Serviços', 'Barbeiros', 'Galeria', 'Agendamento', 'Produtos', 'Contato'],
    suggestedFeatures: [
      'Sistema de agendamento completo',
      'Perfil dos barbeiros',
      'Galeria de trabalhos',
      'Preços dos serviços',
      'Avaliações de clientes',
      'Loja de produtos'
    ],
    seoKeywords: ['barbearia', 'barbeiro', 'corte masculino', 'barba', 'agendamento barbearia'],
    commonSections: ['Hero impactante', 'Serviços', 'Equipe', 'Galeria', 'Agendamento', 'Localização'],
    colorSuggestions: [
      { primary: '#1c1917', secondary: '#d97706', name: 'Preto & Dourado (Clássico)' },
      { primary: '#78350f', secondary: '#fef3c7', name: 'Marrom & Creme (Vintage)' },
      { primary: '#1c1917', secondary: '#dc2626', name: 'Preto & Vermelho (Moderno)' }
    ],
    backendRequirements: [
      {
        id: 'booking-system',
        name: 'Sistema de Agendamento',
        description: 'Agendamento online com escolha de barbeiro e serviço',
        technicalSpec: `
## SISTEMA DE AGENDAMENTO BARBEARIA

### Fluxo de Agendamento:
1. Escolher SERVIÇO (Corte, Barba, Combo, etc) com duração e preço
2. Escolher BARBEIRO (com foto, especialidade e disponibilidade)
3. Escolher DATA (calendário mostrando dias disponíveis)
4. Escolher HORÁRIO (slots baseados na disponibilidade do barbeiro)
5. Preencher DADOS (nome, telefone, email opcional)
6. CONFIRMAR (resumo + envio WhatsApp)

### Estrutura de Dados:
\`\`\`typescript
interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutos
  price: number;
  imageUrl?: string;
}

interface Barber {
  id: string;
  name: string;
  photo: string;
  specialties: string[];
  workDays: number[]; // 0-6 (dom-sab)
  workHours: { start: string; end: string };
}

interface Booking {
  service: Service;
  barber: Barber;
  date: Date;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}
\`\`\`

### Mensagem WhatsApp Agendamento:
\`\`\`
💈 *NOVO AGENDAMENTO - [BARBEARIA]*

✂️ Serviço: Corte + Barba
💰 Valor: R$ 70,00
⏱️ Duração: 45 min

👨‍🦱 Barbeiro: Carlos
📅 Data: Segunda, 15/01/2025
⏰ Horário: 15:30

👤 Cliente: João Silva
📱 Tel: (11) 99999-9999

✅ Aguardando confirmação
\`\`\`

### UI Obrigatória:
- Cards de serviços com ícone, nome, duração, preço
- Grid de barbeiros com foto e especialidades
- Calendário visual destacando dias disponíveis
- Slots de horário em grade ou lista
- Resumo lateral/inferior sempre visível
- Botão de confirmação com loading state
`
      }
    ]
  },
  {
    id: 'salao-beleza',
    name: 'Salão de Beleza',
    emoji: '💇‍♀️',
    description: 'Cabelo, maquiagem, unhas e estética',
    category: 'beauty',
    contextPrompt: `Um salão de beleza deve transmitir elegância, cuidado e transformação. O design deve ser feminino e sofisticado, com cores suaves ou ousadas dependendo do posicionamento. Agendamento online com escolha de profissional é essencial. Portfolio de transformações inspira e gera confiança. Serviços bem detalhados com duração e preços. Profissionais com especialidades destacadas. Pacotes para noivas e eventos especiais merecem página dedicada. Produtos utilizados e vendidos no salão agregam valor.`,
    defaultObjectives: [
      'Agendamento online fácil',
      'Apresentar equipe especializada',
      'Exibir portfolio de trabalhos',
      'Detalhar serviços e preços',
      'Pacotes para noivas e eventos',
      'Vender produtos de beleza'
    ],
    suggestedPages: ['Home', 'Serviços', 'Equipe', 'Portfolio', 'Noivas', 'Agendamento', 'Contato'],
    suggestedFeatures: [
      'Sistema de agendamento completo',
      'Portfolio antes/depois',
      'Perfil das profissionais',
      'Lista de serviços com preços',
      'Pacotes especiais',
      'Depoimentos'
    ],
    seoKeywords: ['salão de beleza', 'cabelereiro', 'manicure', 'maquiagem', 'estética'],
    commonSections: ['Hero elegante', 'Serviços', 'Transformações', 'Equipe', 'Agendamento', 'Contato'],
    colorSuggestions: [
      { primary: '#ec4899', secondary: '#fdf2f8', name: 'Rosa & Branco (Feminino)' },
      { primary: '#1c1917', secondary: '#d4af37', name: 'Preto & Dourado (Luxo)' },
      { primary: '#7c3aed', secondary: '#faf5ff', name: 'Roxo & Lavanda (Moderno)' }
    ],
    backendRequirements: [
      {
        id: 'booking-system',
        name: 'Sistema de Agendamento',
        description: 'Agendamento online com profissional e serviços múltiplos',
        technicalSpec: `
## SISTEMA DE AGENDAMENTO SALÃO

### Fluxo (similar barbearia mas com diferenças):
1. Escolher SERVIÇO(S) - pode selecionar múltiplos
2. Sistema calcula duração total automaticamente
3. Escolher PROFISSIONAL com especialidade
4. Escolher DATA e HORÁRIO
5. Preencher DADOS
6. Confirmar via WhatsApp

### Diferenciais Salão:
- Múltiplos serviços no mesmo agendamento
- Cálculo de tempo total (corte 40min + escova 30min = 70min)
- Profissionais especializados por tipo de serviço
- Opção de "sem preferência" de profissional
- Pacotes pré-definidos (Noiva, Dia da Noiva, etc)

### Mensagem WhatsApp:
\`\`\`
💇‍♀️ *NOVO AGENDAMENTO - [SALÃO]*

💅 Serviços:
   • Corte feminino - R$ 80
   • Escova - R$ 50
   • Manicure - R$ 40
💰 Total: R$ 170,00
⏱️ Duração total: 2h

👩‍🦰 Profissional: Ana
📅 Data: 15/01/2025
⏰ Horário: 14:00

👤 Cliente: Maria
📱 Tel: (11) 99999-9999
\`\`\`
`
      }
    ]
  },
  {
    id: 'clinica-estetica',
    name: 'Clínica de Estética',
    emoji: '✨',
    description: 'Procedimentos estéticos e rejuvenescimento',
    category: 'beauty',
    contextPrompt: `Uma clínica de estética precisa transmitir profissionalismo, segurança e resultados. O design deve ser clean, moderno e inspirar confiança médica. Procedimentos bem explicados com resultados esperados. Antes/depois com consentimento gera prova social. Equipe com formação e especializações destacadas. Tecnologias e equipamentos utilizados demonstram investimento. Avaliação gratuita é CTA poderoso. Financiamento e pacotes facilitam decisão.`,
    defaultObjectives: [
      'Apresentar procedimentos disponíveis',
      'Gerar confiança profissional',
      'Mostrar resultados reais',
      'Captar leads para avaliação',
      'Destacar equipe qualificada',
      'Oferecer financiamento'
    ],
    suggestedPages: ['Home', 'Procedimentos', 'Resultados', 'Equipe', 'Tecnologias', 'Avaliação', 'Contato'],
    suggestedFeatures: [
      'Catálogo de procedimentos',
      'Galeria antes/depois',
      'Perfil dos profissionais',
      'Formulário de avaliação',
      'Chat online',
      'Blog com conteúdo',
      'Depoimentos em vídeo'
    ],
    seoKeywords: ['clínica estética', 'botox', 'preenchimento', 'harmonização facial', 'rejuvenescimento'],
    commonSections: ['Hero aspiracional', 'Procedimentos', 'Resultados', 'Equipe', 'Avaliação', 'Contato'],
    colorSuggestions: [
      { primary: '#0891b2', secondary: '#ecfeff', name: 'Azul & Branco (Clínico)' },
      { primary: '#d4af37', secondary: '#1c1917', name: 'Dourado & Preto (Luxo)' },
      { primary: '#be185d', secondary: '#fdf2f8', name: 'Magenta & Rosa (Feminino)' }
    ]
  },

  // SAÚDE & FITNESS
  {
    id: 'academia',
    name: 'Academia / Fitness',
    emoji: '🏋️',
    description: 'Planos, treinos e transformação física',
    category: 'health',
    contextPrompt: `Uma academia precisa motivar e inspirar transformação. O design deve ser energético, com imagens de pessoas reais se exercitando. Planos e preços claros com comparativo de benefícios. Tour virtual da estrutura mostra equipamentos e ambiente. Aulas coletivas com horários atraem público específico. Resultados de alunos (com consentimento) geram prova social. Personal trainers disponíveis agregam valor. Primeira semana grátis ou aula experimental são CTAs eficientes.`,
    defaultObjectives: [
      'Captar novos alunos',
      'Apresentar planos e preços',
      'Mostrar estrutura e equipamentos',
      'Divulgar grade de aulas',
      'Exibir transformações',
      'Oferecer aula experimental'
    ],
    suggestedPages: ['Home', 'Planos', 'Estrutura', 'Aulas', 'Personal', 'Resultados', 'Contato'],
    suggestedFeatures: [
      'Tabela de planos comparativa',
      'Tour virtual/galeria',
      'Grade de aulas',
      'Formulário de matrícula',
      'Depoimentos de alunos',
      'Calculadora de IMC',
      'App download'
    ],
    seoKeywords: ['academia', 'musculação', 'fitness', 'treino', 'personal trainer'],
    commonSections: ['Hero motivacional', 'Planos', 'Estrutura', 'Aulas', 'Resultados', 'Matrícula'],
    colorSuggestions: [
      { primary: '#dc2626', secondary: '#1c1917', name: 'Vermelho & Preto (Energia)' },
      { primary: '#16a34a', secondary: '#1c1917', name: 'Verde & Preto (Saúde)' },
      { primary: '#2563eb', secondary: '#1c1917', name: 'Azul & Preto (Moderno)' }
    ]
  },
  {
    id: 'clinica-medica',
    name: 'Clínica Médica',
    emoji: '🏥',
    description: 'Especialidades médicas e agendamento',
    category: 'health',
    contextPrompt: `Uma clínica médica deve transmitir confiança, profissionalismo e acolhimento. Design limpo e organizado com cores que transmitam saúde e segurança. Especialidades médicas bem apresentadas com descrição dos tratamentos. Equipe médica com formação, CRM e especializações. Convênios aceitos em destaque. Agendamento online simplifica processo. Localização com fácil acesso e estacionamento. Preparos para exames e orientações pré-consulta.`,
    defaultObjectives: [
      'Apresentar especialidades médicas',
      'Facilitar agendamento de consultas',
      'Destacar equipe qualificada',
      'Informar convênios aceitos',
      'Gerar confiança profissional',
      'Orientar sobre exames e preparos'
    ],
    suggestedPages: ['Home', 'Especialidades', 'Equipe Médica', 'Convênios', 'Exames', 'Agendamento', 'Contato'],
    suggestedFeatures: [
      'Lista de especialidades',
      'Perfil dos médicos',
      'Sistema de agendamento',
      'Lista de convênios',
      'Preparos para exames',
      'Resultados online',
      'Mapa de localização'
    ],
    seoKeywords: ['clínica médica', 'consulta médica', 'especialista', 'agendamento médico', 'exames'],
    commonSections: ['Hero profissional', 'Especialidades', 'Médicos', 'Convênios', 'Agendamento', 'Localização'],
    colorSuggestions: [
      { primary: '#0891b2', secondary: '#ffffff', name: 'Azul & Branco (Clássico)' },
      { primary: '#16a34a', secondary: '#f0fdf4', name: 'Verde & Branco (Saúde)' },
      { primary: '#6366f1', secondary: '#eef2ff', name: 'Índigo & Lavanda (Moderno)' }
    ]
  },
  {
    id: 'odontologia',
    name: 'Clínica Odontológica',
    emoji: '🦷',
    description: 'Tratamentos dentários e sorriso perfeito',
    category: 'health',
    contextPrompt: `Uma clínica odontológica deve combinar profissionalismo médico com promessa de sorriso perfeito. Design que transmita limpeza, modernidade e tecnologia. Tratamentos bem explicados com benefícios claros. Antes/depois de tratamentos estéticos são poderosos. Equipe com especializações (ortodontia, implantes, estética). Financiamento facilita tratamentos de maior valor. Emergências 24h é diferencial. Primeira consulta com avaliação gratuita atrai novos pacientes.`,
    defaultObjectives: [
      'Apresentar tratamentos disponíveis',
      'Destacar resultados estéticos',
      'Captar pacientes para avaliação',
      'Mostrar equipe especializada',
      'Oferecer financiamento',
      'Atendimento de emergência'
    ],
    suggestedPages: ['Home', 'Tratamentos', 'Sorrisos', 'Equipe', 'Tecnologia', 'Agendamento', 'Contato'],
    suggestedFeatures: [
      'Catálogo de tratamentos',
      'Galeria de sorrisos',
      'Perfil dos dentistas',
      'Simulador de sorriso',
      'Agendamento online',
      'WhatsApp emergência',
      'Blog educativo'
    ],
    seoKeywords: ['dentista', 'odontologia', 'implante dentário', 'clareamento', 'ortodontia'],
    commonSections: ['Hero com sorrisos', 'Tratamentos', 'Resultados', 'Equipe', 'Tecnologia', 'Agendamento'],
    colorSuggestions: [
      { primary: '#0ea5e9', secondary: '#f0f9ff', name: 'Azul Céu & Branco' },
      { primary: '#14b8a6', secondary: '#f0fdfa', name: 'Turquesa & Branco' },
      { primary: '#8b5cf6', secondary: '#faf5ff', name: 'Violeta & Lavanda' }
    ]
  },

  // PETS
  {
    id: 'petshop',
    name: 'Pet Shop',
    emoji: '🐶',
    description: 'Serviços, produtos e cuidados para pets',
    category: 'pets',
    contextPrompt: `Um pet shop precisa transmitir amor e cuidado com os animais. Design alegre e acolhedor com fotos de pets felizes. Serviços de banho e tosa com agendamento online. Catálogo de produtos com possibilidade de compra. Veterinária integrada agrega valor. Galeria de pets atendidos gera conexão emocional. Dicas de cuidados demonstram expertise. Programa de fidelidade para compras recorrentes. Hotel para pets e day care são serviços premium.`,
    defaultObjectives: [
      'Agendar banho e tosa',
      'Apresentar serviços disponíveis',
      'Vender produtos online',
      'Oferecer atendimento veterinário',
      'Fidelizar tutores',
      'Divulgar hotel e day care'
    ],
    suggestedPages: ['Home', 'Serviços', 'Produtos', 'Veterinária', 'Hotel Pet', 'Agendamento', 'Contato'],
    suggestedFeatures: [
      'Agendamento de serviços',
      'Catálogo de produtos',
      'Galeria de pets',
      'Dicas de cuidados',
      'WhatsApp flutuante',
      'Blog pet',
      'Programa fidelidade'
    ],
    seoKeywords: ['pet shop', 'banho e tosa', 'produtos pet', 'veterinário', 'hotel pet'],
    commonSections: ['Hero com pets', 'Serviços', 'Produtos', 'Galeria', 'Dicas', 'Agendamento'],
    colorSuggestions: [
      { primary: '#f97316', secondary: '#fff7ed', name: 'Laranja & Creme (Alegre)' },
      { primary: '#22c55e', secondary: '#f0fdf4', name: 'Verde & Branco (Natural)' },
      { primary: '#06b6d4', secondary: '#ecfeff', name: 'Ciano & Branco (Moderno)' }
    ]
  },
  {
    id: 'clinica-veterinaria',
    name: 'Clínica Veterinária',
    emoji: '🐾',
    description: 'Atendimento veterinário completo',
    category: 'pets',
    contextPrompt: `Uma clínica veterinária combina cuidado médico com amor pelos animais. Design profissional mas acolhedor. Especialidades veterinárias bem apresentadas. Emergência 24h é diferencial crucial. Equipe veterinária com formação e especializações. Exames e diagnósticos disponíveis. Internação e cirurgias quando necessário. Vacinação e preventivos. Telemedicina veterinária é tendência. Planos de saúde pet em parceria.`,
    defaultObjectives: [
      'Atendimento de emergência 24h',
      'Apresentar especialidades',
      'Destacar equipe veterinária',
      'Oferecer exames e diagnósticos',
      'Informar sobre vacinação',
      'Planos de saúde pet'
    ],
    suggestedPages: ['Home', 'Especialidades', 'Equipe', 'Exames', 'Emergência', 'Vacinação', 'Contato'],
    suggestedFeatures: [
      'Botão emergência 24h',
      'Lista de especialidades',
      'Perfil veterinários',
      'Agendamento online',
      'Resultados de exames',
      'Carteira de vacinação',
      'Telemedicina'
    ],
    seoKeywords: ['veterinário', 'clínica veterinária', 'emergência pet', 'vacinação pet', 'veterinário 24h'],
    commonSections: ['Hero profissional', 'Especialidades', 'Equipe', 'Serviços', 'Emergência', 'Contato'],
    colorSuggestions: [
      { primary: '#16a34a', secondary: '#f0fdf4', name: 'Verde & Branco (Saúde)' },
      { primary: '#0891b2', secondary: '#ecfeff', name: 'Azul & Branco (Clínico)' },
      { primary: '#7c3aed', secondary: '#faf5ff', name: 'Roxo & Lavanda (Carinho)' }
    ]
  },

  // SERVIÇOS PROFISSIONAIS
  {
    id: 'advocacia',
    name: 'Escritório de Advocacia',
    emoji: '⚖️',
    description: 'Serviços jurídicos e consultoria legal',
    category: 'legal',
    contextPrompt: `Um escritório de advocacia deve transmitir credibilidade, experiência e confiança. Design sóbrio e profissional, preferencialmente com tons escuros e dourados. Áreas de atuação bem definidas com explicações acessíveis. Equipe com OAB e especializações. Cases de sucesso (sem identificar clientes) demonstram competência. Blog jurídico com conteúdo educativo atrai tráfego orgânico. Consulta inicial para análise de caso. Atendimento online expande alcance geográfico.`,
    defaultObjectives: [
      'Apresentar áreas de atuação',
      'Destacar equipe qualificada',
      'Gerar autoridade jurídica',
      'Captar clientes para consulta',
      'Produzir conteúdo educativo',
      'Oferecer atendimento online'
    ],
    suggestedPages: ['Home', 'Áreas de Atuação', 'Equipe', 'Cases', 'Blog', 'Consulta', 'Contato'],
    suggestedFeatures: [
      'Áreas de atuação detalhadas',
      'Perfil dos advogados',
      'Cases de sucesso',
      'Blog jurídico',
      'Formulário de consulta',
      'Chat para dúvidas',
      'Newsletter jurídica'
    ],
    seoKeywords: ['advogado', 'escritório advocacia', 'consultoria jurídica', 'advogado online', 'direito'],
    commonSections: ['Hero institucional', 'Áreas de atuação', 'Equipe', 'Cases', 'Blog', 'Consulta'],
    colorSuggestions: [
      { primary: '#1c1917', secondary: '#d4af37', name: 'Preto & Dourado (Tradicional)' },
      { primary: '#1e3a5f', secondary: '#f8fafc', name: 'Azul Marinho & Branco' },
      { primary: '#7c2d12', secondary: '#fef3c7', name: 'Marrom & Creme (Clássico)' }
    ]
  },
  {
    id: 'contabilidade',
    name: 'Escritório de Contabilidade',
    emoji: '📊',
    description: 'Serviços contábeis e consultoria fiscal',
    category: 'services',
    contextPrompt: `Um escritório de contabilidade deve transmitir organização, precisão e confiança financeira. Design clean e profissional. Serviços bem categorizados: abertura de empresa, contabilidade mensal, fiscal, folha de pagamento, etc. Planos e preços transparentes. Contabilidade digital como diferencial moderno. Portal do cliente para documentos. Blog com atualizações tributárias demonstra expertise. Simuladores (impostos, MEI, etc.) agregam valor. Depoimentos de empresários satisfeitos.`,
    defaultObjectives: [
      'Apresentar serviços contábeis',
      'Captar novos clientes',
      'Oferecer contabilidade digital',
      'Portal do cliente online',
      'Produzir conteúdo tributário',
      'Simular custos e impostos'
    ],
    suggestedPages: ['Home', 'Serviços', 'Planos', 'Portal Cliente', 'Blog', 'Simuladores', 'Contato'],
    suggestedFeatures: [
      'Lista de serviços',
      'Tabela de planos',
      'Área do cliente',
      'Simulador de impostos',
      'Blog tributário',
      'Chat online',
      'Abertura de empresa'
    ],
    seoKeywords: ['contador', 'contabilidade', 'abertura empresa', 'contabilidade online', 'escritório contábil'],
    commonSections: ['Hero profissional', 'Serviços', 'Planos', 'Diferenciais', 'Blog', 'Contato'],
    colorSuggestions: [
      { primary: '#2563eb', secondary: '#eff6ff', name: 'Azul & Branco (Confiança)' },
      { primary: '#16a34a', secondary: '#f0fdf4', name: 'Verde & Branco (Financeiro)' },
      { primary: '#1c1917', secondary: '#f8fafc', name: 'Preto & Branco (Profissional)' }
    ]
  },
  {
    id: 'imobiliaria',
    name: 'Imobiliária',
    emoji: '🏠',
    description: 'Venda e locação de imóveis',
    category: 'real-estate',
    contextPrompt: `Uma imobiliária digital precisa de busca avançada e filtros eficientes. Design aspiracional com fotos de alta qualidade dos imóveis. Fichas completas com todas as informações, fotos, planta e localização. Mapa interativo mostra disponibilidades por região. Filtros por tipo, preço, quartos, bairro. Tour virtual 360° é diferencial. Financiamento simulado facilita decisão. Corretores disponíveis com WhatsApp direto. Área de favoritos e alertas de novos imóveis.`,
    defaultObjectives: [
      'Apresentar catálogo de imóveis',
      'Busca com filtros avançados',
      'Fichas completas de imóveis',
      'Simular financiamento',
      'Conectar com corretores',
      'Agendar visitas online'
    ],
    suggestedPages: ['Home', 'Imóveis', 'Venda', 'Locação', 'Simulador', 'Corretores', 'Contato'],
    suggestedFeatures: [
      'Busca com filtros',
      'Mapa de imóveis',
      'Fichas detalhadas',
      'Tour virtual 360°',
      'Simulador financiamento',
      'WhatsApp corretor',
      'Favoritos e alertas'
    ],
    seoKeywords: ['imobiliária', 'apartamento venda', 'casa aluguel', 'imóveis', 'corretor imóveis'],
    commonSections: ['Hero com busca', 'Destaques', 'Tipos de imóveis', 'Mapa', 'Corretores', 'Contato'],
    colorSuggestions: [
      { primary: '#2563eb', secondary: '#eff6ff', name: 'Azul & Branco (Confiança)' },
      { primary: '#16a34a', secondary: '#f0fdf4', name: 'Verde & Branco (Investimento)' },
      { primary: '#7c3aed', secondary: '#faf5ff', name: 'Roxo & Lavanda (Premium)' }
    ]
  },

  // EDUCAÇÃO
  {
    id: 'escola-curso',
    name: 'Escola / Centro de Cursos',
    emoji: '📚',
    description: 'Cursos, matrículas e metodologia',
    category: 'education',
    contextPrompt: `Uma escola ou centro de cursos deve transmitir conhecimento, transformação e resultados. Design moderno e inspirador. Cursos bem apresentados com carga horária, conteúdo e certificação. Metodologia diferenciada em destaque. Depoimentos de alunos e taxa de empregabilidade para cursos profissionalizantes. Tour virtual da estrutura. Processo de matrícula simplificado. Plataforma EAD para cursos online. Blog educacional atrai tráfego. Parcerias empresariais e descontos.`,
    defaultObjectives: [
      'Apresentar catálogo de cursos',
      'Facilitar processo de matrícula',
      'Destacar metodologia',
      'Mostrar resultados de alunos',
      'Oferecer EAD',
      'Atrair parcerias empresariais'
    ],
    suggestedPages: ['Home', 'Cursos', 'Metodologia', 'Estrutura', 'Resultados', 'Matrícula', 'Contato'],
    suggestedFeatures: [
      'Catálogo de cursos',
      'Formulário matrícula',
      'Tour virtual',
      'Plataforma EAD',
      'Depoimentos alunos',
      'Blog educacional',
      'Parcerias empresas'
    ],
    seoKeywords: ['curso', 'escola', 'formação', 'capacitação', 'curso profissionalizante'],
    commonSections: ['Hero inspirador', 'Cursos', 'Metodologia', 'Estrutura', 'Resultados', 'Matrícula'],
    colorSuggestions: [
      { primary: '#2563eb', secondary: '#eff6ff', name: 'Azul & Branco (Educação)' },
      { primary: '#7c3aed', secondary: '#faf5ff', name: 'Roxo & Lavanda (Inovação)' },
      { primary: '#16a34a', secondary: '#f0fdf4', name: 'Verde & Branco (Crescimento)' }
    ]
  },
  {
    id: 'personal-coach',
    name: 'Personal / Coach',
    emoji: '🎯',
    description: 'Coaching, mentoria e desenvolvimento pessoal',
    category: 'education',
    contextPrompt: `Um personal ou coach precisa vender transformação e resultados. Design aspiracional e motivador. Metodologia própria como diferencial. Resultados de clientes com depoimentos em vídeo são poderosos. Jornada do cliente clara: diagnóstico, processo, resultado. Programas e pacotes bem definidos. Conteúdo gratuito (lives, ebooks) atrai audiência. Redes sociais integradas mostram autoridade. Agenda de eventos e palestras. Call-to-action para sessão diagnóstico gratuita.`,
    defaultObjectives: [
      'Apresentar metodologia',
      'Mostrar resultados de clientes',
      'Captar leads para diagnóstico',
      'Vender programas e mentorias',
      'Construir autoridade',
      'Divulgar conteúdo gratuito'
    ],
    suggestedPages: ['Home', 'Sobre', 'Metodologia', 'Programas', 'Resultados', 'Conteúdo', 'Contato'],
    suggestedFeatures: [
      'Vídeo de apresentação',
      'Depoimentos em vídeo',
      'Programas detalhados',
      'Formulário diagnóstico',
      'Blog/Conteúdo',
      'Newsletter',
      'Redes sociais'
    ],
    seoKeywords: ['coach', 'coaching', 'mentoria', 'desenvolvimento pessoal', 'personal'],
    commonSections: ['Hero aspiracional', 'Sobre', 'Metodologia', 'Programas', 'Resultados', 'Contato'],
    colorSuggestions: [
      { primary: '#d97706', secondary: '#fffbeb', name: 'Dourado & Creme (Premium)' },
      { primary: '#dc2626', secondary: '#fef2f2', name: 'Vermelho & Branco (Energia)' },
      { primary: '#7c3aed', secondary: '#faf5ff', name: 'Roxo & Lavanda (Transformação)' }
    ]
  },

  // CRIATIVOS
  {
    id: 'fotografo',
    name: 'Fotógrafo / Videomaker',
    emoji: '📷',
    description: 'Portfolio, ensaios e eventos',
    category: 'creative',
    contextPrompt: `Um fotógrafo ou videomaker vende através do visual. Portfolio é tudo - deve ser impactante e carregar rápido. Design minimalista que destaque as imagens. Categorias de trabalho: casamentos, ensaios, corporativo, etc. Pacotes e investimento (evitar "preço"). Processo de trabalho explicado. Depoimentos de clientes. Formulário de orçamento com data do evento. Instagram e redes integrados. Blog com dicas de fotografia atrai tráfego.`,
    defaultObjectives: [
      'Exibir portfolio impactante',
      'Apresentar estilos de trabalho',
      'Captar orçamentos',
      'Mostrar processo criativo',
      'Integrar redes sociais',
      'Produzir conteúdo'
    ],
    suggestedPages: ['Home', 'Portfolio', 'Casamentos', 'Ensaios', 'Sobre', 'Investimento', 'Contato'],
    suggestedFeatures: [
      'Galeria em grid/masonry',
      'Lightbox para fotos',
      'Vídeo showreel',
      'Categorias de trabalho',
      'Formulário orçamento',
      'Instagram feed',
      'Blog fotografia'
    ],
    seoKeywords: ['fotógrafo', 'fotografia casamento', 'ensaio fotográfico', 'videomaker', 'fotógrafo profissional'],
    commonSections: ['Hero com foto impactante', 'Portfolio grid', 'Sobre', 'Serviços', 'Depoimentos', 'Contato'],
    colorSuggestions: [
      { primary: '#1c1917', secondary: '#ffffff', name: 'Preto & Branco (Minimalista)' },
      { primary: '#1c1917', secondary: '#d4af37', name: 'Preto & Dourado (Luxo)' },
      { primary: '#f5f5f4', secondary: '#1c1917', name: 'Branco & Preto (Clean)' }
    ]
  },
  {
    id: 'agencia-marketing',
    name: 'Agência de Marketing',
    emoji: '🚀',
    description: 'Marketing digital, social media e branding',
    category: 'creative',
    contextPrompt: `Uma agência de marketing deve praticar o que prega. Site impecável, moderno e com resultados mensuráveis. Cases de sucesso com métricas reais (aumento de vendas, seguidores, ROI). Serviços bem explicados: social media, tráfego pago, SEO, branding, etc. Equipe criativa apresentada. Blog com conteúdo de marketing digital demonstra expertise. Calculadora de ROI ou diagnóstico gratuito captam leads. Pacotes mensais com entregas claras. Clientes atendidos como prova social.`,
    defaultObjectives: [
      'Apresentar serviços de marketing',
      'Exibir cases com resultados',
      'Captar leads qualificados',
      'Demonstrar expertise',
      'Mostrar equipe criativa',
      'Vender pacotes mensais'
    ],
    suggestedPages: ['Home', 'Serviços', 'Cases', 'Equipe', 'Blog', 'Diagnóstico', 'Contato'],
    suggestedFeatures: [
      'Cases com métricas',
      'Lista de serviços',
      'Calculadora ROI',
      'Blog marketing',
      'Formulário diagnóstico',
      'Clientes/logos',
      'Newsletter'
    ],
    seoKeywords: ['agência marketing', 'marketing digital', 'social media', 'tráfego pago', 'agência publicidade'],
    commonSections: ['Hero impactante', 'Serviços', 'Cases', 'Clientes', 'Equipe', 'Blog', 'Contato'],
    colorSuggestions: [
      { primary: '#8b5cf6', secondary: '#faf5ff', name: 'Roxo & Lavanda (Criativo)' },
      { primary: '#ec4899', secondary: '#fdf2f8', name: 'Pink & Rosa (Bold)' },
      { primary: '#1c1917', secondary: '#f97316', name: 'Preto & Laranja (Energia)' }
    ]
  },

  // OUTROS
  {
    id: 'outro',
    name: 'Outro Nicho',
    emoji: '🌟',
    description: 'Personalize para qualquer tipo de negócio',
    category: 'services',
    contextPrompt: `Este é um projeto personalizado que requer atenção especial às necessidades específicas do negócio. O design deve refletir a identidade da marca e os valores da empresa. Funcionalidades devem ser adaptadas ao modelo de negócio. A estrutura do site deve facilitar a jornada do cliente desde o primeiro contato até a conversão. Considerar elementos de prova social, autoridade e confiança. CTAs claros direcionando para os objetivos principais do negócio.`,
    defaultObjectives: [
      'Apresentar a empresa',
      'Destacar produtos/serviços',
      'Captar clientes',
      'Gerar confiança',
      'Facilitar contato',
      'Converter visitantes'
    ],
    suggestedPages: ['Home', 'Sobre', 'Serviços', 'Portfolio', 'Depoimentos', 'Contato'],
    suggestedFeatures: [
      'Apresentação institucional',
      'Lista de serviços',
      'Galeria/Portfolio',
      'Formulário de contato',
      'WhatsApp flutuante',
      'Depoimentos',
      'Mapa de localização'
    ],
    seoKeywords: [],
    commonSections: ['Hero', 'Sobre', 'Serviços', 'Portfolio', 'Depoimentos', 'Contato'],
    colorSuggestions: [
      { primary: '#2563eb', secondary: '#eff6ff', name: 'Azul & Branco (Profissional)' },
      { primary: '#16a34a', secondary: '#f0fdf4', name: 'Verde & Branco (Confiança)' },
      { primary: '#1c1917', secondary: '#f8fafc', name: 'Preto & Branco (Elegante)' }
    ]
  }
];

export function getNicheById(id: string): NicheContext | undefined {
  return NICHE_CONTEXTS.find(niche => niche.id === id);
}

export function getNichesByCategory(category: NicheContext['category']): NicheContext[] {
  return NICHE_CONTEXTS.filter(niche => niche.category === category);
}

export const NICHE_CATEGORIES = [
  { id: 'food', name: 'Alimentação', emoji: '🍽️' },
  { id: 'beauty', name: 'Beleza & Estética', emoji: '💅' },
  { id: 'health', name: 'Saúde & Fitness', emoji: '💪' },
  { id: 'pets', name: 'Pets', emoji: '🐾' },
  { id: 'services', name: 'Serviços', emoji: '💼' },
  { id: 'education', name: 'Educação', emoji: '📚' },
  { id: 'legal', name: 'Jurídico', emoji: '⚖️' },
  { id: 'real-estate', name: 'Imobiliário', emoji: '🏠' },
  { id: 'creative', name: 'Criativos', emoji: '🎨' },
] as const;
