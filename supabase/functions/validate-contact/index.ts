import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
}

interface EmailValidation {
  isValid: boolean;
  syntax: boolean;
  mxValid: boolean;
  isDisposable: boolean;
  isCatchAll: boolean | null;
  provider: string | null;
  domain: string;
  confidence: number;
  hunterVerified?: boolean;
}

interface PhoneValidation {
  isValid: boolean;
  formatted: string;
  isMobile: boolean;
  hasWhatsapp: boolean;
  carrier: string | null;
  countryCode: string;
}

// Lista de domínios descartáveis
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'throwaway.com', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com',
  'trashmail.com', 'dispostable.com', 'sharklasers.com', 'guerrillamail.info',
  'grr.la', 'spam4.me', 'maildrop.cc', 'getairmail.com'
]);

// Provedores conhecidos
const KNOWN_PROVIDERS: Record<string, string> = {
  'gmail.com': 'Google',
  'googlemail.com': 'Google',
  'outlook.com': 'Microsoft',
  'hotmail.com': 'Microsoft',
  'live.com': 'Microsoft',
  'yahoo.com': 'Yahoo',
  'icloud.com': 'Apple',
  'protonmail.com': 'ProtonMail',
  'zoho.com': 'Zoho',
};

// Validar email com Hunter.io
async function validateEmailWithHunter(email: string): Promise<{ result: string; score: number } | null> {
  const hunterApiKey = Deno.env.get('HUNTER_IO_API_KEY');
  if (!hunterApiKey) {
    console.log('Hunter.io API key not configured');
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterApiKey}`
    );
    
    if (!response.ok) {
      console.error('Hunter.io API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    return {
      result: data.data?.result || 'unknown',
      score: data.data?.score || 0
    };
  } catch (error) {
    console.error('Hunter.io validation error:', error);
    return null;
  }
}

async function validateEmail(email: string): Promise<EmailValidation> {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const syntaxValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (!syntaxValid) {
    return {
      isValid: false,
      syntax: false,
      mxValid: false,
      isDisposable: false,
      isCatchAll: null,
      provider: null,
      domain,
      confidence: 0
    };
  }
  
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const provider = KNOWN_PROVIDERS[domain] || null;
  
  // Verificar MX records via DNS
  let mxValid = false;
  try {
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const dnsData = await dnsResponse.json();
    mxValid = (dnsData.Answer && dnsData.Answer.length > 0);
  } catch {
    mxValid = provider !== null; // Se é provedor conhecido, assume válido
  }
  
  // Validar com Hunter.io se disponível
  const hunterResult = await validateEmailWithHunter(email);
  
  // Calcular confiança baseado em Hunter.io ou heurísticas
  let confidence = 0;
  if (hunterResult) {
    confidence = hunterResult.score;
  } else {
    if (syntaxValid) confidence += 30;
    if (mxValid) confidence += 40;
    if (!isDisposable) confidence += 20;
    if (provider) confidence += 10;
  }
  
  const isValid = hunterResult 
    ? (hunterResult.result === 'deliverable' || hunterResult.result === 'risky')
    : (syntaxValid && mxValid && !isDisposable);
  
  return {
    isValid,
    syntax: syntaxValid,
    mxValid,
    isDisposable,
    isCatchAll: null,
    provider,
    domain,
    confidence,
    hunterVerified: !!hunterResult
  };
}

function validatePhone(phone: string, countryCode: string = 'BR'): PhoneValidation {
  // Limpar caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Validação básica de tamanho
  const isValid = cleaned.length >= 10 && cleaned.length <= 15;
  
  // Detectar se é celular (Brasil: começa com 9 após DDD)
  let isMobile = false;
  let formatted = cleaned;
  
  if (countryCode === 'BR') {
    // Formato brasileiro: DDD + número
    if (cleaned.length === 11) {
      isMobile = cleaned.charAt(2) === '9';
      formatted = `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      isMobile = false; // Fixo
      formatted = `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length >= 12 && cleaned.startsWith('55')) {
      const number = cleaned.slice(2);
      isMobile = number.charAt(2) === '9';
      formatted = `+55 (${number.slice(0, 2)}) ${number.slice(2, 7)}-${number.slice(7)}`;
    }
  } else {
    // Outros países - heurística básica
    isMobile = cleaned.length >= 10;
  }
  
  // Detectar potencial WhatsApp (celular no Brasil geralmente tem)
  const hasWhatsapp = isMobile && countryCode === 'BR';
  
  return {
    isValid,
    formatted,
    isMobile,
    hasWhatsapp,
    carrier: null,
    countryCode
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, countryCode = 'BR' }: ValidateRequest = await req.json();
    
    const result: { email?: EmailValidation; phone?: PhoneValidation } = {};
    
    if (email) {
      result.email = await validateEmail(email);
    }
    
    if (phone) {
      result.phone = validatePhone(phone, countryCode);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
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