import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Copy, 
  Trash2, 
  Settings2,
  Move,
  Maximize2 
} from 'lucide-react';
import { DashboardElement, AnimationType } from '../types';
import { cn } from '@/lib/utils';

interface DraggableElementProps {
  element: DashboardElement;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenSettings: (id: string) => void;
  children: React.ReactNode;
}

const getAnimationVariants = (animation: AnimationType) => {
  switch (animation) {
    case 'fade-in':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case 'slide-up':
      return { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };
    case 'slide-down':
      return { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } };
    case 'slide-left':
      return { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } };
    case 'slide-right':
      return { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } };
    case 'scale':
      return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } };
    case 'bounce':
      return { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 } };
    case 'pulse':
      return { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } };
    case 'shake':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    default:
      return { initial: {}, animate: {} };
  }
};

export const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  isSelected,
  isEditMode,
  onSelect,
  onMove,
  onResize,
  onDelete,
  onDuplicate,
  onOpenSettings,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelect(element.id);

    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle')) {
      setIsResizing(true);
      return;
    }

    if (target.closest('.drag-handle') || target.closest('.element-body')) {
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
      if (isDragging) {
        const parentRect = elementRef.current?.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const newX = Math.max(0, e.clientX - parentRect.left - dragOffset.x);
          const newY = Math.max(0, e.clientY - parentRect.top - dragOffset.y);
          onMove(element.id, newX, newY);
        }
      }

      if (isResizing) {
        const parentRect = elementRef.current?.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const newWidth = Math.max(100, e.clientX - parentRect.left - element.x);
          const newHeight = Math.max(50, e.clientY - parentRect.top - element.y);
          onResize(element.id, newWidth, newHeight);
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
  }, [isDragging, isResizing, dragOffset, element, onMove, onResize]);

  const animationVariants = getAnimationVariants(element.animation || 'none');

  const getShadowClass = () => {
    switch (element.styles.shadow) {
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      default: return '';
    }
  };

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'absolute select-none',
        isEditMode && 'cursor-move',
        isSelected && isEditMode && 'ring-2 ring-primary ring-offset-2',
        getShadowClass()
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.styles.gradient?.enabled 
          ? undefined 
          : element.styles.backgroundColor,
        backgroundImage: element.styles.gradient?.enabled
          ? `linear-gradient(${element.styles.gradient.direction}, ${element.styles.gradient.from}, ${element.styles.gradient.to})`
          : undefined,
        borderRadius: element.styles.borderRadius,
        opacity: element.styles.opacity,
        border: element.styles.borderColor ? `1px solid ${element.styles.borderColor}` : undefined,
        zIndex: isSelected ? 10 : 1,
      }}
      initial={!isEditMode ? animationVariants.initial : undefined}
      animate={!isEditMode ? animationVariants.animate : undefined}
      transition={{ duration: 0.5 }}
      onMouseDown={handleMouseDown}
    >
      {/* Edit Mode Controls */}
      {isEditMode && isSelected && (
        <>
          {/* Top toolbar */}
          <div className="absolute -top-10 left-0 flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-lg">
            <button
              className="drag-handle p-1.5 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
              title="Mover"
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { e.stopPropagation(); onOpenSettings(element.id); }}
              title="Configurações"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-muted rounded"
              onClick={(e) => { e.stopPropagation(); onDuplicate(element.id); }}
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded"
              onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Resize handle */}
          <div 
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary rounded-tl"
            title="Redimensionar"
          >
            <Maximize2 className="w-3 h-3 text-primary-foreground m-0.5" />
          </div>

          {/* Drag indicator */}
          <div className="drag-handle absolute top-1 left-1/2 -translate-x-1/2 p-1 bg-muted/50 rounded cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </>
      )}

      {/* Element Content */}
      <div 
        className="element-body w-full h-full overflow-hidden"
        style={{ padding: element.styles.padding }}
      >
        {children}
      </div>
    </motion.div>
  );
};
