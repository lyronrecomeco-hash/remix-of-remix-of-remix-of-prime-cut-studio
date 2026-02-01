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
  { path: '/academiapro/admin/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academiapro/admin/aulas', icon: CalendarDays, label: 'Aulas' },
  { path: '/academiapro/admin/checkin', icon: QrCode, label: 'Check-in' },
  { path: '/academiapro/admin/presenca', icon: UserCheck, label: 'Presença' },
  { path: '/academiapro/admin/financeiro', icon: CreditCard, label: 'Financeiro' },
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
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Academia Genesis</h1>
            <p className="text-xs text-zinc-400">Painel Admin</p>
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
                  ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
            <span className="text-sm font-medium">
              {profile?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-zinc-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-red-500"
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 transition-transform lg:transform-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
