import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  Target,
  Copy,
  Check,
  ChevronRight,
  MessageSquare,
  Phone,
  Users,
  Zap,
  Star,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShortcutsLibrary } from './ShortcutsLibrary';
import { PracticalGuides } from './PracticalGuides';
import { ObjectionSimulator } from './ObjectionSimulator';

interface AcademiaGenesisTabProps {
  onBack?: () => void;
}

type TabId = 'shortcuts' | 'guides' | 'simulator';

const tabs = [
  { id: 'shortcuts' as TabId, icon: BookOpen, label: 'Atalhos', description: 'Prompts e templates prontos' },
  { id: 'guides' as TabId, icon: CheckSquare, label: 'Guias', description: 'Checklists interativos' },
  { id: 'simulator' as TabId, icon: Target, label: 'Simulador', description: 'Pratique objeções com IA' },
];

export const AcademiaGenesisTab = ({ onBack }: AcademiaGenesisTabProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('shortcuts');

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">Academia Genesis</h2>
          <p className="text-xs text-white/50">Ferramentas práticas para acelerar seus resultados</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-3 py-2 border transition-all duration-200 flex-shrink-0 ${
                isActive 
                  ? 'bg-blue-500/20 border-blue-500/40 text-white' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isActive ? 'bg-blue-500/30' : 'bg-white/10'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-white/60'}`} />
              </div>
              <div className="text-left">
                <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                  {tab.label}
                </p>
                <p className="text-[9px] text-white/40 hidden sm:block">{tab.description}</p>
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
          {activeTab === 'guides' && <PracticalGuides />}
          {activeTab === 'simulator' && <ObjectionSimulator />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
