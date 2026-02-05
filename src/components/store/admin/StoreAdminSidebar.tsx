import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  Boxes
} from 'lucide-react';
import { useStoreAuth } from '@/contexts/StoreAuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/loja/admin' },
  { id: 'products', label: 'Produtos', icon: Package, path: '/loja/admin/produtos' },
  { id: 'categories', label: 'Categorias', icon: FolderTree, path: '/loja/admin/categorias' },
  { id: 'stock', label: 'Estoque', icon: Boxes, path: '/loja/admin/estoque' },
  { id: 'customers', label: 'Clientes', icon: Users, path: '/loja/admin/clientes' },
  { id: 'sales', label: 'Vendas', icon: ShoppingCart, path: '/loja/admin/vendas' },
  { id: 'installments', label: 'Crediário', icon: Receipt, path: '/loja/admin/crediario' },
  { id: 'leads', label: 'Leads', icon: MessageSquare, path: '/loja/admin/leads' },
  { id: 'reports', label: 'Relatórios', icon: TrendingUp, path: '/loja/admin/relatorios' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/loja/admin/configuracoes' },
];

export function StoreAdminSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { signOut, user } = useStoreAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/loja/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">Minha Loja</h1>
            <p className="text-xs text-slate-400">Painel Administrativo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/loja/admin'}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="px-4 py-3 mb-2">
          <p className="text-xs text-slate-500">Logado como</p>
          <p className="text-sm text-slate-300 truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Minha Loja</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-slate-400"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-700/50 z-50 pt-16"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-40">
        <SidebarContent />
      </div>
    </>
  );
}
