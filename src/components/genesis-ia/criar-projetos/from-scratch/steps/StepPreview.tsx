import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, Download, RotateCcw, Sparkles, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFromScratch } from '../FromScratchContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StepPreviewProps {
  onComplete: () => void;
  affiliateId?: string;
}

const GENERATION_LOGS = [
  { text: 'Analisando contexto do nicho...', icon: '🔍' },
  { text: 'Processando objetivos do projeto...', icon: '📊' },
  { text: 'Definindo design system...', icon: '🎨' },
  { text: 'Estruturando páginas e seções...', icon: '📄' },
  { text: 'Configurando funcionalidades...', icon: '⚡' },
  { text: 'Adicionando integrações...', icon: '🔧' },
  { text: 'Otimizando para mobile...', icon: '📱' },
  { text: 'Configurando segurança...', icon: '🔒' },
  { text: 'Aplicando SEO avançado...', icon: '🎯' },
  { text: 'Validando arquitetura...', icon: '✅' },
  { text: 'Finalizando prompt ultra-completo...', icon: '✨' },
  { text: 'Prompt gerado com sucesso!', icon: '🚀' }
];

interface StepPreviewProps {
  onComplete: () => void;
  affiliateId?: string;
}

export function StepPreview({ onComplete, affiliateId }: StepPreviewProps) {
  const { generatedPrompt, resetWizard, formData, selectedNiche, generatePrompt } = useFromScratch();
  const [copied, setCopied] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  // Generation animation - 30 seconds max
  useEffect(() => {
    if (isGenerating) {
      const logInterval = setInterval(() => {
        setCurrentLogIndex(prev => {
          if (prev >= GENERATION_LOGS.length - 1) {
            clearInterval(logInterval);
            setIsGenerating(false);
            setDisplayedPrompt(generatedPrompt);
            return prev;
          }
          return prev + 1;
        });
      }, 2500); // 12 logs * 2.5s = 30 seconds

      return () => clearInterval(logInterval);
    }
  }, [isGenerating, generatedPrompt]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayedPrompt);
      setCopied(true);
      toast.success('Prompt copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar prompt');
    }
  };

  const handleExport = () => {
    const blob = new Blob([displayedPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${formData.projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompt exportado!');
  };

  const handleReset = () => {
    resetWizard();
  };

  const handleSaveToLibrary = () => {
    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    if (!affiliateId) {
      toast.error('Erro: ID do afiliado não encontrado');
      return;
    }

    setSaving(true);
    try {
      const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase
        .from('affiliate_template_configs')
        .insert([{
          affiliate_id: affiliateId,
          template_slug: 'from-scratch',
          template_name: formData.projectName || 'Projeto Personalizado',
          unique_code: uniqueCode,
          client_name: formData.companyName || null,
          platform: formData.targetAI === 'other' ? formData.otherAI : formData.targetAI,
          last_prompt: displayedPrompt,
          config: {
            projectType: formData.projectType,
            nicheId: formData.nicheId,
            customNiche: formData.customNiche,
            language: formData.language,
            currency: formData.currency,
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            typography: formData.typography,
            visualStyle: formData.visualStyle,
            themeMode: formData.themeMode,
            selectedPages: formData.selectedPages,
            selectedFeatures: formData.selectedFeatures,
            integrations: formData.integrations,
            isPWA: formData.isPWA,
            hasAdvancedSEO: formData.hasAdvancedSEO,
            hasAnalytics: formData.hasAnalytics,
          },
          is_active: true
        }]);

      if (error) throw error;
      
      toast.success('Projeto salvo na biblioteca!');
      setShowSaveDialog(false);
      onComplete();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Erro ao salvar projeto');
    } finally {
      setSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-6">
        {/* Animated Loader */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground mb-1">
            Gerando Prompt Ultra-Completo
          </h3>
          <p className="text-xs text-muted-foreground">
            Processando suas configurações...
          </p>
        </div>

        {/* Logs */}
        <div className="w-full max-w-md bg-card/50 rounded-xl border border-border/50 p-3 space-y-1.5">
          <AnimatePresence mode="popLayout">
            {GENERATION_LOGS.slice(0, currentLogIndex + 1).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 text-xs ${
                  index === currentLogIndex ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
              {index < currentLogIndex ? (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                )}
                <span>{log.icon} {log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentLogIndex + 1) / GENERATION_LOGS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1.5">
            {Math.round(((currentLogIndex + 1) / GENERATION_LOGS.length) * 100)}% concluído
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">
          Prompt Gerado! 🎉
        </h3>
        <p className="text-sm text-muted-foreground">
          Seu prompt está pronto para usar
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2 max-w-xl mx-auto">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-lg font-bold text-foreground">{formData.selectedPages.length + formData.customPages.length}</div>
          <div className="text-[10px] text-muted-foreground">Páginas</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-lg font-bold text-foreground">{formData.selectedFeatures.length}</div>
          <div className="text-[10px] text-muted-foreground">Features</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-lg font-bold text-foreground">{formData.integrations.length}</div>
          <div className="text-[10px] text-muted-foreground">Integrações</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-lg font-bold text-foreground">{(displayedPrompt.length / 1000).toFixed(1)}k</div>
          <div className="text-[10px] text-muted-foreground">Caracteres</div>
        </div>
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          onClick={handleCopy}
          size="sm"
          className="bg-primary hover:bg-primary/90 h-8 px-3 text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
        <Button onClick={handleExport} variant="outline" size="sm" className="h-8 px-3 text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Exportar .md
        </Button>
        <Button onClick={handleSaveToLibrary} variant="outline" size="sm" className="h-8 px-3 text-xs">
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Salvar
        </Button>
        <Button onClick={handleReset} variant="ghost" size="sm" className="h-8 px-3 text-xs">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Novo
        </Button>
      </div>

      {/* Prompt Preview */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-2.5 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Preview do Prompt</span>
          <span className="text-[10px] text-muted-foreground">
            {displayedPrompt.split('\n').length} linhas
          </span>
        </div>
        <div className="max-h-[280px] overflow-y-auto p-3">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {displayedPrompt}
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 max-w-lg mx-auto">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Próximo passo:</strong> Cole o prompt na IA ({formData.targetAI === 'other' ? formData.otherAI : formData.targetAI})
        </p>
      </div>

      {/* Back Button - Compact */}
      <div className="text-center">
        <Button onClick={onComplete} variant="ghost" size="sm" className="h-8 text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Voltar para Biblioteca
        </Button>
      </div>

      {/* Save Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar na Biblioteca?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar "{formData.projectName}" na biblioteca?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-primary hover:bg-primary/90">
              Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}