import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  TrendingUp,
  Zap,
  Search,
  MessageCircle,
  FileText,
  Handshake,
  BarChart3,
  ChevronRight,
  Sparkles,
  Rocket,
  Copy,
  ExternalLink,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { GeneratedSprint, SprintAction, SprintMissionFormData } from './types';
import { getResourceForAction, getRecommendedResources, ResourceLink } from './ResourceLinks';

interface SprintDashboardProps {
  sprint: GeneratedSprint;
  userName: string;
  formData: SprintMissionFormData;
  onReset: () => void;
  onUpdate?: (updatedSprint: GeneratedSprint, completedActions: string[]) => void;
  onNavigate?: (tab: string) => void;
  missionId?: string;
  updateActionProgress?: (missionId: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => Promise<boolean>;
}

const actionIcons: Record<SprintAction['type'], React.ElementType> = {
  prospecting: Search,
  'follow-up': MessageCircle,
  proposal: FileText,
  negotiation: Handshake,
  closing: CheckCircle2,
  analysis: BarChart3
};

const priorityColors: Record<SprintAction['priority'], string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30'
};

export const SprintDashboard = ({
  sprint,
  userName,
  formData,
  onReset,
  onNavigate,
  onUpdate,
  missionId,
  updateActionProgress
}: SprintDashboardProps) => {
  const [actions, setActions] = useState<SprintAction[]>(sprint.actions);

  // Sync actions when sprint changes
  useEffect(() => {
    // Cast status to proper type
    const typedActions = sprint.actions.map(a => ({
      ...a,
      status: a.status as SprintAction['status']
    }));
    setActions(typedActions);
  }, [sprint.actions]);

  const completedCount = actions.filter(a => a.status === 'completed').length;
  const progressPercent = (completedCount / actions.length) * 100;

  // Get recommended resources based on action types
  const actionTypes = actions.map(a => a.type);
  const recommendedResources = getRecommendedResources(actionTypes);

  const toggleActionStatus = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const newStatus = action.status === 'completed' ? 'pending' : 'completed';

    // Update in database if available
    if (missionId && updateActionProgress) {
      const success = await updateActionProgress(missionId, actionId, newStatus);
      if (!success) return;
    }

    const updatedActions: SprintAction[] = actions.map(a => {
      if (a.id === actionId) {
        return { ...a, status: newStatus as SprintAction['status'] };
      }
      return a;
    });

    setActions(updatedActions);

    // Notify parent
    if (onUpdate) {
      const completedIds = updatedActions.filter(a => a.status === 'completed').map(a => a.id);
      onUpdate({ ...sprint, actions: updatedActions as SprintAction[] }, completedIds);
    }
  };

  const startAction = async (actionId: string) => {
    // Update in database if available
    if (missionId && updateActionProgress) {
      const success = await updateActionProgress(missionId, actionId, 'in_progress');
      if (!success) return;
    }

    const updatedActions = actions.map(action => {
      if (action.id === actionId) {
        return { ...action, status: 'in_progress' as const };
      }
      return action;
    });

    setActions(updatedActions);
    toast.success('Ação iniciada! Foco total 🎯');

    // Notify parent
    if (onUpdate) {
      const completedIds = updatedActions.filter(a => a.status === 'completed').map(a => a.id);
      onUpdate({ ...sprint, actions: updatedActions }, completedIds);
    }
  };

  const openResource = (resource: ResourceLink) => {
    if (onNavigate) {
      onNavigate(resource.tab);
      toast.success(`Abrindo ${resource.name}...`);
    } else {
      toast.info(`Recurso: ${resource.name}`);
    }
  };

  const copyMotivation = () => {
    navigator.clipboard.writeText(sprint.motivation_message);
    toast.success('Mensagem copiada!');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mission Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent border border-purple-500/20 p-4 sm:p-6"
        style={{ borderRadius: '14px' }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{sprint.mission_name}</h2>
              <p className="text-xs sm:text-sm text-white/50">{sprint.goal_summary}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-white/50 hover:text-white hover:bg-white/10 h-8 px-2"
            title="Voltar às metas"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
            <Target className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-xs text-white/40">Meta Diária</p>
            <p className="text-xs sm:text-sm font-semibold text-white truncate">{sprint.daily_target}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
            <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-white/40">Prazo</p>
            <p className="text-xs sm:text-sm font-semibold text-white">{sprint.total_days} dias</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs text-white/40">Progresso</p>
            <p className="text-xs sm:text-sm font-semibold text-white">{Math.round(progressPercent)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/50">
            <span>{completedCount} de {actions.length} ações</span>
            <span>{Math.round(progressPercent)}% concluído</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-white/10" />
        </div>
      </motion.div>

      {/* Motivation Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 p-3 sm:p-4"
        style={{ borderRadius: '14px' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              {sprint.motivation_message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMotivation}
            className="text-white/30 hover:text-white hover:bg-white/10 h-8 w-8 p-0 flex-shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>

      {/* Actions List */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Ações do Sprint
          </h3>
          <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/50">
            {actions.filter(a => a.status === 'pending').length} pendentes
          </Badge>
        </div>

        <div className="space-y-2">
          {actions.map((action, index) => {
            const IconComponent = actionIcons[action.type] || Circle;
            const isCompleted = action.status === 'completed';
            const isInProgress = action.status === 'in_progress';

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-white/5 border rounded-xl p-3 sm:p-4 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : isInProgress
                      ? 'border-purple-500/30 bg-purple-500/5'
                      : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleActionStatus(action.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-medium leading-tight ${
                        isCompleted ? 'text-white/50 line-through' : 'text-white'
                      }`}>
                        {action.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0.5 flex-shrink-0 ${priorityColors[action.priority]}`}
                      >
                        {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>

                    <p className={`text-xs leading-relaxed mb-2 ${
                      isCompleted ? 'text-white/30' : 'text-white/50'
                    }`}>
                      {action.description}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <span className="flex items-center gap-1">
                        <IconComponent className="w-3 h-3" />
                        {action.type === 'prospecting' && 'Prospecção'}
                        {action.type === 'follow-up' && 'Follow-up'}
                        {action.type === 'proposal' && 'Proposta'}
                        {action.type === 'negotiation' && 'Negociação'}
                        {action.type === 'closing' && 'Fechamento'}
                        {action.type === 'analysis' && 'Análise'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {action.estimatedTime}
                      </span>
                    </div>

                    {/* Action Buttons with Auto Resource */}
                    {!isCompleted && (() => {
                      const resource = getResourceForAction(action.type, action.linkedResource);
                      return (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                          {resource && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openResource(resource);
                              }}
                              className="h-7 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-2"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {resource.name}
                            </Button>
                          )}
                          {!isInProgress && (
                            <Button
                              size="sm"
                              onClick={() => startAction(action.id)}
                              className="h-7 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {isInProgress && (
                            <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Em andamento...
                            </Badge>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recommended Resources */}
      {recommendedResources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 p-3 sm:p-4"
          style={{ borderRadius: '14px' }}
        >
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Recursos Recomendados para essa Missão
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {recommendedResources.map((resource) => {
              const ResourceIcon = resource.icon;
              return (
                <button
                  key={resource.id}
                  onClick={() => openResource(resource)}
                  className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-md bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <ResourceIcon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-white truncate">{resource.name}</p>
                    <p className="text-[9px] text-white/40 truncate">{resource.description}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-cyan-400 ml-auto flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Success Metrics */}
      {sprint.success_metrics && sprint.success_metrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 p-3 sm:p-4"
          style={{ borderRadius: '14px' }}
        >
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Métricas de Sucesso
          </h4>
          <div className="space-y-2">
            {sprint.success_metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-white/60">{metric}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Back to List Button */}
      <Button
        onClick={onReset}
        variant="outline"
        className="w-full h-10 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
      >
        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
        Voltar às Metas
      </Button>
    </div>
  );
};
