import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import {
  Link2,
  Check,
  X,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';

// Import cakto logo
import caktoLogo from '@/assets/integrations/cakto-logo.png';

// Provider configs with required fields
const PROVIDER_CONFIGS: Record<string, {
  name: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; required: boolean; type?: string }[];
  testEndpoint?: string;
  docs: string;
  customModal?: boolean;
}> = {
  shopify: {
    name: 'Shopify',
    description: 'Conecte sua loja Shopify para automações de e-commerce',
    fields: [
      { key: 'store_name', label: 'Nome da Loja', placeholder: 'minha-loja.myshopify.com', required: true },
      { key: 'api_key', label: 'API Key', placeholder: 'Sua API Key', required: true },
      { key: 'api_secret', label: 'API Secret', placeholder: 'Seu API Secret', required: true, type: 'password' },
      { key: 'access_token', label: 'Access Token', placeholder: 'Seu Access Token', required: true, type: 'password' },
    ],
    docs: 'https://shopify.dev/docs/apps/auth/admin-app-access-tokens',
  },
  woocommerce: {
    name: 'WooCommerce',
    description: 'Integre seu WordPress com WooCommerce',
    fields: [
      { key: 'store_url', label: 'URL da Loja', placeholder: 'https://minha-loja.com.br', required: true },
      { key: 'consumer_key', label: 'Consumer Key', placeholder: 'ck_...', required: true },
      { key: 'consumer_secret', label: 'Consumer Secret', placeholder: 'cs_...', required: true, type: 'password' },
    ],
    docs: 'https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication',
  },
  nuvemshop: {
    name: 'Nuvemshop',
    description: 'Conecte sua loja Nuvemshop',
    fields: [
      { key: 'store_id', label: 'ID da Loja', placeholder: '123456', required: true },
      { key: 'access_token', label: 'Access Token', placeholder: 'Seu Access Token', required: true, type: 'password' },
    ],
    docs: 'https://tiendanube.github.io/api-documentation/authentication',
  },
  mercadoshops: {
    name: 'Mercado Shops',
    description: 'Integre com Mercado Shops (Mercado Livre)',
    fields: [
      { key: 'client_id', label: 'App ID', placeholder: 'Seu App ID', required: true },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Seu Client Secret', required: true, type: 'password' },
      { key: 'access_token', label: 'Access Token', placeholder: 'Seu Access Token', required: true, type: 'password' },
      { key: 'refresh_token', label: 'Refresh Token', placeholder: 'Seu Refresh Token', required: false, type: 'password' },
    ],
    docs: 'https://developers.mercadolibre.com.ar/es_ar/autenticacion-y-autorizacion',
  },
  rdstation: {
    name: 'RD Station',
    description: 'Conecte seu CRM RD Station Marketing',
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: 'Seu Client ID', required: true },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Seu Client Secret', required: true, type: 'password' },
      { key: 'access_token', label: 'Access Token', placeholder: 'Seu Access Token', required: true, type: 'password' },
      { key: 'refresh_token', label: 'Refresh Token', placeholder: 'Seu Refresh Token', required: false, type: 'password' },
    ],
    docs: 'https://developers.rdstation.com/reference/autenticacao',
  },
  cakto: {
    name: 'Cakto',
    description: 'Conecte sua plataforma Cakto para automações de infoprodutos',
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: 'Seu Client ID da Cakto', required: true },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Seu Client Secret da Cakto', required: true, type: 'password' },
    ],
    docs: 'https://docs.cakto.com.br/introduction',
    customModal: false, // Uses the standard modal with custom handling
  },
};

interface Integration {
  id: string;
  provider: string;
  status: string;
  store_url?: string;
  store_name?: string;
  error_message?: string;
  last_sync_at?: string;
}

interface IntegrationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: string | null;
  instanceId: string;
  existingIntegration?: Integration | null;
  onSuccess: () => void;
}

export function IntegrationConfigModal({
  isOpen,
  onClose,
  provider,
  instanceId,
  existingIntegration,
  onSuccess,
}: IntegrationConfigModalProps) {
  const { genesisUser } = useGenesisAuth();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const config = provider ? PROVIDER_CONFIGS[provider] : null;
  const isEditMode = !!existingIntegration;

  // Reset form when provider changes
  useEffect(() => {
    if (provider && config) {
      const initialData: Record<string, string> = {};
      config.fields.forEach(field => {
        initialData[field.key] = '';
      });
      // Pre-fill store URL/name if available
      if (existingIntegration?.store_url) {
        initialData.store_url = existingIntegration.store_url;
      }
      if (existingIntegration?.store_name) {
        initialData.store_name = existingIntegration.store_name;
      }
      setFormData(initialData);
      setTestResult(null);
    }
  }, [provider, existingIntegration]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!provider || !config) return;

    // Validate required fields
    const missingFields = config.fields
      .filter(f => f.required && !formData[f.key]?.trim())
      .map(f => f.label);

    if (missingFields.length > 0) {
      setTestResult({
        success: false,
        message: `Campos obrigatórios: ${missingFields.join(', ')}`,
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-integration-manager', {
        body: {
          action: 'test',
          provider,
          credentials: formData,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setTestResult({
          success: true,
          message: data.message || 'Conexão estabelecida com sucesso!',
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error || 'Falha ao conectar',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao testar conexão',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveIntegration = async () => {
    if (!provider || !config || !genesisUser?.id) return;

    // Validate required fields
    const missingFields = config.fields
      .filter(f => f.required && !formData[f.key]?.trim())
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast.error(`Preencha: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke('genesis-integration-manager', {
        body: {
          action: isEditMode ? 'update' : 'create',
          provider,
          instanceId,
          userId: genesisUser.id,
          credentials: formData,
          storeUrl: formData.store_url,
          storeName: formData.store_name,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(isEditMode ? 'Integração atualizada!' : 'Integração conectada!');
        onSuccess();
        onClose();
      } else {
        throw new Error(data?.error || 'Falha ao salvar');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar integração');
    } finally {
      setSaving(false);
    }
  };

  const disconnectIntegration = async () => {
    if (!existingIntegration) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('genesis_instance_integrations')
        .delete()
        .eq('id', existingIntegration.id);

      if (error) throw error;

      toast.success('Integração desconectada');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Erro ao desconectar');
    } finally {
      setDeleting(false);
    }
  };

  if (!provider || !config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            {isEditMode ? 'Configurar' : 'Conectar'} {config.name}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status badge for existing integrations */}
          {existingIntegration && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Badge variant={existingIntegration.status === 'connected' ? 'default' : 'secondary'}>
                {existingIntegration.status === 'connected' ? 'Conectado' : 
                 existingIntegration.status === 'error' ? 'Erro' : 'Pendente'}
              </Badge>
              {existingIntegration.error_message && (
                <span className="text-sm text-destructive">{existingIntegration.error_message}</span>
              )}
            </div>
          )}

          {/* Dynamic fields */}
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={field.key}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                value={formData[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
              />
            </div>
          ))}

          {/* Test result */}
          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {testResult.success ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          {/* Documentation link */}
          <a
            href={config.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Como obter as credenciais?
          </a>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditMode && (
            <Button
              variant="destructive"
              onClick={disconnectIntegration}
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Desconectar
            </Button>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || saving}
              className="flex-1 sm:flex-none"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Testar
            </Button>
            
            <Button
              onClick={saveIntegration}
              disabled={saving || testing}
              className="flex-1 sm:flex-none"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isEditMode ? 'Salvar' : 'Conectar'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
