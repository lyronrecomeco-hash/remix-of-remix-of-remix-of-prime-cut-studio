import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  Download,
  Copy,
  ExternalLink,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Link2,
  FileSignature,
  Shield,
  Sparkles,
  RefreshCw,
  PenLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ContractDetailProps {
  contractId: string;
  onBack: () => void;
}

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  status: string;
  contractor_name: string;
  contractor_document: string;
  contractor_document_type: string;
  contractor_address: string;
  contractor_email: string | null;
  contractor_phone: string | null;
  contracted_name: string;
  contracted_document: string;
  contracted_document_type: string;
  contracted_address: string;
  contracted_email: string | null;
  contracted_phone: string | null;
  service_type: string;
  service_description: string;
  service_modality: string;
  delivery_type: string;
  start_date: string;
  end_date: string | null;
  delivery_in_stages: boolean;
  allows_extension: boolean;
  total_value: number;
  payment_method: string;
  installments: number;
  late_fee_percentage: number | null;
  has_warranty: boolean;
  warranty_period: string | null;
  liability_limit: string | null;
  not_included: string | null;
  allows_early_termination: boolean;
  termination_penalty_percentage: number | null;
  notice_period_days: number;
  jurisdiction_city: string;
  jurisdiction_state: string;
  generated_content: string | null;
  pdf_url: string | null;
  signature_hash: string;
  created_at: string;
  updated_at: string;
}

interface Signature {
  id: string;
  signer_type: string;
  signer_name: string;
  signer_document: string;
  signed_at: string | null;
  signature_method: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: FileText },
  pending_signature: { label: 'Aguardando Assinatura', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  partially_signed: { label: 'Parcialmente Assinado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FileSignature },
  signed: { label: 'Assinado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

export function ContractDetail({ contractId, onBack }: ContractDetailProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [signingAsContracted, setSigningAsContracted] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  // Subscribe to realtime signature changes
  useEffect(() => {
    if (!contract?.id) return;

    const channel = supabase
      .channel(`contract-detail-${contract.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contract_signatures',
          filter: `contract_id=eq.${contract.id}`
        },
        () => {
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
          setContract(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contract?.id]);

  const fetchContract = async () => {
    try {
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;
      setContract(contractData);

      // Se não tem conteúdo gerado, gerar automaticamente
      if (!contractData.generated_content) {
        generateContractContent(contractData);
      }

      await fetchSignatures(contractData.id);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Erro ao carregar contrato');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatures = async (id?: string) => {
    const contractIdToUse = id || contract?.id;
    if (!contractIdToUse) return;

    const { data: signaturesData } = await supabase
      .from('contract_signatures')
      .select('*')
      .eq('contract_id', contractIdToUse)
      .order('created_at', { ascending: true });

    setSignatures(signaturesData || []);
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

  const generateContractContent = async (contractData: Contract) => {
    setGeneratingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-contract-content', {
        body: contractData
      });

      if (error) throw error;

      if (data?.success && data?.content) {
        await supabase
          .from('contracts')
          .update({ 
            generated_content: data.content,
            status: 'pending_signature'
          })
          .eq('id', contractData.id);

        setContract(prev => prev ? { ...prev, generated_content: data.content, status: 'pending_signature' } : null);
        toast.success('Contrato gerado com sucesso!');
      } else {
        throw new Error(data?.error || 'Erro ao gerar contrato');
      }
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato. Tente novamente.');
    } finally {
      setGeneratingContent(false);
    }
  };

  const regenerateContent = () => {
    if (contract) {
      generateContractContent(contract);
    }
  };

  const handleSignAsContracted = async () => {
    if (!contract) return;
    
    setSigningAsContracted(true);
    
    try {
      // Check if already signed
      const existingContractedSig = signatures.find(s => s.signer_type === 'contracted');
      if (existingContractedSig?.signed_at) {
        toast.info('Você já assinou este contrato.');
        return;
      }

      // Add signature as contracted party
      const { error: signError } = await supabase
        .from('contract_signatures')
        .insert({
          contract_id: contract.id,
          signer_type: 'contracted',
          signer_name: contract.contracted_name,
          signer_document: contract.contracted_document,
          signature_method: 'panel',
          signed_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
        });

      if (signError) throw signError;

      // Log the action
      await supabase
        .from('contract_audit_logs')
        .insert({
          contract_id: contract.id,
          action: 'contracted_signature_added',
          actor_type: 'contracted',
          actor_name: contract.contracted_name,
          details: {
            signature_method: 'panel'
          }
        });

      // Check if contractor also signed
      const hasContractorSig = signatures.some(s => s.signer_type === 'contractor' && s.signed_at);
      const newStatus = hasContractorSig ? 'signed' : 'partially_signed';

      await supabase
        .from('contracts')
        .update({ status: newStatus })
        .eq('id', contract.id);

      setContract(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Contrato assinado com sucesso!');
      
      // Refresh signatures
      fetchSignatures();
    } catch (error) {
      console.error('Error signing:', error);
      toast.error('Erro ao assinar contrato');
    } finally {
      setSigningAsContracted(false);
    }
  };

  const getSignatureUrl = () => {
    if (!contract) return '';
    return `${window.location.origin}/contratos/assinar/${contract.signature_hash}`;
  };

  const copySignatureLink = () => {
    navigator.clipboard.writeText(getSignatureUrl());
    toast.success('Link de assinatura copiado!');
  };

  const handleCopyContract = () => {
    if (!contract?.generated_content) {
      toast.error('Conteúdo do contrato não disponível');
      return;
    }
    const cleanContent = contract.generated_content.replace(/\*\*/g, '');
    navigator.clipboard.writeText(cleanContent);
    toast.success('Contrato copiado!');
  };

  const handleDownloadPDF = () => {
    if (!contract?.generated_content) {
      toast.error('Gere o contrato primeiro');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
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
    toast.success('PDF baixado!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} gap-1.5 px-2 sm:px-3 py-1 text-[10px] sm:text-xs`}>
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
    );
  };

  // Render contract content with bold formatting
  const renderContractContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-black">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const contractedHasSigned = signatures.some(s => s.signer_type === 'contracted' && s.signed_at);

  if (loading || !contract) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">{contract.title}</h2>
              {getStatusBadge(contract.status)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Contrato #{contract.contract_number} • {format(new Date(contract.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={copySignatureLink}>
            <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Copiar Link</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleDownloadPDF}>
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={handleCopyContract}>
            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Copiar</span>
          </Button>
        </div>
      </div>

      {/* Contract Info */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start bg-card/50 border overflow-x-auto">
          <TabsTrigger value="details" className="text-xs sm:text-sm">Detalhes</TabsTrigger>
          <TabsTrigger value="signatures" className="text-xs sm:text-sm">Assinaturas</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs sm:text-sm">Visualizar</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Contratante</h3>
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p className="font-medium">{contract.contractor_name}</p>
                <p className="text-muted-foreground">
                  {contract.contractor_document_type.toUpperCase()}: {contract.contractor_document}
                </p>
                <p className="text-muted-foreground text-[10px] sm:text-xs">{contract.contractor_address}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">Contratado</h3>
              </div>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <p className="font-medium">{contract.contracted_name}</p>
                <p className="text-muted-foreground">
                  {contract.contracted_document_type.toUpperCase()}: {contract.contracted_document}
                </p>
                <p className="text-muted-foreground text-[10px] sm:text-xs">{contract.contracted_address}</p>
              </div>
            </motion.div>
          </div>

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
          >
            <h3 className="font-semibold text-foreground mb-3 text-sm">Objeto do Contrato</h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Tipo de Serviço</p>
                <p className="text-xs sm:text-sm font-medium">{contract.service_type}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Descrição</p>
                <p className="text-xs sm:text-sm">{contract.service_description}</p>
              </div>
            </div>
          </motion.div>

          {/* Financials & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                <h3 className="font-semibold text-foreground text-xs sm:text-sm">Valor</h3>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-emerald-400">{formatCurrency(contract.total_value)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {contract.installments > 1 ? `${contract.installments}x` : 'À vista'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <h3 className="font-semibold text-foreground text-xs sm:text-sm">Prazo</h3>
              </div>
              <p className="text-xs sm:text-sm font-medium">
                {format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
              {contract.end_date && (
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  até {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                <h3 className="font-semibold text-foreground text-xs sm:text-sm">Foro</h3>
              </div>
              <p className="text-xs sm:text-sm font-medium">
                {contract.jurisdiction_city}/{contract.jurisdiction_state}
              </p>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="signatures" className="mt-4">
          <div className="p-4 sm:p-6 rounded-xl border bg-gradient-to-br from-card to-card/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">Assinaturas</h3>
              {!contractedHasSigned && (
                <Button
                  onClick={handleSignAsContracted}
                  disabled={signingAsContracted}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600"
                >
                  {signingAsContracted ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PenLine className="w-4 h-4" />
                  )}
                  Assinar como Contratado
                </Button>
              )}
            </div>
            
            {signatures.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FileSignature className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-xs sm:text-sm text-muted-foreground">Nenhuma assinatura registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signatures.map((sig) => (
                  <div key={sig.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        sig.signed_at ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                      }`}>
                        {sig.signed_at ? (
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{sig.signer_name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {sig.signer_type === 'contractor' ? 'Contratante' : 'Contratado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {sig.signed_at ? (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      ) : (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">Pendente</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-4 sm:my-6" />

            <div className="space-y-3">
              <h4 className="text-xs sm:text-sm font-medium">Link para assinatura do Contratante</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 sm:p-3 rounded-lg bg-muted/30 font-mono text-[10px] sm:text-xs truncate">
                  {getSignatureUrl()}
                </div>
                <Button variant="outline" size="sm" onClick={copySignatureLink}>
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(getSignatureUrl(), '_blank')}>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {generatingContent ? (
            <div className="p-8 sm:p-12 rounded-xl border bg-card text-center">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2">Gerando Contrato Jurídico</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Nossa IA está criando um contrato completo...
                </p>
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              </div>
            </div>
          ) : contract.generated_content ? (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyContract} className="gap-2 text-xs">
                  <Copy className="w-4 h-4" />
                  Copiar
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2 text-xs">
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={regenerateContent} className="gap-2 text-xs">
                  <RefreshCw className="w-4 h-4" />
                  Regenerar
                </Button>
              </div>
              <div className="p-4 sm:p-6 md:p-8 rounded-xl border bg-white text-black min-h-[400px] sm:min-h-[600px] max-h-[600px] sm:max-h-[800px] overflow-y-auto">
                <div className="max-w-3xl mx-auto prose prose-sm prose-slate whitespace-pre-wrap font-serif leading-relaxed text-xs sm:text-sm">
                  {renderContractContent(contract.generated_content)}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-xl border bg-card text-center">
              <div className="max-w-md mx-auto">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2">Contrato não gerado</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                  O contrato jurídico ainda não foi gerado.
                </p>
                <Button onClick={regenerateContent} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gerar Contrato com IA
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
