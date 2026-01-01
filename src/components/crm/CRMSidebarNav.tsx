import React from 'react';
import { motion } from 'framer-motion';
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
  Building2,
  LogOut,
  LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCRM } from '@/contexts/CRMContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  category?: string;
}

const navItems: NavItem[] = [
  // Visão Geral
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Visão Geral' },
  
  // Vendas
  { id: 'kanban', label: 'Pipeline de Vendas', icon: Kanban, category: 'Vendas' },
  { id: 'leads', label: 'Leads', icon: Users, category: 'Vendas' },
  { id: 'pipelines', label: 'Funis', icon: GitBranch, category: 'Vendas' },
  
  // Operações
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare, category: 'Operações' },
  { id: 'financial', label: 'Financeiro', icon: DollarSign, category: 'Operações' },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, category: 'Operações' },
  
  // Gestão
  { id: 'collaborators', label: 'Colaboradores', icon: Users, category: 'Gestão', adminOnly: true },
  { id: 'users', label: 'Usuários', icon: UserCog, category: 'Gestão', adminOnly: true },
  { id: 'company', label: 'Minha Empresa', icon: Building2, category: 'Gestão' },
  { id: 'settings', label: 'Configurações', icon: Settings, category: 'Gestão', adminOnly: true },
];

interface CRMSidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isCollapsed?: boolean;
}

export default function CRMSidebarNav({
  activeTab,
  onTabChange,
  onLogout,
  isCollapsed = false,
}: CRMSidebarNavProps) {
  const { crmUser, crmTenant, isAdmin } = useCRM();

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);
  
  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gestor';
      default: return 'Colaborador';
    }
  };

  return (
    <aside className={cn(
      "hidden lg:flex border-r border-border bg-card/60 backdrop-blur-md fixed left-0 top-0 bottom-0 z-40 flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-14 px-4 border-b border-border flex items-center shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">CRM</p>
              <p className="font-semibold text-sm text-foreground truncate">
                {crmTenant?.name || 'Minha Empresa'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            {!isCollapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2.5 h-9 text-sm font-normal transition-all',
                    activeTab === item.id && 'bg-primary/10 text-primary font-medium border border-primary/20',
                    isCollapsed && 'justify-center px-2'
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 shrink-0 space-y-2">
        {!isCollapsed && (
          <div className="px-1 mb-2">
            <p className="font-medium text-xs truncate">{crmUser?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {getRoleName(crmUser?.role || 'collaborator')}
            </p>
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("w-full h-8", isCollapsed && "px-2")} 
          onClick={onLogout}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!isCollapsed && <span className="ml-2 text-xs">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}