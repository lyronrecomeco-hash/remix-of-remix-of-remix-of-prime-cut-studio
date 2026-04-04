import { motion } from 'framer-motion';
import { 
  Building2, Search, TrendingUp, Zap, Layers, Monitor, Server, Database,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal, Plus
} from 'lucide-react';
import { NODE_CATALOG } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Search, TrendingUp, Zap, Layers, Monitor, Server, Database,
  Link, ShieldAlert, MessageSquare, Clock, Repeat, Rocket, StickyNote,
  CheckSquare, Terminal,
};

interface NodeCatalogPanelProps {
  onAddNode: (type: string) => void;
}

export const NodeCatalogPanel = ({ onAddNode }: NodeCatalogPanelProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider px-2 mb-2">Blocos</h3>
      <div className="space-y-0.5">
        {NODE_CATALOG.map((item) => {
          const Icon = ICON_MAP[item.icon] || StickyNote;
          return (
            <motion.button
              key={item.type}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAddNode(item.type)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left group"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}25` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
              </div>
              <span className="text-xs text-white/70 group-hover:text-white transition-colors flex-1 truncate">
                {item.label}
              </span>
              <Plus className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
