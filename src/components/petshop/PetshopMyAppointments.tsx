import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Navigation, Scissors, Stethoscope, Home, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: crypto.randomUUID(),
    serviceName: serviceNames[appointment.service] || appointment.service,
    createdAt: new Date().toISOString(),
  };
  appointments.unshift(newAppointment);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  return newAppointment;
}

function removeAppointment(id: string) {
  const appointments = getAppointments().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

const PetshopMyAppointments = ({ isOpen, onClose }: PetshopMyAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAppointments(getAppointments());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    removeAppointment(id);
    setAppointments(getAppointments());
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
                  
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-2xl border-2 ${
                        past 
                          ? 'border-gray-200 bg-gray-50 opacity-60' 
                          : 'border-petshop-orange/30 bg-orange-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          past ? 'bg-gray-200' : 'bg-petshop-orange'
                        }`}>
                          <Icon className={`w-7 h-7 ${past ? 'text-gray-500' : 'text-white'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-gray-900">{apt.serviceName}</h4>
                              <p className="text-sm text-gray-600">
                                {apt.petName} {apt.petType === 'dog' ? '🐕' : '🐱'}
                              </p>
                            </div>
                            {past && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                                Concluído
                              </span>
                            )}
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
                              onClick={() => handleDelete(apt.id)}
                              className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8 px-3"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remover
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
