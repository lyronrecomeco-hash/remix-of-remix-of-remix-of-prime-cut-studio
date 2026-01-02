import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Signal, Wifi, Battery } from 'lucide-react';

interface IPhoneFrameProps {
  children: ReactNode;
  className?: string;
  variant?: 'dark' | 'light' | 'titanium';
  showDynamicIsland?: boolean;
  time?: string;
}

export const IPhoneFrame = ({ 
  children, 
  className = '', 
  variant = 'dark',
  showDynamicIsland = true,
  time
}: IPhoneFrameProps) => {
  const currentTime = time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  const frameColors = {
    dark: 'bg-[#1c1c1e]',
    light: 'bg-[#f5f5f7]',
    titanium: 'bg-gradient-to-b from-[#3d3d3f] to-[#2a2a2c]'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Outer Frame - iPhone 15 Pro Max style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`relative ${frameColors[variant]} rounded-[3rem] p-[3px] shadow-2xl`}
        style={{
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.1),
            0 25px 50px -12px rgba(0,0,0,0.8),
            0 0 80px rgba(0,0,0,0.4)
          `
        }}
      >
        {/* Titanium Side Buttons */}
        <div className="absolute -left-[3px] top-32 w-[3px] h-8 bg-[#3d3d3f] rounded-l" /> {/* Silent switch */}
        <div className="absolute -left-[3px] top-44 w-[3px] h-14 bg-[#3d3d3f] rounded-l" /> {/* Volume Up */}
        <div className="absolute -left-[3px] top-60 w-[3px] h-14 bg-[#3d3d3f] rounded-l" /> {/* Volume Down */}
        <div className="absolute -right-[3px] top-48 w-[3px] h-20 bg-[#3d3d3f] rounded-r" /> {/* Power */}

        {/* Inner Screen Bezel */}
        <div className="bg-black rounded-[2.8rem] overflow-hidden">
          {/* Status Bar */}
          <div className="relative h-14 bg-transparent flex items-end justify-between px-8 pb-1">
            {/* Left - Time */}
            <span className="text-white text-sm font-semibold">{currentTime}</span>
            
            {/* Dynamic Island */}
            {showDynamicIsland && (
              <motion.div 
                className="absolute left-1/2 top-4 -translate-x-1/2 bg-black rounded-full"
                initial={{ width: 120, height: 36 }}
                animate={{ width: 120, height: 36 }}
              >
                {/* Camera + Sensors */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1a1a1c] border border-[#2a2a2c]">
                  <div className="absolute inset-[2px] rounded-full bg-[#0a0a0c]" />
                </div>
              </motion.div>
            )}
            
            {/* Right - Status Icons */}
            <div className="flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-white" />
              <Wifi className="w-4 h-4 text-white" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-6 h-3.5 text-white" />
              </div>
            </div>
          </div>
          
          {/* Screen Content */}
          <div className="bg-black">
            {children}
          </div>
          
          {/* Home Indicator */}
          <div className="h-8 bg-black flex items-center justify-center">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Reflection Overlay */}
      <div 
        className="absolute inset-0 rounded-[3rem] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, transparent 100%)'
        }}
      />
    </div>
  );
};

// MacBook Frame Component
interface MacBookFrameProps {
  children: ReactNode;
  className?: string;
}

export const MacBookFrame = ({ children, className = '' }: MacBookFrameProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Screen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[#1d1d1f] rounded-t-xl p-[8px] shadow-2xl"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7)'
        }}
      >
        {/* Camera notch */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0a0a0a] border border-[#2a2a2a]" />
        
        {/* Screen bezel */}
        <div className="bg-black rounded-lg overflow-hidden">
          {/* Menu bar */}
          <div className="h-7 bg-gradient-to-b from-[#3a3a3c] to-[#2d2d2f] flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-white/60 text-xs font-medium">Genesis Hub — Painel Administrativo</span>
            </div>
          </div>
          
          {/* Content */}
          {children}
        </div>
      </motion.div>
      
      {/* Keyboard/Base */}
      <div className="relative h-4 bg-gradient-to-b from-[#1d1d1f] to-[#0d0d0f] rounded-b-lg mx-8">
        {/* Hinge */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#3a3a3c] rounded-full" />
      </div>
      
      {/* Bottom edge */}
      <div className="relative h-2 bg-gradient-to-b from-[#0d0d0f] to-[#2a2a2c] rounded-b-xl mx-4" />
    </div>
  );
};

export default IPhoneFrame;
