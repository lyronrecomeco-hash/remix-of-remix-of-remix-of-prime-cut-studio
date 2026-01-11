/**
 * USE CAKTO CONTACTS - Hook para extrair contatos PRECISOS de eventos Cakto
 * Suporta PIX não pago com VERIFICAÇÃO RIGOROSA por email + telefone + external_id
 * Suporta MULTI-SELECT de produtos e PERÍODO DE DATAS
 * ATUALIZADO: Remove automaticamente duplicados e contatos já enviados
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CaktoContact {
  phone: string;
  name: string | null;
  email: string | null;
  productName: string | null;
  productId: string | null;
  orderValue: number | null;
  eventDate: string;
  formattedDate: string;
  externalId: string;
  paymentStatus: 'unpaid' | 'paid' | 'unknown'; // Status de pagamento para badge
  isValidDDD?: boolean; // Se o DDD é válido no Brasil
  dddError?: string; // Mensagem de erro do DDD
}

// DDDs válidos no Brasil (2025)
const VALID_BRAZILIAN_DDDS = new Set([
  // São Paulo
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  // Rio de Janeiro
  '21', '22', '24',
  // Espírito Santo
  '27', '28',
  // Minas Gerais
  '31', '32', '33', '34', '35', '37', '38',
  // Paraná
  '41', '42', '43', '44', '45', '46',
  // Santa Catarina
  '47', '48', '49',
  // Rio Grande do Sul
  '51', '53', '54', '55',
  // Distrito Federal
  '61',
  // Goiás
  '62', '64',
  // Tocantins
  '63',
  // Mato Grosso
  '65', '66',
  // Mato Grosso do Sul
  '67',
  // Acre
  '68',
  // Rondônia
  '69',
  // Bahia
  '71', '73', '74', '75', '77',
  // Sergipe
  '79',
  // Pernambuco
  '81', '87',
  // Alagoas
  '82',
  // Paraíba
  '83',
  // Rio Grande do Norte
  '84',
  // Ceará
  '85', '88',
  // Piauí
  '86', '89',
  // Pará
  '91', '93', '94',
  // Amazonas
  '92', '97',
  // Roraima
  '95',
  // Amapá
  '96',
  // Maranhão
  '98', '99',
]);

// Normalizar telefone brasileiro (remove DDI 55, mantém DDD + número)
// Suporta: 5527997723328, 27997723328, +55 27 99772-3328, etc.
export function normalizeBrazilianPhone(phone: string | null): string {
  if (!phone) return '';
  
  // Remove tudo que não é dígito
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Se começa com 55 e tem mais de 11 dígitos, remove o DDI
  if (cleanPhone.startsWith('55') && cleanPhone.length > 11) {
    cleanPhone = cleanPhone.slice(2);
  }
  
  // Se ainda tiver mais de 11 dígitos (caso tenha 0 na frente ou outro prefixo)
  if (cleanPhone.length > 11) {
    cleanPhone = cleanPhone.slice(-11);
  }
  
  // Se tiver 10 dígitos (telefone fixo antigo sem 9), manter
  // Se tiver 11 dígitos (celular com 9), manter
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return ''; // Número inválido
  }
  
  return cleanPhone;
}

// Validar DDD brasileiro com normalização automática
export function validateBrazilianDDD(phone: string): { isValid: boolean; ddd: string; normalizedPhone: string; error?: string } {
  const normalizedPhone = normalizeBrazilianPhone(phone);
  
  if (!normalizedPhone) {
    return { isValid: false, ddd: '', normalizedPhone: '', error: 'Número inválido ou muito curto' };
  }
  
  // Extrair DDD (primeiros 2 dígitos do número normalizado)
  const ddd = normalizedPhone.slice(0, 2);
  
  if (!VALID_BRAZILIAN_DDDS.has(ddd)) {
    return { isValid: false, ddd, normalizedPhone, error: `DDD ${ddd} não existe no Brasil` };
  }
  
  // Validar tamanho final (10 ou 11 dígitos)
  if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
    return { isValid: false, ddd, normalizedPhone, error: 'Tamanho do número inválido' };
  }
  
  return { isValid: true, ddd, normalizedPhone };
}

export interface CaktoProduct {
  id: string;
  external_id: string;
  name: string;
  price: number;
  status: string;
  image_url: string | null;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseCaktoContactsOptions {
  instanceId: string;
  integrationId: string;
  eventType: string;
  productIds?: string[]; // MULTI-SELECT: array de IDs de produtos
  dateRange?: DateRange;
  excludeSentPhones?: boolean; // Nova opção para excluir contatos já enviados
}

// Função para obter range de datas padrão (últimos 2 dias)
export const getDefaultDateRange = (): DateRange => ({
  startDate: startOfDay(subDays(new Date(), 2)),
  endDate: endOfDay(new Date()),
});

// Normalizar telefone para comparação rigorosa (usa a função principal)
const normalizePhone = (phone: string | null): string => {
  return normalizeBrazilianPhone(phone);
};


// Normalizar email para comparação rigorosa
const normalizeEmail = (email: string | null): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

// Normalizar nome para comparação de duplicatas (remove acentos, espaços extras, lowercase)
const normalizeName = (name: string | null): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ')
    .trim();
};

export function useCaktoContacts() {
  const [contacts, setContacts] = useState<CaktoContact[]>([]);
  const [products, setProducts] = useState<CaktoProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar telefones já enviados em campanhas anteriores (últimos 30 dias)
  const fetchAlreadySentPhones = async (instanceId: string): Promise<Set<string>> => {
    try {
      // Buscar contatos que já foram enviados (sent, delivered, read, replied)
      const { data, error } = await supabase
        .from('genesis_campaign_contacts')
        .select('contact_phone, campaign_id')
        .in('status', ['sent', 'delivered', 'read', 'replied'])
        .limit(5000);
      
      if (error) {
        console.error('[useCaktoContacts] Error fetching sent phones:', error);
        return new Set();
      }

      // Normalizar todos os telefones enviados
      const sentPhones = new Set<string>();
      (data || []).forEach(c => {
        const normalized = normalizePhone(c.contact_phone);
        if (normalized) sentPhones.add(normalized);
      });

      console.log('[useCaktoContacts] Found', sentPhones.size, 'already sent phones');
      return sentPhones;
    } catch (err) {
      console.error('[useCaktoContacts] Error in fetchAlreadySentPhones:', err);
      return new Set();
    }
  };

  // Buscar produtos ativos da integração
  const fetchProducts = useCallback(async (integrationId: string): Promise<CaktoProduct[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('cakto-sync', {
        body: {
          action: 'get_products',
          integrationId,
          status: 'active',
          limit: 100,
        },
      });

      if (error) throw error;

      const productList = data?.products || [];
      setProducts(productList);
      return productList;
    } catch (err) {
      console.error('[useCaktoContacts] Error fetching products:', err);
      return [];
    }
  }, []);

  const fetchContacts = useCallback(async ({ 
    instanceId, 
    integrationId, 
    eventType,
    productIds = [], // Array de produtos selecionados
    dateRange,
    excludeSentPhones = true, // Por padrão, exclui contatos já enviados
  }: UseCaktoContactsOptions): Promise<CaktoContact[]> => {
    setLoading(true);
    setError(null);
    setContacts([]);

    // Usar date range padrão (últimos 2 dias) se não especificado
    const range = dateRange || getDefaultDateRange();
    const startDateISO = range.startDate.toISOString();
    const endDateISO = range.endDate.toISOString();

    try {
      console.log('[useCaktoContacts] Fetching contacts:', { 
        instanceId, 
        eventType, 
        productIds,
        dateRange: { start: startDateISO, end: endDateISO },
        excludeSentPhones,
      });

      // Buscar telefones já enviados se excludeSentPhones === true
      const alreadySentPhones = excludeSentPhones 
        ? await fetchAlreadySentPhones(instanceId)
        : new Set<string>();

      console.log('[useCaktoContacts] Will exclude', alreadySentPhones.size, 'already sent phones');

      // PIX não pago: VERIFICAÇÃO RIGOROSA por email + telefone + external_id
      if (eventType === 'pix_unpaid') {
        // 1. Buscar todos os pix_generated/pix_expired NO PERÍODO
        let pixQuery = supabase
          .from('genesis_cakto_events')
          .select('*')
          .eq('instance_id', instanceId)
          .in('event_type', ['pix_generated', 'pix_expired'])
          .not('customer_phone', 'is', null)
          .gte('created_at', startDateISO)
          .lte('created_at', endDateISO)
          .order('created_at', { ascending: false })
          .limit(1000);

        // Filtrar por produtos selecionados (multi-select)
        if (productIds.length > 0) {
          pixQuery = pixQuery.in('product_id', productIds);
        }

        const { data: pixEvents, error: pixError } = await pixQuery;

        if (pixError) {
          console.error('[useCaktoContacts] PIX fetch error:', pixError);
          throw pixError;
        }

        // 2. Buscar TODOS os purchase_approved para verificação rigorosa (SEM filtro de produto!)
        // IMPORTANTE: Verificar em TODOS os produtos se o cliente pagou em qualquer um
        const { data: approvedEvents, error: approvedError } = await supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, customer_email, created_at, product_id')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved')
          .gte('created_at', subDays(new Date(), 90).toISOString()); // 90 dias para maior cobertura

        if (approvedError) {
          console.error('[useCaktoContacts] Approved fetch error:', approvedError);
          throw approvedError;
        }

        // 3. Criar estruturas para VERIFICAÇÃO RIGOROSA
        const approvedExternalIds = new Set<string>();
        const approvedPhones = new Set<string>();
        const approvedEmails = new Set<string>();
        const approvedPhoneWithDate = new Map<string, Date>();
        const approvedEmailWithDate = new Map<string, Date>();
        
        // Map para rastrear pagamentos por telefone/email (qualquer produto)
        const paidByPhone = new Map<string, { date: Date; productId: string }[]>();
        const paidByEmail = new Map<string, { date: Date; productId: string }[]>();

        (approvedEvents || []).forEach(e => {
          // External ID
          if (e.external_id) {
            approvedExternalIds.add(e.external_id);
          }
          
          // Telefone normalizado
          const normalizedPhone = normalizePhone(e.customer_phone);
          if (normalizedPhone) {
            approvedPhones.add(normalizedPhone);
            const eventDate = new Date(e.created_at);
            const existing = approvedPhoneWithDate.get(normalizedPhone);
            if (!existing || eventDate > existing) {
              approvedPhoneWithDate.set(normalizedPhone, eventDate);
            }
            
            // Rastrear todos os pagamentos deste telefone
            if (!paidByPhone.has(normalizedPhone)) {
              paidByPhone.set(normalizedPhone, []);
            }
            paidByPhone.get(normalizedPhone)!.push({ date: eventDate, productId: e.product_id || '' });
          }
          
          // Email normalizado
          const normalizedEmail = normalizeEmail(e.customer_email);
          if (normalizedEmail) {
            approvedEmails.add(normalizedEmail);
            const eventDate = new Date(e.created_at);
            const existing = approvedEmailWithDate.get(normalizedEmail);
            if (!existing || eventDate > existing) {
              approvedEmailWithDate.set(normalizedEmail, eventDate);
            }
            
            // Rastrear todos os pagamentos deste email
            if (!paidByEmail.has(normalizedEmail)) {
              paidByEmail.set(normalizedEmail, []);
            }
            paidByEmail.get(normalizedEmail)!.push({ date: eventDate, productId: e.product_id || '' });
          }
        });

        console.log('[useCaktoContacts] Approved sets:', {
          externalIds: approvedExternalIds.size,
          phones: approvedPhones.size,
          emails: approvedEmails.size,
        });

        // 4. Filtrar PIX NÃO PAGOS com verificação ULTRA-RIGOROSA
        // Cenário: Cliente gerou PIX, abandonou, gerou outro PIX e PAGOU
        // Solução: Verificar se telefone OU email pagou EM QUALQUER MOMENTO (não só depois do PIX)
        const unpaidContacts: CaktoContact[] = [];
        const seenPhones = new Set<string>(); // DEDUP: por telefone apenas
        const seenNames = new Set<string>(); // DEDUP: por nome normalizado (pega "Raimundo Afonso" duplicado)
        const seenIdentities = new Set<string>(); // DEDUP: por identidade (phone+email)

        console.log('[useCaktoContacts] Processing', (pixEvents || []).length, 'PIX events for ULTRA-RIGOROUS verification');

        let skippedAlreadySent = 0;
        let skippedDuplicatePhone = 0;
        let skippedDuplicateName = 0;
        let skippedPaid = 0;

        for (const event of (pixEvents || [])) {
          const normalizedPhone = normalizePhone(event.customer_phone);
          const normalizedEmail = normalizeEmail(event.customer_email);
          const normalizedNameStr = normalizeName(event.customer_name);
          
          // Criar identidade única baseada em telefone E email
          const identity = `${normalizedPhone}|${normalizedEmail}`;

          // VERIFICAÇÃO 0a: Já processamos este TELEFONE? (mais rigoroso)
          if (normalizedPhone && seenPhones.has(normalizedPhone)) {
            skippedDuplicatePhone++;
            continue;
          }

          // VERIFICAÇÃO 0b: Já processamos este NOME? (pega casos como "Raimundo Afonso" duplicado)
          // Só aplica se o nome tiver pelo menos 5 caracteres para evitar falsos positivos
          if (normalizedNameStr && normalizedNameStr.length >= 5 && seenNames.has(normalizedNameStr)) {
            console.log('[useCaktoContacts] ✗ Skipping - DUPLICATE NAME:', event.customer_name);
            skippedDuplicateName++;
            continue;
          }

          // VERIFICAÇÃO 0c: Já processamos esta identidade (phone+email)?
          if (seenIdentities.has(identity)) {
            continue;
          }

          // VERIFICAÇÃO 1: external_id EXATO já foi aprovado?
          if (event.external_id && approvedExternalIds.has(event.external_id)) {
            console.log('[useCaktoContacts] ✗ Skipping - SAME external_id already paid:', event.external_id);
            seenIdentities.add(identity);
            if (normalizedPhone) seenPhones.add(normalizedPhone);
            skippedPaid++;
            continue;
          }

          // VERIFICAÇÃO 2: telefone JÁ PAGOU em QUALQUER momento (não importa quando)?
          if (normalizedPhone && approvedPhones.has(normalizedPhone)) {
            console.log('[useCaktoContacts] ✗ Skipping - phone HAS PAID (anytime):', normalizedPhone);
            seenIdentities.add(identity);
            seenPhones.add(normalizedPhone);
            skippedPaid++;
            continue;
          }

          // VERIFICAÇÃO 3: email JÁ PAGOU em QUALQUER momento?
          if (normalizedEmail && approvedEmails.has(normalizedEmail)) {
            console.log('[useCaktoContacts] ✗ Skipping - email HAS PAID (anytime):', normalizedEmail);
            seenIdentities.add(identity);
            if (normalizedPhone) seenPhones.add(normalizedPhone);
            skippedPaid++;
            continue;
          }

          // VERIFICAÇÃO 4: Evitar duplicatas por telefone apenas (fallback)
          if (!normalizedPhone) {
            continue;
          }

          // VERIFICAÇÃO 5: Telefone JÁ FOI ENVIADO em campanha anterior?
          if (alreadySentPhones.has(normalizedPhone)) {
            console.log('[useCaktoContacts] ✗ Skipping - phone ALREADY SENT in campaign:', normalizedPhone);
            seenIdentities.add(identity);
            seenPhones.add(normalizedPhone);
            skippedAlreadySent++;
            continue;
          }

          // Marcar como processado
          seenIdentities.add(identity);
          seenPhones.add(normalizedPhone);
          if (normalizedNameStr && normalizedNameStr.length >= 5) {
            seenNames.add(normalizedNameStr);
          }

          // Formatar data precisa
          const eventDate = new Date(event.created_at);
          const formattedDate = format(eventDate, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

          // Validar DDD brasileiro
          const dddValidation = validateBrazilianDDD(normalizedPhone);

          unpaidContacts.push({
            phone: normalizedPhone,
            name: event.customer_name || null,
            email: event.customer_email || null,
            productName: event.product_name || null,
            productId: event.product_id || null,
            orderValue: event.order_value || null,
            eventDate: event.created_at,
            formattedDate,
            externalId: event.external_id || event.id,
            paymentStatus: 'unpaid', // ✓ Confirmado AGUARDANDO PAGAMENTO!
            isValidDDD: dddValidation.isValid,
            dddError: dddValidation.error,
          });
        }

        console.log('[useCaktoContacts] Dedup stats:', {
          skippedAlreadySent,
          skippedDuplicatePhone,
          skippedDuplicateName,
          skippedPaid,
        });

        console.log('[useCaktoContacts] ✓ Found', unpaidContacts.length, 'VERIFIED unpaid PIX contacts (excludes sent + duplicates)');
        setContacts(unpaidContacts);
        return unpaidContacts;
      }

      // ABANDONADOS: Verificação rigorosa (excluir quem já pagou depois)
      if (eventType === 'checkout_abandonment') {
        // 1. Buscar todos os checkouts abandonados NO PERÍODO
        let abandonQuery = supabase
          .from('genesis_cakto_events')
          .select('*')
          .eq('instance_id', instanceId)
          .in('event_type', ['checkout_abandonment', 'initiate_checkout'])
          .not('customer_phone', 'is', null)
          .gte('created_at', startDateISO)
          .lte('created_at', endDateISO)
          .order('created_at', { ascending: false })
          .limit(1000);

        if (productIds.length > 0) {
          abandonQuery = abandonQuery.in('product_id', productIds);
        }

        const { data: abandonEvents, error: abandonError } = await abandonQuery;

        if (abandonError) {
          console.error('[useCaktoContacts] Abandon fetch error:', abandonError);
          throw abandonError;
        }

        // 2. Buscar TODOS os purchase_approved para verificar quem já pagou
        const { data: approvedEvents, error: approvedError } = await supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, customer_email, created_at, product_id')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved')
          .gte('created_at', subDays(new Date(), 90).toISOString());

        if (approvedError) {
          console.error('[useCaktoContacts] Approved fetch error:', approvedError);
          throw approvedError;
        }

        // 3. Criar sets de quem já pagou
        const approvedPhones = new Set<string>();
        const approvedEmails = new Set<string>();

        (approvedEvents || []).forEach(e => {
          const normalizedPhone = normalizePhone(e.customer_phone);
          const normalizedEmail = normalizeEmail(e.customer_email);
          if (normalizedPhone) approvedPhones.add(normalizedPhone);
          if (normalizedEmail) approvedEmails.add(normalizedEmail);
        });

        // 4. Filtrar abandonados que NÃO pagaram depois
        const abandonedContacts: CaktoContact[] = [];
        const seenPhones = new Set<string>();
        const seenNames = new Set<string>();
        let skippedAlreadySent = 0;
        let skippedPaid = 0;
        let skippedDuplicate = 0;

        for (const event of (abandonEvents || [])) {
          const normalizedPhone = normalizePhone(event.customer_phone);
          const normalizedEmail = normalizeEmail(event.customer_email);
          const normalizedNameStr = normalizeName(event.customer_name);

          if (!normalizedPhone) continue;

          // Verificar duplicata por telefone
          if (seenPhones.has(normalizedPhone)) {
            skippedDuplicate++;
            continue;
          }

          // Verificar duplicata por nome
          if (normalizedNameStr && normalizedNameStr.length >= 5 && seenNames.has(normalizedNameStr)) {
            skippedDuplicate++;
            continue;
          }

          // Verificar se JÁ PAGOU
          if (approvedPhones.has(normalizedPhone) || (normalizedEmail && approvedEmails.has(normalizedEmail))) {
            skippedPaid++;
            continue;
          }

          // Verificar se já foi enviado
          if (alreadySentPhones.has(normalizedPhone)) {
            skippedAlreadySent++;
            continue;
          }

          seenPhones.add(normalizedPhone);
          if (normalizedNameStr && normalizedNameStr.length >= 5) {
            seenNames.add(normalizedNameStr);
          }

          const eventDate = new Date(event.created_at);
          const formattedDate = format(eventDate, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
          const dddValidation = validateBrazilianDDD(normalizedPhone);

          abandonedContacts.push({
            phone: normalizedPhone,
            name: event.customer_name || null,
            email: event.customer_email || null,
            productName: event.product_name || null,
            productId: event.product_id || null,
            orderValue: event.order_value || null,
            eventDate: event.created_at,
            formattedDate,
            externalId: event.external_id || event.id,
            paymentStatus: 'unpaid',
            isValidDDD: dddValidation.isValid,
            dddError: dddValidation.error,
          });
        }

        console.log('[useCaktoContacts] Abandon stats:', { skippedAlreadySent, skippedPaid, skippedDuplicate });
        console.log('[useCaktoContacts] ✓ Found', abandonedContacts.length, 'VERIFIED abandoned contacts');
        setContacts(abandonedContacts);
        return abandonedContacts;
      }

      // Outros eventos: busca direta com deduplicação
      let query = supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('event_type', eventType)
        .not('customer_phone', 'is', null)
        .gte('created_at', startDateISO)
        .lte('created_at', endDateISO)
        .order('created_at', { ascending: false })
        .limit(500);

      if (productIds.length > 0) {
        query = query.in('product_id', productIds);
      }

      const { data: events, error: eventsError } = await query;

      if (eventsError) {
        console.error('[useCaktoContacts] Events fetch error:', eventsError);
        throw eventsError;
      }

      // Deduplicar por telefone normalizado + nome + excluir já enviados
      const seenPhones = new Set<string>();
      const seenNames = new Set<string>(); // DEDUP: por nome normalizado
      const uniqueContacts: CaktoContact[] = [];
      let skippedSent = 0;
      let skippedDuplicatePhone = 0;
      let skippedDuplicateName = 0;

      for (const event of (events || [])) {
        const normalizedPhone = normalizePhone(event.customer_phone);
        const normalizedNameStr = normalizeName(event.customer_name);
        
        if (!normalizedPhone) continue;

        // Verificar duplicata por telefone
        if (seenPhones.has(normalizedPhone)) {
          skippedDuplicatePhone++;
          continue;
        }
        
        // Verificar duplicata por nome (mínimo 5 chars)
        if (normalizedNameStr && normalizedNameStr.length >= 5 && seenNames.has(normalizedNameStr)) {
          console.log('[useCaktoContacts] ✗ Skipping - DUPLICATE NAME:', event.customer_name);
          skippedDuplicateName++;
          continue;
        }
        
        // Verificar se já foi enviado em campanha anterior
        if (alreadySentPhones.has(normalizedPhone)) {
          skippedSent++;
          continue;
        }
        
        seenPhones.add(normalizedPhone);
        if (normalizedNameStr && normalizedNameStr.length >= 5) {
          seenNames.add(normalizedNameStr);
        }
        
        const eventDateObj = new Date(event.created_at);
        const formattedDate = format(eventDateObj, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
        
        // Validar DDD brasileiro
        const dddValidation = validateBrazilianDDD(normalizedPhone);
        
        uniqueContacts.push({
          phone: normalizedPhone,
          name: event.customer_name || null,
          email: event.customer_email || null,
          productName: event.product_name || null,
          productId: event.product_id || null,
          orderValue: event.order_value || null,
          eventDate: event.created_at,
          formattedDate,
          externalId: event.external_id || event.id,
          paymentStatus: eventType === 'purchase_approved' ? 'paid' : 'unknown',
          isValidDDD: dddValidation.isValid,
          dddError: dddValidation.error,
        });
      }

      console.log('[useCaktoContacts] Found', uniqueContacts.length, 'unique contacts for', eventType, '(skipped:', skippedDuplicatePhone + skippedDuplicateName, 'duplicates,', skippedSent, 'already sent)');
      setContacts(uniqueContacts);
      return uniqueContacts;
    } catch (err) {
      console.error('[useCaktoContacts] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar contatos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contacts,
    products,
    loading,
    error,
    fetchContacts,
    fetchProducts,
  };
}
