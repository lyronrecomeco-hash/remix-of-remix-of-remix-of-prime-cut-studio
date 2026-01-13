import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  LayoutDashboard, 
  GitBranch, 
  Settings, 
  Users,
  User,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bot,
  Smartphone,
  Crown,
  ChevronRight,
  Search,
  HelpCircle,
  Sparkles,
  Activity,
  Gift,
  Bug,
  Webhook,
  Send,
  Bell,
  AlertTriangle,
  Sun,
  Moon,
  MousePointerClick,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { WAFlowBuilder } from '@/components/owner/whatsapp/flow-builder';
import { AnimatedStatCard, QuickActionCard, AnimatedPlanFeature } from '@/components/genesis/AnimatedStats';
import { InstancesManager } from '@/components/genesis/InstancesManager';
import { CreditsManager } from '@/components/genesis/CreditsManager';
import { AnalyticsDashboard } from '@/components/genesis/AnalyticsDashboard';
import { NotificationsPanel } from '@/components/genesis/NotificationsPanel';
import { GenesisChatbots } from '@/components/genesis/GenesisChatbots';
import { WelcomeModal } from '@/components/genesis/WelcomeModal';
import { GenesisDebugPanel } from '@/components/genesis/GenesisDebugPanel';
import { GenesisCreditUsage } from '@/components/genesis/GenesisCreditUsage';
import { GenesisWebhooks } from '@/components/genesis/GenesisWebhooks';
import { GenesisMyAccount } from '@/components/genesis/GenesisMyAccount';
import { GenesisMetricsDashboard } from '@/components/genesis/GenesisMetricsDashboard';
import { GenesisAlertRules } from '@/components/genesis/GenesisAlertRules';
import { GenesisHelpModal } from '@/components/genesis/GenesisHelpModal';
import { GenesisCampaigns } from '@/components/genesis/campaigns';
import { CaktoHub } from '@/components/genesis/CaktoHub';
import { CactusIcon } from '@/components/genesis/icons';
import { GenesisButtons } from '@/components/genesis/buttons';
import { MessagingFeatures } from '@/components/genesis/messaging';
import { SecuritySettings, BrandingSettings, AIAssistant } from '@/components/genesis/professional';
import { NPSSurveys, QuickRepliesManager, ClosureReasons } from '@/components/genesis/professional';
import { SyntheticReport, AnalyticReport } from '@/components/genesis/professional/reports';

// Dashboard component with real data - Premium Design
const GenesisDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const { genesisUser, credits, subscription, isSuperAdmin } = useGenesisAuth();
  const [realStats, setRealStats] = useState({
    instances: 0,
    flows: 0,
    creditsAvailable: 0,
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      if (!genesisUser) return;

      const [instancesRes, flowsRes] = await Promise.all([
        supabase.from('genesis_instances').select('id', { count: 'exact' }).eq('user_id', genesisUser.id),
        supabase.from('whatsapp_automation_rules').select('id', { count: 'exact' }),
      ]);

      setRealStats({
        instances: instancesRes.count || 0,
        flows: flowsRes.count || 0,
        creditsAvailable: credits?.available_credits || 0,
      });
    };

    fetchRealStats();
  }, [genesisUser, credits]);

  const quickActions = [
    { title: 'Nova Instância', description: 'Conecte um WhatsApp', icon: Smartphone, onClick: () => onNavigate('instances'), gradient: 'from-green-500/20 to-emerald-500/10' },
    { title: 'Criar Fluxo', description: 'Monte automações visuais', icon: GitBranch, onClick: () => onNavigate('flows'), gradient: 'from-blue-500/20 to-cyan-500/10' },
    { title: 'Chatbot IA', description: 'Respostas inteligentes', icon: Bot, onClick: () => onNavigate('chatbots'), gradient: 'from-purple-500/20 to-pink-500/10' },
  ];

  const instancePercent = Math.min((realStats.instances / (subscription?.max_instances || 1)) * 100, 100);
  const flowPercent = Math.min((realStats.flows / (subscription?.max_flows || 5)) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10"
          >
            <LayoutDashboard className="w-7 h-7 text-primary" />
          </motion.div>
          <div>
            <motion.h1 
              className="text-2xl font-bold flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Olá, {genesisUser?.name?.split(' ')[0] || 'Usuário'}!
              <motion.span 
                className="inline-block text-xl"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.6, repeat: 2, repeatDelay: 3 }}
              >
                👋
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Bem-vindo ao seu painel de automação
            </motion.p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              <Badge className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/30">
                <Crown className="w-3.5 h-3.5" />
                Super Admin
              </Badge>
            </motion.div>
          )}
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-green-500/30 text-green-600 bg-green-500/5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </Badge>
        </div>
      </motion.div>

      {/* Main Stats Grid - 2x2 Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instances Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-muted-foreground">Instâncias</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{realStats.instances}</span>
                    <span className="text-sm text-muted-foreground">/ {subscription?.max_instances || 1}</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Uso</span>
                      <span className="font-medium">{instancePercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${instancePercent}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Smartphone className="w-6 h-6 text-green-500" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Flows Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Fluxos</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{realStats.flows}</span>
                    <span className="text-sm text-muted-foreground">/ {subscription?.max_flows || 5}</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Uso</span>
                      <span className="font-medium">{flowPercent.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${flowPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                      />
                    </div>
                  </div>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <GitBranch className="w-6 h-6 text-blue-500" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Credits Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-muted-foreground">Créditos</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{realStats.creditsAvailable}</span>
                    <span className="text-sm text-muted-foreground">disponíveis</span>
                  </div>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                      onClick={() => onNavigate('credits')}
                    >
                      <Gift className="w-3 h-3" />
                      Comprar mais
                    </Button>
                  </div>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <CreditCard className="w-6 h-6 text-amber-500" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-muted-foreground">Seu Plano</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold capitalize">{subscription?.plan || 'Free'}</span>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Ativo
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1.5 border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                      onClick={() => onNavigate('credits')}
                    >
                      <Crown className="w-3 h-3" />
                      Fazer upgrade
                    </Button>
                  </div>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            {quickActions.length} disponíveis
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cn(
                  "relative overflow-hidden cursor-pointer group transition-all duration-300",
                  "hover:shadow-lg hover:shadow-primary/5 border-primary/10 hover:border-primary/20"
                )}
                onClick={action.onClick}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", action.gradient)} />
                <CardContent className="p-5 relative">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <action.icon className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Main Panel
export default function GenesisPanel() {
  const navigate = useNavigate();
  const { user, genesisUser, credits, loading, isSuperAdmin, signOut } = useGenesisAuth();
  const [activeTab, setActiveTab] = useState('instances'); // Default para instâncias
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideSidebar, setHideSidebar] = useState(false);
  const [instances, setInstances] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isEditingFlow, setIsEditingFlow] = useState(false);
  const [isCaktoFocusMode, setIsCaktoFocusMode] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hasCaktoIntegration, setHasCaktoIntegration] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('genesis-theme') !== 'light';
    }
    return true;
  });

  // Apply theme on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('genesis-light');
      root.classList.add('genesis-dark');
      localStorage.setItem('genesis-theme', 'dark');
    } else {
      root.classList.remove('genesis-dark');
      root.classList.add('genesis-light');
      localStorage.setItem('genesis-theme', 'light');
    }
  }, [isDarkMode]);

  // Check if first time user
  useEffect(() => {
    const checkFirstTime = async () => {
      if (!genesisUser) return;
      
      const welcomeKey = `genesis_welcome_shown_${genesisUser.id}`;
      const hasSeenWelcome = localStorage.getItem(welcomeKey);
      
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    };
    checkFirstTime();
  }, [genesisUser]);

  const handleWelcomeComplete = () => {
    if (genesisUser) {
      localStorage.setItem(`genesis_welcome_shown_${genesisUser.id}`, 'true');
    }
    setShowWelcome(false);
  };

  // Fetch instances for Chatbots and check Cakto integration
  useEffect(() => {
    const fetchData = async () => {
      if (!genesisUser) return;
      
      const [instancesRes, caktoRes] = await Promise.all([
        supabase
          .from('genesis_instances')
          .select('id, name, status')
          .eq('user_id', genesisUser.id),
        supabase
          .from('genesis_instance_integrations')
          .select('id')
          .eq('user_id', genesisUser.id)
          .eq('provider', 'cakto')
          .in('status', ['connected', 'active'])
          .limit(1)
      ]);
      
      if (instancesRes.data) setInstances(instancesRes.data);
      setHasCaktoIntegration((caktoRes.data?.length || 0) > 0);
    };
    fetchData();
  }, [genesisUser]);

  useEffect(() => {
    if (!loading && (!user || !genesisUser)) {
      navigate('/genesis/login');
    }
  }, [loading, user, genesisUser, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/genesis/login');
    toast.success('Até logo!');
  };

  // Dashboard removido - usuário entra direto em instâncias
  const baseNavItems = [
    { id: 'instances', label: 'Instâncias', icon: Smartphone },
    { id: 'flows', label: 'Flow Builder', icon: GitBranch },
    { id: 'chatbots', label: 'Chatbots', icon: Bot },
    { id: 'campaigns', label: 'Campanhas', icon: Send },
    { id: 'messaging', label: 'Mensagens', icon: MessageSquare },
    // { id: 'buttons', label: 'Botões', icon: MousePointerClick }, // Temporariamente desativado - botões nativos não funcionam no mobile
    { id: 'metrics', label: 'Métricas', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'credits', label: 'Créditos', icon: CreditCard },
    { id: 'account', label: 'Minha Conta', icon: User },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Add Cakto only if user has integration
  const navItems = hasCaktoIntegration 
    ? [
        ...baseNavItems.slice(0, 4), // instances, flows, chatbots, campaigns
        { id: 'cakto', label: 'Cakto', icon: CactusIcon },
        ...baseNavItems.slice(4) // metrics, analytics, credits, account, settings
      ]
    : baseNavItems;

  if (isSuperAdmin) {
    navItems.push({ id: 'users', label: 'Usuários', icon: Users });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'instances':
        return <InstancesManager onNavigateToAccount={() => setActiveTab('account')} />;
      case 'flows':
        return <WAFlowBuilder 
          onBack={() => setActiveTab('dashboard')} 
          onEditingChange={setIsEditingFlow} 
          onNavigateToInstances={() => setActiveTab('instances')}
        />;
      case 'chatbots':
        return <GenesisChatbots instances={instances} />;
      case 'campaigns':
        return <GenesisCampaigns />;
      case 'buttons':
        return <GenesisButtons />;
      case 'messaging':
        return <MessagingFeatures />;
      case 'cakto':
        return <CaktoHub onFocusModeChange={setIsCaktoFocusMode} />;
      case 'metrics':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 max-w-2xl">
                <TabsTrigger value="overview" className="gap-1">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger value="synthetic" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Sintético</span>
                </TabsTrigger>
                <TabsTrigger value="analytic" className="gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analítico</span>
                </TabsTrigger>
                <TabsTrigger value="nps" className="gap-1">
                  <Gift className="w-4 h-4" />
                  <span className="hidden sm:inline">NPS</span>
                </TabsTrigger>
                <TabsTrigger value="rules" className="gap-1">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Regras</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <GenesisMetricsDashboard />
              </TabsContent>
              <TabsContent value="synthetic" className="mt-6">
                <SyntheticReport />
              </TabsContent>
              <TabsContent value="analytic" className="mt-6">
                <AnalyticReport />
              </TabsContent>
              <TabsContent value="nps" className="mt-6">
                <NPSSurveys />
              </TabsContent>
              <TabsContent value="rules" className="mt-6">
                <GenesisAlertRules />
              </TabsContent>
            </Tabs>
          </div>
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'credits':
        return <CreditsManager />;
      case 'account':
        return <GenesisMyAccount />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Configurações</h2>
            </div>
            <Tabs defaultValue="security" className="w-full">
              <TabsList className="grid w-full grid-cols-5 max-w-2xl">
                <TabsTrigger value="security" className="gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">Segurança</span>
                </TabsTrigger>
                <TabsTrigger value="branding" className="gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Marca</span>
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="gap-1">
                  <Webhook className="w-4 h-4" />
                  <span className="hidden sm:inline">Webhooks</span>
                </TabsTrigger>
                <TabsTrigger value="usage" className="gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Consumo</span>
                </TabsTrigger>
                <TabsTrigger value="debug" className="gap-1">
                  <Bug className="w-4 h-4" />
                  <span className="hidden sm:inline">Debug</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="security" className="mt-6">
                <SecuritySettings />
              </TabsContent>
              <TabsContent value="branding" className="mt-6">
                <BrandingSettings />
              </TabsContent>
              <TabsContent value="webhooks" className="mt-6">
                {genesisUser && <GenesisWebhooks userId={genesisUser.id} />}
              </TabsContent>
              <TabsContent value="usage" className="mt-6">
                {genesisUser && (
                  <GenesisCreditUsage 
                    userId={genesisUser.id} 
                    totalCredits={credits?.available_credits || 300} 
                  />
                )}
              </TabsContent>
              <TabsContent value="debug" className="mt-6">
                {genesisUser && <GenesisDebugPanel userId={genesisUser.id} />}
              </TabsContent>
            </Tabs>
          </div>
        );
      case 'users':
        return <div className="text-center py-20 text-muted-foreground">Em desenvolvimento...</div>;
      default:
        return <InstancesManager onNavigateToAccount={() => setActiveTab('account')} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Hide sidebar when editing flow or in Cakto focus mode
  const shouldHideSidebar = (activeTab === 'flows' && isEditingFlow) || (activeTab === 'cakto' && isCaktoFocusMode);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Premium Design with proper light mode support */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 backdrop-blur-xl",
          isDarkMode ? "bg-card/80" : "bg-white/90 border-border"
        )}>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Logo for desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Zap className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight">Genesis Hub</span>
                <span className="text-xs text-muted-foreground leading-none">Automação WhatsApp</span>
              </div>
            </div>
            
            {/* Current page indicator */}
            <div className="hidden lg:flex items-center gap-2 ml-6 pl-6 border-l border-border">
              <h2 className="font-semibold text-base text-foreground">
                {navItems.find(i => i.id === activeTab)?.label || 'Instâncias'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Credits Balance Badge with Genesis Coin */}
            <Badge variant="secondary" className="gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-600 border-amber-500/20 hidden sm:flex">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">G</span>
              <span className="text-sm font-medium">{credits?.available_credits ?? 300} créditos disponíveis!</span>
            </Badge>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 0 : 180, scale: isDarkMode ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute"
              >
                <Moon className="w-5 h-5" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? -180 : 0, scale: isDarkMode ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute"
              >
                <Sun className="w-5 h-5" />
              </motion.div>
            </Button>

            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            
            {/* Notifications Panel */}
            <NotificationsPanel />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={genesisUser?.avatar_url} />
                    <AvatarFallback className="text-xs">{genesisUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn("w-56", isDarkMode ? "bg-popover" : "bg-white border-border")}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{genesisUser?.name}</p>
                    <p className="text-xs text-muted-foreground">{genesisUser?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab('account')}>
                  <User className="w-4 h-4 mr-2" />
                  Minha Conta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowHelpModal(true)}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ajuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div
          className={cn(
            'flex-1 overflow-auto pb-24 lg:pb-6',
            activeTab === 'flows'
              ? (isEditingFlow ? 'p-0' : 'p-4 md:p-6')
              : 'p-4 md:p-6'
          )}
        >
          {renderContent()}
        </div>
      </main>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className={cn(
                "fixed left-0 top-0 bottom-0 w-72 border-r z-50 lg:hidden flex flex-col",
                isDarkMode ? "bg-card" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg">Genesis Hub</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <nav className="space-y-1.5">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        activeTab === item.id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MacOS Style Dock - Desktop - Centered - Premium Design with proper light/dark mode */}
      <AnimatePresence>
        {!shouldHideSidebar && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="hidden lg:flex fixed bottom-4 z-50 w-full justify-center pointer-events-none"
          >
            <motion.div 
              className={cn(
                "flex items-end gap-1.5 px-5 py-3.5 backdrop-blur-2xl border rounded-2xl pointer-events-auto",
                isDarkMode 
                  ? "bg-card/95 border-border/60 shadow-2xl shadow-black/40"
                  : "bg-white/95 border-border shadow-2xl shadow-black/15"
              )}
            >
              {navItems.map((item, index) => {
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 group",
                      isActive ? "" : isDarkMode ? "hover:bg-muted/50" : "hover:bg-muted"
                    )}
                    whileHover={{ scale: 1.15, y: -10 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.04 }}
                  >
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/40" 
                        : isDarkMode 
                          ? "text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50"
                          : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                    )}>
                      <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
                    </div>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div 
                        layoutId="dock-indicator"
                        className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-90 group-hover:scale-100">
                      <div className={cn(
                        "px-3 py-1.5 border rounded-lg shadow-xl text-xs font-medium whitespace-nowrap",
                        isDarkMode 
                          ? "bg-popover border-border text-foreground"
                          : "bg-white border-border text-foreground shadow-lg"
                      )}>
                        {item.label}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Modal for first-time users */}
      <WelcomeModal 
        open={showWelcome} 
        onComplete={handleWelcomeComplete}
        userName={genesisUser?.name?.split(' ')[0]}
      />

      {/* Help Modal */}
      <GenesisHelpModal 
        open={showHelpModal} 
        onOpenChange={setShowHelpModal}
      />
    </div>
  );
}
