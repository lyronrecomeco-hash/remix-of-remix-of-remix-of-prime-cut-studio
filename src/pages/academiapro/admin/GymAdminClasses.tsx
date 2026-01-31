import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MoreHorizontal, 
  Clock,
  Users,
  MapPin,
  Calendar,
  ChevronRight,
  Eye,
  Edit,
  Power,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function GymAdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('gym_classes')
      .select('*')
      .order('name');

    if (data) {
      setClasses(data);
    }
    setIsLoading(false);
  };

  const fetchSessions = async (classId: string) => {
    setIsLoadingSessions(true);
    const { data } = await supabase
      .from('gym_class_sessions')
      .select(`
        *,
        gym_class_bookings(count)
      `)
      .eq('class_id', classId)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at')
      .limit(20);

    if (data) {
      setSessions(data);
    }
    setIsLoadingSessions(false);
  };

  const handleManageSessions = async (classItem: any) => {
    setSelectedClass(classItem);
    setShowSessions(true);
    await fetchSessions(classItem.id);
  };

  const handleToggleActive = async (classItem: any) => {
    const { error } = await supabase
      .from('gym_classes')
      .update({ is_active: !classItem.is_active })
      .eq('id', classItem.id);

    if (error) {
      toast.error('Erro ao atualizar aula');
      return;
    }

    toast.success(classItem.is_active ? 'Aula desativada' : 'Aula ativada');
    fetchClasses();
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Deseja cancelar esta sessão?')) return;

    const { error } = await supabase
      .from('gym_class_sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId);

    if (error) {
      toast.error('Erro ao cancelar sessão');
      return;
    }

    toast.success('Sessão cancelada');
    if (selectedClass) {
      fetchSessions(selectedClass.id);
    }
  };

  const handleGenerateSessions = async () => {
    if (!selectedClass) return;

    // Generate sessions for next 14 days
    const newSessions: any[] = [];
    const recurringDays = selectedClass.recurring_days || [];

    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      const dayOfWeek = date.getDay();

      if (recurringDays.includes(dayOfWeek)) {
        const [hours, minutes] = (selectedClass.start_time || '09:00').split(':');
        const scheduledAt = new Date(date);
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        newSessions.push({
          class_id: selectedClass.id,
          scheduled_at: scheduledAt.toISOString(),
          instructor_id: selectedClass.instructor_id || null,
          status: 'scheduled'
        });
      }
    }

    if (newSessions.length === 0) {
      toast.error('Nenhuma sessão para gerar (verifique os dias da semana)');
      return;
    }

    const { error } = await supabase
      .from('gym_class_sessions')
      .upsert(newSessions, { onConflict: 'class_id,scheduled_at' });

    if (error) {
      toast.error('Erro ao gerar sessões');
      return;
    }

    toast.success(`${newSessions.length} sessões geradas`);
    fetchSessions(selectedClass.id);
  };

  const formatDays = (days: number[] | null) => {
    if (!days || days.length === 0) return 'Sem dias';
    if (days.length === 7) return 'Todos os dias';
    return days.map(d => WEEKDAYS[d].slice(0, 3)).join(', ');
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'cardio': return { label: 'Cardio', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'forca': return { label: 'Força', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'flexibilidade': return { label: 'Flexibilidade', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'hiit': return { label: 'HIIT', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'relaxamento': return { label: 'Relaxamento', className: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'funcional': return { label: 'Funcional', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      default: return { label: category || 'Geral', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Aulas Coletivas</h1>
          <p className="text-zinc-400 mt-1">
            {classes.filter(c => c.is_active).length} aulas ativas de {classes.length} cadastradas
          </p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Aula
        </Button>
      </motion.div>

      {/* Classes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-2/3 mb-4" />
              <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4" />
              <div className="h-10 bg-zinc-800 rounded" />
            </div>
          ))
        ) : classes.length > 0 ? (
          classes.map((classItem, index) => {
            const categoryBadge = getCategoryBadge(classItem.category);
            return (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-zinc-900 border rounded-2xl p-6 ${
                  classItem.is_active ? 'border-zinc-800' : 'border-red-500/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{classItem.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryBadge.className}`}>
                        {categoryBadge.label}
                      </span>
                      {!classItem.is_active && (
                        <Badge variant="destructive" className="text-xs">Desativada</Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => handleManageSessions(classItem)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Sessões
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem 
                        className={`cursor-pointer ${classItem.is_active ? 'text-red-500' : 'text-green-500'}`}
                        onClick={() => handleToggleActive(classItem)}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {classItem.is_active ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                  {classItem.description || 'Sem descrição'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    {formatDays(classItem.recurring_days)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    {classItem.start_time?.slice(0, 5) || '--:--'} ({classItem.duration_minutes || 60} min)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Users className="w-4 h-4 text-zinc-500" />
                    Máx. {classItem.max_capacity || 20} alunos
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    {classItem.location || 'Local não definido'}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700 hover:bg-zinc-800"
                  onClick={() => handleManageSessions(classItem)}
                >
                  Gerenciar Sessões
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma aula cadastrada</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Crie sua primeira aula coletiva
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        )}
      </motion.div>

      {/* Sessions Dialog */}
      <Dialog open={showSessions} onOpenChange={setShowSessions}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sessões - {selectedClass?.name}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Gerencie as sessões programadas desta aula
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center mt-4 mb-4">
            <p className="text-sm text-zinc-400">
              {sessions.length} sessões programadas
            </p>
            <Button 
              onClick={handleGenerateSessions}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Gerar Próximas 2 Semanas
            </Button>
          </div>

          {isLoadingSessions ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Data/Hora</TableHead>
                  <TableHead className="text-zinc-400">Inscritos</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const bookings = session.gym_class_bookings?.[0]?.count || 0;
                  return (
                    <TableRow key={session.id} className="border-zinc-800">
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(new Date(session.scheduled_at), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {format(new Date(session.scheduled_at), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-zinc-500" />
                          {bookings}/{selectedClass?.max_capacity || 20}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.status === 'scheduled' ? 'default' : 'destructive'}>
                          {session.status === 'scheduled' ? 'Agendada' : 'Cancelada'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {session.status === 'scheduled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-400"
                            onClick={() => handleCancelSession(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-zinc-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              <p>Nenhuma sessão programada</p>
              <p className="text-sm">Clique em "Gerar Próximas 2 Semanas" para criar sessões</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
