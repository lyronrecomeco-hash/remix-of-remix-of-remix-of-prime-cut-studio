/**
 * GENESIS CAMPAIGNS - Campaign Test Section
 * Permite enviar mensagem de teste antes de criar a campanha
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendMessageWithRetry } from '@/lib/sendWithRetry';
import { cn } from '@/lib/utils';

interface CampaignTestSectionProps {
  instanceId: string;
  instanceName: string;
  instanceStatus?: string;
  messageTemplate: string;
  lunaEnabled: boolean;
  lunaVariations?: string[];
}

interface TestResult {
  status: 'idle' | 'sending' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
}

export function CampaignTestSection({
  instanceId,
  instanceName,
  instanceStatus,
  messageTemplate,
  lunaEnabled,
  lunaVariations = [],
}: CampaignTestSectionProps) {
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });
  const [retryInfo, setRetryInfo] = useState<string | null>(null);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  
  // Verificar se a instância está conectada
  const isInstanceConnected = instanceStatus === 'connected' || instanceStatus === 'ready';

  // Buscar número de teste salvo
  useEffect(() => {
    const fetchSavedPhone = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;

        // @ts-ignore - TypeScript depth issue workaround
        const response = await (supabase
          .from('genesis_users')
          .select('whatsapp_test, whatsapp_commercial')
          .eq('user_id', user.id)
          .maybeSingle() as Promise<{ data: any; error: any }>);

        if (!response.error && response.data) {
          const phone = response.data.whatsapp_test || response.data.whatsapp_commercial;
          if (phone) {
            setSavedPhone(phone);
            setTestPhone(phone);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar telefone:', error);
      }
    };

    fetchSavedPhone();
  }, []);

  const normalizePhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
      return `55${digits}`;
    }
    return digits;
  };

  const getMessageToSend = (): string => {
    // Se Luna está habilitada e temos variações, usar a primeira
    if (lunaEnabled && lunaVariations.length > 0) {
      return `🧪 [TESTE] ${lunaVariations[0]}`;
    }
    // Senão, usar o template original
    return `🧪 [TESTE] ${messageTemplate}`;
  };

  const handleSendTest = async () => {
    // Verificar se a instância está conectada
    if (!isInstanceConnected) {
      toast.error('WhatsApp desconectado! Conecte o WhatsApp antes de enviar mensagens.');
      setTestResult({
        status: 'error',
        message: 'A instância não está conectada. Escaneie o QR Code para conectar o WhatsApp.',
        timestamp: new Date(),
      });
      return;
    }
    
    if (!testPhone.trim()) {
      toast.error('Digite um número de telefone para teste');
      return;
    }

    if (!messageTemplate.trim()) {
      toast.error('Configure uma mensagem antes de testar');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(testPhone);
    
    if (normalizedPhone.length < 10) {
      toast.error('Número de telefone inválido');
      return;
    }

    setTestResult({ status: 'sending' });
    setRetryInfo(null);

    try {
      const messageToSend = getMessageToSend();

      // Usar sendMessageWithRetry para suporte completo a VPS
      const result = await sendMessageWithRetry(
        instanceId,
        normalizedPhone,
        messageToSend,
        {
          maxRetries: 5,
          baseDelay: 1500,
          maxDelay: 10000,
          onRetry: (attempt, error, nextDelay) => {
            setRetryInfo(`Tentativa ${attempt} (${error}). Retentando em ${Math.round(nextDelay / 1000)}s...`);
          },
        }
      );

      if (result.success) {
        setTestResult({
          status: 'success',
          message: 'Mensagem de teste enviada com sucesso!',
          timestamp: new Date(),
        });
        toast.success('Teste enviado com sucesso!');

        // Registrar no log
        await supabase.from('genesis_event_logs').insert({
          instance_id: instanceId,
          event_type: 'campaign_test_sent',
          severity: 'info',
          message: `Teste de campanha enviado para ${normalizedPhone}`,
          details: {
            to: normalizedPhone,
            message: messageToSend,
            luna_enabled: lunaEnabled,
            attempts: result.attempts,
          },
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      setTestResult({
        status: 'error',
        message: errorMessage,
        timestamp: new Date(),
      });
      toast.error(`Erro no teste: ${errorMessage}`);

      // Registrar falha
      await supabase.from('genesis_event_logs').insert({
        instance_id: instanceId,
        event_type: 'campaign_test_failed',
        severity: 'error',
        message: `Falha no teste de campanha para ${normalizedPhone}`,
        details: {
          to: normalizedPhone,
          error: errorMessage,
        },
      });
    } finally {
      setRetryInfo(null);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Testar Campanha</h3>
          <Badge variant="outline" className="text-xs">Opcional</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Envie uma mensagem de teste para verificar se tudo está configurado corretamente antes de criar a campanha.
        </p>

        {/* Aviso de instância desconectada */}
        {!isInstanceConnected && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                WhatsApp Desconectado
              </p>
              <p className="text-amber-600/80 dark:text-amber-400/80">
                Conecte o WhatsApp escaneando o QR Code para enviar mensagens
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="test-phone" className="text-sm">
              Número de teste
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="test-phone"
                type="tel"
                placeholder="11999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="pl-10"
                disabled={testResult.status === 'sending' || !isInstanceConnected}
              />
            </div>
            {savedPhone && testPhone !== savedPhone && (
              <button
                type="button"
                onClick={() => setTestPhone(savedPhone)}
                className="text-xs text-primary hover:underline"
              >
                Usar número salvo: {savedPhone}
              </button>
            )}
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSendTest}
              disabled={testResult.status === 'sending' || !testPhone.trim() || !messageTemplate.trim() || !isInstanceConnected}
              className="gap-2"
              variant={!isInstanceConnected ? "outline" : "default"}
            >
              {testResult.status === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Teste
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Retry Info */}
        {retryInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            {retryInfo}
          </motion.div>
        )}

        {/* Test Result */}
        {testResult.status !== 'idle' && testResult.status !== 'sending' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              testResult.status === 'success' 
                ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
            )}
          >
            {testResult.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{testResult.message}</p>
              {testResult.timestamp && (
                <p className="text-xs opacity-75">
                  {testResult.timestamp.toLocaleTimeString()}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Luna Preview */}
        {lunaEnabled && lunaVariations.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
            <Sparkles className="w-4 h-4 text-violet-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-violet-700 dark:text-violet-400">
                Luna AI Ativada
              </p>
              <p className="text-violet-600/80 dark:text-violet-400/80">
                O teste usará a primeira variação gerada pela Luna
              </p>
            </div>
          </div>
        )}

        {/* Instance Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          Instância: <span className="font-medium">{instanceName}</span>
        </div>
      </CardContent>
    </Card>
  );
}
