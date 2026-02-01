import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, CalendarDays, TrendingUp, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/academiapro/app', icon: Home, label: 'Início' },
  { path: '/academiapro/app/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academiapro/app/aulas', icon: CalendarDays, label: 'Aulas' },
  { path: '/academiapro/app/evolucao', icon: TrendingUp, label: 'Evolução' },
  { path: '/academiapro/app/perfil', icon: User, label: 'Perfil' },
];

export function GymBottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/academiapro/app' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all",
                isActive 
                  ? "text-orange-500" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all",
                isActive && "scale-110"
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-8 h-0.5 bg-orange-500 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
