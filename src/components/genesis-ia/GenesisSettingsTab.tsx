import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save,
  Loader2,
  MessageSquare,
  Globe,
  Bell,
  Shield,
  Palette,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenesisSettingsTabProps {
  userId: string;
}

interface GenesisSettings {
  // Mensagem base / Proposta
  baseMessage: string;
  proposalTemplate: string;
  includeCompanyName: boolean;
  includeContactName: boolean;
  
  // Notificações
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  
  // Radar
  radarAutoScan: boolean;
  radarInterval: number;
  radarCountries: string[];
  
  // Aparência
  theme: 'dark' | 'light' | 'system';
  compactMode: boolean;
}

const DEFAULT_SETTINGS: GenesisSettings = {
  baseMessage: `Olá {nome_contato}!

Sou da Genesis IA e encontramos sua empresa {nome_empresa} em nossa análise de mercado.

Notamos que há uma grande oportunidade de crescimento para seu negócio através da transformação digital.

Gostaríamos de apresentar uma proposta personalizada que pode aumentar significativamente seus resultados.

Podemos conversar?`,
  proposalTemplate: `# Proposta Comercial - {nome_empresa}

## Análise do Mercado
Com base em nossa análise, identificamos as seguintes oportunidades:

{pontos_analise}

## Solução Proposta
{descricao_solucao}

## Investimento
Valor: R$ {valor_proposta}

## Próximos Passos
1. Reunião de alinhamento
2. Apresentação detalhada
3. Início do projeto

Atenciosamente,
Equipe Genesis IA`,
  includeCompanyName: true,
  includeContactName: true,
  notificationsEnabled: true,
  soundEnabled: true,
  emailNotifications: false,
  radarAutoScan: true,
  radarInterval: 2,
  radarCountries: ['BR'],
  theme: 'dark',
  compactMode: false,
};

const COUNTRIES = [
  { code: 'BR', name: 'Brasil' },
  { code: 'PT', name: 'Portugal' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'Espanha' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
];

export const GenesisSettingsTab = ({ userId }: GenesisSettingsTabProps) => {
  const [settings, setSettings] = useState<GenesisSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('settings')
        .eq('user_id', userId)
        .eq('setting_type', 'genesis_config')
        .maybeSingle();

      if (data?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...(data.settings as Partial<GenesisSettings>) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('user_id', userId)
        .eq('setting_type', 'genesis_config')
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('admin_settings')
          .update({
            settings: JSON.parse(JSON.stringify(settings)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('admin_settings')
          .insert([{
            user_id: userId,
            setting_type: 'genesis_config',
            settings: JSON.parse(JSON.stringify(settings)),
          }]);
        if (error) throw error;
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof GenesisSettings>(key: K, value: GenesisSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Configurações</h2>
            <p className="text-sm text-muted-foreground">Personalize sua experiência no Genesis IA</p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      {/* Mensagem Base */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">Mensagem Base</CardTitle>
              <CardDescription>Template padrão para primeiro contato com leads</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Variáveis disponíveis: {'{nome_contato}'}, {'{nome_empresa}'}, {'{niche}'}
            </Label>
            <Textarea
              value={settings.baseMessage}
              onChange={(e) => updateSetting('baseMessage', e.target.value)}
              placeholder="Escreva sua mensagem base..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.includeCompanyName}
                onCheckedChange={(v) => updateSetting('includeCompanyName', v)}
              />
              <Label className="text-sm">Incluir nome da empresa</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.includeContactName}
                onCheckedChange={(v) => updateSetting('includeContactName', v)}
              />
              <Label className="text-sm">Incluir nome do contato</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template de Proposta */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base">Template de Proposta</CardTitle>
              <CardDescription>Modelo para propostas comerciais geradas automaticamente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Suporta Markdown. Variáveis: {'{nome_empresa}'}, {'{valor_proposta}'}, {'{pontos_analise}'}, {'{descricao_solucao}'}
            </Label>
            <Textarea
              value={settings.proposalTemplate}
              onChange={(e) => updateSetting('proposalTemplate', e.target.value)}
              placeholder="Escreva o template da proposta..."
              className="min-h-[250px] font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid de Configurações Menores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notificações */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Notificações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Notificações ativas</Label>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm">Sons de alerta</Label>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(v) => updateSetting('soundEnabled', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm">Notificações por e-mail</Label>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(v) => updateSetting('emailNotifications', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Radar Global */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Radar Global</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Scan automático</Label>
              <Switch
                checked={settings.radarAutoScan}
                onCheckedChange={(v) => updateSetting('radarAutoScan', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm">Intervalo (minutos)</Label>
              <Select
                value={String(settings.radarInterval)}
                onValueChange={(v) => updateSetting('radarInterval', Number(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 min</SelectItem>
                  <SelectItem value="2">2 min</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Aparência</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-sm">Tema</Label>
              <Select
                value={settings.theme}
                onValueChange={(v) => updateSetting('theme', v as 'dark' | 'light' | 'system')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-sm">Modo compacto</Label>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(v) => updateSetting('compactMode', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Segurança</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Sessão ativa desde: {new Date().toLocaleDateString('pt-BR')}</p>
              <p className="mt-2">ID do usuário: {userId.slice(0, 8)}...</p>
            </div>
            <Separator />
            <Button variant="outline" size="sm" className="w-full">
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
