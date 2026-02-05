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
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Minha Loja</h1>
            <p className="text-xs text-gray-500">Painel Administrativo</p>
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
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400">Logado como</p>
          <p className="text-sm text-gray-700 font-medium truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Minha Loja</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-gray-600"
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
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-100 z-50 pt-16 shadow-xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-100 z-40">
        <SidebarContent />
      </div>
    </>
  );
}
