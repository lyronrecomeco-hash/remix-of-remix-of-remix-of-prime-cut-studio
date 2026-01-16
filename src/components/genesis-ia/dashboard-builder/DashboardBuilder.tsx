import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardBuilder } from './hooks/useDashboardBuilder';
import { EditorToolbar } from './components/EditorToolbar';
import { DraggableElement } from './components/DraggableElement';
import { ElementRenderer } from './components/ElementRenderer';
import { ElementSettingsPanel } from './components/ElementSettingsPanel';
import { GlobalStylesPanel } from './components/GlobalStylesPanel';
import { DashboardElement } from './types';
import { Loader2 } from 'lucide-react';

interface DashboardBuilderProps {
  children?: React.ReactNode;
  fallbackContent: React.ReactNode;
}

export const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  children,
  fallbackContent,
}) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [settingsElementId, setSettingsElementId] = useState<string | null>(null);
  const [showGlobalStyles, setShowGlobalStyles] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
  }, []);

  const {
    layout,
    editorState,
    isAdmin,
    isLoading,
    isSaving,
    selectedElement,
    toggleEditMode,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    saveLayout,
    updateGlobalStyles,
    selectElement,
    moveElement,
    resizeElement,
  } = useDashboardBuilder(userEmail);

  const handleOpenSettings = (id: string) => {
    setSettingsElementId(id);
    selectElement(id);
  };

  const handleCloseSettings = () => {
    setSettingsElementId(null);
  };

  const handleUpdateElement = (updates: Partial<DashboardElement>) => {
    if (settingsElementId) {
      updateElement(settingsElementId, updates);
    }
  };

  const settingsElement = layout.elements.find(el => el.id === settingsElementId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editorState.isEditMode) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveLayout();
      }

      if (e.key === 'Delete' && editorState.selectedElementId) {
        e.preventDefault();
        deleteElement(editorState.selectedElementId);
      }

      if (e.key === 'Escape') {
        selectElement(null);
        setSettingsElementId(null);
        setShowGlobalStyles(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.isEditMode, editorState.selectedElementId, undo, redo, saveLayout, deleteElement, selectElement]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no custom layout or not in edit mode with empty layout, show fallback
  const hasCustomLayout = layout.elements.length > 0;
  const showFallback = !hasCustomLayout && !editorState.isEditMode;

  const canvasStyle: React.CSSProperties = {
    backgroundColor: layout.globalStyles.backgroundGradient?.enabled
      ? undefined
      : layout.globalStyles.backgroundColor,
    backgroundImage: layout.globalStyles.backgroundGradient?.enabled
      ? `linear-gradient(${layout.globalStyles.backgroundGradient.direction}, ${layout.globalStyles.backgroundGradient.from}, ${layout.globalStyles.backgroundGradient.to})`
      : undefined,
    minHeight: editorState.isEditMode ? '600px' : 'auto',
  };

  return (
    <div className="relative">
      {/* Admin Edit Button / Toolbar */}
      {isAdmin && (
        <EditorToolbar
          isEditMode={editorState.isEditMode}
          isSaving={isSaving}
          canUndo={editorState.historyIndex > 0}
          canRedo={editorState.historyIndex < editorState.history.length - 1}
          onToggleEdit={toggleEditMode}
          onSave={saveLayout}
          onUndo={undo}
          onRedo={redo}
          onAddElement={addElement}
          onOpenGlobalStyles={() => setShowGlobalStyles(true)}
        />
      )}

      {/* Canvas */}
      <div
        className={`relative transition-all ${editorState.isEditMode ? 'mt-12 border-2 border-dashed border-primary/30 rounded-xl' : ''}`}
        style={canvasStyle}
        onClick={() => {
          if (editorState.isEditMode) {
            selectElement(null);
          }
        }}
      >
        {/* Grid overlay in edit mode */}
        {editorState.isEditMode && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: `${100 / layout.globalStyles.gridColumns}% ${layout.globalStyles.gap}px`,
            }}
          />
        )}

        {/* Custom Elements */}
        {hasCustomLayout && (
          <div className="relative" style={{ minHeight: editorState.isEditMode ? '500px' : 'auto' }}>
            {layout.elements.map((element) => (
              <DraggableElement
                key={element.id}
                element={element}
                isSelected={editorState.selectedElementId === element.id}
                isEditMode={editorState.isEditMode}
                onSelect={selectElement}
                onMove={moveElement}
                onResize={resizeElement}
                onDelete={deleteElement}
                onDuplicate={duplicateElement}
                onOpenSettings={handleOpenSettings}
              >
                <ElementRenderer element={element} isEditMode={editorState.isEditMode} />
              </DraggableElement>
            ))}
          </div>
        )}

        {/* Fallback Content */}
        {showFallback && fallbackContent}

        {/* Empty State in Edit Mode */}
        {editorState.isEditMode && !hasCustomLayout && (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <p className="text-muted-foreground mb-2">Canvas vazio</p>
            <p className="text-sm text-muted-foreground/70">
              Use o botão "Adicionar" na barra de ferramentas para criar elementos
            </p>
          </div>
        )}
      </div>

      {/* Settings Panels */}
      <AnimatePresence>
        {settingsElement && (
          <ElementSettingsPanel
            element={settingsElement}
            onUpdate={handleUpdateElement}
            onClose={handleCloseSettings}
          />
        )}

        {showGlobalStyles && (
          <GlobalStylesPanel
            globalStyles={layout.globalStyles}
            onUpdate={updateGlobalStyles}
            onClose={() => setShowGlobalStyles(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
