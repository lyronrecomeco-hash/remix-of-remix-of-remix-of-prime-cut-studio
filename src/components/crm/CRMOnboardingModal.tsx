import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Briefcase, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCRM } from '@/contexts/CRMContext';

const segments = [
  { id: 'vendas', label: 'Vendas B2B', icon: '💼' },
  { id: 'servicos', label: 'Serviços', icon: '🛠️' },
  { id: 'consultoria', label: 'Consultoria', icon: '📊' },
  { id: 'tecnologia', label: 'Tecnologia', icon: '💻' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'educacao', label: 'Educação', icon: '📚' },
  { id: 'saude', label: 'Saúde', icon: '🏥' },
  { id: 'imobiliario', label: 'Imobiliário', icon: '🏠' },
  { id: 'financeiro', label: 'Financeiro', icon: '💰' },
  { id: 'outro', label: 'Outro', icon: '🔮' },
];

export default function CRMOnboardingModal() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { completeOnboarding, crmUser } = useCRM();

  const handleComplete = async () => {
    if (!companyName.trim() || !selectedSegment) return;

    setIsSubmitting(true);
    const success = await completeOnboarding(companyName.trim(), selectedSegment);
    setIsSubmitting(false);

    if (!success) {
      // Error is handled in context
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/95 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: step === 0 ? '33%' : step === 1 ? '66%' : '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Bem-vindo ao CRM, {crmUser?.name?.split(' ')[0]}!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Vamos configurar seu ambiente de trabalho em poucos passos.
                  Isso levará menos de 1 minuto.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Começar configuração
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 1: Company Name */}
            {step === 1 && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-center mb-2">
                  Qual o nome da sua empresa?
                </h2>
                <p className="text-muted-foreground text-center text-sm mb-6">
                  Este nome será exibido no seu painel CRM
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da empresa</Label>
                    <Input
                      id="companyName"
                      placeholder="Ex: Minha Empresa Ltda"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-center text-lg h-12"
                      autoFocus
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!companyName.trim()}
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Segment */}
            {step === 2 && (
              <motion.div
                key="segment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-center mb-2">
                  Qual seu segmento de atuação?
                </h2>
                <p className="text-muted-foreground text-center text-sm mb-6">
                  Isso nos ajuda a personalizar sua experiência
                </p>

                <div className="grid grid-cols-2 gap-2 mb-6 max-h-64 overflow-y-auto">
                  {segments.map((segment) => (
                    <button
                      key={segment.id}
                      onClick={() => setSelectedSegment(segment.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedSegment === segment.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{segment.icon}</span>
                        <span className="text-sm font-medium">{segment.label}</span>
                        {selectedSegment === segment.id && (
                          <Check className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleComplete}
                  disabled={!selectedSegment || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Configurando...
                    </div>
                  ) : (
                    <>
                      Concluir configuração
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
