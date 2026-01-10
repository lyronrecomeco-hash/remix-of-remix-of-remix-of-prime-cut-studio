/**
 * CAKTO EVENTS LOG - Lista de eventos recebidos
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, CheckCircle2, XCircle, Clock, User, Package } from 'lucide-react';
import { useCaktoEvents } from './hooks/useCaktoEvents';
import { CAKTO_EVENT_LABELS, CAKTO_EVENT_COLORS, CaktoEventType } from './types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CaktoEventsLogProps {
  instanceId: string;
}

export function CaktoEventsLog({ instanceId }: CaktoEventsLogProps) {
  const { events, loading, hasMore, loadMore, refetch } = useCaktoEvents(instanceId);

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Eventos Recebidos</h3>
          <p className="text-sm text-muted-foreground">
            Histórico de webhooks da Cakto
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum evento recebido ainda
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {events.map((event) => {
              const colors = CAKTO_EVENT_COLORS[event.event_type as CaktoEventType];
              return (
                <Card key={event.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${colors?.bg || 'bg-muted'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          {event.processed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`${colors?.bg || ''} ${colors?.text || ''} text-xs`}>
                              {CAKTO_EVENT_LABELS[event.event_type as CaktoEventType] || event.event_type}
                            </Badge>
                            {event.processed && (
                              <Badge variant="secondary" className="text-xs">Processado</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {event.customer_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.customer_name}
                              </span>
                            )}
                            {event.product_name && (
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {event.product_name}
                              </span>
                            )}
                            {event.order_value && (
                              <span className="font-medium text-green-600">
                                {formatCurrency(event.order_value)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {hasMore && (
            <div className="py-4 text-center">
              <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carregar mais'}
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
