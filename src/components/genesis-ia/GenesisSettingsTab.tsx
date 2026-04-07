import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save,
  Loader2,
  Bell,
  Shield,
  Globe,
  Palette,
  Lock,
  Bot
} from 'lucide-react';
import { GenesisPasswordModal } from './GenesisPasswordModal';
import { SubscriptionBillingCardIA } from './billing';
import { SiteCustomizationSection } from './settings/SiteCustomizationSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  authUserId: string;
}

interface GenesisSettings {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  radarAutoScan: boolean;
  radarInterval: number;
  radarCountries: string[];
  theme: 'dark' | 'light' | 'system';
  compactMode: boolean;
  botEnabled?: boolean;
  telegramChatId?: string;
}

const DEFAULT_SETTINGS: GenesisSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
  emailNotifications: false,
  radarAutoScan: true,
  radarInterval: 2,
  radarCountries: ['BR'],
  theme: 'dark',
  compactMode: false,
};

type CategoryId = 'billing' | 'notifications' | 'radar' | 'security' | 'site' | 'bot';

const categories = [
  { id: 'billing' as CategoryId, icon: Settings, label: 'Fatura', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'notifications' as CategoryId, icon: Bell, label: 'Notificações', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'radar' as CategoryId, icon: Globe, label: 'Radar', color: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'security' as CategoryId, icon: Shield, label: 'Segurança', color: 'bg-rose-500/20 text-rose-400' },
  { id: 'site' as CategoryId, icon: Palette, label: 'Site', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'bot' as CategoryId, icon: Bot, label: 'Bot Suporte', color: 'bg-blue-500/20 text-blue-400' },
];

export const GenesisSettingsTab = ({ userId, authUserId }: GenesisSettingsTabProps) => {
  const [settings, setSettings] = useState<GenesisSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('billing');
  const [subscription, setSubscription] = useState<{
    plan: string;
    plan_name: string | null;
    status: string;
    started_at: string | null;
    expires_at: string | null;
  } | null>(null);
  const [isPromoUser, setIsPromoUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSubscription();
    checkAdmin();
  }, [userId]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const ADMIN_EMAILS = ['lyronrp@gmail.com', 'santiagoadmin@gmail.com', 'santicanossa1@gmail.com'];
      setIsAdmin(ADMIN_EMAILS.includes(user.email?.toLowerCase() || ''));
    }
  };

  const loadSettings = async () => {
    try {
      const [configResponse, botResponse] = await Promise.all([
        supabase
          .from('admin_settings')
          .select('settings')
          .eq('user_id', authUserId)
          .eq('setting_type', 'genesis_config')
          .maybeSingle(),
        supabase
          .from('admin_settings')
          .select('settings')
          .eq('user_id', authUserId)
          .eq('setting_type', 'telegram_support_bot')
          .maybeSingle(),
      ]);

      const configSettings = (configResponse.data?.settings as Partial<GenesisSettings> | null) ?? null;
      const botSettings = (botResponse.data?.settings as { enabled?: boolean; telegram_chat_id?: string } | null) ?? null;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...(configSettings ?? {}),
        botEnabled: botSettings?.enabled ?? configSettings?.botEnabled ?? false,
        telegramChatId: botSettings?.telegram_chat_id ?? configSettings?.telegramChatId ?? '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const { data } = await supabase
        .from('genesis_subscriptions')
        .select('plan, plan_name, status, started_at, expires_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
        setSubscription({
          ...data,
          status: isExpired ? 'expired' : data.status
        });
      }

      const { data: promoData } = await supabase
        .from('promo_referrals')
        .select('id')
        .eq('referred_user_id', userId)
        .maybeSingle();
      
      setIsPromoUser(!!promoData);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('user_id', authUserId)
        .eq('setting_type', 'genesis_config')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('admin_settings')
          .update({
            settings: JSON.parse(JSON.stringify(settings)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_settings')
          .insert([{
            user_id: authUserId,
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

  const saveBotSettings = async (enabled: boolean, chatId: string) => {
    const payload = {
      user_id: authUserId,
      setting_type: 'telegram_support_bot',
      settings: {
        enabled,
        telegram_chat_id: chatId.trim(),
      },
    };

    const { data: existing, error: existingError } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('user_id', authUserId)
      .eq('setting_type', 'telegram_support_bot')
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.id) {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          settings: payload.settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
      return;
    }

    const { error } = await supabase.from('admin_settings').insert(payload);
    if (error) throw error;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter categories - Site only for admins
  const visibleCategories = categories.filter(c => c.id !== 'site' || isAdmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Configurações</h2>
            <p className="text-sm text-white/50">Personalize sua experiência</p>
          </div>
        </div>
        {activeCategory !== 'site' && (
          <Button onClick={saveSettings} disabled={saving} size="lg" className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        )}
      </div>

      {/* Category Navigation - Side by side like Academia */}
      <div className="overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 sm:gap-2 min-w-max">
          {visibleCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-2.5 border transition-all duration-200 flex-shrink-0 ${
                  isActive 
                    ? 'bg-primary/20 border-primary/40 text-white' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Content */}
      {activeCategory === 'billing' && (
        <div className="space-y-3">
          <SubscriptionBillingCardIA
            userId={userId}
            plan={subscription?.plan || 'free'}
            planName={subscription?.plan_name || undefined}
            status={subscription?.status || 'inactive'}
            startedAt={subscription?.started_at || undefined}
            expiresAt={subscription?.expires_at || undefined}
            isPromoUser={isPromoUser}
            onRenewed={loadSubscription}
          />
        </div>
      )}

      {activeCategory === 'notifications' && (
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="font-semibold text-white">Notificações</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Ativar notificações</Label>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Sons</Label>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(v) => updateSetting('soundEnabled', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">E-mail</Label>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => updateSetting('emailNotifications', v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeCategory === 'radar' && (
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <h4 className="font-semibold text-white">Radar Global</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Scan automático</Label>
                <Switch
                  checked={settings.radarAutoScan}
                  onCheckedChange={(v) => updateSetting('radarAutoScan', v)}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-2">
                <Label className="text-sm text-white/70">Intervalo de scan</Label>
                <Select
                  value={String(settings.radarInterval)}
                  onValueChange={(v) => updateSetting('radarInterval', Number(v))}
                >
                  <SelectTrigger className="h-10 bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minuto</SelectItem>
                    <SelectItem value="2">2 minutos</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeCategory === 'security' && (
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-rose-400" />
              </div>
              <h4 className="font-semibold text-white">Segurança</h4>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm text-white/70">Sessão ativa</Label>
                <p className="text-sm font-medium text-white">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-1">
                <Label className="text-sm text-white/70">ID do usuário</Label>
                <p className="text-xs font-mono text-white/70">
                  {userId.slice(0, 12)}...
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPasswordModalOpen(true)}
                className="w-full h-10 border-white/20 text-white/70 hover:text-white hover:bg-white/10 gap-2"
              >
                <Lock className="w-4 h-4" />
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeCategory === 'site' && isAdmin && (
        <SiteCustomizationSection />
      )}

      {/* Bot Support Config - Only for super admin */}
      {activeCategory === 'bot' && isAdmin && (
        <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="font-semibold text-white">Bot de Suporte (Telegram)</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Ativar bot de suporte</Label>
                <Switch
                  checked={settings.botEnabled ?? false}
                  onCheckedChange={async (v) => {
                    try {
                      const nextSettings = { ...settings, botEnabled: v };
                      setSettings(nextSettings as any);
                      await saveBotSettings(v, nextSettings.telegramChatId || '');
                      toast.success(v ? 'Bot ativado' : 'Bot desativado');
                    } catch (error) {
                      console.error('Error saving bot status:', error);
                      setSettings(prev => ({ ...prev, botEnabled: !v }));
                      toast.error('Erro ao salvar configuração do bot');
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-white/70">Telegram Chat ID</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: 123456789"
                    value={(settings as any).telegramChatId || ''}
                    onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value } as any)}
                    className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                  <Button
                    size="sm"
                    onClick={async () => {
                      const chatId = (settings as any).telegramChatId;
                      if (!chatId) { toast.error('Insira o Chat ID'); return; }

                      try {
                        await saveBotSettings(settings.botEnabled ?? true, chatId);
                        setSettings(prev => ({ ...prev, botEnabled: true }));
                        toast.success('Chat ID salvo!');
                      } catch (error) {
                        console.error('Error saving bot chat id:', error);
                        toast.error('Erro ao salvar Chat ID');
                      }
                    }}
                    className="h-9"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-white/40">Use @userinfobot no Telegram para descobrir seu Chat ID</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Change Modal */}
      <GenesisPasswordModal 
        isOpen={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
};
