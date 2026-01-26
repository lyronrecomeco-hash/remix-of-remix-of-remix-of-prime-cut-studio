import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Building2,
  Save,
  AlertCircle,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { cn } from '@/lib/utils';
import { SubscriptionBillingCard } from './SubscriptionBillingCard';
import { useNavigate } from 'react-router-dom';

export function GenesisMyAccount() {
  const { genesisUser, subscription, credits, refreshUser } = useGenesisAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp_commercial: '',
    whatsapp_test: '',
    company_name: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (genesisUser) {
      setFormData({
        name: genesisUser.name || '',
        email: genesisUser.email || '',
        whatsapp_commercial: genesisUser.whatsapp_commercial || '',
        whatsapp_test: genesisUser.whatsapp_test || '',
        company_name: genesisUser.company_name || '',
      });
    }
  }, [genesisUser]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!genesisUser) {
      toast.error('Usuário não encontrado');
      return;
    }
    
    // Validação básica
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    setSaving(true);
    try {
      const normalizeWhatsApp = (value: string): string | null => {
        const d = (value || '').replace(/\D/g, '');
        if (!d) return null;
        // Normalização BR: se usuário salvar apenas DDD+numero (10/11 dígitos), prefixa DDI 55
        if (!d.startsWith('55') && (d.length === 10 || d.length === 11)) return `55${d}`;
        return d;
      };

      const updateData = {
        name: formData.name.trim(),
        whatsapp_commercial: normalizeWhatsApp(formData.whatsapp_commercial),
        whatsapp_test: normalizeWhatsApp(formData.whatsapp_test),
        company_name: formData.company_name?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('genesis_users')
        .update(updateData)
        .eq('id', genesisUser.id);

      if (error) {
        console.error('Erro ao atualizar:', error);
        throw error;
      }

      // Atualizar contexto após salvar
      await refreshUser();
      
      toast.success('Dados atualizados com sucesso!');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast.error(error?.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const isCommercialConfigured = !!formData.whatsapp_commercial?.replace(/\D/g, '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Minha Conta</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus dados pessoais e comerciais</p>
        </div>
      </motion.div>

      {/* Alert if commercial number not configured */}
      {!isCommercialConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-600">Configure seu número comercial</p>
              <p className="text-sm text-muted-foreground mt-1">
                Para conectar instâncias WhatsApp, primeiro configure seu número comercial ou de teste abaixo.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>Suas informações de identificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa (opcional)</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Commercial Config */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={cn(
            "border-2 transition-colors",
            !isCommercialConfigured && "border-amber-500/50"
          )}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Configurações Comerciais
                {!isCommercialConfigured && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-xs">
                    Obrigatório
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure os números que serão usados nas suas instâncias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_commercial" className="flex items-center gap-2">
                  WhatsApp Comercial
                  <Badge variant="outline" className="text-xs">Principal</Badge>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="whatsapp_commercial"
                    value={formatPhone(formData.whatsapp_commercial)}
                    onChange={(e) => handleChange('whatsapp_commercial', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Este é o número que será conectado nas suas instâncias
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_test">WhatsApp de Teste (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="whatsapp_test"
                    value={formatPhone(formData.whatsapp_test)}
                    onChange={(e) => handleChange('whatsapp_test', e.target.value)}
                    placeholder="(11) 88888-8888"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Número alternativo para testes de automação
                </p>
              </div>

              {isCommercialConfigured && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Pronto para conectar instâncias!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Billing Card */}
      <SubscriptionBillingCard
        plan={subscription?.plan || 'free'}
        planName={subscription?.plan_name}
        status={subscription?.status || 'active'}
        startedAt={subscription?.started_at}
        expiresAt={subscription?.expires_at}
        maxInstances={subscription?.max_instances || 1}
        maxFlows={subscription?.max_flows || 5}
        onRenew={() => navigate('/')}
        onUpgrade={() => navigate('/')}
      />

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
