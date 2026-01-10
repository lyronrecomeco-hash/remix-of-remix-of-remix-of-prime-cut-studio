/**
 * CONTACTS PREVIEW CARD - Preview detalhado dos contatos extraídos
 * Exibe nome, telefone, email, produto, valor e data/hora precisa
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CaktoContact } from './hooks/useCaktoContacts';

interface ContactsPreviewCardProps {
  contacts: CaktoContact[];
  loading: boolean;
  eventType: string;
  className?: string;
}

export function ContactsPreviewCard({ 
  contacts, 
  loading, 
  eventType,
  className 
}: ContactsPreviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedContacts = showAll ? contacts : contacts.slice(0, 5);

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
  const statusColor = hasContacts ? 'border-green-500/30 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5';
  const iconColor = hasContacts ? 'text-green-500' : 'text-yellow-500';

  return (
    <Card className={cn(statusColor, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className={cn("w-5 h-5", iconColor)} />
            Contatos Extraídos
            <Badge variant={hasContacts ? "default" : "secondary"}>
              {contacts.length}
            </Badge>
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
      </CardHeader>

      {hasContacts && (
        <CardContent>
          <ScrollArea className={cn(expanded ? "h-[300px]" : "h-auto")}>
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {displayedContacts.map((contact, index) => (
                  <motion.div
                    key={contact.externalId || index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-3 rounded-lg bg-background/80 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Nome e telefone */}
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
                  </motion.div>
                ))}
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
            <span>
              {contacts.length} contatos únicos (sem duplicatas)
            </span>
            {contacts.some(c => c.orderValue) && (
              <span className="font-medium text-foreground">
                Total: {formatCurrency(contacts.reduce((sum, c) => sum + (c.orderValue || 0), 0))}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
