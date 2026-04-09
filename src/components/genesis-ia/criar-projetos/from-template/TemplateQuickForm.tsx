import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Copy, Check, Loader2, Palette, Type, Globe, MessageSquare, Monitor, Info, X, Code2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { TemplateModel } from './templateModels';
import { generateTemplatePrompt } from './generateTemplatePrompt';
import { supabase } from '@/integrations/supabase/client';

// Import AI icons
import lovableIcon from '@/assets/ai-icons/lovable.ico';
import cursorIcon from '@/assets/ai-icons/cursor.png';
import v0Icon from '@/assets/ai-icons/v0.svg';
import boltIcon from '@/assets/ai-icons/bolt.svg';
import windsurfIcon from '@/assets/ai-icons/windsurf.svg';
import traeIcon from '@/assets/ai-icons/trae.png';
import replitIcon from '@/assets/ai-icons/replit.png';
import antigravityIcon from '@/assets/ai-icons/antigravity.png';
import chatgptIcon from '@/assets/ai-icons/chatgpt.webp';
import claudeIcon from '@/assets/ai-icons/claude.png';
import googleStudioIcon from '@/assets/ai-icons/google-studio.png';

interface TemplateQuickFormProps {
  template: TemplateModel;
  onBack: () => void;
  onComplete: () => void;
  affiliateId?: string;
}

export interface TemplateFormData {
  businessName: string;
  cityState: string;
  primaryColor: string;
  secondaryColor: string;
  typography: string;
  slogan: string;
  language: string;
  additionalDescription: string;
  targetAI: string;
  codeStyle: 'modern' | 'traditional';
  targetAudience: string;
}

const AI_TARGETS = [
  { id: 'lovable', name: 'Lovable', icon: lovableIcon, category: 'builder' },
  { id: 'antigravity', name: 'Antigravity', icon: antigravityIcon, category: 'ide' },
  { id: 'cursor', name: 'Cursor', icon: cursorIcon, category: 'ide' },
  { id: 'windsurf', name: 'Windsurf', icon: windsurfIcon, category: 'ide' },
  { id: 'trae', name: 'Trae', icon: traeIcon, category: 'ide' },
  { id: 'v0', name: 'v0 (Vercel)', icon: v0Icon, category: 'builder' },
  { id: 'bolt', name: 'Bolt.new', icon: boltIcon, category: 'builder' },
  { id: 'replit', name: 'Replit', icon: replitIcon, category: 'builder' },
  { id: 'chatgpt', name: 'ChatGPT', icon: chatgptIcon, category: 'chat' },
  { id: 'claude', name: 'Claude', icon: claudeIcon, category: 'chat' },
  { id: 'google-studio', name: 'AI Studio', icon: googleStudioIcon, category: 'chat' },
];

const LANGUAGES = [
  { code: 'pt-BR', label: 'Portugues (Brasil)' },
  { code: 'pt-PT', label: 'Portugues (Portugal)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
];

const TYPOGRAPHIES = [
  'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans',
  'Lato', 'Playfair Display', 'Raleway', 'Nunito', 'DM Sans',
  'Space Grotesk', 'Outfit', 'Sora', 'Work Sans', 'Source Sans Pro',
];

const COLOR_PRESETS = [
  { name: 'Azul Profissional', primary: '#2563eb', secondary: '#3b82f6' },
  { name: 'Verde Natureza', primary: '#16a34a', secondary: '#22c55e' },
  { name: 'Roxo Criativo', primary: '#7c3aed', secondary: '#8b5cf6' },
  { name: 'Vermelho Energia', primary: '#dc2626', secondary: '#ef4444' },
  { name: 'Laranja Vibrante', primary: '#ea580c', secondary: '#f97316' },
  { name: 'Rosa Moderno', primary: '#db2777', secondary: '#ec4899' },
  { name: 'Ciano Tech', primary: '#0891b2', secondary: '#06b6d4' },
  { name: 'Dourado Premium', primary: '#d97706', secondary: '#f59e0b' },
  { name: 'Preto Elegante', primary: '#1c1917', secondary: '#404040' },
  { name: 'Esmeralda', primary: '#059669', secondary: '#10b981' },
];

const CODE_STYLES: { id: 'modern' | 'traditional'; name: string; description: string; icon: React.ReactNode; tags: string[] }[] = [
  {
    id: 'modern',
    name: 'Moderno',
    description: 'React, TypeScript, Tailwind',
    icon: <Monitor className="w-4 h-4" />,
    tags: ['React', 'TS', 'Tailwind'],
  },
  {
    id: 'traditional',
    name: 'Tradicional',
    description: 'PHP, HTML, CSS, JS',
    icon: <Code2 className="w-4 h-4" />,
    tags: ['PHP', 'HTML', 'JS'],
  },
];

interface ProposalForImport {
  id: string;
  company_name: string;
  contact_name: string | null;
  niche_id: string | null;
  company_email: string | null;
  company_phone: string | null;
  questionnaire_answers: any;
  ai_analysis: any;
}

export function TemplateQuickForm({ template, onBack, onComplete, affiliateId }: TemplateQuickFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    businessName: '',
    cityState: '',
    primaryColor: '#2563eb',
    secondaryColor: '#3b82f6',
    typography: 'Inter',
    slogan: '',
    language: 'Portugues (Brasil)',
    additionalDescription: '',
    targetAI: 'lovable',
    codeStyle: 'modern',
    targetAudience: '',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposals, setProposals] = useState<ProposalForImport[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [analyzingAudience, setAnalyzingAudience] = useState(false);

  const updateField = (key: keyof TemplateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canGenerate = formData.businessName.trim().length > 0;

  const handleLoadProposals = async () => {
    if (!affiliateId) return;
    setLoadingProposals(true);
    setShowProposalModal(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_proposals')
        .select('id, company_name, contact_name, niche_id, company_email, company_phone, questionnaire_answers, ai_analysis')
        .eq('affiliate_id', affiliateId)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProposals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleImportProposal = async (proposal: ProposalForImport) => {
    setFormData(prev => ({
      ...prev,
      businessName: proposal.company_name || prev.businessName,
      slogan: (proposal.questionnaire_answers as any)?.slogan || prev.slogan,
      cityState: (proposal.questionnaire_answers as any)?.city || (proposal.questionnaire_answers as any)?.location || prev.cityState,
    }));
    setShowProposalModal(false);
    toast.success('Dados importados!', { description: `Dados de "${proposal.company_name}" aplicados.` });

    // Auto-analyze target audience with AI
    setAnalyzingAudience(true);
    try {
      const nicheInfo = (proposal.ai_analysis as any)?.niche || (proposal.questionnaire_answers as any)?.niche || template.name;
      const analysisText = typeof proposal.ai_analysis === 'object' ? JSON.stringify(proposal.ai_analysis) : '';

      const { data: funcData } = await supabase.functions.invoke('genesis-ai-chat', {
        body: {
          messages: [
            {
              role: 'user',
              content: `Com base nestes dados do negócio, gere um BREVE público-alvo (máximo 2 linhas):
Empresa: ${proposal.company_name}
Nicho: ${nicheInfo}
Cidade: ${(proposal.questionnaire_answers as any)?.city || ''}
${analysisText ? `Análise: ${analysisText.slice(0, 500)}` : ''}
Responda APENAS o público-alvo, sem introdução.`
            }
          ],
          max_tokens: 150,
        }
      });
      if (funcData?.content) {
        setFormData(prev => ({ ...prev, targetAudience: funcData.content.trim() }));
      }
    } catch (e) {
      console.error('Audience analysis error:', e);
    } finally {
      setAnalyzingAudience(false);
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const prompt = generateTemplatePrompt(template, formData);
      setGeneratedPrompt(prompt);
      setGenerating(false);
      const aiName = AI_TARGETS.find(a => a.id === formData.targetAI)?.name || formData.targetAI;
      toast.success('Prompt profissional gerado!', { description: `Otimizado para ${aiName}. Copie e cole na plataforma.` });
    }, 2500);
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Prompt copiado!', { description: 'Cole na plataforma de IA desejada.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-0 px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-t-xl bg-white/5 border border-white/10 border-b-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={generatedPrompt ? () => setGeneratedPrompt(null) : onBack}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-border">
              <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold leading-tight">{template.name}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {generatedPrompt ? 'Prompt gerado com sucesso' : 'Configure seu projeto'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-b-xl bg-white/5 border border-white/10 border-t-0">
        <AnimatePresence mode="wait">
          {generatedPrompt ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="relative">
                <pre className="w-full max-h-[500px] overflow-auto p-4 sm:p-5 rounded-lg bg-muted/50 border border-border text-[11px] sm:text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                  {generatedPrompt}
                </pre>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleCopy} className="flex-1 h-9 sm:h-10 text-xs sm:text-sm gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar Prompt'}
                </Button>
                <Button variant="outline" onClick={() => setGeneratedPrompt(null)} className="h-9 sm:h-10 text-xs sm:text-sm">
                  Editar configuracoes
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Code Style + AI Target */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                    <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    Tipo de Código & IA
                  </label>
                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Info className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Code Style */}
                <div className="grid grid-cols-2 gap-2">
                  {CODE_STYLES.map((style) => {
                    const isSelected = formData.codeStyle === style.id;
                    return (
                      <motion.button
                        key={style.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateField('codeStyle', style.id)}
                        className={`relative p-2.5 rounded-xl border transition-all text-left ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                            {style.icon}
                          </div>
                          <p className="text-[10px] sm:text-xs font-semibold">{style.name}</p>
                        </div>
                        <div className="flex gap-1">
                          {style.tags.map(tag => (
                            <span key={tag} className="text-[8px] sm:text-[9px] px-1 py-0.5 rounded bg-white/5 text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* AI Target Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {AI_TARGETS.map((ai, index) => {
                    const isSelected = formData.targetAI === ai.id;
                    return (
                      <motion.button
                        key={ai.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => updateField('targetAI', ai.id)}
                        className={`relative p-2.5 sm:p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                          <img src={ai.icon} alt={ai.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain" />
                          <p className="text-[10px] sm:text-xs font-medium">{ai.name}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  💡 Prompt otimizado para <span className="text-primary font-medium">{AI_TARGETS.find(a => a.id === formData.targetAI)?.name}</span>
                  {' '}com código <span className="text-primary font-medium">{formData.codeStyle === 'modern' ? 'moderno' : 'tradicional'}</span>
                </p>
              </div>

              {/* Import Proposal */}
              {affiliateId && (
                <button
                  onClick={handleLoadProposals}
                  className="w-full p-3 rounded-xl border border-dashed border-white/20 hover:border-primary/40 bg-white/5 hover:bg-primary/5 transition-all flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium">Possui uma proposta salva?</p>
                    <p className="text-[10px] text-muted-foreground">Importe os dados de uma proposta aceita</p>
                  </div>
                </button>
              )}

              {/* Identity */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Identidade
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Nome do Negocio *</Label>
                    <Input
                      value={formData.businessName}
                      onChange={e => updateField('businessName', e.target.value)}
                      placeholder="Ex: Pizzaria do Joao"
                      className="h-10 text-sm bg-white/5 border-white/10 focus:border-primary/50 placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Cidade / Estado</Label>
                    <Input
                      value={formData.cityState}
                      onChange={e => updateField('cityState', e.target.value)}
                      placeholder="Ex: Sao Paulo, SP"
                      className="h-10 text-sm bg-white/5 border-white/10 focus:border-primary/50 placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Slogan (opcional)</Label>
                    <Input
                      value={formData.slogan}
                      onChange={e => updateField('slogan', e.target.value)}
                      placeholder="Ex: O melhor sabor da cidade"
                      className="h-10 text-sm bg-white/5 border-white/10 focus:border-primary/50 placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                      Público-Alvo
                      {analyzingAudience && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    </Label>
                    <Input
                      value={formData.targetAudience}
                      onChange={e => updateField('targetAudience', e.target.value)}
                      placeholder="Ex: Jovens 18-35 anos..."
                      className="h-10 text-sm bg-white/5 border-white/10 focus:border-primary/50 placeholder:text-white/30"
                    />
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Paleta de Cores
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {COLOR_PRESETS.map((preset, index) => {
                    const isSelected = formData.primaryColor === preset.primary;
                    return (
                      <motion.button
                        key={preset.primary}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => {
                          updateField('primaryColor', preset.primary);
                          updateField('secondaryColor', preset.secondary);
                        }}
                        className={`relative p-2.5 sm:p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                          <div className="flex gap-1.5">
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full shadow-lg" style={{ backgroundColor: preset.primary }} />
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full shadow-lg" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <p className="text-[10px] sm:text-xs font-medium">{preset.name}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Primaria:</span>
                    <input type="color" value={formData.primaryColor} onChange={e => updateField('primaryColor', e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">{formData.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Secundaria:</span>
                    <input type="color" value={formData.secondaryColor} onChange={e => updateField('secondaryColor', e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
                    <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">{formData.secondaryColor}</span>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Tipografia
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
                  {TYPOGRAPHIES.slice(0, 10).map((font, index) => {
                    const isSelected = formData.typography === font;
                    return (
                      <motion.button
                        key={font}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => updateField('typography', font)}
                        className={`relative p-2 sm:p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        style={{ fontFamily: font }}
                      >
                        <p className="text-[10px] sm:text-xs font-medium truncate">{font}</p>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Idioma
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {LANGUAGES.map((lang, index) => {
                    const isSelected = formData.language === lang.label;
                    return (
                      <motion.button
                        key={lang.code}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => updateField('language', lang.label)}
                        className={`relative p-2 sm:p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <p className="text-[10px] sm:text-xs font-medium truncate">{lang.label}</p>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Description */}
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm text-muted-foreground">Descricao adicional (opcional)</Label>
                <Textarea
                  value={formData.additionalDescription}
                  onChange={e => updateField('additionalDescription', e.target.value)}
                  placeholder="Descreva informacoes extras, funcionalidades especificas, estilo visual desejado..."
                  className="min-h-[80px] text-sm resize-none bg-white/5 border-white/10 focus:border-primary/50 placeholder:text-white/30"
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <div className="pt-2 border-t border-white/10">
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate || generating}
                  className="w-full h-11 sm:h-12 text-sm gap-2 font-semibold"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando prompt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Prompt para {AI_TARGETS.find(a => a.id === formData.targetAI)?.name}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold">🆚 Moderno vs Tradicional</h3>
                <button onClick={() => setShowInfoModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs font-semibold text-primary mb-1">⚡ Moderno — React + TypeScript + Tailwind</p>
                  <ul className="text-[11px] text-muted-foreground space-y-0.5">
                    <li>✅ Interface reativa e dinâmica (SPA)</li>
                    <li>✅ Ideal para apps e dashboards</li>
                    <li>⚠️ Requer conhecimento de React</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs font-semibold text-amber-400 mb-1">🏗️ Tradicional — PHP + HTML + CSS + JS</p>
                  <ul className="text-[11px] text-muted-foreground space-y-0.5">
                    <li>✅ Fácil de hospedar (qualquer hosting PHP)</li>
                    <li>✅ SEO nativo excelente</li>
                    <li>⚠️ Menos dinâmico</li>
                  </ul>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-[10px] text-muted-foreground text-center">
                    💡 Para Lovable e v0, apenas código moderno é suportado.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposal Import Modal */}
      <AnimatePresence>
        {showProposalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProposalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold">📋 Propostas Aceitas</h3>
                <button onClick={() => setShowProposalModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {loadingProposals ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : proposals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma proposta aceita encontrada.</p>
              ) : (
                <div className="space-y-2">
                  {proposals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleImportProposal(p)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <p className="text-xs sm:text-sm font-semibold">{p.company_name}</p>
                      {p.contact_name && <p className="text-[10px] text-muted-foreground">{p.contact_name}</p>}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
