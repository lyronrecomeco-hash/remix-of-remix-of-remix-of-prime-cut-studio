/**
 * CAKTO HUB - Central view para gerenciar Cakto de todas as instâncias
 * Acessível pelo menu dock do GenesisPanel
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, AlertCircle, Settings2, ArrowRight } from 'lucide-react';
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
        // Buscar instâncias
        const { data: instancesData } = await supabase
          .from('genesis_instances')
          .select('id, name, status')
          .eq('user_id', genesisUser.id)
          .order('name');

        // Buscar integrações Cakto
        const { data: integrationsData } = await supabase
          .from('genesis_instance_integrations')
          .select('id, instance_id, status, store_name')
          .eq('user_id', genesisUser.id)
          .eq('provider', 'cakto');

        setInstances(instancesData || []);
        setIntegrations((integrationsData || []) as CaktoIntegration[]);

        // Auto-selecionar primeira instância com Cakto conectado
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center">
            <img src={caktoLogo} alt="Cakto" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cakto</h1>
            <p className="text-muted-foreground">Integração com Infoprodutos</p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Você precisa criar uma instância WhatsApp primeiro para conectar a Cakto.
            </p>
            <Button variant="outline">Criar Instância</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
            <img src={caktoLogo} alt="Cakto" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cakto</h1>
            <p className="text-muted-foreground">Integração com Infoprodutos</p>
          </div>
        </div>

        <Badge variant="secondary" className="gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          {connectedCount} conectada{connectedCount !== 1 ? 's' : ''}
        </Badge>
      </motion.div>

      {/* Lista de Instâncias */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {instances.map((instance, index) => {
          const integration = getIntegrationForInstance(instance.id);
          const isConnected = integration?.status === 'connected';

          return (
            <motion.div
              key={instance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:border-primary/50 transition-colors ${isConnected ? 'border-green-500/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <img src={caktoLogo} alt="Cakto" className="w-6 h-6 object-contain opacity-80" />
                      </div>
                      <div>
                        <p className="font-medium">{instance.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {integration?.store_name || 'Não conectado'}
                        </p>
                      </div>
                    </div>
                    {isConnected ? (
                      <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px]">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                        Inativo
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isConnected ? (
                      <Button 
                        className="flex-1 gap-1.5" 
                        size="sm"
                        onClick={() => handleOpenPanel(instance.id)}
                      >
                        Gerenciar
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-1.5" 
                        size="sm"
                        onClick={() => handleConnectCakto(instance.id)}
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        Conectar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
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
