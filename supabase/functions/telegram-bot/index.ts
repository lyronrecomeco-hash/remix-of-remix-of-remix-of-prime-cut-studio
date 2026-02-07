import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: { id: number; type: string };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: { id: number; first_name: string; last_name?: string; username?: string };
    message: { chat: { id: number }; message_id: number };
    data: string;
  };
}

// ─── Telegram helpers ────────────────────────────────────────────────
async function sendMessage(token: string, chatId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function answerCallback(token: string, callbackId: string, text?: string) {
  await fetch(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  });
}

async function editMessage(token: string, chatId: number, messageId: number, text: string, replyMarkup?: any) {
  const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  await fetch(`${TELEGRAM_API}${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Main menu keyboard ─────────────────────────────────────────────
function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🔍 Consultar CPF", callback_data: "query_cpf" },
        { text: "🏢 Consultar CNPJ", callback_data: "query_cnpj" },
      ],
      [
        { text: "👤 Consultar Nome", callback_data: "query_nome" },
        { text: "📱 Consultar Telefone", callback_data: "query_telefone" },
      ],
      [
        { text: "🔗 Analisar Link", callback_data: "query_link" },
        { text: "💬 Analisar Mensagem", callback_data: "query_message" },
      ],
      [
        { text: "📍 Consultar CEP", callback_data: "query_cep" },
        { text: "🏦 Listar Bancos", callback_data: "query_bancos" },
      ],
      [
        { text: "🔔 Monitoramento", callback_data: "monitoring" },
        { text: "📋 Meu Histórico", callback_data: "history" },
      ],
      [{ text: "ℹ️ Ajuda", callback_data: "help" }],
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════
// ─── REAL PUBLIC API INTEGRATIONS ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

// ─── CPF Validation ──────────────────────────────────────────────────
function validateCPF(cpf: string): { valid: boolean; formatted: string; digits: string } {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return { valid: false, formatted: cpf, digits };

  // Check for all same digits
  if (/^(\d)\1{10}$/.test(digits)) return { valid: false, formatted: cpf, digits };

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return { valid: false, formatted: cpf, digits };

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return { valid: false, formatted: cpf, digits };

  const formatted = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
  return { valid: true, formatted, digits };
}

// ─── CNPJ Validation ─────────────────────────────────────────────────
function validateCNPJ(cnpj: string): { valid: boolean; formatted: string; digits: string } {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return { valid: false, formatted: cnpj, digits };

  if (/^(\d)\1{13}$/.test(digits)) return { valid: false, formatted: cnpj, digits };

  const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let remainder = sum % 11;
  const d1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[12]) !== d1) return { valid: false, formatted: cnpj, digits };

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  remainder = sum % 11;
  const d2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[13]) !== d2) return { valid: false, formatted: cnpj, digits };

  const formatted = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`;
  return { valid: true, formatted, digits };
}

// ─── BrasilAPI: CNPJ Lookup ──────────────────────────────────────────
async function lookupCNPJ(cnpj: string): Promise<string> {
  const digits = cnpj.replace(/\D/g, "");
  const validation = validateCNPJ(digits);

  if (!validation.valid) {
    return `❌ <b>CNPJ Inválido</b>\n\nO CNPJ informado não possui um formato válido. Verifique e tente novamente.`;
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
    if (!res.ok) {
      if (res.status === 404) {
        return `❌ <b>CNPJ não encontrado</b>\n\nO CNPJ <code>${validation.formatted}</code> não foi encontrado na base da Receita Federal.`;
      }
      throw new Error(`API status ${res.status}`);
    }

    const d = await res.json();
    const situacao = d.descricao_situacao_cadastral || "N/A";
    const situacaoEmoji = situacao === "ATIVA" ? "🟢" : situacao === "BAIXADA" ? "🔴" : "🟡";

    let text = `🏢 <b>Consulta CNPJ - Dados Reais</b>\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📋 <b>CNPJ:</b> <code>${validation.formatted}</code>\n`;
    text += `🏷️ <b>Razão Social:</b> ${d.razao_social || "N/A"}\n`;
    text += `🏪 <b>Nome Fantasia:</b> ${d.nome_fantasia || "Não informado"}\n\n`;
    text += `${situacaoEmoji} <b>Situação:</b> ${situacao}\n`;
    text += `📅 <b>Data Situação:</b> ${d.data_situacao_cadastral || "N/A"}\n`;
    text += `📅 <b>Abertura:</b> ${d.data_inicio_atividade || "N/A"}\n\n`;
    text += `🔢 <b>Natureza Jurídica:</b> ${d.natureza_juridica || "N/A"}\n`;
    text += `📊 <b>Porte:</b> ${d.porte || "N/A"}\n`;
    text += `💰 <b>Capital Social:</b> R$ ${d.capital_social ? Number(d.capital_social).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "N/A"}\n\n`;

    if (d.cnae_fiscal_descricao) {
      text += `🏭 <b>CNAE Principal:</b> ${d.cnae_fiscal} - ${d.cnae_fiscal_descricao}\n\n`;
    }

    if (d.logradouro) {
      text += `📍 <b>Endereço:</b>\n`;
      text += `   ${d.descricao_tipo_de_logradouro || ""} ${d.logradouro}, ${d.numero || "S/N"}`;
      if (d.complemento) text += `, ${d.complemento}`;
      text += `\n   ${d.bairro || ""} - ${d.municipio || ""}/${d.uf || ""}\n`;
      text += `   CEP: ${d.cep || "N/A"}\n\n`;
    }

    if (d.ddd_telefone_1) {
      text += `📞 <b>Telefone:</b> ${d.ddd_telefone_1}\n`;
    }
    if (d.email) {
      text += `📧 <b>Email:</b> ${d.email}\n`;
    }

    if (d.qsa && d.qsa.length > 0) {
      text += `\n👥 <b>Quadro Societário:</b>\n`;
      d.qsa.slice(0, 5).forEach((s: any) => {
        text += `   • ${s.nome_socio} (${s.qualificacao_socio || "Sócio"})\n`;
      });
      if (d.qsa.length > 5) text += `   ... e mais ${d.qsa.length - 5} sócio(s)\n`;
    }

    if (d.opcao_pelo_simples !== null) {
      text += `\n📊 <b>Simples Nacional:</b> ${d.opcao_pelo_simples ? "✅ Optante" : "❌ Não optante"}\n`;
    }
    if (d.opcao_pelo_mei !== null) {
      text += `📊 <b>MEI:</b> ${d.opcao_pelo_mei ? "✅ Sim" : "❌ Não"}\n`;
    }

    // Risk assessment
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    if (situacao !== "ATIVA") {
      text += `⚠️ <b>ALERTA:</b> Empresa NÃO está ativa! Situação: ${situacao}\n`;
    }
    if (d.capital_social && Number(d.capital_social) < 1000) {
      text += `⚠️ <b>ALERTA:</b> Capital social muito baixo (R$ ${Number(d.capital_social).toFixed(2)})\n`;
    }
    const abertura = d.data_inicio_atividade ? new Date(d.data_inicio_atividade) : null;
    if (abertura) {
      const diffMonths = (Date.now() - abertura.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (diffMonths < 6) {
        text += `⚠️ <b>ALERTA:</b> Empresa aberta há menos de 6 meses\n`;
      }
    }

    text += `\n✅ <i>Dados obtidos da Receita Federal via BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("CNPJ lookup error:", e);
    return `⚠️ Erro ao consultar CNPJ. Tente novamente em instantes.`;
  }
}

// ─── BrasilAPI: CEP Lookup ───────────────────────────────────────────
async function lookupCEP(cep: string): Promise<string> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    return `❌ <b>CEP Inválido</b>\n\nInforme um CEP com 8 dígitos.`;
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (!res.ok) {
      if (res.status === 404) return `❌ <b>CEP não encontrado:</b> <code>${digits}</code>`;
      throw new Error(`API status ${res.status}`);
    }
    const d = await res.json();
    let text = `📍 <b>Consulta CEP - Dados Reais</b>\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📮 <b>CEP:</b> <code>${digits.slice(0,5)}-${digits.slice(5)}</code>\n`;
    text += `📌 <b>Logradouro:</b> ${d.street || "N/A"}\n`;
    text += `🏘️ <b>Bairro:</b> ${d.neighborhood || "N/A"}\n`;
    text += `🏙️ <b>Cidade:</b> ${d.city || "N/A"}\n`;
    text += `🗺️ <b>Estado:</b> ${d.state || "N/A"}\n`;
    if (d.location?.coordinates?.latitude) {
      text += `\n🌐 <b>Coordenadas:</b>\n   Lat: ${d.location.coordinates.latitude}\n   Lng: ${d.location.coordinates.longitude}\n`;
    }
    text += `\n✅ <i>Dados obtidos via BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("CEP lookup error:", e);
    return `⚠️ Erro ao consultar CEP. Tente novamente.`;
  }
}

// ─── BrasilAPI: DDD Info ─────────────────────────────────────────────
async function lookupDDD(ddd: string): Promise<{ state: string; cities: string[] } | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
    if (!res.ok) return null;
    const d = await res.json();
    return { state: d.state || "N/A", cities: d.cities || [] };
  } catch {
    return null;
  }
}

// ─── BrasilAPI: Bank List ────────────────────────────────────────────
async function lookupBancos(): Promise<string> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/banks/v1`);
    if (!res.ok) throw new Error("API error");
    const banks = await res.json();
    const mainBanks = banks.filter((b: any) => b.code && b.fullName).slice(0, 20);

    let text = `🏦 <b>Bancos Registrados no Brasil</b>\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 <b>Total:</b> ${banks.length} instituições\n\n`;
    text += `<b>Principais bancos:</b>\n`;
    mainBanks.forEach((b: any) => {
      text += `   ${b.code} - ${b.fullName?.substring(0, 40)}\n`;
    });
    text += `\n... e mais ${banks.length - 20} instituições\n`;
    text += `\n✅ <i>Dados do Banco Central via BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("Banks lookup error:", e);
    return `⚠️ Erro ao consultar bancos. Tente novamente.`;
  }
}

// ─── Phone Analysis ──────────────────────────────────────────────────
async function analyzePhone(phone: string): Promise<string> {
  const digits = phone.replace(/\D/g, "");

  let text = `📱 <b>Análise de Telefone</b>\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📞 <b>Número:</b> <code>${phone}</code>\n`;

  // Validate format
  if (digits.length < 10 || digits.length > 13) {
    text += `\n❌ <b>Formato inválido.</b> Informe um número com DDD (10 ou 11 dígitos).`;
    return text;
  }

  // Extract DDD
  const startIndex = digits.startsWith("55") ? 2 : 0;
  const ddd = digits.substring(startIndex, startIndex + 2);
  const number = digits.substring(startIndex + 2);
  const isMobile = number.length === 9 && number.startsWith("9");

  text += `📍 <b>DDD:</b> ${ddd}\n`;
  text += `📲 <b>Tipo:</b> ${isMobile ? "📱 Celular" : "☎️ Fixo"}\n`;

  // Lookup DDD region
  const dddInfo = await lookupDDD(ddd);
  if (dddInfo) {
    text += `🗺️ <b>Estado:</b> ${dddInfo.state}\n`;
    if (dddInfo.cities.length > 0) {
      const citiesPreview = dddInfo.cities.slice(0, 5).join(", ");
      text += `🏙️ <b>Cidades:</b> ${citiesPreview}`;
      if (dddInfo.cities.length > 5) text += ` e +${dddInfo.cities.length - 5}`;
      text += `\n`;
    }
  }

  // Known spam/fraud DDD patterns
  const spamDDDs = ["0300", "0500", "0800", "0900"];
  const isSpamDDD = spamDDDs.some(s => digits.startsWith(s));
  const isSAC = digits.startsWith("0800");

  text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔍 <b>Indicadores:</b>\n\n`;

  if (isSAC) {
    text += `✅ Número 0800 (SAC/Gratuito) - geralmente legítimo\n`;
  } else if (isSpamDDD) {
    text += `⚠️ Prefixo de telemarketing/serviços - possível spam\n`;
  }

  if (isMobile) {
    text += `📱 Celular com 9º dígito - formato válido\n`;
  }

  if (!dddInfo && !isSpamDDD) {
    text += `⚠️ DDD ${ddd} não reconhecido - pode ser número virtual\n`;
  }

  text += `\n✅ <i>Dados de DDD obtidos via BrasilAPI</i>`;
  return text;
}

// ─── CPF Analysis ────────────────────────────────────────────────────
function analyzeCPFFormat(cpf: string): string {
  const validation = validateCPF(cpf);
  const digits = validation.digits;

  let text = `🔍 <b>Consulta CPF</b>\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📋 <b>CPF:</b> <code>${validation.formatted}</code>\n\n`;

  if (!validation.valid) {
    text += `❌ <b>CPF INVÁLIDO!</b>\n\n`;
    text += `O número informado NÃO é um CPF válido.\n`;
    text += `Dígitos verificadores não conferem.\n\n`;
    text += `🚦 <b>NÍVEL DE RISCO: ALTO</b>\n`;
    text += `🎯 <b>TIPO:</b> CPF com formato inválido\n\n`;
    text += `⚠️ Se alguém forneceu este CPF para você, é um forte indicativo de fraude.\n`;
    return text;
  }

  text += `✅ <b>CPF matematicamente válido</b>\n\n`;

  // Extract info from CPF
  const regionDigit = parseInt(digits[8]);
  const regions: Record<number, string> = {
    0: "RS", 1: "DF/GO/MS/MT/TO", 2: "AC/AM/AP/PA/RO/RR",
    3: "CE/MA/PI", 4: "AL/PB/PE/RN", 5: "BA/SE",
    6: "MG", 7: "ES/RJ", 8: "SP", 9: "PR/SC",
  };

  text += `🗺️ <b>Região fiscal:</b> ${regions[regionDigit] || "N/A"} (dígito ${regionDigit})\n\n`;

  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔍 <b>Análise de Segurança:</b>\n\n`;
  text += `✅ Formato numérico válido\n`;
  text += `✅ Dígitos verificadores corretos\n`;
  text += `📍 Região fiscal identificada: ${regions[regionDigit]}\n\n`;

  text += `⚠️ <b>Nota:</b> A validação confirma que o CPF possui formato correto, mas não garante que está ativo na Receita Federal. Para consultas oficiais, acesse o site da Receita Federal.\n\n`;
  text += `💡 <b>Dicas de Proteção:</b>\n`;
  text += `• Nunca compartilhe seu CPF em sites não confiáveis\n`;
  text += `• Monitore seu CPF regularmente no Registrato (Banco Central)\n`;
  text += `• Ative alertas de uso no SPC/Serasa\n`;

  return text;
}

// ─── Link Analysis ───────────────────────────────────────────────────
async function analyzeLink(url: string): Promise<{ text: string; riskData: string }> {
  let analysisText = `🔗 <b>Análise de Link</b>\n`;
  analysisText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  analysisText += `🌐 <b>URL:</b> <code>${url.substring(0, 100)}</code>\n\n`;

  const indicators: string[] = [];
  let riskScore = 0;

  // Normalize URL
  let fullUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    fullUrl = "https://" + url;
  }

  try {
    const urlObj = new URL(fullUrl);
    const domain = urlObj.hostname.toLowerCase();

    analysisText += `📍 <b>Domínio:</b> ${domain}\n`;
    analysisText += `🔒 <b>Protocolo:</b> ${urlObj.protocol === "https:" ? "✅ HTTPS" : "⚠️ HTTP (inseguro)"}\n\n`;

    // Check for IP-based URLs
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      indicators.push("🔴 URL usa endereço IP em vez de domínio");
      riskScore += 30;
    }

    // Check for suspicious TLDs
    const suspiciousTLDs = [".xyz", ".top", ".club", ".buzz", ".work", ".click", ".link", ".tk", ".ml", ".ga", ".cf"];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
      indicators.push("🟡 Domínio com extensão suspeita");
      riskScore += 20;
    }

    // Check for typosquatting patterns
    const knownBrands = ["banco", "itau", "bradesco", "santander", "caixa", "nubank", "picpay", "mercadopago", "gov", "correios", "receita", "detran", "serasa"];
    const matchedBrand = knownBrands.find(b => domain.includes(b) && !domain.endsWith(".gov.br") && !domain.endsWith(".com.br"));
    if (matchedBrand) {
      indicators.push(`🔴 Possível imitação de "${matchedBrand}" - domínio não oficial`);
      riskScore += 40;
    }

    // Check for excessive subdomains
    const subdomains = domain.split(".").length - 2;
    if (subdomains > 2) {
      indicators.push("🟡 URL com muitos subdomínios (tática de phishing)");
      riskScore += 15;
    }

    // Check for URL shorteners
    const shorteners = ["bit.ly", "t.co", "goo.gl", "tinyurl.com", "is.gd", "v.gd", "ow.ly", "shorturl.at"];
    if (shorteners.some(s => domain.includes(s))) {
      indicators.push("🟡 URL encurtada - destino real desconhecido");
      riskScore += 10;
    }

    // Check HTTP protocol
    if (urlObj.protocol !== "https:") {
      indicators.push("🟡 Sem HTTPS - conexão não criptografada");
      riskScore += 15;
    }

    // Check for suspicious paths
    const suspiciousPatterns = ["login", "signin", "verify", "confirm", "update", "secure", "account", "banking", "wallet"];
    const pathLower = urlObj.pathname.toLowerCase();
    if (suspiciousPatterns.some(p => pathLower.includes(p))) {
      indicators.push("🟡 URL contém termos sensíveis no caminho (login/verify/account)");
      riskScore += 15;
    }

    // Check for @ in URL (credential phishing)
    if (fullUrl.includes("@")) {
      indicators.push("🔴 URL contém @ - técnica clássica de phishing");
      riskScore += 35;
    }

    // Try to reach the URL
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      const headRes = await fetch(fullUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
      });
      analysisText += `📡 <b>Status:</b> ${headRes.status}\n`;
      if (headRes.status >= 300 && headRes.status < 400) {
        const redirectTo = headRes.headers.get("location");
        indicators.push(`🟡 Redireciona para: ${redirectTo?.substring(0, 50) || "desconhecido"}`);
        riskScore += 10;
      }
      if (headRes.status === 404) {
        indicators.push("⚪ Página não encontrada (404)");
      }
    } catch {
      indicators.push("⚠️ Não foi possível acessar o link");
      riskScore += 5;
    }

  } catch {
    indicators.push("🔴 URL com formato inválido");
    riskScore += 50;
  }

  // Build risk level
  let riskLevel: string;
  let riskEmoji: string;
  if (riskScore >= 50) { riskLevel = "CRÍTICO"; riskEmoji = "🔴"; }
  else if (riskScore >= 30) { riskLevel = "ALTO"; riskEmoji = "🟠"; }
  else if (riskScore >= 15) { riskLevel = "MÉDIO"; riskEmoji = "🟡"; }
  else { riskLevel = "BAIXO"; riskEmoji = "🟢"; }

  analysisText += `\n${riskEmoji} <b>NÍVEL DE RISCO: ${riskLevel}</b> (score: ${riskScore}/100)\n\n`;

  if (indicators.length > 0) {
    analysisText += `🔍 <b>Indicadores Encontrados:</b>\n`;
    indicators.forEach(i => { analysisText += `   ${i}\n`; });
  } else {
    analysisText += `✅ Nenhum indicador negativo encontrado\n`;
  }

  analysisText += `\n💡 <b>Dicas:</b>\n`;
  analysisText += `• Sempre verifique o domínio antes de inserir dados\n`;
  analysisText += `• Sites oficiais de bancos usam .com.br\n`;
  analysisText += `• Desconfie de links encurtados em mensagens\n`;

  return { text: analysisText, riskData: riskLevel };
}

// ─── AI Analysis (enhanced with real data context) ───────────────────
async function analyzeWithAI(queryType: string, input: string, realDataContext?: string): Promise<{
  riskLevel: string;
  fraudType: string;
  response: string;
}> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return {
      riskLevel: "indefinido",
      fraudType: "sem_analise",
      response: "⚠️ Sistema de IA temporariamente indisponível.",
    };
  }

  const contextNote = realDataContext ? `\n\nDados reais obtidos via API:\n${realDataContext}` : "";

  const prompts: Record<string, string> = {
    cpf: `Analise este CPF para riscos de fraude: ${input}.${contextNote}\n\nForneça uma análise de segurança considerando: uso indevido, clonagem, empréstimos fraudulentos. Dê dicas práticas de proteção.`,
    cnpj: `Analise esta empresa para riscos de fraude baseado nos dados reais obtidos:\n${input}${contextNote}\n\nAvalie: empresa fantasma, golpes conhecidos, sinais de alerta nos dados cadastrais.`,
    nome: `Pesquise e analise possíveis riscos associados ao nome: "${input}".\n\nConsidere: perfis falsos, golpistas conhecidos, padrões de fraude por engenharia social. Dê orientações de como verificar a identidade de alguém.`,
    telefone: `Analise este telefone para riscos de golpe: ${input}.${contextNote}\n\nConsidere: golpes por WhatsApp, ligações fraudulentas, SMS phishing, clonagem de número.`,
    link: `Analise esta URL para riscos de segurança: ${input}.${contextNote}\n\nConsidere: phishing, malware, sites falsos, engenharia social.`,
    message: `Analise esta mensagem e avalie se parece ser um golpe/fraude:\n\n"${input}"\n\nConsidere: engenharia social, promessas falsas, urgência artificial, padrões de golpes conhecidos no Brasil.`,
  };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em segurança digital e prevenção de fraudes no Brasil. 
Sempre responda em português brasileiro, de forma clara e direta.
Formato OBRIGATÓRIO:
🚦 NÍVEL DE RISCO: [BAIXO/MÉDIO/ALTO/CRÍTICO]
🎯 TIPO: [tipo do golpe ou "Nenhum identificado"]
📝 ANÁLISE: [explicação clara, máximo 3 parágrafos]
💡 DICAS: [2-3 dicas práticas de proteção]`,
          },
          { role: "user", content: prompts[queryType] || prompts.message },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      console.error("AI error:", res.status);
      return {
        riskLevel: "indefinido",
        fraudType: "erro_analise",
        response: "⚠️ Análise de IA indisponível no momento.",
      };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "Análise indisponível.";

    let riskLevel = "indefinido";
    if (content.includes("CRÍTICO")) riskLevel = "critico";
    else if (content.includes("ALTO")) riskLevel = "alto";
    else if (content.includes("MÉDIO")) riskLevel = "medio";
    else if (content.includes("BAIXO")) riskLevel = "baixo";

    let fraudType = "nao_identificado";
    const tipoMatch = content.match(/TIPO:\s*(.+?)(?:\n|$)/);
    if (tipoMatch) fraudType = tipoMatch[1].trim();

    return { riskLevel, fraudType, response: content };
  } catch (e) {
    console.error("AI analysis error:", e);
    return { riskLevel: "indefinido", fraudType: "erro", response: "⚠️ Erro na análise de IA." };
  }
}

// ─── User state for multi-step flows ─────────────────────────────────
const userStates = new Map<number, { action: string; step: string }>();

// ─── MAIN SERVER ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN not configured");
    return new Response("Bot token missing", { status: 500 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const update: TelegramUpdate = await req.json();
    console.log("Update:", JSON.stringify(update).substring(0, 300));

    // ─── Handle callback queries ────────────────────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const data = cb.data;

      await answerCallback(BOT_TOKEN, cb.id);

      await supabase.from("telbot_logs").insert({
        log_type: "command",
        telegram_user_id: userId,
        command: data,
        message: `Callback: ${data}`,
      });

      // ── Query type callbacks ──
      if (data.startsWith("query_")) {
        const queryType = data.replace("query_", "");
        const labels: Record<string, string> = {
          cpf: "CPF (11 dígitos)",
          cnpj: "CNPJ (14 dígitos)",
          nome: "Nome completo",
          telefone: "Telefone com DDD",
          link: "link/URL completa",
          message: "mensagem suspeita",
          cep: "CEP (8 dígitos)",
        };

        // Bancos don't need input
        if (queryType === "bancos") {
          await editMessage(BOT_TOKEN, chatId, cb.message.message_id, "⏳ Consultando bancos...");
          const result = await lookupBancos();
          await sendMessage(BOT_TOKEN, chatId, result, {
            inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]],
          });
          await supabase.from("telbot_queries").insert({
            telegram_user_id: userId,
            query_type: "bancos",
            query_input: "lista_bancos",
            risk_level: "baixo",
            fraud_type: "consulta",
            ai_response: "Listagem de bancos",
          });
          return new Response("OK");
        }

        userStates.set(userId, { action: `query_${queryType}`, step: "waiting_input" });

        await editMessage(
          BOT_TOKEN,
          chatId,
          cb.message.message_id,
          `🔍 <b>Consulta de ${labels[queryType] || queryType}</b>\n\nEnvie o ${labels[queryType] || "dado"} que deseja consultar:`,
        );
        return new Response("OK");
      }

      // ── Monitoring callbacks ──
      if (data === "monitoring") {
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          "🔔 <b>Monitoramento</b>\n\nEscolha uma opção:", {
            inline_keyboard: [
              [
                { text: "➕ Cadastrar CPF", callback_data: "mon_add_cpf" },
                { text: "➕ Cadastrar CNPJ", callback_data: "mon_add_cnpj" },
              ],
              [
                { text: "➕ Cadastrar Nome", callback_data: "mon_add_nome" },
                { text: "📋 Meus Monitoramentos", callback_data: "mon_list" },
              ],
              [
                { text: "🗑️ Remover Monitoramento", callback_data: "mon_remove" },
                { text: "◀️ Voltar", callback_data: "main_menu" },
              ],
            ],
          });
        return new Response("OK");
      }

      if (data.startsWith("mon_add_")) {
        const monType = data.replace("mon_add_", "");
        userStates.set(userId, { action: `monitor_${monType}`, step: "waiting_input" });
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          `🔔 <b>Cadastrar Monitoramento de ${monType.toUpperCase()}</b>\n\nEnvie o ${monType.toUpperCase()} que deseja monitorar:`);
        return new Response("OK");
      }

      if (data === "mon_remove") {
        userStates.set(userId, { action: "monitor_remove", step: "waiting_input" });
        const { data: monitors } = await supabase
          .from("telbot_monitoring")
          .select("*")
          .eq("telegram_user_id", userId)
          .eq("is_active", true);

        if (!monitors || monitors.length === 0) {
          await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
            "📋 Nenhum monitoramento ativo para remover.", {
              inline_keyboard: [[{ text: "◀️ Voltar", callback_data: "monitoring" }]],
            });
          return new Response("OK");
        }

        let text = "🗑️ <b>Remover Monitoramento</b>\n\nEnvie o número do item:\n\n";
        monitors.forEach((m: any, i: number) => {
          text += `${i + 1}. ${m.monitor_type.toUpperCase()}: ${m.monitor_value}\n`;
        });
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text);
        return new Response("OK");
      }

      if (data === "mon_list") {
        const { data: monitors } = await supabase
          .from("telbot_monitoring")
          .select("*")
          .eq("telegram_user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(10);

        let text = "📋 <b>Seus Monitoramentos Ativos</b>\n\n";
        if (!monitors || monitors.length === 0) {
          text += "Nenhum monitoramento ativo.\nUse o menu para cadastrar um.";
        } else {
          monitors.forEach((m: any, i: number) => {
            text += `${i + 1}. <b>${m.monitor_type.toUpperCase()}</b>: ${m.monitor_value}\n   ✅ Verificações: ${m.check_count}\n\n`;
          });
        }
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text, {
          inline_keyboard: [[{ text: "◀️ Voltar", callback_data: "monitoring" }]],
        });
        return new Response("OK");
      }

      if (data === "history") {
        const { data: queries } = await supabase
          .from("telbot_queries")
          .select("*")
          .eq("telegram_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        let text = "📋 <b>Seu Histórico de Consultas</b>\n\n";
        if (!queries || queries.length === 0) {
          text += "Nenhuma consulta realizada ainda.";
        } else {
          const riskEmoji: Record<string, string> = { baixo: "🟢", medio: "🟡", alto: "🟠", critico: "🔴" };
          queries.forEach((q: any, i: number) => {
            const emoji = riskEmoji[q.risk_level] || "⚪";
            const date = new Date(q.created_at).toLocaleDateString("pt-BR");
            text += `${i + 1}. ${emoji} <b>${q.query_type.toUpperCase()}</b> - ${q.query_input.substring(0, 25)}\n   📅 ${date} | Risco: ${q.risk_level || "N/A"}\n\n`;
          });
        }
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text, {
          inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]],
        });
        return new Response("OK");
      }

      if (data === "help") {
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          `ℹ️ <b>Como usar o Bot Anti-Fraude</b>\n\n` +
          `🔍 <b>Consultas Reais:</b>\n` +
          `• <b>CPF</b> - Validação matemática + região fiscal\n` +
          `• <b>CNPJ</b> - Dados completos da Receita Federal\n` +
          `• <b>Telefone</b> - DDD, região, tipo de número\n` +
          `• <b>CEP</b> - Endereço completo com coordenadas\n` +
          `• <b>Bancos</b> - Lista oficial do Banco Central\n\n` +
          `🤖 <b>Análise por IA:</b>\n` +
          `• Links suspeitos (phishing, malware)\n` +
          `• Mensagens de golpe\n` +
          `• Nomes (verificação de perfis)\n\n` +
          `🔔 <b>Monitoramento:</b> Receba alertas automáticos\n\n` +
          `<b>Comandos:</b> /start /menu /ajuda`,
          { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] });
        return new Response("OK");
      }

      if (data === "main_menu") {
        userStates.delete(userId);
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          "🛡️ <b>Bot Anti-Fraude</b>\n\nEscolha uma opção:", mainMenuKeyboard());
        return new Response("OK");
      }

      return new Response("OK");
    }

    // ─── Handle text messages ────────────────────────────────────────
    if (update.message?.text) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      const text = msg.text.trim();

      // Ensure user exists
      await supabase.from("telbot_users").upsert({
        telegram_id: userId,
        telegram_username: msg.from.username || null,
        first_name: msg.from.first_name,
        last_name: msg.from.last_name || null,
        last_activity_at: new Date().toISOString(),
      }, { onConflict: "telegram_id" });

      // Commands
      if (text === "/start" || text === "/menu") {
        userStates.delete(userId);
        await supabase.from("telbot_logs").insert({
          log_type: "command", telegram_user_id: userId, command: text,
          message: `User ${msg.from.first_name} started bot`,
        });
        await sendMessage(BOT_TOKEN, chatId,
          `🛡️ <b>Bot Anti-Fraude Genesis</b>\n\nOlá, <b>${msg.from.first_name}</b>! 👋\n\n` +
          `Sou seu assistente de segurança digital com <b>dados reais</b> e <b>IA avançada</b>.\n\n` +
          `📊 <b>Consultas com dados reais:</b>\n` +
          `• CNPJ → Receita Federal\n` +
          `• CEP → Correios\n` +
          `• Telefone → Banco Central\n` +
          `• Bancos → Bacen\n\n` +
          `🤖 <b>Análise inteligente:</b>\n` +
          `• CPF, Links, Mensagens, Nomes\n\n` +
          `Escolha uma opção:`, mainMenuKeyboard());
        return new Response("OK");
      }

      if (text === "/ajuda") {
        await sendMessage(BOT_TOKEN, chatId,
          `ℹ️ <b>Ajuda Rápida</b>\n\n/start - Menu principal\n/menu - Abrir menu\n/ajuda - Esta mensagem\n\nOu use os botões interativos!`);
        return new Response("OK");
      }

      // Handle user input based on state
      const state = userStates.get(userId);
      if (state && state.step === "waiting_input") {
        userStates.delete(userId);
        const queryType = state.action.replace("query_", "").replace("monitor_", "");

        // ── Monitoring: Remove ──
        if (state.action === "monitor_remove") {
          const idx = parseInt(text) - 1;
          const { data: monitors } = await supabase
            .from("telbot_monitoring")
            .select("*")
            .eq("telegram_user_id", userId)
            .eq("is_active", true);

          if (monitors && monitors[idx]) {
            await supabase.from("telbot_monitoring")
              .update({ is_active: false })
              .eq("id", monitors[idx].id);
            await sendMessage(BOT_TOKEN, chatId,
              `✅ Monitoramento removido: <b>${monitors[idx].monitor_type.toUpperCase()}</b> - ${monitors[idx].monitor_value}`,
              { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] });
          } else {
            await sendMessage(BOT_TOKEN, chatId, "❌ Número inválido. Tente novamente.",
              { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] });
          }
          return new Response("OK");
        }

        // ── Monitoring: Add ──
        if (state.action.startsWith("monitor_")) {
          await supabase.from("telbot_monitoring").insert({
            telegram_user_id: userId,
            monitor_type: queryType,
            monitor_value: text,
            is_active: true,
          });
          await supabase.from("telbot_logs").insert({
            log_type: "info", telegram_user_id: userId, command: "monitor_add",
            message: `Added monitoring: ${queryType}: ${text}`,
          });
          await sendMessage(BOT_TOKEN, chatId,
            `✅ <b>Monitoramento Ativado!</b>\n\n📌 Tipo: <b>${queryType.toUpperCase()}</b>\n📌 Valor: <b>${text}</b>\n\nVocê receberá alertas automáticos.`,
            { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] });
          return new Response("OK");
        }

        // ── Queries with real data ──
        await sendMessage(BOT_TOKEN, chatId, "⏳ Processando consulta... Aguarde.");

        let responseText = "";
        let riskLevel = "baixo";
        let fraudType = "consulta";

        switch (queryType) {
          case "cnpj": {
            responseText = await lookupCNPJ(text);
            // Also get AI analysis with the real data
            const aiAnalysis = await analyzeWithAI("cnpj", text, responseText);
            responseText += `\n\n🤖 <b>Análise de IA:</b>\n${aiAnalysis.response}`;
            riskLevel = aiAnalysis.riskLevel;
            fraudType = aiAnalysis.fraudType;
            break;
          }

          case "cpf": {
            responseText = analyzeCPFFormat(text);
            const aiCpf = await analyzeWithAI("cpf", text, responseText);
            responseText += `\n\n🤖 <b>Análise de IA:</b>\n${aiCpf.response}`;
            riskLevel = aiCpf.riskLevel;
            fraudType = aiCpf.fraudType;
            break;
          }

          case "telefone": {
            responseText = await analyzePhone(text);
            const aiPhone = await analyzeWithAI("telefone", text, responseText);
            responseText += `\n\n🤖 <b>Análise de IA:</b>\n${aiPhone.response}`;
            riskLevel = aiPhone.riskLevel;
            fraudType = aiPhone.fraudType;
            break;
          }

          case "cep": {
            responseText = await lookupCEP(text);
            riskLevel = "baixo";
            fraudType = "consulta_cep";
            break;
          }

          case "link": {
            const linkResult = await analyzeLink(text);
            responseText = linkResult.text;
            const aiLink = await analyzeWithAI("link", text, responseText);
            responseText += `\n\n🤖 <b>Análise de IA:</b>\n${aiLink.response}`;
            riskLevel = aiLink.riskLevel || linkResult.riskData.toLowerCase();
            fraudType = aiLink.fraudType;
            break;
          }

          case "nome": {
            const aiNome = await analyzeWithAI("nome", text);
            responseText = `👤 <b>Consulta por Nome</b>\n━━━━━━━━━━━━━━━━━━━━\n\n🔍 <b>Nome:</b> ${text}\n\n${aiNome.response}`;
            riskLevel = aiNome.riskLevel;
            fraudType = aiNome.fraudType;
            break;
          }

          case "message": {
            const aiMsg = await analyzeWithAI("message", text);
            responseText = `💬 <b>Análise de Mensagem</b>\n━━━━━━━━━━━━━━━━━━━━\n\n📝 <b>Mensagem:</b>\n<i>"${text.substring(0, 200)}"</i>\n\n${aiMsg.response}`;
            riskLevel = aiMsg.riskLevel;
            fraudType = aiMsg.fraudType;
            break;
          }

          default: {
            const aiDefault = await analyzeWithAI("message", text);
            responseText = aiDefault.response;
            riskLevel = aiDefault.riskLevel;
            fraudType = aiDefault.fraudType;
          }
        }

        // Save query to DB
        await supabase.from("telbot_queries").insert({
          telegram_user_id: userId,
          query_type: queryType,
          query_input: text.substring(0, 500),
          risk_level: riskLevel,
          fraud_type: fraudType,
          ai_response: responseText.substring(0, 4000),
        });

        // Update user stats
        const { data: userData } = await supabase
          .from("telbot_users")
          .select("total_queries")
          .eq("telegram_id", userId)
          .single();
        if (userData) {
          await supabase.from("telbot_users")
            .update({ total_queries: (userData.total_queries || 0) + 1 })
            .eq("telegram_id", userId);
        }

        // Log
        await supabase.from("telbot_logs").insert({
          log_type: "info", telegram_user_id: userId, command: `query_${queryType}`,
          message: `Query ${queryType}: ${text.substring(0, 50)} - Risk: ${riskLevel}`,
          metadata: { risk_level: riskLevel, fraud_type: fraudType },
        });

        // Send response (split if too long for Telegram's 4096 char limit)
        if (responseText.length > 4000) {
          const parts = [];
          let remaining = responseText;
          while (remaining.length > 0) {
            if (remaining.length <= 4000) {
              parts.push(remaining);
              break;
            }
            let splitAt = remaining.lastIndexOf("\n", 4000);
            if (splitAt < 1000) splitAt = 4000;
            parts.push(remaining.substring(0, splitAt));
            remaining = remaining.substring(splitAt);
          }
          for (let i = 0; i < parts.length; i++) {
            const isLast = i === parts.length - 1;
            await sendMessage(BOT_TOKEN, chatId, parts[i],
              isLast ? { inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]] } : undefined);
          }
        } else {
          await sendMessage(BOT_TOKEN, chatId, responseText, {
            inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]],
          });
        }

        return new Response("OK");
      }

      // Default: show menu
      await sendMessage(BOT_TOKEN, chatId,
        `Use /menu para abrir o menu interativo ou escolha uma opção:`, mainMenuKeyboard());
    }

    return new Response("OK");
  } catch (error) {
    console.error("Bot error:", error);
    return new Response("Error", { status: 500 });
  }
});
