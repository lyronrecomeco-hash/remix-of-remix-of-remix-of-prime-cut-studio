/**
 * GENESIS PROFESSIONAL SETTINGS
 * Centralized professional features management
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Clock, 
  Palette, 
  Users, 
  Route, 
  MessageSquare,
  Star,
  UserCheck,
  XCircle,
  Zap,
  Bot,
  Building2,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

// Core Features
import { SecuritySettings } from './SecuritySettings';
import { WorkScheduleSettings } from './WorkScheduleSettings';
import { BrandingSettings } from './BrandingSettings';

// AI Assistant
import { AIAssistant } from './ai/AIAssistant';

// Team Management
import { DepartmentsManager } from './team/DepartmentsManager';
import { RoutingRules } from './team/RoutingRules';
import { InternalChat } from './team/InternalChat';

// Customer Experience
import { NPSSurveys } from './customer/NPSSurveys';
import { ContactAssignments } from './customer/ContactAssignments';
import { ClosureReasons } from './customer/ClosureReasons';
import { QuickRepliesManager } from './customer/QuickRepliesManager';

const categories = [
  {
    id: 'security',
    label: 'Segurança',
    icon: Shield,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    description: 'Políticas de senha e proteção de dados',
  },
  {
    id: 'schedule',
    label: 'Jornada',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Horários de trabalho e acesso',
  },
  {
    id: 'branding',
    label: 'Marca',
    icon: Palette,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Logotipo e personalização',
  },
  {
    id: 'ai',
    label: 'IA Assistente',
    icon: Bot,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Sugestões e automação com IA',
    badge: 'PRO',
  },
  {
    id: 'departments',
    label: 'Departamentos',
    icon: Building2,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Gerenciamento de equipes',
  },
  {
    id: 'routing',
    label: 'Distribuição',
    icon: Route,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Regras de roteamento automático',
  },
  {
    id: 'chat',
    label: 'Chat Interno',
    icon: MessageSquare,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    description: 'Comunicação entre agentes',
  },
  {
    id: 'nps',
    label: 'NPS',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    description: 'Avaliação de satisfação',
  },
  {
    id: 'assignments',
    label: 'Carteirização',
    icon: UserCheck,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    description: 'Atribuição de contatos',
  },
  {
    id: 'closure',
    label: 'Finalização',
    icon: XCircle,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    description: 'Motivos de encerramento',
  },
  {
    id: 'replies',
    label: 'Respostas Rápidas',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    description: 'Templates de mensagem',
  },
];

export const GenesisProfessionalSettings = () => {
  const [activeCategory, setActiveCategory] = useState('security');

  const renderContent = () => {
    switch (activeCategory) {
      case 'security':
        return <SecuritySettings />;
      case 'schedule':
        return <WorkScheduleSettings />;
      case 'branding':
        return <BrandingSettings />;
      case 'ai':
        return <AIAssistant />;
      case 'departments':
        return <DepartmentsManager />;
      case 'routing':
        return <RoutingRules />;
      case 'chat':
        return <InternalChat />;
      case 'nps':
        return <NPSSurveys />;
      case 'assignments':
        return <ContactAssignments />;
      case 'closure':
        return <ClosureReasons />;
      case 'replies':
        return <QuickRepliesManager />;
      default:
        return <SecuritySettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Recursos Profissionais</h2>
          <p className="text-sm text-muted-foreground">
            Configure recursos avançados para sua operação
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    activeCategory === category.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                    <category.icon className={`w-4 h-4 ${category.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        activeCategory === category.id ? 'text-primary' : ''
                      }`}>
                        {category.label}
                      </span>
                      {category.badge && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {category.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {category.description}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
