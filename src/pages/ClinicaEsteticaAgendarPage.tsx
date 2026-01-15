import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const ClinicaEsteticaAgendarPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    procedimento: "",
    data: "",
    horario: "",
    nome: "",
    telefone: "",
    email: ""
  });

  const procedimentos = [
    { id: "harmonizacao", nome: "Harmonização Facial", duracao: "60 min" },
    { id: "bioestimuladores", nome: "Bioestimuladores", duracao: "45 min" },
    { id: "skincare", nome: "Skincare Avançado", duracao: "90 min" },
    { id: "corporal", nome: "Tratamentos Corporais", duracao: "60 min" },
    { id: "avaliacao", nome: "Avaliação Gratuita", duracao: "30 min" }
  ];

  const horarios = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return {
      day: date.getDate(),
      weekday: days[date.getDay()],
      month: months[date.getMonth()],
      full: date.toISOString().split('T')[0]
    };
  };

  const handleSubmit = () => {
    setStep(4);
  };

  const steps = [
    { num: 1, label: "Procedimento" },
    { num: 2, label: "Data e Hora" },
    { num: 3, label: "Seus Dados" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/clinica-estetica')}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm hidden sm:inline">Voltar</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base sm:text-lg font-semibold text-neutral-900">Estética Avançada</span>
            </div>

            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {step < 4 && (
        <div className="bg-white border-b border-neutral-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {steps.map((s, index) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className={`
                      w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all
                      ${step >= s.num 
                        ? 'bg-neutral-900 text-white' 
                        : 'bg-neutral-100 text-neutral-400'
                      }
                    `}>
                      {step > s.num ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.num}
                    </div>
                    <span className={`text-xs sm:text-sm hidden sm:inline ${step >= s.num ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-px mx-2 sm:mx-3 ${step > s.num ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <AnimatePresence mode="wait">
          {/* Step 1 - Procedimento */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-medium text-neutral-900 mb-2">Escolha o procedimento</h1>
                <p className="text-neutral-500 text-sm">Selecione o tratamento desejado</p>
              </div>

              <div className="grid gap-3">
                {procedimentos.map((proc) => (
                  <motion.button
                    key={proc.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setFormData({ ...formData, procedimento: proc.id })}
                    className={`
                      w-full p-4 sm:p-5 rounded-xl border text-left transition-all
                      ${formData.procedimento === proc.id 
                        ? 'border-neutral-900 bg-neutral-900 text-white' 
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium text-sm sm:text-base ${formData.procedimento === proc.id ? 'text-white' : 'text-neutral-900'}`}>
                          {proc.nome}
                        </p>
                        <p className={`text-xs sm:text-sm mt-0.5 ${formData.procedimento === proc.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          Duração: {proc.duracao}
                        </p>
                      </div>
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${formData.procedimento === proc.id 
                          ? 'border-white bg-white' 
                          : 'border-neutral-300'
                        }
                      `}>
                        {formData.procedimento === proc.id && (
                          <Check className="w-3 h-3 text-neutral-900" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 sm:mt-8">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.procedimento}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white h-11 sm:h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2 - Data e Hora */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-medium text-neutral-900 mb-2">Escolha a data e horário</h1>
                <p className="text-neutral-500 text-sm">Selecione o melhor momento para você</p>
              </div>

              {/* Datas */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-700">Data</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                  {generateDates().map((date) => {
                    const formatted = formatDate(date);
                    return (
                      <motion.button
                        key={formatted.full}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, data: formatted.full })}
                        className={`
                          flex-shrink-0 p-3 sm:p-4 rounded-xl border text-center min-w-[70px] sm:min-w-[80px] transition-all
                          ${formData.data === formatted.full 
                            ? 'border-neutral-900 bg-neutral-900 text-white' 
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }
                        `}
                      >
                        <p className={`text-[10px] sm:text-xs ${formData.data === formatted.full ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {formatted.weekday}
                        </p>
                        <p className={`text-lg sm:text-xl font-semibold ${formData.data === formatted.full ? 'text-white' : 'text-neutral-900'}`}>
                          {formatted.day}
                        </p>
                        <p className={`text-[10px] sm:text-xs ${formData.data === formatted.full ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {formatted.month}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Horários */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-700">Horário</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {horarios.map((hora) => (
                    <motion.button
                      key={hora}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, horario: hora })}
                      className={`
                        p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm font-medium transition-all
                        ${formData.horario === hora 
                          ? 'border-neutral-900 bg-neutral-900 text-white' 
                          : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                        }
                      `}
                    >
                      {hora}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-neutral-200 text-neutral-700 h-11 sm:h-12 rounded-xl text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.data || !formData.horario}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white h-11 sm:h-12 rounded-xl disabled:opacity-50 text-sm"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 - Dados Pessoais */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-medium text-neutral-900 mb-2">Seus dados</h1>
                <p className="text-neutral-500 text-sm">Preencha suas informações de contato</p>
              </div>

              <div className="space-y-4 bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                    <User className="w-4 h-4" />
                    Nome completo
                  </label>
                  <Input
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="h-11 sm:h-12 rounded-lg border-neutral-200 text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="h-11 sm:h-12 rounded-lg border-neutral-200 text-sm"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 sm:h-12 rounded-lg border-neutral-200 text-sm"
                  />
                </div>
              </div>

              {/* Resumo */}
              <div className="mt-6 p-4 bg-neutral-100 rounded-xl">
                <p className="text-xs text-neutral-500 mb-2">Resumo do agendamento</p>
                <p className="text-sm font-medium text-neutral-900">
                  {procedimentos.find(p => p.id === formData.procedimento)?.nome}
                </p>
                <p className="text-sm text-neutral-600">
                  {formData.data && new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {formData.horario}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-neutral-200 text-neutral-700 h-11 sm:h-12 rounded-xl text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.nome || !formData.telefone || !formData.email}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white h-11 sm:h-12 rounded-xl disabled:opacity-50 text-sm"
                >
                  Confirmar
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4 - Confirmação */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8 sm:py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-900 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-medium text-neutral-900 mb-3">
                Agendamento confirmado!
              </h1>
              <p className="text-neutral-500 mb-8 max-w-md mx-auto text-sm sm:text-base">
                Você receberá uma confirmação por WhatsApp em breve.
              </p>

              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200 max-w-sm mx-auto mb-8 text-left">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500">Procedimento</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {procedimentos.find(p => p.id === formData.procedimento)?.nome}
                    </p>
                  </div>
                  <div className="h-px bg-neutral-100"></div>
                  <div>
                    <p className="text-xs text-neutral-500">Data e Horário</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {formData.data && new Date(formData.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {formData.horario}
                    </p>
                  </div>
                  <div className="h-px bg-neutral-100"></div>
                  <div>
                    <p className="text-xs text-neutral-500">Cliente</p>
                    <p className="text-sm font-medium text-neutral-900">{formData.nome}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/clinica-estetica')}
                className="bg-neutral-900 hover:bg-neutral-800 text-white h-11 sm:h-12 px-8 rounded-xl text-sm"
              >
                Voltar ao início
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClinicaEsteticaAgendarPage;