import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search,
  Users,
  Dumbbell,
  GripVertical,
  Check,
  HelpCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { KanbanHelpModal } from './KanbanHelpModal';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'draft', title: 'Rascunho', color: 'bg-zinc-500' },
  { id: 'ready', title: 'Pronto', color: 'bg-blue-500' },
  { id: 'assigned', title: 'Atribuído', color: 'bg-orange-500' },
  { id: 'completed', title: 'Concluído', color: 'bg-green-500' }
];

export default function WorkoutKanban() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchStudents();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('gym_workout_templates')
      .select(`
        *,
        gym_workout_template_exercises(id)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      // Add status field for local kanban management
      const templatesWithStatus = data.map((t: any) => ({
        ...t,
        status: 'draft' // Default status for kanban
      }));
      setTemplates(templatesWithStatus);
    }
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await (supabase.from('gym_profiles') as any)
      .select('*')
      .eq('role', 'aluno')
      .eq('is_active', true)
      .order('full_name');
    
    if (data) setStudents(data);
  };

  const handleDragStart = (e: React.DragEvent, templateId: string) => {
    setDraggedItem(templateId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Update local state immediately for smooth UX
    setTemplates(prev => prev.map(t => 
      t.id === draggedItem ? { ...t, status: targetStatus } : t
    ));

    // Note: In a real app, you'd update the database here
    // Since gym_workout_templates might not have a status column,
    // we'll just show a toast for now
    toast.success(`Treino movido para ${COLUMNS.find(c => c.id === targetStatus)?.title}`);
    setDraggedItem(null);
  };

  const handleAssign = async () => {
    if (!selectedTemplate || selectedStudents.length === 0) return;

    try {
      // Get template exercises
      const { data: templateExercises } = await supabase
        .from('gym_workout_template_exercises')
        .select('*')
        .eq('template_id', selectedTemplate.id);

      // Create workout for each selected student
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.user_id === studentId);
        
        // Create user workout
        const { data: workout, error: workoutError } = await supabase
          .from('gym_user_workouts')
          .insert({
            user_id: studentId,
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            difficulty: selectedTemplate.difficulty,
            is_active: true,
            day_of_week: selectedTemplate.day_of_week || []
          })
          .select()
          .single();

        if (workoutError) throw workoutError;

        // Copy exercises to user workout
        if (workout && templateExercises && templateExercises.length > 0) {
          const userExercises = templateExercises.map((ex: any) => ({
            user_workout_id: workout.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            order_index: ex.order_index
          }));

          await supabase
            .from('gym_user_workout_exercises')
            .insert(userExercises);
        }
      }

      toast.success(`Treino atribuído a ${selectedStudents.length} aluno(s)`);
      setShowAssignModal(false);
      setSelectedStudents([]);
      setSelectedTemplate(null);
      
      // Move to assigned column
      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate.id ? { ...t, status: 'assigned' } : t
      ));
    } catch (error) {
      console.error('Error assigning workout:', error);
      toast.error('Erro ao atribuir treino');
    }
  };

  const openAssignModal = (template: any) => {
    setSelectedTemplate(template);
    setShowAssignModal(true);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getColumnItems = (columnId: string) => {
    return templates.filter(t => {
      const status = t.status || 'draft';
      return status === columnId && 
        t.name?.toLowerCase().includes(search.toLowerCase());
    });
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'iniciante': return 'bg-green-500/20 text-green-400';
      case 'intermediario': return 'bg-yellow-500/20 text-yellow-400';
      case 'avancado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Help Modal */}
      <KanbanHelpModal open={showHelp} onOpenChange={setShowHelp} type="workouts" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Treinos</h1>
            <p className="text-zinc-400 mt-1 text-sm">Gerencie e atribua treinos aos alunos</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelp(true)}
            className="hover:bg-orange-500/20 text-zinc-400 hover:text-orange-500"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Treino
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <Input
          placeholder="Buscar treino..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800"
        />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => (
          <div
            key={column.id}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 min-h-[500px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {getColumnItems(column.id).length}
              </Badge>
            </div>

            {/* Column Items */}
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-zinc-800 rounded-lg p-3 animate-pulse h-24" />
                ))
              ) : (
                getColumnItems(column.id).map(template => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, template.id)}
                    className={`bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-orange-500/50 transition-colors ${
                      draggedItem === template.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-zinc-600" />
                        <h4 className="font-medium text-sm">{template.name}</h4>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                      {template.description || 'Sem descrição'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getDifficultyBadge(template.difficulty)}`}>
                          {template.difficulty || 'N/A'}
                        </Badge>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Dumbbell className="w-3 h-3" />
                          {template.gym_workout_template_exercises?.length || 0}
                        </span>
                      </div>
                      
                      {column.id !== 'assigned' && column.id !== 'completed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs hover:bg-orange-500/20 hover:text-orange-400"
                          onClick={() => openAssignModal(template)}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Atribuir
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {!isLoading && getColumnItems(column.id).length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Nenhum treino
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Treino</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Selecione os alunos que receberão o treino "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
            {students.map(student => (
              <button
                key={student.user_id}
                onClick={() => toggleStudent(student.user_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  selectedStudents.includes(student.user_id)
                    ? 'bg-orange-500/20 border-orange-500/50'
                    : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-zinc-700 text-sm">
                    {student.full_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{student.full_name}</p>
                  <p className="text-xs text-zinc-400">{student.email}</p>
                </div>
                {selectedStudents.includes(student.user_id) && (
                  <Check className="w-5 h-5 text-orange-500" />
                )}
              </button>
            ))}

            {students.length === 0 && (
              <p className="text-center text-zinc-500 py-4">Nenhum aluno cadastrado</p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700"
              onClick={() => setShowAssignModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              onClick={handleAssign}
              disabled={selectedStudents.length === 0}
            >
              Atribuir ({selectedStudents.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
