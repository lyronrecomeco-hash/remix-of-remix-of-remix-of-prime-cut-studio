/**
 * CAKTO CONFIG MODAL
 * Modal de configuração/conexão da integração Cakto
 */

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
  Check,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
  AlertCircle,
  Copy,
  Link2,
} from 'lucide-react';
import caktoLogo from '@/assets/integrations/cakto-logo.png';

interface CaktoIntegration {
  id: string;
  status: string;
  store_name?: string;
  webhook_url?: string;
  error_message?: string;
  is_active?: boolean;
}

interface CaktoConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
  existingIntegration?: CaktoIntegration | null;
  onSuccess: () => void;
}

export function CaktoConfigModal({
  isOpen,
  onClose,
  instanceId,
  existingIntegration,
  onSuccess,
}: CaktoConfigModalProps) {
  const { genesisUser } = useGenesisAuth();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const isEditMode = !!existingIntegration;
  const webhookUrl = existingIntegration?.webhook_url || 
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cakto-webhook-gateway/${instanceId}`;

  // Reset form quando abre
  useEffect(() => {
    if (isOpen) {
      setClientId('');
      setClientSecret('');
      setTestResult(null);
    }
  }, [isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const testConnection = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      setTestResult({
        success: false,
        message: 'Preencha Client ID e Client Secret',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('cakto-integration-manager', {
        body: {
          action: 'test',
          clientId,
          clientSecret,
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
          message: data?.error || 'Falha ao conectar com a Cakto',
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
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error('Preencha Client ID e Client Secret');
      return;
    }

    if (!genesisUser?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke('cakto-integration-manager', {
        body: {
          action: isEditMode ? 'update' : 'create',
          instanceId,
          userId: genesisUser.id,
          clientId,
          clientSecret,
          integrationId: existingIntegration?.id,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(isEditMode ? 'Integração atualizada!' : 'Cakto conectada!');
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

      toast.success('Cakto desconectada');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Erro ao desconectar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
              <img src={caktoLogo} alt="Cakto" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <span>{isEditMode ? 'Configurar' : 'Conectar'} Cakto</span>
              <p className="text-sm font-normal text-muted-foreground">
                Plataforma de vendas digitais
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status badge */}
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

          {/* Webhook URL */}
          {isEditMode && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">URL do Webhook (configure na Cakto)</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="text-xs font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Client ID */}
          <div className="space-y-2">
            <Label htmlFor="client_id" className="flex items-center gap-1">
              Client ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client_id"
              placeholder="Seu Client ID da Cakto"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setTestResult(null);
              }}
            />
          </div>

          {/* Client Secret */}
          <div className="space-y-2">
            <Label htmlFor="client_secret" className="flex items-center gap-1">
              Client Secret <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client_secret"
              type="password"
              placeholder="Seu Client Secret da Cakto"
              value={clientSecret}
              onChange={(e) => {
                setClientSecret(e.target.value);
                setTestResult(null);
              }}
            />
          </div>

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
            href="https://docs.cakto.com.br/introduction"
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
