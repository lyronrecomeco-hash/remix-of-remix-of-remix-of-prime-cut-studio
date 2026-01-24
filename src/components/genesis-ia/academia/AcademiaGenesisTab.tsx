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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Academia Genesis</h2>
            <p className="text-sm text-white/50">Ferramentas práticas para acelerar seus resultados</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 rounded-xl border transition-all duration-200 flex-shrink-0 ${
                isActive 
                  ? 'bg-blue-500/20 border-blue-500/40 text-white' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
              style={{ borderRadius: '14px' }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? 'bg-blue-500/30' : 'bg-white/10'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-white/60'}`} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                  {tab.label}
                </p>
                <p className="text-[10px] text-white/40 hidden sm:block">{tab.description}</p>
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
