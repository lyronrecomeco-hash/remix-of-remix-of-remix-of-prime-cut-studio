import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Dumbbell, 
  TrendingUp, 
  User,
  Apple
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/academiapro/app', icon: Home, label: 'Início' },
  { path: '/academiapro/app/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academiapro/app/nutricao', icon: Apple, label: 'Nutrição' },
  { path: '/academiapro/app/evolucao', icon: TrendingUp, label: 'Evolução' },
  { path: '/academiapro/app/perfil', icon: User, label: 'Perfil' },
];

export function GymMobileMenu() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/academiapro/app' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2 relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="gymActiveTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
