import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Phone, Star, Stethoscope, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface StarpetshopScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'starpetshop_appointments';

export const getStarpetshopAppointments = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const StarpetshopSchedule = ({ isOpen, onClose }: StarpetshopScheduleProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    petName: '',
    petType: '',
    ownerName: '',
    phone: '',
  });

  const services = [
    { id: 'consulta', name: 'Consulta Veterinária', icon: Stethoscope, duration: '30min', price: 'A partir de R$ 120' },
    { id: 'avaliacao-dental', name: 'Avaliação Odontológica', icon: Star, duration: '45min', price: 'A partir de R$ 150' },
    { id: 'limpeza-dental', name: 'Limpeza Dental', icon: Heart, duration: '1h', price: 'A partir de R$ 300' },
  ];

  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const generateProtocol = () => {
    const date = new Date();
    return `STAR${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const handleSubmit = () => {
    const protocol = generateProtocol();
    const appointment = {
      ...formData,
      protocol,
      serviceName: services.find(s => s.id === formData.service)?.name,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    const existing = getStarpetshopAppointments();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, appointment]));

    toast.success('Consulta agendada com sucesso!', {
      description: `Protocolo: ${protocol}`,
    });

    setStep(4);
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      service: '',
      date: '',
      time: '',
      petName: '',
      petType: '',
      ownerName: '',
      phone: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={resetAndClose}
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
                onClick={resetAndClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Agendar Consulta</h2>
                  <p className="text-red-100 text-sm">Star Petshop</p>
                </div>
              </div>
              
              {/* Progress */}
              {step < 4 && (
                <div className="flex gap-2 mt-6">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        s <= step ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Step 1: Service */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Selecione o serviço</h3>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setFormData({ ...formData, service: service.id });
                          setStep(2);
                        }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-red-500 hover:bg-red-50 ${
                          formData.service === service.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <service.icon className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.duration} • {service.price}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Data e horário</h3>
                  
                  <div className="mb-6">
                    <Label className="mb-2 block">Data</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                  </div>

                  {formData.date && (
                    <div>
                      <Label className="mb-2 block">Horário disponível</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {times.map((time) => (
                          <button
                            key={time}
                            onClick={() => setFormData({ ...formData, time })}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                              formData.time === time
                                ? 'bg-red-600 text-white border-red-600'
                                : 'border-gray-200 hover:border-red-500 hover:bg-red-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!formData.date || !formData.time}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Dados do pet e contato</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Nome do pet</Label>
                        <Input
                          value={formData.petName}
                          onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                          placeholder="Ex: Rex"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Tipo</Label>
                        <select
                          value={formData.petType}
                          onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                          className="w-full h-10 rounded-md border border-input bg-background px-3"
                        >
                          <option value="">Selecione</option>
                          <option value="cao">Cão</option>
                          <option value="gato">Gato</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Seu nome</Label>
                      <Input
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">WhatsApp</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.petName || !formData.ownerName || !formData.phone}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Confirmar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Consulta Agendada!</h3>
                  <p className="text-gray-600 mb-4">
                    {formData.petName} está confirmado(a) para {new Date(formData.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {formData.time}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-500">Serviço</p>
                    <p className="font-semibold text-gray-900">
                      {services.find(s => s.id === formData.service)?.name}
                    </p>
                  </div>
                  <Button onClick={resetAndClose} className="w-full bg-red-600 hover:bg-red-700">
                    Fechar
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StarpetshopSchedule;
