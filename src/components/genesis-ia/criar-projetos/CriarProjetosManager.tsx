import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Eye, 
  Copy, 
  Trash2, 
  Pencil, 
  ExternalLink, 
  MoreVertical,
  FolderOpen,
  Plus,
  Loader2,
  TrendingUp,
  RefreshCw,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

  // Real-time subscription for views
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

  const getFullUrl = (config: ProjectConfig) => {
    const route = getProjectRoute(config);
    return `https://genesishub.cloud/${route}`;
  };

  const copyLink = (config: ProjectConfig) => {
    const url = getFullUrl(config);
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!', {
      description: url
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Meus Projetos</h2>
          <Badge variant="secondary">{configs.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {configs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
        >
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum projeto criado
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Crie seu primeiro projeto e personalize para seus clientes
          </p>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Projeto
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {configs.map((config, index) => (
              <motion.div
                key={config.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {config.client_name || config.template_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {config.template_name}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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

                    {/* URL Display */}
                    <div 
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 mb-3 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => copyLink(config)}
                    >
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate font-mono">
                        genesishub.cloud/{getProjectRoute(config)}
                      </span>
                      <Copy className="w-3 h-3 text-muted-foreground/50 ml-auto flex-shrink-0" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{config.views_count} visualizações</span>
                      </div>
                      <Badge variant={config.is_active ? "default" : "secondary"} className="text-[10px]">
                        {config.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>

                    {/* Date */}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Criado em {format(new Date(config.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </p>
                  </CardContent>
                </Card>
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
