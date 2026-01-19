import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import jsPDF from 'jspdf';

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  status: string;
  contractor_name: string;
  contracted_name: string;
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
  draft: { label: 'Rascunho', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: FileText },
  pending_signature: { label: 'Aguardando Assinatura', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  partially_signed: { label: 'Parcialmente Assinado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FileSignature },
  signed: { label: 'Assinado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  expired: { label: 'Expirado', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertTriangle },
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
        .select('id, contract_number, title, status, contractor_name, contracted_name, total_value, created_at, service_type, service_modality, generated_content')
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

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} gap-1 text-[10px]`}>
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{config.label}</span>
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDownloadPDF = (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!contract.generated_content) {
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
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">Contratos</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <Button onClick={onCreateNew} className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 w-full sm:w-auto text-sm">
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
          className="text-center py-12 sm:py-16 border-2 border-dashed border-border rounded-xl bg-card/30"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
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
            <Button onClick={onCreateNew} className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600">
              <Plus className="w-4 h-4" />
              Criar primeiro contrato
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-card/60 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Nome</span>
            <span>Tipo</span>
            <span>Recorrência</span>
            <span>Valor</span>
            <span>Status</span>
            <span className="w-8"></span>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-border/20">
            {filteredContracts.map((contract) => {
              const config = statusConfig[contract.status] || statusConfig.draft;
              return (
                <div 
                  key={contract.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3.5 hover:bg-card/50 cursor-pointer transition-colors group"
                  onClick={() => onViewContract(contract.id)}
                >
                  {/* Nome */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate group-hover:text-blue-400 transition-colors">
                      {contract.contractor_name}
                    </span>
                  </div>
                  
                  {/* Tipo */}
                  <div className="flex items-center min-w-0">
                    <span className="text-sm text-muted-foreground truncate">
                      {contract.service_type}
                    </span>
                  </div>
                  
                  {/* Recorrência */}
                  <div className="flex items-center">
                    <span className={`text-sm ${contract.service_modality === 'recorrente' ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      {contract.service_modality === 'recorrente' 
                        ? `${formatCurrency(contract.total_value)}/mês` 
                        : 'Pontual'}
                    </span>
                  </div>
                  
                  {/* Valor */}
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(contract.total_value)}
                    </span>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center">
                    <Badge variant="outline" className={`${config.color} text-[10px] sm:text-xs py-0.5 px-2`}>
                      {config.label}
                    </Badge>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center">
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
      )}

      {/* Legal Notice */}
      <p className="text-[10px] text-center text-muted-foreground/70 italic">
        ⚠️ Este sistema não substitui a consultoria de um advogado.
      </p>
    </div>
  );
}
