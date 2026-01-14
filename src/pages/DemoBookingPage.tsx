import { useState, useEffect, useCallback } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Info,
  Brush,
  Crown,
  Zap,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePhoneMask } from '@/hooks/usePhoneMask';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import type { TemplateConfig } from '@/components/affiliate/templates/types';

// Demo services data
const DEMO_SERVICES = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte moderno com acabamento profissional e máquina ou tesoura.',
    duration: 45,
    price: 45,
    icon: 'Scissors',
  },
  {
    id: '2',
    name: 'Barba Completa',
    description: 'Modelagem e aparagem de barba com navalha e toalha quente.',
    duration: 30,
    price: 35,
    icon: 'Brush',
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Combo completo de corte masculino e barba com desconto especial.',
    duration: 60,
    price: 70,
    icon: 'Crown',
  },
  {
    id: '4',
    name: 'Degradê Navalhado',
    description: 'Técnica de degradê com acabamento preciso na navalha.',
    duration: 50,
    price: 55,
    icon: 'Zap',
  },
  {
    id: '5',
    name: 'Platinado',
    description: 'Descoloração completa com tratamento e hidratação.',
    duration: 120,
    price: 150,
    icon: 'Sparkles',
  },
  {
    id: '6',
    name: 'Sobrancelha',
    description: 'Design e limpeza de sobrancelhas masculinas.',
    duration: 15,
    price: 20,
    icon: 'Palette',
  },
];

// Demo barbers data
const DEMO_BARBERS = [
  {
    id: '1',
    name: 'Carlos Silva',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    specialties: ['Corte Clássico', 'Barba'],
    experience: '10 anos',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Pedro Santos',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    specialties: ['Degradê', 'Platinado'],
    experience: '5 anos',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'André Costa',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    specialties: ['Corte Moderno', 'Design'],
    experience: '7 anos',
    rating: 4.7,
  },
];

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
}

interface Barber {
  id: string;
  name: string;
  photo: string;
  specialties: string[];
  experience: string;
  rating: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const steps = [
  { id: 1, title: 'Serviço', icon: Scissors },
  { id: 2, title: 'Profissional', icon: User },
  { id: 3, title: 'Data', icon: CalendarIcon },
  { id: 4, title: 'Horário', icon: Clock },
  { id: 5, title: 'Confirmar', icon: Check },
];

const iconMap: Record<string, any> = {
  Scissors,
  Brush,
  Crown,
  Zap,
  Palette,
  Sparkles,
};

export default function DemoBookingPage() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [configData, setConfigData] = useState<{ config: TemplateConfig; affiliateId: string } | null>(null);
  const [error, setError] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  
  const phoneMask = usePhoneMask();
  const isMobileOrTablet = useIsMobile();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch template config
  useEffect(() => {
    const fetchConfig = async () => {
      if (!code) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('affiliate_template_configs')
          .select('id, template_slug, template_name, config, affiliate_id')
          .eq('unique_code', code)
          .eq('is_active', true)
          .single();

        if (fetchError || !data) {
          setError(true);
          setLoading(false);
          return;
        }

        setConfigData({
          config: data.config as unknown as TemplateConfig,
          affiliateId: data.affiliate_id
        });
      } catch (err) {
        console.error('Erro:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [code]);

  // Generate demo time slots
  const generateDemoTimeSlots = useCallback((date: Date, serviceDuration: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 19;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Randomly make some slots unavailable for demo purposes
        const available = Math.random() > 0.3;
        slots.push({ time, available });
      }
    }
    
    return slots;
  }, []);

  // Update time slots when date/barber/service changes
  useEffect(() => {
    if (selectedDate && selectedBarber && selectedService) {
      const slots = generateDemoTimeSlots(selectedDate, selectedService.duration);
      setTimeSlots(slots);
      setSelectedTime(null);
    }
  }, [selectedDate, selectedBarber, selectedService, generateDemoTimeSlots]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedBarber !== null;
      case 3:
        return selectedDate !== null;
      case 4:
        return selectedTime !== null;
      case 5:
        return clientName.length > 2 && phoneMask.isValid;
      default:
        return false;
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    if (isLoading || !configData) return;

    setIsLoading(true);
    
    const config = configData.config;
    const businessName = config.business.name || 'Barbearia Demo';
    const formattedDate = formatDate(selectedDate);
    
    // Create confirmation message
    const confirmationMessage = `✅ *Agendamento Confirmado!*

Olá ${clientName}! Seu agendamento foi confirmado com sucesso.

📋 *Detalhes:*
• Serviço: ${selectedService.name}
• Profissional: ${selectedBarber.name}
• Data: ${formattedDate}
• Horário: ${selectedTime}
• Valor: R$ ${selectedService.price.toFixed(2).replace('.', ',')}

📍 *Local:* ${config.business.address || 'Endereço a confirmar'}

⏰ Chegue com 5 minutos de antecedência.

_Agendamento realizado via ${businessName}_`;

    // Send WhatsApp confirmation
    setSendingWhatsApp(true);
    try {
      const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-whatsapp-genesis', {
        body: {
          affiliateId: configData.affiliateId,
          phone: phoneMask.rawValue,
          message: confirmationMessage,
          countryCode: 'BR',
        },
      });

      if (sendError) {
        console.error('Erro ao enviar WhatsApp:', sendError);
        // Não mostra erro específico - agendamento confirmou mesmo sem WhatsApp
        toast.warning('Agendamento confirmado!', {
          description: 'Não foi possível enviar a confirmação via WhatsApp.'
        });
      } else if (sendResult?.success) {
        toast.success('Agendamento confirmado!', {
          description: 'Você receberá a confirmação no WhatsApp em instantes.'
        });
      } else {
        console.error('Erro no envio:', sendResult?.error);
        // Mostra apenas warning genérico, sem mencionar configuração do afiliado
        toast.warning('Agendamento confirmado!', {
          description: 'Não foi possível enviar a confirmação via WhatsApp.'
        });
      }
    } catch (err) {
      console.error('Erro ao chamar função:', err);
      toast.warning('Agendamento confirmado!', {
        description: 'Não foi possível enviar a confirmação via WhatsApp.'
      });
    } finally {
      setSendingWhatsApp(false);
    }
    
    setIsConfirmed(true);
    setIsLoading(false);
  };

  const nextStep = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5 && canProceed()) {
      handleConfirmBooking();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !configData) {
    return <Navigate to="/404" replace />;
  }

  const config = configData.config;
  const businessName = config.business.name || 'Barbearia Demo';

  // Confirmation screen
  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold">{businessName}</span>
            </div>
            <Link to={`/demo/${code}`}>
              <Button variant="outline" size="sm">
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </header>

        <div className="pt-24 pb-12 px-4">
          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-6 sm:p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>

              <h1 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h1>
              <p className="text-muted-foreground mb-8">
                Seu horário foi reservado com sucesso.
              </p>

              <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profissional</span>
                  <span className="font-medium">{selectedBarber?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{clientName}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 mt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">
                    R$ {selectedService?.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Este é um agendamento de demonstração</p>
                    <p className="text-muted-foreground">
                      Em um sistema real, você receberia confirmação por WhatsApp e email.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild variant="hero" size="lg" className="w-full">
                <Link to={`/demo/${code}`}>
                  Voltar ao Site
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Booking flow
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold">{businessName}</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">Agendamento Online</span>
        </div>
      </header>

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-2 rounded-full transition-colors ${
                      step.id <= currentStep ? 'bg-primary' : 'bg-secondary'
                    }`}
                  />
                  {index < steps.length - 1 && (
                    <div className="w-2 h-0.5 bg-secondary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-muted-foreground text-sm mb-6">
            Etapa {currentStep} de 5
          </p>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Escolha o serviço</h2>
                  <p className="text-muted-foreground text-sm mb-6">Selecione o serviço desejado</p>
                  
                  <div className="grid gap-3">
                    {DEMO_SERVICES.map((service) => {
                      const IconComponent = iconMap[service.icon] || Scissors;
                      return (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                            selectedService?.id === service.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-primary">
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-xs text-muted-foreground">{service.duration} min</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Barber Selection */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Escolha o profissional</h2>
                  <p className="text-muted-foreground text-sm mb-6">Selecione o barbeiro de sua preferência</p>
                  
                  <div className="grid gap-3">
                    {DEMO_BARBERS.map((barber) => (
                      <button
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                          selectedBarber?.id === barber.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={barber.photo}
                          alt={barber.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{barber.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {barber.specialties.join(' • ')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-amber-500">
                            <span className="text-sm">⭐</span>
                            <span className="font-medium">{barber.rating}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{barber.experience}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Date Selection */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Escolha a data</h2>
                  <p className="text-muted-foreground text-sm mb-6">Selecione o melhor dia para você</p>
                  
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="font-semibold capitalize">
                        {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                        <div key={day} className="py-2 text-muted-foreground font-medium">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map((date, index) => (
                        <button
                          key={index}
                          disabled={!isDateSelectable(date)}
                          onClick={() => date && setSelectedDate(date)}
                          className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                            !date
                              ? 'invisible'
                              : !isDateSelectable(date)
                              ? 'text-muted-foreground/30 cursor-not-allowed'
                              : selectedDate?.toDateString() === date.toDateString()
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-secondary'
                          }`}
                        >
                          {date?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <p className="mt-4 text-center text-sm text-primary">
                      Selecionado: {formatDate(selectedDate)}
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Time Selection */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Escolha o horário</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Horários disponíveis para {selectedDate && formatDate(selectedDate)}
                  </p>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                          !slot.available
                            ? 'bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
                            : selectedTime === slot.time
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>

                  {timeSlots.filter(s => s.available).length === 0 && (
                    <p className="text-center text-muted-foreground mt-4">
                      Nenhum horário disponível para esta data
                    </p>
                  )}
                </div>
              )}

              {/* Step 5: Confirmation */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-xl font-bold mb-2">Confirme seus dados</h2>
                  <p className="text-muted-foreground text-sm mb-6">Revise e preencha suas informações</p>
                  
                  {/* Summary */}
                  <div className="bg-secondary/30 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Serviço</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Profissional</span>
                      <span className="font-medium">{selectedBarber?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data</span>
                      <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Horário</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3 mt-3">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold text-primary">
                        R$ {selectedService?.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Seu nome</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Digite seu nome completo"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">WhatsApp</label>
                      <input
                        type="tel"
                        value={phoneMask.value}
                        onChange={(e) => phoneMask.onChange(e)}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            <Button
              variant="hero"
              onClick={nextStep}
              disabled={!canProceed() || isLoading || sendingWhatsApp}
              className="gap-2"
            >
              {isLoading || sendingWhatsApp ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {sendingWhatsApp ? 'Enviando...' : 'Confirmando...'}
                </>
              ) : currentStep === 5 ? (
                <>
                  Confirmar
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
