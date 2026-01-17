import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Calendar, Clock, Dog, Cat, User, Phone, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    { id: 'banho', name: 'Banho Completo', price: 'R$ 60', duration: '1h', icon: '🛁', description: 'Banho, secagem e perfume' },
    { id: 'tosa', name: 'Banho + Tosa', price: 'R$ 90', duration: '2h', icon: '✂️', description: 'Banho completo + tosa estética' },
    { id: 'vet', name: 'Consulta Veterinária', price: 'R$ 150', duration: '30min', icon: '🩺', description: 'Consulta com veterinário' },
    { id: 'hotel', name: 'Hotel/Creche', price: 'R$ 80/dia', duration: '24h', icon: '🏠', description: 'Hospedagem com cuidados' },
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

  const handleSubmit = async () => {
    if (!formData.ownerName || !formData.phone) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsSubmitting(true);

    const selectedService = services.find(s => s.id === formData.service);
    const petTypeLabel = formData.petType === 'dog' ? 'Cachorro 🐕' : 'Gato 🐱';
    
    const message = `🐾 *Novo Agendamento - Seu Xodó Petshop*

Olá! Tenho um novo agendamento para confirmar:

📋 *Serviço:* ${selectedService?.name} ${selectedService?.icon}
💰 *Valor:* ${selectedService?.price}
⏱️ *Duração:* ${selectedService?.duration}

🐾 *Pet:* ${formData.petName}
🏷️ *Tipo:* ${petTypeLabel}
🔖 *Raça:* ${formData.petBreed || 'Não informada'}

📅 *Data:* ${formatDate(formData.date)}
⏰ *Horário:* ${formData.time}

👤 *Responsável:* ${formData.ownerName}
📱 *WhatsApp:* ${formData.phone}

_Aguardando confirmação do horário!_ ✨`;

    try {
      // Tentar enviar via Genesis WhatsApp
      const { data, error } = await supabase.functions.invoke('send-whatsapp-genesis', {
        body: {
          phone: formData.phone,
          message: message,
          countryCode: 'BR',
        },
      });

      if (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        // Fallback para WhatsApp Web
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
      } else if (data?.success) {
        console.log('Mensagem enviada via Genesis:', data);
      } else {
        // Fallback para WhatsApp Web
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
      }

      setIsSuccess(true);
      toast.success('Agendamento enviado com sucesso!');
    } catch (err) {
      console.error('Erro:', err);
      // Fallback para WhatsApp Web
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
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
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-petshop-dark mb-3">Agendamento Enviado!</h2>
              <p className="text-petshop-gray mb-8">
                Recebemos seu pedido de agendamento. Em breve você receberá a confirmação no seu WhatsApp!
              </p>
              <div className="bg-petshop-cream rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{services.find(s => s.id === formData.service)?.icon}</span>
                  <div>
                    <p className="font-semibold text-petshop-dark">{services.find(s => s.id === formData.service)?.name}</p>
                    <p className="text-sm text-petshop-gray">{formData.petName} • {formatDate(formData.date)} às {formData.time}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleClose}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-petshop-orange to-orange-500 hover:from-orange-500 hover:to-petshop-orange text-white rounded-2xl"
              >
                Fechar
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-petshop-orange to-orange-500 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <button 
                  onClick={handleClose} 
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium text-white/90">Agendamento Online</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Agendar Serviço</h2>
                  <p className="text-white/80 text-sm">Passo {step} de 4 • {['Serviço', 'Pet', 'Data/Hora', 'Seus Dados'][step - 1]}</p>
                  
                  {/* Progress Bar */}
                  <div className="flex gap-2 mt-5">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= step ? 'bg-white' : 'bg-white/30'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      <h3 className="font-bold text-lg text-petshop-dark mb-4">Qual serviço você precisa?</h3>
                      {services.map((service, index) => (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setFormData({ ...formData, service: service.id })}
                          className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 ${
                            formData.service === service.id 
                              ? 'border-petshop-orange bg-petshop-orange/5 shadow-lg shadow-petshop-orange/10' 
                              : 'border-gray-200 hover:border-petshop-orange/50 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-3xl">{service.icon}</span>
                          <div className="flex-1 text-left">
                            <p className="font-bold text-petshop-dark">{service.name}</p>
                            <p className="text-sm text-petshop-gray">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-petshop-orange">{service.price}</p>
                            <p className="text-xs text-petshop-gray">{service.duration}</p>
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
                      <h3 className="font-bold text-lg text-petshop-dark mb-4">Conte-nos sobre seu pet</h3>
                      
                      <div className="flex gap-4">
                        {[
                          { id: 'dog', icon: Dog, label: 'Cachorro', emoji: '🐕' },
                          { id: 'cat', icon: Cat, label: 'Gato', emoji: '🐱' }
                        ].map((pet) => (
                          <button
                            key={pet.id}
                            onClick={() => setFormData({ ...formData, petType: pet.id })}
                            className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
                              formData.petType === pet.id 
                                ? 'border-petshop-orange bg-petshop-orange/5 shadow-lg shadow-petshop-orange/10' 
                                : 'border-gray-200 hover:border-petshop-orange/50'
                            }`}
                          >
                            <span className="text-4xl">{pet.emoji}</span>
                            <span className="font-semibold text-petshop-dark">{pet.label}</span>
                            {formData.petType === pet.id && (
                              <div className="w-5 h-5 bg-petshop-orange rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-petshop-dark font-medium">Nome do pet *</Label>
                        <Input 
                          value={formData.petName} 
                          onChange={e => setFormData({...formData, petName: e.target.value})} 
                          placeholder="Ex: Thor, Luna, Max..." 
                          className="h-12 rounded-xl border-gray-200 focus:border-petshop-orange focus:ring-petshop-orange/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-petshop-dark font-medium">Raça (opcional)</Label>
                        <Input 
                          value={formData.petBreed} 
                          onChange={e => setFormData({...formData, petBreed: e.target.value})} 
                          placeholder="Ex: Golden Retriever, Shih Tzu..." 
                          className="h-12 rounded-xl border-gray-200 focus:border-petshop-orange focus:ring-petshop-orange/20"
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
                      <h3 className="font-bold text-lg text-petshop-dark mb-4">Escolha data e horário</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-petshop-dark font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-petshop-orange" />
                          Data do agendamento
                        </Label>
                        <Input 
                          type="date" 
                          value={formData.date} 
                          onChange={e => setFormData({...formData, date: e.target.value})} 
                          min={getMinDate()} 
                          className="h-12 rounded-xl border-gray-200 focus:border-petshop-orange focus:ring-petshop-orange/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-petshop-dark font-medium flex items-center gap-2">
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
                                  ? 'border-petshop-orange bg-petshop-orange text-white shadow-lg shadow-petshop-orange/30' 
                                  : 'border-gray-200 text-petshop-dark hover:border-petshop-orange/50'
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
                      <h3 className="font-bold text-lg text-petshop-dark mb-4">Seus dados para contato</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-petshop-dark font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-petshop-orange" />
                          Seu nome completo
                        </Label>
                        <Input 
                          value={formData.ownerName} 
                          onChange={e => setFormData({...formData, ownerName: e.target.value})} 
                          placeholder="Digite seu nome" 
                          className="h-12 rounded-xl border-gray-200 focus:border-petshop-orange focus:ring-petshop-orange/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-petshop-dark font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-petshop-orange" />
                          WhatsApp
                        </Label>
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          placeholder="(11) 99999-9999" 
                          className="h-12 rounded-xl border-gray-200 focus:border-petshop-orange focus:ring-petshop-orange/20"
                        />
                      </div>

                      {/* Summary */}
                      <div className="bg-gradient-to-r from-petshop-cream to-orange-50 rounded-2xl p-4 mt-6">
                        <p className="text-sm font-semibold text-petshop-dark mb-3">Resumo do agendamento:</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-petshop-gray">Serviço:</span>
                            <span className="font-medium text-petshop-dark">{services.find(s => s.id === formData.service)?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-petshop-gray">Pet:</span>
                            <span className="font-medium text-petshop-dark">{formData.petName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-petshop-gray">Data:</span>
                            <span className="font-medium text-petshop-dark">{formatDate(formData.date)} às {formData.time}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-petshop-orange/20 mt-2">
                            <span className="text-petshop-gray">Valor:</span>
                            <span className="font-bold text-petshop-orange text-lg">{services.find(s => s.id === formData.service)?.price}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex gap-3">
                  {step > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrev} 
                      className="flex-1 h-14 rounded-2xl border-2 border-gray-200 text-petshop-dark hover:bg-gray-100 font-semibold"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Voltar
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button 
                      onClick={handleNext} 
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-petshop-orange to-orange-500 hover:from-orange-500 hover:to-petshop-orange text-white font-semibold shadow-lg shadow-petshop-orange/30"
                    >
                      Próximo
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enviando...
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
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PetshopSchedule;
