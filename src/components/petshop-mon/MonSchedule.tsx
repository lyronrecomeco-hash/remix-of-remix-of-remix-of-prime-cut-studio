import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Calendar, Clock, User, Phone, Sparkles, Loader2, CheckCircle2, Scissors, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { openWhatsAppLink, sendPetshopWhatsAppWithRetry } from '@/lib/petshopWhatsApp';

interface MonScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

const MON_STORAGE_KEY = 'monpetit_appointments';

// Helper functions for Mon Petit appointments
export function getMonAppointments() {
  try {
    const stored = localStorage.getItem(MON_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveMonAppointment(appointment: any) {
  const current = getMonAppointments();
  const newAppointment = {
    ...appointment,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };
  current.push(newAppointment);
  localStorage.setItem(MON_STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('storage'));
}

const MonSchedule = ({ isOpen, onClose }: MonScheduleProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    { id: 'banho', name: 'Banho Completo', price: 'R$ 50', duration: '1h', icon: Scissors, color: 'bg-cyan-500', description: 'Banho, secagem e perfume' },
    { id: 'tosa', name: 'Banho + Tosa', price: 'R$ 80', duration: '2h', icon: Scissors, color: 'bg-blue-600', description: 'Banho completo + tosa estética' },
    { id: 'tosa-especial', name: 'Tosa Especializada', price: 'R$ 100', duration: '2h30', icon: Scissors, color: 'bg-indigo-500', description: 'Cortes personalizados' },
    { id: 'hotel', name: 'Hospedagem', price: 'R$ 60/dia', duration: '24h', icon: Home, color: 'bg-teal-500', description: 'Hospedagem com cuidados' },
  ];

  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleNext = () => {
    if (step === 1 && !formData.service) {
      toast.error('Selecione um serviço');
      return;
    }
    if (step === 2 && (!formData.petType || !formData.petName)) {
      toast.error('Preencha os dados do pet');
      return;
    }
    if (step === 3 && (!formData.date || !formData.time)) {
      toast.error('Selecione data e horário');
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setIsSuccess(false);
      setFormData({
        service: '',
        petType: '',
        petName: '',
        petBreed: '',
        date: '',
        time: '',
        ownerName: '',
        phone: '',
      });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!formData.ownerName || !formData.phone) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    const selectedService = services.find(s => s.id === formData.service);
    const petTypeLabel = formData.petType === 'dog' ? 'Cachorro 🐕' : 'Gato 🐱';
    
    const message = `Olá! 🐾 Gostaria de agendar um serviço para meu pet no *Mon Petit Aracruz*.

*Serviço desejado:* ${selectedService?.name}
*Valor:* ${selectedService?.price}

*Dados do pet:*
• Nome: ${formData.petName}
• Tipo: ${petTypeLabel}
• Raça: ${formData.petBreed || 'Não informada'}

*Data e horário desejado:*
📅 ${formatDate(formData.date)} às ${formData.time}

*Meus dados:*
👤 ${formData.ownerName}
📱 ${formData.phone}

Aguardo a confirmação! Obrigado(a)! 😊`;

    try {
      const petshopPhone = '5527997717391';
      const clientPhone = formData.phone;

      try {
        await sendPetshopWhatsAppWithRetry({
          phone: petshopPhone,
          message,
        });
        console.log('✅ Mensagem enviada via backend (Mon Petit)');
      } catch (e) {
        console.error('Erro ao enviar WhatsApp (Mon Petit):', e);
        openWhatsAppLink(petshopPhone, message);
      }

      const confirmationMessage = `✅ *Agendamento confirmado!*\n\nOlá, ${formData.ownerName}! Seu agendamento no *Mon Petit Aracruz* foi confirmado.\n\n• Serviço: ${selectedService?.name}\n• Pet: ${formData.petName} ${formData.petType === 'dog' ? '🐕' : '🐱'}\n• Data/Hora: ${formatDate(formData.date)} às ${formData.time}\n\n📍 Endereço: Cohab 2 - Aracruz, ES\n\nO banho e tosa mais cheiroso da cidade! 🐾`;

      try {
        await sendPetshopWhatsAppWithRetry({
          phone: clientPhone,
          message: confirmationMessage,
        });
        console.log('✅ Confirmação automática enviada para o cliente');
      } catch (e) {
        console.warn('Não foi possível enviar a confirmação automática para o cliente:', e);
        toast.message('Aviso: não consegui enviar a confirmação automática agora.');
      }

      saveMonAppointment({
        service: formData.service,
        serviceName: selectedService?.name || '',
        petName: formData.petName,
        petType: formData.petType,
        date: formData.date,
        time: formData.time,
        ownerName: formData.ownerName,
        phone: formData.phone,
      });

      setIsSuccess(true);
      toast.success('Agendamento confirmado!');
    } catch (err) {
      console.error('Erro:', err);
      openWhatsAppLink('5527997717391', message);
      
      saveMonAppointment({
        service: formData.service,
        serviceName: selectedService?.name || '',
        petName: formData.petName,
        petType: formData.petType,
        date: formData.date,
        time: formData.time,
        ownerName: formData.ownerName,
        phone: formData.phone,
      });
      
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl sm:m-4"
        >
          {/* Drag indicator for mobile */}
          <div className="sticky top-0 pt-3 pb-2 bg-gradient-to-r from-cyan-500 to-blue-500 sm:hidden z-10">
            <div className="w-12 h-1.5 bg-white/50 rounded-full mx-auto" />
          </div>

          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Agendamento Confirmado!</h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                Seu agendamento foi registrado. Você receberá a confirmação no seu WhatsApp em breve!
              </p>
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const service = services.find(s => s.id === formData.service);
                      const Icon = service?.icon || Scissors;
                      return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{services.find(s => s.id === formData.service)?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{formData.petName} • {formatDate(formData.date)} às {formData.time}</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleClose}
                className="w-full h-12 text-base font-semibold bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl"
              >
                Fechar
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 sm:p-5 text-white relative">
                <button 
                  onClick={handleClose} 
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Agendamento Online</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold">Agendar Serviço</h2>
                <p className="text-white/80 text-xs sm:text-sm">Passo {step} de 4 • {['Serviço', 'Pet', 'Data/Hora', 'Seus Dados'][step - 1]}</p>
                
                {/* Progress Bar */}
                <div className="flex gap-2 mt-3 sm:mt-4">
                  {[1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= step ? 'bg-white' : 'bg-white/30'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 overflow-y-auto max-h-[45vh] sm:max-h-[50vh] bg-white">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Qual serviço você precisa?</h3>
                      {services.map((service, index) => (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setFormData({ ...formData, service: service.id })}
                          className={`w-full p-3 sm:p-4 rounded-xl border-2 flex items-center gap-3 sm:gap-4 transition-all duration-200 ${
                            formData.service === service.id 
                              ? 'border-cyan-500 bg-cyan-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 ${service.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{service.name}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{service.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-cyan-600 text-sm sm:text-base">{service.price}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">{service.duration}</p>
                          </div>
                          {formData.service === service.id && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Conte-nos sobre seu pet</h3>
                      
                      <div className="flex gap-3 sm:gap-4">
                        {[
                          { id: 'dog', label: 'Cachorro', emoji: '🐕' },
                          { id: 'cat', label: 'Gato', emoji: '🐱' }
                        ].map((pet) => (
                          <button
                            key={pet.id}
                            onClick={() => setFormData({ ...formData, petType: pet.id })}
                            className={`flex-1 p-3 sm:p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                              formData.petType === pet.id 
                                ? 'border-cyan-500 bg-cyan-50' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <span className="text-3xl sm:text-4xl">{pet.emoji}</span>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">{pet.label}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium text-sm">Nome do pet *</Label>
                        <Input 
                          value={formData.petName} 
                          onChange={e => setFormData({...formData, petName: e.target.value})} 
                          placeholder="Ex: Thor, Luna, Max..." 
                          className="h-11 sm:h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium text-sm">Raça (opcional)</Label>
                        <Input 
                          value={formData.petBreed} 
                          onChange={e => setFormData({...formData, petBreed: e.target.value})} 
                          placeholder="Ex: Golden Retriever, Shih Tzu..." 
                          className="h-11 sm:h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Escolha data e horário</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-cyan-500" />
                          Data do agendamento
                        </Label>
                        <Input 
                          type="date" 
                          value={formData.date} 
                          onChange={e => setFormData({...formData, date: e.target.value})} 
                          min={getMinDate()} 
                          className="h-11 sm:h-12 rounded-xl border-gray-200 bg-white text-gray-900 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-cyan-500" />
                          Horário
                        </Label>
                        <div className="grid grid-cols-4 gap-2">
                          {times.map((time) => (
                            <button 
                              key={time} 
                              onClick={() => setFormData({...formData, time})} 
                              className={`p-2.5 sm:p-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                formData.time === time 
                                  ? 'border-cyan-500 bg-cyan-500 text-white' 
                                  : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Seus dados para contato</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-cyan-500" />
                          Seu nome completo
                        </Label>
                        <Input 
                          value={formData.ownerName} 
                          onChange={e => setFormData({...formData, ownerName: e.target.value})} 
                          placeholder="Digite seu nome" 
                          className="h-11 sm:h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-cyan-500" />
                          WhatsApp
                        </Label>
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          placeholder="(00) 00000-0000" 
                          className="h-11 sm:h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      {/* Summary */}
                      <div className="bg-cyan-50 rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm">Resumo do agendamento</h4>
                        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Serviço:</span>
                            <span className="font-medium text-gray-900">{services.find(s => s.id === formData.service)?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Pet:</span>
                            <span className="font-medium text-gray-900">{formData.petName} {formData.petType === 'dog' ? '🐕' : '🐱'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Data/Hora:</span>
                            <span className="font-medium text-gray-900">{formatDate(formData.date)} às {formData.time}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-cyan-200">
                            <span className="text-gray-500">Valor:</span>
                            <span className="font-bold text-cyan-600">{services.find(s => s.id === formData.service)?.price}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                {step > 1 && (
                  <Button
                    onClick={handlePrev}
                    variant="outline"
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold border-gray-300 text-gray-700 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                    Voltar
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Confirmar
                      </>
                    )}
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

export default MonSchedule;
