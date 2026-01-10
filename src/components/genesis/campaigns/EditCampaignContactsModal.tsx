/**
 * GENESIS CAMPAIGNS - Edit Campaign Contacts Modal
 * Modal for managing campaign contacts - view, remove sent, resend pending
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X,
  Users,
  Trash2,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  TrendingUp,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CampaignContact } from './types';

interface EditCampaignContactsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: CampaignContact[];
  onRemoveContacts: (contactIds: string[]) => Promise<void>;
  onMarkForResend: (contactIds: string[]) => Promise<void>;
  loading?: boolean;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'sent', label: 'Enviados' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'read', label: 'Lidos' },
  { value: 'replied', label: 'Respondidos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'queued', label: 'Na fila' },
  { value: 'failed', label: 'Falhou' },
  { value: 'undelivered', label: 'Não entregue' },
];

export function EditCampaignContactsModal({
  open,
  onOpenChange,
  contacts,
  onRemoveContacts,
  onMarkForResend,
  loading,
}: EditCampaignContactsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !search || 
        contact.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        contact.contact_phone.includes(search);
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: contacts.length,
    sent: contacts.filter(c => c.status === 'sent').length,
    delivered: contacts.filter(c => c.status === 'delivered').length,
    pending: contacts.filter(c => ['pending', 'queued'].includes(c.status)).length,
    failed: contacts.filter(c => ['failed', 'undelivered'].includes(c.status)).length,
  }), [contacts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'failed':
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'undelivered':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'read':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'replied':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'failed':
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'undelivered':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const selectSent = () => {
    const sentIds = contacts.filter(c => c.status === 'sent').map(c => c.id);
    setSelectedIds(new Set(sentIds));
  };

  const selectPending = () => {
    const pendingIds = contacts.filter(c => 
      ['pending', 'queued', 'failed', 'undelivered'].includes(c.status)
    ).map(c => c.id);
    setSelectedIds(new Set(pendingIds));
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onRemoveContacts(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkForResend = async () => {
    if (selectedIds.size === 0) return;
    
    setIsProcessing(true);
    try {
      await onMarkForResend(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  // Get first name only for display
  const getFirstName = (fullName?: string) => {
    if (!fullName) return '';
    return fullName.split(' ')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Contatos da Campanha
          </DialogTitle>
        </DialogHeader>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{stats.total}</span>
            <span className="text-muted-foreground">total</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium">{stats.sent}</span>
            <span className="text-muted-foreground">enviados</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{stats.pending}</span>
            <span className="text-muted-foreground">pendentes</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="font-medium">{stats.failed}</span>
            <span className="text-muted-foreground">falhas</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(filter => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selectedIds.size === filteredContacts.length ? 'Desmarcar todos' : 'Selecionar todos'}
          </Button>
          <Button variant="outline" size="sm" onClick={selectSent}>
            Selecionar enviados ({stats.sent})
          </Button>
          <Button variant="outline" size="sm" onClick={selectPending}>
            Selecionar pendentes ({stats.pending + stats.failed})
          </Button>
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedIds.size} selecionado(s)
            </Badge>
          )}
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1 min-h-0 border rounded-lg">
          <div className="divide-y">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum contato encontrado
              </div>
            ) : (
              filteredContacts.map(contact => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer",
                    selectedIds.has(contact.id) && "bg-primary/5"
                  )}
                  onClick={() => toggleSelect(contact.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={() => toggleSelect(contact.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(contact.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {getFirstName(contact.contact_name) || contact.contact_phone}
                      </p>
                      <p className="text-xs text-muted-foreground">{contact.contact_phone}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn("text-xs", getStatusColor(contact.status))}>
                    {contact.status}
                  </Badge>

                  {contact.sent_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(contact.sent_at), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleMarkForResend}
              disabled={selectedIds.size === 0 || isProcessing || loading}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Marcar p/ Reenvio ({selectedIds.size})
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveSelected}
              disabled={selectedIds.size === 0 || isProcessing || loading}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover ({selectedIds.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
