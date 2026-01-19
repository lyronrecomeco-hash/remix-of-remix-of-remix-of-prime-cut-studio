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
  Eraser,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

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

interface ExistingSignature {
  id: string;
  signer_type: string;
  signer_name: string;
  signed_at: string | null;
}

export default function ContractSignature() {
  const { hash } = useParams<{ hash: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingSignatures, setExistingSignatures] = useState<ExistingSignature[]>([]);
  const [signerName, setSignerName] = useState('');
  const [signerDocument, setSignerDocument] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'govbr'>('draw');
  const [govBrLoading, setGovBrLoading] = useState(false);
  
  // Canvas para assinatura
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (hash) {
      fetchContract();
    }
  }, [hash]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!contract?.id) return;

    const channel = supabase
      .channel(`contract-signatures-${contract.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contract_signatures',
          filter: `contract_id=eq.${contract.id}`
        },
        (payload) => {
          console.log('Signature change:', payload);
          fetchSignatures();
          fetchContractStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contract?.id]);

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
      
      // Auto-fill signer name as contractor (this is the public signing page)
      setSignerName(data.contractor_name);
      setSignerDocument(data.contractor_document);
      
      // Fetch existing signatures
      await fetchSignatures(data.id);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Erro ao carregar contrato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatures = async (contractId?: string) => {
    const id = contractId || contract?.id;
    if (!id) return;

    const { data } = await supabase
      .from('contract_signatures')
      .select('id, signer_type, signer_name, signed_at')
      .eq('contract_id', id);

    setExistingSignatures(data || []);
    
    // Check if contractor already signed
    const contractorSigned = data?.some(s => s.signer_type === 'contractor' && s.signed_at);
    if (contractorSigned) {
      setSigned(true);
    }
  };

  const fetchContractStatus = async () => {
    if (!contract?.id) return;
    
    const { data } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', contract.id)
      .single();
    
    if (data) {
      setContract(prev => prev ? { ...prev, status: data.status } : null);
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
    if (signatureMethod === 'draw') {
      setTimeout(initCanvas, 100);
    }
  }, [signatureMethod]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setHasSignature(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if ('touches' in e) {
      e.preventDefault();
    }

    const { x, y } = getCanvasCoordinates(e);
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

  const handleGovBrSign = async () => {
    setGovBrLoading(true);
    
    // Simulated GOV.BR integration
    // In a real implementation, this would redirect to GOV.BR OAuth
    toast.info('Integração GOV.BR', {
      description: 'Redirecionando para autenticação GOV.BR...'
    });
    
    // Simulate GOV.BR redirect delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, we'll simulate a successful GOV.BR authentication
    // In production, this would handle the OAuth callback
    try {
      await handleSignContract('govbr');
    } finally {
      setGovBrLoading(false);
    }
  };

  const handleSignContract = async (method: 'draw' | 'govbr') => {
    if (!contract || !signerName || !signerDocument || !acceptedTerms) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (method === 'draw' && !hasSignature) {
      toast.error('Desenhe sua assinatura antes de continuar.');
      return;
    }

    setSigning(true);

    try {
      const signatureImage = method === 'draw' ? getSignatureImage() : null;

      // Registrar assinatura como contratante
      const { error: signError } = await supabase
        .from('contract_signatures')
        .insert({
          contract_id: contract.id,
          signer_type: 'contractor',
          signer_name: signerName,
          signer_document: signerDocument,
          signature_image: signatureImage,
          signature_method: method,
          signed_at: new Date().toISOString(),
          ip_address: null,
          user_agent: navigator.userAgent,
        });

      if (signError) throw signError;

      // Registrar no audit log
      await supabase
        .from('contract_audit_logs')
        .insert({
          contract_id: contract.id,
          action: 'contractor_signature_added',
          actor_type: 'contractor',
          actor_name: signerName,
          details: {
            signer_document: signerDocument,
            signature_method: method
          },
          user_agent: navigator.userAgent
        });

      // Verificar se contratado já assinou
      const { data: allSignatures } = await supabase
        .from('contract_signatures')
        .select('signer_type')
        .eq('contract_id', contract.id);

      const signerTypes = allSignatures?.map(s => s.signer_type) || [];
      const hasContracted = signerTypes.includes('contracted');

      // Atualizar status do contrato
      const newStatus = hasContracted ? 'signed' : 'partially_signed';

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

  const handleDownloadPDF = () => {
    if (!contract || !contract.generated_content) {
      toast.error('Conteúdo do contrato não disponível');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Remove markdown bold markers for PDF
    const cleanContent = contract.generated_content.replace(/\*\*/g, '');
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(cleanContent, maxWidth);
    
    let y = margin;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save(`contrato-${contract.contract_number}.pdf`);
    toast.success('PDF baixado com sucesso!');
  };

  const handleCopyContract = () => {
    if (!contract?.generated_content) {
      toast.error('Conteúdo do contrato não disponível');
      return;
    }
    
    // Remove markdown formatting for plain text copy
    const cleanContent = contract.generated_content.replace(/\*\*/g, '');
    navigator.clipboard.writeText(cleanContent);
    toast.success('Contrato copiado para a área de transferência!');
  };

  // Convert markdown bold to HTML
  const renderContractContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-black">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
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
          className="max-w-md w-full bg-card border rounded-2xl p-6 sm:p-8 text-center"
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
          className="max-w-md w-full bg-card border rounded-2xl p-6 sm:p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Contrato Assinado!</h1>
          <p className="text-muted-foreground mb-6">
            Sua assinatura foi registrada com sucesso.
          </p>
          <div className="p-4 rounded-xl bg-muted/30 text-left mb-4">
            <p className="text-sm text-muted-foreground mb-1">Contrato</p>
            <p className="font-medium text-foreground">{contract.title}</p>
            <p className="text-xs text-muted-foreground mt-1">#{contract.contract_number}</p>
          </div>
          <Button onClick={handleDownloadPDF} className="w-full gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm sm:text-base">Assinatura Digital</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Genesis Hub - Contratos</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden sm:inline">Conexão Segura</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-4">{contract.title}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="p-3 sm:p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Contratante</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{contract.contractor_name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{contract.contractor_document}</p>
            </div>
            
            <div className="p-3 sm:p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Contratado</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{contract.contracted_name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{contract.contracted_document}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground">Valor:</span>
              <span className="ml-2 font-bold text-emerald-400">{formatCurrency(contract.total_value)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Contrato nº:</span>
              <span className="ml-2 font-medium text-foreground">{contract.contract_number}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2 flex-1 sm:flex-none">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyContract} className="gap-2 flex-1 sm:flex-none">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copiar</span>
            </Button>
          </div>
        </motion.div>

        {/* Contract Content */}
        {contract.generated_content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white text-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-h-[400px] sm:max-h-[500px] overflow-y-auto"
          >
            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-serif text-xs sm:text-sm leading-relaxed">
              {renderContractContent(contract.generated_content)}
            </div>
          </motion.div>
        )}

        {/* Signature Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          <h3 className="font-bold text-foreground text-sm sm:text-base">Assinar como Contratante</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Nome Completo</Label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Seu nome completo"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">CPF/CNPJ</Label>
              <Input
                value={signerDocument}
                onChange={(e) => setSignerDocument(e.target.value)}
                placeholder="Seu documento"
                className="text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Signature Method Tabs */}
          <Tabs value={signatureMethod} onValueChange={(v) => setSignatureMethod(v as 'draw' | 'govbr')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="draw" className="text-xs sm:text-sm">Desenhar Assinatura</TabsTrigger>
              <TabsTrigger value="govbr" className="text-xs sm:text-sm">Assinar via GOV.BR</TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs sm:text-sm">
                  <PenLine className="w-4 h-4" />
                  Desenhe sua assinatura
                </Label>
                <Button variant="ghost" size="sm" onClick={clearSignature} className="gap-1.5 text-xs">
                  <Eraser className="w-4 h-4" />
                  Limpar
                </Button>
              </div>
              
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="w-full h-24 sm:h-32 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                Use o mouse ou toque para desenhar sua assinatura
              </p>
            </TabsContent>

            <TabsContent value="govbr" className="space-y-4 mt-4">
              <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <h4 className="font-bold text-foreground mb-2 text-sm sm:text-base">Assinatura via GOV.BR</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Utilize sua conta GOV.BR para assinar digitalmente com validade jurídica certificada pelo governo.
                </p>
                <Button 
                  onClick={handleGovBrSign}
                  disabled={govBrLoading || !acceptedTerms}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {govBrLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Entrar com GOV.BR
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Você será redirecionado para o portal GOV.BR para autenticação
              </p>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-muted-foreground cursor-pointer">
              Li e concordo com todos os termos deste contrato. Confirmo que sou a pessoa indicada e que esta assinatura é válida nos termos da Medida Provisória 2.200-2/2001.
            </label>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4 flex items-start gap-3">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Este contrato não substitui a consultoria de um advogado. Ao assinar, você concorda legalmente com todos os termos apresentados.
            </p>
          </div>

          {signatureMethod === 'draw' && (
            <Button
              onClick={() => handleSignContract('draw')}
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
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 text-center text-[10px] sm:text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.</p>
          <p className="mt-1">Assinatura eletrônica válida nos termos da MP 2.200-2/2001</p>
        </div>
      </footer>
    </div>
  );
}
