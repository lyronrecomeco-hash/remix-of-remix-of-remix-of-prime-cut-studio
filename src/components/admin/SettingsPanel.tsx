import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { 
  Palette, 
  AlertTriangle, 
  Instagram, 
  Facebook, 
  Store,
  Shield,
  Webhook,
  Bell,
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  Save,
  RotateCcw,
  Check,
  Clock,
  MessageCircle,
  Settings,
  TestTube,
  HelpCircle,
  ExternalLink,
  Power,
  Loader2,
  Download,
  Upload,
  FileText,
  Database,
  FileCheck,
  AlertCircle,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import OverloadAlertModal from './OverloadAlertModal';

interface MessageTemplate {
  id: string;
  event_type: string;
  title: string;
  template: string;
  is_active: boolean;
  chatpro_enabled?: boolean;
  button_text?: string | null;
  button_url?: string | null;
  image_url?: string | null;
}

interface ChatProConfig {
  id: string;
  api_token: string | null;
  instance_id: string | null;
  base_endpoint: string;
  is_enabled: boolean;
}

interface SiteSectionTexts {
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_description: string;
  services_title: string;
  services_subtitle: string;
  gallery_title: string;
  gallery_subtitle: string;
  location_title: string;
  cta_title: string;
  cta_subtitle: string;
  footer_text: string;
}

interface BackupData {
  version: string;
  timestamp: string;
  shop_settings: any;
  services: any[];
  barbers: any[];
  message_templates: any[];
  chatpro_config: any;
  site_texts?: SiteSectionTexts;
}

const defaultTemplates: Record<string, string> = {
  appointment_created: 'Olá, {{nome_cliente}}! Seu agendamento na {{nome_barbearia}} foi realizado com sucesso para {{data}} às {{hora}} para o serviço de {{serviço}}.',
  appointment_confirmed: 'Agendamento confirmado na {{nome_barbearia}} 🎉\nEstaremos te esperando no dia {{data}} às {{hora}}.',
  client_called: 'Chegou sua vez na {{nome_barbearia}} 💈\nDirija-se ao salão agora.',
  queue_update: 'Atualização da sua fila na {{nome_barbearia}}:\nSua posição atual é: {{posição_fila}}.',
  appointment_reminder: 'Lembrete: você possui um horário hoje na {{nome_barbearia}} às {{hora}}.',
  appointment_completed: 'Obrigado por visitar a {{nome_barbearia}}!\nEsperamos que tenha gostado do serviço. Volte sempre!',
};

const eventLabels: Record<string, string> = {
  appointment_created: 'Agendamento Realizado',
  appointment_confirmed: 'Agendamento Confirmado',
  client_called: 'Cliente Chamado',
  queue_update: 'Atualização da Fila',
  appointment_reminder: 'Lembrete de Horário',
  appointment_completed: 'Atendimento Concluído',
};

const variables = [
  { key: '{{nome_cliente}}', label: 'Nome do Cliente' },
  { key: '{{nome_barbearia}}', label: 'Nome da Barbearia' },
  { key: '{{serviço}}', label: 'Serviço' },
  { key: '{{data}}', label: 'Data' },
  { key: '{{hora}}', label: 'Hora' },
  { key: '{{posição_fila}}', label: 'Posição na Fila' },
  { key: '{{protocolo}}', label: 'Protocolo' },
];

const defaultSiteTexts: SiteSectionTexts = {
  hero_title: 'Sua Barbearia',
  hero_subtitle: 'Tradição e estilo em cada corte',
  about_title: 'Sobre Nós',
  about_description: 'Uma barbearia tradicional com foco em qualidade e atendimento personalizado.',
  services_title: 'Nossos Serviços',
  services_subtitle: 'Conheça nossos serviços especializados',
  gallery_title: 'Galeria',
  gallery_subtitle: 'Veja nossos trabalhos',
  location_title: 'Localização',
  cta_title: 'Agende Agora',
  cta_subtitle: 'Reserve seu horário e venha nos visitar',
  footer_text: 'Todos os direitos reservados',
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SettingsCard = forwardRef<HTMLDivElement, SectionProps>(
  ({ title, icon, children, defaultOpen = true }, ref) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div ref={ref} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-semibold text-lg">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-border pt-5">
          {children}
        </div>
      )}
    </div>
  );
});

SettingsCard.displayName = 'SettingsCard';

export default function SettingsPanel() {
  const { notify } = useNotification();
  const { shopSettings, updateShopSettings, theme, setTheme, services, barbers } = useApp();
  const [showOverloadModal, setShowOverloadModal] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  
  // ChatPro state
  const [chatproConfig, setChatproConfig] = useState<ChatProConfig | null>(null);
  const [chatproLoading, setChatproLoading] = useState(false);
  const [testingChatPro, setTestingChatPro] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  
  // Backup state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  
  // Site texts state
  const [siteTexts, setSiteTexts] = useState<SiteSectionTexts>(defaultSiteTexts);
  const [savingSiteTexts, setSavingSiteTexts] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchChatProConfig();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('message_templates').select('*');
    if (data) setTemplates(data as MessageTemplate[]);
  };

  const fetchChatProConfig = async () => {
    const { data } = await supabase.from('chatpro_config').select('*').limit(1).single();
    if (data) setChatproConfig(data as ChatProConfig);
  };

  const updateChatProConfig = async (updates: Partial<ChatProConfig>) => {
    if (!chatproConfig) return;
    
    setChatproLoading(true);
    const { error } = await supabase
      .from('chatpro_config')
      .update(updates)
      .eq('id', chatproConfig.id);
    
    if (error) {
      notify.error('Erro ao salvar configuração');
    } else {
      setChatproConfig({ ...chatproConfig, ...updates });
      notify.success('Configuração salva');
    }
    setChatproLoading(false);
  };

  const testChatProConnection = async () => {
    if (!testPhone.trim()) {
      notify.error('Digite um número para teste');
      return;
    }

    setTestingChatPro(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-chatpro', {
        body: {
          phone: testPhone,
          message: `Teste de integração ChatPro - ${shopSettings.name || 'Barbearia'}`,
        },
      });

      if (error) {
        notify.error('Erro ao testar: ' + error.message);
      } else if (data?.success) {
        notify.success('Mensagem de teste enviada!');
      } else {
        notify.error(data?.error || 'Erro ao enviar mensagem');
      }
    } catch (err) {
      notify.error('Erro ao conectar');
    }
    setTestingChatPro(false);
  };

  const toggleChatProForEvent = async (eventType: string, enabled: boolean) => {
    const { error } = await supabase
      .from('message_templates')
      .update({ chatpro_enabled: enabled })
      .eq('event_type', eventType);
    
    if (error) {
      notify.error('Erro ao atualizar');
    } else {
      setTemplates(prev => prev.map(t => 
        t.event_type === eventType ? { ...t, chatpro_enabled: enabled } : t
      ));
      notify.success(enabled ? 'ChatPro ativado para este evento' : 'ChatPro desativado para este evento');
    }
  };

  const updateTemplate = async (eventType: string, template: string, buttonText?: string | null, buttonUrl?: string | null, imageUrl?: string | null) => {
    const { error } = await supabase
      .from('message_templates')
      .update({ 
        template,
        button_text: buttonText || null,
        button_url: buttonUrl || null,
        image_url: imageUrl || null,
      })
      .eq('event_type', eventType);

    if (error) {
      notify.error('Erro ao salvar template');
    } else {
      notify.success('Template salvo');
      fetchTemplates();
    }
  };

  const restoreDefaultTemplate = async (eventType: string) => {
    const defaultTemplate = defaultTemplates[eventType];
    if (!defaultTemplate) return;

    const { error } = await supabase
      .from('message_templates')
      .update({ template: defaultTemplate })
      .eq('event_type', eventType);

    if (error) {
      notify.error('Erro ao restaurar template');
    } else {
      notify.success('Template restaurado');
      fetchTemplates();
    }
  };

  const getPreviewMessage = (template: string) => {
    let preview = template;
    preview = preview.replace(/\{\{nome_cliente\}\}/g, 'João Silva');
    preview = preview.replace(/\{\{nome_barbearia\}\}/g, shopSettings.name || 'Barbearia');
    preview = preview.replace(/\{\{serviço\}\}/g, 'Corte + Barba');
    preview = preview.replace(/\{\{data\}\}/g, '28/12/2025');
    preview = preview.replace(/\{\{hora\}\}/g, '14:30');
    preview = preview.replace(/\{\{posição_fila\}\}/g, '2');
    return preview;
  };

  const getTemplateForEvent = (eventType: string) => {
    return templates.find(t => t.event_type === eventType);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    notify.success(message);
  };

  // ===== BACKUP FUNCTIONS =====
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const [templatesRes, chatproRes] = await Promise.all([
        supabase.from('message_templates').select('*'),
        supabase.from('chatpro_config').select('*').limit(1).maybeSingle(),
      ]);

      const backupData: BackupData = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        shop_settings: shopSettings,
        services: services,
        barbers: barbers,
        message_templates: templatesRes.data || [],
        chatpro_config: chatproRes.data,
        site_texts: siteTexts,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const encodedBackup = btoa(unescape(encodeURIComponent(jsonStr)));
      const checksum = await generateChecksum(jsonStr);
      
      const finalBackup = {
        data: encodedBackup,
        checksum,
        created_at: new Date().toISOString(),
        app_version: '2.0',
      };

      const blob = new Blob([JSON.stringify(finalBackup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-barbearia-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify.success('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      notify.error('Erro ao exportar backup');
    }
    setIsExporting(false);
  };

  const generateChecksum = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const verifyChecksum = async (data: string, checksum: string): Promise<boolean> => {
    const calculatedChecksum = await generateChecksum(data);
    return calculatedChecksum === checksum;
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const fileContent = await file.text();
      const backupFile = JSON.parse(fileContent);

      if (!backupFile.data || !backupFile.checksum) {
        throw new Error('Arquivo de backup inválido - estrutura incorreta');
      }

      const decodedData = decodeURIComponent(escape(atob(backupFile.data)));
      const isValid = await verifyChecksum(decodedData, backupFile.checksum);
      if (!isValid) {
        throw new Error('Arquivo de backup corrompido - checksum inválido');
      }

      const backupData: BackupData = JSON.parse(decodedData);

      if (!backupData.version || !backupData.timestamp) {
        throw new Error('Arquivo de backup inválido - versão não encontrada');
      }

      if (backupData.shop_settings) {
        await updateShopSettings(backupData.shop_settings);
      }

      if (backupData.message_templates && backupData.message_templates.length > 0) {
        for (const template of backupData.message_templates) {
          await supabase
            .from('message_templates')
            .upsert({
              event_type: template.event_type,
              title: template.title,
              template: template.template,
              is_active: template.is_active,
              chatpro_enabled: template.chatpro_enabled,
              button_text: template.button_text,
              button_url: template.button_url,
              image_url: template.image_url,
            }, { onConflict: 'event_type' });
        }
      }

      if (backupData.chatpro_config) {
        await supabase
          .from('chatpro_config')
          .update({
            api_token: backupData.chatpro_config.api_token,
            instance_id: backupData.chatpro_config.instance_id,
            base_endpoint: backupData.chatpro_config.base_endpoint,
            is_enabled: backupData.chatpro_config.is_enabled,
          })
          .eq('id', backupData.chatpro_config.id);
      }

      if (backupData.site_texts) {
        setSiteTexts(backupData.site_texts);
        localStorage.setItem('site_texts', JSON.stringify(backupData.site_texts));
      }

      await fetchTemplates();
      await fetchChatProConfig();

      notify.success('Backup restaurado com sucesso!', `Versão: ${backupData.version} | Data: ${new Date(backupData.timestamp).toLocaleDateString('pt-BR')}`);
    } catch (error: any) {
      console.error('Import error:', error);
      setImportError(error.message || 'Erro ao importar backup');
      notify.error('Erro ao importar: ' + (error.message || 'Arquivo inválido'));
    }

    setIsImporting(false);
    if (backupFileInputRef.current) {
      backupFileInputRef.current.value = '';
    }
  };

  const saveSiteTexts = () => {
    setSavingSiteTexts(true);
    try {
      localStorage.setItem('site_texts', JSON.stringify(siteTexts));
      notify.success('Textos do site salvos!');
    } catch (error) {
      notify.error('Erro ao salvar textos');
    }
    setSavingSiteTexts(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem('site_texts');
    if (stored) {
      try {
        setSiteTexts(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading site texts:', e);
      }
    }
  }, []);

  const apiBaseUrl = `https://wvnszzrvrrueuycrpgyc.supabase.co/functions/v1/appointments-api`;

  return (
    <div className="flex flex-col h-full min-h-0">
      <h2 className="text-3xl font-bold mb-8">Configurações</h2>
      
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-8">
        {/* Grid principal - 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Coluna 1 */}
          <div className="space-y-6">
            {/* Tema Visual */}
            <SettingsCard 
              title="Tema Visual" 
              icon={<Palette className="w-5 h-5 text-primary" />}
            >
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'gold', label: 'Black & Gold', colors: ['bg-black', 'bg-amber-500'], isNative: true },
                  { id: 'gold-shine', label: 'Gold Brilhante', colors: ['bg-black', 'bg-yellow-400'] },
                  { id: 'gold-metallic', label: 'Gold Metálico', colors: ['bg-black', 'bg-amber-300'] },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === t.id ? 'border-primary gold-glow' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-2 mb-3">
                      {t.colors.map((c, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full ${c}`} />
                      ))}
                    </div>
                    <p className="text-sm font-medium">{t.label}</p>
                  </button>
                ))}
              </div>
            </SettingsCard>

            {/* Barbearia */}
            <SettingsCard 
              title="Barbearia" 
              icon={<Store className="w-5 h-5 text-primary" />}
            >
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Nome da Barbearia</label>
                  <Input value={shopSettings.name} onChange={(e) => updateShopSettings({ name: e.target.value })} className="h-11 text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Tagline / Slogan</label>
                  <Input value={shopSettings.tagline} onChange={(e) => updateShopSettings({ tagline: e.target.value })} className="h-11 text-base" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Telefone</label>
                    <Input value={shopSettings.phone} onChange={(e) => updateShopSettings({ phone: e.target.value })} className="h-11 text-base" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">WhatsApp</label>
                    <Input value={shopSettings.whatsapp} onChange={(e) => updateShopSettings({ whatsapp: e.target.value })} placeholder="55..." className="h-11 text-base" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Endereço Completo</label>
                  <Input value={shopSettings.address} onChange={(e) => updateShopSettings({ address: e.target.value })} className="h-11 text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Link do Google Maps</label>
                  <Input value={shopSettings.mapsLink} onChange={(e) => updateShopSettings({ mapsLink: e.target.value })} placeholder="https://maps.google.com/..." className="h-11 text-base" />
                </div>
              </div>
            </SettingsCard>

            {/* Backup */}
            <SettingsCard
              title="Backup e Restauração" 
              icon={<Database className="w-5 h-5 text-primary" />}
            >
              <div className="space-y-5">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-base mb-1">Backup Seguro SHA-256</p>
                    <p className="text-sm text-muted-foreground">
                      Inclui: configurações, templates, ChatPro e textos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleExportBackup}
                    disabled={isExporting}
                    className="h-12 text-base"
                  >
                    {isExporting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5 mr-2" />
                    )}
                    Exportar
                  </Button>
                  
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                  
                  <Button 
                    variant="outline"
                    onClick={() => backupFileInputRef.current?.click()}
                    disabled={isImporting}
                    className="h-12 text-base"
                  >
                    {isImporting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    Importar
                  </Button>
                </div>

                {importError && (
                  <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{importError}</p>
                  </div>
                )}
              </div>
            </SettingsCard>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-6">
            {/* Segurança */}
            <SettingsCard 
              title="Segurança" 
              icon={<Shield className="w-5 h-5 text-primary" />}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div>
                    <span className="text-base font-medium">Alerta de Sobrecarga</span>
                    <p className="text-sm text-muted-foreground">Notifica quando atingir limite diário</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!shopSettings.overloadAlertEnabled) {
                        setShowOverloadModal(true);
                      } else {
                        updateShopSettings({ overloadAlertEnabled: false });
                        notify.info('Alertas desativados');
                      }
                    }}
                    className={`w-14 h-7 rounded-full transition-colors relative ${
                      shopSettings.overloadAlertEnabled ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                      shopSettings.overloadAlertEnabled ? 'left-8' : 'left-1'
                    }`} />
                  </button>
                </div>
                {shopSettings.overloadAlertEnabled && (
                  <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Limite diário de agendamentos</label>
                    <Input
                      type="number"
                      value={shopSettings.dailyAppointmentLimit || 20}
                      onChange={(e) => updateShopSettings({ dailyAppointmentLimit: Number(e.target.value) })}
                      min={1}
                      max={100}
                      className="h-11 text-base"
                    />
                  </div>
                )}
              </div>
            </SettingsCard>

            {/* Redes Sociais */}
            <SettingsCard 
              title="Redes Sociais" 
              icon={<Instagram className="w-5 h-5 text-primary" />}
            >
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2 flex items-center gap-2">
                    <Instagram className="w-4 h-4" /> Instagram
                  </label>
                  <Input
                    placeholder="@seuperfil"
                    value={shopSettings.social?.instagram || ''}
                    onChange={(e) => updateShopSettings({ social: { ...shopSettings.social, instagram: e.target.value } })}
                    className="h-11 text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2 flex items-center gap-2">
                    <Facebook className="w-4 h-4" /> Facebook
                  </label>
                  <Input
                    placeholder="nome.da.pagina"
                    value={shopSettings.social?.facebook || ''}
                    onChange={(e) => updateShopSettings({ social: { ...shopSettings.social, facebook: e.target.value } })}
                    className="h-11 text-base"
                  />
                </div>
              </div>
            </SettingsCard>

            {/* Textos do Site */}
            <SettingsCard 
              title="Textos do Site" 
              icon={<Type className="w-5 h-5 text-primary" />}
              defaultOpen={false}
            >
              <div className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Personalize os textos e títulos das seções do site público.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                    <h5 className="text-base font-semibold">Hero (Topo)</h5>
                    <Input 
                      value={siteTexts.hero_title} 
                      onChange={(e) => setSiteTexts(prev => ({ ...prev, hero_title: e.target.value }))}
                      placeholder="Título principal"
                      className="h-11 text-base"
                    />
                    <Input 
                      value={siteTexts.hero_subtitle} 
                      onChange={(e) => setSiteTexts(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                      placeholder="Subtítulo"
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                    <h5 className="text-base font-semibold">Sobre Nós</h5>
                    <Input 
                      value={siteTexts.about_title} 
                      onChange={(e) => setSiteTexts(prev => ({ ...prev, about_title: e.target.value }))}
                      placeholder="Título da seção"
                      className="h-11 text-base"
                    />
                    <Textarea 
                      value={siteTexts.about_description} 
                      onChange={(e) => setSiteTexts(prev => ({ ...prev, about_description: e.target.value }))}
                      placeholder="Descrição da barbearia"
                      rows={3}
                      className="text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                      <h5 className="text-base font-semibold">Serviços</h5>
                      <Input 
                        value={siteTexts.services_title} 
                        onChange={(e) => setSiteTexts(prev => ({ ...prev, services_title: e.target.value }))}
                        placeholder="Título"
                        className="h-11 text-base"
                      />
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                      <h5 className="text-base font-semibold">Galeria</h5>
                      <Input 
                        value={siteTexts.gallery_title} 
                        onChange={(e) => setSiteTexts(prev => ({ ...prev, gallery_title: e.target.value }))}
                        placeholder="Título"
                        className="h-11 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                      <h5 className="text-base font-semibold">CTA (Chamada)</h5>
                      <Input 
                        value={siteTexts.cta_title} 
                        onChange={(e) => setSiteTexts(prev => ({ ...prev, cta_title: e.target.value }))}
                        placeholder="Título"
                        className="h-11 text-base"
                      />
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                      <h5 className="text-base font-semibold">Rodapé</h5>
                      <Input 
                        value={siteTexts.footer_text} 
                        onChange={(e) => setSiteTexts(prev => ({ ...prev, footer_text: e.target.value }))}
                        placeholder="Texto do rodapé"
                        className="h-11 text-base"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={saveSiteTexts}
                  disabled={savingSiteTexts}
                  className="w-full h-12 text-base"
                >
                  {savingSiteTexts ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Salvar Textos do Site
                </Button>
              </div>
            </SettingsCard>
          </div>
        </div>

        {/* Seção de Integrações - Full Width */}
        <div className="space-y-6">
          {/* ChatPro Integration */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-base">Integração ChatPro</h3>
                    <p className="text-sm text-muted-foreground">WhatsApp Business API</p>
                  </div>
                </div>
                <button
                  onClick={() => chatproConfig && updateChatProConfig({ is_enabled: !chatproConfig.is_enabled })}
                  disabled={chatproLoading}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    chatproConfig?.is_enabled ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    chatproConfig?.is_enabled ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            {chatproConfig?.is_enabled && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">API Token</label>
                    <Input
                      type="password"
                      value={chatproConfig?.api_token || ''}
                      onChange={(e) => updateChatProConfig({ api_token: e.target.value })}
                      placeholder="Seu token..."
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Instance ID</label>
                    <Input
                      value={chatproConfig?.instance_id || ''}
                      onChange={(e) => updateChatProConfig({ instance_id: e.target.value })}
                      placeholder="ID da instância..."
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Endpoint</label>
                    <Input
                      value={chatproConfig?.base_endpoint || ''}
                      onChange={(e) => updateChatProConfig({ base_endpoint: e.target.value })}
                      placeholder="https://..."
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Input
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="5511999999999"
                    className="max-w-xs h-10"
                  />
                  <Button
                    variant="outline"
                    onClick={testChatProConnection}
                    disabled={testingChatPro}
                    className="h-10"
                  >
                    {testingChatPro ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Templates de Mensagem */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-base flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                Templates de Mensagem
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Configure as mensagens automáticas</p>
            </div>

            <div className="p-5 space-y-3">
              {Object.entries(eventLabels).map(([eventType, label]) => {
                const template = getTemplateForEvent(eventType);
                const isExpanded = expandedTemplate === eventType;

                return (
                  <div key={eventType} className="bg-secondary/30 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedTemplate(isExpanded ? null : eventType)}
                      className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${template?.is_active ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="font-medium text-sm">{label}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && template && (
                      <div className="p-4 pt-0 space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-border">
                          <span className="text-sm text-muted-foreground">ChatPro:</span>
                          <button
                            onClick={() => toggleChatProForEvent(eventType, !template.chatpro_enabled)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${
                              template.chatpro_enabled ? 'bg-primary' : 'bg-secondary'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                              template.chatpro_enabled ? 'left-5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        <Textarea
                          value={template.template}
                          onChange={(e) => {
                            const updated = templates.map(t =>
                              t.event_type === eventType ? { ...t, template: e.target.value } : t
                            );
                            setTemplates(updated);
                          }}
                          rows={4}
                        />

                        <div className="flex flex-wrap gap-2">
                          {variables.map((v) => (
                            <button
                              key={v.key}
                              onClick={() => {
                                const textarea = document.querySelector(`textarea`) as HTMLTextAreaElement;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const newTemplate = template.template.substring(0, start) + v.key + template.template.substring(end);
                                const updated = templates.map(t =>
                                  t.event_type === eventType ? { ...t, template: newTemplate } : t
                                );
                                setTemplates(updated);
                              }}
                              className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-mono hover:bg-primary/30 transition-colors"
                            >
                              {v.key}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => updateTemplate(eventType, template.template)}
                            className="h-9"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreDefaultTemplate(eventType)}
                            className="h-9"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restaurar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewTemplate(previewTemplate === eventType ? null : eventType)}
                            className="h-9"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>

                        {previewTemplate === eventType && (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                            <p className="text-xs text-green-400 mb-2 font-medium">Pré-visualização:</p>
                            <p className="text-sm whitespace-pre-wrap">{getPreviewMessage(template.template)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Info */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-base flex items-center gap-3 mb-4">
              <Webhook className="w-5 h-5 text-primary" />
              API de Integração
            </h3>
            <div className="bg-secondary/50 rounded-xl p-4 font-mono text-sm break-all">
              {apiBaseUrl}
              <button
                onClick={() => copyToClipboard(apiBaseUrl, 'URL copiada!')}
                className="ml-3 p-1.5 hover:bg-secondary rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Use esta URL para integrar com sistemas externos.
            </p>
          </div>
        </div>
      </div>

      <OverloadAlertModal
        isOpen={showOverloadModal}
        onClose={() => setShowOverloadModal(false)}
        type="explanation"
        onConfirm={() => {
          updateShopSettings({ overloadAlertEnabled: true });
          setShowOverloadModal(false);
          notify.success('Alertas de sobrecarga ativados');
        }}
      />
    </div>
  );
}
