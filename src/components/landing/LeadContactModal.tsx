import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const leadSchema = z.object({
  firstName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  lastName: z.string().trim().min(2, 'Sobrenome deve ter pelo menos 2 caracteres').max(50),
  whatsapp: z.string().trim().min(10, 'WhatsApp inválido').max(20),
  email: z.string().trim().email('Email inválido').max(100),
  message: z.string().trim().max(500).optional()
});

interface LeadContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType: 'premium' | 'vitalicio';
}

const LeadContactModal = ({ isOpen, onClose, planType }: LeadContactModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    whatsapp: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = leadSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert lead
      const { error: insertError } = await supabase
        .from('contact_leads')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          whatsapp: formData.whatsapp.replace(/\D/g, ''),
          message: formData.message.trim() || null,
          plan_interest: planType
        });

      if (insertError) throw insertError;

      // Trigger automated notifications
      try {
        await supabase.functions.invoke('send-lead-notification', {
          body: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            whatsapp: formData.whatsapp.replace(/\D/g, ''),
            planType
          }
        });
      } catch (notifError) {
        console.error('Notification error:', notifError);
        // Don't fail the form if notification fails
      }

      setIsSuccess(true);
      toast.success('Mensagem enviada com sucesso!');

      // Reset after 3s
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ firstName: '', lastName: '', whatsapp: '', email: '', message: '' });
        onClose();
      }, 3000);

    } catch (error: any) {
      console.error('Lead submission error:', error);
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const planLabels = {
    premium: 'Premium',
    vitalicio: 'Vitalício'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header gradient */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Mensagem Enviada!</h3>
                <p className="text-muted-foreground">
                  Em breve nossa equipe entrará em contato para apresentar o plano {planLabels[planType]}.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Verifique seu email e WhatsApp 📱
                </p>
              </motion.div>
            ) : (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1">
                    Interesse no Plano {planLabels[planType]}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Preencha seus dados e nossa equipe entrará em contato rapidamente.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Nome
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Seu nome"
                        className={errors.firstName ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-destructive">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Seu sobrenome"
                        className={errors.lastName ? 'border-destructive' : ''}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleWhatsAppChange}
                      placeholder="(00) 00000-0000"
                      className={errors.whatsapp ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.whatsapp && (
                      <p className="text-xs text-destructive">{errors.whatsapp}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className={errors.email ? 'border-destructive' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Mensagem <span className="text-xs text-muted-foreground">(opcional)</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Conte um pouco sobre sua barbearia ou tire suas dúvidas..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Seus dados estão seguros e não serão compartilhados.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadContactModal;
