import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Calendar, Clock, User, Phone, Sparkles, Loader2, CheckCircle2, Scissors, Stethoscope, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveAppointment } from './PetshopMyAppointments';

interface PetshopScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

const PetshopSchedule = ({ isOpen, onClose }: PetshopScheduleProps) => {
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
    { id: 'banho', name: 'Banho Completo', price: 'R$ 60', duration: '1h', icon: Scissors, color: 'bg-blue-500', description: 'Banho, secagem e perfume' },
    { id: 'tosa', name: 'Banho + Tosa', price: 'R$ 90', duration: '2h', icon: Scissors, color: 'bg-purple-500', description: 'Banho completo + tosa estética' },
    { id: 'vet', name: 'Consulta Veterinária', price: 'R$ 150', duration: '30min', icon: Stethoscope, color: 'bg-green-500', description: 'Consulta com veterinário' },
    { id: 'hotel', name: 'Hotel/Creche', price: 'R$ 80/dia', duration: '24h', icon: Home, color: 'bg-amber-500', description: 'Hospedagem com cuidados' },
  ];

  const times = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

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

  // GPS fica disponível apenas em "Meus Agendamentos"

  const handleSubmit = async () => {
    if (!formData.ownerName || !formData.phone) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    const selectedService = services.find(s => s.id === formData.service);
    const petTypeLabel = formData.petType === 'dog' ? 'Cachorro 🐕' : 'Gato 🐱';
    
    // Mensagem como se fosse o CLIENTE enviando
    const message = `Olá! 🐾 Gostaria de agendar um serviço para meu pet.

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
      const petshopPhone = '5581998409073';
      const clientPhone = formData.phone;

      // 1) Envia o pedido de agendamento para o WhatsApp do Petshop (mensagem do CLIENTE)
      const { data, error } = await supabase.functions.invoke('send-petshop-whatsapp', {
        body: {
          phone: petshopPhone,
          message,
        },
      });

      console.log('[PetshopSchedule] Resposta (petshop):', data, error);

      if (error) {
        console.error('Erro ao enviar WhatsApp (petshop):', error);
        // Fallback para WhatsApp Web (petshop)
        window.open(`https://wa.me/${petshopPhone}?text=${encodeURIComponent(message)}`, '_blank');
      } else if (data?.success) {
        console.log('✅ Mensagem enviada via Genesis (petshop)');
      } else {
        window.open(`https://wa.me/${petshopPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }

      // 2) Envia confirmação automática para o número do cliente (mensagem do PETSHOP)
      const confirmationMessage = `✅ *Agendamento confirmado!*\n\nOlá, ${formData.ownerName}! Seu agendamento no *Seu Xodó Petshop* foi confirmado.\n\n• Serviço: ${selectedService?.name}\n• Pet: ${formData.petName} ${formData.petType === 'dog' ? '🐕' : '🐱'}\n• Data/Hora: ${formatDate(formData.date)} às ${formData.time}\n\n📍 Endereço: Estr. de Belém, 1273 - Campo Grande, Recife - PE\n\nSe precisar alterar ou cancelar, fale com a gente por aqui.`;

      try {
        const { data: confirmData, error: confirmError } = await supabase.functions.invoke('send-petshop-whatsapp', {
          body: {
            phone: clientPhone,
            message: confirmationMessage,
          },
        });

        console.log('[PetshopSchedule] Resposta (cliente):', confirmData, confirmError);

        if (confirmError || !confirmData?.success) {
          console.warn('Não foi possível enviar a confirmação automática para o cliente.');
        }
      } catch (e) {
        console.warn('Falha ao enviar confirmação automática para o cliente:', e);
      }

      // Salvar agendamento localmente
      saveAppointment({
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
      // Fallback para WhatsApp Web
      window.open(`https://wa.me/5581998409073?text=${encodeURIComponent(message)}`, '_blank');
      
      // Salvar mesmo assim
      saveAppointment({
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Success State */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Agendamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">
                Seu agendamento foi registrado. Você receberá a confirmação no seu WhatsApp em breve!
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-petshop-orange/20 rounded-xl flex items-center justify-center">
                    {(() => {
                      const service = services.find(s => s.id === formData.service);
                      const Icon = service?.icon || Scissors;
                      return <Icon className="w-6 h-6 text-petshop-orange" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{services.find(s => s.id === formData.service)?.name}</p>
                    <p className="text-sm text-gray-600">{formData.petName} • {formatDate(formData.date)} às {formData.time}</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleClose}
                className="w-full h-12 text-base font-semibold bg-petshop-orange hover:bg-petshop-orange/90 text-white rounded-xl"
              >
                Fechar
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-petshop-orange p-5 text-white relative">
                <button 
                  onClick={handleClose} 
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Agendamento Online</span>
                </div>
                <h2 className="text-xl font-bold">Agendar Serviço</h2>
                <p className="text-white/80 text-sm">Passo {step} de 4 • {['Serviço', 'Pet', 'Data/Hora', 'Seus Dados'][step - 1]}</p>
                
                {/* Progress Bar */}
                <div className="flex gap-2 mt-4">
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
              <div className="p-5 overflow-y-auto max-h-[50vh] bg-white">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <h3 className="font-bold text-gray-900 mb-4">Qual serviço você precisa?</h3>
                      {services.map((service, index) => (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setFormData({ ...formData, service: service.id })}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200 ${
                            formData.service === service.id 
                              ? 'border-petshop-orange bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center`}>
                            <service.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-petshop-orange">{service.price}</p>
                            <p className="text-xs text-gray-500">{service.duration}</p>
                          </div>
                          {formData.service === service.id && (
                            <div className="w-6 h-6 bg-petshop-orange rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
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
                      className="space-y-5"
                    >
                      <h3 className="font-bold text-gray-900 mb-4">Conte-nos sobre seu pet</h3>
                      
                      <div className="flex gap-4">
                        {[
                          { id: 'dog', label: 'Cachorro', emoji: '🐕' },
                          { id: 'cat', label: 'Gato', emoji: '🐱' }
                        ].map((pet) => (
                          <button
                            key={pet.id}
                            onClick={() => setFormData({ ...formData, petType: pet.id })}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 ${
                              formData.petType === pet.id 
                                ? 'border-petshop-orange bg-orange-50' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <span className="text-4xl">{pet.emoji}</span>
                            <span className="font-semibold text-gray-900">{pet.label}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium">Nome do pet *</Label>
                        <Input 
                          value={formData.petName} 
                          onChange={e => setFormData({...formData, petName: e.target.value})} 
                          placeholder="Ex: Thor, Luna, Max..." 
                          className="h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-petshop-orange focus:ring-petshop-orange"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium">Raça (opcional)</Label>
                        <Input 
                          value={formData.petBreed} 
                          onChange={e => setFormData({...formData, petBreed: e.target.value})} 
                          placeholder="Ex: Golden Retriever, Shih Tzu..." 
                          className="h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-petshop-orange focus:ring-petshop-orange"
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
                      className="space-y-5"
                    >
                      <h3 className="font-bold text-gray-900 mb-4">Escolha data e horário</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-petshop-orange" />
                          Data do agendamento
                        </Label>
                        <Input 
                          type="date" 
                          value={formData.date} 
                          onChange={e => setFormData({...formData, date: e.target.value})} 
                          min={getMinDate()} 
                          className="h-12 rounded-xl border-gray-200 bg-white text-gray-900 focus:border-petshop-orange focus:ring-petshop-orange"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-petshop-orange" />
                          Horário
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          {times.map((time) => (
                            <button 
                              key={time} 
                              onClick={() => setFormData({...formData, time})} 
                              className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                                formData.time === time 
                                  ? 'border-petshop-orange bg-petshop-orange text-white' 
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
                      className="space-y-5"
                    >
                      <h3 className="font-bold text-gray-900 mb-4">Seus dados para contato</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-petshop-orange" />
                          Seu nome completo
                        </Label>
                        <Input 
                          value={formData.ownerName} 
                          onChange={e => setFormData({...formData, ownerName: e.target.value})} 
                          placeholder="Digite seu nome" 
                          className="h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-petshop-orange focus:ring-petshop-orange"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-900 font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-petshop-orange" />
                          WhatsApp
                        </Label>
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          placeholder="(00) 00000-0000" 
                          className="h-12 rounded-xl border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-petshop-orange focus:ring-petshop-orange"
                        />
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 rounded-xl p-4 mt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Resumo do agendamento</h4>
                        <div className="space-y-2 text-sm">
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
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-500">Valor:</span>
                            <span className="font-bold text-petshop-orange">{services.find(s => s.id === formData.service)?.price}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                {step > 1 && (
                  <Button
                    onClick={handlePrev}
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold border-gray-300 text-gray-700 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Voltar
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-12 text-base font-semibold bg-petshop-orange hover:bg-petshop-orange/90 text-white rounded-xl"
                  >
                    Próximo
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Confirmar Agendamento
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

export default PetshopSchedule;
