import { motion } from 'framer-motion';
import { 
  Search, 
  Globe, 
  CheckCircle, 
  Smartphone, 
  FileText, 
  GraduationCap, 
  Target,
  Home,
  LayoutGrid,
  FileCheck,
  Gift,
  QrCode,
  Settings,
  LogOut
} from 'lucide-react';

const DashboardPreviewMockup = () => {
  const mainCards = [
    { 
      icon: Search, 
      title: 'Encontrar Clientes', 
      description: 'Descubra clientes com maior potencial',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    { 
      icon: Globe, 
      title: 'Radar Global', 
      description: 'Oportunidades automáticas pela IA',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    { 
      icon: CheckCircle, 
      title: 'Propostas Aceitas', 
      description: 'Gerencie as propostas aceitas do Radar Global e...',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
  ];

  const secondaryCards = [
    { 
      icon: Smartphone, 
      title: 'Apps Virais', 
      description: 'Exemplos de aplicativos de sucesso',
      iconBg: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    { 
      icon: FileText, 
      title: 'Propostas Personalizadas', 
      description: 'Crie propostas únicas com IA',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    { 
      icon: GraduationCap, 
      title: 'Academia Genesis', 
      description: 'Aprimore suas habilidades',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400'
    },
    { 
      icon: Target, 
      title: 'Missão Sprint', 
      description: 'Metas reais, execução guiada',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
  ];

  const bottomNavItems = [
    { icon: Home, active: true },
    { icon: LayoutGrid },
    { icon: FileCheck },
    { icon: Gift },
    { icon: QrCode },
    { icon: Settings },
    { icon: LogOut },
  ];

  return (
    <div className="w-full h-full bg-[#0a1628] p-4 md:p-8 flex flex-col min-h-[400px] md:min-h-[500px]">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6 md:mb-8 relative z-10"
      >
        <h2 className="text-xl md:text-3xl font-bold text-white mb-1">
          Bom dia, ADM! <span className="inline-block">👋</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-400">
          Crie, evolua e gerencie suas ideias em um só lugar.
        </p>
      </motion.div>

      {/* Main Feature Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6 relative z-10"
      >
        {mainCards.map((card, index) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 cursor-pointer transition-all hover:border-primary/30 hover:bg-white/[0.08]"
          >
            <div className={`w-8 h-8 md:w-10 md:h-10 ${card.iconBg} rounded-lg flex items-center justify-center mb-2 md:mb-3`}>
              <card.icon className={`w-4 h-4 md:w-5 md:h-5 ${card.iconColor}`} />
            </div>
            <h3 className="text-white text-xs md:text-sm font-semibold mb-0.5 md:mb-1 truncate">{card.title}</h3>
            <p className="text-gray-500 text-[9px] md:text-xs line-clamp-2">{card.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Secondary Section Title */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 mb-3 md:mb-4 relative z-10"
      >
        <div className="w-5 h-5 md:w-6 md:h-6 bg-primary/20 rounded-lg flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
        <span className="text-white text-xs md:text-sm font-medium">Acesse também</span>
      </motion.div>

      {/* Secondary Cards Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6 relative z-10"
      >
        {secondaryCards.map((card) => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 md:p-4 cursor-pointer transition-all hover:border-primary/30 hover:bg-white/[0.08]"
          >
            <div className={`w-7 h-7 md:w-9 md:h-9 ${card.iconBg} rounded-lg flex items-center justify-center mb-1.5 md:mb-2`}>
              <card.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${card.iconColor}`} />
            </div>
            <h3 className="text-white text-[10px] md:text-xs font-medium mb-0.5 truncate">{card.title}</h3>
            <p className="text-gray-500 text-[8px] md:text-[10px] truncate">{card.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center relative z-10"
      >
        <div className="inline-flex items-center gap-1 md:gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-3 md:px-6 py-2 md:py-3">
          {bottomNavItems.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors ${
                item.active 
                  ? 'bg-primary/20 text-primary' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPreviewMockup;
