import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  RefreshCw,
  Plus,
  Star,
  Type,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  Bell,
  Heart,
  Bookmark,
  Flag,
  Zap,
  Target,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Globe,
  Map,
  Navigation,
  Compass,
  Layers,
  Box
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GenesisSearchClients } from "@/components/genesis-ia/GenesisSearchClients";
import { GlobalRadarTab } from "@/components/genesis-ia/GlobalRadarTab";
import { GenesisUsersTab } from "@/components/genesis-ia/GenesisUsersTab";
import { GenesisSettingsTab } from "@/components/genesis-ia/GenesisSettingsTab";
import { AcceptedLeadsSection } from "@/components/genesis-ia/AcceptedLeadsSection";
import { GenesisCarousel } from "@/components/genesis-ia/GenesisCarousel";
import { AcceptedProposalsTab } from "@/components/genesis-ia/AcceptedProposalsTab";
import { GenesisFinancialTab } from "@/components/genesis-ia/GenesisFinancialTab";
import { WelcomeToast } from "@/components/genesis-ia/WelcomeToast";
import { FullPageEditor, EditorContextValue, CustomElement } from "@/components/genesis-ia/dashboard-builder/FullPageEditor";
import { DraggableCard, CardData } from "@/components/genesis-ia/dashboard-builder/components/DraggableCard";
import { CardSettingsPanel } from "@/components/genesis-ia/dashboard-builder/components/CardSettingsPanel";
import { TextElement, TextElementData } from "@/components/genesis-ia/dashboard-builder/components/TextElement";
import { TextSettingsPanel } from "@/components/genesis-ia/dashboard-builder/components/TextSettingsPanel";

type ActiveTab = 'dashboard' | 'prospects' | 'radar' | 'accepted_proposals' | 'users' | 'settings' | 'financial';

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Search, Radar, Settings, Home, Star, Sparkles, Grid3X3, LayoutDashboard,
  User, Users, Mail, Phone, Calendar, Clock, Bell, Heart, Bookmark, Flag,
  Zap, Target, TrendingUp, BarChart, PieChart, Activity, Globe, Map,
  Navigation, Compass, Layers, Box
};

const GenesisIADashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [affiliateId, setAffiliateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [editingText, setEditingText] = useState<TextElementData | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

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

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    setAffiliateId(affiliate?.id ?? null);

    setIsLoading(false);

    // Show welcome toast after login
    setShowWelcome(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
    navigate("/genesis-ia");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'prospects': return 'Encontrar Clientes';
      case 'radar': return 'Radar Global';
      case 'accepted_proposals': return 'Propostas Aceitas';
      case 'users': return 'Usuários';
      case 'settings': return 'Configurações';
      case 'financial': return 'Financeiro';
      default: return null;
    }
  };


  const dockItems = [
    { icon: Home, label: 'Início', tabId: 'dashboard' as const },
    { icon: Users, label: 'Usuários', tabId: 'users' as const },
    { icon: LayoutDashboard, label: 'Financeiro', tabId: 'financial' as const },
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

  const renderDashboard = (ctx: EditorContextValue) => {
    const { 
      config, 
      isEditMode, 
      selectedCardId, 
      updateCard, 
      deleteCard, 
      duplicateCard, 
      selectCard, 
      addCard,
      selectedElementId,
      selectElement,
      addTextElement,
      updateElement,
      deleteElement,
      duplicateElement
    } = ctx;

    // Convert CustomElement to TextElementData for text elements
    const textElements = config.customElements.filter(el => el.type === 'text').map(el => ({
      id: el.id,
      type: 'text' as const,
      content: el.content,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      styles: {
        fontSize: el.styles.fontSize,
        fontWeight: el.styles.fontWeight,
        color: el.styles.color,
        backgroundColor: el.styles.backgroundColor,
        textAlign: el.styles.textAlign as 'left' | 'center' | 'right',
        padding: el.styles.padding,
        borderRadius: el.styles.borderRadius,
      }
    }));

    // Handle background click to deselect
    const handleBackgroundClick = () => {
      if (isEditMode) {
        selectCard(null);
        selectElement(null);
      }
    };

    return (
      <div 
        className="relative min-h-[600px]"
        onClick={handleBackgroundClick}
      >
        {/* Edit Mode Toolbar */}
        {isEditMode && (
          <div className="flex items-center gap-2 mb-4">
            <Button 
              onClick={(e) => { e.stopPropagation(); addCard(); }} 
              variant="outline" 
              size="sm" 
              className="gap-2 border-dashed"
            >
              <Plus className="w-4 h-4" />
              Adicionar Card
            </Button>
            <Button 
              onClick={(e) => { e.stopPropagation(); addTextElement(); }} 
              variant="outline" 
              size="sm" 
              className="gap-2 border-dashed"
            >
              <Type className="w-4 h-4" />
              Adicionar Texto
            </Button>
          </div>
        )}

        {/* Canvas Area - Free positioning in edit mode */}
        <div 
          className="relative"
          style={{ minHeight: isEditMode ? '500px' : undefined }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cards - Grid mode when not editing, free mode when editing */}
        {!isEditMode ? (
            <>
              {/* Horizontal cards layout like reference image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto px-4">
                {(() => {
                  const visibleCards = [...config.dashboardCards]
                    .filter((card) => card.visible)
                    .sort((a, b) => a.order - b.order)
                    .slice(0, 2);

                  const cardsWithAccepted = [
                    ...visibleCards,
                    {
                      id: 'accepted_proposals',
                      title: 'Propostas Aceitas',
                      description: 'Gerencie as propostas aceitas do Radar Global e acompanhe o progresso.',
                      icon: 'Target',
                      styles: {
                        iconBackgroundColor: 'hsl(145 50% 25% / 0.5)',
                        iconColor: 'hsl(145 70% 60%)',
                      },
                    } as unknown as CardData,
                  ];

                  return cardsWithAccepted.map((card, index) => {
                    const IconComponent = ICON_MAP[card.icon] || Star;
                    const cardStyles = card.styles;

                    // Different icon colors for each card (fallback)
                    const iconColors = [
                      { bg: 'hsl(260 50% 30% / 0.5)', color: 'hsl(260 70% 70%)' }, // Purple
                      { bg: 'hsl(200 50% 30% / 0.5)', color: 'hsl(200 70% 65%)' }, // Blue
                      { bg: 'hsl(180 40% 25% / 0.5)', color: 'hsl(180 60% 60%)' }, // Teal
                    ];
                    const colorScheme = iconColors[index % iconColors.length];

                    return (
                      <Card
                        key={card.id}
                        className="group cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-white/20 border border-white/[0.08]"
                        style={{
                          backgroundColor: 'hsl(215 30% 12%)',
                          borderRadius: '14px',
                          minWidth: '320px',
                        }}
                        onClick={() => setActiveTab(card.id as ActiveTab)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: cardStyles.iconBackgroundColor || colorScheme.bg }}
                            >
                              <IconComponent
                                className="w-5 h-5"
                                style={{ color: cardStyles.iconColor || colorScheme.color }}
                              />
                            </div>
                            <h3 className="text-base font-semibold text-white">{card.title}</h3>
                          </div>
                          <p className="text-sm text-white/50 leading-relaxed min-h-[2.5rem]">
                            {card.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  });
                })()}
              </div>

              {/* Genesis Carousel - Acesse também */}
              <GenesisCarousel onNavigate={(tabId) => setActiveTab(tabId as ActiveTab)} />
            </>
          ) : (
            // Free positioning mode for editing
            <div 
              className="relative border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/5"
              style={{ minHeight: '500px' }}
            >
              {/* Grid overlay for visual guidance */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Draggable Cards */}
              {config.dashboardCards.map((card) => {
                const IconComponent = ICON_MAP[card.icon] || Star;
                const cardStyles = card.styles;
                
                return (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    isEditMode={true}
                    isSelected={selectedCardId === card.id}
                    onSelect={(id) => { selectCard(id); selectElement(null); }}
                    onUpdate={updateCard}
                    onDelete={deleteCard}
                    onDuplicate={duplicateCard}
                    onOpenSettings={(id) => {
                      const c = config.dashboardCards.find(c => c.id === id);
                      if (c) setEditingCard(c);
                    }}
                    gridMode={false}
                  >
                    <Card
                      className={`w-full h-full ${config.cards.shadow} ${!card.visible ? 'opacity-50' : ''}`}
                      style={{
                        backgroundColor: cardStyles.backgroundColor || config.cards.backgroundColor,
                        borderColor: cardStyles.borderColor || config.cards.borderColor,
                        borderRadius: cardStyles.borderRadius || config.cards.borderRadius,
                      }}
                    >
                      <CardContent className="p-5 h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div 
                            className="w-11 h-11 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: cardStyles.iconBackgroundColor || config.cards.iconBackgroundColor }}
                          >
                            <IconComponent 
                              className="w-5 h-5" 
                              style={{ color: cardStyles.iconColor || config.cards.iconColor }} 
                            />
                          </div>
                          <ChevronRight 
                            className="w-5 h-5" 
                            style={{ color: cardStyles.descriptionColor || config.cards.descriptionColor }}
                          />
                        </div>
                        <h3 
                          className="text-lg font-semibold mb-1.5"
                          style={{ color: cardStyles.titleColor || config.cards.titleColor }}
                        >
                          {card.title}
                        </h3>
                        <p 
                          className="text-sm mb-4"
                          style={{ color: cardStyles.descriptionColor || config.cards.descriptionColor }}
                        >
                          {card.description}
                        </p>
                        <Badge variant="outline" className={`text-xs px-2.5 py-1 ${card.badgeClass}`}>
                          {card.icon === 'Radar' && <Sparkles className="w-3 h-3 mr-1.5" />}
                          {card.badge}
                        </Badge>
                      </CardContent>
                    </Card>
                  </DraggableCard>
                );
              })}

              {/* Text Elements */}
              {textElements.map((textEl) => (
                <TextElement
                  key={textEl.id}
                  element={textEl}
                  isEditMode={true}
                  isSelected={selectedElementId === textEl.id}
                  onSelect={(id) => { selectElement(id); selectCard(null); }}
                  onUpdate={(id, updates) => {
                    updateElement(id, updates as Partial<CustomElement>);
                  }}
                  onDelete={deleteElement}
                  onDuplicate={duplicateElement}
                  onOpenSettings={(id) => {
                    const el = textElements.find(e => e.id === id);
                    if (el) setEditingText(el);
                  }}
                />
              ))}

              {/* Canvas instructions */}
              {config.dashboardCards.length === 0 && config.customElements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-muted-foreground">
                    <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Adicione cards e textos para construir seu dashboard</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Settings Panel */}
        <AnimatePresence>
          {editingCard && (
            <CardSettingsPanel
              card={editingCard}
              onUpdate={(updates) => {
                updateCard(editingCard.id, updates);
                setEditingCard({ ...editingCard, ...updates });
              }}
              onClose={() => setEditingCard(null)}
              onDelete={() => {
                deleteCard(editingCard.id);
                setEditingCard(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Text Settings Panel */}
        <AnimatePresence>
          {editingText && (
            <TextSettingsPanel
              element={editingText}
              onUpdate={(updates) => {
                updateElement(editingText.id, updates as Partial<CustomElement>);
                setEditingText({ ...editingText, ...updates } as TextElementData);
              }}
              onClose={() => setEditingText(null)}
              onDelete={() => {
                deleteElement(editingText.id);
                setEditingText(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderTabContent = (ctx: EditorContextValue) => {
    if (activeTab === 'dashboard') return renderDashboard(ctx);
    
    if (activeTab === 'prospects') {
      return <GenesisSearchClients userId={userId} />;
    }

    if (activeTab === 'radar') {
      return (
        <GlobalRadarTab
          userId={userId}
          affiliateId={affiliateId}
          onAccepted={() => setActiveTab('accepted_proposals')}
        />
      );
    }

    if (activeTab === 'accepted_proposals') {
      if (!affiliateId) return null;
      return <AcceptedProposalsTab affiliateId={affiliateId} />;
    }

    if (activeTab === 'users') {
      return <GenesisUsersTab userId={userId} />;
    }

    if (activeTab === 'settings') {
      return <GenesisSettingsTab userId={userId} />;
    }

    if (activeTab === 'financial') {
      return <GenesisFinancialTab userId={userId} />;
    }

    return null;
  };

  return (
    <FullPageEditor>
      {(ctx) => {
        const { config, isEditMode } = ctx;
        
        return (
          <div 
            className="min-h-screen flex flex-col"
            style={{
              background: 'linear-gradient(180deg, hsl(220 25% 10%) 0%, hsl(230 30% 12%) 50%, hsl(220 25% 10%) 100%)',
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

            {/* Welcome Toast */}
            {showWelcome && (
              <WelcomeToast 
                userName={userName} 
                onClose={() => setShowWelcome(false)} 
              />
            )}

            {/* Content */}
            <main className={activeTab === 'dashboard' && !isEditMode ? "flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-32" : "flex-1 px-4 py-4 pb-32"}>
              {/* Hero Section - Centered Title - Only on dashboard */}
              {activeTab === 'dashboard' && !isEditMode && (
                <div className="text-center mb-14">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: config.header.titleColor }}>
                    {getGreeting()}, {userName}! 👋
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Crie, evolua e gerencie suas ideias em um só lugar. Escolha uma ação para começar.
                  </p>
                </div>
              )}
              {renderTabContent(ctx)}
            </main>

            {/* Dock - Always visible */}
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
                ✏️ Arraste os cards para reposicionar • Redimensione pelos cantos
              </div>
            )}
          </div>
        );
      }}
    </FullPageEditor>
  );
};

export default GenesisIADashboard;
