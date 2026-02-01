import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search,
  Calendar,
  Clock,
  Users,
  GripVertical,
  UserPlus,
  Check,
  HelpCircle,
  Loader2
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
import { CreateClassModal } from '@/components/academiapro/admin/CreateClassModal';
import { KanbanHelpModal } from './KanbanHelpModal';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const STORAGE_KEY = 'gym_classes_kanban_statuses';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'inactive', title: 'Inativas', color: 'bg-zinc-500' },
  { id: 'draft', title: 'Rascunho', color: 'bg-blue-500' },
  { id: 'active', title: 'Ativas', color: 'bg-green-500' },
  { id: 'full', title: 'Lotadas', color: 'bg-orange-500' }
];

export default function ClassesKanban() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Load saved statuses from localStorage
  const loadSavedStatuses = useCallback((): Record<string, string> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // Save statuses to localStorage
  const saveStatuses = useCallback((classesData: any[]) => {
    const statusMap: Record<string, string> = {};
    classesData.forEach(c => {
      if (c.id && c.status) {
        statusMap[c.id] = c.status;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
  }, []);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('gym_classes') as any)
        .select('*')
        .order('name');

      if (error) throw error;

      const savedStatuses = loadSavedStatuses();
      
      const classesWithStatus = (data || []).map((c: any) => ({
        ...c,
        status: savedStatuses[c.id] || (c.is_active ? 'active' : 'inactive')
      }));
      
      setClasses(classesWithStatus);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Erro ao carregar aulas');
    } finally {
      setIsLoading(false);
    }
  }, [loadSavedStatuses]);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('gym_profiles')
      .select('*')
      .eq('role', 'aluno')
      .eq('is_active', true)
      .order('full_name');

    if (data) setStudents(data);
  };

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, [fetchClasses]);

  const handleDragStart = (e: React.DragEvent, classId: string) => {
    setDraggedItem(classId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const classItem = classes.find(c => c.id === draggedItem);
    if (!classItem || classItem.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    // Update local state immediately
    const updatedClasses = classes.map(c => 
      c.id === draggedItem ? { ...c, status: targetStatus } : c
    );
    setClasses(updatedClasses);
    
    // Save to localStorage immediately
    saveStatuses(updatedClasses);

    // Update is_active in database
    const isActive = targetStatus === 'active' || targetStatus === 'full';
    
    try {
      const { error } = await supabase
        .from('gym_classes')
        .update({ is_active: isActive })
        .eq('id', draggedItem);

      if (error) throw error;
      
      toast.success(`Aula movida para ${COLUMNS.find(col => col.id === targetStatus)?.title}`);
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error('Erro ao atualizar aula');
      // Revert on error
      const revertedClasses = classes.map(c => 
        c.id === draggedItem ? { ...c, status: classItem.status } : c
      );
      setClasses(revertedClasses);
      saveStatuses(revertedClasses);
    }
    
    setDraggedItem(null);
  };

  const openAssignModal = (classItem: any) => {
    setSelectedClass(classItem);
    setSelectedStudents([]);
    setShowAssignModal(true);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (!selectedClass || selectedStudents.length === 0) return;

    try {
      const { data: plans } = await supabase
        .from('gym_student_plans')
        .select('id, user_id')
        .in('user_id', selectedStudents)
        .eq('status', 'active');

      if (!plans || plans.length === 0) {
        toast.error('Alunos selecionados não possuem plano ativo');
        return;
      }

      const enrollments = plans.map((plan: any) => ({
        student_plan_id: plan.id,
        class_id: selectedClass.id,
        enrolled_at: new Date().toISOString()
      }));

      const { error } = await (supabase
        .from('gym_student_class_enrollments') as any)
        .upsert(enrollments, { onConflict: 'student_plan_id,class_id' });

      if (error) throw error;

      toast.success(`${enrollments.length} aluno(s) matriculado(s)`);
      setShowAssignModal(false);
      setSelectedStudents([]);
      setSelectedClass(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao matricular alunos');
    }
  };

  const getColumnItems = (columnId: string) => {
    return classes.filter(c => {
      return c.status === columnId && 
        c.name?.toLowerCase().includes(search.toLowerCase());
    });
  };

  const formatDays = (days: number[] | null) => {
    if (!days || days.length === 0) return 'Sem dias';
    if (days.length === 7) return 'Todos os dias';
    if (days.length <= 3) {
      return days.map(d => WEEKDAYS_FULL[d]).join(', ');
    }
    return days.map(d => WEEKDAYS[d]).join(', ');
  };

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      cardio: 'bg-red-500/20 text-red-400',
      forca: 'bg-blue-500/20 text-blue-400',
      flexibilidade: 'bg-purple-500/20 text-purple-400',
      hiit: 'bg-orange-500/20 text-orange-400',
      funcional: 'bg-cyan-500/20 text-cyan-400',
      danca: 'bg-pink-500/20 text-pink-400',
      luta: 'bg-yellow-500/20 text-yellow-400',
      relaxamento: 'bg-green-500/20 text-green-400'
    };
    return badges[category] || 'bg-zinc-500/20 text-zinc-400';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      cardio: 'Cardio', forca: 'Força', flexibilidade: 'Flexibilidade',
      hiit: 'HIIT', funcional: 'Funcional', danca: 'Dança',
      luta: 'Luta', relaxamento: 'Relaxamento'
    };
    return labels[category] || 'Geral';
  };

  return (
    <div className="space-y-6">
      <KanbanHelpModal open={showHelp} onOpenChange={setShowHelp} type="classes" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Aulas Coletivas</h1>
            <p className="text-zinc-400 mt-1 text-sm">Organize e gerencie suas aulas</p>
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
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      <CreateClassModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={fetchClasses}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <Input
          placeholder="Buscar aula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800"
        />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div
            key={column.id}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 min-h-[400px] min-w-[250px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {getColumnItems(column.id).length}
              </Badge>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : (
                getColumnItems(column.id).map(classItem => (
                  <motion.div
                    key={classItem.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, classItem.id)}
                    className={`bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-orange-500/50 transition-colors ${
                      draggedItem === classItem.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <GripVertical className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{classItem.name}</h4>
                        <Badge className={`text-xs mt-1 ${getCategoryBadge(classItem.category)}`}>
                          {getCategoryLabel(classItem.category)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-zinc-400 mb-3 ml-6">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{formatDays(classItem.recurring_days)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{classItem.start_time?.slice(0, 5) || '--:--'} ({classItem.duration_minutes || 60}min)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <span>Máx. {classItem.max_capacity || 20} alunos</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full h-7 text-xs hover:bg-orange-500/20 hover:text-orange-400"
                      onClick={() => openAssignModal(classItem)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Matricular Alunos
                    </Button>
                  </motion.div>
                ))
              )}

              {!isLoading && getColumnItems(column.id).length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Nenhuma aula
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Students Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Matricular Alunos</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Selecione os alunos para a aula "{selectedClass?.name}"
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
              onClick={handleAssignStudents}
              disabled={selectedStudents.length === 0}
            >
              Matricular ({selectedStudents.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
