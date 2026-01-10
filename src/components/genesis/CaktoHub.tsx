/**
 * CAKTO HUB - Central view para gerenciar Cakto de todas as instâncias
 * Layout profissional, compacto e responsivo
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Se tiver painel aberto, mostra só ele
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
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalInstances = instances.length;

  if (totalInstances === 0) {
    return (
      <div className="space-y-4">
        <Header connectedCount={0} />
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="py-10 text-center space-y-3">
            <Smartphone className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Crie uma instância WhatsApp para conectar a Cakto
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header connectedCount={connectedCount} />

      {/* Lista de Instâncias - Grid compacto */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {instances.map((instance, index) => {
            const integration = getIntegrationForInstance(instance.id);
            const isConnected = integration?.status === 'connected';

            return (
              <motion.div
                key={instance.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
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
    <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
          <img src={caktoLogo} alt="Cakto" className="w-5 h-5 object-contain" />
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">Cakto</h2>
          <p className="text-[11px] text-muted-foreground">Integração Infoprodutos</p>
        </div>
      </div>
      
      {connectedCount > 0 && (
        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 gap-1 text-[10px] h-5">
          <CheckCircle2 className="w-2.5 h-2.5" />
          {connectedCount} ativ{connectedCount === 1 ? 'a' : 'as'}
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
      transition-all duration-200 hover:shadow-md
      ${isConnected 
        ? 'border-emerald-500/30 bg-emerald-500/[0.02]' 
        : 'border-border/60 hover:border-primary/30'
      }
    `}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`
              w-8 h-8 rounded-md flex items-center justify-center shrink-0
              ${isConnected 
                ? 'bg-emerald-500/15' 
                : 'bg-muted/80'
              }
            `}>
              <img src={caktoLogo} alt="" className="w-4 h-4 object-contain opacity-80" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{instance.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {integration?.store_name || 'Cakto'}
              </p>
            </div>
          </div>
          
          {isConnected ? (
            <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px] h-4 px-1.5 shrink-0">
              <Zap className="w-2 h-2 mr-0.5" />
              Ativo
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 shrink-0">
              <AlertCircle className="w-2 h-2 mr-0.5" />
              Off
            </Badge>
          )}
        </div>

        <Button 
          variant={isConnected ? "default" : "outline"}
          size="sm"
          className="w-full h-7 text-xs gap-1.5"
          onClick={isConnected ? onManage : onConnect}
        >
          {isConnected ? (
            <>
              Gerenciar
              <ArrowRight className="w-3 h-3" />
            </>
          ) : (
            <>
              <Link2 className="w-3 h-3" />
              Conectar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
