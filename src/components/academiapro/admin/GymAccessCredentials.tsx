import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Shield, 
  Smartphone, 
  Monitor,
  Mail,
  Lock,
  ExternalLink,
  MessageSquare,
  Dumbbell,
  Sparkles,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AccessInfo {
  type: 'admin' | 'aluno';
  title: string;
  description: string;
  email: string;
  password: string;
  url: string;
  icon: React.ElementType;
  color: string;
}

const accesses: AccessInfo[] = [
  {
    type: 'admin',
    title: 'Painel Administrativo',
    description: 'Gestão completa da academia',
    email: 'admin-academia@gmail.com',
    password: 'academia@2026',
    url: '/academiapro/admin',
    icon: Shield,
    color: 'from-amber-500 to-orange-600'
  },
  {
    type: 'aluno',
    title: 'App do Aluno',
    description: 'Interface mobile para alunos',
    email: 'academiaspot@gmail.com',
    password: 'academiaspot@2026',
    url: '/academiapro/app',
    icon: Smartphone,
    color: 'from-emerald-500 to-teal-600'
  }
];

export function GymAccessCredentials() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copiado!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const generateFullMessage = () => {
    const baseUrl = window.location.origin;
    const message = `🏋️‍♂️ *ACADEMIA GENESIS - DEMONSTRAÇÃO*
━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Conheça o sistema mais completo para gestão de academias!

🎯 *O que você vai encontrar:*

━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 *PAINEL ADMINISTRATIVO*

Controle total da sua academia na palma da mão!

📊 Dashboard inteligente com métricas em tempo real
👥 Gestão completa de alunos e instrutores  
📋 Fichas de treino personalizadas por IA
📱 Check-in por QR Code
💰 Controle financeiro integrado
📈 Relatórios avançados
🔔 Notificações automáticas

📧 *Email:* admin-academia@gmail.com
🔑 *Senha:* academia@2026
🔗 *Acesso:* ${baseUrl}/academiapro/admin

━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 *APP DO ALUNO*

Experiência premium para seus alunos!

🏃 Treinos interativos com animações
⏱️ Timer inteligente entre séries
🎮 Gamificação com conquistas
📊 Histórico de evolução
📅 Agendamento de aulas
💪 Acompanhamento de medidas

📧 *Email:* academiaspot@gmail.com
🔑 *Senha:* academiaspot@2026
🔗 *Acesso:* ${baseUrl}/academiapro/app

━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ *IMPORTANTE:* Esta é uma demonstração completa do sistema. Explore todas as funcionalidades!

🚀 *Quer esse sistema na sua academia?*
Entre em contato e transforme sua gestão!

━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 *Desenvolvido por Genesis Hub*
🌐 Soluções digitais inteligentes`;

    return message;
  };

  const copyFullMessage = () => {
    copyToClipboard(generateFullMessage(), 'full');
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(generateFullMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Lock className="w-4 h-4" />
          Ver Acessos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            Acessos Academia Genesis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Demo Badge */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-600 dark:text-amber-400">Versão Demonstração</p>
              <p className="text-xs text-muted-foreground">Explore todas as funcionalidades do sistema</p>
            </div>
          </div>

          {accesses.map((access, index) => (
            <motion.div
              key={access.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${access.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
              
              <div className="relative">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${access.color} flex items-center justify-center flex-shrink-0`}>
                    <access.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{access.title}</h3>
                    <p className="text-sm text-muted-foreground">{access.description}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{access.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(access.email, `${access.type}-email`)}
                      className="h-8 px-2"
                    >
                      {copiedField === `${access.type}-email` ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium font-mono">{access.password}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(access.password, `${access.type}-pass`)}
                      className="h-8 px-2"
                    >
                      {copiedField === `${access.type}-pass` ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-primary truncate">{window.location.origin}{access.url}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${window.location.origin}${access.url}`, `${access.type}-url`)}
                      className="h-8 px-2"
                    >
                      {copiedField === `${access.type}-url` ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-3 gap-2"
                  onClick={() => window.open(access.url, '_blank')}
                >
                  <Monitor className="w-4 h-4" />
                  Abrir {access.type === 'admin' ? 'Painel' : 'App'}
                </Button>
              </div>
            </motion.div>
          ))}

          {/* Share Actions */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4" />
              <span className="text-sm">Compartilhar demonstração completa</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={copyFullMessage}
              >
                {copiedField === 'full' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copiar Texto
              </Button>
              <Button
                className="flex-1 gap-2 bg-primary hover:bg-primary/80"
                onClick={shareWhatsApp}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
