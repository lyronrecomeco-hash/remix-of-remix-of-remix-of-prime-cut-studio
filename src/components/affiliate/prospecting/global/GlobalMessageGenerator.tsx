import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Globe, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle,
  Clock,
  MessageSquare,
  Mail,
  Linkedin,
  Phone,
  RefreshCw,
  Shield,
  Zap,
  Languages,
  Loader2
} from 'lucide-react';
import { useGlobalContexts } from './useGlobalContexts';
import { useMessageGeneration } from './useMessageGeneration';
import { 
  ChannelType, 
  MessageIntent, 
  INTENT_LABELS,
  CHANNEL_LABELS,
  FORMALITY_LABELS,
  DIRECTNESS_LABELS,
  EMOJI_TOLERANCE_LABELS
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

const CHANNEL_ICONS_JSX: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  sms: <Phone className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  kakaotalk: <MessageSquare className="w-4 h-4" />,
};

// Channels available in UI (subset of all channels)
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
  const [customInstructions, setCustomInstructions] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

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
        niche: prospect.niche,
        pain_points: prospect.pain_points,
        website: prospect.company_website,
      },
      {
        name: affiliate.name,
        company: affiliate.company,
      },
      selectedChannel,
      customInstructions || undefined
    );

    if (result) {
      toast.success('Mensagem gerada com sucesso!');
      
      // Log the generation
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

  const isWithinBusinessHours = selectedContext ? checkBusinessHours(selectedContext) : true;
  const complianceChecks = selectedContext ? validateCompliance(selectedContext, selectedChannel) : [];
  const hasComplianceWarnings = complianceChecks.some(c => !c.passed);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with inline search fields - SAME AS SearchClientsCard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Country Selector */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <Globe className="w-3 h-3" />
            País/Cultura
            {autoDetected && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
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
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Selecione">
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

        {/* Channel Selector */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <MessageSquare className="w-3 h-3" />
            Canal
          </Label>
          <Select
            value={selectedChannel}
            onValueChange={(v) => setSelectedChannel(v as ChannelType)}
          >
            <SelectTrigger className="bg-background/50">
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

        {/* Intent Selector */}
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3 h-3" />
            Intenção
          </Label>
          <Select
            value={selectedIntent}
            onValueChange={(v) => setSelectedIntent(v as MessageIntent)}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue>{INTENT_LABELS[selectedIntent]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(INTENT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button - inline like search */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block opacity-0">Ação</Label>
          <Button 
            onClick={handleGenerate}
            disabled={generating || !selectedContext}
            className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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

      {/* Cultural Context Preview (compact) */}
      {selectedContext && (
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Languages className="w-3.5 h-3.5" />
            <span>Contexto:</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {FORMALITY_LABELS[selectedContext.formality_level]}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {DIRECTNESS_LABELS[selectedContext.directness_level]}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Emoji: {EMOJI_TOLERANCE_LABELS[selectedContext.emoji_tolerance]}
          </Badge>
          {selectedContext.compliance_tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] gap-1">
              <Shield className="w-2.5 h-2.5" />
              {tag}
            </Badge>
          ))}
          <div className={cn(
            "flex items-center gap-1 text-[10px] ml-auto",
            isWithinBusinessHours ? "text-green-600" : "text-amber-600"
          )}>
            <Clock className="w-3 h-3" />
            {isWithinBusinessHours ? 'Horário comercial' : 'Fora do horário'}
          </div>
        </div>
      )}

      {/* Compliance Warnings */}
      {hasComplianceWarnings && (
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs flex items-start gap-2">
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
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Gerando mensagem culturalmente adaptada...</p>
        </div>
      )}

      {/* Generated Message */}
      {!generating && lastGeneration && (
        <div className="space-y-3 bg-background/80 border border-border rounded-lg p-4">
          {/* Subject line for email */}
          {selectedChannel === 'email' && lastGeneration.subject_line && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Assunto do Email</Label>
              <div className="p-2 rounded bg-muted/50 text-sm font-medium">
                {lastGeneration.subject_line}
              </div>
            </div>
          )}

          {/* Message */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Mensagem Gerada</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-6 px-2 text-xs gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="min-h-32 text-sm bg-background/50"
            />
          </div>

          {/* Cultural Adaptations */}
          {lastGeneration.cultural_adaptations.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Adaptações:</span>
              {lastGeneration.cultural_adaptations.map((adaptation, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  {adaptation}
                </Badge>
              ))}
            </div>
          )}

          {/* Alternative Openings */}
          {lastGeneration.alternative_openings && lastGeneration.alternative_openings.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Aberturas Alternativas</Label>
              <div className="space-y-1">
                {lastGeneration.alternative_openings.map((opening, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-muted/30 text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      const newMessage = editedMessage.replace(
                        /^[^\n]+/,
                        opening
                      );
                      setEditedMessage(newMessage);
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
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs">
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

          {/* Send Button */}
          {onSend && (
            <Button
              onClick={handleSend}
              disabled={!editedMessage}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {CHANNEL_ICONS_JSX[selectedChannel]}
              Enviar via {CHANNEL_LABELS[selectedChannel]}
            </Button>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && !lastGeneration && (
        <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {error}
        </div>
      )}
    </div>
  );
};
