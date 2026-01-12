// Node Palette - Drag & Drop Node Selector
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, Search, Type, LayoutGrid, List, Mic, BarChart2, 
  Heart, Radio, Clock, GitBranch, MessageSquare, MousePointerClick, 
  GripVertical, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { NODE_CATEGORIES, MessageNodeType } from '../../types';

interface NodePaletteProps {
  onClose: () => void;
  isLocked: boolean;
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
};

const categoryIconMap: Record<string, React.ElementType> = {
  'MessageSquare': MessageSquare,
  'MousePointerClick': MousePointerClick,
  'GitBranch': GitBranch,
};

const categoryColorMap: Record<string, string> = {
  'content': 'from-blue-500/20 to-blue-500/5 border-blue-500/30 hover:border-blue-500/50',
  'interactive': 'from-purple-500/20 to-purple-500/5 border-purple-500/30 hover:border-purple-500/50',
  'flow-control': 'from-amber-500/20 to-amber-500/5 border-amber-500/30 hover:border-amber-500/50',
};

export const NodePalette = ({ onClose, isLocked }: NodePaletteProps) => {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('content');

  const onDragStart = (event: React.DragEvent, nodeType: MessageNodeType, label: string) => {
    if (isLocked) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = NODE_CATEGORIES.map(category => ({
    ...category,
    nodes: category.nodes.filter(node => 
      node.label.toLowerCase().includes(search.toLowerCase()) ||
      node.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-72 border-r bg-card/50 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Nós de Mensagem</h3>
          {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nós..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Node Categories */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {filteredCategories.map((category) => {
            const CategoryIcon = categoryIconMap[category.icon] || MessageSquare;
            const isExpanded = expandedCategory === category.id || search.length > 0;

            return (
              <div key={category.id} className="space-y-2">
                <button
                  className="w-full flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setExpandedCategory(isExpanded && !search ? null : category.id)}
                >
                  <CategoryIcon className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left">{category.label}</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {category.nodes.length}
                  </Badge>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1.5"
                  >
                    {category.nodes.map((node) => {
                      const NodeIcon = iconMap[node.icon] || MessageSquare;
                      
                      return (
                        <motion.div
                          key={node.type}
                          draggable={!isLocked}
                          onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, node.type, node.label)}
                          whileHover={{ scale: isLocked ? 1 : 1.02 }}
                          whileTap={{ scale: isLocked ? 1 : 0.98 }}
                          className={cn(
                            "p-2.5 rounded-lg border cursor-grab active:cursor-grabbing",
                            "bg-gradient-to-br transition-all duration-200",
                            categoryColorMap[category.id],
                            isLocked && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-1.5 rounded bg-background/50">
                              <NodeIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-xs">{node.label}</span>
                                <GripVertical className="w-3 h-3 text-muted-foreground/50 ml-auto" />
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                {node.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Arraste os nós para o canvas para criar seu flow
        </p>
      </div>
    </motion.div>
  );
};
