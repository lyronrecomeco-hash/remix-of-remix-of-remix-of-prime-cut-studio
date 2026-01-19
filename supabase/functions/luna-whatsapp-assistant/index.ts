import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================================
// LUNA WHATSAPP ASSISTANT - Genesis AI
// Interface conversacional para prospecção via WhatsApp
// Reutiliza a lógica existente do "Buscar Cliente"
// =====================================================

// Configuração do grupo e conta
const GENESIS_HUB_GROUP_NAME = "Genesis Hub";
const GENESIS_HUB_GROUP_JID = "120363381019922166@g.us"; // JID do grupo Genesis Hub
const ADMIN_EMAIL = "lyronrp@gmail.com";
const GENESIS_INSTANCE_ID = "b2b6cf5a-2e15-4f79-94fb-396385077658";

// Palavras-chave de ativação
const ACTIVATION_KEYWORDS = [
  'genesis', 'luna', 'buscar cliente', 'buscar clientes', 
  'prospecção', 'prospectar', 'painel', 'pesquisar empresas',
  'encontrar empresas', 'busca de clientes'
];

// Contexto de conversação em memória (por sessão)
interface ConversationContext {
  lastSearch?: {
    country: string;
    state: string;
    city: string;
    niche: string;
    results: any[];
    filters: {
      withoutSite: boolean;
      withoutWhatsApp: boolean;
    };
  };
  lastInteraction: number;
  messageCount: number;
}

const conversationContexts: Map<string, ConversationContext> = new Map();

// =====================================================
// HELPERS
// =====================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isActivationMessage(message: string): boolean {
  const normalized = normalizeText(message);
  return ACTIVATION_KEYWORDS.some(keyword => 
    normalized.includes(normalizeText(keyword))
  );
}

function isGroupMessage(data: any): boolean {
  // Detectar se é mensagem de grupo baseado no JID ou estrutura
  const remoteJid = data?.key?.remoteJid || data?.remoteJid || '';
  return remoteJid.includes('@g.us');
}

function getGroupName(data: any): string | null {
  // Tentar extrair nome do grupo de diferentes estruturas de webhook
  return data?.groupName || 
         data?.pushName ||
         data?.participant?.groupName ||
         data?.message?.conversation?.groupName ||
         null;
}

function isGenesisHubGroup(data: any): boolean {
  const groupName = getGroupName(data);
  if (!groupName) {
    // Se não conseguir extrair nome, verificar pelo JID se é grupo conhecido
    const remoteJid = data?.key?.remoteJid || data?.remoteJid || '';
    // Permitir processamento se for grupo (assumir Genesis Hub por enquanto)
    return remoteJid.includes('@g.us');
  }
  return normalizeText(groupName).includes(normalizeText(GENESIS_HUB_GROUP_NAME));
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// =====================================================
// PARSER DE COMANDOS DE BUSCA
// =====================================================

interface ParsedSearchCommand {
  isSearchCommand: boolean;
  country?: string;
  state?: string;
  city?: string;
  niche?: string;
  filters: {
    withoutSite: boolean;
    withoutWhatsApp: boolean;
  };
}

function parseSearchCommand(message: string): ParsedSearchCommand {
  const normalized = normalizeText(message);
  
  const result: ParsedSearchCommand = {
    isSearchCommand: false,
    filters: {
      withoutSite: false,
      withoutWhatsApp: false
    }
  };

  // Verificar se é comando de busca
  const searchPatterns = [
    /buscar?\s+cliente/i,
    /buscar?\s+empresa/i,
    /prospectar/i,
    /encontrar?\s+empresa/i,
    /pesquisar?\s+empresa/i,
    /busca\s+em/i,
    /clientes?\s+(?:em|no|na|de)/i
  ];

  if (!searchPatterns.some(p => p.test(message))) {
    return result;
  }

  result.isSearchCommand = true;

  // Detectar filtros
  result.filters.withoutSite = /sem\s+site|without\s+site|no\s+website/i.test(message);
  result.filters.withoutWhatsApp = /sem\s+whatsapp|without\s+whatsapp|no\s+whatsapp/i.test(message);

  // Extrair país (default: Brasil)
  const countryPatterns: { pattern: RegExp; code: string }[] = [
    { pattern: /brasil|brazil/i, code: 'BR' },
    { pattern: /portugal/i, code: 'PT' },
    { pattern: /estados\s+unidos|usa|eua/i, code: 'US' },
    { pattern: /argentina/i, code: 'AR' },
    { pattern: /mexico|méxico/i, code: 'MX' },
    { pattern: /espanha|spain|españa/i, code: 'ES' },
  ];

  result.country = 'BR'; // Default
  for (const { pattern, code } of countryPatterns) {
    if (pattern.test(message)) {
      result.country = code;
      break;
    }
  }

  // Extrair estado brasileiro
  const statePatterns: { pattern: RegExp; state: string }[] = [
    { pattern: /são\s+paulo|sao\s+paulo|\bsp\b/i, state: 'SP' },
    { pattern: /rio\s+de\s+janeiro|\brj\b/i, state: 'RJ' },
    { pattern: /minas\s+gerais|\bmg\b/i, state: 'MG' },
    { pattern: /bahia|\bba\b/i, state: 'BA' },
    { pattern: /parana|paraná|\bpr\b/i, state: 'PR' },
    { pattern: /rio\s+grande\s+do\s+sul|\brs\b/i, state: 'RS' },
    { pattern: /santa\s+catarina|\bsc\b/i, state: 'SC' },
    { pattern: /pernambuco|\bpe\b/i, state: 'PE' },
    { pattern: /ceara|ceará|\bce\b/i, state: 'CE' },
    { pattern: /goias|goiás|\bgo\b/i, state: 'GO' },
    { pattern: /distrito\s+federal|\bdf\b/i, state: 'DF' },
  ];

  for (const { pattern, state } of statePatterns) {
    if (pattern.test(message)) {
      result.state = state;
      break;
    }
  }

  // Extrair cidade (padrões comuns)
  const cityMatch = message.match(/(?:em|cidade\s+de|cidade:?\s*)\s*([A-Za-zÀ-ÿ\s]+?)(?:,|\.|nicho|sem|$)/i);
  if (cityMatch) {
    result.city = cityMatch[1].trim();
  }

  // Extrair nicho
  const nichePatterns: { pattern: RegExp; niche: string }[] = [
    { pattern: /barbearia|barbeiro/i, niche: 'barbearia' },
    { pattern: /pet\s*shop|petshop/i, niche: 'petshop' },
    { pattern: /salao|salão|cabeleireiro/i, niche: 'salao' },
    { pattern: /clinica|clínica/i, niche: 'clinica' },
    { pattern: /dentista|odonto/i, niche: 'dentista' },
    { pattern: /academia|gym/i, niche: 'academia' },
    { pattern: /restaurante/i, niche: 'restaurante' },
    { pattern: /estetica|estética/i, niche: 'clinica-estetica' },
    { pattern: /loja|comercio|comércio/i, niche: 'comercio' },
    { pattern: /advogado|advocacia/i, niche: 'advocacia' },
    { pattern: /contabil|contábil|contador/i, niche: 'contabilidade' },
    { pattern: /imobiliaria|imobiliária/i, niche: 'imobiliaria' },
    { pattern: /oficina|mecanica|mecânica/i, niche: 'oficina' },
    { pattern: /padaria/i, niche: 'padaria' },
    { pattern: /pizzaria/i, niche: 'pizzaria' },
    { pattern: /hamburgueria|burger/i, niche: 'hamburgueria' },
    { pattern: /cafeteria|café/i, niche: 'cafeteria' },
    { pattern: /hotel|pousada/i, niche: 'hotel' },
    { pattern: /escola|educacao|educação/i, niche: 'escola' },
    { pattern: /lavanderia/i, niche: 'lavanderia' },
    { pattern: /farmacia|farmácia/i, niche: 'farmacia' },
    { pattern: /floricultura|flores/i, niche: 'floricultura' },
  ];

  // Procurar pelo nicho direto
  const nicheMatch = message.match(/nicho[:\s]+([A-Za-zÀ-ÿ\-\s]+?)(?:,|\.|sem|$)/i);
  if (nicheMatch) {
    const nicheText = nicheMatch[1].trim().toLowerCase();
    for (const { pattern, niche } of nichePatterns) {
      if (pattern.test(nicheText)) {
        result.niche = niche;
        break;
      }
    }
    if (!result.niche) {
      result.niche = nicheText;
    }
  } else {
    // Procurar padrões de nicho na mensagem toda
    for (const { pattern, niche } of nichePatterns) {
      if (pattern.test(message)) {
        result.niche = niche;
        break;
      }
    }
  }

  return result;
}

// =====================================================
// FORMATADOR DE RESPOSTA
// =====================================================

function formatSearchResults(results: any[], params: ParsedSearchCommand, context?: ConversationContext): string {
  if (!results || results.length === 0) {
    return `📊 *Resultado da Busca - Genesis*

🔍 Nenhuma empresa encontrada com os critérios informados.

Tente:
• Mudar a cidade ou nicho
• Remover filtros como "sem site"

Exemplo: "Genesis, buscar clientes em São Paulo, SP, nicho petshop"`;
  }

  // Calcular métricas
  const total = results.length;
  const withoutSite = results.filter((r: any) => !r.website).length;
  const withSite = total - withoutSite;
  const withoutPhone = results.filter((r: any) => !r.phone).length;
  const highPotential = results.filter((r: any) => !r.website && r.rating && r.rating >= 4).length;

  // Construir localização
  let location = '';
  if (params.city) location += params.city;
  if (params.state) location += location ? ` / ${params.state}` : params.state;
  if (params.country) location += location ? ` (${params.country})` : params.country;

  let response = `📊 *Resultado da Busca – Genesis*

📍 *Local:* ${location || 'Não especificado'}
🧩 *Nicho:* ${params.niche || 'Não especificado'}`;

  if (params.filters.withoutSite) {
    response += `\n🌐 *Filtro:* Sem site`;
  }
  if (params.filters.withoutWhatsApp) {
    response += `\n📱 *Filtro:* Sem WhatsApp`;
  }

  response += `

📈 *Métricas:*
• Empresas encontradas: *${total}*
• Alto potencial (sem site + rating ≥4): *${highPotential}*
• Com site: *${withSite}*
• Sem site: *${withoutSite}*
• Sem telefone público: *${withoutPhone}*

💡 *Análise Luna:*
${withoutSite > total / 2 
  ? `Excelente oportunidade! ${Math.round((withoutSite/total)*100)}% das empresas estão sem presença digital.`
  : `Mercado com boa presença online. Foque nas ${withoutSite} empresas sem site.`}

🔄 *Deseja refinar a busca?*
• "só os que não tem site"
• "refina pra outra cidade"
• "mostrar empresas de alto potencial"
• "qual vale mais a pena abordar?"`;

  return response;
}

function getHelpMessage(): string {
  return `🌙 *Luna - Assistente Genesis*

Olá! Sou a Luna, sua assistente de prospecção da Genesis.

📋 *O que posso fazer:*
• Buscar clientes por país, estado, cidade e nicho
• Filtrar empresas sem site, sem WhatsApp ou sem presença digital
• Analisar oportunidades de prospecção
• Gerar insights com base nos dados do painel

🔍 *Como usar:*

*Busca simples:*
"Genesis, buscar clientes em São Paulo, SP, nicho petshop"

*Com filtros:*
"Luna, buscar empresas sem site em Curitiba, PR, nicho barbearia"

*Refinar busca anterior:*
"agora só os que não tem WhatsApp"
"refina pra cidade de Campinas"

💡 *Dicas:*
• Sempre informe cidade e nicho para melhores resultados
• Use filtros para encontrar oportunidades de alto potencial
• Posso manter contexto da última busca para refinamentos

Digite "buscar cliente" seguido dos parâmetros para começar!`;
}

function getDailyMessage(): string {
  const greeting = getGreeting();
  return `*${greeting}, povo! ☀️*
Aqui é a Luna da Genesis.
Vamos acordar e trabalhar — está na hora de prospectar. 🚀

*O que você pode fazer aqui comigo:*
• Buscar clientes por país, estado, cidade e nicho
• Filtrar empresas sem site, sem WhatsApp ou sem presença digital
• Pedir estratégias de prospecção
• Gerar insights com base nos dados do painel

*Exemplo de comando:*
_"Genesis, buscar clientes no Brasil, São Paulo, nicho petshop, sem site."_`;
}

// =====================================================
// ENVIAR MENSAGEM VIA WHATSAPP
// =====================================================

function extractBaseHostAndPorts(backendUrlRaw: string) {
  const cleanUrl = String(backendUrlRaw).trim().replace(/\/$/, "");
  const match = cleanUrl.match(/^(https?:\/\/[^:\/]+)(?::(\d+))?(.*)$/);
  const baseHost = match ? match[1] : cleanUrl;
  const configuredPort = match?.[2] || "3000";
  const portsToTry = configuredPort === "3001" ? ["3001", "3000"] : ["3000", "3001"];
  return { baseHost, portsToTry };
}

async function sendWhatsAppMessage(
  supabase: any,
  instanceId: string,
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Luna] Preparando envio: instanceId=${instanceId}, to=${to}`);

    // Buscar configuração do backend
    const { data: globalConfig } = await supabase
      .from('whatsapp_backend_config')
      .select('backend_url, master_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Buscar instância para pegar o nome
    const { data: instance } = await supabase
      .from('genesis_instances')
      .select('id, name, backend_url, backend_token')
      .eq('id', instanceId)
      .maybeSingle();

    const backendUrlRaw = globalConfig?.backend_url || instance?.backend_url || 'http://72.62.108.24:3000';
    const backendToken = globalConfig?.master_token || instance?.backend_token || 'genesis-master-token-2024-secure';
    // IMPORTANTE: Usar o UUID da instância (igual send-whatsapp-genesis que funciona)
    const instanceUuid = instance?.id || instanceId;

    const { baseHost, portsToTry } = extractBaseHostAndPorts(backendUrlRaw);
    console.log(`[Luna] Backend: ${baseHost}, InstanceUUID: ${instanceUuid}, Token: ${backendToken.substring(0,10)}...`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${backendToken}`,
      'apikey': backendToken,
    };

    const payload = {
      to,
      phone: to,
      number: to,
      message,
      text: message,
    };

    // Usar UUID da instância (igual send-whatsapp-genesis)
    const sendPath = `/api/instance/${encodeURIComponent(String(instanceUuid))}/send`;

    // Tentar cada porta
    for (const port of portsToTry) {
      const baseUrl = `${baseHost}:${port}`;
      const url = `${baseUrl}${sendPath}`;
      
      console.log(`[Luna] Tentando: ${url}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const resp = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await resp.text();
        console.log(`[Luna] Response ${resp.status}: ${responseText.substring(0, 200)}`);

        if (resp.ok) {
          try {
            const result = JSON.parse(responseText);
            if (result.key || result.messageId || result.status === 'PENDING' || result.status === 'sent' || result.success) {
              console.log('[Luna] Mensagem enviada com sucesso!');
              return { success: true };
            }
          } catch {
            // Se não conseguiu parsear, mas status é 200/201, considerar sucesso
            if (resp.status === 200 || resp.status === 201) {
              console.log('[Luna] Mensagem enviada (resposta não-JSON)');
              return { success: true };
            }
          }
        }

        // Log do erro mas continua tentando próxima porta
        console.warn(`[Luna] Porta ${port} retornou ${resp.status}`);
      } catch (e: any) {
        console.warn(`[Luna] Porta ${port} falhou: ${e.message}`);
        continue;
      }
    }

    console.error('[Luna] Todas as portas falharam');
    return { success: false, error: 'Nenhuma porta respondeu' };
  } catch (error: any) {
    console.error('[Luna] Send message error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// EXECUTAR BUSCA (REUTILIZANDO LÓGICA EXISTENTE)
// =====================================================

async function executeSearch(
  supabase: any,
  params: ParsedSearchCommand
): Promise<any[]> {
  try {
    // Montar cidade com estado se for Brasil
    let searchCity = params.city || '';
    if (params.country === 'BR' && params.state && params.city) {
      searchCity = `${params.city}, ${params.state}`;
    }

    // Chamar a mesma função que o painel usa
    const { data, error } = await supabase.functions.invoke('search-businesses-global', {
      body: {
        city: searchCity,
        countryCode: params.country || 'BR',
        niche: params.niche || 'comercio',
        maxResults: 100,
        affiliateName: 'Luna Genesis'
      }
    });

    if (error) {
      console.error('[Luna] Search error:', error);
      return [];
    }

    if (!data?.success || !data.results) {
      return [];
    }

    let results = data.results;

    // Aplicar filtros
    if (params.filters.withoutSite) {
      results = results.filter((r: any) => !r.website);
    }

    if (params.filters.withoutWhatsApp) {
      // Filtrar por telefones que não parecem WhatsApp profissional
      results = results.filter((r: any) => {
        if (!r.phone) return true;
        // Heurística simples: telefones curtos ou sem código de área
        const phoneDigits = String(r.phone).replace(/\D/g, '');
        return phoneDigits.length < 10;
      });
    }

    return results;
  } catch (error: any) {
    console.error('[Luna] Execute search error:', error);
    return [];
  }
}

// =====================================================
// PROCESSAR MENSAGEM
// =====================================================

async function processMessage(
  supabase: any,
  message: string,
  fromJid: string,
  groupJid: string,
  instanceId: string
): Promise<string | null> {
  const normalized = normalizeText(message);

  // Verificar se é comando de ajuda
  if (/^(ajuda|help|oi\s+luna|luna|genesis|menu)$/i.test(message.trim())) {
    return getHelpMessage();
  }

  // Obter ou criar contexto da conversa
  let context = conversationContexts.get(groupJid);
  if (!context) {
    context = {
      lastInteraction: Date.now(),
      messageCount: 0
    };
    conversationContexts.set(groupJid, context);
  }

  // Atualizar contexto
  context.lastInteraction = Date.now();
  context.messageCount++;

  // Verificar comandos de refinamento
  if (context.lastSearch) {
    // Refinamentos da busca anterior
    if (/só\s+(?:os\s+)?que\s+não\s+tem\s+site|sem\s+site/i.test(message)) {
      context.lastSearch.filters.withoutSite = true;
      const filtered = context.lastSearch.results.filter((r: any) => !r.website);
      return formatSearchResults(filtered, {
        isSearchCommand: true,
        country: context.lastSearch.country,
        state: context.lastSearch.state,
        city: context.lastSearch.city,
        niche: context.lastSearch.niche,
        filters: context.lastSearch.filters
      }, context);
    }

    if (/só\s+(?:os\s+)?que\s+não\s+tem\s+whatsapp|sem\s+whatsapp/i.test(message)) {
      context.lastSearch.filters.withoutWhatsApp = true;
      const filtered = context.lastSearch.results.filter((r: any) => !r.phone);
      return formatSearchResults(filtered, {
        isSearchCommand: true,
        country: context.lastSearch.country,
        state: context.lastSearch.state,
        city: context.lastSearch.city,
        niche: context.lastSearch.niche,
        filters: context.lastSearch.filters
      }, context);
    }

    if (/alto\s+potencial|high\s+potential/i.test(message)) {
      const filtered = context.lastSearch.results.filter((r: any) => 
        !r.website && r.rating && r.rating >= 4
      );
      return formatSearchResults(filtered, {
        isSearchCommand: true,
        country: context.lastSearch.country,
        state: context.lastSearch.state,
        city: context.lastSearch.city,
        niche: context.lastSearch.niche,
        filters: { withoutSite: true, withoutWhatsApp: false }
      }, context);
    }

    if (/qual\s+vale\s+mais|melhor\s+abordar|recomenda/i.test(message)) {
      // Análise estratégica
      const results = context.lastSearch.results;
      const withoutSite = results.filter((r: any) => !r.website);
      const highRating = withoutSite.filter((r: any) => r.rating && r.rating >= 4);
      
      return `🎯 *Análise Estratégica - Luna*

Com base na sua última busca em *${context.lastSearch.city}/${context.lastSearch.state}* (${context.lastSearch.niche}):

📊 *Recomendação:*
${highRating.length > 0 
  ? `Foque primeiro nas *${highRating.length} empresas* com rating alto (≥4⭐) e sem site. São negócios bem avaliados que ainda não investiram em presença digital - oportunidade premium!`
  : `Foque nas *${withoutSite.length} empresas* sem site. São negócios que precisam de transformação digital.`}

💰 *Potencial de conversão:*
• Empresas sem site têm 80% mais chance de fechar
• Rating alto indica negócio estabelecido com caixa

🚀 *Próximos passos:*
1. Filtre por "alto potencial" para ver a lista
2. Exporte para o painel Genesis
3. Inicie abordagem via WhatsApp

Quer que eu mostre apenas os de alto potencial?`;
    }
  }

  // Parser de comando de busca
  const searchParams = parseSearchCommand(message);

  if (searchParams.isSearchCommand) {
    // Validar parâmetros mínimos
    if (!searchParams.city || !searchParams.niche) {
      return `⚠️ *Parâmetros incompletos*

Para buscar clientes, preciso de:
• Cidade (obrigatório)
• Nicho (obrigatório)
• Estado (recomendado para Brasil)

*Exemplo correto:*
"Genesis, buscar clientes em São Paulo, SP, nicho petshop"

*Com filtros:*
"Luna, buscar empresas sem site em Curitiba, PR, nicho barbearia"`;
    }

    // Executar busca
    const results = await executeSearch(supabase, searchParams);

    // Salvar no contexto
    context.lastSearch = {
      country: searchParams.country || 'BR',
      state: searchParams.state || '',
      city: searchParams.city || '',
      niche: searchParams.niche || '',
      results,
      filters: searchParams.filters
    };
    conversationContexts.set(groupJid, context);

    return formatSearchResults(results, searchParams, context);
  }

  // Mensagem não reconhecida mas é para Luna
  if (isActivationMessage(message)) {
    return getHelpMessage();
  }

  return null;
}

// =====================================================
// ENVIAR MENSAGEM DIÁRIA AUTOMATICAMENTE
// =====================================================

async function sendDailyMessageToGroup(): Promise<void> {
  try {
    console.log('[Luna] Iniciando envio automático da mensagem diária...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se já enviou mensagem hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: existingLog } = await supabase
      .from('genesis_event_logs')
      .select('id')
      .eq('event_type', 'luna_daily_message')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)
      .limit(1)
      .maybeSingle();

    if (existingLog) {
      console.log('[Luna] Mensagem diária já enviada hoje, pulando...');
      return;
    }

    const dailyMessage = getDailyMessage();

    // Enviar para o grupo Genesis Hub
    const sendResult = await sendWhatsAppMessage(
      supabase,
      GENESIS_INSTANCE_ID,
      GENESIS_HUB_GROUP_JID,
      dailyMessage
    );

    // Logar o evento
    await supabase.from('genesis_event_logs').insert({
      instance_id: GENESIS_INSTANCE_ID,
      event_type: 'luna_daily_message',
      severity: sendResult.success ? 'info' : 'error',
      message: sendResult.success 
        ? 'Luna enviou mensagem diária automaticamente' 
        : `Falha ao enviar mensagem diária: ${sendResult.error}`,
      details: {
        group_jid: GENESIS_HUB_GROUP_JID,
        message_preview: dailyMessage.substring(0, 100),
        sent_at: new Date().toISOString()
      }
    });

    console.log('[Luna] Mensagem diária:', sendResult.success ? 'ENVIADA!' : `ERRO: ${sendResult.error}`);
  } catch (error: any) {
    console.error('[Luna] Erro ao enviar mensagem diária:', error);
  }
}

// =====================================================
// HANDLER PRINCIPAL
// =====================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Luna] Webhook received');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('[Luna] Webhook body:', JSON.stringify(body).substring(0, 500));

    // Verificar ação especial: mensagem diária
    if (body.action === 'send_daily_message') {
      console.log('[Luna] Enviando mensagem diária para o grupo...');

      const dailyMessage = getDailyMessage();

      // Enviar para o grupo Genesis Hub diretamente
      const sendResult = await sendWhatsAppMessage(
        supabase,
        GENESIS_INSTANCE_ID,
        GENESIS_HUB_GROUP_JID,
        dailyMessage
      );

      // Logar o evento
      await supabase.from('genesis_event_logs').insert({
        instance_id: GENESIS_INSTANCE_ID,
        event_type: 'luna_daily_message',
        severity: sendResult.success ? 'info' : 'error',
        message: sendResult.success 
          ? 'Luna enviou mensagem diária' 
          : `Falha ao enviar: ${sendResult.error}`,
        details: {
          group_jid: GENESIS_HUB_GROUP_JID,
          triggered_by: 'api_call'
        }
      });

      return new Response(
        JSON.stringify({ 
          success: sendResult.success, 
          message: sendResult.success ? 'Mensagem enviada!' : sendResult.error,
          action: 'daily_message_sent',
          group_jid: GENESIS_HUB_GROUP_JID
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar ação de startup automático
    if (body.action === 'startup' || body.action === 'auto_send_daily') {
      console.log('[Luna] Trigger de startup recebido, iniciando envio automático...');
      
      // Executar em background sem bloquear
      sendDailyMessageToGroup().catch(e => console.error('[Luna] Erro background:', e));

      return new Response(
        JSON.stringify({ 
          success: true, 
          action: 'startup_triggered',
          message: 'Mensagem diária será enviada em background'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Processar webhook de mensagem
    const messageData = body.data?.message || body.message || body;
    const messageText = messageData?.conversation || 
                        messageData?.extendedTextMessage?.text ||
                        messageData?.text ||
                        body.text ||
                        '';

    if (!messageText) {
      console.log('[Luna] No message text found');
      return new Response(
        JSON.stringify({ success: true, action: 'ignored', reason: 'no_message' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é mensagem de grupo
    if (!isGroupMessage(body)) {
      console.log('[Luna] Not a group message, ignoring');
      return new Response(
        JSON.stringify({ success: true, action: 'ignored', reason: 'not_group' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Luna agora funciona em QUALQUER grupo onde o número esteja
    const groupName = getGroupName(body);
    console.log(`[Luna] Grupo detectado: ${groupName || 'Nome não identificado'}`);

    // Verificar se é mensagem de ativação
    if (!isActivationMessage(messageText)) {
      console.log('[Luna] Not an activation message, ignoring');
      return new Response(
        JSON.stringify({ success: true, action: 'ignored', reason: 'no_activation_keyword' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair JIDs
    const groupJid = body.key?.remoteJid || body.remoteJid || '';
    const fromJid = body.key?.participant || body.participant || body.from || '';
    const instanceId = body.instanceId || body.instance?.id || '';

    console.log('[Luna] Processing message:', {
      text: messageText.substring(0, 100),
      groupJid,
      fromJid,
      instanceId
    });

    // Processar mensagem
    const response = await processMessage(supabase, messageText, fromJid, groupJid, instanceId);

    if (response && instanceId) {
      // Enviar resposta
      const sendResult = await sendWhatsAppMessage(supabase, instanceId, groupJid, response);
      
      // Log do evento
      await supabase.from('genesis_event_logs').insert({
        instance_id: instanceId,
        event_type: 'luna_response',
        severity: sendResult.success ? 'info' : 'warning',
        message: sendResult.success ? 'Luna respondeu no grupo' : `Erro ao enviar: ${sendResult.error}`,
        details: {
          group_jid: groupJid,
          from_jid: fromJid,
          message_preview: messageText.substring(0, 100),
          response_preview: response.substring(0, 100)
        }
      });

      return new Response(
        JSON.stringify({ 
          success: sendResult.success, 
          action: 'responded',
          error: sendResult.error
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, action: 'processed', responded: !!response }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Luna] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
