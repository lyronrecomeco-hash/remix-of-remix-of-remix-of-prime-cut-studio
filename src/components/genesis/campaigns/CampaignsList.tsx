/**
 * GENESIS CAMPAIGNS - Campaigns List Component
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Smartphone,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { Campaign, CampaignStatus } from './types';
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from './types';

interface CampaignsListProps {
  campaigns: Campaign[];
  loading: boolean;
  onCreateNew: () => void;
  onViewDetails: (campaign: Campaign) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignsList({
  campaigns,
  loading,
  onCreateNew,
  onViewDetails,
  onStart,
  onPause,
  onDelete,
}: CampaignsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Stats calculation
  const stats = {
    total: campaigns.length,
    running: campaigns.filter(c => c.status === 'running').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
  };

  const getProgressPercent = (campaign: Campaign) => {
    if (campaign.total_contacts === 0) return 0;
    return Math.round((campaign.sent_count / campaign.total_contacts) * 100);
  };

  const canStart = (status: CampaignStatus) => 
    status === 'draft' || status === 'paused' || status === 'scheduled';
  
  const canPause = (status: CampaignStatus) => 
    status === 'running';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Send className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Send className="w-6 h-6 text-primary" />
            Campanhas WhatsApp
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de disparos em massa com proteção anti-ban
          </p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.running}</p>
                <p className="text-xs text-muted-foreground">Em execução</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Mensagens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha ainda</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Crie sua primeira campanha para começar a enviar mensagens em massa com segurança.
            </p>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow border-primary/5">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Main Info */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{campaign.name}</h3>
                              {campaign.luna_enabled && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <Sparkles className="w-3 h-3" />
                                  Luna AI
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5" />
                                {campaign.instance?.name || 'Sem instância'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(campaign.created_at), "dd MMM yyyy", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                          <Badge className={cn("border", CAMPAIGN_STATUS_COLORS[campaign.status])}>
                            {CAMPAIGN_STATUS_LABELS[campaign.status]}
                          </Badge>
                        </div>

                        {/* Type Badge */}
                        <Badge variant="outline" className="mb-3">
                          {CAMPAIGN_TYPE_LABELS[campaign.campaign_type]}
                        </Badge>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">
                              {campaign.sent_count} / {campaign.total_contacts} ({getProgressPercent(campaign)}%)
                            </span>
                          </div>
                          <Progress value={getProgressPercent(campaign)} className="h-2" />
                        </div>
                      </div>

                      {/* Stats Sidebar */}
                      <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-border p-5 bg-muted/30">
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{campaign.total_contacts} contatos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{campaign.delivered_count} entregues</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">{campaign.read_count} lidas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">{campaign.replied_count} respostas</span>
                          </div>
                          {campaign.failed_count > 0 && (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm">{campaign.failed_count} falhas</span>
                            </div>
                          )}
                          {campaign.blocked_count > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{campaign.blocked_count} bloqueios</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                          {canStart(campaign.status) && (
                            <Button 
                              size="sm" 
                              onClick={() => onStart(campaign.id)}
                              className="flex-1 gap-1"
                            >
                              <Play className="w-4 h-4" />
                              Iniciar
                            </Button>
                          )}
                          {canPause(campaign.status) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onPause(campaign.id)}
                              className="flex-1 gap-1"
                            >
                              <Pause className="w-4 h-4" />
                              Pausar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewDetails(campaign)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onViewDetails(campaign)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteConfirm(campaign.id)}
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados da campanha, incluindo contatos e logs, serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
