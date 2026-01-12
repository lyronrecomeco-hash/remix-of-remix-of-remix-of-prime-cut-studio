import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  MoreVertical,
  Copy,
  Trash2,
  Edit3,
  BarChart2,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { MessageFlow } from '../types';

interface FlowCardProps {
  flow: MessageFlow;
  onSelect: (flowId: string) => void;
  onEdit: (flowId: string) => void;
  onDuplicate: (flowId: string) => void;
  onDelete: (flowId: string) => void;
  onToggleActive: (flowId: string) => void;
}

export const FlowCard = ({ 
  flow, 
  onSelect, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onToggleActive 
}: FlowCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const nodeCount = flow.nodes.length;
  const hasErrors = flow.stats.successRate < 90;
  const lastExecuted = flow.stats.lastExecuted 
    ? new Date(flow.stats.lastExecuted).toLocaleDateString('pt-BR')
    : 'Nunca';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300",
          "border-2 hover:shadow-lg",
          flow.isActive 
            ? "border-green-500/50 bg-green-500/5" 
            : "border-border hover:border-primary/30",
          hasErrors && "border-amber-500/50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(flow.id)}
      >
        {/* Status indicator */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          flow.isActive ? "bg-green-500" : "bg-muted"
        )} />

        <CardContent className="p-4 pt-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-4 h-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm truncate">{flow.name}</h3>
              </div>
              {flow.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {flow.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              <Switch
                checked={flow.isActive}
                onCheckedChange={() => onToggleActive(flow.id)}
                className="data-[state=checked]:bg-green-500"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(flow.id)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(flow.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(flow.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <Zap className="w-3 h-3" />
                <span>Execuções</span>
              </div>
              <p className="font-bold text-sm">{flow.stats.totalExecutions}</p>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                {flow.stats.successRate >= 90 ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                )}
                <span>Sucesso</span>
              </div>
              <p className={cn(
                "font-bold text-sm",
                flow.stats.successRate >= 90 ? "text-green-500" : "text-amber-500"
              )}>
                {flow.stats.successRate}%
              </p>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                <BarChart2 className="w-3 h-3" />
                <span>Nós</span>
              </div>
              <p className="font-bold text-sm">{nodeCount}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Última: {lastExecuted}</span>
            </div>
            
            <div className="flex gap-1">
              {flow.isActive && (
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">
                  Ativo
                </Badge>
              )}
              {hasErrors && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Verificar
                </Badge>
              )}
            </div>
          </div>

          {/* Hover overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <Button 
              size="sm" 
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(flow.id);
              }}
            >
              <Play className="w-4 h-4" />
              Abrir Canvas
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
