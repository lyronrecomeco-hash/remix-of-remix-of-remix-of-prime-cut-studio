import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  Download,
  Send,
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
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  useEffect(() => {
    fetchContract();
  }, [contractId]);

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

      const { data: signaturesData } = await supabase
        .from('contract_signatures')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: true });

      setSignatures(signaturesData || []);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Erro ao carregar contrato');
      onBack();
    } finally {
      setLoading(false);
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
        // Salvar conteúdo no banco
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

  const getSignatureUrl = () => {
    if (!contract) return '';
    return `${window.location.origin}/contratos/assinar/${contract.signature_hash}`;
  };

  const copySignatureLink = () => {
    navigator.clipboard.writeText(getSignatureUrl());
    toast.success('Link de assinatura copiado!');
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
      <Badge variant="outline" className={`${config.color} gap-1.5 px-3 py-1`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </Badge>
    );
  };

  if (loading || !contract) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{contract.title}</h2>
              {getStatusBadge(contract.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contrato #{contract.contract_number} • Criado em {format(new Date(contract.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={copySignatureLink}>
            <Link2 className="w-4 h-4" />
            Copiar Link
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            PDF
          </Button>
          {contract.status === 'draft' && (
            <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          )}
        </div>
      </div>

      {/* Contract Info */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start bg-card/50 border">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
          <TabsTrigger value="preview">Visualizar</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground">Contratante</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{contract.contractor_name}</p>
                <p className="text-muted-foreground">
                  {contract.contractor_document_type.toUpperCase()}: {contract.contractor_document}
                </p>
                <p className="text-muted-foreground text-xs">{contract.contractor_address}</p>
                {contract.contractor_email && (
                  <p className="text-muted-foreground text-xs">{contract.contractor_email}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-foreground">Contratado</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{contract.contracted_name}</p>
                <p className="text-muted-foreground">
                  {contract.contracted_document_type.toUpperCase()}: {contract.contracted_document}
                </p>
                <p className="text-muted-foreground text-xs">{contract.contracted_address}</p>
                {contract.contracted_email && (
                  <p className="text-muted-foreground text-xs">{contract.contracted_email}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Service Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
          >
            <h3 className="font-semibold text-foreground mb-3">Objeto do Contrato</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Serviço</p>
                <p className="text-sm font-medium">{contract.service_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="text-sm">{contract.service_description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {contract.service_modality === 'pontual' ? 'Pontual' : 
                   contract.service_modality === 'recorrente' ? 'Recorrente' : 'Por Demanda'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Entrega {contract.delivery_type === 'digital' ? 'Digital' : 
                           contract.delivery_type === 'fisico' ? 'Física' : 'Mista'}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Financials & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-foreground text-sm">Valor</h3>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(contract.total_value)}</p>
              <p className="text-xs text-muted-foreground">
                {contract.installments > 1 ? `${contract.installments}x de ${formatCurrency(contract.total_value / contract.installments)}` : 'À vista'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Via {contract.payment_method}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-foreground text-sm">Prazo</h3>
              </div>
              <p className="text-sm font-medium">
                {format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </p>
              {contract.end_date && (
                <p className="text-xs text-muted-foreground">
                  até {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-foreground text-sm">Foro</h3>
              </div>
              <p className="text-sm font-medium">
                {contract.jurisdiction_city}/{contract.jurisdiction_state}
              </p>
            </motion.div>
          </div>

          {/* Warranty */}
          {contract.has_warranty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-xl border bg-gradient-to-br from-card to-card/80"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-foreground text-sm">Garantia</h3>
              </div>
              <p className="text-sm">{contract.warranty_period}</p>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="signatures" className="mt-4">
          <div className="p-6 rounded-xl border bg-gradient-to-br from-card to-card/80">
            <h3 className="font-semibold text-foreground mb-4">Assinaturas</h3>
            
            {signatures.length === 0 ? (
              <div className="text-center py-8">
                <FileSignature className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhuma assinatura registrada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Envie o link de assinatura para as partes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {signatures.map((sig) => (
                  <div key={sig.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        sig.signed_at ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                      }`}>
                        {sig.signed_at ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sig.signer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sig.signer_type === 'contractor' ? 'Contratante' : 
                           sig.signer_type === 'contracted' ? 'Contratado' : 'Testemunha'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {sig.signed_at ? (
                        <p className="text-xs text-muted-foreground">
                          Assinado em {format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pendente</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-6" />

            {/* Signature Link */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Link para assinatura</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 rounded-lg bg-muted/30 font-mono text-xs truncate">
                  {getSignatureUrl()}
                </div>
                <Button variant="outline" size="sm" onClick={copySignatureLink}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(getSignatureUrl(), '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          {generatingContent ? (
            <div className="p-12 rounded-xl border bg-card text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">Gerando Contrato Jurídico</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nossa IA está criando um contrato completo e profissional com base nas informações fornecidas...
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Isso pode levar alguns segundos
                </div>
              </div>
            </div>
          ) : contract.generated_content ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateContent}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerar Contrato
                </Button>
              </div>
              <div className="p-8 rounded-xl border bg-white text-black min-h-[600px] max-h-[800px] overflow-y-auto">
                <div className="max-w-3xl mx-auto prose prose-sm prose-slate whitespace-pre-wrap font-serif leading-relaxed">
                  {contract.generated_content}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-xl border bg-card text-center">
              <div className="max-w-md mx-auto">
                <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">Contrato não gerado</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  O contrato jurídico ainda não foi gerado. Clique no botão abaixo para gerar.
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
