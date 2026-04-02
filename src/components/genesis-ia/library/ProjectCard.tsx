import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Copy,
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const route = project.custom_slug || project.unique_code;
    const url = `${window.location.origin}/p/${route}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!', { description: url });
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

  const getPromptContent = () => {
    // Check evolution_history for latest prompt first
    if (project.evolution_history && Array.isArray(project.evolution_history) && project.evolution_history.length > 0) {
      const latest = project.evolution_history[project.evolution_history.length - 1];
      if (latest?.prompt) return latest.prompt;
    }
    // Fallback to last_prompt (this is the full generated prompt)
    if (project.last_prompt) return project.last_prompt;
    // Fallback to config prompt
    const cfg = project.config || {};
    if (cfg.generatedPrompt) return cfg.generatedPrompt;
    if (cfg.prompt) return cfg.prompt;
    // Generate basic info
    return `Projeto: ${project.client_name || project.template_name}\nPlataforma: ${platformInfo.label}\nTemplate: ${project.template_slug}\n\nNenhum prompt disponível para este projeto.`;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(getPromptContent());
    setCopied(true);
    toast.success('Prompt copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
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
            'relative rounded-xl border bg-white/5 overflow-hidden transition-all duration-300 min-h-[180px] sm:min-h-[220px] flex flex-col',
            isHovered
              ? 'border-blue-500/40 shadow-xl shadow-blue-500/5 bg-white/10'
              : 'border-white/10'
          )}
        >
          {/* Header with Icon */}
          <div className="p-3 sm:p-5 pb-2 sm:pb-3 flex items-start gap-2 sm:gap-4">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
              {getTemplateIcon(project.template_slug)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {project.client_name || project.template_name}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                Arquitetura e estratégia...
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="px-3 sm:px-5 pb-3 sm:pb-4 space-y-1.5 sm:space-y-2.5 flex-1">
            {/* Platform */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground">Plataforma</span>
              <span className={cn(
                'px-1.5 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold',
                'bg-blue-500/20 text-blue-300'
              )}>
                {platformInfo.label}
              </span>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="uppercase tracking-wider hidden sm:inline">Criado em</span>
              <span className="text-foreground/80 ml-auto text-[10px] sm:text-xs">{createdDate}</span>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="uppercase tracking-wider hidden sm:inline">Atualizado</span>
              <span className="text-foreground/80 ml-auto text-[10px] sm:text-xs">há {relativeUpdatedAt}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-2 sm:pt-3 border-t border-white/5 flex items-center gap-1.5 sm:gap-2">
            <Button
              size="sm"
              onClick={() => setShowPromptModal(true)}
              className="flex-1 h-7 sm:h-9 text-[10px] sm:text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              ABRIR
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 sm:ml-1.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-9 sm:w-9 bg-white/5 hover:bg-white/10">
                  <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

      {/* Prompt Modal */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="bg-[hsl(222,47%,8%)] border-white/10 max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden">
          {/* Modal Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-lg">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
                  {getTemplateIcon(project.template_slug)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {project.client_name || project.template_name}
                  </p>
                  <p className="text-xs text-white/40 font-normal mt-0.5">
                    {platformInfo.label} • Criado em {createdDate}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Prompt Content */}
          <ScrollArea className="max-h-[55vh]">
            <div className="px-6 py-5">
              <pre className="text-[13px] text-white/85 whitespace-pre-wrap font-mono leading-relaxed">
                {getPromptContent()}
              </pre>
            </div>
          </ScrollArea>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              Prompt gerado do projeto
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPromptModal(false)}
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                Fechar
              </Button>
              <Button 
                size="sm" 
                onClick={copyPrompt} 
                className={cn(
                  "gap-1.5 min-w-[140px] transition-all",
                  copied 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
