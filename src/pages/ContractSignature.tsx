import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PenLine,
  Download,
  Shield,
  Info,
  User,
  Briefcase,
  Eraser
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  status: string;
  contractor_name: string;
  contractor_document: string;
  contracted_name: string;
  contracted_document: string;
  service_type: string;
  service_description: string;
  total_value: number;
  generated_content: string | null;
  created_at: string;
  jurisdiction_city: string;
  jurisdiction_state: string;
}

export default function ContractSignature() {
  const { hash } = useParams<{ hash: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signerType, setSignerType] = useState<'contractor' | 'contracted' | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerDocument, setSignerDocument] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);
  
  // Canvas para assinatura
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (hash) {
      fetchContract();
    }
  }, [hash]);

  const fetchContract = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('contracts')
        .select('*')
        .eq('signature_hash', hash)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError('Contrato não encontrado ou link inválido.');
        } else {
          throw fetchError;
        }
        return;
      }

      setContract(data);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Erro ao carregar contrato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    initCanvas();
  }, [signerType]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setHasSignature(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    setHasSignature(false);
    initCanvas();
  };

  const getSignatureImage = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSign = async () => {
    if (!contract || !signerType || !signerName || !signerDocument || !acceptedTerms || !hasSignature) {
      toast.error('Preencha todos os campos e desenhe sua assinatura.');
      return;
    }

    setSigning(true);

    try {
      const signatureImage = getSignatureImage();

      // Registrar assinatura
      const { error: signError } = await supabase
        .from('contract_signatures')
        .insert({
          contract_id: contract.id,
          signer_type: signerType,
          signer_name: signerName,
          signer_document: signerDocument,
          signature_image: signatureImage,
          signature_method: 'draw',
          signed_at: new Date().toISOString(),
          ip_address: null, // Será preenchido via edge function se necessário
          user_agent: navigator.userAgent,
        });

      if (signError) throw signError;

      // Registrar no audit log
      await supabase
        .from('contract_audit_logs')
        .insert({
          contract_id: contract.id,
          action: 'signature_added',
          actor_type: signerType,
          actor_name: signerName,
          details: {
            signer_type: signerType,
            signer_document: signerDocument,
            signature_method: 'draw'
          },
          user_agent: navigator.userAgent
        });

      // Verificar se todas as partes assinaram
      const { data: allSignatures } = await supabase
        .from('contract_signatures')
        .select('signer_type')
        .eq('contract_id', contract.id);

      const signerTypes = allSignatures?.map(s => s.signer_type) || [];
      const hasContractor = signerTypes.includes('contractor');
      const hasContracted = signerTypes.includes('contracted');

      // Atualizar status do contrato
      let newStatus = 'partially_signed';
      if (hasContractor && hasContracted) {
        newStatus = 'signed';
      }

      await supabase
        .from('contracts')
        .update({ status: newStatus })
        .eq('id', contract.id);

      setSigned(true);
      toast.success('Contrato assinado com sucesso!');
    } catch (err) {
      console.error('Error signing contract:', err);
      toast.error('Erro ao assinar contrato. Tente novamente.');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando contrato...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border rounded-2xl p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Link Inválido</h1>
          <p className="text-muted-foreground">{error || 'Contrato não encontrado.'}</p>
        </motion.div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Contrato Assinado!</h1>
          <p className="text-muted-foreground mb-6">
            Sua assinatura foi registrada com sucesso. Você receberá uma cópia por e-mail.
          </p>
          <div className="p-4 rounded-xl bg-muted/30 text-left">
            <p className="text-sm text-muted-foreground mb-1">Contrato</p>
            <p className="font-medium text-foreground">{contract.title}</p>
            <p className="text-xs text-muted-foreground mt-1">#{contract.contract_number}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Assinatura Digital</h1>
              <p className="text-xs text-muted-foreground">Genesis Hub - Contratos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-emerald-400" />
            Conexão Segura
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">{contract.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-foreground">Contratante</span>
              </div>
              <p className="text-sm text-muted-foreground">{contract.contractor_name}</p>
              <p className="text-xs text-muted-foreground">{contract.contractor_document}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-foreground">Contratado</span>
              </div>
              <p className="text-sm text-muted-foreground">{contract.contracted_name}</p>
              <p className="text-xs text-muted-foreground">{contract.contracted_document}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Valor:</span>
              <span className="ml-2 font-bold text-emerald-400">{formatCurrency(contract.total_value)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contrato nº:</span>
              <span className="ml-2 font-medium text-foreground">{contract.contract_number}</span>
            </div>
          </div>
        </motion.div>

        {/* Contract Content */}
        {contract.generated_content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white text-black rounded-2xl p-6 md:p-8 max-h-[500px] overflow-y-auto"
          >
            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-serif">
              {contract.generated_content}
            </div>
          </motion.div>
        )}

        {/* Signature Selection */}
        {!signerType ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-2xl p-6"
          >
            <h3 className="font-bold text-foreground mb-4">Você é qual parte?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSignerType('contractor');
                  setSignerName(contract.contractor_name);
                  setSignerDocument(contract.contractor_document);
                }}
                className="p-6 rounded-xl border-2 border-transparent bg-muted/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left"
              >
                <User className="w-8 h-8 text-blue-400 mb-3" />
                <h4 className="font-bold text-foreground">Contratante</h4>
                <p className="text-sm text-muted-foreground">{contract.contractor_name}</p>
              </button>
              
              <button
                onClick={() => {
                  setSignerType('contracted');
                  setSignerName(contract.contracted_name);
                  setSignerDocument(contract.contracted_document);
                }}
                className="p-6 rounded-xl border-2 border-transparent bg-muted/30 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all text-left"
              >
                <Briefcase className="w-8 h-8 text-indigo-400 mb-3" />
                <h4 className="font-bold text-foreground">Contratado</h4>
                <p className="text-sm text-muted-foreground">{contract.contracted_name}</p>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Assinar como {signerType === 'contractor' ? 'Contratante' : 'Contratado'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSignerType(null)}>
                Voltar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input
                  value={signerDocument}
                  onChange={(e) => setSignerDocument(e.target.value)}
                  placeholder="Seu documento"
                />
              </div>
            </div>

            <Separator />

            {/* Signature Canvas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <PenLine className="w-4 h-4" />
                  Desenhe sua assinatura
                </Label>
                <Button variant="ghost" size="sm" onClick={clearSignature} className="gap-1.5">
                  <Eraser className="w-4 h-4" />
                  Limpar
                </Button>
              </div>
              
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="w-full h-32 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Use o mouse ou toque para desenhar sua assinatura
              </p>
            </div>

            <Separator />

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                Li e concordo com todos os termos deste contrato. Confirmo que sou a pessoa indicada e que esta assinatura é válida nos termos da Medida Provisória 2.200-2/2001.
              </label>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Este contrato não substitui a consultoria de um advogado. Ao assinar, você concorda legalmente com todos os termos apresentados.
              </p>
            </div>

            <Button
              onClick={handleSign}
              disabled={!acceptedTerms || !hasSignature || signing}
              className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              size="lg"
            >
              {signing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Assinando...
                </>
              ) : (
                <>
                  <PenLine className="w-5 h-5" />
                  Assinar Contrato
                </>
              )}
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.</p>
          <p className="mt-1">Assinatura eletrônica válida nos termos da MP 2.200-2/2001</p>
        </div>
      </footer>
    </div>
  );
}
