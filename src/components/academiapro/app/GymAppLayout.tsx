import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { GymBottomNav } from './GymBottomNav';
import { Loader2, Home, Dumbbell, CalendarDays, TrendingUp, User, Target, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';

// Desktop sidebar items - NO Config (only via Profile)
const navItems = [
  { path: '/academiapro/app', icon: Home, label: 'Início' },
  { path: '/academiapro/app/meu-plano', icon: Target, label: 'Meu Plano' },
  { path: '/academiapro/app/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academiapro/app/aulas', icon: CalendarDays, label: 'Aulas' },
  { path: '/academiapro/app/evolucao', icon: TrendingUp, label: 'Evolução' },
  { path: '/academiapro/app/perfil', icon: User, label: 'Perfil' },
];

export function GymAppLayout() {
  const { isAuthenticated, isLoading } = useGymAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/academiapro/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white lg:flex w-full">
      {/* Desktop Sidebar - FIXED */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-zinc-800 lg:fixed lg:inset-y-0 lg:left-0 bg-zinc-950 z-40">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Academia Genesis</h1>
              <p className="text-xs text-zinc-400">App do Aluno</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/academiapro/app' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
      </aside>
      
      {/* Main Content - Scrollable */}
      <main className="flex-1 lg:ml-64 w-full min-h-screen pb-20 lg:pb-0">
        <div className="w-full lg:p-8 lg:max-w-none h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <GymBottomNav />
    </div>
  );
}
