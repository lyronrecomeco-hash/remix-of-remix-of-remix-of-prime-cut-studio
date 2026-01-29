import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista de domínios de email temporários conhecidos
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'yopmail.com', 'fakeinbox.com', 'trashmail.com',
  'getnada.com', 'mohmal.com', 'temp-mail.org', 'dispostable.com',
  'sharklasers.com', 'maildrop.cc', 'mailnesia.com', 'tempail.com'
];

// Provedores de email conhecidos
const EMAIL_PROVIDERS: Record<string, string> = {
  'gmail.com': 'Gmail',
  'googlemail.com': 'Gmail',
  'outlook.com': 'Outlook',
  'hotmail.com': 'Hotmail',
  'live.com': 'Microsoft Live',
  'yahoo.com': 'Yahoo',
  'yahoo.com.br': 'Yahoo Brasil',
  'icloud.com': 'iCloud',
  'me.com': 'iCloud',
  'uol.com.br': 'UOL',
  'bol.com.br': 'BOL',
  'terra.com.br': 'Terra',
  'globo.com': 'Globo',
  'ig.com.br': 'iG',
  'protonmail.com': 'ProtonMail',
  'zoho.com': 'Zoho',
};

// Códigos de país e seus DDIs
const COUNTRY_CODES: Record<string, { code: string; mobilePrefix: string[] }> = {
  'BR': { code: '55', mobilePrefix: ['9'] },
  'US': { code: '1', mobilePrefix: ['2', '3', '4', '5', '6', '7', '8', '9'] },
  'PT': { code: '351', mobilePrefix: ['9'] },
  'AR': { code: '54', mobilePrefix: ['9'] },
  'MX': { code: '52', mobilePrefix: ['1'] },
  'ES': { code: '34', mobilePrefix: ['6', '7'] },
  'UK': { code: '44', mobilePrefix: ['7'] },
};

interface ValidateRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
}

interface EmailValidation {
  isValid: boolean;
  syntaxValid: boolean;
  mxValid: boolean;
  isDisposable: boolean;
  isCatchAll: boolean;
  provider: string | null;
  domain: string;
  normalized: string;
}

interface PhoneValidation {
  isValid: boolean;
  isMobile: boolean;
  hasWhatsapp: boolean;
  carrier: string | null;
  countryCode: string;
  formatted: string;
  normalized: string;
}

// Validação de sintaxe de email
function validateEmailSyntax(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

// Verificação de MX records via DNS
async function checkMxRecords(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch {
    return false;
  }
}

// Verificar se é domínio descartável
function isDisposableEmail(domain: string): boolean {
  return DISPOSABLE_DOMAINS.some(d => domain.toLowerCase().includes(d));
}

// Obter provedor de email
function getEmailProvider(domain: string): string | null {
  return EMAIL_PROVIDERS[domain.toLowerCase()] || null;
}

// Validar email completo
async function validateEmail(email: string): Promise<EmailValidation> {
  const normalized = email.toLowerCase().trim();
  const syntaxValid = validateEmailSyntax(normalized);
  
  if (!syntaxValid) {
    return {
      isValid: false,
      syntaxValid: false,
      mxValid: false,
      isDisposable: false,
      isCatchAll: false,
      provider: null,
      domain: '',
      normalized,
    };
  }
  
  const domain = normalized.split('@')[1];
  const [mxValid, isDisposable] = await Promise.all([
    checkMxRecords(domain),
    Promise.resolve(isDisposableEmail(domain)),
  ]);
  
  const provider = getEmailProvider(domain);
  
  // Emails de provedores conhecidos geralmente são catch-all
  const isCatchAll = ['gmail.com', 'outlook.com', 'yahoo.com'].includes(domain.toLowerCase());
  
  return {
    isValid: syntaxValid && mxValid && !isDisposable,
    syntaxValid,
    mxValid,
    isDisposable,
    isCatchAll,
    provider,
    domain,
    normalized,
  };
}

// Normalizar telefone brasileiro
function normalizePhone(phone: string, countryCode: string = 'BR'): string {
  // Remover todos os caracteres não numéricos
  let normalized = phone.replace(/\D/g, '');
  
  // Se começa com 0, remover
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  // Se tem código do país, remover
  const country = COUNTRY_CODES[countryCode];
  if (country && normalized.startsWith(country.code)) {
    normalized = normalized.substring(country.code.length);
  }
  
  return normalized;
}

// Formatar telefone
function formatPhone(phone: string, countryCode: string = 'BR'): string {
  const normalized = normalizePhone(phone, countryCode);
  
  if (countryCode === 'BR') {
    if (normalized.length === 11) {
      return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
    } else if (normalized.length === 10) {
      return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
    }
  }
  
  return phone;
}

// Verificar se é celular (Brasil)
function isMobilePhone(phone: string, countryCode: string = 'BR'): boolean {
  const normalized = normalizePhone(phone, countryCode);
  
  if (countryCode === 'BR') {
    // Celulares brasileiros têm 11 dígitos e o 3º dígito é 9
    if (normalized.length === 11) {
      return normalized.charAt(2) === '9';
    }
    // Ou 10 dígitos com 9 no início do número
    if (normalized.length === 10) {
      return normalized.charAt(2) === '9';
    }
  }
  
  const country = COUNTRY_CODES[countryCode];
  if (country) {
    return country.mobilePrefix.some(prefix => normalized.startsWith(prefix));
  }
  
  return false;
}

// Detectar operadora (simplificado para Brasil)
function detectCarrier(phone: string, countryCode: string = 'BR'): string | null {
  const normalized = normalizePhone(phone, countryCode);
  
  if (countryCode !== 'BR' || normalized.length < 2) {
    return null;
  }
  
  const ddd = normalized.substring(0, 2);
  
  // DDDs das principais regiões
  const ddds: Record<string, string> = {
    '11': 'São Paulo',
    '21': 'Rio de Janeiro',
    '31': 'Belo Horizonte',
    '41': 'Curitiba',
    '51': 'Porto Alegre',
    '61': 'Brasília',
    '71': 'Salvador',
    '81': 'Recife',
    '85': 'Fortaleza',
    '92': 'Manaus',
  };
  
  return ddds[ddd] || `DDD ${ddd}`;
}

// Verificar se tem WhatsApp (heurística baseada em formato)
function checkWhatsappPotential(phone: string, countryCode: string = 'BR'): boolean {
  const normalized = normalizePhone(phone, countryCode);
  
  // WhatsApp requer celular
  if (!isMobilePhone(phone, countryCode)) {
    return false;
  }
  
  // Verificar comprimento válido
  if (countryCode === 'BR') {
    return normalized.length === 11;
  }
  
  return true;
}

// Validar telefone completo
function validatePhone(phone: string, countryCode: string = 'BR'): PhoneValidation {
  const normalized = normalizePhone(phone, countryCode);
  const isMobile = isMobilePhone(phone, countryCode);
  const hasWhatsapp = checkWhatsappPotential(phone, countryCode);
  const carrier = detectCarrier(phone, countryCode);
  const formatted = formatPhone(phone, countryCode);
  
  // Validação básica de comprimento
  let isValid = false;
  if (countryCode === 'BR') {
    isValid = normalized.length >= 10 && normalized.length <= 11;
  } else {
    isValid = normalized.length >= 7 && normalized.length <= 15;
  }
  
  return {
    isValid,
    isMobile,
    hasWhatsapp,
    carrier,
    countryCode,
    formatted,
    normalized,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, countryCode = 'BR' }: ValidateRequest = await req.json();

    if (!email && !phone) {
      throw new Error('Email ou telefone é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: {
      email?: EmailValidation;
      phone?: PhoneValidation;
      cached: boolean;
    } = { cached: false };

    // Validar email
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Verificar cache
      const { data: cachedEmail } = await supabase
        .from('lead_validations')
        .select('*')
        .eq('contact_value', normalizedEmail)
        .eq('contact_type', 'email')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedEmail) {
        results.email = {
          isValid: cachedEmail.is_valid,
          syntaxValid: cachedEmail.email_syntax_valid,
          mxValid: cachedEmail.email_mx_valid,
          isDisposable: cachedEmail.email_is_disposable,
          isCatchAll: cachedEmail.email_is_catch_all,
          provider: cachedEmail.email_provider,
          domain: normalizedEmail.split('@')[1],
          normalized: normalizedEmail,
        };
        results.cached = true;
      } else {
        results.email = await validateEmail(email);
        
        // Salvar no cache (7 dias)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await supabase.from('lead_validations').upsert({
          contact_value: results.email.normalized,
          contact_type: 'email',
          is_valid: results.email.isValid,
          email_syntax_valid: results.email.syntaxValid,
          email_mx_valid: results.email.mxValid,
          email_is_disposable: results.email.isDisposable,
          email_is_catch_all: results.email.isCatchAll,
          email_provider: results.email.provider,
          validation_details: results.email,
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'contact_value,contact_type',
        });
      }
    }

    // Validar telefone
    if (phone) {
      const normalizedPhone = normalizePhone(phone, countryCode);
      
      // Verificar cache
      const { data: cachedPhone } = await supabase
        .from('lead_validations')
        .select('*')
        .eq('contact_value', normalizedPhone)
        .eq('contact_type', 'phone')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedPhone) {
        results.phone = {
          isValid: cachedPhone.is_valid,
          isMobile: cachedPhone.phone_is_mobile,
          hasWhatsapp: cachedPhone.phone_has_whatsapp,
          carrier: cachedPhone.phone_carrier,
          countryCode: cachedPhone.phone_country_code,
          formatted: cachedPhone.phone_formatted,
          normalized: normalizedPhone,
        };
        results.cached = true;
      } else {
        results.phone = validatePhone(phone, countryCode);
        
        // Salvar no cache (7 dias)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await supabase.from('lead_validations').upsert({
          contact_value: results.phone.normalized,
          contact_type: 'phone',
          is_valid: results.phone.isValid,
          phone_is_mobile: results.phone.isMobile,
          phone_has_whatsapp: results.phone.hasWhatsapp,
          phone_carrier: results.phone.carrier,
          phone_country_code: results.phone.countryCode,
          phone_formatted: results.phone.formatted,
          validation_details: results.phone,
          expires_at: expiresAt.toISOString(),
        }, {
          onConflict: 'contact_value,contact_type',
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error validating contact:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
