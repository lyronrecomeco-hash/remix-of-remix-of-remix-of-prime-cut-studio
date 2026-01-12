// Node Palette Modal - Full screen modal for adding nodes
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Type, LayoutGrid, List, Mic, BarChart2, Heart, Radio, Clock, 
  GitBranch, MessageSquare, MousePointerClick, Play, Smartphone, Globe, 
  Calendar, Users, UserPlus, UserMinus, Filter, Trash2, UserX, AlertTriangle,
  Bell, ShieldAlert, LinkIcon, BookOpen, Hash, Variable, Square, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { NODE_CATEGORIES, MessageNodeType } from '../../types';

interface NodePaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectNode: (type: string, label: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  'Type': Type,
  'LayoutGrid': LayoutGrid,
  'List': List,
  'Mic': Mic,
  'BarChart2': BarChart2,
  'Heart': Heart,
  'Radio': Radio,
  'Clock': Clock,
  'GitBranch': GitBranch,
  'MessageSquare': MessageSquare,
  'MousePointerClick': MousePointerClick,
  'Play': Play,
  'Smartphone': Smartphone,
  'Globe': Globe,
  'Calendar': Calendar,
  'Users': Users,
  'UserPlus': UserPlus,
  'UserMinus': UserMinus,
  'Filter': Filter,
  'Trash2': Trash2,
  'UserX': UserX,
  'AlertTriangle': AlertTriangle,
  'Bell': Bell,
  'ShieldAlert': ShieldAlert,
  'LinkSlash': LinkIcon,
  'BookOpen': BookOpen,
  'Hash': Hash,
  'Variable': Variable,
  'Square': Square,
  'Zap': Zap,
};

const categoryIconMap: Record<string, React.ElementType> = {
  'Zap': Zap,
  'MessageSquare': MessageSquare,
  'MousePointerClick': MousePointerClick,
  'Users': Users,
  'GitBranch': GitBranch,
};

const categoryColorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  'triggers': { 
    bg: 'from-emerald-500/20 to-emerald-500/5', 
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/20'
  },
  'content': { 
    bg: 'from-blue-500/20 to-blue-500/5', 
    border: 'border-blue-500/30 hover:border-blue-500/60',
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/20'
  },
  'interactive': { 
    bg: 'from-purple-500/20 to-purple-500/5', 
    border: 'border-purple-500/30 hover:border-purple-500/60',
    text: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-500/20'
  },
  'group-management': { 
    bg: 'from-rose-500/20 to-rose-500/5', 
    border: 'border-rose-500/30 hover:border-rose-500/60',
    text: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/20'
  },
  'flow-control': { 
    bg: 'from-amber-500/20 to-amber-500/5', 
    border: 'border-amber-500/30 hover:border-amber-500/60',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/20'
  },
};

export const NodePaletteModal = ({ open, onOpenChange, onSelectNode }: NodePaletteModalProps) => {
  const [search, setSearch] = useState('');

  const filteredCategories = NODE_CATEGORIES.map(category => ({
    ...category,
    nodes: category.nodes.filter(node => 
      node.label.toLowerCase().includes(search.toLowerCase()) ||
      node.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Adicionar Nó ao Flow
          </DialogTitle>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nós..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-8">
            {filteredCategories.map((category) => {
              const CategoryIcon = categoryIconMap[category.icon] || MessageSquare;
              const colors = categoryColorMap[category.id] || categoryColorMap['content'];

              return (
                <motion.div 
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", colors.iconBg)}>
                      <CategoryIcon className={cn("w-4 h-4", colors.text)} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.label}</h3>
                      <p className="text-xs text-muted-foreground">{category.nodes.length} nós disponíveis</p>
                    </div>
                  </div>

                  {/* Nodes Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <AnimatePresence>
                      {category.nodes.map((node) => {
                        const NodeIcon = iconMap[node.icon] || MessageSquare;
                        
                        return (
                          <motion.button
                            key={node.type}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onSelectNode(node.type, node.label)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all duration-200",
                              "bg-gradient-to-br shadow-sm hover:shadow-lg",
                              colors.bg,
                              colors.border
                            )}
                          >
                            <div className={cn("p-2 rounded-lg w-fit mb-3", colors.iconBg)}>
                              <NodeIcon className={cn("w-5 h-5", colors.text)} />
                            </div>
                            <h4 className="font-medium text-sm mb-1">{node.label}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {node.description}
                            </p>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">Nenhum nó encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
