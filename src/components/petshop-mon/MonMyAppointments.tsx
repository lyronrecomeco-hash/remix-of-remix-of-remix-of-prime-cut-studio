import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Scissors, Home, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { openWhatsAppLink, sendPetshopWhatsAppWithRetry } from '@/lib/petshopWhatsApp';

const MON_STORAGE_KEY = 'monpetit_appointments';

interface Appointment {
  id: string;
  service: string;
  serviceName: string;
  petName: string;
  petType: string;
  date: string;
  time: string;
  ownerName: string;
  phone: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
  cancelledAt?: string;
}

interface MonMyAppointmentsProps {
  isOpen: boolean;
  onClose: () => void;
}

const serviceIcons: Record<string, any> = {
  banho: Scissors,
  tosa: Scissors,
  'tosa-especial': Scissors,
  hotel: Home,
};

const serviceNames: Record<string, string> = {
  banho: 'Banho Completo',
  tosa: 'Banho + Tosa',
  'tosa-especial': 'Tosa Especializada',
  hotel: 'Hospedagem',
};

export function getMonAppointments(): Appointment[] {
  try {
    const stored = localStorage.getItem(MON_STORAGE_KEY);
    const raw = stored ? JSON.parse(stored) : [];
    const arr = Array.isArray(raw) ? raw : [];

    return arr.map((a: any) => {
      const service = String(a?.service || '');
      return {
        id: String(a?.id || crypto.randomUUID()),
        service,
        serviceName: String(a?.serviceName || serviceNames[service] || service),
        petName: String(a?.petName || ''),
        petType: String(a?.petType || ''),
        date: String(a?.date || ''),
        time: String(a?.time || ''),
        ownerName: String(a?.ownerName || ''),
        phone: String(a?.phone || ''),
        createdAt: String(a?.createdAt || new Date().toISOString()),
        status: a?.status === 'cancelled' ? 'cancelled' : 'confirmed',
        cancelledAt: a?.cancelledAt ? String(a.cancelledAt) : undefined,
      } as Appointment;
    });
  } catch {
    return [];
  }
}

function persistAppointments(appointments: Appointment[]) {
  localStorage.setItem(MON_STORAGE_KEY, JSON.stringify(appointments));
  window.dispatchEvent(new Event('storage'));
}

const MonMyAppointments = ({ isOpen, onClose }: MonMyAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAppointments(getMonAppointments());
    }
  }, [isOpen]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const isPast = (dateStr: string, timeStr: string) => {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = (timeStr || '00:00').split(':').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hour, minute);
    return appointmentDate < new Date();
  };

  const handleCancel = async (apt: Appointment) => {
    const past = isPast(apt.date, apt.time);
    if (past) {
      toast.error('Este agendamento já passou e não pode ser cancelado.');
      return;
    }
    if (apt.status === 'cancelled') return;

    const ok = window.confirm('Confirmar cancelamento deste agendamento?');
    if (!ok) return;

    setCancellingId(apt.id);

    const petshopPhone = '5527997717391';

    const cancelToPetshop = `Olá! Gostaria de cancelar meu agendamento no *Mon Petit Aracruz*. ❌\n\n*Agendamento:*\n• Serviço: ${apt.serviceName}\n• Pet: ${apt.petName} ${apt.petType === 'dog' ? '🐕' : '🐱'}\n• Data/Hora: ${formatDate(apt.date)} às ${apt.time}\n\n*Meus dados:*\n• Nome: ${apt.ownerName}\n• WhatsApp: ${apt.phone}\n\nObrigado(a)!`;

    const cancelToClient = `❌ *Cancelamento confirmado!*\n\nOlá, ${apt.ownerName}! Seu cancelamento no *Mon Petit Aracruz* foi registrado.\n\n• Serviço: ${apt.serviceName}\n• Pet: ${apt.petName} ${apt.petType === 'dog' ? '🐕' : '🐱'}\n• Data/Hora: ${formatDate(apt.date)} às ${apt.time}\n\nSe quiser remarcar, é só fazer um novo agendamento. O banho e tosa mais cheiroso da cidade! 🐾`;

    try {
      await sendPetshopWhatsAppWithRetry({
        phone: petshopPhone,
        message: cancelToPetshop,
      });

      try {
        await sendPetshopWhatsAppWithRetry({
          phone: apt.phone,
          message: cancelToClient,
        });
      } catch (e) {
        console.warn('Falha ao enviar confirmação de cancelamento para o cliente:', e);
        toast.message('Aviso: não consegui enviar a confirmação automática agora.');
      }

      const next: Appointment[] = getMonAppointments().map((a) =>
        a.id === apt.id
          ? ({ ...a, status: 'cancelled' as const, cancelledAt: new Date().toISOString() } satisfies Appointment)
          : a
      );
      persistAppointments(next);
      setAppointments(next);
      toast.success('Cancelamento enviado e confirmado no seu WhatsApp!');
    } catch (e) {
      console.error(e);
      openWhatsAppLink(petshopPhone, cancelToPetshop);

      const next: Appointment[] = getMonAppointments().map((a) =>
        a.id === apt.id
          ? ({ ...a, status: 'cancelled' as const, cancelledAt: new Date().toISOString() } satisfies Appointment)
          : a
      );
      persistAppointments(next);
      setAppointments(next);
      toast.success('Cancelamento aberto no WhatsApp.');
    } finally {
      setCancellingId(null);
    }
  };

  const openGPS = () => {
    const address = encodeURIComponent('Cohab 2, Aracruz - ES');
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  if (!isOpen) return null;

  const activeAppointments = appointments.filter(a => a.status !== 'cancelled' && !isPast(a.date, a.time));
  const pastAppointments = appointments.filter(a => a.status === 'cancelled' || isPast(a.date, a.time));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[85vh] overflow-hidden shadow-2xl sm:m-4"
        >
          {/* Drag indicator for mobile */}
          <div className="sticky top-0 pt-3 pb-2 bg-gradient-to-r from-cyan-500 to-blue-500 sm:hidden z-10">
            <div className="w-12 h-1.5 bg-white/50 rounded-full mx-auto" />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 sm:p-5 text-white relative">
            <button 
              onClick={onClose} 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium">Mon Petit Aracruz</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Meus Agendamentos</h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] sm:max-h-[65vh]">
            {appointments.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-500" />
                </div>
                <p className="text-gray-600 text-sm sm:text-base">Você ainda não tem agendamentos</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Agende um serviço para seu pet!</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Active Appointments */}
                {activeAppointments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Próximos Agendamentos</h3>
                    <div className="space-y-2 sm:space-y-3">
                      {activeAppointments.map((apt) => {
                        const Icon = serviceIcons[apt.service] || Scissors;
                        return (
                          <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-cyan-50 border border-cyan-100 rounded-xl p-3 sm:p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{apt.serviceName}</p>
                                <p className="text-xs sm:text-sm text-gray-600">{apt.petName} {apt.petType === 'dog' ? '🐕' : '🐱'}</p>
                                <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    {formatDate(apt.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    {apt.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={openGPS}
                                className="flex-1 h-9 text-xs sm:text-sm border-cyan-300 text-cyan-600 hover:bg-cyan-50"
                              >
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                Abrir GPS
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(apt)}
                                disabled={cancellingId === apt.id}
                                className="flex-1 h-9 text-xs sm:text-sm border-red-300 text-red-600 hover:bg-red-50"
                              >
                                {cancellingId === apt.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <X className="w-3.5 h-3.5 mr-1" />
                                    Cancelar
                                  </>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Past/Cancelled Appointments */}
                {pastAppointments.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-500 mb-2 sm:mb-3 text-sm sm:text-base">Histórico</h3>
                    <div className="space-y-2">
                      {pastAppointments.map((apt) => {
                        const Icon = serviceIcons[apt.service] || Scissors;
                        return (
                          <div
                            key={apt.id}
                            className="bg-gray-50 border border-gray-100 rounded-xl p-3 opacity-60"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-300 rounded-xl flex items-center justify-center">
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-600 text-sm truncate">{apt.serviceName}</p>
                                <p className="text-xs text-gray-400">{formatDate(apt.date)} às {apt.time}</p>
                              </div>
                              {apt.status === 'cancelled' && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Cancelado</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50">
            <Button
              onClick={onClose}
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl"
            >
              Fechar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MonMyAppointments;
