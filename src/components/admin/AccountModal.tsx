import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Crown, Trash2, AlertTriangle, Loader2, Sparkles, Check, X, MessageCircle } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountInfo {
  name: string;
  email: string;
  createdAt: string;
}

const AccountModal = ({ isOpen, onClose }: AccountModalProps) => {
  const { user, signOut } = useAuth();
  const { currentPlan } = useSubscription();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadAccountInfo();
    }
  }, [isOpen, user]);

  const loadAccountInfo = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (adminUser) {
        setAccountInfo({
          name: adminUser.name,
          email: adminUser.email,
          createdAt: adminUser.created_at,
        });
      } else {
        setAccountInfo({
          name: user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          createdAt: user.created_at || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error loading account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR') {
      toast.error('Digite EXCLUIR para confirmar');
      return;
    }

    setIsDeleting(true);
    try {
      if (user) {
        await supabase.from('user_profiles').delete().eq('user_id', user.id);
        await supabase.from('shop_subscriptions').delete().eq('user_id', user.id);
        await supabase.from('usage_metrics').delete().eq('user_id', user.id);
        await supabase.from('admin_users').delete().eq('user_id', user.id);
        await supabase.from('user_roles').delete().eq('user_id', user.id);
      }

      toast.success('Conta excluída com sucesso');
      signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Erro ao excluir conta. Contate o suporte.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getPlanInfo = () => {
    if (!currentPlan) return { name: 'FREE', color: 'bg-muted text-muted-foreground', icon: null };
    switch (currentPlan.name) {
      case 'lifetime':
        return { name: 'VITALÍCIO', color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black', icon: Crown };
      case 'premium':
        return { name: 'PREMIUM', color: 'bg-primary text-primary-foreground', icon: Sparkles };
      default:
        return { name: 'FREE', color: 'bg-muted text-muted-foreground', icon: null };
    }
  };

  const planInfo = getPlanInfo();

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os planos Premium e Vitalício do Barber Studio.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  // Premium features list
  const premiumFeatures = [
    'Agendamentos ilimitados',
    'Marketing via WhatsApp',
    'Relatórios avançados',
    'Suporte prioritário',
  ];

  const lifetimeFeatures = [
    'Tudo do Premium',
    'Acesso vitalício',
    'Atualizações gratuitas',
    'Sem mensalidade',
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Minha Conta" size="sm">
        <ModalBody className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Account Info - Compact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                  <User className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="text-sm font-medium truncate">{accountInfo?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                  <Mail className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">{accountInfo?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Membro desde</p>
                    <p className="text-sm font-medium">
                      {accountInfo?.createdAt
                        ? format(new Date(accountInfo.createdAt), "dd/MM/yyyy", { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Plan Badge */}
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Plano Atual</p>
                  <Badge className={`${planInfo.color} text-xs px-2 py-0.5 mt-1`}>
                    {planInfo.icon && <planInfo.icon className="w-3 h-3 mr-1" />}
                    {planInfo.name}
                  </Badge>
                </div>
                {currentPlan?.name !== 'lifetime' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpgradeModal(true)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade
                  </Button>
                )}
              </div>

              {/* Delete Account - Compact */}
              <div className="flex items-center justify-between p-3 border border-destructive/30 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-xs text-destructive">Zona de Perigo</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} size="sm">
            Fechar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Upgrade Modal with Plans */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Escolha seu Plano"
        size="md"
      >
        <ModalBody className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Desbloqueie todo o potencial do Barber Studio
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative border-2 border-primary/50 rounded-xl p-4 bg-primary/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Premium</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">R$ 49</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 mb-4">
                {premiumFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                size="sm"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Contratar
              </Button>
            </motion.div>

            {/* Lifetime Plan */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative border-2 border-amber-500/50 rounded-xl p-4 bg-amber-500/5"
            >
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-amber-500 text-black text-[10px]">MELHOR VALOR</Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold">Vitalício</h3>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">R$ 497</span>
                <span className="text-sm text-muted-foreground"> único</span>
              </div>
              <ul className="space-y-2 mb-4">
                {lifetimeFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-black" 
                size="sm"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Contratar
              </Button>
            </motion.div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro • Suporte dedicado • Garantia de satisfação
          </p>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUpgradeModal(false)} size="sm">
            Talvez depois
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmText('');
        }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <ModalBody className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium">Tem certeza?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Esta ação é irreversível.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Digite <strong className="text-destructive">EXCLUIR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
              placeholder="EXCLUIR"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteConfirmText('');
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmText !== 'EXCLUIR' || isDeleting}
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Excluir
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AccountModal;
