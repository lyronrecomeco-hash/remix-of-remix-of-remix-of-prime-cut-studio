import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, GripVertical, Zap, MessageSquare, UserPlus, MousePointer,
  GitBranch, Shuffle, Send, LayoutGrid, List, Globe, Brain, Clock, CircleStop,
  ChevronRight, Smartphone, Inbox, Wifi, Shield, RefreshCw, Gauge, ListPlus,
  Timer, AlertTriangle, Calendar, Tag, Repeat, GitMerge, ExternalLink, Radio,
  Workflow, Server, LogOut, UserCog, ShieldAlert, HeartPulse, Lock, Play,
  Layers, X, Bot, Settings, Filter, ChevronDown, Webhook, FileJson, Reply,
  FilterX, ListOrdered, Star, ArrowRight
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
  ShieldCheck: Shield, Star
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
    dragEl.className = 'bg-card border rounded-lg p-3 shadow-xl';
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

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-6xl max-h-[92vh] p-0 gap-0 overflow-hidden border border-border/50 bg-background shadow-2xl">
          {/* Premium Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/50 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">Biblioteca de Componentes</h2>
                    <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                      {allTemplates.length} disponíveis
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Arraste ou clique para adicionar ao seu fluxo
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline"
                  className={cn(
                    'gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                    hasConnectedInstance 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    hasConnectedInstance ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  {hasConnectedInstance ? 'Instância Online' : 'Sem Instância'}
                </Badge>
                
                <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-xl hover:bg-destructive/10">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Buscar componentes... (ex: webhook, botão, IA)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-10 h-12 bg-background border-border/50 rounded-xl text-base shadow-sm"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearch('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-9 px-4 rounded-full text-sm font-medium"
              >
                <Star className="w-4 h-4 mr-2" />
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
                const CategoryIcon = ICONS[category.icon] || Zap;
                
                return (
                  <Button
                    key={key}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(isSelected ? null : key)}
                    className="h-9 px-4 rounded-full text-sm font-medium gap-2"
                    style={isSelected ? { backgroundColor: category.color, borderColor: category.color } : undefined}
                  >
                    <CategoryIcon className="w-4 h-4" />
                    {category.label}
                    <span className="opacity-70">({count})</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Content Grid */}
          <ScrollArea className="flex-1 max-h-[58vh]">
            <div className="p-6">
              {search || selectedCategory ? (
                // Flat grid when filtering
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  <AnimatePresence>
                    {filteredTemplates.map((template, index) => {
                      const categoryColor = NODE_CATEGORIES[template.category as keyof typeof NODE_CATEGORIES]?.color || '#6b7280';
                      const templateId = `${template.type}-${template.label}`;
                      const Icon = ICONS[template.icon] || Zap;
                      const isDisabled = template.requiresInstance && !hasConnectedInstance;
                      
                      return (
                        <motion.div
                          key={templateId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.02 }}
                          draggable={!isDisabled}
                          onDragStart={(e: any) => handleDragStart(e, template)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleSelect(template)}
                          onMouseEnter={() => setHoveredId(templateId)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={cn(
                            "group relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                            "hover:shadow-lg hover:-translate-y-0.5",
                            isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
                            draggingId === templateId && "opacity-50 scale-95",
                            hoveredId === templateId ? "border-primary/50 bg-primary/5 shadow-md" : "border-border/50 bg-card"
                          )}
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${categoryColor}20` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: categoryColor }} />
                              </div>
                              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold truncate">{template.label}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                            </div>
                          </div>
                          
                          {template.requiresInstance && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className="text-[10px] h-5 bg-background">
                                <Smartphone className="w-3 h-3 mr-1" />
                                WA
                              </Badge>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                // Grouped view - show ALL categories
                <div className="space-y-8">
                  {categoryOrder.filter(cat => groupedTemplates[cat]?.length > 0).map((cat) => {
                    const category = NODE_CATEGORIES[cat as keyof typeof NODE_CATEGORIES];
                    if (!category) return null;
                    const CategoryIcon = ICONS[category.icon] || Zap;
                    const templates = groupedTemplates[cat];
                    
                    return (
                      <div key={cat}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <CategoryIcon className="w-4 h-4" style={{ color: category.color }} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold" style={{ color: category.color }}>
                              {category.label}
                            </h3>
                            <p className="text-xs text-muted-foreground">{templates.length} componentes</p>
                          </div>
                          <div className="flex-1 h-px bg-border/50" />
                        </div>
                        
                        {/* Component Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                                  "group relative p-4 rounded-xl border cursor-pointer transition-all duration-200",
                                  "hover:shadow-lg hover:-translate-y-0.5",
                                  isDisabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
                                  draggingId === templateId && "opacity-50 scale-95",
                                  hoveredId === templateId ? "border-primary/50 bg-primary/5 shadow-md" : "border-border/50 bg-card"
                                )}
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <div 
                                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                                      style={{ backgroundColor: `${category.color}20` }}
                                    >
                                      <Icon className="w-5 h-5" style={{ color: category.color }} />
                                    </div>
                                    <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold truncate">{template.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                                  </div>
                                </div>
                                
                                {template.requiresInstance && (
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className="text-[10px] h-5 bg-background">
                                      <Smartphone className="w-3 h-3 mr-1" />
                                      WA
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredTemplates.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Nenhum componente encontrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">Tente buscar por outro termo</p>
                  <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory(null); }}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Luna Footer */}
          <div className="p-4 border-t border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
            <Button
              onClick={() => { onClose(); onOpenLuna(); }}
              className="w-full h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:opacity-95 text-primary-foreground rounded-xl group shadow-lg shadow-primary/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg">
                  <img src={lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <span className="text-base font-semibold block">Criar com Luna IA</span>
                  <span className="text-xs opacity-80">Descreva e ela constrói automaticamente</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
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
