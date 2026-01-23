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
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
  signer_document?: string;
  signature_image?: string | null;
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
  
  // Canvas para assinatura
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Mask CPF function - shows only last 3 digits
  const maskDocument = (doc: string) => {
    if (!doc) return '';
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      // CPF: ***.***.XXX-XX
      return `***.***.*${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    } else if (cleaned.length === 14) {
      // CNPJ: **.***.***/**XX-XX
      return `**.***.***/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
    }
    return doc.slice(0, -3).replace(/./g, '*') + doc.slice(-3);
  };

  useEffect(() => {
    if (hash) {
      fetchContract();
    }
  }, [hash]);

  // Subscribe to realtime changes for signatures AND contract updates
  useEffect(() => {
    if (!contract?.id) return;

    const channel = supabase
      .channel(`contract-page-${contract.id}`)
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contracts',
          filter: `id=eq.${contract.id}`
        },
        (payload) => {
          console.log('Contract update:', payload);
          // Update contract data including generated_content
          if (payload.new) {
            setContract(prev => prev ? { ...prev, ...payload.new as Contract } : null);
          }
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
      .select('id, signer_type, signer_name, signer_document, signature_image, signed_at')
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
    setTimeout(initCanvas, 100);
  }, []);

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

  const handleSignContract = async () => {
    if (!contract || !signerName || !signerDocument || !acceptedTerms) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!hasSignature) {
      toast.error('Desenhe sua assinatura antes de continuar.');
      return;
    }

    // Verificar se já existe assinatura do contratante
    const existingContractorSig = existingSignatures.find(
      s => s.signer_type === 'contractor' && s.signed_at
    );
    
    if (existingContractorSig) {
      toast.error('Este contrato já foi assinado pelo contratante.');
      setSigned(true);
      return;
    }

    setSigning(true);

    try {
      const signatureImage = getSignatureImage();

      // Registrar assinatura como contratante
      const { error: signError } = await supabase
        .from('contract_signatures')
        .insert({
          contract_id: contract.id,
          signer_type: 'contractor',
          signer_name: signerName,
          signer_document: signerDocument,
          signature_image: signatureImage,
          signature_method: 'draw',
          signed_at: new Date().toISOString(),
          ip_address: null,
          user_agent: navigator.userAgent,
        });

      if (signError) {
        console.error('Signature insert error:', signError);
        throw signError;
      }

      // Registrar no audit log (não bloqueia se falhar)
      try {
        await supabase
          .from('contract_audit_logs')
          .insert({
            contract_id: contract.id,
            action: 'contractor_signature_added',
            actor_type: 'contractor',
            actor_name: signerName,
            details: {
              signer_document: signerDocument,
              signature_method: 'draw'
            },
            user_agent: navigator.userAgent
          });
      } catch (auditErr) {
        console.warn('Audit log insert failed:', auditErr);
      }

      // Verificar se contratado já assinou
      const { data: allSignatures } = await supabase
        .from('contract_signatures')
        .select('signer_type, signed_at')
        .eq('contract_id', contract.id);

      const signedTypes = allSignatures
        ?.filter(s => s.signed_at)
        .map(s => s.signer_type) || [];
      
      const hasContractor = signedTypes.includes('contractor');
      const hasContracted = signedTypes.includes('contracted');

      // Determinar novo status
      let newStatus = 'pending_signature';
      if (hasContractor && hasContracted) {
        newStatus = 'signed';
      } else if (hasContractor || hasContracted) {
        newStatus = 'partially_signed';
      }

      // Atualizar status do contrato
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ status: newStatus })
        .eq('id', contract.id);

      if (updateError) {
        console.error('Contract status update error:', updateError);
        // Não lançar erro aqui - a assinatura foi registrada com sucesso
      }

      // Refresh signatures to get the latest
      await fetchSignatures();
      await fetchContractStatus();

      setSigned(true);
      toast.success('Contrato assinado com sucesso!');
    } catch (err) {
      console.error('Error signing contract:', err);
      toast.error('Erro ao assinar contrato. Tente novamente.');
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contract) {
      toast.error('Contrato não carregado');
      return;
    }

    // Sempre buscar o contrato mais recente (evita PDF desatualizado)
    const { data: freshContract, error: contractError } = await supabase
      .from('contracts')
      .select('contract_number, contractor_name, contractor_document, contracted_name, contracted_document, generated_content')
      .eq('id', contract.id)
      .maybeSingle();

    if (contractError) {
      console.error('Erro ao buscar contrato atualizado para PDF:', contractError);
    }

    const contractForPDF = freshContract ? ({ ...contract, ...freshContract } as Contract) : contract;

    if (!contractForPDF.generated_content) {
      toast.error('Conteúdo do contrato não disponível');
      return;
    }

    // Buscar assinaturas mais recentes (ordenadas) diretamente do banco
    const { data: freshSignatures, error: signaturesError } = await supabase
      .from('contract_signatures')
      .select('id, signer_type, signer_name, signer_document, signature_image, signed_at')
      .eq('contract_id', contractForPDF.id)
      .not('signed_at', 'is', null)
      .order('signed_at', { ascending: false });

    if (signaturesError) {
      console.error('Erro ao buscar assinaturas para PDF:', signaturesError);
    }

    const signaturesForPDF = (freshSignatures && freshSignatures.length > 0)
      ? freshSignatures
      : (existingSignatures || []).filter(s => !!s.signed_at);

    const getPngBase64 = (dataUrl?: string | null) => {
      if (!dataUrl) return null;
      const commaIndex = dataUrl.indexOf(',');
      const raw = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      return raw.replace(/\s/g, '');
    };

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Remove markdown bold markers for PDF
    const cleanContent = contractForPDF.generated_content.replace(/\*\*/g, '');
    
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

    // Adicionar seção de assinaturas no PDF
    // Como a lista vem ordenada por signed_at DESC, o primeiro match é o mais recente
    const contractorSignature = signaturesForPDF.find(s => s.signer_type === 'contractor');
    const contractedSignature = signaturesForPDF.find(s => s.signer_type === 'contracted');

    // Verificar se precisa de nova página para assinaturas
    if (y + 80 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    y += 15;
    doc.setFontSize(14);
    doc.text('ASSINATURAS', pageWidth / 2, y, { align: 'center' });
    y += 15;

    const colWidth = (pageWidth - margin * 2) / 2;
    const col1X = margin;
    const col2X = margin + colWidth;

    // Contratante
    doc.setFontSize(11);
    doc.text('CONTRATANTE', col1X + colWidth / 2, y, { align: 'center' });
    
    // Contratado
    doc.text('CONTRATADO', col2X + colWidth / 2, y, { align: 'center' });
    y += 8;

    // Adicionar imagens de assinatura se existirem
    const sigY = y;
    const sigWidth = 60;
    const sigHeight = 20;

    const contractorSigBase64 = getPngBase64(contractorSignature?.signature_image);
    const contractedSigBase64 = getPngBase64(contractedSignature?.signature_image);

    if (contractorSigBase64) {
      try {
        doc.addImage(
          contractorSigBase64,
          'PNG',
          col1X + (colWidth - sigWidth) / 2,
          sigY,
          sigWidth,
          sigHeight
        );
      } catch (e) {
        console.warn('Erro ao adicionar assinatura do contratante no PDF:', e);
      }
    }

    if (contractedSigBase64) {
      try {
        doc.addImage(
          contractedSigBase64,
          'PNG',
          col2X + (colWidth - sigWidth) / 2,
          sigY,
          sigWidth,
          sigHeight
        );
      } catch (e) {
        console.warn('Erro ao adicionar assinatura do contratado no PDF:', e);
      }
    }

    y = sigY + sigHeight + 5;

    // Linha de assinatura
    doc.setDrawColor(100);
    doc.line(col1X + 10, y, col1X + colWidth - 10, y);
    doc.line(col2X + 10, y, col2X + colWidth - 10, y);
    y += 5;

    // Nomes
    doc.setFontSize(10);
    doc.text(contractForPDF.contractor_name || '', col1X + colWidth / 2, y, { align: 'center' });
    doc.text(contractForPDF.contracted_name || '', col2X + colWidth / 2, y, { align: 'center' });
    y += 5;

    // Documentos mascarados
    doc.setFontSize(8);
    doc.text(maskDocument(contractForPDF.contractor_document || ''), col1X + colWidth / 2, y, { align: 'center' });
    doc.text(maskDocument(contractForPDF.contracted_document || ''), col2X + colWidth / 2, y, { align: 'center' });
    y += 5;

    // Datas de assinatura
    if (contractorSignature?.signed_at) {
      doc.text(
        `Assinado em ${format(new Date(contractorSignature.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        col1X + colWidth / 2,
        y,
        { align: 'center' }
      );
    }
    if (contractedSignature?.signed_at) {
      doc.text(
        `Assinado em ${format(new Date(contractedSignature.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        col2X + colWidth / 2,
        y,
        { align: 'center' }
      );
    }

    doc.save(`contrato-${contractForPDF.contract_number}.pdf`);
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

  // Convert markdown bold to HTML and add signature section
  const renderContractContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    const renderedContent = parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-black">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });

    // Get contractor signature if exists
    const contractorSignature = existingSignatures.find(s => s.signer_type === 'contractor' && s.signed_at);
    const contractedSignature = existingSignatures.find(s => s.signer_type === 'contracted' && s.signed_at);

    return (
      <>
        {renderedContent}
        
        {/* Signature Section in Contract */}
        <div className="mt-8 pt-6 border-t-2 border-gray-300">
          <h4 className="text-center font-bold mb-8">ASSINATURAS</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contratante */}
            <div className="text-center">
              <p className="font-bold mb-4">CONTRATANTE</p>
              {contractorSignature?.signature_image ? (
                <div className="mb-2">
                  <img 
                    src={contractorSignature.signature_image} 
                    alt="Assinatura do Contratante"
                    className="mx-auto h-16 object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 border-b-2 border-gray-400 mb-2" />
              )}
              <p className="text-sm">{contract?.contractor_name}</p>
              <p className="text-xs text-gray-600">{maskDocument(contract?.contractor_document || '')}</p>
              {contractorSignature?.signed_at && (
                <p className="text-xs text-emerald-600 mt-1">
                  Assinado em {format(new Date(contractorSignature.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
            
            {/* Contratado */}
            <div className="text-center">
              <p className="font-bold mb-4">CONTRATADO</p>
              {contractedSignature?.signature_image ? (
                <div className="mb-2">
                  <img 
                    src={contractedSignature.signature_image} 
                    alt="Assinatura do Contratado"
                    className="mx-auto h-16 object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 border-b-2 border-gray-400 mb-2" />
              )}
              <p className="text-sm">{contract?.contracted_name}</p>
              <p className="text-xs text-gray-600">{maskDocument(contract?.contracted_document || '')}</p>
              {contractedSignature?.signed_at && (
                <p className="text-xs text-emerald-600 mt-1">
                  Assinado em {format(new Date(contractedSignature.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Carregando contrato...</p>
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
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-lg sm:text-xl font-bold text-foreground mb-2">Link Inválido</h1>
          <p className="text-sm text-muted-foreground">{error || 'Contrato não encontrado.'}</p>
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Contrato Assinado!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sua assinatura foi registrada com sucesso.
          </p>
          <div className="p-4 rounded-xl bg-muted/30 text-left mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Contrato</p>
            <p className="font-medium text-sm sm:text-base text-foreground">{contract.title}</p>
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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-foreground text-sm sm:text-base truncate">Assinatura Digital</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Genesis Hub - Contratos</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
            <span className="hidden sm:inline">Conexão Segura</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <h2 className="text-sm sm:text-lg font-bold text-foreground mb-4 line-clamp-2">{contract.title}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Contratante</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{contract.contractor_name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{maskDocument(contract.contractor_document)}</p>
            </div>
            
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Contratado</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{contract.contracted_name}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{maskDocument(contract.contracted_document)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm mt-4">
            <div>
              <span className="text-muted-foreground">Valor:</span>
              <span className="ml-2 font-bold text-emerald-400">{formatCurrency(contract.total_value)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Nº:</span>
              <span className="ml-1 font-medium text-foreground">{contract.contract_number}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Baixar</span> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyContract} className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Copy className="w-4 h-4" />
              Copiar
            </Button>
          </div>
        </motion.div>

        {/* Contract Content */}
        {contract.generated_content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white text-black rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-h-[350px] sm:max-h-[450px] overflow-y-auto"
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

          {/* Read-only signer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm flex items-center gap-2">
                <Lock className="w-3 h-3 text-muted-foreground" />
                Nome Completo
              </Label>
              <div className="px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-sm text-foreground">
                {signerName}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm flex items-center gap-2">
                <Lock className="w-3 h-3 text-muted-foreground" />
                CPF/CNPJ
              </Label>
              <div className="px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-sm text-foreground">
                {maskDocument(signerDocument)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Signature Drawing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="flex items-center gap-2 text-xs sm:text-sm">
                <PenLine className="w-4 h-4" />
                Desenhe sua assinatura
              </Label>
              <Button variant="ghost" size="sm" onClick={clearSignature} className="gap-1.5 text-xs h-8">
                <Eraser className="w-4 h-4" />
                Limpar
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className="w-full h-20 sm:h-28 md:h-32 cursor-crosshair touch-none"
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
              Use o dedo ou mouse para desenhar sua assinatura
            </p>
          </div>

          <Separator />

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-[10px] sm:text-xs text-muted-foreground cursor-pointer leading-relaxed">
              Li e concordo com todos os termos deste contrato. Confirmo que sou a pessoa indicada e que esta assinatura é válida nos termos da Medida Provisória 2.200-2/2001.
            </label>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2 sm:gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Este contrato não substitui a consultoria de um advogado. Ao assinar, você concorda legalmente com todos os termos apresentados.
            </p>
          </div>

          <Button
            onClick={handleSignContract}
            disabled={!acceptedTerms || !hasSignature || signing}
            className="w-full gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-sm sm:text-base"
            size="lg"
          >
            {signing ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Assinando...
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4 sm:w-5 sm:h-5" />
                Assinar Contrato
              </>
            )}
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-8 sm:mt-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 text-center text-[10px] sm:text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Genesis Hub. Todos os direitos reservados.</p>
          <p className="mt-1">Assinatura eletrônica válida nos termos da MP 2.200-2/2001</p>
        </div>
      </footer>
    </div>
  );
}