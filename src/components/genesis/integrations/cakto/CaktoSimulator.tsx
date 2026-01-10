/**
 * CAKTO SIMULATOR - Simula eventos para teste
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { CaktoEventType, CAKTO_EVENT_LABELS } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CaktoSimulatorProps {
  instanceId: string;
  integrationId?: string;
}

export function CaktoSimulator({ instanceId, integrationId }: CaktoSimulatorProps) {
  const [eventType, setEventType] = useState<CaktoEventType>('purchase_approved');
  const [customerName, setCustomerName] = useState('João Silva');
  const [customerPhone, setCustomerPhone] = useState('5511999999999');
  const [productName, setProductName] = useState('Curso Premium');
  const [orderValue, setOrderValue] = useState('197.00');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<{ campaign?: string; message?: string } | null>(null);

  const simulate = async () => {
    if (!integrationId) {
      toast.error('Configure a integração primeiro');
      return;
    }

    setSimulating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('cakto-event-simulator', {
        body: {
          instanceId,
          integrationId,
          eventType,
          customer: {
            name: customerName,
            phone: customerPhone,
          },
          product: {
            name: productName,
          },
          orderValue: parseFloat(orderValue) || 0,
        },
      });

      if (error) throw error;

      setResult({
        campaign: data?.campaign_name || 'Nenhuma campanha configurada',
        message: data?.preview_message || 'Mensagem não disponível',
      });

      toast.success('Simulação concluída!');
    } catch (err) {
      toast.error('Erro na simulação');
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-700">Modo Simulação</p>
          <p className="text-sm text-yellow-600">
            Nenhuma mensagem será enviada. Isso serve apenas para visualizar qual campanha seria disparada.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as CaktoEventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CAKTO_EVENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>WhatsApp (E.164)</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Produto</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input 
                type="number" 
                value={orderValue} 
                onChange={(e) => setOrderValue(e.target.value)} 
              />
            </div>

            <Button onClick={simulate} disabled={simulating} className="w-full gap-2">
              {simulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Simular Evento
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Processamento simulado</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Campanha que seria disparada:</Label>
                  <Badge variant="secondary" className="text-sm">{result.campaign}</Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Preview da mensagem:</Label>
                  <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                    {result.message}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  ⚠️ Nenhuma mensagem foi enviada. Nenhum crédito foi consumido.
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Execute uma simulação para ver o resultado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
