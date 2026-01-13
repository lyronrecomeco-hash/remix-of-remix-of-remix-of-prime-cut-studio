import { useState } from 'react';
import { 
  FileText, 
  Building2, 
  Phone, 
  Globe, 
  MapPin, 
  Sparkles, 
  Loader2,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProposalData {
  headline: string;
  problema_identificado: string;
  solucao_proposta: string;
  beneficios: string[];
  oferta_especial: string;
  investimento: string;
  mensagem_whatsapp: string;
}

interface CreateProposalPanelProps {
  affiliateId: string;
  onClose: () => void;
}

const NICHES = [
  'Barbearia',
  'Salão de Beleza',
  'Clínica Médica',
  'Clínica Odontológica',
  'Academia',
  'Restaurante',
  'Pizzaria',
  'Loja de Roupas',
  'Pet Shop',
  'Oficina Mecânica',
  'Imobiliária',
  'Escritório de Advocacia',
  'Contabilidade',
  'Estúdio de Tatuagem',
  'Escola/Curso',
  'Hotel/Pousada',
];

const PAIN_POINTS = [
  'Não tem site',
  'Site desatualizado',
  'Sem WhatsApp automático',
  'Sem agendamento online',
  'Sem presença nas redes sociais',
  'Não aparece no Google',
  'Perde clientes para concorrentes',
  'Atendimento manual sobrecarregado',
];

export const CreateProposalPanel = ({ affiliateId, onClose }: CreateProposalPanelProps) => {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  
  const [form, setForm] = useState({
    company_name: '',
    company_phone: '',
    company_website: '',
    company_city: '',
    niche: '',
    main_pain: '',
    additional_info: '',
  });

  const handleGenerate = async () => {
    if (!form.company_name.trim() || !form.niche) {
      toast.error('Preencha pelo menos o nome e nicho da empresa');
      return;
    }

    setGenerating(true);
    setProposal(null);

    try {
      const { data, error } = await supabase.functions.invoke('prospect-analyzer', {
        body: {
          action: 'generate_proposal_only',
          company_name: form.company_name,
          company_website: form.company_website,
          company_phone: form.company_phone,
          company_city: form.company_city,
          niche: form.niche,
          main_pain: form.main_pain,
          additional_info: form.additional_info,
        },
      });

      if (error) throw error;

      if (data?.proposal) {
        setProposal(data.proposal);
        toast.success('Proposta gerada com sucesso!');
      } else {
        toast.error('Erro ao gerar proposta');
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error);
      toast.error('Erro ao gerar proposta');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    if (!form.company_phone || !proposal?.mensagem_whatsapp) return;
    
    const phone = form.company_phone.replace(/\D/g, '');
    const message = encodeURIComponent(proposal.mensagem_whatsapp);
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Dados da Empresa
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Nome da Empresa *
              </Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Ex: Barbearia do João"
                className="bg-background"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Nicho *</Label>
              <Select value={form.niche} onValueChange={(v) => setForm(f => ({ ...f, niche: v }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                WhatsApp
              </Label>
              <Input
                value={form.company_phone}
                onChange={(e) => setForm(f => ({ ...f, company_phone: e.target.value }))}
                placeholder="(11) 99999-9999"
                className="bg-background"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Website
              </Label>
              <Input
                value={form.company_website}
                onChange={(e) => setForm(f => ({ ...f, company_website: e.target.value }))}
                placeholder="www.empresa.com"
                className="bg-background"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Cidade
              </Label>
              <Input
                value={form.company_city}
                onChange={(e) => setForm(f => ({ ...f, company_city: e.target.value }))}
                placeholder="São Paulo"
                className="bg-background"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Principal Dor</Label>
              <Select value={form.main_pain} onValueChange={(v) => setForm(f => ({ ...f, main_pain: v }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="O que falta?" />
                </SelectTrigger>
                <SelectContent>
                  {PAIN_POINTS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Informações Adicionais (opcional)
            </Label>
            <Textarea
              value={form.additional_info}
              onChange={(e) => setForm(f => ({ ...f, additional_info: e.target.value }))}
              placeholder="Ex: Concorrente próximo tem site moderno..."
              rows={3}
              className="bg-background"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={generating || !form.company_name || !form.niche}
            className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Proposta...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar Proposta com IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Proposal Result */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Proposta Gerada
        </h3>
        
        {proposal ? (
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-4">
              {/* Headline */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 rounded-xl p-4 border border-purple-500/20">
                <h3 className="text-lg font-bold text-purple-400">{proposal.headline}</h3>
              </div>

              {/* Problema */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  ❌ Problema Identificado
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                  {proposal.problema_identificado}
                </p>
              </div>

              {/* Solução */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  ✅ Solução Proposta
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                  {proposal.solucao_proposta}
                </p>
              </div>

              {/* Benefícios */}
              {proposal.beneficios && proposal.beneficios.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">🎯 Benefícios</h4>
                  <ul className="space-y-2 bg-muted/50 rounded-lg p-4">
                    {proposal.beneficios.map((b, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Oferta */}
              {proposal.oferta_especial && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="font-medium text-sm text-green-500 mb-2">🎁 Oferta Especial</h4>
                  <p className="text-sm">{proposal.oferta_especial}</p>
                </div>
              )}

              {/* Mensagem WhatsApp */}
              {proposal.mensagem_whatsapp && (
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      📱 Mensagem WhatsApp
                    </h4>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(proposal.mensagem_whatsapp)}
                      className="h-8 gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <p className="text-sm bg-muted/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-xs">
                    {proposal.mensagem_whatsapp}
                  </p>
                  
                  {form.company_phone && (
                    <Button 
                      onClick={openWhatsApp}
                      className="w-full mt-4 gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                      Enviar pelo WhatsApp
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-sm">
                Preencha os dados e clique em <br />
                <strong>"Gerar Proposta com IA"</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
