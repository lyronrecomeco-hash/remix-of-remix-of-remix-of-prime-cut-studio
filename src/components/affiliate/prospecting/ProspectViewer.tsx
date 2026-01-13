import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ExternalLink
} from 'lucide-react';
import { Prospect } from './types';
import { toast } from 'sonner';

interface ProspectViewerProps {
  prospect: Prospect | null;
  open: boolean;
  onClose: () => void;
  onAnalyze: (id: string) => void;
  onSend: (id: string) => void;
  analyzing: boolean;
  sending: boolean;
}

export const ProspectViewer = ({
  prospect,
  open,
  onClose,
  onAnalyze,
  onSend,
  analyzing,
  sending,
}: ProspectViewerProps) => {
  if (!prospect) return null;

  const canAnalyze = prospect.status === 'pending';
  const canSend = (prospect.status === 'proposal_ready' || prospect.status === 'analyzed') && prospect.company_phone;
  const proposal = prospect.generated_proposal;
  const analysis = prospect.analysis_data;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {prospect.company_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="analysis">Análise</TabsTrigger>
              <TabsTrigger value="proposal">Proposta</TabsTrigger>
            </TabsList>

            {/* Informações */}
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {prospect.company_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{prospect.company_phone}</span>
                  </div>
                )}
                {prospect.company_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{prospect.company_email}</span>
                  </div>
                )}
                {prospect.company_website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`https://${prospect.company_website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {prospect.company_website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {(prospect.company_city || prospect.company_state) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {prospect.company_city}{prospect.company_state && `, ${prospect.company_state}`}
                    </span>
                  </div>
                )}
              </div>

              {prospect.niche && (
                <div>
                  <span className="text-sm text-muted-foreground">Nicho:</span>
                  <Badge className="ml-2">{prospect.niche}</Badge>
                </div>
              )}

              {prospect.notes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm">{prospect.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4">
                <Badge variant="outline">
                  Score: {prospect.analysis_score}%
                </Badge>
                <Badge variant="outline">
                  {prospect.status}
                </Badge>
              </div>
            </TabsContent>

            {/* Análise */}
            <TabsContent value="analysis" className="space-y-4 mt-4">
              {!analysis ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">Prospect ainda não analisado</p>
                  {canAnalyze && (
                    <Button onClick={() => onAnalyze(prospect.id)} disabled={analyzing}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {analyzing ? 'Analisando...' : 'Analisar Agora'}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Checklist de Features */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Recursos Detectados:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'hasWebsite', label: 'Website' },
                        { key: 'hasWhatsAppButton', label: 'WhatsApp Integrado' },
                        { key: 'hasOnlineScheduling', label: 'Agendamento Online' },
                        { key: 'hasChatbot', label: 'Chatbot' },
                        { key: 'hasOnlinePayment', label: 'Pagamento Online' },
                        { key: 'hasSocialMedia', label: 'Redes Sociais' },
                      ].map(({ key, label }) => {
                        const hasFeature = analysis[key as keyof typeof analysis];
                        return (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            {hasFeature ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dores Identificadas */}
                  {prospect.pain_points.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">🎯 Dores Identificadas:</h4>
                      <ul className="space-y-1">
                        {prospect.pain_points.map((pain, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Oportunidades */}
                  {analysis.opportunities && analysis.opportunities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">🚀 Oportunidades:</h4>
                      <ul className="space-y-1">
                        {analysis.opportunities.map((opp, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Proposta */}
            <TabsContent value="proposal" className="space-y-4 mt-4">
              {!proposal ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">Proposta ainda não gerada</p>
                  {canAnalyze && (
                    <Button onClick={() => onAnalyze(prospect.id)} disabled={analyzing}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {analyzing ? 'Gerando...' : 'Gerar Proposta'}
                    </Button>
                  )}
                </div>
              ) : proposal.raw_content ? (
                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                  {proposal.raw_content}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Headline */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-primary">{proposal.headline}</h3>
                  </div>

                  {/* Problema */}
                  <div>
                    <h4 className="font-medium mb-1">❌ Problema Identificado:</h4>
                    <p className="text-sm text-muted-foreground">{proposal.problema_identificado}</p>
                  </div>

                  {/* Solução */}
                  <div>
                    <h4 className="font-medium mb-1">✅ Solução Proposta:</h4>
                    <p className="text-sm text-muted-foreground">{proposal.solucao_proposta}</p>
                  </div>

                  {/* Benefícios */}
                  {proposal.beneficios && proposal.beneficios.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">🎯 Benefícios:</h4>
                      <ul className="space-y-1">
                        {proposal.beneficios.map((b, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Oferta */}
                  {proposal.oferta_especial && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <h4 className="font-medium text-green-600 mb-1">🎁 Oferta Especial:</h4>
                      <p className="text-sm">{proposal.oferta_especial}</p>
                    </div>
                  )}

                  {/* Investimento */}
                  {proposal.investimento && (
                    <div>
                      <h4 className="font-medium mb-1">💰 Investimento:</h4>
                      <p className="text-sm">{proposal.investimento}</p>
                    </div>
                  )}

                  {/* Mensagem WhatsApp */}
                  {proposal.mensagem_whatsapp && (
                    <div className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">📱 Mensagem WhatsApp:</h4>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(proposal.mensagem_whatsapp)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm bg-muted/50 rounded p-2 whitespace-pre-wrap">
                        {proposal.mensagem_whatsapp}
                      </p>
                    </div>
                  )}

                  {/* Botão de Envio */}
                  {canSend && (
                    <Button 
                      className="w-full" 
                      onClick={() => onSend(prospect.id)}
                      disabled={sending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Enviando...' : 'Enviar via WhatsApp'}
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
