import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  Search,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  Grid3X3,
  LayoutDashboard,
  Bell,
  Layout,
  Radar,
  Sparkles,
  ArrowLeft,
  RefreshCw
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
      description: 'Automações inteligentes de atendimento',
      icon: MessageSquare,
      badge: 'Luna AI',
      badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    },
    {
      id: 'templates' as const,
      title: 'Templates Prontos',
      description: 'Modelos profissionais por nicho',
      icon: Layout,
      badge: 'Prompt Builder',
      badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    },
    {
      id: 'analytics' as const,
      title: 'Analytics',
      description: 'Métricas e relatórios de performance',
      icon: BarChart3,
      badge: 'Tempo Real',
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    },
  ];

  const dockItems = [
    { icon: Home, label: 'Início', tabId: 'dashboard' as const },
    { icon: Grid3X3, label: 'Apps', tabId: 'templates' as const },
    { icon: LayoutDashboard, label: 'Projetos', tabId: 'analytics' as const },
    { icon: RefreshCw, label: 'Sync', tabId: 'dashboard' as const },
    { icon: Settings, label: 'Config', tabId: 'settings' as const },
    { icon: LogOut, label: 'Sair', onClick: handleLogout },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-10 h-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-5">
      {/* Radar Global Card */}
      <Card className="group overflow-hidden border-primary/20 bg-primary/5 cursor-pointer transition-all hover:border-primary/40 hover:bg-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Radar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Radar Global</h3>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                    <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                    IA
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Oportunidades encontradas automaticamente</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Bell className="w-2.5 h-2.5 mr-0.5" />
                3
              </Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MAIN_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className="group cursor-pointer border-border hover:border-primary/50 transition-all hover:shadow-md"
              onClick={() => setActiveTab(card.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{card.description}</p>
                <Badge variant="outline" className={`text-[10px] ${card.badgeClass}`}>
                  {card.badge}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'dashboard') return renderDashboard();

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">{getTabTitle()}</h3>
          <p className="text-sm text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab !== 'dashboard' ? (
                <>
                  <Button variant="ghost" size="icon" onClick={() => setActiveTab('dashboard')} className="h-8 w-8">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="font-semibold">{getTabTitle()}</h2>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="font-bold text-foreground">Genesis IA</h1>
                </>
              )}
            </div>

            {/* Welcome */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <span className="text-base">👋</span>
              <span className="text-sm">
                Olá, <span className="font-medium text-primary capitalize">{userName}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {activeTab === 'dashboard' && (
          <Button className="mb-4 h-9 text-sm gap-1.5">
            Criar meu SaaS
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        {renderTabContent()}
      </main>

      {/* Dock */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-card border border-border shadow-lg"
        >
          {dockItems.map((item, index) => {
            const isActive = !item.onClick && activeTab === item.tabId;
            return (
              <motion.button
                key={index}
                onClick={item.onClick || (() => setActiveTab(item.tabId!))}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary/15' : 'hover:bg-muted'
                }`}
                whileHover={{ scale: 1.15, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {isActive && <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default GenesisIADashboard;
