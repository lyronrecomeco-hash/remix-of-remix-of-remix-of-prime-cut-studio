import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isSameDay, isAfter, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Check, 
  PawPrint,
  Scissors,
  Droplets,
  Heart,
  Sparkles,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/hooks/usePhoneMask";

const SERVICES = [
  { id: "banho-tosa", name: "Banho e Tosa Completa", duration: "1h30", price: "R$ 60", icon: Scissors },
  { id: "tosa-higienica", name: "Tosa Higiênica", duration: "30min", price: "R$ 35", icon: Sparkles },
  { id: "banho-medicinal", name: "Banho Medicinal", duration: "1h", price: "R$ 80", icon: Heart },
  { id: "hidratacao", name: "Hidratação de Pelos", duration: "45min", price: "R$ 50", icon: Droplets },
  { id: "unhas", name: "Corte de Unhas", duration: "15min", price: "R$ 20", icon: Scissors },
  { id: "ouvidos", name: "Limpeza de Ouvidos", duration: "20min", price: "R$ 25", icon: Sparkles },
];

// Horários disponíveis
const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

// Simula horários ocupados (demo)
const getOccupiedSlots = (date: Date): string[] => {
  const day = date.getDay();
  if (day === 0) return TIME_SLOTS; // Domingo fechado
  if (day === 6) return TIME_SLOTS.slice(12); // Sábado apenas manhã
  
  // Simula alguns horários ocupados
  const seed = date.getDate();
  return TIME_SLOTS.filter((_, i) => (i + seed) % 4 === 0);
};

type Step = "service" | "date" | "time" | "form" | "success";

interface FormData {
  ownerName: string;
  petName: string;
  whatsapp: string;
  notes: string;
}

const PetshopAgendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialServiceId = location.state?.serviceId;

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<string | null>(initialServiceId || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ownerName: "",
    petName: "",
    whatsapp: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  // Gera próximos 14 dias
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))
    .filter(d => d.getDay() !== 0); // Remove domingos

  // Horários disponíveis para a data selecionada
  const occupiedSlots = selectedDate ? getOccupiedSlots(selectedDate) : [];
  const availableSlots = TIME_SLOTS.filter(slot => !occupiedSlots.includes(slot));

  // Verifica se o horário já passou
  const isSlotPast = (slot: string) => {
    if (!selectedDate) return false;
    const [hours, minutes] = slot.split(":").map(Number);
    const slotDate = setMinutes(setHours(selectedDate, hours), minutes);
    return !isAfter(slotDate, new Date());
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep("date");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, whatsapp: formatPhone(digits) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ownerName || !formData.petName || !formData.whatsapp) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const rawPhone = formData.whatsapp.replace(/\D/g, '');
    if (rawPhone.length < 10) {
      toast.error("WhatsApp inválido");
      return;
    }

    setIsSubmitting(true);

    try {
      const service = SERVICES.find(s => s.id === selectedService);
      const code = `XODO${Date.now().toString(36).toUpperCase()}`;
      
      // Salva no sessionStorage (modo demo - não persiste no banco)
      const booking = {
        code,
        service: service?.name,
        date: selectedDate?.toISOString(),
        time: selectedTime,
        ownerName: formData.ownerName,
        petName: formData.petName,
        whatsapp: rawPhone,
        notes: formData.notes,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      // Salva localmente
      const existingBookings = JSON.parse(sessionStorage.getItem("petshop_bookings") || "[]");
      existingBookings.push(booking);
      sessionStorage.setItem("petshop_bookings", JSON.stringify(existingBookings));

      // Envia mensagem de confirmação via Genesis
      const message = `🐶✨ *Agendamento confirmado!*

Olá, *${formData.ownerName}*!

Seu pet *${formData.petName}* foi agendado com sucesso no *Seu Xodó Pet Shop*.

📋 *Serviço:* ${service?.name}
📅 *Data:* ${selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ""}
⏰ *Horário:* ${selectedTime}
🎫 *Código:* ${code}

💙 Caso o horário fique indisponível por algum motivo, nossa equipe entrará em contato.

Qualquer dúvida é só responder por aqui! 🐾`;

      // Tenta enviar via Genesis (silencioso - modo demo)
      try {
        await supabase.functions.invoke("send-whatsapp-genesis", {
          body: {
            phone: `55${rawPhone}`,
            message,
          },
        });
      } catch (err) {
        console.log("[DEMO] WhatsApp send attempted:", err);
      }

      setBookingCode(code);
      setStep("success");
      toast.success("Agendamento confirmado! 🐾");

    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Erro ao agendar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === "date") setStep("service");
    else if (step === "time") setStep("date");
    else if (step === "form") setStep("time");
    else navigate("/petshop-demo");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#7DD3C0]/20">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">Agendar Serviço</h1>
            <p className="text-xs text-gray-500">
              {step === "service" && "Escolha o serviço"}
              {step === "date" && "Escolha a data"}
              {step === "time" && "Escolha o horário"}
              {step === "form" && "Seus dados"}
              {step === "success" && "Confirmado!"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#7DD3C0]/10 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-[#7DD3C0]" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex">
          {["service", "date", "time", "form"].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 ${
                (step === "success" || 
                  (step === "form" && i <= 3) ||
                  (step === "time" && i <= 2) ||
                  (step === "date" && i <= 1) ||
                  (step === "service" && i === 0))
                  ? "bg-[#7DD3C0]"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step: Service */}
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Qual serviço você deseja? 🐾
              </h2>
              <div className="grid gap-3">
                {SERVICES.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all ${
                      selectedService === service.id
                        ? "border-[#7DD3C0] bg-[#F0FDF9]"
                        : "border-gray-200 hover:border-[#7DD3C0]/50"
                    }`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#7DD3C0]/10 flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-[#7DD3C0]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{service.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {service.duration}
                          </span>
                          <span className="text-[#7DD3C0] font-medium">{service.price}</span>
                        </div>
                      </div>
                      {selectedService === service.id && (
                        <Check className="w-5 h-5 text-[#7DD3C0]" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Date */}
          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Qual dia fica melhor? 📅
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Serviço: {SERVICES.find(s => s.id === selectedService)?.name}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableDates.map((date) => (
                  <Card
                    key={date.toISOString()}
                    className={`cursor-pointer transition-all text-center ${
                      selectedDate && isSameDay(selectedDate, date)
                        ? "border-[#7DD3C0] bg-[#F0FDF9]"
                        : "border-gray-200 hover:border-[#7DD3C0]/50"
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <CardContent className="p-3">
                      <p className="text-xs text-gray-500 uppercase">
                        {format(date, "EEE", { locale: ptBR })}
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {format(date, "dd")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(date, "MMM", { locale: ptBR })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Time */}
          {step === "time" && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Qual horário? ⏰
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>

              {availableSlots.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Sem horários disponíveis nesta data</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setStep("date")}
                  >
                    Escolher outra data
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isOccupied = occupiedSlots.includes(slot);
                    const isPast = isSlotPast(slot);
                    const isDisabled = isOccupied || isPast;

                    return (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        disabled={isDisabled}
                        onClick={() => handleTimeSelect(slot)}
                        className={`${
                          selectedTime === slot
                            ? "bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white"
                            : isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:border-[#7DD3C0] hover:text-[#7DD3C0]"
                        }`}
                      >
                        {slot}
                      </Button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Form */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Quase lá! 🐾
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {SERVICES.find(s => s.id === selectedService)?.name} • {" "}
                {selectedDate && format(selectedDate, "dd/MM")} às {selectedTime}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ownerName">Seu nome *</Label>
                  <Input
                    id="ownerName"
                    placeholder="Como podemos te chamar?"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="petName">Nome do pet *</Label>
                  <Input
                    id="petName"
                    placeholder="Qual o nome do seu xodó?"
                    value={formData.petName}
                    onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enviaremos a confirmação por aqui 💬
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma informação importante sobre seu pet?"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white py-6 rounded-xl text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirmar Agendamento ✨"
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-[#7DD3C0]/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-[#7DD3C0]" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Agendamento Confirmado! 🎉
              </h2>
              <p className="text-gray-500 mb-6">
                Enviamos os detalhes para seu WhatsApp
              </p>

              <Card className="bg-[#F0FDF9] border-[#7DD3C0]/20 mb-6">
                <CardContent className="p-5 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Serviço:</span>
                      <span className="font-medium text-gray-800">
                        {SERVICES.find(s => s.id === selectedService)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Data:</span>
                      <span className="font-medium text-gray-800">
                        {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Horário:</span>
                      <span className="font-medium text-gray-800">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pet:</span>
                      <span className="font-medium text-gray-800">{formData.petName}</span>
                    </div>
                    <div className="pt-2 border-t border-[#7DD3C0]/20">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Código:</span>
                        <span className="font-bold text-[#7DD3C0]">{bookingCode}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/petshop-demo/meus-agendamentos")}
                  className="w-full bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white"
                >
                  Ver Meus Agendamentos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/petshop-demo")}
                  className="w-full"
                >
                  Voltar ao Início
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PetshopAgendar;
