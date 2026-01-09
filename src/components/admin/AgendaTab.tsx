import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  XCircle,
  Bell,
  Phone,
  Play,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp, Appointment } from '@/contexts/AppContext';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 5;

export default function AgendaTab() {
  const {
    appointments,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    callSpecificClient,
    queue,
    shopSettings,
    refreshData,
  } = useApp();
  const { notify } = useNotification();

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

  // Filter appointments
  const allFilteredAppointments = appointments
    .filter(a => {
      if (a.date !== dateFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  // Pagination
  const totalPages = Math.ceil(allFilteredAppointments.length / ITEMS_PER_PAGE);
  const currentPageIndex = Math.min(page, Math.max(0, totalPages - 1));
  const startIndex = currentPageIndex * ITEMS_PER_PAGE;
  const filteredAppointments = allFilteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Daily limit
  const dateAppointmentCount = appointments.filter(a =>
    a.date === dateFilter && a.status !== 'cancelled'
  ).length;

  const handleRemoveFromQueue = useCallback(async (apt: Appointment) => {
    await supabase.from('queue').delete().eq('appointment_id', apt.id);
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', apt.id);
    refreshData();
    notify.info(`${apt.clientName} removido da fila.`);
  }, [refreshData, notify]);

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400' },
    confirmed: { label: 'Confirmado', color: 'bg-primary/20 text-primary' },
    inqueue: { label: 'Na Fila', color: 'bg-blue-500/20 text-blue-400' },
    called: { label: 'Chamado', color: 'bg-purple-500/20 text-purple-400' },
    onway: { label: 'A Caminho', color: 'bg-cyan-500/20 text-cyan-400' },
    completed: { label: 'Concluído', color: 'bg-green-500/20 text-green-400' },
    cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Agenda</h2>
          <div className="text-sm text-muted-foreground">
            {allFilteredAppointments.length} agendamento(s) em{' '}
            {new Date(dateFilter + 'T12:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>

        {shopSettings.dailyAppointmentLimit && (
          <div
            className={`px-4 py-2 rounded-xl ${
              dateAppointmentCount >= (shopSettings.dailyAppointmentLimit || 20)
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-secondary'
            }`}
          >
            <span className="text-sm font-medium">
              {dateAppointmentCount}/{shopSettings.dailyAppointmentLimit} limite diário
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 mt-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const d = new Date(dateFilter);
                d.setDate(d.getDate() - 1);
                setDateFilter(d.toISOString().split('T')[0]);
                setPage(0);
              }}
              className="p-2 hover:bg-secondary rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(0);
              }}
              className="w-auto"
            />
            <button
              onClick={() => {
                const d = new Date(dateFilter);
                d.setDate(d.getDate() + 1);
                setDateFilter(d.toISOString().split('T')[0]);
                setPage(0);
              }}
              className="p-2 hover:bg-secondary rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFilter(new Date().toISOString().split('T')[0]);
                setPage(0);
              }}
            >
              Hoje
            </Button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="bg-secondary px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="confirmed">Confirmados</option>
            <option value="inqueue">Na Fila</option>
            <option value="called">Chamados</option>
            <option value="onway">A Caminho</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center flex-1 flex flex-col items-center justify-center mt-4">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 flex-1 overflow-y-auto mt-4">
            {filteredAppointments.map((apt) => {
              const queueEntry = queue.find((q) => q.appointmentId === apt.id);
              const status = statusConfig[apt.status] || statusConfig.pending;
              const isActive = apt.status !== 'completed' && apt.status !== 'cancelled';
              const canCall = apt.status === 'confirmed' || apt.status === 'inqueue';

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold text-primary">{apt.time}</div>
                        <div className="text-xs text-muted-foreground">{apt.service?.duration} min</div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{apt.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {apt.service?.name} - {apt.barber?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{apt.clientPhone}</p>
                        {queueEntry?.status === 'waiting' && (
                          <p className="text-xs text-primary font-medium mt-1">
                            Posição na fila: {queueEntry.position}°
                          </p>
                        )}
                        {apt.protocol && (
                          <p className="text-xs text-muted-foreground mt-1">Protocolo: {apt.protocol}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>

                      {isActive && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {apt.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => {
                                confirmAppointment(apt.id);
                                notify.success(`${apt.clientName} confirmado e adicionado à fila!`);
                              }}
                            >
                              <Check className="w-4 h-4" />
                              Aceitar
                            </Button>
                          )}

                          {canCall && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                callSpecificClient(apt.id);
                                if ('Notification' in window && Notification.permission === 'granted') {
                                  new Notification('🔔 Chamando Cliente', {
                                    body: `${apt.clientName}, sua vez chegou!`,
                                    icon: '/favicon.ico',
                                    tag: `call-${apt.id}`,
                                  });
                                }
                                notify.queue(`${apt.clientName} foi chamado!`);
                              }}
                              className="border-primary text-primary hover:bg-primary/10"
                            >
                              <Bell className="w-4 h-4" />
                              Chamar
                            </Button>
                          )}

                          {(apt.status === 'inqueue' || apt.status === 'called' || apt.status === 'onway') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFromQueue(apt)}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4" />
                              Remover Fila
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${apt.clientPhone}`, '_self')}
                            className="border-green-500 text-green-500 hover:bg-green-500/10"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await completeAppointment(apt.id);
                                notify.success('Atendimento concluído!');
                              } catch (e) {
                                notify.error('Erro ao concluir', 'Tente novamente.');
                              }
                            }}
                            className="border-green-500 text-green-500 hover:bg-green-500/10"
                          >
                            <Play className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              cancelAppointment(apt.id);
                              notify.info('Agendamento cancelado');
                            }}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
            <span className="text-sm text-muted-foreground">
              Página {currentPageIndex + 1} de {Math.max(1, totalPages)}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => {
                if (totalPages <= 5 || i < 2 || i >= totalPages - 2 || Math.abs(i - currentPageIndex) <= 1) {
                  return (
                    <Button
                      key={i}
                      variant={currentPageIndex === i ? 'hero' : 'outline'}
                      size="sm"
                      onClick={() => setPage(i)}
                      className="w-8 h-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  );
                } else if (i === 2 && currentPageIndex > 3) {
                  return (
                    <span key={i} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  );
                } else if (i === totalPages - 3 && currentPageIndex < totalPages - 4) {
                  return (
                    <span key={i} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
