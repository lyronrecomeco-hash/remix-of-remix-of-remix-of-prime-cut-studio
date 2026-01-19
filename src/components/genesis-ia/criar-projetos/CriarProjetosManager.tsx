import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Eye, 
  Copy, 
  Trash2, 
  Pencil, 
  MoreVertical,
  FolderOpen,
  Plus,
  Loader2,
  RefreshCw,
  Link2,
  ExternalLink,
  LayoutTemplate,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectConfig {
  id: string;
  affiliate_id: string;
  template_slug: string;
  template_name: string;
  unique_code: string;
  custom_slug: string | null;
  client_name: string | null;
  config: Record<string, any>;
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CriarProjetosManagerProps {
  configs: ProjectConfig[];
  loading: boolean;
  onEdit: (config: ProjectConfig) => void;
  onDelete: (id: string) => Promise<boolean>;
  onCreateNew: () => void;
  onBack: () => void;
}

export function CriarProjetosManager({ 
  configs: initialConfigs, 
  loading, 
  onEdit, 
  onDelete,
  onCreateNew,
  onBack
}: CriarProjetosManagerProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [configs, setConfigs] = useState(initialConfigs);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setConfigs(initialConfigs);
  }, [initialConfigs]);

  useEffect(() => {
    if (configs.length === 0) return;

    const configIds = configs.map(c => c.id);
    
    const channel = supabase
      .channel('project-views')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'affiliate_template_configs',
          filter: `id=in.(${configIds.join(',')})`,
        },
        (payload) => {
          const updated = payload.new as ProjectConfig;
          setConfigs(prev => prev.map(c => c.id === updated.id ? { ...c, views_count: updated.views_count } : c));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [configs.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from('affiliate_template_configs')
      .select('*')
      .in('id', configs.map(c => c.id));
    
    if (data) {
      setConfigs(data as ProjectConfig[]);
    }
    setRefreshing(false);
    toast.success('Atualizado!');
  };

  const getProjectRoute = (config: ProjectConfig) => {
    return config.custom_slug || config.unique_code;
  };

  const copyLink = (config: ProjectConfig) => {
    const route = getProjectRoute(config);
    const url = `${window.location.origin}/p/${route}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!', { description: url });
  };

  const openPreview = (config: ProjectConfig) => {
    const route = getProjectRoute(config);
    window.open(`/p/${route}`, '_blank');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    const success = await onDelete(deleteId);
    
    if (success) {
      setConfigs(prev => prev.filter(c => c.id !== deleteId));
    }
    
    setDeleting(false);
    setDeleteId(null);
  };

  const getTemplateIcon = (slug: string) => {
    switch (slug) {
      case 'barbearia':
        return '💈';
      case 'academia':
        return '🏋️';
      case 'restaurante':
        return '🍽️';
      case 'ecommerce':
        return '🛒';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <LayoutTemplate className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Meus Projetos</h2>
            <p className="text-xs text-muted-foreground">{configs.length} projeto{configs.length !== 1 ? 's' : ''} criado{configs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onCreateNew} size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            <Plus className="w-4 h-4" />
            <span>Novo template</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {configs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 sm:py-16 border-2 border-dashed border-border rounded-xl bg-card/30"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Nenhum projeto criado
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 px-4 max-w-sm mx-auto">
            Crie seu primeiro projeto personalizado usando nossos templates profissionais
          </p>
          <Button onClick={onCreateNew} className="gap-2 bg-gradient-to-r from-primary to-purple-600">
            <Plus className="w-4 h-4" />
            Criar Projeto
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {configs.map((config, index) => (
              <motion.div
                key={config.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="relative rounded-xl border bg-gradient-to-br from-card to-card/80 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                  {/* Template Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge 
                      variant={config.is_active ? "default" : "secondary"} 
                      className="text-[10px] px-2 py-0.5 backdrop-blur-sm"
                    >
                      {config.is_active ? '🟢 Ativo' : '⚪ Inativo'}
                    </Badge>
                  </div>

                  {/* Card Header with Icon */}
                  <div className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {getTemplateIcon(config.template_slug)}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {config.client_name || config.template_name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {config.template_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* URL Section */}
                  <div className="px-4 pb-3">
                    <button 
                      onClick={() => copyLink(config)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group/url"
                    >
                      <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground truncate font-mono flex-1 text-left">
                        /p/{getProjectRoute(config)}
                      </span>
                      <Copy className="w-3 h-3 text-muted-foreground/50 group-hover/url:text-primary transition-colors flex-shrink-0" />
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="px-4 pb-3 flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3 h-3" />
                      <span>{config.views_count} visualizações</span>
                    </div>
                    <span>
                      {format(new Date(config.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => openPreview(config)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      onClick={() => onEdit(config)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyLink(config)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(config.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
