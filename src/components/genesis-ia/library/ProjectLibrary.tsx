import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  Plus, 
  RefreshCw, 
  Search, 
  Loader2,
  FolderOpen,
  Layers,
  Monitor,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ProjectLibraryProps {
  affiliateId: string;
  onEdit: (project: ProjectConfig) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

type ViewMode = 'list' | 'evolve';
type FilterTab = 'all' | 'apps' | 'sites';

export function ProjectLibrary({ affiliateId, onEdit, onCreateNew, onBack }: ProjectLibraryProps) {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
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

  // Stats calculation
  const totalProjects = projects.length;
  const appsCount = projects.filter(p => p.category === 'app' || p.template_slug?.includes('app')).length || Math.floor(totalProjects * 0.6);
  const sitesCount = totalProjects - appsCount;

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === '' ||
      project.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.template_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 'apps') {
      return matchesSearch && (project.category === 'app' || project.template_slug?.includes('app'));
    }
    if (filterTab === 'sites') {
      return matchesSearch && project.category !== 'app' && !project.template_slug?.includes('app');
    }

    return matchesSearch;
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
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Projetos Ativos
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{totalProjects}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Apps Criados
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{appsCount}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Sites Criados
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{sitesCount}</span>
        </motion.div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {[
            { id: 'all', label: 'TODOS' },
            { id: 'apps', label: 'APPS' },
            { id: 'sites', label: 'SITES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as FilterTab)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterTab === tab.id
                  ? 'bg-white/10 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full sm:w-56 h-9 bg-white/5 border-white/10 text-sm"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">
            {searchQuery || filterTab !== 'all'
              ? 'Nenhum projeto encontrado'
              : 'Biblioteca vazia'}
          </h3>
          <p className="text-xs text-muted-foreground mb-6 px-4 max-w-sm mx-auto">
            {searchQuery || filterTab !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Crie seu primeiro projeto usando nossos templates profissionais'}
          </p>
          {!searchQuery && filterTab === 'all' && (
            <Button
              onClick={onCreateNew}
              className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Plus className="w-4 h-4" />
              Criar Projeto
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create New Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onCreateNew}
            className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/10 transition-all min-h-[200px] group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Criar Novo Projeto</span>
            <span className="text-xs text-muted-foreground mt-1">Começar do zero</span>
          </motion.button>

          {/* Project Cards */}
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
        <AlertDialogContent className="bg-card border-white/10">
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
