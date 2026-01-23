import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, 
  Plus, 
  RefreshCw, 
  Search, 
  Loader2,
  FolderOpen,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ProjectCard, ProjectConfig } from './ProjectCard';
import { EvolutionWizard } from './evolution/EvolutionWizard';
import { PLATFORM_OPTIONS } from './evolution/evolutionTypes';

interface ProjectLibraryProps {
  affiliateId: string;
  onEdit: (project: ProjectConfig) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

type ViewMode = 'list' | 'evolve';

export function ProjectLibrary({ affiliateId, onEdit, onCreateNew, onBack }: ProjectLibraryProps) {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Evolution state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProject, setSelectedProject] = useState<ProjectConfig | null>(null);

  useEffect(() => {
    loadProjects();
  }, [affiliateId]);

  useEffect(() => {
    if (projects.length === 0) return;

    const configIds = projects.map((c) => c.id);

    const channel = supabase
      .channel('project-views-library')
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
          setProjects((prev) =>
            prev.map((c) =>
              c.id === updated.id ? { ...c, views_count: updated.views_count } : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projects.length]);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('affiliate_template_configs')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
      toast.error('Erro ao carregar projetos');
    } else {
      setProjects(data as ProjectConfig[]);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
    toast.success('Atualizado!');
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    const { error } = await supabase
      .from('affiliate_template_configs')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Erro ao excluir projeto');
    } else {
      toast.success('Projeto excluído');
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    }

    setDeleting(false);
    setDeleteId(null);
  };

  const handleEvolve = (project: ProjectConfig) => {
    setSelectedProject(project);
    setViewMode('evolve');
  };

  const handleEvolutionComplete = () => {
    setViewMode('list');
    setSelectedProject(null);
    loadProjects();
  };

  const handleEvolutionBack = () => {
    setViewMode('list');
    setSelectedProject(null);
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === '' ||
      project.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.template_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform =
      platformFilter === 'all' || (project.platform || 'lovable') === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Evolution View
  if (viewMode === 'evolve' && selectedProject) {
    return (
      <EvolutionWizard
        project={selectedProject}
        onBack={handleEvolutionBack}
        onComplete={handleEvolutionComplete}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <Library className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Biblioteca</h2>
            <p className="text-xs text-muted-foreground">
              {projects.length} projeto{projects.length !== 1 ? 's' : ''} • Gerencie e evolua seus projetos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={onCreateNew}
            className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Badge
              variant={platformFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setPlatformFilter('all')}
            >
              Todos
            </Badge>
            {PLATFORM_OPTIONS.slice(0, 4).map((platform) => (
              <Badge
                key={platform.value}
                variant={platformFilter === platform.value ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setPlatformFilter(platform.value)}
              >
                {platform.icon} {platform.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 sm:py-16 border-2 border-dashed border-border rounded-xl bg-card/30"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            {searchQuery || platformFilter !== 'all'
              ? 'Nenhum projeto encontrado'
              : 'Biblioteca vazia'}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 px-4 max-w-sm mx-auto">
            {searchQuery || platformFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Crie seu primeiro projeto usando nossos templates profissionais'}
          </p>
          {!searchQuery && platformFilter === 'all' && (
            <Button
              onClick={onCreateNew}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              <Plus className="w-4 h-4" />
              Criar Projeto
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onEdit={onEdit}
                onEvolve={handleEvolve}
                onDelete={(id) => setDeleteId(id)}
              />
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
