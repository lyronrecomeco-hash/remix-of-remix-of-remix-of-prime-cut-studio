import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
        <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">
          Cancelado
        </span>
      );
    }

    if (isBookingPast) {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
          Realizado ✓
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 font-medium">
        Confirmado
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/30 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-rose-100/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate("/petshop-demo")} 
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-800 text-lg">Meus Agendamentos</h1>
            <p className="text-xs text-gray-500">Acompanhe seus serviços</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
            <span className="text-lg">🐾</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Search Section */}
        <Card className="mb-8 border-0 shadow-lg shadow-rose-100/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Buscar agendamentos</h2>
                  <p className="text-sm text-white/80">Digite seu WhatsApp</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex gap-3">
                <Input
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 h-12 rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="h-12 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
                >
                  {isSearching ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </Button>
              </div>
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
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Não encontramos agendamentos para esse número de WhatsApp
                </p>
                <Button
                  onClick={() => navigate("/petshop-demo/agendar")}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8"
                >
                  Fazer Primeiro Agendamento
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    Seus Agendamentos
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {bookings.length} {bookings.length === 1 ? "agendamento" : "agendamentos"}
                  </span>
                </div>

                {bookings.map((booking, index) => (
                  <motion.div
                    key={booking.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg shadow-gray-100 overflow-hidden hover:shadow-rose-100 transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Date Badge */}
                          <div className="w-24 bg-gradient-to-br from-rose-500 to-pink-500 flex flex-col items-center justify-center p-4 text-white">
                            <span className="text-3xl font-bold">
                              {format(parseISO(booking.date), "dd")}
                            </span>
                            <span className="text-xs uppercase font-medium opacity-80">
                              {format(parseISO(booking.date), "MMM", { locale: ptBR })}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800">{booking.service}</h4>
                                <p className="text-sm text-rose-500 font-medium">{booking.petName} 🐾</p>
                              </div>
                              {getStatusBadge(booking)}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-gray-400" /> {booking.time}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-gray-400" /> 
                                <span className="font-mono text-xs">{booking.code}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                <div className="pt-6">
                  <Button
                    onClick={() => navigate("/petshop-demo/agendar")}
                    className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-semibold"
                  >
                    Novo Agendamento
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🐾</span>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">
              Consulte seus agendamentos
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
              Digite seu número de WhatsApp acima para visualizar todos os seus agendamentos 💕
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetshopMeusAgendamentos;
