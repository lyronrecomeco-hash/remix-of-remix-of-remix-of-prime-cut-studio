import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileSignature
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateContractPdf } from '@/lib/contracts/contractPdf';

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  status: string;
  contractor_name: string;
  contractor_document: string;
  contracted_name: string;
  contracted_document: string;
  total_value: number;
  created_at: string;
  service_type: string;
  service_modality: string;
  generated_content: string | null;
}

interface ContractsListProps {
  affiliateId: string;
  onCreateNew: () => void;
  onViewContract: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground border-border', icon: FileText },
  pending_signature: { label: 'Aguardando Assinatura', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  partially_signed: { label: 'Parcialmente Assinado', color: 'bg-primary/20 text-primary border-primary/30', icon: FileSignature },
  signed: { label: 'Assinado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
  expired: { label: 'Expirado', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertTriangle },
};

export function ContractsList({ affiliateId, onCreateNew, onViewContract }: ContractsListProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
  }, [affiliateId]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, contract_number, title, status, contractor_name, contractor_document, contracted_name, contracted_document, total_value, created_at, service_type, service_modality, generated_content')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const maskDocument = (doc: string) => {
    if (!doc) return '';
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `***.***.*${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    } else if (cleaned.length === 14) {
      return `**.***.***/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
    }
    return doc.slice(0, -3).replace(/./g, '*') + doc.slice(-3);
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDownloadPDF = async (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();

    // Sempre buscar o contrato mais recente (evita PDF desatualizado)
    const { data: freshContract, error: contractError } = await supabase
      .from('contracts')
      .select('contract_number, contractor_name, contractor_document, contracted_name, contracted_document, generated_content')
      .eq('id', contract.id)
      .maybeSingle();

    if (contractError) {
      console.error('Erro ao buscar contrato atualizado para PDF:', contractError);
    }

    const contractForPDF = freshContract ? ({ ...contract, ...freshContract }) : contract;

    if (!contractForPDF.generated_content) {
      toast.error('Gere o contrato primeiro');
      return;
    }

    // Buscar assinaturas mais recentes (ordenadas) diretamente do banco
    const { data: signaturesData, error: signaturesError } = await supabase
      .from('contract_signatures')
      .select('signer_type, signed_at, signature_image')
      .eq('contract_id', contractForPDF.id)
      .not('signed_at', 'is', null)
      .order('signed_at', { ascending: false });

    if (signaturesError) {
      console.error('Erro ao buscar assinaturas para PDF:', signaturesError);
    }

    const signaturesForPDF = signaturesData || [];

    const doc = generateContractPdf({
      contract: {
        contract_number: contractForPDF.contract_number,
        contractor_name: contractForPDF.contractor_name,
        contractor_document: contractForPDF.contractor_document,
        contracted_name: contractForPDF.contracted_name,
        contracted_document: contractForPDF.contracted_document,
        generated_content: contractForPDF.generated_content,
      },
      signatures: signaturesForPDF.map(s => ({
        signer_type: s.signer_type,
        signed_at: s.signed_at,
        signature_image: s.signature_image,
      })),
    });

    doc.save(`contrato-${contractForPDF.contract_number}.pdf`);
    toast.success('PDF baixado!');
  };

  if (loading) {
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Contratos</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <Button onClick={onCreateNew} className="gap-2 w-full sm:w-auto text-sm">
          <Plus className="w-4 h-4" />
          Criar novo contrato
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card/50 border-border/50 text-xs sm:text-sm">
            <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusConfig).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contracts Table */}
      {filteredContracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 sm:py-16 border-2 border-dashed border-border rounded-xl bg-white/5"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Nenhum contrato encontrado' : 'Nenhum contrato criado'}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-sm mx-auto px-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros'
              : 'Crie seu primeiro contrato'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro contrato
            </Button>
          )}
        </motion.div>
      ) : (
        <>
          {/* Desktop Table - Genesis Standard */}
          <div className="hidden md:block rounded-xl border border-border/50 bg-card/30 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_auto] gap-4 px-4 py-3 bg-card/60 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recorrência</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
              <span className="w-8"></span>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-border/20">
              {filteredContracts.map((contract) => {
                const config = statusConfig[contract.status] || statusConfig.draft;
                return (
                  <div 
                    key={contract.id}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_auto] gap-4 px-4 py-3.5 hover:bg-card/50 cursor-pointer transition-colors group items-center"
                    onClick={() => onViewContract(contract.id)}
                  >
                    {/* Nome */}
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground truncate block group-hover:text-blue-400 transition-colors">
                        {contract.contractor_name}
                      </span>
                    </div>
                    
                    {/* Tipo */}
                    <div className="min-w-0">
                      <span className="text-sm text-muted-foreground truncate block">
                        {contract.service_type}
                      </span>
                    </div>
                    
                    {/* Recorrência */}
                    <div>
                      <span className={`text-sm whitespace-nowrap ${contract.service_modality === 'recorrente' ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                        {contract.service_modality === 'recorrente' 
                          ? `${formatCurrency(contract.total_value)}/mês` 
                          : 'Pontual'}
                      </span>
                    </div>
                    
                    {/* Valor */}
                    <div>
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatCurrency(contract.total_value)}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div>
                      <Badge variant="outline" className={`${config.color} text-xs py-0.5 px-2 whitespace-nowrap`}>
                        {config.label}
                      </Badge>
                    </div>
                    
                    {/* Actions */}
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewContract(contract.id); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownloadPDF(contract, e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => e.stopPropagation()}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredContracts.map((contract) => {
              const config = statusConfig[contract.status] || statusConfig.draft;
              return (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card/40 border border-border/50 rounded-xl p-4 cursor-pointer active:bg-card/60 transition-colors"
                  onClick={() => onViewContract(contract.id)}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {contract.contractor_name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {contract.service_type}
                      </p>
                    </div>
                    <Badge variant="outline" className={`${config.color} text-[10px] py-0.5 px-2 flex-shrink-0`}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-muted-foreground">Valor: </span>
                        <span className="font-semibold text-foreground">{formatCurrency(contract.total_value)}</span>
                      </div>
                      <div>
                        <span className={`${contract.service_modality === 'recorrente' ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                          {contract.service_modality === 'recorrente' ? 'Recorrente' : 'Pontual'}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewContract(contract.id); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDownloadPDF(contract, e)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => e.stopPropagation()}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Legal Notice */}
      <p className="text-[10px] text-center text-muted-foreground/70 italic">
        ⚠️ Este sistema não substitui a consultoria de um advogado.
      </p>
    </div>
  );
}