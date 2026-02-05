import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Settings, 
  Store, 
  MessageSquare,
  Palette,
  Shield,
  Save,
  Image,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StoreSettings {
  store_name: string;
  store_description: string;
  store_logo: string;
  store_banner: string;
  whatsapp_number: string;
  address: string;
  city: string;
  state: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
}

const defaultSettings: StoreSettings = {
  store_name: 'Minha Loja',
  store_description: 'A melhor loja da região',
  store_logo: '',
  store_banner: '',
  whatsapp_number: '',
  address: '',
  city: '',
  state: '',
  primary_color: '#3b82f6',
  secondary_color: '#06b6d4',
  is_active: true,
};

export default function StoreSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (savedSettings) {
      setSettingsId(savedSettings.id);
      setSettings({
        store_name: savedSettings.store_name || defaultSettings.store_name,
        store_description: savedSettings.store_description || defaultSettings.store_description,
        store_logo: savedSettings.store_logo || defaultSettings.store_logo,
        store_banner: savedSettings.store_banner || defaultSettings.store_banner,
        whatsapp_number: savedSettings.whatsapp_number || defaultSettings.whatsapp_number,
        address: savedSettings.address || defaultSettings.address,
        city: savedSettings.city || defaultSettings.city,
        state: savedSettings.state || defaultSettings.state,
        primary_color: savedSettings.primary_color || defaultSettings.primary_color,
        secondary_color: savedSettings.secondary_color || defaultSettings.secondary_color,
        is_active: savedSettings.is_active ?? defaultSettings.is_active,
      });
    }
  }, [savedSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: StoreSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (settingsId) {
        const { error } = await supabase
          .from('store_settings')
          .update({ 
            store_name: newSettings.store_name,
            store_description: newSettings.store_description,
            store_logo: newSettings.store_logo,
            store_banner: newSettings.store_banner,
            whatsapp_number: newSettings.whatsapp_number,
            address: newSettings.address,
            city: newSettings.city,
            state: newSettings.state,
            primary_color: newSettings.primary_color,
            secondary_color: newSettings.secondary_color,
            is_active: newSettings.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', settingsId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('store_settings')
          .insert({ 
            store_name: newSettings.store_name,
            store_description: newSettings.store_description,
            store_logo: newSettings.store_logo,
            store_banner: newSettings.store_banner,
            whatsapp_number: newSettings.whatsapp_number,
            address: newSettings.address,
            city: newSettings.city,
            state: newSettings.state,
            primary_color: newSettings.primary_color,
            secondary_color: newSettings.secondary_color,
            is_active: newSettings.is_active,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Configurações salvas com sucesso!');
      setHasChanges(false);
    },
    onError: () => {
      toast.error('Erro ao salvar configurações');
    }
  });

  const handleChange = (key: keyof StoreSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Personalize sua loja virtual</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || saveSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveSettingsMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-gray-100 border border-gray-200 p-1">
          <TabsTrigger value="store" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            <Store className="w-4 h-4 mr-2" />
            Loja
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contato
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            <Palette className="w-4 h-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            <Shield className="w-4 h-4 mr-2" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* Store Tab */}
        <TabsContent value="store">
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    Informações da Loja
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Configure as informações básicas da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Nome da Loja</Label>
                    <Input
                      value={settings.store_name}
                      onChange={(e) => handleChange('store_name', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="Ex: Minha Loja Virtual"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Descrição</Label>
                    <Textarea
                      value={settings.store_description || ''}
                      onChange={(e) => handleChange('store_description', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="Descreva sua loja em poucas palavras..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Image className="w-5 h-5 text-blue-600" />
                    Imagens
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Logo e banner da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">URL do Logo</Label>
                    <Input
                      value={settings.store_logo || ''}
                      onChange={(e) => handleChange('store_logo', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">URL do Banner</Label>
                    <Input
                      value={settings.store_banner || ''}
                      onChange={(e) => handleChange('store_banner', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="https://exemplo.com/banner.png"
                    />
                  </div>

                  {(settings.store_logo || settings.store_banner) && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {settings.store_logo && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">Logo Preview</p>
                          <img 
                            src={settings.store_logo} 
                            alt="Logo" 
                            className="h-16 object-contain rounded"
                          />
                        </div>
                      )}
                      {settings.store_banner && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">Banner Preview</p>
                          <img 
                            src={settings.store_banner} 
                            alt="Banner" 
                            className="h-16 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    WhatsApp
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Configure a integração com WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Número do WhatsApp</Label>
                    <Input
                      value={settings.whatsapp_number}
                      onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="5511999999999"
                    />
                    <p className="text-xs text-gray-500">Apenas números, com DDD e código do país</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" />
                    Localização
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Endereço da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Endereço</Label>
                    <Input
                      value={settings.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Cidade</Label>
                      <Input
                        value={settings.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Estado</Label>
                      <Input
                        value={settings.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Cores da Loja
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Personalize as cores da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Cor Primária</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={settings.primary_color || '#3b82f6'}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-50 border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={settings.primary_color || '#3b82f6'}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Cor Secundária</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={settings.secondary_color || '#06b6d4'}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 bg-gray-50 border-gray-200 cursor-pointer"
                      />
                      <Input
                        value={settings.secondary_color || '#06b6d4'}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="bg-gray-50 border-gray-200 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">Preview das cores</p>
                  <div className="flex gap-4">
                    <div 
                      className="w-20 h-20 rounded-xl shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: settings.primary_color }}
                    >
                      <span className="text-white text-xs font-medium">Primária</span>
                    </div>
                    <div 
                      className="w-20 h-20 rounded-xl shadow-lg flex items-center justify-center"
                      style={{ backgroundColor: settings.secondary_color }}
                    >
                      <span className="text-white text-xs font-medium">Secundária</span>
                    </div>
                    <div 
                      className="flex-1 h-20 rounded-xl shadow-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` }}
                    >
                      <span className="text-white text-sm font-medium">Gradiente</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Configurações Avançadas
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Opções avançadas da loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Loja Ativa</p>
                    <p className="text-sm text-gray-500">
                      Quando desativada, a loja não será exibida publicamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.is_active}
                    onCheckedChange={(checked) => handleChange('is_active', checked)}
                  />
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Domínio Personalizado</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Em breve você poderá configurar um domínio personalizado para sua loja.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
