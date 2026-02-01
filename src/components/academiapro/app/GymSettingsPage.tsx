import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Moon, 
  Sun, 
  Download, 
  Smartphone,
  Shield,
  ChevronRight,
  Volume2,
  VolumeX,
  Globe,
  HelpCircle,
  Info,
  MessageCircle,
  Check,
  X
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
];

export default function GymSettingsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: true,
    reminderWorkout: true,
    reminderClass: true
  });

  useEffect(() => {
    // Check if iOS
    const iOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // Check if app is installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('App instalado com sucesso! 🎉');
    });

    // Load saved language
    const savedLang = localStorage.getItem('gym_app_language') || 'pt-BR';
    setCurrentLanguage(savedLang);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Instalando o app...');
      }
      setDeferredPrompt(null);
    } else {
      toast.info('Procure o ícone de instalação na barra de endereço do navegador', {
        duration: 4000
      });
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('gym_app_language', langCode);
    setShowLanguageModal(false);
    
    const lang = LANGUAGES.find(l => l.code === langCode);
    toast.success(`Idioma alterado para ${lang?.name}`);
    
    // In a real app, this would trigger i18n context update
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o app Academia Genesis.', '_blank');
  };

  const settingsItems = [
    {
      icon: Bell,
      label: 'Notificações',
      description: 'Receba alertas sobre treinos e aulas',
      key: 'notifications' as const
    },
    {
      icon: settings.sound ? Volume2 : VolumeX,
      label: 'Sons',
      description: 'Sons de alerta e notificações',
      key: 'sound' as const
    },
    {
      icon: settings.darkMode ? Moon : Sun,
      label: 'Modo Escuro',
      description: 'Tema escuro para economia de bateria',
      key: 'darkMode' as const
    },
    {
      icon: Bell,
      label: 'Lembrete de Treino',
      description: 'Notificar antes do treino agendado',
      key: 'reminderWorkout' as const
    },
    {
      icon: Bell,
      label: 'Lembrete de Aula',
      description: 'Notificar antes de aulas coletivas',
      key: 'reminderClass' as const
    }
  ];

  const currentLangDisplay = LANGUAGES.find(l => l.code === currentLanguage);

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-zinc-400 text-sm">Personalize sua experiência</p>
      </motion.div>

      {/* PWA Install */}
      {!isInstalled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Instalar App</h3>
              <p className="text-sm text-zinc-400 mt-1 mb-4">
                Instale o app para acesso rápido e receba notificações em tempo real!
              </p>
              <Button 
                onClick={handleInstallPWA}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isIOS ? 'Ver Instruções' : 'Instalar Agora'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {isInstalled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="font-medium text-green-400">App instalado!</p>
            <p className="text-sm text-zinc-400">Você está usando a versão instalada</p>
          </div>
        </motion.div>
      )}

      {/* Settings Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="font-medium text-sm text-zinc-400">Preferências</h3>
        </div>
        {settingsItems.map((item, index) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-4 ${
              index < settingsItems.length - 1 ? 'border-b border-zinc-800' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-zinc-500">{item.description}</p>
              </div>
            </div>
            <Switch 
              checked={settings[item.key]}
              onCheckedChange={(checked) => setSettings({ ...settings, [item.key]: checked })}
            />
          </div>
        ))}
      </motion.div>

      {/* Other Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="font-medium text-sm text-zinc-400">Geral</h3>
        </div>
        
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">Privacidade</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
        
        <button
          onClick={() => setShowLanguageModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">Idioma</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">{currentLangDisplay?.flag} {currentLangDisplay?.name}</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </button>
        
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">Ajuda e Suporte</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
        
        <button
          onClick={() => setShowAboutModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">Sobre o App</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">v1.0.0</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </button>
      </motion.div>

      {/* Version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-xs text-zinc-600 pb-4"
      >
        Academia Genesis App v1.0.0 • Powered by Genesis Hub
      </motion.p>

      {/* iOS Install Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              Instalar no iOS
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-zinc-400">
              Siga os passos abaixo para instalar o app no seu iPhone ou iPad:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                <p className="text-sm">Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra inferior do Safari</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                <p className="text-sm">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
                <p className="text-sm">Toque em <strong>"Adicionar"</strong> no canto superior direito</p>
              </div>
            </div>
            <Button onClick={() => setShowIOSModal(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              Entendi!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-500" />
              </div>
              Escolher Idioma
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                  currentLanguage === lang.code 
                    ? 'bg-orange-500/20 border border-orange-500/50' 
                    : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-5 h-5 text-orange-500" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & Support Modal */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-500" />
              </div>
              Ajuda e Suporte
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-zinc-400">
              Precisa de ajuda? Nossa equipe está pronta para atendê-lo! Entre em contato pelo WhatsApp para suporte rápido e personalizado.
            </p>
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium">Horário de Atendimento:</p>
              <p className="text-xs text-zinc-400">Segunda a Sexta: 8h às 20h</p>
              <p className="text-xs text-zinc-400">Sábado: 8h às 14h</p>
            </div>
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar no WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About App Modal */}
      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Info className="w-5 h-5 text-orange-500" />
              </div>
              Sobre o App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mx-auto flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">G</span>
              </div>
              <h3 className="text-xl font-bold">Academia Genesis</h3>
              <p className="text-sm text-zinc-400">Versão 1.0.0</p>
            </div>
            
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3 text-sm">
              <p className="text-zinc-300">
                O Academia Genesis é uma plataforma completa de gestão fitness que conecta alunos, instrutores e administradores.
              </p>
              <div className="space-y-2 text-zinc-400">
                <p>✓ Treinos personalizados</p>
                <p>✓ Aulas coletivas com agendamento</p>
                <p>✓ Check-in via QR Code</p>
                <p>✓ Acompanhamento de evolução</p>
                <p>✓ Gestão financeira integrada</p>
              </div>
            </div>
            
            <p className="text-center text-xs text-zinc-500">
              © 2024 Genesis Hub. Todos os direitos reservados.
            </p>
            
            <Button onClick={() => setShowAboutModal(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              Privacidade
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400">Coleta de Dados</h4>
              <p className="text-zinc-400">
                Coletamos apenas informações necessárias para fornecer nossos serviços: nome, e-mail, dados de treino e frequência.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400">Uso dos Dados</h4>
              <p className="text-zinc-400">
                Seus dados são usados exclusivamente para personalizar sua experiência de treino e melhorar nossos serviços.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400">Compartilhamento</h4>
              <p className="text-zinc-400">
                Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-400">Segurança</h4>
              <p className="text-zinc-400">
                Utilizamos criptografia de ponta e práticas de segurança avançadas para proteger suas informações.
              </p>
            </div>
            <Button onClick={() => setShowPrivacyModal(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
