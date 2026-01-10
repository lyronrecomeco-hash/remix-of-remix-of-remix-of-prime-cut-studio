/**
 * USE CAKTO CONTACTS - Hook para extrair contatos PRECISOS de eventos Cakto
 * Suporta PIX não pago com VERIFICAÇÃO RIGOROSA por email + telefone + external_id
 * Suporta MULTI-SELECT de produtos e PERÍODO DE DATAS
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
}

// Função para obter range de datas padrão (últimos 2 dias)
export const getDefaultDateRange = (): DateRange => ({
  startDate: startOfDay(subDays(new Date(), 2)),
  endDate: endOfDay(new Date()),
});

// Normalizar telefone para comparação rigorosa
const normalizePhone = (phone: string | null): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-11); // Últimos 11 dígitos
};

// Normalizar email para comparação rigorosa
const normalizeEmail = (email: string | null): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

export function useCaktoContacts() {
  const [contacts, setContacts] = useState<CaktoContact[]>([]);
  const [products, setProducts] = useState<CaktoProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        dateRange: { start: startDateISO, end: endDateISO }
      });

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

        // 4. Filtrar PIX NÃO PAGOS com verificação RIGOROSA
        const unpaidContacts: CaktoContact[] = [];
        const seenPhones = new Set<string>();

        console.log('[useCaktoContacts] Processing', (pixEvents || []).length, 'PIX events for verification');

        for (const event of (pixEvents || [])) {
          const normalizedPhone = normalizePhone(event.customer_phone);
          const normalizedEmail = normalizeEmail(event.customer_email);
          const eventDate = new Date(event.created_at);
          const eventProductId = event.product_id || '';

          // VERIFICAÇÃO 1: external_id EXATO já foi aprovado?
          if (event.external_id && approvedExternalIds.has(event.external_id)) {
            console.log('[useCaktoContacts] ✗ Skipping - SAME external_id already paid:', event.external_id);
            continue;
          }

          // VERIFICAÇÃO 2: telefone pagou DEPOIS de gerar este PIX?
          // Verifica se o mesmo telefone tem um pagamento para o MESMO produto APÓS este PIX
          let phonePaidLater = false;
          if (normalizedPhone && paidByPhone.has(normalizedPhone)) {
            const payments = paidByPhone.get(normalizedPhone)!;
            for (const payment of payments) {
              // Pagou o mesmo produto depois de gerar o PIX
              if (payment.productId === eventProductId && payment.date > eventDate) {
                phonePaidLater = true;
                console.log('[useCaktoContacts] ✗ Skipping - phone paid SAME product later:', normalizedPhone, eventProductId);
                break;
              }
              // Ou pagou qualquer produto depois (pode ser segunda compra)
              if (payment.date > eventDate) {
                // Verificar se gerou PIX novamente para outro produto e pagou esse
                phonePaidLater = true;
                console.log('[useCaktoContacts] ✗ Skipping - phone paid ANY product later:', normalizedPhone);
                break;
              }
            }
          }
          if (phonePaidLater) continue;

          // VERIFICAÇÃO 3: email pagou DEPOIS de gerar este PIX?
          let emailPaidLater = false;
          if (normalizedEmail && paidByEmail.has(normalizedEmail)) {
            const payments = paidByEmail.get(normalizedEmail)!;
            for (const payment of payments) {
              if (payment.date > eventDate) {
                emailPaidLater = true;
                console.log('[useCaktoContacts] ✗ Skipping - email paid later:', normalizedEmail);
                break;
              }
            }
          }
          if (emailPaidLater) continue;

          // VERIFICAÇÃO 4: Evitar duplicatas por telefone (manter apenas o mais recente)
          if (!normalizedPhone || seenPhones.has(normalizedPhone)) {
            continue;
          }
          seenPhones.add(normalizedPhone);

          // Formatar data precisa
          const formattedDate = format(eventDate, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

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
          });
        }

        console.log('[useCaktoContacts] ✓ Found', unpaidContacts.length, 'VERIFIED unpaid PIX contacts (zero duplicates)');
        setContacts(unpaidContacts);
        return unpaidContacts;
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

      // Deduplicar por telefone normalizado
      const seenPhones = new Set<string>();
      const uniqueContacts: CaktoContact[] = [];

      for (const event of (events || [])) {
        const normalizedPhone = normalizePhone(event.customer_phone);
        
        if (normalizedPhone && !seenPhones.has(normalizedPhone)) {
          seenPhones.add(normalizedPhone);
          
          const eventDateObj = new Date(event.created_at);
          const formattedDate = format(eventDateObj, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
          
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
          });
        }
      }

      console.log('[useCaktoContacts] Found', uniqueContacts.length, 'unique contacts for', eventType);
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
