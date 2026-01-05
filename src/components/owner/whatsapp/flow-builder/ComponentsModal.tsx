import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, GripVertical, Zap, MessageSquare, UserPlus, MousePointer,
  GitBranch, Shuffle, Send, LayoutGrid, List, Globe, Brain, Clock, CircleStop,
  ChevronRight, Smartphone, Inbox, Wifi, Shield, RefreshCw, Gauge, ListPlus,
  Timer, AlertTriangle, Calendar, Tag, Repeat, GitMerge, ExternalLink, Radio,
  Workflow, Server, LogOut, UserCog, ShieldAlert, HeartPulse, Lock, Play,
  Layers, X, Bot, Settings, Filter, ChevronDown, Webhook, FileJson, Reply,
  FilterX, ListOrdered
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  NODE_TEMPLATES, NODE_CATEGORIES, NodeTemplate, NATIVE_WA_TEMPLATES, 
  STABILITY_TEMPLATES, AUTOMATION_TEMPLATES, INFRASTRUCTURE_TEMPLATES, 
  SECURITY_TEMPLATES, AI_TEMPLATES, WEBHOOK_TEMPLATES 
} from './types';
import { InstanceRequiredModal } from './InstanceRequiredModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import lunaAvatar from '@/assets/luna-avatar.png';

const ICONS: Record<string, any> = {
  MessageSquare, UserPlus, MousePointer, GitBranch, Shuffle, Send, LayoutGrid,
  List, Globe, Brain, Clock, CircleStop, Zap, Timer, Webhook, Tag, Smartphone,
  Inbox, Wifi, Shield, RefreshCw, Gauge, ListPlus, AlertTriangle, Calendar,
  Repeat, GitMerge, ExternalLink, Radio, Workflow, Server, LogOut, UserCog,
  ShieldAlert, HeartPulse, Lock, Play, Settings, Layers, Bot, Filter, FileJson,
  Reply, FilterX, ListOrdered, CornerDownRight: ChevronRight, Plug: ChevronRight,
  StickyNote: MessageSquare, ShoppingCart: LayoutGrid, Table: LayoutGrid,
  ShieldCheck: Shield
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

  // Combine ALL templates
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

    if (open) checkInstances();
  }, [open]);

  const filteredTemplates = allTemplates.filter(t =>
    (t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())) &&
    (!selectedCategory || t.category === selectedCategory)
  );

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
    
    const dragEl = document.createElement('div');
    dragEl.className = 'bg-card border rounded-lg p-2 shadow-xl';
    dragEl.innerHTML = `<span class="text-sm font-medium">${template.label}</span>`;
    dragEl.style.position = 'absolute';
    dragEl.style.top = '-1000px';
    document.body.appendChild(dragEl);
    event.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
    
    setTimeout(() => {
      onClose();
      setDraggingId(null);
    }, 100);
  };

  const handleDragEnd = () => setDraggingId(null);

  const categoryOrder = [
    'ai', 'webhooks', 'nativos', 'triggers', 'conditions', 'actions', 
    'flow', 'automation', 'stability', 'infrastructure', 'security', 'advanced'
  ];
  
  const getCategoryCount = (cat: string) => allTemplates.filter(t => t.category === cat).length;

  const renderComponentCard = (template: NodeTemplate, categoryColor: string) => {
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
          "group relative p-2.5 rounded-lg border border-border/50 cursor-pointer transition-all duration-150",
          "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
          isDisabled && "opacity-40 cursor-not-allowed",
          draggingId === templateId && "opacity-50 scale-95",
          hoveredId === templateId && "border-primary/40 bg-primary/5"
        )}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: categoryColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{template.label}</p>
          </div>
          <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl">
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">Componentes</h2>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {allTemplates.length} disponíveis
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Arraste ou clique para adicionar</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={cn(
                    'gap-1 px-2 py-0.5 rounded-full text-[10px]',
                    hasConnectedInstance 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    hasConnectedInstance ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  {hasConnectedInstance ? 'Online' : 'Offline'}
                </Badge>
                
                <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 bg-background border-border/50 rounded-lg text-sm"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearch('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-1 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-6 px-2 rounded-full text-[10px]"
              >
                Todos ({allTemplates.length})
              </Button>
              
              {categoryOrder.filter(key => {
                const cat = NODE_CATEGORIES[key as keyof typeof NODE_CATEGORIES];
                return cat && getCategoryCount(key) > 0;
              }).map((key) => {
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
                    className="h-6 px-2 rounded-full text-[10px] gap-1"
                    style={isSelected ? { backgroundColor: category.color } : undefined}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: isSelected ? '#fff' : category.color }}
                    />
                    {category.label}
                    <span className="opacity-70">({count})</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content Grid */}
          <ScrollArea className="flex-1 max-h-[55vh]">
            <div className="p-4">
              {search || selectedCategory ? (
                // Flat grid when filtering
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {filteredTemplates.map((template) => {
                    const categoryColor = NODE_CATEGORIES[template.category as keyof typeof NODE_CATEGORIES]?.color || '#6b7280';
                    return renderComponentCard(template, categoryColor);
                  })}
                </div>
              ) : (
                // Grouped view - show ALL categories
                <div className="space-y-4">
                  {categoryOrder.filter(cat => groupedTemplates[cat]?.length > 0).map((cat) => {
                    const category = NODE_CATEGORIES[cat as keyof typeof NODE_CATEGORIES];
                    if (!category) return null;
                    const CategoryIcon = ICONS[category.icon] || Zap;
                    const templates = groupedTemplates[cat];
                    
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <CategoryIcon className="w-3 h-3" style={{ color: category.color }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: category.color }}>
                            {category.label}
                          </span>
                          <div className="flex-1 h-px bg-border/30" />
                          <span className="text-[10px] text-muted-foreground">{templates.length}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                          {templates.map((template) => renderComponentCard(template, category.color))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredTemplates.length === 0 && (
                <div className="py-12 text-center">
                  <Search className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum componente encontrado</p>
                  <Button variant="link" size="sm" onClick={() => { setSearch(''); setSelectedCategory(null); }}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-border/50 bg-muted/20">
            <Button
              onClick={() => { onClose(); onOpenLuna(); }}
              className="w-full h-10 bg-gradient-to-r from-primary via-primary to-primary/80 hover:opacity-90 text-primary-foreground rounded-lg group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20">
                  <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium">Criar com Luna IA</span>
              </div>
              <Sparkles className="w-4 h-4 ml-auto group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InstanceRequiredModal 
        open={showInstanceModal}
        onClose={() => { setShowInstanceModal(false); setPendingComponent(null); }}
        onNavigateToInstances={() => { setShowInstanceModal(false); onClose(); onNavigateToInstances?.(); }}
        componentName={pendingComponent?.label || ''}
      />
    </>
  );
};
