import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Eye,
  Copy,
  Trash2,
  Pencil,
  MoreVertical,
  ExternalLink,
  Globe,
  Rocket,
  Sparkles,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PLATFORM_OPTIONS } from './evolution/evolutionTypes';

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
  platform?: string;
  category?: string;
  last_prompt?: string;
  evolution_history?: any[];
}

interface ProjectCardProps {
  project: ProjectConfig;
  index: number;
  onEdit: (project: ProjectConfig) => void;
  onEvolve: (project: ProjectConfig) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, index, onEdit, onEvolve, onDelete }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getProjectRoute = () => {
    return project.custom_slug || project.unique_code;
  };

  const copyLink = () => {
    const route = getProjectRoute();
    const url = `${window.location.origin}/p/${route}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!', { description: url });
  };

  const openPreview = () => {
    const route = getProjectRoute();
    window.open(`/p/${route}`, '_blank');
  };

  const getTemplateIcon = (slug: string) => {
    const icons: Record<string, string> = {
      barbearia: '💈',
      academia: '🏋️',
      restaurante: '🍽️',
      ecommerce: '🛒',
      clinica: '🏥',
      petshop: '🐕',
      pizzaria: '🍕',
    };
    return icons[slug] || '📦';
  };

  const getPlatformInfo = () => {
    const platform = project.platform || 'lovable';
    return PLATFORM_OPTIONS.find((p) => p.value === platform) || PLATFORM_OPTIONS[0];
  };

  const platformInfo = getPlatformInfo();
  const evolutionCount = Array.isArray(project.evolution_history)
    ? project.evolution_history.length
    : 0;

  const relativeUpdatedAt = formatDistanceToNow(new Date(project.updated_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        className={cn(
          'relative rounded-xl border bg-gradient-to-br from-card to-card/80 overflow-hidden transition-all duration-300',
          isHovered
            ? 'border-primary/40 shadow-xl shadow-primary/5 scale-[1.01]'
            : 'border-border'
        )}
      >
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={project.is_active ? 'default' : 'secondary'}
            className="text-[10px] px-2 py-0.5 backdrop-blur-sm"
          >
            {project.is_active ? '🟢 Ativo' : '⚪ Inativo'}
          </Badge>
        </div>

        {/* Card Header */}
        <div className="p-4 pb-2">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center text-2xl flex-shrink-0">
              {getTemplateIcon(project.template_slug)}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {project.client_name || project.template_name}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {project.template_name}
              </p>
            </div>
          </div>
        </div>

        {/* Platform & Dates */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className={cn('w-5 h-5 rounded flex items-center justify-center bg-gradient-to-r text-white text-[10px]', platformInfo.color)}>
                {platformInfo.icon}
              </span>
              <span>{platformInfo.label}</span>
            </div>
            <span>Atualizado {relativeUpdatedAt}</span>
          </div>
        </div>

        {/* URL Section */}
        <div className="px-4 pb-3">
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group/url"
          >
            <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground truncate font-mono flex-1 text-left">
              /p/{getProjectRoute()}
            </span>
            <Copy className="w-3 h-3 text-muted-foreground/50 group-hover/url:text-primary transition-colors flex-shrink-0" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="px-4 pb-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{project.views_count}</span>
            </div>
            {evolutionCount > 0 && (
              <div className="flex items-center gap-1">
                <Rocket className="w-3 h-3" />
                <span>{evolutionCount} evoluções</span>
              </div>
            )}
          </div>
          <span>{format(new Date(project.created_at), 'dd MMM yyyy', { locale: ptBR })}</span>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={openPreview}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
            onClick={() => onEvolve(project)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Evoluir
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            onClick={() => onEdit(project)}
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
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(project.id)}
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
  );
}
