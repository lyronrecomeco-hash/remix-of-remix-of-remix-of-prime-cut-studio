import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Users, MapPin, Check, Dumbbell } from 'lucide-react';
import { useGymAuth } from '@/contexts/GymAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GymClassesPage() {
  const { profile, user } = useGymAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchSessions();
    if (user) {
      fetchMyBookings();
    }
  }, [selectedDate, user]);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('gym_classes')
      .select('*')
      .eq('is_active', true);
    
    if (data) setClasses(data);
  };

  const fetchSessions = async () => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);

    const { data } = await supabase
      .from('gym_class_sessions')
      .select(`
        *,
        gym_classes(*),
        gym_class_bookings(count)
      `)
      .gte('scheduled_at', dayStart.toISOString())
      .lt('scheduled_at', dayEnd.toISOString())
      .eq('status', 'scheduled')
      .order('scheduled_at');

    if (data) setSessions(data);
    setIsLoading(false);
  };

  const fetchMyBookings = async () => {
    const { data } = await supabase
      .from('gym_class_bookings')
      .select('session_id')
      .eq('user_id', user?.id)
      .eq('status', 'confirmed');

    if (data) {
      setMyBookings(data.map(b => b.session_id));
    }
  };

  const handleBookClass = async (sessionId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    const { error } = await supabase
      .from('gym_class_bookings')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        status: 'confirmed'
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Você já está inscrito nesta aula');
      } else {
        toast.error('Erro ao reservar aula');
      }
      return;
    }

    toast.success('Aula reservada com sucesso!');
    fetchMyBookings();
    fetchSessions();
  };

  const handleCancelBooking = async (sessionId: string) => {
    const { error } = await supabase
      .from('gym_class_bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Erro ao cancelar reserva');
      return;
    }

    toast.success('Reserva cancelada');
    fetchMyBookings();
    fetchSessions();
  };

  const generateWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cardio': return 'border-red-500/30 bg-red-500/10';
      case 'forca': return 'border-blue-500/30 bg-blue-500/10';
      case 'flexibilidade': return 'border-purple-500/30 bg-purple-500/10';
      case 'hiit': return 'border-orange-500/30 bg-orange-500/10';
      case 'relaxamento': return 'border-green-500/30 bg-green-500/10';
      default: return 'border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <div className="p-4 lg:p-0 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2"
      >
        <h1 className="text-2xl font-bold">Aulas Coletivas</h1>
        <p className="text-zinc-400 text-sm">Reserve sua vaga nas aulas</p>
      </motion.div>

      {/* Date Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0"
      >
        {generateWeekDays().map((day, i) => {
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-all ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-orange-500/50'
              }`}
            >
              <span className="text-xs uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
              {isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Sessions Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
              <div className="h-10 bg-zinc-800 rounded" />
            </div>
          ))
        ) : sessions.length > 0 ? (
          sessions.map((session, index) => {
            const isBooked = myBookings.includes(session.id);
            const bookingsCount = session.gym_class_bookings?.[0]?.count || 0;
            const maxCapacity = session.gym_classes?.max_capacity || 20;
            const isFull = bookingsCount >= maxCapacity;
            const categoryColor = getCategoryColor(session.gym_classes?.category);

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-zinc-900 border rounded-2xl p-4 ${
                  isBooked ? 'border-orange-500/50' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{session.gym_classes?.name}</h3>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1 border ${categoryColor}`}>
                      {session.gym_classes?.category || 'Geral'}
                    </div>
                  </div>
                  {isBooked && (
                    <span className="flex-shrink-0 flex items-center gap-1 text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full ml-2">
                      <Check className="w-3 h-3" />
                      Reservado
                    </span>
                  )}
                </div>

                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                  {session.gym_classes?.description || 'Aula coletiva da academia'}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{format(new Date(session.scheduled_at), 'HH:mm')}</span>
                    <span className="text-zinc-600">({session.gym_classes?.duration_minutes || 60}min)</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className={bookingsCount >= maxCapacity * 0.8 ? 'text-orange-400' : ''}>
                      {bookingsCount}/{maxCapacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm col-span-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{session.gym_classes?.location || 'Sala 1'}</span>
                  </div>
                </div>

                {isBooked ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleCancelBooking(session.id)}
                  >
                    Cancelar Reserva
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50"
                    disabled={isFull}
                    onClick={() => handleBookClass(session.id)}
                  >
                    {isFull ? 'Aula Lotada' : 'Reservar Vaga'}
                  </Button>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <CalendarDays className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma aula neste dia</h3>
            <p className="text-zinc-400 text-sm">
              Selecione outra data para ver as aulas disponíveis
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
