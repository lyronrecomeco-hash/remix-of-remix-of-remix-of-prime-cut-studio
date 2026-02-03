import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CalendarDays, 
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/academiapro/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/academiapro/admin/alunos', icon: Users, label: 'Alunos' },
  { path: '/academiapro/admin/instrutores', icon: UserCheck, label: 'Instrutores' },
  { path: '/academiapro/admin/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academiapro/admin/aulas', icon: CalendarDays, label: 'Aulas' },
  { path: '/academiapro/admin/checkin', icon: QrCode, label: 'Check-in' },
  { path: '/academiapro/admin/avaliacoes', icon: Users, label: 'Avaliações' },
  { path: '/academiapro/admin/financeiro', icon: CreditCard, label: 'Financeiro' },
  { path: '/academiapro/admin/relatorios', icon: LayoutDashboard, label: 'Relatórios' },
  { path: '/academiapro/admin/comunicacao', icon: Settings, label: 'Comunicação' },
  { path: '/academiapro/admin/configuracoes', icon: Settings, label: 'Configurações' },
];

export function GymAdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useGymAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/academiapro/auth/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Academia Genesis</h1>
            <p className="text-xs text-muted-foreground">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">
              {profile?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-foreground">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-border hover:bg-muted hover:text-red-500"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg"
      >
        {isMobileOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - FIXED position */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform lg:transform-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
