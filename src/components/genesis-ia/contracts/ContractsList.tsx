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

      {/* Contracts Grid */}
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
        <div className="grid gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
              >
                <div 
                  className="group p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-card to-card/80 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => onViewContract(contract.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-600/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-blue-400 transition-colors">
                            {contract.contractor_name}
                          </h3>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                            {contract.service_type}
                          </Badge>
                          {contract.service_modality === 'recorrente' && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              Mensal: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.total_value)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {contract.title} • {contract.service_modality === 'recorrente' ? 'Recorrente' : contract.service_modality === 'pontual' ? 'Pontual' : 'Por Demanda'}
                        </p>
                      </div>
                    </div>

                    {/* Status & Value */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {formatCurrency(contract.total_value)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(contract.created_at), "dd MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      
                      {getStatusBadge(contract.status)}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Legal Notice */}
      <p className="text-[10px] text-center text-muted-foreground/70 italic">
        ⚠️ Este sistema não substitui a consultoria de um advogado.
      </p>
    </div>
  );
}
