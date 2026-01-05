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
  ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NODE_TEMPLATES, NODE_CATEGORIES, NodeTemplate, NATIVE_WA_TEMPLATES, STABILITY_TEMPLATES, AUTOMATION_TEMPLATES, INFRASTRUCTURE_TEMPLATES, SECURITY_TEMPLATES, AI_TEMPLATES, WEBHOOK_TEMPLATES } from './types';
import { InstanceRequiredModal } from './InstanceRequiredModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const ICONS: Record<string, any> = {
  MessageSquare, UserPlus, MousePointer, GitBranch, Shuffle, Send, LayoutGrid,
  List, Globe, Brain, Clock, CircleStop, Zap, Timer, Webhook: Globe,
  CornerDownRight: ChevronRight, Tag, Plug: ChevronRight, StickyNote: MessageSquare,
  ShoppingCart: LayoutGrid, Table: LayoutGrid, Smartphone, Inbox, Wifi,
  Shield, RefreshCw, Gauge, ListPlus, AlertTriangle,
  Calendar, Repeat, GitMerge, ExternalLink, Radio, Workflow,
  Server, LogOut, UserCog, ShieldAlert, HeartPulse, Lock, Play,
  Settings: Zap, Layers
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
  const searchRef = useRef<HTMLInputElement>(null);

  // Combine all templates - AI first, Webhooks, Native, then others
  const allTemplates = [...AI_TEMPLATES, ...WEBHOOK_TEMPLATES, ...NATIVE_WA_TEMPLATES, ...NODE_TEMPLATES, ...STABILITY_TEMPLATES, ...AUTOMATION_TEMPLATES, ...INFRASTRUCTURE_TEMPLATES, ...SECURITY_TEMPLATES];

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    // Reset states when modal opens
    if (open) {
      setDraggingId(null);
      setHoveredId(null);
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

  // Group templates by category for better organization
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
    
    // Close modal after short delay to allow drag to start
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

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden border-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-xl shadow-2xl">
          {/* Premium Header */}
          <div className="relative px-6 pt-6 pb-5 border-b border-border/50">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-primary/20">
                    <Layers className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{allTemplates.length}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Biblioteca de Componentes
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Arraste ou clique para adicionar ao fluxo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Instance Status */}
                <Badge 
                  variant="outline"
                  className={cn(
                    'gap-1.5 px-3 py-1.5 rounded-full',
                    hasConnectedInstance 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    hasConnectedInstance ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  {hasConnectedInstance ? 'Conectado' : 'Sem Instância'}
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mt-5">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 blur-sm opacity-50" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar componentes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-background/80 border-border/50 rounded-xl text-base placeholder:text-muted-foreground/60 focus-visible:ring-primary/30"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 h-8 w-8 rounded-lg"
                    onClick={() => setSearch('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "h-9 px-4 rounded-full font-medium transition-all",
                  selectedCategory === null 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "hover:bg-muted"
                )}
              >
                <LayoutGrid className="w-4 h-4 mr-1.5" />
                Todos
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-background/50">
                  {allTemplates.length}
                </Badge>
              </Button>
              
              {categoryOrder.filter(key => NODE_CATEGORIES[key as keyof typeof NODE_CATEGORIES]).map((key) => {
                const category = NODE_CATEGORIES[key as keyof typeof NODE_CATEGORIES];
                if (!category) return null;
                
                const CategoryIcon = ICONS[category.icon] || Zap;
                const count = allTemplates.filter(t => t.category === key).length;
                const isSelected = selectedCategory === key;
                const isAI = key === 'ai';
                const isWebhooks = key === 'webhooks';
                
                return (
                  <Button
                    key={key}
                    variant={isSelected ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className={cn(
                      "h-9 px-3 rounded-full font-medium transition-all gap-1.5",
                      isSelected && "shadow-lg",
                      !isSelected && "hover:bg-muted"
                    )}
                    style={isSelected ? { 
                      backgroundColor: category.color, 
                      color: '#fff',
                      boxShadow: `0 4px 14px ${category.color}40`
                    } : undefined}
                  >
                    <CategoryIcon 
                      className="w-4 h-4" 
                      style={!isSelected ? { color: category.color } : undefined} 
                    />
                    {category.label}
                    {(isAI || isWebhooks) && !isSelected && (
                      <span className="ml-0.5 text-[10px] animate-pulse">✨</span>
                    )}
                    {count > 0 && (
                      <span 
                        className={cn(
                          "text-[10px] px-1.5 rounded-full",
                          isSelected ? "bg-white/20" : "bg-muted"
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Components Grid */}
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="p-5">
              {selectedCategory === null && !search ? (
                // Grouped view when no filter
                <div className="space-y-6">
                  {categoryOrder.filter(cat => groupedTemplates[cat]?.length > 0).map((cat) => {
                    const category = NODE_CATEGORIES[cat as keyof typeof NODE_CATEGORIES];
                    if (!category) return null;
                    const CategoryIcon = ICONS[category.icon] || Zap;
                    
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-2 mb-3 px-1">
                          <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <CategoryIcon className="w-3.5 h-3.5" style={{ color: category.color }} />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: category.color }}>
                            {category.label}
                          </span>
                          <div className="flex-1 h-px bg-border/50" />
                          <span className="text-xs text-muted-foreground">{groupedTemplates[cat].length}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {groupedTemplates[cat].map((template) => (
                            <ComponentCard
                              key={`${template.type}-${template.label}`}
                              template={template}
                              categoryColor={category.color}
                              isDisabled={template.category === 'nativos' && !hasConnectedInstance}
                              isDragging={draggingId === `${template.type}-${template.label}`}
                              isHovered={hoveredId === `${template.type}-${template.label}`}
                              hasConnectedInstance={hasConnectedInstance}
                              onSelect={handleSelect}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onHover={setHoveredId}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Flat grid when filtering
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template) => {
                      const categoryColor = NODE_CATEGORIES[template.category as keyof typeof NODE_CATEGORIES]?.color || '#6b7280';
                      return (
                        <motion.div
                          key={`${template.type}-${template.label}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ComponentCard
                            template={template}
                            categoryColor={categoryColor}
                            isDisabled={template.category === 'nativos' && !hasConnectedInstance}
                            isDragging={draggingId === `${template.type}-${template.label}`}
                            isHovered={hoveredId === `${template.type}-${template.label}`}
                            hasConnectedInstance={hasConnectedInstance}
                            onSelect={handleSelect}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onHover={setHoveredId}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {filteredTemplates.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhum componente encontrado</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Tente buscar por outro termo</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Luna AI Footer */}
          <div className="relative p-5 border-t border-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-violet-500/5 pointer-events-none" />
            
            <div className="relative">
              <Button
                onClick={() => { onClose(); onOpenLuna(); }}
                className="w-full h-14 gap-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-violet-600 hover:from-blue-500 hover:via-cyan-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/20 transition-all hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-[1.01]"
                size="lg"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold">Criar com Luna IA</p>
                  <p className="text-xs text-white/70 font-normal">Descreva e a IA monta o fluxo</p>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Button>
            </div>
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

// Component Card - Extracted for cleaner code
interface ComponentCardProps {
  template: NodeTemplate;
  categoryColor: string;
  isDisabled: boolean;
  isDragging: boolean;
  isHovered: boolean;
  hasConnectedInstance: boolean | null;
  onSelect: (template: NodeTemplate) => void;
  onDragStart: (event: React.DragEvent, template: NodeTemplate) => void;
  onDragEnd: () => void;
  onHover: (id: string | null) => void;
}

const ComponentCard = ({
  template,
  categoryColor,
  isDisabled,
  isDragging,
  isHovered,
  hasConnectedInstance,
  onSelect,
  onDragStart,
  onDragEnd,
  onHover
}: ComponentCardProps) => {
  const Icon = ICONS[template.icon] || Zap;
  const cardId = `${template.type}-${template.label}`;
  const isNative = template.category === 'nativos';

  return (
    <div
      draggable={!isDisabled}
      onDragStart={(e) => onDragStart(e, template)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(template)}
      onMouseEnter={() => onHover(cardId)}
      onMouseLeave={() => onHover(null)}
      data-allow-drag="true"
      className={cn(
        'group relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200',
        'bg-card/50 hover:bg-card',
        isDisabled 
          ? 'cursor-pointer opacity-60 hover:opacity-100 hover:border-amber-500/50' 
          : 'cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 hover:-translate-y-0.5',
        isDragging && 'opacity-30 scale-95',
        isHovered && !isDragging && 'border-primary/50 bg-card shadow-md',
        isNative && !isHovered && 'border-emerald-500/20'
      )}
    >
      {/* Drag Handle */}
      <div className={cn(
        "flex-shrink-0 transition-opacity",
        isDisabled ? 'opacity-20' : 'opacity-30 group-hover:opacity-70'
      )}>
        <GripVertical className="w-4 h-4" />
      </div>
      
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200",
          isHovered && "scale-110"
        )}
        style={{ 
          backgroundColor: `${categoryColor}15`,
          boxShadow: isHovered ? `0 4px 12px ${categoryColor}20` : undefined
        }}
      >
        <Icon className="w-5 h-5" style={{ color: categoryColor }} />
      </div>
      
      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm truncate">{template.label}</p>
          {isNative && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] py-0 px-1.5 h-4 flex-shrink-0",
                hasConnectedInstance 
                  ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" 
                  : "border-amber-500/50 text-amber-500 bg-amber-500/10"
              )}
            >
              {hasConnectedInstance ? '✓' : '!'}
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{template.description}</p>
      </div>

      {/* Hover Arrow */}
      <motion.div
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
        className="flex-shrink-0"
      >
        <ArrowRight className="w-4 h-4 text-primary" />
      </motion.div>
    </div>
  );
};
