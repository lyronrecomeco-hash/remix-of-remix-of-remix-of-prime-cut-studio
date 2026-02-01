import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Check
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

type Language = 'pt-BR' | 'en-US' | 'es-ES';

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
];

// Translations
const T: Record<string, Record<Language, string>> = {
  settings: { 'pt-BR': 'Configurações', 'en-US': 'Settings', 'es-ES': 'Configuración' },
  customize: { 'pt-BR': 'Personalize sua experiência', 'en-US': 'Customize your experience', 'es-ES': 'Personaliza tu experiencia' },
  install_app: { 'pt-BR': 'Instalar App', 'en-US': 'Install App', 'es-ES': 'Instalar App' },
  install_desc: { 'pt-BR': 'Instale o app para acesso rápido e receba notificações em tempo real!', 'en-US': 'Install the app for quick access and receive real-time notifications!', 'es-ES': '¡Instala la app para acceso rápido y recibe notificaciones en tiempo real!' },
  install_now: { 'pt-BR': 'Instalar Agora', 'en-US': 'Install Now', 'es-ES': 'Instalar Ahora' },
  see_instructions: { 'pt-BR': 'Ver Instruções', 'en-US': 'See Instructions', 'es-ES': 'Ver Instrucciones' },
  app_installed: { 'pt-BR': 'App instalado!', 'en-US': 'App installed!', 'es-ES': '¡App instalada!' },
  using_installed: { 'pt-BR': 'Você está usando a versão instalada', 'en-US': 'You are using the installed version', 'es-ES': 'Estás usando la versión instalada' },
  preferences: { 'pt-BR': 'Preferências', 'en-US': 'Preferences', 'es-ES': 'Preferencias' },
  notifications: { 'pt-BR': 'Notificações', 'en-US': 'Notifications', 'es-ES': 'Notificaciones' },
  notifications_desc: { 'pt-BR': 'Receba alertas sobre treinos e aulas', 'en-US': 'Receive alerts about workouts and classes', 'es-ES': 'Recibe alertas sobre entrenamientos y clases' },
  sounds: { 'pt-BR': 'Sons', 'en-US': 'Sounds', 'es-ES': 'Sonidos' },
  sounds_desc: { 'pt-BR': 'Sons de alerta e notificações', 'en-US': 'Alert and notification sounds', 'es-ES': 'Sonidos de alerta y notificaciones' },
  dark_mode: { 'pt-BR': 'Modo Escuro', 'en-US': 'Dark Mode', 'es-ES': 'Modo Oscuro' },
  dark_mode_desc: { 'pt-BR': 'Tema escuro para economia de bateria', 'en-US': 'Dark theme for battery saving', 'es-ES': 'Tema oscuro para ahorro de batería' },
  workout_reminder: { 'pt-BR': 'Lembrete de Treino', 'en-US': 'Workout Reminder', 'es-ES': 'Recordatorio de Entrenamiento' },
  workout_reminder_desc: { 'pt-BR': 'Notificar antes do treino agendado', 'en-US': 'Notify before scheduled workout', 'es-ES': 'Notificar antes del entrenamiento programado' },
  class_reminder: { 'pt-BR': 'Lembrete de Aula', 'en-US': 'Class Reminder', 'es-ES': 'Recordatorio de Clase' },
  class_reminder_desc: { 'pt-BR': 'Notificar antes de aulas coletivas', 'en-US': 'Notify before group classes', 'es-ES': 'Notificar antes de clases grupales' },
  general: { 'pt-BR': 'Geral', 'en-US': 'General', 'es-ES': 'General' },
  privacy: { 'pt-BR': 'Privacidade', 'en-US': 'Privacy', 'es-ES': 'Privacidad' },
  language: { 'pt-BR': 'Idioma', 'en-US': 'Language', 'es-ES': 'Idioma' },
  help_support: { 'pt-BR': 'Ajuda e Suporte', 'en-US': 'Help & Support', 'es-ES': 'Ayuda y Soporte' },
  about_app: { 'pt-BR': 'Sobre o App', 'en-US': 'About App', 'es-ES': 'Sobre la App' },
  choose_language: { 'pt-BR': 'Escolher Idioma', 'en-US': 'Choose Language', 'es-ES': 'Elegir Idioma' },
  language_changed: { 'pt-BR': 'Idioma alterado para', 'en-US': 'Language changed to', 'es-ES': 'Idioma cambiado a' },
  whatsapp_support: { 'pt-BR': 'Falar no WhatsApp', 'en-US': 'Chat on WhatsApp', 'es-ES': 'Chatear en WhatsApp' },
  support_hours: { 'pt-BR': 'Horário de Atendimento', 'en-US': 'Support Hours', 'es-ES': 'Horario de Atención' },
  close: { 'pt-BR': 'Fechar', 'en-US': 'Close', 'es-ES': 'Cerrar' },
  understood: { 'pt-BR': 'Entendi', 'en-US': 'Got it', 'es-ES': 'Entendido' },
};

export default function GymSettingsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt-BR');
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: true,
    reminderWorkout: true,
    reminderClass: true
  });

  // Translation helper
  const t = (key: string) => T[key]?.[currentLanguage] || T[key]?.['pt-BR'] || key;

  useEffect(() => {
    const iOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(iOS);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

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
    const savedLang = localStorage.getItem('gym_app_language') as Language;
    if (savedLang && ['pt-BR', 'en-US', 'es-ES'].includes(savedLang)) {
      setCurrentLanguage(savedLang);
      document.documentElement.lang = savedLang.split('-')[0];
    }

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
      toast.info('Procure o ícone de instalação na barra de endereço do navegador', { duration: 4000 });
    }
  };

  const handleLanguageChange = (langCode: Language) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('gym_app_language', langCode);
    document.documentElement.lang = langCode.split('-')[0];
    setShowLanguageModal(false);
    
    const lang = LANGUAGES.find(l => l.code === langCode);
    toast.success(`${t('language_changed')} ${lang?.name}`);
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o app Academia Genesis.', '_blank');
  };

  const currentLangDisplay = LANGUAGES.find(l => l.code === currentLanguage);

  const settingsItems = [
    { icon: Bell, label: t('notifications'), description: t('notifications_desc'), key: 'notifications' as const },
    { icon: settings.sound ? Volume2 : VolumeX, label: t('sounds'), description: t('sounds_desc'), key: 'sound' as const },
    { icon: settings.darkMode ? Moon : Sun, label: t('dark_mode'), description: t('dark_mode_desc'), key: 'darkMode' as const },
    { icon: Bell, label: t('workout_reminder'), description: t('workout_reminder_desc'), key: 'reminderWorkout' as const },
    { icon: Bell, label: t('class_reminder'), description: t('class_reminder_desc'), key: 'reminderClass' as const }
  ];

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        <p className="text-zinc-400 text-sm">{t('customize')}</p>
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
              <h3 className="font-semibold text-lg">{t('install_app')}</h3>
              <p className="text-sm text-zinc-400 mt-1 mb-4">{t('install_desc')}</p>
              <Button onClick={handleInstallPWA} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                {isIOS ? t('see_instructions') : t('install_now')}
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
            <p className="font-medium text-green-400">{t('app_installed')}</p>
            <p className="text-sm text-zinc-400">{t('using_installed')}</p>
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
          <h3 className="font-medium text-sm text-zinc-400">{t('preferences')}</h3>
        </div>
        {settingsItems.map((item, index) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-4 ${index < settingsItems.length - 1 ? 'border-b border-zinc-800' : ''}`}
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
          <h3 className="font-medium text-sm text-zinc-400">{t('general')}</h3>
        </div>
        
        <button onClick={() => setShowPrivacyModal(true)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">{t('privacy')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
        
        <button onClick={() => setShowLanguageModal(true)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">{t('language')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">{currentLangDisplay?.flag} {currentLangDisplay?.name}</span>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </button>
        
        <button onClick={() => setShowHelpModal(true)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">{t('help_support')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
        
        <button onClick={() => setShowAboutModal(true)} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-zinc-400" />
            <span className="text-sm">{t('about_app')}</span>
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
              {['Toque no ícone de Compartilhar na barra inferior do Safari', 'Role para baixo e toque em "Adicionar à Tela de Início"', 'Toque em "Adicionar" no canto superior direito'].map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowIOSModal(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              {t('understood')}
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
              {t('choose_language')}
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
                {currentLanguage === lang.code && <Check className="w-5 h-5 text-orange-500" />}
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
              {t('help_support')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-zinc-400">
              Precisa de ajuda? Nossa equipe está pronta para atendê-lo! Entre em contato pelo WhatsApp.
            </p>
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium">{t('support_hours')}:</p>
              <p className="text-xs text-zinc-400">Segunda a Sexta: 8h às 20h</p>
              <p className="text-xs text-zinc-400">Sábado: 8h às 14h</p>
            </div>
            <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('whatsapp_support')}
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
              {t('about_app')}
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
                O Academia Genesis é uma plataforma completa de gestão fitness.
              </p>
              <div className="space-y-2 text-zinc-400">
                <p>✓ Treinos personalizados</p>
                <p>✓ Aulas coletivas com agendamento</p>
                <p>✓ Check-in via QR Code</p>
                <p>✓ Acompanhamento de evolução</p>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500">© 2024 Genesis Hub</p>
            <Button onClick={() => setShowAboutModal(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              {t('close')}
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
              {t('privacy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            {[
              { title: 'Coleta de Dados', desc: 'Coletamos apenas informações necessárias para fornecer nossos serviços.' },
              { title: 'Uso dos Dados', desc: 'Seus dados são usados exclusivamente para personalizar sua experiência.' },
              { title: 'Compartilhamento', desc: 'Não vendemos nem compartilhamos seus dados com terceiros.' },
              { title: 'Segurança', desc: 'Utilizamos criptografia e práticas de segurança avançadas.' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <h4 className="font-semibold text-orange-400">{item.title}</h4>
                <p className="text-zinc-400">{item.desc}</p>
              </div>
            ))}
            <Button onClick={() => setShowPrivacyModal(false)} className="w-full bg-orange-500 hover:bg-orange-600">
              {t('understood')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
