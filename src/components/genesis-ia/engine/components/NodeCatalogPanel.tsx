import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, Plus, AlertTriangle, Target, Star,
  ChevronDown, ChevronRight
} from 'lucide-react';
import { NODE_CATALOG } from '../types';

const VISIBLE_NODE_TYPES = new Set([
  'prospect',
  'diagnosis',
  'pain',
  'opportunity',
  'strategy',
  'offer',
  'objections',
  'scope',
  'structure',
  'integrations',
  'automation',
  'whatsapp',
  'checklist',
  'deploy',
  'prompt',
]);

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Search, TrendingUp, Zap, Layers, Server,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, AlertTriangle, Target, Star,
};

interface NodeCatalogPanelProps {
  onAddNode: (type: string) => void;
}

export const NodeCatalogPanel = ({ onAddNode }: NodeCatalogPanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Descoberta': true,
    'Estratégia': true,
    'Técnico': true,
    'Execução': true,
  });

  const visibleNodes = NODE_CATALOG.filter((node) => VISIBLE_NODE_TYPES.has(node.type));
  const categories = Array.from(new Set(visibleNodes.map(n => n.category)));

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-1">
      <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-1 mb-3">Blocos</h3>
      {categories.map(category => (
        <div key={category}>
          <button
            onClick={() => toggleCategory(category)}
            className="w-full flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold text-white/30 uppercase tracking-wider hover:text-white/50 transition-colors"
          >
            {expandedCategories[category] ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
            {category}
          </button>
          <AnimatePresence>
            {expandedCategories[category] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 pb-2">
                  {visibleNodes.filter(n => n.category === category).map((item) => {
                    const Icon = ICON_MAP[item.icon] || StickyNote;
                    return (
                      <motion.button
                        key={item.type}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onAddNode(item.type)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors text-left group"
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}20` }}
                        >
                          <Icon className="w-3 h-3" style={{ color: item.color }} />
                        </div>
                        <span className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors flex-1 truncate">
                          {item.label}
                        </span>
                        <Plus className="w-2.5 h-2.5 text-white/10 group-hover:text-white/30 transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
