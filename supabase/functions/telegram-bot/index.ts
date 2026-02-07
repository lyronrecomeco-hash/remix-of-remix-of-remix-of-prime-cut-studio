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
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("sendMessage error:", err);
  }
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

// ─── DB-based user state ─────────────────────────────────────────────
async function getUserState(supabase: any, telegramId: number): Promise<{ action: string; step: string } | null> {
  const { data } = await supabase
    .from("telbot_users")
    .select("conversation_state")
    .eq("telegram_id", telegramId)
    .single();
  return data?.conversation_state || null;
}

async function setUserState(supabase: any, telegramId: number, state: { action: string; step: string } | null) {
  await supabase
    .from("telbot_users")
    .update({ conversation_state: state })
    .eq("telegram_id", telegramId);
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
        { text: "📧 Consultar Email", callback_data: "query_email" },
        { text: "🌐 Consultar Domínio", callback_data: "query_dominio" },
      ],
      [
        { text: "🚗 Consultar Placa", callback_data: "query_placa" },
        { text: "📊 Consultar IBGE", callback_data: "query_ibge" },
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
  if (/^(\d)\1{10}$/.test(digits)) return { valid: false, formatted: cpf, digits };

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
    return `❌ <b>CNPJ Inválido</b>\n\nO CNPJ informado não possui formato válido.`;
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
    if (!res.ok) {
      if (res.status === 404) return `❌ <b>CNPJ não encontrado:</b> <code>${validation.formatted}</code>`;
      throw new Error(`API status ${res.status}`);
    }

    const d = await res.json();
    const situacao = d.descricao_situacao_cadastral || "N/A";
    const situacaoEmoji = situacao === "ATIVA" ? "🟢" : situacao === "BAIXADA" ? "🔴" : "🟡";

    let text = `🏢 <b>CNPJ - Dados da Receita Federal</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📋 <b>CNPJ:</b> <code>${validation.formatted}</code>\n`;
    text += `🏷️ <b>Razão Social:</b> ${d.razao_social || "N/A"}\n`;
    text += `🏪 <b>Nome Fantasia:</b> ${d.nome_fantasia || "Não informado"}\n\n`;
    text += `${situacaoEmoji} <b>Situação:</b> ${situacao}\n`;
    text += `📅 <b>Abertura:</b> ${d.data_inicio_atividade || "N/A"}\n`;
    text += `🔢 <b>Natureza Jurídica:</b> ${d.natureza_juridica || "N/A"}\n`;
    text += `📊 <b>Porte:</b> ${d.porte || "N/A"}\n`;
    text += `💰 <b>Capital Social:</b> R$ ${d.capital_social ? Number(d.capital_social).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "N/A"}\n\n`;

    if (d.cnae_fiscal_descricao) {
      text += `🏭 <b>CNAE:</b> ${d.cnae_fiscal} - ${d.cnae_fiscal_descricao}\n\n`;
    }

    if (d.logradouro) {
      text += `📍 <b>Endereço:</b>\n   ${d.descricao_tipo_de_logradouro || ""} ${d.logradouro}, ${d.numero || "S/N"}`;
      if (d.complemento) text += `, ${d.complemento}`;
      text += `\n   ${d.bairro || ""} - ${d.municipio || ""}/${d.uf || ""}\n   CEP: ${d.cep || "N/A"}\n\n`;
    }

    if (d.ddd_telefone_1) text += `📞 <b>Telefone:</b> ${d.ddd_telefone_1}\n`;
    if (d.email) text += `📧 <b>Email:</b> ${d.email}\n`;

    if (d.qsa && d.qsa.length > 0) {
      text += `\n👥 <b>Quadro Societário:</b>\n`;
      d.qsa.slice(0, 5).forEach((s: any) => {
        text += `   • ${s.nome_socio} (${s.qualificacao_socio || "Sócio"})\n`;
      });
      if (d.qsa.length > 5) text += `   ... e mais ${d.qsa.length - 5} sócio(s)\n`;
    }

    if (d.opcao_pelo_simples !== null) {
      text += `\n📊 <b>Simples Nacional:</b> ${d.opcao_pelo_simples ? "✅ Optante" : "❌ Não"}\n`;
    }
    if (d.opcao_pelo_mei !== null) {
      text += `📊 <b>MEI:</b> ${d.opcao_pelo_mei ? "✅ Sim" : "❌ Não"}\n`;
    }

    // Risk alerts
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    if (situacao !== "ATIVA") text += `⚠️ Empresa NÃO ativa: ${situacao}\n`;
    if (d.capital_social && Number(d.capital_social) < 1000) text += `⚠️ Capital social muito baixo\n`;
    const abertura = d.data_inicio_atividade ? new Date(d.data_inicio_atividade) : null;
    if (abertura && (Date.now() - abertura.getTime()) / (1000*60*60*24*30) < 6) text += `⚠️ Empresa < 6 meses\n`;

    text += `\n✅ <i>Receita Federal via BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("CNPJ error:", e);
    return `⚠️ Erro ao consultar CNPJ. Tente novamente.`;
  }
}

// ─── BrasilAPI: CEP Lookup ───────────────────────────────────────────
async function lookupCEP(cep: string): Promise<string> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return `❌ <b>CEP Inválido</b>\n\nInforme um CEP com 8 dígitos.`;

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (!res.ok) {
      if (res.status === 404) return `❌ <b>CEP não encontrado:</b> <code>${digits}</code>`;
      throw new Error(`status ${res.status}`);
    }
    const d = await res.json();
    let text = `📍 <b>Consulta CEP</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📮 <b>CEP:</b> <code>${digits.slice(0,5)}-${digits.slice(5)}</code>\n`;
    text += `📌 <b>Logradouro:</b> ${d.street || "N/A"}\n`;
    text += `🏘️ <b>Bairro:</b> ${d.neighborhood || "N/A"}\n`;
    text += `🏙️ <b>Cidade:</b> ${d.city || "N/A"}\n`;
    text += `🗺️ <b>Estado:</b> ${d.state || "N/A"}\n`;
    if (d.location?.coordinates?.latitude) {
      text += `\n🌐 <b>Coordenadas:</b> ${d.location.coordinates.latitude}, ${d.location.coordinates.longitude}\n`;
    }
    text += `\n✅ <i>BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("CEP error:", e);
    return `⚠️ Erro ao consultar CEP.`;
  }
}

// ─── BrasilAPI: DDD Info ─────────────────────────────────────────────
async function lookupDDD(ddd: string): Promise<{ state: string; cities: string[] } | null> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/ddd/v1/${ddd}`);
    if (!res.ok) return null;
    const d = await res.json();
    return { state: d.state || "N/A", cities: d.cities || [] };
  } catch { return null; }
}

// ─── BrasilAPI: Bank List ────────────────────────────────────────────
async function lookupBancos(): Promise<string> {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/banks/v1`);
    if (!res.ok) throw new Error("API error");
    const banks = await res.json();
    const mainBanks = banks.filter((b: any) => b.code && b.fullName).slice(0, 20);

    let text = `🏦 <b>Bancos do Brasil</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 <b>Total:</b> ${banks.length} instituições\n\n`;
    mainBanks.forEach((b: any) => {
      text += `   ${b.code} - ${b.fullName?.substring(0, 40)}\n`;
    });
    text += `\n... e mais ${banks.length - 20} instituições\n`;
    text += `\n✅ <i>Banco Central via BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("Banks error:", e);
    return `⚠️ Erro ao consultar bancos.`;
  }
}

// ─── BrasilAPI: IBGE City Lookup ─────────────────────────────────────
async function lookupIBGE(cityName: string): Promise<string> {
  try {
    // Search for municipalities
    const res = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${encodeURIComponent(cityName)}?providers=dados-abertos-br,gov,wikipedia`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      // Try as UF (state code)
      const ufRes = await fetch(`https://brasilapi.com.br/api/ibge/uf/v1/${encodeURIComponent(cityName)}`);
      if (ufRes.ok) {
        const ufData = await ufRes.json();
        let text = `📊 <b>IBGE - Estado</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `🏳️ <b>Nome:</b> ${ufData.nome || "N/A"}\n`;
        text += `🔤 <b>Sigla:</b> ${ufData.sigla || "N/A"}\n`;
        text += `🔢 <b>Código IBGE:</b> ${ufData.id || "N/A"}\n`;
        text += `🗺️ <b>Região:</b> ${ufData.regiao?.nome || "N/A"}\n`;
        text += `\n✅ <i>IBGE via BrasilAPI</i>`;
        return text;
      }
      return `❌ Nenhum resultado para "${cityName}". Tente o nome da cidade ou sigla do estado (ex: SP, RJ).`;
    }

    let text = `📊 <b>IBGE - Municípios</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    const items = Array.isArray(data) ? data.slice(0, 10) : [data];
    items.forEach((m: any) => {
      text += `🏙️ <b>${m.nome || "N/A"}</b>\n`;
      text += `   Código IBGE: ${m.codigo_ibge || "N/A"}\n\n`;
    });
    if (Array.isArray(data) && data.length > 10) {
      text += `... e mais ${data.length - 10} municípios\n`;
    }
    text += `✅ <i>IBGE via BrasilAPI</i>`;
    return text;
  } catch (e) {
    console.error("IBGE error:", e);
    return `⚠️ Erro ao consultar IBGE. Tente com nome completo da cidade ou sigla do estado.`;
  }
}

// ─── Vehicle Plate Lookup (FIPE + format analysis) ───────────────────
async function lookupPlaca(placa: string): Promise<string> {
  const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const antigoRegex = /^[A-Z]{3}[0-9]{4}$/;
  
  let text = `🚗 <b>Consulta de Placa</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🔤 <b>Placa:</b> <code>${p}</code>\n\n`;

  if (mercosulRegex.test(p)) {
    text += `✅ <b>Formato:</b> Mercosul (padrão atual)\n`;
    text += `🌎 <b>Padrão:</b> Brasil/Argentina/Uruguai/Paraguai\n\n`;
  } else if (antigoRegex.test(p)) {
    text += `✅ <b>Formato:</b> Antigo (3 letras + 4 números)\n\n`;
  } else {
    text += `❌ <b>Formato inválido</b>\nUse: ABC1D23 (Mercosul) ou ABC1234 (antigo)\n`;
    return text;
  }

  // Identify state by first letter group
  const stateMap: Record<string, string> = {
    A: "PR/SC/RS", B: "PR/SC/RS", C: "PR/SC/RS", D: "MG", E: "SP", F: "SP",
    G: "SP", H: "SP", I: "MS/MT", J: "GO/TO", K: "DF", L: "RJ", M: "RJ",
    N: "ES", O: "BA/SE", P: "BA/SE", Q: "AL/PE", R: "CE/RN/PB",
    S: "PI/MA", T: "PA/AM/AP", U: "AC/RO/RR",
  };
  
  const firstLetter = p[0];
  text += `📍 <b>Região provável:</b> ${stateMap[firstLetter] || "Não identificada"}\n\n`;

  // Try to get FIPE info for the brand
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔍 <b>Verificações:</b>\n\n`;
  text += `• Formato da placa: ${mercosulRegex.test(p) ? "✅ Válido (Mercosul)" : "✅ Válido (Antigo)"}\n`;
  text += `• Região identificada: ${stateMap[firstLetter] ? "✅" : "⚠️"}\n\n`;
  
  text += `💡 <b>Para consulta completa do veículo:</b>\n`;
  text += `• <b>Detran</b> do seu estado\n`;
  text += `• <b>SINESP Cidadão</b> (app oficial)\n`;
  text += `• <b>Consulta Pública DENATRAN</b>\n\n`;
  text += `✅ <i>Análise de formato de placa</i>`;
  return text;
}

// ─── Domain/Website Analysis ─────────────────────────────────────────
async function analyzeDomain(domain: string): Promise<string> {
  let cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  
  let text = `🌐 <b>Análise de Domínio</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `🔗 <b>Domínio:</b> <code>${cleanDomain}</code>\n\n`;

  // DNS check
  try {
    const dnsRes = await fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`);
    if (dnsRes.ok) {
      const dnsData = await dnsRes.json();
      if (dnsData.Answer && dnsData.Answer.length > 0) {
        text += `✅ <b>DNS Ativo:</b> Sim\n`;
        text += `📡 <b>IPs:</b>\n`;
        dnsData.Answer.slice(0, 3).forEach((a: any) => {
          text += `   • ${a.data}\n`;
        });
      } else {
        text += `❌ <b>DNS:</b> Sem registros A\n`;
      }
    }
  } catch { text += `⚠️ Não foi possível verificar DNS\n`; }

  // SSL Check  
  try {
    const sslRes = await fetch(`https://${cleanDomain}`, { method: "HEAD", redirect: "follow" });
    text += `\n🔒 <b>HTTPS:</b> ${sslRes.ok ? "✅ Ativo" : "⚠️ Problemas"}\n`;
    text += `📡 <b>Status:</b> ${sslRes.status}\n`;
    
    const server = sslRes.headers.get("server");
    if (server) text += `🖥️ <b>Servidor:</b> ${server}\n`;
    
    const poweredBy = sslRes.headers.get("x-powered-by");
    if (poweredBy) text += `⚙️ <b>Tecnologia:</b> ${poweredBy}\n`;
  } catch {
    text += `\n❌ <b>HTTPS:</b> Site inacessível ou sem HTTPS\n`;
  }

  // WHOIS-like check via other APIs
  const tld = cleanDomain.split(".").pop();
  const isBR = cleanDomain.endsWith(".br");
  
  text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔍 <b>Análise:</b>\n\n`;
  text += `🌍 <b>TLD:</b> .${tld}\n`;
  text += `🇧🇷 <b>Domínio BR:</b> ${isBR ? "✅ Sim" : "❌ Não"}\n`;
  
  // Suspicious TLD check
  const suspiciousTLDs = [".xyz", ".top", ".club", ".buzz", ".work", ".click", ".tk", ".ml", ".ga", ".cf"];
  if (suspiciousTLDs.some(s => cleanDomain.endsWith(s))) {
    text += `⚠️ <b>ALERTA:</b> TLD frequentemente usada em golpes\n`;
  }
  
  // Check if it mimics known brands
  const brands = ["banco", "itau", "bradesco", "santander", "caixa", "nubank", "picpay", "mercadopago", "gov", "correios", "serasa"];
  const matchedBrand = brands.find(b => cleanDomain.includes(b) && !cleanDomain.endsWith(".gov.br") && !cleanDomain.endsWith(".com.br"));
  if (matchedBrand) {
    text += `🔴 <b>ALERTA:</b> Contém "${matchedBrand}" mas NÃO é domínio oficial!\n`;
  }

  text += `\n✅ <i>Análise de domínio</i>`;
  return text;
}

// ─── Email Analysis ──────────────────────────────────────────────────
async function analyzeEmail(email: string): Promise<string> {
  let text = `📧 <b>Análise de Email</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📧 <b>Email:</b> <code>${email}</code>\n\n`;

  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    text += `❌ <b>Formato inválido!</b>\n`;
    return text;
  }

  const [localPart, domain] = email.split("@");
  text += `👤 <b>Usuário:</b> ${localPart}\n`;
  text += `🌐 <b>Domínio:</b> ${domain}\n\n`;

  // Check domain reputation
  const trustedDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "protonmail.com", "live.com", "uol.com.br", "bol.com.br", "terra.com.br", "globo.com"];
  const disposableDomains = ["tempmail.com", "guerrillamail.com", "10minutemail.com", "throwaway.email", "mailinator.com", "yopmail.com", "temp-mail.org", "fakeinbox.com"];
  
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🔍 <b>Verificações:</b>\n\n`;
  
  if (trustedDomains.includes(domain)) {
    text += `✅ Provedor confiável (${domain})\n`;
  } else if (disposableDomains.some(d => domain.includes(d))) {
    text += `🔴 Email temporário/descartável!\n`;
    text += `⚠️ Frequentemente usado em fraudes\n`;
  } else {
    text += `🟡 Provedor personalizado - verificação manual necessária\n`;
  }

  // Check MX records
  try {
    const mxRes = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    if (mxRes.ok) {
      const mxData = await mxRes.json();
      if (mxData.Answer && mxData.Answer.length > 0) {
        text += `✅ Domínio recebe emails (MX configurado)\n`;
        text += `📬 <b>Servidor de email:</b> ${mxData.Answer[0]?.data?.split(" ").pop() || "N/A"}\n`;
      } else {
        text += `❌ Domínio NÃO recebe emails (sem MX)\n`;
        text += `⚠️ Este email provavelmente é inválido!\n`;
      }
    }
  } catch {
    text += `⚠️ Não foi possível verificar MX\n`;
  }

  // Pattern analysis
  if (localPart.length <= 2) text += `⚠️ Nome de usuário muito curto\n`;
  if (/^\d+$/.test(localPart)) text += `🟡 Apenas números no nome (gerado automaticamente?)\n`;
  if (localPart.includes("+")) text += `ℹ️ Email com alias (+) detectado\n`;

  text += `\n✅ <i>Análise de email</i>`;
  return text;
}

// ─── Phone Analysis ──────────────────────────────────────────────────
async function analyzePhone(phone: string): Promise<string> {
  const digits = phone.replace(/\D/g, "");

  let text = `📱 <b>Análise de Telefone</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📞 <b>Número:</b> <code>${phone}</code>\n`;

  if (digits.length < 10 || digits.length > 13) {
    text += `\n❌ Formato inválido. Informe com DDD (10 ou 11 dígitos).`;
    return text;
  }

  const startIndex = digits.startsWith("55") ? 2 : 0;
  const ddd = digits.substring(startIndex, startIndex + 2);
  const number = digits.substring(startIndex + 2);
  const isMobile = number.length === 9 && number.startsWith("9");

  text += `📍 <b>DDD:</b> ${ddd}\n`;
  text += `📲 <b>Tipo:</b> ${isMobile ? "📱 Celular" : "☎️ Fixo"}\n`;

  const dddInfo = await lookupDDD(ddd);
  if (dddInfo) {
    text += `🗺️ <b>Estado:</b> ${dddInfo.state}\n`;
    if (dddInfo.cities.length > 0) {
      text += `🏙️ <b>Cidades:</b> ${dddInfo.cities.slice(0, 5).join(", ")}`;
      if (dddInfo.cities.length > 5) text += ` e +${dddInfo.cities.length - 5}`;
      text += `\n`;
    }
  }

  const spamDDDs = ["0300", "0500", "0800", "0900"];
  const isSpamDDD = spamDDDs.some(s => digits.startsWith(s));

  text += `\n━━━━━━━━━━━━━━━━━━━━\n🔍 <b>Indicadores:</b>\n\n`;
  if (digits.startsWith("0800")) text += `✅ Número 0800 (gratuito) - geralmente legítimo\n`;
  else if (isSpamDDD) text += `⚠️ Prefixo de telemarketing - possível spam\n`;
  if (isMobile) text += `📱 Celular com 9º dígito - formato válido\n`;
  if (!dddInfo && !isSpamDDD) text += `⚠️ DDD ${ddd} não reconhecido\n`;

  text += `\n✅ <i>DDD via BrasilAPI</i>`;
  return text;
}

// ─── CPF Analysis ────────────────────────────────────────────────────
function analyzeCPFFormat(cpf: string): string {
  const validation = validateCPF(cpf);
  const digits = validation.digits;

  let text = `🔍 <b>Consulta CPF</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📋 <b>CPF:</b> <code>${validation.formatted}</code>\n\n`;

  if (!validation.valid) {
    text += `❌ <b>CPF INVÁLIDO!</b>\nDígitos verificadores não conferem.\n\n`;
    text += `🚦 <b>RISCO: ALTO</b>\n`;
    text += `⚠️ Se alguém forneceu este CPF, é indicativo de fraude.\n`;
    return text;
  }

  text += `✅ <b>CPF matematicamente válido</b>\n\n`;

  const regionDigit = parseInt(digits[8]);
  const regions: Record<number, string> = {
    0: "RS", 1: "DF/GO/MS/MT/TO", 2: "AC/AM/AP/PA/RO/RR",
    3: "CE/MA/PI", 4: "AL/PB/PE/RN", 5: "BA/SE",
    6: "MG", 7: "ES/RJ", 8: "SP", 9: "PR/SC",
  };

  text += `🗺️ <b>Região fiscal:</b> ${regions[regionDigit] || "N/A"} (dígito ${regionDigit})\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n🔍 <b>Análise:</b>\n\n`;
  text += `✅ Formato válido\n✅ Dígitos verificadores corretos\n`;
  text += `📍 Região fiscal: ${regions[regionDigit]}\n\n`;
  text += `💡 <b>Proteção:</b>\n`;
  text += `• Nunca compartilhe CPF em sites duvidosos\n`;
  text += `• Monitore no Registrato (Banco Central)\n`;
  text += `• Ative alertas no SPC/Serasa\n`;

  return text;
}

// ─── Link Analysis ───────────────────────────────────────────────────
async function analyzeLink(url: string): Promise<{ text: string; riskData: string }> {
  let analysisText = `🔗 <b>Análise de Link</b>\n━━━━━━━━━━━━━━━━━━━━\n\n`;
  analysisText += `🌐 <b>URL:</b> <code>${url.substring(0, 100)}</code>\n\n`;

  const indicators: string[] = [];
  let riskScore = 0;
  let fullUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) fullUrl = "https://" + url;

  try {
    const urlObj = new URL(fullUrl);
    const domain = urlObj.hostname.toLowerCase();

    analysisText += `📍 <b>Domínio:</b> ${domain}\n`;
    analysisText += `🔒 <b>Protocolo:</b> ${urlObj.protocol === "https:" ? "✅ HTTPS" : "⚠️ HTTP"}\n\n`;

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) { indicators.push("🔴 URL usa IP"); riskScore += 30; }
    
    const suspiciousTLDs = [".xyz", ".top", ".club", ".buzz", ".work", ".click", ".tk", ".ml", ".ga", ".cf"];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) { indicators.push("🟡 TLD suspeita"); riskScore += 20; }

    const brands = ["banco", "itau", "bradesco", "santander", "caixa", "nubank", "picpay", "mercadopago", "gov", "correios", "serasa"];
    const matched = brands.find(b => domain.includes(b) && !domain.endsWith(".gov.br") && !domain.endsWith(".com.br"));
    if (matched) { indicators.push(`🔴 Possível imitação de "${matched}"`); riskScore += 40; }

    if (domain.split(".").length - 2 > 2) { indicators.push("🟡 Muitos subdomínios"); riskScore += 15; }

    const shorteners = ["bit.ly", "t.co", "goo.gl", "tinyurl.com", "is.gd", "ow.ly"];
    if (shorteners.some(s => domain.includes(s))) { indicators.push("🟡 URL encurtada"); riskScore += 10; }

    if (urlObj.protocol !== "https:") { indicators.push("🟡 Sem HTTPS"); riskScore += 15; }

    const suspicious = ["login", "signin", "verify", "confirm", "update", "secure", "account", "banking", "wallet"];
    if (suspicious.some(p => urlObj.pathname.toLowerCase().includes(p))) { indicators.push("🟡 Termos sensíveis na URL"); riskScore += 15; }

    if (fullUrl.includes("@")) { indicators.push("🔴 URL com @ (phishing)"); riskScore += 35; }

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      const headRes = await fetch(fullUrl, { method: "HEAD", redirect: "manual", signal: controller.signal });
      analysisText += `📡 <b>Status:</b> ${headRes.status}\n`;
      if (headRes.status >= 300 && headRes.status < 400) {
        indicators.push(`🟡 Redireciona para: ${headRes.headers.get("location")?.substring(0, 50) || "?"}`);
        riskScore += 10;
      }
    } catch { indicators.push("⚠️ Link inacessível"); riskScore += 5; }
  } catch { indicators.push("🔴 URL inválida"); riskScore += 50; }

  let riskLevel: string;
  let riskEmoji: string;
  if (riskScore >= 50) { riskLevel = "CRÍTICO"; riskEmoji = "🔴"; }
  else if (riskScore >= 30) { riskLevel = "ALTO"; riskEmoji = "🟠"; }
  else if (riskScore >= 15) { riskLevel = "MÉDIO"; riskEmoji = "🟡"; }
  else { riskLevel = "BAIXO"; riskEmoji = "🟢"; }

  analysisText += `\n${riskEmoji} <b>RISCO: ${riskLevel}</b> (${riskScore}/100)\n\n`;
  if (indicators.length > 0) {
    analysisText += `🔍 <b>Indicadores:</b>\n`;
    indicators.forEach(i => { analysisText += `   ${i}\n`; });
  } else {
    analysisText += `✅ Nenhum indicador negativo\n`;
  }

  return { text: analysisText, riskData: riskLevel };
}

// ─── AI Analysis ─────────────────────────────────────────────────────
async function analyzeWithAI(queryType: string, input: string, realDataContext?: string): Promise<{
  riskLevel: string; fraudType: string; response: string;
}> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { riskLevel: "indefinido", fraudType: "sem_analise", response: "⚠️ IA temporariamente indisponível." };
  }

  const contextNote = realDataContext ? `\n\nDados reais obtidos:\n${realDataContext}` : "";

  const prompts: Record<string, string> = {
    cpf: `Analise este CPF: ${input}.${contextNote}\n\nForneça análise de segurança: uso indevido, clonagem, empréstimos fraudulentos. Dicas de proteção.`,
    cnpj: `Analise esta empresa (dados reais):\n${input}${contextNote}\n\nAvalie: empresa fantasma, golpes, sinais de alerta.`,
    nome: `Analise possíveis riscos do nome "${input}". Considere: perfis falsos, engenharia social. Orientações de verificação de identidade.`,
    telefone: `Analise telefone: ${input}.${contextNote}\n\nConsidere: golpes WhatsApp, ligações fraudulentas, clonagem.`,
    link: `Analise URL: ${input}.${contextNote}\n\nConsidere: phishing, malware, sites falsos.`,
    message: `Analise se é golpe:\n\n"${input}"\n\nConsidere: engenharia social, promessas falsas, urgência artificial, golpes BR.`,
    email: `Analise este email: ${input}.${contextNote}\n\nConsidere: email falso, phishing, spam, legitimidade do domínio.`,
    dominio: `Analise este domínio: ${input}.${contextNote}\n\nConsidere: site falso, phishing, reputação, segurança.`,
    placa: `Analise esta placa: ${input}.${contextNote}\n\nDê informações sobre golpes envolvendo veículos: clonagem, adulteração.`,
  };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em segurança digital e prevenção de fraudes no Brasil. 
Responda em PT-BR, direto e claro.
Formato:
🚦 NÍVEL DE RISCO: [BAIXO/MÉDIO/ALTO/CRÍTICO]
🎯 TIPO: [tipo do golpe ou "Nenhum identificado"]
📝 ANÁLISE: [explicação, max 3 parágrafos]
💡 DICAS: [2-3 dicas práticas]`,
          },
          { role: "user", content: prompts[queryType] || prompts.message },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      console.error("AI error:", res.status);
      return { riskLevel: "indefinido", fraudType: "erro", response: "⚠️ IA indisponível." };
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
    console.error("AI error:", e);
    return { riskLevel: "indefinido", fraudType: "erro", response: "⚠️ Erro na IA." };
  }
}

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
    console.log("Update:", JSON.stringify(update).substring(0, 500));

    // ─── Handle callback queries ────────────────────────────────────
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const userId = cb.from.id;
      const data = cb.data;

      await answerCallback(BOT_TOKEN, cb.id);

      await supabase.from("telbot_logs").insert({
        log_type: "command", telegram_user_id: userId,
        command: data, message: `Callback: ${data}`,
      });

      // ── Query type callbacks ──
      if (data.startsWith("query_")) {
        const queryType = data.replace("query_", "");
        const labels: Record<string, string> = {
          cpf: "CPF (11 dígitos)", cnpj: "CNPJ (14 dígitos)",
          nome: "Nome completo", telefone: "Telefone com DDD",
          link: "link/URL completa", message: "mensagem suspeita",
          cep: "CEP (8 dígitos)", email: "endereço de email",
          dominio: "domínio do site (ex: google.com)",
          placa: "placa do veículo (ex: ABC1D23)",
          ibge: "nome da cidade ou sigla do estado",
        };

        // Bancos don't need input
        if (queryType === "bancos") {
          await editMessage(BOT_TOKEN, chatId, cb.message.message_id, "⏳ Consultando bancos...");
          const result = await lookupBancos();
          await sendMessage(BOT_TOKEN, chatId, result, {
            inline_keyboard: [[{ text: "◀️ Menu Principal", callback_data: "main_menu" }]],
          });
          await supabase.from("telbot_queries").insert({
            telegram_user_id: userId, query_type: "bancos",
            query_input: "lista_bancos", risk_level: "baixo",
            fraud_type: "consulta", ai_response: "Listagem de bancos",
          });
          return new Response("OK");
        }

        // Set state in DB (persists between requests!)
        await supabase.from("telbot_users").upsert({
          telegram_id: userId,
          telegram_username: cb.from.username || null,
          first_name: cb.from.first_name,
          last_name: cb.from.last_name || null,
          last_activity_at: new Date().toISOString(),
          conversation_state: { action: `query_${queryType}`, step: "waiting_input" },
        }, { onConflict: "telegram_id" });

        await editMessage(
          BOT_TOKEN, chatId, cb.message.message_id,
          `🔍 <b>Consulta de ${labels[queryType] || queryType}</b>\n\n📝 Envie o <b>${labels[queryType] || "dado"}</b> que deseja consultar:`,
        );
        return new Response("OK");
      }

      // ── Monitoring callbacks ──
      if (data === "monitoring") {
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          "🔔 <b>Monitoramento</b>\n\nEscolha:", {
            inline_keyboard: [
              [
                { text: "➕ CPF", callback_data: "mon_add_cpf" },
                { text: "➕ CNPJ", callback_data: "mon_add_cnpj" },
              ],
              [
                { text: "➕ Nome", callback_data: "mon_add_nome" },
                { text: "📋 Listar", callback_data: "mon_list" },
              ],
              [
                { text: "🗑️ Remover", callback_data: "mon_remove" },
                { text: "◀️ Voltar", callback_data: "main_menu" },
              ],
            ],
          });
        return new Response("OK");
      }

      if (data.startsWith("mon_add_")) {
        const monType = data.replace("mon_add_", "");
        await setUserState(supabase, userId, { action: `monitor_${monType}`, step: "waiting_input" });
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          `🔔 <b>Monitorar ${monType.toUpperCase()}</b>\n\nEnvie o ${monType.toUpperCase()} que deseja monitorar:`);
        return new Response("OK");
      }

      if (data === "mon_remove") {
        await setUserState(supabase, userId, { action: "monitor_remove", step: "waiting_input" });
        const { data: monitors } = await supabase
          .from("telbot_monitoring").select("*")
          .eq("telegram_user_id", userId).eq("is_active", true);

        if (!monitors || monitors.length === 0) {
          await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
            "📋 Nenhum monitoramento ativo.", {
              inline_keyboard: [[{ text: "◀️ Voltar", callback_data: "monitoring" }]],
            });
          return new Response("OK");
        }

        let text = "🗑️ <b>Remover Monitoramento</b>\n\nEnvie o número:\n\n";
        monitors.forEach((m: any, i: number) => {
          text += `${i + 1}. ${m.monitor_type.toUpperCase()}: ${m.monitor_value}\n`;
        });
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text);
        return new Response("OK");
      }

      if (data === "mon_list") {
        const { data: monitors } = await supabase
          .from("telbot_monitoring").select("*")
          .eq("telegram_user_id", userId).eq("is_active", true)
          .order("created_at", { ascending: false }).limit(10);

        let text = "📋 <b>Monitoramentos Ativos</b>\n\n";
        if (!monitors || monitors.length === 0) {
          text += "Nenhum ativo. Use o menu para cadastrar.";
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
          .from("telbot_queries").select("*")
          .eq("telegram_user_id", userId)
          .order("created_at", { ascending: false }).limit(10);

        let text = "📋 <b>Histórico</b>\n\n";
        if (!queries || queries.length === 0) {
          text += "Nenhuma consulta realizada.";
        } else {
          const re: Record<string, string> = { baixo: "🟢", medio: "🟡", alto: "🟠", critico: "🔴" };
          queries.forEach((q: any, i: number) => {
            const emoji = re[q.risk_level] || "⚪";
            const date = new Date(q.created_at).toLocaleDateString("pt-BR");
            text += `${i + 1}. ${emoji} <b>${q.query_type.toUpperCase()}</b> - ${q.query_input.substring(0, 25)}\n   📅 ${date} | Risco: ${q.risk_level || "N/A"}\n\n`;
          });
        }
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id, text, {
          inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]],
        });
        return new Response("OK");
      }

      if (data === "help") {
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          `ℹ️ <b>Ajuda</b>\n\n` +
          `🔍 <b>Consultas com dados reais:</b>\n` +
          `• CPF - Validação + região fiscal\n` +
          `• CNPJ - Receita Federal completo\n` +
          `• Telefone - DDD, região, tipo\n` +
          `• CEP - Endereço + coordenadas\n` +
          `• Email - Validação MX + reputação\n` +
          `• Domínio - DNS, SSL, segurança\n` +
          `• Placa - Formato + região\n` +
          `• IBGE - Municípios + estados\n` +
          `• Bancos - Lista Banco Central\n\n` +
          `🤖 <b>IA:</b> Links, mensagens, nomes\n` +
          `🔔 <b>Monitoramento:</b> Alertas automáticos`,
          { inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]] });
        return new Response("OK");
      }

      if (data === "main_menu") {
        await setUserState(supabase, userId, null);
        await editMessage(BOT_TOKEN, chatId, cb.message.message_id,
          "🛡️ <b>Bot Anti-Fraude</b>\n\nEscolha:", mainMenuKeyboard());
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
        await setUserState(supabase, userId, null);
        await supabase.from("telbot_logs").insert({
          log_type: "command", telegram_user_id: userId, command: text,
          message: `User ${msg.from.first_name} started`,
        });
        await sendMessage(BOT_TOKEN, chatId,
          `🛡️ <b>Bot Anti-Fraude Genesis</b>\n\nOlá, <b>${msg.from.first_name}</b>! 👋\n\n` +
          `Sou seu assistente de segurança digital com <b>dados reais</b> e <b>IA avançada</b>.\n\n` +
          `📊 <b>12 tipos de consulta:</b>\n` +
          `CPF • CNPJ • Telefone • CEP • Email\nDomínio • Placa • IBGE • Bancos\nNome • Link • Mensagem\n\n` +
          `Escolha uma opção:`, mainMenuKeyboard());
        return new Response("OK");
      }

      if (text === "/ajuda") {
        await sendMessage(BOT_TOKEN, chatId,
          `ℹ️ /start - Menu\n/menu - Menu\n/ajuda - Ajuda\n\nOu use os botões!`);
        return new Response("OK");
      }

      // Handle user input based on DB state
      const state = await getUserState(supabase, userId);
      
      if (state && state.step === "waiting_input") {
        // Clear state immediately to prevent double processing
        await setUserState(supabase, userId, null);
        
        const queryType = state.action.replace("query_", "").replace("monitor_", "");

        // ── Monitoring: Remove ──
        if (state.action === "monitor_remove") {
          const idx = parseInt(text) - 1;
          const { data: monitors } = await supabase
            .from("telbot_monitoring").select("*")
            .eq("telegram_user_id", userId).eq("is_active", true);

          if (monitors && monitors[idx]) {
            await supabase.from("telbot_monitoring")
              .update({ is_active: false }).eq("id", monitors[idx].id);
            await sendMessage(BOT_TOKEN, chatId,
              `✅ Removido: <b>${monitors[idx].monitor_type.toUpperCase()}</b> - ${monitors[idx].monitor_value}`,
              { inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]] });
          } else {
            await sendMessage(BOT_TOKEN, chatId, "❌ Número inválido.",
              { inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]] });
          }
          return new Response("OK");
        }

        // ── Monitoring: Add ──
        if (state.action.startsWith("monitor_")) {
          await supabase.from("telbot_monitoring").insert({
            telegram_user_id: userId, monitor_type: queryType,
            monitor_value: text, is_active: true,
          });
          await sendMessage(BOT_TOKEN, chatId,
            `✅ <b>Monitoramento Ativado!</b>\n\n📌 ${queryType.toUpperCase()}: <b>${text}</b>`,
            { inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]] });
          return new Response("OK");
        }

        // ── QUERIES WITH REAL DATA ──
        await sendMessage(BOT_TOKEN, chatId, "⏳ Processando consulta... Aguarde.");

        let responseText = "";
        let riskLevel = "baixo";
        let fraudType = "consulta";

        console.log(`Processing query: ${queryType} -> ${text.substring(0, 50)}`);

        switch (queryType) {
          case "cnpj": {
            responseText = await lookupCNPJ(text);
            const ai = await analyzeWithAI("cnpj", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "cpf": {
            responseText = analyzeCPFFormat(text);
            const ai = await analyzeWithAI("cpf", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "telefone": {
            responseText = await analyzePhone(text);
            const ai = await analyzeWithAI("telefone", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "cep": {
            responseText = await lookupCEP(text);
            riskLevel = "baixo"; fraudType = "consulta_cep";
            break;
          }
          case "link": {
            const linkResult = await analyzeLink(text);
            responseText = linkResult.text;
            const ai = await analyzeWithAI("link", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel || linkResult.riskData.toLowerCase();
            fraudType = ai.fraudType;
            break;
          }
          case "nome": {
            const ai = await analyzeWithAI("nome", text);
            responseText = `👤 <b>Consulta por Nome</b>\n━━━━━━━━━━━━━━━━━━━━\n\n🔍 <b>Nome:</b> ${text}\n\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "message": {
            const ai = await analyzeWithAI("message", text);
            responseText = `💬 <b>Análise de Mensagem</b>\n━━━━━━━━━━━━━━━━━━━━\n\n📝 <i>"${text.substring(0, 200)}"</i>\n\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "email": {
            responseText = await analyzeEmail(text);
            const ai = await analyzeWithAI("email", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "dominio": {
            responseText = await analyzeDomain(text);
            const ai = await analyzeWithAI("dominio", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "placa": {
            responseText = await lookupPlaca(text);
            const ai = await analyzeWithAI("placa", text, responseText);
            responseText += `\n\n🤖 <b>IA:</b>\n${ai.response}`;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
            break;
          }
          case "ibge": {
            responseText = await lookupIBGE(text);
            riskLevel = "baixo"; fraudType = "consulta_ibge";
            break;
          }
          default: {
            const ai = await analyzeWithAI("message", text);
            responseText = ai.response;
            riskLevel = ai.riskLevel; fraudType = ai.fraudType;
          }
        }

        // Save query
        await supabase.from("telbot_queries").insert({
          telegram_user_id: userId, query_type: queryType,
          query_input: text.substring(0, 500), risk_level: riskLevel,
          fraud_type: fraudType, ai_response: responseText.substring(0, 4000),
        });

        // Update stats
        const { data: userData } = await supabase
          .from("telbot_users").select("total_queries")
          .eq("telegram_id", userId).single();
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

        // Send (split if too long)
        if (responseText.length > 4000) {
          const parts: string[] = [];
          let remaining = responseText;
          while (remaining.length > 0) {
            if (remaining.length <= 4000) { parts.push(remaining); break; }
            let splitAt = remaining.lastIndexOf("\n", 4000);
            if (splitAt < 1000) splitAt = 4000;
            parts.push(remaining.substring(0, splitAt));
            remaining = remaining.substring(splitAt);
          }
          for (let i = 0; i < parts.length; i++) {
            await sendMessage(BOT_TOKEN, chatId, parts[i],
              i === parts.length - 1 ? { inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]] } : undefined);
          }
        } else {
          await sendMessage(BOT_TOKEN, chatId, responseText, {
            inline_keyboard: [[{ text: "◀️ Menu", callback_data: "main_menu" }]],
          });
        }

        return new Response("OK");
      }

      // Default: show menu
      await sendMessage(BOT_TOKEN, chatId,
        `Use /menu ou escolha:`, mainMenuKeyboard());
    }

    return new Response("OK");
  } catch (error) {
    console.error("Bot error:", error);
    return new Response("Error", { status: 500 });
  }
});
