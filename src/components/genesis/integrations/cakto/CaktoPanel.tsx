/**
 * CAKTO PANEL - Painel principal da integração Cakto
 * Exibido quando o ícone Cakto é clicado no menu da instância
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings2, BarChart3, Zap, History, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaktoDashboard } from './CaktoDashboard';
import { CaktoEventRules } from './CaktoEventRules';
import { CaktoEventsLog } from './CaktoEventsLog';
import { CaktoSimulator } from './CaktoSimulator';
import { CaktoConfigModal } from './CaktoConfigModal';
import { useCaktoIntegration } from './hooks/useCaktoIntegration';
import caktoLogo from '@/assets/integrations/cakto-logo.png';

interface CaktoPanelProps {
  instanceId: string;
  onBack: () => void;
}

export function CaktoPanel({ instanceId, onBack }: CaktoPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showConfig, setShowConfig] = useState(false);
  const { integration, loading, refetch } = useCaktoIntegration(instanceId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center shadow-sm">
              <img 
                src={caktoLogo} 
                alt="Cakto" 
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Cakto</h1>
              <p className="text-sm text-muted-foreground">Plataforma de Infoprodutos</p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setShowConfig(true)}
        >
          <Settings2 className="w-4 h-4" />
          Configurações
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2">
            <TestTube2 className="w-4 h-4" />
            <span className="hidden sm:inline">Simulador</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <CaktoDashboard instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <CaktoEventRules instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <CaktoEventsLog instanceId={instanceId} />
        </TabsContent>

        <TabsContent value="simulator" className="mt-4">
          <CaktoSimulator instanceId={instanceId} />
        </TabsContent>
      </Tabs>

      {/* Config Modal */}
      <CaktoConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        instanceId={instanceId}
        existingIntegration={integration}
        onSuccess={refetch}
      />
    </motion.div>
  );
}
