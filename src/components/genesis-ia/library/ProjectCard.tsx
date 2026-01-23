import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Copy,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const relativeUpdatedAt = formatDistanceToNow(new Date(project.updated_at), {
    addSuffix: false,
    locale: ptBR,
  });

  const createdDate = format(new Date(project.created_at), "dd 'de' MMM. 'de' yyyy", { locale: ptBR });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: (index + 1) * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div
        className={cn(
          'relative rounded-xl border bg-white/5 overflow-hidden transition-all duration-300 min-h-[200px] flex flex-col',
          isHovered
            ? 'border-blue-500/40 shadow-xl shadow-blue-500/5 bg-white/10'
            : 'border-white/10'
        )}
      >
        {/* Header with Icon */}
        <div className="p-4 pb-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
            {getTemplateIcon(project.template_slug)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {project.client_name || project.template_name}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Arquitetura e estratégia de nicho...
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="px-4 pb-3 space-y-2 flex-1">
          {/* Platform */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Plataforma</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-medium',
              'bg-amber-500/20 text-amber-300'
            )}>
              {platformInfo.label}
            </span>
          </div>

          {/* Created At */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span className="uppercase tracking-wider">Criado em</span>
            <span className="text-foreground/80 ml-auto">{createdDate}</span>
          </div>

          {/* Updated At */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="uppercase tracking-wider">Atualizado</span>
            <span className="text-foreground/80 ml-auto">há {relativeUpdatedAt}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 pt-2 border-t border-white/5 flex items-center gap-2">
          <Button
            size="sm"
            onClick={openPreview}
            className="flex-1 h-8 text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            ABRIR
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/5 hover:bg-white/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/10">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Sparkles className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEvolve(project)}>
                <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                Evoluir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
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
