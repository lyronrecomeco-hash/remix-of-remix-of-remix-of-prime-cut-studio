import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  Settings, 
  Bell, 
  Search, 
  ShoppingCart,
  BarChart3,
  Calendar,
  MessageCircle,
  Package,
  CreditCard,
  MapPin,
  Menu,
  ChevronLeft,
  Plus,
  Heart,
  Star
} from 'lucide-react';
import { useAppBuilder } from './AppBuilderContext';
import { APP_TYPES } from './types';
import { useState, useEffect } from 'react';

const SCREEN_ICONS: Record<string, React.ElementType> = {
  home: Home,
  dashboard: BarChart3,
  profile: User,
  settings: Settings,
  notifications: Bell,
  search: Search,
  cart: ShoppingCart,
  products: Package,
  calendar: Calendar,
  messages: MessageCircle,
  checkout: CreditCard,
  tracking: MapPin,
  menu: Menu,
  orders: Package,
  feed: Home,
  login: User,
  analytics: BarChart3,
  users: User,
};

export function AppBuilderPreview() {
  const { formData, getCurrentAppType, currentStep } = useAppBuilder();
  const [currentScreen, setCurrentScreen] = useState(0);
  const appType = getCurrentAppType();

  // Rotate screens every 3 seconds for demo
  useEffect(() => {
    if (formData.selectedScreens.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentScreen(prev => (prev + 1) % Math.min(formData.selectedScreens.length, 4));
    }, 3000);
    return () => clearInterval(timer);
  }, [formData.selectedScreens]);

  const bottomNavScreens = formData.selectedScreens.slice(0, 5);
  const activeScreenId = formData.selectedScreens[currentScreen] || 'home';

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };

  const primaryRgb = hexToRgb(formData.primaryColor);
  const isDark = formData.themeMode === 'dark';

  const bgColor = isDark ? '#0a0a0a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#0a0a0a';
  const mutedColor = isDark ? '#71717a' : '#a1a1aa';
  const cardBg = isDark ? '#18181b' : '#f4f4f5';
  const borderColor = isDark ? '#27272a' : '#e4e4e7';

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* iPhone Frame */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
        style={{ width: '280px', height: '570px' }}
      >
        {/* Phone outer frame */}
        <div 
          className="absolute inset-0 rounded-[45px] bg-gradient-to-br from-[#2a2a2e] via-[#1a1a1e] to-[#0a0a0e] p-[3px]"
          style={{
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.1),
              0 25px 50px -12px rgba(0,0,0,0.6),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `
          }}
        >
          {/* Inner bezel */}
          <div className="w-full h-full rounded-[42px] bg-black p-[10px] relative overflow-hidden">
            {/* Screen */}
            <div 
              className="w-full h-full rounded-[35px] overflow-hidden relative"
              style={{ backgroundColor: bgColor }}
            >
              {/* Status Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-6 z-50"
                style={{ color: textColor }}
              >
                <span className="text-xs font-semibold">9:41</span>
                
                {/* Dynamic Island */}
                <div className="absolute left-1/2 -translate-x-1/2 top-3">
                  <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-zinc-800 rounded-full mr-2" />
                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex gap-[2px]">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-[3px] rounded-sm" style={{ 
                        height: `${6 + i * 2}px`,
                        backgroundColor: i <= 3 ? textColor : mutedColor
                      }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium ml-1">5G</span>
                  <div className="w-6 h-3 rounded-sm border relative ml-1" style={{ borderColor: textColor }}>
                    <div className="absolute inset-[2px] rounded-[1px]" style={{ 
                      backgroundColor: textColor,
                      width: '75%'
                    }} />
                  </div>
                </div>
              </div>

              {/* Screen Content */}
              <div className="absolute inset-0 pt-12 pb-20 px-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreenId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: textColor }}>
                          {formData.appName || 'Meu App'}
                        </h2>
                        <p className="text-xs" style={{ color: mutedColor }}>
                          {appType?.name || 'Dashboard'}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: 'Total', value: '2.847', icon: BarChart3, color: formData.primaryColor },
                        { label: 'Ativos', value: '1.234', icon: User, color: formData.secondaryColor },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: cardBg }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                            style={{ backgroundColor: `${stat.color}20` }}
                          >
                            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                          </div>
                          <p className="text-lg font-bold" style={{ color: textColor }}>
                            {stat.value}
                          </p>
                          <p className="text-[10px]" style={{ color: mutedColor }}>
                            {stat.label}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Feature Cards / List Items */}
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <motion.div
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: item * 0.1 }}
                          className="p-3 rounded-xl flex items-center gap-3"
                          style={{ backgroundColor: cardBg }}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ 
                              background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` 
                            }}
                          >
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: textColor }}>
                              Item {item}
                            </p>
                            <p className="text-[10px]" style={{ color: mutedColor }}>
                              Descrição do item
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" style={{ color: formData.accentColor }} />
                            <span className="text-xs" style={{ color: textColor }}>4.9</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* FAB */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute bottom-4 right-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` 
                      }}
                    >
                      <Plus className="w-6 h-6 text-white" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around px-4 border-t"
                style={{ 
                  backgroundColor: cardBg,
                  borderColor
                }}
              >
                {bottomNavScreens.slice(0, 5).map((screenId, i) => {
                  const Icon = SCREEN_ICONS[screenId] || Home;
                  const isActive = i === currentScreen % bottomNavScreens.length;
                  return (
                    <motion.button
                      key={screenId}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentScreen(i)}
                      className="flex flex-col items-center gap-1 p-2"
                    >
                      <div 
                        className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
                        style={{ 
                          backgroundColor: isActive ? `${formData.primaryColor}20` : 'transparent' 
                        }}
                      >
                        <Icon 
                          className="w-4 h-4 transition-colors" 
                          style={{ color: isActive ? formData.primaryColor : mutedColor }}
                        />
                      </div>
                      <span 
                        className="text-[8px] font-medium"
                        style={{ color: isActive ? formData.primaryColor : mutedColor }}
                      >
                        {screenId.charAt(0).toUpperCase() + screenId.slice(1)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/30" />
            </div>

            {/* Notch reflection */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full" />
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute left-[-3px] top-32 w-[3px] h-8 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-l-sm" />
        <div className="absolute left-[-3px] top-44 w-[3px] h-14 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-l-sm" />
        <div className="absolute left-[-3px] top-60 w-[3px] h-14 bg-gradient-to-r from-zinc-700 to-zinc-600 rounded-l-sm" />
        <div className="absolute right-[-3px] top-44 w-[3px] h-20 bg-gradient-to-l from-zinc-700 to-zinc-600 rounded-r-sm" />
      </motion.div>

      {/* Step indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div 
          className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
          style={{ 
            backgroundColor: `${formData.primaryColor}20`,
            color: formData.primaryColor,
            border: `1px solid ${formData.primaryColor}40`
          }}
        >
          {appType?.icon} {appType?.name || 'App'}
        </div>
      </div>
    </div>
  );
}
