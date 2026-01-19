import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Stethoscope, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import starpetshopLogo from '@/assets/starpetshop/logo-official.png';

const STORAGE_KEY = 'starpetshop_appointments';

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
}

export function getStarpetshopAppointments(): Appointment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

interface StarpetshopMyAppointmentsProps {
  isOpen: boolean;
  onClose: () => void;
}

const StarpetshopMyAppointments = ({ isOpen, onClose }: StarpetshopMyAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAppointments(getStarpetshopAppointments());
    }
  }, [isOpen]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleCancel = (id: string) => {
    const updated = appointments.map(a => 
      a.id === id ? { ...a, status: 'cancelled' as const } : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAppointments(updated);
    toast.success('Agendamento cancelado');
  };

  if (!isOpen) return null;

  const activeAppointments = appointments.filter(a => a.status !== 'cancelled');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl sm:m-4"
        >
          <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 sm:p-5 text-white relative">
            <button onClick={onClose} className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Star Petshop Araxá</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Meus Agendamentos</h2>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh]">
            {activeAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-gray-600">Você ainda não tem agendamentos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAppointments.map((apt) => (
                  <div key={apt.id} className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={starpetshopLogo}
                        alt="Star Petshop"
                        className="h-10 w-auto object-contain flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{apt.serviceName}</p>
                        <p className="text-sm text-gray-600">{apt.petName}</p>
                        <div className="flex gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(apt.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(apt.id)}
                      className="w-full mt-3 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <Button onClick={onClose} className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl">
              Fechar
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StarpetshopMyAppointments;
