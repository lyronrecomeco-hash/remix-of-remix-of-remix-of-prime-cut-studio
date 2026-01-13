import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Lock, Clock, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecuritySettingsData {
  require_strong_password: boolean;
  min_password_length: number;
  require_uppercase: boolean;
  require_number: boolean;
  require_special_char: boolean;
  hide_phone_partially: boolean;
  phone_visible_digits: number;
  session_timeout_minutes: number;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
}

const defaultSettings: SecuritySettingsData = {
  require_strong_password: true,
  min_password_length: 8,
  require_uppercase: true,
  require_number: true,
  require_special_char: false,
  hide_phone_partially: true,
  phone_visible_digits: 4,
  session_timeout_minutes: 480,
  max_failed_attempts: 5,
  lockout_duration_minutes: 30,
};

export function SecuritySettings() {
  const { genesisUser } = useGenesisAuth();
  const [settings, setSettings] = useState<SecuritySettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (genesisUser) fetchSettings();
  }, [genesisUser]);

  const fetchSettings = async () => {
    if (!genesisUser) return;
    
    const { data, error } = await supabase
      .from('genesis_security_settings')
      .select('*')
      .eq('user_id', genesisUser.id)
      .maybeSingle();

    if (data) {
      setSettings(data as unknown as SecuritySettingsData);
    }
    setLoading(false);
  };

  const updateSetting = <K extends keyof SecuritySettingsData>(key: K, value: SecuritySettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!genesisUser) return;
    setSaving(true);

    const { error } = await supabase
      .from('genesis_security_settings')
      .upsert({
        user_id: genesisUser.id,
        ...settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error('Erro ao salvar configurações');
    } else {
      toast.success('Configurações de segurança salvas!');
      setHasChanges(false);
    }
    setSaving(false);
  };

  // Demo: formato de telefone oculto
  const formatPhoneDemo = (phone: string, visibleDigits: number) => {
    const clean = phone.replace(/\D/g, '');
    const hidden = '*'.repeat(Math.max(0, clean.length - visibleDigits));
    const visible = clean.slice(-visibleDigits);
    return `${hidden}${visible}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Segurança</h2>
            <p className="text-sm text-muted-foreground">Configure políticas de senha e privacidade</p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        )}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Política de Senhas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-primary" />
              Política de Senhas
            </CardTitle>
            <CardDescription>Defina requisitos mínimos para senhas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="strong-password">Exigir senha forte</Label>
              <Switch
                id="strong-password"
                checked={settings.require_strong_password}
                onCheckedChange={(v) => updateSetting('require_strong_password', v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tamanho mínimo: {settings.min_password_length} caracteres</Label>
              <Slider
                value={[settings.min_password_length]}
                onValueChange={([v]) => updateSetting('min_password_length', v)}
                min={6}
                max={16}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase">Exigir letra maiúscula</Label>
              <Switch
                id="uppercase"
                checked={settings.require_uppercase}
                onCheckedChange={(v) => updateSetting('require_uppercase', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="number">Exigir número</Label>
              <Switch
                id="number"
                checked={settings.require_number}
                onCheckedChange={(v) => updateSetting('require_number', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="special">Exigir caractere especial</Label>
              <Switch
                id="special"
                checked={settings.require_special_char}
                onCheckedChange={(v) => updateSetting('require_special_char', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidade de Telefone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {settings.hide_phone_partially ? <EyeOff className="w-5 h-5 text-primary" /> : <Eye className="w-5 h-5 text-primary" />}
              Privacidade de Telefone
            </CardTitle>
            <CardDescription>Oculte parcialmente números de contatos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-phone">Ocultar números parcialmente</Label>
              <Switch
                id="hide-phone"
                checked={settings.hide_phone_partially}
                onCheckedChange={(v) => updateSetting('hide_phone_partially', v)}
              />
            </div>

            {settings.hide_phone_partially && (
              <>
                <div className="space-y-2">
                  <Label>Dígitos visíveis: {settings.phone_visible_digits}</Label>
                  <Slider
                    value={[settings.phone_visible_digits]}
                    onValueChange={([v]) => updateSetting('phone_visible_digits', v)}
                    min={2}
                    max={8}
                    step={1}
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="text-sm text-muted-foreground">Exemplo: </span>
                  <span className="font-mono font-medium">
                    {formatPhoneDemo('5511999887766', settings.phone_visible_digits)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sessão e Bloqueio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-primary" />
              Sessão
            </CardTitle>
            <CardDescription>Configure timeout e proteção de conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timeout de sessão (minutos)</Label>
              <Input
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value) || 480)}
                min={15}
                max={1440}
              />
              <p className="text-xs text-muted-foreground">
                Sessão expira após {Math.round(settings.session_timeout_minutes / 60)}h de inatividade
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Proteção contra Ataques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Proteção de Conta
            </CardTitle>
            <CardDescription>Bloqueio após tentativas falhas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Máximo de tentativas falhas</Label>
              <Input
                type="number"
                value={settings.max_failed_attempts}
                onChange={(e) => updateSetting('max_failed_attempts', parseInt(e.target.value) || 5)}
                min={3}
                max={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Duração do bloqueio (minutos)</Label>
              <Input
                type="number"
                value={settings.lockout_duration_minutes}
                onChange={(e) => updateSetting('lockout_duration_minutes', parseInt(e.target.value) || 30)}
                min={5}
                max={120}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Conta bloqueada por {settings.lockout_duration_minutes} minutos após {settings.max_failed_attempts} tentativas falhas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
