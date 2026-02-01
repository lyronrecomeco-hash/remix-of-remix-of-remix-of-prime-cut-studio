import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Dumbbell, 
  CalendarDays, 
  TrendingUp, 
  User,
  Target,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { path: '/academiapro/app', icon: Home, label: 'Início' },
  { path: '/academiapro/app/meu-plano', icon: Target, label: 'Meu Plano' },
  { path: '/academiapro/app/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academiapro/app/aulas', icon: CalendarDays, label: 'Aulas' },
  { path: '/academiapro/app/evolucao', icon: TrendingUp, label: 'Evolução' },
  { path: '/academiapro/app/perfil', icon: User, label: 'Perfil' },
];

export function GymMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useGymAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/academiapro/auth/login');
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800">
        <div className="flex items-center h-16 px-2 max-w-lg mx-auto">
          {/* Quick Nav Items */}
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/academiapro/app' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-2 relative",
                  isActive ? "text-orange-500" : "text-zinc-500"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="gymActiveTab"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-zinc-500 hover:text-zinc-300"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-zinc-950 border-l border-zinc-800 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-orange-500/30">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-orange-500/20 text-orange-500 text-sm">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm truncate max-w-[150px]">
                      {profile?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-zinc-500 truncate max-w-[150px]">
                      {profile?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="px-3 space-y-1">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/academiapro/app' && location.pathname.startsWith(item.path));
                    
                    return (
                      <motion.button
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all",
                          isActive 
                            ? "bg-orange-500/20 text-orange-500 border border-orange-500/30" 
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium flex-1 text-left">{item.label}</span>
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform",
                          isActive && "text-orange-500"
                        )} />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Settings */}
                <div className="px-3 mt-4 pt-4 border-t border-zinc-800">
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => handleNavigation('/academiapro/app/configuracoes')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">Configurações</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </motion.button>
                
                <p className="text-[10px] text-zinc-600 text-center mt-3">
                  Academia Genesis v1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
