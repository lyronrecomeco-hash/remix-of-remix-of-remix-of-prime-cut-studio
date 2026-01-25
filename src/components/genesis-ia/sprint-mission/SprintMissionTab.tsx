import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Trash2,
  Play,
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { SprintWizard } from './SprintWizard';
import { SprintDashboard } from './SprintDashboard';
import { GeneratedSprint, SprintMissionFormData } from './types';
import { useGenesisAuth } from '@/contexts/GenesisAuthContext';

interface SprintMissionTabProps {
  onNavigate?: (tab: string) => void;
}

interface SavedSprint {
  id: string;
  sprint: GeneratedSprint;
  formData: SprintMissionFormData;
  createdAt: string;
  lastAccessedAt: string;
  completedActions: string[];
}

const STORAGE_KEY = 'genesis_saved_sprints';
const DAILY_RESET_KEY = 'genesis_daily_reset';

export const SprintMissionTab = ({ onNavigate }: SprintMissionTabProps = {}) => {
  const { genesisUser } = useGenesisAuth();
  const userName = genesisUser?.name?.split(' ')[0] || 'Parceiro';
  
  const [savedSprints, setSavedSprints] = useState<SavedSprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<SavedSprint | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Load saved sprints from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedSprints(parsed);
      } catch (e) {
        console.error('Error parsing saved sprints:', e);
      }
    }

    // Check daily reset
    checkDailyReset();
  }, []);

  // Check and reset daily actions
  const checkDailyReset = () => {
    const lastReset = localStorage.getItem(DAILY_RESET_KEY);
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      // Reset all completed actions for a new day
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const sprints: SavedSprint[] = JSON.parse(saved);
          const resetSprints = sprints.map(s => ({
            ...s,
            completedActions: [],
            sprint: {
              ...s.sprint,
              actions: s.sprint.actions.map(a => ({ ...a, status: 'pending' as const }))
            }
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(resetSprints));
          setSavedSprints(resetSprints);
        } catch (e) {
          console.error('Error resetting sprints:', e);
        }
      }
      localStorage.setItem(DAILY_RESET_KEY, today);
    }
  };

  // Save sprint to localStorage
  const saveSprint = (sprint: GeneratedSprint, formData: SprintMissionFormData) => {
    const newSprint: SavedSprint = {
      id: Date.now().toString(),
      sprint,
      formData,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      completedActions: []
    };
    
    const updated = [newSprint, ...savedSprints];
    setSavedSprints(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    setActiveSprint(newSprint);
    setShowWizard(false);
    toast.success('Meta salva com sucesso!');
  };

  // Delete sprint
  const deleteSprint = (id: string) => {
    const updated = savedSprints.filter(s => s.id !== id);
    setSavedSprints(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    if (activeSprint?.id === id) {
      setActiveSprint(null);
    }
    toast.success('Meta removida');
  };

  // Update sprint progress
  const updateSprintProgress = (sprintId: string, updatedSprint: GeneratedSprint, completedActions: string[]) => {
    const updated = savedSprints.map(s => {
      if (s.id === sprintId) {
        return {
          ...s,
          sprint: updatedSprint,
          completedActions,
          lastAccessedAt: new Date().toISOString()
        };
      }
      return s;
    });
    
    setSavedSprints(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    if (activeSprint?.id === sprintId) {
      setActiveSprint({ ...activeSprint, sprint: updatedSprint, completedActions });
    }
  };

  // Open sprint
  const openSprint = (sprint: SavedSprint) => {
    setActiveSprint(sprint);
    setShowWizard(false);
  };

  // Calculate sprint progress
  const getProgress = (sprint: SavedSprint) => {
    const completed = sprint.sprint.actions.filter(a => a.status === 'completed').length;
    return Math.round((completed / sprint.sprint.actions.length) * 100);
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
  if (activeSprint) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveSprint(null)}
          className="text-white/50 hover:text-white hover:bg-white/10"
        >
          ← Voltar às metas
        </Button>
        <SprintDashboard
          sprint={activeSprint.sprint}
          userName={userName}
          formData={activeSprint.formData}
          onReset={() => setActiveSprint(null)}
          onNavigate={onNavigate}
          onUpdate={(updatedSprint, completedActions) => 
            updateSprintProgress(activeSprint.id, updatedSprint, completedActions)
          }
        />
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

      {/* Sprint Cards */}
      {savedSprints.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {savedSprints.map((saved, index) => {
            const progress = getProgress(saved);
            const completedCount = saved.sprint.actions.filter(a => a.status === 'completed').length;
            
            return (
              <motion.div
                key={saved.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer overflow-hidden"
                style={{ borderRadius: '14px' }}
                onClick={() => openSprint(saved)}
              >
                {/* Card Header */}
                <div className="p-3 sm:p-4 border-b border-white/5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {saved.sprint.mission_name}
                        </h3>
                        <p className="text-[10px] text-white/40 truncate">
                          {saved.sprint.goal_summary}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-white/30 hover:text-white hover:bg-white/10"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSprint(saved.id);
                          }}
                          className="text-red-400 hover:text-red-300 focus:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 rounded-lg py-1.5 px-2">
                      <Calendar className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                      <p className="text-[9px] text-white/40">Prazo</p>
                      <p className="text-[10px] font-medium text-white">{saved.sprint.total_days}d</p>
                    </div>
                    <div className="bg-white/5 rounded-lg py-1.5 px-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mx-auto mb-0.5" />
                      <p className="text-[9px] text-white/40">Feitas</p>
                      <p className="text-[10px] font-medium text-white">{completedCount}/{saved.sprint.actions.length}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg py-1.5 px-2">
                      <TrendingUp className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                      <p className="text-[9px] text-white/40">Progresso</p>
                      <p className="text-[10px] font-medium text-white">{progress}%</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-3 sm:px-4 py-2 bg-white/[0.02]">
                  <Progress value={progress} className="h-1.5 bg-white/10" />
                </div>

                {/* Daily Target */}
                <div className="px-3 sm:px-4 py-2 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                    <Clock className="w-3 h-3" />
                    <span className="truncate">{saved.sprint.daily_target}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] px-1.5 py-0 ${
                      progress === 100 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    {progress === 100 ? 'Concluído' : 'Ativo'}
                  </Badge>
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
