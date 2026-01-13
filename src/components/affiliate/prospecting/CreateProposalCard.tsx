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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface CreateProposalCardProps {
  affiliateId: string;
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

export const CreateProposalCard = ({ affiliateId }: CreateProposalCardProps) => {
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
    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Criar Proposta</CardTitle>
            <CardDescription>
              Gere propostas personalizadas com IA
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Nome da Empresa */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
              <Building2 className="w-3 h-3" />
              Nome da Empresa *
            </Label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
              placeholder="Ex: Barbearia do João"
              className="bg-background/50"
            />
          </div>
          
          {/* Nicho */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Nicho *</Label>
            <Select value={form.niche} onValueChange={(v) => setForm(f => ({ ...f, niche: v }))}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Selecione o nicho" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* WhatsApp */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
              <Phone className="w-3 h-3" />
              WhatsApp
            </Label>
            <Input
              value={form.company_phone}
              onChange={(e) => setForm(f => ({ ...f, company_phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="bg-background/50"
            />
          </div>
          
          {/* Website */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
              <Globe className="w-3 h-3" />
              Website (se tiver)
            </Label>
            <Input
              value={form.company_website}
              onChange={(e) => setForm(f => ({ ...f, company_website: e.target.value }))}
              placeholder="www.empresa.com"
              className="bg-background/50"
            />
          </div>
          
          {/* Cidade */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
              <MapPin className="w-3 h-3" />
              Cidade
            </Label>
            <Input
              value={form.company_city}
              onChange={(e) => setForm(f => ({ ...f, company_city: e.target.value }))}
              placeholder="São Paulo"
              className="bg-background/50"
            />
          </div>
          
          {/* Dor Principal */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Principal Dor</Label>
            <Select value={form.main_pain} onValueChange={(v) => setForm(f => ({ ...f, main_pain: v }))}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="O que falta nessa empresa?" />
              </SelectTrigger>
              <SelectContent>
                {PAIN_POINTS.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info Adicional */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Informações Adicionais (opcional)
          </Label>
          <Textarea
            value={form.additional_info}
            onChange={(e) => setForm(f => ({ ...f, additional_info: e.target.value }))}
            placeholder="Ex: Concorrente próximo tem site moderno, empresa está perdendo clientes..."
            rows={2}
            className="bg-background/50"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={generating || !form.company_name || !form.niche}
          className="w-full gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
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

        {/* Proposta Gerada */}
        {proposal && (
          <div className="mt-4 space-y-4">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            <ScrollArea className="h-[350px] pr-2">
              <div className="space-y-4">
                {/* Headline */}
                <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-lg font-bold text-purple-400">{proposal.headline}</h3>
                </div>

                {/* Problema */}
                <div>
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                    ❌ Problema Identificado
                  </h4>
                  <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3">
                    {proposal.problema_identificado}
                  </p>
                </div>

                {/* Solução */}
                <div>
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                    ✅ Solução Proposta
                  </h4>
                  <p className="text-sm text-muted-foreground bg-background/50 rounded-lg p-3">
                    {proposal.solucao_proposta}
                  </p>
                </div>

                {/* Benefícios */}
                {proposal.beneficios && proposal.beneficios.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">🎯 Benefícios</h4>
                    <ul className="space-y-1 bg-background/50 rounded-lg p-3">
                      {proposal.beneficios.map((b, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Oferta */}
                {proposal.oferta_especial && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <h4 className="font-medium text-sm text-green-500 mb-1">🎁 Oferta Especial</h4>
                    <p className="text-sm">{proposal.oferta_especial}</p>
                  </div>
                )}

                {/* Mensagem WhatsApp */}
                {proposal.mensagem_whatsapp && (
                  <div className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">📱 Mensagem WhatsApp</h4>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(proposal.mensagem_whatsapp)}
                        className="h-7 gap-1"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                    <p className="text-sm bg-muted/50 rounded p-3 whitespace-pre-wrap font-mono text-xs">
                      {proposal.mensagem_whatsapp}
                    </p>
                    
                    {form.company_phone && (
                      <Button 
                        onClick={openWhatsApp}
                        className="w-full mt-3 gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4" />
                        Enviar pelo WhatsApp
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
