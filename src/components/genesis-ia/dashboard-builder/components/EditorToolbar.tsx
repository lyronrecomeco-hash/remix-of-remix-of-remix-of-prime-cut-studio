import React from 'react';
import { motion } from 'framer-motion';
import {
  Pencil,
  Save,
  Undo2,
  Redo2,
  Plus,
  Square,
  Type,
  Image,
  Minus,
  BarChart3,
  MousePointer,
  Palette,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ElementType } from '../types';

interface EditorToolbarProps {
  isEditMode: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddElement: (type: ElementType) => void;
  onOpenGlobalStyles: () => void;
}

const ELEMENT_OPTIONS: { type: ElementType; label: string; icon: React.ElementType }[] = [
  { type: 'card', label: 'Card', icon: Square },
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'image', label: 'Imagem', icon: Image },
  { type: 'stat', label: 'Estatística', icon: BarChart3 },
  { type: 'button', label: 'Botão', icon: MousePointer },
  { type: 'divider', label: 'Divisor', icon: Minus },
  { type: 'spacer', label: 'Espaçador', icon: Square },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isEditMode,
  isSaving,
  canUndo,
  canRedo,
  onToggleEdit,
  onSave,
  onUndo,
  onRedo,
  onAddElement,
  onOpenGlobalStyles,
}) => {
  if (!isEditMode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-20 right-4 z-50"
      >
        <Button
          onClick={onToggleEdit}
          size="sm"
          className="gap-2 shadow-lg"
        >
          <Pencil className="w-4 h-4" />
          Editar Layout
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-lg"
    >
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Add Element */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Elementos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ELEMENT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.type}
                  onClick={() => onAddElement(option.type)}
                  className="gap-2 cursor-pointer"
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Undo/Redo */}
          <div className="flex items-center border-l border-border pl-2 ml-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8"
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Global Styles */}
          <div className="flex items-center border-l border-border pl-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenGlobalStyles}
              className="gap-2"
            >
              <Palette className="w-4 h-4" />
              Estilos Globais
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save */}
          <Button
            onClick={onSave}
            size="sm"
            className="gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </Button>

          {/* Exit Edit Mode */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleEdit}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
