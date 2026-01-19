import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Calendar, Clock, Sparkles, Loader2, CheckCircle2, Stethoscope, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface StarpetshopScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'starpetshop_appointments';

const StarpetshopSchedule = ({ isOpen, onClose }: StarpetshopScheduleProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    service: '', petType: '', petName: '', petBreed: '', date: '', time: '', ownerName: '', phone: '',
  });

  const services = [
    { id: 'consulta', name: 'Consulta Veterinária', price: 'R$ 120', duration: '30min', icon: Stethoscope, color: 'bg-red-500' },
    { id: 'avaliacao', name: 'Avaliação Odontológica', price: 'R$ 150', duration: '45min', icon: Heart, color: 'bg-rose-500' },
    { id: 'limpeza', name: 'Limpeza Dental', price: 'R$ 300', duration: '1h', icon: Star, color: 'bg-red-600' },
  ];

  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setIsSuccess(false);
      setFormData({ service: '', petType: '', petName: '', petBreed: '', date: '', time: '', ownerName: '', phone: '' });
    }, 300);
  };

  const handleSubmit = () => {
    if (!formData.ownerName || !formData.phone) {
      toast.error('Preencha todos os campos');
      return;
    }
    setIsSubmitting(true);
    
    const selectedService = services.find(s => s.id === formData.service);
    const appointment = {
      id: crypto.randomUUID(),
      ...formData,
      serviceName: selectedService?.name || '',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, appointment]));
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Consulta agendada com sucesso!');
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] overflow-hidden shadow-2xl sm:m-4"
        >
          {isSuccess ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Consulta Agendada!</h2>
              <p className="text-gray-600 mb-4">{formData.petName} está confirmado(a).</p>
              <Button onClick={handleClose} className="w-full bg-red-500 hover:bg-red-600">Fechar</Button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-red-500 to-rose-500 p-4 text-white relative">
                <button onClick={handleClose} className="absolute top-3 right-3 p-2 hover:bg-white/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">Agendar Consulta</h2>
                <p className="text-white/80 text-sm">Passo {step} de 4</p>
                <div className="flex gap-2 mt-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                {step === 1 && (
                  <div className="space-y-2">
                    <h3 className="font-bold mb-3">Qual serviço você precisa?</h3>
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => { setFormData({...formData, service: service.id}); setStep(2); }}
                        className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 ${formData.service === service.id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                      >
                        <div className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center`}>
                          <service.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-sm">{service.name}</p>
                          <p className="text-xs text-gray-500">{service.duration}</p>
                        </div>
                        <p className="font-bold text-red-600">{service.price}</p>
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-bold">Dados do pet</h3>
                    <div className="flex gap-3">
                      {[{ id: 'dog', label: 'Cachorro', emoji: '🐕' }, { id: 'cat', label: 'Gato', emoji: '🐱' }].map((pet) => (
                        <button key={pet.id} onClick={() => setFormData({...formData, petType: pet.id})}
                          className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center ${formData.petType === pet.id ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                          <span className="text-3xl">{pet.emoji}</span>
                          <span className="font-semibold">{pet.label}</span>
                        </button>
                      ))}
                    </div>
                    <div><Label>Nome do pet *</Label><Input value={formData.petName} onChange={e => setFormData({...formData, petName: e.target.value})} placeholder="Nome do pet" /></div>
                    <div><Label>Raça (opcional)</Label><Input value={formData.petBreed} onChange={e => setFormData({...formData, petBreed: e.target.value})} placeholder="Raça" /></div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-bold">Data e horário</h3>
                    <div><Label>Data</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} /></div>
                    {formData.date && (
                      <div className="grid grid-cols-4 gap-2">
                        {times.map(time => (
                          <button key={time} onClick={() => setFormData({...formData, time})}
                            className={`py-2 rounded-lg border text-sm font-medium ${formData.time === time ? 'bg-red-500 text-white border-red-500' : 'border-gray-200'}`}>
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="font-bold">Seus dados</h3>
                    <div><Label>Nome completo *</Label><Input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
                    <div><Label>WhatsApp *</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" /></div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t flex gap-3">
                {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">Voltar</Button>}
                {step < 4 ? (
                  <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !formData.service || step === 2 && (!formData.petType || !formData.petName) || step === 3 && (!formData.date || !formData.time)}
                    className="flex-1 bg-red-500 hover:bg-red-600">Continuar</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-red-500 hover:bg-red-600">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StarpetshopSchedule;
