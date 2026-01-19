import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Trash2, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStarpetshopAppointments } from './StarpetshopSchedule';

interface StarpetshopMyAppointmentsProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'starpetshop_appointments';

const StarpetshopMyAppointments = ({ isOpen, onClose }: StarpetshopMyAppointmentsProps) => {
  const appointments = getStarpetshopAppointments();

  const handleCancel = (protocol: string) => {
    const updated = appointments.filter((a: any) => a.protocol !== protocol);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success('Agendamento cancelado');
    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Meus Agendamentos</h2>
                  <p className="text-red-100 text-sm">Star Petshop</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Nenhum agendamento</h3>
                  <p className="text-gray-500 text-sm">Você ainda não possui consultas agendadas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <div
                      key={appointment.protocol}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Star className="w-5 h-5 text-red-600" fill="currentColor" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{appointment.petName}</p>
                            <p className="text-sm text-gray-500">{appointment.serviceName}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Confirmado
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-red-500" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-red-500" />
                          {appointment.time}
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mb-3">
                        Protocolo: {appointment.protocol}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleCancel(appointment.protocol)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => window.open('https://wa.me/553436623787', '_blank')}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StarpetshopMyAppointments;
