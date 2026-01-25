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
  FileSignature,
  DollarSign,
  RefreshCw
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
  draft: { label: 'Rascunho', color: 'bg-white/10 text-white/60 border-white/20', icon: FileText },
  pending_signature: { label: 'Aguardando', color: 'bg-primary/20 text-primary border-primary/30', icon: Clock },
  partially_signed: { label: 'Parcial', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: FileSignature },
  signed: { label: 'Assinado', color: 'bg-primary/20 text-primary border-primary/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
  expired: { label: 'Expirado', color: 'bg-white/10 text-white/50 border-white/20', icon: AlertTriangle },
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDownloadPDF = async (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();

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
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Contratos</h2>
            <p className="text-xs text-muted-foreground">{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <Button onClick={onCreateNew} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Criar novo contrato
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contratos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
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

      {/* Contracts Grid - Card Style like Library */}
      {filteredContracts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl bg-white/5"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Nenhum contrato encontrado' : 'Nenhum contrato criado'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto px-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContracts.map((contract, index) => {
            const config = statusConfig[contract.status] || statusConfig.draft;
            const StatusIcon = config.icon;
            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-primary/30 cursor-pointer transition-all group min-h-[200px] flex flex-col"
                onClick={() => onViewContract(contract.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                        {contract.contractor_name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {contract.service_type}
                      </p>
                    </div>
                  </div>
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

                {/* Value & Recurrence */}
                <div className="grid grid-cols-2 gap-4 mb-5 flex-1">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      Valor
                    </div>
                    <p className="text-base font-bold text-foreground">{formatCurrency(contract.total_value)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Tipo
                    </div>
                    <p className={`text-base font-medium ${contract.service_modality === 'recorrente' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {contract.service_modality === 'recorrente' ? 'Recorrente' : 'Pontual'}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <Badge variant="outline" className={`${config.color} text-xs gap-1.5 py-1`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(contract.created_at)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}