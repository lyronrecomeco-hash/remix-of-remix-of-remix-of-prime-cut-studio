import React, { useState, useEffect, useRef } from 'react';
import {
  Megaphone,
  Upload,
  Users,
  Send,
  Image as ImageIcon,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  HelpCircle,
  Power,
  Link as LinkIcon,
  Sparkles,
  Play,
  FileText,
  X,
  FileSpreadsheet,
  TestTube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface MarketingSettings {
  id: string;
  is_enabled: boolean;
  max_contacts: number;
  delay_between_messages: number;
}

interface Campaign {
  id: string;
  name: string;
  message_template: string;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  target_count: number;
  sent_count: number;
  status: string;
  use_ai: boolean;
  ai_prompt: string | null;
  created_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
}

interface Contact {
  phone: string;
  name: string;
}

export default function MarketingPanel() {
  const { notify } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const [testingCampaign, setTestingCampaign] = useState<string | null>(null);
  
  // New campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message_template: '',
    image_url: '',
    button_text: '',
    button_url: '',
    use_ai: false,
    ai_prompt: '',
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactInput, setContactInput] = useState({ phone: '', name: '' });
  const [bulkContacts, setBulkContacts] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [contactsTab, setContactsTab] = useState<'manual' | 'bulk' | 'csv'>('manual');

  useEffect(() => {
    fetchSettings();
    fetchCampaigns();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('marketing_settings').select('*').limit(1).maybeSingle();
    if (data) setSettings(data as MarketingSettings);
    setLoading(false);
  };

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data as Campaign[]);
  };

  const toggleMarketing = async () => {
    if (!settings) return;
    
    if (!settings.is_enabled) {
      setShowIntroModal(true);
      return;
    }
    
    const { error } = await supabase
      .from('marketing_settings')
      .update({ is_enabled: false })
      .eq('id', settings.id);
    
    if (error) {
      notify.error('Erro ao desativar');
    } else {
      setSettings({ ...settings, is_enabled: false });
      notify.info('Modo Marketing desativado');
    }
  };

  const confirmEnableMarketing = async () => {
    if (!settings) return;
    
    const { error } = await supabase
      .from('marketing_settings')
      .update({ is_enabled: true })
      .eq('id', settings.id);
    
    if (error) {
      notify.error('Erro ao ativar');
    } else {
      setSettings({ ...settings, is_enabled: true });
      notify.success('Modo Marketing ativado!');
    }
    setShowIntroModal(false);
  };

  const updateSettings = async (updates: Partial<MarketingSettings>) => {
    if (!settings) return;
    
    const { error } = await supabase
      .from('marketing_settings')
      .update(updates)
      .eq('id', settings.id);
    
    if (error) {
      notify.error('Erro ao salvar');
    } else {
      setSettings({ ...settings, ...updates });
      notify.success('Configuração salva');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notify.error('Imagem muito grande (máx 5MB)');
      return;
    }

    setUploadingImage(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('marketing-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('marketing-images')
        .getPublicUrl(fileName);

      setCampaignForm(prev => ({ ...prev, image_url: publicUrl }));
      notify.success('Imagem enviada!');
    } catch (error) {
      console.error('Upload error:', error);
      notify.error('Erro ao enviar imagem');
    }
    setUploadingImage(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const newContacts: Contact[] = [];
      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('telefone') || line.toLowerCase().includes('phone'))) {
          return;
        }
        
        const parts = line.split(/[,;]/);
        const phone = parts[0]?.replace(/\D/g, '').trim();
        const name = parts[1]?.trim() || phone;
        
        if (phone && phone.length >= 10 && !contacts.some(c => c.phone === phone) && !newContacts.some(c => c.phone === phone)) {
          if (contacts.length + newContacts.length < (settings?.max_contacts || 100)) {
            newContacts.push({ phone, name });
          }
        }
      });

      if (newContacts.length > 0) {
        setContacts(prev => [...prev, ...newContacts]);
        notify.success(`${newContacts.length} contato(s) importado(s)`);
        setShowContactsModal(false);
      } else {
        notify.error('Nenhum contato válido encontrado');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBulkAdd = () => {
    const lines = bulkContacts.split('\n').filter(line => line.trim());
    const newContacts: Contact[] = [];
    
    lines.forEach(line => {
      const parts = line.split(/[,;]/);
      const phone = parts[0]?.replace(/\D/g, '').trim();
      const name = parts[1]?.trim() || phone;
      
      if (phone && phone.length >= 10 && !contacts.some(c => c.phone === phone) && !newContacts.some(c => c.phone === phone)) {
        if (contacts.length + newContacts.length < (settings?.max_contacts || 100)) {
          newContacts.push({ phone, name });
        }
      }
    });

    if (newContacts.length > 0) {
      setContacts(prev => [...prev, ...newContacts]);
      setBulkContacts('');
      setShowContactsModal(false);
      notify.success(`${newContacts.length} contato(s) adicionado(s)`);
    } else {
      notify.error('Nenhum contato válido encontrado');
    }
  };

  const addManualContact = () => {
    if (!contactInput.phone.trim()) {
      notify.error('Digite um número de telefone');
      return;
    }
    
    const phone = contactInput.phone.replace(/\D/g, '');
    if (phone.length < 10) {
      notify.error('Número inválido');
      return;
    }

    if (contacts.some(c => c.phone === phone)) {
      notify.error('Contato já adicionado');
      return;
    }

    if (contacts.length >= (settings?.max_contacts || 100)) {
      notify.error(`Limite de ${settings?.max_contacts || 100} contatos atingido`);
      return;
    }

    setContacts(prev => [...prev, { phone, name: contactInput.name.trim() || phone }]);
    setContactInput({ phone: '', name: '' });
    notify.success('Contato adicionado');
  };

  const removeContact = (phone: string) => {
    setContacts(prev => prev.filter(c => c.phone !== phone));
  };

  const createCampaign = async () => {
    if (!campaignForm.name.trim() || !campaignForm.message_template.trim()) {
      notify.error('Preencha nome e mensagem');
      return;
    }

    if (contacts.length < 1) {
      notify.error('Adicione pelo menos 1 contato');
      return;
    }

    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('marketing_campaigns')
        .insert({
          name: campaignForm.name,
          message_template: campaignForm.message_template,
          image_url: campaignForm.image_url || null,
          button_text: campaignForm.button_text || null,
          button_url: campaignForm.button_url || null,
          use_ai: campaignForm.use_ai,
          ai_prompt: campaignForm.ai_prompt || null,
          target_count: contacts.length,
          status: 'draft',
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      const contactsToInsert = contacts.map(c => ({
        campaign_id: campaign.id,
        phone: c.phone,
        name: c.name,
        status: 'pending',
      }));

      const { error: contactsError } = await supabase
        .from('marketing_contacts')
        .insert(contactsToInsert);

      if (contactsError) throw contactsError;

      notify.success('Campanha criada!');
      notify.info('Nova campanha', `A campanha "${campaignForm.name}" foi criada.`);
      fetchCampaigns();
      resetForm();
    } catch (error) {
      console.error('Campaign creation error:', error);
      notify.error('Erro ao criar campanha');
    }
  };

  const resetForm = () => {
    setCampaignForm({
      name: '',
      message_template: '',
      image_url: '',
      button_text: '',
      button_url: '',
      use_ai: false,
      ai_prompt: '',
    });
    setContacts([]);
    setShowNewCampaign(false);
  };

  const testCampaign = async (campaignId: string) => {
    setTestingCampaign(campaignId);
    
    try {
      const { error } = await supabase.functions.invoke('send-marketing', {
        body: { campaign_id: campaignId, test_mode: true },
      });

      if (error) throw error;

      notify.success('Teste enviado!');
    } catch (error) {
      console.error('Test campaign error:', error);
      notify.error('Erro ao testar campanha');
    }
    
    setTestingCampaign(null);
  };

  const startCampaign = async (campaignId: string) => {
    setSendingCampaign(campaignId);
    
    try {
      const { error } = await supabase.functions.invoke('send-marketing', {
        body: { campaign_id: campaignId },
      });

      if (error) throw error;

      notify.success('Campanha iniciada!');
      notify.info('Campanha em andamento', 'As mensagens estão sendo enviadas.');
      fetchCampaigns();
    } catch (error) {
      console.error('Campaign start error:', error);
      notify.error('Erro ao iniciar campanha');
    }
    
    setSendingCampaign(null);
  };

  const deleteCampaign = async (campaignId: string) => {
    const { error } = await supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      notify.error('Erro ao excluir');
    } else {
      notify.success('Campanha excluída');
      fetchCampaigns();
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      draft: { label: 'Rascunho', color: 'bg-secondary text-muted-foreground', icon: <FileText className="w-3 h-3" /> },
      sending: { label: 'Enviando', color: 'bg-blue-500/20 text-blue-400', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      completed: { label: 'Concluída', color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="w-3 h-3" /> },
      failed: { label: 'Falhou', color: 'bg-destructive/20 text-destructive', icon: <XCircle className="w-3 h-3" /> },
    };
    const c = config[status] || config.draft;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Marketing
          </h2>
          <p className="text-sm text-muted-foreground">Disparo de mensagens via WhatsApp</p>
        </div>
        
        {/* Toggle - só funciona quando desativado */}
        <button
          onClick={toggleMarketing}
          className={`w-14 h-7 rounded-full transition-colors relative ${
            settings?.is_enabled ? 'bg-primary' : 'bg-secondary'
          }`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
            settings?.is_enabled ? 'left-8' : 'left-1'
          }`} />
        </button>
      </div>

      {!settings?.is_enabled ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="opacity-60 pointer-events-none select-none">
            <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Modo Marketing Desativado</h3>
            <p className="text-muted-foreground mb-4">
              Ative o modo Marketing para enviar mensagens em massa.
            </p>
          </div>
          <Button variant="hero" onClick={toggleMarketing} className="mt-2">
            <Power className="w-4 h-4" />
            Ativar Marketing
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {/* Settings */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Configurações</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Máx. contatos/campanha
                </label>
                <Input
                  type="number"
                  min={10}
                  max={1000}
                  value={settings?.max_contacts || 100}
                  onChange={(e) => updateSettings({ max_contacts: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Intervalo (segundos)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={settings?.delay_between_messages || 3}
                  onChange={(e) => updateSettings({ delay_between_messages: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-yellow-500">Aviso:</strong> Envio em massa pode resultar em bloqueio pelo WhatsApp. Use com responsabilidade.
            </p>
          </div>

          {/* New Campaign Button */}
          {!showNewCampaign && (
            <Button variant="hero" onClick={() => setShowNewCampaign(true)} className="w-full">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </Button>
          )}

          {/* New Campaign Form */}
          {showNewCampaign && (
            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Nova Campanha
                </h3>
                <button onClick={resetForm} className="p-1 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Nome da Campanha</label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Promoção de Natal"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Mensagem</label>
                <Textarea
                  value={campaignForm.message_template}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, message_template: e.target.value }))}
                  placeholder="Digite sua mensagem..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {'{{nome}}'} para personalizar
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Imagem (opcional)</label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex-1"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingImage ? 'Enviando...' : 'Upload'}
                  </Button>
                  {campaignForm.image_url && (
                    <button
                      onClick={() => setCampaignForm(prev => ({ ...prev, image_url: '' }))}
                      className="p-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {campaignForm.image_url && (
                  <img 
                    src={campaignForm.image_url} 
                    alt="Preview" 
                    className="mt-2 w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Button - Optional */}
              <div className="p-3 bg-secondary/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  Botão clicável (opcional)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={campaignForm.button_text}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Texto do Botão"
                  />
                  <Input
                    value={campaignForm.button_url}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, button_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* AI Option */}
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <button
                  onClick={() => setCampaignForm(prev => ({ ...prev, use_ai: !prev.use_ai }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    campaignForm.use_ai ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    campaignForm.use_ai ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
                <div className="flex-1">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Personalizar com IA
                  </span>
                  <p className="text-xs text-muted-foreground">
                    IA focada em avisos, anúncios e vendas
                  </p>
                </div>
              </div>

              {campaignForm.use_ai && (
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Prompt da IA</label>
                  <Textarea
                    value={campaignForm.ai_prompt}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, ai_prompt: e.target.value }))}
                    placeholder="Ex: Crie variações criativas focando em promoções..."
                    rows={2}
                  />
                </div>
              )}

              {/* Contacts - Button to open modal */}
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Contatos</span>
                  <p className="text-xs text-muted-foreground">
                    {contacts.length}/{settings?.max_contacts || 100} adicionados
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowContactsModal(true)}>
                  <Users className="w-4 h-4" />
                  Gerenciar
                </Button>
              </div>

              {/* Show contacts preview */}
              {contacts.length > 0 && (
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {contacts.slice(0, 5).map((contact, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
                      <span className="truncate text-xs">{contact.name} - {contact.phone}</span>
                      <button
                        onClick={() => removeContact(contact.phone)}
                        className="p-1 hover:bg-destructive/20 rounded text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {contacts.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{contacts.length - 5} contato(s)
                    </p>
                  )}
                </div>
              )}

              <Button variant="hero" onClick={createCampaign} className="w-full">
                <Send className="w-4 h-4" />
                Criar Campanha
              </Button>
            </div>
          )}

          {/* Campaigns List */}
          {campaigns.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Campanhas</h3>
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium truncate">{campaign.name}</h4>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.message_template}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {campaign.sent_count}/{campaign.target_count}
                        </span>
                        {campaign.image_url && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Imagem
                          </span>
                        )}
                        {campaign.use_ai && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            IA
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {campaign.status === 'draft' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testCampaign(campaign.id)}
                            disabled={testingCampaign === campaign.id}
                            title="Testar"
                          >
                            {testingCampaign === campaign.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => startCampaign(campaign.id)}
                            disabled={sendingCampaign === campaign.id}
                          >
                            {sendingCampaign === campaign.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <button
                            onClick={() => deleteCampaign(campaign.id)}
                            className="p-2 hover:bg-destructive/20 rounded-lg text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Intro Modal */}
      <Dialog open={showIntroModal} onOpenChange={setShowIntroModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              Modo Marketing
            </DialogTitle>
            <DialogDescription>
              Funcionalidades do módulo de Marketing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Send className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Disparo em Massa</h4>
                <p className="text-xs text-muted-foreground">
                  Envie mensagens para múltiplos contatos via WhatsApp.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Importar Contatos</h4>
                <p className="text-xs text-muted-foreground">
                  Importe via CSV ou adicione em massa.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Imagens e Botões</h4>
                <p className="text-xs text-muted-foreground">
                  Adicione mídia e links às mensagens.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Personalização com IA</h4>
                <p className="text-xs text-muted-foreground">
                  IA focada em avisos, anúncios e vendas.
                </p>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-yellow-500">Atenção:</strong> O envio em massa pode resultar em bloqueio pelo WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowIntroModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="hero" onClick={confirmEnableMarketing} className="flex-1">
              <Power className="w-4 h-4" />
              Ativar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contacts Modal - All contact management in one place */}
      <Dialog open={showContactsModal} onOpenChange={setShowContactsModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Gerenciar Contatos
            </DialogTitle>
            <DialogDescription>
              {contacts.length}/{settings?.max_contacts || 100} contatos
            </DialogDescription>
          </DialogHeader>
          
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
            {[
              { id: 'manual', label: 'Manual' },
              { id: 'bulk', label: 'Em Massa' },
              { id: 'csv', label: 'CSV' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setContactsTab(tab.id as any)}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  contactsTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 py-2">
            {contactsTab === 'manual' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={contactInput.phone}
                    onChange={(e) => setContactInput(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telefone"
                    className="flex-1"
                  />
                  <Input
                    value={contactInput.name}
                    onChange={(e) => setContactInput(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome"
                    className="flex-1"
                  />
                </div>
                <Button variant="hero" onClick={addManualContact} className="w-full">
                  <Plus className="w-4 h-4" />
                  Adicionar Contato
                </Button>
              </div>
            )}

            {contactsTab === 'bulk' && (
              <div className="space-y-3">
                <Textarea
                  value={bulkContacts}
                  onChange={(e) => setBulkContacts(e.target.value)}
                  placeholder={`5511999999999, João Silva\n5511888888888, Maria\n5511777777777`}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: telefone, nome (opcional) - um por linha
                </p>
                <Button variant="hero" onClick={handleBulkAdd} className="w-full">
                  <Plus className="w-4 h-4" />
                  Adicionar Todos
                </Button>
              </div>
            )}

            {contactsTab === 'csv' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecione um arquivo CSV ou TXT
                  </p>
                  <Button variant="outline" onClick={() => csvInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    Escolher Arquivo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formato: telefone, nome (opcional) - um por linha
                </p>
              </div>
            )}

            {/* Current contacts list */}
            {contacts.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Contatos adicionados</span>
                  <button
                    onClick={() => setContacts([])}
                    className="text-xs text-destructive hover:underline"
                  >
                    Limpar todos
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {contacts.map((contact, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded text-sm">
                      <span className="truncate text-xs">{contact.name} - {contact.phone}</span>
                      <button
                        onClick={() => removeContact(contact.phone)}
                        className="p-1 hover:bg-destructive/20 rounded text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" onClick={() => setShowContactsModal(false)} className="w-full">
            Concluído
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
