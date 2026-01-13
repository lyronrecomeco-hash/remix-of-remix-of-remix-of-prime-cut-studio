import { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  Shield, 
  MessageSquare, 
  Zap, 
  Save,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProspectSettings as SettingsType } from './types';
import { supabase } from '@/integrations/supabase/client';

interface ProspectSettingsProps {
  settings: SettingsType | null;
  onSave: (settings: Partial<SettingsType>) => Promise<boolean>;
  affiliateId: string;
}

interface GenesisInstance {
  id: string;
  instance_name: string;
  phone_number: string | null;
  status: string;
}

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

const DEFAULT_TEMPLATE = `Olá! Vi que sua empresa {company_name} pode se beneficiar de automações inteligentes. Preparei uma proposta exclusiva para vocês! 

📊 *Análise Gratuita:*
{analysis_summary}

🚀 *Proposta:*
{proposal_link}

Posso te explicar mais sobre como isso pode aumentar suas vendas?`;

export const ProspectSettingsComponent = ({ settings, onSave, affiliateId }: ProspectSettingsProps) => {
  const [saving, setSaving] = useState(false);
  const [instances, setInstances] = useState<GenesisInstance[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(true);
  
  const [form, setForm] = useState({
    auto_send_enabled: settings?.auto_send_enabled ?? false,
    genesis_instance_id: settings?.genesis_instance_id ?? '',
    send_start_hour: settings?.send_start_hour ?? 8,
    send_end_hour: settings?.send_end_hour ?? 20,
    send_days: settings?.send_days ?? [1, 2, 3, 4, 5],
    daily_limit: settings?.daily_limit ?? 50,
    messages_per_hour: settings?.messages_per_hour ?? 10,
    min_delay_seconds: settings?.min_delay_seconds ?? 30,
    max_delay_seconds: settings?.max_delay_seconds ?? 120,
    warmup_enabled: settings?.warmup_enabled ?? true,
    warmup_day: settings?.warmup_day ?? 1,
    warmup_increment_percent: settings?.warmup_increment_percent ?? 20,
    message_template: settings?.message_template ?? DEFAULT_TEMPLATE,
    include_proposal_link: settings?.include_proposal_link ?? true,
    include_analysis: settings?.include_analysis ?? true,
  });

  useEffect(() => {
    fetchInstances();
  }, []);

  useEffect(() => {
    if (settings) {
      setForm({
        auto_send_enabled: settings.auto_send_enabled,
        genesis_instance_id: settings.genesis_instance_id ?? '',
        send_start_hour: settings.send_start_hour,
        send_end_hour: settings.send_end_hour,
        send_days: settings.send_days,
        daily_limit: settings.daily_limit,
        messages_per_hour: settings.messages_per_hour,
        min_delay_seconds: settings.min_delay_seconds,
        max_delay_seconds: settings.max_delay_seconds,
        warmup_enabled: settings.warmup_enabled,
        warmup_day: settings.warmup_day,
        warmup_increment_percent: settings.warmup_increment_percent,
        message_template: settings.message_template,
        include_proposal_link: settings.include_proposal_link,
        include_analysis: settings.include_analysis,
      });
    }
  }, [settings]);

  const fetchInstances = async () => {
    try {
      // Buscar instâncias do usuário via affiliates
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('user_id')
        .eq('id', affiliateId)
        .single();

      if (!affiliate?.user_id) return;

      const { data } = await supabase
        .from('genesis_instances')
        .select('id, name, phone_number, status')
        .eq('user_id', affiliate.user_id)
        .eq('status', 'connected');

      const mapped = (data || []).map(d => ({
        id: d.id,
        instance_name: d.name,
        phone_number: d.phone_number,
        status: d.status,
      }));
      setInstances(mapped);
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
    } finally {
      setLoadingInstances(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const toggleDay = (day: number) => {
    setForm(f => ({
      ...f,
      send_days: f.send_days.includes(day)
        ? f.send_days.filter(d => d !== day)
        : [...f.send_days, day].sort()
    }));
  };

  const effectiveLimit = form.warmup_enabled
    ? Math.ceil(form.daily_limit * (form.warmup_day * form.warmup_increment_percent) / 100)
    : form.daily_limit;

  return (
    <div className="space-y-6">
      {/* Alerta Anti-Ban */}
      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-sm">
          <strong>Proteção Anti-Ban:</strong> Configure os limites corretamente para evitar bloqueios no WhatsApp.
          Recomendamos começar com poucos envios e aumentar gradualmente.
        </AlertDescription>
      </Alert>

      {/* Instância WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Instância WhatsApp
          </CardTitle>
          <CardDescription>
            Selecione a instância Genesis para enviar as propostas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto_send">Envio Automático</Label>
            <Switch
              id="auto_send"
              checked={form.auto_send_enabled}
              onCheckedChange={(v) => setForm(f => ({ ...f, auto_send_enabled: v }))}
            />
          </div>

          <div>
            <Label>Instância para Envio</Label>
            {loadingInstances ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : instances.length === 0 ? (
              <p className="text-sm text-yellow-500">
                Nenhuma instância conectada. Conecte uma instância no painel Genesis.
              </p>
            ) : (
              <Select
                value={form.genesis_instance_id}
                onValueChange={(v) => setForm(f => ({ ...f, genesis_instance_id: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma instância" />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.instance_name} {inst.phone_number && `(${inst.phone_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-primary" />
            Horários de Envio
          </CardTitle>
          <CardDescription>
            Configure quando as propostas podem ser enviadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Início</Label>
              <Select
                value={String(form.send_start_hour)}
                onValueChange={(v) => setForm(f => ({ ...f, send_start_hour: parseInt(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fim</Label>
              <Select
                value={String(form.send_end_hour)}
                onValueChange={(v) => setForm(f => ({ ...f, send_end_hour: parseInt(v) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Dias da Semana</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Badge
                  key={day.value}
                  variant={form.send_days.includes(day.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limites Anti-Ban */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Limites Anti-Ban
          </CardTitle>
          <CardDescription>
            Configure os limites para proteger seu número
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Limite Diário: {form.daily_limit}</Label>
              <Badge variant="outline">Efetivo: {effectiveLimit}</Badge>
            </div>
            <Slider
              value={[form.daily_limit]}
              onValueChange={([v]) => setForm(f => ({ ...f, daily_limit: v }))}
              min={10}
              max={200}
              step={5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado: 30-50 para números novos
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Mensagens por Hora: {form.messages_per_hour}</Label>
            <Slider
              value={[form.messages_per_hour]}
              onValueChange={([v]) => setForm(f => ({ ...f, messages_per_hour: v }))}
              min={3}
              max={30}
              step={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Delay Mínimo (seg)</Label>
              <Input
                type="number"
                value={form.min_delay_seconds}
                onChange={(e) => setForm(f => ({ ...f, min_delay_seconds: parseInt(e.target.value) || 30 }))}
                min={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Delay Máximo (seg)</Label>
              <Input
                type="number"
                value={form.max_delay_seconds}
                onChange={(e) => setForm(f => ({ ...f, max_delay_seconds: parseInt(e.target.value) || 120 }))}
                min={30}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Warm-up Gradual</Label>
                <p className="text-xs text-muted-foreground">
                  Aumenta o limite aos poucos para aquecer o número
                </p>
              </div>
              <Switch
                checked={form.warmup_enabled}
                onCheckedChange={(v) => setForm(f => ({ ...f, warmup_enabled: v }))}
              />
            </div>

            {form.warmup_enabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                <div>
                  <Label>Dia do Warm-up</Label>
                  <Input
                    type="number"
                    value={form.warmup_day}
                    onChange={(e) => setForm(f => ({ ...f, warmup_day: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={30}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Incremento (%)</Label>
                  <Input
                    type="number"
                    value={form.warmup_increment_percent}
                    onChange={(e) => setForm(f => ({ ...f, warmup_increment_percent: parseInt(e.target.value) || 20 }))}
                    min={10}
                    max={50}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Template da Mensagem
          </CardTitle>
          <CardDescription>
            Personalize a mensagem enviada (use variáveis entre chaves)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={form.message_template}
            onChange={(e) => setForm(f => ({ ...f, message_template: e.target.value }))}
            rows={8}
            className="font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{'{company_name}'}</Badge>
            <Badge variant="secondary">{'{company_city}'}</Badge>
            <Badge variant="secondary">{'{niche}'}</Badge>
            <Badge variant="secondary">{'{analysis_summary}'}</Badge>
            <Badge variant="secondary">{'{proposal_link}'}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label>Incluir link da proposta</Label>
            <Switch
              checked={form.include_proposal_link}
              onCheckedChange={(v) => setForm(f => ({ ...f, include_proposal_link: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <Save className="w-4 h-4" />
        {saving ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
};
