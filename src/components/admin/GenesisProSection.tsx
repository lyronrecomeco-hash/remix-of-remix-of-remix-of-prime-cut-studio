import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { 
  Loader2, 
  TestTube, 
  Zap, 
  Link2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  RefreshCw,
  Smartphone,
  X
} from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface GenesisInstance {
  id: string;
  name: string;
  status: string;
  orchestrated_status?: string;
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
  const [allInstances, setAllInstances] = useState<GenesisInstance[]>([]);
  const [loadingGenesis, setLoadingGenesis] = useState(true);
  const [linking, setLinking] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchGenesisInstance();
    }
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
        // Find ALL instances for this user
        const { data: instances } = await supabase
          .from('genesis_instances')
          .select('id, name, status, orchestrated_status, phone_number')
          .eq('user_id', genesisUser.id)
          .order('updated_at', { ascending: false });

        if (instances && instances.length > 0) {
          setAllInstances(instances);
          // Set the first connected one as default (use orchestrated_status)
          const connectedInstance = instances.find(i => i.orchestrated_status === 'connected' || i.status === 'connected') || instances[0];
          setGenesisInstance(connectedInstance);
        } else {
          setAllInstances([]);
          setGenesisInstance(null);
        }
      } else {
        setAllInstances([]);
        setGenesisInstance(null);
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

  const handleToggleClick = () => {
    if (!chatproConfig?.is_enabled) {
      // Opening - show modal to select/confirm instance
      setShowModal(true);
      fetchGenesisInstance();
    } else {
      // Closing - just disable
      updateChatProConfig({ is_enabled: false });
    }
  };

  const handleSelectInstance = async (instance: GenesisInstance) => {
    setLinking(true);
    try {
      await updateChatProConfig({
        is_enabled: true,
        instance_id: instance.id,
        base_endpoint: 'genesis-native',
        api_token: 'genesis-auto-linked',
      });
      // Refresh instance status after linking
      await fetchGenesisInstance();
      notify.success('GenesisPro ativado!', `Instância "${instance.name}" vinculada`);
      setShowModal(false);
    } catch (error) {
      console.error('Error linking instance:', error);
      notify.error('Erro ao vincular instância');
    }
    setLinking(false);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-bold">Integração GenesisPro</h3>
          </div>
          <button
            onClick={handleToggleClick}
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

        {chatproConfig?.is_enabled && isLinked && genesisInstance && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-green-400">{genesisInstance.name}</p>
                  <p className="text-sm text-green-500/70">
                    {genesisInstance.phone_number || 'Conectado'}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
              </Badge>
            </div>

            {/* Test Section */}
            <div className="pt-3 border-t border-green-500/20 space-y-2">
              <p className="text-sm text-green-400/80">Testar envio:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="5511999999999"
                  className="h-10 flex-1 bg-background/50 border-green-500/30"
                />
                <Button 
                  variant="outline" 
                  onClick={testChatProConnection} 
                  disabled={testingChatPro} 
                  className="h-10 px-4 border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  {testingChatPro ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!chatproConfig?.is_enabled && (
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm text-muted-foreground">
              💡 Ative para enviar notificações automáticas via WhatsApp usando sua instância Genesis.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Seleção de Instância */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ativar GenesisPro"
        size="md"
      >
        <ModalBody>
          {loadingGenesis ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              <p className="text-muted-foreground">Buscando instâncias...</p>
            </div>
          ) : allInstances.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione a instância que deseja usar para enviar notificações:
              </p>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allInstances.map((instance) => {
                  const actualStatus = instance.orchestrated_status || instance.status;
                  const isConnected = actualStatus === 'connected';
                  return (
                    <button
                      key={instance.id}
                      onClick={() => handleSelectInstance(instance)}
                      disabled={linking}
                      className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-border hover:border-green-500/50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isConnected ? 'bg-green-500/20' : 'bg-amber-500/20'
                        }`}>
                          <Smartphone className={`w-5 h-5 ${
                            isConnected ? 'text-green-500' : 'text-amber-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{instance.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {instance.phone_number || 'Número não disponível'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isConnected ? 'default' : 'secondary'}
                          className={isConnected ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}
                        >
                          {isConnected ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> {actualStatus === 'qr_pending' ? 'Aguardando QR' : actualStatus}</>
                          )}
                        </Badge>
                        {linking ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Link2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-green-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchGenesisInstance}
                className="gap-2 w-full"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar lista
              </Button>
            </div>
          ) : (
            <div className="space-y-5 py-4">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Nenhuma instância encontrada</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não encontramos instâncias Genesis para <strong>{userEmail}</strong>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <p className="text-sm font-medium">📱 Como ativar o GenesisPro:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li><strong>Acesse o Genesis</strong> - Clique no botão abaixo</li>
                  <li><strong>Crie uma conta</strong> - Se ainda não tiver, faça o cadastro</li>
                  <li><strong>Adicione uma instância</strong> - Crie sua conexão WhatsApp</li>
                  <li><strong>Conecte</strong> - Escaneie o QR Code no WhatsApp</li>
                  <li><strong>Volte aqui</strong> - Atualize e ative o GenesisPro!</li>
                </ol>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          {allInstances.length === 0 && !loadingGenesis ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => window.open('/genesis', '_blank')}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4" />
                Acessar Genesis
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="w-full"
            >
              Cancelar
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}
