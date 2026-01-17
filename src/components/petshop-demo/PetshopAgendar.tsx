import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isSameDay, isAfter, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Check, 
  Scissors,
  Droplets,
  Heart,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight
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
  { id: "banho-tosa", name: "Banho e Tosa Completa", duration: "1h30", price: "R$ 60", icon: Scissors, color: "from-rose-400 to-pink-500" },
  { id: "tosa-higienica", name: "Tosa Higiênica", duration: "30min", price: "R$ 35", icon: Sparkles, color: "from-violet-400 to-purple-500" },
  { id: "banho-medicinal", name: "Banho Medicinal", duration: "1h", price: "R$ 80", icon: Heart, color: "from-amber-400 to-orange-500" },
  { id: "hidratacao", name: "Spa & Hidratação", duration: "45min", price: "R$ 50", icon: Droplets, color: "from-cyan-400 to-teal-500" },
  { id: "unhas", name: "Corte de Unhas", duration: "15min", price: "R$ 20", icon: Scissors, color: "from-emerald-400 to-green-500" },
  { id: "ouvidos", name: "Limpeza de Ouvidos", duration: "20min", price: "R$ 25", icon: Sparkles, color: "from-blue-400 to-indigo-500" },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

const getOccupiedSlots = (date: Date): string[] => {
  const day = date.getDay();
  if (day === 0) return TIME_SLOTS;
  if (day === 6) return TIME_SLOTS.slice(12);
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

  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1))
    .filter(d => d.getDay() !== 0);

  const occupiedSlots = selectedDate ? getOccupiedSlots(selectedDate) : [];

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

      const existingBookings = JSON.parse(sessionStorage.getItem("petshop_bookings") || "[]");
      existingBookings.push(booking);
      sessionStorage.setItem("petshop_bookings", JSON.stringify(existingBookings));

      const message = `🐶✨ *Agendamento confirmado!*

Olá, *${formData.ownerName}*!

Seu pet *${formData.petName}* foi agendado com sucesso no *Seu Xodó Pet Shop*.

📋 *Serviço:* ${service?.name}
📅 *Data:* ${selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ""}
⏰ *Horário:* ${selectedTime}
🎫 *Código:* ${code}

💕 Caso o horário fique indisponível por algum motivo, nossa equipe entrará em contato.

Qualquer dúvida é só responder por aqui! 🐾`;

      try {
        await supabase.functions.invoke("send-whatsapp-genesis", {
          body: { phone: `55${rawPhone}`, message },
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

  const getStepNumber = () => {
    const steps = ["service", "date", "time", "form"];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/30 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-rose-100/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={goBack} 
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800 text-lg">Agendar Serviço</h1>
            <p className="text-xs text-gray-500">
              {step === "service" && "Passo 1 de 4 — Escolha o serviço"}
              {step === "date" && "Passo 2 de 4 — Escolha a data"}
              {step === "time" && "Passo 3 de 4 — Escolha o horário"}
              {step === "form" && "Passo 4 de 4 — Seus dados"}
              {step === "success" && "Agendamento confirmado!"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
            <span className="text-lg">🐾</span>
          </div>
        </div>

        {/* Progress Bar */}
        {step !== "success" && (
          <div className="h-1 bg-gray-100 flex">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 transition-colors ${
                  s <= getStepNumber()
                    ? "bg-gradient-to-r from-rose-500 to-pink-500"
                    : ""
                }`}
              />
            ))}
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step: Service */}
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Qual serviço você deseja?
              </h2>
              <p className="text-gray-500 mb-8">Escolha o serviço ideal para seu pet 💕</p>
              
              <div className="grid gap-4">
                {SERVICES.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all border-0 shadow-md hover:shadow-lg overflow-hidden ${
                      selectedService === service.id
                        ? "ring-2 ring-rose-500 shadow-rose-100"
                        : "hover:shadow-rose-100"
                    }`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className={`w-1.5 bg-gradient-to-b ${service.color}`} />
                        <div className="flex-1 p-5 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg`}>
                            <service.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{service.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {service.duration}
                              </span>
                              <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                                {service.price}
                              </span>
                            </div>
                          </div>
                          {selectedService === service.id ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <ArrowRight className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Qual dia fica melhor?
              </h2>
              <p className="text-gray-500 mb-8">
                Serviço: <span className="font-medium text-rose-500">{SERVICES.find(s => s.id === selectedService)?.name}</span>
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableDates.map((date) => {
                  const isSelected = selectedDate && isSameDay(selectedDate, date);
                  return (
                    <Card
                      key={date.toISOString()}
                      className={`cursor-pointer transition-all text-center border-0 shadow-md hover:shadow-lg ${
                        isSelected
                          ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-rose-200"
                          : "bg-white hover:shadow-rose-100"
                      }`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <CardContent className="p-4">
                        <p className={`text-xs uppercase font-medium ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                          {format(date, "EEE", { locale: ptBR })}
                        </p>
                        <p className={`text-3xl font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>
                          {format(date, "dd")}
                        </p>
                        <p className={`text-xs ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                          {format(date, "MMM", { locale: ptBR })}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Qual horário?
              </h2>
              <p className="text-gray-500 mb-8">
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>

              {TIME_SLOTS.filter(slot => !occupiedSlots.includes(slot) && !isSlotPast(slot)).length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Sem horários disponíveis nesta data</p>
                  <Button variant="outline" onClick={() => setStep("date")} className="rounded-full">
                    Escolher outra data
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isOccupied = occupiedSlots.includes(slot);
                    const isPast = isSlotPast(slot);
                    const isDisabled = isOccupied || isPast;
                    const isSelected = selectedTime === slot;

                    return (
                      <Button
                        key={slot}
                        disabled={isDisabled}
                        onClick={() => handleTimeSelect(slot)}
                        className={`h-14 rounded-xl font-semibold transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                            : isDisabled
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-rose-300 hover:text-rose-600 shadow-sm"
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Quase lá! ✨
              </h2>
              <p className="text-gray-500 mb-8">
                {SERVICES.find(s => s.id === selectedService)?.name} • {" "}
                {selectedDate && format(selectedDate, "dd/MM")} às {selectedTime}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="ownerName" className="text-gray-700 font-medium">Seu nome *</Label>
                  <Input
                    id="ownerName"
                    placeholder="Como podemos te chamar?"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="mt-2 h-12 rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="petName" className="text-gray-700 font-medium">Nome do pet *</Label>
                  <Input
                    id="petName"
                    placeholder="Qual o nome do seu xodó?"
                    value={formData.petName}
                    onChange={(e) => setFormData(prev => ({ ...prev, petName: e.target.value }))}
                    className="mt-2 h-12 rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-gray-700 font-medium">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    className="mt-2 h-12 rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    📱 Enviaremos a confirmação por aqui
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-gray-700 font-medium">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma informação importante sobre seu pet?"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-2 rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-lg font-semibold shadow-lg shadow-rose-200"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Confirmar Agendamento
                      <Sparkles className="w-5 h-5 ml-2" />
                    </>
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
                className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-rose-300"
              >
                <CheckCircle2 className="w-14 h-14 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Agendamento Confirmado! 🎉
              </h2>
              <p className="text-gray-500 mb-8">
                Enviamos os detalhes para seu WhatsApp
              </p>

              <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-0 shadow-lg mb-8">
                <CardContent className="p-6 text-left">
                  <div className="space-y-3">
                    {[
                      { label: "Serviço", value: SERVICES.find(s => s.id === selectedService)?.name },
                      { label: "Data", value: selectedDate && format(selectedDate, "dd/MM/yyyy") },
                      { label: "Horário", value: selectedTime },
                      { label: "Pet", value: formData.petName },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-500">{item.label}:</span>
                        <span className="font-semibold text-gray-800">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-rose-200/50">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Código:</span>
                        <span className="font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent text-lg">
                          {bookingCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/petshop-demo/meus-agendamentos")}
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-semibold"
                >
                  Ver Meus Agendamentos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/petshop-demo")}
                  className="w-full h-12 rounded-xl border-gray-200"
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
