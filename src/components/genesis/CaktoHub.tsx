/**
 * CAKTO HUB - Central para gerenciar Cakto de todas as instâncias
 * Layout organizado e profissional
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
  Settings2, 
  ArrowRight,
  Smartphone,
  Link2,
  Zap
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

export function CaktoHub() {
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

  const refetchIntegrations = async () => {
    if (!genesisUser?.id) return;
    const { data } = await supabase
      .from('genesis_instance_integrations')
      .select('id, instance_id, status, store_name')
      .eq('user_id', genesisUser.id)
      .eq('provider', 'cakto');
    setIntegrations((data || []) as CaktoIntegration[]);
  };

  if (showPanel && selectedInstanceId) {
    return (
      <CaktoPanel 
        instanceId={selectedInstanceId} 
        onBack={() => setShowPanel(false)} 
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
      <div className="space-y-6">
        <Header connectedCount={0} />
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <Smartphone className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <p className="text-muted-foreground">
                Crie uma instância WhatsApp para conectar a Cakto
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header connectedCount={connectedCount} />

      {/* Lista de Instâncias */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

// Header Component
function Header({ connectedCount }: { connectedCount: number }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white border-2 border-border flex items-center justify-center shadow-sm">
          <img src={caktoLogo} alt="Cakto" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Cakto</h2>
          <p className="text-sm text-muted-foreground">Integração com Infoprodutos</p>
        </div>
      </div>
      
      {connectedCount > 0 && (
        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {connectedCount} conectada{connectedCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}

// Instance Card Component
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
      transition-all duration-200 hover:shadow-lg
      ${isConnected 
        ? 'border-emerald-500/40 bg-emerald-500/5' 
        : 'hover:border-primary/40'
      }
    `}>
      <CardContent className="p-5">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-11 h-11 rounded-lg flex items-center justify-center
              ${isConnected 
                ? 'bg-emerald-500/15 border border-emerald-500/30' 
                : 'bg-muted border border-border'
              }
            `}>
              <img src={caktoLogo} alt="" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <p className="font-semibold">{instance.name}</p>
              <p className="text-sm text-muted-foreground">
                {integration?.store_name || 'Cakto'}
              </p>
            </div>
          </div>
          
          {isConnected ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Ativo
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Inativo
            </Badge>
          )}
        </div>

        {/* Botão de Ação */}
        <Button 
          variant={isConnected ? "default" : "outline"}
          className="w-full gap-2"
          onClick={isConnected ? onManage : onConnect}
        >
          {isConnected ? (
            <>
              Gerenciar
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Conectar Cakto
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
