import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Crown, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileMenuProps {
  onOpenProfile: () => void;
  onOpenAccount: () => void;
  avatarUrl?: string | null;
}

const ProfileMenu = ({ onOpenProfile, onOpenAccount, avatarUrl }: ProfileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { currentPlan } = useSubscription();

  // Load avatar on mount and when avatarUrl prop changes
  useEffect(() => {
    if (avatarUrl !== undefined) {
      setCurrentAvatarUrl(avatarUrl);
    } else if (user) {
      loadAvatar();
    }
  }, [user, avatarUrl]);

  const loadAvatar = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single();
    
    if (data?.avatar_url) {
      setCurrentAvatarUrl(data.avatar_url);
    }
  };

  const getPlanBadge = () => {
    if (!currentPlan) return { label: 'FREE', color: 'bg-muted text-muted-foreground' };
    switch (currentPlan.name) {
      case 'lifetime':
        return { label: 'VITALÍCIO', color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black' };
      case 'premium':
        return { label: 'PREMIUM', color: 'bg-primary text-primary-foreground' };
      default:
        return { label: 'FREE', color: 'bg-muted text-muted-foreground' };
    }
  };

  const planBadge = getPlanBadge();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors touch-manipulation overflow-hidden"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentAvatarUrl || ''} className="object-cover" />
          <AvatarFallback className="bg-primary/20 text-primary text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-64 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[calc(100vh-100px)]"
              >
                {/* User Info Header - Padronizado com tema Genesis */}
                <div className="p-4 border-b border-primary/10 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/30">
                      <AvatarImage src={currentAvatarUrl || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user?.email || 'Usuário'}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${planBadge.color}`}>
                        {planBadge.label === 'VITALÍCIO' && <Crown className="w-3 h-3" />}
                        {planBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items - Padronizado */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors text-left group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">Meu Perfil</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors text-left group"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Settings className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">Minha Conta</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>

                {/* Logout - Padronizado */}
                <div className="p-2 border-t border-primary/10">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Sair da conta</span>
                  </button>
                </div>
              </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
