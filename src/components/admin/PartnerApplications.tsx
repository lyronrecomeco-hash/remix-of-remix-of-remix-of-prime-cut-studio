import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApplicationModal } from './ApplicationModal';
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

const statusConfig: Record<ApplicationStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' },
  approved: { label: 'Aprovado', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/20' },
  rejected: { label: 'Rejeitado', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/20' },
};

const PartnerApplications = () => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for status since DB returns string
      const typedData = (data || []).map(app => ({
        ...app,
        status: app.status as ApplicationStatus
      }));
      
      setApplications(typedData);
      setFilteredApplications(typedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Erro ao carregar inscrições');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.full_name.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        app.whatsapp.includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleApplicationClick = (application: PartnerApplication) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleStatusUpdate = () => {
    fetchApplications();
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Inscrições de Parceiros</h2>
          <p className="text-muted-foreground">{applications.length} inscrição(ões) no total</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchApplications}
          disabled={isLoading}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rejeitados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status 
                ? 'bg-primary text-white' 
                : 'border-white/20 text-white/70 hover:bg-white/10'
              }
            >
              {status === 'all' ? 'Todos' : statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma inscrição encontrada</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredApplications.map((application, index) => {
              const statusInfo = statusConfig[application.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleApplicationClick(application)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/[0.08] hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {application.full_name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{application.full_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{application.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(application.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:justify-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusInfo.bgColor} ${statusInfo.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <ApplicationModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default PartnerApplications;
