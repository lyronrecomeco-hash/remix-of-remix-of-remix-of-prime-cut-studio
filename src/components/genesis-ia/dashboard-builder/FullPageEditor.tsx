import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Pencil,
  Save,
  X,
  Loader2,
  Undo2,
  Redo2,
  RotateCcw,
  Palette,
  Layout,
  Type,
  Image,
  Square,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const ADMIN_EMAIL = 'lyronrp@gmail.com';

import { CardData } from './components/DraggableCard';

export interface PageConfig {
  // Background
  backgroundColor: string;
  backgroundGradient: {
    enabled: boolean;
    from: string;
    to: string;
    direction: string;
  };
  // Header
  header: {
    backgroundColor: string;
    logoColor: string;
    titleText: string;
    titleColor: string;
    showWelcome: boolean;
    welcomeBackgroundColor: string;
  };
  // Main Cards
  cards: {
    backgroundColor: string;
    borderColor: string;
    borderRadius: number;
    iconBackgroundColor: string;
    iconColor: string;
    titleColor: string;
    descriptionColor: string;
    hoverBorderColor: string;
    shadow: string;
  };
  // CTA Button
  ctaButton: {
    visible: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
  };
  // Dock
  dock: {
    backgroundColor: string;
    borderColor: string;
    buttonSize: number;
    iconSize: number;
    gap: number;
    borderRadius: number;
    activeColor: string;
    inactiveColor: string;
    position: 'bottom' | 'top';
    shadow: string;
  };
  // Dashboard Cards Data
  dashboardCards: CardData[];
  // Custom Elements
  customElements: CustomElement[];
}

export interface CustomElement {
  id: string;
  type: 'text' | 'image' | 'card' | 'spacer';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    padding?: number;
  };
}

const DEFAULT_CARDS: CardData[] = [
  {
    id: 'prospects',
    title: 'Encontrar Clientes',
    description: 'Descubra clientes com maior potencial',
    icon: 'Search',
    badge: 'Google Places',
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
    x: 0,
    y: 0,
    width: 300,
    height: 180,
    order: 0,
    visible: true,
    styles: {},
  },
  {
    id: 'radar',
    title: 'Radar Global',
    description: 'Oportunidades automáticas pela IA',
    icon: 'Radar',
    badge: 'IA Ativa',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    x: 0,
    y: 0,
    width: 300,
    height: 180,
    order: 1,
    visible: true,
    styles: {},
  },
];

const DEFAULT_CONFIG: PageConfig = {
  backgroundColor: 'hsl(var(--background))',
  backgroundGradient: {
    enabled: false,
    from: '#0f172a',
    to: '#1e293b',
    direction: 'to bottom',
  },
  header: {
    backgroundColor: 'hsl(var(--background))',
    logoColor: 'hsl(var(--primary))',
    titleText: 'Genesis IA',
    titleColor: 'hsl(var(--foreground))',
    showWelcome: true,
    welcomeBackgroundColor: 'hsl(var(--muted))',
  },
  cards: {
    backgroundColor: 'hsl(var(--card))',
    borderColor: 'hsl(var(--border))',
    borderRadius: 12,
    iconBackgroundColor: 'hsl(var(--primary) / 0.1)',
    iconColor: 'hsl(var(--primary))',
    titleColor: 'hsl(var(--foreground))',
    descriptionColor: 'hsl(var(--muted-foreground))',
    hoverBorderColor: 'hsl(var(--primary) / 0.5)',
    shadow: 'shadow-sm',
  },
  ctaButton: {
    visible: true,
    text: 'Criar meu SaaS agora',
    backgroundColor: 'hsl(var(--primary))',
    textColor: 'hsl(var(--primary-foreground))',
    borderRadius: 8,
  },
  dock: {
    backgroundColor: 'hsl(var(--card))',
    borderColor: 'hsl(var(--border))',
    buttonSize: 48,
    iconSize: 20,
    gap: 8,
    borderRadius: 16,
    activeColor: 'hsl(var(--primary))',
    inactiveColor: 'hsl(var(--muted-foreground))',
    position: 'bottom',
    shadow: 'shadow-xl',
  },
  dashboardCards: DEFAULT_CARDS,
  customElements: [],
};

export interface EditorContextValue {
  config: PageConfig;
  isEditMode: boolean;
  selectedCardId: string | null;
  updateCard: (id: string, updates: Partial<CardData>) => void;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  selectCard: (id: string | null) => void;
  addCard: () => void;
  reorderCards: (cards: CardData[]) => void;
}

interface FullPageEditorProps {
  children: (context: EditorContextValue) => React.ReactNode;
}

export const FullPageEditor: React.FC<FullPageEditorProps> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<PageConfig[]>([DEFAULT_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const isAdmin = userEmail === ADMIN_EMAIL;

  // Get user email
  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
  }, []);

  // Load config from database
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('layout_name', 'genesis-ia-full-page')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading config:', error);
      }

      if (data?.layout_config) {
        const loadedConfig = data.layout_config as unknown as PageConfig;
        setConfig({ ...DEFAULT_CONFIG, ...loadedConfig });
        setHistory([{ ...DEFAULT_CONFIG, ...loadedConfig }]);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Save config
  const saveConfig = async () => {
    if (!isAdmin) {
      toast.error('Apenas administradores podem salvar');
      return;
    }

    try {
      setIsSaving(true);

      const { data: existing } = await supabase
        .from('dashboard_layouts')
        .select('id')
        .eq('layout_name', 'genesis-ia-full-page')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('dashboard_layouts')
          .update({
            layout_config: JSON.parse(JSON.stringify(config)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dashboard_layouts')
          .insert([{
            layout_name: 'genesis-ia-full-page',
            layout_config: JSON.parse(JSON.stringify(config)),
            is_active: true,
          }]);

        if (error) throw error;
      }

      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  // Update config with history
  const updateConfig = (updates: Partial<PageConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Nested update helper
  const updateNestedConfig = <K extends keyof PageConfig>(
    key: K,
    updates: Partial<PageConfig[K]>
  ) => {
    const currentValue = config[key];
    if (typeof currentValue === 'object' && currentValue !== null) {
      updateConfig({
        [key]: { ...currentValue, ...updates },
      } as Partial<PageConfig>);
    }
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setConfig(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setConfig(history[historyIndex + 1]);
    }
  };

  const resetConfig = () => {
    updateConfig(DEFAULT_CONFIG);
    toast.success('Layout resetado!');
  };

  // Card management
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const updateCard = (id: string, updates: Partial<CardData>) => {
    const newCards = config.dashboardCards.map(card =>
      card.id === id ? { ...card, ...updates } : card
    );
    updateConfig({ dashboardCards: newCards });
  };

  const deleteCard = (id: string) => {
    const newCards = config.dashboardCards.filter(card => card.id !== id);
    updateConfig({ dashboardCards: newCards });
    setSelectedCardId(null);
    toast.success('Card removido!');
  };

  const duplicateCard = (id: string) => {
    const cardToDuplicate = config.dashboardCards.find(card => card.id === id);
    if (cardToDuplicate) {
      const newCard: CardData = {
        ...cardToDuplicate,
        id: `${cardToDuplicate.id}-copy-${Date.now()}`,
        title: `${cardToDuplicate.title} (Cópia)`,
        order: config.dashboardCards.length,
      };
      updateConfig({ dashboardCards: [...config.dashboardCards, newCard] });
      toast.success('Card duplicado!');
    }
  };

  const selectCard = (id: string | null) => {
    setSelectedCardId(id);
  };

  const addCard = () => {
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      title: 'Novo Card',
      description: 'Descrição do card',
      icon: 'Star',
      badge: 'Novo',
      badgeClass: 'bg-primary/10 text-primary border-primary/30',
      x: 0,
      y: 0,
      width: 300,
      height: 180,
      order: config.dashboardCards.length,
      visible: true,
      styles: {},
    };
    updateConfig({ dashboardCards: [...config.dashboardCards, newCard] });
    setSelectedCardId(newCard.id);
    toast.success('Card adicionado!');
  };

  const reorderCards = (cards: CardData[]) => {
    updateConfig({ dashboardCards: cards });
  };

  // Context value for children
  const editorContext: EditorContextValue = {
    config,
    isEditMode,
    selectedCardId,
    updateCard,
    deleteCard,
    duplicateCard,
    selectCard,
    addCard,
    reorderCards,
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveConfig();
      }
      if (e.key === 'Escape') {
        setActivePanel(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, historyIndex, history]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Edit Mode Toggle Button - Only for Admin */}
      {isAdmin && !isEditMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-20 right-4 z-[100]"
        >
          <Button
            onClick={() => setIsEditMode(true)}
            size="sm"
            className="gap-2 shadow-lg"
          >
            <Pencil className="w-4 h-4" />
            Editar Painel
          </Button>
        </motion.div>
      )}

      {/* Edit Mode Toolbar */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur border-b border-border shadow-lg"
          >
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-primary">✏️ Modo Editor</span>
                
                <Separator orientation="vertical" className="h-6 mx-2" />

                {/* Section Buttons */}
                <Button
                  variant={activePanel === 'background' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'background' ? null : 'background')}
                  className="gap-1.5"
                >
                  <Palette className="w-4 h-4" />
                  Fundo
                </Button>
                <Button
                  variant={activePanel === 'header' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'header' ? null : 'header')}
                  className="gap-1.5"
                >
                  <Layout className="w-4 h-4" />
                  Header
                </Button>
                <Button
                  variant={activePanel === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'cards' ? null : 'cards')}
                  className="gap-1.5"
                >
                  <Square className="w-4 h-4" />
                  Cards
                </Button>
                <Button
                  variant={activePanel === 'dock' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'dock' ? null : 'dock')}
                  className="gap-1.5"
                >
                  <Layout className="w-4 h-4" />
                  Dock
                </Button>
                <Button
                  variant={activePanel === 'cta' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'cta' ? null : 'cta')}
                  className="gap-1.5"
                >
                  <Type className="w-4 h-4" />
                  Botão CTA
                </Button>

                <Separator orientation="vertical" className="h-6 mx-2" />

                {/* Undo/Redo */}
                <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex === 0} className="h-8 w-8">
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex === history.length - 1} className="h-8 w-8">
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={resetConfig} className="h-8 w-8" title="Resetar">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={saveConfig} size="sm" className="gap-2" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)} className="gap-2">
                  <X className="w-4 h-4" />
                  Fechar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panels */}
      <Sheet open={activePanel === 'background'} onOpenChange={() => setActivePanel(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Fundo da Página</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.backgroundColor.startsWith('#') ? config.backgroundColor : '#0f172a'}
                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Gradiente</Label>
                  <Switch
                    checked={config.backgroundGradient.enabled}
                    onCheckedChange={(checked) => 
                      updateNestedConfig('backgroundGradient', { enabled: checked })
                    }
                  />
                </div>

                {config.backgroundGradient.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Cor Inicial</Label>
                      <Input
                        type="color"
                        value={config.backgroundGradient.from}
                        onChange={(e) => updateNestedConfig('backgroundGradient', { from: e.target.value })}
                        className="w-full h-10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cor Final</Label>
                      <Input
                        type="color"
                        value={config.backgroundGradient.to}
                        onChange={(e) => updateNestedConfig('backgroundGradient', { to: e.target.value })}
                        className="w-full h-10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Direção</Label>
                      <Select
                        value={config.backgroundGradient.direction}
                        onValueChange={(value) => updateNestedConfig('backgroundGradient', { direction: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="to right">Direita</SelectItem>
                          <SelectItem value="to left">Esquerda</SelectItem>
                          <SelectItem value="to top">Cima</SelectItem>
                          <SelectItem value="to bottom">Baixo</SelectItem>
                          <SelectItem value="to bottom right">Diagonal ↘</SelectItem>
                          <SelectItem value="to top right">Diagonal ↗</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Cores Predefinidas</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['#0f172a', '#18181b', '#1e1b4b', '#172554', '#0c4a6e', '#064e3b', '#3b0764', '#4c0519'].map((color) => (
                    <button
                      key={color}
                      className="w-full h-10 rounded-lg border border-border hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => updateConfig({ backgroundColor: color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={activePanel === 'header'} onOpenChange={() => setActivePanel(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Header</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Texto do Título</Label>
                <Input
                  value={config.header.titleText}
                  onChange={(e) => updateNestedConfig('header', { titleText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor do Título</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.header.titleColor.startsWith('#') ? config.header.titleColor : '#ffffff'}
                    onChange={(e) => updateNestedConfig('header', { titleColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.header.titleColor}
                    onChange={(e) => updateNestedConfig('header', { titleColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor do Logo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.header.logoColor.startsWith('#') ? config.header.logoColor : '#3b82f6'}
                    onChange={(e) => updateNestedConfig('header', { logoColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.header.logoColor}
                    onChange={(e) => updateNestedConfig('header', { logoColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fundo do Header</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.header.backgroundColor.startsWith('#') ? config.header.backgroundColor : '#0f172a'}
                    onChange={(e) => updateNestedConfig('header', { backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.header.backgroundColor}
                    onChange={(e) => updateNestedConfig('header', { backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Mostrar Boas-vindas</Label>
                <Switch
                  checked={config.header.showWelcome}
                  onCheckedChange={(checked) => updateNestedConfig('header', { showWelcome: checked })}
                />
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={activePanel === 'cards'} onOpenChange={() => setActivePanel(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cards</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.cards.backgroundColor.startsWith('#') ? config.cards.backgroundColor : '#1e293b'}
                    onChange={(e) => updateNestedConfig('cards', { backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.cards.backgroundColor}
                    onChange={(e) => updateNestedConfig('cards', { backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor da Borda</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.cards.borderColor.startsWith('#') ? config.cards.borderColor : '#334155'}
                    onChange={(e) => updateNestedConfig('cards', { borderColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.cards.borderColor}
                    onChange={(e) => updateNestedConfig('cards', { borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Raio da Borda: {config.cards.borderRadius}px</Label>
                <Slider
                  value={[config.cards.borderRadius]}
                  onValueChange={([value]) => updateNestedConfig('cards', { borderRadius: value })}
                  min={0}
                  max={32}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor do Ícone</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.cards.iconColor.startsWith('#') ? config.cards.iconColor : '#3b82f6'}
                    onChange={(e) => updateNestedConfig('cards', { iconColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.cards.iconColor}
                    onChange={(e) => updateNestedConfig('cards', { iconColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor do Título</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.cards.titleColor.startsWith('#') ? config.cards.titleColor : '#ffffff'}
                    onChange={(e) => updateNestedConfig('cards', { titleColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.cards.titleColor}
                    onChange={(e) => updateNestedConfig('cards', { titleColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor da Descrição</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.cards.descriptionColor.startsWith('#') ? config.cards.descriptionColor : '#94a3b8'}
                    onChange={(e) => updateNestedConfig('cards', { descriptionColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.cards.descriptionColor}
                    onChange={(e) => updateNestedConfig('cards', { descriptionColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sombra</Label>
                <Select
                  value={config.cards.shadow}
                  onValueChange={(value) => updateNestedConfig('cards', { shadow: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shadow-none">Nenhuma</SelectItem>
                    <SelectItem value="shadow-sm">Pequena</SelectItem>
                    <SelectItem value="shadow-md">Média</SelectItem>
                    <SelectItem value="shadow-lg">Grande</SelectItem>
                    <SelectItem value="shadow-xl">Extra Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={activePanel === 'dock'} onOpenChange={() => setActivePanel(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dock (Menu Inferior)</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.dock.backgroundColor.startsWith('#') ? config.dock.backgroundColor : '#1e293b'}
                    onChange={(e) => updateNestedConfig('dock', { backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.dock.backgroundColor}
                    onChange={(e) => updateNestedConfig('dock', { backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor da Borda</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.dock.borderColor.startsWith('#') ? config.dock.borderColor : '#334155'}
                    onChange={(e) => updateNestedConfig('dock', { borderColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.dock.borderColor}
                    onChange={(e) => updateNestedConfig('dock', { borderColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tamanho dos Botões: {config.dock.buttonSize}px</Label>
                <Slider
                  value={[config.dock.buttonSize]}
                  onValueChange={([value]) => updateNestedConfig('dock', { buttonSize: value })}
                  min={32}
                  max={64}
                  step={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Tamanho dos Ícones: {config.dock.iconSize}px</Label>
                <Slider
                  value={[config.dock.iconSize]}
                  onValueChange={([value]) => updateNestedConfig('dock', { iconSize: value })}
                  min={16}
                  max={32}
                  step={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Espaçamento: {config.dock.gap}px</Label>
                <Slider
                  value={[config.dock.gap]}
                  onValueChange={([value]) => updateNestedConfig('dock', { gap: value })}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Raio da Borda: {config.dock.borderRadius}px</Label>
                <Slider
                  value={[config.dock.borderRadius]}
                  onValueChange={([value]) => updateNestedConfig('dock', { borderRadius: value })}
                  min={0}
                  max={32}
                  step={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor Ativa (Selecionado)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.dock.activeColor.startsWith('#') ? config.dock.activeColor : '#3b82f6'}
                    onChange={(e) => updateNestedConfig('dock', { activeColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.dock.activeColor}
                    onChange={(e) => updateNestedConfig('dock', { activeColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Inativa</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.dock.inactiveColor.startsWith('#') ? config.dock.inactiveColor : '#64748b'}
                    onChange={(e) => updateNestedConfig('dock', { inactiveColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.dock.inactiveColor}
                    onChange={(e) => updateNestedConfig('dock', { inactiveColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sombra</Label>
                <Select
                  value={config.dock.shadow}
                  onValueChange={(value) => updateNestedConfig('dock', { shadow: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shadow-none">Nenhuma</SelectItem>
                    <SelectItem value="shadow-md">Média</SelectItem>
                    <SelectItem value="shadow-lg">Grande</SelectItem>
                    <SelectItem value="shadow-xl">Extra Grande</SelectItem>
                    <SelectItem value="shadow-2xl">2XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={activePanel === 'cta'} onOpenChange={() => setActivePanel(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Botão CTA</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] pr-4">
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <Label>Visível</Label>
                <Switch
                  checked={config.ctaButton.visible}
                  onCheckedChange={(checked) => updateNestedConfig('ctaButton', { visible: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Input
                  value={config.ctaButton.text}
                  onChange={(e) => updateNestedConfig('ctaButton', { text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.ctaButton.backgroundColor.startsWith('#') ? config.ctaButton.backgroundColor : '#3b82f6'}
                    onChange={(e) => updateNestedConfig('ctaButton', { backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.ctaButton.backgroundColor}
                    onChange={(e) => updateNestedConfig('ctaButton', { backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.ctaButton.textColor.startsWith('#') ? config.ctaButton.textColor : '#ffffff'}
                    onChange={(e) => updateNestedConfig('ctaButton', { textColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.ctaButton.textColor}
                    onChange={(e) => updateNestedConfig('ctaButton', { textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Raio da Borda: {config.ctaButton.borderRadius}px</Label>
                <Slider
                  value={[config.ctaButton.borderRadius]}
                  onValueChange={([value]) => updateNestedConfig('ctaButton', { borderRadius: value })}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Render Children with Context */}
      <div style={{ marginTop: isEditMode ? '48px' : 0 }}>
        {children(editorContext)}
      </div>
    </>
  );
};
