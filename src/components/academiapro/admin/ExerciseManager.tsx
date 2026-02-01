import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, GripVertical, Edit2, Check, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface ExerciseManagerProps {
  workoutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExerciseManager({ workoutId, open, onOpenChange, onSuccess }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [newExercise, setNewExercise] = useState({
    exercise_id: '',
    sets: 3,
    reps: 12,
    weight_kg: null as number | null,
    rest_seconds: 60
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, workoutId]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchWorkoutExercises(),
      fetchAvailableExercises(),
      fetchMuscleGroups()
    ]);
    setIsLoading(false);
  };

  const fetchWorkoutExercises = async () => {
    const { data } = await (supabase
      .from('gym_user_workout_exercises' as any) as any)
      .select(`
        *,
        gym_exercises(name, muscle_group_id)
      `)
      .eq('user_workout_id', workoutId)
      .order('order_index');

    if (data) setExercises(data);
  };

  const fetchAvailableExercises = async () => {
    const { data } = await supabase
      .from('gym_exercises')
      .select(`
        *,
        gym_muscle_groups(name)
      `)
      .eq('is_active', true)
      .order('name');

    if (data) setAvailableExercises(data);
  };

  const fetchMuscleGroups = async () => {
    const { data } = await supabase
      .from('gym_muscle_groups')
      .select('*')
      .order('name');

    if (data) setMuscleGroups(data);
  };

  const filteredExercises = selectedMuscleGroup
    ? availableExercises.filter(e => e.muscle_group_id === selectedMuscleGroup)
    : availableExercises;

  const handleAddExercise = async () => {
    if (!newExercise.exercise_id) {
      toast.error('Selecione um exercício');
      return;
    }

    setIsSaving(true);

    const { error } = await (supabase
      .from('gym_user_workout_exercises' as any) as any)
      .insert({
        user_workout_id: workoutId,
        exercise_id: newExercise.exercise_id,
        sets: newExercise.sets,
        reps: newExercise.reps.toString(),
        weight_kg: newExercise.weight_kg,
        rest_seconds: newExercise.rest_seconds,
        order_index: exercises.length
      });

    if (error) {
      toast.error('Erro ao adicionar exercício');
      setIsSaving(false);
      return;
    }

    toast.success('Exercício adicionado!');
    setNewExercise({
      exercise_id: '',
      sets: 3,
      reps: 12,
      weight_kg: null,
      rest_seconds: 60
    });
    fetchWorkoutExercises();
    setIsSaving(false);
  };

  const handleUpdateExercise = async (exerciseId: string, data: any) => {
    const { error } = await (supabase
      .from('gym_user_workout_exercises' as any) as any)
      .update(data)
      .eq('id', exerciseId);

    if (error) {
      toast.error('Erro ao atualizar exercício');
      return;
    }

    toast.success('Exercício atualizado!');
    setEditingId(null);
    fetchWorkoutExercises();
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Remover este exercício?')) return;

    const { error } = await (supabase
      .from('gym_user_workout_exercises' as any) as any)
      .delete()
      .eq('id', exerciseId);

    if (error) {
      toast.error('Erro ao remover exercício');
      return;
    }

    toast.success('Exercício removido');
    fetchWorkoutExercises();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Exercícios</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Add New Exercise */}
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
              <h3 className="font-medium text-sm text-zinc-400">Adicionar Exercício</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Grupo Muscular</Label>
                  <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="">Todos</SelectItem>
                      {muscleGroups.map((mg) => (
                        <SelectItem key={mg.id} value={mg.id}>{mg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Exercício *</Label>
                  <Select 
                    value={newExercise.exercise_id} 
                    onValueChange={(v) => setNewExercise({ ...newExercise, exercise_id: v })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 h-9">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[200px]">
                      {filteredExercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Séries</Label>
                  <Input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 0 })}
                    className="bg-zinc-800 border-zinc-700 h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Reps</Label>
                  <Input
                    type="number"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 0 })}
                    className="bg-zinc-800 border-zinc-700 h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Peso (kg)</Label>
                  <Input
                    type="number"
                    value={newExercise.weight_kg || ''}
                    onChange={(e) => setNewExercise({ ...newExercise, weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
                    className="bg-zinc-800 border-zinc-700 h-9"
                    placeholder="--"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Desc. (s)</Label>
                  <Input
                    type="number"
                    value={newExercise.rest_seconds}
                    onChange={(e) => setNewExercise({ ...newExercise, rest_seconds: parseInt(e.target.value) || 0 })}
                    className="bg-zinc-800 border-zinc-700 h-9"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddExercise}
                disabled={isSaving || !newExercise.exercise_id}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar ao Treino
              </Button>
            </div>

            {/* Exercise List */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-zinc-400">
                Exercícios do Treino ({exercises.length})
              </h3>
              
              {exercises.length > 0 ? (
                <div className="space-y-2">
                  {exercises.map((ex, index) => (
                    <motion.div
                      key={ex.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3"
                    >
                      <div className="text-zinc-500 cursor-move">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-zinc-500 w-6">{index + 1}.</span>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ex.gym_exercises?.name}</p>
                      </div>

                      {editingId === ex.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            defaultValue={ex.sets}
                            className="w-14 h-8 bg-zinc-700 border-zinc-600 text-center"
                            onBlur={(e) => handleUpdateExercise(ex.id, { sets: parseInt(e.target.value) })}
                          />
                          <span className="text-zinc-500">x</span>
                          <Input
                            type="number"
                            defaultValue={ex.reps}
                            className="w-14 h-8 bg-zinc-700 border-zinc-600 text-center"
                            onBlur={(e) => handleUpdateExercise(ex.id, { reps: parseInt(e.target.value) })}
                          />
                          <button onClick={() => setEditingId(null)} className="p-1 text-green-500">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-orange-500">
                            {ex.sets}x{ex.reps}
                          </span>
                          {ex.weight_kg && (
                            <span className="text-xs text-zinc-400">{ex.weight_kg}kg</span>
                          )}
                          <button onClick={() => setEditingId(ex.id)} className="p-1 text-zinc-400 hover:text-white">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteExercise(ex.id)} className="p-1 text-red-500 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <p>Nenhum exercício adicionado</p>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={() => { onSuccess?.(); onOpenChange(false); }}
              className="w-full border-zinc-700"
            >
              Concluído
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
