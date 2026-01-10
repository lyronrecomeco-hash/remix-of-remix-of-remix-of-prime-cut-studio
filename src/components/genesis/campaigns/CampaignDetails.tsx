/**
 * GENESIS CAMPAIGNS - Campaign Details View
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Play,
  Pause,
  XCircle,
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  Eye,
  TrendingUp,
  AlertTriangle,
  Clock,
  Smartphone,
  Sparkles,
  FileText,
  Activity,
  RefreshCw,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Campaign, CampaignContact, CampaignLog } from './types';
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS } from './types';

interface CampaignDetailsProps {
  campaign: Campaign;
  contacts: CampaignContact[];
  logs: CampaignLog[];
  onBack: () => void;
  onStart: () => void;
  onPause: () => void;
  onCancel: () => void;
  onRefresh: () => void;
  onRetryPending?: () => void;
  onMarkUndelivered?: () => void;
  onEditContacts?: () => void;
  pendingCount?: number;
  sentCount?: number;
  loading?: boolean;
}

export function CampaignDetails({
  campaign,
  contacts,
  logs,
  onBack,
  onStart,
  onPause,
  onCancel,
  onRefresh,
  onRetryPending,
  onMarkUndelivered,
  onEditContacts,
  pendingCount = 0,
  sentCount = 0,
  loading,
}: CampaignDetailsProps) {
  const progressPercent = campaign.total_contacts > 0
    ? Math.round((campaign.sent_count / campaign.total_contacts) * 100)
    : 0;

  const canStart = ['draft', 'paused', 'scheduled'].includes(campaign.status);
  const canPause = campaign.status === 'running';
  const canCancel = ['running', 'paused', 'scheduled'].includes(campaign.status);

  const getContactStatusIcon = (status: string) => {
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

  const getLogSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'info':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{campaign.name}</h2>
              {campaign.luna_enabled && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Luna AI
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                {campaign.instance?.name || 'Sem instância'}
              </span>
              <span>•</span>
              <span>{CAMPAIGN_TYPE_LABELS[campaign.campaign_type]}</span>
              <span>•</span>
              <span>
                Criada em {format(new Date(campaign.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn("border text-sm px-3 py-1", CAMPAIGN_STATUS_COLORS[campaign.status])}>
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </Badge>
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {canStart && (
          <Button onClick={onStart} className="gap-2">
            <Play className="w-4 h-4" />
            Iniciar Campanha
          </Button>
        )}
        {canPause && (
          <Button variant="outline" onClick={onPause} className="gap-2">
            <Pause className="w-4 h-4" />
            Pausar
          </Button>
        )}
        {onEditContacts && (
          <Button variant="outline" onClick={onEditContacts} className="gap-2">
            <Pencil className="w-4 h-4" />
            Editar Contatos
          </Button>
        )}
        {pendingCount > 0 && onRetryPending && (
          <Button variant="secondary" onClick={onRetryPending} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reenviar Pendentes ({pendingCount})
          </Button>
        )}
        {sentCount > 0 && onMarkUndelivered && !canPause && (
          <Button variant="outline" onClick={onMarkUndelivered} className="gap-2 text-orange-600 border-orange-300 hover:bg-orange-50">
            <AlertTriangle className="w-4 h-4" />
            Marcar Enviados p/ Reenvio ({sentCount})
          </Button>
        )}
        {canCancel && (
          <Button variant="destructive" onClick={onCancel} className="gap-2">
            <XCircle className="w-4 h-4" />
            Cancelar
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{campaign.total_contacts}</p>
            <p className="text-xs text-muted-foreground">Contatos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Send className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{campaign.sent_count}</p>
            <p className="text-xs text-muted-foreground">Enviadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{campaign.delivered_count}</p>
            <p className="text-xs text-muted-foreground">Entregues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
            <p className="text-2xl font-bold">{campaign.read_count}</p>
            <p className="text-xs text-muted-foreground">Lidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{campaign.replied_count}</p>
            <p className="text-xs text-muted-foreground">Respostas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{campaign.failed_count}</p>
            <p className="text-xs text-muted-foreground">Falhas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">{campaign.blocked_count}</p>
            <p className="text-xs text-muted-foreground">Bloqueios</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Envio</span>
            <span className="text-sm text-muted-foreground">
              {campaign.sent_count} / {campaign.total_contacts} ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {campaign.credits_consumed > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Créditos consumidos: {campaign.credits_consumed}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs defaultValue="message" className="w-full">
        <TabsList>
          <TabsTrigger value="message" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            Mensagem
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1">
            <Users className="w-4 h-4" />
            Contatos ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1">
            <Activity className="w-4 h-4" />
            Logs ({logs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="message" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template da Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                {campaign.message_template}
              </div>
              {campaign.luna_enabled && campaign.luna_generated_variations && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Variações Luna AI ({(campaign.luna_generated_variations as string[]).length})
                  </h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {(campaign.luna_generated_variations as string[]).map((variation, i) => (
                        <div key={i} className="bg-purple-500/5 rounded-lg p-3 text-sm">
                          <Badge variant="secondary" className="mb-2">Variação {i + 1}</Badge>
                          <p className="whitespace-pre-wrap">{variation}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="divide-y">
                  {contacts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum contato adicionado
                    </div>
                  ) : (
                    contacts.map(contact => (
                      <div key={contact.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getContactStatusIcon(contact.status)}
                          <div>
                            <p className="font-medium">{contact.contact_name || contact.contact_phone}</p>
                            <p className="text-xs text-muted-foreground">{contact.contact_phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {contact.status}
                          </Badge>
                          {contact.sent_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(contact.sent_at), "HH:mm", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="divide-y">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhum log disponível
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge className={cn("text-xs", getLogSeverityColor(log.severity))}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.event_type}</p>
                            <p className="text-sm text-muted-foreground">{log.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(log.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
