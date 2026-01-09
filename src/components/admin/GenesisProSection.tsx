import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  TestTube, 
  Zap, 
  Link2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface GenesisInstance {
  id: string;
  name: string;
  status: string;
  phone_number?: string;
}

interface ChatProConfig {
  id: string;
  api_token: string | null;
  instance_id: string | null;
  base_endpoint: string;
  is_enabled: boolean;
}

interface GenesisProSectionProps {
  chatproConfig: ChatProConfig | null;
  updateChatProConfig: (updates: Partial<ChatProConfig>) => Promise<void>;
  chatproLoading: boolean;
  testPhone: string;
  setTestPhone: (phone: string) => void;
  testChatProConnection: () => Promise<void>;
  testingChatPro: boolean;
  userEmail: string;
}

export default function GenesisProSection({
  chatproConfig,
  updateChatProConfig,
  chatproLoading,
  testPhone,
  setTestPhone,
  testChatProConnection,
  testingChatPro,
  userEmail,
}: GenesisProSectionProps) {
  const { notify } = useNotification();
  const [genesisInstance, setGenesisInstance] = useState<GenesisInstance | null>(null);
  const [loadingGenesis, setLoadingGenesis] = useState(true);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchGenesisInstance();
  }, [userEmail]);

  const fetchGenesisInstance = async () => {
    if (!userEmail) {
      setLoadingGenesis(false);
      return;
    }

    setLoadingGenesis(true);
    try {
      // Find genesis user by email
      const { data: genesisUser } = await supabase
        .from('genesis_users')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (genesisUser) {
        // Find connected instance
        const { data: instance } = await supabase
          .from('genesis_instances')
          .select('id, name, status, phone_number')
          .eq('user_id', genesisUser.id)
          .eq('status', 'connected')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (instance) {
          setGenesisInstance(instance);
          
          // Auto-link if not already linked
          if (!chatproConfig?.instance_id || chatproConfig.instance_id !== instance.id) {
            await autoLinkInstance(instance);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Genesis instance:', error);
    }
    setLoadingGenesis(false);
  };

  const autoLinkInstance = async (instance: GenesisInstance) => {
    setLinking(true);
    try {
      await updateChatProConfig({
        is_enabled: true,
        instance_id: instance.id,
        base_endpoint: 'genesis-native',
        api_token: 'genesis-auto-linked',
      });
      notify.success('GenesisPro vinculado automaticamente!');
    } catch (error) {
      console.error('Error auto-linking instance:', error);
    }
    setLinking(false);
  };

  const handleManualLink = async () => {
    if (genesisInstance) {
      await autoLinkInstance(genesisInstance);
    }
  };

  const isLinked = chatproConfig?.instance_id && 
    (chatproConfig.base_endpoint === 'genesis-native' || genesisInstance?.id === chatproConfig.instance_id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-bold">Integração GenesisPro</h3>
        </div>
        <button
          onClick={() => chatproConfig && updateChatProConfig({ is_enabled: !chatproConfig.is_enabled })}
          disabled={chatproLoading}
          className={`w-14 h-7 rounded-full transition-colors relative ${
            chatproConfig?.is_enabled ? 'bg-green-500' : 'bg-secondary'
          }`}
        >
          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
            chatproConfig?.is_enabled ? 'left-8' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <p className="text-sm text-green-400">
          💡 O GenesisPro é nossa integração nativa de WhatsApp. Se você tem conta no /genesis com o mesmo email, 
          a instância é detectada automaticamente!
        </p>
      </div>

      {loadingGenesis ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : genesisInstance ? (
        <div className="space-y-4">
          {/* Instance Found */}
          <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{genesisInstance.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {genesisInstance.phone_number || 'Número não disponível'}
                  </p>
                </div>
              </div>
              <Badge variant={genesisInstance.status === 'connected' ? 'default' : 'secondary'}>
                {genesisInstance.status === 'connected' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> {genesisInstance.status}</>
                )}
              </Badge>
            </div>

            {isLinked ? (
              <div className="flex items-center gap-2 text-sm text-green-500">
                <Link2 className="w-4 h-4" />
                <span>Vinculado ao GenesisPro</span>
              </div>
            ) : (
              <Button 
                onClick={handleManualLink} 
                disabled={linking}
                className="w-full gap-2"
                variant="outline"
              >
                {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Vincular esta instância
              </Button>
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchGenesisInstance}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar status
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* No Instance Found */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-400">
              ⚠️ Nenhuma instância Genesis conectada encontrada para <strong>{userEmail}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
            <p className="text-sm text-muted-foreground">
              Para usar o GenesisPro, você precisa:
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Acessar o painel Genesis</li>
              <li>Criar uma instância WhatsApp</li>
              <li>Escanear o QR Code para conectar</li>
            </ol>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => window.open('/genesis', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Acessar Genesis
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchGenesisInstance}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Verificar novamente
          </Button>
        </div>
      )}

      {/* Test Section */}
      {chatproConfig?.is_enabled && isLinked && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="font-medium">Testar Envio</h4>
          <div className="flex items-center gap-3">
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="5511999999999"
              className="h-11 flex-1"
            />
            <Button 
              variant="outline" 
              onClick={testChatProConnection} 
              disabled={testingChatPro} 
              className="h-11 px-4"
            >
              {testingChatPro ? <Loader2 className="w-5 h-5 animate-spin" /> : <TestTube className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
