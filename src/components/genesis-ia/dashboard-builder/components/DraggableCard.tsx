import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Settings2, 
  Trash2, 
  Copy,
  Move,
  Maximize2,
  X
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
  children: React.ReactNode;
  gridMode?: boolean;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  isEditMode,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenSettings,
  children,
  gridMode = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelect(card.id);

    const target = e.target as HTMLElement;
    
    if (target.closest('.resize-handle')) {
      setIsResizing(true);
      return;
    }

    if (target.closest('.drag-handle') || target.closest('.card-body')) {
      setIsDragging(true);
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !gridMode) {
        const parentRect = elementRef.current?.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const newX = Math.max(0, e.clientX - parentRect.left - dragOffset.x);
          const newY = Math.max(0, e.clientY - parentRect.top - dragOffset.y);
          onUpdate(card.id, { x: newX, y: newY });
        }
      }

      if (isResizing) {
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
          const newWidth = Math.max(200, e.clientX - rect.left);
          const newHeight = Math.max(100, e.clientY - rect.top);
          onUpdate(card.id, { width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, card.id, onUpdate, gridMode]);

  if (!card.visible && !isEditMode) return null;

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'relative',
        isEditMode && 'cursor-move',
        isSelected && isEditMode && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        !card.visible && isEditMode && 'opacity-50'
      )}
      style={!gridMode ? {
        position: 'absolute',
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        zIndex: isSelected ? 10 : 1,
      } : undefined}
      layout={gridMode}
      layoutId={card.id}
      onMouseDown={handleMouseDown}
      whileHover={isEditMode ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Edit Mode Controls */}
      {isEditMode && isSelected && (
        <>
          {/* Top toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-lg z-20"
          >
            <button
              className="drag-handle p-1.5 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
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
              {card.visible ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded"
              onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Drag handle indicator */}
          <div className="drag-handle absolute top-2 left-1/2 -translate-x-1/2 p-1 bg-primary/20 rounded cursor-grab active:cursor-grabbing z-10">
            <GripVertical className="w-4 h-4 text-primary" />
          </div>

          {/* Resize handle (only in free mode) */}
          {!gridMode && (
            <div 
              className="resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-se-resize bg-primary rounded-tl z-10"
              title="Redimensionar"
            >
              <Maximize2 className="w-3 h-3 text-primary-foreground m-1" />
            </div>
          )}
        </>
      )}

      {/* Card Content */}
      <div className="card-body w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};
