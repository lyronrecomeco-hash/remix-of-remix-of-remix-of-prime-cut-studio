import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Navigation, Scissors, Stethoscope, Home, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { openWhatsAppLink, sendPetshopWhatsAppWithRetry } from '@/lib/petshopWhatsApp';

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
  status?: 'confirmed' | 'cancelled';
  cancelledAt?: string;
}

interface PetshopMyAppointmentsProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'petshop_appointments';

const serviceIcons: Record<string, any> = {
  banho: Scissors,
  tosa: Scissors,
  vet: Stethoscope,
  hotel: Home,
};

const serviceNames: Record<string, string> = {
  banho: 'Banho Completo',
  tosa: 'Banho + Tosa',
  vet: 'Consulta Veterinária',
  hotel: 'Hotel/Creche',
};

export function getAppointments(): Appointment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

export function saveAppointment(
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'cancelledAt'>
): Appointment {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: crypto.randomUUID(),
    serviceName: serviceNames[appointment.service] || appointment.service,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };
  appointments.unshift(newAppointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  return newAppointment;
}

function persistAppointments(appointments: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

const PetshopMyAppointments = ({ isOpen, onClose }: PetshopMyAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAppointments(getAppointments());
    }
  }, [isOpen]);

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

    const petshopPhone = '5581998409073';

    const cancelToPetshop = `Olá! Gostaria de cancelar meu agendamento. ❌\n\n*Agendamento:*\n• Serviço: ${apt.serviceName}\n• Pet: ${apt.petName} ${apt.petType === 'dog' ? '🐕' : '🐱'}\n• Data/Hora: ${formatDate(apt.date)} às ${apt.time}\n\n*Meus dados:*\n• Nome: ${apt.ownerName}\n• WhatsApp: ${apt.phone}\n\nObrigado(a)!`;

    const cancelToClient = `❌ *Cancelamento confirmado!*\n\nOlá, ${apt.ownerName}! Seu cancelamento no *Seu Xodó Petshop* foi registrado.\n\n• Serviço: ${apt.serviceName}\n• Pet: ${apt.petName} ${apt.petType === 'dog' ? '🐕' : '🐱'}\n• Data/Hora: ${formatDate(apt.date)} às ${apt.time}\n\nSe quiser remarcar, é só fazer um novo agendamento por aqui.`;

    try {
      // 1) Avisar o Petshop
      await sendPetshopWhatsAppWithRetry({
        phone: petshopPhone,
        message: cancelToPetshop,
      });

      // 2) Confirmar para o cliente (best effort)
      try {
        await sendPetshopWhatsAppWithRetry({
          phone: apt.phone,
          message: cancelToClient,
        });
      } catch (e) {
        console.warn('Falha ao enviar confirmação de cancelamento para o cliente:', e);
        toast.message('Aviso: não consegui enviar a confirmação automática agora.');
      }

      const next: Appointment[] = getAppointments().map((a) =>
        a.id === apt.id
          ? ({ ...a, status: 'cancelled' as const, cancelledAt: new Date().toISOString() } satisfies Appointment)
          : a
      );
      persistAppointments(next);
      setAppointments(next);
      toast.success('Cancelamento enviado e confirmado no seu WhatsApp!');
    } catch (e) {
      console.error(e);
      // fallback manual para avisar o petshop (mobile-safe)
      openWhatsAppLink(petshopPhone, cancelToPetshop);

      const next: Appointment[] = getAppointments().map((a) =>
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
    const address = encodeURIComponent('Estr. de Belém, 1273 - Campo Grande, Recife - PE, 52040-000');
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const isPast = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    const appointmentDate = new Date(year, month - 1, day, hour, minute);
    return appointmentDate < new Date();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-petshop-orange p-5 text-white relative flex-shrink-0">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Seus Agendamentos</span>
            </div>
            <h2 className="text-xl font-bold">Meus Agendamentos</h2>
            <p className="text-white/80 text-sm">{appointments.length} agendamento(s)</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agendamento</h3>
                <p className="text-gray-500">Você ainda não fez nenhum agendamento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt, index) => {
                  const Icon = serviceIcons[apt.service] || Scissors;
                  const past = isPast(apt.date, apt.time);
                  const cancelled = apt.status === 'cancelled';

                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-2xl border-2 ${
                        cancelled
                          ? 'border-red-200 bg-red-50'
                          : past
                            ? 'border-gray-200 bg-gray-50 opacity-60'
                            : 'border-petshop-orange/30 bg-orange-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          cancelled ? 'bg-red-100' : past ? 'bg-gray-200' : 'bg-petshop-orange'
                        }`}>
                          <Icon className={`w-7 h-7 ${cancelled ? 'text-red-600' : past ? 'text-gray-500' : 'text-white'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-bold text-gray-900">{apt.serviceName}</h4>
                                <p className="text-sm text-gray-600">
                                  {apt.petName} {apt.petType === 'dog' ? '🐕' : '🐱'}
                                </p>
                              </div>
                              {apt.status === 'cancelled' ? (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Cancelado
                                </span>
                              ) : past ? (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                  Concluído
                                </span>
                              ) : null}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <span className="flex items-center gap-1 text-gray-700">
                                <Calendar className="w-4 h-4 text-petshop-orange" />
                                {formatDate(apt.date)}
                              </span>
                              <span className="flex items-center gap-1 text-gray-700">
                                <Clock className="w-4 h-4 text-petshop-orange" />
                                {apt.time}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={openGPS}
                                className="bg-petshop-orange hover:bg-petshop-orange/90 text-white text-xs h-8 px-3"
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Abrir GPS
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={past || apt.status === 'cancelled' || cancellingId === apt.id}
                                onClick={() => handleCancel(apt)}
                                className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8 px-3"
                              >
                                {cancellingId === apt.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Cancelando...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancelar
                                  </>
                                )}
                              </Button>
                            </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t bg-gray-50 flex-shrink-0">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-gray-300 text-gray-700 rounded-xl"
            >
              Fechar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PetshopMyAppointments;
