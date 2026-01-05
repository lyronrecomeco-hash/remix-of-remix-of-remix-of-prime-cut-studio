import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Sparkles,
  GripVertical,
  Zap,
  MessageSquare,
  UserPlus,
  MousePointer,
  GitBranch,
  Shuffle,
  Send,
  LayoutGrid,
  List,
  Globe,
  Brain,
  Clock,
  CircleStop,
  ChevronRight,
  Smartphone,
  Inbox,
  Wifi,
  Shield,
  RefreshCw,
  Gauge,
  ListPlus,
  Timer,
  AlertTriangle,
  Calendar,
  Tag,
  Repeat,
  GitMerge,
  ExternalLink,
  Radio,
  Workflow,
  Server,
  LogOut,
  UserCog,
  ShieldAlert,
  HeartPulse,
  Lock,
  Play,
  Layers,
  X,
  ArrowRight,
  Bot,
  Webhook,
  Settings,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NODE_TEMPLATES, NODE_CATEGORIES, NodeTemplate, NATIVE_WA_TEMPLATES, STABILITY_TEMPLATES, AUTOMATION_TEMPLATES, INFRASTRUCTURE_TEMPLATES, SECURITY_TEMPLATES, AI_TEMPLATES, WEBHOOK_TEMPLATES } from './types';
import { InstanceRequiredModal } from './InstanceRequiredModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import lunaAvatar from '@/assets/luna-avatar.png';

const ICONS: Record<string, any> = {
  MessageSquare, UserPlus, MousePointer, GitBranch, Shuffle, Send, LayoutGrid,
  List, Globe, Brain, Clock, CircleStop, Zap, Timer, Webhook: Globe,
  CornerDownRight: ChevronRight, Tag, Plug: ChevronRight, StickyNote: MessageSquare,
  ShoppingCart: LayoutGrid, Table: LayoutGrid, Smartphone, Inbox, Wifi,
  Shield, RefreshCw, Gauge, ListPlus, AlertTriangle,
  Calendar, Repeat, GitMerge, ExternalLink, Radio, Workflow,
  Server, LogOut, UserCog, ShieldAlert, HeartPulse, Lock, Play,
  Settings: Zap, Layers, Bot, Filter
};

interface ComponentsModalProps {
  open: boolean;
  onClose: () => void;
  onSelectComponent: (template: NodeTemplate) => void;
  onOpenLuna: () => void;
  onNavigateToInstances?: () => void;
}

export const ComponentsModal = ({ 
  open, 
  onClose, 
  onSelectComponent, 
  onOpenLuna,
  onNavigateToInstances 
}: ComponentsModalProps) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hasConnectedInstance, setHasConnectedInstance] = useState<boolean | null>(null);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [pendingComponent, setPendingComponent] = useState<NodeTemplate | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Combine all templates
  const allTemplates = [
    ...AI_TEMPLATES, 
    ...WEBHOOK_TEMPLATES, 
    ...NATIVE_WA_TEMPLATES, 
    ...NODE_TEMPLATES, 
    ...STABILITY_TEMPLATES, 
    ...AUTOMATION_TEMPLATES, 
    ...INFRASTRUCTURE_TEMPLATES, 
    ...SECURITY_TEMPLATES
  ];

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    if (open) {
      setDraggingId(null);
      setHoveredId(null);
      setSearch('');
      setSelectedCategory(null);
    }
  }, [open]);

  // Check for connected instances
  useEffect(() => {
    const checkInstances = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: instances } = await supabase
        .from('genesis_instances')
        .select('id, status')
        .eq('status', 'connected')
        .limit(1);

      setHasConnectedInstance(instances && instances.length > 0);
    };

    if (open) {
      checkInstances();
    }
  }, [open]);

  const filteredTemplates = allTemplates.filter(t =>
    (t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())) &&
    (!selectedCategory || t.category === selectedCategory)
  );

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const cat = template.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(template);
    return acc;
  }, {} as Record<string, NodeTemplate[]>);

  const handleSelect = (template: NodeTemplate) => {
    if (template.requiresInstance && !hasConnectedInstance) {
      setPendingComponent(template);
      setShowInstanceModal(true);
      return;
    }
    
    onSelectComponent(template);
    onClose();
  };

  const handleDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    if (template.requiresInstance && !hasConnectedInstance) {
      event.preventDefault();
      setPendingComponent(template);
      setShowInstanceModal(true);
      return;
    }

    const templateId = `${template.type}-${template.label}`;
    setDraggingId(templateId);
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag image
    const dragEl = document.createElement('div');
    dragEl.className = 'bg-card border rounded-lg p-2 shadow-xl';
    dragEl.innerHTML = `<span class="text-sm font-medium">${template.label}</span>`;
    dragEl.style.position = 'absolute';
    dragEl.style.top = '-1000px';
    document.body.appendChild(dragEl);
    event.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
    
    // Close modal after short delay
    setTimeout(() => {
      onClose();
      setDraggingId(null);
    }, 100);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleInstanceModalClose = () => {
    setShowInstanceModal(false);
    setPendingComponent(null);
  };

  const handleNavigateToInstances = () => {
    setShowInstanceModal(false);
    onClose();
    onNavigateToInstances?.();
  };

  const categoryOrder = ['ai', 'webhooks', 'nativos', 'gatilhos', 'condicoes', 'acoes', 'controle', 'automacao', 'estabilidade', 'infra', 'seguranca', 'avancado'];
  
  const getCategoryCount = (cat: string) => allTemplates.filter(t => t.category === cat).length;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="relative px-6 pt-5 pb-4 border-b border-border/50 bg-gradient-to-b from-muted/50 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Componentes</h2>
                  <p className="text-xs text-muted-foreground">{allTemplates.length} disponíveis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={cn(
                    'gap-1.5 px-2.5 py-1 rounded-full text-xs',
                    hasConnectedInstance 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    hasConnectedInstance ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  )} />
                  {hasConnectedInstance ? 'Online' : 'Offline'}
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Buscar componente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 bg-background border-border/50 rounded-lg"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearch('')}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium",
                  selectedCategory === null && "shadow-sm"
                )}
              >
                Todos
              </Button>
              
              {categoryOrder.filter(key => NODE_CATEGORIES[key as keyof typeof NODE_CATEGORIES] && getCategoryCount(key) > 0).map((key) => {
                const category = NODE_CATEGORIES[key as keyof typeof NODE_CATEGORIES];
                if (!category) return null;
                
                const count = getCategoryCount(key);
                const isSelected = selectedCategory === key;
                
                return (
                  <Button
                    key={key}
                    variant={isSelected ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(isSelected ? null : key)}
                    className={cn(
                      "h-7 px-2.5 rounded-full text-xs font-medium gap-1",
                      isSelected && "shadow-sm"
                    )}
                    style={isSelected ? { backgroundColor: category.color } : undefined}
                  >
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: isSelected ? '#fff' : category.color }}
                    />
                    {category.label}
                    <span className={cn(
                      "text-[10px] px-1 rounded",
                      isSelected ? "bg-white/20" : "bg-muted"
                    )}>
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="p-4">
              {search || selectedCategory ? (
                // Flat grid when filtering
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredTemplates.map((template) => {
                    const categoryColor = NODE_CATEGORIES[template.category as keyof typeof NODE_CATEGORIES]?.color || '#6b7280';
                    const templateId = `${template.type}-${template.label}`;
                    const Icon = ICONS[template.icon] || Zap;
                    const isDisabled = template.requiresInstance && !hasConnectedInstance;
                    
                    return (
                      <div
                        key={templateId}
                        draggable={!isDisabled}
                        onDragStart={(e) => handleDragStart(e, template)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleSelect(template)}
                        onMouseEnter={() => setHoveredId(templateId)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          "hover:border-primary/50 hover:bg-primary/5",
                          isDisabled && "opacity-50 cursor-not-allowed",
                          draggingId === templateId && "opacity-50 scale-95",
                          hoveredId === templateId && "border-primary/50 shadow-sm"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${categoryColor}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: categoryColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{template.label}</p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1">{template.description}</p>
                          </div>
                        </div>
                        
                        {/* Drag indicator */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Categorized accordion view
                <div className="space-y-2">
                  {categoryOrder.filter(cat => groupedTemplates[cat]?.length > 0).map((cat) => {
                    const category = NODE_CATEGORIES[cat as keyof typeof NODE_CATEGORIES];
                    if (!category) return null;
                    const CategoryIcon = ICONS[category.icon] || Zap;
                    const templates = groupedTemplates[cat];
                    const isExpanded = expandedCategory === cat || expandedCategory === null;
                    
                    return (
                      <div key={cat} className="border border-border/50 rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                          className="w-full flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            <CategoryIcon className="w-3.5 h-3.5" style={{ color: category.color }} />
                          </div>
                          <span className="text-sm font-medium flex-1 text-left" style={{ color: category.color }}>
                            {category.label}
                          </span>
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            {templates.length}
                          </Badge>
                          <ChevronDown 
                            className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180"
                            )} 
                          />
                        </button>
                        
                        {/* Category Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 p-2 pt-0 bg-muted/30">
                                {templates.map((template) => {
                                  const templateId = `${template.type}-${template.label}`;
                                  const Icon = ICONS[template.icon] || Zap;
                                  const isDisabled = template.requiresInstance && !hasConnectedInstance;
                                  
                                  return (
                                    <div
                                      key={templateId}
                                      draggable={!isDisabled}
                                      onDragStart={(e) => handleDragStart(e, template)}
                                      onDragEnd={handleDragEnd}
                                      onClick={() => handleSelect(template)}
                                      onMouseEnter={() => setHoveredId(templateId)}
                                      onMouseLeave={() => setHoveredId(null)}
                                      className={cn(
                                        "group relative p-2.5 rounded-md bg-background border border-transparent cursor-pointer transition-all",
                                        "hover:border-primary/30 hover:shadow-sm",
                                        isDisabled && "opacity-50 cursor-not-allowed",
                                        draggingId === templateId && "opacity-50 scale-95",
                                        hoveredId === templateId && "border-primary/30"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                          style={{ backgroundColor: `${category.color}15` }}
                                        >
                                          <Icon className="w-3 h-3" style={{ color: category.color }} />
                                        </div>
                                        <span className="text-xs font-medium truncate flex-1">{template.label}</span>
                                        <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredTemplates.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum componente encontrado</p>
                  <Button variant="link" size="sm" onClick={() => { setSearch(''); setSelectedCategory(null); }}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer - Luna CTA */}
          <div className="p-4 border-t border-border/50 bg-gradient-to-b from-transparent to-muted/30">
            <Button
              onClick={() => { onClose(); onOpenLuna(); }}
              className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20">
                  <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Criar com Luna IA</p>
                  <p className="text-[10px] opacity-80">Descreva e ela constrói automaticamente</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 ml-auto group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InstanceRequiredModal 
        open={showInstanceModal}
        onClose={handleInstanceModalClose}
        onNavigateToInstances={handleNavigateToInstances}
        componentName={pendingComponent?.label || ''}
      />
    </>
  );
};
