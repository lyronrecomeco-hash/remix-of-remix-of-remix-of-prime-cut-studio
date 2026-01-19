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
  TrendingUp
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
          <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-base sm:text-xl font-bold text-foreground">Meus Projetos</h2>
          <Badge variant="secondary" className="text-xs">{configs.length}</Badge>
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
          <Button onClick={onCreateNew} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {configs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 sm:py-16 border-2 border-dashed border-border rounded-xl"
        >
          <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            Nenhum projeto criado
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-4">
            Crie seu primeiro projeto personalizado
          </p>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Projeto
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                <div className="relative p-3 sm:p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {config.client_name || config.template_name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {config.template_name}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPreview(config)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(config)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(config)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
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

                  {/* URL */}
                  <button 
                    onClick={() => copyLink(config)}
                    className="w-full flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors mb-2 sm:mb-3"
                  >
                    <Link2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate font-mono">
                      /p/{getProjectRoute(config)}
                    </span>
                    <Copy className="w-3 h-3 text-muted-foreground/50 ml-auto flex-shrink-0" />
                  </button>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{config.views_count}</span>
                      </div>
                      <Badge variant={config.is_active ? "default" : "secondary"} className="text-[9px] sm:text-[10px] px-1.5">
                        {config.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {format(new Date(config.created_at), "dd/MM/yy", { locale: ptBR })}
                    </span>
                  </div>

                  {/* Quick Actions - visible on hover */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="h-7 text-[10px] sm:text-xs shadow-lg"
                      onClick={() => openPreview(config)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      size="sm"
                      className="h-7 text-[10px] sm:text-xs shadow-lg"
                      onClick={() => onEdit(config)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
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
