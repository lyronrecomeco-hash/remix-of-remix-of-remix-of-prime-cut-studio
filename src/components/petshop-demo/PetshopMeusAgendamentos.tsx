import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  PawPrint,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatPhone } from "@/hooks/usePhoneMask";

interface Booking {
  code: string;
  service: string;
  date: string;
  time: string;
  ownerName: string;
  petName: string;
  whatsapp: string;
  notes?: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  createdAt: string;
}

const PetshopMeusAgendamentos = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setPhone(formatPhone(digits));
  };

  const handleSearch = () => {
    const rawPhone = phone.replace(/\D/g, '');
    
    if (rawPhone.length < 10) {
      toast.error("Digite um número de WhatsApp válido");
      return;
    }

    setIsSearching(true);
    
    // Busca no sessionStorage (modo demo)
    setTimeout(() => {
      const allBookings = JSON.parse(sessionStorage.getItem("petshop_bookings") || "[]") as Booking[];
      const userBookings = allBookings.filter(b => b.whatsapp === rawPhone);
      
      setBookings(userBookings);
      setHasSearched(true);
      setIsSearching(false);

      if (userBookings.length === 0) {
        toast.info("Nenhum agendamento encontrado para esse número");
      }
    }, 500);
  };

  const getStatusBadge = (booking: Booking) => {
    const date = parseISO(booking.date);
    const isBookingPast = isPast(date);

    if (booking.status === "cancelled") {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
          Cancelado
        </span>
      );
    }

    if (isBookingPast) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
          Realizado
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs rounded-full bg-[#7DD3C0]/20 text-[#5BB5A5]">
        Confirmado
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#7DD3C0]/20">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/petshop-demo")} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800">Meus Agendamentos</h1>
            <p className="text-xs text-gray-500">Acompanhe seus serviços</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#7DD3C0]/10 flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-[#7DD3C0]" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Search Section */}
        <Card className="mb-8 border-[#7DD3C0]/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#7DD3C0]/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#7DD3C0]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Buscar agendamentos</h2>
                <p className="text-xs text-gray-500">Digite seu WhatsApp para ver seus agendamentos</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="border-[#7DD3C0]/30 focus:border-[#7DD3C0]"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white"
              >
                {isSearching ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-400 mb-6">
                  Não encontramos agendamentos para esse número
                </p>
                <Button
                  onClick={() => navigate("/petshop-demo/agendar")}
                  className="bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white"
                >
                  Fazer Primeiro Agendamento 🐾
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#7DD3C0]" />
                  Seus Agendamentos ({bookings.length})
                </h3>

                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-[#7DD3C0]/20 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Date Badge */}
                          <div className="w-20 bg-[#7DD3C0]/10 flex flex-col items-center justify-center p-3">
                            <span className="text-2xl font-bold text-[#7DD3C0]">
                              {format(parseISO(booking.date), "dd")}
                            </span>
                            <span className="text-xs text-gray-500 uppercase">
                              {format(parseISO(booking.date), "MMM", { locale: ptBR })}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-800">{booking.service}</h4>
                                <p className="text-sm text-[#7DD3C0]">{booking.petName} 🐾</p>
                              </div>
                              {getStatusBadge(booking)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {booking.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {booking.code}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <div className="pt-4">
                  <Button
                    onClick={() => navigate("/petshop-demo/agendar")}
                    className="w-full bg-[#7DD3C0] hover:bg-[#5BB5A5] text-white"
                  >
                    Novo Agendamento 🐾
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-[#7DD3C0]/10 flex items-center justify-center mx-auto mb-6">
              <PawPrint className="w-12 h-12 text-[#7DD3C0]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Consulte seus agendamentos
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Digite seu número de WhatsApp acima para visualizar todos os seus agendamentos 💙
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetshopMeusAgendamentos;
