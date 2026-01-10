/**
 * CONTACTS PREVIEW CARD - Preview detalhado dos contatos extraídos
 * COM CHECKBOXES para seleção individual de destinatários
 * Todos selecionados por padrão, usuário desmarca quem NÃO vai receber
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Phone, 
  Mail, 
  Package, 
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CaktoContact } from './hooks/useCaktoContacts';

interface ContactsPreviewCardProps {
  contacts: CaktoContact[];
  loading: boolean;
  eventType: string;
  className?: string;
  // Novos props para seleção
  selectedPhones?: Set<string>;
  onSelectionChange?: (selectedPhones: Set<string>) => void;
}

// Status badges com cores e ícones
const STATUS_CONFIG = {
  unpaid: {
    label: 'Aguardando Pagamento',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    icon: AlertTriangle,
  },
  paid: {
    label: 'Pago',
    color: 'bg-green-500/10 text-green-600 border-green-500/30',
    icon: CheckCircle,
  },
  unknown: {
    label: '',
    color: '',
    icon: null,
  },
};

export function ContactsPreviewCard({ 
  contacts, 
  loading, 
  eventType,
  className,
  selectedPhones,
  onSelectionChange,
}: ContactsPreviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  // Estado interno para seleção (todos selecionados por padrão)
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  
  // Usar estado externo se fornecido, caso contrário interno
  const selected = selectedPhones ?? internalSelected;
  const setSelected = onSelectionChange ?? setInternalSelected;

  // Quando contacts mudam, selecionar todos por padrão
  useEffect(() => {
    if (contacts.length > 0) {
      const allPhones = new Set(contacts.map(c => c.phone));
      setSelected(allPhones);
    }
  }, [contacts, setSelected]);

  const displayedContacts = showAll ? contacts : contacts.slice(0, 5);
  const selectedCount = selected.size;
  const allSelected = selectedCount === contacts.length && contacts.length > 0;

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Toggle individual
  const handleToggle = (phone: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelected(newSelected);
  };

  // Toggle todos
  const handleToggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map(c => c.phone)));
    }
  };

  // Contagem de status
  const statusCounts = useMemo(() => {
    return contacts.reduce((acc, c) => {
      acc[c.paymentStatus] = (acc[c.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [contacts]);

  if (loading) {
    return (
      <Card className={cn("border-primary/20", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContacts = contacts.length > 0;
  const isUnpaidEvent = eventType === 'pix_unpaid';
  const statusColor = hasContacts 
    ? (isUnpaidEvent ? 'border-amber-500/30 bg-amber-500/5' : 'border-green-500/30 bg-green-500/5')
    : 'border-yellow-500/30 bg-yellow-500/5';
  const iconColor = hasContacts 
    ? (isUnpaidEvent ? 'text-amber-500' : 'text-green-500')
    : 'text-yellow-500';

  return (
    <Card className={cn(statusColor, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className={cn("w-5 h-5", iconColor)} />
            Contatos Extraídos
            <Badge variant={hasContacts ? "default" : "secondary"}>
              {selectedCount}/{contacts.length}
            </Badge>
            {isUnpaidEvent && hasContacts && statusCounts.unpaid && (
              <Badge variant="outline" className="gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
                <AlertTriangle className="w-3 h-3" />
                {statusCounts.unpaid} aguardando
              </Badge>
            )}
          </CardTitle>
          {hasContacts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-1"
            >
              {expanded ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Ver todos
                </>
              )}
            </Button>
          )}
        </div>
        {!hasContacts && (
          <p className="text-sm text-muted-foreground mt-1">
            Nenhum contato encontrado para este evento
          </p>
        )}
        {hasContacts && isUnpaidEvent && (
          <p className="text-xs text-muted-foreground mt-1">
            ✓ Verificação rigorosa: email + telefone + ID da transação
          </p>
        )}
      </CardHeader>

      {hasContacts && (
        <CardContent>
          {/* Checkbox Selecionar Todos */}
          <div className="flex items-center gap-2 p-3 mb-3 rounded-lg border border-primary/20 bg-primary/5">
            <Checkbox 
              id="select-all-contacts"
              checked={allSelected}
              onCheckedChange={handleToggleAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label 
              htmlFor="select-all-contacts" 
              className="cursor-pointer flex items-center gap-2 text-sm font-medium"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground" />
              )}
              Selecionar Todos ({contacts.length} contatos)
            </Label>
            {selectedCount < contacts.length && selectedCount > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {contacts.length - selectedCount} desmarcados
              </Badge>
            )}
          </div>

          <ScrollArea className={cn(expanded ? "h-[300px]" : "h-auto")}>
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {displayedContacts.map((contact, index) => {
                  const statusConfig = STATUS_CONFIG[contact.paymentStatus];
                  const StatusIcon = statusConfig?.icon;
                  const isSelected = selected.has(contact.phone);
                  
                  return (
                    <motion.div
                      key={contact.externalId || index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleToggle(contact.phone)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "bg-primary/5 border-primary/30 hover:border-primary/50" 
                          : "bg-muted/30 border-border/30 opacity-60 hover:opacity-80"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(contact.phone)}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1.5">
                              {/* Nome, telefone e STATUS */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-medium text-sm truncate max-w-[150px]">
                                    {contact.name || 'Sem nome'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                  <Phone className="w-3 h-3" />
                                  {contact.phone}
                                </div>
                                {/* STATUS BADGE */}
                                {statusConfig?.label && (
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs gap-1 shrink-0", statusConfig.color)}
                                  >
                                    {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                    {statusConfig.label}
                                  </Badge>
                                )}
                              </div>

                              {/* Email e produto */}
                              <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                                {contact.email && (
                                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                                    <Mail className="w-3 h-3" />
                                    {contact.email}
                                  </div>
                                )}
                                {contact.productName && (
                                  <div className="flex items-center gap-1 truncate max-w-[150px]">
                                    <Package className="w-3 h-3" />
                                    {contact.productName}
                                  </div>
                                )}
                              </div>

                              {/* Data/hora precisa */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                                <Clock className="w-3 h-3" />
                                {contact.formattedDate}
                              </div>
                            </div>

                            {/* Valor */}
                            {contact.orderValue && (
                              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                <DollarSign className="w-3.5 h-3.5" />
                                {formatCurrency(contact.orderValue)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </ScrollArea>

          {/* Ver mais/menos */}
          {contacts.length > 5 && !expanded && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 gap-1"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Ver mais ({contacts.length - 5} restantes)
                </>
              )}
            </Button>
          )}

          {/* Resumo */}
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <strong className="text-foreground">{selectedCount}</strong> selecionados para envio
            </span>
            {contacts.some(c => c.orderValue) && (
              <span className="font-medium text-foreground">
                Total: {formatCurrency(contacts.filter(c => selected.has(c.phone)).reduce((sum, c) => sum + (c.orderValue || 0), 0))}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
