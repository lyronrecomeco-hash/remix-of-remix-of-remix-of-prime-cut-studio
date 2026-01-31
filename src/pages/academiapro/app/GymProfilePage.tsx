import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  LogOut, 
  Settings, 
  Bell, 
  HelpCircle,
  ChevronRight,
  Ruler,
  Scale,
  Target
} from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function GymProfilePage() {
  const navigate = useNavigate();
  const { profile, signOut, role } = useGymAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    toast.success('Até logo!');
    navigate('/academiapro/auth/login');
  };

  const menuItems = [
    { icon: Settings, label: 'Configurações', path: '/academiapro/app/configuracoes' },
    { icon: Bell, label: 'Notificações', path: '/academiapro/app/notificacoes' },
    { icon: HelpCircle, label: 'Ajuda', path: '/academiapro/app/ajuda' },
  ];

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'instrutor': return 'Instrutor';
      default: return 'Aluno';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-20 h-20 border-2 border-orange-500">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-500">
              {getRoleLabel()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-zinc-400">
            <Mail className="w-5 h-5" />
            <span className="text-sm">{profile?.email}</span>
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-3 text-zinc-400">
              <Phone className="w-5 h-5" />
              <span className="text-sm">{profile.phone}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <Ruler className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{profile?.height_cm || '--'}</p>
          <p className="text-xs text-zinc-400">cm altura</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <Scale className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{profile?.weight_kg || '--'}</p>
          <p className="text-xs text-zinc-400">kg peso</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <Target className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{profile?.goals?.length || 0}</p>
          <p className="text-xs text-zinc-400">objetivos</p>
        </div>
      </motion.div>

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        {menuItems.map((item, index) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-zinc-800' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-zinc-400" />
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </button>
        ))}
      </motion.div>

      {/* Admin Link */}
      {(role === 'admin' || role === 'instrutor') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            variant="outline"
            className="w-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
            onClick={() => navigate('/academiapro/admin')}
          >
            Acessar Painel Administrativo
          </Button>
        </motion.div>
      )}

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="outline"
          className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </motion.div>
    </div>
  );
}
