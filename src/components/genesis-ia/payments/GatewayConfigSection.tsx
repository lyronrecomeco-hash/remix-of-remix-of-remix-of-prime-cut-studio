/**
 * Gateway Configuration Section
 * Permite configurar AbacatePay ou Asaas como gateway de pagamento
 * Visível apenas para lyronrp@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Settings,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GatewayConfig {
  id?: string;
  gateway: 'abacatepay' | 'asaas';
  is_active: boolean;
  api_key_configured: boolean;
  sandbox_mode: boolean;
}

export function GatewayConfigSection() {
  const [configs, setConfigs] = useState<GatewayConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeGateway, setActiveGateway] = useState<'abacatepay' | 'asaas'>('abacatepay');
  
  // Form states
  const [abacateKey, setAbacateKey] = useState('');
  const [asaasKey, setAsaasKey] = useState('');
  const [asaasSandbox, setAsaasSandbox] = useState(true);
  const [showAbacateKey, setShowAbacateKey] = useState(false);
  const [showAsaasKey, setShowAsaasKey] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('checkout_gateway_config')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) throw error;

      if (data) {
        setConfigs(data as GatewayConfig[]);
        const active = data.find(c => c.is_active);
        if (active) {
          setActiveGateway(active.gateway as 'abacatepay' | 'asaas');
        }
        
        // Set sandbox mode from config
        const asaasConfig = data.find(c => c.gateway === 'asaas');
        if (asaasConfig) {
          setAsaasSandbox(asaasConfig.sandbox_mode);
        }
      }
    } catch (error) {
      console.error('Error loading gateway configs:', error);
    }
    setIsLoading(false);
  };

  const saveGatewayConfig = async (gateway: 'abacatepay' | 'asaas', apiKey: string, sandboxMode?: boolean) => {
    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // First, call edge function to securely store the API key
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/checkout-save-gateway-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          gateway,
          apiKey,
          sandboxMode: sandboxMode ?? (gateway === 'asaas' ? asaasSandbox : false),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar configuração');
      }

      toast.success(`Gateway ${gateway === 'asaas' ? 'Asaas' : 'AbacatePay'} configurado com sucesso!`);
      
      // Clear input
      if (gateway === 'abacatepay') {
        setAbacateKey('');
      } else {
        setAsaasKey('');
      }

      await loadConfigs();
    } catch (error) {
      console.error('Error saving gateway config:', error);
      toast.error((error as Error).message || 'Erro ao salvar configuração');
    }
    setIsSaving(false);
  };

  const activateGateway = async (gateway: 'abacatepay' | 'asaas') => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Deactivate all gateways first
      await supabase
        .from('checkout_gateway_config')
        .update({ is_active: false })
        .eq('user_id', user.user.id);

      // Activate selected gateway
      await supabase
        .from('checkout_gateway_config')
        .update({ is_active: true })
        .eq('user_id', user.user.id)
        .eq('gateway', gateway);

      setActiveGateway(gateway);
      toast.success(`${gateway === 'asaas' ? 'Asaas' : 'AbacatePay'} ativado como gateway principal!`);
      await loadConfigs();
    } catch (error) {
      console.error('Error activating gateway:', error);
      toast.error('Erro ao ativar gateway');
    }
  };

  const getConfigForGateway = (gateway: 'abacatepay' | 'asaas'): GatewayConfig | undefined => {
    return configs.find(c => c.gateway === gateway);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const abacateConfig = getConfigForGateway('abacatepay');
  const asaasConfig = getConfigForGateway('asaas');

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5 text-emerald-400" />
          Configuração de Gateways
        </CardTitle>
        <CardDescription className="text-white/60">
          Configure suas integrações de pagamento. Apenas um gateway pode estar ativo por vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="abacatepay" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-sm">
            <TabsTrigger value="abacatepay" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              AbacatePay
              {abacateConfig?.is_active && (
                <Badge variant="default" className="ml-1 bg-emerald-500 text-xs">Ativo</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="asaas" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Asaas
              {asaasConfig?.is_active && (
                <Badge variant="default" className="ml-1 bg-emerald-500 text-xs">Ativo</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* AbacatePay Tab */}
          <TabsContent value="abacatepay" className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">AbacatePay</h4>
                    <p className="text-xs text-white/50">PIX e Cartão de Crédito</p>
                  </div>
                </div>
                {abacateConfig?.api_key_configured ? (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Não configurado
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showAbacateKey ? 'text' : 'password'}
                      value={abacateKey}
                      onChange={(e) => setAbacateKey(e.target.value)}
                      placeholder={abacateConfig?.api_key_configured ? '••••••••••••••••' : 'Cole sua API Key aqui'}
                      className="bg-white/5 border-white/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAbacateKey(!showAbacateKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showAbacateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => saveGatewayConfig('abacatepay', abacateKey)}
                    disabled={!abacateKey || isSaving}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              </div>

              {abacateConfig?.api_key_configured && !abacateConfig.is_active && (
                <Button
                  onClick={() => activateGateway('abacatepay')}
                  variant="outline"
                  className="w-full"
                >
                  Ativar AbacatePay
                </Button>
              )}

              <a
                href="https://www.abacatepay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-emerald-400 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Acessar painel AbacatePay
              </a>
            </div>
          </TabsContent>

          {/* Asaas Tab */}
          <TabsContent value="asaas" className="space-y-4 mt-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Asaas</h4>
                    <p className="text-xs text-white/50">PIX, Cartão e Boleto</p>
                  </div>
                </div>
                {asaasConfig?.api_key_configured ? (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Configurado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Não configurado
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <Label className="text-white/70">Modo Sandbox</Label>
                  <p className="text-xs text-white/40">Use para testes sem cobranças reais</p>
                </div>
                <Switch
                  checked={asaasSandbox}
                  onCheckedChange={setAsaasSandbox}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">API Key (Access Token)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showAsaasKey ? 'text' : 'password'}
                      value={asaasKey}
                      onChange={(e) => setAsaasKey(e.target.value)}
                      placeholder={asaasConfig?.api_key_configured ? '••••••••••••••••' : 'Cole seu Access Token aqui'}
                      className="bg-white/5 border-white/10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAsaasKey(!showAsaasKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showAsaasKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => saveGatewayConfig('asaas', asaasKey, asaasSandbox)}
                    disabled={!asaasKey || isSaving}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </div>
                <p className="text-xs text-white/40">
                  Encontre em: Asaas → Configurações → Integrações → API
                </p>
              </div>

              {asaasConfig?.api_key_configured && !asaasConfig.is_active && (
                <Button
                  onClick={() => activateGateway('asaas')}
                  variant="outline"
                  className="w-full"
                >
                  Ativar Asaas
                </Button>
              )}

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h5 className="text-sm font-medium text-blue-400 mb-2">Configurar Webhook</h5>
                <p className="text-xs text-white/60 mb-2">
                  Configure no painel Asaas para receber notificações de pagamento:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white/5 p-2 rounded font-mono text-white/80 break-all">
                    https://xeloigymjjeejvicadar.supabase.co/functions/v1/checkout-webhook
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText('https://xeloigymjjeejvicadar.supabase.co/functions/v1/checkout-webhook');
                      toast.success('URL copiada!');
                    }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href="https://www.asaas.com/integracao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Acessar painel Asaas
                </a>
                <span className="text-white/20">|</span>
                <a
                  href="https://docs.asaas.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-white/50 hover:underline"
                >
                  Documentação API
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Active Gateway Info */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Gateway Ativo</span>
          </div>
          <p className="text-white text-lg font-bold">
            {activeGateway === 'asaas' ? 'Asaas' : 'AbacatePay'}
          </p>
          <p className="text-xs text-white/50 mt-1">
            Todos os novos pagamentos serão processados por este gateway.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
