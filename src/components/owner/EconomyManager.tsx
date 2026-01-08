/**
 * Economy Manager - Main Component
 * Owner Panel section for Genesis Economy
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Package,
  Coins,
  Settings2,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EconomyPlansManager from './economy/EconomyPlansManager';
import EconomyCreditsManager from './economy/EconomyCreditsManager';
import EconomyRulesManager from './economy/EconomyRulesManager';
import EconomyAnalyticsDashboard from './economy/EconomyAnalyticsDashboard';

const tabs = [
  { id: 'plans', label: 'Planos', icon: Package, description: 'Gerencie planos de assinatura' },
  { id: 'credits', label: 'Créditos', icon: Coins, description: 'Pacotes de créditos avulsos' },
  { id: 'rules', label: 'Regras', icon: Settings2, description: 'Custos por ação' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Métricas e gráficos' },
];

export default function EconomyManager() {
  const [activeTab, setActiveTab] = useState('plans');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
          <Wallet className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Genesis Economy
            <Badge className="text-xs">Enterprise</Badge>
          </h1>
          <p className="text-muted-foreground">
            Sistema central de economia, planos e créditos
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl h-auto p-1 bg-muted/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm",
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          <TabsContent value="plans" className="mt-0">
            <EconomyPlansManager />
          </TabsContent>

          <TabsContent value="credits" className="mt-0">
            <EconomyCreditsManager />
          </TabsContent>

          <TabsContent value="rules" className="mt-0">
            <EconomyRulesManager />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <EconomyAnalyticsDashboard />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
