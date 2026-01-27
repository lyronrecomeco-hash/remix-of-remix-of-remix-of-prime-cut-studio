/**
 * Modal de Boas-Vindas com Credenciais
 * Exibido após criar um novo usuário
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Copy, 
  User, 
  Mail, 
  Lock,
  MessageCircle,
  PartyPopper
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface WelcomeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    password: string;
    userType: 'client' | 'influencer' | 'partner';
  };
}

const USER_TYPE_LABELS = {
  client: 'Cliente',
  influencer: 'Influencer',
  partner: 'Parceiro',
};

const USER_TYPE_COLORS = {
  client: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  influencer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  partner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export function WelcomeCredentialsModal({
  isOpen,
  onClose,
  userData,
}: WelcomeCredentialsModalProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const welcomeMessage = `🎉 *Bem-vindo(a) ao Genesis Hub, ${userData.name}!*

Seu acesso foi liberado com sucesso. Utilize os dados abaixo para entrar no painel:

🌐 *Link de Acesso:*
https://genesishub.cloud/login

📧 *E-mail:* ${userData.email}
🔐 *Senha:* ${userData.password}

Qualquer dúvida, estamos à disposição!
Boas vendas! 🚀`;

  const copyToClipboard = async (text: string, type: 'message' | 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'message') {
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2000);
      } else if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
      toast.success('Copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[hsl(215_30%_12%)] border-white/10 max-w-lg">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
            >
              <PartyPopper className="w-8 h-8 text-emerald-400" />
            </motion.div>
          </div>
          <DialogTitle className="text-center text-white text-xl">
            Usuário Criado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-center text-white/60">
            Copie a mensagem abaixo e envie para o usuário
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Info do Usuário */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-5 h-5 text-white/70" />
              </div>
              <div>
                <p className="font-medium text-white">{userData.name}</p>
                <p className="text-sm text-white/50">{userData.email}</p>
              </div>
            </div>
            <Badge className={USER_TYPE_COLORS[userData.userType]}>
              {USER_TYPE_LABELS[userData.userType]}
            </Badge>
          </div>

          {/* Dados de Acesso */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Dados de Acesso</p>
            
            {/* Email */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white">{userData.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(userData.email, 'email')}
                className="h-8 px-2"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Senha */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white font-mono">{userData.password}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(userData.password, 'password')}
                className="h-8 px-2"
              >
                {copiedPassword ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mensagem Completa */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">Mensagem de Boas-Vindas</p>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                {welcomeMessage}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            style={{ borderRadius: '10px' }}
          >
            Fechar
          </Button>
          <Button
            onClick={() => copyToClipboard(welcomeMessage, 'message')}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
            style={{ borderRadius: '10px' }}
          >
            {copiedMessage ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Copiar Mensagem
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
