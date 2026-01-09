import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  MessageCircle, 
  QrCode, 
  Settings, 
  CheckCircle,
  ExternalLink,
  Copy,
  Scissors,
  Zap,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

interface WelcomeSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const slides = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Genesis! 🎉',
    subtitle: 'Sistema completo para sua barbearia',
    content: (
      <div className="space-y-4">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <Scissors className="w-12 h-12 text-primary" />
        </div>
        <p className="text-muted-foreground text-center max-w-md mx-auto">
          Você está prestes a transformar a gestão da sua barbearia. 
          Vamos configurar tudo para você começar a usar imediatamente!
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <div className="text-2xl font-bold text-primary">7 dias</div>
            <div className="text-xs text-muted-foreground">Teste grátis</div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-xs text-muted-foreground">Funcional</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 mt-4">
          <p className="text-sm text-center text-green-400">
            ✅ <strong>Automação WhatsApp incluída!</strong> Use profissionalmente sem configurações extras.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'genesispro-intro',
    title: 'Integração GenesisPro',
    subtitle: 'WhatsApp Automação Nativa',
    content: (
      <div className="space-y-4">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center">
          <Zap className="w-12 h-12 text-green-500" />
        </div>
        <p className="text-muted-foreground text-center max-w-md mx-auto">
          O Genesis usa o <strong>GenesisPro</strong> - nossa própria integração WhatsApp - 
          para enviar mensagens automáticas de confirmação, lembrete e muito mais!
        </p>
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-center text-green-400">
            💡 Se você já tem conta no /genesis, a integração é automática!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'genesispro-connect',
    title: 'Como Funciona',
    subtitle: 'Integração automática com sua conta Genesis',
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
            <div>
              <p className="font-medium">Acesse seu painel Genesis</p>
              <p className="text-sm text-muted-foreground">Se você já tem conta no /genesis com o mesmo email</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('/genesis', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Genesis
          </Button>
        </div>
        
        <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
            <div>
              <p className="font-medium">Conecte uma instância WhatsApp</p>
              <p className="text-sm text-muted-foreground">Escaneie o QR Code para conectar seu número</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold shrink-0">3</div>
            <div>
              <p className="font-medium">Pronto! Integração automática</p>
              <p className="text-sm text-muted-foreground">O sistema detecta e usa sua instância automaticamente</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'complete',
    title: 'Tudo Pronto! 🚀',
    subtitle: 'Sua barbearia está configurada',
    content: (
      <div className="space-y-4">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <p className="text-muted-foreground text-center max-w-md mx-auto">
          Você completou a configuração inicial! Agora você pode explorar todas as 
          funcionalidades do Genesis e começar a atender seus clientes.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <div className="text-lg font-bold text-primary">Agenda</div>
            <div className="text-xs text-muted-foreground">Gerencie horários</div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50 text-center">
            <div className="text-lg font-bold text-primary">Marketing</div>
            <div className="text-xs text-muted-foreground">Campanhas WhatsApp</div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mt-4">
          <p className="text-sm text-center text-primary">
            💡 <strong>Dica:</strong> Configure o GenesisPro em Configurações → GenesisPro para ativar notificações automáticas
          </p>
        </div>
      </div>
    ),
  },
];

const WelcomeSetupModal = ({ isOpen, onComplete }: WelcomeSetupModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const { notify } = useNotification();
  
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (user) {
      try {
        // First, try to delete any existing record to avoid conflicts
        await supabase
          .from('admin_settings')
          .delete()
          .eq('setting_type', `welcome_completed_${user.id}`);

        // Insert new record with completed status
        const { error } = await supabase
          .from('admin_settings')
          .insert({
            setting_type: `welcome_completed_${user.id}`,
            settings: { completed: true, completedAt: new Date().toISOString() },
            user_id: user.id
          });

        if (error) {
          console.error('Error saving welcome completion:', error);
        }
      } catch (e) {
        console.error('Error saving welcome completion:', e);
      }
    }
    onComplete();
    notify.success('Configuração concluída!', 'Bem-vindo ao Genesis');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/95 backdrop-blur-md"
        />

        {/* Modal */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header with progress */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Passo {currentSlide + 1} de {slides.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComplete}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Pular configuração
                </Button>
              </div>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{slides[currentSlide].title}</h2>
                    <p className="text-muted-foreground mt-1">{slides[currentSlide].subtitle}</p>
                  </div>
                  {slides[currentSlide].content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirstSlide}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentSlide ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="hero"
                onClick={handleNext}
                className="gap-2"
              >
                {isLastSlide ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Começar
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default WelcomeSetupModal;
