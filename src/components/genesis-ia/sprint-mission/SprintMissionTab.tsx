import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Trash2,
  Play,
  Clock,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SprintWizard } from './SprintWizard';
import { SprintDashboard } from './SprintDashboard';
import { GeneratedSprint, SprintMissionFormData } from './types';
import { useSprintMissions, SprintMission } from './useSprintMissions';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

interface SprintMissionTabProps {
  onNavigate?: (tab: string) => void;
}

export const SprintMissionTab = ({ onNavigate }: SprintMissionTabProps = {}) => {
  const { genesisUser } = useGenesisAuth();
  const userName = genesisUser?.name?.split(' ')[0] || 'Parceiro';
  const affiliateId = genesisUser?.id;

  const {
    missions,
    loading,
    createMission,
    deleteMission,
    fetchProgress,
    updateActionProgress,
  } = useSprintMissions(affiliateId);

  const [activeMission, setActiveMission] = useState<SprintMission | null>(null);
  const [activeProgress, setActiveProgress] = useState<Map<string, 'pending' | 'in_progress' | 'completed'>>(new Map());
  const [showWizard, setShowWizard] = useState(false);
  const [progressCache, setProgressCache] = useState<Map<string, number>>(new Map());

  // Load progress counts for all missions
  useEffect(() => {
    const loadProgressCounts = async () => {
      const counts = new Map<string, number>();
      for (const mission of missions) {
        const progress = await fetchProgress(mission.id);
        const completed = progress.filter((p) => p.status === 'completed').length;
        counts.set(mission.id, completed);
      }
      setProgressCache(counts);
    };
    
    if (missions.length > 0) {
      loadProgressCounts();
    }
  }, [missions, fetchProgress]);

  // Load progress when opening a mission
  const openMission = async (mission: SprintMission) => {
    const progress = await fetchProgress(mission.id);
    const progressMap = new Map<string, 'pending' | 'in_progress' | 'completed'>();
    progress.forEach((p) => progressMap.set(p.actionId, p.status));
    setActiveProgress(progressMap);
    setActiveMission(mission);
    setShowWizard(false);
  };

  // Save new sprint
  const saveSprint = async (sprint: GeneratedSprint, formData: SprintMissionFormData) => {
    const newMission = await createMission(sprint, formData);
    if (newMission) {
      setActiveMission(newMission);
      setActiveProgress(new Map());
      setShowWizard(false);
    }
  };

  // Handle progress update from dashboard
  const handleProgressUpdate = async (
    updatedSprint: GeneratedSprint,
    completedActionIds: string[]
  ) => {
    if (!activeMission) return;

    // Update all actions in database
    for (const action of updatedSprint.actions) {
      await updateActionProgress(activeMission.id, action.id, action.status);
    }

    // Update local cache
    setProgressCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(activeMission.id, completedActionIds.length);
      return newCache;
    });
  };

  // Calculate progress percentage
  const getProgress = (mission: SprintMission) => {
    const completedCount = progressCache.get(mission.id) || 0;
    const total = mission.sprint.actions.length;
    return Math.round((completedCount / total) * 100);
  };

  // Render wizard for new sprint
  if (showWizard) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowWizard(false)}
          className="text-white/50 hover:text-white hover:bg-white/10"
        >
          ← Voltar às metas
        </Button>
        <SprintWizard onSprintCreated={saveSprint} />
      </div>
    );
  }

  // Render active sprint dashboard
  if (activeMission) {
    // Merge database progress with sprint actions
    const sprintWithProgress: GeneratedSprint = {
      ...activeMission.sprint,
      actions: activeMission.sprint.actions.map((action) => ({
        ...action,
        status: activeProgress.get(action.id) || action.status,
      })),
    };

    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveMission(null)}
          className="text-white/50 hover:text-white hover:bg-white/10"
        >
          ← Voltar às metas
        </Button>
        <SprintDashboard
          sprint={sprintWithProgress}
          userName={userName}
          formData={activeMission.formData}
          onReset={() => setActiveMission(null)}
          onNavigate={onNavigate}
          onUpdate={handleProgressUpdate}
          missionId={activeMission.id}
          updateActionProgress={updateActionProgress}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  // Render sprint cards grid
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Missão Sprint</h2>
            <p className="text-[10px] sm:text-xs text-white/50">
              Suas metas ativas • Reset diário às 00:00
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-blue-500 hover:bg-blue-600 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Meta
        </Button>
      </div>

      {/* Sprint Cards - Matching Library Design */}
      {missions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
          {/* Create New Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowWizard(true)}
            className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-white/10 transition-all min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Criar Nova Meta</span>
            <span className="text-xs text-muted-foreground mt-1">Definir objetivo</span>
          </motion.button>

          {missions.map((mission, index) => {
            const progress = getProgress(mission);
            const completedCount = progressCache.get(mission.id) || 0;
            const createdDate = new Date(mission.createdAt).toLocaleDateString('pt-BR');

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className="relative rounded-xl border bg-white/5 overflow-hidden transition-all duration-300 min-h-[220px] flex flex-col cursor-pointer hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 hover:bg-white/10 border-white/10"
                  onClick={() => openMission(mission)}
                >
                  {/* Header with Icon */}
                  <div className="p-5 pb-3 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {mission.sprint.mission_name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {mission.sprint.goal_summary}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="px-5 pb-4 space-y-2.5 flex-1">
                    {/* Progress Stats */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Progresso</span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        progress === 100
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {progress}% ({completedCount}/{mission.sprint.actions.length})
                      </span>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-wider">Prazo</span>
                      <span className="text-foreground/80 ml-auto">{mission.sprint.total_days} dias</span>
                    </div>

                    {/* Created At */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-wider">Criado em</span>
                      <span className="text-foreground/80 ml-auto">{createdDate}</span>
                    </div>

                    {/* Daily Target */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="uppercase tracking-wider truncate flex-1">{mission.sprint.daily_target}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-5 pb-2">
                    <Progress value={progress} className="h-1.5 bg-white/10" />
                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMission(mission);
                      }}
                      className="flex-1 h-9 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    >
                      ABRIR
                      <Play className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/5 hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-white/10">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMission(mission.id);
                          }}
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
          })}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16 bg-white/5 border border-white/10"
          style={{ borderRadius: '14px' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
            Nenhuma meta criada
          </h3>
          <p className="text-xs sm:text-sm text-white/50 text-center mb-4 max-w-xs">
            Crie sua primeira meta e deixe a IA montar um plano de execução personalizado
          </p>
          <Button
            onClick={() => setShowWizard(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Meta
          </Button>
        </motion.div>
      )}

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-3 sm:p-4" style={{ borderRadius: '14px' }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white mb-0.5">Reset Diário Automático</h4>
            <p className="text-[10px] sm:text-xs text-white/50 leading-relaxed">
              Suas ações são resetadas automaticamente à meia-noite para manter o foco nas metas diárias.
              O progresso geral é mantido para acompanhamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
