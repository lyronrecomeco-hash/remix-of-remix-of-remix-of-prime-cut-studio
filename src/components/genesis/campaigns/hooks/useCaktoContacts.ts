/**
 * USE CAKTO CONTACTS - Hook para extrair contatos PRECISOS de eventos Cakto
 * Suporta PIX não pago e outros eventos com deduplicação rigorosa
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CaktoContact {
  phone: string;
  name: string | null;
  email: string | null;
  productName: string | null;
  orderValue: number | null;
  eventDate: string;
  externalId: string;
}

interface UseCaktoContactsOptions {
  instanceId: string;
  integrationId: string;
  eventType: string;
}

export function useCaktoContacts() {
  const [contacts, setContacts] = useState<CaktoContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async ({ 
    instanceId, 
    integrationId, 
    eventType 
  }: UseCaktoContactsOptions): Promise<CaktoContact[]> => {
    setLoading(true);
    setError(null);
    setContacts([]);

    try {
      console.log('[useCaktoContacts] Fetching contacts for:', { instanceId, eventType });

      // PIX não pago: lógica especial para verificar quais PIX não foram pagos
      if (eventType === 'pix_unpaid') {
        // 1. Buscar todos os pix_generated com telefone válido
        const { data: pixEvents, error: pixError } = await supabase
          .from('genesis_cakto_events')
          .select('*')
          .eq('instance_id', instanceId)
          .in('event_type', ['pix_generated', 'pix_expired'])
          .not('customer_phone', 'is', null)
          .order('created_at', { ascending: false });

        if (pixError) {
          console.error('[useCaktoContacts] PIX fetch error:', pixError);
          throw pixError;
        }

        // 2. Buscar todos os purchase_approved para cruzamento
        const { data: approvedEvents, error: approvedError } = await supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, created_at')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved');

        if (approvedError) {
          console.error('[useCaktoContacts] Approved fetch error:', approvedError);
          throw approvedError;
        }

        // 3. Criar sets e maps para verificação PRECISA
        const approvedExternalIds = new Set(
          (approvedEvents || []).map(e => e.external_id).filter(Boolean)
        );
        
        const approvedPhoneMap = new Map<string, Date>();
        (approvedEvents || []).forEach(e => {
          if (e.customer_phone) {
            const eventDate = new Date(e.created_at);
            const existing = approvedPhoneMap.get(e.customer_phone);
            if (!existing || eventDate > existing) {
              approvedPhoneMap.set(e.customer_phone, eventDate);
            }
          }
        });

        // 4. Filtrar PIX não pagos - SEM DUPLICATAS
        const unpaidContacts: CaktoContact[] = [];
        const seenPhones = new Set<string>();

        for (const event of (pixEvents || [])) {
          // Verificar se já foi aprovado pelo external_id
          if (event.external_id && approvedExternalIds.has(event.external_id)) {
            continue;
          }

          // Verificar se há aprovação posterior pelo telefone
          if (event.customer_phone) {
            const normalizedPhone = event.customer_phone.replace(/\D/g, '');
            
            const approvedDate = approvedPhoneMap.get(event.customer_phone);
            if (approvedDate && approvedDate > new Date(event.created_at)) {
              continue;
            }

            // Evitar duplicatas por telefone normalizado
            if (seenPhones.has(normalizedPhone)) {
              continue;
            }
            seenPhones.add(normalizedPhone);

            unpaidContacts.push({
              phone: normalizedPhone,
              name: event.customer_name || null,
              email: event.customer_email || null,
              productName: event.product_name || null,
              orderValue: event.order_value || null,
              eventDate: event.created_at,
              externalId: event.external_id || event.id,
            });
          }
        }

        console.log('[useCaktoContacts] Found', unpaidContacts.length, 'unpaid PIX contacts');
        setContacts(unpaidContacts);
        return unpaidContacts;
      }

      // Outros eventos: busca direta com deduplicação
      const { data: events, error: eventsError } = await supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('event_type', eventType)
        .not('customer_phone', 'is', null)
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('[useCaktoContacts] Events fetch error:', eventsError);
        throw eventsError;
      }

      // Deduplicar por telefone normalizado
      const seenPhones = new Set<string>();
      const uniqueContacts: CaktoContact[] = [];

      for (const event of (events || [])) {
        if (event.customer_phone) {
          const normalizedPhone = event.customer_phone.replace(/\D/g, '');
          
          if (!seenPhones.has(normalizedPhone)) {
            seenPhones.add(normalizedPhone);
            uniqueContacts.push({
              phone: normalizedPhone,
              name: event.customer_name || null,
              email: event.customer_email || null,
              productName: event.product_name || null,
              orderValue: event.order_value || null,
              eventDate: event.created_at,
              externalId: event.external_id || event.id,
            });
          }
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
    loading,
    error,
    fetchContacts,
  };
}
