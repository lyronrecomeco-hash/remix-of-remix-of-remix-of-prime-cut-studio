import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Copy, Check, Loader2, Palette, Type, Globe, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { TemplateModel } from './templateModels';
import { generateTemplatePrompt } from './generateTemplatePrompt';

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
}

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
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const updateField = (key: keyof TemplateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const canGenerate = formData.businessName.trim().length > 0;

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate a more thorough generation process
    setTimeout(() => {
      const prompt = generateTemplatePrompt(template, formData);
      setGeneratedPrompt(prompt);
      setGenerating(false);
      toast.success('Prompt profissional gerado!', { description: 'Copie e cole na Lovable ou na plataforma de IA desejada.' });
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
      {/* Header - same style as TemplateModelSelector */}
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
                      className="h-10 text-sm bg-muted/30 border-border focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm text-muted-foreground">Cidade / Estado</Label>
                    <Input
                      value={formData.cityState}
                      onChange={e => updateField('cityState', e.target.value)}
                      placeholder="Ex: Sao Paulo, SP"
                      className="h-10 text-sm bg-muted/30 border-border focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm text-muted-foreground">Slogan (opcional)</Label>
                  <Input
                    value={formData.slogan}
                    onChange={e => updateField('slogan', e.target.value)}
                    placeholder="Ex: O melhor sabor da cidade"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Color Palette - Card Selection */}
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
                            : 'bg-muted/30 border-border hover:border-primary/30'
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
                {/* Custom Colors */}
                <div className="flex gap-3 p-2.5 rounded-lg bg-muted/30 border border-border">
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

              {/* Typography - Card Selection */}
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
                            : 'bg-muted/30 border-border hover:border-primary/30'
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

              {/* Language - Card Selection */}
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
                            : 'bg-muted/30 border-border hover:border-primary/30'
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
                  className="min-h-[80px] text-sm resize-none"
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <div className="pt-2 border-t border-border">
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
                      Gerar Prompt
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}