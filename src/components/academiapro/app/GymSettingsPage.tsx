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
  Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function GymSettingsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: true,
    reminderWorkout: true,
    reminderClass: true
  });

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast.success('App instalado com sucesso!');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      // Show iOS instructions
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        toast.info('Para instalar no iOS', {
          description: 'Toque no ícone de compartilhar e depois em "Adicionar à Tela de Início"',
          duration: 5000
        });
      } else {
        toast.info('App já pode ser instalado', {
          description: 'Procure o ícone de instalação na barra de endereço do navegador'
        });
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast.success('Instalando o app...');
    }
    setDeferredPrompt(null);
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

  const menuItems = [
    { icon: Shield, label: 'Privacidade', path: '#' },
    { icon: Globe, label: 'Idioma', value: 'Português (BR)' },
    { icon: HelpCircle, label: 'Ajuda e Suporte', path: '#' },
    { icon: Info, label: 'Sobre o App', value: 'v1.0.0' }
  ];

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
                Instalar Agora
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
            <Smartphone className="w-5 h-5 text-green-500" />
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
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors ${
              index < menuItems.length - 1 ? 'border-b border-zinc-800' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-zinc-400" />
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.value && <span className="text-sm text-zinc-500">{item.value}</span>}
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </button>
        ))}
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
    </div>
  );
}
