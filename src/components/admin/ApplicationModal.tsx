import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Instagram,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface PartnerApplication {
  id: string;
  full_name: string;
  email: string;
  age: number;
  whatsapp: string;
  instagram: string | null;
  tiktok: string | null;
  status: ApplicationStatus;
  created_at: string;
  processed_at: string | null;
  notes: string | null;
}

interface ApplicationModalProps {
  application: PartnerApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export const ApplicationModal = ({ application, isOpen, onClose, onStatusUpdate }: ApplicationModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!application) return null;

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setGeneratedCredentials(null);

    try {
      const password = generateRandomPassword();

      // 1. Create auth user via edge function
      const { data: createResult, error: createError } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: application.email,
          password,
          name: application.full_name,
          role: 'barber', // Using barber role as basic user access
          skipAdminCheck: true, // Special flag to allow partner creation
        }
      });

      if (createError || createResult?.error) {
        throw new Error(createResult?.error || createError?.message || 'Erro ao criar usuário');
      }

      // 2. Create genesis_users entry for dashboard access
      const { error: genesisError } = await supabase
        .from('genesis_users')
        .insert({
          auth_user_id: createResult.userId,
          name: application.full_name,
          email: application.email,
          is_active: true,
          user_type: 'parceiro'
        });

      if (genesisError && !genesisError.message.includes('duplicate')) {
        console.error('Error creating genesis_users entry:', genesisError);
      }

      // 3. Update application status
      const { error: updateError } = await supabase
        .from('partner_applications')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      setGeneratedCredentials({ email: application.email, password });
      toast.success('Parceiro aprovado com sucesso!');
      onStatusUpdate();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Erro ao aprovar inscrição');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (error) throw error;

      toast.success('Inscrição rejeitada');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error('Erro ao rejeitar inscrição');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!generatedCredentials) return '';
    
    return `🎉 *Parabéns! Sua inscrição foi aprovada!*

Você agora faz parte do programa de Parceiros Genesis Hub.

📱 *Acesse seu painel:*
https://shave-style-pro.lovable.app/login

📧 *Email:* ${generatedCredentials.email}
🔑 *Senha:* ${generatedCredentials.password}

⚠️ *Lembre-se:*
- Poste pelo menos 3 vídeos por dia
- Mantenha-se ativo para não perder acesso

Boas vendas! 🚀`;
  };

  const handleCopyMessage = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Mensagem copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(generateWhatsAppMessage());
    const phone = application.whatsapp.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const formatWhatsApp = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return phone;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalhes da Inscrição"
      size="lg"
    >
      <ModalBody className="space-y-6">
        {/* Applicant Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {application.full_name[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{application.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(application.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{application.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{formatWhatsApp(application.whatsapp)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Idade</p>
                <p className="font-medium">{application.age} anos</p>
              </div>
            </div>

            {application.instagram && (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Instagram className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Instagram</p>
                  <p className="font-medium">{application.instagram}</p>
                </div>
              </div>
            )}

            {application.tiktok && (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">TikTok</p>
                  <p className="font-medium">{application.tiktok}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Credentials */}
        {generatedCredentials && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl space-y-4"
          >
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-semibold">Usuário criado com sucesso!</h4>
            </div>

            <div className="space-y-2 p-3 bg-background/50 rounded-lg font-mono text-sm">
              <p><span className="text-muted-foreground">Email:</span> {generatedCredentials.email}</p>
              <p><span className="text-muted-foreground">Senha:</span> {generatedCredentials.password}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleCopyMessage}
                className="flex-1"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copiado!' : 'Copiar Mensagem'}
              </Button>
              <Button
                onClick={handleOpenWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Enviar no WhatsApp
              </Button>
            </div>
          </motion.div>
        )}
      </ModalBody>

      <ModalFooter>
        {application.status === 'pending' && !generatedCredentials ? (
          <>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reprovar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Aprovar
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose} className="w-full">
            Fechar
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
