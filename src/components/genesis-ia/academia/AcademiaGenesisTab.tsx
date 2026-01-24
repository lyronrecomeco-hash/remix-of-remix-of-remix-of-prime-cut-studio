import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  Target,
  Phone,
  FileText
} from 'lucide-react';
import { ShortcutsLibrary } from './ShortcutsLibrary';
import { PracticalGuides } from './PracticalGuides';
import { ObjectionSimulator } from './ObjectionSimulator';
import { PhoneScenarios } from './PhoneScenarios';
import { ConversionScripts } from './ConversionScripts';

interface AcademiaGenesisTabProps {
  onBack?: () => void;
}

type TabId = 'shortcuts' | 'guides' | 'simulator' | 'phone' | 'scripts';

const tabs = [
  { id: 'shortcuts' as TabId, icon: BookOpen, label: 'Atalhos', description: 'Prompts prontos' },
  { id: 'scripts' as TabId, icon: FileText, label: 'Scripts', description: 'Roteiros de venda' },
  { id: 'guides' as TabId, icon: CheckSquare, label: 'Guias', description: 'Checklists' },
  { id: 'simulator' as TabId, icon: Target, label: 'Chat', description: 'Objeções' },
  { id: 'phone' as TabId, icon: Phone, label: 'Ligação', description: 'Por nicho' },
];

export const AcademiaGenesisTab = ({ onBack }: AcademiaGenesisTabProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('shortcuts');

  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-white/10">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white">Academia Genesis</h2>
          <p className="text-[10px] sm:text-xs text-white/50">Ferramentas práticas para acelerar seus resultados</p>
        </div>
      </div>

      {/* Tab Navigation - Mobile Optimized */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border transition-all duration-200 flex-shrink-0 ${
                isActive 
                  ? 'bg-blue-500/20 border-blue-500/40 text-white' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                isActive ? 'bg-blue-500/30' : 'bg-white/10'
              }`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-400' : 'text-white/60'}`} />
              </div>
              <div className="text-left">
                <p className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                  {tab.label}
                </p>
                <p className="text-[10px] sm:text-xs text-white/40 hidden sm:block">{tab.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'shortcuts' && <ShortcutsLibrary />}
          {activeTab === 'scripts' && <ConversionScripts />}
          {activeTab === 'guides' && <PracticalGuides />}
          {activeTab === 'simulator' && <ObjectionSimulator />}
          {activeTab === 'phone' && <PhoneScenarios />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
