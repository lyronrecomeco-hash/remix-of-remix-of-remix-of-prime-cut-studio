import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Brain, 
  Search,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  Grid3X3,
  LayoutDashboard,
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
import { GenesisSearchClients } from "@/components/genesis-ia/GenesisSearchClients";

type ActiveTab = 'dashboard' | 'prospects' | 'radar' | 'settings';

const GenesisIADashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
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
    setUserId(user.id);
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
      case 'radar': return 'Radar Global';
      case 'settings': return 'Configurações';
      default: return null;
    }
  };

  const MAIN_CARDS = [
    {
      id: 'prospects' as const,
      title: 'Encontrar Clientes',
      description: 'Descubra clientes com maior potencial',
      icon: Search,
      badge: 'Google Places',
      badgeClass: 'bg-primary/10 text-primary border-primary/30',
    },
    {
      id: 'radar' as const,
      title: 'Radar Global',
      description: 'Oportunidades automáticas pela IA',
      icon: Radar,
      badge: 'IA Ativa',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badgeIcon: Sparkles,
    },
  ];

  const dockItems = [
    { icon: Home, label: 'Início', tabId: 'dashboard' as const },
    { icon: Grid3X3, label: 'Apps', tabId: 'dashboard' as const },
    { icon: LayoutDashboard, label: 'Projetos', tabId: 'dashboard' as const },
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
          <Brain className="w-14 h-14 text-primary" />
        </motion.div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MAIN_CARDS.map((card) => {
        const Icon = card.icon;
        const BadgeIcon = card.badgeIcon;
        return (
          <Card
            key={card.id}
            className="group cursor-pointer border-border hover:border-primary/50 transition-all hover:shadow-md"
            onClick={() => setActiveTab(card.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1.5">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              <Badge variant="outline" className={`text-xs px-2.5 py-1 ${card.badgeClass}`}>
                {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1.5" />}
                {card.badge}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'dashboard') return renderDashboard();
    
    if (activeTab === 'prospects') {
      return <GenesisSearchClients userId={userId} />;
    }

    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">{getTabTitle()}</h3>
          <p className="text-lg text-muted-foreground">Em desenvolvimento...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
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
                  <h2 className="text-base font-semibold">{getTabTitle()}</h2>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-base font-bold text-foreground">Genesis IA</h1>
                </>
              )}
            </div>

            {/* Welcome */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
              <span className="text-base">👋</span>
              <span className="text-sm">
                Olá, <span className="font-semibold text-primary capitalize">{userName}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {activeTab === 'dashboard' && (
          <Button size="sm" className="mb-4 h-9 text-sm px-4 gap-2">
            Criar meu SaaS agora
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        {renderTabContent()}
      </main>

      {/* Dock - Smaller and higher */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg"
        >
          {dockItems.map((item, index) => {
            const isActive = !item.onClick && activeTab === item.tabId;
            return (
              <motion.button
                key={index}
                onClick={item.onClick || (() => setActiveTab(item.tabId!))}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary/15' : 'hover:bg-muted'
                }`}
                whileHover={{ scale: 1.15, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {isActive && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default GenesisIADashboard;
