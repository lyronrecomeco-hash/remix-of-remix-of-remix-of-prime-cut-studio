import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Settings2, 
  Trash2, 
  Copy,
  Move,
  Maximize2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  badgeClass: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
  visible: boolean;
  styles: {
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    titleColor?: string;
    descriptionColor?: string;
    iconBackgroundColor?: string;
    iconColor?: string;
  };
}

interface DraggableCardProps {
  card: CardData;
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CardData>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenSettings: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  children: React.ReactNode;
  gridMode?: boolean;
}

type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w' | 's' | 'n' | null;

export const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  isEditMode,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenSettings,
  onMoveUp,
  onMoveDown,
  children,
  gridMode = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDirection>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, cardX: 0, cardY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, cardX: 0, cardY: 0 });

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || gridMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cardX: card.x,
      cardY: card.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      
      const newX = Math.max(0, dragStartRef.current.cardX + deltaX);
      const newY = Math.max(0, dragStartRef.current.cardY + deltaY);
      
      onUpdate(card.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, gridMode, card.id, card.x, card.y, onUpdate]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setResizeDir(direction);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: card.width,
      height: card.height,
      cardX: card.x,
      cardY: card.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStartRef.current.x;
      const deltaY = moveEvent.clientY - resizeStartRef.current.y;
      
      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;
      let newX = resizeStartRef.current.cardX;
      let newY = resizeStartRef.current.cardY;
      
      // Calculate new dimensions based on resize direction
      if (direction?.includes('e')) {
        newWidth = Math.max(150, resizeStartRef.current.width + deltaX);
      }
      if (direction?.includes('w')) {
        const widthDelta = -deltaX;
        newWidth = Math.max(150, resizeStartRef.current.width + widthDelta);
        if (newWidth !== resizeStartRef.current.width + widthDelta) {
          // Width was clamped, adjust position accordingly
          newX = resizeStartRef.current.cardX;
        } else {
          newX = Math.max(0, resizeStartRef.current.cardX + deltaX);
        }
      }
      if (direction?.includes('s')) {
        newHeight = Math.max(100, resizeStartRef.current.height + deltaY);
      }
      if (direction?.includes('n')) {
        const heightDelta = -deltaY;
        newHeight = Math.max(100, resizeStartRef.current.height + heightDelta);
        if (newHeight !== resizeStartRef.current.height + heightDelta) {
          newY = resizeStartRef.current.cardY;
        } else {
          newY = Math.max(0, resizeStartRef.current.cardY + deltaY);
        }
      }
      
      onUpdate(card.id, { 
        width: newWidth, 
        height: newHeight,
        ...(direction?.includes('w') || direction?.includes('n') ? { x: newX, y: newY } : {})
      });
    };

    const handleMouseUp = () => {
      setResizeDir(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, card.id, card.width, card.height, card.x, card.y, onUpdate]);

  // Handle selection
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelect(card.id);
  };

  if (!card.visible && !isEditMode) return null;

  // Grid mode rendering
  if (gridMode) {
    return (
      <motion.div
        ref={elementRef}
        className={cn(
          'relative rounded-lg transition-all',
          isEditMode && 'cursor-pointer',
          isSelected && isEditMode && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          !card.visible && isEditMode && 'opacity-50'
        )}
        layout
        layoutId={card.id}
        onClick={handleClick}
        whileHover={isEditMode ? { scale: 1.02 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Edit Mode Controls - Grid Mode */}
        {isEditMode && isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-lg z-20"
          >
            {onMoveUp && (
              <button
                className="p-1.5 hover:bg-muted rounded"
                onClick={(e) => { e.stopPropagation(); onMoveUp(card.id); }}
                title="Mover para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            )}
            {onMoveDown && (
              <button
                className="p-1.5 hover:bg-muted rounded"
                onClick={(e) => { e.stopPropagation(); onMoveDown(card.id); }}
                title="Mover para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { e.stopPropagation(); onOpenSettings(card.id); }}
              title="Configurações"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { e.stopPropagation(); onDuplicate(card.id); }}
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { 
                e.stopPropagation(); 
                onUpdate(card.id, { visible: !card.visible });
              }}
              title={card.visible ? 'Ocultar' : 'Mostrar'}
            >
              {card.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded"
              onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Drag handle indicator in grid mode */}
        {isEditMode && isSelected && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 p-1 bg-primary/20 rounded cursor-grab active:cursor-grabbing z-10">
            <GripVertical className="w-4 h-4 text-primary" />
          </div>
        )}

        {/* Card Content */}
        <div className={cn("w-full h-full", isEditMode && isSelected && "pointer-events-none")}>
          {children}
        </div>
      </motion.div>
    );
  }

  // Free positioning mode (absolute)
  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'absolute rounded-lg',
        isEditMode && 'cursor-move',
        isSelected && isEditMode && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        !card.visible && isEditMode && 'opacity-50',
        isDragging && 'z-50 cursor-grabbing',
        resizeDir && 'z-50'
      )}
      style={{
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        zIndex: isSelected ? 20 : 1,
      }}
      onClick={handleClick}
      animate={{ 
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.3)' : '0 0 0 rgba(0,0,0,0)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Edit Mode Controls - Free Mode */}
      {isEditMode && isSelected && (
        <>
          {/* Top toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-lg z-30"
          >
            <button
              className="drag-handle p-1.5 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
              onMouseDown={handleDragStart}
              title="Mover"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { e.stopPropagation(); onOpenSettings(card.id); }}
              title="Configurações"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { e.stopPropagation(); onDuplicate(card.id); }}
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { 
                e.stopPropagation(); 
                onUpdate(card.id, { visible: !card.visible });
              }}
              title={card.visible ? 'Ocultar' : 'Mostrar'}
            >
              {card.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded"
              onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Center drag area */}
          <div 
            className="absolute inset-0 cursor-move z-10"
            onMouseDown={handleDragStart}
          />

          {/* Resize handles - All 8 directions */}
          {/* Corners */}
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-br cursor-se-resize z-20 flex items-center justify-center hover:scale-110 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          >
            <Maximize2 className="w-2.5 h-2.5 text-primary-foreground rotate-90" />
          </div>
          <div 
            className="absolute -bottom-1 -left-1 w-4 h-4 bg-primary rounded-bl cursor-sw-resize z-20 hover:scale-110 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-tr cursor-ne-resize z-20 hover:scale-110 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-tl cursor-nw-resize z-20 hover:scale-110 transition-transform"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          
          {/* Edges */}
          <div 
            className="absolute top-1/2 -right-1 w-3 h-8 -translate-y-1/2 bg-primary/80 rounded-r cursor-e-resize z-20 hover:bg-primary transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="absolute top-1/2 -left-1 w-3 h-8 -translate-y-1/2 bg-primary/80 rounded-l cursor-w-resize z-20 hover:bg-primary transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute -bottom-1 left-1/2 w-8 h-3 -translate-x-1/2 bg-primary/80 rounded-b cursor-s-resize z-20 hover:bg-primary transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            className="absolute -top-1 left-1/2 w-8 h-3 -translate-x-1/2 bg-primary/80 rounded-t cursor-n-resize z-20 hover:bg-primary transition-colors"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />

          {/* Size indicator */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 border border-border rounded text-xs text-muted-foreground whitespace-nowrap z-20">
            {Math.round(card.width)} × {Math.round(card.height)}
          </div>
        </>
      )}

      {/* Card Content */}
      <div className={cn("w-full h-full overflow-hidden", isEditMode && isSelected && "pointer-events-none")}>
        {children}
      </div>
    </motion.div>
  );
};
