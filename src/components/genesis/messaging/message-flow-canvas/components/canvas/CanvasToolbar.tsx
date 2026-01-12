// Canvas Toolbar - Modern floating toolbar at top
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  FileCode,
  Download,
  Upload,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Copy,
  Scissors,
  ClipboardPaste,
  Sparkles,
  Wand2,
  Layout,
  Settings2,
  Eye,
  Bug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CanvasToolbarProps {
  onAddNode: () => void;
  onLoadTemplate: () => void;
  onExport: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onToggleGrid: () => void;
  onAutoLayout: () => void;
  onTogglePreview: () => void;
  onToggleDebug: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isGridEnabled: boolean;
  isPreviewMode: boolean;
  isDebugMode: boolean;
  isLocked: boolean;
  zoomLevel: number;
}

export const CanvasToolbar = memo(({
  onAddNode,
  onLoadTemplate,
  onExport,
  onImport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleGrid,
  onAutoLayout,
  onTogglePreview,
  onToggleDebug,
  canUndo,
  canRedo,
  isGridEnabled,
  isPreviewMode,
  isDebugMode,
  isLocked,
  zoomLevel,
}: CanvasToolbarProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "absolute top-4 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-1 px-3 py-2",
          "bg-card/95 backdrop-blur-xl rounded-2xl",
          "border border-border/50 shadow-2xl"
        )}
      >
        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddNode}
                disabled={isLocked}
                className="gap-2 h-9 px-3 rounded-xl hover:bg-primary/10 hover:text-primary"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Adicionar Nó</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Adicionar novo nó ao canvas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadTemplate}
                disabled={isLocked}
                className="gap-2 h-9 px-3 rounded-xl hover:bg-amber-500/10 hover:text-amber-600"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Templates</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Carregar template pronto</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Edit Actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onUndo}
                disabled={!canUndo || isLocked}
                className="h-8 w-8 rounded-lg"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desfazer (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRedo}
                disabled={!canRedo || isLocked}
                className="h-8 w-8 rounded-lg"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refazer (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* View Controls */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomOut}
                className="h-8 w-8 rounded-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Diminuir zoom</TooltipContent>
          </Tooltip>

          <Badge variant="secondary" className="h-7 px-2 font-mono text-xs">
            {Math.round(zoomLevel * 100)}%
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onZoomIn}
                className="h-8 w-8 rounded-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aumentar zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFitView}
                className="h-8 w-8 rounded-lg"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ajustar à tela</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Layout Tools */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isGridEnabled ? "secondary" : "ghost"}
                size="icon"
                onClick={onToggleGrid}
                className="h-8 w-8 rounded-lg"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grade de alinhamento</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAutoLayout}
                disabled={isLocked}
                className="h-8 w-8 rounded-lg hover:bg-purple-500/10 hover:text-purple-600"
              >
                <Wand2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Auto-organizar nós</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Import/Export */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onImport}
                disabled={isLocked}
                className="h-8 w-8 rounded-lg"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Importar flow</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                className="h-8 w-8 rounded-lg"
              >
                <Download className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exportar flow</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Debug & Preview */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isPreviewMode ? "secondary" : "ghost"}
                size="icon"
                onClick={onTogglePreview}
                className="h-8 w-8 rounded-lg"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Modo visualização</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isDebugMode ? "secondary" : "ghost"}
                size="icon"
                onClick={onToggleDebug}
                className={cn(
                  "h-8 w-8 rounded-lg",
                  isDebugMode && "text-amber-600"
                )}
              >
                <Bug className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Modo debug</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
});

CanvasToolbar.displayName = 'CanvasToolbar';
