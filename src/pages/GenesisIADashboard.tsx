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
import { FullPageEditor, PageConfig } from "@/components/genesis-ia/dashboard-builder/FullPageEditor";

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

  const renderDashboard = (config: PageConfig) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MAIN_CARDS.map((card) => {
        const Icon = card.icon;
        const BadgeIcon = card.badgeIcon;
        return (
          <Card
            key={card.id}
            className={`group cursor-pointer transition-all hover:shadow-md ${config.cards.shadow}`}
            style={{
              backgroundColor: config.cards.backgroundColor,
              borderColor: config.cards.borderColor,
              borderRadius: config.cards.borderRadius,
            }}
            onClick={() => setActiveTab(card.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-11 h-11 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-colors"
                  style={{ backgroundColor: config.cards.iconBackgroundColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: config.cards.iconColor }} />
                </div>
                <ChevronRight 
                  className="w-5 h-5 group-hover:translate-x-1 transition-all" 
                  style={{ color: config.cards.descriptionColor }}
                />
              </div>
              <h3 
                className="text-lg font-semibold mb-1.5"
                style={{ color: config.cards.titleColor }}
              >
                {card.title}
              </h3>
              <p 
                className="text-sm mb-4"
                style={{ color: config.cards.descriptionColor }}
              >
                {card.description}
              </p>
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

  const renderTabContent = (config: PageConfig) => {
    if (activeTab === 'dashboard') return renderDashboard(config);
    
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
    <FullPageEditor>
      {(config, isEditMode) => (
        <div 
          className="min-h-screen pb-24"
          style={{
            backgroundColor: config.backgroundGradient.enabled ? undefined : config.backgroundColor,
            backgroundImage: config.backgroundGradient.enabled
              ? `linear-gradient(${config.backgroundGradient.direction}, ${config.backgroundGradient.from}, ${config.backgroundGradient.to})`
              : undefined,
          }}
        >
          {/* Header */}
          <header 
            className="sticky top-0 z-40 border-b border-border backdrop-blur"
            style={{ 
              backgroundColor: config.header.backgroundColor,
              borderColor: config.cards.borderColor,
            }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeTab !== 'dashboard' ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setActiveTab('dashboard')} className="h-8 w-8">
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="text-base font-semibold" style={{ color: config.header.titleColor }}>
                        {getTabTitle()}
                      </h2>
                    </>
                  ) : (
                    <>
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: config.header.logoColor }}
                      >
                        <Brain className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h1 
                        className="text-base font-bold"
                        style={{ color: config.header.titleColor }}
                      >
                        {config.header.titleText}
                      </h1>
                    </>
                  )}
                </div>

                {/* Welcome */}
                {config.header.showWelcome && (
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    style={{ 
                      backgroundColor: config.header.welcomeBackgroundColor,
                      borderColor: config.cards.borderColor,
                    }}
                  >
                    <span className="text-base">👋</span>
                    <span className="text-sm" style={{ color: config.header.titleColor }}>
                      Olá, <span className="font-semibold capitalize" style={{ color: config.dock.activeColor }}>{userName}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="px-4 py-4">
            {activeTab === 'dashboard' && config.ctaButton.visible && (
              <Button 
                size="sm" 
                className="mb-4 h-9 text-sm px-4 gap-2"
                style={{
                  backgroundColor: config.ctaButton.backgroundColor,
                  color: config.ctaButton.textColor,
                  borderRadius: config.ctaButton.borderRadius,
                }}
              >
                {config.ctaButton.text}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {renderTabContent(config)}
          </main>

          {/* Dock */}
          <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className={`flex items-center ${config.dock.shadow}`}
              style={{
                gap: config.dock.gap,
                padding: '12px 16px',
                borderRadius: config.dock.borderRadius,
                backgroundColor: config.dock.backgroundColor,
                border: `1px solid ${config.dock.borderColor}`,
              }}
            >
              {dockItems.map((item, index) => {
                const isActive = !item.onClick && activeTab === item.tabId;
                return (
                  <motion.button
                    key={index}
                    onClick={item.onClick || (() => setActiveTab(item.tabId!))}
                    className="relative rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      width: config.dock.buttonSize,
                      height: config.dock.buttonSize,
                      backgroundColor: isActive ? `${config.dock.activeColor}20` : 'transparent',
                    }}
                    whileHover={{ scale: 1.15, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon 
                      style={{ 
                        width: config.dock.iconSize, 
                        height: config.dock.iconSize,
                        color: isActive ? config.dock.activeColor : config.dock.inactiveColor,
                      }} 
                    />
                    {isActive && (
                      <div 
                        className="absolute bottom-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.dock.activeColor }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* Edit Mode Indicator */}
          {isEditMode && (
            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg z-50">
              ✏️ Modo Editor Ativo - Clique nas seções acima para editar
            </div>
          )}
        </div>
      )}
    </FullPageEditor>
  );
};

export default GenesisIADashboard;
