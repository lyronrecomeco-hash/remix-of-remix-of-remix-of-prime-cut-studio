import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Settings2, 
  Trash2, 
  Copy,
  Maximize2,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextElementData {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    padding?: number;
    borderRadius?: number;
  };
}

interface TextElementProps {
  element: TextElementData;
  isEditMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TextElementData>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpenSettings: (id: string) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  element,
  isEditMode,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenSettings,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, elemX: 0, elemY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Handle drag
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: element.x,
      elemY: element.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;
      
      onUpdate(element.id, {
        x: Math.max(0, dragStartRef.current.elemX + deltaX),
        y: Math.max(0, dragStartRef.current.elemY + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, isEditing, element.id, element.x, element.y, onUpdate]);

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStartRef.current.x;
      const deltaY = moveEvent.clientY - resizeStartRef.current.y;
      
      onUpdate(element.id, {
        width: Math.max(100, resizeStartRef.current.width + deltaX),
        height: Math.max(30, resizeStartRef.current.height + deltaY),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, element.id, element.width, element.height, onUpdate]);

  // Handle text editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
        // Select all text
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      onUpdate(element.id, { content: textRef.current.innerText });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      if (textRef.current) {
        onUpdate(element.id, { content: textRef.current.innerText });
      }
    }
  };

  // Handle click selection
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelect(element.id);
  };

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'absolute',
        isEditMode && !isEditing && 'cursor-move',
        isSelected && isEditMode && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isDragging && 'z-50 cursor-grabbing',
        isResizing && 'z-50'
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        minHeight: element.height,
        zIndex: isSelected ? 20 : 1,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      animate={{ 
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.3)' : '0 0 0 rgba(0,0,0,0)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Edit Mode Controls */}
      {isEditMode && isSelected && !isEditing && (
        <>
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background border border-border rounded-lg p-1 shadow-lg z-30"
          >
            <button
              className="p-1.5 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
              onMouseDown={handleDragStart}
              title="Mover"
            >
              <GripVertical className="w-4 h-4" />
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
          </motion.div>

          {/* Drag area */}
          <div 
            className="absolute inset-0 cursor-move z-10"
            onMouseDown={handleDragStart}
          />

          {/* Resize handle */}
          <div 
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-br cursor-se-resize z-20 flex items-center justify-center hover:scale-110 transition-transform"
            onMouseDown={handleResizeStart}
          >
            <Maximize2 className="w-2.5 h-2.5 text-primary-foreground rotate-90" />
          </div>
        </>
      )}

      {/* Text Content */}
      <div
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full h-full outline-none transition-all',
          isEditing && 'ring-2 ring-primary cursor-text'
        )}
        style={{
          fontSize: element.styles.fontSize || 16,
          fontWeight: element.styles.fontWeight || 'normal',
          color: element.styles.color || 'inherit',
          backgroundColor: element.styles.backgroundColor || 'transparent',
          textAlign: element.styles.textAlign || 'left',
          padding: element.styles.padding || 8,
          borderRadius: element.styles.borderRadius || 0,
        }}
      >
        {element.content}
      </div>

      {/* Edit hint */}
      {isEditMode && isSelected && !isEditing && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary/80 text-primary-foreground text-[10px] rounded whitespace-nowrap">
          Duplo clique para editar
        </div>
      )}
    </motion.div>
  );
};
