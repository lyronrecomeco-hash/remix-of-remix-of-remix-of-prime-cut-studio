import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DashboardLayout, 
  DashboardElement, 
  EditorState, 
  ElementType,
  ELEMENT_TEMPLATES,
  DEFAULT_ELEMENT_STYLES
} from '../types';

const ADMIN_EMAIL = 'lyronrp@gmail.com';

const DEFAULT_LAYOUT: DashboardLayout = {
  id: 'default',
  name: 'Layout Padrão',
  elements: [],
  globalStyles: {
    backgroundColor: 'hsl(var(--background))',
    gridColumns: 12,
    gap: 16,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useDashboardBuilder = (userEmail: string | null) => {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [editorState, setEditorState] = useState<EditorState>({
    isEditMode: false,
    selectedElementId: null,
    copiedElement: null,
    history: [DEFAULT_LAYOUT],
    historyIndex: 0,
    isDragging: false,
    isResizing: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = userEmail === ADMIN_EMAIL;

  // Load layout from database
  const loadLayout = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('layout_name', 'genesis-ia-dashboard')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading layout:', error);
      }

      if (data?.layout_config) {
        const loadedLayout = data.layout_config as unknown as DashboardLayout;
        loadedLayout.id = data.id;
        setLayout(loadedLayout);
        setEditorState(prev => ({
          ...prev,
          history: [loadedLayout],
          historyIndex: 0,
        }));
      }
    } catch (error) {
      console.error('Error loading layout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  // Save layout to database
  const saveLayout = async () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem salvar o layout');
      return;
    }

    try {
      setIsSaving(true);
      const updatedLayout = {
        ...layout,
        updatedAt: new Date().toISOString(),
      };

      // Check if layout exists
      const { data: existing } = await supabase
        .from('dashboard_layouts')
        .select('id')
        .eq('layout_name', 'genesis-ia-dashboard')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('dashboard_layouts')
          .update({
            layout_config: JSON.parse(JSON.stringify(updatedLayout)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dashboard_layouts')
          .insert([{
            layout_name: 'genesis-ia-dashboard',
            layout_config: JSON.parse(JSON.stringify(updatedLayout)),
            is_active: true,
          }]);

        if (error) throw error;
      }

      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Erro ao salvar layout');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem editar');
      return;
    }
    setEditorState(prev => ({
      ...prev,
      isEditMode: !prev.isEditMode,
      selectedElementId: null,
    }));
  };

  // Add new element
  const addElement = (type: ElementType) => {
    const template = ELEMENT_TEMPLATES[type];
    const newElement: DashboardElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 50,
      y: 50,
      width: template.width || 200,
      height: template.height || 100,
      content: template.content || {},
      styles: template.styles || DEFAULT_ELEMENT_STYLES,
      animation: 'fade-in',
    };

    const newLayout = {
      ...layout,
      elements: [...layout.elements, newElement],
    };

    updateLayoutWithHistory(newLayout);
    setEditorState(prev => ({
      ...prev,
      selectedElementId: newElement.id,
    }));
  };

  // Update element
  const updateElement = (elementId: string, updates: Partial<DashboardElement>) => {
    const newLayout = {
      ...layout,
      elements: layout.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    };
    updateLayoutWithHistory(newLayout);
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    const newLayout = {
      ...layout,
      elements: layout.elements.filter(el => el.id !== elementId),
    };
    updateLayoutWithHistory(newLayout);
    setEditorState(prev => ({
      ...prev,
      selectedElementId: null,
    }));
  };

  // Copy element
  const copyElement = (elementId: string) => {
    const element = layout.elements.find(el => el.id === elementId);
    if (element) {
      setEditorState(prev => ({
        ...prev,
        copiedElement: { ...element },
      }));
      toast.success('Elemento copiado!');
    }
  };

  // Paste element
  const pasteElement = () => {
    if (editorState.copiedElement) {
      const newElement: DashboardElement = {
        ...editorState.copiedElement,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: editorState.copiedElement.x + 20,
        y: editorState.copiedElement.y + 20,
      };

      const newLayout = {
        ...layout,
        elements: [...layout.elements, newElement],
      };

      updateLayoutWithHistory(newLayout);
      setEditorState(prev => ({
        ...prev,
        selectedElementId: newElement.id,
      }));
      toast.success('Elemento colado!');
    }
  };

  // Duplicate element
  const duplicateElement = (elementId: string) => {
    const element = layout.elements.find(el => el.id === elementId);
    if (element) {
      const newElement: DashboardElement = {
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20,
      };

      const newLayout = {
        ...layout,
        elements: [...layout.elements, newElement],
      };

      updateLayoutWithHistory(newLayout);
      setEditorState(prev => ({
        ...prev,
        selectedElementId: newElement.id,
      }));
    }
  };

  // Update layout with history
  const updateLayoutWithHistory = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newLayout);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  };

  // Undo
  const undo = () => {
    if (editorState.historyIndex > 0) {
      const newIndex = editorState.historyIndex - 1;
      setLayout(editorState.history[newIndex]);
      setEditorState(prev => ({
        ...prev,
        historyIndex: newIndex,
      }));
    }
  };

  // Redo
  const redo = () => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      const newIndex = editorState.historyIndex + 1;
      setLayout(editorState.history[newIndex]);
      setEditorState(prev => ({
        ...prev,
        historyIndex: newIndex,
      }));
    }
  };

  // Update global styles
  const updateGlobalStyles = (styles: Partial<DashboardLayout['globalStyles']>) => {
    const newLayout = {
      ...layout,
      globalStyles: {
        ...layout.globalStyles,
        ...styles,
      },
    };
    updateLayoutWithHistory(newLayout);
  };

  // Select element
  const selectElement = (elementId: string | null) => {
    setEditorState(prev => ({
      ...prev,
      selectedElementId: elementId,
    }));
  };

  // Move element
  const moveElement = (elementId: string, x: number, y: number) => {
    updateElement(elementId, { x, y });
  };

  // Resize element
  const resizeElement = (elementId: string, width: number, height: number) => {
    updateElement(elementId, { width, height });
  };

  const selectedElement = layout.elements.find(el => el.id === editorState.selectedElementId);

  return {
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
    copyElement,
    pasteElement,
    duplicateElement,
    undo,
    redo,
    saveLayout,
    updateGlobalStyles,
    selectElement,
    moveElement,
    resizeElement,
    loadLayout,
  };
};
