import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
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
  'Português (Brasil)',
  'Português (Portugal)',
  'English (US)',
  'Español',
  'Français',
  'Italiano',
  'Deutsch',
];

const TYPOGRAPHIES = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Lato',
  'Raleway',
  'Playfair Display',
  'Oswald',
  'Nunito',
];

export function TemplateQuickForm({ template, onBack, onComplete, affiliateId }: TemplateQuickFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    businessName: '',
    cityState: '',
    primaryColor: '#10b981',
    secondaryColor: '#3b82f6',
    typography: 'Inter',
    slogan: '',
    language: 'Português (Brasil)',
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
    setTimeout(() => {
      const prompt = generateTemplatePrompt(template, formData);
      setGeneratedPrompt(prompt);
      setGenerating(false);
    }, 600);
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
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden">
              <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold leading-tight">{template.name}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {generatedPrompt ? 'Prompt gerado' : 'Configure seu projeto'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-5 rounded-b-xl bg-white/5 border border-white/10 border-t-0">
        {generatedPrompt ? (
          /* Prompt Result */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="relative">
              <pre className="w-full max-h-[400px] overflow-auto p-3 sm:p-4 rounded-lg bg-black/40 border border-white/10 text-[10px] sm:text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                {generatedPrompt}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCopy}
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Prompt'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedPrompt(null)}
                className="h-9 sm:h-10 text-xs sm:text-sm hover:bg-white/5"
              >
                Editar configurações
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Quick Form */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* Row 1: Name + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nome do Negócio *</Label>
                <Input
                  value={formData.businessName}
                  onChange={e => updateField('businessName', e.target.value)}
                  placeholder="Ex: Pizzaria do João"
                  className="h-9 text-xs sm:text-sm bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cidade / Estado</Label>
                <Input
                  value={formData.cityState}
                  onChange={e => updateField('cityState', e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="h-9 text-xs sm:text-sm bg-white/5 border-white/10"
                />
              </div>
            </div>

            {/* Row 2: Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={e => updateField('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/10"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={e => updateField('primaryColor', e.target.value)}
                    className="h-9 text-xs font-mono bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={e => updateField('secondaryColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/10"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={e => updateField('secondaryColor', e.target.value)}
                    className="h-9 text-xs font-mono bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Typography + Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tipografia</Label>
                <select
                  value={formData.typography}
                  onChange={e => updateField('typography', e.target.value)}
                  className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 text-xs sm:text-sm text-foreground"
                >
                  {TYPOGRAPHIES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Idioma</Label>
                <select
                  value={formData.language}
                  onChange={e => updateField('language', e.target.value)}
                  className="w-full h-9 rounded-md border border-white/10 bg-white/5 px-3 text-xs sm:text-sm text-foreground"
                >
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slogan */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Slogan (opcional)</Label>
              <Input
                value={formData.slogan}
                onChange={e => updateField('slogan', e.target.value)}
                placeholder="Ex: O melhor sabor da cidade"
                className="h-9 text-xs sm:text-sm bg-white/5 border-white/10"
              />
            </div>

            {/* Additional */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Descrição adicional (opcional)</Label>
              <Textarea
                value={formData.additionalDescription}
                onChange={e => updateField('additionalDescription', e.target.value)}
                placeholder="Descreva informações extras, funcionalidades específicas, estilo visual desejado..."
                className="min-h-[70px] text-xs sm:text-sm bg-white/5 border-white/10 resize-none"
                rows={3}
              />
            </div>

            {/* Generate Button */}
            <div className="pt-2 border-t border-white/10">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                className="w-full h-10 sm:h-11 text-xs sm:text-sm gap-2"
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
      </div>
    </div>
  );
}
