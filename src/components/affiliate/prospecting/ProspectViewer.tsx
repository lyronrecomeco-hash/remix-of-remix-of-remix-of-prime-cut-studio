import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Send, 
  Copy,
  CheckCircle,
  XCircle,
  ExternalLink,
  Save,
  MessageSquare,
  Star,
  Calendar,
  User,
  Loader2,
  Languages
} from 'lucide-react';
import { Prospect } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GlobalMessageGenerator } from './global/GlobalMessageGenerator';

interface ProspectViewerProps {
  prospect: Prospect | null;
  open: boolean;
  onClose: () => void;
  onAnalyze: (id: string) => void;
  onSend: (id: string) => void;
  analyzing: boolean;
  sending: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  analyzing: { label: 'Analisando', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  analyzed: { label: 'Analisado', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  proposal_ready: { label: 'Proposta Pronta', color: 'bg-primary/10 text-primary border-primary/30' },
  sent: { label: 'Enviado', color: 'bg-green-500/10 text-green-600 border-green-500/30' },
  replied: { label: 'Respondido', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  converted: { label: 'Convertido', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
};

export const ProspectViewer = ({
  prospect,
  open,
  onClose,
  onAnalyze,
  onSend,
  analyzing,
  sending,
}: ProspectViewerProps) => {
  const [saving, setSaving] = useState(false);

  if (!prospect) return null;

  const canAnalyze = prospect.status === 'pending';
  const canSend = (prospect.status === 'proposal_ready' || prospect.status === 'analyzed') && prospect.company_phone;
  const proposal = prospect.generated_proposal;
  const analysis = prospect.analysis_data;
  const statusConfig = STATUS_LABELS[prospect.status] || STATUS_LABELS.pending;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para área de transferência!');
  };

  const handleSaveProposal = async () => {
    if (!proposal) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('affiliate_prospects')
        .update({ 
          status: 'proposal_ready',
          notes: `Proposta salva em ${new Date().toLocaleString('pt-BR')}`
        })
        .eq('id', prospect.id);

      if (error) throw error;
      toast.success('Proposta salva no histórico!');
    } catch (error) {
      console.error('Erro ao salvar proposta:', error);
      toast.error('Erro ao salvar proposta');
    } finally {
      setSaving(false);
    }
  };

  const handleSendWhatsApp = () => {
    onSend(prospect.id);
  };

  const openWhatsAppManual = () => {
    if (!prospect.company_phone || !proposal?.mensagem_whatsapp) return;
    const phone = prospect.company_phone.replace(/\D/g, '');
    const message = encodeURIComponent(proposal.mensagem_whatsapp);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-foreground mb-2">
                  {prospect.company_name}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${statusConfig.color} border`}>
                    {statusConfig.label}
                  </Badge>
                  {prospect.niche && (
                    <Badge variant="secondary" className="gap-1">
                      {prospect.niche}
                    </Badge>
                  )}
                  {prospect.analysis_score > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="w-3 h-3" />
                      Score: {prospect.analysis_score}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <Tabs defaultValue="info" className="w-full">
            <div className="px-6 pt-4 bg-background sticky top-0 z-10">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="info" className="gap-2">
                  <User className="w-4 h-4" />
                  Informações
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Análise
                </TabsTrigger>
                <TabsTrigger value="proposal" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Proposta
                </TabsTrigger>
                <TabsTrigger value="global" className="gap-2">
                  <Languages className="w-4 h-4" />
                  Global
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Informações */}
            <TabsContent value="info" className="p-6 space-y-6 mt-0">
              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prospect.company_phone && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="font-medium">{prospect.company_phone}</p>
                    </div>
                  </div>
                )}
                {prospect.company_email && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{prospect.company_email}</p>
                    </div>
                  </div>
                )}
                {prospect.company_website && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a 
                        href={`https://${prospect.company_website.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        {prospect.company_website}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
                {(prospect.company_city || prospect.company_state) && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Localização</p>
                      <p className="font-medium">
                        {prospect.company_city}{prospect.company_state && `, ${prospect.company_state}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              {prospect.company_address && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Endereço Completo</p>
                  <p className="text-sm">{prospect.company_address}</p>
                </div>
              )}

              {/* Notes */}
              {prospect.notes && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{prospect.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <Separator />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Criado: {format(new Date(prospect.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
                {prospect.sent_at && (
                  <div className="flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    Enviado: {format(new Date(prospect.sent_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Análise */}
            <TabsContent value="analysis" className="p-6 space-y-6 mt-0">
              {!analysis ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Prospect ainda não analisado
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    A análise identifica recursos ausentes e oportunidades de venda
                  </p>
                  {canAnalyze && (
                    <Button onClick={() => onAnalyze(prospect.id)} disabled={analyzing} size="lg">
                      <Sparkles className={`w-4 h-4 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
                      {analyzing ? 'Analisando...' : 'Iniciar Análise'}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Features Grid */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Recursos Detectados
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'hasWebsite', label: 'Website Próprio', icon: Globe },
                        { key: 'hasWhatsAppButton', label: 'WhatsApp Integrado', icon: MessageSquare },
                        { key: 'hasOnlineScheduling', label: 'Agendamento Online', icon: Calendar },
                        { key: 'hasChatbot', label: 'Chatbot/Automação', icon: Sparkles },
                        { key: 'hasOnlinePayment', label: 'Pagamento Online', icon: CheckCircle },
                        { key: 'hasSocialMedia', label: 'Redes Sociais Ativas', icon: User },
                      ].map(({ key, label, icon: Icon }) => {
                        const hasFeature = analysis[key as keyof typeof analysis];
                        return (
                          <div 
                            key={key} 
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              hasFeature 
                                ? 'bg-green-500/5 border-green-500/20' 
                                : 'bg-red-500/5 border-red-500/20'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              hasFeature ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                              {hasFeature ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pain Points */}
                  {prospect.pain_points.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        🎯 Dores Identificadas
                      </h4>
                      <div className="space-y-2">
                        {prospect.pain_points.map((pain, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-red-600">{i + 1}</span>
                            </div>
                            <p className="text-sm">{pain}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opportunities */}
                  {analysis.opportunities && analysis.opportunities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        🚀 Oportunidades de Venda
                      </h4>
                      <div className="space-y-2">
                        {analysis.opportunities.map((opp, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </div>
                            <p className="text-sm">{opp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Proposta */}
            <TabsContent value="proposal" className="p-6 space-y-6 mt-0">
              {!proposal ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Proposta ainda não gerada
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Primeiro analise o prospect para gerar uma proposta personalizada
                  </p>
                  {canAnalyze && (
                    <Button onClick={() => onAnalyze(prospect.id)} disabled={analyzing} size="lg">
                      <Sparkles className={`w-4 h-4 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
                      {analyzing ? 'Gerando...' : 'Gerar Proposta'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Headline */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <h3 className="text-lg font-bold text-primary">{proposal.headline}</h3>
                  </div>

                  {/* Problem & Solution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Problema Identificado
                      </h4>
                      <p className="text-sm text-muted-foreground">{proposal.problema_identificado}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Solução Proposta
                      </h4>
                      <p className="text-sm text-muted-foreground">{proposal.solucao_proposta}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  {proposal.beneficios && proposal.beneficios.length > 0 && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        🎯 Benefícios
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {proposal.beneficios.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Offer */}
                  {proposal.oferta_especial && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                      <h4 className="font-semibold text-amber-600 mb-2 flex items-center gap-2">
                        🎁 Oferta Especial
                      </h4>
                      <p className="text-sm">{proposal.oferta_especial}</p>
                    </div>
                  )}

                  {/* Investment */}
                  {proposal.investimento && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        💰 Investimento
                      </h4>
                      <p className="text-sm">{proposal.investimento}</p>
                    </div>
                  )}

                  {/* WhatsApp Message */}
                  {proposal.mensagem_whatsapp && (
                    <div className="p-4 rounded-xl border-2 border-green-500/30 bg-green-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-600 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Mensagem WhatsApp
                        </h4>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(proposal.mensagem_whatsapp)}
                          className="gap-1.5 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          Copiar
                        </Button>
                      </div>
                      <div className="bg-white dark:bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap border border-green-500/10">
                        {proposal.mensagem_whatsapp}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700" 
                      onClick={handleSendWhatsApp}
                      disabled={sending || !canSend}
                      size="lg"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar via WhatsApp
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={openWhatsAppManual}
                      disabled={!prospect.company_phone || !proposal?.mensagem_whatsapp}
                      className="gap-2"
                      size="lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir WhatsApp
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={handleSaveProposal}
                      disabled={saving}
                      className="gap-2"
                      size="lg"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Global Message Generator Tab */}
            <TabsContent value="global" className="p-6 mt-0">
              <GlobalMessageGenerator
                prospect={{
                  id: prospect.id,
                  company_name: prospect.company_name,
                  contact_name: undefined,
                  niche: prospect.niche || undefined,
                  company_phone: prospect.company_phone || undefined,
                  company_website: prospect.company_website || undefined,
                  pain_points: prospect.pain_points || undefined,
                }}
                affiliate={{
                  id: prospect.affiliate_id,
                  name: 'Afiliado', // TODO: Get from context
                  company: undefined,
                }}
                onMessageGenerated={(message) => {
                  toast.success('Mensagem global gerada!');
                }}
                onSend={(message, channel) => {
                  if (channel === 'whatsapp' && prospect.company_phone) {
                    const cleanPhone = prospect.company_phone.replace(/\D/g, '');
                    const encoded = encodeURIComponent(message);
                    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
                  } else {
                    navigator.clipboard.writeText(message);
                    toast.success('Mensagem copiada para envio!');
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
