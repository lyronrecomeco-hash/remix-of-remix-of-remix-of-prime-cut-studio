import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  Search,
  RefreshCw,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  FileText,
  Rocket,
  Home,
  Grid3X3,
  LayoutDashboard,
  Bell,
  History,
  Layout,
  Radar,
  Sparkles,
  ArrowLeft,
  Bot,
  Zap,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ActiveTab = 'dashboard' | 'prospects' | 'chatbots' | 'analytics' | 'templates' | 'settings';

const GenesisIADashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/genesis-ia");
      return;
    }
    setUserName(user.email?.split("@")[0] || "Usuário");
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/genesis-ia");
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'prospects': return 'Encontrar Clientes';
      case 'chatbots': return 'Chatbots';
      case 'analytics': return 'Analytics';
      case 'templates': return 'Templates';
      case 'settings': return 'Configurações';
      default: return null;
    }
  };

  // Cards principais do dashboard
  const MAIN_CARDS = [
    {
      id: 'prospects' as const,
      title: 'Encontrar Clientes',
      description: 'Descubra clientes com maior potencial de compra',
      icon: Search,
      badge: 'Google Places',
      badgeClass: 'bg-primary/10 text-primary border-primary/30',
    },
    {
      id: 'chatbots' as const,
      title: 'Chatbots IA',
      description: 'Gerencie automações inteligentes de atendimento',
      icon: MessageSquare,
      badge: 'Luna AI',
      badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    },
    {
      id: 'templates' as const,
      title: 'Templates Prontos',
      description: 'Modelos profissionais por nicho com Prompt Builder',
      icon: Layout,
      badge: 'Prompt Builder',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    },
    {
      id: 'analytics' as const,
      title: 'Analytics',
      description: 'Métricas e relatórios detalhados de performance',
      icon: BarChart3,
      badge: 'Tempo Real',
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    },
  ];

  // Cards de acesso rápido
  const QUICK_ACCESS_CARDS = [
    { icon: Bot, title: 'IA Avançada', description: 'Modelos personalizados', badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    { icon: FileText, title: 'Redator IA', description: 'Copy de vendas com IA', badgeClass: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
    { icon: Rocket, title: 'Landing Pages', description: 'Páginas de alta conversão', badgeClass: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
    { icon: Globe, title: 'Radar Global', description: 'Oportunidades mundiais', badgeClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' },
    { icon: Zap, title: 'Automações', description: 'Fluxos automatizados', badgeClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
  ];

  // Dock items
  const dockItems = [
    { icon: Home, label: 'Início', tabId: 'dashboard' as const, active: activeTab === 'dashboard' },
    { icon: Grid3X3, label: 'Apps', tabId: 'templates' as const, active: activeTab === 'templates' },
    { icon: LayoutDashboard, label: 'Projetos', tabId: 'analytics' as const, active: activeTab === 'analytics' },
    { icon: RefreshCw, label: 'Sincronizar', tabId: 'dashboard' as const },
    { icon: Settings, label: 'Config', tabId: 'settings' as const, active: activeTab === 'settings' },
    { icon: LogOut, label: 'Sair', onClick: handleLogout },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Radar Global Card Especial */}
      <Card className="group relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Radar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">Radar Global</h3>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA Ativa
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Oportunidades encontradas automaticamente pela IA em tempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                <Bell className="w-3 h-3 mr-1" />
                3 novas
              </Badge>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards principais - Grid 4 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MAIN_CARDS.map((card) => {
          const Icon = card.icon;
          
          return (
            <Card
              key={card.id}
              className="group relative overflow-hidden border border-border bg-card cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => setActiveTab(card.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {card.description}
                </p>
                
                <Badge variant="outline" className={`text-xs ${card.badgeClass}`}>
                  {card.badge}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção de Acesso Rápido */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Acesse também</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_ACCESS_CARDS.map((card, index) => {
            const Icon = card.icon;
            
            return (
              <Card
                key={index}
                className="group cursor-pointer border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-0.5">{card.title}</h4>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'dashboard') {
      return renderDashboard();
    }

    // Placeholder para outras abas
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{getTabTitle()}</h3>
          <p className="text-sm text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeTab !== 'dashboard' ? (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTab('dashboard')}
                    className="shrink-0 h-9 w-9"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-lg font-semibold text-foreground">
                    {getTabTitle()}
                  </h2>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">
                      Genesis IA
                    </h1>
                  </div>
                </>
              )}
            </div>

            {/* Welcome Card */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <span className="text-xl">👋</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Bem vindo, <span className="text-primary capitalize">{userName}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Transforme sua ideia em SaaS
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="mb-6">
            <Button className="gap-2">
              Criar meu SaaS agora
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {renderTabContent()}
      </main>

      {/* Mac-style Dock */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl">
          {dockItems.map((item, index) => (
            <motion.button
              key={index}
              onClick={item.onClick || (() => setActiveTab(item.tabId || 'dashboard'))}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                item.active 
                  ? 'bg-primary/15 border border-primary/30' 
                  : 'hover:bg-muted border border-transparent'
              }`}
              whileHover={{ 
                scale: 1.15, 
                y: -6,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
              
              {/* Active Indicator */}
              {item.active && (
                <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default GenesisIADashboard;
