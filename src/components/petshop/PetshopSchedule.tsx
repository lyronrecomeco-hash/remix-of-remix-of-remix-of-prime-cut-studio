import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Calendar, Clock, Dog, Cat, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PetshopScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

const PetshopSchedule = ({ isOpen, onClose }: PetshopScheduleProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: '',
    petType: '',
    petName: '',
    petBreed: '',
    date: '',
    time: '',
    ownerName: '',
    phone: '',
  });

  const services = [
    { id: 'banho', name: 'Banho Completo', price: 'R$ 60', icon: '🛁' },
    { id: 'tosa', name: 'Banho + Tosa', price: 'R$ 90', icon: '✂️' },
    { id: 'vet', name: 'Consulta Veterinária', price: 'R$ 150', icon: '🩺' },
    { id: 'hotel', name: 'Hotel/Creche', price: 'R$ 80/dia', icon: '🏠' },
  ];

  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    const msg = `Olá! Gostaria de agendar:\n\n🐾 *Serviço:* ${services.find(s => s.id === formData.service)?.name}\n🐕 *Pet:* ${formData.petName} (${formData.petBreed})\n📅 *Data:* ${formData.date}\n⏰ *Horário:* ${formData.time}\n👤 *Nome:* ${formData.ownerName}\n📱 *Telefone:* ${formData.phone}`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
    onClose();
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-petshop-orange p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Agendar Serviço</h2>
          <p className="text-white/80 text-sm">Passo {step} de 4</p>
          <div className="flex gap-2 mt-4">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-petshop-dark mb-4">Escolha o serviço</h3>
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setFormData({ ...formData, service: service.id })}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${formData.service === service.id ? 'border-petshop-orange bg-petshop-orange/10' : 'border-gray-200 hover:border-petshop-orange/50'}`}
                >
                  <span className="text-2xl">{service.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-petshop-dark">{service.name}</p>
                    <p className="text-sm text-petshop-gray">{service.price}</p>
                  </div>
                  {formData.service === service.id && <Check className="w-5 h-5 text-petshop-orange" />}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-petshop-dark mb-4">Dados do pet</h3>
              <div className="flex gap-4">
                {[{ id: 'dog', icon: Dog, label: 'Cachorro' }, { id: 'cat', icon: Cat, label: 'Gato' }].map(pet => (
                  <button
                    key={pet.id}
                    onClick={() => setFormData({ ...formData, petType: pet.id })}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${formData.petType === pet.id ? 'border-petshop-orange bg-petshop-orange/10' : 'border-gray-200'}`}
                  >
                    <pet.icon className="w-8 h-8 text-petshop-orange" />
                    <span className="font-medium">{pet.label}</span>
                  </button>
                ))}
              </div>
              <div><Label>Nome do pet</Label><Input value={formData.petName} onChange={e => setFormData({...formData, petName: e.target.value})} placeholder="Ex: Thor" /></div>
              <div><Label>Raça</Label><Input value={formData.petBreed} onChange={e => setFormData({...formData, petBreed: e.target.value})} placeholder="Ex: Golden Retriever" /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-petshop-dark mb-4">Data e horário</h3>
              <div><Label>Data</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} /></div>
              <div>
                <Label>Horário</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {times.map(time => (
                    <button key={time} onClick={() => setFormData({...formData, time})} className={`p-3 rounded-lg border-2 text-sm font-medium ${formData.time === time ? 'border-petshop-orange bg-petshop-orange text-white' : 'border-gray-200'}`}>{time}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-petshop-dark mb-4">Seus dados</h3>
              <div><Label>Seu nome</Label><Input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} placeholder="Nome completo" /></div>
              <div><Label>WhatsApp</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" /></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          {step > 1 && <Button variant="outline" onClick={handlePrev} className="flex-1"><ChevronLeft className="w-4 h-4 mr-1" />Voltar</Button>}
          {step < 4 ? (
            <Button onClick={handleNext} className="flex-1 bg-petshop-orange hover:bg-petshop-orange/90">Próximo<ChevronRight className="w-4 h-4 ml-1" /></Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 bg-petshop-orange hover:bg-petshop-orange/90">Confirmar via WhatsApp</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PetshopSchedule;
