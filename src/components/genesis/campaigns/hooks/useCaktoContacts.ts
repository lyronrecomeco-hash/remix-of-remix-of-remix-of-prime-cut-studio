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

        // 2. Buscar TODOS os purchase_approved para verificação rigorosa (últimos 60 dias)
        let approvedQuery = supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, customer_email, created_at')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved')
          .gte('created_at', subDays(new Date(), 60).toISOString());

        if (productIds.length > 0) {
          approvedQuery = approvedQuery.in('product_id', productIds);
        }

        const { data: approvedEvents, error: approvedError } = await approvedQuery;

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
          }
        });

        console.log('[useCaktoContacts] Approved sets:', {
          externalIds: approvedExternalIds.size,
          phones: approvedPhones.size,
          emails: approvedEmails.size,
        });

        // 4. Filtrar PIX NÃO PAGOS com verificação TRIPLA
        const unpaidContacts: CaktoContact[] = [];
        const seenPhones = new Set<string>();

        for (const event of (pixEvents || [])) {
          const normalizedPhone = normalizePhone(event.customer_phone);
          const normalizedEmail = normalizeEmail(event.customer_email);
          const eventDate = new Date(event.created_at);

          // VERIFICAÇÃO 1: external_id já foi aprovado?
          if (event.external_id && approvedExternalIds.has(event.external_id)) {
            console.log('[useCaktoContacts] Skipping - external_id paid:', event.external_id);
            continue;
          }

          // VERIFICAÇÃO 2: telefone gerou novo PIX e pagou depois?
          if (normalizedPhone) {
            const approvedDate = approvedPhoneWithDate.get(normalizedPhone);
            if (approvedDate && approvedDate > eventDate) {
              console.log('[useCaktoContacts] Skipping - phone paid later:', normalizedPhone);
              continue;
            }
          }

          // VERIFICAÇÃO 3: email gerou novo PIX e pagou depois?
          if (normalizedEmail) {
            const approvedDate = approvedEmailWithDate.get(normalizedEmail);
            if (approvedDate && approvedDate > eventDate) {
              console.log('[useCaktoContacts] Skipping - email paid later:', normalizedEmail);
              continue;
            }
          }

          // Evitar duplicatas por telefone
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
            paymentStatus: 'unpaid', // Confirmado não pago!
          });
        }

        console.log('[useCaktoContacts] Found', unpaidContacts.length, 'VERIFIED unpaid PIX contacts');
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
