/**
 * CAKTO HUB - Central para gerenciar Cakto de todas as instâncias
 * Layout profissional e organizado
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Smartphone,
  Link2,
  Zap,
  Settings2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { CaktoPanel } from './integrations/cakto/CaktoPanel';
import { CaktoConfigModal } from './integrations/cakto/CaktoConfigModal';
import caktoLogo from '@/assets/integrations/cakto-logo.png';

interface Instance {
  id: string;
  name: string;
  status: string;
}

interface CaktoIntegration {
  id: string;
  instance_id: string;
  status: string;
  store_name?: string;
}

interface CaktoHubProps {
  onFocusModeChange?: (isFocused: boolean) => void;
}

export function CaktoHub({ onFocusModeChange }: CaktoHubProps) {
  const { genesisUser } = useGenesisAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [integrations, setIntegrations] = useState<CaktoIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configInstanceId, setConfigInstanceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!genesisUser?.id) return;
      setLoading(true);

      try {
        const { data: instancesData } = await supabase
          .from('genesis_instances')
          .select('id, name, status')
          .eq('user_id', genesisUser.id)
          .order('name');

        const { data: integrationsData } = await supabase
          .from('genesis_instance_integrations')
          .select('id, instance_id, status, store_name')
          .eq('user_id', genesisUser.id)
          .eq('provider', 'cakto');

        setInstances(instancesData || []);
        setIntegrations((integrationsData || []) as CaktoIntegration[]);

        const connectedIntegration = integrationsData?.find(i => i.status === 'connected');
        if (connectedIntegration) {
          setSelectedInstanceId(connectedIntegration.instance_id);
        } else if (instancesData?.length) {
          setSelectedInstanceId(instancesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [genesisUser?.id]);

  // Controla o modo foco quando abre/fecha o painel
  useEffect(() => {
    onFocusModeChange?.(showPanel);
  }, [showPanel, onFocusModeChange]);

  const getIntegrationForInstance = (instanceId: string) => {
    return integrations.find(i => i.instance_id === instanceId);
  };

  const handleConnectCakto = (instanceId: string) => {
    setConfigInstanceId(instanceId);
    setShowConfigModal(true);
  };

  const handleOpenPanel = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    setShowPanel(true);
  };

  const handleBackFromPanel = () => {
    setShowPanel(false);
  };

  const refetchIntegrations = async () => {
    if (!genesisUser?.id) return;
    const { data } = await supabase
      .from('genesis_instance_integrations')
      .select('id, instance_id, status, store_name')
      .eq('user_id', genesisUser.id)
      .eq('provider', 'cakto');
    setIntegrations((data || []) as CaktoIntegration[]);
  };

  // Modo painel - tela cheia para gerenciamento
  if (showPanel && selectedInstanceId) {
    return (
      <CaktoPanel 
        instanceId={selectedInstanceId} 
        onBack={handleBackFromPanel} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalInstances = instances.length;

  if (totalInstances === 0) {
    return (
      <div className="space-y-8">
        <Header connectedCount={0} />
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <Smartphone className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <p className="text-lg text-muted-foreground">
                Crie uma instância WhatsApp para conectar a Cakto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header connectedCount={connectedCount} />

      {/* Lista de Instâncias */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {instances.map((instance, index) => {
            const integration = getIntegrationForInstance(instance.id);
            const isConnected = integration?.status === 'connected';

            return (
              <motion.div
                key={instance.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <InstanceCard
                  instance={instance}
                  integration={integration}
                  isConnected={isConnected}
                  onConnect={() => handleConnectCakto(instance.id)}
                  onManage={() => handleOpenPanel(instance.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Config Modal */}
      {configInstanceId && (
        <CaktoConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setConfigInstanceId(null);
          }}
          instanceId={configInstanceId}
          existingIntegration={null}
          onSuccess={() => {
            refetchIntegrations();
            setShowConfigModal(false);
            setConfigInstanceId(null);
          }}
        />
      )}
    </div>
  );
}

// Header Component - Destaque para a Logo
function Header({ connectedCount }: { connectedCount: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
      <div className="flex items-center gap-5">
        {/* Logo Grande e Destacada */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-2 border-emerald-500/20 flex items-center justify-center shadow-lg">
          <img src={caktoLogo} alt="Cakto" className="w-14 h-14 object-contain" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Cakto</h2>
          <p className="text-base text-muted-foreground">
            Integração com plataforma de Infoprodutos
          </p>
        </div>
      </div>
      
      {connectedCount > 0 && (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-2 px-4 py-2 text-sm font-medium self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          {connectedCount} instância{connectedCount !== 1 ? 's' : ''} conectada{connectedCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}

// Instance Card Component - Profissional e Organizado
interface InstanceCardProps {
  instance: Instance;
  integration?: CaktoIntegration;
  isConnected: boolean;
  onConnect: () => void;
  onManage: () => void;
}

function InstanceCard({ instance, integration, isConnected, onConnect, onManage }: InstanceCardProps) {
  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
      ${isConnected 
        ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/5 to-transparent' 
        : 'hover:border-primary/40 bg-card'
      }
    `}>
      {/* Indicador de status no topo */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      )}

      <CardContent className="p-6">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            {/* Logo da Cakto grande */}
            <div className={`
              w-14 h-14 rounded-xl flex items-center justify-center transition-all
              ${isConnected 
                ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30 shadow-md' 
                : 'bg-muted border-2 border-border'
              }
            `}>
              <img src={caktoLogo} alt="" className="w-9 h-9 object-contain" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{instance.name}</p>
              <p className="text-sm text-muted-foreground">
                {integration?.store_name || 'Cakto Infoprodutos'}
              </p>
            </div>
          </div>
          
          {/* Badge de Status */}
          {isConnected ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span className="font-medium">Ativo</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Inativo</span>
            </Badge>
          )}
        </div>

        {/* Informações Extras quando Conectado */}
        {isConnected && (
          <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-muted-foreground">
              Webhook configurado e recebendo eventos
            </span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button 
            variant={isConnected ? "default" : "outline"}
            className={`flex-1 gap-2 h-11 text-base ${isConnected ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={isConnected ? onManage : onConnect}
          >
            {isConnected ? (
              <>
                <Settings2 className="w-4 h-4" />
                Gerenciar
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Conectar Cakto
              </>
            )}
          </Button>
          
          {isConnected && (
            <Button 
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={onManage}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
