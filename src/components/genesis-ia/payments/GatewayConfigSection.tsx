/**
 * Gateway Configuration Section - Cakto Only
 * Configura as credenciais da Cakto (client_id e client_secret)
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function GatewayConfigSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [maskedClientId, setMaskedClientId] = useState('');
  const [maskedSecret, setMaskedSecret] = useState('');
  
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showClientId, setShowClientId] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('checkout_gateway_config')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('gateway', 'cakto')
        .maybeSingle();

      if (data) {
        setConfigId(data.id);
        setIsConfigured(data.api_key_configured);
        // Show censored versions of credentials
        if (data.cakto_client_id_hash) {
          const hash = data.cakto_client_id_hash as string;
          setMaskedClientId(`${hash.substring(0, 6)}••••••••${hash.substring(hash.length - 4)}`);
        }
        if (data.cakto_client_secret_hash) {
          const hash = data.cakto_client_secret_hash as string;
          setMaskedSecret(`${hash.substring(0, 6)}••••••••${hash.substring(hash.length - 4)}`);
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error('Preencha o Client ID e Client Secret');
      return;
    }

    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Não autenticado');

      const { data, error } = await supabase.functions.invoke('checkout-save-gateway-key', {
        body: {
          gateway: 'cakto',
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim(),
        }
      });

      if (error) throw error;

      toast.success('Credenciais da Cakto salvas com sucesso!');
      setIsConfigured(true);
      setClientId('');
      setClientSecret('');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar credenciais');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Gateway de Pagamento</h3>
          <p className="text-sm text-muted-foreground">Configure as credenciais da Cakto</p>
        </div>
        <a
          href="https://app.cakto.com.br/dashboard/cakto-api"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          Painel Cakto <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <Card className="bg-white/5 border-white/10" style={{ borderRadius: '14px' }}>
        <CardContent className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Cakto</h4>
                <p className="text-xs text-muted-foreground">Plataforma de pagamentos</p>
              </div>
            </div>
            <Badge className={isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
              {isConfigured ? (
                <><Check className="w-3 h-3 mr-1" /> Configurado</>
              ) : (
                'Pendente'
              )}
            </Badge>
          </div>

          {/* Show configured credentials (censored) */}
          {isConfigured && (maskedClientId || maskedSecret) && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Credenciais salvas (censuradas)
              </p>
              {maskedClientId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Client ID:</span>
                  <code className="text-xs font-mono text-foreground/70 bg-white/5 px-2 py-0.5 rounded">{maskedClientId}</code>
                </div>
              )}
              {maskedSecret && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Client Secret:</span>
                  <code className="text-xs font-mono text-foreground/70 bg-white/5 px-2 py-0.5 rounded">{maskedSecret}</code>
                </div>
              )}
            </div>
          )}

          {/* Credentials Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Client ID</Label>
              <div className="relative">
                <Input
                  type={showClientId ? 'text' : 'password'}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder={isConfigured ? '••••••••••••' : 'Cole seu Client ID da Cakto'}
                  className="bg-white/5 border-white/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowClientId(!showClientId)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showClientId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-foreground">Client Secret</Label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder={isConfigured ? '••••••••••••' : 'Cole seu Client Secret da Cakto'}
                  className="bg-white/5 border-white/10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={saveConfig}
              disabled={isSaving || (!clientId.trim() && !clientSecret.trim())}
              className="w-full gap-2"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4" /> {isConfigured ? 'Atualizar Credenciais' : 'Salvar Credenciais'}</>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-medium text-foreground">Como obter as credenciais:</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Acesse o <a href="https://app.cakto.com.br/dashboard/cakto-api" target="_blank" className="text-primary hover:underline">Painel Cakto</a></li>
                  <li>Vá em Integrações → Cakto API</li>
                  <li>Crie uma Chave de API</li>
                  <li>Copie o <strong>Client ID</strong> e <strong>Client Secret</strong></li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
