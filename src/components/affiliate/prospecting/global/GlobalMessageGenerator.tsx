import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Globe, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle,
  MessageSquare,
  Mail,
  Linkedin,
  Phone,
  Shield,
  Zap,
  Building2,
  Loader2,
  Send
} from 'lucide-react';
import { useGlobalContexts } from './useGlobalContexts';
import { useMessageGeneration } from './useMessageGeneration';
import { 
  ChannelType, 
  MessageIntent, 
  INTENT_LABELS,
  CHANNEL_LABELS,
} from './types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Country flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  BR: '🇧🇷', US: '🇺🇸', DE: '🇩🇪', FR: '🇫🇷', GB: '🇬🇧', ES: '🇪🇸', PT: '🇵🇹',
  IT: '🇮🇹', NL: '🇳🇱', BE: '🇧🇪', AT: '🇦🇹', CH: '🇨🇭', SE: '🇸🇪', NO: '🇳🇴',
  DK: '🇩🇰', FI: '🇫🇮', PL: '🇵🇱', CZ: '🇨🇿', IE: '🇮🇪', MX: '🇲🇽', AR: '🇦🇷',
  CL: '🇨🇱', CO: '🇨🇴', PE: '🇵🇪', JP: '🇯🇵', KR: '🇰🇷', CN: '🇨🇳', IN: '🇮🇳',
  AU: '🇦🇺', NZ: '🇳🇿', ZA: '🇿🇦', AE: '🇦🇪', IL: '🇮🇱', CA: '🇨🇦',
};

// Niches by country/region - automatically adapts
const NICHES_BY_COUNTRY: Record<string, string[]> = {
  // Brazil
  BR: [
    'Barbearia', 'Salão de Beleza', 'Clínica Médica', 'Clínica Odontológica',
    'Academia', 'Restaurante', 'Pizzaria', 'Hamburgueria', 'Pet Shop',
    'Oficina Mecânica', 'Imobiliária', 'Escritório de Advocacia',
    'Contabilidade', 'Estúdio de Tatuagem', 'Escola de Idiomas',
  ],
  // USA
  US: [
    'Barbershop', 'Hair Salon', 'Medical Clinic', 'Dental Office',
    'Gym', 'Restaurant', 'Pizza Shop', 'Pet Store', 'Auto Repair',
    'Real Estate Agency', 'Law Firm', 'Accounting Firm', 'Tattoo Studio',
    'Language School', 'Coffee Shop', 'Spa & Wellness',
  ],
  // Germany
  DE: [
    'Friseursalon', 'Schönheitssalon', 'Arztpraxis', 'Zahnarztpraxis',
    'Fitnessstudio', 'Restaurant', 'Pizzeria', 'Tierhandlung', 'Autowerkstatt',
    'Immobilienagentur', 'Anwaltskanzlei', 'Steuerberatung', 'Tattoostudio',
  ],
  // France
  FR: [
    'Salon de coiffure', 'Institut de beauté', 'Cabinet médical', 'Cabinet dentaire',
    'Salle de sport', 'Restaurant', 'Pizzeria', 'Animalerie', 'Garage auto',
    'Agence immobilière', 'Cabinet d\'avocats', 'Cabinet comptable',
  ],
  // Spain
  ES: [
    'Barbería', 'Salón de belleza', 'Clínica médica', 'Clínica dental',
    'Gimnasio', 'Restaurante', 'Pizzería', 'Tienda de mascotas', 'Taller mecánico',
    'Inmobiliaria', 'Bufete de abogados', 'Asesoría contable', 'Estudio de tatuajes',
  ],
  // Portugal
  PT: [
    'Barbearia', 'Salão de Beleza', 'Clínica Médica', 'Clínica Dentária',
    'Ginásio', 'Restaurante', 'Pizzaria', 'Pet Shop', 'Oficina Mecânica',
    'Imobiliária', 'Escritório de Advocacia', 'Contabilidade',
  ],
  // Mexico
  MX: [
    'Barbería', 'Salón de Belleza', 'Clínica Médica', 'Consultorio Dental',
    'Gimnasio', 'Restaurante', 'Pizzería', 'Veterinaria', 'Taller Mecánico',
    'Inmobiliaria', 'Despacho de Abogados', 'Despacho Contable',
  ],
  // Argentina
  AR: [
    'Barbería', 'Peluquería', 'Clínica Médica', 'Consultorio Odontológico',
    'Gimnasio', 'Restaurante', 'Pizzería', 'Pet Shop', 'Taller Mecánico',
    'Inmobiliaria', 'Estudio Jurídico', 'Estudio Contable',
  ],
  // Italy
  IT: [
    'Barbiere', 'Salone di bellezza', 'Studio medico', 'Studio dentistico',
    'Palestra', 'Ristorante', 'Pizzeria', 'Negozio di animali', 'Officina',
    'Agenzia immobiliare', 'Studio legale', 'Studio commercialista',
  ],
  // UK
  GB: [
    'Barbershop', 'Hair Salon', 'Medical Practice', 'Dental Surgery',
    'Gym', 'Restaurant', 'Pizza Shop', 'Pet Shop', 'Garage',
    'Estate Agency', 'Law Firm', 'Accountancy Firm', 'Tattoo Studio',
  ],
  // Japan
  JP: [
    '理髪店', '美容室', 'クリニック', '歯科医院',
    'ジム', 'レストラン', 'ピザ店', 'ペットショップ', '自動車整備',
    '不動産', '法律事務所', '会計事務所',
  ],
  // Default (English)
  DEFAULT: [
    'Barbershop', 'Beauty Salon', 'Medical Clinic', 'Dental Clinic',
    'Gym', 'Restaurant', 'Pet Store', 'Auto Repair', 'Real Estate',
    'Law Firm', 'Accounting Firm', 'Tattoo Studio',
  ],
};

const CHANNEL_ICONS_JSX: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
};

type UIChannelType = 'whatsapp' | 'email' | 'linkedin' | 'sms';
const UI_CHANNELS: UIChannelType[] = ['whatsapp', 'email', 'linkedin', 'sms'];

interface GlobalMessageGeneratorProps {
  prospect: {
    id: string;
    company_name: string;
    contact_name?: string;
    niche?: string;
    company_phone?: string;
    company_website?: string;
    pain_points?: string[];
  };
  affiliate: {
    id: string;
    name: string;
    company?: string;
  };
  onMessageGenerated?: (message: string, subject?: string) => void;
  onSend?: (message: string, channel: ChannelType) => void;
  className?: string;
}

export const GlobalMessageGenerator = ({
  prospect,
  affiliate,
  onMessageGenerated,
  onSend,
  className,
}: GlobalMessageGeneratorProps) => {
  const {
    contexts,
    templates,
    selectedContext,
    loading: contextsLoading,
    fetchContexts,
    fetchTemplates,
    selectContext,
    autoDetectContext,
    getTemplateByIntent,
  } = useGlobalContexts();

  const {
    generating,
    error,
    lastGeneration,
    generateMessage,
    validateCompliance,
    checkBusinessHours,
    logMessage,
  } = useMessageGeneration();

  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('whatsapp');
  const [selectedIntent, setSelectedIntent] = useState<MessageIntent>('first_contact');
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [editedMessage, setEditedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  // Get niches based on selected country
  const availableNiches = useMemo(() => {
    if (!selectedContext) return NICHES_BY_COUNTRY.DEFAULT;
    return NICHES_BY_COUNTRY[selectedContext.country_code] || NICHES_BY_COUNTRY.DEFAULT;
  }, [selectedContext]);

  // Reset niche when country changes
  useEffect(() => {
    setSelectedNiche('');
  }, [selectedContext?.country_code]);

  // Load contexts on mount
  useEffect(() => {
    fetchContexts();
  }, [fetchContexts]);

  // Auto-detect country from prospect data
  useEffect(() => {
    const detectCountry = async () => {
      if (contexts.length > 0 && !selectedContext) {
        const detected = await autoDetectContext(
          prospect.company_phone || undefined,
          prospect.company_website || undefined
        );
        if (detected) {
          setAutoDetected(true);
        }
      }
    };
    detectCountry();
  }, [contexts, prospect, selectedContext, autoDetectContext]);

  // Load templates when context changes
  useEffect(() => {
    if (selectedContext) {
      fetchTemplates(selectedContext.id);
    }
  }, [selectedContext, fetchTemplates]);

  // Update edited message when new generation arrives
  useEffect(() => {
    if (lastGeneration?.message) {
      setEditedMessage(lastGeneration.message);
      onMessageGenerated?.(lastGeneration.message, lastGeneration.subject_line);
    }
  }, [lastGeneration, onMessageGenerated]);

  const handleGenerate = async () => {
    if (!selectedContext) {
      toast.error('Selecione um país primeiro');
      return;
    }

    if (!selectedNiche) {
      toast.error('Selecione um nicho');
      return;
    }

    const template = getTemplateByIntent(selectedContext.id, selectedIntent);
    if (!template) {
      toast.error('Template não encontrado para esta intenção');
      return;
    }

    const result = await generateMessage(
      selectedContext,
      template,
      {
        company_name: prospect.company_name,
        contact_name: prospect.contact_name,
        niche: selectedNiche, // Use selected niche, not prospect's
        pain_points: prospect.pain_points,
        website: prospect.company_website,
      },
      {
        name: affiliate.name,
        company: affiliate.company,
      },
      selectedChannel,
      undefined
    );

    if (result) {
      toast.success('Mensagem gerada com sucesso!');
      
      await logMessage(
        affiliate.id,
        prospect.id,
        selectedContext,
        template,
        selectedIntent,
        result.message,
        selectedChannel,
        autoDetected ? 0.8 : null,
        !autoDetected
      );
    } else if (error) {
      toast.error(error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    toast.success('Mensagem copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (editedMessage && onSend) {
      onSend(editedMessage, selectedChannel);
    }
  };

  const complianceChecks = selectedContext ? validateCompliance(selectedContext, selectedChannel) : [];
  const hasComplianceWarnings = complianceChecks.some(c => !c.passed);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search-style Form Card - Same as SearchClientsTab */}
      <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Country Selector */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-primary" />
                País
                {autoDetected && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    <Zap className="w-2 h-2 mr-0.5" />
                    Auto
                  </Badge>
                )}
              </Label>
              <Select
                value={selectedContext?.country_code || ''}
                onValueChange={(code) => {
                  const ctx = contexts.find(c => c.country_code === code);
                  selectContext(ctx || null);
                  setAutoDetected(false);
                }}
                disabled={contextsLoading}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
                  <SelectValue placeholder="Selecione o país">
                    {selectedContext && (
                      <span className="flex items-center gap-2">
                        <span>{COUNTRY_FLAGS[selectedContext.country_code] || '🌍'}</span>
                        <span>{selectedContext.country_name}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-64">
                    {contexts.map((ctx) => (
                      <SelectItem key={ctx.id} value={ctx.country_code}>
                        <span className="flex items-center gap-2">
                          <span>{COUNTRY_FLAGS[ctx.country_code] || '🌍'}</span>
                          <span>{ctx.country_name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Niche Selector - Adapts by Country */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                Nicho
              </Label>
              <Select
                value={selectedNiche}
                onValueChange={setSelectedNiche}
                disabled={!selectedContext}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
                  <SelectValue placeholder="Selecione o nicho" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-64">
                    {availableNiches.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selector */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Canal
              </Label>
              <Select
                value={selectedChannel}
                onValueChange={(v) => setSelectedChannel(v as ChannelType)}
              >
                <SelectTrigger className="bg-background/50 border-border focus:border-primary">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      {CHANNEL_ICONS_JSX[selectedChannel]}
                      <span>{CHANNEL_LABELS[selectedChannel]}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {UI_CHANNELS.map((key) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {CHANNEL_ICONS_JSX[key]}
                        <span>{CHANNEL_LABELS[key]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleGenerate}
                disabled={generating || !selectedContext || !selectedNiche}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Mensagem
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Intent Selector (Secondary Row) */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <div className="flex items-center gap-4 flex-wrap">
              <Label className="text-xs text-muted-foreground">Intenção:</Label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(INTENT_LABELS).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={selectedIntent === key ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedIntent === key 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-primary/10"
                    )}
                    onClick={() => setSelectedIntent(key as MessageIntent)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Tags */}
          {selectedContext && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {selectedContext.compliance_tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Warnings */}
      {hasComplianceWarnings && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            {complianceChecks.filter(c => !c.passed).map(c => (
              <p key={c.tag}>{c.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {generating && (
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-medium">
              Gerando mensagem para {selectedContext?.country_name}...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Adaptando culturalmente para {selectedNiche}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Message */}
      {!generating && lastGeneration && (
        <Card className="border border-green-500/30 bg-green-500/5">
          <CardContent className="p-6 space-y-4">
            {/* Subject line for email */}
            {selectedChannel === 'email' && lastGeneration.subject_line && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Assunto do Email</Label>
                <div className="p-3 rounded-lg bg-background border border-border text-sm font-medium">
                  {lastGeneration.subject_line}
                </div>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Mensagem Gerada ({selectedContext?.language || 'auto'})
                </Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="gap-1.5 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="min-h-[200px] bg-background border-border resize-none"
              />
            </div>

            {/* Cultural Adaptations */}
            {lastGeneration.cultural_adaptations.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Adaptações culturais:</span>
                {lastGeneration.cultural_adaptations.map((adaptation, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    {adaptation}
                  </Badge>
                ))}
              </div>
            )}

            {/* Alternative Openings */}
            {lastGeneration.alternative_openings && lastGeneration.alternative_openings.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Aberturas Alternativas</Label>
                <div className="space-y-1">
                  {lastGeneration.alternative_openings.map((opening, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-muted/30 text-xs cursor-pointer hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/30"
                      onClick={() => {
                        const newMessage = editedMessage.replace(/^[^\n]+/, opening);
                        setEditedMessage(newMessage);
                        toast.success('Abertura aplicada!');
                      }}
                    >
                      "{opening}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {lastGeneration.validation.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs">
                <div className="flex items-center gap-1 font-medium mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  Avisos de Validação
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {lastGeneration.validation.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {onSend && (
                <Button
                  onClick={handleSend}
                  disabled={!editedMessage}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                  Enviar via {CHANNEL_LABELS[selectedChannel]}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleCopy}
                className={cn(!onSend && "flex-1")}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && !lastGeneration && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
