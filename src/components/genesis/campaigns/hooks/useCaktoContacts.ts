/**
 * USE CAKTO CONTACTS - Hook para extrair contatos de eventos Cakto
 * Suporta PIX não pago e outros eventos
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CaktoContact {
  phone: string;
  name?: string;
  email?: string;
  productName?: string;
  orderValue?: number;
  eventDate?: string;
  externalId?: string;
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
  }: UseCaktoContactsOptions) => {
    setLoading(true);
    setError(null);
    setContacts([]);

    try {
      // PIX não pago: lógica especial para verificar quais PIX não foram pagos
      if (eventType === 'pix_unpaid') {
        // 1. Buscar todos os pix_generated e pix_expired
        const { data: pixEvents, error: pixError } = await supabase
          .from('genesis_cakto_events')
          .select('*')
          .eq('instance_id', instanceId)
          .in('event_type', ['pix_generated', 'pix_expired', 'purchase_refused'])
          .not('customer_phone', 'is', null)
          .order('created_at', { ascending: false });

        if (pixError) throw pixError;

        // 2. Buscar todos os purchase_approved
        const { data: approvedEvents, error: approvedError } = await supabase
          .from('genesis_cakto_events')
          .select('external_id, customer_phone, created_at')
          .eq('instance_id', instanceId)
          .eq('event_type', 'purchase_approved');

        if (approvedError) throw approvedError;

        // 3. Criar sets para verificação
        const approvedExternalIds = new Set(approvedEvents?.map(e => e.external_id) || []);
        const approvedPhoneMap = new Map<string, Date>();
        
        (approvedEvents || []).forEach(e => {
          if (e.customer_phone) {
            const date = new Date(e.created_at);
            const existing = approvedPhoneMap.get(e.customer_phone);
            if (!existing || date > existing) {
              approvedPhoneMap.set(e.customer_phone, date);
            }
          }
        });

        // 4. Filtrar PIX não pagos
        const unpaidContacts: CaktoContact[] = [];
        const seenPhones = new Set<string>();

        (pixEvents || []).forEach(event => {
          // Já aprovado pelo external_id?
          if (approvedExternalIds.has(event.external_id)) return;

          // Já aprovado posteriormente pelo telefone?
          if (event.customer_phone) {
            const approvedDate = approvedPhoneMap.get(event.customer_phone);
            if (approvedDate && approvedDate > new Date(event.created_at)) {
              return;
            }
          }

          // Evitar duplicatas de telefone
          if (event.customer_phone && seenPhones.has(event.customer_phone)) return;
          if (event.customer_phone) seenPhones.add(event.customer_phone);

          unpaidContacts.push({
            phone: event.customer_phone!,
            name: event.customer_name || undefined,
            email: event.customer_email || undefined,
            productName: event.product_name || undefined,
            orderValue: event.order_value || undefined,
            eventDate: event.created_at,
            externalId: event.external_id,
          });
        });

        setContacts(unpaidContacts);
        return unpaidContacts;
      }

      // Outros eventos: busca direta
      const { data: events, error: eventsError } = await supabase
        .from('genesis_cakto_events')
        .select('*')
        .eq('instance_id', instanceId)
        .eq('event_type', eventType)
        .not('customer_phone', 'is', null)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Deduplicar por telefone
      const seenPhones = new Set<string>();
      const uniqueContacts: CaktoContact[] = [];

      (events || []).forEach(event => {
        if (event.customer_phone && !seenPhones.has(event.customer_phone)) {
          seenPhones.add(event.customer_phone);
          uniqueContacts.push({
            phone: event.customer_phone,
            name: event.customer_name || undefined,
            email: event.customer_email || undefined,
            productName: event.product_name || undefined,
            orderValue: event.order_value || undefined,
            eventDate: event.created_at,
            externalId: event.external_id,
          });
        }
      });

      setContacts(uniqueContacts);
      return uniqueContacts;
    } catch (err) {
      console.error('[useCaktoContacts] Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar contatos');
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
