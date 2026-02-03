import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Calendar,
  GripVertical,
  UserCheck,
  UserX,
  Clock,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { KanbanHelpModal } from './KanbanHelpModal';

interface AttendanceColumn {
  id: string;
  title: string;
  color: string;
  icon: any;
}

const COLUMNS: AttendanceColumn[] = [
  { id: 'pending', title: 'Aguardando', color: 'bg-muted-foreground', icon: Clock },
  { id: 'present', title: 'Presente', color: 'bg-green-500', icon: UserCheck },
  { id: 'absent', title: 'Faltou', color: 'bg-red-500', icon: UserX }
];

export default function AttendanceKanban() {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await (supabase
        .from('gym_profiles') as any)
        .select('*')
        .eq('role', 'aluno')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Erro ao carregar alunos');
    }
  };

  const fetchAttendance = async () => {
    setIsLoading(true);
    
    try {
      // Get check-ins for the selected date - WITHOUT the problematic join
      const { data: checkIns, error } = await supabase
        .from('gym_check_ins')
        .select('*')
        .gte('checked_in_at', `${selectedDate}T00:00:00`)
        .lte('checked_in_at', `${selectedDate}T23:59:59`);

      if (error) throw error;

      // Create attendance records combining students and check-ins
      const attendanceRecords = students.map(student => {
        const checkIn = checkIns?.find(c => c.user_id === student.user_id);
        return {
          id: student.user_id,
          student,
          checkIn,
          status: checkIn ? 'present' : 'pending'
        };
      });

      setAttendances(attendanceRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Erro ao carregar presenças');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, attendanceId: string) => {
    setDraggedItem(attendanceId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const attendance = attendances.find(a => a.id === draggedItem);
    if (!attendance) return;

    const previousStatus = attendance.status;

    // Update local state immediately
    setAttendances(prev => prev.map(a => 
      a.id === draggedItem ? { ...a, status: targetStatus } : a
    ));

    // Handle check-in creation or update
    if (targetStatus === 'present' && !attendance.checkIn) {
      try {
        const { error } = await supabase
          .from('gym_check_ins')
          .insert({
            user_id: attendance.student.user_id,
            checked_in_at: new Date().toISOString(),
            method: 'manual'
          });

        if (error) throw error;
        toast.success(`${attendance.student.full_name} marcado como presente`);
        fetchAttendance(); // Refresh to get the new check-in
      } catch (error) {
        console.error('Error creating check-in:', error);
        toast.error('Erro ao registrar presença');
        // Revert state
        setAttendances(prev => prev.map(a => 
          a.id === draggedItem ? { ...a, status: previousStatus } : a
        ));
      }
    } else if (targetStatus === 'absent') {
      toast.info(`${attendance.student.full_name} marcado como falta`);
    }

    setDraggedItem(null);
  };

  const getColumnItems = (columnId: string) => {
    return attendances.filter(a => {
      return a.status === columnId && 
        a.student.full_name?.toLowerCase().includes(search.toLowerCase());
    });
  };

  return (
    <div className="space-y-6">
      {/* Help Modal */}
      <KanbanHelpModal open={showHelp} onOpenChange={setShowHelp} type="attendance" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Controle de Presença</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Arraste os alunos para registrar presença
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHelp(true)}
            className="hover:bg-primary/20 text-muted-foreground hover:text-primary"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto bg-card border-border"
          />
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>

      {/* Date Display */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-5 h-5" />
        <span className="font-medium">
          {format(new Date(selectedDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </span>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(column => {
          const Icon = column.icon;
          return (
            <div
              key={column.id}
              className="bg-card/50 border border-border rounded-xl p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg ${column.color}/20 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${column.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="outline" className="ml-auto text-xs">
                  {getColumnItems(column.id).length}
                </Badge>
              </div>

              {/* Column Items */}
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  getColumnItems(column.id).map(attendance => (
                    <motion.div
                      key={attendance.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, attendance.id)}
                      className={`bg-muted border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
                        draggedItem === attendance.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-muted-foreground/20 text-xs">
                            {attendance.student.full_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {attendance.student.full_name}
                          </p>
                          {attendance.checkIn && (
                            <p className="text-xs text-muted-foreground">
                              Check-in: {format(new Date(attendance.checkIn.checked_in_at), 'HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {!isLoading && getColumnItems(column.id).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum aluno
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {getColumnItems('present').length}
          </p>
          <p className="text-sm text-muted-foreground">Presentes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-500">
            {getColumnItems('absent').length}
          </p>
          <p className="text-sm text-muted-foreground">Faltas</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">
            {getColumnItems('pending').length}
          </p>
          <p className="text-sm text-muted-foreground">Aguardando</p>
        </div>
      </motion.div>
    </div>
  );
}
