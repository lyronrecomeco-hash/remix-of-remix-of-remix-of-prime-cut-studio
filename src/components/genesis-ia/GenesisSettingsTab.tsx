import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save,
  Loader2,
  MessageSquare,
  Globe,
  Bell,
  Shield,
  FileText,
  Edit3,
  Copy,
  Check
} from 'lucide-react';
import { GenesisPasswordModal } from './GenesisPasswordModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';

interface GenesisSettingsTabProps {
  userId: string;
}

interface GenesisSettings {
  baseMessage: string;
  proposalTemplate: string;
  includeCompanyName: boolean;
  includeContactName: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  radarAutoScan: boolean;
  radarInterval: number;
  radarCountries: string[];
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

const VARIABLES_MESSAGE = ['{nome_contato}', '{nome_empresa}', '{niche}'];
const VARIABLES_PROPOSAL = ['{nome_empresa}', '{valor_proposta}', '{pontos_analise}', '{descricao_solucao}'];

export const GenesisSettingsTab = ({ userId }: GenesisSettingsTabProps) => {
  const [settings, setSettings] = useState<GenesisSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [tempMessage, setTempMessage] = useState('');
  const [tempProposal, setTempProposal] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

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
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('user_id', userId)
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

  const openMessageModal = () => {
    setTempMessage(settings.baseMessage);
    setMessageModalOpen(true);
  };

  const openProposalModal = () => {
    setTempProposal(settings.proposalTemplate);
    setProposalModalOpen(true);
  };

  const saveMessageTemplate = () => {
    updateSetting('baseMessage', tempMessage);
    setMessageModalOpen(false);
    toast.success('Mensagem base atualizada!');
  };

  const saveProposalTemplate = () => {
    updateSetting('proposalTemplate', tempProposal);
    setProposalModalOpen(false);
    toast.success('Template de proposta atualizado!');
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <p className="text-sm text-white/50">Personalize sua experiência no Genesis IA</p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={saving} size="lg" className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      {/* Templates Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mensagem Base Card */}
          <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-colors cursor-pointer group" style={{ borderRadius: '14px' }} onClick={openMessageModal}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Mensagem Base</h4>
                    <p className="text-xs text-white/50 mt-0.5">Template para primeiro contato</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white hover:bg-white/10">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-white/50 line-clamp-3 font-mono">
                  {settings.baseMessage.slice(0, 120)}...
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Template Proposta Card */}
          <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-colors cursor-pointer group" style={{ borderRadius: '14px' }} onClick={openProposalModal}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Template de Proposta</h4>
                    <p className="text-xs text-white/50 mt-0.5">Modelo para propostas comerciais</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white hover:bg-white/10">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-white/50 line-clamp-3 font-mono">
                  {settings.proposalTemplate.slice(0, 120)}...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Preferências</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Notificações */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-semibold text-white text-sm">Notificações</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-white/50">Ativar notificações</Label>
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-white/50">Sons</Label>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(v) => updateSetting('soundEnabled', v)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-white/50">E-mail</Label>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(v) => updateSetting('emailNotifications', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Radar Global */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="font-semibold text-white text-sm">Radar Global</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-white/50">Scan automático</Label>
                  <Switch
                    checked={settings.radarAutoScan}
                    onCheckedChange={(v) => updateSetting('radarAutoScan', v)}
                  />
                </div>
                <Separator className="bg-white/10" />
                <div className="space-y-2">
                  <Label className="text-xs text-white/50">Intervalo</Label>
                  <Select
                    value={String(settings.radarInterval)}
                    onValueChange={(v) => updateSetting('radarInterval', Number(v))}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white/5 border-white/10">
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

          {/* Segurança */}
          <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-rose-400" />
                </div>
                <h4 className="font-semibold text-white text-sm">Segurança</h4>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">Sessão ativa</Label>
                  <p className="text-xs font-medium text-white">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Separator className="bg-white/10" />
                <div className="space-y-1">
                  <Label className="text-xs text-white/50">ID do usuário</Label>
                  <p className="text-xs font-mono text-white/70">
                    {userId.slice(0, 12)}...
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPasswordModalOpen(true)}
                  className="w-full h-8 text-xs mt-2 border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                >
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Message Template Modal */}
      <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title="Editar Mensagem Base" size="lg">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Variáveis Disponíveis</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {VARIABLES_MESSAGE.map((v) => (
                  <button
                    key={v}
                    onClick={() => copyVariable(v)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-md transition-colors font-mono"
                  >
                    {copiedVar === v ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Mensagem</Label>
              <Textarea
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                placeholder="Escreva sua mensagem base..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-4">
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
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setMessageModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={saveMessageTemplate} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Template
          </Button>
        </ModalFooter>
      </Modal>

      {/* Proposal Template Modal */}
      <Modal isOpen={proposalModalOpen} onClose={() => setProposalModalOpen(false)} title="Editar Template de Proposta" size="lg">
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Variáveis Disponíveis</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {VARIABLES_PROPOSAL.map((v) => (
                  <button
                    key={v}
                    onClick={() => copyVariable(v)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-md transition-colors font-mono"
                  >
                    {copiedVar === v ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Template (Suporta Markdown)</Label>
              <Textarea
                value={tempProposal}
                onChange={(e) => setTempProposal(e.target.value)}
                placeholder="Escreva o template da proposta..."
                className="min-h-[350px] font-mono text-sm"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setProposalModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={saveProposalTemplate} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Template
          </Button>
        </ModalFooter>
      </Modal>

      {/* Password Change Modal */}
      <GenesisPasswordModal 
        isOpen={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)} 
      />
    </div>
  );
};
