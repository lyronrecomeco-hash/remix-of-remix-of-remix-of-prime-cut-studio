import { 
  Building2, 
  Phone, 
  Globe, 
  MapPin,
  Sparkles,
  Send,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Prospect, ProspectStatus } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryTabProps {
  prospects: Prospect[];
  loading: boolean;
  analyzing: boolean;
  sending: boolean;
  onAnalyze: (id: string) => void;
  onSend: (id: string) => void;
  onView: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ProspectStatus) => void;
}

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'text-yellow-600', bg: 'bg-yellow-500/10 border-yellow-500/30' },
  analyzing: { label: 'Analisando', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/30' },
  analyzed: { label: 'Analisado', color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/30' },
  proposal_ready: { label: 'Proposta Pronta', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  sent: { label: 'Enviado', color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/30' },
  replied: { label: 'Respondido', color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  converted: { label: 'Convertido', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30' },
  rejected: { label: 'Rejeitado', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/30' },
  failed: { label: 'Falhou', color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-500/30' },
};

export const HistoryTab = ({
  prospects,
  loading,
  analyzing,
  sending,
  onAnalyze,
  onSend,
  onView,
  onDelete,
}: HistoryTabProps) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Carregando prospects...</p>
        </CardContent>
      </Card>
    );
  }

  if (prospects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum Prospect Ainda
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Use a aba "Buscar Clientes" para encontrar e adicionar estabelecimentos à sua lista de prospects.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            Seus Prospects ({prospects.length})
          </h3>
        </div>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {prospects.map((prospect) => {
              const status = STATUS_CONFIG[prospect.status] || STATUS_CONFIG.pending;
              
              return (
                <div
                  key={prospect.id}
                  className="bg-background border-2 border-border rounded-xl p-4 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {prospect.company_name}
                          </h4>
                          
                          {prospect.company_address && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {prospect.company_address}
                            </p>
                          )}
                        </div>
                        
                        <Badge className={`shrink-0 ${status.bg} ${status.color} border`}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {prospect.company_phone && (
                          <Badge variant="outline" className="text-xs gap-1 font-mono">
                            <Phone className="w-3 h-3" />
                            {prospect.company_phone}
                          </Badge>
                        )}
                        
                        {prospect.company_website && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Globe className="w-3 h-3" />
                            {prospect.company_website}
                          </Badge>
                        )}
                        
                        {prospect.niche && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Tag className="w-3 h-3" />
                            {prospect.niche}
                          </Badge>
                        )}
                        
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(prospect.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(prospect)}
                          className="gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </Button>
                        
                        {(prospect.status === 'pending' || prospect.status === 'analyzed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAnalyze(prospect.id)}
                            disabled={analyzing}
                            className="gap-1"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-pulse' : ''}`} />
                            Analisar
                          </Button>
                        )}
                        
                        {(prospect.status === 'analyzed' || prospect.status === 'proposal_ready') && (
                          <Button
                            size="sm"
                            onClick={() => onSend(prospect.id)}
                            disabled={sending}
                            className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          >
                            <Send className={`w-3.5 h-3.5 ${sending ? 'animate-pulse' : ''}`} />
                            Enviar
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(prospect.id)}
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
