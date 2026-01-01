import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Kanban,
  GitBranch,
  CheckSquare,
  DollarSign,
  UserCog,
  BarChart3,
  Settings,
  Menu,
  X,
  Building2,
  LogOut,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCRM } from '@/contexts/CRMContext';
import { cn } from '@/lib/utils';

// Import CRM Components
import CRMDashboard from '@/components/crm/CRMDashboard';
import CRMLeads from '@/components/crm/CRMLeads';
import CRMKanban from '@/components/crm/CRMKanban';
import CRMPipelines from '@/components/crm/CRMPipelines';
import CRMTasks from '@/components/crm/CRMTasks';
import CRMFinancial from '@/components/crm/CRMFinancial';
import CRMUsers from '@/components/crm/CRMUsers';
import CRMReports from '@/components/crm/CRMReports';
import CRMSettings from '@/components/crm/CRMSettings';
import CRMOnboardingModal from '@/components/crm/CRMOnboardingModal';
import CRMCompanyAccount from '@/components/crm/CRMCompanyAccount';
import CRMCollaborators from '@/components/crm/CRMCollaborators';
import CRMUserProfile from '@/components/crm/CRMUserProfile';
import CRMProfileMenu from '@/components/crm/CRMProfileMenu';
import CRMSecurityProvider from '@/components/crm/CRMSecurityProvider';
import CRMInteractiveBackground from '@/components/crm/CRMInteractiveBackground';
import CRMGlobalSearch from '@/components/crm/CRMGlobalSearch';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'kanban', label: 'Pipeline de Vendas', icon: Kanban },
  { id: 'pipelines', label: 'Funis', icon: GitBranch },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'users', label: 'Usuários', icon: UserCog, adminOnly: true },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'settings', label: 'Configurações', icon: Settings, adminOnly: true },
] as const;

type MenuItemId = (typeof menuItems)[number]['id'] | 'company' | 'collaborators' | 'profile';

export default function CRMPanel() {
  const [activeTab, setActiveTab] = useState<MenuItemId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { crmUser, crmTenant, isAuthenticated, isLoading, logout, isAdmin } = useCRM();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/crm/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredMenuItems = useMemo(
    () => menuItems.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin]
  );

  const getActiveLabel = () => {
    const fromMenu = filteredMenuItems.find((i) => i.id === activeTab)?.label;
    if (fromMenu) return fromMenu;
    switch (activeTab) {
      case 'company':
        return 'Minha Empresa';
      case 'collaborators':
        return 'Colaboradores';
      case 'profile':
        return 'Meu Perfil';
      default:
        return 'CRM';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/crm/login');
  };

  const handleProfileNavigate = (tab: string) => {
    setActiveTab(tab as MenuItemId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CRMDashboard />;
      case 'leads':
        return <CRMLeads />;
      case 'kanban':
        return <CRMKanban />;
      case 'pipelines':
        return <CRMPipelines />;
      case 'tasks':
        return <CRMTasks />;
      case 'financial':
        return <CRMFinancial />;
      case 'users':
        return <CRMUsers />;
      case 'reports':
        return <CRMReports />;
      case 'settings':
        return <CRMSettings />;
      case 'company':
        return <CRMCompanyAccount />;
      case 'collaborators':
        return <CRMCollaborators />;
      case 'profile':
        return <CRMUserProfile />;
      default:
        return <CRMDashboard />;
    }
  };

  if (isLoading) {
    return (
      <CRMSecurityProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </CRMSecurityProvider>
    );
  }

  if (!isAuthenticated || !crmUser || !crmTenant) {
    return null;
  }

  return (
    <CRMSecurityProvider>
      {/* Interactive Background - Medium intensity */}
      <CRMInteractiveBackground />

      {/* Global Search */}
      <CRMGlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab as MenuItemId)}
      />

      {/* Onboarding Modal */}
      {!crmTenant.onboarding_completed && <CRMOnboardingModal />}

      <div className="min-h-screen bg-background/80 relative flex w-full">
        {/* Desktop Sidebar (Owner-style) */}
        <aside className="hidden lg:flex w-72 border-r border-border bg-card/60 backdrop-blur-md fixed left-0 top-0 bottom-0 z-40 flex-col">
          <div className="h-16 px-5 border-b border-border flex items-center shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">CRM</p>
                <p className="font-semibold text-sm text-foreground truncate">
                  {crmTenant.name || 'Minha Empresa'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-10 text-sm',
                  activeTab === item.id && 'bg-primary/10 text-primary'
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </nav>

          <div className="border-t border-border p-4 shrink-0 space-y-2">
            <div className="px-1">
              <p className="font-medium text-xs truncate">{crmUser.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {crmUser.role === 'admin'
                  ? 'Administrador'
                  : crmUser.role === 'manager'
                  ? 'Gestor'
                  : 'Colaborador'}
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full h-9" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="ml-2 text-sm">Sair</span>
            </Button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/90 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-3">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground truncate">CRM</p>
            <p className="font-semibold text-sm truncate">{getActiveLabel()}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <CRMProfileMenu onNavigate={handleProfileNavigate} onLogout={handleLogout} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col"
              >
                <div className="h-16 px-5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground truncate">CRM</p>
                      <p className="font-semibold text-sm truncate">{crmTenant.name || 'Minha Empresa'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {filteredMenuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3 h-10 text-sm',
                        activeTab === item.id && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  ))}
                </nav>

                <div className="border-t border-border p-4 shrink-0">
                  <Button variant="outline" size="sm" className="w-full h-9" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2 text-sm">Sair</span>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
          {/* Top Header - Title replaces search input */}
          <header className="hidden lg:flex h-14 border-b border-border bg-card/80 backdrop-blur-md items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">CRM</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <h1 className="text-sm font-semibold text-foreground truncate">{getActiveLabel()}</h1>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Buscar no CRM"
              >
                <Search className="w-4 h-4" />
              </Button>
              <CRMProfileMenu onNavigate={handleProfileNavigate} onLogout={handleLogout} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-muted/20 pt-14 lg:pt-0">
            <div className="p-4 lg:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </CRMSecurityProvider>
  );
}
